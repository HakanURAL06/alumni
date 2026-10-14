const test = require('node:test');
const assert = require('node:assert');
const User = require('../models/User');

test('User Model - findAll returns all users', async () => {
  const users = await User.findAll();
  assert.ok(Array.isArray(users));
  assert.ok(users.length >= 3);
});

test('User Model - findById returns user by id or null if not found', async () => {
  const user = await User.findById(1);
  assert.ok(user);
  assert.strictEqual(user.id, 1);
  assert.ok(user.name.includes('Hakan Ural'));

  const notFound = await User.findById(9999);
  assert.strictEqual(notFound, null);
});

test('User Model - create adds new user and returns created user', async () => {
  const newUser = await User.create({
    name: 'Selin Yıldız',
    department: 'Software Engineering',
    graduationYear: 2025,
    email: 'selin@alumni.edu'
  });

  assert.ok(newUser.id > 3);
  assert.strictEqual(newUser.name, 'Selin Yıldız');
  assert.strictEqual(newUser.department, 'Software Engineering');

  const found = await User.findById(newUser.id);
  assert.strictEqual(found.name, 'Selin Yıldız');
});

test('User Model - update modifies existing user or returns null if not found', async () => {
  const updated = await User.update(1, { department: 'Data Science' });
  assert.strictEqual(updated.department, 'Data Science');

  const notFound = await User.update(9999, { department: 'Test' });
  assert.strictEqual(notFound, null);
});

test('User Model - delete removes user or returns null if not found', async () => {
  // Create a temporary user to delete
  const tempUser = await User.create({ name: 'Temp User' });
  const deleted = await User.delete(tempUser.id);
  assert.strictEqual(deleted.id, tempUser.id);

  const afterDelete = await User.findById(tempUser.id);
  assert.strictEqual(afterDelete, null);

  const notFound = await User.delete(9999);
  assert.strictEqual(notFound, null);
});
