const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const app = require('../index');
const {
  DEFAULT_LOG_FILE_PATH,
  stripAnsi,
  appendLogLine,
  createLogger,
  createNotFoundGuardian,
  createServerErrorGuardian,
  sendServerError
} = require('../middleware');

function createTempLogPath() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'alumni-logs-'));
  return { dir, filePath: path.join(dir, 'logs', 'error.logs') };
}

test('DEFAULT_LOG_FILE_PATH targets logs/error.logs in project root', () => {
  assert.ok(DEFAULT_LOG_FILE_PATH.endsWith(path.join('logs', 'error.logs')));
});

test('stripAnsi removes ANSI color codes and appendLogLine creates nested logs/error.logs', () => {
  const { dir, filePath } = createTempLogPath();

  try {
    const ok = appendLogLine('[2026-11-11T10:00:00.000Z] GET /users | \x1b[32m200\x1b[0m | text/html', {
      logFilePath: filePath
    });
    assert.strictEqual(ok, true);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.strictEqual(content, '[2026-11-11T10:00:00.000Z] GET /users | 200 | text/html\n');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('createLogger, createNotFoundGuardian, and createServerErrorGuardian log to both terminal and log file', () => {
  const { dir, filePath } = createTempLogPath();
  const terminalLines = [];

  try {
    // 1. Request Logger
    const reqLogger = createLogger({
      write: (line) => terminalLines.push(line),
      logFilePath: filePath,
      useColors: true
    });
    const res1 = new EventEmitter();
    res1.statusCode = 200;
    res1.writableFinished = true;
    res1.getHeader = () => 'application/json';
    reqLogger({ method: 'GET', originalUrl: '/api/jobs', headers: {}, socket: {} }, res1, () => {});
    res1.emit('finish');

    // 2. 404 Guardian
    const guardian404 = createNotFoundGuardian({
      logError: (line) => terminalLines.push(line),
      logFilePath: filePath
    });
    const res2 = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      send(body) { this.body = body; return this; },
      json(body) { this.body = body; return this; }
    };
    guardian404({ method: 'GET', originalUrl: '/usres', headers: { accept: 'text/html' } }, res2, () => {});

    // 3. 5xx Guardian
    const err = new TypeError('Database row missing');
    const guardian5xx = createServerErrorGuardian({
      logError: (line) => terminalLines.push(line),
      logFilePath: filePath,
      includeStack: true
    });
    const res3 = {
      statusCode: 200,
      headersSent: false,
      status(code) { this.statusCode = code; return this; },
      send(body) { this.body = body; return this; },
      json(body) { this.body = body; return this; }
    };
    guardian5xx(err, { method: 'GET', originalUrl: '/jobs', headers: { accept: 'text/html' } }, res3, () => {});

    assert.strictEqual(terminalLines.length, 3);
    assert.ok(terminalLines[0].includes('\x1b[32m200\x1b[0m'));
    assert.match(terminalLines[1], /\[404 GUARDIAN\] ROUTE_TYPO_DETECTED/);
    assert.match(terminalLines[2], /^\[5XX GUARDIAN\] ERR-/);

    const diskContent = fs.readFileSync(filePath, 'utf8');
    assert.strictEqual(stripAnsi(diskContent), diskContent);
    assert.ok(diskContent.includes('/api/jobs | 200 | application/json'));
    assert.ok(diskContent.includes('[404 GUARDIAN] ROUTE_TYPO_DETECTED'));
    assert.ok(diskContent.includes('[5XX GUARDIAN]'));
    assert.ok(diskContent.includes('[5XX STACK]'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('sendServerError appends safely and appendLogLine swallows file write errors', () => {
  const { dir, filePath } = createTempLogPath();
  // Create a directory at filePath so appendFileSync hits EISDIR
  fs.mkdirSync(filePath, { recursive: true });

  try {
    const result = appendLogLine('should fail cleanly', { logFilePath: filePath });
    assert.strictEqual(result, false);

    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; }
    };
    assert.doesNotThrow(() => {
      sendServerError(
        { method: 'GET', originalUrl: '/api/jobs', headers: { accept: 'application/json' } },
        res,
        new Error('fail'),
        { logError: () => {}, logFilePath: filePath }
      );
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('app real HTTP requests persist entries to logs/error.logs', async () => {
  const beforeSize = fs.existsSync(DEFAULT_LOG_FILE_PATH)
    ? fs.statSync(DEFAULT_LOG_FILE_PATH).size
    : 0;

  const server = app.listen(0);
  const { port } = server.address();

  try {
    const okRes = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.strictEqual(okRes.status, 200);
    await okRes.text();

    const missRes = await fetch(`http://127.0.0.1:${port}/usres`, {
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(missRes.status, 404);
    await missRes.text();
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  assert.ok(fs.existsSync(DEFAULT_LOG_FILE_PATH), 'Expected logs/error.logs to be created');
  const fullContent = fs.readFileSync(DEFAULT_LOG_FILE_PATH, 'utf8');
  const appended = fullContent.slice(beforeSize);
  assert.ok(appended.includes('/api/health | 200 | application/json'));
  assert.ok(appended.includes('[404 GUARDIAN] ROUTE_TYPO_DETECTED'));
  assert.ok(appended.includes('redirect=/404?from=%2Fusres'));
  assert.ok(appended.includes('/usres | 302 | text/html'));
  assert.ok(appended.includes('/404?from=%2Fusres | 404 | text/html'));
});
