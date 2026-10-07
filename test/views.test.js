const test = require('node:test');
const assert = require('node:assert');
const UserView = require('../views/UserView');

test('UserView - renderUsers renders alumni list and form for POST /users', () => {
  const dummyUsers = [
    { id: 1, name: 'Hakan Ural', department: 'Computer Engineering', graduationYear: 2024, email: 'hakan@alumni.edu' },
    { id: 2, name: 'Ayşe Yılmaz', department: 'Industrial Engineering', graduationYear: 2023, email: 'ayse@alumni.edu' }
  ];

  const html = UserView.renderUsers(dummyUsers);
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Alumni Directory'));
  assert.ok(html.includes('Hakan Ural'));
  assert.ok(html.includes('Computer Engineering'));
  assert.ok(html.includes('Ayşe Yılmaz'));
  assert.ok(html.includes('<form action="/users" method="POST">'));
  assert.ok(html.includes('name="name"'));
  assert.ok(html.includes('name="department"'));
  assert.ok(html.includes('name="graduationYear"'));
  assert.ok(html.includes('name="email"'));
});

test('UserView - renderUsers displays success message when passed in options', () => {
  const html = UserView.renderUsers([], { message: 'Alumni created successfully!' });
  assert.ok(html.includes('Alumni created successfully!'));
  assert.ok(html.includes('alert-success'));
});

test('UserView - renderUserDetail renders single alumni profile view', () => {
  const user = { id: 42, name: 'Zeynep Kaya', department: 'Architecture', graduationYear: 2021, email: 'zeynep@alumni.edu' };
  const html = UserView.renderUserDetail(user);
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Zeynep Kaya'));
  assert.ok(html.includes('Architecture'));
  assert.ok(html.includes('2021'));
  assert.ok(html.includes('zeynep@alumni.edu'));
});

test('UserView - renderUserEdit renders alumni edit form view', () => {
  const user = { id: 10, name: 'Can Demir', department: 'Economics', graduationYear: 2022, email: 'can@alumni.edu' };
  const html = UserView.renderUserEdit(user);
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Edit Alumni Profile'));
  assert.ok(html.includes('action="/users/10/edit"'));
  assert.ok(html.includes('value="Can Demir"'));
  assert.ok(html.includes('value="Economics"'));
  assert.ok(html.includes('value="2022"'));
  assert.ok(html.includes('value="can@alumni.edu"'));
});
