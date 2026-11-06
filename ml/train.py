"""Run from repository root: python -m ml.train --help."""
import argparse
import json
import platform
import random
import time
from pathlib import Path

import numpy as np
import torch
from torch.nn import functional as F
from torch.utils.data import DataLoader

from .data import Pairs, load_manifest, digest
from .model import UNet


def loss(logits, y):
    p = logits.sigmoid()
    return F.binary_cross_entropy_with_logits(logits, y) + 1 - (2 * (p * y).sum() + 1) / (p.sum() + y.sum() + 1)


def metrics(counts):
    tp, fp, fn, tn = map(int, counts)
    def div(a, b):
        return a / b if b else None
    return {'foreground_iou': div(tp, tp + fp + fn), 'dice': div(2 * tp, 2 * tp + fp + fn),
            'precision': div(tp, tp + fp), 'recall': div(tp, tp + fn),
            'f1': div(2 * tp, 2 * tp + fp + fn), 'background_iou': div(tn, tn + fn + fp),
            'confusion': {'tp': tp, 'fp': fp, 'fn': fn, 'tn': tn}}


@torch.inference_mode()
def evaluate(model, loader, device):
    model.eval()
    counts, losses = np.zeros(4, dtype='int64'), []
    start = time.perf_counter()
    # RGB excess-green baseline, fixed threshold; no test-set tuning.
    baseline = np.zeros(4, dtype='int64')
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        z = model(x)
        losses.append(float(loss(z, y)))
        b = y.bool()
        for out, dest in ((z.sigmoid() >= .5, counts), ((2*x[:, 1:2]-x[:, 0:1]-x[:, 2:3]) > .05, baseline)):
            dest += np.array([int((out & b).sum()), int((out & ~b).sum()), int((~out & b).sum()), int((~out & ~b).sum())])
    if device == 'cuda':
        torch.cuda.synchronize()
    return {**metrics(counts), 'loss': float(np.mean(losses)),
            'seconds_per_image_including_loading': (time.perf_counter()-start)/len(loader.dataset),
            'excess_green_baseline': metrics(baseline)}


