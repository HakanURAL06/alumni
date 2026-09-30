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

test('GET /api/health returns JSON { status: "ok" } and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('application/json'));
    const data = await res.json();
    assert.deepStrictEqual(data, { status: 'ok' });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /api/health returns JSON { status: "ok" } and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`, { method: 'POST' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('application/json'));
    const data = await res.json();
    assert.deepStrictEqual(data, { status: 'ok' });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/users returns list of users and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/users`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('application/json'));
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /api/users adds a new user and returns 201', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const newUser = {
      name: 'Ayşe Kaya',
      department: 'Electrical Engineering',
      graduationYear: 2023,
      email: 'ayse@alumni.edu'
    };

    const res = await fetch(`http://127.0.0.1:${port}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.message, 'User created successfully');
    assert.strictEqual(data.user.name, 'Ayşe Kaya');
    assert.strictEqual(data.user.department, 'Electrical Engineering');
    assert.strictEqual(data.user.graduationYear, 2023);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/users/:id returns user by id and 404 when not found', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res1 = await fetch(`http://127.0.0.1:${port}/api/users/1`);
    assert.strictEqual(res1.status, 200);
    const user1 = await res1.json();
    assert.strictEqual(user1.id, 1);
    assert.strictEqual(user1.name, 'Hakan Ural');

    const res2 = await fetch(`http://127.0.0.1:${port}/api/users/9999`);
    assert.strictEqual(res2.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('PUT /api/users/:id updates user and returns 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/users/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hakan Ural (Updated)', department: 'AI & Data Science' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.name, 'Hakan Ural (Updated)');
    assert.strictEqual(data.user.department, 'AI & Data Science');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('PATCH /api/users/:id partially modifies user and returns 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/users/2`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department: 'Robotics Engineering' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.department, 'Robotics Engineering');
    assert.strictEqual(data.user.name, 'Ayşe Yılmaz');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('DELETE /api/users/:id deletes user and returns 200, or 404 if not found', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res1 = await fetch(`http://127.0.0.1:${port}/api/users/3`, {
      method: 'DELETE'
    });
    assert.strictEqual(res1.status, 200);
    const data = await res1.json();
    assert.strictEqual(data.message, 'User deleted successfully');
    assert.strictEqual(data.deletedUser.id, 3);

    // Verify it is no longer found
    const res2 = await fetch(`http://127.0.0.1:${port}/api/users/3`);
    assert.strictEqual(res2.status, 404);

    // Trying to delete non-existing returns 404
    const res3 = await fetch(`http://127.0.0.1:${port}/api/users/9999`, {
      method: 'DELETE'
    });
    assert.strictEqual(res3.status, 404);
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

