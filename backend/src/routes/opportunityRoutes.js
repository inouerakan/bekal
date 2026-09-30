const express = require('express');
const router = express.Router();
const opportunityController = require('../controller/opportunityController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, opportunityController.getAll);
router.get('/all', authenticate, authorize('admin'), opportunityController.getAllForAdmin);
router.get('/my-opportunities', authenticate, opportunityController.getMyOpportunities);
router.get('/:id', optionalAuth, opportunityController.getById);
router.post('/', authenticate, opportunityController.create);
router.put('/:id', authenticate, opportunityController.update);
router.delete('/:id', authenticate, opportunityController.delete);
router.patch('/:id/verify', authenticate, authorize('admin'), opportunityController.verify);

module.exports = router;