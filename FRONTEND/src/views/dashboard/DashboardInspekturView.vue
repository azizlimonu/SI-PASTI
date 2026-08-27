<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard Inspektur</h1>
        <p class="page-subtitle">Semua Keirbanan — Tahun {{ filterTahun }}</p>
      </div>
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <select
          v-model="filterTahun"
          class="select-field"
          style="width:120px;"
          @change="loadData"
        >
          <option v-for="t in ui.daftarTahun" :key="t" :value="t">
            {{ t }}
          </option>
        </select>
        <span class="badge badge-purple">Inspektur</span>
      </div>
    </div>

    <!-- Stat Cards (ringkasan awal saja) -->
    <div
      class="stats-grid"
      style="grid-template-columns: repeat(5,1fr); margin-bottom:1.25rem;"
    >
      <StatCard
        label="Total PKPT"
        :value="dashboard?.pkpt?.total ?? 0"
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
        label="Total Penugasan"
        :value="dashboard?.penugasan?.total ?? 0"
        :sub="`${dashboard?.penugasan?.selesai ?? 0} selesai`"
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
      <StatCard
        label="Total Nilai TGR"
        :value="formatRupiah(dashboard?.tgr?.total_nilai)"
        :sub="`Sisa: ${formatRupiah(dashboard?.tgr?.sisa)}`"
        color="purple"
      >
        <template #icon
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:20px;height:20px;"
          >
            <path
              d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 0 0-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.33.615Z"
            />
            <path
              fill-rule="evenodd"
              d="M9.75 6.079c.082.008.164.02.245.036a2.776 2.776 0 0 1 .755.29V4.5h.5a.75.75 0 0 0 0-1.5h-.5V2.75a.75.75 0 0 0-1.5 0V3h-.5a.75.75 0 0 0 0 1.5h.5v1.579ZM2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm8-6a6 6 0 1 0 0 12A6 6 0 0 0 10 4Z"
              clip-rule="evenodd"
            /></svg
        ></template>
      </StatCard>
    </div>

    <!-- Progress Per Keirbanan -->
    <div class="glass-card" style="padding:1.25rem; margin-bottom:1.25rem;">
      <h3 class="card-title">Progress Penugasan per Keirbanan</h3>
      <div v-if="loading" class="chart-loading">
        <span class="loading-spinner"></span>
      </div>
      <div v-else style="display:flex; flex-direction:column; gap:0.875rem;">
        <div v-for="kb in progressData" :key="kb.keirbanan">
          <div
            style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.375rem;"
          >
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span :class="`badge badge-${keirbanColor(kb.keirbanan)}`"
                >Keirbanan {{ kb.keirbanan }}</span
              >
              <span style="font-size:0.78rem; color:var(--text-secondary);"
                >{{ kb.penugasan.selesai }}/{{ kb.penugasan.total }}
                penugasan</span
              >
            </div>
            <span
              style="font-size:0.78rem; font-weight:600; color:var(--text-primary);"
              >{{ kb.penugasan.progress_persen }}%</span
            >
          </div>
          <div class="progress-track">
            <div
              class="progress-bar-dynamic"
              :style="{ width: kb.penugasan.progress_persen + '%', backgroundColor: keirbanHex(kb.keirbanan) }"
            ></div>
          </div>
          <div
            v-if="kb.alert.spt_belum_lhp > 0"
            style="margin-top:0.25rem; font-size:0.7rem; color:#f87171;"
          >
            ⚠ {{ kb.alert.spt_belum_lhp }} SPT belum ada LHP
          </div>
        </div>
      </div>
    </div>

    <!-- Tabel TGR per Keirbanan -->
    <div class="glass-card" style="margin-bottom:1.25rem;">
      <div
        style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color);"
      >
        <h3 class="card-title" style="margin:0;">Nilai TGR per Keirbanan</h3>
      </div>
      <div class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <thead>
            <tr>
              <th>Keirbanan</th>
              <th>Total Temuan TGR</th>
              <th>Terlunasi</th>
              <th>Sisa</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="kb in progressData" :key="kb.keirbanan">
              <td>
                <span :class="`badge badge-${keirbanColor(kb.keirbanan)}`"
                  >Keirbanan {{ kb.keirbanan }}</span
                >
              </td>
              <td>{{ formatRupiah(kb.tgr.total_nilai) }}</td>
              <td style="color:#34d399;">
                {{ formatRupiah(kb.tgr.total_terlunasi) }}
              </td>
              <td style="color:#f87171;">{{ formatRupiah(kb.tgr.sisa) }}</td>
              <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <div class="progress-track" style="flex:1; height:4px;">
                    <div
                      class="progress-bar-dynamic"
                      :style="{ width: tgrPersen(kb) + '%', backgroundColor: '#34d399' }"
                    ></div>
                  </div>
                  <span
                    style="font-size:0.72rem; color:var(--text-muted); white-space:nowrap;"
                    >{{ tgrPersen(kb) }}%</span
                  >
                </div>
              </td>
            </tr>
            <tr v-if="!progressData.length">
              <td
                colspan="5"
                style="text-align:center; color:var(--text-muted); padding:2rem;"
              >
                Belum ada data
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Breakdown Penugasan + Alert -->
    <div class="widgets-grid-2">
      <PenugasanBreakdownTable
        :items="monitoring.table"
        :loading="loadingTable"
        :tahun="filterTahun"
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
import { ref, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useMonitoringStore } from '@/stores/monitoring'
import StatCard from '@/components/dashboard/StatCard.vue'
import PenugasanBreakdownTable from '@/components/dashboard/PenugasanBreakdownTable.vue'
import AlertPanel from '@/components/dashboard/AlertPanel.vue'
import { formatRupiah } from '@/utils/format'

