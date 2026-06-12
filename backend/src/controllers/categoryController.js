const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: { status: 'published' }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    const result = categories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      post_count: c._count.posts,
      created_at: c.createdAt
    }));

    successResponse(res, result);
  } catch (error) {
    console.error('获取分类列表错误:', error);
    errorResponse(res, '获取分类列表失败', 500);
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!category) {
      return errorResponse(res, '分类不存在', 404);
    }

    successResponse(res, category);
  } catch (error) {
    console.error('获取分类详情错误:', error);
    errorResponse(res, '获取分类详情失败', 500);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await prisma.category.create({
      data: { name, description }
    });

    successResponse(res, { id: category.id }, '创建成功');
  } catch (error) {
    if (error.code === 'P2002') {
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

    const existing = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return errorResponse(res, '分类不存在', 404);
    }

    await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, description }
    });

    successResponse(res, null, '更新成功');
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse(res, '分类名称已存在');
    }
    console.error('更新分类错误:', error);
    errorResponse(res, '更新分类失败', 500);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return errorResponse(res, '分类不存在', 404);
    }

    await prisma.category.delete({ where: { id: parseInt(id) } });

    successResponse(res, null, '删除成功');
  } catch (error) {
    console.error('删除分类错误:', error);
    errorResponse(res, '删除分类失败', 500);
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: { status: 'published' }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    const result = tags.map(t => ({
      id: t.id,
      name: t.name,
      post_count: t._count.posts,
      created_at: t.createdAt
    }));

    successResponse(res, result);
  } catch (error) {
    console.error('获取标签列表错误:', error);
    errorResponse(res, '获取标签列表失败', 500);
  }
};

const createTag = async (req, res) => {
  try {
    const { name } = req.body;

    const tag = await prisma.tag.create({
      data: { name }
    });

    successResponse(res, { id: tag.id }, '创建成功');
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse(res, '标签名称已存在');
    }
    console.error('创建标签错误:', error);
    errorResponse(res, '创建标签失败', 500);
  }
};

const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.tag.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return errorResponse(res, '标签不存在', 404);
    }

    await prisma.tag.delete({ where: { id: parseInt(id) } });

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
