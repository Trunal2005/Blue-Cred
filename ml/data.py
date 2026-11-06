import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image
import torch
from torch.nn import functional as F
from torch.utils.data import Dataset

MAX_PIXELS = 4_000_000
Image.MAX_IMAGE_PIXELS = MAX_PIXELS


def image_array(path, config):
    path = Path(path)
    if config['input_kind'] == 'sentinel2':
        import rasterio
        if path.suffix.lower() not in ('.tif', '.tiff'):
            raise ValueError('This model requires Sentinel-2 GeoTIFF; RGB screenshots are unsupported')
        with rasterio.open(path) as src:
            required_bands = config['bands'] + config.get('ndvi_bands', [])
            if src.driver != 'GTiff' or src.width * src.height > MAX_PIXELS or src.count < max(required_bands):
                raise ValueError('Unsupported raster dimensions or bands')
            a = src.read(config['bands']).astype('float32')
            if not src.read_masks(config['bands']).all():
                raise ValueError('Nodata rasters are unsupported; crop a fully valid tile first')
    else:
        with Image.open(path) as src:
            if src.format not in ('PNG', 'JPEG') or src.width * src.height > MAX_PIXELS:
                raise ValueError('Only bounded RGB PNG/JPEG inputs are supported')
            if src.mode != 'RGB':
                raise ValueError('Expected three RGB channels')
            a = np.asarray(src, dtype='float32').transpose(2, 0, 1)
    if not np.isfinite(a).all() or a.min() < 0 or a.max() > config['scale'] * 2:
        raise ValueError('Invalid numeric range; verify sensor and scaling')
    return np.clip(a / config['scale'], 0, 1)


def tensor_image(a, size):
    return F.interpolate(torch.from_numpy(a.copy())[None], size=(size, size), mode='bilinear', align_corners=False)[0]


def digest(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def load_manifest(path):
    path = Path(path).resolve()
    data = json.loads(path.read_text(encoding='utf-8'))
    if not all(data.get(k) for k in ('source', 'license', 'label_definition', 'split_method', 'samples')):
        raise ValueError('Manifest needs source, license, label_definition, split_method and samples')
    groups, hashes = {}, {}
    for s in data['samples']:
        if s['split'] not in ('train', 'validation', 'test') or not s.get('group'):
            raise ValueError('Every sample needs an explicit split and geographic/site group')
        if groups.setdefault(s['group'], s['split']) != s['split']:
            raise ValueError('Geographic group leaks between splits')
        for key in ('image', 'mask'):
            p = (path.parent / s[key]).resolve()
            if not p.is_relative_to(path.parent) or not p.is_file():
                raise ValueError('Manifest paths must be existing files inside the dataset directory')
            s[key] = str(p)
        h = digest(s['image'])
        if h in hashes:
            raise ValueError('Duplicate image content in manifest')
        hashes[h] = s['split']
        s['image_sha256'], s['mask_sha256'] = h, digest(s['mask'])
    if set(groups.values()) != {'train', 'validation', 'test'}:
        raise ValueError('All three independent splits are required')
    return data


class Pairs(Dataset):
    def __init__(self, manifest, split, config):
        self.samples = [s for s in manifest['samples'] if s['split'] == split]
        self.config, self.augment = config, split == 'train'
        if not self.samples:
            raise ValueError('Empty split')
        # Validate EVERY pair before training; no silent missing/corrupt labels.
        for i in range(len(self.samples)):
            self._read(i)

    def __len__(self):
        return len(self.samples)

    def _read(self, i):
        s = self.samples[i]
        a = image_array(s['image'], self.config)
        if Path(s['mask']).suffix.lower() in ('.tif', '.tiff'):
            import rasterio
            with rasterio.open(s['mask']) as src:
                if src.count != 1 or src.width * src.height > MAX_PIXELS:
                    raise ValueError('Expected bounded single-band mask')
                m = src.read(1)
            with rasterio.open(s['image']) as src, rasterio.open(s['mask']) as mask:
                if src.crs != mask.crs or src.transform != mask.transform:
                    raise ValueError('Image/mask georeferencing mismatch')
        else:
            with Image.open(s['mask']) as src:
                m = np.asarray(src)
        if m.ndim != 2 or m.shape != a.shape[1:] or not set(np.unique(m)).issubset({0, 1, 255}):
            raise ValueError('Mask must align with image and use binary 0/1 or 0/255 labels; nodata unsupported')
        if 1 in m and 255 in m:
            raise ValueError('Mixed label encoding; possible ignore-label contamination')
        size = self.config['size']
        x = tensor_image(a, size)
        y = F.interpolate(torch.from_numpy((m > 0).astype('float32'))[None, None], size=(size, size), mode='nearest')[0]
        return x, y

    def __getitem__(self, i):
        x, y = self._read(i)
        if self.augment and torch.rand(()) < .5:
            x, y = x.flip(-1), y.flip(-1)
        return x, y
