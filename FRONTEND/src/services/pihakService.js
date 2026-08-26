import api from './api'

export const pihakService = {
  getAll: (params = {}) =>
    api.get('/pihak', { params }),

  getById: (id) =>
    api.get(`/pihak/${id}`),

  create: (data) =>
    api.post('/pihak', data),

  update: (id, data) =>
    api.put(`/pihak/${id}`, data),

  delete: (id) =>
    api.delete(`/pihak/${id}`),

  cekSktjm: (params = {}) =>
    api.get('/pihak/sktjm', { params }),

  getRiwayatTGR: () =>
    api.get('/pihak/riwayat-tgr')
}