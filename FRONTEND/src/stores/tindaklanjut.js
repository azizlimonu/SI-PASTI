import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tindakLanjutService } from '@/services/tindakLanjutService'

export const useTindakLanjutStore = defineStore('tindaklanjut', () => {
  const list = ref([])
  const tlByRekomendasi = ref([])
  const buktiList = ref([])
  const pagination = ref({ total: 0, page: 1, limit: 25, total_pages: 1 })
  const loading = ref(false)
  const error = ref(null)

  // Tidak ada filter tahun — lintas tahun
  const fetchAll = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const res = await tindakLanjutService.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      })
      list.value = res.data.data
      pagination.value = res.data.pagination
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat tindak lanjut.'
    } finally {
      loading.value = false
    }
  }

  const fetchByRekomendasi = async (rekomendasiId) => {
    loading.value = true
    try {
      const res = await tindakLanjutService.getByRekomendasi(rekomendasiId)
      tlByRekomendasi.value = res.data.data
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat tindak lanjut.'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchBukti = async (params = {}) => {
    loading.value = true
    try {
      const res = await tindakLanjutService.getAllBukti(params)
      buktiList.value = res.data.data
      return res.data.data
    } catch (e) {
      return []
    } finally {
      loading.value = false
    }
  }

  const create = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await tindakLanjutService.create(data)
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal membuat tindak lanjut.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const createBatch = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await tindakLanjutService.createBatch(data)
      return { success: true, data: res.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal membuat tindak lanjut batch.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const update = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await tindakLanjutService.update(id, data)
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mengupdate tindak lanjut.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    loading.value = true
    error.value = null
    try {
      await tindakLanjutService.delete(id)
      list.value = list.value.filter(tl => tl.id !== id)
      return { success: true }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal menghapus tindak lanjut.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const uploadBukti = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await tindakLanjutService.uploadBukti(data)
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mengupload bukti.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const setPage = (page) => {
    pagination.value.page = page
  }

  const reset = () => {
    list.value = []
    tlByRekomendasi.value = []
    buktiList.value = []
    pagination.value = { total: 0, page: 1, limit: 25, total_pages: 1 }
    error.value = null
  }

  return {
    list, tlByRekomendasi, buktiList,
    pagination, loading, error,
    fetchAll, fetchByRekomendasi, fetchBukti,
    create, createBatch, update, remove,
    uploadBukti, setPage, reset
  }
})