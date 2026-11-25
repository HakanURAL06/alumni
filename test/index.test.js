const test = require('node:test');
const assert = require('node:assert');
const app = require('../index');
const User = require('../models/User');

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
    const allRes = await fetch(`http://127.0.0.1:${port}/api/users`);
    const users = await allRes.json();
    const firstUser = users[0];

    const res1 = await fetch(`http://127.0.0.1:${port}/api/users/${firstUser.id}`);
    assert.strictEqual(res1.status, 200);
    const user1 = await res1.json();
    assert.strictEqual(user1.id, firstUser.id);
    assert.ok(user1.name);

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
    const createRes = await fetch(`http://127.0.0.1:${port}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User To Delete', department: 'CE', email: `delete.${Date.now()}@alumni.edu` })
    });
    const createdData = await createRes.json();
    const targetId = createdData.user.id;

    const res1 = await fetch(`http://127.0.0.1:${port}/api/users/${targetId}`, {
      method: 'DELETE'
    });
    assert.strictEqual(res1.status, 200);
    const data = await res1.json();
    assert.strictEqual(data.message, 'User deleted successfully');
    assert.strictEqual(data.deletedUser.id, targetId);

    // Verify it is no longer found
    const res2 = await fetch(`http://127.0.0.1:${port}/api/users/${targetId}`);
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

