<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">
          Keirbanan {{ auth.user?.keirbanan }} — Tahun {{ ui.tahunAktif }}
        </p>
      </div>
      <span class="badge badge-green">Irban {{ auth.user?.keirbanan }}</span>
    </div>

    <DashboardStats
      :dashboard="dashboard"
      :alert-spt="alertSpt"
      :alert-tl="alertTl"
      :loading="loading"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useMonitoringStore } from '@/stores/monitoring'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'

const auth = useAuthStore()
const ui = useUIStore()
const monitoring = useMonitoringStore()

const loading = ref(false)
const dashboard = ref(null)
const alertSpt = ref([])
const alertTl = ref([])

const loadData = async () => {
  loading.value = true
  const [dashRes, sptRes, tlRes] = await Promise.all([
    monitoring.fetchDashboard(),
    monitoring.fetchAlertSpt(),
    monitoring.fetchAlertTl()
  ])
  dashboard.value = dashRes
  alertSpt.value = sptRes || []
  alertTl.value = tlRes || []
  loading.value = false
}

onMounted(loadData)

// Reload otomatis saat tahun aktif diganti dari sidebar.
watch(() => ui.tahunAktif, loadData)
</script>