def load_checkpoint(path):
    # Only locally generated trusted weights; never accept weights in an HTTP request.
    ck = torch.load(path, map_location='cpu', weights_only=True)
    if ck.get('epochs_completed', 0) < 1 or not ck.get('manifest_sha256'):
        raise ValueError('Checkpoint has no completed training provenance')
    c = ck['config']
    model = UNet(c['channels'], c['width'])
    model.load_state_dict(ck['model'])
    return model.eval(), ck


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--manifest', required=True)
    ap.add_argument('--config', default='ml/config.json')
    ap.add_argument('--output', default='ml/artifacts/run1')
    ap.add_argument('--resume')
    ap.add_argument('--device', choices=['cpu', 'cuda'], default='cpu')
    ap.add_argument('--evaluate-only', action='store_true')
    ap.add_argument('--epochs', type=int)
    ap.add_argument('--batch-size', type=int)
    ap.add_argument('--learning-rate', type=float)
    ap.add_argument('--seed', type=int)
    args = ap.parse_args()
    c = json.loads(Path(args.config).read_text())
    for key in ('epochs', 'batch_size', 'learning_rate', 'seed'):
        if getattr(args, key) is not None:
            c[key] = getattr(args, key)
    if args.evaluate_only and not args.resume:
        ap.error('--evaluate-only requires --resume with the selected best checkpoint')
    if c['channels'] != 3 or c['size'] < 16 or c['size'] > 512 or c['width'] not in (4, 8, 16, 32):
        raise ValueError('Invalid or excessive model configuration')
    if not 1 <= c['epochs'] <= 200 or not 1 <= c['batch_size'] <= 16 or not 1 <= c['threads'] <= 4 or not 0 < c['max_minutes'] <= 120:
        raise ValueError('Training resource limits exceeded')
    random.seed(c['seed']); np.random.seed(c['seed']); torch.manual_seed(c['seed'])
    torch.set_num_threads(c['threads']); torch.use_deterministic_algorithms(True)
    manifest = load_manifest(args.manifest)
    data_hash = digest(args.manifest)
    out = Path(args.output); out.mkdir(parents=True, exist_ok=True)
    train = DataLoader(Pairs(manifest, 'train', c), batch_size=c['batch_size'], shuffle=True)
    val = DataLoader(Pairs(manifest, 'validation', c), batch_size=c['batch_size'])
    model = UNet(c['channels'], c['width']).to(args.device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=c['learning_rate'])
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=2, factor=.5)
    start_epoch, best, stale, history = 0, float('inf'), 0, []
    if args.resume:
        model, ck = load_checkpoint(args.resume)
        if ck['manifest_sha256'] != data_hash or ck['config'] != c:
            raise ValueError('Resume requires identical config and manifest')
        if ck['samples'] != manifest['samples']:
            raise ValueError('Dataset content changed since checkpoint')
        model.to(args.device); optimizer.load_state_dict(ck['optimizer'])
        scheduler.load_state_dict(ck['scheduler'])
        torch.set_rng_state(ck['rng_state'])
        start_epoch, best, history = ck['epochs_completed'], ck['best_loss'], ck['history']
        stale = ck['stale']
    started = time.perf_counter()
    if not args.evaluate_only:
        for epoch in range(start_epoch, c['epochs']):
            model.train(); losses = []
            for x, y in train:
                if time.perf_counter()-started > c['max_minutes']*60:
                    raise TimeoutError('Bounded training time exceeded; previous complete checkpoints retained')
                optimizer.zero_grad(set_to_none=True)
                value = loss(model(x.to(args.device)), y.to(args.device))
                if not torch.isfinite(value):
                    raise ValueError('Nonfinite training loss')
                value.backward(); torch.nn.utils.clip_grad_norm_(model.parameters(), 1)
                optimizer.step(); losses.append(float(value.detach()))
            result = evaluate(model, val, args.device)
            scheduler.step(result['loss'])
            improved = result['loss'] < best
            best, stale = (result['loss'], 0) if improved else (best, stale + 1)
            history.append({'epoch': epoch+1, 'training_loss': float(np.mean(losses)), 'validation': result})
            ck = {'model': model.state_dict(), 'optimizer': optimizer.state_dict(), 'scheduler': scheduler.state_dict(), 'config': c,
                  'epochs_completed': epoch+1, 'best_loss': best, 'stale': stale, 'history': history,
                  'manifest_sha256': data_hash, 'samples': manifest['samples'], 'rng_state': torch.get_rng_state(),
                  'source': manifest['source'], 'license': manifest['license'],
                  'torch_version': str(torch.__version__), 'python': platform.python_version(),
                  'device': args.device, 'runtime_seconds_this_session': time.perf_counter()-started}
            torch.save(ck, out/'last.pt')
            if improved:
                torch.save(ck, out/'best.pt')
            (out/'history.json').write_text(json.dumps(history, indent=2))
            print(json.dumps(history[-1]), flush=True)
            if stale >= c['patience']:
                break
    checkpoint = Path(args.resume) if args.evaluate_only and args.resume else out/'best.pt'
    model, ck = load_checkpoint(checkpoint)
    # Test images are opened only after best validation checkpoint selection.
    test = DataLoader(Pairs(manifest, 'test', c), batch_size=1)
    result = evaluate(model.to(args.device), test, args.device)
    result.update(checkpoint_bytes=checkpoint.stat().st_size, checkpoint_sha256=digest(checkpoint))
    (out/'test_metrics.json').write_text(json.dumps(result, indent=2))
    (out/'config.json').write_text(json.dumps(c, indent=2))
    print(json.dumps({'test': result}), flush=True)


if __name__ == '__main__':
    main()
