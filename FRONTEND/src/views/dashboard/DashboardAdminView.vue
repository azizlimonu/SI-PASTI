<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">
          {{ keirbananLabel }} — Tahun {{ ui.tahunAktif }}
        </p>
      </div>
      <span class="badge badge-blue">{{ roleLabel }}</span>
    </div>

    <DashboardStats
      :dashboard="dashboard"
      :alert-spt="alertSpt"
      :alert-tl="alertTl"
      :loading="loadingDashboard"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useMonitoringStore } from '@/stores/monitoring'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'

const auth = useAuthStore()
const ui = useUIStore()
const monitoring = useMonitoringStore()

const loadingDashboard = ref(false)
const dashboard = ref(null)
const alertSpt = ref([])
const alertTl = ref([])

const roleLabel = computed(() => {
  const map = { superadmin: 'Super Admin', admin: `Admin Keirbanan ${auth.user?.keirbanan}` }
  return map[auth.user?.role] || auth.user?.role
})

const keirbananLabel = computed(() =>
  auth.hasAllAccess ? 'Seluruh Keirbanan' : `Keirbanan ${auth.user?.keirbanan}`
)

const loadData = async () => {
  loadingDashboard.value = true
  const [dashRes, sptRes, tlRes] = await Promise.all([
    monitoring.fetchDashboard(),
    monitoring.fetchAlertSpt(),
    monitoring.fetchAlertTl()
  ])
  dashboard.value = dashRes
  alertSpt.value = sptRes || []
  alertTl.value = tlRes || []
  loadingDashboard.value = false
}

onMounted(loadData)

// Reload otomatis saat tahun aktif diganti dari sidebar.
watch(() => ui.tahunAktif, loadData)
</script>
