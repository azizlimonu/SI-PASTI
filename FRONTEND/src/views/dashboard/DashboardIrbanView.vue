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

    <!-- Stat Cards -->
    <div class="stats-grid">
      <StatCard
        label="PKPT Aktif"
        :value="dashboard?.pkpt?.aktif ?? 0"
        :sub="`Total ${dashboard?.pkpt?.total ?? 0}`"
        color="blue"
      >
        <template #icon
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:20px;height:20px;"
          >
            <path
              fill-rule="evenodd"
              d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm2 3a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm1 3a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H7Zm-1 5a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Z"
              clip-rule="evenodd"
            /></svg
        ></template>
      </StatCard>
      <StatCard
        label="Penugasan"
        :value="dashboard?.penugasan?.total ?? 0"
        :sub="`${dashboard?.penugasan?.selesai ?? 0} selesai`"
        color="green"
        :progress="penugasanProgress"
        progress-label="Progress"
      >
        <template #icon
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:20px;height:20px;"
          >
            <path
              d="M5.127 3.502 5.25 3.5h9.5c.041 0 .082 0 .123.002A2.251 2.251 0 0 0 12.75 2h-5.5a2.25 2.25 0 0 0-2.123 1.502ZM1 10.25A2.25 2.25 0 0 1 3.25 8h13.5A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5ZM3.25 6.5c-.04 0-.082 0-.123.002A2.25 2.25 0 0 1 5.25 5h9.5a2.25 2.25 0 0 1 2.123 1.502A3.819 3.819 0 0 0 16.75 6.5H3.25Z"
            /></svg
        ></template>
      </StatCard>
      <StatCard
        label="Total Temuan"
        :value="dashboard?.temuan?.total ?? 0"
        color="yellow"
      >
        <template #icon
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:20px;height:20px;"
          >
            <path
              fill-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clip-rule="evenodd"
            /></svg
        ></template>
      </StatCard>
      <StatCard
        label="Rekomendasi Belum TL"
        :value="dashboard?.rekomendasi?.belum ?? 0"
        color="red"
        :alert="(dashboard?.rekomendasi?.belum ?? 0) > 0"
      >
        <template #icon
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:20px;height:20px;"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
              clip-rule="evenodd"
            /></svg
        ></template>
      </StatCard>
    </div>

    <!-- Alert + Chart -->
    <div class="charts-grid">
      <!-- Alert -->
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <div v-if="alertSpt.length > 0" class="alert-danger">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:18px;height:18px;flex-shrink:0;"
          >
            <path
              fill-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <p style="font-weight:600; margin:0 0 0.25rem;">
              {{ alertSpt.length }} SPT Terlambat
            </p>
            <p style="font-size:0.8rem; margin:0;">
              Sudah lebih dari 30 hari belum ada LHP.
            </p>
          </div>
        </div>
        <div v-if="alertTl.length > 0" class="alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:18px;height:18px;flex-shrink:0;"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <p style="font-weight:600; margin:0 0 0.25rem;">
              {{ alertTl.length }} TL Melewati Batas
            </p>
            <p style="font-size:0.8rem; margin:0;">
              Rekomendasi yang sudah melewati batas waktu.
            </p>
          </div>
        </div>
        <div v-if="!alertSpt.length && !alertTl.length" class="alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:18px;height:18px;flex-shrink:0;"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Tidak ada alert aktif. Semua berjalan baik.</span>
        </div>

        <!-- Nilai TGR -->
        <div class="glass-card" style="padding:1.25rem; flex:1;">
          <h3 class="card-title">Nilai TGR</h3>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <div style="display:flex; justify-content:space-between;">
              <span style="font-size:0.78rem; color:var(--text-muted);"
                >Total</span
              >
              <span
                style="font-size:0.78rem; font-weight:600;"
                >{{ formatRupiah(dashboard?.tgr?.total_nilai) }}</span
              >
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="font-size:0.78rem; color:var(--text-muted);"
                >Terlunasi</span
              >
              <span
                style="font-size:0.78rem; font-weight:600; color:#34d399;"
                >{{ formatRupiah(dashboard?.tgr?.total_terlunasi) }}</span
              >
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="font-size:0.78rem; color:var(--text-muted);"
                >Sisa</span
              >
              <span
                style="font-size:0.78rem; font-weight:600; color:#f87171;"
                >{{ formatRupiah(dashboard?.tgr?.sisa) }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Donut Chart -->
      <div class="glass-card" style="padding:1.25rem;">
        <h3 class="card-title">Status Rekomendasi</h3>
        <div
          style="height:180px; display:flex; align-items:center; justify-content:center;"
        >
          <Doughnut
            v-if="rekChartData"
            :data="rekChartData"
            :options="donutOptions"
          />
          <p v-else style="font-size:0.8rem; color:var(--text-muted);">
            Belum ada data
          </p>
        </div>
        <div
          style="display:flex; flex-direction:column; gap:0.375rem; margin-top:0.75rem;"
        >
          <div
            v-for="item in rekLegend"
            :key="item.label"
            style="display:flex; align-items:center; justify-content:space-between;"
          >
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <div
                :style="{ width:'10px', height:'10px', borderRadius:'50%', backgroundColor: item.color }"
              ></div>
              <span
                style="font-size:0.78rem; color:var(--text-secondary);"
                >{{ item.label }}</span
              >
            </div>
            <span
              style="font-size:0.78rem; font-weight:600; color:var(--text-primary);"
              >{{ item.value }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Penugasan Terbaru (read only) -->
    <div class="glass-card" style="margin-top:1.25rem;">
      <div
        style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color);"
      >
        <h3 class="card-title" style="margin:0;">Daftar Penugasan</h3>
      </div>
      <div class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <thead>
            <tr>
              <th>Nama Penugasan</th>
              <th>Jenis</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in dashboard?.penugasan_terbaru || []" :key="p.id">
              <td style="font-weight:500;">{{ p.nama_penugasan }}</td>
              <td style="font-size:0.78rem; color:var(--text-secondary);">
                {{ p.jenis_penugasan }}
              </td>
              <td>
                <span
                  :class="`badge badge-${BADGE_COLOR[p.status] || 'gray'}`"
                  >{{ p.status }}</span
                >
              </td>
              <td style="font-size:0.78rem; color:var(--text-muted);">
                {{ formatDate(p.created_at) }}
              </td>
            </tr>
            <tr v-if="!dashboard?.penugasan_terbaru?.length">
              <td
                colspan="4"
                style="text-align:center; color:var(--text-muted); padding:2rem;"
              >
                Belum ada penugasan
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useMonitoringStore } from '@/stores/monitoring'
import StatCard from '@/components/dashboard/StatCard.vue'
import { formatRupiah, formatDate } from '@/utils/format'
import { BADGE_COLOR } from '@/utils/constants'

