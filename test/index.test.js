const test = require('node:test');
const assert = require('node:assert');
const app = require('../index');

test('GET / returns temporary home page HTML and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/`);
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('Alumni Tracking System'));
    assert.ok(body.includes('temporary home page'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /about returns about page HTML and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/about`);
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('About This Project'));
    assert.ok(body.includes('Alumni Tracking System'));
    assert.ok(body.includes('Tech Stack'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /hello returns Hello World and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/hello`);
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.strictEqual(body, 'Hello World');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /hello/:name returns Hello <Name>! and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res1 = await fetch(`http://127.0.0.1:${port}/hello/hakan`);
    assert.strictEqual(res1.status, 200);
    const body1 = await res1.text();
    assert.strictEqual(body1, 'Hello Hakan!');

    const res2 = await fetch(`http://127.0.0.1:${port}/hello/ahmet`);
    assert.strictEqual(res2.status, 200);
    const body2 = await res2.text();
    assert.strictEqual(body2, 'Hello Ahmet!');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /sum/:number1/:number2 returns toplam= <sum> and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res1 = await fetch(`http://127.0.0.1:${port}/sum/3/5`);
    assert.strictEqual(res1.status, 200);
    const body1 = await res1.text();
    assert.strictEqual(body1, 'toplam= 8');

    const res2 = await fetch(`http://127.0.0.1:${port}/sum/10/20`);
    assert.strictEqual(res2.status, 200);
    const body2 = await res2.text();
    assert.strictEqual(body2, 'toplam= 30');

    const res3 = await fetch(`http://127.0.0.1:${port}/sum/abc/5`);
    assert.strictEqual(res3.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

