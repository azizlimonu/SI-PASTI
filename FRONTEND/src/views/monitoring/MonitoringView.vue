<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Monitoring</h1>
        <p class="page-subtitle">
          Rekap Penugasan &amp; Tindak Lanjut — Tahun {{ ui.tahunAktif }}
        </p>
      </div>
    </div>

    <!-- Filter -->
    <div
      class="glass-card"
      style="padding:1rem; margin-bottom:1rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;"
    >
      <div style="position:relative; flex:1; min-width:200px;">
        <input
          v-model="search"
          type="text"
          class="input-field"
          placeholder="Cari nama penugasan..."
        />
      </div>
      <select
        v-if="auth.hasAllAccess"
        v-model="filterKeirbanan"
        class="select-field"
        style="width:160px;"
        @change="loadData"
      >
        <option value="">Semua Keirbanan</option>
        <option v-for="kb in KEIRBANAN" :key="kb" :value="kb">
          Keirbanan {{ kb }}
        </option>
      </select>
    </div>

    <!-- Table -->
    <div class="glass-card">
      <div
        v-if="monitoring.loading"
        style="padding:3rem; display:flex; justify-content:center;"
      >
        <span class="loading-spinner"></span>
      </div>

      <div v-else-if="!filteredTable.length" class="empty-state">
        <p style="font-weight:500; color:var(--text-secondary);">
          Belum ada data penugasan
        </p>
        <p style="font-size:0.8rem;">
          Tidak ada penugasan pada tahun {{ ui.tahunAktif }}.
        </p>
      </div>

      <div v-else class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <thead>
            <tr>
              <th>No</th>
              <th v-if="auth.hasAllAccess">Keirbanan</th>
              <th>Nama Penugasan</th>
              <th>Temuan</th>
              <th>Rekomendasi</th>
              <th>Status Tindak Lanjut</th>
              <th>Tindak Lanjut</th>
              <th>Bukti TL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in filteredTable" :key="item.penugasan_id">
              <td style="color:var(--text-muted); font-size:0.8rem;">
                {{ i + 1 }}
              </td>
              <td v-if="auth.hasAllAccess">
                <span
                  :class="`badge badge-${BADGE_COLOR[item.keirbanan] || 'gray'}`"
                >
                  Keirbanan {{ item.keirbanan }}
                </span>
              </td>
              <td>
                <RouterLink
                  :to="`/penugasan/${item.penugasan_id}`"
                  style="color:var(--accent); text-decoration:none; font-weight:500;"
                >
                  {{ item.nama_penugasan }}
                </RouterLink>
              </td>
              <td>{{ item.jumlah_temuan }}</td>
              <td>{{ item.jumlah_rekomendasi }}</td>
              <td>
                <div style="display:flex; gap:0.3rem; flex-wrap:wrap;">
                  <span class="badge badge-green" style="font-size:0.68rem;">
                    {{ item.status_tindak_lanjut.selesai }} Selesai
                  </span>
                  <span class="badge badge-yellow" style="font-size:0.68rem;">
                    {{ item.status_tindak_lanjut.dalam_proses }} Proses
                  </span>
                  <span class="badge badge-red" style="font-size:0.68rem;">
                    {{ item.status_tindak_lanjut.belum }} Belum
                  </span>
                </div>
              </td>
              <td>{{ item.jumlah_tindak_lanjut }}</td>
              <td>{{ item.jumlah_bukti_tl }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMonitoringStore } from '@/stores/monitoring'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { KEIRBANAN, BADGE_COLOR } from '@/utils/constants'

const monitoring = useMonitoringStore()
const auth = useAuthStore()
const ui = useUIStore()

const search = ref('')
const filterKeirbanan = ref('')

const filteredTable = computed(() => {
  if (!search.value.trim()) return monitoring.table
  const q = search.value.toLowerCase()
  return monitoring.table.filter(item =>
    item.nama_penugasan.toLowerCase().includes(q)
  )
})

const loadData = () => {
  monitoring.fetchTable({
    tahun: ui.tahunAktif,
    keirbanan: filterKeirbanan.value || undefined
  })
}

watch(() => ui.tahunAktif, loadData)
onMounted(loadData)
</script>
