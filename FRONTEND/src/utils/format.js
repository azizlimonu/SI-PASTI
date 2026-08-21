import dayjs from 'dayjs'
import 'dayjs/locale/id'
dayjs.locale('id')

export const formatDate = (date, format = 'D MMMM YYYY') => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  return dayjs(date).format('D MMM YYYY, HH:mm')
}

export const formatRupiah = (value) => {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

export const formatNumber = (value) => {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('id-ID').format(value)
}

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export const formatDaysAgo = (date) => {
  if (!date) return '-'
  const diff = dayjs().diff(dayjs(date), 'day')
  if (diff === 0) return 'Hari ini'
  if (diff === 1) return 'Kemarin'
  return `${diff} hari lalu`
}

export const formatDaysLeft = (date) => {
  if (!date) return '-'
  const diff = dayjs(date).diff(dayjs(), 'day')
  if (diff < 0) return `Terlambat ${Math.abs(diff)} hari`
  if (diff === 0) return 'Hari ini'
  return `${diff} hari lagi`
}

export const statusRekomendasiColor = (status) => {
  const map = {
    'Belum Ditindaklanjuti': 'red',
    'Dalam Proses': 'yellow',
    'Selesai': 'green'
  }
  return map[status] || 'gray'
}

export const statusPenerimaanColor = (status) => {
  const map = {
    'Diterima': 'green',
    'Sebagian Diterima': 'yellow',
    'Belum Diterima': 'red'
  }
  return map[status] || 'gray'
}

export const statusPenugasanColor = (status) => {
  const map = {
    'Belum Mulai': 'gray',
    'Dalam Proses': 'blue',
    'Selesai': 'green'
  }
  return map[status] || 'gray'
}