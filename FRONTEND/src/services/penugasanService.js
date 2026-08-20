import api from './api'

export const penugasanService = {
  getAll: (params = {}) =>
    api.get('/penugasan', { params }),

  getById: (id) =>
    api.get(`/penugasan/${id}`),

  create: (data) =>
    api.post('/penugasan', data),

  update: (id, data) =>
    api.put(`/penugasan/${id}`, data),

  delete: (id) =>
    api.delete(`/penugasan/${id}`),

  // SPT
  getSpt: (penugasanId) =>
    api.get(`/spt/penugasan/${penugasanId}`),

  createSpt: (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'tim') {
        formData.append('tim', JSON.stringify(data.tim))
      } else if (key === 'file_spt' && data[key]) {
        formData.append('file_spt', data[key])
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    return api.post('/spt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  updateSpt: (id, data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'tim') {
        formData.append('tim', JSON.stringify(data.tim))
      } else if (key === 'file_spt' && data[key]) {
        formData.append('file_spt', data[key])
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    return api.put(`/spt/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  deleteSpt: (id) =>
    api.delete(`/spt/${id}`),

  tambahTim: (sptId, data) =>
    api.post(`/spt/${sptId}/tim`, data),

  hapusTim: (sptId, timId) =>
    api.delete(`/spt/${sptId}/tim/${timId}`)
}