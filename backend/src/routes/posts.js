const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postController = require('../controllers/postController');
const { authMiddleware } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('只允许上传图片文件'));
  }
});

router.get('/', postController.getPosts);

router.get('/dashboard/stats', authMiddleware, postController.getDashboardStats);

router.get('/:id', postController.getPostById);

router.post('/', authMiddleware, upload.single('coverImage'), postController.createPost);

router.put('/:id', authMiddleware, upload.single('coverImage'), postController.updatePost);

router.delete('/:id', authMiddleware, postController.deletePost);

router.post('/:id/like', postController.likePost);

module.exports = router;
