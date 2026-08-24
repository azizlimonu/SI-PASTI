<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <!-- Info Rekomendasi -->
    <div
      style="padding:0.75rem; border-radius:0.625rem; background:var(--bg-hover);"
    >
      <p
        style="font-size:0.72rem; color:var(--text-muted); margin:0 0 0.25rem;"
      >
        Rekomendasi
      </p>
      <p
        style="font-size:0.82rem; font-weight:500; color:var(--text-primary); margin:0; white-space:pre-wrap;"
      >
        {{ rekomendasi?.uraian_rekomendasi }}
      </p>
      <p
        style="font-size:0.72rem; color:var(--text-muted); margin:0.25rem 0 0;"
      >
        Kepada: {{ rekomendasi?.ditujukan_kepada }}
      </p>
    </div>

    <div>
      <label class="input-label"
        >Uraian Tindak Lanjut <span style="color:#f87171;">*</span></label
      >
      <textarea
        v-model="form.uraian_tl"
        class="input-field"
        rows="3"
        placeholder="Jelaskan tindakan yang telah dilakukan..."
        style="resize:vertical;"
      ></textarea>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
      <div>
        <label class="input-label"
          >Tanggal TL <span style="color:#f87171;">*</span></label
        >
        <input v-model="form.tanggal_tl" type="date" class="input-field" />
      </div>
      <div>
        <label class="input-label">Status Penerimaan</label>
        <select v-model="form.status_penerimaan" class="select-field">
          <option v-for="s in STATUS_PENERIMAAN" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>
    </div>

    <!-- Upload Bukti -->
    <div>
      <label class="input-label">Bukti Tindak Lanjut</label>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        <div
          v-for="(bukti, i) in form.buktis"
          :key="i"
          style="display:flex; flex-direction:column; gap:0.5rem; padding:0.75rem; border-radius:0.625rem; border:1px solid var(--border-color); background:var(--bg-hover);"
        >
          <div
            style="display:flex; align-items:center; justify-content:space-between;"
          >
            <span
              style="font-size:0.75rem; font-weight:500; color:var(--text-secondary);"
              >Bukti {{ i + 1 }}</span
            >
            <button type="button" class="btn-icon" @click="hapusBukti(i)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                style="width:13px;height:13px;color:#f87171;"
              >
                <path
                  d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L6.94 8l-1.72 1.72a.75.75 0 1 0 1.06 1.06L8 9.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L9.06 8l1.72-1.72a.75.75 0 0 0-1.06-1.06L8 6.94 6.28 5.22Z"
                />
              </svg>
            </button>
          </div>
          <input
            v-model="bukti.judul_bukti"
            type="text"
            class="input-field"
            placeholder="Judul bukti (Berita Acara TL, Bukti Setor, dll)"
            style="font-size:0.82rem;"
          />
          <AppDropzone
            v-model="bukti.file"
            v-model:link="bukti.link_bukti"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            hint="PDF, DOC, JPG, PNG (Maks. 20MB) atau link"
          />
        </div>

        <button
          type="button"
          class="btn-secondary"
          style="width:100%; justify-content:center; font-size:0.82rem;"
          @click="tambahBukti"
        >
          + Tambah Bukti
        </button>
      </div>
    </div>

    <div v-if="errorMsg" class="alert-danger">
      <span>{{ errorMsg }}</span>
    </div>

    <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
      <button type="button" class="btn-secondary" @click="emit('cancel')">
        Batal
      </button>
      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? 'Menyimpan...' : 'Simpan TL' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import AppDropzone from '@/components/common/AppDropzone.vue'
import { STATUS_PENERIMAAN } from '@/utils/constants'

const props = defineProps({
  rekomendasi: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])
const errorMsg = ref('')

const form = ref({
  uraian_tl: '',
  tanggal_tl: new Date().toISOString().split('T')[0],
  status_penerimaan: 'Belum Diterima',
  buktis: []
})

const tambahBukti = () => {
  form.value.buktis.push({ judul_bukti: '', file: null, link_bukti: '' })
}

const hapusBukti = (i) => form.value.buktis.splice(i, 1)

const handleSubmit = () => {
  errorMsg.value = ''
  if (!form.value.uraian_tl.trim()) { errorMsg.value = 'Uraian tindak lanjut wajib diisi.'; return }
  if (!form.value.tanggal_tl) { errorMsg.value = 'Tanggal tindak lanjut wajib diisi.'; return }

  for (const [i, b] of form.value.buktis.entries()) {
    if (!b.judul_bukti.trim()) {
      errorMsg.value = `Judul bukti ${i + 1} wajib diisi.`
      return
    }
    if (!b.file && !b.link_bukti) {
      errorMsg.value = `File atau link bukti ${i + 1} wajib diisi.`
      return
    }
  }

  emit('submit', { ...form.value })
}
</script>
