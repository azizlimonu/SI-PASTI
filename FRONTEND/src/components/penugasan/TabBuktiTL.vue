<template>
  <div>
    <div
      style="display:flex; justify-content:flex-end; gap:0.625rem; margin-bottom:1rem;"
    >
      <button
        v-if="auth.isAdminTL"
        class="btn-secondary"
        @click="openSetoranForm"
      >
        Catat Setoran TGR
      </button>
      <button v-if="auth.isAdminTL" class="btn-primary" @click="openBuktiForm">
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

    <!-- Progress Rekomendasi Administratif -->
    <div
      v-if="temuanAdministratif.length"
      class="glass-card"
      style="padding:1rem; margin-bottom:1rem;"
    >
      <p
        style="font-size:0.85rem; font-weight:600; color:var(--text-primary); margin:0 0 0.75rem;"
      >
        Progress Rekomendasi Administratif
      </p>
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <div v-for="t in temuanAdministratif" :key="t.id">
          <div
            style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;"
          >
            <span
              style="font-size:0.78rem; color:var(--text-secondary);"
              >{{ t.judul_temuan }}</span
            >
            <span
              style="font-size:0.75rem; font-weight:600; color:var(--text-primary);"
            >
              {{ t.selesai }}/{{ t.total }} ({{ t.persen }}%)
            </span>
          </div>
          <div
            style="height:8px; border-radius:999px; background:var(--bg-hover); overflow:hidden;"
          >
            <div
              :style="`height:100%; width:${t.persen}%; background:var(--accent); border-radius:999px; transition:width .3s;`"
            ></div>
          </div>
        </div>
      </div>
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
            <div style="display:flex; gap:0.375rem; flex-wrap:wrap;">
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

    <!-- Modal Upload Bukti Biasa -->
    <AppModal
      v-model="showForm"
      title="Upload Bukti Tindak Lanjut"
      width="34rem"
    >
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
            >Tindak Lanjut Terkait <span style="color:#f87171;">*</span></label
          >
          <p
            style="font-size:0.72rem; color:var(--text-muted); margin:0 0 0.5rem;"
          >
            Bukti bisa dikaitkan ke lebih dari satu tindak lanjut.
          </p>
          <div
            style="max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:0.375rem; padding:0.625rem; border:1px solid var(--border-color); border-radius:0.625rem;"
          >
            <label
              v-for="tl in tlOptions"
              :key="tl.id"
              style="display:flex; align-items:flex-start; gap:0.5rem; font-size:0.78rem; color:var(--text-secondary); cursor:pointer;"
            >
              <input
                type="checkbox"
                :value="tl.id"
                v-model="form.tindak_lanjut_id"
                style="margin-top:2px;"
              />
              <span
                >{{ tl.rekomendasi?.ditujukan_kepada }} —
                {{ tl.uraian_tl }}</span
              >
            </label>
            <p
              v-if="!tlOptions.length"
              style="font-size:0.75rem; color:var(--text-muted); margin:0;"
            >
              Belum ada tindak lanjut.
            </p>
          </div>
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

    <!-- Modal Setoran TGR -->
    <AppModal v-model="showSetoranForm" title="Catat Setoran TGR" width="34rem">
      <form
        @submit.prevent="handleSubmitSetoran"
        style="display:flex; flex-direction:column; gap:1rem;"
      >
        <div>
          <label class="input-label"
            >Rekomendasi TGR <span style="color:#f87171;">*</span></label
          >
          <select v-model="setoranForm.rekomendasi_id" class="select-field">
            <option value="">Pilih rekomendasi TGR</option>
            <option v-for="r in rekomendasiTgr" :key="r.id" :value="r.id">
              {{ r.ditujukan_kepada }} — Sisa
              {{ formatRupiah((r.nilai_temuan || 0) - (r.nilai_terlunasi || 0)) }}
            </option>
          </select>
        </div>
        <div>
          <label class="input-label"
            >Jumlah Setoran (Rp) <span style="color:#f87171;">*</span></label
          >
          <input
            v-model.number="setoranForm.jumlah_setoran"
            type="number"
            min="0"
            class="input-field"
            placeholder="0"
          />
        </div>
        <div>
          <label class="input-label"
            >Tanggal Setor <span style="color:#f87171;">*</span></label
          >
          <input
            v-model="setoranForm.tanggal_setor"
            type="date"
            class="input-field"
          />
        </div>
        <div>
          <label class="input-label">Keterangan</label>
          <input
            v-model="setoranForm.keterangan"
            type="text"
            class="input-field"
            placeholder="Keterangan tambahan (opsional)"
          />
        </div>
        <div>
          <label class="input-label"
            >Bukti Setor <span style="color:#f87171;">*</span></label
          >
          <AppDropzone
            v-model="setoranForm.file"
            v-model:link="setoranForm.link_bukti"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            hint="PDF, DOC, JPG, PNG (Maks. 20MB) atau link"
          />
        </div>
        <div v-if="errorMsgSetoran" class="alert-danger">
          <span>{{ errorMsgSetoran }}</span>
        </div>
        <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
          <button
            type="button"
            class="btn-secondary"
            @click="showSetoranForm = false"
          >
            Batal
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="submittingSetoran"
          >
            <span v-if="submittingSetoran" class="loading-spinner"></span>
            {{ submittingSetoran ? 'Menyimpan...' : 'Simpan Setoran' }}
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
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useTindakLanjutStore } from '@/stores/tindaklanjut'
import { useDokumenStore } from '@/stores/dokumen'
import { tindakLanjutService } from '@/services/tindakLanjutService'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import AppDropzone from '@/components/common/AppDropzone.vue'
import { formatDate, formatRupiah } from '@/utils/format'

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
const submittingSetoran = ref(false)
const buktiList = ref([])
const temuanLengkap = ref([])
const showForm = ref(false)
const showSetoranForm = ref(false)
const showConfirm = ref(false)
const deleteTarget = ref(null)
const errorMsg = ref('')
const errorMsgSetoran = ref('')

