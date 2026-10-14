const test = require('node:test');
const assert = require('node:assert');
const Announcement = require('../models/Announcement');

test('Announcement Model - findAll returns all announcements', async () => {
  const announcements = await Announcement.findAll();
  assert.ok(Array.isArray(announcements));
  assert.ok(announcements.length >= 1);
  assert.ok(announcements[0].id);
});

test('Announcement Model - findById returns announcement by id or null if not found', async () => {
  const existing = await Announcement.findById(1);
  assert.ok(existing);
  assert.strictEqual(existing.id, 1);
  assert.ok(existing.title);

  const missing = await Announcement.findById(9999);
  assert.strictEqual(missing, null);
});

test('Announcement Model - create adds new announcement and returns created item', async () => {
  const newItem = await Announcement.create({
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

  const fetched = await Announcement.findById(newItem.id);
  assert.strictEqual(fetched.title, 'Test Career Workshop');
});

test('Announcement Model - update modifies existing announcement or returns null if not found', async () => {
  const updated = await Announcement.update(1, {
    title: 'Updated Homecoming 2026',
    category: 'Event'
  });

  assert.ok(updated);
  assert.strictEqual(updated.title, 'Updated Homecoming 2026');

  const missing = await Announcement.update(9999, { title: 'Ghost' });
  assert.strictEqual(missing, null);
});

test('Announcement Model - delete removes announcement or returns null if not found', async () => {
  const created = await Announcement.create({ title: 'Temporary Note', content: 'Will be deleted' });
  const deleted = await Announcement.delete(created.id);
  assert.ok(deleted);
  assert.strictEqual(deleted.id, created.id);

  const recheck = await Announcement.findById(created.id);
  assert.strictEqual(recheck, null);

  const missing = await Announcement.delete(9999);
  assert.strictEqual(missing, null);
});
