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

    <template v-else-if="kinerja && tren">
      <div class="kpi-grid">
        <StatCard
          label="Rata-rata SPT → LHP"
          :value="kinerja.lead_time_spt_ke_lhp.rata_rata_hari === null ? '-' : kinerja.lead_time_spt_ke_lhp.rata_rata_hari + ' hari'"
          :sub="kinerja.lead_time_spt_ke_lhp.jumlah_penugasan + ' SPT yang sudah ada LHP'"
          color="blue"
        />
        <StatCard
          label="Tercepat / Terlama"
          :value="kinerja.lead_time_spt_ke_lhp.tercepat_hari === null ? '-' : kinerja.lead_time_spt_ke_lhp.tercepat_hari + ' / ' + kinerja.lead_time_spt_ke_lhp.terlama_hari + ' hari'"
          color="gray"
        />
        <StatCard
          label="LHP lebih dari 30 hari"
          :value="kinerja.lead_time_spt_ke_lhp.lebih_dari_30_hari"
          color="yellow"
          :alert="kinerja.lead_time_spt_ke_lhp.lebih_dari_30_hari > 0"
        />
        <StatCard
          label="TL tepat waktu"
          :value="kinerja.tindak_lanjut_tepat_waktu.persen_tepat_waktu + '%'"
          :sub="kinerja.tindak_lanjut_tepat_waktu.tepat_waktu + ' dari ' + kinerja.tindak_lanjut_tepat_waktu.rekomendasi_selesai + ' rekomendasi selesai'"
          color="green"
          :progress="kinerja.tindak_lanjut_tepat_waktu.persen_tepat_waktu"
        />
      </div>

      <div class="glass-card" style="padding:1.25rem; margin-bottom:1rem;">
        <h3 class="card-title">
          Tren bulanan ({{ tren.filter.dari }} s.d. {{ tren.filter.sampai }})
        </h3>
        <div style="height:260px;">
          <Line :data="chartTren" :options="chartOptions" />
        </div>
      </div>

      <div class="dua-kolom">
        <div class="glass-card" style="padding:1.25rem;">
          <h3 class="card-title">Nilai setoran TGR per bulan</h3>
          <div style="height:220px;">
            <Bar :data="chartSetoran" :options="chartOptions" />
          </div>
        </div>

        <div class="glass-card" style="padding:1.25rem;">
          <h3 class="card-title">Pihak dengan rekomendasi terbuka terbanyak</h3>
          <div
            v-if="!kinerja.pihak_rekomendasi_terbuka.length"
            style="color:var(--text-muted); font-size:0.85rem;"
          >
            Tidak ada rekomendasi terbuka.
          </div>
          <table v-else class="table-base">
            <tbody>
              <tr v-for="p in kinerja.pihak_rekomendasi_terbuka" :key="p.nama">
                <td>
                  {{ p.nama }}
                  <div v-if="p.sisa_tgr > 0" class="kecil">
                    Sisa TGR {{ formatRupiah(p.sisa_tgr) }}
                  </div>
                </td>
                <td style="text-align:right; font-weight:600;">
                  {{ p.jumlah }}
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
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, LineElement, PointElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js'
import StatCard from '@/components/dashboard/StatCard.vue'
import { monitoringService } from '@/services/monitoringService'
import { formatRupiah } from '@/utils/format'

ChartJS.register(LineElement, PointElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({
  filter: { type: Object, default: () => ({}) }
})

const kinerja = ref(null)
const tren = ref(null)
const loading = ref(true)
const error = ref('')

const labelBulan = computed(() => tren.value.data.map((b) => b.bulan))

const chartTren = computed(() => ({
  labels: labelBulan.value,
  datasets: [
    { label: 'LHP terbit', data: tren.value.data.map((b) => b.lhp_terbit), borderColor: '#3b82f6', backgroundColor: '#3b82f6', tension: 0.3 },
    { label: 'Tindak lanjut', data: tren.value.data.map((b) => b.tindak_lanjut), borderColor: '#10b981', backgroundColor: '#10b981', tension: 0.3 },
    { label: 'Setoran TGR (kali)', data: tren.value.data.map((b) => b.setoran_jumlah), borderColor: '#f59e0b', backgroundColor: '#f59e0b', tension: 0.3 }
  ]
}))

const chartSetoran = computed(() => ({
  labels: labelBulan.value,
  datasets: [{
    label: 'Nilai setoran (Rp)',
    data: tren.value.data.map((b) => b.setoran_nilai),
    backgroundColor: 'rgba(245,158,11,0.8)'
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true } }
}

const muat = async () => {
  loading.value = true
  error.value = ''
  try {
    const [k, t] = await Promise.all([
      monitoringService.getKinerja(props.filter),
      monitoringService.getTren(props.filter)
    ])
    kinerja.value = k.data.data
    tren.value = { data: t.data.data, filter: t.data.filter }
  } catch {
    error.value = 'Gagal memuat data kinerja.'
    kinerja.value = null
    tren.value = null
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
.card-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin: 0 0 0.75rem; }
@media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 900px) { .dua-kolom { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .kpi-grid { grid-template-columns: 1fr; } }
</style>
