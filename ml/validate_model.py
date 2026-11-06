"""Fresh-process trained-weight verification and bounded CPU latency evidence."""
import json
from pathlib import Path
import statistics
import time

import numpy as np
from PIL import Image, ImageDraw
import rasterio
import torch

from .data import image_array, tensor_image, digest
from .inference import Predictor
from .train import load_checkpoint


def main():
    torch.set_num_threads(2)
    root = Path('ml/data/gmw2020/pairs')
    manifest = json.loads((root/'manifest.json').read_text())
    checkpoint = Path('ml/artifacts/run1/best.pt')
    started = time.perf_counter(); predictor = Predictor(checkpoint)
    load_ms = (time.perf_counter()-started)*1000
    tests = [s for s in manifest['samples'] if s['split'] == 'test']
    path = root/tests[0]['image']
    cold = predictor.predict(path)
    for _ in range(5): predictor.predict(path)
    timings = [predictor.predict(path)['inference_ms'] for _ in range(30)]
    x = tensor_image(image_array(path, predictor.config), predictor.config['size'])[None]
    forward = []
    with torch.inference_mode():
        for _ in range(30):
            start = time.perf_counter(); predictor.model(x); forward.append((time.perf_counter()-start)*1000)
    last = torch.load('ml/artifacts/run1/last.pt', map_location='cpu', weights_only=True)
    report = {'checkpoint': str(checkpoint), 'checkpoint_sha256': digest(checkpoint),
              'checkpoint_bytes': checkpoint.stat().st_size, 'parameters': sum(p.numel() for p in predictor.model.parameters()),
              'epochs_executed': last['epochs_completed'], 'best_epoch': predictor.metadata['epochs_completed'],
              'training_runtime_seconds': last['runtime_seconds_this_session'],
              'checkpoint_load_ms_excluding_python_import': load_ms, 'cold_pipeline_ms': cold['inference_ms'],
              'warm_pipeline_median_ms': statistics.median(timings), 'warm_pipeline_p95_ms': float(np.percentile(timings,95)),
              'forward_median_ms': statistics.median(forward), 'warm_pipeline_samples_ms': timings,
              'cpu_threads': 2, 'torch': str(torch.__version__), 'cuda_available': torch.cuda.is_available(),
              'input_dimensions': list(x.shape), 'validation': predictor.metadata['history'][-1]['validation'],
              'test': json.loads(Path('ml/artifacts/run1/test_metrics.json').read_text()),
              'scope': 'Single 128px real held-out image, warmed local file cache, CPU inference only; not throughput under concurrent requests.'}
    out = Path('docs/performance/phase2')
    (out/'model-validation.json').write_text(json.dumps(report, indent=2))
    # Public-data diagnostic: RGB / map-derived reference / actual predicted mask.
    chosen = [s for s in tests if .1<s['foreground_fraction']<.9][:4]
    canvas = Image.new('RGB', (600, len(chosen)*222), 'white'); draw = ImageDraw.Draw(canvas)
    for i,s in enumerate(chosen):
        with rasterio.open(root/s['image']) as src:
            a = src.read([3,2,1]).astype('float32').transpose(1,2,0)
        with rasterio.open(root/s['mask']) as src: target = src.read(1)
        logits = predictor.model(tensor_image(image_array(root/s['image'], predictor.config),128)[None])
        prediction = logits.detach().sigmoid()[0,0].numpy() >= .5
        rgb = np.uint8(np.clip(a/3000,0,1)*255)
        for col, arr in enumerate((rgb, target*255, prediction.astype('uint8')*255)):
            canvas.paste(Image.fromarray(arr).resize((192,192)), (col*200,i*222+25))
        draw.text((4,i*222+4),f'Indonesia held-out {i+1}: RGB / GMW reference / CNN',fill='black')
    canvas.save(out/'heldout-predictions.png')
    for name in ('history.json','config.json','test_metrics.json'):
        (out/('training-'+name)).write_bytes((Path('ml/artifacts/run1')/name).read_bytes())
    print(json.dumps({k:v for k,v in report.items() if k not in ('validation','test','warm_pipeline_samples_ms')}))


if __name__ == '__main__':
    main()
