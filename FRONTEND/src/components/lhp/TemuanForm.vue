<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <div>
      <label class="input-label"
        >Judul Temuan <span style="color:#f87171;">*</span></label
      >
      <input
        v-model="form.judul_temuan"
        type="text"
        class="input-field"
        placeholder="Judul singkat temuan..."
      />
    </div>

    <div>
      <label class="input-label"
        >Uraian Temuan <span style="color:#f87171;">*</span></label
      >
      <textarea
        v-model="form.uraian_temuan"
        class="input-field"
        rows="5"
        placeholder="Uraian temuan..."
        style="resize:vertical;"
      ></textarea>
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
        {{ loading ? 'Menyimpan...' : 'Simpan Temuan' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])

const errorMsg = ref('')

const form = ref({
  judul_temuan: '',
  uraian_temuan: ''
})

const handleSubmit = () => {
  errorMsg.value = ''
  if (!form.value.judul_temuan.trim()) { errorMsg.value = 'Judul temuan wajib diisi.'; return }
  if (!form.value.uraian_temuan.trim()) { errorMsg.value = 'Uraian temuan wajib diisi.'; return }

  emit('submit', {
    judul_temuan: form.value.judul_temuan,
    uraian_temuan: form.value.uraian_temuan
  })
}
</script>
