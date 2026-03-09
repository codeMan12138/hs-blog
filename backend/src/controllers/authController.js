const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return errorResponse(res, '用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    );

    successResponse(res, { id: result.insertId, username }, '注册成功');
  } catch (error) {
    console.error('注册错误:', error);
    errorResponse(res, '注册失败', 500);
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return errorResponse(res, '用户名或密码错误');
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return errorResponse(res, '用户名或密码错误');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
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
    const [users] = await pool.execute(
      'SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return errorResponse(res, '用户不存在', 404);
    }

    successResponse(res, users[0]);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    errorResponse(res, '获取用户信息失败', 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, bio } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;

    let updateFields = [];
    let updateValues = [];

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    if (avatar) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }

    if (updateFields.length === 0) {
      return errorResponse(res, '没有要更新的字段');
    }

    updateValues.push(req.user.id);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    successResponse(res, null, '更新成功');
  } catch (error) {
    console.error('更新用户信息错误:', error);
    errorResponse(res, '更新失败', 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const [users] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return errorResponse(res, '用户不存在', 404);
    }

    const isValidPassword = await bcrypt.compare(oldPassword, users[0].password);

    if (!isValidPassword) {
      return errorResponse(res, '原密码错误');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

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
