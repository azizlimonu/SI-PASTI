import api from './api'

export const userService = {
  getAll: (params = {}) =>
    api.get('/users', { params }),

  create: (data) =>
    api.post('/users', data),

  getById: (id) =>
    api.get(`/users/${id}`),

  update: (id, data) =>
    api.put(`/users/${id}`, data),

  nonaktifkan: (id) =>
    api.patch(`/users/${id}/nonaktifkan`),

  aktifkan: (id) =>
    api.patch(`/users/${id}/aktifkan`),

  resetPassword: (id) =>
    api.patch(`/users/${id}/reset-password`)
}