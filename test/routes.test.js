const test = require('node:test');
const assert = require('node:assert');
const userRouter = require('../routes/user');
const apiUserRouter = require('../routes/apiUser');
const UserController = require('../controllers/UserController');
const ApiUserController = require('../controllers/ApiUserController');

test('routes/user.js has all required CRUD routes mapped to UserController', () => {
  // Group by path
  const routeMap = {};
  for (const layer of userRouter.stack) {
    if (layer.route) {
      const p = layer.route.path;
      if (!routeMap[p]) routeMap[p] = { methods: [], handlers: [] };
      routeMap[p].methods.push(...Object.keys(layer.route.methods));
      routeMap[p].handlers.push(...layer.route.stack.map(s => s.handle));
    }
  }

  // Check root path '/' has GET and POST
  assert.ok(routeMap['/'], 'Route / should exist in userRouter');
  assert.ok(routeMap['/'].methods.includes('get'), 'GET / must be registered');
  assert.ok(routeMap['/'].methods.includes('post'), 'POST / must be registered');
  assert.ok(routeMap['/'].handlers.includes(UserController.getAll), 'GET / maps to UserController.getAll');
  assert.ok(routeMap['/'].handlers.includes(UserController.create), 'POST / maps to UserController.create');

  // Check '/users' path has GET and POST
  assert.ok(routeMap['/users'], 'Route /users should exist in userRouter');
  assert.ok(routeMap['/users'].methods.includes('get'), 'GET /users must be registered');
  assert.ok(routeMap['/users'].methods.includes('post'), 'POST /users must be registered');
  assert.ok(routeMap['/users'].handlers.includes(UserController.getAll), 'GET /users maps to UserController.getAll');
  assert.ok(routeMap['/users'].handlers.includes(UserController.create), 'POST /users maps to UserController.create');

  // Check '/:id' path has GET, PUT, PATCH, DELETE
  assert.ok(routeMap['/:id'], 'Route /:id should exist in userRouter');
  assert.ok(routeMap['/:id'].methods.includes('get'), 'GET /:id must be registered');
  assert.ok(routeMap['/:id'].methods.includes('put'), 'PUT /:id must be registered');
  assert.ok(routeMap['/:id'].methods.includes('patch'), 'PATCH /:id must be registered');
  assert.ok(routeMap['/:id'].methods.includes('delete'), 'DELETE /:id must be registered');
  assert.ok(routeMap['/:id'].handlers.includes(UserController.getById), 'GET /:id maps to UserController.getById');
  assert.ok(routeMap['/:id'].handlers.includes(UserController.update), 'PUT /:id maps to UserController.update');
  assert.ok(routeMap['/:id'].handlers.includes(UserController.delete), 'DELETE /:id maps to UserController.delete');

  // Check '/:id/edit' path has GET (edit form) and POST (edit submit)
  assert.ok(routeMap['/:id/edit'], 'Route /:id/edit should exist in userRouter');
  assert.ok(routeMap['/:id/edit'].methods.includes('get'), 'GET /:id/edit must be registered');
  assert.ok(routeMap['/:id/edit'].methods.includes('post'), 'POST /:id/edit must be registered');
  assert.ok(routeMap['/:id/edit'].handlers.includes(UserController.getEditForm), 'GET /:id/edit maps to UserController.getEditForm');
  assert.ok(routeMap['/:id/edit'].handlers.includes(UserController.update), 'POST /:id/edit maps to UserController.update');

  // Check '/:id/delete' path has POST (delete submit)
  assert.ok(routeMap['/:id/delete'], 'Route /:id/delete should exist in userRouter');
  assert.ok(routeMap['/:id/delete'].methods.includes('post'), 'POST /:id/delete must be registered');
  assert.ok(routeMap['/:id/delete'].handlers.includes(UserController.delete), 'POST /:id/delete maps to UserController.delete');
});

test('routes/apiUser.js has all required CRUD routes mapped to ApiUserController', () => {
  const routeMap = {};
  for (const layer of apiUserRouter.stack) {
    if (layer.route) {
      const p = layer.route.path;
      if (!routeMap[p]) routeMap[p] = { methods: [], handlers: [] };
      routeMap[p].methods.push(...Object.keys(layer.route.methods));
      routeMap[p].handlers.push(...layer.route.stack.map(s => s.handle));
    }
  }

  // Check root path '/' has GET and POST
  assert.ok(routeMap['/'], 'Route / should exist in apiUserRouter');
  assert.ok(routeMap['/'].methods.includes('get'), 'GET / must be registered');
  assert.ok(routeMap['/'].methods.includes('post'), 'POST / must be registered');
  assert.ok(routeMap['/'].handlers.includes(ApiUserController.getAll), 'GET / maps to ApiUserController.getAll');
  assert.ok(routeMap['/'].handlers.includes(ApiUserController.create), 'POST / maps to ApiUserController.create');

  // Check '/:id' path has GET, PUT, PATCH, DELETE
  assert.ok(routeMap['/:id'], 'Route /:id should exist in apiUserRouter');
  assert.ok(routeMap['/:id'].methods.includes('get'), 'GET /:id must be registered');
  assert.ok(routeMap['/:id'].methods.includes('put'), 'PUT /:id must be registered');
  assert.ok(routeMap['/:id'].methods.includes('patch'), 'PATCH /:id must be registered');
  assert.ok(routeMap['/:id'].methods.includes('delete'), 'DELETE /:id must be registered');
  assert.ok(routeMap['/:id'].handlers.includes(ApiUserController.getById), 'GET /:id maps to ApiUserController.getById');
  assert.ok(routeMap['/:id'].handlers.includes(ApiUserController.update), 'PUT /:id maps to ApiUserController.update');
  assert.ok(routeMap['/:id'].handlers.includes(ApiUserController.partialUpdate), 'PATCH /:id maps to ApiUserController.partialUpdate');
  assert.ok(routeMap['/:id'].handlers.includes(ApiUserController.delete), 'DELETE /:id maps to ApiUserController.delete');
});
