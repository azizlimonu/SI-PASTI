<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <div>
      <label class="input-label"
        >Tahun <span style="color:#f87171;">*</span></label
      >
      <select v-model="form.tahun" class="select-field">
        <option v-for="t in daftarTahun" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <div>
      <label class="input-label"
        >Nama Program <span style="color:#f87171;">*</span></label
      >
      <input
        v-model="form.nama_program"
        type="text"
        class="input-field"
        placeholder="Contoh: Program Kerja Pengawasan Tahunan Keirbanan II"
      />
    </div>

    <div v-if="auth.hasAllAccess">
      <label class="input-label"
        >Keirbanan <span style="color:#f87171;">*</span></label
      >
      <select v-model="form.keirbanan" class="select-field">
        <option value="" disabled>Pilih keirbanan</option>
        <option v-for="kb in KEIRBANAN" :key="kb" :value="kb">
          Keirbanan {{ kb }}
        </option>
      </select>
    </div>

    <div v-if="props.item">
      <label class="input-label">Status</label>
      <select v-model="form.status" class="select-field">
        <option value="Aktif">Aktif</option>
        <option value="Selesai">Selesai</option>
      </select>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="alert-danger">
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Footer -->
    <div
      style="display:flex; gap:0.75rem; justify-content:flex-end; padding-top:0.5rem;"
    >
      <button type="button" class="btn-secondary" @click="emit('cancel')">
        Batal
      </button>
      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? 'Menyimpan...' : (props.item ? 'Update' : 'Simpan') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { KEIRBANAN } from '@/utils/constants'

const props = defineProps({
  item: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])

const auth = useAuthStore()
const ui = useUIStore()
const errorMsg = ref('')

const currentYear = new Date().getFullYear()
const daftarTahun = Array.from({ length: 6 }, (_, i) => currentYear - i)

const form = ref({
  tahun: props.item?.tahun || ui.tahunAktif,
  nama_program: props.item?.nama_program || '',
  keirbanan: props.item?.keirbanan || (auth.hasAllAccess ? '' : auth.keirbanan),
  status: props.item?.status || 'Aktif'
})

watch(() => props.item, (val) => {
  if (val) {
    form.value = {
      tahun: val.tahun,
      nama_program: val.nama_program,
      keirbanan: val.keirbanan,
      status: val.status
    }
  }
})

const handleSubmit = () => {
  errorMsg.value = ''

  if (!form.value.nama_program.trim()) {
    errorMsg.value = 'Nama program wajib diisi.'
    return
  }

  if (auth.hasAllAccess && !form.value.keirbanan) {
    errorMsg.value = 'Keirbanan wajib dipilih.'
    return
  }

  emit('submit', { ...form.value })
}
</script>
