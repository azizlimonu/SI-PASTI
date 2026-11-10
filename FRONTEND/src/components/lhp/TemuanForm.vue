<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <KodeTemuanPicker
      v-model="kode"
      :jenis-penugasan="jenisPenugasan"
      @pilih-jenis="onPilihJenis"
    />

    <div>
      <label class="input-label"
        >Judul Temuan
        <span v-if="kode.mode === 'manual'" style="color:#f87171;"
          >*</span
        ></label
      >
      <input
        v-model="form.judul_temuan"
        type="text"
        class="input-field"
        :placeholder="kode.mode === 'kode' ? 'Terisi otomatis dari kode temuan (boleh diubah)' : 'Judul singkat temuan...'"
        @input="judulOtomatis = false"
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
import KodeTemuanPicker from '@/components/lhp/KodeTemuanPicker.vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  jenisPenugasan: { type: String, default: '' }
})

const emit = defineEmits(['submit', 'cancel'])

const errorMsg = ref('')

const form = ref({
  judul_temuan: '',
  uraian_temuan: ''
})

// Pilihan kode baku ATAU input manual (dengan kategori)
const kode = ref({ mode: 'kode', jenis_temuan_id: null, kategori_temuan_id: null })

// Judul terisi otomatis dari uraian kode temuan, selama belum diubah pengguna
const judulOtomatis = ref(false)
const onPilihJenis = (jenis) => {
  if (!form.value.judul_temuan.trim() || judulOtomatis.value) {
    form.value.judul_temuan = jenis.uraian.slice(0, 255)
    judulOtomatis.value = true
  }
}

const handleSubmit = () => {
  errorMsg.value = ''
  if (kode.value.mode === 'kode' && !kode.value.jenis_temuan_id) {
    errorMsg.value = 'Pilih kode temuan, atau beralih ke input manual.'
    return
  }
  if (kode.value.mode === 'manual' && !kode.value.kategori_temuan_id) {
    errorMsg.value = 'Kategori temuan wajib dipilih.'
    return
  }
  if (!form.value.judul_temuan.trim()) { errorMsg.value = 'Judul temuan wajib diisi.'; return }
  if (!form.value.uraian_temuan.trim()) { errorMsg.value = 'Uraian temuan wajib diisi.'; return }

  emit('submit', {
    judul_temuan: form.value.judul_temuan,
    uraian_temuan: form.value.uraian_temuan,
    ...(kode.value.mode === 'kode'
      ? { jenis_temuan_id: kode.value.jenis_temuan_id }
      : { kategori_temuan_id: kode.value.kategori_temuan_id })
  })
}
</script>
