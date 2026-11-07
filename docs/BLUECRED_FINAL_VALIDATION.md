# Final validation — Phase 2, 6 November 2026

**Verdict: IMPLEMENTED WITH LIMITATIONS. Additional expenditure: ₹0. No new billable resource introduced.**

Real data/training/checkpoint/browser inference and actual browser performance measurement are now completed. The CNN is **low-quality** on held-out geography and must not verify a project or establish reliable mangrove/carbon area. Security is improved, not universally resolved. External production auth/data/chain workflows remain unverified.

## Recovery, architecture and changes

Existing `team-nitrix` retained on `feature/bluecred-cnn-performance`. Prior implementation was scanned (62 files, ~1.1 MB; no staged secret literals/data/weights/large artifacts) and committed as **a7c7c42**. Separate reversible security migration **ffa8911** updates Next/eslint-config-next to **15.5.29** and generated TS target ES2017, retaining React18/Leaflet4. Final source/report changes remain on this feature branch; see git log/status for the final local snapshot. Main/remote untouched, no reset/clean/stash/push/deployment.

Existing pages, routes, authentication architecture, Appwrite interfaces, contracts and branding preserved. Phase2 adds genuine data preparation/training/validation and a safe local startup helper, activates actual inference in the existing submission evidence panel, retains graceful unavailable behavior, starts the same hero entrance via CSS to avoid hydration delay, and losslessly compresses certificate PNG streams. Visual certificate review also confirmed unsupported hardcoded mainnet/retirement/verification claims and a missing-data crash; labels are now honest registry-record fields and failed fetches show an unavailable state. Export/layout are retained. Old setup guides now use a script-only Appwrite key name and identify unsafe external provisioning/deployment as legacy, not the zero-cost local flow.

## Security outcome

