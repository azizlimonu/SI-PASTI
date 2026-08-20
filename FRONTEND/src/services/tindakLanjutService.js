import api from './api'

export const tindakLanjutService = {
  // Tindak Lanjut
  getAll: (params = {}) =>
    api.get('/tindak-lanjut', { params }),

  getByRekomendasi: (rekomendasiId, params = {}) =>
    api.get(`/tindak-lanjut/rekomendasi/${rekomendasiId}`, { params }),

  create: (data) =>
    api.post('/tindak-lanjut', data),

  createBatch: (data) =>
    api.post('/tindak-lanjut/batch', data),

  update: (id, data) =>
    api.put(`/tindak-lanjut/${id}`, data),

  delete: (id) =>
    api.delete(`/tindak-lanjut/${id}`),

  // Bukti TL
  getAllBukti: (params = {}) =>
    api.get('/bukti', { params }),

  uploadBukti: (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'tindak_lanjut_id' && Array.isArray(data[key])) {
        data[key].forEach(id => formData.append('tindak_lanjut_id[]', id))
      } else if (key === 'file' && data[key]) {
        formData.append('file', data[key])
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    return api.post('/bukti', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  attachBukti: (buktiId, tindakLanjutId) =>
    api.post('/bukti/attach', { bukti_id: buktiId, tindak_lanjut_id: tindakLanjutId }),

  detachBukti: (buktiId, tindakLanjutId) =>
    api.post('/bukti/detach', { bukti_id: buktiId, tindak_lanjut_id: tindakLanjutId }),

  updateBukti: (id, data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'file' && data[key]) {
        formData.append('file', data[key])
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    return api.put(`/bukti/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  deleteBukti: (id) =>
    api.delete(`/bukti/${id}`)
}