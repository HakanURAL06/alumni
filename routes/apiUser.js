const express = require('express');
const router = express.Router();
const ApiUserController = require('../controllers/ApiUserController');
const apiJobPostingRouter = require('./apiJobPosting');
const apiApplicationRouter = require('./apiApplication');

// ==========================================
// DIRECT USER API ROUTES
// ==========================================
router.get('/', ApiUserController.getAll);
router.post('/', ApiUserController.create);
router.get('/:id', ApiUserController.getById);
router.put('/:id', ApiUserController.update);
router.patch('/:id', ApiUserController.partialUpdate);
router.delete('/:id', ApiUserController.delete);

// ==========================================
// NESTED ROUTES: User -> Job Postings
// Endpoints: /api/users/:userId/jobs (GET, POST, PUT, DELETE)
// ==========================================
router.use('/:userId/jobs', apiJobPostingRouter);

// ==========================================
// NESTED ROUTES: User -> Applications
// Endpoints: /api/users/:userId/applications (GET, POST, PUT, DELETE)
// ==========================================
router.use('/:userId/applications', apiApplicationRouter);

module.exports = router;
