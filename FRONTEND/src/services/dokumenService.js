import api from './api'

export const dokumenService = {
  // Dokumen
  getByPenugasan: (penugasanId, params = {}) =>
    api.get(`/dokumen/penugasan/${penugasanId}`, { params }),

  getById: (id) =>
    api.get(`/dokumen/${id}`),

  create: (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'temuan') {
        formData.append('temuan', JSON.stringify(data.temuan))
      } else if (key === 'file' && data[key]) {
        formData.append('file', data[key])
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    return api.post('/dokumen', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  update: (id, data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'file' && data[key]) {
        formData.append('file', data[key])
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    return api.put(`/dokumen/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  delete: (id) =>
    api.delete(`/dokumen/${id}`),

  // Temuan
  getTemuanByDokumen: (dokumenId, params = {}) =>
    api.get(`/dokumen/${dokumenId}/temuan`, { params }),

  createTemuanBatch: (data) =>
    api.post('/dokumen/temuan/batch', data),

  updateTemuan: (id, data) =>
    api.put(`/dokumen/temuan/${id}`, data),

  deleteTemuan: (id) =>
    api.delete(`/dokumen/temuan/${id}`),

  // Rekomendasi
  getRekomendasiByTemuan: (temuanId, params = {}) =>
    api.get(`/dokumen/temuan/${temuanId}/rekomendasi`, { params }),

  createRekomendasi: (data) =>
    api.post('/dokumen/rekomendasi', data),

  updateRekomendasi: (id, data) =>
    api.put(`/dokumen/rekomendasi/${id}`, data),

  deleteRekomendasi: (id) =>
    api.delete(`/dokumen/rekomendasi/${id}`)
}