"""Synthetic fixtures test software ONLY. They are not scientific training/evaluation data."""
import copy
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
from PIL import Image
import torch
import rasterio
from rasterio.transform import from_origin
from fastapi.testclient import TestClient

from ml.data import Pairs, load_manifest, image_array
from ml.model import UNet
from ml.train import loss, load_checkpoint, metrics
from ml.inference import projected_pixel_area, Predictor
from ml import service


class PipelineTests(unittest.TestCase):
    def setUp(self):
        torch.set_num_threads(2)
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.config = json.loads(Path('ml/config.json').read_text())
        self.config.update(input_kind='rgb', scale=255., bands=[1, 2, 3], size=32, width=4, epochs=2)
        self.manifest = {'source': 'SYNTHETIC SOFTWARE TEST ONLY', 'license': 'test fixture',
                         'label_definition': 'test geometry', 'split_method': 'independent synthetic fixtures', 'samples': []}
        for i, split in enumerate(['train', 'train', 'validation', 'test']):
            rng = np.random.default_rng(i)
            a = rng.integers(0, 255, (32, 32, 3), dtype='uint8')
            m = np.zeros((32, 32), dtype='uint8'); m[4:16+i, 8:24] = 255
            Image.fromarray(a).save(self.root/f'{i}.png')
            Image.fromarray(m).save(self.root/f'{i}-mask.png')
            self.manifest['samples'].append({'image': f'{i}.png', 'mask': f'{i}-mask.png', 'split': split, 'group': f'site-{i}'})
        self.path = self.root/'manifest.json'
        self.path.write_text(json.dumps(self.manifest))

    def tearDown(self):
        self.temp.cleanup()

    def test_normalization_shapes_and_alignment(self):
        d = Pairs(load_manifest(self.path), 'validation', self.config)
        x, y = d[0]
        self.assertEqual(tuple(x.shape), (3, 32, 32)); self.assertEqual(tuple(y.shape), (1, 32, 32))
        self.assertTrue(0 <= float(x.min()) <= float(x.max()) <= 1)
        self.assertTrue(torch.equal(d[0][0], d[0][0]))
        Image.new('L', (5, 5)).save(self.root/'2-mask.png')
        with self.assertRaises(ValueError):
            Pairs(load_manifest(self.path), 'validation', self.config)

    def test_leakage_duplicates_and_traversal(self):
        for kind in ('group', 'image', 'path'):
            d = copy.deepcopy(self.manifest)
            if kind == 'group': d['samples'][2]['group'] = 'site-0'
            elif kind == 'image': d['samples'][2]['image'] = '0.png'
            else: d['samples'][0]['image'] = '../outside.png'
            self.path.write_text(json.dumps(d))
            with self.assertRaises(ValueError): load_manifest(self.path)

    def test_channel_and_mask_validation(self):
        Image.new('L', (32, 32)).save(self.root/'0.png')
        with self.assertRaises(ValueError): image_array(self.root/'0.png', self.config)
        Image.new('L', (32, 32), 2).save(self.root/'2-mask.png')
        with self.assertRaises(ValueError): Pairs(load_manifest(self.path), 'validation', self.config)

    def test_forward_loss_gradient_and_metrics(self):
        torch.manual_seed(42); model = UNet(3, 4)
        x = torch.ones(1, 3, 31, 29); y = torch.zeros(1, 1, 31, 29)
        z = model(x); self.assertEqual(z.shape, y.shape)
        value = loss(z, y); value.backward()
        self.assertTrue(torch.isfinite(value)); self.assertIsNotNone(model.head.weight.grad)
        self.assertEqual(metrics([3, 1, 2, 4])['foreground_iou'], .5)
        self.assertIsNone(metrics([0, 0, 0, 1])['precision'])

    def test_georeferencing(self):
        for crs, expected in [('EPSG:32643', 100.), ('EPSG:4326', None)]:
            p = self.root/'geo.tif'
            with rasterio.open(p, 'w', driver='GTiff', width=4, height=4, count=1, dtype='uint8', crs=crs, transform=from_origin(100, 100, 10, 10)) as ds:
                ds.write(np.zeros((1, 4, 4), dtype='uint8'))
            self.assertEqual(projected_pixel_area(p), expected)
        self.assertIsNone(projected_pixel_area(self.root/'0.png'))

    def test_training_cli_checkpoint_fresh_process_inference_and_resume(self):
        config = self.root/'config.json'; config.write_text(json.dumps(self.config))
        out = self.root/'artifacts'
        command = [sys.executable, '-m', 'ml.train', '--manifest', str(self.path), '--config', str(config), '--output', str(out)]
        r = subprocess.run(command, capture_output=True, text=True, timeout=90)
        self.assertEqual(r.returncode, 0, r.stderr)
        model, ck = load_checkpoint(out/'best.pt')
        self.assertGreaterEqual(ck['epochs_completed'], 1)
        result = Predictor(out/'best.pt').predict(self.root/'3.png')
        self.assertEqual(result['total_pixels'], 1024); self.assertIsNone(result['area_hectares'])
        self.assertTrue(result['mask_png']); self.assertTrue(result['overlay_png'])
        r = subprocess.run(command+['--resume', str(out/'last.pt')], capture_output=True, text=True, timeout=90)
        self.assertEqual(r.returncode, 0, r.stderr)
        r = subprocess.run([sys.executable, '-m', 'ml.inference', '--checkpoint', str(out/'best.pt'), '--image', str(self.root/'3.png'), '--output', str(self.root/'prediction')], capture_output=True, text=True, timeout=60)
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertTrue((self.root/'prediction/mask_png.png').is_file())
        # Entire temporary synthetic run is removed after this test.

    def test_untrained_checkpoint_rejected(self):
        p = self.root/'untrained.pt'; torch.save({'model': UNet().state_dict()}, p)
        with self.assertRaises(ValueError): load_checkpoint(p)


class ServiceTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {'BLUECRED_ML_TOKEN': 'test-token-only-12345678901234567890', 'BLUECRED_ML_CHECKPOINT': 'ml/artifacts/does-not-exist.pt'})
        self.env.start(); service.predictor = None; service.load_error = None
        self.headers = {'x-bluecred-token': os.environ['BLUECRED_ML_TOKEN']}

    def tearDown(self):
        service.predictor = None; self.env.stop()

    def test_auth_and_missing_model(self):
        with TestClient(service.app) as client:
            self.assertEqual(client.get('/health').status_code, 401)
            self.assertFalse(client.get('/health', headers=self.headers).json()['ready'])
            self.assertEqual(client.post('/analyze', headers=self.headers, content=b'bad').status_code, 503)

    def test_payload_validation_busy_and_corruption(self):
        with TestClient(service.app) as client:
            with patch.object(service, 'predictor') as predictor:
                h = {**self.headers, 'content-type': 'image/png'}
                self.assertEqual(client.post('/analyze', headers={**h, 'content-type': 'text/plain'}, content=b'x').status_code, 415)
                self.assertEqual(client.post('/analyze', headers=h, content=b'').status_code, 400)
                with patch.object(service, 'MAX_BYTES', 4):
                    self.assertEqual(client.post('/analyze', headers=h, content=b'12345').status_code, 413)
                service.lock.acquire()
                try: self.assertEqual(client.post('/analyze', headers=h, content=b'x').status_code, 429)
                finally: service.lock.release()
                predictor.predict.side_effect = ValueError('private path must never escape')
                response = client.post('/analyze', headers=h, content=b'invalid')
                self.assertEqual(response.status_code, 422)
                self.assertNotIn('private path', response.text)
                self.assertFalse(service.lock.locked())


if __name__ == '__main__':
    unittest.main()
