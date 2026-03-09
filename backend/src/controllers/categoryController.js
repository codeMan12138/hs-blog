const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT c.*, COUNT(p.id) as post_count
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
      GROUP BY c.id
      ORDER BY c.id
    `);

    successResponse(res, categories);
  } catch (error) {
    console.error('获取分类列表错误:', error);
    errorResponse(res, '获取分类列表失败', 500);
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    if (categories.length === 0) {
      return errorResponse(res, '分类不存在', 404);
    }

    successResponse(res, categories[0]);
  } catch (error) {
    console.error('获取分类详情错误:', error);
    errorResponse(res, '获取分类详情失败', 500);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );

    successResponse(res, { id: result.insertId }, '创建成功');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, '分类名称已存在');
    }
    console.error('创建分类错误:', error);
    errorResponse(res, '创建分类失败', 500);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    if (categories.length === 0) {
      return errorResponse(res, '分类不存在', 404);
    }

    await pool.execute(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );

    successResponse(res, null, '更新成功');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, '分类名称已存在');
    }
    console.error('更新分类错误:', error);
    errorResponse(res, '更新分类失败', 500);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    if (categories.length === 0) {
      return errorResponse(res, '分类不存在', 404);
    }

    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);

    successResponse(res, null, '删除成功');
  } catch (error) {
    console.error('删除分类错误:', error);
    errorResponse(res, '删除分类失败', 500);
  }
};

const getTags = async (req, res) => {
  try {
    const [tags] = await pool.execute(`
      SELECT t.*, COUNT(pt.post_id) as post_count
      FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
      GROUP BY t.id
      ORDER BY t.id
    `);

    successResponse(res, tags);
  } catch (error) {
    console.error('获取标签列表错误:', error);
    errorResponse(res, '获取标签列表失败', 500);
  }
};

const createTag = async (req, res) => {
  try {
    const { name } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO tags (name) VALUES (?)',
      [name]
    );

    successResponse(res, { id: result.insertId }, '创建成功');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, '标签名称已存在');
    }
    console.error('创建标签错误:', error);
    errorResponse(res, '创建标签失败', 500);
  }
};

const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const [tags] = await pool.execute(
      'SELECT * FROM tags WHERE id = ?',
      [id]
    );

    if (tags.length === 0) {
      return errorResponse(res, '标签不存在', 404);
    }

    await pool.execute('DELETE FROM tags WHERE id = ?', [id]);

    successResponse(res, null, '删除成功');
  } catch (error) {
    console.error('删除标签错误:', error);
    errorResponse(res, '删除标签失败', 500);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getTags,
  createTag,
  deleteTag
};
