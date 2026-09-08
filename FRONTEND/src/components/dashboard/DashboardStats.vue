<template>
  <div>
    <!-- Alert Banner -->
    <div
      v-if="showAlerts && (alertSpt.length > 0 || alertTl.length > 0)"
      style="margin-bottom:1.25rem; display:flex; flex-direction:column; gap:0.5rem;"
    >
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
        <span
          ><strong>{{ alertSpt.length }} SPT</strong> sudah lebih dari 30 hari
          belum ada LHP.</span
        >
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
        <span
          ><strong>{{ alertTl.length }} rekomendasi</strong> sudah melewati
          batas waktu tindak lanjut.</span
        >
      </div>
    </div>
    <div
      v-else-if="showAlerts && !loading"
      class="alert-success"
      style="margin-bottom:1.25rem;"
    >
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

    <!-- Stat Cards -->
    <!-- Backlog / PR Tahun Sebelumnya -->
    <div
      v-if="showBacklog && hasBacklog"
      class="glass-card"
      style="padding:1.25rem; margin-bottom:1.25rem; border-color:rgba(245,158,11,0.35);"
    >
      <h3
        class="card-title"
        style="display:flex; align-items:center; gap:0.4rem;"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          style="width:16px;height:16px; color:#f59e0b;"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
            clip-rule="evenodd"
          />
        </svg>
        Backlog dari Tahun Sebelum {{ dashboard?.backlog?.tahun_referensi }}
      </h3>
      <div class="backlog-grid">
        <div v-if="showLhpBacklog" class="backlog-item">
          <span
            class="backlog-value"
            >{{ dashboard?.backlog?.penugasan_belum_lhp ?? 0 }}</span
          >
          <span class="backlog-label">Penugasan Belum Ada LHP</span>
        </div>
        <div class="backlog-item">
          <span
            class="backlog-value"
            >{{ dashboard?.backlog?.rekomendasi_belum_tl ?? 0 }}</span
          >
          <span class="backlog-label">Rekomendasi Belum Ditindaklanjuti</span>
        </div>
        <div class="backlog-item">
          <span
            class="backlog-value"
            >{{ dashboard?.backlog?.rekomendasi_proses_tl ?? 0 }}</span
          >
          <span class="backlog-label">Rekomendasi Belum Selesai TL</span>
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <StatCard
        label="PKPT Aktif"
        :value="dashboard?.pkpt?.aktif ?? 0"
        :sub="`Total ${dashboard?.pkpt?.total ?? 0} PKPT`"
        color="blue"
        :loading="loading"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:20px;height:20px;"
          >
            <path
              fill-rule="evenodd"
              d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm2 3a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm1 3a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H7Zm-1 5a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Z"
              clip-rule="evenodd"
            />
          </svg>
        </template>
      </StatCard>

      <StatCard
        label="Penugasan Berjalan"
        :value="dashboard?.penugasan?.dalam_proses ?? 0"
        :sub="`${dashboard?.penugasan?.selesai ?? 0} selesai dari ${dashboard?.penugasan?.total ?? 0}`"
        color="green"
        :progress="penugasanProgress"
        progress-label="Progress penugasan"
        :loading="loading"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:20px;height:20px;"
          >
            <path
              d="M5.127 3.502 5.25 3.5h9.5c.041 0 .082 0 .123.002A2.251 2.251 0 0 0 12.75 2h-5.5a2.25 2.25 0 0 0-2.123 1.502ZM1 10.25A2.25 2.25 0 0 1 3.25 8h13.5A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5ZM3.25 6.5c-.04 0-.082 0-.123.002A2.25 2.25 0 0 1 5.25 5h9.5a2.25 2.25 0 0 1 2.123 1.502A3.819 3.819 0 0 0 16.75 6.5H3.25Z"
            />
          </svg>
        </template>
      </StatCard>

      <StatCard
        label="Total Temuan"
        :value="dashboard?.temuan?.total ?? 0"
        :sub="`${dashboard?.dokumen?.total ?? 0} dokumen`"
        color="yellow"
        :loading="loading"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:20px;height:20px;"
          >
            <path
              fill-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clip-rule="evenodd"
            />
          </svg>
        </template>
      </StatCard>

      <StatCard
        label="Rekomendasi Belum TL"
        :value="dashboard?.rekomendasi?.belum ?? 0"
        :sub="`${dashboard?.rekomendasi?.selesai ?? 0} sudah selesai`"
        color="red"
        :alert="(dashboard?.rekomendasi?.belum ?? 0) > 0"
        :loading="loading"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:20px;height:20px;"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
              clip-rule="evenodd"
            />
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- Charts Row -->
    <div class="charts-grid">
      <!-- Donut Chart Status Rekomendasi -->
      <div class="glass-card" style="padding:1.25rem;">
        <h3 class="card-title">Status Rekomendasi</h3>
        <div v-if="loading" class="chart-loading">
          <span class="loading-spinner"></span>
        </div>
        <div
          v-else
          style="height:200px; display:flex; align-items:center; justify-content:center;"
        >
          <Doughnut
            v-if="rekomendasiChartData"
            :data="rekomendasiChartData"
            :options="donutOptions"
          />
          <p v-else class="text-muted" style="font-size:0.8rem;">
            Belum ada data
          </p>
        </div>
        <div
          v-if="dashboard?.rekomendasi"
          style="display:flex; flex-direction:column; gap:0.375rem; margin-top:0.75rem;"
        >
          <div
            v-for="item in rekomendasiLegend"
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

      <!-- Nilai TGR -->
      <div class="glass-card" style="padding:1.25rem;">
        <h3 class="card-title">Nilai Temuan TGR</h3>
        <div v-if="loading" class="chart-loading">
          <span class="loading-spinner"></span>
        </div>
        <div
          v-else
          style="display:flex; flex-direction:column; gap:1rem; margin-top:0.5rem;"
        >
          <div>
            <div
              style="display:flex; justify-content:space-between; margin-bottom:0.375rem;"
            >
              <span style="font-size:0.75rem; color:var(--text-muted);"
                >Total Temuan</span
              >
              <span
                style="font-size:0.75rem; font-weight:600; color:var(--text-primary);"
                >{{ formatRupiah(dashboard?.tgr?.total_nilai) }}</span
              >
            </div>
            <div class="progress-track">
              <div class="progress-bar progress-blue" style="width:100%"></div>
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
                class="progress-bar progress-green"
                :style="{ width: tgrProgress + '%' }"
              ></div>
            </div>
          </div>
          <div
            style="display:flex; justify-content:space-between; padding:0.75rem; border-radius:0.75rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2);"
          >
            <span style="font-size:0.8rem; color:#f87171;">Sisa</span>
            <span
              style="font-size:0.8rem; font-weight:700; color:#f87171;"
              >{{ formatRupiah(dashboard?.tgr?.sisa) }}</span
            >
          </div>
          <div style="text-align:center;">
            <span style="font-size:0.72rem; color:var(--text-muted);"
              >Progress pelunasan</span
            >
            <p
              style="font-size:1.5rem; font-weight:700; color:var(--text-primary); margin:0.25rem 0 0;"
            >
              {{ tgrProgress }}%
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Penugasan Terbaru -->
    <div class="glass-card" style="margin-top:1.25rem;">
      <div
        style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between;"
      >
        <h3 class="card-title" style="margin:0;">Penugasan Terbaru</h3>
        <RouterLink
          to="/penugasan"
          style="font-size:0.78rem; color:var(--accent); text-decoration:none;"
          >Lihat semua →</RouterLink
        >
      </div>
      <div v-if="loading" class="chart-loading" style="padding:2rem;">
        <span class="loading-spinner"></span>
      </div>
      <div
        v-else-if="!dashboard?.penugasan_terbaru?.length"
        class="empty-state"
        style="padding:2rem;"
      >
        <p style="font-size:0.85rem;">Belum ada penugasan</p>
      </div>
      <div v-else class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <thead>
            <tr>
              <th>Nama Penugasan</th>
              <th>Jenis</th>
              <th v-if="showKeirbananColumn">Keirbanan</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in dashboard.penugasan_terbaru" :key="p.id">
              <td>
                <RouterLink
                  :to="`/penugasan/${p.id}`"
                  style="color:var(--accent); text-decoration:none; font-weight:500;"
                >
                  {{ p.nama_penugasan }}
                </RouterLink>
              </td>
              <td style="font-size:0.78rem; color:var(--text-secondary);">
                {{ p.jenis_penugasan }}
              </td>
              <td v-if="showKeirbananColumn">
                <span
                  :class="`badge badge-${p.pkpt?.keirbanan ? BADGE_COLOR[p.pkpt.keirbanan] : 'gray'}`"
                  >{{ p.pkpt?.keirbanan || '-' }}</span
                >
              </td>
              <td>
                <span
                  :class="`badge badge-${statusColor(p.status)}`"
                  >{{ p.status }}</span
                >
              </td>
              <td style="font-size:0.78rem; color:var(--text-muted);">
                {{ formatDate(p.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import StatCard from '@/components/dashboard/StatCard.vue'
import { formatRupiah, formatDate } from '@/utils/format'
import { BADGE_COLOR } from '@/utils/constants'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  dashboard: { type: Object, default: null },
  alertSpt: { type: Array, default: () => [] },
  alertTl: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  showAlerts: { type: Boolean, default: true },
  // Tampilkan kolom Keirbanan di tabel Penugasan Terbaru — berguna saat
  // scope-nya lintas keirbanan (Total / dashboard Inspektur), tidak
  // relevan saat scope sudah 1 keirbanan spesifik.
  showKeirbananColumn: { type: Boolean, default: false },
  // Tampilkan kartu Backlog (PR tahun sebelumnya). Admin TL tetap
  // showBacklog=true tapi showLhpBacklog=false, karena LHP bukan urusannya.
  showBacklog: { type: Boolean, default: true },
  showLhpBacklog: { type: Boolean, default: true }
})

const hasBacklog = computed(() => {
  const b = props.dashboard?.backlog
  if (!b) return false
  return (b.penugasan_belum_lhp || 0) > 0 ||
    (b.rekomendasi_belum_tl || 0) > 0 ||
    (b.rekomendasi_proses_tl || 0) > 0
})

const penugasanProgress = computed(() => {
  const total = props.dashboard?.penugasan?.total || 0
  const selesai = props.dashboard?.penugasan?.selesai || 0
  return total > 0 ? Math.round((selesai / total) * 100) : 0
})

const tgrProgress = computed(() => {
  const total = props.dashboard?.tgr?.total_nilai || 0
  const terlunasi = props.dashboard?.tgr?.total_terlunasi || 0
  return total > 0 ? Math.round((terlunasi / total) * 100) : 0
})

const rekomendasiChartData = computed(() => {
  const rek = props.dashboard?.rekomendasi
  if (!rek || (rek.belum + rek.dalam_proses + rek.selesai) === 0) return null
  return {
    labels: ['Belum TL', 'Dalam Proses', 'Selesai'],
    datasets: [{
      data: [rek.belum || 0, rek.dalam_proses || 0, rek.selesai || 0],
      backgroundColor: ['rgba(239,68,68,0.8)', 'rgba(245,158,11,0.8)', 'rgba(16,185,129,0.8)'],
      borderColor: ['rgba(239,68,68,1)', 'rgba(245,158,11,1)', 'rgba(16,185,129,1)'],
      borderWidth: 1,
      hoverOffset: 4
    }]
  }
})

const rekomendasiLegend = computed(() => {
  const rek = props.dashboard?.rekomendasi
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
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}` } }
  },
  cutout: '70%'
}

const statusColor = (status) => BADGE_COLOR[status] || 'gray'
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
}

.backlog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.backlog-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  border-radius: 0.6rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.backlog-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f59e0b;
}

.backlog-label {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .backlog-grid { grid-template-columns: 1fr; }
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.progress-track {
  height: 6px;
  background: var(--bg-hover);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.5s ease;
}

.progress-blue { background: linear-gradient(90deg, #2563eb, #60a5fa); }
.progress-green { background: linear-gradient(90deg, #059669, #34d399); }

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
