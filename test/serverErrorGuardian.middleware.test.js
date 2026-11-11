const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const {
  notFoundGuardian,
  guardian404ErrorHandler,
  serverErrorGuardian,
  createServerErrorGuardian,
  sendServerError,
  diagnoseServerError,
  resolveServerStatusCode,
  is5xxError
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

test('resolveServerStatusCode and is5xxError classify 5xx vs 4xx accurately', () => {
  assert.strictEqual(resolveServerStatusCode(new Error('boom')), 500);
  assert.strictEqual(resolveServerStatusCode({ code: 'ECONNREFUSED', message: 'connect fail' }), 503);
  assert.strictEqual(resolveServerStatusCode({ code: '57P03', message: 'db starting up' }), 503);
  assert.strictEqual(resolveServerStatusCode({ statusCode: 502 }), 502);
  assert.strictEqual(resolveServerStatusCode({ status: 504 }), 504);

  assert.strictEqual(is5xxError(new TypeError('bad read')), true);
  assert.strictEqual(is5xxError({ status: 500 }), true);
  assert.strictEqual(is5xxError({ status: 400 }), false);
  assert.strictEqual(is5xxError({ statusCode: 404 }), false);
});

test('diagnoseServerError classifies database, schema, query, view, gateway, and runtime faults', () => {
  const connErr = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5432'), { code: 'ECONNREFUSED' });
  const connDiag = diagnoseServerError(connErr, { method: 'GET', originalUrl: '/jobs' }, { operation: 'Loading job board' });
  assert.strictEqual(connDiag.statusCode, 503);
  assert.strictEqual(connDiag.code, 'DB_CONNECTION_ERROR');
  assert.match(connDiag.reason, /Loading job board/);
  assert.strictEqual(connDiag.suggestion.href, '/api/health');

  const schemaErr = Object.assign(new Error('relation "job_postings" does not exist'), { code: '42P01' });
  const schemaDiag = diagnoseServerError(schemaErr, { method: 'GET', originalUrl: '/jobs' });
  assert.strictEqual(schemaDiag.statusCode, 500);
  assert.strictEqual(schemaDiag.code, 'DB_SCHEMA_ERROR');
  assert.ok(schemaDiag.tips.some((t) => t.includes('npm run migrate')));

  const queryErr = Object.assign(new Error('invalid input syntax'), { code: '22P02', detail: 'bad int' });
  const queryDiag = diagnoseServerError(queryErr, { method: 'POST', originalUrl: '/api/users' });
  assert.strictEqual(queryDiag.code, 'DB_QUERY_FAILURE');
  assert.match(queryDiag.reason, /bad int/);

  const viewErr = Object.assign(new Error("ENOENT: no such file 'views/missing.html'"), { code: 'ENOENT' });
  const viewDiag = diagnoseServerError(viewErr, { method: 'GET', originalUrl: '/users' });
  assert.strictEqual(viewDiag.code, 'VIEW_TEMPLATE_ERROR');

  const timeoutDiag = diagnoseServerError({ status: 504, message: 'Timed out waiting on pool' }, { method: 'GET', originalUrl: '/api/jobs' });
  assert.strictEqual(timeoutDiag.statusCode, 504);
  assert.strictEqual(timeoutDiag.code, 'GATEWAY_TIMEOUT');
});

test('diagnoseServerError suppresses stack traces when includeStack is false and generates Incident ID', () => {
  const err = new Error('Sensitive path /secret/config.js');
  const devDiag = diagnoseServerError(err, {}, { includeStack: true });
  const prodDiag = diagnoseServerError(err, {}, { includeStack: false });

  assert.match(devDiag.incidentId, /^ERR-[A-Z0-9]+-[A-Z0-9]+$/);
  assert.ok(devDiag.stack && devDiag.stack.includes('Sensitive path'));
  assert.strictEqual(prodDiag.stack, null);
});

test('sendServerError renders XSS-safe HTML Guardian screen and logs Incident ID', () => {
  const logged = [];
  const res = createMockRes();
  const xssErr = new Error('<script>alert("xss")</script> failure');

  sendServerError(
    { method: 'GET', originalUrl: '/jobs', accepts: (t) => t === 'html' },
    res,
    xssErr,
    {
      operation: 'Rendering jobs',
      includeStack: true,
      logError: (line) => logged.push(line)
    }
  );

  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(logged.length, 1);
  assert.match(logged[0], /^\[5XX GUARDIAN\] ERR-/);
  assert.ok(res.body.includes('500 SERVER GUARDIAN'));
  assert.ok(res.body.includes('Rendering jobs'));
  assert.ok(!res.body.includes('<script>alert("xss")</script>'));
  assert.ok(res.body.includes('&lt;script&gt;'));
});

test('sendServerError returns structured JSON payload for API clients', () => {
  const logged = [];
  const res = createMockRes();
  const dbErr = Object.assign(new Error('pool exhausted'), { code: 'ECONNREFUSED' });

  sendServerError(
    { method: 'GET', originalUrl: '/api/jobs', headers: { accept: 'application/json' } },
    res,
    dbErr,
    { operation: 'Fetching API jobs', includeStack: false, logError: (line) => logged.push(line) }
  );

  assert.strictEqual(res.statusCode, 503);
  assert.strictEqual(res.body.code, 'DB_CONNECTION_ERROR');
  assert.strictEqual(res.body.operation, 'Fetching API jobs');
  assert.strictEqual(res.body.stack, undefined);
  assert.match(res.body.incidentId, /^ERR-/);
});

test('createServerErrorGuardian integrates with Express 5 async/sync errors and forwards 4xx errors', async () => {
  const logged = [];
  const miniApp = express();

  miniApp.get('/sync-crash', () => {
    throw new TypeError('Cannot read properties of undefined');
  });

  miniApp.get('/async-db-crash', async () => {
    const err = new Error('Connection terminated unexpectedly');
    err.code = '57P01';
    throw err;
  });

  miniApp.get('/client-bad-request', (_req, _res, next) => {
    const err = new SyntaxError('Malformed JSON');
    err.status = 400;
    next(err);
  });

  miniApp.use(notFoundGuardian);
  miniApp.use(guardian404ErrorHandler);
  miniApp.use(createServerErrorGuardian({ includeStack: false, logError: (line) => logged.push(line) }));
  miniApp.use((err, _req, res, _next) => res.status(err.status || 400).json({ error: err.message }));

  const server = miniApp.listen(0);
  const { port } = server.address();

  try {
    const htmlRes = await fetch(`http://127.0.0.1:${port}/sync-crash`, {
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(htmlRes.status, 500);
    const html = await htmlRes.text();
    assert.ok(html.includes('500 SERVER GUARDIAN'));
    assert.ok(html.includes('TypeError: Cannot read properties of undefined'));

    const apiDbRes = await fetch(`http://127.0.0.1:${port}/async-db-crash`, {
      headers: { Accept: 'application/json' }
    });
    assert.strictEqual(apiDbRes.status, 503);
    const apiJson = await apiDbRes.json();
    assert.strictEqual(apiJson.code, 'DB_CONNECTION_ERROR');
    assert.strictEqual(apiJson.suggestion.href, '/api/health');

    const badReqRes = await fetch(`http://127.0.0.1:${port}/client-bad-request`);
    assert.strictEqual(badReqRes.status, 400);
    const badJson = await badReqRes.json();
    assert.strictEqual(badJson.error, 'Malformed JSON');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  assert.strictEqual(logged.length, 2);
  assert.strictEqual(typeof serverErrorGuardian, 'function');
});
