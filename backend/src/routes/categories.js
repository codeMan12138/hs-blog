const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware } = require('../middleware/auth');

router.get('/categories', categoryController.getCategories);

router.get('/categories/:id', categoryController.getCategoryById);

router.post('/categories', authMiddleware, categoryController.createCategory);

router.put('/categories/:id', authMiddleware, categoryController.updateCategory);

router.delete('/categories/:id', authMiddleware, categoryController.deleteCategory);

router.get('/tags', categoryController.getTags);

router.post('/tags', authMiddleware, categoryController.createTag);

router.delete('/tags/:id', authMiddleware, categoryController.deleteTag);

module.exports = router;
