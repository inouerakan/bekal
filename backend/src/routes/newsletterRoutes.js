const express = require('express');
const router = express.Router();
const newsletterController = require('../controller/newsletterController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.post('/subscribe', optionalAuth, newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);
router.get('/subscribers', authenticate, authorize('admin'), newsletterController.getSubscribers);

module.exports = router;