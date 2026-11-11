const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const app = require('../index');
const NotFoundView = require('../views/NotFoundView');
const {
  notFoundGuardian,
  guardian404ErrorHandler,
  buildNotFoundRedirectUrl,
  sanitizeFromPath,
  sendResourceNotFound,
  diagnoseNotFound
} = require('../middleware');

function createMockRes() {
  return {
    statusCode: 200,
    headersSent: false,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(payload) {
      this.body = payload;
      this.headersSent = true;
      return this;
    },
    json(payload) {
      this.body = payload;
      this.headersSent = true;
      return this;
    }
  };
}

test('diagnoseNotFound detects route typos and suggests closest route', () => {
  const diag = diagnoseNotFound({ method: 'GET', originalUrl: '/usres' });
  assert.strictEqual(diag.statusCode, 404);
  assert.strictEqual(diag.code, 'ROUTE_TYPO_DETECTED');
  assert.match(diag.reason, /\/users/);
  assert.strictEqual(diag.suggestion.href, '/users');
});

test('diagnoseNotFound detects HTTP method mismatch on existing routes', () => {
  const diag1 = diagnoseNotFound({ method: 'DELETE', originalUrl: '/users' });
  assert.strictEqual(diag1.code, 'METHOD_NOT_SUPPORTED');
  assert.match(diag1.reason, /HTTP DELETE/);
  assert.ok(diag1.suggestion.allowedMethods.includes('GET'));

  const diag2 = diagnoseNotFound({ method: 'POST', originalUrl: '/users/1' });
  assert.strictEqual(diag2.code, 'METHOD_NOT_SUPPORTED');
  assert.strictEqual(diag2.suggestion.href, '/users');
});

test('diagnoseNotFound identifies missing static files and unknown API routes', () => {
  const assetDiag = diagnoseNotFound({ method: 'GET', originalUrl: '/styles/app.css' });
  assert.strictEqual(assetDiag.code, 'STATIC_ASSET_NOT_FOUND');
  assert.match(assetDiag.reason, /public\//);

  const apiDiag = diagnoseNotFound({ method: 'GET', originalUrl: '/api/v2/metrics' });
  assert.strictEqual(apiDiag.code, 'API_ENDPOINT_NOT_FOUND');
  assert.strictEqual(apiDiag.suggestion.href, '/api/swagger');
});

test('guardian404ErrorHandler handles 404 errors and forwards non-404 errors', () => {
  const res = createMockRes();
  let nextCalledWith = null;

  guardian404ErrorHandler(
    { status: 500, message: 'DB failure' },
    { method: 'GET', originalUrl: '/jobs', headers: { accept: 'application/json' } },
    res,
    (err) => { nextCalledWith = err; }
  );
  assert.strictEqual(nextCalledWith.status, 500);
  assert.strictEqual(res.headersSent, false);

  guardian404ErrorHandler(
    { status: 404, code: 'CUSTOM_MISSING', message: 'Record missing here' },
    { method: 'GET', originalUrl: '/jobs/42', headers: { accept: 'application/json' } },
    res,
    () => {}
  );
  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.code, 'CUSTOM_MISSING');
  assert.strictEqual(res.body.reason, 'Record missing here');
});

test('sendResourceNotFound renders Guardian HTML for HTML clients and structured JSON for API clients', () => {
  const htmlRes = createMockRes();
  sendResourceNotFound(
    { method: 'GET', originalUrl: '/users/999', accepts: (t) => t === 'html' },
    htmlRes,
    { resourceName: 'User', id: '999', backHref: '/users', backLabel: '← Back to Alumni Directory' }
  );
  assert.strictEqual(htmlRes.statusCode, 404);
  assert.ok(htmlRes.body.includes('404 GUARDIAN'));
  assert.ok(htmlRes.body.includes('ID #999'));
  assert.ok(htmlRes.body.includes('/users'));

  const jsonRes = createMockRes();
  sendResourceNotFound(
    { method: 'GET', originalUrl: '/users/999', accepts: () => false },
    jsonRes,
    { resourceName: 'User', id: '999', backHref: '/users', backLabel: '← Back to Alumni Directory' }
  );
  assert.strictEqual(jsonRes.statusCode, 404);
  assert.strictEqual(jsonRes.body.error, 'User not found');
  assert.strictEqual(jsonRes.body.code, 'USER_NOT_FOUND');
});

