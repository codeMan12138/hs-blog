const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getComments = async (req, res) => {
  try {
    const { postId, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (postId) {
      whereConditions.push('c.post_id = ?');
      queryParams.push(postId);
    }

    if (status) {
      whereConditions.push('c.status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    const [comments] = await pool.execute(`
      SELECT c.*, p.title as post_title
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM comments c ${whereClause}
    `, queryParams);

    successResponse(res, {
      comments,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    errorResponse(res, '获取评论列表失败', 500);
  }
};

const createComment = async (req, res) => {
  try {
    const { postId, content, parentId } = req.body;
    const userId = req.user ? req.user.id : null;
    const username = req.user ? req.user.username : req.body.username;

    if (!userId && !username) {
      return errorResponse(res, '请提供用户名');
    }

    const [result] = await pool.execute(
      'INSERT INTO comments (post_id, user_id, username, content, parent_id) VALUES (?, ?, ?, ?, ?)',
      [postId, userId, username, content, parentId || null]
    );

    successResponse(res, { id: result.insertId }, '评论成功');
  } catch (error) {
    console.error('创建评论错误:', error);
    errorResponse(res, '评论失败', 500);
  }
};

const approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE comments SET status = "approved" WHERE id = ?',
      [id]
    );

    successResponse(res, null, '审核通过');
  } catch (error) {
    console.error('审核评论错误:', error);
    errorResponse(res, '审核失败', 500);
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM comments WHERE id = ?', [id]);

    successResponse(res, null, '删除成功');
  } catch (error) {
    console.error('删除评论错误:', error);
    errorResponse(res, '删除失败', 500);
  }
};

module.exports = {
  getComments,
  createComment,
  approveComment,
  deleteComment
};
