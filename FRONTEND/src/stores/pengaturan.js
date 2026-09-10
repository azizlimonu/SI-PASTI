import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pengaturanService } from '@/services/pengaturanService'

export const usePengaturanStore = defineStore('pengaturan', () => {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetch = async () => {
    loading.value = true
    try {
      const res = await pengaturanService.get()
      data.value = res.data.data
      return data.value
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat pengaturan.'
      return null
    } finally {
      loading.value = false
    }
  }

  const update = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const res = await pengaturanService.update(payload)
      data.value = res.data.data
      return { success: true, data: data.value }
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal menyimpan pengaturan.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch, update }
})