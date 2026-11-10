import api from './api'

export const kodeTemuanService = {
  // Daftar kode temuan bertingkat (kelompok → sub-kelompok → jenis).
  // params.jenis_penugasan: hanya kelompok yang berlaku untuk jenis penugasan itu.
  getKode: (params = {}) =>
    api.get('/kode-temuan', { params }),

  // Daftar kategori temuan aktif.
  getKategori: () =>
    api.get('/kode-temuan/kategori')
}