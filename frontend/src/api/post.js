import request from '@/utils/request'

export const postApi = {
  getPosts(params) {
    return request({
      url: '/posts',
      method: 'get',
      params
    })
  },

  getPostById(id) {
    return request({
      url: `/posts/${id}`,
      method: 'get'
    })
  },

  createPost(data) {
    return request({
      url: '/posts',
      method: 'post',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  updatePost(id, data) {
    return request({
      url: `/posts/${id}`,
      method: 'put',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  deletePost(id) {
    return request({
      url: `/posts/${id}`,
      method: 'delete'
    })
  },

  likePost(id) {
    return request({
      url: `/posts/${id}/like`,
      method: 'post'
    })
  },

  getDashboardStats() {
    return request({
      url: '/posts/dashboard/stats',
      method: 'get'
    })
  }
}
