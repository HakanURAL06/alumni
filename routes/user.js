const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const JobPostingController = require('../controllers/JobPostingController');
const ApplicationController = require('../controllers/ApplicationController');

// ==========================================
// ALL CRUD OPERATIONS ON USER ROUTE WITH VIEW
// ==========================================

// 1. CREATE (Form submission / JSON)
router.post('/', UserController.create);
router.post('/users', UserController.create);

// 2. READ ALL (List Directory View)
router.get('/', UserController.getAll);
router.get('/users', UserController.getAll);

// 3. READ ONE (Detail Profile View)
router.get('/:id', UserController.getById);
router.get('/users/:id', UserController.getById);

// 4. UPDATE (Edit Form View & Update Actions)
router.get('/:id/edit', UserController.getEditForm);
router.get('/users/:id/edit', UserController.getEditForm);
router.post('/:id/edit', UserController.update);
router.post('/users/:id/edit', UserController.update);
router.put('/:id', UserController.update);
router.put('/users/:id', UserController.update);
router.patch('/:id', UserController.partialUpdate);
router.patch('/users/:id', UserController.partialUpdate);

// 5. DELETE (Web Form Action & HTTP DELETE)
router.post('/:id/delete', UserController.delete);
router.post('/users/:id/delete', UserController.delete);
router.delete('/:id', UserController.delete);
router.delete('/users/:id', UserController.delete);

// ==========================================
// 6. NESTED ROUTES: User -> Job Postings Web View
// ==========================================
router.get('/:userId/jobs', JobPostingController.getByUser);
router.get('/users/:userId/jobs', JobPostingController.getByUser);

// ==========================================
// 7. NESTED ROUTES: User -> Applications Web View
// ==========================================
router.get('/:userId/applications', ApplicationController.getByUser);
router.get('/users/:userId/applications', ApplicationController.getByUser);

module.exports = router;
