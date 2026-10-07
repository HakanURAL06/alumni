const test = require('node:test');
const assert = require('node:assert');
const ApiUserController = require('../controllers/ApiUserController');
const UserController = require('../controllers/UserController');

function mockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    },
    redirect(url) {
      this.redirectUrl = url;
      return this;
    }
  };
  return res;
}

test('ApiUserController - getAll returns 200 and list of users', () => {
  const req = {};
  const res = mockResponse();
  ApiUserController.getAll(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body));
});

test('ApiUserController - getById returns 200 or 404', () => {
  const req1 = { params: { id: 1 } };
  const res1 = mockResponse();
  ApiUserController.getById(req1, res1);
  assert.strictEqual(res1.statusCode, 200);
  assert.strictEqual(res1.body.id, 1);

  const req2 = { params: { id: 9999 } };
  const res2 = mockResponse();
  ApiUserController.getById(req2, res2);
  assert.strictEqual(res2.statusCode, 404);
});

test('ApiUserController - create adds user and returns 201', () => {
  const req = { body: { name: 'Test User', department: 'Civil Eng' } };
  const res = mockResponse();
  ApiUserController.create(req, res);
  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.user.name, 'Test User');
});

test('ApiUserController - update & partialUpdate modify user or return 404', () => {
  const req1 = { params: { id: 1 }, body: { department: 'Robotics' } };
  const res1 = mockResponse();
  ApiUserController.update(req1, res1);
  assert.strictEqual(res1.statusCode, 200);
  assert.strictEqual(res1.body.user.department, 'Robotics');

  const req2 = { params: { id: 1 }, body: { email: 'hakan.robo@alumni.edu' } };
  const res2 = mockResponse();
  ApiUserController.partialUpdate(req2, res2);
  assert.strictEqual(res2.statusCode, 200);
  assert.strictEqual(res2.body.user.email, 'hakan.robo@alumni.edu');

  const req3 = { params: { id: 9999 }, body: {} };
  const res3 = mockResponse();
  ApiUserController.update(req3, res3);
  assert.strictEqual(res3.statusCode, 404);
});

test('ApiUserController - delete removes user or returns 404', () => {
  const createReq = { body: { name: 'To Be Deleted' } };
  const createRes = mockResponse();
  ApiUserController.create(createReq, createRes);
  const newId = createRes.body.user.id;

  const deleteReq = { params: { id: newId } };
  const deleteRes = mockResponse();
  ApiUserController.delete(deleteReq, deleteRes);
  assert.strictEqual(deleteRes.statusCode, 200);
  assert.strictEqual(deleteRes.body.deletedUser.id, newId);

  const deleteReq404 = { params: { id: 9999 } };
  const deleteRes404 = mockResponse();
  ApiUserController.delete(deleteReq404, deleteRes404);
  assert.strictEqual(deleteRes404.statusCode, 404);
});

test('UserController - getAll renders HTML view', () => {
  const req = { accepts: (type) => type === 'html' };
  const res = mockResponse();
  UserController.getAll(req, res);
  assert.ok(typeof res.body === 'string');
  assert.ok(res.body.includes('Alumni Directory'));
});

test('UserController - getById renders HTML card or 404', () => {
  const req1 = { params: { id: 1 }, accepts: (type) => type === 'html' };
  const res1 = mockResponse();
  UserController.getById(req1, res1);
  assert.ok(res1.body.includes('Profile'));

  const req2 = { params: { id: 9999 }, accepts: (type) => type === 'html' };
  const res2 = mockResponse();
  UserController.getById(req2, res2);
  assert.strictEqual(res2.statusCode, 404);
});

test('UserController - getEditForm renders HTML edit form or 404', () => {
  const req1 = { params: { id: 1 }, accepts: (type) => type === 'html' };
  const res1 = mockResponse();
  UserController.getEditForm(req1, res1);
  assert.ok(res1.body.includes('Edit Alumni Profile'));

  const req2 = { params: { id: 9999 }, accepts: (type) => type === 'html' };
  const res2 = mockResponse();
  UserController.getEditForm(req2, res2);
  assert.strictEqual(res2.statusCode, 404);
});

test('UserController - create with HTML redirects to /users?success=1', () => {
  const req = {
    body: { name: 'Yeni Mezun', department: 'Bioengineering', graduationYear: 2025, email: 'yeni@alumni.edu' },
    accepts: (type) => type === 'html'
  };
  const res = mockResponse();
  UserController.create(req, res);
  assert.strictEqual(res.redirectUrl, '/users?success=1');
});

test('UserController - update with HTML redirects to /users?updated=1 or returns 404', () => {
  const req1 = {
    params: { id: 1 },
    body: { name: 'Hakan Güncel', department: 'AI' },
    accepts: (type) => type === 'html'
  };
  const res1 = mockResponse();
  UserController.update(req1, res1);
  assert.strictEqual(res1.redirectUrl, '/users?updated=1');

  const req2 = {
    params: { id: 9999 },
    body: {},
    accepts: (type) => type === 'html'
  };
  const res2 = mockResponse();
  UserController.update(req2, res2);
  assert.strictEqual(res2.statusCode, 404);
});

test('UserController - delete with HTML redirects to /users?deleted=1 or returns 404', () => {
  // First create a user to safely delete
  const createReq = { body: { name: 'Delete Me Soon' }, accepts: () => false };
  const createRes = mockResponse();
  UserController.create(createReq, createRes);
  const targetId = createRes.body.user.id;

  const req1 = { params: { id: targetId }, accepts: (type) => type === 'html' };
  const res1 = mockResponse();
  UserController.delete(req1, res1);
  assert.strictEqual(res1.redirectUrl, '/users?deleted=1');

  const req2 = { params: { id: 9999 }, accepts: (type) => type === 'html' };
  const res2 = mockResponse();
  UserController.delete(req2, res2);
  assert.strictEqual(res2.statusCode, 404);
});
