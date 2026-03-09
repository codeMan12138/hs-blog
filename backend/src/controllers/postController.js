const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, status, keyword } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (category) {
      whereConditions.push('p.category_id = ?');
      queryParams.push(category);
    }

    if (tag) {
      whereConditions.push('pt.tag_id = ?');
      queryParams.push(tag);
    }

    if (status) {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    } else {
      whereConditions.push('p.status = "published"');
    }

    if (keyword) {
      whereConditions.push('(p.title LIKE ? OR p.summary LIKE ?)');
      queryParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    const [posts] = await pool.execute(`
      SELECT p.*, c.name as category_name, u.username as author_name,
        GROUP_CONCAT(t.name) as tags
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      ${whereClause}
    `, queryParams);

    successResponse(res, {
      posts: posts.map(post => ({
        ...post,
        tags: post.tags ? post.tags.split(',') : []
      })),
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('获取博客列表错误:', error);
    errorResponse(res, '获取博客列表失败', 500);
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const [posts] = await pool.execute(`
      SELECT p.*, c.name as category_name, u.username as author_name,
        GROUP_CONCAT(t.name) as tags
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    if (posts.length === 0) {
      return errorResponse(res, '博客不存在', 404);
    }

    await pool.execute('UPDATE posts SET views = views + 1 WHERE id = ?', [id]);

    successResponse(res, {
      ...posts[0],
      tags: posts[0].tags ? posts[0].tags.split(',') : []
    });
  } catch (error) {
    console.error('获取博客详情错误:', error);
    errorResponse(res, '获取博客详情失败', 500);
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, summary, categoryId, tags, status = 'draft' } = req.body;
    const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.execute(
      'INSERT INTO posts (title, content, summary, cover_image, author_id, category_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, content, summary, coverImage, req.user.id, categoryId, status]
    );

    const postId = result.insertId;

    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const [tagResult] = await pool.execute(
          'INSERT IGNORE INTO tags (name) VALUES (?)',
          [tagName]
        );

        const [tagIdResult] = await pool.execute(
          'SELECT id FROM tags WHERE name = ?',
          [tagName]
        );

        await pool.execute(
          'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
          [postId, tagIdResult[0].id]
        );
      }
    }

    successResponse(res, { id: postId }, '创建成功');
  } catch (error) {
    console.error('创建博客错误:', error);
    errorResponse(res, '创建博客失败', 500);
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, categoryId, tags, status } = req.body;
    const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

    const [posts] = await pool.execute(
      'SELECT author_id FROM posts WHERE id = ?',
      [id]
    );

    if (posts.length === 0) {
      return errorResponse(res, '博客不存在', 404);
    }

    if (posts[0].author_id !== req.user.id) {
      return errorResponse(res, '无权修改此博客', 403);
    }

    let updateFields = [];
    let updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }
    if (summary !== undefined) {
      updateFields.push('summary = ?');
      updateValues.push(summary);
    }
    if (coverImage) {
      updateFields.push('cover_image = ?');
      updateValues.push(coverImage);
    }
    if (categoryId !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(categoryId);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE posts SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (tags !== undefined) {
      await pool.execute('DELETE FROM post_tags WHERE post_id = ?', [id]);

      for (const tagName of tags) {
        const [tagResult] = await pool.execute(
          'INSERT IGNORE INTO tags (name) VALUES (?)',
          [tagName]
        );

        const [tagIdResult] = await pool.execute(
          'SELECT id FROM tags WHERE name = ?',
          [tagName]
        );

        await pool.execute(
          'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
          [id, tagIdResult[0].id]
        );
      }
    }

    successResponse(res, null, '更新成功');
  } catch (error) {
    console.error('更新博客错误:', error);
    errorResponse(res, '更新博客失败', 500);
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const [posts] = await pool.execute(
      'SELECT author_id FROM posts WHERE id = ?',
      [id]
    );

    if (posts.length === 0) {
      return errorResponse(res, '博客不存在', 404);
    }

    if (posts[0].author_id !== req.user.id) {
      return errorResponse(res, '无权删除此博客', 403);
    }

    await pool.execute('DELETE FROM posts WHERE id = ?', [id]);

    successResponse(res, null, '删除成功');
  } catch (error) {
    console.error('删除博客错误:', error);
    errorResponse(res, '删除博客失败', 500);
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id]);

    successResponse(res, null, '点赞成功');
  } catch (error) {
    console.error('点赞错误:', error);
    errorResponse(res, '点赞失败', 500);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [postCount] = await pool.execute('SELECT COUNT(*) as count FROM posts');
    const [categoryCount] = await pool.execute('SELECT COUNT(*) as count FROM categories');
    const [commentCount] = await pool.execute('SELECT COUNT(*) as count FROM comments');
    const [totalViews] = await pool.execute('SELECT SUM(views) as total FROM posts');

    const [recentPosts] = await pool.execute(`
      SELECT id, title, status, created_at 
      FROM posts 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    successResponse(res, {
      stats: {
        posts: postCount[0].count,
        categories: categoryCount[0].count,
        comments: commentCount[0].count,
        views: totalViews[0].total || 0
      },
      recentPosts
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    errorResponse(res, '获取统计数据失败', 500);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getDashboardStats
};
