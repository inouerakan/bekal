const express = require('express');
const router = express.Router();
const bookmarkController = require('../controller/bookmarkController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, bookmarkController.getMyBookmarks);
router.post('/', authenticate, bookmarkController.add);
router.delete('/:opportunity_id', authenticate, bookmarkController.remove);
router.get('/check/:opportunity_id', authenticate, bookmarkController.checkStatus);

module.exports = router;