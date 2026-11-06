import argparse
import base64
import io
import json
import time
from pathlib import Path

import numpy as np
from PIL import Image
import torch
from torch.nn import functional as F

from .data import image_array, tensor_image
from .train import load_checkpoint


def png(a):
    b = io.BytesIO()
    Image.fromarray(a).save(b, format='PNG')
    return base64.b64encode(b.getvalue()).decode('ascii')


def projected_pixel_area(path):
    """Only projected metre CRS, affine pixels, no guessed GSD or degree conversion."""
    if Path(path).suffix.lower() not in ('.tif', '.tiff'):
        return None
    import rasterio
    with rasterio.open(path) as src:
        if not src.crs or not src.crs.is_projected or src.crs.linear_units != 'metre':
            return None
        t = src.transform
        if t == rasterio.Affine.identity():
            return None
        area = abs(t.a * t.e - t.b * t.d)
        return area if np.isfinite(area) and area > 0 else None


class Predictor:
    def __init__(self, checkpoint):
        self.model, self.metadata = load_checkpoint(checkpoint)
        self.config = self.metadata['config']

    @torch.inference_mode()
    def predict(self, path):
        start = time.perf_counter()
        a = image_array(path, self.config)
        x = tensor_image(a, self.config['size'])
        logits = self.model(x[None])
        # Report statistics on original pixel grid, not on downsampled preview grid.
        mask = F.interpolate(logits.sigmoid(), size=a.shape[1:], mode='bilinear', align_corners=False)[0, 0].numpy() >= .5
        coverage = float(mask.mean())
        pixel_area = projected_pixel_area(path)
        preview = np.uint8(np.clip(x.numpy().transpose(1, 2, 0), 0, 1) * 255)
        small_mask = logits.sigmoid()[0, 0].numpy() >= .5
        overlay = preview.copy()
        overlay[small_mask] = (preview[small_mask] * .5 + np.array([31, 180, 77]) * .5).astype('uint8')
        return {'model_version': self.config['version'], 'label': self.config['label'],
                'coverage_percent': coverage * 100, 'foreground_pixels': int(mask.sum()),
                'total_pixels': int(mask.size), 'area_hectares': float(mask.sum() * pixel_area / 10000) if pixel_area else None,
                'mask_png': png(small_mask.astype('uint8') * 255), 'overlay_png': png(overlay),
                'inference_ms': (time.perf_counter()-start)*1000,
                'limitations': 'Experimental AI estimate. Projected grid area only when metre CRS exists; projection distortion and model uncertainty remain. Vegetation coverage is not carbon storage, certification or credit issuance. Input sensor and preprocessing must match training.'}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--checkpoint', required=True)
    ap.add_argument('--image', required=True)
    ap.add_argument('--output', required=True)
    args = ap.parse_args()
    torch.set_num_threads(2)
    result = Predictor(args.checkpoint).predict(args.image)
    out = Path(args.output); out.mkdir(parents=True, exist_ok=True)
    for key in ('mask_png', 'overlay_png'):
        (out/(key+'.png')).write_bytes(base64.b64decode(result.pop(key)))
    (out/'result.json').write_text(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
