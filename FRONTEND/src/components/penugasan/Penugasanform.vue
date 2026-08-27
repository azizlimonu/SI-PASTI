<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <div v-if="!pkptId">
      <label class="input-label"
        >PKPT <span style="color:#f87171;">*</span></label
      >
      <select v-model="form.pkpt_id" class="select-field">
        <option value="" disabled>Pilih PKPT</option>
        <option v-for="p in pkptList" :key="p.id" :value="p.id">
          {{ p.tahun }} — {{ p.nama_program }}
        </option>
      </select>
    </div>

    <div>
      <label class="input-label"
        >Nama Penugasan <span style="color:#f87171;">*</span></label
      >
      <input
        v-model="form.nama_penugasan"
        type="text"
        class="input-field"
        placeholder="Contoh: Audit Dana BOS SDN 1 Limboto"
      />
    </div>

    <div>
      <label class="input-label"
        >Jenis Penugasan <span style="color:#f87171;">*</span></label
      >
      <select v-model="form.jenis_penugasan" class="select-field">
        <option value="" disabled>Pilih jenis</option>
        <option v-for="j in JENIS_KEGIATAN" :key="j" :value="j">{{ j }}</option>
      </select>
    </div>
    <div v-if="form.jenis_penugasan === 'Lainnya'">
      <label class="input-label"
        >Keterangan Jenis Penugasan <span style="color:#f87171;">*</span></label
      >
      <input
        v-model="form.jenis_penugasan_lainnya"
        type="text"
        class="input-field"
        placeholder="Sebutkan jenis penugasan"
      />
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
      <div>
        <label class="input-label">Tanggal Mulai</label>
        <input v-model="form.tanggal_mulai" type="date" class="input-field" />
      </div>
      <div>
        <label class="input-label">Tanggal Selesai</label>
        <input v-model="form.tanggal_selesai" type="date" class="input-field" />
      </div>
    </div>

    <div v-if="props.item">
      <label class="input-label">Status</label>
      <select v-model="form.status" class="select-field">
        <option v-for="s in STATUS_PENUGASAN" :key="s" :value="s">
          {{ s }}
        </option>
      </select>
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
        {{ loading ? 'Menyimpan...' : (props.item ? 'Update' : 'Simpan') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { usePkptStore } from '@/stores/pkpt'
import { STATUS_PENUGASAN, JENIS_KEGIATAN } from '@/utils/constants'

const props = defineProps({
  item: { type: Object, default: null },
  pkptId: { type: Number, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])
const pkptStore = usePkptStore()
const errorMsg = ref('')

const pkptList = ref([])

const isLainnya = (val) => val && !JENIS_KEGIATAN.slice(0, -1).includes(val)

const form = ref({
  pkpt_id: props.pkptId || props.item?.pkpt_id || '',
  nama_penugasan: props.item?.nama_penugasan || '',
  jenis_penugasan: props.item && isLainnya(props.item?.jenis_penugasan) ? 'Lainnya' : (props.item?.jenis_penugasan || ''),
  jenis_penugasan_lainnya: props.item && isLainnya(props.item?.jenis_penugasan) ? props.item.jenis_penugasan : '',
  tanggal_mulai: props.item?.tanggal_mulai || '',
  tanggal_selesai: props.item?.tanggal_selesai || '',
  status: props.item?.status || 'Belum Mulai'
})

watch(() => props.item, (val) => {
  if (val) {
    const lainnya = isLainnya(val.jenis_penugasan)
    form.value = {
      pkpt_id: val.pkpt_id,
      nama_penugasan: val.nama_penugasan,
      jenis_penugasan: lainnya ? 'Lainnya' : (val.jenis_penugasan || ''),
      jenis_penugasan_lainnya: lainnya ? val.jenis_penugasan : '',
      tanggal_mulai: val.tanggal_mulai || '',
      tanggal_selesai: val.tanggal_selesai || '',
      status: val.status
    }
  }
})

const handleSubmit = () => {
  errorMsg.value = ''
  if (!form.value.nama_penugasan.trim()) {
    errorMsg.value = 'Nama penugasan wajib diisi.'
    return
  }
  if (!form.value.jenis_penugasan) {
    errorMsg.value = 'Jenis penugasan wajib dipilih.'
    return
  }
  if (form.value.jenis_penugasan === 'Lainnya' && !form.value.jenis_penugasan_lainnya.trim()) {
    errorMsg.value = 'Keterangan jenis penugasan wajib diisi.'
    return
  }
  if (!props.pkptId && !form.value.pkpt_id) {
    errorMsg.value = 'PKPT wajib dipilih.'
    return
  }
  emit('submit', {
    ...form.value,
    jenis_penugasan: form.value.jenis_penugasan === 'Lainnya' ? form.value.jenis_penugasan_lainnya : form.value.jenis_penugasan
  })
}
</script>
