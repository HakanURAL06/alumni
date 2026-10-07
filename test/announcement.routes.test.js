const test = require('node:test');
const assert = require('node:assert');
const announcementRouter = require('../routes/announcement');
const apiAnnouncementRouter = require('../routes/apiAnnouncement');
const AnnouncementController = require('../controllers/AnnouncementController');
const ApiAnnouncementController = require('../controllers/ApiAnnouncementController');
const AnnouncementView = require('../views/AnnouncementView');

test('routes/announcement.js has all required CRUD routes mapped to AnnouncementController', () => {
  const routeMap = {};
  for (const layer of announcementRouter.stack) {
    if (layer.route) {
      const p = layer.route.path;
      if (!routeMap[p]) routeMap[p] = { methods: [], handlers: [] };
      routeMap[p].methods.push(...Object.keys(layer.route.methods));
      routeMap[p].handlers.push(...layer.route.stack.map(s => s.handle));
    }
  }

  // Check '/' and '/announcements'
  assert.ok(routeMap['/']);
  assert.ok(routeMap['/'].methods.includes('get'));
  assert.ok(routeMap['/'].methods.includes('post'));
  assert.ok(routeMap['/'].handlers.includes(AnnouncementController.getAll));
  assert.ok(routeMap['/'].handlers.includes(AnnouncementController.create));

  assert.ok(routeMap['/announcements']);
  assert.ok(routeMap['/announcements'].methods.includes('get'));
  assert.ok(routeMap['/announcements'].methods.includes('post'));

  // Check '/:id'
  assert.ok(routeMap['/:id']);
  assert.ok(routeMap['/:id'].methods.includes('get'));
  assert.ok(routeMap['/:id'].methods.includes('put'));
  assert.ok(routeMap['/:id'].methods.includes('patch'));
  assert.ok(routeMap['/:id'].methods.includes('delete'));
  assert.ok(routeMap['/:id'].handlers.includes(AnnouncementController.getById));
  assert.ok(routeMap['/:id'].handlers.includes(AnnouncementController.update));
  assert.ok(routeMap['/:id'].handlers.includes(AnnouncementController.delete));

  // Check '/:id/edit'
  assert.ok(routeMap['/:id/edit']);
  assert.ok(routeMap['/:id/edit'].methods.includes('get'));
  assert.ok(routeMap['/:id/edit'].methods.includes('post'));
  assert.ok(routeMap['/:id/edit'].handlers.includes(AnnouncementController.getEditForm));

  // Check '/:id/delete'
  assert.ok(routeMap['/:id/delete']);
  assert.ok(routeMap['/:id/delete'].methods.includes('post'));
  assert.ok(routeMap['/:id/delete'].handlers.includes(AnnouncementController.delete));
});

test('routes/apiAnnouncement.js has all required CRUD routes mapped to ApiAnnouncementController', () => {
  const routeMap = {};
  for (const layer of apiAnnouncementRouter.stack) {
    if (layer.route) {
      const p = layer.route.path;
      if (!routeMap[p]) routeMap[p] = { methods: [], handlers: [] };
      routeMap[p].methods.push(...Object.keys(layer.route.methods));
      routeMap[p].handlers.push(...layer.route.stack.map(s => s.handle));
    }
  }

  // Check '/'
  assert.ok(routeMap['/']);
  assert.ok(routeMap['/'].methods.includes('get'));
  assert.ok(routeMap['/'].methods.includes('post'));
  assert.ok(routeMap['/'].handlers.includes(ApiAnnouncementController.getAll));
  assert.ok(routeMap['/'].handlers.includes(ApiAnnouncementController.create));

  // Check '/:id'
  assert.ok(routeMap['/:id']);
  assert.ok(routeMap['/:id'].methods.includes('get'));
  assert.ok(routeMap['/:id'].methods.includes('put'));
  assert.ok(routeMap['/:id'].methods.includes('patch'));
  assert.ok(routeMap['/:id'].methods.includes('delete'));
  assert.ok(routeMap['/:id'].handlers.includes(ApiAnnouncementController.getById));
  assert.ok(routeMap['/:id'].handlers.includes(ApiAnnouncementController.update));
  assert.ok(routeMap['/:id'].handlers.includes(ApiAnnouncementController.partialUpdate));
  assert.ok(routeMap['/:id'].handlers.includes(ApiAnnouncementController.delete));
});

test('AnnouncementView renders management interface, detail, and edit templates', () => {
  const dummy = [
    { id: 1, title: 'Sample Event', category: 'Event', author: 'Office', date: '2026-10-10', content: 'Testing content' }
  ];

  const htmlList = AnnouncementView.renderAnnouncements(dummy, { message: 'Alert Test' });
  assert.ok(typeof htmlList === 'string');
  assert.ok(htmlList.includes('Announcements Management'));
  assert.ok(htmlList.includes('Sample Event'));
  assert.ok(htmlList.includes('Alert Test'));
  assert.ok(htmlList.includes('<form action="/announcements" method="POST">'));

  const htmlDetail = AnnouncementView.renderAnnouncementDetail(dummy[0]);
  assert.ok(typeof htmlDetail === 'string');
  assert.ok(htmlDetail.includes('Sample Event'));
  assert.ok(htmlDetail.includes('Testing content'));
  assert.ok(htmlDetail.includes('/announcements/1/edit'));

  const htmlEdit = AnnouncementView.renderAnnouncementEdit(dummy[0]);
  assert.ok(typeof htmlEdit === 'string');
  assert.ok(htmlEdit.includes('Edit Announcement'));
  assert.ok(htmlEdit.includes('value="Sample Event"'));
  assert.ok(htmlEdit.includes('action="/announcements/1/edit"'));
});
