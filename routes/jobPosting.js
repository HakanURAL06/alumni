const express = require('express');
const router = express.Router({ mergeParams: true });
const JobPostingController = require('../controllers/JobPostingController');
const ApplicationController = require('../controllers/ApplicationController');

// Direct Web Routes: /jobs, /job-postings
router.get('/', JobPostingController.getAll);
router.post('/', JobPostingController.create);
router.get('/:id', JobPostingController.getById);
router.get('/:id/edit', JobPostingController.getEditForm);
router.post('/:id/edit', JobPostingController.update);
router.put('/:id', JobPostingController.update);
router.post('/:id/delete', JobPostingController.delete);
router.delete('/:id', JobPostingController.delete);

// Nested Web Routes: /jobs/:jobId/applications
router.get('/:jobId/applications', ApplicationController.getByJob);
router.get('/:id/applications', ApplicationController.getByJob);

module.exports = router;