test('notFoundGuardian integrates with app to explain 404 reasons, escape XSS, and support JSON APIs', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // 1. Typo on web route renders 404 Guardian HTML screen with reason & suggestion
    const typoRes = await fetch(`http://127.0.0.1:${port}/usres`, {
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(typoRes.status, 404);
    assert.ok(typoRes.headers.get('content-type').includes('text/html'));
    const typoHtml = await typoRes.text();
    assert.ok(typoHtml.includes('404 GUARDIAN'));
    assert.ok(typoHtml.includes('ROUTE_TYPO_DETECTED'));
    assert.ok(typoHtml.includes('href="/users"'));

    // 2. Method mismatch explains allowed methods
    const methodRes = await fetch(`http://127.0.0.1:${port}/users`, {
      method: 'DELETE',
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(methodRes.status, 404);
    const methodHtml = await methodRes.text();
    assert.ok(methodHtml.includes('METHOD_NOT_SUPPORTED'));
    assert.ok(methodHtml.includes('GET, POST'));

    // 3. Unknown /api route returns structured JSON diagnostic payload
    const apiRes = await fetch(`http://127.0.0.1:${port}/api/unknown-endpoint`);
    assert.strictEqual(apiRes.status, 404);
    assert.ok(apiRes.headers.get('content-type').includes('application/json'));
    const apiJson = await apiRes.json();
    assert.strictEqual(apiJson.code, 'API_ENDPOINT_NOT_FOUND');
    assert.strictEqual(apiJson.suggestion.href, '/api/swagger');

    // 4. Web entity not found (/jobs/99999) renders full 404 Guardian diagnostic screen
    const missingJobRes = await fetch(`http://127.0.0.1:${port}/jobs/99999`, {
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(missingJobRes.status, 404);
    const missingJobHtml = await missingJobRes.text();
    assert.ok(missingJobHtml.includes('404 GUARDIAN'));
    assert.ok(missingJobHtml.includes('JOB_POSTING_NOT_FOUND'));
    assert.ok(missingJobHtml.includes('#99999'));

    // 5. Reflected XSS attempt in URL is safely HTML-escaped
    const xssRes = await fetch(`http://127.0.0.1:${port}/%3Cscript%3Ealert(1)%3C/script%3E`, {
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(xssRes.status, 404);
    const xssHtml = await xssRes.text();
    assert.ok(!xssHtml.includes('<script>alert(1)</script>'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('notFoundGuardian handles standalone next(err) flow in an isolated Express app', async () => {
  const miniApp = express();
  miniApp.get('/trigger-404', (_req, _res, next) => {
    const err = new Error('Alumni record archived');
    err.status = 404;
    err.code = 'ARCHIVED_RESOURCE';
    next(err);
  });
  miniApp.use(notFoundGuardian);
  miniApp.use(guardian404ErrorHandler);

  const server = miniApp.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/trigger-404`, {
      headers: { Accept: 'application/json' }
    });
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.code, 'ARCHIVED_RESOURCE');
    assert.strictEqual(body.reason, 'Alumni record archived');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('NotFoundView.renderNotFound renders generic 404 template and sanitizes unsafe inputs', () => {
  const genericHtml = NotFoundView.renderNotFound();
  assert.ok(genericHtml.includes('404 — Page Not Found'));
  assert.ok(genericHtml.includes('PAGE_NOT_FOUND'));
  assert.ok(genericHtml.includes('Return to Home Portal'));

  const sanitizedHtml = NotFoundView.renderNotFound({
    title: '<script>bad</script>',
    suggestion: { label: 'External', href: '//evil.com' },
    requested: { path: '/<b>xss</b>' }
  });
  assert.ok(!sanitizedHtml.includes('<script>bad</script>'));
  assert.ok(!sanitizedHtml.includes('href="//evil.com"'));
  assert.ok(sanitizedHtml.includes('href="/"'));
  assert.ok(sanitizedHtml.includes('&lt;b&gt;xss&lt;/b&gt;'));
});

test('sanitizeFromPath and buildNotFoundRedirectUrl reject unsafe or self-referential paths', () => {
  assert.strictEqual(sanitizeFromPath('/usres'), '/usres');
  assert.strictEqual(sanitizeFromPath('//evil.com'), null);
  assert.strictEqual(sanitizeFromPath('https://evil.com'), null);
  assert.strictEqual(sanitizeFromPath('/404'), null);
  assert.strictEqual(sanitizeFromPath('/404.html'), null);

  assert.strictEqual(
    buildNotFoundRedirectUrl({ method: 'GET', originalUrl: '/usres' }),
    '/404?from=%2Fusres'
  );
  assert.strictEqual(
    buildNotFoundRedirectUrl({ method: 'DELETE', originalUrl: '/users' }),
    '/404?from=%2Fusers&method=DELETE'
  );
  assert.strictEqual(
    buildNotFoundRedirectUrl({ method: 'GET', originalUrl: '//evil.com' }),
    '/404'
  );
});

test('generic /404 page serves 404 HTML/JSON directly and invalid web requests redirect to /404', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // 1. Direct GET /404 returns generic 404 page with status 404
    const directRes = await fetch(`http://127.0.0.1:${port}/404`, {
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(directRes.status, 404);
    assert.ok(directRes.headers.get('content-type').includes('text/html'));
    const directHtml = await directRes.text();
    assert.ok(directHtml.includes('404 — Page Not Found'));
    assert.ok(directHtml.includes('PAGE_NOT_FOUND'));

    // 2. Direct GET /404.html also returns generic 404 page with status 404 (not 200)
    const htmlAliasRes = await fetch(`http://127.0.0.1:${port}/404.html`, {
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(htmlAliasRes.status, 404);

    // 3. Invalid web route redirects (302) to /404?from=... when redirect is manual
    const manualRes = await fetch(`http://127.0.0.1:${port}/invalid-random-path`, {
      headers: { Accept: 'text/html' },
      redirect: 'manual'
    });
    assert.strictEqual(manualRes.status, 302);
    assert.strictEqual(manualRes.headers.get('location'), '/404?from=%2Finvalid-random-path');

    // 4. Following redirect renders /404 with status 404 and diagnostic context
    const followedRes = await fetch(`http://127.0.0.1:${port}/invalid-random-path`, {
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(followedRes.status, 404);
    assert.strictEqual(followedRes.redirected, true);
    assert.strictEqual(new URL(followedRes.url).pathname, '/404');
    const followedHtml = await followedRes.text();
    assert.ok(followedHtml.includes('/invalid-random-path'));
    assert.ok(followedHtml.includes('ROUTE_NOT_FOUND'));

    // 5. External from= query parameter is ignored (prevents open/forged diagnostic injection)
    const forgedRes = await fetch(`http://127.0.0.1:${port}/404?from=//evil.com`, {
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(forgedRes.status, 404);
    const forgedHtml = await forgedRes.text();
    assert.ok(!forgedHtml.includes('evil.com'));
    assert.ok(forgedHtml.includes('PAGE_NOT_FOUND'));

    // 6. GET /404 with Accept: application/json returns 404 JSON
    const jsonRes = await fetch(`http://127.0.0.1:${port}/404`, {
      headers: { Accept: 'application/json' }
    });
    assert.strictEqual(jsonRes.status, 404);
    assert.ok(jsonRes.headers.get('content-type').includes('application/json'));
    const jsonBody = await jsonRes.json();
    assert.strictEqual(jsonBody.code, 'PAGE_NOT_FOUND');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
