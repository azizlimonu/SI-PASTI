// Jenis Kegiatan SPT
export const JENIS_KEGIATAN = [
  'Audit',
  'Reviu',
  'Monitoring',
  'Evaluasi',
  'Pemeriksaan Khusus',
  'Lainnya'
]

// Jenis Dokumen
export const JENIS_DOKUMEN = [
  'LHP',
  'P2HP',
  'Telaahan Awal',
  'Kertas Kerja',
  'Lainnya'
]

// Jabatan Tim SPT
export const JABATAN_TIM = [
  'Ketua Tim',
  'Anggota',
  'Pengendali Teknis',
  'Pengendali Mutu'
]

// Jenis Pihak
export const JENIS_PIHAK = [
  'ASN',
  'Instansi/OPD',
  'Perusahaan',
  'Perorangan',
  'Lainnya'
]

// Status Penugasan
export const STATUS_PENUGASAN = [
  'Belum Mulai',
  'Dalam Proses',
  'Selesai'
]

// Status Rekomendasi
export const STATUS_REKOMENDASI = [
  'Belum Ditindaklanjuti',
  'Dalam Proses',
  'Selesai'
]

// Status Penerimaan TL
export const STATUS_PENERIMAAN = [
  'Diterima',
  'Sebagian Diterima',
  'Belum Diterima'
]

// Status PKPT
export const STATUS_PKPT = [
  'Aktif',
  'Selesai'
]

// Keirbanan
export const KEIRBANAN = ['I', 'II', 'III', 'IV', 'V']

// Role
export const ROLE_OPTIONS = [
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'admin_tl', label: 'Admin Tindak Lanjut' },
  { value: 'irban', label: 'Irban' },
  { value: 'inspektur', label: 'Inspektur' }
]

// Per page options
export const PER_PAGE_OPTIONS = [10, 25, 50, 100]

// Badge color mapping
export const BADGE_COLOR = {
  // Status rekomendasi
  'Belum Ditindaklanjuti': 'red',
  'Dalam Proses': 'yellow',
  'Selesai': 'green',
  // Status penerimaan TL
  'Diterima': 'green',
  'Sebagian Diterima': 'yellow',
  'Belum Diterima': 'red',
  // Status penugasan
  'Belum Mulai': 'gray',
  // Status PKPT
  'Aktif': 'blue',
  // Role
  'superadmin': 'purple',
  'admin': 'blue',
  'admin_tl': 'yellow',
  'irban': 'green',
  'inspektur': 'gray',
  // Keirbanan
  'I': 'blue',
  'II': 'green',
  'III': 'yellow',
  'IV': 'purple',
  'V': 'red',
  'ALL': 'gray'
}