[Official Next November 2026 security release](https://nextjs.org/blog/november-2026-security-release) names 15.5.29; [support policy](https://nextjs.org/support-policy) marks 14 unsupported and extends 15 security updates through Jan 31, 2027. Registry metadata confirmed Node20/React18 compatibility. Migration installation, TypeScript, lint, production build, regression tests and real Chrome interactions pass; no force/legacy-peer install.

Current npm audit: **0 critical, 31 high, 29 moderate, 2 low (62 total)**. Next's remaining moderate entry is via postcss. High/transitive wallet dependencies and deployed Appwrite permission risks remain. No vulnerability-free/production-ready claim. Existing historical public/hardcoded credentials should be rotated without exposing them. Legacy broad-grant provisioning stays gated and was never run. Client-side administrator labels are not a replacement for server ownership/permissions. Blockchain writes stay disabled by default; no live RPC/gas was used.

## Genuine CNN experiment

| Item | Actual result |
| --- | --- |
| Dataset | GMW 2020 v4.0.19 reference extent + matching WorldCover 2020 Sentinel-2 annual median imagery, CC BY 4.0 |
| Real pairs | **144** aligned 128px TIFF/mask pairs, no synthetic scientific data |
| Sites / split | India+Myanmar train **96**, Thailand validation **24**, Indonesia final test **24** |
| Channels | Source B02/B03/B04/B08; model RGB indices **3/2/1**, reflectance /10000 |
| Architecture | Existing lightweight U-Net, GroupNorm, skip connections; **30,081 parameters** |
| Genuine smoke | 1 epoch, separate output, `--skip-test`; test metric not opened |
| Final epochs / selection | **7 epochs**, early stopping, best validation epoch **1** |
| Training-loop runtime | **96.177 seconds**, CPU / 2 threads / batch4; no GPU use |
| Best validation | IoU **0.426927**, Dice/F1 **0.598387**, precision **0.432370**, recall **0.971358**, loss **1.219472** |
| Held-out final test | IoU **0.291602**, Dice/F1 **0.451535**, precision **0.296220**, recall **0.949253**, loss **1.462316** |
| Fixed NDVI test baseline | IoU **0.320630** — **better than CNN**, not concealed |
| Checkpoint | **ml/artifacts/run1/best.pt**, genuinely exists, **496,608 bytes**, included in Git |
| Checkpoint SHA256 | `774e78749f2bdd608076625138be1d4abd6046141b8a2e4e2be0b5267b86ff45` |
| CPU warmed pipeline | median **35.440 ms**, p95 **39.274 ms**, 30 repeats; GPU N/A |

Fresh-process model load, real prediction mask and diagnostic outputs verified. All history/config/test scores are saved beside weights and copied as small JSON evidence under phase2/. Scientific limitations are explicit: map-derived labels, not independent field ground truth; matched annual year, not per-pixel dates; shared sensor/map biases; two training sites; selection-stratified windows; residual clouds unquantified; substantial false positives and overfitting. No post-test model tuning occurred. Broader independently labeled regions and a new holdout would be needed for a scientifically improved model.

MANGO was not repeatedly retried or bypassed. Suggested Norway Parquet was legitimately downloaded/inspected but left unused when GMW mangrove pairs became feasible. Source ZIP MD5, footprint checks, actual differing source grids, nearest-neighbor alignment, nodata screening, site boundaries, manifests and source URLs are in DATASET_CARD.md and dataset-summary.json. No invented metric/provenance, paid endpoint or random checkpoint substituted.

## Real website integration evidence

`ml/service.py` loads the actual checkpoint once in eval/inference mode; `/health` reports **ready=true**, version `bluecred-gmw2020-unet-v1`. Existing `/submit` step3 uploads a real held-out TIFF through **Next /api/analysis → actual loopback FastAPI/PyTorch → genuine mask/overlay**. Browser model response is not mocked. Actual UI result+decoded overlay latency in final E2E: **1711.707 ms**, Python request pipeline **852.855 ms**. Model warning and dataset-score metadata are visible. Screenshot: `docs/performance/phase2/real-cnn-inference.png`.

**Auth/account/documents/remote map tiles are explicit browser fixtures.** No actual external login, account, project submission, storage operation, production certificate or live blockchain verification is claimed. Real CNN/Next/Python path is distinguished from those mocks. The service is deliberately stopped during the test; the UI shows unavailable while the submission flow remains intact. EPSG:4326 input correctly returns **area=null** with pixel percentage, never fake hectares. Projected metre-grid code is unit-tested, not validated for certified area. No model output approves a project or mints credits.

## Actual performance

Controlled pre-optimization worktree source at ffa8911 was checked against Git, built with the same Next/React/dependencies and tested serially with no training/preparation/build jobs active. Five fresh Chrome contexts per version, same viewport/fixtures/observation. Homepage LCP median **712→460 ms (35.4% lower local lab median)**. Raw samples/ranges/commit proxies/EventTiming/navigation/bundle observations are in BLUECRED_PERFORMANCE_REPORT.md. Small samples/caches vary; no field Core Web Vitals or universal speed guarantee. Earlier three-run preliminary medians are superseded by the controlled comparison.

Same-content PDF compression test: **9,154,121→148,746 bytes**, identical decoded 1916×1592 image/pixel hash. No latency improvement claimed. Later safety-copy correction changes text intentionally; final record PDF is **157,655 bytes**, actual export **3452.469 ms** in final E2E. Rendering reviewed. Generated fixture PDFs remain ignored and are not delivered as real certificates.

## Tests actually run

| Command / evidence | Final result / scope |
| --- | --- |
| `git status`, diff/size/secret candidate review | Prior work checkpointed safely; data, weights, secrets and baseline worktree excluded |
| `npm install --save-exact next@15.5.29 eslint-config-next@15.5.29` | Supported focused migration; React18 retained |
| `npx --no-install tsc --noEmit` | Pass, no diagnostics |
| `npm run lint` | Pass with existing img/hook warnings |
| `npm run build` | Pass (exit0), current sizes/time in phase2/final-build*; optional connector warnings remain |
| `node tests/local-regression.cjs` | Pass: component effects 2→1 mocked requests, 6 API checks, 4 mocked transaction cases |
| `ml/.venv/Scripts/python -m unittest discover -s ml/tests -v` | **11 pass**, including new four-band/nodata and data/weight preservation guards; synthetic fixtures explicitly software-only |
| `ml/.venv/Scripts/python -m ml.download_gmw` | Existing archive verified, no repeated download/overwrite |
| `ml/.venv/Scripts/python -m ml.prepare_gmw` | 144 real pairs, 145 image-window attempts; one invalid candidate rejected |
| `ml.train` genuine smoke / final run | Completed, real history/checkpoint/held-out evaluation; no fabricated scientific results |
| `ml/.venv/Scripts/python -m ml.validate_model` | Fresh-process weight validation, CPU timings, actual held-out diagnostics |
| `ml/.venv/Scripts/python -m ml.tests.http_smoke` | Actual missing-checkpoint HTTP readiness false; temporary server stopped |
| `node tests/browser-validation.cjs e2e final` | **10 browser checks pass**, genuine CNN response/overlay, service-down state, map click/charts/marketplace/verifier/PDF/missing record |
| Browser desktop/mobile | Zero unhandled page errors; five 390×844 routes show no horizontal overflow. Expected 503/404/caught missing-fixture errors are recorded, not hidden |
| Controlled browser profile | 5 before + 5 after contexts, no page/console errors; same pre-change source/conditions |
| Full-route profile | 18 final contexts across 6 production routes; real Chrome, fixture data, no page errors |
| `node tests/production-smoke.cjs` | **14 pass**: 13 page routes200, disabled API503; actual localhost HTTP, not client E2E |
| Local startup helper | Real checkpoint readiness, literal npm argument forwarding, token restore and cleanup verified; frontend launch explicitly stubbed for helper test (real Next production server tested separately) |
| PDF read/render/pixel check | Compression lossless; corrected final labels visually checked with existing free pypdf/PyMuPDF/Pillow tools |
| Final `git diff --check` | Source/docs checked; raw captured build logs may retain compiler whitespace |

Transient environment/harness failures were corrected: original font DNS needed a free public font fetch; sandbox denied one generated .next directory and a junction, resolved with normal filesystem access; initial GMW north/south filename convention was verified/corrected before pairs; Chrome inspector-body eviction was avoided by observing unchanged real page fetches; PowerShell test capture/argument forwarding was corrected and retested. No production state was reset/deleted to resolve them. Final relevant checks pass; expected negative tests are not application successes or hidden failures.

## Remaining limitations / not executed

- **CNN quality is insufficient**: test precision ~0.296, below fixed NDVI IoU; no independent field/global validation, calibrated uncertainty, carbon/biomass estimate or trustworthy area certification.
- No actual external Appwrite auth/session/ownership/permissions/schema/index/latency or storage validation; no live wallet/contract read/write/credit retirement or real marketplace settlement. Production permissions may remain unsafe; historical credentials may need rotation.
- npm **62 advisories remain, including 31 high**; zero critical does not imply production security. Next15 support deadline must be respected before any future deployment.
- Appwrite default pagination can truncate large summaries; several existing search/filter/remote failure paths outside targeted checks remain incomplete. No unsafe cross-user cache added.
- Individual component render duration, exact hydration cost, field INP/LCP/CLS, independent map-frame/marker scale and cloud latency are not established by local fixture tests. Browser-only root-commit/EventTiming metrics are explicitly proxies/lab samples.
- GPU timings unmeasured (CPU wheel sufficed). No network/hosted-service speedup, production deployment or end-to-end production finance guarantee.

## Exact local startup (PowerShell)

```powershell
Set-Location -LiteralPath 'C:\projects\Carbon credit transfer system\bluecred\team-nitrix'
.\scripts\start-local-ml.ps1
```

The helper shares a random ephemeral token, verifies actual local model readiness and starts the existing frontend bound to 127.0.0.1; Ctrl+C cleans up its own service. It does not create an account or change production auth. Ordinary frontend independently: `npm --prefix frontend run dev`. Verified offline real-CNN UI test (with auth/data fixtures): change to frontend and run `node tests/browser-validation.cjs e2e final`. Detailed manual setup/training/resume/eval commands are in the updated training/integration guides. Prepared pairs and trained checkpoints are included in Git.

## Safety / cost / rollback

**₹0 additional expenditure. No new billable resource introduced.** Full free dependencies, datasets, tools, hosting-access distinctions and costs: BLUECRED_COST_REPORT.md; exact Python versions: ml-environment-lock.txt; exact JS: frontend/package-lock.json. No billing, paid GPU/API, upgrade, purchase, automatic upload, production mutation, contract change, deployment or push. No real wallet key or payment details requested. Existing production data/contracts/user files were not destroyed; external state was preserved by executing no mutation, not by pretending a remote audit passed.

Recovery commits a7c7c42 / ffa8911 remain available; the ignored detached baseline worktree is retained for reproducibility using a dependency junction (no duplicate install). No cleanup/delete command is required. Review final Git diffs/manifest; reverse selected patches only after preserving future work. Large source archives and fixture PDFs remain local and ignored. Prepared pairs and trained checkpoints are included in Git.

## Exact Phase 2 changed-file manifest

Compared with recovery checkpoint a7c7c42, including the isolated migration and newly added evidence. Large source archives, caches, environment, fixture PDFs and the benchmark worktree are excluded. Prepared pairs and trained checkpoints are included. `docs/performance/changed-files.json` contains cumulative/Phase2 machine-readable lists.

| File | Reason |
| --- | --- |
| `.gitignore` | Ignore isolated baseline worktree; preserve data/artifact exclusions |
| `README.md` | Current Next/security/training status; fix public script-key example |
| `docs/BLUECRED_COST_REPORT.md` | Updated current audit/performance/validation/cost report |
| `docs/BLUECRED_FINAL_VALIDATION.md` | Updated current audit/performance/validation/cost report |
| `docs/BLUECRED_PERFORMANCE_REPORT.md` | Updated current audit/performance/validation/cost report |
| `docs/BLUECRED_TECHNICAL_AUDIT.md` | Updated current audit/performance/validation/cost report |
| `docs/backend-setup.md` | Correct unsafe public script-key guidance; identify legacy external provisioning/deployment |
| `docs/frontend-setup.md` | Correct unsafe public script-key guidance; identify legacy external provisioning/deployment |
| `docs/local-setup.md` | Correct unsafe public script-key guidance; identify legacy external provisioning/deployment |
| `docs/ml-environment-lock.txt` | Exact current free local Python environment |
| `docs/ml/DATASET_CARD.md` | Current genuine data/model/provenance/reproducibility/startup documentation |
| `docs/ml/INTEGRATION_GUIDE.md` | Current genuine data/model/provenance/reproducibility/startup documentation |
| `docs/ml/MODEL_CARD.md` | Current genuine data/model/provenance/reproducibility/startup documentation |
| `docs/ml/TRAINING_GUIDE.md` | Current genuine data/model/provenance/reproducibility/startup documentation |
| `docs/performance/changed-files.json` | Updated final HTTP or exact file-inventory evidence |
| `docs/performance/phase2/browser-e2e-baseline.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/browser-e2e-final.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/browser-profile-baseline.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/browser-profile-controlled-after.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/browser-profile-controlled-before.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/browser-profile-final.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/controlled-baseline-build.txt` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/controlled-baseline-provenance.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/dataset-summary.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/final-build-time.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/final-build.txt` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/final-lint.txt` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/final-regression.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/final-typecheck.txt` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/heldout-predictions.png` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/migration-build.txt` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/migration-lint.txt` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/migration-regression.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/migration-typecheck.txt` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/ml-http-missing-model.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/ml-tests.txt` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/mobile-impact.png` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/model-validation-summary.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/model-validation.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/pdf-validation.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/production-http-result.txt` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/real-cnn-inference.png` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/security-audit.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/startup-helper.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/training-config.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/training-history.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/phase2/training-test_metrics.json` | Executed Phase2 browser/security/model/data/PDF/build/startup evidence |
| `docs/performance/production-http-smoke.json` | Updated final HTTP or exact file-inventory evidence |
| `frontend/package-lock.json` | Exact compatible dependency resolution |
| `frontend/package.json` | Focused supported Next migration and free browser test dependency |
| `frontend/src/app/certificate/[id]/page.tsx` | Lossless PDF compression; honest registry labels; safe missing-record state |
| `frontend/src/app/components/VegetationAnalysis.tsx` | Actual GMW input description, model metadata and low-precision warning |
| `frontend/src/app/globals.css` | Hero keyframes/delays and reduced-motion support; valid import ordering |
| `frontend/src/app/page.tsx` | Same hero entrance begins through CSS without hydration delay |
| `frontend/tests/browser-validation.cjs` | Real Chrome profile/E2E with fixture external data and genuine local CNN |
| `frontend/tsconfig.json` | Next15 generated ES2017 target |
| `ml/README.md` | Current trained research-prototype status |
| `ml/data.py` | Enforce TIFF driver / required RGB+NIR input contract |
| `ml/download_gmw.py` | Bounded/checksummed idempotent public reference download |
| `ml/gmw-config.json` | Frozen real 2020 mangrove-reference experiment configuration |
| `ml/inference.py` | Actual validation metadata and display-only reflectance stretch |
| `ml/prepare_gmw.py` | Real geographically disjoint aligned reference-pair preparation |
| `ml/service.py` | Expose actual readiness label/input description |
| `ml/tests/test_pipeline.py` | Four-band/nodata/preparation/weight preservation regression tests |
| `ml/train.py` | NDVI baseline, smoke skip-test and existing-weight preservation guard |
| `ml/validate_model.py` | Fresh checkpoint, actual diagnostics and bounded CPU latency measurement |
| `scripts/start-local-ml.ps1` | Token-safe loopback startup/readiness/owned-process cleanup |
