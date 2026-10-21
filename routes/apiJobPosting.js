const express = require('express');
const router = express.Router({ mergeParams: true });
const ApiJobPostingController = require('../controllers/ApiJobPostingController');
const apiApplicationRouter = require('./apiApplication');

// ==========================================
// DIRECT & NESTED API ROUTES FOR JOB POSTINGS
// Direct: /api/jobs, /api/job-postings
// Nested: /api/users/:userId/jobs
// ==========================================

// 1. READ ALL (Direct & Nested)
router.get('/', ApiJobPostingController.getAll);

// 2. CREATE (Direct & Nested)
router.post('/', ApiJobPostingController.create);

// 3. READ ONE (Direct & Nested)
router.get('/:id', ApiJobPostingController.getById);

// 4. UPDATE (Full & Partial - Direct & Nested)
router.put('/:id', ApiJobPostingController.update);
router.patch('/:id', ApiJobPostingController.partialUpdate);

// 5. DELETE (Direct & Nested)
router.delete('/:id', ApiJobPostingController.delete);

// 6. RELATIONSHIP ENDPOINT: GET publisher user details
router.get('/:id/user', ApiJobPostingController.getUser);

// 7. NESTED ROUTES: Job -> Applications
// Endpoints: /api/jobs/:jobId/applications (GET, POST, PUT, DELETE)
router.use('/:jobId/applications', apiApplicationRouter);

module.exports = router;
