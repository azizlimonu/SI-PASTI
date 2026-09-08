<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Monitoring</h1>
        <p class="page-subtitle">
          Dashboard Total &amp; per Keirbanan — Tahun {{ ui.tahunAktif }}
        </p>
      </div>
    </div>

    <div
      v-if="!canAccess"
      class="glass-card"
      style="padding:2rem; text-align:center; color:var(--text-muted);"
    >
      <p style="font-size:0.85rem; max-width:480px; margin:0 auto;">
        Halaman ini menampilkan dashboard total dan detail per keirbanan (I–V),
        khusus untuk Superadmin dan Inspektur. Statistik untuk keirbanan Anda
        sendiri sudah tersedia di halaman
        <RouterLink
          to="/"
          style="color:var(--accent); text-decoration:none; font-weight:500;"
          >Dashboard</RouterLink
        >.
      </p>
    </div>

    <template v-else>
      <div class="tabs-bar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <span
            v-if="tab.key !== 'ALL'"
            class="tab-dot"
            :style="{ backgroundColor: keirbanHex(tab.key) }"
          ></span>
          {{ tab.label }}
        </button>
      </div>

      <DashboardStats
        :dashboard="current.dashboard"
        :alert-spt="current.alertSpt"
        :alert-tl="current.alertTl"
        :loading="current.loading"
        :show-keirbanan-column="activeTab === 'ALL'"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useMonitoringStore } from '@/stores/monitoring'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import { KEIRBANAN } from '@/utils/constants'

const auth = useAuthStore()
const ui = useUIStore()
const monitoring = useMonitoringStore()

const canAccess = computed(() => ['superadmin', 'inspektur'].includes(auth.user?.role))

const tabs = [
  { key: 'ALL', label: 'Total (Seluruh Keirbanan)' },
  ...KEIRBANAN.map((kb) => ({ key: kb, label: `Keirbanan ${kb}` }))
]

const activeTab = ref('ALL')

const keirbanHexMap = { I: '#3b82f6', II: '#10b981', III: '#f59e0b', IV: '#8b5cf6', V: '#ef4444' }
const keirbanHex = (kb) => keirbanHexMap[kb] || '#64748b'

const cache = reactive({})
const cacheKey = (tab) => `${ui.tahunAktif}-${tab}`

const emptyEntry = { dashboard: null, alertSpt: [], alertTl: [], loading: true }

const current = computed(() => cache[cacheKey(activeTab.value)] || emptyEntry)

const loadTab = async (tab) => {
  const key = cacheKey(tab)
  if (cache[key]) return
  cache[key] = { dashboard: null, alertSpt: [], alertTl: [], loading: true }
  const params = tab === 'ALL' ? {} : { keirbanan: tab }
  const [dashRes, sptRes, tlRes] = await Promise.all([
    monitoring.fetchDashboard(params),
    monitoring.fetchAlertSpt(params),
    monitoring.fetchAlertTl(params)
  ])
  cache[key] = {
    dashboard: dashRes,
    alertSpt: sptRes || [],
    alertTl: tlRes || [],
    loading: false
  }
}

watch(activeTab, (tab) => {
  if (canAccess.value) loadTab(tab)
})

// Ganti tahun aktif dari sidebar -> muat ulang tab yang sedang dibuka
// untuk tahun baru tersebut (cache tahun lama tetap tersimpan).
watch(() => ui.tahunAktif, () => {
  if (canAccess.value) loadTab(activeTab.value)
})

onMounted(() => {
  if (canAccess.value) loadTab(activeTab.value)
})
</script>

<style scoped>
.tabs-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid var(--border-color);
  background: var(--bg-card, transparent);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: var(--text-primary);
  border-color: var(--accent);
}

.tab-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
