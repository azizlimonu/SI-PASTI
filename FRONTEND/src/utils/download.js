import api from '@/services/api'

/**
 * Ambil base URL file (tanpa suffix /api), buat dipakai di <img src> dsb
 * yang butuh URL langsung, bukan lewat axios. Otomatis ikut .env.
 */
export const getFileBaseUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || ''
  return apiBase.replace(/\/api\/?$/, '')
}
/**
 * Download file lewat endpoint backend (bukan link static langsung),
 * supaya trigger download beneran meski lintas origin (frontend != backend port).
 */
export const downloadFile = async (url, fallbackName = 'file') => {
  try {
    const res = await api.get(url, { responseType: 'blob' })

    const contentDisposition = res.headers['content-disposition']
    let filename = fallbackName
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/)
      if (match?.[1]) filename = match[1]
    }

    const blobUrl = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = blobUrl
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
    return { success: true }
  } catch (e) {
    return { success: false, message: 'Gagal mengunduh file.' }
  }
}