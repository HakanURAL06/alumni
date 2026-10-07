const express = require('express');
const router = express.Router();
const AnnouncementController = require('../controllers/AnnouncementController');

// ==================================================
// ANNOUNCEMENTS MANAGEMENT ROUTES (View Layer & Web)
// ==================================================

// 1. CREATE
router.post('/', AnnouncementController.create);
router.post('/announcements', AnnouncementController.create);

// 2. READ ALL (Management Dashboard)
router.get('/', AnnouncementController.getAll);
router.get('/announcements', AnnouncementController.getAll);

// 3. READ ONE (Detail View)
router.get('/:id', AnnouncementController.getById);
router.get('/announcements/:id', AnnouncementController.getById);

// 4. UPDATE (Edit Form & Submit)
router.get('/:id/edit', AnnouncementController.getEditForm);
router.get('/announcements/:id/edit', AnnouncementController.getEditForm);
router.post('/:id/edit', AnnouncementController.update);
router.post('/announcements/:id/edit', AnnouncementController.update);
router.put('/:id', AnnouncementController.update);
router.put('/announcements/:id', AnnouncementController.update);
router.patch('/:id', AnnouncementController.partialUpdate);
router.patch('/announcements/:id', AnnouncementController.partialUpdate);

// 5. DELETE (Form Submit & HTTP DELETE)
router.post('/:id/delete', AnnouncementController.delete);
router.post('/announcements/:id/delete', AnnouncementController.delete);
router.delete('/:id', AnnouncementController.delete);
router.delete('/announcements/:id', AnnouncementController.delete);

module.exports = router;
