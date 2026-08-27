<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Log Aktivitas</h1>
        <p class="page-subtitle">Riwayat Aktivitas Pengguna Sistem</p>
      </div>
    </div>

    <!-- Filter -->
    <div
      class="glass-card"
      style="padding:1rem; margin-bottom:1rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;"
    >
      <input
        v-model="filterAksi"
        type="text"
        class="input-field"
        style="flex:1; min-width:200px;"
        placeholder="Cari aksi (contoh: Tambah Temuan, Login, dll)..."
        @input="handleSearch"
      />
      <select
        v-model="filterBagian"
        class="select-field"
        style="width:190px;"
        @change="loadData"
      >
        <option value="">Semua Bagian</option>
        <option v-for="kb in KEIRBANAN" :key="kb" :value="kb">
          Irban {{ kb }}
        </option>
        <option value="TL">Tindak Lanjut</option>
        <option value="PUSAT">Pusat (Superadmin/Inspektur)</option>
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

      <div v-else-if="!monitoring.log.length" class="empty-state">
        <p style="font-weight:500; color:var(--text-secondary);">
          Belum ada log aktivitas
        </p>
      </div>

      <div v-else class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Bagian</th>
              <th>User</th>
              <th>Aksi</th>
              <th>Jenis</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in monitoring.log" :key="log.id">
              <td
                style="font-size:0.78rem; white-space:nowrap; color:var(--text-muted);"
              >
                {{ formatDateTime(log.created_at) }}
              </td>
              <td>
                <span
                  :class="`badge badge-${bagianColor(log)}`"
                  style="font-size:0.7rem;"
                >
                  {{ bagianLabel(log) }}
                </span>
              </td>
              <td style="font-size:0.82rem;">
                {{ log.user?.nama || log.nama || '-' }}
                <span
                  v-if="log.user?.nip"
                  style="color:var(--text-muted); font-size:0.72rem;"
                >
                  ({{ log.user.nip }})
                </span>
              </td>
              <td style="font-size:0.82rem; font-weight:500;">
                {{ log.aksi }}
              </td>
              <td style="font-size:0.78rem; color:var(--text-muted);">
                {{ log.jenis_dokumen || '-' }}
              </td>
              <td style="font-size:0.78rem; max-width:320px;">
                {{ log.detail || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination
        v-if="monitoring.logPagination.total_pages > 1"
        :current-page="monitoring.logPagination.page"
        :total-pages="monitoring.logPagination.total_pages"
        :total="monitoring.logPagination.total"
        :per-page="monitoring.logPagination.limit"
        @change="monitoring.setLogPage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMonitoringStore } from '@/stores/monitoring'
import AppPagination from '@/components/common/AppPagination.vue'
import { formatDateTime } from '@/utils/format'
import { KEIRBANAN } from '@/utils/constants'

const monitoring = useMonitoringStore()

const filterAksi = ref('')
const filterBagian = ref('')
let searchTimeout = null

const bagianLabel = (log) => {
  if (['I', 'II', 'III', 'IV', 'V'].includes(log.keirbanan)) return `Irban ${log.keirbanan}`
  if (log.user?.role === 'admin_tl') return 'Tindak Lanjut'
  if (log.user?.role === 'superadmin') return 'Super Admin'
  if (log.user?.role === 'inspektur') return 'Inspektur'
  return '-'
}

const bagianColor = (log) => {
  if (['I', 'II', 'III', 'IV', 'V'].includes(log.keirbanan)) {
    return { I: 'blue', II: 'green', III: 'yellow', IV: 'purple', V: 'red' }[log.keirbanan]
  }
  if (log.user?.role === 'admin_tl') return 'yellow'
  return 'gray'
}

const loadData = () => {
  monitoring.setLogPage(1)
  monitoring.fetchLog({
    aksi: filterAksi.value || undefined,
    bagian: filterBagian.value || undefined
  })
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadData, 400)
}

onMounted(loadData)
</script>
