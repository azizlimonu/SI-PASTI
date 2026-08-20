import api from './api'

export const authService = {
  login: (nip, password) =>
    api.post('/auth/login', { nip, password }),

  changePassword: (oldPassword, newPassword, confirmPassword) =>
    api.post('/auth/change-password', { oldPassword, newPassword, confirmPassword }),

  getProfile: () =>
    api.get('/auth/profile'),

  createUser: (data) =>
    api.post('/auth/create-user', data)
}