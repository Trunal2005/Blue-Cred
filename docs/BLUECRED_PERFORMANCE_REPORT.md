# Blue-Cred performance report — Phase 2, 6 November 2026

## Genuine browser methodology

Actual production Next.js 15.5.29 in isolated **Chrome 156.0.8078.80**, existing Windows laptop (16 CPU threads, 16.83 GB RAM; RTX3050 unused by ML), 1440×1000 viewport, no CPU/network throttle. All Appwrite account/document requests and remote images/map tiles are explicit fixtures; other external traffic blocked. This measures local app rendering/interaction, not real cloud latency or geographically accurate map tiles.

A controlled homepage comparison uses a separate detached worktree at **ffa8911** (supported Next migration, original Framer hero entrance) and the final build (same fade/movement durations in CSS). The baseline source was byte-checked against its commit. The worktree uses a junction to the same installed free dependencies; main source was not swapped/overwritten. Both builds completed before measurement; **no data preparation, training or build jobs ran during the ten controlled browser trials**. Five fresh browser contexts per version, identical 2.5-second observation window and real click to project registry. See controlled-baseline-provenance.json and browser-profile-controlled-before/after.json.

Earlier three-context full-route samples remain as raw evidence. The original Phase 1 Next14 build failed, so it is not a usable production-browser baseline. Earlier preliminary root medians varied (including 1460→380 and 1460→784 ms); **these are not the final claimed comparison**. Five-trial controlled results below supersede them. Background OS load/caches and small sample size still limit inference; no field Core Web Vitals or universal speed guarantee.

## Controlled homepage results

| Metric (5-context median) | Before | Final |
| --- | --- | --- |
| LCP, ms | 712.000 | 460.000 |
| Observed long-task time (>50ms tasks), ms | 127.000 | 117.000 |
| First React root commit, ms (hydration proxy) | 554.100 | 451.500 |
| React root commits observed | 7 | 7 |
| Script ResourceTiming transfer bytes | 492842 | 492064 |
| Click → registry heading, ms | 228.739 | 226.041 |

**Homepage LCP median is 35.4% lower in this controlled local lab sample.** The code change starts the same 0.8s hero fade/20px movement and 0.2/0.3s intro/action delays from CSS/first paint instead of waiting for React hydration. Reduced-motion users skip that CSS entrance. Layout/content/branding remain. No claim of equal improvements on other routes or external services.

Before LCP samples: `[1936, 712, 484, 612, 1404]` ms. Final samples: `[1056, 636, 460, 428, 440]` ms. Ranges overlap and first-context/caching effects are visible. Individual component render duration/exact hydration cost is not measured; root commit callbacks are only a proxy. EventTiming samples after real navigation are in raw JSON: lab interaction events are **not field INP**.

## Other final production browser observations

Three fresh contexts per route; median observed values, 2.5-second window. These final route measurements are not claimed as controlled before/after improvements.

| Route | LCP ms | Load-event ms | Long-task ms | Script transfer bytes | Root commits |
| --- | --- | --- | --- | --- | --- |
| `/` | 784.000 | 655.000 | 289.000 | 492064 | 7 |
| `/certificate/browser-fixture-transaction` | 816.000 | 355.100 | 61.000 | 483185 | 8 |
| `/impact` | 924.000 | 531.700 | 423.000 | 479479 | 8 |
| `/login` | 276.000 | 532.700 | 220.000 | 479479 | 7 |
| `/marketplace` | 792.000 | 496.900 | 355.000 | 487205 | 7 |
| `/submit` | 284.000 | 516.700 | 239.000 | 492064 | 7 |

All full-route and controlled profiles have zero unhandled page errors / console errors. CLS samples and navigation timings are preserved in JSON; observation-window CLS is not field CLS. Root wallet/chart code remains significant; script transfer figures include visible-link prefetch/async work and are not equivalent to the build's First Load JS total.

## Actual end-to-end / PDF / ML timings

- Real held-out image file → existing UI → Next bridge → actual Python checkpoint → decoded displayed overlay: **1711.707 ms** in final E2E. Actual Python-reported request pipeline: **852.855 ms**. These are one real cold-worker browser example, not throughput or per-site accuracy.
- Standalone sequential CPU pipeline: median **35.440 ms**, p95 **39.274 ms**, 30 warmed repeats / 2 CPU threads; model-forward median **13.662 ms**. No GPU benchmark. Model quality is poor (test IoU 0.292 vs fixed NDVI 0.321), independent of latency.
- Same-content PDF compression A/B: **9,154,121→148,746 bytes**, 98.38% smaller. Both decode to identical 1916×1592 RGB pixels and SHA256, proving lossless compression. The PNG capture scale/quality was retained. Initial 1.740s vs compression-only 2.014s export samples did **not** show a latency improvement, so none is claimed.
- After separately correcting unsupported certificate claims, final exported registry-record PDF is **157,655 bytes**, measured generation/download **3452.469 ms** in the final idle-system E2E. Content changed deliberately; this is not the same-content pixel comparison. Its final rendering was visually checked. All certificate inputs are explicit local fixtures, not real credits.
- Map initialization/click and chart canvas rendering were executed in Chrome with fixture data/tiles. No separate frame-rate, marker-scale or exact chart drawing duration claim. Five mobile routes at 390×844 showed no horizontal overflow.

## Build / HTTP / request evidence

Final TypeScript, lint (warnings), production build, mocked API/transaction tests and 14-route local production HTTP smoke pass. Raw final build sizes: `phase2/final-build.txt`. Migration baseline sizes: `phase2/migration-build.txt`. These are asset/bundle counts, not browser hydration time. The final build duration is in final-build-time.json; cold/warm caches and filesystem escalation differ, so no build-speed improvement is claimed.

Earlier impact/map request count 2→1 is retained and still asserted by the actual component-effect harness with mocked SDK; it is not a measured cloud-speed improvement. Actual fixture-backed dashboard browser requests are captured in the browser JSON. Live Appwrite/RPC/API quota/latency, cloud indexes/permissions and genuine wallet transactions remain untested to protect the ₹0 budget and production data.

## Reproduce

From frontend: `node tests/browser-validation.cjs profile final`; `node tests/browser-validation.cjs e2e final`; `node tests/production-smoke.cjs`. Controlled homepage-only mode uses `BLUECRED_PROFILE_HOME_ONLY=true`; baseline app directory is `BLUECRED_BROWSER_APP_DIR` pointing to the preserved isolated worktree's frontend. Clear the app-dir override for final build measurement. Fixed same Chrome/viewport/fixture/data/observation conditions and idle other jobs are required. Data/model artifacts must exist for E2E. No hosted browser, paid profiler, deployment or production database write.
