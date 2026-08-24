<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <div
      style="padding:0.75rem; border-radius:0.625rem; background:var(--bg-hover); margin-bottom:0.25rem;"
    >
      <p
        style="font-size:0.72rem; color:var(--text-muted); margin:0 0 0.25rem;"
      >
        Temuan
      </p>
      <p
        style="font-size:0.85rem; font-weight:500; color:var(--text-primary); margin:0;"
      >
        {{ temuan?.judul_temuan }}
      </p>
    </div>

    <div>
      <label class="input-label"
        >Uraian Rekomendasi <span style="color:#f87171;">*</span></label
      >
      <textarea
        v-model="form.uraian_rekomendasi"
        class="input-field"
        rows="3"
        placeholder="Uraian rekomendasi..."
        style="resize:vertical;"
      ></textarea>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
      <div>
        <label class="input-label"
          >Ditujukan Kepada <span style="color:#f87171;">*</span></label
        >
        <input
          v-model="form.ditujukan_kepada"
          type="text"
          class="input-field"
          placeholder="Nama/jabatan/OPD"
        />
      </div>
      <div>
        <label class="input-label">Batas Waktu TL</label>
        <input v-model="form.batas_waktu_tl" type="date" class="input-field" />
      </div>
    </div>

    <div>
      <label class="input-label">Pihak (opsional)</label>
      <select v-model="form.pihak_id" class="select-field">
        <option value="">Pilih dari master pihak</option>
        <option v-for="p in pihakList" :key="p.id" :value="p.id">
          {{ p.nama }} — {{ p.jenis_pihak }}
        </option>
      </select>
    </div>

    <div style="display:flex; align-items:center; gap:0.75rem;">
      <label
        style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;"
      >
        <input
          v-model="form.adalah_tgr"
          type="checkbox"
          style="width:14px; height:14px; accent-color:var(--accent);"
        />
        <span style="font-size:0.85rem; color:var(--text-secondary);"
          >Temuan TGR</span
        >
      </label>
      <input
        v-if="form.adalah_tgr"
        v-model="form.nilai_temuan"
        type="number"
        class="input-field"
        placeholder="Nilai temuan (Rp)"
        style="flex:1;"
      />
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
        {{ loading ? 'Menyimpan...' : 'Simpan Rekomendasi' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { pihakService } from '@/services/pihakService'

const props = defineProps({
  temuan: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])

const errorMsg = ref('')
const pihakList = ref([])

const form = ref({
  uraian_rekomendasi: '',
  ditujukan_kepada: '',
  adalah_tgr: false,
  nilai_temuan: null,
  batas_waktu_tl: '',
  pihak_id: ''
})

const handleSubmit = () => {
  errorMsg.value = ''
  if (!form.value.uraian_rekomendasi.trim()) { errorMsg.value = 'Uraian rekomendasi wajib diisi.'; return }
  if (!form.value.ditujukan_kepada.trim()) { errorMsg.value = 'Ditujukan kepada wajib diisi.'; return }
  if (form.value.adalah_tgr && !form.value.nilai_temuan) { errorMsg.value = 'Nilai temuan TGR wajib diisi.'; return }

  emit('submit', {
    ...form.value,
    pihak_id: form.value.pihak_id || null,
    nilai_temuan: form.value.adalah_tgr ? form.value.nilai_temuan : null
  })
}

onMounted(async () => {
  try {
    const res = await pihakService.getAll({ limit: 100 })
    pihakList.value = res.data.data || []
  } catch {
    pihakList.value = []
  }
})
</script>
