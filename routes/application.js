const express = require('express');
const router = express.Router({ mergeParams: true });
const ApplicationController = require('../controllers/ApplicationController');

// Direct Web Routes: /applications, /application
router.get('/', ApplicationController.getAll);
router.post('/', ApplicationController.create);
router.get('/:id', ApplicationController.getById);
router.post('/:id/status', ApplicationController.updateStatus);
router.post('/:id/delete', ApplicationController.delete);
router.delete('/:id', ApplicationController.delete);

module.exports = router;
