const express = require('express');
const router = express.Router();
const ApiAnnouncementController = require('../controllers/ApiAnnouncementController');

// ==================================================
// RESTful JSON API ROUTES FOR ANNOUNCEMENTS
// ==================================================

// 1. READ ALL: GET /
router.get('/', ApiAnnouncementController.getAll);

// 2. CREATE: POST /
router.post('/', ApiAnnouncementController.create);

// 3. READ ONE: GET /:id
router.get('/:id', ApiAnnouncementController.getById);

// 4. UPDATE (Full): PUT /:id
router.put('/:id', ApiAnnouncementController.update);

// 5. UPDATE (Partial): PATCH /:id
router.patch('/:id', ApiAnnouncementController.partialUpdate);

// 6. DELETE: DELETE /:id
router.delete('/:id', ApiAnnouncementController.delete);

module.exports = router;
