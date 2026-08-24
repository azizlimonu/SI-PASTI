<template>
  <div>
    <!-- Pilih Temuan -->
    <div
      v-if="allTemuan.length"
      class="glass-card"
      style="padding:1rem; margin-bottom:1rem;"
    >
      <label class="input-label">Filter Temuan</label>
      <select
        v-model="selectedTemuanId"
        class="select-field"
        @change="loadRekomendasi"
      >
        <option value="">Semua Temuan</option>
        <option v-for="t in allTemuan" :key="t.id" :value="t.id">
          {{ t.judul_temuan }}
        </option>
      </select>
    </div>

    <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;">
      <button
        v-if="auth.isAdmin && selectedTemuanId"
        class="btn-primary"
        @click="showForm = true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          style="width:16px;height:16px;"
        >
          <path
            d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"
          />
        </svg>
        Tambah Rekomendasi
      </button>
    </div>

    <div
      v-if="loading"
      style="display:flex; justify-content:center; padding:2rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="!rekomendasiList.length" class="glass-card">
      <div class="empty-state" style="padding:2rem;">
        <p style="color:var(--text-secondary);">
          {{ !selectedTemuanId ? 'Pilih temuan untuk melihat rekomendasi.' : 'Belum ada rekomendasi.' }}
        </p>
      </div>
    </div>

    <div v-else style="display:flex; flex-direction:column; gap:0.75rem;">
      <div
        v-for="(rek, i) in rekomendasiList"
        :key="rek.id"
        class="glass-card"
        style="padding:1.25rem;"
      >
        <div
          style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem;"
        >
          <div style="flex:1; min-width:0;">
            <div
              style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.5rem;"
            >
              <span
                style="font-size:0.72rem; font-weight:700; color:var(--accent); background:var(--accent-light); border-radius:0.375rem; padding:0.2rem 0.5rem;"
              >
                {{ i + 1 }}
              </span>
              <span v-if="rek.adalah_tgr" class="badge badge-red">TGR</span>
              <span
                :class="`badge badge-${BADGE_COLOR[rek.status] || 'gray'}`"
                >{{ rek.status }}</span
              >
              <span
                v-if="rek.batas_waktu_tl && isLewatBatas(rek.batas_waktu_tl) && rek.status !== 'Selesai'"
                class="badge badge-red"
              >
                ⚠ Terlambat
              </span>
            </div>
            <p
              style="font-size:0.875rem; color:var(--text-primary); margin:0 0 0.5rem; white-space:pre-wrap; line-height:1.6;"
            >
              {{ rek.uraian_rekomendasi }}
            </p>
            <div style="display:flex; gap:1rem; flex-wrap:wrap;">
              <span style="font-size:0.78rem; color:var(--text-muted);">
                Kepada:
                <strong
                  style="color:var(--text-secondary);"
                  >{{ rek.ditujukan_kepada }}</strong
                >
              </span>
              <span
                v-if="rek.adalah_tgr"
                style="font-size:0.78rem; color:#f87171;"
              >
                Nilai: <strong>{{ formatRupiah(rek.nilai_temuan) }}</strong>
              </span>
              <span
                v-if="rek.adalah_tgr"
                style="font-size:0.78rem; color:#34d399;"
              >
                Terlunasi:
                <strong>{{ formatRupiah(rek.nilai_terlunasi) }}</strong>
              </span>
              <span
                v-if="rek.batas_waktu_tl"
                style="font-size:0.78rem; color:var(--text-muted);"
              >
                Batas:
                <strong
                  :style="{ color: isLewatBatas(rek.batas_waktu_tl) && rek.status !== 'Selesai' ? '#f87171' : 'var(--text-secondary)' }"
                >
                  {{ formatDate(rek.batas_waktu_tl) }}
                </strong>
              </span>
              <span
                v-if="rek.pihak"
                style="font-size:0.78rem; color:var(--text-muted);"
              >
                Pihak:
                <strong
                  style="color:var(--text-secondary);"
                  >{{ rek.pihak.nama }}</strong
                >
              </span>
            </div>
          </div>
          <div style="display:flex; gap:0.375rem; flex-shrink:0;">
            <button class="btn-icon" @click="handleDelete(rek)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                style="width:14px;height:14px;color:#f87171;"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Rekomendasi -->
    <AppModal v-model="showForm" title="Tambah Rekomendasi">
      <RekomendasiForm
        :temuan="selectedTemuan"
        :loading="submitting"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </AppModal>

    <AppConfirm
      v-model="showConfirm"
      title="Hapus Rekomendasi"
      :message="`Yakin hapus rekomendasi ini? Tindak lanjut terkait ikut terhapus.`"
      :loading="submitting"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useDokumenStore } from '@/stores/dokumen'
