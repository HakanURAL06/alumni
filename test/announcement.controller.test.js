const test = require('node:test');
const assert = require('node:assert');
const ApiAnnouncementController = require('../controllers/ApiAnnouncementController');
const AnnouncementController = require('../controllers/AnnouncementController');

function mockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    redirectUrl: null,
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

// ----------------------------------------------------
// ApiAnnouncementController Tests
// ----------------------------------------------------
test('ApiAnnouncementController - getAll returns 200 and list', async () => {
  const req = {};
  const res = mockResponse();
  await ApiAnnouncementController.getAll(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body));
});

test('ApiAnnouncementController - getById returns 200 or 404', async () => {
  const req1 = { params: { id: 1 } };
  const res1 = mockResponse();
  await ApiAnnouncementController.getById(req1, res1);
  assert.strictEqual(res1.statusCode, 200);
  assert.strictEqual(res1.body.id, 1);

  const req2 = { params: { id: 9999 } };
  const res2 = mockResponse();
  await ApiAnnouncementController.getById(req2, res2);
  assert.strictEqual(res2.statusCode, 404);
});

test('ApiAnnouncementController - create adds announcement and returns 201', async () => {
  const req = { body: { title: 'API Event', content: 'Details', category: 'Event' } };
  const res = mockResponse();
  await ApiAnnouncementController.create(req, res);
  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.announcement.title, 'API Event');
});

test('ApiAnnouncementController - update & partialUpdate modify announcement or return 404', async () => {
  const req1 = { params: { id: 1 }, body: { title: 'Updated API Title' } };
  const res1 = mockResponse();
  await ApiAnnouncementController.update(req1, res1);
  assert.strictEqual(res1.statusCode, 200);
  assert.strictEqual(res1.body.announcement.title, 'Updated API Title');

  const req2 = { params: { id: 1 }, body: { content: 'Partial content updated' } };
  const res2 = mockResponse();
  await ApiAnnouncementController.partialUpdate(req2, res2);
  assert.strictEqual(res2.statusCode, 200);
  assert.strictEqual(res2.body.announcement.content, 'Partial content updated');

  const req3 = { params: { id: 9999 }, body: {} };
  const res3 = mockResponse();
  await ApiAnnouncementController.update(req3, res3);
  assert.strictEqual(res3.statusCode, 404);
});

test('ApiAnnouncementController - delete removes announcement or returns 404', async () => {
  const createReq = { body: { title: 'To Delete' } };
  const createRes = mockResponse();
  await ApiAnnouncementController.create(createReq, createRes);
  const targetId = createRes.body.announcement.id;

  const deleteReq = { params: { id: targetId } };
  const deleteRes = mockResponse();
  await ApiAnnouncementController.delete(deleteReq, deleteRes);
  assert.strictEqual(deleteRes.statusCode, 200);
  assert.strictEqual(deleteRes.body.deletedAnnouncement.id, targetId);

  const deleteReq404 = { params: { id: 9999 } };
  const deleteRes404 = mockResponse();
  await ApiAnnouncementController.delete(deleteReq404, deleteRes404);
  assert.strictEqual(deleteRes404.statusCode, 404);
});

// ----------------------------------------------------
// AnnouncementController (Web / View Layer) Tests
// ----------------------------------------------------
test('AnnouncementController - getAll renders HTML view', async () => {
  const req = { accepts: (t) => t === 'html', query: {} };
  const res = mockResponse();
  await AnnouncementController.getAll(req, res);
  assert.ok(typeof res.body === 'string');
  assert.ok(res.body.includes('Announcements Management'));
});

test('AnnouncementController - getById renders HTML detail or 404', async () => {
  const req1 = { params: { id: 1 }, accepts: (t) => t === 'html' };
  const res1 = mockResponse();
  await AnnouncementController.getById(req1, res1);
  assert.ok(typeof res1.body === 'string');
  assert.ok(res1.body.includes('Announcement Detail'));

  const req2 = { params: { id: 9999 }, accepts: (t) => t === 'html' };
  const res2 = mockResponse();
  await AnnouncementController.getById(req2, res2);
  assert.strictEqual(res2.statusCode, 404);
});

test('AnnouncementController - getEditForm renders HTML edit form or 404', async () => {
  const req1 = { params: { id: 1 }, accepts: (t) => t === 'html' };
  const res1 = mockResponse();
  await AnnouncementController.getEditForm(req1, res1);
  assert.ok(typeof res1.body === 'string');
  assert.ok(res1.body.includes('Edit Announcement'));

  const req2 = { params: { id: 9999 }, accepts: (t) => t === 'html' };
  const res2 = mockResponse();
  await AnnouncementController.getEditForm(req2, res2);
  assert.strictEqual(res2.statusCode, 404);
});

test('AnnouncementController - create with HTML redirects to /announcements?success=1', async () => {
  const req = {
    body: { title: 'Web Event', content: 'Content', category: 'Event', author: 'Alumni Office' },
    accepts: (t) => t === 'html'
  };
  const res = mockResponse();
  await AnnouncementController.create(req, res);
  assert.strictEqual(res.redirectUrl, '/announcements?success=1');
});

test('AnnouncementController - update with HTML redirects to /announcements?updated=1 or 404', async () => {
  const req1 = {
    params: { id: 1 },
    body: { title: 'Updated via Web' },
    accepts: (t) => t === 'html'
  };
  const res1 = mockResponse();
  await AnnouncementController.update(req1, res1);
  assert.strictEqual(res1.redirectUrl, '/announcements?updated=1');

  const req2 = {
    params: { id: 9999 },
    body: {},
    accepts: (t) => t === 'html'
  };
  const res2 = mockResponse();
  await AnnouncementController.update(req2, res2);
  assert.strictEqual(res2.statusCode, 404);
});

test('AnnouncementController - delete with HTML redirects to /announcements?deleted=1 or 404', async () => {
  const createReq = { body: { title: 'Temporary' }, accepts: () => false };
  const createRes = mockResponse();
  await AnnouncementController.create(createReq, createRes);
  const targetId = createRes.body.announcement.id;

  const req1 = { params: { id: targetId }, accepts: (t) => t === 'html' };
  const res1 = mockResponse();
  await AnnouncementController.delete(req1, res1);
  assert.strictEqual(res1.redirectUrl, '/announcements?deleted=1');

  const req2 = { params: { id: 9999 }, accepts: (t) => t === 'html' };
  const res2 = mockResponse();
  await AnnouncementController.delete(req2, res2);
  assert.strictEqual(res2.statusCode, 404);
});
