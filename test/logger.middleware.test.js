const test = require('node:test');
const assert = require('node:assert');
const { EventEmitter } = require('node:events');
const express = require('express');
const app = require('../index');
const { logger, createLogger } = require('../middleware');

function createMockReq(overrides = {}) {
  return {
    method: 'GET',
    originalUrl: '/api/users',
    url: '/api/users',
    ip: '::ffff:127.0.0.1',
    headers: {},
    socket: { remoteAddress: '::ffff:127.0.0.1' },
    ...overrides
  };
}

function createMockRes({ statusCode = 200, headers = {} } = {}) {
  const res = new EventEmitter();
  res.statusCode = statusCode;
  res.writableFinished = false;
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );
  res.getHeader = (name) => normalized[String(name).toLowerCase()];
  return res;
}

test('createLogger formats timestamp, method, route, status, type, duration, size, and IP', () => {
  const logs = [];
  const middleware = createLogger({
    write: (line) => logs.push(line),
    useColors: false
  });

  const req = createMockReq({
    method: 'POST',
    originalUrl: '/api/jobs?status=Active',
    headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' }
  });
  const res = createMockRes({
    statusCode: 201,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-length': '256'
    }
  });

  let nextCalled = false;
  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(logs.length, 0);

  res.writableFinished = true;
  res.emit('finish');
  res.emit('close');

  assert.strictEqual(logs.length, 1);
  const row = logs[0];
  assert.match(row, /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
  assert.match(row, /POST\s+\/api\/jobs\?status=Active \| 201 \| application\/json \| \d+\.\d{2}ms \| 256B \| 203\.0\.113\.10$/);
});

test('createLogger logs premature client close once as ABORTED', () => {
  const logs = [];
  const middleware = createLogger({
    write: (line) => logs.push(line),
    useColors: false
  });

  const req = createMockReq({ method: 'GET', originalUrl: '/jobs' });
  const res = createMockRes({
    statusCode: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });

  middleware(req, res, () => {});
  res.emit('close');

  assert.strictEqual(logs.length, 1);
  assert.match(logs[0], /ABORTED\(200\) \| text\/html \| \d+\.\d{2}ms \| - \| 127\.0\.0\.1$/);
});

test('createLogger strips control characters to prevent log injection and respects skip/colors', () => {
  const logs = [];
  const middleware = createLogger({
    write: (line) => logs.push(line),
    useColors: true,
    skip: (req) => req.originalUrl === '/ignore'
  });

  const skippedRes = createMockRes();
  middleware(createMockReq({ originalUrl: '/ignore' }), skippedRes, () => {});
  skippedRes.writableFinished = true;
  skippedRes.emit('finish');
  assert.strictEqual(logs.length, 0);

  const req = createMockReq({
    method: 'delete',
    originalUrl: '/api/users/5\r\nFAKE_LOG\x1b[31m'
  });
  const res = createMockRes({ statusCode: 404 });
  middleware(req, res, () => {});
  res.writableFinished = true;
  res.emit('finish');

  assert.strictEqual(logs.length, 1);
  assert.ok(!logs[0].includes('\n'));
  assert.ok(!logs[0].includes('\r'));
  assert.match(logs[0], /DELETE \/api\/users\/5FAKE_LOG \|/);
  assert.ok(logs[0].includes('\x1b[33m404\x1b[0m'));
});

test('logger works safely with minimal mock responses missing EventEmitter methods', () => {
  let nextCount = 0;
  const middleware = createLogger({
    write: () => {},
    useColors: false
  });

  assert.doesNotThrow(() => {
    middleware(
      { method: 'GET', url: '/health' },
      { statusCode: 200 },
      () => { nextCount += 1; }
    );
  });
  assert.strictEqual(nextCount, 1);
  assert.strictEqual(typeof logger, 'function');
});

test('app uses logger middleware and writes formatted rows to terminal on real HTTP requests', async () => {
  const originalLog = console.log;
  const captured = [];
  console.log = (...args) => {
    captured.push(args.join(' '));
  };

  const server = app.listen(0);
  const { port } = server.address();

  try {
    const jsonRes = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.strictEqual(jsonRes.status, 200);
    await jsonRes.text();

    const notFoundRes = await fetch(`http://127.0.0.1:${port}/non-existent-route-check`);
    assert.strictEqual(notFoundRes.status, 404);
    await notFoundRes.text();
  } finally {
    await new Promise((resolve) => server.close(resolve));
    console.log = originalLog;
  }

  const healthLog = captured.find((line) => line.includes('/api/health'));
  assert.ok(healthLog, 'Expected /api/health request to be logged');
  assert.match(healthLog, /GET\s+\/api\/health \| .*200.* \| application\/json \| \d+\.\d{2}ms \| \d+B \|/);

  const redirectLog = captured.find((line) => line.includes('GET    /non-existent-route-check'));
  assert.ok(redirectLog, 'Expected invalid route redirect request to be logged');
  assert.match(redirectLog, /GET\s+\/non-existent-route-check \| .*302.* \| (text\/plain|text\/html) \| \d+\.\d{2}ms \|/);

  const generic404Log = captured.find((line) => line.includes('/404?from=%2Fnon-existent-route-check'));
  assert.ok(generic404Log, 'Expected redirected /404 page request to be logged with 404 status');
  assert.match(generic404Log, /GET\s+\/404\?from=%2Fnon-existent-route-check \| .*404.* \| text\/html \| \d+\.\d{2}ms \|/);
});

test('createLogger integrates cleanly as isolated Express middleware', async () => {
  const rows = [];
  const miniApp = express();
  miniApp.use(createLogger({ write: (line) => rows.push(line), useColors: false }));
  miniApp.get('/ping', (_req, res) => res.type('text/plain').status(200).send('pong'));

  const server = miniApp.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/ping`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(await res.text(), 'pong');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  assert.strictEqual(rows.length, 1);
  assert.match(rows[0], /^\[\d{4}-\d{2}-\d{2}T.*Z\] GET\s+\/ping \| 200 \| text\/plain \| \d+\.\d{2}ms \| 4B \|/);
});
