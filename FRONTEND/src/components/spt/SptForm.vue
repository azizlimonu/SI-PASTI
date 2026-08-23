<template>
  <form
    @submit.prevent="handleSubmit"
    style="display:flex; flex-direction:column; gap:1rem;"
  >
    <div>
      <label class="input-label"
        >Nomor SPT <span style="color:#f87171;">*</span></label
      >
      <input
        v-model="form.nomor_spt"
        type="text"
        class="input-field"
        placeholder="Contoh: SPT/001/IRBAN-II/2026"
      />
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
      <div>
        <label class="input-label"
          >Jenis Kegiatan <span style="color:#f87171;">*</span></label
        >
        <select v-model="form.jenis_kegiatan" class="select-field">
          <option value="" disabled>Pilih jenis</option>
          <option v-for="j in JENIS_KEGIATAN" :key="j" :value="j">
            {{ j }}
          </option>
        </select>
      </div>
      <div v-if="form.jenis_kegiatan === 'Lainnya'">
        <label class="input-label"
          >Keterangan Lainnya <span style="color:#f87171;">*</span></label
        >
        <input
          v-model="form.jenis_kegiatan_lainnya"
          type="text"
          class="input-field"
          placeholder="Sebutkan jenis kegiatan"
        />
      </div>
    </div>

    <div>
      <label class="input-label"
        >Uraian Kegiatan <span style="color:#f87171;">*</span></label
      >
      <input
        v-model="form.uraian_kegiatan"
        type="text"
        class="input-field"
        placeholder="Contoh: Audit Ketaatan Dana BOS"
      />
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.75rem;">
      <div>
        <label class="input-label"
          >Tanggal Mulai <span style="color:#f87171;">*</span></label
        >
        <input
          v-model="form.tanggal_mulai"
          type="date"
          class="input-field"
          @change="hitungHari"
        />
      </div>
      <div>
        <label class="input-label"
          >Tanggal Selesai <span style="color:#f87171;">*</span></label
        >
        <input
          v-model="form.tanggal_selesai"
          type="date"
          class="input-field"
          @change="hitungHari"
        />
      </div>
      <div>
        <label class="input-label">Jumlah Hari</label>
        <input
          v-model="form.jumlah_hari"
          type="number"
          class="input-field"
          placeholder="Jumlah hari (auto)"
          min="1"
        />
      </div>
    </div>

    <!-- Upload File / Link -->
    <div>
      <label class="input-label">File SPT</label>
      <AppDropzone
        v-model="form.file_spt"
        v-model:link="form.link_spt"
        accept=".pdf"
        hint="PDF maksimal 10MB atau masukkan link"
      />
    </div>

    <!-- Tim -->
    <div>
      <div
        style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;"
      >
        <label class="input-label" style="margin:0;">Tim Penugasan</label>
        <button
          type="button"
          class="btn-secondary"
          style="font-size:0.78rem; padding:0.3rem 0.625rem;"
          @click="tambahAnggota"
        >
          + Tambah
        </button>
      </div>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        <div
          v-for="(anggota, i) in form.tim"
          :key="i"
          style="display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:0.5rem; align-items:center;"
        >
          <input
            v-model="anggota.nip"
            type="text"
            class="input-field"
            placeholder="NIP"
            style="font-size:0.82rem;"
          />
          <input
            v-model="anggota.nama"
            type="text"
            class="input-field"
            placeholder="Nama"
            style="font-size:0.82rem;"
          />
          <select
            v-model="anggota.jabatan_tim"
            class="select-field"
            style="font-size:0.82rem;"
          >
            <option value="" disabled>Jabatan Tim</option>
            <option v-for="j in JABATAN_TIM" :key="j" :value="j">
              {{ j }}
            </option>
          </select>
          <button
            type="button"
            class="btn-icon"
            @click="hapusAnggota(i)"
            style="flex-shrink:0;"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              style="width:15px;height:15px;color:#f87171;"
            >
              <path
                d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L6.94 8l-1.72 1.72a.75.75 0 1 0 1.06 1.06L8 9.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L9.06 8l1.72-1.72a.75.75 0 0 0-1.06-1.06L8 6.94 6.28 5.22Z"
              />
            </svg>
          </button>
        </div>
        <div
          v-if="!form.tim.length"
          style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:0.5rem;"
        >
          Belum ada anggota tim. Klik "+ Tambah" untuk menambahkan.
        </div>
      </div>
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
        {{ loading ? 'Menyimpan...' : (props.item ? 'Update SPT' : 'Simpan SPT') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppDropzone from '@/components/common/AppDropzone.vue'
import { JENIS_KEGIATAN, JABATAN_TIM } from '@/utils/constants'

const props = defineProps({
  item: { type: Object, default: null },
  penugasanId: { type: Number, required: true },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])
const errorMsg = ref('')

const form = ref({
  nomor_spt: props.item?.nomor_spt || '',
  jenis_kegiatan: props.item?.jenis_kegiatan || '',
  jenis_kegiatan_lainnya: props.item?.jenis_kegiatan_lainnya || '',
  uraian_kegiatan: props.item?.uraian_kegiatan || '',
  tanggal_mulai: props.item?.tanggal_mulai || '',
  tanggal_selesai: props.item?.tanggal_selesai || '',
   jumlah_hari: props.item?.jumlah_hari || '',
  file_spt: null,
  link_spt: props.item?.link_spt || '',
  tim: props.item?.tims?.map(t => ({
    nip: t.nip, nama: t.nama, jabatan_tim: t.jabatan_tim
  })) || []
})

const hitungHari = () => {
  if (!form.value.tanggal_mulai || !form.value.tanggal_selesai) return
  const mulai = new Date(form.value.tanggal_mulai)
  const selesai = new Date(form.value.tanggal_selesai)
  const diff = Math.floor((selesai - mulai) / (1000 * 60 * 60 * 24)) + 1
  if (diff > 0) form.value.jumlah_hari = diff
}// computed sudah handle

const tambahAnggota = () => {
  form.value.tim.push({ nip: '', nama: '', jabatan_tim: '' })
}

const hapusAnggota = (i) => {
  form.value.tim.splice(i, 1)
}

const handleSubmit = () => {
  errorMsg.value = ''

  if (!form.value.nomor_spt.trim()) { errorMsg.value = 'Nomor SPT wajib diisi.'; return }
  if (!form.value.jenis_kegiatan) { errorMsg.value = 'Jenis kegiatan wajib dipilih.'; return }
  if (form.value.jenis_kegiatan === 'Lainnya' && !form.value.jenis_kegiatan_lainnya.trim()) {
    errorMsg.value = 'Keterangan jenis kegiatan lainnya wajib diisi.'; return
  }
  if (!form.value.uraian_kegiatan.trim()) { errorMsg.value = 'Uraian kegiatan wajib diisi.'; return }
  if (!form.value.tanggal_mulai || !form.value.tanggal_selesai) { errorMsg.value = 'Tanggal mulai dan selesai wajib diisi.'; return }
  if (!props.item && !form.value.file_spt && !form.value.link_spt) {
    errorMsg.value = 'Upload file SPT atau isi link SPT, minimal salah satu.'; return
  }

  emit('submit', { ...form.value, penugasan_id: props.penugasanId })
}
</script>
