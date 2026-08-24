<template>
  <div>
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
        Upload Bukti
      </button>
    </div>

    <div
      v-if="loading"
      style="display:flex; justify-content:center; padding:2rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="!buktiList.length" class="glass-card">
      <div class="empty-state" style="padding:2rem;">
        <p style="color:var(--text-secondary);">
          Belum ada bukti tindak lanjut.
        </p>
      </div>
    </div>

    <div
      v-else
      style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:0.75rem;"
    >
      <div
        v-for="bukti in buktiList"
        :key="bukti.id"
        class="glass-card"
        style="padding:1rem;"
      >
        <div style="display:flex; align-items:flex-start; gap:0.75rem;">
          <div
            style="width:36px; height:36px; border-radius:0.5rem; background:var(--accent-light); border:1px solid rgba(59,130,246,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0;"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              style="width:18px;height:18px;color:var(--accent);"
            >
              <path
                d="M3 3.5A1.5 1.5 0 0 1 4.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 13 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 12.5v-9Z"
              />
            </svg>
          </div>
          <div style="flex:1; min-width:0;">
            <p
              style="font-size:0.85rem; font-weight:600; color:var(--text-primary); margin:0 0 0.25rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
            >
              {{ bukti.judul_bukti }}
            </p>
            <p
              v-if="bukti.keterangan"
              style="font-size:0.75rem; color:var(--text-muted); margin:0 0 0.5rem;"
            >
              {{ bukti.keterangan }}
            </p>
            <p
              style="font-size:0.7rem; color:var(--text-muted); margin:0 0 0.625rem;"
            >
              {{ formatDate(bukti.created_at) }} — {{ bukti.uploader?.nama }}
            </p>
            <div style="display:flex; gap:0.375rem;">
              <a
                v-if="bukti.file_path"
                :href="`http://localhost:3000/${bukti.file_path}`"
                target="_blank"
                class="btn-secondary"
                style="font-size:0.75rem; padding:0.25rem 0.625rem;"
              >
                Download
              </a>
              <a
                v-if="bukti.link_bukti"
                :href="bukti.link_bukti"
                target="_blank"
                class="btn-secondary"
                style="font-size:0.75rem; padding:0.25rem 0.625rem;"
              >
                Buka Link
              </a>
              <button
                v-if="auth.isAdminTL"
                class="btn-icon"
                @click="handleDelete(bukti)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  style="width:13px;height:13px;color:#f87171;"
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
    </div>

    <!-- Modal Upload Bukti -->
    <AppModal v-model="showForm" title="Upload Bukti Tindak Lanjut">
      <form
        @submit.prevent="handleSubmit"
        style="display:flex; flex-direction:column; gap:1rem;"
      >
        <div>
          <label class="input-label"
            >Judul Bukti <span style="color:#f87171;">*</span></label
          >
          <input
            v-model="form.judul_bukti"
            type="text"
            class="input-field"
            placeholder="Contoh: Berita Acara TL, Bukti Setor Tahap 1"
          />
        </div>
        <div>
          <label class="input-label">Keterangan</label>
          <input
            v-model="form.keterangan"
            type="text"
            class="input-field"
            placeholder="Keterangan tambahan (opsional)"
          />
        </div>
        <div>
          <label class="input-label"
            >File / Link <span style="color:#f87171;">*</span></label
          >
          <AppDropzone
            v-model="form.file"
            v-model:link="form.link_bukti"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            hint="PDF, DOC, JPG, PNG (Maks. 20MB) atau link"
          />
        </div>
        <div v-if="errorMsg" class="alert-danger">
          <span>{{ errorMsg }}</span>
        </div>
        <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
          <button type="button" class="btn-secondary" @click="showForm = false">
            Batal
          </button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            <span v-if="submitting" class="loading-spinner"></span>
            {{ submitting ? 'Mengupload...' : 'Upload' }}
          </button>
        </div>
      </form>
    </AppModal>

    <AppConfirm
      v-model="showConfirm"
      title="Hapus Bukti"
      :message="`Yakin hapus bukti '${deleteTarget?.judul_bukti}'?`"
      :loading="submitting"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useTindakLanjutStore } from '@/stores/tindaklanjut'
import { tindakLanjutService } from '@/services/tindakLanjutService'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import AppDropzone from '@/components/common/AppDropzone.vue'
import { formatDate } from '@/utils/format'

const props = defineProps({
  penugasanId: { type: Number, required: true },
  dokumenList: { type: Array, default: () => [] }
})

const auth = useAuthStore()
const toast = useToast()
const tlStore = useTindakLanjutStore()

const loading = ref(false)
const submitting = ref(false)
const buktiList = ref([])
const showForm = ref(false)
const showConfirm = ref(false)
const deleteTarget = ref(null)
const errorMsg = ref('')

const form = ref({
  judul_bukti: '',
  keterangan: '',
  file: null,
  link_bukti: ''
})

const loadBukti = async () => {
  loading.value = true
  // Ambil semua TL dari penugasan ini lalu kumpulkan buktinya
  const allBukti = []
  const seen = new Set()

  for (const dok of props.dokumenList.filter(d => d.jenis_dokumen === 'LHP')) {
    try {
      const res = await tlStore.fetchBukti()
      for (const b of (res || [])) {
        if (!seen.has(b.id)) {
          seen.add(b.id)
          allBukti.push(b)
        }
      }
    } catch { /* skip */ }
    break // Cukup load sekali
  }

  buktiList.value = allBukti
  loading.value = false
}

const handleSubmit = async () => {
  errorMsg.value = ''
  if (!form.value.judul_bukti.trim()) { errorMsg.value = 'Judul bukti wajib diisi.'; return }
  if (!form.value.file && !form.value.link_bukti) { errorMsg.value = 'File atau link wajib diisi.'; return }

  submitting.value = true
  const result = await tlStore.uploadBukti({ ...form.value })
  submitting.value = false

  if (result.success) {
    toast.success('Bukti berhasil diupload.')
    showForm.value = false
    form.value = { judul_bukti: '', keterangan: '', file: null, link_bukti: '' }
    await loadBukti()
  } else {
    toast.error(result.message)
  }
}

const handleDelete = (bukti) => {
  deleteTarget.value = bukti
  showConfirm.value = true
}

const confirmDelete = async () => {
  submitting.value = true
  try {
    await tindakLanjutService.deleteBukti(deleteTarget.value.id)
    toast.success('Bukti berhasil dihapus.')
    showConfirm.value = false
    buktiList.value = buktiList.value.filter(b => b.id !== deleteTarget.value.id)
  } catch(e) {
    toast.error(e.response?.data?.message || 'Gagal menghapus bukti.')
  }
  submitting.value = false
}

watch(() => props.dokumenList, (val) => {
  if (val.length) loadBukti()
}, { immediate: true })
</script>
