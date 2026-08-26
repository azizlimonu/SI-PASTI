<template>
  <div>
    <!-- Filter Rekomendasi -->
    <div
      class="glass-card"
      style="padding:1rem; margin-bottom:1rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;"
    >
      <select
        v-model="filterStatus"
        class="select-field"
        style="width:200px;"
        @change="loadTL"
      >
        <option value="">Semua Status</option>
        <option v-for="s in STATUS_PENERIMAAN" :key="s" :value="s">
          {{ s }}
        </option>
      </select>
      <span style="font-size:0.8rem; color:var(--text-muted);"
        >Total: {{ tlList.length }} tindak lanjut</span
      >
    </div>

    <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;">
      <button
        v-if="auth.isAdminTL"
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
        Tambah TL
      </button>
    </div>

    <div
      v-if="loading"
      style="display:flex; justify-content:center; padding:2rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="!tlList.length" class="glass-card">
      <div class="empty-state" style="padding:2rem;">
        <p style="color:var(--text-secondary);">Belum ada tindak lanjut.</p>
      </div>
    </div>

    <div v-else style="display:flex; flex-direction:column; gap:0.75rem;">
      <div
        v-for="tl in tlFiltered"
        :key="tl.id"
        class="glass-card"
        style="padding:1.25rem;"
      >
        <div
          style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; margin-bottom:0.75rem;"
        >
          <div style="flex:1;">
            <!-- Info Rekomendasi -->
            <div
              style="padding:0.5rem 0.75rem; border-radius:0.5rem; background:var(--bg-hover); margin-bottom:0.75rem;"
            >
              <p
                style="font-size:0.7rem; color:var(--text-muted); margin:0 0 0.2rem; text-transform:uppercase; letter-spacing:0.05em;"
              >
                Rekomendasi
              </p>
              <p
                style="font-size:0.8rem; color:var(--text-secondary); margin:0;"
              >
                {{ tl.rekomendasi?.uraian_rekomendasi }}
              </p>
              <p
                style="font-size:0.72rem; color:var(--text-muted); margin:0.2rem 0 0;"
              >
                Kepada: {{ tl.rekomendasi?.ditujukan_kepada }}
              </p>
            </div>

            <div
              style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.5rem;"
            >
              <span
                :class="`badge badge-${BADGE_COLOR[tl.status_penerimaan] || 'gray'}`"
              >
                {{ tl.status_penerimaan }}
              </span>
              <span
                style="font-size:0.75rem; color:var(--text-muted);"
                >{{ formatDate(tl.tanggal_tl) }}</span
              >
              <span style="font-size:0.75rem; color:var(--text-muted);"
                >oleh {{ tl.creator?.nama }}</span
              >
            </div>
            <p
              style="font-size:0.875rem; color:var(--text-primary); margin:0; white-space:pre-wrap; line-height:1.6;"
            >
              {{ tl.uraian_tl }}
            </p>
          </div>
          <div style="display:flex; gap:0.375rem; flex-shrink:0;">
            <button class="btn-icon" @click="handleDelete(tl)">
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

        <!-- Bukti -->
        <div
          v-if="tl.buktis?.length"
          style="display:flex; flex-wrap:wrap; gap:0.375rem;"
        >
          <a
            v-for="bukti in tl.buktis"
            :key="bukti.id"
            :href="bukti.file_path ?
            `http://localhost:3000/${bukti.file_path}` : bukti.link_bukti"
            target="_blank"
            style="display:inline-flex; align-items:center;
            gap:0.375rem; padding:0.25rem 0.625rem; border-radius:0.375rem;
            background:var(--accent-light); border:1px solid
            rgba(59,130,246,0.3); color:var(--accent); font-size:0.72rem;
            text-decoration:none;"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              style="width:12px;height:12px;"
            >
              <path
                d="M3 3.5A1.5 1.5 0 0 1 4.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 13 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 12.5v-9Z"
              />
            </svg>
            {{ bukti.judul_bukti }}
          </a>
        </div>
      </div>
    </div>

    <!-- Modal TL -->
    <AppModal v-model="showForm" title="Tambah Tindak Lanjut" width="38rem">
      <TLFormPicker
        :rekomendasi-list="rekomendasiList"
        :loading="submitting"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </AppModal>

    <AppConfirm
      v-model="showConfirm"
      title="Hapus Tindak Lanjut"
      message="Yakin hapus tindak lanjut ini?"
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
import { useTindakLanjutStore } from '@/stores/tindaklanjut'
import { useDokumenStore } from '@/stores/dokumen'
import { tindakLanjutService } from '@/services/tindakLanjutService'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import TLFormPicker from '@/components/tindaklanjut/TLFormPicker.vue'
import { formatDate } from '@/utils/format'
import { BADGE_COLOR, STATUS_PENERIMAAN } from '@/utils/constants'

const props = defineProps({
  penugasanId: { type: Number, required: true },
  dokumenList: { type: Array, default: () => [] }
})

const auth = useAuthStore()
const toast = useToast()
const tlStore = useTindakLanjutStore()
const dokumen = useDokumenStore()

const loading = ref(false)
const submitting = ref(false)
const tlList = ref([])
const rekomendasiList = ref([])
const filterStatus = ref('')
const showForm = ref(false)
const showConfirm = ref(false)
const deleteTarget = ref(null)

const tlFiltered = computed(() => {
  if (!filterStatus.value) return tlList.value
  return tlList.value.filter(tl => tl.status_penerimaan === filterStatus.value)
})

const lhpList = computed(() =>
  props.dokumenList.filter(d => d.jenis_dokumen === 'LHP')
)

const loadRekomendasiList = async () => {
  const semua = []
  for (const lhp of lhpList.value) {
    const temuans = await dokumen.fetchTemuan(lhp.id)
    for (const t of (temuans || [])) {
      const reks = await dokumen.fetchRekomendasi(t.id)
      if (reks) semua.push(...reks)
    }
  }
  rekomendasiList.value = semua
}

const loadTL = async () => {
  loading.value = true
  const semua = []
  for (const rek of rekomendasiList.value) {
    try {
      const res = await tindakLanjutService.getByRekomendasi(rek.id)
      if (res.data.data) semua.push(...res.data.data)
    } catch { /* skip */ }
  }
  tlList.value = semua
  loading.value = false
}

const handleSubmit = async (data) => {
 submitting.value = true

  const result = await tlStore.create({
    rekomendasi_id: data.rekomendasi_id,
    uraian_tl: data.uraian_tl,
    tanggal_tl: data.tanggal_tl,
    status_penerimaan: data.status_penerimaan
  })

  submitting.value = false

  submitting.value = false
  if (result.success) {
    toast.success('Tindak lanjut berhasil ditambahkan.')
    showForm.value = false
    await loadTL()
  } else {
    toast.error(result.message)
  }
}

const handleDelete = (tl) => {
  deleteTarget.value = tl
  showConfirm.value = true
}

const confirmDelete = async () => {
  submitting.value = true
  const result = await tlStore.remove(deleteTarget.value.id)
  submitting.value = false
  if (result.success) {
    toast.success('Tindak lanjut berhasil dihapus.')
    showConfirm.value = false
    tlList.value = tlList.value.filter(t => t.id !== deleteTarget.value.id)
  } else {
    toast.error(result.message)
  }
}

watch(lhpList, async (val) => {
  if (val.length) {
    await loadRekomendasiList()
    await loadTL()
  }
}, { immediate: true })
</script>
