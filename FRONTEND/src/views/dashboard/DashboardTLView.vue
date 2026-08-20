<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard Tindak Lanjut</h1>
        <p class="page-subtitle">Semua Keirbanan — Lintas Tahun</p>
      </div>
      <span class="badge badge-yellow">Admin TL</span>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <StatCard
        label="Total Rekomendasi"
        :value="dashboard?.rekomendasi?.total ?? 0"
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
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
              clip-rule="evenodd"
            /></svg
        ></template>
      </StatCard>
      <StatCard
        label="Belum Ditindaklanjuti"
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
      <StatCard
        label="Selesai"
        :value="dashboard?.rekomendasi?.selesai ?? 0"
        color="green"
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
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
              clip-rule="evenodd"
            /></svg
        ></template>
      </StatCard>
    </div>

    <!-- TGR + Chart -->
    <div class="charts-grid">
      <!-- Nilai TGR -->
      <div class="glass-card" style="padding:1.25rem;">
        <h3 class="card-title">Nilai TGR Keseluruhan</h3>
        <div
          style="display:flex; flex-direction:column; gap:0.875rem; margin-top:0.5rem;"
        >
          <div>
            <div
              style="display:flex; justify-content:space-between; margin-bottom:0.375rem;"
            >
              <span style="font-size:0.75rem; color:var(--text-muted);"
                >Total Temuan TGR</span
              >
              <span
                style="font-size:0.75rem; font-weight:600; color:var(--text-primary);"
                >{{ formatRupiah(dashboard?.tgr?.total_nilai) }}</span
              >
            </div>
            <div class="progress-track">
              <div
                style="width:100%; height:100%; background:linear-gradient(90deg,#2563eb,#60a5fa); border-radius:9999px;"
              ></div>
            </div>
          </div>
          <div>
            <div
              style="display:flex; justify-content:space-between; margin-bottom:0.375rem;"
            >
              <span style="font-size:0.75rem; color:var(--text-muted);"
                >Terlunasi</span
              >
              <span
                style="font-size:0.75rem; font-weight:600; color:#34d399;"
                >{{ formatRupiah(dashboard?.tgr?.total_terlunasi) }}</span
              >
            </div>
            <div class="progress-track">
              <div
                :style="{ width: tgrProgress + '%', height:'100%', background:'linear-gradient(90deg,#059669,#34d399)', borderRadius:'9999px', transition:'width 0.5s ease' }"
              ></div>
            </div>
          </div>
          <div
            style="display:flex; justify-content:space-between; padding:0.75rem; border-radius:0.75rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2);"
          >
            <span style="font-size:0.8rem; color:#f87171; font-weight:500;"
              >Sisa TGR</span
            >
            <span
              style="font-size:0.875rem; font-weight:700; color:#f87171;"
              >{{ formatRupiah(dashboard?.tgr?.sisa) }}</span
            >
          </div>
        </div>
      </div>

      <!-- Donut Chart -->
      <div class="glass-card" style="padding:1.25rem;">
        <h3 class="card-title">Status Tindak Lanjut</h3>
        <div
          style="height:180px; display:flex; align-items:center; justify-content:center;"
        >
          <Doughnut
            v-if="tlChartData"
            :data="tlChartData"
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
            v-for="item in tlLegend"
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

    <!-- Rekomendasi Melewati Batas Waktu -->
    <div class="glass-card" style="margin-top:1.25rem;">
      <div
        style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between;"
      >
        <h3 class="card-title" style="margin:0;">
          ⚠ Rekomendasi Melewati Batas Waktu
        </h3>
        <span class="badge badge-red">{{ alertTl.length }} item</span>
      </div>
      <div class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <thead>
            <tr>
              <th>Rekomendasi</th>
              <th>Ditujukan Kepada</th>
              <th>Keirbanan</th>
              <th>Batas Waktu</th>
              <th>Terlambat</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in alertTl.slice(0,10)" :key="item.rekomendasi_id">
              <td
                style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.8rem;"
              >
                {{ item.uraian_rekomendasi }}
              </td>
              <td style="font-size:0.8rem;">{{ item.ditujukan_kepada }}</td>
              <td>
                <span class="badge badge-blue">{{ item.keirbanan }}</span>
              </td>
              <td style="font-size:0.78rem; color:var(--text-muted);">
                {{ formatDate(item.batas_waktu_tl) }}
              </td>
              <td>
                <span class="badge badge-red"
                  >{{ item.hari_terlambat }} hari</span
                >
              </td>
              <td>
                <span
                  :class="`badge badge-${statusColor(item.status)}`"
                  >{{ item.status }}</span
                >
              </td>
            </tr>
            <tr v-if="!alertTl.length">
              <td
                colspan="6"
                style="text-align:center; color:var(--text-muted); padding:2rem;"
              >
                Tidak ada rekomendasi terlambat
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
import { useMonitoringStore } from '@/stores/monitoring'
import StatCard from '@/components/dashboard/StatCard.vue'
import { formatRupiah, formatDate } from '@/utils/format'
import { BADGE_COLOR } from '@/utils/constants'

ChartJS.register(ArcElement, Tooltip, Legend)

const monitoring = useMonitoringStore()
const loading = ref(false)
const dashboard = ref(null)
const alertTl = ref([])

const tgrProgress = computed(() => {
  const total = dashboard.value?.tgr?.total_nilai || 0
  const lun = dashboard.value?.tgr?.total_terlunasi || 0
  return total > 0 ? Math.round((lun / total) * 100) : 0
})

const tlChartData = computed(() => {
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

const tlLegend = computed(() => {
  const rek = dashboard.value?.rekomendasi
  if (!rek) return []
  return [
    { label: 'Belum Ditindaklanjuti', value: rek.belum || 0, color: 'rgba(239,68,68,0.8)' },
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

const statusColor = (status) => BADGE_COLOR[status] || 'gray'

const loadData = async () => {
  loading.value = true
  const [dashRes, tlRes] = await Promise.all([
    monitoring.fetchDashboard(),
    monitoring.fetchAlertTl()
  ])
  dashboard.value = dashRes
  alertTl.value = tlRes || []
  loading.value = false
}

onMounted(loadData)
</script>

<style scoped>
.stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.25rem; }
.charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.card-title { font-size:0.875rem; font-weight:600; color:var(--text-primary); margin:0 0 0.75rem; }
.progress-track { height:6px; background:var(--bg-hover); border-radius:9999px; overflow:hidden; }
@media(max-width:768px) { .charts-grid { grid-template-columns:1fr; } }
</style>
