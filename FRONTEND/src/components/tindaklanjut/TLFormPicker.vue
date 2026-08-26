<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <div>
      <label class="input-label"
        >Rekomendasi <span style="color:#f87171;">*</span></label
      >
      <select v-model="form.rekomendasi_id" class="select-field">
        <option value="" disabled>Pilih rekomendasi</option>
        <option v-for="rek in rekomendasiList" :key="rek.id" :value="rek.id">
          {{ rek.uraian_rekomendasi?.substring(0, 60) }}... ({{ rek.ditujukan_kepada

          }})
        </option>
      </select>
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
import { STATUS_PENERIMAAN } from '@/utils/constants'

const props = defineProps({
  rekomendasiList: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])
const errorMsg = ref('')

const form = ref({
  rekomendasi_id: '',
  uraian_tl: '',
  tanggal_tl: new Date().toISOString().split('T')[0],
  status_penerimaan: 'Belum Diterima'
})

const handleSubmit = () => {
  errorMsg.value = ''
  if (!form.value.rekomendasi_id) { errorMsg.value = 'Rekomendasi wajib dipilih.'; return }
  if (!form.value.uraian_tl.trim()) { errorMsg.value = 'Uraian tindak lanjut wajib diisi.'; return }
  if (!form.value.tanggal_tl) { errorMsg.value = 'Tanggal tindak lanjut wajib diisi.'; return }
  emit('submit', { ...form.value })
}
</script>