const ui = useUIStore()
const monitoring = useMonitoringStore()

const loading = ref(false)
const loadingTable = ref(false)
const dashboard = ref(null)
const alertSpt = ref([])
const progressData = ref([])
const filterTahun = ref(new Date().getFullYear())

const keirbanColors = { I: 'blue', II: 'green', III: 'yellow', IV: 'purple', V: 'red' }
const keirbanHexMap = { I: '#3b82f6', II: '#10b981', III: '#f59e0b', IV: '#8b5cf6', V: '#ef4444' }
const keirbanColor = (kb) => keirbanColors[kb] || 'gray'
const keirbanHex = (kb) => keirbanHexMap[kb] || '#64748b'

const tgrPersen = (kb) => {
  const total = kb.tgr.total_nilai || 0
  const lun = kb.tgr.total_terlunasi || 0
  return total > 0 ? Math.round((lun / total) * 100) : 0
}

const loadData = async () => {
  loading.value = true
  loadingTable.value = true
  const [dashRes, progRes, sptRes] = await Promise.all([
    monitoring.fetchDashboard({ tahun: filterTahun.value }),
    monitoring.fetchProgress({ tahun: filterTahun.value }),
    monitoring.fetchAlertSpt(),
    monitoring.fetchAlertTl(),
    monitoring.fetchTable({ tahun: filterTahun.value })
  ])
  dashboard.value = dashRes
  progressData.value = progRes || []
  alertSpt.value = sptRes || []
  loading.value = false
  loadingTable.value = false
}

onMounted(loadData)
</script>

<style scoped>
.card-title { font-size:0.875rem; font-weight:600; color:var(--text-primary); margin:0 0 0.75rem; }
.chart-loading { display:flex; align-items:center; justify-content:center; padding:2rem; }
.progress-track { height:8px; background:var(--bg-hover); border-radius:9999px; overflow:hidden; }
.progress-bar-dynamic { height:100%; border-radius:9999px; transition:width 0.5s ease; }
.widgets-grid-2 { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1rem; align-items: start; }
@media(max-width:1024px) { .stats-grid { grid-template-columns:repeat(3,1fr) !important; } .widgets-grid-2 { grid-template-columns: 1fr; } }
@media(max-width:640px) { .stats-grid { grid-template-columns:repeat(2,1fr) !important; } }
</style>
