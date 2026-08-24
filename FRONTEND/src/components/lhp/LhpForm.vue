<template>
  <div
    style="display:flex; flex-direction:column; gap:1.25rem; max-height:70vh; overflow-y:auto; padding-right:0.25rem;"
  >
    <div class="alert-info">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        style="width:16px;height:16px;flex-shrink:0;"
      >
        <path
          fill-rule="evenodd"
          d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-9 .5v1.25a.75.75 0 0 0 1.5 0V8.5h1.25a.75.75 0 0 0 0-1.5H7.5V5.75a.75.75 0 0 0-1.5 0V7H4.75a.75.75 0 0 0 0 1.5H6Z"
          clip-rule="evenodd"
        />
      </svg>
      <span style="font-size:0.8rem;"
        >Anda bisa menambahkan beberapa temuan sekaligus. Setiap temuan bisa
        memiliki beberapa rekomendasi.</span
      >
    </div>

    <!-- Daftar Temuan -->
    <div
      v-for="(temuan, ti) in form.temuan"
      :key="ti"
      style="border:1px solid var(--border-color); border-radius:0.875rem; overflow:hidden;"
    >
      <!-- Temuan Header -->
      <div
        style="padding:0.875rem 1rem; background:var(--bg-hover); display:flex; align-items:center; justify-content:space-between;"
      >
        <span
          style="font-size:0.8rem; font-weight:600; color:var(--text-primary);"
          >Temuan {{ ti + 1 }}</span
        >
        <button
          v-if="form.temuan.length > 1"
          type="button"
          class="btn-icon"
          @click="hapusTemuan(ti)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            style="width:14px;height:14px;color:#f87171;"
          >
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L6.94 8l-1.72 1.72a.75.75 0 1 0 1.06 1.06L8 9.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L9.06 8l1.72-1.72a.75.75 0 0 0-1.06-1.06L8 6.94 6.28 5.22Z"
            />
          </svg>
        </button>
      </div>

      <div
        style="padding:1rem; display:flex; flex-direction:column; gap:0.75rem;"
      >
        <div>
          <label class="input-label"
            >Judul Temuan <span style="color:#f87171;">*</span></label
          >
          <input
            v-model="temuan.judul_temuan"
            type="text"
            class="input-field"
            placeholder="Contoh: Temuan Administratif / Kelebihan Pembayaran Honorarium"
          />
        </div>
        <div>
          <label class="input-label"
            >Uraian Temuan <span style="color:#f87171;">*</span></label
          >
          <textarea
            v-model="temuan.uraian_temuan"
            class="input-field"
            rows="3"
            placeholder="Uraikan temuan secara detail. Untuk temuan administratif yang dirangkum, bisa tulis:&#10;1. Dokumen SPJ tidak lengkap&#10;2. Cap basah tidak ada&#10;3. dst..."
            style="resize:vertical;"
          ></textarea>
        </div>

        <!-- Rekomendasi -->
        <div>
          <div
            style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;"
          >
            <label class="input-label" style="margin:0;">Rekomendasi</label>
            <button
              type="button"
              class="btn-secondary"
              style="font-size:0.75rem; padding:0.25rem 0.5rem;"
              @click="tambahRekomendasi(ti)"
            >
              + Rekomendasi
            </button>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.625rem;">
            <div
              v-for="(rek, ri) in temuan.rekomendasi"
              :key="ri"
              style="padding:0.75rem; border-radius:0.625rem; border:1px solid var(--border-color); background:var(--bg-surface); display:flex; flex-direction:column; gap:0.625rem;"
            >
              <div
                style="display:flex; align-items:center; justify-content:space-between;"
              >
                <span
                  style="font-size:0.75rem; font-weight:600; color:var(--text-muted);"
                  >Rekomendasi {{ ri + 1 }}</span
                >
                <button
                  type="button"
                  class="btn-icon"
                  @click="hapusRekomendasi(ti, ri)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    style="width:13px;height:13px;color:#f87171;"
                  >
                    <path
                      d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L6.94 8l-1.72 1.72a.75.75 0 1 0 1.06 1.06L8 9.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L9.06 8l1.72-1.72a.75.75 0 0 0-1.06-1.06L8 6.94 6.28 5.22Z"
                    />
                  </svg>
                </button>
              </div>

              <textarea
                v-model="rek.uraian_rekomendasi"
                class="input-field"
                rows="2"
                placeholder="Uraian rekomendasi..."
                style="resize:vertical; font-size:0.82rem;"
              ></textarea>

              <div
                style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;"
              >
                <div>
                  <label class="input-label" style="font-size:0.72rem;"
                    >Ditujukan Kepada</label
                  >
                  <input
                    v-model="rek.ditujukan_kepada"
                    type="text"
                    class="input-field"
                    placeholder="Nama/jabatan/OPD"
                    style="font-size:0.82rem;"
                  />
                </div>
                <div>
                  <label class="input-label" style="font-size:0.72rem;"
                    >Batas Waktu TL</label
                  >
                  <input
                    v-model="rek.batas_waktu_tl"
                    type="date"
                    class="input-field"
                    style="font-size:0.82rem;"
                  />
                </div>
              </div>

              <!-- TGR Toggle -->
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <label
                  style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;"
                >
                  <input
                    v-model="rek.adalah_tgr"
                    type="checkbox"
                    style="width:14px; height:14px; accent-color:var(--accent);"
                  />
                  <span style="font-size:0.8rem; color:var(--text-secondary);"
                    >Temuan TGR</span
                  >
                </label>
                <input
                  v-if="rek.adalah_tgr"
                  v-model="rek.nilai_temuan"
                  type="number"
                  class="input-field"
                  placeholder="Nilai temuan (Rp)"
                  style="flex:1; font-size:0.82rem;"
                />
              </div>

              <!-- Pihak (opsional) -->
              <div>
                <label class="input-label" style="font-size:0.72rem;"
                  >Pihak (opsional)</label
                >
                <select
                  v-model="rek.pihak_id"
                  class="select-field"
                  style="font-size:0.82rem;"
                >
                  <option value="">Pilih dari master pihak (opsional)</option>
                  <option v-for="p in pihakList" :key="p.id" :value="p.id">
                    {{ p.nama }} — {{ p.jenis_pihak }}
                  </option>
                </select>
              </div>
            </div>

            <div
              v-if="!temuan.rekomendasi.length"
              style="text-align:center; padding:0.75rem; font-size:0.78rem; color:var(--text-muted); border:1px dashed var(--border-color); border-radius:0.625rem;"
            >
              Belum ada rekomendasi. Klik "+ Rekomendasi" untuk menambahkan.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tambah Temuan -->
    <button
      type="button"
      class="btn-secondary"
      style="width:100%; justify-content:center;"
      @click="tambahTemuan"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        style="width:16px;height:16px;"
      >
        <path
          d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"
        />
      </svg>
      Tambah Temuan
    </button>

    <div v-if="errorMsg" class="alert-danger">
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Footer -->
    <div
      style="display:flex; gap:0.75rem; justify-content:flex-end; padding-top:0.5rem; border-top:1px solid var(--border-color);"
    >
      <button type="button" class="btn-secondary" @click="emit('cancel')">
        Batal
      </button>
      <button
        type="button"
        class="btn-primary"
        :disabled="loading"
        @click="handleSubmit"
      >
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? 'Menyimpan...' : `Simpan ${form.temuan.length} Temuan` }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { pihakService } from '@/services/pihakService'

