// Local HTTP smoke only: does not run browser effects or call Appwrite/RPC.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const port = 13087;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], {
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', BLUECRED_ML_ENABLED: 'false' }, stdio: 'ignore', windowsHide: true,
});
(async () => {
  try {
    for (let i = 0; i < 80; i++) {
      try { await fetch(`http://127.0.0.1:${port}`); break; }
      catch { await new Promise(resolve => setTimeout(resolve, 250)); }
    }
    const routes = ['/', '/login', '/submit', '/projects', '/projects/smoke', '/my-projects', '/impact', '/marketplace', '/verifier', '/admin', '/company/portfolio', '/company/transactions', '/certificate/smoke', '/api/analysis'];
    const results = [];
    for (const route of routes) {
      const samples = [];
      for (let repeat = 0; repeat < 5; repeat++) {
        const start = performance.now();
        const response = await fetch(`http://127.0.0.1:${port}${route}`);
        const headersMs = performance.now() - start;
        await response.text();
        assert.equal(response.status, route === '/api/analysis' ? 503 : 200);
        samples.push(headersMs);
      }
      results.push({ route, expected_status: route === '/api/analysis' ? 503 : 200,
        median_headers_ms: samples.slice().sort((a, b) => a-b)[2], samples_headers_ms: samples });
    }
    fs.writeFileSync('../docs/performance/production-http-smoke.json', JSON.stringify({ methodology: 'Local Next production server, sequential HTTP GET, 5 samples per route; no browser rendering, no external integration; headers timing includes localhost transport.', results }, null, 2));
    console.log(`PASS ${routes.length} local production routes; API disabled safely.`);
  } finally { server.kill(); }
})().catch(error => { console.error(error); server.kill(); process.exitCode = 1; });
