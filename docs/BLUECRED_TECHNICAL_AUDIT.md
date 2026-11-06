# Blue-Cred technical audit — current Phase 2 status

6 November 2026. Existing repository preserved. Recovery checkpoint `a7c7c42` captures all prior implementation (62 source/report files, no data/weights/secrets); isolated security migration commit `ffa8911` upgrades only package metadata/lockfile and Next's generated TypeScript target. Both are local on `feature/bluecred-cnn-performance`; main/remote remain untouched. The original baseline is 357f05f; historical evidence remains under performance/ and in the recovery commit.

## Verified architecture

Next.js **15.5.29** App Router, React **18.3.1**, React Leaflet **4.2.1**, Appwrite browser SDK, Wagmi/RainbowKit/React Query. Existing routes/components/branding retained. Direct Appwrite project/transaction/storage flows are unchanged externally. Admin/verifier require a server-controlled account label; server permissions remain the actual authorization boundary. Root Solidity ERC1155/AccessControl source, ABI, deployed address and contract deployment configuration were not changed.

Optional existing submission evidence panel calls a Next stateless API bridge to token-protected loopback FastAPI. Real local PyTorch U-Net loads a genuine checkpoint once; no model runs in JavaScript, no prediction writes project data, no inference triggers certification/minting. New preparation/training/evaluation scripts are local. Exact source/data/quality details are in ml/DATASET_CARD.md and ml/MODEL_CARD.md.

## Confirmed issues and outcomes

| Severity | Evidence / reproduction | Current action / risk |
| --- | --- | --- |
| Critical, fixed framework advisories | Prior Next 14.2.35 audit; [official November release](https://nextjs.org/blog/november-2026-security-release), [support policy](https://nextjs.org/support-policy), official npm peer metadata | Smallest supported major candidate 15.5.29, matching ESLint config; React 18 retained. Install/type/lint/build/browser/regressions pass. Current npm graph: **0 critical, 31 high, 29 moderate, 2 low (62 total)**; not all security issues resolved |
| High, remaining | Current npm audit has wallet/transitive advisories; Next entry is moderate via postcss | Full advisory JSON saved; no blanket upgrade. Next 15 security support is extended through Jan 31, 2027; recheck before any deployment |
| Critical, remote status unknown | Legacy Appwrite provisioning code grants broad update/delete/write; prior password/local role gates were insufficient | Script remains gated and was never run; admin UI uses account label. Existing remote permissions were not read/changed. **UI checks cannot fix server grants**; separate authorized review needed |
| High, fixed source fallback | Historical RPC credential and NEXT_PUBLIC script-key naming | Hardcoded fallback removed, loopback defaults, APPWRITE_API_KEY script-only. Rotate any previously exposed live credential without printing it. No production env edited |
| Blocking, fixed Phase 1 | Certificate hook page lacked use client; Leaflet TS declarations missing; React Leaflet 5/React18 mismatch | Directive/type/package fixes retained; build and typecheck pass; actual map click tested |
| High, fixed | Verifier fabricated mint hashes / guessed chain IDs / accepted unconfirmed writes | Real stored chain mapping required, testnet opt-in only, successful receipt required; no actual transaction executed |
| High, fixed | Marketplace current inventory is hardcoded demonstrations | Explicit disclosure and demo purchase-record guard; real marketplace settlement not implemented/validated |
| High, fixed Phase 2 | PDF visual review/source showed hardcoded mainnet/blockchain verification/permanent retirement claims, independent of evidence | Certificate remains exportable with same layout, now accurately labels a registry record, recorded quantity/date and unverified network; fabricated explorer hash removed. No server-side chain/retirement proof is invented |
| Blocking failure state, fixed Phase 2 | Failed certificate fetch leaves data=null, followed by credit.tokenId access | Safe unavailable view, no PDF/verification claim; actual browser 404 fixture regression added |
| High, scientific limitation | Held-out model IoU 0.292/precision 0.296, below fixed NDVI IoU 0.321 | UI warns about false positives and low validation precision; research prototype only, no trustworthy project/area/carbon certification |
| Medium, fixed Phase 1 | Duplicate impact/map request, leaked map instance/import lifetime and upload object URLs | Shared snapshot, ref/cancellation/cleanup retained; source/mocked request count 2→1. Actual browser maps/charts verified with fixtures |
| Medium, fixed Phase 2 | Hero entrance waits for hydration; Chrome baseline LCP and first-commit evidence | Same fade/movement timing moved to CSS, retaining appearance and reduced-motion handling; before/after browser samples in performance report |
| Medium, fixed Phase 2 | Same-content fixture PDF is 9,154,121 bytes without compression | Lossless PNG stream compression: 148,746 bytes with identical decoded image hash/dimensions; generation latency slightly higher, transparently reported. Later safety-label edits separately rendered/checked |
| Data safety, fixed Phase 2 | Training/preparation can otherwise overwrite completed outputs | Refuse nonempty preparation output and existing weights without explicit resume; preservation tests. Data/weights remain Git-ignored |

## Security migration evidence

Official Next support policy marks 14 unsupported and extends 15 security updates to Jan 31, 2027. Official November 3 advisory names 15.5.29 and 16.4.5. 15.5.29 supports existing Node20/React18 per its registry peer metadata, avoiding a React/Leaflet major migration. Next changed tsconfig target to ES2017. No async-server-params changes were needed because the dynamic pages use client hooks. Peer installation used neither force nor legacy-peer-deps. Optional pino-pretty/React Native storage build warnings remain but did not cause browser page errors. npm graph counts are not proof of a vulnerability-free app.

## Validation and remaining boundaries

See BLUECRED_FINAL_VALIDATION.md and BLUECRED_PERFORMANCE_REPORT.md. Real Chrome executes local production UI, Leaflet, charts, genuine model upload/overlay, missing service/record states, mobile widths and actual PDF export. Appwrite accounts/documents and remote imagery/map tiles are explicit fixtures; no production integration is claimed. An early Chrome inspector body-capture failure was a harness issue; final capture observes unchanged actual page fetch responses, not mocked model results.

Remaining issues: default Appwrite list pagination can truncate large summaries, search/filter/remote failure handling outside tested paths is incomplete, remote ownership/index/permission/RPC latency is unverified, root wallet/chart bundles remain sizeable, field Core Web Vitals and global model accuracy are unmeasured. Chain/database reconciliation after a confirmed transaction followed by failed persistence still requires backend design. No production readiness, verified retirement, independent carbon estimate or general mangrove-detector claim.

## Recovery and safety

No production records, buckets, permissions, contracts, wallets or deployed environment changed. No live RPC/gas, push or deployment. Reviewed changes are incremental on the existing feature branch; checkpoint/migration commits provide recovery. Review final manifest/diffs and reverse selected patches if required; do not reset/clean or discard unrelated future work. Local ignored source archives, paired data and weights are retained independently. All added tools/data/services are ₹0 as listed in BLUECRED_COST_REPORT.md.