const props = defineProps({
  dokumenId: { type: Number, required: true },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])

const errorMsg = ref('')
const pihakList = ref([])

const buatRekomendasi = () => ({
  uraian_rekomendasi: '',
  ditujukan_kepada: '',
  adalah_tgr: false,
  nilai_temuan: null,
  batas_waktu_tl: '',
  pihak_id: ''
})

const buatTemuan = () => ({
  judul_temuan: '',
  uraian_temuan: '',
  rekomendasi: [buatRekomendasi()]
})

const form = ref({
  temuan: [buatTemuan()]
})

const tambahTemuan = () => form.value.temuan.push(buatTemuan())
const hapusTemuan = (i) => form.value.temuan.splice(i, 1)
const tambahRekomendasi = (i) => form.value.temuan[i].rekomendasi.push(buatRekomendasi())
const hapusRekomendasi = (ti, ri) => form.value.temuan[ti].rekomendasi.splice(ri, 1)

const handleSubmit = () => {
  errorMsg.value = ''

  for (const [i, t] of form.value.temuan.entries()) {
    if (!t.judul_temuan.trim()) {
      errorMsg.value = `Judul temuan ${i + 1} wajib diisi.`
      return
    }
    if (!t.uraian_temuan.trim()) {
      errorMsg.value = `Uraian temuan ${i + 1} wajib diisi.`
      return
    }
    for (const [j, r] of t.rekomendasi.entries()) {
      if (!r.uraian_rekomendasi.trim()) {
        errorMsg.value = `Uraian rekomendasi ${j + 1} pada temuan ${i + 1} wajib diisi.`
        return
      }
      if (!r.ditujukan_kepada.trim()) {
        errorMsg.value = `"Ditujukan Kepada" rekomendasi ${j + 1} pada temuan ${i + 1} wajib diisi.`
        return
      }
      if (r.adalah_tgr && !r.nilai_temuan) {
        errorMsg.value = `Nilai temuan TGR rekomendasi ${j + 1} pada temuan ${i + 1} wajib diisi.`
        return
      }
    }
  }

  emit('submit', {
    dokumen_penugasan_id: props.dokumenId,
    temuan: form.value.temuan.map(t => ({
      ...t,
      rekomendasi: t.rekomendasi.map(r => ({
        ...r,
        pihak_id: r.pihak_id || null,
        nilai_temuan: r.adalah_tgr ? r.nilai_temuan : null
      }))
    }))
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
