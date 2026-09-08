<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <div>
      <label class="input-label"
        >Nama <span style="color:#f87171;">*</span></label
      >
      <input
        v-model="form.nama"
        type="text"
        class="input-field"
        placeholder="Nama lengkap"
      />
    </div>

    <div style="display:flex; gap:1rem;">
      <div style="flex:1;">
        <label class="input-label">NIP</label>
        <input
          v-model="form.nip"
          type="text"
          class="input-field"
          placeholder="Untuk ASN"
        />
      </div>
      <div style="flex:1;">
        <label class="input-label">NIK</label>
        <input
          v-model="form.nik"
          type="text"
          class="input-field"
          placeholder="Untuk non-ASN"
        />
      </div>
    </div>

    <div>
      <label class="input-label">Jabatan</label>
      <input v-model="form.jabatan" type="text" class="input-field" />
    </div>

    <div>
      <label class="input-label">Instansi / Perusahaan</label>
      <input
        v-model="form.instansi_perusahaan"
        type="text"
        class="input-field"
      />
    </div>

    <div>
      <label class="input-label"
        >Jenis Pihak <span style="color:#f87171;">*</span></label
      >
      <select v-model="form.jenis_pihak" class="select-field">
        <option value="" disabled>Pilih jenis pihak</option>
        <option v-for="j in JENIS_PIHAK" :key="j" :value="j">{{ j }}</option>
      </select>
      <div v-if="form.jenis_pihak === 'Lainnya'" style="margin-top:0.5rem;">
        <label class="input-label"
          >Nama Jenis Lainnya <span style="color:#f87171;">*</span></label
        >
        <input
          v-model="form.jenis_pihak_lainnya"
          type="text"
          class="input-field"
          placeholder="Sebutkan jenis pihak"
        />
      </div>
    </div>

    <div>
      <label class="input-label">Keterangan</label>
      <textarea
        v-model="form.keterangan"
        class="input-field"
        rows="3"
      ></textarea>
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
        {{ loading ? 'Menyimpan...' : 'Simpan' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { JENIS_PIHAK } from '@/utils/constants'

const props = defineProps({
  initialData: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])
const errorMsg = ref('')

const emptyForm = () => ({
  nama: '',
  nip: '',
  nik: '',
  jabatan: '',
  instansi_perusahaan: '',
  jenis_pihak: '',
  jenis_pihak_lainnya: '',
  keterangan: ''
})

const form = ref(emptyForm())

// Isi ulang form tiap kali initialData berubah (mode edit dibuka untuk
// baris yang berbeda, atau modal tambah dibuka lagi setelah ditutup).
watch(
  () => props.initialData,
  (data) => {
    errorMsg.value = ''
    form.value = data
      ? {
          nama: data.nama || '',
          nip: data.nip || '',
          nik: data.nik || '',
          jabatan: data.jabatan || '',
          instansi_perusahaan: data.instansi_perusahaan || '',
          jenis_pihak: data.jenis_pihak || '',
          jenis_pihak_lainnya: data.jenis_pihak_lainnya || '',
          keterangan: data.keterangan || ''
        }
      : emptyForm()
  },
  { immediate: true }
)

const handleSubmit = () => {
  errorMsg.value = ''
  if (!form.value.nama.trim()) { errorMsg.value = 'Nama wajib diisi.'; return }
  if (!form.value.jenis_pihak) { errorMsg.value = 'Jenis pihak wajib dipilih.'; return }
  if (form.value.jenis_pihak === 'Lainnya' && !form.value.jenis_pihak_lainnya.trim()) {
    errorMsg.value = 'Nama jenis pihak lainnya wajib diisi.'; return
  }
  emit('submit', { ...form.value })
}
</script>
