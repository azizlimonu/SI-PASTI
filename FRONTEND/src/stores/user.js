import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/userService'

export const useUserStore = defineStore('user', () => {
  const list = ref([])
  const pagination = ref({ total: 0, page: 1, limit: 25, total_pages: 1 })
  const loading = ref(false)
  const error = ref(null)

  const fetchAll = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const res = await userService.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      })
      list.value = res.data.data
      pagination.value = res.data.pagination
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat data user.'
    } finally {
      loading.value = false
    }
  }

  const create = async (data) => {
    loading.value = true
    error.value = null
    try {
      const res = await userService.create(data)
      await fetchAll()
      return { success: true, data: res.data.data, message: res.data.message }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal membuat user.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const update = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const res = await userService.update(id, data)
      await fetchAll()
      return { success: true, data: res.data }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mengupdate user.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const nonaktifkan = async (id) => {
    loading.value = true
    error.value = null
    try {
      await userService.nonaktifkan(id)
      const user = list.value.find(u => u.id === id)
      if (user) user.status = 'NONAKTIF'
      return { success: true }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal menonaktifkan user.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const aktifkan = async (id) => {
    loading.value = true
    error.value = null
    try {
      await userService.aktifkan(id)
      const user = list.value.find(u => u.id === id)
      if (user) user.status = 'AKTIF'
      return { success: true }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mengaktifkan user.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (id) => {
    loading.value = true
    error.value = null
    try {
      await userService.resetPassword(id)
      return { success: true }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal mereset password.'
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
    pagination.value = { total: 0, page: 1, limit: 25, total_pages: 1 }
    error.value = null
  }

  return {
    list, pagination, loading, error,
    fetchAll, create, update,
    nonaktifkan, aktifkan, resetPassword,
    setPage, reset
  }
})