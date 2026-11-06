# Blue-Cred performance report — 6 November 2026

## Method and constraints

Same existing Windows laptop (16 CPU threads, 16.83 GB RAM, local SSD) and project. No Appwrite/RPC/hosted-inference traffic generated for benchmarks. Original clean baseline is commit 357f05f, Next 14.2.3. Original production build fails on missing certificate client directive and font DNS; original TypeScript fails on Leaflet types, so there is no valid baseline production bundle or browser comparison. Do not infer loading improvement from a repaired build.

Local production HTTP benchmark uses `frontend/tests/production-smoke.cjs`, loopback port 13087, five sequential GETs per route and median elapsed time to response headers. It does not render browser JavaScript or measure LCP, INP, CLS, hydration, real navigation, maps, PDFs or external data requests. The temporary server is stopped afterward. Full samples are in `performance/production-http-smoke.json`. Network conditions differ between initial font fetch and later cached builds; build-duration comparisons are not valid.

## Verified before / after

| Measurement | Baseline | Final | Interpretation |
| --- | --- | --- | --- |
| Production build | Fails | Exit 0, 38.106 seconds on final cached-font run | Repaired build; no speedup claim |
| TypeScript | TS7016 Leaflet errors | Pass, no diagnostics | Compatibility repair |
| Impact project-list requests | 2 | 1 | 50% reduction in mocked component-effect request count |
| Production first-load bundle | Unavailable: failed build | See build output below | No percentage reduction claim |
| HTTP route readiness | Baseline unavailable | 13 pages return 200, disabled API returns 503 | Server response smoke only |
| Certificate PDF library load | Eager imports | Dynamic imports in download handler | Deferred work verified by source/build; no measured PDF/browser time claim |
| Map lifecycle | Cleanup captures null state | Ref lifetime / cancelled import cleanup | Correctness fix; no measured frame-rate claim |
| Real CNN latency | No model | No model | Not measured; no fabricated numbers |
| Live Appwrite / RPC latency | Not tested | Not tested | Avoid unknown usage charges |

The query-count harness transpiles and executes the original impact/map components from `git show 357f05f` and final source with a mocked SDK, then invokes their effects. It asserts two vs one database calls and makes no real cloud calls. It does not simulate or assert a page-speed gain. Chart/Map/PDF client CPU profiling remains unmeasured.

## Final localhost route measurements

| Route | Status | Median headers ms (5 samples) |
| --- | --- | --- |
| `/` | 200 | 6.169 |
| `/login` | 200 | 4.683 |
| `/submit` | 200 | 3.355 |
| `/projects` | 200 | 2.894 |
| `/projects/smoke` | 200 | 54.238 |
| `/my-projects` | 200 | 3.803 |
| `/impact` | 200 | 2.485 |
| `/marketplace` | 200 | 2.339 |
| `/verifier` | 200 | 2.174 |
| `/admin` | 200 | 2.496 |
| `/company/portfolio` | 200 | 2.237 |
| `/company/transactions` | 200 | 2.129 |
| `/certificate/smoke` | 200 | 54.735 |
| `/api/analysis` | 503 | 2.325 |

## Final Next production build sizes

```text
┌ ○ /                                    5.19 kB         140 kB
├ ○ /_not-found                          880 B          91.5 kB
├ ○ /admin                               5.63 kB         159 kB
├ ƒ /api/analysis                        0 B                0 B
├ ƒ /certificate/[id]                    3.29 kB         157 kB
├ ○ /company/portfolio                   4.03 kB         167 kB
├ ○ /company/transactions                2.95 kB         130 kB
├ ○ /impact                              72 kB           226 kB
├ ○ /login                               5.11 kB         159 kB
├ ○ /marketplace                         7.39 kB         161 kB
├ ○ /my-projects                         3.84 kB         166 kB
├ ○ /projects                            2.82 kB         165 kB
├ ƒ /projects/[id]                       3.76 kB         131 kB
├ ○ /submit                              6.18 kB         366 kB
└ ○ /verifier                            4.59 kB         364 kB
+ First Load JS shared by all            90.6 kB
  ├ chunks/2117-0c2919f6fb137799.js      31.9 kB
  ├ chunks/fd9d1056-5bd29454b8b8b5b5.js  53.6 kB
  └ other shared chunks (total)          5.07 kB
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

Source optimizations preserve existing page routes/theme/layout: duplicate dashboard/map query removed, certificate PDF libraries deferred, evidence object URLs cleaned up, Leaflet instance cleanup corrected, optional analysis panel loaded only on the evidence step and model kept out of JavaScript. No Appwrite pagination expansion, unsafe transaction cache or new RPC polling was introduced.

## Remaining bottlenecks

Submit/verifier retain sizeable wallet bundles; impact retains Chart.js. Optional connector warnings and existing React-hook/img warnings remain. A broad wallet/chart rewrite was not justified by measured browser data. Default Appwrite pagination limits summaries, and live query plans/indexes are unverified. LCP/INP/CLS, mobile responsiveness, browser interactions, external service latency and memory profiling require a separately isolated browser/session with approved free data access. No arbitrary performance target is reported as met.
