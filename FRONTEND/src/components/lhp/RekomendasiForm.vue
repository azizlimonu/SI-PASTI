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

    <div
      style="padding:0.875rem; border-radius:0.625rem; border:1px solid var(--border-color); display:flex; flex-direction:column; gap:0.75rem;"
    >
      <p
        style="font-size:0.8rem; font-weight:600; color:var(--text-secondary); margin:0;"
      >
        Pihak Terkait
      </p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
        <div>
          <label class="input-label"
            >Nama Pihak <span style="color:#f87171;">*</span></label
          >
          <input
            v-model="form.pihak.nama"
            type="text"
            class="input-field"
            placeholder="Nama orang/instansi"
          />
        </div>
        <div>
          <label class="input-label"
            >Jenis Pihak <span style="color:#f87171;">*</span></label
          >
          <select v-model="form.pihak.jenis_pihak" class="select-field">
            <option value="">Pilih jenis pihak</option>
            <option value="ASN">ASN</option>
            <option value="Instansi/OPD">Instansi/OPD</option>
            <option value="Perusahaan">Perusahaan</option>
            <option value="Perorangan">Perorangan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      <div
        v-if="form.pihak.jenis_pihak === 'Lainnya'"
        style="margin-top:-0.25rem;"
      >
        <label class="input-label">Jenis Pihak Lainnya</label>
        <input
          v-model="form.pihak.jenis_pihak_lainnya"
          type="text"
          class="input-field"
          placeholder="Sebutkan jenis pihak"
        />
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
        <div>
          <label class="input-label">NIP (jika ASN)</label>
          <input v-model="form.pihak.nip" type="text" class="input-field" />
        </div>
        <div>
          <label class="input-label">NIK (jika non-ASN)</label>
          <input v-model="form.pihak.nik" type="text" class="input-field" />
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
        <div>
          <label class="input-label">Jabatan</label>
          <input v-model="form.pihak.jabatan" type="text" class="input-field" />
        </div>
        <div>
          <label class="input-label">Instansi/Perusahaan</label>
          <input
            v-model="form.pihak.instansi_perusahaan"
            type="text"
            class="input-field"
          />
        </div>
      </div>
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
import { ref } from 'vue'

const props = defineProps({
  temuan: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])

const errorMsg = ref('')

const form = ref({
  uraian_rekomendasi: '',
  ditujukan_kepada: '',
  adalah_tgr: false,
  nilai_temuan: null,
  batas_waktu_tl: '',
  pihak: {
    nama: '',
    jenis_pihak: '',
    jenis_pihak_lainnya: '',
    nip: '',
    nik: '',
    jabatan: '',
    instansi_perusahaan: ''
  }
})

const handleSubmit = () => {
  errorMsg.value = ''
  if (!form.value.uraian_rekomendasi.trim()) { errorMsg.value = 'Uraian rekomendasi wajib diisi.'; return }
  if (!form.value.ditujukan_kepada.trim()) { errorMsg.value = 'Ditujukan kepada wajib diisi.'; return }
  if (form.value.adalah_tgr && !form.value.nilai_temuan) { errorMsg.value = 'Nilai temuan TGR wajib diisi.'; return }
  if (!form.value.pihak.nama.trim()) { errorMsg.value = 'Nama pihak wajib diisi.'; return }
  if (!form.value.pihak.jenis_pihak) { errorMsg.value = 'Jenis pihak wajib dipilih.'; return }

  emit('submit', {
    uraian_rekomendasi: form.value.uraian_rekomendasi,
    ditujukan_kepada: form.value.ditujukan_kepada,
    adalah_tgr: form.value.adalah_tgr,
    nilai_temuan: form.value.adalah_tgr ? form.value.nilai_temuan : null,
    batas_waktu_tl: form.value.batas_waktu_tl || null,
    pihak_id: null,
    pihak: { ...form.value.pihak }
  })
}
</script>
