<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard Tindak Lanjut</h1>
        <p class="page-subtitle">Semua Keirbanan — Tahun {{ ui.tahunAktif }}</p>
      </div>
      <span class="badge badge-yellow">Admin TL</span>
    </div>

    <!-- Stat Cards (ringkasan awal saja) -->
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

    <!-- Widget Row 1: TGR + Jenis Rekomendasi + Status donut -->
    <div class="widgets-grid-3">
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
            style="display:flex; justify-content:space-between; padding:0.625rem; border-radius:0.625rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2);"
          >
            <span style="font-size:0.78rem; color:#f87171; font-weight:500;"
              >Sisa TGR</span
            >
            <span
              style="font-size:0.82rem; font-weight:700; color:#f87171;"
              >{{ formatRupiah(dashboard?.tgr?.sisa) }}</span
            >
          </div>
        </div>
      </div>

      <!-- Jenis Rekomendasi + Bukti TL Progress -->
      <div class="glass-card" style="padding:1.25rem;">
        <h3 class="card-title">Rekomendasi Administratif vs TGR</h3>
        <div
          style="display:flex; flex-direction:column; gap:0.875rem; margin-top:0.5rem;"
        >
          <div>
            <div
              style="display:flex; justify-content:space-between; margin-bottom:0.375rem;"
            >
              <span style="font-size:0.75rem; color:var(--text-muted);"
                >Administratif</span
              >
              <span
                style="font-size:0.75rem; font-weight:600; color:var(--text-primary);"
                >{{ dashboard?.rekomendasi_jenis?.administratif ?? 0 }}</span
              >
            </div>
            <div class="progress-track">
              <div
                class="progress-bar-dynamic"
                :style="{ width: jenisPersen.administratif + '%', backgroundColor:'#3b82f6' }"
              ></div>
            </div>
          </div>
          <div>
            <div
              style="display:flex; justify-content:space-between; margin-bottom:0.375rem;"
            >
              <span style="font-size:0.75rem; color:var(--text-muted);"
                >TGR</span
              >
              <span
                style="font-size:0.75rem; font-weight:600; color:var(--text-primary);"
                >{{ dashboard?.rekomendasi_jenis?.tgr ?? 0 }}</span
              >
            </div>
            <div class="progress-track">
              <div
                class="progress-bar-dynamic"
                :style="{ width: jenisPersen.tgr + '%', backgroundColor:'#a855f7' }"
              ></div>
            </div>
          </div>
          <div style="text-align:center; padding-top:0.25rem;">
            <span style="font-size:0.72rem; color:var(--text-muted);"
              >Progress Bukti TL</span
            >
            <p
              style="font-size:1.5rem; font-weight:700; color:var(--text-primary); margin:0.25rem 0 0;"
            >
              {{ dashboard?.bukti_tl_progress?.persen ?? 0 }}%
            </p>
            <span style="font-size:0.7rem; color:var(--text-muted);">
              {{ dashboard?.bukti_tl_progress?.ada_bukti ?? 0 }} dari
              {{ dashboard?.bukti_tl_progress?.total ?? 0 }} rekomendasi
            </span>
          </div>
        </div>
      </div>

      <!-- Donut Status TL -->
      <div class="glass-card" style="padding:1.25rem;">
        <h3 class="card-title">Status Tindak Lanjut</h3>
        <div
          style="height:150px; display:flex; align-items:center; justify-content:center;"
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
                style="font-size:0.76rem; color:var(--text-secondary);"
                >{{ item.label }}</span
              >
            </div>
            <span
              style="font-size:0.76rem; font-weight:600; color:var(--text-primary);"
              >{{ item.value }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Breakdown Penugasan + Alert -->
    <div class="widgets-grid-2">
      <PenugasanBreakdownTable
        :items="monitoring.table"
        :loading="loadingTable"
        :tahun="ui.tahunAktif"
        :show-keirbanan="true"
      />
      <AlertPanel
        :alert-spt="alertSpt"
        :akan-jatuh-tempo="monitoring.alertTlAkanJatuhTempo"
        :terlambat="monitoring.alertTl"
        :show-keirbanan="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useMonitoringStore } from '@/stores/monitoring'
import { useUIStore } from '@/stores/ui'
import StatCard from '@/components/dashboard/StatCard.vue'
import PenugasanBreakdownTable from '@/components/dashboard/PenugasanBreakdownTable.vue'
import AlertPanel from '@/components/dashboard/AlertPanel.vue'
import { formatRupiah } from '@/utils/format'

ChartJS.register(ArcElement, Tooltip, Legend)

const monitoring = useMonitoringStore()
const ui = useUIStore()

const loading = ref(false)
const loadingTable = ref(false)
const dashboard = ref(null)
const alertSpt = ref([])

const tgrProgress = computed(() => {
  const total = dashboard.value?.tgr?.total_nilai || 0
  const lun = dashboard.value?.tgr?.total_terlunasi || 0
  return total > 0 ? Math.round((lun / total) * 100) : 0
})

const jenisPersen = computed(() => {
  const adm = dashboard.value?.rekomendasi_jenis?.administratif || 0
  const tgr = dashboard.value?.rekomendasi_jenis?.tgr || 0
  const total = adm + tgr
  return {
    administratif: total > 0 ? Math.round((adm / total) * 100) : 0,
    tgr: total > 0 ? Math.round((tgr / total) * 100) : 0
  }
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

const loadData = async () => {
  loading.value = true
  loadingTable.value = true
  const [dashRes, sptRes] = await Promise.all([
    monitoring.fetchDashboard(),
    monitoring.fetchAlertSpt(),
    monitoring.fetchAlertTl(),
    monitoring.fetchTable({ tahun: ui.tahunAktif })
  ])
  dashboard.value = dashRes
  alertSpt.value = sptRes || []
  loading.value = false
  loadingTable.value = false
}

onMounted(loadData)
</script>

<style scoped>
.stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.25rem; }
.widgets-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
.widgets-grid-2 { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1rem; align-items: start; }
.card-title { font-size:0.875rem; font-weight:600; color:var(--text-primary); margin:0 0 0.75rem; }
.progress-track { height:6px; background:var(--bg-hover); border-radius:9999px; overflow:hidden; }
.progress-bar-dynamic { height:100%; border-radius:9999px; transition:width 0.5s ease; }
@media(max-width:1200px) { .widgets-grid-3 { grid-template-columns:1fr 1fr; } }
@media(max-width:1024px) { .widgets-grid-2 { grid-template-columns:1fr; } }
@media(max-width:768px) { .stats-grid { grid-template-columns:1fr; } }
</style>
