import request from '@/utils/request'

export const authApi = {
  login(data) {
    return request({
      url: '/auth/login',
      method: 'post',
      data
    })
  },

  register(data) {
    return request({
      url: '/auth/register',
      method: 'post',
      data
    })
  },

  getProfile() {
    return request({
      url: '/auth/profile',
      method: 'get'
    })
  },

  updateProfile(data) {
    return request({
      url: '/auth/profile',
      method: 'put',
      data
    })
  },

  changePassword(data) {
    return request({
      url: '/auth/password',
      method: 'put',
      data
    })
  }
}
