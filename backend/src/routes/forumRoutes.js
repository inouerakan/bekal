const express = require('express');
const router = express.Router();
const forumController = require('../controller/forumController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, forumController.getAll);
router.get('/:id', optionalAuth, forumController.getById);
router.post('/discussion', authenticate, forumController.createDiscussion);
router.post('/:id/comment', authenticate, forumController.createComment);
router.post('/:id/like', authenticate, forumController.toggleLike);
router.delete('/:id', authenticate, forumController.delete);

module.exports = router;