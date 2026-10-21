const test = require('node:test');
const assert = require('node:assert');
const app = require('../index');
const apiApplicationRouter = require('../routes/apiApplication');
const applicationRouter = require('../routes/application');
const ApiApplicationController = require('../controllers/ApiApplicationController');
const ApplicationController = require('../controllers/ApplicationController');

test('routes/apiApplication.js has all required direct and nested CRUD routes', () => {
  const routeMap = {};
  for (const layer of apiApplicationRouter.stack) {
    if (layer.route) {
      const p = layer.route.path;
      if (!routeMap[p]) routeMap[p] = { methods: [], handlers: [] };
      routeMap[p].methods.push(...Object.keys(layer.route.methods));
      routeMap[p].handlers.push(...layer.route.stack.map(s => s.handle));
    }
  }

  assert.ok(routeMap['/']);
  assert.ok(routeMap['/'].methods.includes('get'));
  assert.ok(routeMap['/'].methods.includes('post'));
  assert.ok(routeMap['/'].handlers.includes(ApiApplicationController.getAll));
  assert.ok(routeMap['/'].handlers.includes(ApiApplicationController.create));

  assert.ok(routeMap['/:id']);
  assert.ok(routeMap['/:id'].methods.includes('get'));
  assert.ok(routeMap['/:id'].methods.includes('put'));
  assert.ok(routeMap['/:id'].methods.includes('patch'));
  assert.ok(routeMap['/:id'].methods.includes('delete'));
  assert.ok(routeMap['/:id'].handlers.includes(ApiApplicationController.getById));
  assert.ok(routeMap['/:id'].handlers.includes(ApiApplicationController.update));
  assert.ok(routeMap['/:id'].handlers.includes(ApiApplicationController.partialUpdate));
  assert.ok(routeMap['/:id'].handlers.includes(ApiApplicationController.delete));
});

test('routes/application.js has direct web presentation routes', () => {
  const routeMap = {};
  for (const layer of applicationRouter.stack) {
    if (layer.route) {
      const p = layer.route.path;
      if (!routeMap[p]) routeMap[p] = { methods: [], handlers: [] };
      routeMap[p].methods.push(...Object.keys(layer.route.methods));
      routeMap[p].handlers.push(...layer.route.stack.map(s => s.handle));
    }
  }

  assert.ok(routeMap['/']);
  assert.ok(routeMap['/'].methods.includes('get'));
  assert.ok(routeMap['/'].handlers.includes(ApplicationController.getAll));

  assert.ok(routeMap['/:id']);
  assert.ok(routeMap['/:id'].methods.includes('get'));
  assert.ok(routeMap['/:id'].handlers.includes(ApplicationController.getById));
});

test('Direct API Route: GET /api/applications returns list of applications', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/applications`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Direct API Route: POST /api/applications creates an application', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 2,
        jobPostingId: 2,
        resumeUrl: 'https://storage.example.com/resumes/user2-job2.pdf',
        coverNote: 'Excited to apply for this position!'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.application);
    assert.strictEqual(Number(data.application.userId), 2);
    assert.strictEqual(Number(data.application.jobPostingId), 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Direct API Route: GET /api/applications/:id, PUT, PATCH, DELETE', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // 1. GET
    const getRes = await fetch(`http://127.0.0.1:${port}/api/applications/1`);
    assert.strictEqual(getRes.status, 200);
    const appData = await getRes.json();
    assert.strictEqual(Number(appData.id), 1);
    assert.ok(appData.user || appData.candidate);

    // 2. PUT
    const putRes = await fetch(`http://127.0.0.1:${port}/api/applications/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Reviewing' })
    });
    assert.strictEqual(putRes.status, 200);

    // 3. PATCH
    const patchRes = await fetch(`http://127.0.0.1:${port}/api/applications/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Accepted' })
    });
    assert.strictEqual(patchRes.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Nested Route: GET /api/users/:userId/applications returns user applications', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/users/1/applications`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.every(a => Number(a.userId) === 1));

    // Test non-existent user
    const notFoundRes = await fetch(`http://127.0.0.1:${port}/api/users/9999/applications`);
    assert.strictEqual(notFoundRes.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Nested Route: POST /api/users/:userId/applications binds userId from URL', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/users/3/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobPostingId: 1,
        coverNote: 'Applying from user profile'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(Number(data.application.userId), 3);
    assert.strictEqual(Number(data.application.jobPostingId), 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Nested Route: GET /api/jobs/:jobId/applications returns candidates for job', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/jobs/1/applications`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.every(a => Number(a.jobPostingId) === 1));

    // Test non-existent job
    const notFoundRes = await fetch(`http://127.0.0.1:${port}/api/jobs/9999/applications`);
    assert.strictEqual(notFoundRes.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Nested Route: POST /api/jobs/:jobId/applications binds jobPostingId from URL', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/jobs/3/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        coverNote: 'Applying directly to job 3'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(Number(data.application.jobPostingId), 3);
    assert.strictEqual(Number(data.application.userId), 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Web Direct & Nested Routes: /applications, /users/:userId/applications, /jobs/:jobId/applications return 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const appsRes = await fetch(`http://127.0.0.1:${port}/applications`);
    assert.strictEqual(appsRes.status, 200);

    const userAppsRes = await fetch(`http://127.0.0.1:${port}/users/1/applications`);
    assert.strictEqual(userAppsRes.status, 200);

    const jobAppsRes = await fetch(`http://127.0.0.1:${port}/jobs/1/applications`);
    assert.strictEqual(jobAppsRes.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
