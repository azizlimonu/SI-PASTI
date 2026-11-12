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
      <div
        style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;"
      >
        <span class="badge badge-blue"
          >Total temuan: {{ data.ringkasan.total_temuan }}</span
        >
        <span class="badge badge-purple"
          >Berkode baku: {{ data.ringkasan.berkode }}</span
        >
        <span class="badge badge-green"
          >Manual: {{ data.ringkasan.manual }}</span
        >
        <span class="badge badge-gray"
          >Belum dikategorikan: {{ data.ringkasan.belum_dikategorikan }}</span
        >
      </div>

      <div class="glass-card" style="padding:1.25rem; margin-bottom:1rem;">
        <h3 class="card-title">Jumlah temuan per kategori</h3>
        <div
          v-if="!adaData"
          style="color:var(--text-muted); font-size:0.85rem;"
        >
          Belum ada temuan pada filter ini.
        </div>
        <div v-else :style="{ height: tinggiChart + 'px' }">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <div
        class="glass-card"
        style="padding:0; overflow:hidden; margin-bottom:1rem;"
      >
        <div class="table-wrapper" style="border:none; border-radius:0;">
          <table class="table-base">
            <thead>
              <tr>
                <th>Kategori</th>
                <th style="text-align:right;">Temuan</th>
                <th style="text-align:right;">Rekomendasi</th>
                <th style="text-align:right;">TGR Terlunasi / Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="k in data.per_kategori" :key="k.kode || 'belum'">
                <td>{{ k.nama }}</td>
                <td style="text-align:right;">{{ k.jumlah_temuan }}</td>
                <td style="text-align:right;">{{ k.jumlah_rekomendasi }}</td>
                <td style="text-align:right;">
                  {{ k.tgr_total > 0 ? formatRupiah(k.tgr_terlunasi) + ' / ' + formatRupiah(k.tgr_total) : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="dua-kolom">
        <div class="glass-card" style="padding:1.25rem;">
          <h3 class="card-title">10 kode temuan terbanyak</h3>
          <div
            v-if="!data.top_kode.length"
            style="color:var(--text-muted); font-size:0.85rem;"
          >
            Belum ada temuan berkode baku.
          </div>
          <table v-else class="table-base">
            <tbody>
              <tr v-for="t in data.top_kode" :key="t.kode">
                <td style="white-space:nowrap; font-weight:600;">
                  {{ t.kode }}
                </td>
                <td>
                  {{ t.uraian }}
                  <div class="kecil">{{ t.kategori }}</div>
                </td>
                <td style="text-align:right; font-weight:600;">
                  {{ t.jumlah }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="glass-card" style="padding:1.25rem;">
          <h3 class="card-title">Per kelompok kode</h3>
          <div
            v-if="!data.per_kelompok.length"
            style="color:var(--text-muted); font-size:0.85rem;"
          >
            Belum ada temuan berkode baku.
          </div>
          <table v-else class="table-base">
            <tbody>
              <tr v-for="k in data.per_kelompok" :key="k.kode">
                <td style="white-space:nowrap; font-weight:600;">
                  {{ k.kode }}
                </td>
                <td>{{ k.nama }}</td>
                <td style="text-align:right; font-weight:600;">
                  {{ k.jumlah }}
                </td>
              </tr>
            </tbody>
          </table>
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

const adaData = computed(() => (data.value?.ringkasan.total_temuan || 0) > 0)
const tinggiChart = computed(() => Math.max(220, (data.value?.per_kategori.length || 0) * 34))

const chartData = computed(() => ({
  labels: data.value.per_kategori.map((k) => k.nama),
  datasets: [{
    label: 'Jumlah temuan',
    data: data.value.per_kategori.map((k) => k.jumlah_temuan),
    backgroundColor: 'rgba(59,130,246,0.8)'
  }]
}))

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
}

const muat = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await monitoringService.getTemuanRingkasan(props.filter)
    data.value = res.data.data
  } catch {
    error.value = 'Gagal memuat data temuan.'
    data.value = null
  } finally {
    loading.value = false
  }
}

watch(() => props.filter, muat, { deep: true })
onMounted(muat)
</script>

<style scoped>
.dua-kolom { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1rem; }
.kecil { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem; }
.card-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin: 0 0 0.75rem; }
@media (max-width: 900px) { .dua-kolom { grid-template-columns: 1fr; } }
</style>
