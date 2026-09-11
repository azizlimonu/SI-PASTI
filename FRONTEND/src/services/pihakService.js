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

  cariSktjm: (q) =>
    api.get('/pihak/sktjm/cari', { params: { q } }),

  getRiwayatTGR: (search) =>
    api.get('/pihak/riwayat-tgr', { params: { search } })
}