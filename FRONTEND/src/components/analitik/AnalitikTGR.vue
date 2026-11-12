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
      <div class="kpi-grid">
        <StatCard
          label="Total TGR"
          :value="data.total.total_nilai"
          is-currency
          color="blue"
        />
        <StatCard
          label="Terlunasi"
          :value="data.total.total_terlunasi"
          is-currency
          color="green"
          :progress="data.total.persen_lunas"
          progress-label="lunas"
        />
        <StatCard
          label="Sisa Piutang"
          :value="data.total.sisa"
          is-currency
          color="yellow"
        />
        <StatCard
          label="Lewat Jatuh Tempo"
          :value="data.total.lewat_jatuh_tempo.jumlah"
          :sub="formatRupiah(data.total.lewat_jatuh_tempo.nilai_sisa)"
          color="red"
          :alert="data.total.lewat_jatuh_tempo.jumlah > 0"
        />
      </div>

      <div
        class="glass-card"
        style="padding:0; overflow:hidden; margin-bottom:1rem;"
      >
        <div class="table-wrapper" style="border:none; border-radius:0;">
          <table class="table-base">
            <thead>
              <tr>
                <th>Keirbanan</th>
                <th style="text-align:right;">Rekomendasi TGR</th>
                <th style="text-align:right;">Total</th>
                <th style="text-align:right;">Terlunasi</th>
                <th style="text-align:right;">Sisa</th>
                <th style="text-align:right;">% Lunas</th>
                <th style="text-align:right;">Pihak</th>
                <th style="text-align:right;">Lewat Jatuh Tempo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="k in data.per_keirbanan" :key="k.keirbanan">
                <td style="font-weight:600;">Keirbanan {{ k.keirbanan }}</td>
                <td style="text-align:right;">{{ k.jumlah_rekomendasi }}</td>
                <td style="text-align:right;">
                  {{ formatRupiah(k.total_nilai) }}
                </td>
                <td style="text-align:right;">
                  {{ formatRupiah(k.total_terlunasi) }}
                </td>
                <td style="text-align:right;">{{ formatRupiah(k.sisa) }}</td>
                <td style="text-align:right;">{{ k.persen_lunas }}%</td>
                <td style="text-align:right;">{{ k.jumlah_pihak }}</td>
                <td style="text-align:right;">
                  <span
                    v-if="k.lewat_jatuh_tempo.jumlah"
                    class="badge badge-red"
                  >
                    {{ k.lewat_jatuh_tempo.jumlah }} ·
                    {{ formatRupiah(k.lewat_jatuh_tempo.nilai_sisa) }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="dua-kolom">
        <div class="glass-card" style="padding:1.25rem;">
          <h3 class="card-title">Umur piutang (sejak tanggal LHP)</h3>
          <div style="height:220px;">
            <Bar :data="chartData" :options="chartOptions" />
          </div>
          <table class="table-base" style="margin-top:0.75rem;">
            <tbody>
              <tr v-for="a in data.aging" :key="a.rentang">
                <td>{{ a.rentang }}</td>
                <td style="text-align:right;">{{ a.jumlah }} rekomendasi</td>
                <td style="text-align:right; font-weight:600;">
                  {{ formatRupiah(a.nilai_sisa) }}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="catatan">
            Piutang macet (umur &gt; 90 hari dan tanpa setoran 90 hari
            terakhir):
            <strong>{{ data.macet.jumlah }}</strong> rekomendasi,
            {{ formatRupiah(data.macet.nilai_sisa) }}.
          </div>
        </div>

        <div class="glass-card" style="padding:1.25rem;">
          <h3 class="card-title">5 pihak dengan sisa terbesar</h3>
          <div
            v-if="!data.top_pihak.length"
            style="color:var(--text-muted); font-size:0.85rem;"
          >
            Tidak ada sisa piutang.
          </div>
          <table v-else class="table-base">
            <tbody>
              <tr v-for="p in data.top_pihak" :key="p.nama">
                <td>
                  {{ p.nama }}
                  <div class="kecil">{{ p.jumlah }} rekomendasi</div>
                </td>
                <td style="text-align:right; font-weight:600;">
                  {{ formatRupiah(p.nilai_sisa) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p class="catatan">Per tanggal {{ tanggalAcuan }}.</p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js'
import StatCard from '@/components/dashboard/StatCard.vue'
import { monitoringService } from '@/services/monitoringService'
import { formatRupiah } from '@/utils/format'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({
  filter: { type: Object, default: () => ({}) }
})

const data = ref(null)
const tanggalAcuan = ref('')
const loading = ref(true)
const error = ref('')

const chartData = computed(() => ({
  labels: data.value.aging.map((a) => a.rentang),
  datasets: [{
    label: 'Sisa piutang (Rp)',
    data: data.value.aging.map((a) => a.nilai_sisa),
    backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(249,115,22,0.8)', 'rgba(239,68,68,0.8)']
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } }
}

const muat = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await monitoringService.getTgr(props.filter)
    data.value = res.data.data
    tanggalAcuan.value = res.data.tanggal_acuan
  } catch {
    error.value = 'Gagal memuat data TGR.'
    data.value = null
  } finally {
    loading.value = false
  }
}

watch(() => props.filter, muat, { deep: true })
onMounted(muat)
</script>

<style scoped>
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
.dua-kolom { display: grid; grid-template-columns: 1.3fr 1fr; gap: 1rem; }
.kecil { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem; }
.catatan { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.75rem; }
.card-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin: 0 0 0.75rem; }
@media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 900px) { .dua-kolom { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .kpi-grid { grid-template-columns: 1fr; } }
</style>
