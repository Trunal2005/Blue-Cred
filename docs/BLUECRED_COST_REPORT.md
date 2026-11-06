# Zero-cost report — Phase 2, 6 November 2026

**Additional financial expenditure: ₹0. No new billable resource introduced.** No billing activation, paid API, paid dataset, paid GPU, cloud compute, hosted inference, subscription, purchase, paid credits, mainnet transaction, production deployment or plan upgrade. Existing local hardware and existing Codex access only.

## Current project-local Python environment

All packages below are free/open-source and cost ₹0. Exact resolved versions are in ml-environment-lock.txt. PyArrow was added in Phase 2 only to inspect the suggested fallback Parquet; it is not required by the GMW inference path. No system-wide packages installed/overwritten. CPU PyTorch retained; no CUDA package purchase or install.

| Dependency/version | Cost |
| --- | --- |
| affine==3.0.1 | ₹0 |
| annotated-doc==0.0.5 | ₹0 |
| annotated-types==0.8.0 | ₹0 |
| anyio==4.16.0 | ₹0 |
| attrs==26.1.0 | ₹0 |
| certifi==2026.10.23 | ₹0 |
| click==8.5.0 | ₹0 |
| fastapi==0.162.0 | ₹0 |
| filelock==4.2.4 | ₹0 |
| fsspec==2026.9.0 | ₹0 |
| h11==0.16.0 | ₹0 |
| httpcore==1.0.9 | ₹0 |
| httpx==0.28.1 | ₹0 |
| idna==3.20 | ₹0 |
| Jinja2==3.1.6 | ₹0 |
| MarkupSafe==3.0.3 | ₹0 |
| mpmath==1.3.0 | ₹0 |
| networkx==3.7 | ₹0 |
| numpy==2.5.4 | ₹0 |
| opentelemetry-api==1.45.2 | ₹0 |
| pillow==13.0.0 | ₹0 |
| pyarrow==26.0.1 | ₹0 |
| pydantic==2.14.3 | ₹0 |
| pydantic_core==2.50.4 | ₹0 |
| pyparsing==3.3.3 | ₹0 |
| python-multipart==0.0.33 | ₹0 |
| rasterio==1.5.2 | ₹0 |
| setuptools==78.1.0 | ₹0 |
| starlette==1.10.0 | ₹0 |
| sympy==1.14.0 | ₹0 |
| torch==2.15.0+cpu | ₹0 |
| typing-inspection==0.4.5 | ₹0 |
| typing_extensions==4.16.0 | ₹0 |
| uvicorn==0.54.0 | ₹0 |

## JavaScript dependencies

Phase 2 targeted migration: Next.js and eslint-config-next **15.5.29**, retaining React 18.3.1 and React Leaflet 4.2.1. New test dependency **@playwright/test 1.65.0**, plus its free playwright/playwright-core packages. Existing installed Chrome was used; no browser download or paid test service. Earlier Leaflet type/jsPDF compatibility fixes are retained. No force/legacy-peer installation or blind package update.

All cumulative new lockfile entries relative to original 357f05f (including transitives):

