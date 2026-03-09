const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度为3-50个字符'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确')
], authController.register);

router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], authController.login);

router.get('/profile', authMiddleware, authController.getProfile);

router.put('/profile', authMiddleware, authController.updateProfile);

router.put('/password', authMiddleware, [
  body('oldPassword').notEmpty().withMessage('原密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6个字符')
], authController.changePassword);

module.exports = router;
