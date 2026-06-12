const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const existing = await prisma.user.findUnique({
      where: { username }
    });

    if (existing) {
      return errorResponse(res, '用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email
      }
    });

    successResponse(res, { id: user.id, username: user.username }, '注册成功');
  } catch (error) {
    console.error('注册错误:', error);
    errorResponse(res, '注册失败', 500);
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return errorResponse(res, '用户名或密码错误');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return errorResponse(res, '用户名或密码错误');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    successResponse(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
      }
    }, '登录成功');
  } catch (error) {
    console.error('登录错误:', error);
    errorResponse(res, '登录失败', 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true
      }
    });

    if (!user) {
      return errorResponse(res, '用户不存在', 404);
    }

    successResponse(res, user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    errorResponse(res, '获取用户信息失败', 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, bio } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;

    const data = {};
    if (email !== undefined) data.email = email;
    if (bio !== undefined) data.bio = bio;
    if (avatar) data.avatar = avatar;

    if (Object.keys(data).length === 0) {
      return errorResponse(res, '没有要更新的字段');
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data
    });

    successResponse(res, null, '更新成功');
  } catch (error) {
    console.error('更新用户信息错误:', error);
    errorResponse(res, '更新失败', 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return errorResponse(res, '用户不存在', 404);
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isValidPassword) {
      return errorResponse(res, '原密码错误');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    successResponse(res, null, '密码修改成功');
  } catch (error) {
    console.error('修改密码错误:', error);
    errorResponse(res, '修改密码失败', 500);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
