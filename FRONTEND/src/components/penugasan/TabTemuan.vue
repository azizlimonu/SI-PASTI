<template>
  <div>
    <!-- Pilih LHP -->
    <div
      v-if="lhpList.length > 1"
      class="glass-card"
      style="padding:1rem; margin-bottom:1rem;"
    >
      <label class="input-label">Pilih LHP</label>
      <select v-model="selectedLhpId" class="select-field" @change="loadTemuan">
        <option v-for="lhp in lhpList" :key="lhp.id" :value="lhp.id">
          {{ lhp.judul_dokumen }}
        </option>
      </select>
    </div>

    <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;">
      <button
        v-if="auth.isAdmin && selectedLhpId"
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
        Tambah Temuan
      </button>
    </div>

    <div v-if="!selectedLhpId" class="glass-card">
      <div class="empty-state" style="padding:2rem;">
        <p style="color:var(--text-secondary);">
          Belum ada LHP. Upload LHP di tab Dokumen terlebih dahulu.
        </p>
      </div>
    </div>

    <div
      v-else-if="loading"
      style="display:flex; justify-content:center; padding:2rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="!temuanList.length" class="glass-card">
      <div class="empty-state" style="padding:2rem;">
        <div class="empty-state-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width:24px;height:24px;"
          >
            <path
              fill-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <p style="font-weight:500; color:var(--text-secondary);">
          Belum ada temuan
        </p>
        <button
          v-if="auth.isAdmin"
          class="btn-primary"
          style="margin-top:0.5rem;"
          @click="showForm = true"
        >
          Tambah Temuan
        </button>
      </div>
    </div>

    <div v-else style="display:flex; flex-direction:column; gap:0.75rem;">
      <div
        v-for="(temuan, i) in temuanList"
        :key="temuan.id"
        class="glass-card"
        style="padding:1.25rem;"
      >
        <div
          style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem;"
        >
          <div style="display:flex; gap:0.75rem; flex:1; min-width:0;">
            <span
              style="font-size:0.75rem; font-weight:700; color:var(--accent); background:var(--accent-light); border:1px solid rgba(59,130,246,0.3); border-radius:0.375rem; padding:0.25rem 0.5rem; flex-shrink:0; height:fit-content;"
            >
              {{ i + 1 }}
            </span>
            <div>
              <p
                style="font-size:0.9rem; font-weight:600; color:var(--text-primary); margin:0 0 0.5rem;"
              >
                {{ temuan.judul_temuan }}
              </p>
              <p
                style="font-size:0.82rem; color:var(--text-secondary); margin:0; white-space:pre-wrap; line-height:1.6;"
              >
                {{ temuan.uraian_temuan }}
              </p>
              <div style="display:flex; gap:0.5rem; margin-top:0.625rem;">
                <span class="badge badge-blue"
                  >{{ temuan.rekomendasis?.length || 0 }} rekomendasi</span
                >
              </div>
            </div>
          </div>
          <div style="display:flex; gap:0.375rem; flex-shrink:0;">
            <button class="btn-icon" title="Edit" @click="openEdit(temuan)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                style="width:14px;height:14px;color:#60a5fa;"
              >
                <path
                  d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z"
                />
                <path
                  d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z"
                />
              </svg>
            </button>
            <button
              class="btn-icon"
              title="Hapus"
              @click="handleDelete(temuan)"
            >
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

    <!-- Modal Form Temuan -->
    <AppModal
      v-model="showForm"
      title="Tambah Temuan"
      :close-on-backdrop="false"
    >
      <TemuanForm
        :loading="submitting"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </AppModal>

    <!-- Modal Edit Temuan -->
    <AppModal v-model="showEditForm" title="Edit Temuan">
      <form
        @submit.prevent="handleEditSubmit"
        style="display:flex; flex-direction:column; gap:1rem;"
      >
        <div>
          <label class="input-label">Judul Temuan</label>
          <input
            v-model="editForm.judul_temuan"
            type="text"
            class="input-field"
          />
        </div>
        <div>
          <label class="input-label">Uraian Temuan</label>
          <textarea
            v-model="editForm.uraian_temuan"
            class="input-field"
            rows="4"
            style="resize:vertical;"
          ></textarea>
        </div>
        <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
          <button
            type="button"
            class="btn-secondary"
            @click="showEditForm = false"
          >
            Batal
          </button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            <span v-if="submitting" class="loading-spinner"></span>
            Simpan
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Confirm Delete -->
    <AppConfirm
      v-model="showConfirm"
      title="Hapus Temuan"
      :message="`Yakin hapus temuan '${deleteTarget?.judul_temuan}'?`"
      :loading="submitting"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useDokumenStore } from '@/stores/dokumen'
import { dokumenService } from '@/services/dokumenService'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import TemuanForm from '@/components/lhp/TemuanForm.vue'

const props = defineProps({
  penugasanId: { type: Number, required: true },
  dokumenList: { type: Array, default: () => [] }
})

const auth = useAuthStore()
const toast = useToast()
const dokumen = useDokumenStore()

const loading = ref(false)
const submitting = ref(false)
const temuanList = ref([])
const selectedLhpId = ref(null)
const showForm = ref(false)
const showEditForm = ref(false)
const showConfirm = ref(false)
const deleteTarget = ref(null)
const editTarget = ref(null)
const editForm = ref({ judul_temuan: '', uraian_temuan: '' })

const lhpList = computed(() =>
  props.dokumenList.filter(d => d.jenis_dokumen === 'LHP')
)

const loadTemuan = async () => {
  if (!selectedLhpId.value) return
  loading.value = true
  const res = await dokumen.fetchTemuan(selectedLhpId.value)
  temuanList.value = res || []
  loading.value = false
}

const handleSubmit = async (data) => {
  submitting.value = true
  const result = await dokumen.createTemuanBatch({
    dokumen_penugasan_id: selectedLhpId.value,
    temuan: [data]
  })
  submitting.value = false
  if (result.success) {
    toast.success('Temuan berhasil disimpan.')
    showForm.value = false
    await loadTemuan()
  } else {
    toast.error(result.message)
  }
}

const openEdit = (temuan) => {
  editTarget.value = temuan
  editForm.value = { judul_temuan: temuan.judul_temuan, uraian_temuan: temuan.uraian_temuan }
  showEditForm.value = true
}

const handleEditSubmit = async () => {
  submitting.value = true
  try {
    await dokumenService.updateTemuan(editTarget.value.id, editForm.value)
    toast.success('Temuan berhasil diupdate.')
    showEditForm.value = false
    await loadTemuan()
  } catch(e) {
    toast.error(e.response?.data?.message || 'Gagal mengupdate temuan.')
  }
  submitting.value = false
}

const handleDelete = (temuan) => {
  deleteTarget.value = temuan
  showConfirm.value = true
}

const confirmDelete = async () => {
  submitting.value = true
  try {
    await dokumenService.deleteTemuan(deleteTarget.value.id)
    toast.success('Temuan berhasil dihapus.')
    showConfirm.value = false
    temuanList.value = temuanList.value.filter(t => t.id !== deleteTarget.value.id)
  } catch(e) {
    toast.error(e.response?.data?.message || 'Gagal menghapus temuan.')
  }
  submitting.value = false
}

watch(lhpList, (val) => {
  if (val.length && !selectedLhpId.value) {
    selectedLhpId.value = val[0].id
    loadTemuan()
  }
}, { immediate: true })

watch(() => props.dokumenList, () => {
  if (lhpList.value.length && !selectedLhpId.value) {
    selectedLhpId.value = lhpList.value[0].id
    loadTemuan()
  }
})
</script>
