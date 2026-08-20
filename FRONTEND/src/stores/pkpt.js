import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pkptService } from '@/services/pkptService'
import { useUIStore } from './ui'
import { useAuthStore } from './auth'

export const usePkptStore = defineStore('pkpt', () => {
  const ui = useUIStore()
  const auth = useAuthStore()

  const list = ref([])
  const current = ref(null)
  const pagination = ref({ total: 0, page: 1, limit: 25, total_pages: 1 })
  const loading = ref(false)
  const error = ref(null)

  // Filter params — ikut tahun aktif & keirbanan user
  const defaultParams = computed(() => {
    const params = {
      tahun: ui.tahunAktif,
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    // admin & irban otomatis filter keirbanan sendiri
    if (!auth.hasAllAccess) {
      params.keirbanan = auth.keirbanan
    }
    return params
  })

  const fetchAll = async (extraParams = {}) => {
    loading.value = true
    error.value = null
    try {
      const res = await pkptService.getAll({
        ...defaultParams.value,
        ...extraParams
      })
      list.value = res.data.data
      pagination.value = res.data.pagination
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat data PKPT.'
    } finally {
      loading.value = false
    }
  }

  const fetchById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await pkptService.getById(id)
      current.value = res.data.data
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat detail PKPT.'
      return null
    } finally {
      loading.value = false
    }
  }

  const create = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await pkptService.create({
        ...data,
        tahun: data.tahun || ui.tahunAktif
      })
      await fetchAll()
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal membuat PKPT.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const update = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await pkptService.update(id, data)
      await fetchAll()
      return { success: true, data: res.data.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mengupdate PKPT.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    loading.value = true
    error.value = null
    try {
      await pkptService.delete(id)
      await fetchAll()
      return { success: true }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal menghapus PKPT.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const setPage = (page) => {
    pagination.value.page = page
    fetchAll()
  }

  const reset = () => {
    list.value = []
    current.value = null
    pagination.value = { total: 0, page: 1, limit: 25, total_pages: 1 }
    error.value = null
  }

  return {
    list, current, pagination, loading, error,
    defaultParams,
    fetchAll, fetchById, create, update, remove,
    setPage, reset
  }
})