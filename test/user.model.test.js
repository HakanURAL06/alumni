const test = require('node:test');
const assert = require('node:assert');
const User = require('../models/User');

test('User Model - findAll returns all users', () => {
  const users = User.findAll();
  assert.ok(Array.isArray(users));
  assert.ok(users.length >= 3);
});

test('User Model - findById returns user by id or null if not found', () => {
  const user = User.findById(1);
  assert.strictEqual(user.id, 1);
  assert.strictEqual(user.name, 'Hakan Ural');

  const notFound = User.findById(9999);
  assert.strictEqual(notFound, null);
});

test('User Model - create adds new user and returns created user', () => {
  const newUser = User.create({
    name: 'Selin Yıldız',
    department: 'Software Engineering',
    graduationYear: 2025,
    email: 'selin@alumni.edu'
  });

  assert.ok(newUser.id > 3);
  assert.strictEqual(newUser.name, 'Selin Yıldız');
  assert.strictEqual(newUser.department, 'Software Engineering');

  const found = User.findById(newUser.id);
  assert.strictEqual(found.name, 'Selin Yıldız');
});

test('User Model - update modifies existing user or returns null if not found', () => {
  const updated = User.update(1, { department: 'Data Science' });
  assert.strictEqual(updated.department, 'Data Science');

  const notFound = User.update(9999, { department: 'Test' });
  assert.strictEqual(notFound, null);
});

test('User Model - delete removes user or returns null if not found', () => {
  // Create a temporary user to delete
  const tempUser = User.create({ name: 'Temp User' });
  const deleted = User.delete(tempUser.id);
  assert.strictEqual(deleted.id, tempUser.id);

  const afterDelete = User.findById(tempUser.id);
  assert.strictEqual(afterDelete, null);

  const notFound = User.delete(9999);
  assert.strictEqual(notFound, null);
});
