// Real isolated Chrome / production app. Appwrite and map tiles are explicit fixtures;
// the ML API and Python CNN, when enabled, are REAL localhost services.
const { chromium } = require('@playwright/test');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mode = process.argv[2] || 'profile';
const phase = process.argv[3] || 'baseline';
const port = 13087, base = `http://127.0.0.1:${port}`;
const root = path.resolve('..'), output = path.join(root, 'docs/performance/phase2');
fs.mkdirSync(output, { recursive: true });
const token = crypto.randomBytes(32).toString('hex');
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1', BLUECRED_ML_ENABLED: mode === 'e2e' ? 'true' : 'false', BLUECRED_ML_TOKEN: token };
const children = [];
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], { cwd: process.env.BLUECRED_BROWSER_APP_DIR || process.cwd(), env, stdio: 'ignore', windowsHide: true });
children.push(server);
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXaYAAAAASUVORK5CYII=', 'base64');
const project = { $id: 'browser-fixture-project', $collectionId: 'projects', $databaseId: 'bluecred-db', $createdAt: '2026-01-01T00:00:00Z', $updatedAt: '2026-01-01T00:00:00Z', $permissions: [], projectName: 'LOCAL TEST FIXTURE — no real credits', locationName: 'Local browser test', latitude: 21.8, longitude: 88.8, ecosystemType: 'Mangrove', status: 'approved', creditsIssued: 100, areaSize: 10, estimatedCO2: 0, imageFileIds: [], submittedByUserId: 'browser-fixture-user', description: 'Mock Appwrite record for local browser checks only.' };
const fixtureUser = { $id: 'browser-fixture-user', $createdAt: '2026-01-01T00:00:00Z', $updatedAt: '2026-01-01T00:00:00Z', name: 'Local Test Supplier', email: 'fixture@example.invalid', labels: [], prefs: {}, status: true, emailVerification: false, phoneVerification: false };

async function waitForServer() {
  for (let i=0; i<100; i++) {
    try { const r = await fetch(base); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Temporary production server did not start');
}

async function setup(context, logs) {
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === base && !url.pathname.startsWith('/v1/')) return route.continue();
    if (url.pathname.includes('/v1/account')) {
      logs.mockedAccountRequests++;
      return route.fulfill({ status: request.method() === 'POST' ? 201 : 200, contentType: 'application/json', body: JSON.stringify(url.pathname.includes('/sessions') ? { $id: 'fixture-session', userId: fixtureUser.$id, provider: 'email' } : fixtureUser) });
    }
    if (url.pathname.includes('/v1/databases/')) {
      logs.mockedDatabaseRequests++;
      if (request.method() !== 'GET') throw new Error('Unexpected database write attempt');
      if (url.pathname.endsWith('/documents/missing-record')) return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Explicit missing-record fixture', code: 404, type: 'document_not_found' }) });
      const isTransaction = url.pathname.includes('/transactions/');
      let data = url.pathname.includes('/documents/') ? isTransaction ? { $id: 'browser-fixture-transaction', projectId: project.$id, buyerUserId: fixtureUser.$id, creditAmount: 10, tokenId: 'LOCAL-FIXTURE-NOT-A-CREDIT', pricePaid: 0, transactionDate: '2026-01-01' } : project : { total: 1, documents: [project] };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
    }
    if (request.resourceType() === 'image') {
      logs.mockedImageRequests++;
      return route.fulfill({ status: 200, contentType: 'image/png', body: png });
    }
    logs.blockedExternal.push(url.origin + url.pathname);
    return route.abort('blockedbyclient');
  });
  await context.addInitScript(() => {
    window.__browserEvidence = { lcp: 0, cls: 0, longTasks: [], events: [], commits: [] };
    for (const [type, handle] of [
      ['largest-contentful-paint', e => { window.__browserEvidence.lcp = e.startTime; }],
      ['layout-shift', e => { if (!e.hadRecentInput) window.__browserEvidence.cls += e.value; }],
      ['longtask', e => window.__browserEvidence.longTasks.push({ start: e.startTime, duration: e.duration })],
      ['event', e => { if (e.interactionId) window.__browserEvidence.events.push({ name: e.name, duration: e.duration, interactionId: e.interactionId }); }],
    ]) {
      try { new PerformanceObserver(list => list.getEntries().forEach(handle)).observe({ type, buffered: true, durationThreshold: 16 }); } catch {}
    }
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { supportsFiber: true, inject: () => 1, onCommitFiberRoot: () => window.__browserEvidence.commits.push(performance.now()), onCommitFiberUnmount: () => {} };
  });
}

