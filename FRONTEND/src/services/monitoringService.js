import api from './api'

export const monitoringService = {
  getDashboard: (params = {}) =>
    api.get('/monitoring/dashboard', { params }),

  getAlertSpt: (params = {}) =>
    api.get('/monitoring/alert/spt', { params }),

  getAlertTl: (params = {}) =>
    api.get('/monitoring/alert/tl', { params }),

  getProgress: (params = {}) =>
    api.get('/monitoring/progress', { params }),

  getLog: (params = {}) =>
    api.get('/monitoring/log', { params }),

  getTable: (params = {}) =>
    api.get('/monitoring/table', { params }),

  getSumber: (params = {}) =>
    api.get('/monitoring/sumber', { params }),

  getPenugasanProgress: (params = {}) =>
    api.get('/monitoring/penugasan', { params }),

  getTemuanRingkasan: (params = {}) =>
    api.get('/monitoring/temuan', { params }),

  getTgr: (params = {}) =>
    api.get('/monitoring/tgr', { params }),

  getKinerja: (params = {}) =>
    api.get('/monitoring/kinerja', { params }),

  getTren: (params = {}) =>
    api.get('/monitoring/tren', { params })
}