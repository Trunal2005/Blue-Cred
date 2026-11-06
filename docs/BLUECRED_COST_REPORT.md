# Zero-cost report — 6 November 2026

Additional service/software/dataset spend: **₹0**. **No new billable resource was introduced.** No paid API, hosted inference, GPU rental, billing activation, subscription, purchase, mainnet operation, production deployment or plan upgrade occurred. Work used the existing computer and existing Codex access. No free trial or potentially charging free-compute service was activated.

## New local Python environment

All resolved packages below were installed only into `ml/.venv`, are free/open-source dependencies from PyPI and the PyTorch CPU index, and cost ₹0. `docs/ml-environment-lock.txt` is the exact version record. `requirements.txt` contains supported ranges and the exact CPU Torch version.

| Package/version | Cost |
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

## JavaScript package changes

New direct development dependency: `@types/leaflet` (₹0). Existing React Leaflet moved 5.0.0 → 4.2.1 for React 18; Next/eslint-config-next 14.2.3 → 14.2.35 and jsPDF 4.2.0 → 4.2.1 for focused advisory remediation (all ₹0). No blanket update or force-install was used. New lockfile entries, including transitives:

| New lockfile package | Version | Cost |
| --- | --- | --- |
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

Other resolved lockfile version changes (all ₹0):

- `node_modules/@isaacs/cliui/node_modules/ansi-regex`: 6.2.2 → 6.5.0.
- `node_modules/@next/env`: 14.2.3 → 14.2.35.
- `node_modules/@next/eslint-plugin-next`: 14.2.3 → 14.2.35.
- `node_modules/@next/swc-darwin-arm64`: 14.2.3 → 14.2.33.
- `node_modules/@next/swc-darwin-x64`: 14.2.3 → 14.2.33.
- `node_modules/@next/swc-linux-arm64-gnu`: 14.2.3 → 14.2.33.
- `node_modules/@next/swc-linux-arm64-musl`: 14.2.3 → 14.2.33.
- `node_modules/@next/swc-linux-x64-gnu`: 14.2.3 → 14.2.33.
- `node_modules/@next/swc-linux-x64-musl`: 14.2.3 → 14.2.33.
- `node_modules/@next/swc-win32-arm64-msvc`: 14.2.3 → 14.2.33.
- `node_modules/@next/swc-win32-ia32-msvc`: 14.2.3 → 14.2.33.
- `node_modules/@next/swc-win32-x64-msvc`: 14.2.3 → 14.2.33.
- `node_modules/@react-leaflet/core`: 3.0.0 → 2.1.0.
- `node_modules/@typescript-eslint/parser`: 7.2.0 → 8.72.1.
- `node_modules/@typescript-eslint/scope-manager`: 7.2.0 → 8.72.1.
- `node_modules/@typescript-eslint/types`: 7.2.0 → 8.72.1.
- `node_modules/@typescript-eslint/typescript-estree`: 7.2.0 → 8.72.1.
- `node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion`: 2.0.2 → 5.0.12.
- `node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch`: 9.0.3 → 10.2.6.
- `node_modules/@typescript-eslint/visitor-keys`: 7.2.0 → 8.72.1.
- `node_modules/eslint-config-next`: 14.2.3 → 14.2.35.
- `node_modules/glob/node_modules/brace-expansion`: 2.0.2 → 2.1.7.
- `node_modules/jspdf`: 4.2.0 → 4.2.1.
- `node_modules/next`: 14.2.3 → 14.2.35.
- `node_modules/react-leaflet`: 5.0.0 → 4.2.1.
- `node_modules/string-width/node_modules/ansi-regex`: 6.2.2 → 6.5.0.
- `node_modules/ts-api-utils`: 1.4.3 → 2.5.0.
- `node_modules/wrap-ansi/node_modules/ansi-regex`: 6.2.2 → 6.5.0.

## Datasets, tools and services

| Item | Use | Cost |
| --- | --- | --- |
| Allen AI OlmoEarth mangrove annotation archive | Public CC BY 4.0 static download, 62.4 MB; inspected only, no imagery/training | ₹0 |
| MANGO metadata | Public file listing and dataset/paper research; archive requests returned HTTP 401; no paired data acquired | ₹0 |
| Synthetic fixtures | Temporary local software tests only; not a scientific dataset or shipped model | ₹0 |
| Git, Node/npm, Python, PowerShell, nvidia-smi | Existing local tools | ₹0 |
| unittest, TypeScript, ESLint, mocked regression harness | Local validation; existing tools plus free dependencies listed above | ₹0 |
| Uvicorn/FastAPI loopback service | Existing hardware only; temporary readiness test stopped; no hosted service | ₹0 |
| Next production HTTP server | Existing hardware only; temporary smoke server stopped | ₹0 |
| PyPI, PyTorch index, npm registry/advisories, Hugging Face, GitHub/publisher pages | Public package/static file/documentation access, no account or billing activation | ₹0 |
| Google Fonts Inter | Existing Next font build dependency; fetched once for build, then reused cached; open-source font | ₹0 |
| Appwrite / deployment provider | No project API operations, schema changes, storage upload, plan changes or deployment executed | ₹0 additional billable resources |
| Blockchain/RPC | No live read or transaction test; defaults changed to local endpoint; transaction tests use mocks | ₹0 gas |
| WalletConnect configuration | Existing connector attempted unauthenticated config lookup during initial build; no account/billing activated. Default subsequently changed to injected browser wallet to avoid these requests | ₹0 billable resources |
| Codex/web research tools | Existing access only; no separate API execution or credit purchase | No added subscription/resource |

Remote Appwrite/RPC account usage and plan limits were not queried because possible charges could not be established as zero. No local secret env files were opened/copied/modified. No payment information was requested. Real CNN training remains blocked by legitimate paired-data availability; no paid workaround was used.