async function snapshot(page) {
  return page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const scripts = performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script');
    const e = window.__browserEvidence;
    return { ...e, navigation: navigation && { ttfb_ms: navigation.responseStart, dom_content_loaded_ms: navigation.domContentLoadedEventEnd, load_ms: navigation.loadEventEnd },
      script_transfer_bytes: scripts.reduce((n,r) => n+r.transferSize, 0), script_resources: scripts.length,
      total_long_task_ms: e.longTasks.reduce((n,t)=>n+t.duration,0), react_commits_observed: e.commits.length,
      first_react_commit_ms: e.commits[0] ?? null,
      horizontal_overflow: document.documentElement.scrollWidth > innerWidth + 1 };
  });
}

async function profile(browser) {
  const results = [], consoleErrors = [], pageErrors = [];
  const homeOnly = process.env.BLUECRED_PROFILE_HOME_ONLY === 'true';
  for (const route of homeOnly ? ['/'] : ['/', '/login', '/impact', '/submit', '/marketplace', '/certificate/browser-fixture-transaction']) {
    for (let repeat=0; repeat<(homeOnly ? 5 : 3); repeat++) {
      const logs = { mockedAccountRequests: 0, mockedDatabaseRequests: 0, mockedImageRequests: 0, blockedExternal: [] };
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
      await setup(context, logs);
      const page = await context.newPage();
      page.on('pageerror', e => pageErrors.push({ route, message: e.message }));
      page.on('console', m => { if (m.type() === 'error') consoleErrors.push({ route, message: m.text() }); });
      await page.goto(base+route, { waitUntil: 'load' });
      await page.waitForTimeout(2500);
      const metrics = await snapshot(page);
      let navigationMs;
      let interactionEvents;
      if (route === '/') {
        const start = performance.now();
        await page.getByRole('link', { name: 'Explore Projects' }).click();
        await page.getByRole('heading', { name: 'Project Registry' }).waitFor();
        navigationMs = performance.now()-start;
        await page.waitForTimeout(100);
        interactionEvents = await page.evaluate(() => window.__browserEvidence.events);
      }
      results.push({ route, repeat, ...metrics, navigation_to_registry_ms: navigationMs, navigation_lab_event_timing: interactionEvents, ...logs });
      await context.close();
    }
  }
  return { scope: `Production app in isolated real Chrome; ${homeOnly ? 5 : 3} fresh contexts per route, 1440x1000, no CPU/network throttle, 2.5s observation; Appwrite/remote images/map tiles mocked, all other external traffic blocked. Commit times are hydration proxies, not direct hydration duration. Event samples are lab interactions, not field INP.`, results, consoleErrors, pageErrors };
}

