const express = require('express');
const router = express.Router();
const uploadController = require('../controller/uploadController');
const { authenticate } = require('../middleware/auth');

router.get('/signature', authenticate, uploadController.getUploadSignature);

module.exports = router;