# Final validation — 6 November 2026

**Verdict: PARTIALLY COMPLETE. Additional spend: ₹0. No new billable resource introduced.**

## Project status

Existing repository retained on `feature/bluecred-cnn-performance` from clean `main` commit `357f05f`. Changes are uncommitted. No pages/routes or smart-contract source removed; branding/layout retained with a small optional analysis panel, accurate demo disclosures and necessary authorization/safety corrections. No database mutation, cloud storage upload, production-env edit, live transaction, deployment or push was performed. Existing external workflows have not been certified as working.

Fixed confirmed build/type/dependency blockers, map lifetime cleanup, image URL cleanup, duplicate impact/map query, eager PDF loading, hardcoded RPC fallback and public script-secret naming. Removed fabricated verifier mint results/guessed chain IDs and false IPFS identifier. Admin UI checks a server-controlled label, not a bundled password. Marketplace demo samples cannot create purchase records. Default RPC is local, wallet connector is injected, and blockchain writes are disabled unless test networks are explicitly enabled. Existing remote authorization may remain insecure; client guards are insufficient.

## Validation actually executed

| Command / check | Result | Evidence / limits |
| --- | --- | --- |
| `git status --short`, branch/log | Baseline clean main at 357f05f | Repository is nested in team-nitrix; initial parent cwd is not a Git root |
| Initial `npx --no-install tsc --noEmit` | Failed | Missing Leaflet declarations (TS7016), captured in task output |
| Initial `npm run build` | Failed | performance/baseline-build.txt: certificate hooks missing use client, font DNS failure |
| `npm ls react react-leaflet next jspdf @types/leaflet --depth=0` | Pass | React 18.3.1, React Leaflet 4.2.1, Next 14.2.35, jsPDF 4.2.1, types 1.9.21 |
| Final `npx --no-install tsc --noEmit` | Pass | performance/final-typecheck.txt has no diagnostics |
| Final `npm run lint` | Pass with warnings | performance/final-lint.txt; existing img and hook warnings remain |
| Final `npm run build` | Pass, exit 0 | performance/final-build.txt and final-build-time.json; connector warnings remain |
| `ml/.venv/Scripts/python -m unittest discover -s ml/tests -v` | 9 tests pass | performance/ml-tests.txt; includes synthetic software training, not real mangrove evaluation |
| `ml/.venv/Scripts/python -m ml.tests.http_smoke` | Pass | Actual loopback HTTP service reports ready=false/checkpoint_missing; service stopped |
| `node tests/local-regression.cjs` from frontend | Pass | 2→1 mocked dashboard request counts; 6 API scenarios; 4 mocked transaction cases |
| `node tests/production-smoke.cjs` from frontend | Pass | 14 local production endpoints; 13 page routes HTTP 200 and disabled analysis API 503; 5 samples each |
| `npm audit --json` before/after | Issues remain | Initial: 63 advisories, 2 critical; final: 65 advisories, 1 critical (Next), 34 high, 28 moderate, 2 low |
| `git diff --check` | Pass | Only CRLF conversion notices, no whitespace errors |
| GPU / memory / disk inspection | Executed | RTX 3050 4 GB; 16 CPU threads, 16.83 GB RAM total, ~3.56 GB available; ~369 GB disk free; CPU Torch installed |

Initial Python HTTP tests hung under sandbox because Windows asyncio's socket pair was blocked; a bounded faulthandler run located the issue, the hanging job was stopped and the suite rerun outside that sandbox. Rasterio initially failed from conflicting system PostgreSQL PROJ data; process-local bundled-PROJ selection fixed the georeferencing test. Original build needed a free Inter font download; final cached-font build passes. These failures were investigated, not silently counted as passes.

## CNN status and artifacts

Lightweight U-Net implemented, 30,081 parameters by direct count, three selected RGB bands, binary output, BCE+Dice, AdamW, plateau scheduler, deterministic CPU seed, early stopping, explicit site-disjoint manifest, hash validation, resume and bounded training CLI. Shared preprocessing, structured evaluation and CLI overlay export are implemented. Separate token-protected loopback FastAPI process loads one trusted model; Next proxies bounded image bytes from the optional existing submission step. No predictions are returned without a provenance-bearing trained checkpoint.

**Real labeled pairs available: 0. Real epochs completed: 0. Best validation metrics: unavailable. Held-out metrics: unavailable. Genuine checkpoint: absent.** Expected future path `ml/artifacts/run1/best.pt` is not an existing deliverable. Two-epoch synthetic fixture training/checkpoint/resume/inference tests passed and their temporary artifacts were removed; they do not establish scientific quality.

MANGO's 32.12 GB archive requests returned HTTP 401 twice. The alternate freely downloaded CC BY 4.0 Allen AI archive (62.43 MB) contains annotations/metadata but zero raster imagery/mask pairs; it is a point/time-series classification source. No substitute ground truth was fabricated, no terms were accepted, and no paid data/compute was used. See ml/DATASET_CARD.md and ml/MODEL_CARD.md. Hardware training feasibility on legitimate data remains unmeasured; the data blocker comes first.

