import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.user?.username || ''
  },

  actions: {
    async login(credentials) {
      const data = await authApi.login(credentials)
      this.token = data.token
      this.user = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    },

    async register(userData) {
      const data = await authApi.register(userData)
      return data
    },

    async getProfile() {
      const data = await authApi.getProfile()
      this.user = data
      localStorage.setItem('user', JSON.stringify(data))
      return data
    },

    async updateProfile(profileData) {
      await authApi.updateProfile(profileData)
      if (profileData.email || profileData.bio) {
        await this.getProfile()
      }
    },

    async changePassword(passwordData) {
      await authApi.changePassword(passwordData)
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
