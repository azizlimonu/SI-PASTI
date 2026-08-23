import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { penugasanService } from '@/services/penugasanService'
import { useUIStore } from './ui'
import { useAuthStore } from './auth'

export const usePenugasanStore = defineStore('penugasan', () => {
  const ui = useUIStore()
  const auth = useAuthStore()

  const list = ref([])
  const current = ref(null)
  const spt = ref(null)
  const pagination = ref({ total: 0, page: 1, limit: 25, total_pages: 1 })
  const loading = ref(false)
  const loadingSpt = ref(false)
  const error = ref(null)

  const defaultParams = computed(() => {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    return params
  })

  const fetchAll = async (extraParams = {}) => {
    loading.value = true
    error.value = null
    try {
      const res = await penugasanService.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        tahun: ui.tahunAktif,
        ...extraParams
      })
      list.value = res.data.data
      pagination.value = res.data.pagination
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat data penugasan.'
    } finally {
      loading.value = false
    }
  }

  const fetchById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await penugasanService.getById(id)
      current.value = res.data.data
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat detail penugasan.'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchSpt = async (penugasanId) => {
    loadingSpt.value = true
    try {
      const res = await penugasanService.getSpt(penugasanId)
      spt.value = res.data.data
      return res.data.data
    } catch (e) {
      spt.value = null
      return null
    } finally {
      loadingSpt.value = false
    }
  }

  const create = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await penugasanService.create(data)
      await fetchAll()
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal membuat penugasan.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const update = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await penugasanService.update(id, data)
      if (current.value?.id === id) current.value = res.data.data
      await fetchAll()
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mengupdate penugasan.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    loading.value = true
    error.value = null
    try {
      await penugasanService.delete(id)
      await fetchAll()
      return { success: true }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal menghapus penugasan.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const createSpt = async (data) => {
    loadingSpt.value = true
    error.value = null
    try {
      const res = await penugasanService.createSpt(data)
      spt.value = res.data.data
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal membuat SPT.'
      return { success: false, message: error.value }
    } finally {
      loadingSpt.value = false
    }
  }

  const updateSpt = async (id, data) => {
    loadingSpt.value = true
    error.value = null
    try {
      const res = await penugasanService.updateSpt(id, data)
      spt.value = res.data.data
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mengupdate SPT.'
      return { success: false, message: error.value }
    } finally {
      loadingSpt.value = false
    }
  }

  const setPage = (page) => {
    pagination.value.page = page
    fetchAll()
  }

  const reset = () => {
    list.value = []
    current.value = null
    spt.value = null
    pagination.value = { total: 0, page: 1, limit: 25, total_pages: 1 }
    error.value = null
  }

  return {
    list, current, spt, pagination,
    loading, loadingSpt, error,
    fetchAll, fetchById, fetchSpt,
    create, update, remove,
    createSpt, updateSpt,
    setPage, reset
  }
})