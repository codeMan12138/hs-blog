const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getComments = async (req, res) => {
  try {
    const { postId, status, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNum - 1) * pageSize;

    const where = {};

    if (postId) {
      where.postId = parseInt(postId);
    }

    if (status) {
      where.status = status;
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          post: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.comment.count({ where })
    ]);

    successResponse(res, {
      comments: comments.map(c => ({
        id: c.id,
        post_id: c.postId,
        user_id: c.userId,
        username: c.username,
        content: c.content,
        parent_id: c.parentId,
        status: c.status,
        created_at: c.createdAt,
        post_title: c.post?.title
      })),
      pagination: {
        current: pageNum,
        pageSize,
        total
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

    const comment = await prisma.comment.create({
      data: {
        postId: parseInt(postId),
        userId,
        username,
        content,
        parentId: parentId ? parseInt(parentId) : null
      }
    });

    successResponse(res, { id: comment.id }, '评论成功');
  } catch (error) {
    console.error('创建评论错误:', error);
    errorResponse(res, '评论失败', 500);
  }
};

const approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { status: 'approved' }
    });

    successResponse(res, null, '审核通过');
  } catch (error) {
    console.error('审核评论错误:', error);
    errorResponse(res, '审核失败', 500);
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.comment.delete({
      where: { id: parseInt(id) }
    });

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
