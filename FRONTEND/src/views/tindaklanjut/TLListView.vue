<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tindak Lanjut</h1>
        <p class="page-subtitle">Daftar Tindak Lanjut</p>
      </div>
    </div>

    <!-- Filter & Search -->
    <div
      class="glass-card"
      style="padding:1rem; margin-bottom:1rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;"
    >
      <div style="position:relative; flex:1; min-width:200px;">
        <input
          v-model="search"
          type="text"
          class="input-field"
          placeholder="Cari uraian TL, rekomendasi, temuan, atau penugasan..."
          @input="handleSearch"
        />
      </div>

      <select
        v-model="filterStatusPenerimaan"
        class="select-field"
        style="width:170px;"
        @change="loadData"
      >
        <option value="">Semua Status TL</option>
        <option v-for="s in STATUS_PENERIMAAN" :key="s" :value="s">
          {{ s }}
        </option>
      </select>

      <select
        v-model="filterStatusRekomendasi"
        class="select-field"
        style="width:180px;"
        @change="loadData"
      >
        <option value="">Semua Status Rekomendasi</option>
        <option v-for="s in STATUS_REKOMENDASI" :key="s" :value="s">
          {{ s }}
        </option>
      </select>

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
        v-if="tlStore.loading"
        style="padding:3rem; display:flex; justify-content:center;"
      >
        <span class="loading-spinner"></span>
      </div>

      <div v-else-if="!tlStore.list.length" class="empty-state">
        <p style="font-weight:500; color:var(--text-secondary);">
          Belum ada tindak lanjut
        </p>
        <p style="font-size:0.8rem;">
          Tidak ada data tindak lanjut yang sesuai filter.
        </p>
      </div>

      <div v-else class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <colgroup>
            <col style="width:40px;" />
            <col v-if="auth.hasAllAccess" style="width:110px;" />
            <col style="width:26%;" />
            <col style="width:14%;" />
            <col style="width:14%;" />
            <col style="width:110px;" />
            <col style="width:16%;" />
            <col style="width:95px;" />
            <col style="width:110px;" />
            <col style="width:70px;" />
          </colgroup>
          <thead>
            <tr>
              <th>No</th>
              <th v-if="auth.hasAllAccess">Keirbanan</th>
              <th>Penugasan</th>
              <th>Temuan</th>
              <th>Rekomendasi</th>
              <th>Status Rekomendasi</th>
              <th>Uraian TL</th>
              <th>Tanggal TL</th>
              <th>Status TL</th>
              <th>Bukti</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tl, i) in tlStore.list" :key="tl.id">
              <td style="color:var(--text-muted); font-size:0.8rem;">
                {{ i + 1 }}
              </td>
              <td v-if="auth.hasAllAccess">
                <span
                  :class="`badge badge-${BADGE_COLOR[tl.rekomendasi?.temuan?.dokumen?.penugasan?.pkpt?.keirbanan] || 'gray'}`"
                >
                  Keirbanan
                  {{ tl.rekomendasi?.temuan?.dokumen?.penugasan?.pkpt?.keirbanan }}
                </span>
              </td>
              <td>
                <RouterLink
                  :to="`/penugasan/${tl.rekomendasi?.temuan?.dokumen?.penugasan?.id}`"
                  style="color:var(--accent); text-decoration:none; font-weight:500; font-size:0.82rem;"
                >
                  {{ tl.rekomendasi?.temuan?.dokumen?.penugasan?.nama_penugasan }}
                </RouterLink>
              </td>
              <td style="font-size:0.8rem;">
                {{ tl.rekomendasi?.temuan?.judul_temuan }}
              </td>
              <td style="font-size:0.8rem;">
                {{ tl.rekomendasi?.ditujukan_kepada }}
              </td>
              <td>
                <span
                  :class="`badge badge-${statusRekomendasiColor(tl.rekomendasi?.status)}`"
                  style="font-size:0.68rem;"
                >
                  {{ tl.rekomendasi?.status }}
                </span>
              </td>
              <td style="font-size:0.8rem;">{{ tl.uraian_tl }}</td>
              <td style="font-size:0.8rem; white-space:nowrap;">
                {{ formatDate(tl.tanggal_tl) }}
              </td>
              <td>
                <span
                  :class="`badge badge-${statusPenerimaanColor(tl.status_penerimaan)}`"
                >
                  {{ tl.status_penerimaan }}
                </span>
              </td>
              <td style="font-size:0.8rem;">{{ tl.buktis?.length || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTindakLanjutStore } from '@/stores/tindaklanjut'
import { useAuthStore } from '@/stores/auth'
import { formatDate, statusRekomendasiColor, statusPenerimaanColor } from '@/utils/format'
import { KEIRBANAN, BADGE_COLOR, STATUS_PENERIMAAN, STATUS_REKOMENDASI } from '@/utils/constants'

const tlStore = useTindakLanjutStore()
const auth = useAuthStore()

const search = ref('')
const filterStatusPenerimaan = ref('')
const filterStatusRekomendasi = ref('')
const filterKeirbanan = ref('')

let searchTimeout = null

const loadData = () => {
  tlStore.fetchAll({
    search: search.value || undefined,
    status_penerimaan: filterStatusPenerimaan.value || undefined,
    status: filterStatusRekomendasi.value || undefined,
    keirbanan: filterKeirbanan.value || undefined
  })
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadData, 400)
}

onMounted(loadData)
</script>
