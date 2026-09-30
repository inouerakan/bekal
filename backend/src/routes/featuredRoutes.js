const express = require('express');
const router = express.Router();
const featuredController = require('../controller/featuredController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', featuredController.getAll);
router.post('/', authenticate, authorize('admin', 'mitra'), featuredController.create);
router.delete('/:id', authenticate, authorize('admin'), featuredController.delete);
router.patch('/:id/payment-status', authenticate, authorize('admin'), featuredController.updatePaymentStatus);

module.exports = router;