| Package path | Version | Cost |
| --- | --- | --- |
| node_modules/@img/colour | 1.1.0 | ₹0 |
| node_modules/@img/sharp-darwin-arm64 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-darwin-x64 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-freebsd-wasm32 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-libvips-darwin-arm64 | 1.3.4 | ₹0 |
| node_modules/@img/sharp-libvips-darwin-x64 | 1.3.4 | ₹0 |
| node_modules/@img/sharp-libvips-linux-arm | 1.3.4 | ₹0 |
| node_modules/@img/sharp-libvips-linux-arm64 | 1.3.4 | ₹0 |
| node_modules/@img/sharp-libvips-linux-ppc64 | 1.3.4 | ₹0 |
| node_modules/@img/sharp-libvips-linux-riscv64 | 1.3.4 | ₹0 |
| node_modules/@img/sharp-libvips-linux-s390x | 1.3.4 | ₹0 |
| node_modules/@img/sharp-libvips-linux-x64 | 1.3.4 | ₹0 |
| node_modules/@img/sharp-libvips-linuxmusl-arm64 | 1.3.4 | ₹0 |
| node_modules/@img/sharp-libvips-linuxmusl-x64 | 1.3.4 | ₹0 |
| node_modules/@img/sharp-linux-arm | 0.35.5 | ₹0 |
| node_modules/@img/sharp-linux-arm64 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-linux-ppc64 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-linux-riscv64 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-linux-s390x | 0.35.5 | ₹0 |
| node_modules/@img/sharp-linux-x64 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-linuxmusl-arm64 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-linuxmusl-x64 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-wasm32 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-webcontainers-wasm32 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-win32-arm64 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-win32-ia32 | 0.35.5 | ₹0 |
| node_modules/@img/sharp-win32-x64 | 0.35.5 | ₹0 |
| node_modules/@next/eslint-plugin-next/node_modules/fast-glob | 3.3.1 | ₹0 |
| node_modules/@next/eslint-plugin-next/node_modules/glob-parent | 5.1.2 | ₹0 |
| node_modules/@playwright/test | 1.65.0 | ₹0 |
| node_modules/@types/geojson | 7946.0.16 | ₹0 |
| node_modules/@types/leaflet | 1.9.21 | ₹0 |
| node_modules/@typescript-eslint/eslint-plugin | 8.72.1 | ₹0 |
| node_modules/@typescript-eslint/eslint-plugin/node_modules/ignore | 7.0.14 | ₹0 |
| node_modules/@typescript-eslint/project-service | 8.72.1 | ₹0 |
| node_modules/@typescript-eslint/tsconfig-utils | 8.72.1 | ₹0 |
| node_modules/@typescript-eslint/type-utils | 8.72.1 | ₹0 |
| node_modules/@typescript-eslint/typescript-estree/node_modules/balanced-match | 4.0.4 | ₹0 |
| node_modules/@typescript-eslint/utils | 8.72.1 | ₹0 |
| node_modules/@typescript-eslint/visitor-keys/node_modules/eslint-visitor-keys | 5.0.1 | ₹0 |
| node_modules/detect-libc | 2.1.2 | ₹0 |
| node_modules/playwright | 1.65.0 | ₹0 |
| node_modules/playwright-core | 1.65.0 | ₹0 |
| node_modules/sharp | 0.35.5 | ₹0 |

Other cumulative resolved-version changes (all ₹0):

- `node_modules/@emnapi/runtime`: 1.8.1 → 1.11.3.
- `node_modules/@next/env`: 14.2.3 → 15.5.29.
- `node_modules/@next/eslint-plugin-next`: 14.2.3 → 15.5.29.
- `node_modules/@next/swc-darwin-arm64`: 14.2.3 → 15.5.29.
- `node_modules/@next/swc-darwin-x64`: 14.2.3 → 15.5.29.
- `node_modules/@next/swc-linux-arm64-gnu`: 14.2.3 → 15.5.29.
- `node_modules/@next/swc-linux-arm64-musl`: 14.2.3 → 15.5.29.
- `node_modules/@next/swc-linux-x64-gnu`: 14.2.3 → 15.5.29.
- `node_modules/@next/swc-linux-x64-musl`: 14.2.3 → 15.5.29.
- `node_modules/@next/swc-win32-arm64-msvc`: 14.2.3 → 15.5.29.
- `node_modules/@next/swc-win32-x64-msvc`: 14.2.3 → 15.5.29.
- `node_modules/@react-leaflet/core`: 3.0.0 → 2.1.0.
- `node_modules/@swc/helpers`: 0.5.5 → 0.5.15.
- `node_modules/@typescript-eslint/parser`: 7.2.0 → 8.72.1.
- `node_modules/@typescript-eslint/scope-manager`: 7.2.0 → 8.72.1.
- `node_modules/@typescript-eslint/types`: 7.2.0 → 8.72.1.
- `node_modules/@typescript-eslint/typescript-estree`: 7.2.0 → 8.72.1.
- `node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion`: 2.0.2 → 5.0.12.
- `node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch`: 9.0.3 → 10.2.6.
- `node_modules/@typescript-eslint/visitor-keys`: 7.2.0 → 8.72.1.
- `node_modules/eslint-config-next`: 14.2.3 → 15.5.29.
- `node_modules/eslint-plugin-react-hooks`: 5.0.0-canary-7118f5dd7-20230705 → 5.2.0.
- `node_modules/jspdf`: 4.2.0 → 4.2.1.
- `node_modules/next`: 14.2.3 → 15.5.29.
- `node_modules/react-leaflet`: 5.0.0 → 4.2.1.
- `node_modules/semver`: 7.7.4 → 7.8.6.
- `node_modules/styled-jsx`: 5.1.1 → 5.1.6.
- `node_modules/ts-api-utils`: 1.4.3 → 2.5.0.