Model endpoint `/api/analysis` exists but is disabled by default; local service `/health` is verified as not-ready without a checkpoint. Real trained inference/overlay display in browser, real held-out segmentation and uncertainty calibration are **blocked**, not passed. Hectares are computed only for supported projected metre grids in unit tests; unreferenced RGB/degree CRS correctly returns no area. No carbon/credit computation derives from masks.

## Performance evidence

The component-effect mock benchmark executes baseline source from Git and final source: dashboard/map project-list count falls from 2 to 1, a 50% reduction in that request count. No actual page-speed improvement is claimed. The final production build and localhost median header timings/bundle sizes are recorded in BLUECRED_PERFORMANCE_REPORT.md and raw performance JSON. Original build failed, so no valid baseline production timing/bundle/LCP/INP/CLS comparison exists. No live Appwrite/RPC, map-frame, PDF, hydration, memory or browser navigation speedup is claimed.

## Blocked, unexecuted and unresolved

- Genuine training, real held-out evaluation, real-model preview and CPU/GPU latency: blocked by suitable paired-data access. No real checkpoint, history or prediction overlay is delivered.
- Real login/signup, project submission, ownership permissions, database contents, storage, deployed contract reads, wallet transactions and certificates backed by remote records: not executed to avoid potential cloud consumption/data mutation/gas. No production account credentials accessed.
- Browser E2E/mobile/visual PDF/map gesture tests and LCP/INP/CLS profiling: not executed. Server-route smoke does not validate client interactions.
- Full Solidity/credit lifecycle tests: not executed; transaction helper failure/success tests use mocks only. Existing contract source/ABI/address are unchanged. Confirmed-chain/database reconciliation still needs backend design.
- Critical Next advisories and other dependency advisories remain. A tested major framework migration is future work; no production readiness claim. Optional connector build warnings remain.
- Existing remote Appwrite permissions are unknown. Legacy provisioning has unsafe broad grants and is now gated; do not run it until permissions and costs are separately reviewed. Account labels do not repair server grants. Old public/hardcoded credentials should be rotated without printing values.
- Legacy records need a verified onChainProjectId before testnet minting; mappings are not guessed and schema was not changed. Marketplace current listings are demonstrations, not real inventory. Appwrite default list pagination still truncates large summaries; expanding cloud queries was deferred.

## Run locally (PowerShell)

From `C:/projects/Carbon credit transfer system/bluecred/team-nitrix/frontend`, run `npm run dev`. No CNN service/checkpoint is required for the ordinary frontend. From repository root, `ml/.venv/Scripts/python -m unittest discover -s ml/tests -v` runs software tests. Optional ML startup, shared local token, supported images, manifest preparation, training, resume, evaluation and prediction commands are in ml/TRAINING_GUIDE.md and ml/INTEGRATION_GUIDE.md. No dataset download, provisioning, payment, deployment or transaction is part of normal ML startup.

## Safety, rollback and cost

No existing user changes were present at baseline. No tracked user data, Appwrite collection/bucket, deployed contract, wallet, production env or certificate file was modified/deleted. External data preservation is based on executing no mutation, not a remote database audit. Git main is untouched; changes are confined to the feature branch and local ignored ML artifacts. Review and reverse selected patches if needed; do not reset/clean. Preserve any new local work before switching/reverting. No commit, push or deployment was made.

Every new dependency/version, dataset, tool and service is listed with its ₹0 cost in BLUECRED_COST_REPORT.md. Python exact versions are in ml-environment-lock.txt; JavaScript versions are locked in frontend/package-lock.json. No paid resource, credit purchase, billing activation, paid account, mainnet gas or free-to-paid trial was introduced.

## Changed-file manifest and reasons

