import request from '@/utils/request'

export const commentApi = {
  getComments(params) {
    return request({
      url: '/comments',
      method: 'get',
      params
    })
  },

  createComment(data) {
    return request({
      url: '/comments',
      method: 'post',
      data
    })
  },

  approveComment(id) {
    return request({
      url: `/comments/${id}/approve`,
      method: 'put'
    })
  },

  deleteComment(id) {
    return request({
      url: `/comments/${id}`,
      method: 'delete'
    })
  }
}
