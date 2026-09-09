const express = require('express');
const router = express.Router();
const { getOpportunities, createOpportunity } = require('../controller/opportunityController');
const { protect } = require('../middleware/auth');

router.get('/', getOpportunities);
router.post('/', protect, createOpportunity);

module.exports = router;
