import request from '@/utils/request'

export const categoryApi = {
  getCategories() {
    return request({
      url: '/categories',
      method: 'get'
    })
  },

  getCategoryById(id) {
    return request({
      url: `/categories/${id}`,
      method: 'get'
    })
  },

  createCategory(data) {
    return request({
      url: '/categories',
      method: 'post',
      data
    })
  },

  updateCategory(id, data) {
    return request({
      url: `/categories/${id}`,
      method: 'put',
      data
    })
  },

  deleteCategory(id) {
    return request({
      url: `/categories/${id}`,
      method: 'delete'
    })
  },

  getTags() {
    return request({
      url: '/tags',
      method: 'get'
    })
  },

  createTag(data) {
    return request({
      url: '/tags',
      method: 'post',
      data
    })
  },

  deleteTag(id) {
    return request({
      url: `/tags/${id}`,
      method: 'delete'
    })
  }
}
