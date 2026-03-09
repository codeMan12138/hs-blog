const successResponse = (res, data, message = '操作成功') => {
  res.json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = '操作失败', status = 400) => {
  res.status(status).json({
    success: false,
    message
  });
};

module.exports = { successResponse, errorResponse };
