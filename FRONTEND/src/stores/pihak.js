import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pihakService } from '@/services/pihakService'

export const usePihakStore = defineStore('pihak', () => {
  const list = ref([])
  const current = ref(null)
  const sktjmResult = ref(null)
  const sktjmCandidates = ref([])
  const pagination = ref({ total: 0, page: 1, limit: 25, total_pages: 1 })
  const loading = ref(false)
  const loadingSktjm = ref(false)
  const error = ref(null)

  const fetchAll = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const res = await pihakService.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      })
      list.value = res.data.data
      pagination.value = res.data.pagination
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat data pihak.'
    } finally {
      loading.value = false
    }
  }

  const fetchById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await pihakService.getById(id)
      current.value = res.data.data
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat detail pihak.'
      return null
    } finally {
      loading.value = false
    }
  }

  const create = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await pihakService.create(data)
      await fetchAll()
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal membuat pihak.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const update = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await pihakService.update(id, data)
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mengupdate pihak.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    loading.value = true
    error.value = null
    try {
      await pihakService.delete(id)
      list.value = list.value.filter(p => p.id !== id)
      return { success: true }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal menghapus pihak.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const cekSktjm = async (params = {}) => {
    loadingSktjm.value = true
    sktjmResult.value = null
    sktjmCandidates.value = []
    error.value = null
    try {
      const res = await pihakService.cekSktjm(params)
      sktjmResult.value = res.data.data
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Pihak tidak ditemukan.'
      return { success: false, message: error.value }
    } finally {
      loadingSktjm.value = false
    }
  }

  // Tahap 1: cari kandidat. Kalau cuma 1 hasil, langsung ambil detail
  // SKTJM-nya juga (biar tetap cepat buat kasus umum, tidak perlu klik lagi).
  const cariSktjm = async (q) => {
    loadingSktjm.value = true
    sktjmResult.value = null
    sktjmCandidates.value = []
    error.value = null
    try {
      const res = await pihakService.cariSktjm(q)
      const hasil = res.data.data || []

      if (hasil.length === 0) {
        error.value = 'Pihak tidak ditemukan.'
        return { success: false, message: error.value, candidates: [] }
      }

      if (hasil.length === 1) {
        return await cekSktjm({ pihak_id: hasil[0].id })
      }

      sktjmCandidates.value = hasil
      return { success: true, candidates: hasil }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mencari pihak.'
      return { success: false, message: error.value }
    } finally {
      loadingSktjm.value = false
    }
  }

  const setPage = (page) => {
    pagination.value.page = page
    fetchAll()
  }

  const reset = () => {
    list.value = []
    current.value = null
    sktjmResult.value = null
    sktjmCandidates.value = []
    pagination.value = { total: 0, page: 1, limit: 25, total_pages: 1 }
    error.value = null
  }

  return {
    list, current, sktjmResult, sktjmCandidates,
    pagination, loading, loadingSktjm, error,
    fetchAll, fetchById, create, update, remove,
    cekSktjm, cariSktjm, setPage, reset
  }
})