## Data, tools and services actually used

| Item | Actual use | Additional cost |
| --- | --- | --- |
| Global Mangrove Watch 2020 v4.0.19 | Public CC BY 4.0 archive, 180,055,707 bytes, publisher MD5 verified | ₹0 |
| ESA/VITO WorldCover 2020 Sentinel-2 annual composites | Anonymous HTTPS COG range reads; 145 candidate window reads →144 real pairs; no complete imagery tiles | ₹0 |
| Public WorldCover object hosting on AWS | Official registry explicitly account-free, non-Requester-Pays. No account/credential/CLI subscription/resource created. Hosting is provider-sponsored public data, not rented compute | ₹0 |
| nikolkoo/SatelliteSegmentation fallback | Public CC BY 4.0 Parquet, 93,617,398 bytes; inspected, not used for training | ₹0 |
| Prior Allen AI annotation archive | Existing 62,433,280-byte local annotation-only data, not trained on | ₹0 |
| MANGO | Gated; no retry loop, terms acceptance, bypass or full archive download | ₹0 |
| Synthetic fixtures | Temporary software tests only; not scientific training data | ₹0 |
| Python/PyTorch training and FastAPI service | Existing CPU, 2 threads, bounded experiment; no GPU/cloud rental | ₹0 |
| Git, PowerShell, Node/npm, TypeScript, ESLint, unittest, nvidia-smi, Windows memory API | Existing/free local tools; local checkpoint/migration commits only | ₹0 |
| Playwright / existing Chrome | Isolated actual-browser validation, no external paid testing platform | ₹0 |
| pypdf, PyMuPDF (fitz), Pillow | Already installed free local tools; read-only fixture PDF pixel comparison/rendering | ₹0 |
| PDF skill | Local read-only visual/pixel QA; no artifact service or purchase | ₹0 |
| Google Fonts Inter | Existing free font build dependency, public fetch/cache; no paid typography service | ₹0 |
| npm/PyPI/PyTorch indexes and advisories, Zenodo, publisher documentation, public data URLs | Public downloads/metadata only, no billing or account activation | ₹0 |
| Local web/ML test servers | Loopback-only, temporary/test-owned processes stopped afterward | ₹0 |
| Appwrite / production storage/database | No live project calls, uploads, schema/permission/data writes, plan changes or production validation. Browser account/data responses are explicit fixtures | ₹0 billable resources |
| WalletConnect legacy configuration lookup | Phase 1 initial build made an unauthenticated config lookup before the injected-only default was introduced; no account/billing activated, subsequently avoided | ₹0 |
| Blockchain/RPC | Writes default disabled; test transport mocked; no live read/transaction/gas operation | ₹0 gas |
| Codex/web research | Existing access only; no API execution, purchase, subscription/credit upgrade recommended | No added resource |

Exact COG transfer bytes were not instrumented; source window counts and written data hashes are recorded rather than fabricated download totals. All datasets, virtual environments, weights and large fixture PDFs remain ignored/local. No private data were uploaded. Unknown cloud usage costs were avoided through network interception/mocks and no production mutations. The low-quality model is honestly reported; no paid workaround or fabricated result was used.
