# Blue-Cred technical audit — 6 November 2026

Baseline: clean `main`, commit `357f05f`; work branch `feature/bluecred-cnn-performance`. No production calls, data changes, transactions, deployment or push authorized or executed.

## Verified architecture

`frontend` is Next.js 14.2.3 App Router / React 18.3.1. Pages use Appwrite browser SDK directly; no existing server API routes. GlobalState loads account session and keeps a locally selected display role. RainbowKit/Wagmi wrap every route. Submit uploads images, creates a project document, optionally broadcasts a transaction. Registry, impact, verifier, admin and portfolio query Appwrite. Maps use Leaflet; impact uses Chart.js. Certificate rasterizes a DOM node into jsPDF. Root Hardhat 3 / Solidity ERC1155 contract uses OpenZeppelin AccessControl. Contract source is unchanged.

## Baseline evidence and minimal remedies

| Severity | Evidence / reproduction | Cause and remedy | Risk / validation |
| --- | --- | --- | --- |
| Blocking | `cd frontend; npm run build`, saved in performance/baseline-build.txt | Certificate uses hooks without `use client`; add directive | Low; build and route test |
| Blocking | `npx --no-install tsc --noEmit`: TS7016 in SubmitMap | Missing Leaflet declarations; add @types/leaflet | Low; typecheck |
| High | package/installed react-leaflet 5 requires React 19; actual React 18 | Pin compatible 4.2.1, retain React 18 | Map behavior needs browser validation |
| High | lib/wagmi.ts hardcodes provider credential | Remove fallback; local RPC default; recommend rotation of historical credential | External connection configuration changes explicitly documented |
| High | .env.example and scripts use NEXT_PUBLIC_APPWRITE_API_KEY | Rename script-only secret to APPWRITE_API_KEY | Existing local secret env requires manual migration; never read or copied |
| Critical | init-appwrite.js grants any user update/delete; admin gate is a bundled password; roles are browser localStorage | Remote permissions cannot be verified safely under zero-cost restriction. Disable provisioning unless explicitly enabled locally; remove password authentication claim; require server-controlled account label for admin UI. Database permissions remain mandatory | Existing insecure remote permissions require separately authorized remediation; UI is not a security boundary |
| High | verifier fabricates hash without wallet, derives chain project ID from arbitrary database ID, reports success before confirmation | Remove fabricated minting; require explicit stored chain mapping and confirmed receipt | Legacy records cannot mint until real mapping exists |
| Medium | impact and nested EcosystemMap each call same project list; default SDK pagination silently truncates summaries | Pass fetched records to map (one request); label existing partial-summary limitation | Mock request benchmark; full data pagination deferred to avoid added cloud consumption |
| Medium | SubmitMap empty-dependency cleanup captures initial null map; asynchronous import can initialize after unmount | Ref-based map lifetime with cancellation and cleanup | Typecheck; lifecycle review |
| Medium | submit creates object URLs without unmount cleanup | Track/revoke URLs on unmount | Local component validation |
| Medium | certificate eagerly imports PDF libraries | Load libraries only on download | Build route-bundle comparison where baseline available |
| High | unknown map coordinates generated randomly | Omit markers without real valid coordinates | Existing inaccurate guessed markers intentionally removed |

## Baseline environment / boundaries

Windows PowerShell, Node 20.19.4 / npm 10.8.2, Python 3.13.5; 16 CPU threads; RAM 16.83 GB total, 3.56 GB available at inspection; disk ~369 GB free; RTX 3050 4 GB, driver 592.27. CIM hardware queries denied; Windows memory API and nvidia-smi used. No PyTorch, rasterio, local training pairs, existing test suite or ESLint configuration found. CPU PyTorch chosen to avoid large CUDA installation under low available RAM. Public dataset research uses web sources, never remote code execution.

External Appwrite/RPC latency, deployed permissions, auth, wallet and storage were deliberately not probed: existing plan/usage costs cannot be verified. No production env files edited. No blanket dependency upgrade.

## Rollback

Changes are uncommitted on a separate branch. Review `git diff` and the final changed-file manifest. Reverse selected patches after saving desired work; do not use reset/clean. ML data, environment and generated checkpoints are ignored and can be retained independently. No persisted external data or contract changes require rollback.

## Implemented outcome and remaining risks

The build directive/type/compatibility issues above were fixed. Certificate dependencies now load on download; impact passes its fetched snapshot to the map (mocked request count 2 → 1); SubmitMap uses refs/cancelled imports/cleanup; evidence URLs are revoked; random/guessed map positions and fabricated submission IPFS IDs were removed. Optional stateless local ML integration is in the existing evidence step. The pipeline has nine passing software tests and an actual loopback readiness smoke test, but no real paired dataset or trained model.

Admin password bypass was replaced with a server-controlled account-label check; verifier also checks that label. These frontend guards do **not** secure a misconfigured remote database. Appwrite provisioning is gated but its legacy broad permissions remain in source: do not enable/run it without redesign/review and separate authorization. Existing remote grants were not read or changed. Existing local secret configuration must manually migrate script credentials to APPWRITE_API_KEY; rotate any credential previously exposed via a public variable or the historical hardcoded RPC fallback.

Marketplace source inspection confirmed all current listings are hardcoded demos. They are now disclosed and cannot create purchase records. This was previously capable of persisting a transaction against a nonexistent demo project; no such write was executed while testing. Real payment/transfer/credit retirement is not implemented or verified by this work. Legacy verifier records lack a proven onChainProjectId; minting correctly refuses guessed IDs. Writes default to disabled, testnet allowlist is enforced, and hook waits for a successful receipt. Remote transaction/database atomicity and reconciliation after a confirmed transaction followed by a database failure still need a separately designed backend workflow; do not enable production issuance.

Dependency audit: React 18.3.1 / React Leaflet 4.2.1 now compatible; @types/leaflet added. Next and eslint-config-next moved to 14.2.35 and jsPDF to 4.2.1. **65 npm advisories remain (1 critical, 34 high, 28 moderate, 2 low)** in the complete dependency graph. The remaining critical package is Next: current advisories require a newer framework major, outside a minimal patch migration. This branch is **not safe to call production-ready**. Full initial/final advisory JSON is under performance/. Do not deploy based solely on passing build checks.

Production build, TypeScript and lint pass (lint has warnings). Optional connector build warnings reference missing pino-pretty / React Native async storage; they did not block compilation. Google Fonts required a free public fetch once; subsequent builds reused cached font assets. An initial WalletConnect config lookup was observed during prerendering; the default now explicitly uses the injected browser connector to prevent automatic relay configuration traffic. No provider-account request, deployed Appwrite inspection or live blockchain test was performed.

Remaining data/performance limitations: Appwrite lists still use SDK default pagination, so registry/impact summaries can omit records beyond the first page; this is documented rather than increasing cloud requests under an unverified plan. Search/filter controls, external failure states, full auth/ownership behavior, mobile interactions, map gestures, PDF visual layout and browser rendering were not comprehensively exercised. Final HTTP smoke checks validate route rendering/status only. Dataset and scientific limitations are in the model/dataset cards; no project is automatically verified from predictions.
