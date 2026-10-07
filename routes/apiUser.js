const express = require('express');
const router = express.Router();
const ApiUserController = require('../controllers/ApiUserController');

// ApiUser Routes -> ApiUserController (RESTful API JSON)
router.get('/', ApiUserController.getAll);
router.post('/', ApiUserController.create);
router.get('/:id', ApiUserController.getById);
router.put('/:id', ApiUserController.update);
router.patch('/:id', ApiUserController.partialUpdate);
router.delete('/:id', ApiUserController.delete);

module.exports = router;