ChartJS.register(ArcElement, Tooltip, Legend)

const auth = useAuthStore()
const ui = useUIStore()
const monitoring = useMonitoringStore()

const loading = ref(false)
const dashboard = ref(null)
const alertSpt = ref([])
const alertTl = ref([])

const penugasanProgress = computed(() => {
  const total = dashboard.value?.penugasan?.total || 0
  const selesai = dashboard.value?.penugasan?.selesai || 0
  return total > 0 ? Math.round((selesai / total) * 100) : 0
})

const rekChartData = computed(() => {
  const rek = dashboard.value?.rekomendasi
  if (!rek) return null
  return {
    labels: ['Belum TL', 'Dalam Proses', 'Selesai'],
    datasets: [{
      data: [rek.belum || 0, rek.dalam_proses || 0, rek.selesai || 0],
      backgroundColor: ['rgba(239,68,68,0.8)', 'rgba(245,158,11,0.8)', 'rgba(16,185,129,0.8)'],
      borderWidth: 1,
      hoverOffset: 4
    }]
  }
})

const rekLegend = computed(() => {
  const rek = dashboard.value?.rekomendasi
  if (!rek) return []
  return [
    { label: 'Belum TL', value: rek.belum || 0, color: 'rgba(239,68,68,0.8)' },
    { label: 'Dalam Proses', value: rek.dalam_proses || 0, color: 'rgba(245,158,11,0.8)' },
    { label: 'Selesai', value: rek.selesai || 0, color: 'rgba(16,185,129,0.8)' }
  ]
})

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  cutout: '70%'
}

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
</script>

<style scoped>
.stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.25rem; }
.charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.card-title { font-size:0.875rem; font-weight:600; color:var(--text-primary); margin:0 0 0.75rem; }
@media(max-width:1024px) { .stats-grid { grid-template-columns:repeat(2,1fr); } .charts-grid { grid-template-columns:1fr; } }
</style>
