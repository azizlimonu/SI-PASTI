<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <div>
      <label class="input-label"
        >NIP <span style="color:#f87171;">*</span></label
      >
      <input
        v-model="form.nip"
        type="text"
        class="input-field"
        placeholder="Nomor Induk Pegawai"
      />
    </div>
    <div>
      <label class="input-label"
        >Nama Lengkap <span style="color:#f87171;">*</span></label
      >
      <input
        v-model="form.nama"
        type="text"
        class="input-field"
        placeholder="Nama anggota tim"
      />
    </div>
    <div>
      <label class="input-label"
        >Jabatan dalam Tim <span style="color:#f87171;">*</span></label
      >
      <select v-model="form.jabatan_tim" class="select-field">
        <option value="" disabled>Pilih jabatan</option>
        <option v-for="j in JABATAN_TIM" :key="j" :value="j">{{ j }}</option>
      </select>
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
        {{ loading ? 'Menyimpan...' : 'Tambah Anggota' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { JABATAN_TIM } from '@/utils/constants'

const props = defineProps({ loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'cancel'])
const errorMsg = ref('')
const form = ref({ nip: '', nama: '', jabatan_tim: '' })

const handleSubmit = () => {
  errorMsg.value = ''
  if (!form.value.nip.trim()) { errorMsg.value = 'NIP wajib diisi.'; return }
  if (!form.value.nama.trim()) { errorMsg.value = 'Nama wajib diisi.'; return }
  if (!form.value.jabatan_tim) { errorMsg.value = 'Jabatan tim wajib dipilih.'; return }
  emit('submit', { ...form.value })
}
</script>
