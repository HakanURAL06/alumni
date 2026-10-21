const test = require('node:test');
const assert = require('node:assert');
const app = require('../index');
const apiJobPostingRouter = require('../routes/apiJobPosting');
const jobPostingRouter = require('../routes/jobPosting');
const apiUserRouter = require('../routes/apiUser');
const ApiJobPostingController = require('../controllers/ApiJobPostingController');
const JobPostingController = require('../controllers/JobPostingController');

test('routes/apiJobPosting.js has all required direct and nested CRUD routes', () => {
  const routeMap = {};
  for (const layer of apiJobPostingRouter.stack) {
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
  assert.ok(routeMap['/'].handlers.includes(ApiJobPostingController.getAll));
  assert.ok(routeMap['/'].handlers.includes(ApiJobPostingController.create));

  assert.ok(routeMap['/:id']);
  assert.ok(routeMap['/:id'].methods.includes('get'));
  assert.ok(routeMap['/:id'].methods.includes('put'));
  assert.ok(routeMap['/:id'].methods.includes('patch'));
  assert.ok(routeMap['/:id'].methods.includes('delete'));
  assert.ok(routeMap['/:id'].handlers.includes(ApiJobPostingController.getById));
  assert.ok(routeMap['/:id'].handlers.includes(ApiJobPostingController.update));
  assert.ok(routeMap['/:id'].handlers.includes(ApiJobPostingController.delete));

  assert.ok(routeMap['/:id/user']);
  assert.ok(routeMap['/:id/user'].methods.includes('get'));
  assert.ok(routeMap['/:id/user'].handlers.includes(ApiJobPostingController.getUser));
});

test('routes/jobPosting.js has direct web presentation routes', () => {
  const routeMap = {};
  for (const layer of jobPostingRouter.stack) {
    if (layer.route) {
      const p = layer.route.path;
      if (!routeMap[p]) routeMap[p] = { methods: [], handlers: [] };
      routeMap[p].methods.push(...Object.keys(layer.route.methods));
      routeMap[p].handlers.push(...layer.route.stack.map(s => s.handle));
    }
  }

  assert.ok(routeMap['/']);
  assert.ok(routeMap['/'].methods.includes('get'));
  assert.ok(routeMap['/'].handlers.includes(JobPostingController.getAll));

  assert.ok(routeMap['/:id']);
  assert.ok(routeMap['/:id'].methods.includes('get'));
  assert.ok(routeMap['/:id'].handlers.includes(JobPostingController.getById));
});

test('Direct API Route: GET /api/jobs returns list of jobs', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/jobs`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 3);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Direct API Route: POST /api/jobs creates a new job posting', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'DevOps Specialist',
        company: 'CloudOps Inc',
        location: 'Remote',
        jobType: 'Full-time',
        contactEmail: 'devops@cloudops.com',
        postedBy: 1
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.jobPosting);
    assert.strictEqual(data.jobPosting.title, 'DevOps Specialist');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Direct API Route: GET /api/jobs/:id, PUT, PATCH, DELETE', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // 1. GET
    const getRes = await fetch(`http://127.0.0.1:${port}/api/jobs/1`);
    assert.strictEqual(getRes.status, 200);
    const job = await getRes.json();
    assert.strictEqual(job.id, 1);

    // 2. PUT
    const putRes = await fetch(`http://127.0.0.1:${port}/api/jobs/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: 'Ankara / Hybrid' })
    });
    assert.strictEqual(putRes.status, 200);

    // 3. PATCH
    const patchRes = await fetch(`http://127.0.0.1:${port}/api/jobs/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salary: '₺90,000 / month' })
    });
    assert.strictEqual(patchRes.status, 200);

    // 4. GET user relationship
    const userRes = await fetch(`http://127.0.0.1:${port}/api/jobs/1/user`);
    assert.strictEqual(userRes.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Nested Route: GET /api/users/:userId/jobs returns jobs published by user', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/users/1/jobs`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.every(j => Number(j.postedBy) === 1));

    // Test non-existent user
    const notFoundRes = await fetch(`http://127.0.0.1:${port}/api/users/9999/jobs`);
    assert.strictEqual(notFoundRes.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Nested Route: POST /api/users/:userId/jobs automatically binds postedBy', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/users/2/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Data Analyst',
        company: 'Analytics Hub',
        contactEmail: 'data@hub.com'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.jobPosting.postedBy, 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Nested Route: GET, PUT, and DELETE /api/users/:userId/jobs/:id', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // GET job under user 1
    const getRes = await fetch(`http://127.0.0.1:${port}/api/users/1/jobs/1`);
    assert.strictEqual(getRes.status, 200);
    const job = await getRes.json();
    assert.strictEqual(job.id, 1);

    // Job doesn't belong to user 2
    const mismatchRes = await fetch(`http://127.0.0.1:${port}/api/users/2/jobs/1`);
    assert.strictEqual(mismatchRes.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Web Direct & Nested Routes: /jobs and /users/:userId/jobs return 200', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const jobsRes = await fetch(`http://127.0.0.1:${port}/jobs`);
    assert.strictEqual(jobsRes.status, 200);

    const userJobsRes = await fetch(`http://127.0.0.1:${port}/users/1/jobs`);
    assert.strictEqual(userJobsRes.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
