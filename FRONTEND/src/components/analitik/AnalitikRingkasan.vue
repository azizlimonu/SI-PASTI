<template>
  <div>
    <div v-if="error" class="alert-danger" style="margin-bottom:1rem;">
      <span>{{ error }}</span>
    </div>
    <div
      v-if="loading"
      class="glass-card"
      style="padding:2rem; text-align:center; color:var(--text-muted);"
    >
      Memuat data...
    </div>

    <template v-else-if="data">
      <div class="sumber-grid">
        <div
          v-for="s in daftar"
          :key="s.key"
          class="glass-card"
          style="padding:1.25rem;"
        >
          <div
            style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;"
          >
            <h3 class="card-title" style="margin:0;">{{ s.label }}</h3>
            <span :class="`badge badge-${s.warna}`"
              >{{ s.data.penugasan.total }} penugasan</span
            >
          </div>

          <div class="baris">
            <span>Penugasan selesai</span>
            <strong
              >{{ s.data.penugasan.selesai }} /
              {{ s.data.penugasan.total }}</strong
            >
          </div>
          <div class="bar">
            <div
              class="bar-isi"
              :style="{ width: s.data.penugasan.progress_persen + '%' }"
            ></div>
          </div>
          <div class="baris kecil">
            <span
              >Dalam proses {{ s.data.penugasan.dalam_proses }} · Belum mulai
              {{ s.data.penugasan.belum_mulai }}</span
            >
            <span>Sudah ada LHP: {{ s.data.penugasan.ada_lhp }}</span>
          </div>

          <div class="baris" style="margin-top:0.9rem;">
            <span>Temuan</span><strong>{{ s.data.temuan.total }}</strong>
          </div>

          <div class="baris" style="margin-top:0.6rem;">
            <span>Rekomendasi selesai</span>
            <strong
              >{{ s.data.rekomendasi.selesai }} /
              {{ s.data.rekomendasi.total }}</strong
            >
          </div>
          <div class="bar">
            <div
              class="bar-isi hijau"
              :style="{ width: s.data.rekomendasi.progress_persen + '%' }"
            ></div>
          </div>
          <div class="baris kecil">
            <span
              >Belum TL {{ s.data.rekomendasi.belum }} · Dalam proses
              {{ s.data.rekomendasi.dalam_proses }}</span
            >
            <span>{{ s.data.rekomendasi.progress_persen }}%</span>
          </div>

          <div class="baris" style="margin-top:0.9rem;">
            <span>TGR terlunasi</span>
            <strong
              >{{ formatRupiah(s.data.tgr.total_terlunasi) }} /
              {{ formatRupiah(s.data.tgr.total_nilai) }}</strong
            >
          </div>
          <div class="bar">
            <div
              class="bar-isi kuning"
              :style="{ width: s.data.tgr.persen_lunas + '%' }"
            ></div>
          </div>
          <div class="baris kecil">
            <span>Sisa {{ formatRupiah(s.data.tgr.sisa) }}</span>
            <span>{{ s.data.tgr.persen_lunas }}%</span>
          </div>
        </div>
      </div>

      <div class="glass-card" style="padding:1.25rem; margin-top:1rem;">
        <h3 class="card-title">Perbandingan progress (%)</h3>
        <div style="height:260px;">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js'
import { monitoringService } from '@/services/monitoringService'
import { formatRupiah } from '@/utils/format'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({
  filter: { type: Object, default: () => ({}) }
})

const data = ref(null)
const loading = ref(true)
const error = ref('')

const daftar = computed(() => [
  { key: 'PKPT', label: 'PKPT', warna: 'blue', data: data.value.PKPT },
  { key: 'NON_PKPT', label: 'Non-PKPT', warna: 'purple', data: data.value.NON_PKPT }
])

const chartData = computed(() => ({
  labels: ['Penugasan selesai', 'Rekomendasi selesai', 'TGR terlunasi'],
  datasets: [
    {
      label: 'PKPT',
      data: [data.value.PKPT.penugasan.progress_persen, data.value.PKPT.rekomendasi.progress_persen, data.value.PKPT.tgr.persen_lunas],
      backgroundColor: 'rgba(59,130,246,0.8)'
    },
    {
      label: 'Non-PKPT',
      data: [data.value.NON_PKPT.penugasan.progress_persen, data.value.NON_PKPT.rekomendasi.progress_persen, data.value.NON_PKPT.tgr.persen_lunas],
      backgroundColor: 'rgba(139,92,246,0.8)'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true, max: 100 } }
}

const muat = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await monitoringService.getSumber(props.filter)
    data.value = res.data.data
  } catch {
    error.value = 'Gagal memuat ringkasan.'
    data.value = null
  } finally {
    loading.value = false
  }
}

watch(() => props.filter, muat, { deep: true })
onMounted(muat)
</script>

<style scoped>
.sumber-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.baris { display: flex; justify-content: space-between; gap: 0.75rem; font-size: 0.82rem; color: var(--text-secondary); }
.baris strong { color: var(--text-primary); }
.baris.kecil { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; }
.bar { height: 6px; border-radius: 9999px; background: var(--bg-hover); overflow: hidden; margin-top: 0.35rem; }
.bar-isi { height: 100%; border-radius: 9999px; background: var(--accent); transition: width 0.4s ease; }
.bar-isi.hijau { background: #10b981; }
.bar-isi.kuning { background: #f59e0b; }
.card-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin: 0 0 0.75rem; }
@media (max-width: 900px) { .sumber-grid { grid-template-columns: 1fr; } }
</style>
