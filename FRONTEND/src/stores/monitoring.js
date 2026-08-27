import { defineStore } from 'pinia'
import { ref } from 'vue'
import { monitoringService } from '@/services/monitoringService'
import { useAuthStore } from './auth'

export const useMonitoringStore = defineStore('monitoring', () => {
  const auth = useAuthStore()

  const dashboard = ref(null)
  const alertSpt = ref([])
  const alertTl = ref([])
  const alertTlAkanJatuhTempo = ref([])
  const progress = ref([])
  const log = ref([])
  const table = ref([])
  const logPagination = ref({ total: 0, page: 1, limit: 25, total_pages: 1 })
  const loading = ref(false)
  const error = ref(null)

  // Tidak ada filter tahun — lintas tahun
  const baseParams = () => {
    const params = {}
    if (!auth.hasAllAccess) params.keirbanan = auth.keirbanan
    return params
  }

  const fetchDashboard = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const res = await monitoringService.getDashboard({
        ...baseParams(),
        ...params
      })
      dashboard.value = res.data.data
      return res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Gagal memuat dashboard.'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchAlertSpt = async (params = {}) => {
    loading.value = true
    try {
      const res = await monitoringService.getAlertSpt({
        ...baseParams(),
        ...params
      })
      alertSpt.value = res.data.data
      return res.data.data
    } catch (e) {
      alertSpt.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchAlertTl = async (params = {}) => {
    loading.value = true
    try {
      const res = await monitoringService.getAlertTl({
        ...baseParams(),
        ...params
      })
      alertTl.value = res.data.data
      alertTlAkanJatuhTempo.value = res.data.akan_jatuh_tempo || []
      return { terlambat: alertTl.value, akanJatuhTempo: alertTlAkanJatuhTempo.value }
    } catch (e) {
      alertTl.value = []
      alertTlAkanJatuhTempo.value = []
      return { terlambat: [], akanJatuhTempo: [] }
    } finally {
      loading.value = false
    }
  }

  const fetchProgress = async (params = {}) => {
    loading.value = true
    try {
      const res = await monitoringService.getProgress(params)
      progress.value = res.data.data
      return res.data.data
    } catch (e) {
      progress.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchLog = async (params = {}) => {
    loading.value = true
    try {
      const res = await monitoringService.getLog({
        ...baseParams(),
        page: logPagination.value.page,
        limit: logPagination.value.limit,
        ...params
      })
      log.value = res.data.data
      logPagination.value = {
        total: res.data.total,
        page: res.data.page,
        limit: logPagination.value.limit,
        total_pages: res.data.total_pages
      }
      return res.data.data
    } catch (e) {
      log.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchTable = async (params = {}) => {
    loading.value = true
    try {
      const res = await monitoringService.getTable({
        ...baseParams(),
        ...params
      })
      table.value = res.data.data
      return res.data.data
    } catch (e) {
      table.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const setLogPage = (page) => {
    logPagination.value.page = page
    fetchLog()
  }

  const reset = () => {
    dashboard.value = null
    alertSpt.value = []
    alertTl.value = []
    alertTlAkanJatuhTempo.value = []
    progress.value = []
    log.value = []
    table.value = []
    error.value = null
  }

  return {
    dashboard, alertSpt, alertTl, alertTlAkanJatuhTempo, progress,
    log, logPagination, table, loading, error,
    fetchDashboard, fetchAlertSpt, fetchAlertTl,
    fetchProgress, fetchLog, fetchTable, setLogPage, reset
  }
})