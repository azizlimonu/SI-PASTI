<template>
  <div>
    <div
      class="glass-card"
      style="padding:0.875rem 1rem; margin-bottom:1rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;"
    >
      <input
        v-model="cari"
        type="text"
        class="input-field"
        style="max-width:260px;"
        placeholder="Cari nama penugasan..."
        @input="tundaCari"
      />
      <select
        v-model="status"
        class="select-field"
        style="width:160px;"
        @change="ulang"
      >
        <option value="">Semua Status</option>
        <option v-for="s in STATUS_PENUGASAN" :key="s" :value="s">
          {{ s }}
        </option>
      </select>
      <select
        v-model="lhp"
        class="select-field"
        style="width:150px;"
        @change="ulang"
      >
        <option value="">Semua (LHP)</option>
        <option value="ada">Sudah ada LHP</option>
        <option value="belum">Belum ada LHP</option>
      </select>
    </div>

    <div v-if="error" class="alert-danger" style="margin-bottom:1rem;">
      <span>{{ error }}</span>
    </div>

    <div class="glass-card" style="padding:0; overflow:hidden;">
      <div
        v-if="loading"
        style="padding:2rem; text-align:center; color:var(--text-muted);"
      >
        Memuat data...
      </div>
      <div
        v-else-if="!rows.length"
        style="padding:2rem; text-align:center; color:var(--text-muted);"
      >
        Tidak ada penugasan yang cocok dengan filter.
      </div>
      <div v-else class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <thead>
            <tr>
              <th>Penugasan</th>
              <th>Keirbanan</th>
              <th>Ketua Tim</th>
              <th>SPT → LHP</th>
              <th>Temuan</th>
              <th style="min-width:170px;">Tindak Lanjut</th>
              <th style="text-align:right;">Sisa TGR</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in rows"
              :key="r.penugasan_id"
              class="baris-klik"
              @click="buka(r)"
            >
              <td>
                <div style="font-weight:600; color:var(--text-primary);">
                  {{ r.nama_penugasan }}
                </div>
                <div
                  style="margin-top:0.25rem; display:flex; gap:0.35rem; flex-wrap:wrap;"
                >
                  <span
                    :class="`badge badge-${r.sumber === 'NON_PKPT' ? 'purple' : 'blue'}`"
                  >
                    {{ r.sumber === 'NON_PKPT' ? 'Non-PKPT' : 'PKPT' }}
                  </span>
                  <span
                    :class="`badge badge-${statusPenugasanColor(r.status)}`"
                    >{{ r.status }}</span
                  >
                  <span class="badge badge-gray">{{ r.jenis_penugasan }}</span>
                </div>
                <div v-if="r.dasar_penugasan" class="kecil">
                  Dasar: {{ r.dasar_penugasan }}
                </div>
              </td>
              <td>{{ r.keirbanan }} · {{ r.tahun }}</td>
              <td>{{ r.ketua_tim || '-' }}</td>
              <td>
                <template v-if="r.ada_lhp">
                  <div>{{ r.tanggal_lhp }}</div>
                  <div class="kecil">
                    {{ r.hari_spt_ke_lhp !== null ? r.hari_spt_ke_lhp + ' hari dari SPT' : '' }}
                  </div>
                </template>
                <span v-else class="badge badge-red">Belum ada LHP</span>
              </td>
              <td>{{ r.jumlah_temuan }}</td>
              <td>
                <div class="kecil" style="margin:0 0 0.25rem;">
                  {{ r.rekomendasi.selesai }}/{{ r.jumlah_rekomendasi }} selesai
                  · {{ r.progress_tl_persen }}%
                </div>
                <div class="bar">
                  <div
                    class="bar-isi"
                    :style="{ width: r.progress_tl_persen + '%' }"
                  ></div>
                </div>
              </td>
              <td style="text-align:right;">
                {{ r.tgr.total_nilai > 0 ? formatRupiah(r.tgr.sisa) : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <AppPagination
        v-if="pagination.total > pagination.limit"
        :current-page="pagination.page"
        :total="pagination.total"
        :per-page="pagination.limit"
        @update:current-page="gantiHalaman"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { monitoringService } from '@/services/monitoringService'
import AppPagination from '@/components/common/AppPagination.vue'
import { formatRupiah, statusPenugasanColor } from '@/utils/format'
import { STATUS_PENUGASAN } from '@/utils/constants'

const props = defineProps({
  filter: { type: Object, default: () => ({}) }
})

const router = useRouter()
const rows = ref([])
const pagination = ref({ total: 0, page: 1, limit: 25 })
const loading = ref(true)
const error = ref('')
const cari = ref('')
const status = ref('')
const lhp = ref('')
let timer = null

const muat = async (page = 1) => {
  loading.value = true
  error.value = ''
  try {
    const res = await monitoringService.getPenugasanProgress({
      ...props.filter,
      status: status.value || undefined,
      lhp: lhp.value || undefined,
      search: cari.value || undefined,
      page,
      limit: 25
    })
    rows.value = res.data.data
    pagination.value = res.data.pagination
  } catch {
    error.value = 'Gagal memuat daftar penugasan.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

const ulang = () => muat(1)
const tundaCari = () => {
  clearTimeout(timer)
  timer = setTimeout(ulang, 350)
}
const gantiHalaman = (page) => muat(page)
const buka = (r) => router.push(`/penugasan/${r.penugasan_id}`)

watch(() => props.filter, ulang, { deep: true })
onMounted(ulang)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.baris-klik { cursor: pointer; }
.baris-klik:hover { background: var(--bg-hover); }
.kecil { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem; }
.bar { height: 6px; border-radius: 9999px; background: var(--bg-hover); overflow: hidden; }
.bar-isi { height: 100%; border-radius: 9999px; background: #10b981; transition: width 0.4s ease; }
</style>
