const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', commentController.getComments);

router.post('/', commentController.createComment);

router.put('/:id/approve', authMiddleware, commentController.approveComment);

router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router;