const form = ref({
  judul_bukti: '',
  keterangan: '',
  file: null,
  link_bukti: '',
  tindak_lanjut_id: []
})

const setoranForm = ref({
  rekomendasi_id: '',
  jumlah_setoran: null,
  tanggal_setor: new Date().toISOString().split('T')[0],
  keterangan: '',
  file: null,
  link_bukti: ''
})

// Semua TL, hasil flatten dari temuan -> rekomendasi -> tindakLanjuts
const tlOptions = computed(() => {
  const out = []
  for (const t of temuanLengkap.value) {
    for (const r of (t.rekomendasis || [])) {
      for (const tl of (r.tindakLanjuts || [])) {
        out.push({ ...tl, rekomendasi: r, temuan: t })
      }
    }
  }
  return out
})

// Semua rekomendasi TGR, untuk dropdown setoran
const rekomendasiTgr = computed(() => {
  const out = []
  for (const t of temuanLengkap.value) {
    for (const r of (t.rekomendasis || [])) {
      if (r.adalah_tgr) out.push(r)
    }
  }
  return out
})

// Progress rekomendasi administratif per temuan
const temuanAdministratif = computed(() => {
  const out = []
  for (const t of temuanLengkap.value) {
    const rekAdministratif = (t.rekomendasis || []).filter(r => !r.adalah_tgr)
    if (!rekAdministratif.length) continue
    const selesai = rekAdministratif.filter(r => r.ada_bukti_tl).length
    out.push({
      id: t.id,
      judul_temuan: t.judul_temuan,
      total: rekAdministratif.length,
      selesai,
      persen: Math.round((selesai / rekAdministratif.length) * 100)
    })
  }
  return out
})

const loadBukti = async () => {
  loading.value = true

  const dokLhp = props.dokumenList.filter(d => d.jenis_dokumen === 'LHP')
  const hasilTemuan = []
  for (const dok of dokLhp) {
    const res = await dokumen.fetchTemuan(dok.id)
    hasilTemuan.push(...(res || []))
  }
  temuanLengkap.value = hasilTemuan

  const allBukti = []
  const seen = new Set()
  for (const tl of tlOptions.value) {
    for (const b of (tl.buktis || [])) {
      if (!seen.has(b.id)) {
        seen.add(b.id)
        allBukti.push(b)
      }
    }
  }
  buktiList.value = allBukti.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  loading.value = false
}

const openBuktiForm = () => {
  form.value = { judul_bukti: '', keterangan: '', file: null, link_bukti: '', tindak_lanjut_id: [] }
  errorMsg.value = ''
  showForm.value = true
}

const openSetoranForm = () => {
  setoranForm.value = {
    rekomendasi_id: '',
    jumlah_setoran: null,
    tanggal_setor: new Date().toISOString().split('T')[0],
    keterangan: '',
    file: null,
    link_bukti: ''
  }
  errorMsgSetoran.value = ''
  showSetoranForm.value = true
}

const handleSubmit = async () => {
  errorMsg.value = ''
  if (!form.value.judul_bukti.trim()) { errorMsg.value = 'Judul bukti wajib diisi.'; return }
  if (!form.value.tindak_lanjut_id.length) { errorMsg.value = 'Pilih minimal satu tindak lanjut terkait.'; return }
  if (!form.value.file && !form.value.link_bukti) { errorMsg.value = 'File atau link wajib diisi.'; return }

  submitting.value = true
  const result = await tlStore.uploadBukti({ ...form.value })
  submitting.value = false

  if (result.success) {
    toast.success('Bukti berhasil diupload.')
    showForm.value = false
    await loadBukti()
  } else {
    toast.error(result.message)
  }
}

const handleSubmitSetoran = async () => {
  errorMsgSetoran.value = ''
  if (!setoranForm.value.rekomendasi_id) { errorMsgSetoran.value = 'Rekomendasi TGR wajib dipilih.'; return }
  if (!setoranForm.value.jumlah_setoran) { errorMsgSetoran.value = 'Jumlah setoran wajib diisi.'; return }
  if (!setoranForm.value.tanggal_setor) { errorMsgSetoran.value = 'Tanggal setor wajib diisi.'; return }
  if (!setoranForm.value.file && !setoranForm.value.link_bukti) { errorMsgSetoran.value = 'File atau link bukti setor wajib diisi.'; return }

  submittingSetoran.value = true
  const { rekomendasi_id, ...payload } = setoranForm.value
  const result = await dokumen.tambahSetoranTgr(rekomendasi_id, payload)
  submittingSetoran.value = false

  if (result.success) {
    toast.success('Setoran TGR berhasil dicatat.')
    showSetoranForm.value = false
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
    await loadBukti()
  } catch(e) {
    toast.error(e.response?.data?.message || 'Gagal menghapus bukti.')
  }
  submitting.value = false
}

watch(() => props.dokumenList, (val) => {
  if (val.length) loadBukti()
}, { immediate: true })
</script>
