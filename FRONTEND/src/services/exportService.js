import api from './api'

export const exportService = {
  // Mengunduh file Excel (Penugasan + Piutang TGR) sesuai scope & filter
  excel: (params = {}) =>
    api.get('/export/excel', { params, responseType: 'blob' })
}