| File | Reason |
| --- | --- |
| `.gitignore` | Keep ML environment, data, weights and caches out of Git |
| `README.md` | Link verified reports and qualify earlier broad claims |
| `frontend/.env.example` | Local optional service settings, script-only secret and disabled write defaults |
| `frontend/package-lock.json` | Exact installed dependency resolutions |
| `frontend/package.json` | Focused compatibility/security dependency updates |
| `frontend/src/app/admin/page.tsx` | Replace bundled password gate with account-label check |
| `frontend/src/app/certificate/[id]/page.tsx` | Fix client directive and defer PDF dependencies |
| `frontend/src/app/company/portfolio/page.tsx` | Escape JSX apostrophe for lint/build |
| `frontend/src/app/components/EcosystemMap.tsx` | Reuse parent snapshot and omit fabricated coordinates |
| `frontend/src/app/components/Footer.tsx` | Escape JSX quotes for lint/build |
| `frontend/src/app/components/SubmitMap.tsx` | Map lifecycle cancellation, refs and cleanup |
| `frontend/src/app/impact/page.tsx` | Share dashboard project records with map |
| `frontend/src/app/login/page.tsx` | Restore administrator display role from server-controlled account label |
| `frontend/src/app/marketplace/page.tsx` | Disclose demo inventory and prevent persisted demo purchases |
| `frontend/src/app/my-projects/page.tsx` | Escape JSX apostrophe for lint/build |
| `frontend/src/app/submit/page.tsx` | Lazy analysis integration, object URL cleanup, truthful identifiers/write state |
| `frontend/src/app/verifier/page.tsx` | Require administrator label, real chain mapping and confirmed mint; no fake success |
| `frontend/src/context/GlobalState.tsx` | Account-label admin state and no unconfigured session request |
| `frontend/src/lib/appwrite.ts` | Expose nonsecret configuration-readiness flag |
| `frontend/src/lib/useBlueCredContract.ts` | Disabled/testnet-only writes and successful receipt requirement |
| `frontend/src/lib/wagmi.ts` | Remove hardcoded provider credential; local defaults and injected connector |
| `frontend/src/scripts/check-appwrite.js` | Use script-only credential name |
| `frontend/src/scripts/init-appwrite.js` | Gate potentially billable unsafe provisioning; script-only secret name |
| `docs/BLUECRED_COST_REPORT.md` | Audit, scientific limits, validation, cost or developer documentation |
| `docs/BLUECRED_FINAL_VALIDATION.md` | Audit, scientific limits, validation, cost or developer documentation |
| `docs/BLUECRED_PERFORMANCE_REPORT.md` | Audit, scientific limits, validation, cost or developer documentation |
| `docs/BLUECRED_TECHNICAL_AUDIT.md` | Audit, scientific limits, validation, cost or developer documentation |
| `docs/ml-environment-lock.txt` | Audit, scientific limits, validation, cost or developer documentation |
| `docs/ml/DATASET_CARD.md` | Audit, scientific limits, validation, cost or developer documentation |
| `docs/ml/INTEGRATION_GUIDE.md` | Audit, scientific limits, validation, cost or developer documentation |
| `docs/ml/MODEL_CARD.md` | Audit, scientific limits, validation, cost or developer documentation |
| `docs/ml/TRAINING_GUIDE.md` | Audit, scientific limits, validation, cost or developer documentation |
| `docs/performance/baseline-build.txt` | Actual build, dependency, dataset or test/benchmark evidence |
| `docs/performance/dataset-inspection.json` | Actual build, dependency, dataset or test/benchmark evidence |
| `docs/performance/dependency-audit.json` | Actual build, dependency, dataset or test/benchmark evidence |
| `docs/performance/final-build-time.json` | Actual build, dependency, dataset or test/benchmark evidence |
| `docs/performance/final-build.txt` | Actual build, dependency, dataset or test/benchmark evidence |
| `docs/performance/final-dependency-audit.json` | Actual build, dependency, dataset or test/benchmark evidence |
| `docs/performance/final-lint.txt` | Actual build, dependency, dataset or test/benchmark evidence |
| `docs/performance/final-typecheck.txt` | Actual build, dependency, dataset or test/benchmark evidence |
| `docs/performance/frontend-regression.json` | Actual build, dependency, dataset or test/benchmark evidence |
| `docs/performance/ml-http-smoke.json` | Actual build, dependency, dataset or test/benchmark evidence |
| `docs/performance/ml-tests.txt` | Actual build, dependency, dataset or test/benchmark evidence |
| `docs/performance/production-http-smoke.json` | Actual build, dependency, dataset or test/benchmark evidence |
| `frontend/.eslintrc.json` | Reproducible lint configuration |
| `frontend/src/app/api/analysis/route.ts` | Opt-in bounded stateless loopback inference bridge |
| `frontend/src/app/components/VegetationAnalysis.tsx` | Optional existing-workflow upload/result/error interface |
| `frontend/tests/local-regression.cjs` | Mocked regression/transaction checks or actual local production HTTP smoke |
| `frontend/tests/production-smoke.cjs` | Mocked regression/transaction checks or actual local production HTTP smoke |
| `ml/README.md` | Local segmentation pipeline, configuration or reproducible setup |
| `ml/__init__.py` | Local segmentation pipeline, configuration or reproducible setup |
| `ml/config.json` | Local segmentation pipeline, configuration or reproducible setup |
| `ml/data.py` | Local segmentation pipeline, configuration or reproducible setup |
| `ml/inference.py` | Local segmentation pipeline, configuration or reproducible setup |
| `ml/manifest.example.json` | Local segmentation pipeline, configuration or reproducible setup |
| `ml/model.py` | Local segmentation pipeline, configuration or reproducible setup |
| `ml/requirements.txt` | Local segmentation pipeline, configuration or reproducible setup |
| `ml/service.py` | Local segmentation pipeline, configuration or reproducible setup |
| `ml/tests/http_smoke.py` | Explicit synthetic software regression or loopback readiness test |
| `ml/tests/test_pipeline.py` | Explicit synthetic software regression or loopback readiness test |
| `ml/train.py` | Local segmentation pipeline, configuration or reproducible setup |
