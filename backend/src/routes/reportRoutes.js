const express = require('express');
const router = express.Router();
const reportController = require('../controller/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, reportController.create);
router.get('/', authenticate, authorize('admin'), reportController.getAll);
router.patch('/:id/status', authenticate, authorize('admin'), reportController.updateStatus);

module.exports = router;