import { dokumenService } from '@/services/dokumenService'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import RekomendasiForm from '@/components/lhp/RekomendasiForm.vue'
import { formatDate, formatRupiah } from '@/utils/format'
import { BADGE_COLOR } from '@/utils/constants'
import dayjs from 'dayjs'

const props = defineProps({
  penugasanId: { type: Number, required: true },
  dokumenList: { type: Array, default: () => [] }
})

const auth = useAuthStore()
const toast = useToast()
const dokumen = useDokumenStore()

const loading = ref(false)
const submitting = ref(false)
const rekomendasiList = ref([])
const allTemuan = ref([])
const selectedTemuanId = ref('')
const showForm = ref(false)
const showConfirm = ref(false)
const deleteTarget = ref(null)

const selectedTemuan = computed(() =>
  allTemuan.value.find(t => t.id === selectedTemuanId.value) || null
)

const isLewatBatas = (tgl) => dayjs().isAfter(dayjs(tgl))

const lhpList = computed(() =>
  props.dokumenList.filter(d => d.jenis_dokumen === 'LHP')
)

const loadAllTemuan = async () => {
  const semua = []
  for (const lhp of lhpList.value) {
    const res = await dokumen.fetchTemuan(lhp.id)
    if (res) semua.push(...res)
  }
  allTemuan.value = semua
}

const loadRekomendasi = async () => {
  if (!selectedTemuanId.value) {
    // Load semua rekomendasi dari semua temuan
    const semua = []
    for (const t of allTemuan.value) {
      const res = await dokumen.fetchRekomendasi(t.id)
      if (res) semua.push(...res)
    }
    rekomendasiList.value = semua
    return
  }
  loading.value = true
  const res = await dokumen.fetchRekomendasi(selectedTemuanId.value)
  rekomendasiList.value = res || []
  loading.value = false
}

const handleSubmit = async (data) => {
  submitting.value = true
  const result = await dokumen.createRekomendasi({
    ...data,
    temuan_id: selectedTemuanId.value
  })
  submitting.value = false
  if (result.success) {
    toast.success('Rekomendasi berhasil ditambahkan.')
    showForm.value = false
    await loadRekomendasi()
  } else {
    toast.error(result.message)
  }
}

const handleDelete = (rek) => {
  deleteTarget.value = rek
  showConfirm.value = true
}

const confirmDelete = async () => {
  submitting.value = true
  try {
    await dokumenService.deleteRekomendasi(deleteTarget.value.id)
    toast.success('Rekomendasi berhasil dihapus.')
    showConfirm.value = false
    rekomendasiList.value = rekomendasiList.value.filter(r => r.id !== deleteTarget.value.id)
  } catch(e) {
    toast.error(e.response?.data?.message || 'Gagal menghapus rekomendasi.')
  }
  submitting.value = false
}

watch(lhpList, async (val) => {
  if (val.length) {
    await loadAllTemuan()
    await loadRekomendasi()
  }
}, { immediate: true })

watch(() => props.dokumenList, async () => {
  await loadAllTemuan()
  await loadRekomendasi()
})
</script>
