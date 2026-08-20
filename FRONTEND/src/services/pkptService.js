import api from './api'

export const pkptService = {
  getAll: (params = {}) =>
    api.get('/pkpt', { params }),

  getById: (id) =>
    api.get(`/pkpt/${id}`),

  create: (data) =>
    api.post('/pkpt', data),

  update: (id, data) =>
    api.put(`/pkpt/${id}`, data),

  delete: (id) =>
    api.delete(`/pkpt/${id}`)
}