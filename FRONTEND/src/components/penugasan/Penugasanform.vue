<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <!-- Sumber penugasan (hanya saat tambah dari menu Penugasan) -->
    <div v-if="!props.item && !props.pkptId">
      <label class="input-label">Sumber Penugasan</label>
      <div style="display:flex; gap:0.5rem;">
        <button
          type="button"
          :class="form.sumber === 'PKPT' ? 'btn-primary' : 'btn-secondary'"
          style="flex:1;"
          @click="form.sumber = 'PKPT'"
        >
          PKPT
        </button>
        <button
          type="button"
          :class="form.sumber === 'NON_PKPT' ? 'btn-primary' : 'btn-secondary'"
          style="flex:1;"
          @click="form.sumber = 'NON_PKPT'"
        >
          Non-PKPT
        </button>
      </div>
    </div>

    <!-- Saat edit: sumber hanya informasi -->
    <p
      v-if="props.item"
      style="font-size:0.8rem; color:var(--text-muted); margin:0;"
    >
      Sumber:
      {{ props.item.pkpt?.sumber === 'NON_PKPT' ? 'Non-PKPT' : 'PKPT' }} —
      {{ props.item.pkpt?.tahun }}, Keirbanan {{ props.item.pkpt?.keirbanan }}
    </p>

    <div v-if="!props.item && !props.pkptId && form.sumber === 'PKPT'">
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

    <div
      v-if="!props.item && !props.pkptId && form.sumber === 'NON_PKPT'"
      style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;"
    >
      <div>
        <label class="input-label"
          >Tahun <span style="color:#f87171;">*</span></label
        >
        <input
          v-model.number="form.tahun"
          type="number"
          min="2000"
          max="2100"
          class="input-field"
        />
      </div>
      <div>
        <label class="input-label"
          >Keirbanan <span style="color:#f87171;">*</span></label
        >
        <select
          v-if="auth.hasAllAccess"
          v-model="form.keirbanan"
          class="select-field"
        >
          <option value="" disabled>Pilih</option>
          <option v-for="k in KEIRBANAN" :key="k" :value="k">
            Keirbanan {{ k }}
          </option>
        </select>
        <input
          v-else
          type="text"
          class="input-field"
          :value="`Keirbanan ${auth.keirbanan}`"
          disabled
        />
      </div>
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

    <div v-if="isNonPkpt">
      <label class="input-label">Dasar Penugasan</label>
      <input
        v-model="form.dasar_penugasan"
        type="text"
        list="dasar-penugasan-list"
        maxlength="150"
        class="input-field"
        placeholder="Contoh: Permintaan Bupati"
      />
      <datalist id="dasar-penugasan-list">
        <option v-for="d in DASAR_PENUGASAN" :key="d" :value="d" />
      </datalist>
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
import { ref, computed, watch, onMounted } from 'vue'
import { pkptService } from '@/services/pkptService'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { STATUS_PENUGASAN, JENIS_KEGIATAN, KEIRBANAN } from '@/utils/constants'

const props = defineProps({
  item: { type: Object, default: null },
  pkptId: { type: Number, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])
const auth = useAuthStore()
const ui = useUIStore()

// Saran "dasar penugasan" untuk penugasan Non-PKPT (boleh diisi bebas)
const DASAR_PENUGASAN = [
  'Permintaan Bupati',
  'Arahan Inspektur',
  'Pengaduan Masyarakat',
  'Permintaan OPD',
  'Tindak lanjut hasil pemeriksaan'
]
const errorMsg = ref('')

const pkptList = ref([])

const isLainnya = (val) => val && !JENIS_KEGIATAN.slice(0, -1).includes(val)

const form = ref({
  pkpt_id: props.pkptId || props.item?.pkpt_id || '',
  sumber: props.item?.pkpt?.sumber || 'PKPT',
  tahun: props.item?.pkpt?.tahun || ui.tahunAktif || new Date().getFullYear(),
  keirbanan: '',
  dasar_penugasan: props.item?.dasar_penugasan || '',
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
      sumber: val.pkpt?.sumber || 'PKPT',
      tahun: val.pkpt?.tahun || ui.tahunAktif,
      keirbanan: '',
      dasar_penugasan: val.dasar_penugasan || '',
      nama_penugasan: val.nama_penugasan,
      jenis_penugasan: lainnya ? 'Lainnya' : (val.jenis_penugasan || ''),
      jenis_penugasan_lainnya: lainnya ? val.jenis_penugasan : '',
      tanggal_mulai: val.tanggal_mulai || '',
      tanggal_selesai: val.tanggal_selesai || '',
      status: val.status
    }
  }
})

const isNonPkpt = computed(() =>
  props.item
    ? props.item.pkpt?.sumber === 'NON_PKPT'
    : !props.pkptId && form.value.sumber === 'NON_PKPT'
)

// Daftar PKPT untuk dropdown (hanya saat tambah dari menu Penugasan).
// Backend sudah membatasi sesuai keirbanan user dan menyembunyikan "wadah" Non-PKPT.
onMounted(async () => {
  if (props.item || props.pkptId) return
  try {
    const res = await pkptService.getAll({ limit: 100 })
    pkptList.value = res.data.data
  } catch {
    errorMsg.value = 'Gagal memuat daftar PKPT.'
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
   const tambahBaru = !props.item && !props.pkptId
  if (tambahBaru && form.value.sumber === 'PKPT' && !form.value.pkpt_id) {
    errorMsg.value = 'PKPT wajib dipilih.'
    return
  }
  if (tambahBaru && form.value.sumber === 'NON_PKPT') {
    const tahun = Number(form.value.tahun)
    if (!tahun || tahun < 2000 || tahun > 2100) {
      errorMsg.value = 'Tahun wajib diisi (2000-2100).'
      return
    }
    if (auth.hasAllAccess && !form.value.keirbanan) {
      errorMsg.value = 'Keirbanan wajib dipilih.'
      return
    }
  }
  emit('submit', {
    ...form.value,
    jenis_penugasan: form.value.jenis_penugasan === 'Lainnya' ? form.value.jenis_penugasan_lainnya : form.value.jenis_penugasan
  })
}
</script>
