"""Actual loopback HTTP readiness test without a checkpoint; no external traffic."""
import json
import os
import secrets
import subprocess
import sys
import time
import urllib.request

env = dict(os.environ, BLUECRED_ML_TOKEN=secrets.token_urlsafe(32), BLUECRED_ML_CHECKPOINT='ml/artifacts/missing-http-smoke.pt')
process = subprocess.Popen([sys.executable, '-m', 'uvicorn', 'ml.service:app', '--host', '127.0.0.1', '--port', '18765', '--log-level', 'error'], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
try:
    deadline = time.monotonic() + 25
    while True:
        try:
            req = urllib.request.Request('http://127.0.0.1:18765/health', headers={'x-bluecred-token': env['BLUECRED_ML_TOKEN']})
            with urllib.request.urlopen(req, timeout=2) as response:
                result = json.load(response)
            assert result['ready'] is False and result['reason'] == 'checkpoint_missing'
            print(json.dumps({'loopback_http': 'passed', 'readiness': result}))
            break
        except OSError:
            if process.poll() is not None or time.monotonic() > deadline:
                raise RuntimeError('Local inference service did not start')
            time.sleep(.2)
finally:
    process.terminate()
    process.wait(timeout=10)
