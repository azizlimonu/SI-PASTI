<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <div>
      <label class="input-label"
        >Jenis Dokumen <span style="color:#f87171;">*</span></label
      >
      <select v-model="form.jenis_dokumen" class="select-field">
        <option value="" disabled>Pilih jenis dokumen</option>
        <option v-for="j in JENIS_DOKUMEN" :key="j" :value="j">{{ j }}</option>
      </select>
      <div v-if="form.jenis_dokumen === 'Lainnya'">
        <label class="input-label"
          >Nama Jenis Dokumen <span style="color:#f87171;">*</span></label
        >
        <input
          v-model="form.judul_dokumen"
          type="text"
          class="input-field"
          placeholder="Contoh: Telaah Pemeriksaan Khusus, Berita Acara Pembukaan"
        />
      </div>
    </div>

    <div>
      <label class="input-label"
        >Judul Dokumen <span style="color:#f87171;">*</span></label
      >
      <input
        v-model="form.judul_dokumen"
        type="text"
        class="input-field"
        :placeholder="judulPlaceholder"
      />
    </div>

    <div>
      <label class="input-label"
        >File / Link <span style="color:#f87171;">*</span></label
      >
      <AppDropzone
        v-model="form.file"
        v-model:link="form.link_dokumen"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        hint="PDF, DOC, DOCX, XLS, XLSX (Maks. 20MB) atau link"
      />
    </div>

    <!-- Info LHP -->
    <div v-if="form.jenis_dokumen === 'LHP'" class="alert-info">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        style="width:16px;height:16px;flex-shrink:0;"
      >
        <path
          fill-rule="evenodd"
          d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-9 .5v1.25a.75.75 0 0 0 1.5 0V8.5h1.25a.75.75 0 0 0 0-1.5H7.5V5.75a.75.75 0 0 0-1.5 0V7H4.75a.75.75 0 0 0 0 1.5H6Z"
          clip-rule="evenodd"
        />
      </svg>
      <span style="font-size:0.8rem;"
        >Setelah upload LHP, Anda bisa menambahkan temuan dan rekomendasi dari
        halaman detail dokumen.</span
      >
    </div>

    <div v-if="errorMsg" class="alert-danger">
      <span>{{ errorMsg }}</span>
    </div>

    <div
      style="display:flex; gap:0.75rem; justify-content:flex-end; padding-top:0.5rem;"
    >
      <button type="button" class="btn-secondary" @click="emit('cancel')">
        Batal
      </button>
      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? 'Mengupload...' : 'Upload Dokumen' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppDropzone from '@/components/common/AppDropzone.vue'
import { JENIS_DOKUMEN } from '@/utils/constants'

const props = defineProps({
  penugasanId: { type: Number, required: true },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])
const errorMsg = ref('')

const form = ref({
  jenis_dokumen: '',
  judul_dokumen: '',
  file: null,
  link_dokumen: ''
})

const judulPlaceholder = computed(() => {
  const map = {
    'LHP': 'Contoh: LHP Audit Dana BOS SDN 1 Limboto',
    'P2HP': 'Contoh: P2HP Audit Dana BOS',
    'Telaahan Awal': 'Contoh: Telaahan Awal Audit Dana BOS',
    'Kertas Kerja': 'Contoh: Kertas Kerja Audit Dana BOS',
    'Lainnya': 'Masukkan judul dokumen'
  }
  return map[form.value.jenis_dokumen] || 'Masukkan judul dokumen'
})

watch(() => form.value.jenis_dokumen, (val) => {
  if (val !== 'Lainnya') {
    // Kosongkan judul supaya user isi manual
    form.value.judul_dokumen = ''
  }
})

const handleSubmit = () => {
  errorMsg.value = ''
  if (!form.value.jenis_dokumen) { errorMsg.value = 'Jenis dokumen wajib dipilih.'; return }
if (form.value.jenis_dokumen !== 'Lainnya' && !form.value.judul_dokumen.trim()) {
  errorMsg.value = 'Judul dokumen wajib diisi.'
  return
}
if (form.value.jenis_dokumen === 'Lainnya' && !form.value.judul_dokumen.trim()) {
  errorMsg.value = 'Nama jenis dokumen wajib diisi.'
  return
}
  if (!form.value.file && !form.value.link_dokumen) {
    errorMsg.value = 'Upload file atau isi link dokumen, minimal salah satu.'; return
  }
  emit('submit', { ...form.value })
}
</script>
