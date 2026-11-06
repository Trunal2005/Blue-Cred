# Optional local inference

The existing `/submit` workflow has a lazy-loaded coastal vegetation analysis panel in evidence-upload step 3, shown to a signed-in user. It uses a **separate image selection** from Appwrite evidence uploads. Analysis never uploads to Appwrite, saves a project record, changes verification or mints credits. Existing project routes work when ML is missing. Authenticated project persistence is intentionally not added: existing remote authorization/schema cannot be verified within the zero-cost restriction.

## Startup in Windows PowerShell

Start the ordinary frontend from `team-nitrix/frontend` with `npm run dev`. No ML service is required.

For optional analysis, choose the same random local token (at least 24 characters) in both service and frontend terminal environments. Do not commit it or use a privileged cloud key. The following placeholder must be replaced locally; it is not a service credential.

```powershell
# Terminal 1, repository root. A real best.pt must already exist for readiness.
$env:BLUECRED_ML_TOKEN='<same-random-local-token-at-least-24-characters>'
$env:BLUECRED_ML_CHECKPOINT='ml/artifacts/run1/best.pt'
ml/.venv/Scripts/python -m uvicorn ml.service:app --host 127.0.0.1 --port 8765

# Terminal 2, frontend directory
$env:BLUECRED_ML_TOKEN='<same-random-local-token-at-least-24-characters>'
$env:BLUECRED_ML_ENABLED='true'
npm run dev
```

Use `http://localhost:3000`. A public/non-loopback Host is rejected by the Next API. Without opt-in, token, service or valid checkpoint, it returns a non-destructive unavailable state; no predictions are synthesized. The default service reports `ready: false` in the current workspace because no genuine checkpoint exists. Do not expose either development server to a network or deploy this local bridge publicly.

## API

Next `GET /api/analysis` proxies readiness. Next `POST /api/analysis` accepts raw image bytes and exactly `image/png`, `image/jpeg` or `image/tiff`, maximum 8 MiB. The bridge uses a fixed loopback destination `127.0.0.1:8765`, server-only shared token, no redirects, 5-second readiness / 60-second analysis timeout and no caching. Cross-origin requests and non-local Hosts are rejected. Browser never receives the token. Stateless local access is not production project-scoped authorization.

Python `GET /health` returns service/readiness/reason/model version. `POST /analyze` accepts the same bytes, verifies local token and loopback caller, decodes content, validates dimensions/channels/range, rejects unsupported inputs, bounds inference to one worker and returns 429 when busy. Returns 401 unauthorized, 400 empty, 413 oversized, 415 unsupported format, 422 invalid image, 503 missing model and sanitized 500 failures. FastAPI validation errors use `detail`; bridge errors use `error`.

Response includes label/model version, coverage percentage, foreground/total pixels, nullable area hectares, base64 PNG preview mask/overlay, measured inference milliseconds and limitations. No filesystem paths, input images or tokens are logged by the service. Input uses a temporary local directory removed after analysis. Only trusted local checkpoints load via `weights_only=True`; executable or user-uploaded model files are not accepted. No model loads in the browser or the Next process.

Input **must match the checkpoint's sensor/preprocessing**. The default configuration requires multiband Sentinel-2 TIFF; a JPEG screenshot fails that contract. Projected affine metre grids may return grid-area hectares; unknown/geographic degree CRS returns percentage only. Original-grid coverage uses interpolated logits from the model grid; this does not restore fine-scale scientific precision. Raster areas are unvalidated estimates, never carbon estimates.

## Other local safeguards

Blockchain writes are disabled unless explicitly opted into test networks through `NEXT_PUBLIC_ENABLE_TESTNET_WRITES=true`; mainnet is rejected. RPC defaults point at loopback. No write was executed in this session, including on testnets. The wallet default uses injected browser wallets to avoid automatic WalletConnect relay requests. Script-only Appwrite key name is `APPWRITE_API_KEY` (never `NEXT_PUBLIC_...`); migrate any existing local secret manually and rotate any key previously exposed. No production env file was edited. Administrator UI now requires the server-controlled Appwrite account label `bluecred-admin`; client-side labels/roles do not replace database permissions. Provisioning script is gated and must not be run without separate permission/cost review; existing remote broad grants remain unverified.

## Local verification

```powershell
# Repository root: actual HTTP readiness with missing checkpoint; stops server afterward.
ml/.venv/Scripts/python -m ml.tests.http_smoke
# frontend directory: explicit SDK/transport mocks and safe transaction failures
node tests/local-regression.cjs
npx --no-install tsc --noEmit
npm run lint
npm run build
node tests/production-smoke.cjs
```

No production deployment, cloud account activation, Appwrite initialization or blockchain transaction is part of these commands. `next/font` may download the existing open-source Inter font at build time if uncached. Browser interactions, authenticated external flows and real mangrove inference remain unverified.
