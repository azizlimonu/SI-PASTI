import api from '@/services/api'
import { useToast } from './useToast'

export const useFileDownload = () => {
  const toast = useToast()

  // url = path relatif ke API (misal '/dokumen/12/download')
  // fallbackName = nama file kalau server tidak kasih nama (jarang terjadi)
  const downloadFile = async (url, fallbackName = 'file') => {
    try {
      const res = await api.get(url, { responseType: 'blob' })

      // Ambil nama file asli dari header Content-Disposition kalau ada
      const disposition = res.headers['content-disposition']
      let filename = fallbackName
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/)
        if (match) filename = decodeURIComponent(match[1])
      }

      const blobUrl = window.URL.createObjectURL(res.data)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (e) {
      toast.error('Gagal mengunduh file. File mungkin tidak tersedia.')
    }
  }

  return { downloadFile }
}