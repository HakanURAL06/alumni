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

test('User Model - assignRole updates role and enforces valid roles (USR-R3..USR-R6)', async () => {
  const user = await User.create({
    name: 'Role Test User',
    department: 'Hukuk',
    graduationYear: 2022,
    email: 'role.test@alumni.edu',
    role: 'alumni'
  });

  // Assign admin role to this specific user
  const promoted = await User.assignRole(user.id, 'admin');
  assert.strictEqual(promoted.role, 'admin');

  // Verify retrieval reflects new role
  const found = await User.findById(user.id);
  assert.strictEqual(found.role, 'admin');

  // Assign by email
  const modUser = await User.assignRole('role.test@alumni.edu', 'moderator');
  assert.strictEqual(modUser.role, 'moderator');

  // Invalid role throws error
  await assert.rejects(
    async () => { await User.assignRole(user.id, 'invalid_role'); },
    /Invalid role/
  );
});

test('User Model - updateAccountStatus transitions status and enforces valid statuses', async () => {
  const user = await User.create({
    name: 'Status Test User',
    department: 'İktisat',
    graduationYear: 2020,
    email: 'status.test@alumni.edu',
    accountStatus: 'active'
  });

  const suspended = await User.updateAccountStatus(user.id, 'suspended');
  assert.strictEqual(suspended.accountStatus, 'suspended');

  const found = await User.findById(user.id);
  assert.strictEqual(found.accountStatus, 'suspended');

  // Invalid status throws error
  await assert.rejects(
    async () => { await User.updateAccountStatus(user.id, 'bogus_status'); },
    /Invalid status/
  );
});
