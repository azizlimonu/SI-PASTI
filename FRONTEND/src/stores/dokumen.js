import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dokumenService } from '@/services/dokumenService'

export const useDokumenStore = defineStore('dokumen', () => {
  const list = ref([])
  const current = ref(null)
  const temuanList = ref([])
  const rekomendasiList = ref([])
  const pagination = ref({ total: 0, page: 1, limit: 25, total_pages: 1 })
  const loading = ref(false)
  const error = ref(null)

  const fetchByPenugasan = async (penugasanId, params = {}) => {
    loading.value = true
    error.value = null
    try {
      const res = await dokumenService.getByPenugasan(penugasanId, {
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      })
      list.value = res.data.data
      pagination.value = res.data.pagination
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat dokumen.'
    } finally {
      loading.value = false
    }
  }

  const fetchById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await dokumenService.getById(id)
      current.value = res.data.data
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat detail dokumen.'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchTemuan = async (dokumenId, params = {}) => {
    loading.value = true
    try {
      const res = await dokumenService.getTemuanByDokumen(dokumenId, params)
      temuanList.value = res.data.data
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat temuan.'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchRekomendasi = async (temuanId, params = {}) => {
    loading.value = true
    try {
      const res = await dokumenService.getRekomendasiByTemuan(temuanId, params)
      rekomendasiList.value = res.data.data
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat rekomendasi.'
      return []
    } finally {
      loading.value = false
    }
  }

  const create = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await dokumenService.create(data)
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mengupload dokumen.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const update = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await dokumenService.update(id, data)
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mengupdate dokumen.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    loading.value = true
    error.value = null
    try {
      await dokumenService.delete(id)
      list.value = list.value.filter(d => d.id !== id)
      return { success: true }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal menghapus dokumen.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const createTemuanBatch = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await dokumenService.createTemuanBatch(data)
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal menyimpan temuan.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const createRekomendasi = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await dokumenService.createRekomendasi(data)
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal membuat rekomendasi.'
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
    current.value = null
    temuanList.value = []
    rekomendasiList.value = []
    pagination.value = { total: 0, page: 1, limit: 25, total_pages: 1 }
    error.value = null
  }

  return {
    list, current, temuanList, rekomendasiList,
    pagination, loading, error,
    fetchByPenugasan, fetchById,
    fetchTemuan, fetchRekomendasi,
    create, update, remove,
    createTemuanBatch, createRekomendasi,
    setPage, reset
  }
})