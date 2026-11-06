"""Loopback-only, token-protected, stateless inference. No cloud/storage/blockchain code."""
import asyncio
from contextlib import asynccontextmanager
import logging
import os
from pathlib import Path
import secrets
import tempfile
import threading

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from PIL import Image
import torch

from .inference import Predictor

MAX_BYTES = 8 * 1024 * 1024
torch.set_num_threads(2)
lock = threading.Lock()
predictor = None
load_error = None


@asynccontextmanager
async def lifespan(app):
    global predictor, load_error
    token = os.environ.get('BLUECRED_ML_TOKEN', '')
    if len(token) < 24:
        raise RuntimeError('Set a local BLUECRED_ML_TOKEN of at least 24 characters')
    checkpoint = Path(os.environ.get('BLUECRED_ML_CHECKPOINT', 'ml/artifacts/run1/best.pt'))
    if checkpoint.is_file():
        try:
            predictor = await asyncio.to_thread(Predictor, checkpoint)
        except Exception:
            load_error = 'invalid_checkpoint'
            logging.error('Model unavailable: checkpoint validation failed')
    yield


app = FastAPI(title='Blue-Cred local segmentation', lifespan=lifespan, docs_url=None, redoc_url=None)


@app.middleware('http')
async def boundary(request: Request, call_next):
    expected = os.environ.get('BLUECRED_ML_TOKEN', '')
    if request.client and request.client.host not in ('127.0.0.1', '::1', 'testclient'):
        return JSONResponse({'error': 'loopback_required'}, status_code=403)
    supplied = request.headers.get('x-bluecred-token', '')
    if len(expected) < 24 or not secrets.compare_digest(supplied, expected):
        return JSONResponse({'error': 'unauthorized'}, status_code=401)
    response = await call_next(request)
    response.headers['Cache-Control'] = 'no-store'
    return response


@app.get('/health')
def health():
    return {'service': 'ok', 'ready': predictor is not None, 'reason': None if predictor else load_error or 'checkpoint_missing',
            'model_version': predictor.config['version'] if predictor else None,
            'label': predictor.config['label'] if predictor else None,
            'input_description': predictor.config.get('input_description') if predictor else None}


def run_prediction(content, suffix):
    # Lock released by worker itself, even if HTTP client disconnects/cancels.
    try:
        with tempfile.TemporaryDirectory(prefix='bluecred-') as directory:
            p = Path(directory)/('input'+suffix)
            p.write_bytes(content)
            return predictor.predict(p)
    finally:
        lock.release()


@app.post('/analyze')
async def analyze(request: Request):
    if predictor is None:
        raise HTTPException(503, 'Trained model unavailable')
    kind = request.headers.get('content-type', '').split(';')[0]
    suffix = {'image/png': '.png', 'image/jpeg': '.jpg', 'image/tiff': '.tif'}.get(kind)
    if suffix is None:
        raise HTTPException(415, 'Use PNG, JPEG or GeoTIFF')
    data = bytearray()
    async for chunk in request.stream():
        if len(data) + len(chunk) > MAX_BYTES:
            raise HTTPException(413, 'Maximum input is 8 MiB')
        data.extend(chunk)
    if not data:
        raise HTTPException(400, 'Empty image')
    if not lock.acquire(blocking=False):
        raise HTTPException(429, 'Another analysis is running; try again shortly')
    try:
        return await asyncio.to_thread(run_prediction, data, suffix)
    except (ValueError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(422, 'Invalid image, unsupported sensor, nodata or raster dimensions')
    except Exception:
        logging.error('Inference failed; no input data retained')
        raise HTTPException(500, 'Analysis failed')
