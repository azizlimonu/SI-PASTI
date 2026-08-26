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
    api.get('/monitoring/table', { params })
}