test('GET /api/swagger serves Swagger UI and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/swagger/`);
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('swagger-ui') || body.includes('Swagger UI'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/swagger.json returns OpenAPI spec JSON and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/swagger.json`);
    assert.strictEqual(res.status, 200);
    const spec = await res.json();
    assert.strictEqual(spec.openapi, '3.0.0');
    assert.strictEqual(spec.info.title, 'Alumni Tracking System API');
    assert.ok(spec.paths['/api/users']);
    assert.ok(spec.paths['/apiuser']);
    assert.ok(spec.paths['/user']);
    assert.ok(spec.paths['/api/health']);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /apiuser returns list of users via apiUser router and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/apiuser`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('application/json'));
    const data = await res.json();
    assert.ok(Array.isArray(data));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /users returns HTML alumni directory with View layer and form', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/users`, {
      headers: { 'Accept': 'text/html' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('Alumni Directory'));
    assert.ok(body.includes('View Layer'));
    assert.ok(body.includes('<form action="/users" method="POST">'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /users creates alumni and redirects to /users with View layer', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const params = new URLSearchParams({
      name: 'Ece Aydın',
      department: 'Mechanical Engineering',
      graduationYear: '2024',
      email: 'ece@alumni.edu'
    });

    const res = await fetch(`http://127.0.0.1:${port}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html'
      },
      body: params.toString(),
      redirect: 'manual'
    });

    assert.strictEqual(res.status, 302);
    assert.ok(res.headers.get('location').includes('/users'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /users/:id renders HTML detail profile view', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/users/1`, {
      headers: { 'Accept': 'text/html' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('Detail View'));
    assert.ok(body.includes('Hakan Ural'));
    assert.ok(body.includes('/users/1/edit'));
    assert.ok(body.includes('/users/1/delete'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /users/:id/edit renders HTML edit form pre-filled with data', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/users/1/edit`, {
      headers: { 'Accept': 'text/html' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('Edit Alumni Profile'));
    assert.ok(body.includes('action="/users/1/edit"'));
    assert.ok(body.includes('Hakan Ural'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /users/:id/edit updates user and redirects to /users?updated=1', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const params = new URLSearchParams({
      name: 'Hakan Ural (Updated)',
      department: 'Software & AI',
      graduationYear: '2024',
      email: 'hakan.updated@alumni.edu'
    });

    const res = await fetch(`http://127.0.0.1:${port}/users/1/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html'
      },
      body: params.toString(),
      redirect: 'manual'
    });

    assert.strictEqual(res.status, 302);
    assert.ok(res.headers.get('location').includes('updated=1'));
  } finally {
    // Restore user 1 back to default seed credentials so Hakan can always log in with hakan@alumni.edu
    await User.update(1, {
      name: 'Hakan Ural',
      department: 'Computer Engineering',
      graduationYear: 2024,
      email: 'hakan@alumni.edu'
    });
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /users/:id/delete deletes user and redirects to /users?deleted=1', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // Create temporary user first
    const createRes = await fetch(`http://127.0.0.1:${port}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User To Remove', department: 'Math', graduationYear: 2020, email: 'temp@alumni.edu' })
    });
    const { user } = await createRes.json();

    const deleteRes = await fetch(`http://127.0.0.1:${port}/users/${user.id}/delete`, {
      method: 'POST',
      headers: { 'Accept': 'text/html' },
      redirect: 'manual'
    });

    assert.strictEqual(deleteRes.status, 302);
    assert.ok(deleteRes.headers.get('location').includes('deleted=1'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/announcements returns list of announcements and status 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/announcements`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /api/announcements adds announcement and returns 201', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Fellowship Program',
        content: 'Fellowship funding available for graduates.',
        category: 'Academic',
        author: 'Dean Office'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.announcement.title, 'New Fellowship Program');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /announcements returns management interface HTML view with form', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/announcements`, {
      headers: { 'Accept': 'text/html' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('Announcements Management'));
    assert.ok(body.includes('<form action="/announcements" method="POST">'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /announcements submits form and redirects to /announcements?success=1', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const params = new URLSearchParams({
      title: 'Spring Homecoming',
      category: 'Event',
      author: 'Alumni Association',
      date: '2026-05-20',
      content: 'Save the date for the spring gathering.'
    });

    const res = await fetch(`http://127.0.0.1:${port}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html'
      },
      body: params.toString(),
      redirect: 'manual'
    });

    assert.strictEqual(res.status, 302);
    assert.ok(res.headers.get('location').includes('success=1'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /announcements/:id renders HTML detail view', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/announcements/1`, {
      headers: { 'Accept': 'text/html' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('Announcement Detail'));
    assert.ok(body.includes('/announcements/1/edit'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /announcements/:id/edit renders HTML edit form pre-filled with data', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/announcements/1/edit`, {
      headers: { 'Accept': 'text/html' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes('Edit Announcement'));
    assert.ok(body.includes('action="/announcements/1/edit"'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /announcements/:id/edit updates announcement and redirects to /announcements?updated=1', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const params = new URLSearchParams({
      title: 'Homecoming Updated Title',
      category: 'Event',
      author: 'Office',
      date: '2026-10-20',
      content: 'Updated content here.'
    });

    const res = await fetch(`http://127.0.0.1:${port}/announcements/1/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html'
      },
      body: params.toString(),
      redirect: 'manual'
    });

    assert.strictEqual(res.status, 302);
    assert.ok(res.headers.get('location').includes('updated=1'));
  } finally {
    // Restore user 1 back to default seed credentials so Hakan can always log in with hakan@alumni.edu
    await User.update(1, {
      name: 'Hakan Ural',
      department: 'Computer Engineering',
      graduationYear: 2024,
      email: 'hakan@alumni.edu'
    });
    await new Promise((resolve) => server.close(resolve));
  }
});

test('POST /announcements/:id/delete deletes announcement and redirects to /announcements?deleted=1', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const createRes = await fetch(`http://127.0.0.1:${port}/api/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Delete Candidate', content: 'Will be removed', category: 'General' })
    });
    const { announcement } = await createRes.json();

    const deleteRes = await fetch(`http://127.0.0.1:${port}/announcements/${announcement.id}/delete`, {
      method: 'POST',
      headers: { 'Accept': 'text/html' },
      redirect: 'manual'
    });

    assert.strictEqual(deleteRes.status, 302);
    assert.ok(deleteRes.headers.get('location').includes('deleted=1'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /register and POST /register handle functional member registration with role validation', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // 1. GET /register renders registration HTML page
    const getRes = await fetch(`http://127.0.0.1:${port}/register`, {
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(getRes.status, 200);
    const getHtml = await getRes.text();
    assert.ok(getHtml.includes('Register for the Istanbul University Network'));
    assert.ok(getHtml.includes('action="/register" method="POST"'));

    // 2. POST /register with valid form inputs creates user and redirects to /users
    const validForm = new URLSearchParams({
      name: 'Elif Şahin',
      email: 'elif.sahin@alumni.edu',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      department: 'Computer Engineering',
      graduationYear: '2024',
      role: 'alumni',
      title: 'Cloud Architect',
      company: 'Istanbul Tech',
      isMentor: 'true'
    });

    const postHtmlRes = await fetch(`http://127.0.0.1:${port}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html'
      },
      body: validForm.toString(),
      redirect: 'manual'
    });
    assert.strictEqual(postHtmlRes.status, 302);
    assert.ok(postHtmlRes.headers.get('location').includes('/users?success=1&registered=1'));

    // 3. POST /api/register with privileged role ('admin') returns 403 Forbidden (USR-R4)
    const forbiddenRes = await fetch(`http://127.0.0.1:${port}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: 'Escalation Attempt',
        email: 'hacker@alumni.edu',
        department: 'Law',
        graduationYear: 2024,
        role: 'admin'
      })
    });
    assert.strictEqual(forbiddenRes.status, 403);

    // 4. POST /api/register with mismatched passwords returns 400 Bad Request
    const mismatchRes = await fetch(`http://127.0.0.1:${port}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: 'Mismatch User',
        email: 'mismatch@alumni.edu',
        department: 'Economics',
        graduationYear: 2024,
        password: 'Password123!',
        confirmPassword: 'DifferentPassword!'
      })
    });
    assert.strictEqual(mismatchRes.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Authentication: Login and Logout workflows across Web views and REST API', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // 1. GET /login renders login page with HTTP 200
    const getLoginRes = await fetch(`http://127.0.0.1:${port}/login`);
    assert.strictEqual(getLoginRes.status, 200);
    const getLoginHtml = await getLoginRes.text();
    assert.ok(getLoginHtml.includes('Member Portal Login'));
    assert.ok(getLoginHtml.includes('action="/login" method="POST"'));

    // 2. POST /login with invalid credentials returns 401 HTML error screen
    const invalidForm = new URLSearchParams({
      email: 'ayse@alumni.edu',
      password: 'WrongPassword999!'
    });
    const invalidLoginRes = await fetch(`http://127.0.0.1:${port}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html'
      },
      body: invalidForm.toString(),
      redirect: 'manual'
    });
    assert.strictEqual(invalidLoginRes.status, 401);
    const invalidLoginHtml = await invalidLoginRes.text();
    assert.ok(invalidLoginHtml.includes('alert-danger'));
    assert.ok(invalidLoginHtml.includes('Invalid email or password.'));

    // 3. POST /login with valid credentials sets session cookie and redirects (302)
    const validForm = new URLSearchParams({
      email: 'ayse@alumni.edu',
      password: 'Password123!',
      rememberMe: 'true'
    });
    const validLoginRes = await fetch(`http://127.0.0.1:${port}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html'
      },
      body: validForm.toString(),
      redirect: 'manual'
    });
    assert.strictEqual(validLoginRes.status, 302);
    assert.ok(validLoginRes.headers.get('location').includes('/users?login=1'));
    const cookieHeader = validLoginRes.headers.get('set-cookie');
    assert.ok(cookieHeader && cookieHeader.includes('session='));
    assert.ok(cookieHeader.includes('HttpOnly'));

    // 4. POST /api/login with invalid credentials returns 401 JSON
    const apiBadRes = await fetch(`http://127.0.0.1:${port}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@alumni.edu', password: 'Password123!' })
    });
    assert.strictEqual(apiBadRes.status, 401);
    const apiBadJson = await apiBadRes.json();
    assert.ok(apiBadJson.error);

    // 5. POST /api/login with valid credentials returns 200 JSON with token and user profile
    const apiGoodRes = await fetch(`http://127.0.0.1:${port}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: 'mehmet@alumni.edu', password: 'Password123!' })
    });
    assert.strictEqual(apiGoodRes.status, 200);
    const apiGoodJson = await apiGoodRes.json();
    assert.strictEqual(apiGoodJson.message, 'Login successful');
    assert.ok(typeof apiGoodJson.token === 'string' && apiGoodJson.token.includes('.'));
    assert.strictEqual(apiGoodJson.user.email, 'mehmet@alumni.edu');

    // 6. GET /api/me with Bearer token returns 200 JSON with authenticated user
    const meRes = await fetch(`http://127.0.0.1:${port}/api/me`, {
      headers: {
        Authorization: `Bearer ${apiGoodJson.token}`,
        Accept: 'application/json'
      }
    });
    assert.strictEqual(meRes.status, 200);
    const meJson = await meRes.json();
    assert.strictEqual(meJson.email, 'mehmet@alumni.edu');

    // 7. GET /api/me without authentication returns 401 JSON
    const unauthMeRes = await fetch(`http://127.0.0.1:${port}/api/me`, {
      headers: { Accept: 'application/json' }
    });
    assert.strictEqual(unauthMeRes.status, 401);

    // 8. GET /logout terminates session, clears cookie, and redirects to /login?logout=1
    const logoutRes = await fetch(`http://127.0.0.1:${port}/logout`, {
      headers: { Accept: 'text/html' },
      redirect: 'manual'
    });
    assert.strictEqual(logoutRes.status, 302);
    assert.ok(logoutRes.headers.get('location').includes('/login?logout=1'));
    const logoutCookie = logoutRes.headers.get('set-cookie');
    assert.ok(logoutCookie && logoutCookie.includes('Max-Age=0'));

    // 9. POST /api/logout clears session cookie and returns 200 JSON
    const apiLogoutRes = await fetch(`http://127.0.0.1:${port}/api/logout`, {
      method: 'POST',
      headers: { Accept: 'application/json' }
    });
    assert.strictEqual(apiLogoutRes.status, 200);
    const apiLogoutJson = await apiLogoutRes.json();
    assert.strictEqual(apiLogoutJson.message, 'Logged out successfully');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Admin Panel: Role Assignment, Protected Access, and Direct Data Manipulation', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    // ------------------------------------------------------------------------
    // 1. Unauthenticated Access Protection
    // ------------------------------------------------------------------------
    // Web: GET /admin redirects 302 to /login?returnUrl=%2Fadmin
    const unauthWebRes = await fetch(`http://127.0.0.1:${port}/admin`, {
      headers: { Accept: 'text/html' },
      redirect: 'manual'
    });
    assert.strictEqual(unauthWebRes.status, 302);
    assert.ok(unauthWebRes.headers.get('location').includes('/login?returnUrl='));

    // API: GET /api/admin/overview returns 401 Unauthorized
    const unauthApiRes = await fetch(`http://127.0.0.1:${port}/api/admin/overview`, {
      headers: { Accept: 'application/json' }
    });
    assert.strictEqual(unauthApiRes.status, 401);

    // ------------------------------------------------------------------------
    // 2. Non-Admin RBAC Gate (403 Forbidden)
    // ------------------------------------------------------------------------
    // Create regular user with alumni role
    const regularUser = await User.create({
      name: 'Regular Alumni Member',
      department: 'Felsefe',
      graduationYear: 2019,
      email: 'regular.alumni@alumni.edu',
      role: 'alumni'
    });

    // Login as non-admin user via API
    const nonAdminLoginRes = await fetch(`http://127.0.0.1:${port}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: regularUser.email, password: 'Password123!' })
    });
    assert.strictEqual(nonAdminLoginRes.status, 200);
    const nonAdminToken = (await nonAdminLoginRes.json()).token;

    // Non-admin accessing API -> 403 Forbidden
    const forbiddenApiRes = await fetch(`http://127.0.0.1:${port}/api/admin/overview`, {
      headers: {
        Authorization: `Bearer ${nonAdminToken}`,
        Accept: 'application/json'
      }
    });
    assert.strictEqual(forbiddenApiRes.status, 403);
    const forbiddenApiJson = await forbiddenApiRes.json();
    assert.ok(forbiddenApiJson.error.includes('Insufficient privileges') || forbiddenApiJson.error.includes('admin'));

    // Non-admin accessing Web -> 403 Forbidden
    const nonAdminWebRes = await fetch(`http://127.0.0.1:${port}/admin`, {
      headers: {
        Cookie: `session=${nonAdminToken}`,
        Accept: 'text/html'
      }
    });
    assert.strictEqual(nonAdminWebRes.status, 403);

    // ------------------------------------------------------------------------
    // 3. Assign Admin Role to a Specific User & Access Panel
    // ------------------------------------------------------------------------
    const specificUser = await User.create({
      name: 'Promoted Super Admin',
      department: 'Yönetim Bilişim Sistemleri',
      graduationYear: 2021,
      email: 'promoted.admin@alumni.edu',
      role: 'student'
    });
    assert.strictEqual(specificUser.role, 'student');

    // Assign admin role to specific user
    const updatedRoleUser = await User.assignRole(specificUser.id, 'admin');
    assert.strictEqual(updatedRoleUser.role, 'admin');

    // Admin user logs in via API and receives admin token
    const adminLoginRes = await fetch(`http://127.0.0.1:${port}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: 'promoted.admin@alumni.edu', password: 'Password123!' })
    });
    assert.strictEqual(adminLoginRes.status, 200);
    const adminLoginJson = await adminLoginRes.json();
    assert.strictEqual(adminLoginJson.user.role, 'admin');
    const adminToken = adminLoginJson.token;
    assert.ok(adminToken);

    // Admin accesses Web Panel -> 200 OK HTML
    const adminWebRes = await fetch(`http://127.0.0.1:${port}/admin`, {
      headers: {
        Cookie: `session=${adminToken}`,
        Accept: 'text/html'
      }
    });
    assert.strictEqual(adminWebRes.status, 200);
    const adminHtml = await adminWebRes.text();
    assert.ok(adminHtml.includes('Administration Panel'));
    assert.ok(adminHtml.includes('Fast Direct Data Manipulation'));
    assert.ok(adminHtml.includes('Promoted Super Admin'));

    // Admin accesses REST API -> 200 OK JSON with metrics
    const adminOverviewRes = await fetch(`http://127.0.0.1:${port}/api/admin/overview`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        Accept: 'application/json'
      }
    });
    assert.strictEqual(adminOverviewRes.status, 200);
    const adminOverviewJson = await adminOverviewRes.json();
    assert.ok(adminOverviewJson.metrics);
    assert.ok(typeof adminOverviewJson.metrics.usersCount === 'number');
    assert.ok(Array.isArray(adminOverviewJson.users));

    // ------------------------------------------------------------------------
    // 4. Data Manipulation: Role & Status Updates
    // ------------------------------------------------------------------------
    // Web: POST /admin/users/:id/role to reassign role
    const updateRoleFormRes = await fetch(`http://127.0.0.1:${port}/admin/users/${regularUser.id}/role`, {
      method: 'POST',
      headers: {
        Cookie: `session=${adminToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html'
      },
      body: new URLSearchParams({ role: 'moderator' }),
      redirect: 'manual'
    });
    assert.strictEqual(updateRoleFormRes.status, 302);
    assert.ok(updateRoleFormRes.headers.get('location').includes('/admin?roleUpdated=1'));
    let checkedUser = await User.findById(regularUser.id);
    assert.strictEqual(checkedUser.role, 'moderator');

    // API: PATCH /api/admin/users/:id/role
    const patchRoleApiRes = await fetch(`http://127.0.0.1:${port}/api/admin/users/${regularUser.id}/role`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ role: 'employer' })
    });
    assert.strictEqual(patchRoleApiRes.status, 200);
    const patchRoleJson = await patchRoleApiRes.json();
    assert.strictEqual(patchRoleJson.user.role, 'employer');
    checkedUser = await User.findById(regularUser.id);
    assert.strictEqual(checkedUser.role, 'employer');

    // Web: POST /admin/users/:id/status to suspend user
    const updateStatusFormRes = await fetch(`http://127.0.0.1:${port}/admin/users/${regularUser.id}/status`, {
      method: 'POST',
      headers: {
        Cookie: `session=${adminToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html'
      },
      body: new URLSearchParams({ status: 'suspended' }),
      redirect: 'manual'
    });
    assert.strictEqual(updateStatusFormRes.status, 302);
    assert.ok(updateStatusFormRes.headers.get('location').includes('/admin?statusUpdated=1'));
    checkedUser = await User.findById(regularUser.id);
    assert.strictEqual(checkedUser.accountStatus, 'suspended');

    // API: PATCH /api/admin/users/:id/status to reactivate
    const patchStatusApiRes = await fetch(`http://127.0.0.1:${port}/api/admin/users/${regularUser.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ status: 'active' })
    });
    assert.strictEqual(patchStatusApiRes.status, 200);
    checkedUser = await User.findById(regularUser.id);
    assert.strictEqual(checkedUser.accountStatus, 'active');

    // ------------------------------------------------------------------------
    // 5. Direct Fast Data Manipulation Engine (/admin/manipulate)
    // ------------------------------------------------------------------------
    // Mutate User Title via API
    const mutateUserRes = await fetch(`http://127.0.0.1:${port}/api/admin/manipulate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        entity: 'user',
        id: regularUser.id,
        field: 'title',
        value: 'Chief Technology Officer'
      })
    });
    assert.strictEqual(mutateUserRes.status, 200);
    const mutateUserJson = await mutateUserRes.json();
    assert.strictEqual(mutateUserJson.result.title, 'Chief Technology Officer');
    checkedUser = await User.findById(regularUser.id);
    assert.strictEqual(checkedUser.title, 'Chief Technology Officer');

    // Mutate Job salary via API
    const mutateJobRes = await fetch(`http://127.0.0.1:${port}/api/admin/manipulate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        entity: 'job',
        id: 1,
        field: 'salary',
        value: '180,000 TL'
      })
    });
    assert.strictEqual(mutateJobRes.status, 200);
    const mutateJobJson = await mutateJobRes.json();
    assert.strictEqual(mutateJobJson.result.salary, '180,000 TL');

    // Mutate Announcement Title via Web Form
    const mutateAnnFormRes = await fetch(`http://127.0.0.1:${port}/admin/manipulate`, {
      method: 'POST',
      headers: {
        Cookie: `session=${adminToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html'
      },
      body: new URLSearchParams({
        entity: 'announcement',
        id: '1',
        field: 'title',
        value: 'Manipulated Grand Gala 2026'
      }),
      redirect: 'manual'
    });
    assert.strictEqual(mutateAnnFormRes.status, 302);
    assert.ok(mutateAnnFormRes.headers.get('location').includes('/admin?manipulated=1'));

    // Validation error when field or id missing
    const badManipulateRes = await fetch(`http://127.0.0.1:${port}/api/admin/manipulate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ entity: 'user', id: 1 })
    });
    assert.strictEqual(badManipulateRes.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});


