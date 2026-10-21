const express = require('express');
const router = express.Router({ mergeParams: true });
const ApiApplicationController = require('../controllers/ApiApplicationController');

// ==========================================
// DIRECT & NESTED API ROUTES FOR APPLICATIONS
// Direct: /api/applications
// Nested User: /api/users/:userId/applications
// Nested Job:  /api/jobs/:jobId/applications
// ==========================================

// 1. READ ALL (Direct & Nested)
router.get('/', ApiApplicationController.getAll);

// 2. CREATE (Direct & Nested)
router.post('/', ApiApplicationController.create);

// 3. READ ONE (Direct & Nested)
router.get('/:id', ApiApplicationController.getById);

// 4. UPDATE (Full & Partial - Direct & Nested)
router.put('/:id', ApiApplicationController.update);
router.patch('/:id', ApiApplicationController.partialUpdate);

// 5. DELETE (Direct & Nested)
router.delete('/:id', ApiApplicationController.delete);

module.exports = router;
