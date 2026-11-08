import api from '@/services/api'
import { useToast } from './useToast'

const MIME_EXT = {
  'application/pdf': '.pdf',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
}

// Ambil nama file dari header Content-Disposition (termasuk filename*=UTF-8'')
const filenameFromHeader = (disposition) => {
  if (!disposition) return null
  const star = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (star) return decodeURIComponent(star[1])
  const plain = disposition.match(/filename="?([^";]+)"?/i)
  return plain ? plain[1] : null
}

// Error dari server datang sebagai Blob (responseType: 'blob') — baca pesan JSON-nya
const messageFromError = async (e) => {
  const data = e?.response?.data
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()).message
    } catch {
      return null
    }
  }
  return null
}

export const useFileDownload = () => {
  const toast = useToast()

  // source = path API (misal '/dokumen/12/download') ATAU promise axios dari service
  // fallbackName = nama cadangan kalau server tidak mengirim nama file
  const downloadFile = async (source, fallbackName = 'file') => {
    try {
      const res = typeof source === 'string'
        ? await api.get(source, { responseType: 'blob' })
        : await source

      let filename = filenameFromHeader(res.headers['content-disposition']) || fallbackName
      if (!/\.[A-Za-z0-9]{2,5}$/.test(filename)) {
        filename += MIME_EXT[res.data.type] || ''
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
      toast.error((await messageFromError(e)) || 'Gagal mengunduh file. File mungkin tidak tersedia.')
    }
  }

  // Bukti TL: ada file_path -> unduh lewat endpoint; hanya link -> biarkan href jalan
  const openBukti = (event, bukti) => {
    if (!bukti.file_path) return
    event.preventDefault()
    downloadFile(`/bukti/${bukti.id}/download`, bukti.judul_bukti)
  }

  return { downloadFile, openBukti }
}