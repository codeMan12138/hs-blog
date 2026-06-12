const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, status, keyword } = req.query;
    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNum - 1) * pageSize;

    const where = {};

    if (category) {
      where.categoryId = parseInt(category);
    }

    if (tag) {
      where.tags = {
        some: { id: parseInt(tag) }
      };
    }

    if (status) {
      where.status = status;
    } else {
      where.status = 'published';
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { summary: { contains: keyword } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          category: { select: { name: true } },
          author: { select: { username: true } },
          tags: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.post.count({ where })
    ]);

    successResponse(res, {
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        summary: post.summary,
        content: post.content,
        cover_image: post.coverImage,
        author_id: post.authorId,
        author_name: post.author?.username,
        category_id: post.categoryId,
        category_name: post.category?.name,
        status: post.status,
        views: post.views,
        likes: post.likes,
        tags: post.tags.map(t => t.name),
        created_at: post.createdAt,
        updated_at: post.updatedAt
      })),
      pagination: {
        current: pageNum,
        pageSize,
        total
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

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: { select: { name: true } },
        author: { select: { username: true } },
        tags: { select: { name: true } }
      }
    });

    if (!post) {
      return errorResponse(res, '博客不存在', 404);
    }

    // 浏览量 +1
    await prisma.post.update({
      where: { id: parseInt(id) },
      data: { views: { increment: 1 } }
    });

    successResponse(res, {
      id: post.id,
      title: post.title,
      summary: post.summary,
      content: post.content,
      cover_image: post.coverImage,
      author_id: post.authorId,
      author_name: post.author?.username,
      category_id: post.categoryId,
      category_name: post.category?.name,
      status: post.status,
      views: post.views + 1,
      likes: post.likes,
      tags: post.tags.map(t => t.name),
      created_at: post.createdAt,
      updated_at: post.updatedAt
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

    const postData = {
      title,
      content,
      summary,
      coverImage,
      authorId: req.user.id,
      status,
      categoryId: categoryId ? parseInt(categoryId) : null
    };

    // 处理标签关联
    if (tags && tags.length > 0) {
      const tagConnections = [];
      for (const tagName of tags) {
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { name: tagName } });
        }
        tagConnections.push({ id: tag.id });
      }
      postData.tags = { connect: tagConnections };
    }

    const post = await prisma.post.create({ data: postData });

    successResponse(res, { id: post.id }, '创建成功');
  } catch (error) {
    console.error('创建博客错误:', error);
    errorResponse(res, '创建博客失败', 500);
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);
    const { title, content, summary, categoryId, tags, status } = req.body;
    const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

    const existing = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existing) {
      return errorResponse(res, '博客不存在', 404);
    }

    if (existing.authorId !== req.user.id) {
      return errorResponse(res, '无权修改此博客', 403);
    }

    const postData = {};
    if (title !== undefined) postData.title = title;
    if (content !== undefined) postData.content = content;
    if (summary !== undefined) postData.summary = summary;
    if (coverImage) postData.coverImage = coverImage;
    if (categoryId !== undefined) postData.categoryId = categoryId ? parseInt(categoryId) : null;
    if (status !== undefined) postData.status = status;

    // 处理标签更新
    if (tags !== undefined) {
      const tagConnections = [];
      for (const tagName of tags) {
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { name: tagName } });
        }
        tagConnections.push({ id: tag.id });
      }
      postData.tags = { set: tagConnections };
    }

    await prisma.post.update({
      where: { id: postId },
      data: postData
    });

    successResponse(res, null, '更新成功');
  } catch (error) {
    console.error('更新博客错误:', error);
    errorResponse(res, '更新博客失败', 500);
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    const existing = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existing) {
      return errorResponse(res, '博客不存在', 404);
    }

    if (existing.authorId !== req.user.id) {
      return errorResponse(res, '无权删除此博客', 403);
    }

    await prisma.post.delete({ where: { id: postId } });

    successResponse(res, null, '删除成功');
  } catch (error) {
    console.error('删除博客错误:', error);
    errorResponse(res, '删除博客失败', 500);
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.post.update({
      where: { id: parseInt(id) },
      data: { likes: { increment: 1 } }
    });

    successResponse(res, null, '点赞成功');
  } catch (error) {
    console.error('点赞错误:', error);
    errorResponse(res, '点赞失败', 500);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [postCount, categoryCount, commentCount, viewSum, recentPosts] = await Promise.all([
      prisma.post.count(),
      prisma.category.count(),
      prisma.comment.count(),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.post.findMany({
        select: { id: true, title: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    successResponse(res, {
      stats: {
        posts: postCount,
        categories: categoryCount,
        comments: commentCount,
        views: viewSum._sum.views || 0
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
