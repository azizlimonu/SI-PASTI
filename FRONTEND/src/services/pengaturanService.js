import api from './api'

export const pengaturanService = {
  get: () => api.get('/pengaturan'),

  update: (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'logo' && data[key]) {
        formData.append('logo', data[key])
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    return api.put('/pengaturan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}