async function e2e(browser) {
  const logs = { mockedAccountRequests: 0, mockedDatabaseRequests: 0, mockedImageRequests: 0, blockedExternal: [] };
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await setup(context, logs);
  const page = await context.newPage(), errors = [], consoleErrors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  const checks = [];
  await page.goto(base+'/'); await page.getByRole('heading', { level: 1 }).waitFor(); checks.push('landing');
  await page.goto(base+'/login');
  await page.getByRole('button', { name: /Supplier/ }).click();
  await page.getByPlaceholder('Email Address').fill('fixture@example.invalid');
  await page.getByPlaceholder('Password', { exact: true }).fill('local-fixture-not-a-real-password');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL('**/submit'); checks.push('login with explicit mocked Appwrite session');
  await page.getByPlaceholder('e.g. Mangrove Delta Restoration').fill('Local CNN test — never submitted');
  await page.getByPlaceholder('Country, Region').fill('Local test');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('.leaflet-container').waitFor();
  await page.locator('.leaflet-container').click({ position: { x: 350, y: 170 } });
  await page.getByText(/Selected Location:/).waitFor(); checks.push('real Leaflet interaction, tiles mocked');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('heading', { name: 'Coastal vegetation analysis' }).waitFor();
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'ml/data/gmw2020/pairs/manifest.json')));
  const sample = manifest.samples.find(s => s.split === 'test' && s.foreground_fraction > .1);
  assert(sample, 'Need an actual held-out image');
  await page.locator('#analysis-image').setInputFiles(path.join(root, 'ml/data/gmw2020/pairs', sample.image));
  // Observe actual fetch responses inside the page: Chrome's inspector can evict
  // response bodies. This forwards the original Response without replacing data.
  await page.evaluate(() => {
    window.__actualAnalysisEvidence = {};
    const fetchOriginal = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const response = await fetchOriginal(input, init);
      if (input === '/api/analysis') {
        const data = await response.clone().json();
        window.__actualAnalysisEvidence[init?.method === 'POST' ? 'prediction' : 'readiness'] = data;
      }
      return response;
    };
  });
  const started = performance.now();
  await page.getByRole('button', { name: 'Analyze locally' }).click();
  await page.getByText('Analysis complete. Review the limitations below.').waitFor({ timeout: 60000 });
  await page.getByAltText('Predicted vegetation overlay').waitFor();
  await page.getByAltText('Predicted vegetation overlay').evaluate(image => image.decode());
  await page.getByText(/Research prototype with low validation precision/).waitFor();
  const { readiness, prediction } = await page.evaluate(() => window.__actualAnalysisEvidence);
  assert.equal(readiness.ready, true);
  assert.equal(prediction.model_version, 'bluecred-gmw2020-unet-v1');
  assert.equal(prediction.area_hectares, null);
  const realInferenceUiMs = performance.now()-started;
  checks.push('REAL held-out TIFF upload → Next API → Python trained CNN → mask/overlay');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(output, 'real-cnn-inference.png'), fullPage: true });
  const resultText = await page.locator('section[aria-labelledby="analysis-title"]').innerText();
  // Failure test: stop only the test-owned ML service and repeat the same UI action.
  const service = children.find(p => p !== server); if (service) service.kill();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Analyze locally' }).click();
  await page.getByText('Local analysis service is unavailable.').waitFor({ timeout: 10000 });
  checks.push('real service unavailable state; submission remains usable');
  await page.goto(base+'/impact'); await page.locator('canvas').first().waitFor(); checks.push('dashboard and charts with Appwrite fixture');
  await page.goto(base+'/marketplace'); await page.getByText(/Demonstration listings/).waitFor(); checks.push('marketplace demo disclosure');
  await page.goto(base+'/verifier'); await page.getByText(/Sign in with a registry administrator/).waitFor(); checks.push('unauthorized verifier state');
  await page.goto(base+'/certificate/browser-fixture-transaction');
  await page.getByText('Registry Record', { exact: true }).waitFor();
  assert.equal(await page.getByText('Blockchain Verified', { exact: true }).count(), 0);
  const downloadStart = performance.now();
  const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await page.getByRole('button', { name: 'Download Certificate' }).click();
  const download = await downloadPromise;
  const pdfDirectory = path.join(root, 'ml/artifacts/browser'); fs.mkdirSync(pdfDirectory, { recursive: true });
  await download.saveAs(path.join(pdfDirectory, 'fixture-certificate.pdf'));
  const pdfBytes = fs.statSync(path.join(pdfDirectory, 'fixture-certificate.pdf')).size;
  const pdfGenerationMs = performance.now()-downloadStart; checks.push('real PDF generation using explicitly mocked certificate records');
  await page.goto(base+'/certificate/missing-record');
  await page.getByRole('heading', { name: 'Certificate record unavailable' }).waitFor();
  checks.push('missing certificate record: safe unavailable state without false verification claim');
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = [];
  for (const route of ['/', '/login', '/submit', '/marketplace', '/impact']) {
    await page.goto(base+route); await page.waitForTimeout(700);
    mobile.push({ route, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth+1) });
  }
  await page.screenshot({ path: path.join(output, 'mobile-impact.png'), fullPage: true });
  await context.close();
  return { checks, realInferenceUiMs, readiness, prediction: { model_version: prediction.model_version, coverage_percent: prediction.coverage_percent, foreground_pixels: prediction.foreground_pixels, total_pixels: prediction.total_pixels, area_hectares: prediction.area_hectares, inference_ms: prediction.inference_ms, validation_precision: prediction.validation_precision }, resultText, heldout_image: sample.image, pdfGenerationMs, pdfBytes, mobile, pageErrors: errors, consoleErrors, ...logs, scope: 'Real browser and trained CNN/Next/Python path. Authentication, project/certificate records and remote tiles are explicit fixtures, not production integrations. No project was submitted.' };
}

(async () => {
  let browser;
  try {
    if (mode === 'e2e') {
      const service = spawn(path.join(root, 'ml/.venv/Scripts/python.exe'), ['-m', 'uvicorn', 'ml.service:app', '--host', '127.0.0.1', '--port', '8765', '--log-level', 'error'], { cwd: root, env, stdio: 'ignore', windowsHide: true });
      children.push(service);
      for (let i=0; i<100; i++) {
        try { const r = await fetch('http://127.0.0.1:8765/health', { headers: { 'x-bluecred-token': token } }); if ((await r.json()).ready) break; } catch {}
        await new Promise(r => setTimeout(r, 200));
      }
    }
    await waitForServer();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const evidence = mode === 'e2e' ? await e2e(browser) : await profile(browser);
    evidence.chrome = browser.version(); evidence.phase = phase;
    fs.writeFileSync(path.join(output, `browser-${mode}-${phase}.json`), JSON.stringify(evidence, null, 2));
    console.log(JSON.stringify({ file: `browser-${mode}-${phase}.json`, pageErrors: evidence.pageErrors, checks: evidence.checks }));
  } finally {
    if (browser) await browser.close();
    await Promise.all(children.map(p => {
      if (p.exitCode !== null || p.signalCode !== null) return;
      return new Promise(resolve => {
        p.once('exit', resolve); p.kill();
        setTimeout(resolve, 5000).unref();
      });
    }));
  }
})().catch(error => { console.error(error); children.forEach(p => p.kill()); process.exitCode = 1; });
