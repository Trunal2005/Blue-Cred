"""Build a bounded site-disjoint reference dataset from GMW/WorldCover 2020.

Only anonymous static COG range reads; no cloud SDK, account or remote execution.
Requires the freely downloaded GMW ZIP at --archive. See DATASET_CARD.md.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import random
import zipfile

import numpy as np
import rasterio
from rasterio.io import MemoryFile
from rasterio.warp import reproject, Resampling
from rasterio.windows import Window


SITES = [('india-sundarbans', 'N21E088', 'train', 48),
         ('myanmar-ayeyarwady', 'N15E095', 'train', 48),
         ('thailand-phangnga', 'N08E098', 'validation', 24),
         ('indonesia-sumatra', 'N00E103', 'test', 24)]
EXPECTED_MD5 = 'a94b1600d891cda0e1ea0f17b312990b'


def prepare(archive, output):
    if output.exists() and any(output.iterdir()):
        raise FileExistsError('Dataset directory is not empty; preserve it and choose a fresh output directory')
    output.mkdir(parents=True, exist_ok=True)
    if hashlib.file_digest(archive.open('rb'), 'md5').hexdigest() != EXPECTED_MD5:
        raise ValueError('GMW source checksum differs from publisher record')
    samples, report = [], []
    rng = random.Random(42)
    with zipfile.ZipFile(archive) as z, rasterio.Env(
        GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR', CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif',
        GDAL_HTTP_TIMEOUT=30, GDAL_HTTP_MAX_RETRY=1, GDAL_CACHEMAX=32*1024*1024,
    ):
        for site, tile, split, count in SITES:
            # GMW names the NORTHWEST corner; WorldCover names the SOUTHWEST.
            label_tile = f'N{int(tile[1:3])+1:02d}{tile[3:]}'
            name = f'GMW_{label_tile}_v4019_mng.tif'
            member = z.getinfo(name)
            if member.file_size > 10_000_000:
                raise ValueError('Unexpected reference source size')
            url = f'https://esa-worldcover-s2.s3.eu-central-1.amazonaws.com/rgbnir/2020/{tile[:3]}/ESA_WorldCover_10m_2020_v100_{tile}_S2RGBNIR.tif'
            print(json.dumps({'opening_site': site, 'split': split}), flush=True)
            with MemoryFile(z.read(name)) as mem, mem.open() as labels, rasterio.open(url) as src:
                if src.count != 4 or src.crs.to_epsg() != 4326 or src.width > 13000 or src.height > 13000:
                    raise ValueError('Unexpected WorldCover source layout')
                if not np.allclose(labels.bounds, src.bounds):
                    raise ValueError('Reference and imagery geographic footprints differ')
                coarse = labels.read(1, out_shape=(256, 256), resampling=Resampling.nearest)
                if not set(np.unique(coarse)).issubset({0, 1}):
                    raise ValueError('Unexpected GMW label values')
                candidates = set()
                for row, col in np.argwhere(coarse == 1):
                    lon, lat = labels.transform * ((col+.5)*labels.width/256, (row+.5)*labels.height/256)
                    rr, cc = src.index(lon, lat)
                    for dy, dx in ((0, 0), (-1, 0), (1, 0), (0, -1), (0, 1)):
                        y, x = (rr//128+dy)*128, (cc//128+dx)*128
                        if 0 <= x <= src.width-128 and 0 <= y <= src.height-128:
                            candidates.add((y, x))
                candidates = sorted(candidates); rng.shuffle(candidates)
                selected = Counter()
                desired = {'foreground': count*3//4, 'background': count-count*3//4}
                attempts = 0
                for row, col in candidates:
                    if sum(selected.values()) >= count:
                        break
                    if attempts >= 200:
                        raise ValueError('Bounded candidate/image read limit exceeded')
                    window = Window(col, row, 128, 128)
                    transform = src.window_transform(window)
                    mask = np.zeros((128, 128), dtype='uint8')
                    reproject(source=rasterio.band(labels, 1), destination=mask,
                              src_transform=labels.transform, src_crs=labels.crs,
                              dst_transform=transform, dst_crs=src.crs, dst_nodata=0,
                              resampling=Resampling.nearest)
                    fraction = float((mask == 1).mean())
                    kind = 'foreground' if fraction >= .05 else 'background'
                    if selected[kind] >= desired[kind]:
                        continue
                    attempts += 1
                    image = src.read(window=window)
                    # Zero is the product's declared nodata; do not train through it.
                    if (image == 0).any() or image.max() > 20000:
                        continue
                    key = f'{site}-{row}-{col}'
                    image_path, mask_path = Path('images')/(key+'.tif'), Path('masks')/(key+'.tif')
                    (output/'images').mkdir(exist_ok=True); (output/'masks').mkdir(exist_ok=True)
                    profile = dict(driver='GTiff', width=128, height=128, count=4, dtype='uint16',
                                   crs=src.crs, transform=transform, compress='deflate', nodata=None)
                    with rasterio.open(output/image_path, 'w', **profile) as dst:
                        dst.write(image)
                        dst.descriptions = ('B02_blue', 'B03_green', 'B04_red', 'B08_nir')
                    profile.update(count=1, dtype='uint8')
                    with rasterio.open(output/mask_path, 'w', **profile) as dst:
                        dst.write(mask, 1)
                    samples.append({'image': image_path.as_posix(), 'mask': mask_path.as_posix(),
                                    'split': split, 'group': site, 'source_tile': tile,
                                    'window': [col, row, 128, 128], 'bounds': list(src.window_bounds(window)),
                                    'foreground_fraction': fraction})
                    selected[kind] += 1
                if sum(selected.values()) != count:
                    raise ValueError(f'Insufficient valid candidates for {site}: {dict(selected)}')
                report.append({'site': site, 'tile': tile, 'split': split, 'samples': count,
                               'strata': dict(selected), 'image_reads': attempts, 'imagery_url': url,
                               'label_member': name, 'crs': str(src.crs), 'source_transform': list(src.transform),
                               'source_bounds': list(src.bounds), 'source_band_order': ['B02','B03','B04','B08']})
                print(json.dumps(report[-1]), flush=True)
    manifest = {'source': 'GMW 2020 v4.0.19 https://doi.org/10.5281/zenodo.12756047 + ESA WorldCover Sentinel-2 L2A 2020 annual median composites',
                'license': 'CC BY 4.0; Bunting et al./Global Mangrove Watch; ESA WorldCover consortium; Contains modified Copernicus Sentinel data (2020)',
                'label_definition': '1 = GMW mapped mangrove extent, 0 = not mapped as mangrove; map-derived reference, not independently surveyed absence/presence',
                'split_method': 'Whole geographically disjoint sites: India/Myanmar train, Thailand validation, Indonesia final test; nonoverlapping 128px windows; stratified around GMW extents',
                'seed': 42, 'year': 2020, 'gmw_md5': EXPECTED_MD5, 'sites': report, 'samples': samples}
    (output/'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    (output/'preparation-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--archive', type=Path, default=Path('ml/data/gmw2020/source.zip'))
    parser.add_argument('--output', type=Path, default=Path('ml/data/gmw2020/pairs'))
    args = parser.parse_args()
    prepare(args.archive, args.output)
