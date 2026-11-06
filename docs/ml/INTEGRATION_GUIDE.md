# Real local CNN integration

Current model: `bluecred-gmw2020-unet-v1`, genuine trained checkpoint `ml/artifacts/run1/best.pt`. It is a **low-precision research prototype**, not reliable project verification. Read MODEL_CARD.md. The existing `/submit` evidence step lazily shows analysis to a signed-in user. Analysis has a separate file input from Appwrite evidence uploads, is stateless, saves no project/credit record and makes no blockchain call.

## Exact PowerShell startup

From `C:/projects/Carbon credit transfer system/bluecred/team-nitrix`:

```powershell
# Existing frontend alone; CNN not required.
npm --prefix frontend run dev -- --hostname 127.0.0.1
# Or start the real local model plus existing frontend, sharing an ephemeral random token.
./scripts/start-local-ml.ps1
```

The helper checks checkpoint/environment, refuses to replace an existing service on port 8765, generates a process-local random token without printing it, binds Python and frontend to 127.0.0.1, verifies actual readiness, then starts the frontend. Ctrl+C/finally stops only its own Python process and restores prior process environment values. No production .env file is read/copied/edited by this helper. The frontend still follows its ordinary existing authentication configuration; this helper does not create a fake account or change Appwrite permissions.

Manual two-terminal setup is also possible (use the same locally chosen random ≥24-character token in both; no privileged cloud key):

```powershell
# Terminal 1: repository root
$env:BLUECRED_ML_TOKEN='<same-local-random-token-in-both-terminals>'
$env:BLUECRED_ML_CHECKPOINT='ml/artifacts/run1/best.pt'
ml/.venv/Scripts/python -m uvicorn ml.service:app --host 127.0.0.1 --port 8765
# Terminal 2: repository root
$env:BLUECRED_ML_TOKEN='<same-local-random-token-in-both-terminals>'
$env:BLUECRED_ML_ENABLED='true'
npm --prefix frontend run dev -- --hostname 127.0.0.1
```

Do not expose this local bridge publicly. `BLUECRED_ML_ENABLED` is server-side, false by default. Existing production auth/storage usage is not exercised by this work. If using a real external account, separately verify its existing permissions and zero-cost quota before performing any cloud operation. No new plan or billing is required by local inference.

## Verified offline browser demonstration

```powershell
Set-Location frontend
npm run build
node tests/browser-validation.cjs e2e final
```

This launches a temporary local production server and actual Python service, opens isolated real Chrome, uses an actual held-out TIFF, verifies readiness and genuine mask/overlay output, captures a screenshot, stops the service to verify failure handling, checks charts/maps/mobile/PDFs and cleans up the test-owned processes. **Appwrite account/record and remote tile requests are explicit browser fixtures; the CNN/Next/Python path is real and unmocked.** No project is submitted, no record is written and no production endpoint is contacted. Do not confuse the mock login with external authentication validation. The test needs the existing Chrome install and local model/data artifacts.

The actual screenshot and response summaries are `docs/performance/phase2/real-cnn-inference.png` and `browser-e2e-final.json`. Generated fixture PDF is deliberately in ignored `ml/artifacts/browser/`, clearly not a real certificate. Pure production HTTP route smoke: `node tests/production-smoke.cjs`. Mocked API/transaction regressions: `node tests/local-regression.cjs`. Ordinary frontend must remain usable with missing/unavailable ML.

## API and security boundaries

Next `GET /api/analysis` → local `/health`; Next `POST /api/analysis` → local `/analyze`. Raw image bytes, exact MIME PNG/JPEG/TIFF, maximum 8 MiB. Public/nonlocal Host and mismatched Origin are rejected; opt-in and server-only token required. Fixed loopback destination, no user-supplied URL/path, no redirects, no response caching, 5-second readiness / 60-second inference timeout. Python accepts only loopback and constant-time token authentication. No project-scoped persistence/authorization was added; this is a stateless local service, not a deployable production authorization layer.

Python loads one trusted local provenance-bearing checkpoint per process, `weights_only=True`, eval/inference mode, two CPU threads, one concurrent prediction. Inputs decode from temporary files removed afterward; original image dimensions are bounded at 4 million pixels, content/driver/channels/range/nodata are checked. No executable model uploads accepted. Errors: 401 unauthorized, 400 empty, 413 too large, 415 MIME unsupported, 422 invalid raster/image, 429 busy, 503 no trained model, sanitized 500 inference failure. No token/image/private filesystem path is logged in responses.

Readiness includes model version, label and expected input description. Analysis returns model version, reference-label name, checkpoint epoch, validation IoU/precision, inference milliseconds, mask/overlay previews, original-grid pixel counts/coverage, nullable area and limitations. The UI prominently warns on low validation precision and identifies validation scores as dataset scores, not accuracy for an upload.

**Current model requires four-band WorldCover 2020 annual-median TIFFs ordered B02/B03/B04/B08.** CNN uses RGB 3/2/1 /10000; NIR is retained for evaluation. A screenshot/JPEG or wrong-band raster is not a valid model input. Display-only gain/gamma makes reflectance visible and does not change inference. EPSG:4326 data return percentage only, no fake hectares. Projected metre-grid area uses affine determinant but is still unvalidated, distortion-prone model-derived grid area.

Blockchain writes remain disabled by default; only explicitly enabled local/test chain IDs pass the hook, and successful receipts are required. No live chain operation was tested. Administrator UI requires server-controlled `bluecred-admin` label, but deployed Appwrite grants remain unknown. Do not run the gated legacy provisioning script: its broad grants require separate remediation/review. Never use NEXT_PUBLIC_ for a privileged Appwrite key or rotate/print a secret in logs.
