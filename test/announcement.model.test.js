const test = require('node:test');
const assert = require('node:assert');
const Announcement = require('../models/Announcement');

test('Announcement Model - findAll returns all announcements', () => {
  const announcements = Announcement.findAll();
  assert.ok(Array.isArray(announcements));
  assert.ok(announcements.length >= 1);
  assert.strictEqual(announcements[0].id, 1);
});

test('Announcement Model - findById returns announcement by id or null if not found', () => {
  const existing = Announcement.findById(1);
  assert.ok(existing);
  assert.strictEqual(existing.id, 1);
  assert.ok(existing.title);

  const missing = Announcement.findById(9999);
  assert.strictEqual(missing, null);
});

test('Announcement Model - create adds new announcement and returns created item', () => {
  const newItem = Announcement.create({
    title: 'Test Career Workshop',
    content: 'Hands-on resume building workshop',
    category: 'Career',
    author: 'Career Advisory'
  });

  assert.ok(newItem);
  assert.ok(newItem.id);
  assert.strictEqual(newItem.title, 'Test Career Workshop');
  assert.strictEqual(newItem.category, 'Career');
  assert.strictEqual(newItem.author, 'Career Advisory');

  const fetched = Announcement.findById(newItem.id);
  assert.strictEqual(fetched.title, 'Test Career Workshop');
});

test('Announcement Model - update modifies existing announcement or returns null if not found', () => {
  const updated = Announcement.update(1, {
    title: 'Updated Homecoming 2026',
    category: 'Event'
  });

  assert.ok(updated);
  assert.strictEqual(updated.title, 'Updated Homecoming 2026');

  const missing = Announcement.update(9999, { title: 'Ghost' });
  assert.strictEqual(missing, null);
});

test('Announcement Model - delete removes announcement or returns null if not found', () => {
  const created = Announcement.create({ title: 'Temporary Note', content: 'Will be deleted' });
  const deleted = Announcement.delete(created.id);
  assert.ok(deleted);
  assert.strictEqual(deleted.id, created.id);

  const recheck = Announcement.findById(created.id);
  assert.strictEqual(recheck, null);

  const missing = Announcement.delete(9999);
  assert.strictEqual(missing, null);
});
