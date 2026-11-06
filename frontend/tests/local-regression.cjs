// Execute actual transpiled modules with explicit SDK mocks; no external requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const cp = require('node:child_process');
const ts = require('typescript');

function moduleFrom(source, dependencies, extras = {}) {
  const exports = {};
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(output, { exports, require: name => dependencies[name] || {}, console, process, AbortSignal, Uint8Array, ...extras });
  return exports;
}

async function queryCount(baseline) {
  let calls = 0;
  const sdk = { databases: { listDocuments: async () => { calls++; return { documents: [] }; } } };
  for (const path of ['src/app/impact/page.tsx', 'src/app/components/EcosystemMap.tsx']) {
    const effects = [];
    const source = baseline ? cp.execFileSync('git', ['show', `357f05f:frontend/${path}`], { encoding: 'utf8' }) : fs.readFileSync(path, 'utf8');
    const noop = () => null;
    const component = moduleFrom(source, {
      react: { useState: value => [value, noop], useEffect: fn => effects.push(fn) },
      'react/jsx-runtime': { jsx: noop, jsxs: noop },
      'chart.js': { Chart: { register: noop } },
      'next/dynamic': { __esModule: true, default: noop },
      leaflet: { __esModule: true, default: { Icon: class {} } },
      '@/lib/appwrite': sdk,
    });
    component.default({ projects: [] });
    effects.forEach(fn => fn());
    await new Promise(resolve => setImmediate(resolve));
  }
  return calls;
}

async function apiTests() {
  let fetches = 0;
  const route = moduleFrom(fs.readFileSync('src/app/api/analysis/route.ts', 'utf8'), {
    'next/server': { NextResponse: { json: (body, options) => Response.json(body, options) } },
  }, { fetch: async () => { fetches++; throw new Error('mock service unavailable'); } });
  const env = { ...process.env };
  try {
    delete process.env.BLUECRED_ML_ENABLED;
    const req = (host = 'localhost:3000', origin, body) => new Request(`http://${host}/api/analysis`, {
      method: body ? 'POST' : 'GET', headers: { host, ...(origin ? { origin } : {}), 'content-type': 'image/png' }, body,
    });
    assert.equal((await route.GET(req())).status, 503);
    process.env.BLUECRED_ML_ENABLED = 'true'; process.env.BLUECRED_ML_TOKEN = 'local-test-only-token-1234567890';
    assert.equal((await route.GET(req('example.com'))).status, 503);
    assert.equal((await route.GET(req('localhost:3000', 'https://attacker.example'))).status, 503);
    assert.equal(fetches, 0);
    assert.equal((await route.GET(req())).status, 503);
    assert.equal(fetches, 1);
    assert.equal((await route.POST(req('localhost:3000', undefined, new Uint8Array(8*1024*1024+1)))).status, 413);
    assert.equal(fetches, 1);
    return 6;
  } finally {
    Object.keys(process.env).forEach(key => { if (!(key in env)) delete process.env[key]; });
    Object.assign(process.env, env);
  }
}

async function transactionTests() {
  let writes = 0, chainId = 1, status = 'success';
  const previous = process.env.NEXT_PUBLIC_ENABLE_TESTNET_WRITES;
  const hook = moduleFrom(fs.readFileSync('src/lib/useBlueCredContract.ts', 'utf8'), {
    react: { useState: () => [undefined, () => {}] },
    './contract': { CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000001', CONTRACT_ABI: [] },
    wagmi: {
      useAccount: () => ({ address: '0x1', isConnected: true, chainId }),
      usePublicClient: () => ({ waitForTransactionReceipt: async () => ({ status }) }),
      useWaitForTransactionReceipt: () => ({}), useReadContract: () => ({}),
      useWriteContract: () => ({ writeContractAsync: async () => { writes++; return '0x123'; } }),
    },
  });
  try {
    delete process.env.NEXT_PUBLIC_ENABLE_TESTNET_WRITES;
    await assert.rejects(hook.useBlueCredContract().submitProjectOnChain('name', 'site'), /disabled/);
    process.env.NEXT_PUBLIC_ENABLE_TESTNET_WRITES = 'true';
    await assert.rejects(hook.useBlueCredContract().submitProjectOnChain('name', 'site'), /Only/);
    assert.equal(writes, 0);
    chainId = 31337; status = 'reverted';
    await assert.rejects(hook.useBlueCredContract().submitProjectOnChain('name', 'site'), /reverted/);
    status = 'success';
    assert.equal(await hook.useBlueCredContract().submitProjectOnChain('name', 'site'), '0x123');
    assert.equal(writes, 2);
    return 4;
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_ENABLE_TESTNET_WRITES;
    else process.env.NEXT_PUBLIC_ENABLE_TESTNET_WRITES = previous;
  }
}

(async () => {
  const before = await queryCount(true), after = await queryCount(false);
  assert.equal(before, 2); assert.equal(after, 1);
  const apiChecks = await apiTests();
  const transactionChecks = await transactionTests();
  console.log(JSON.stringify({ impact_mock_project_list_calls: { baseline: before, final: after, reduction_percent: 50 }, api_checks_passed: apiChecks, mocked_transaction_checks_passed: transactionChecks,
    scope: 'Actual component effects and API handlers with mocked SDK/transport. No page timing or external integration claim.' }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
