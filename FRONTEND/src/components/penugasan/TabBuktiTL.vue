<template>
  <div>
    <div
      style="display:flex; justify-content:flex-end; gap:0.625rem; margin-bottom:1rem;"
    >
      <button
        v-if="auth.isAdminTL"
        class="btn-secondary"
        @click="openSetoranForm"
      >
        Catat Setoran TGR
      </button>
      <button v-if="auth.isAdminTL" class="btn-primary" @click="openBuktiForm">
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
        Upload Bukti
      </button>
    </div>

    <!-- Progress Rekomendasi Administratif -->
    <div
      v-if="temuanAdministratif.length"
      class="glass-card"
      style="padding:1rem; margin-bottom:1rem;"
    >
      <p
        style="font-size:0.85rem; font-weight:600; color:var(--text-primary); margin:0 0 0.75rem;"
      >
        Progress Rekomendasi Administratif
      </p>
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <div v-for="t in temuanAdministratif" :key="t.id">
          <div
            style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;"
          >
            <span
              style="font-size:0.78rem; color:var(--text-secondary);"
              >{{ t.judul_temuan }}</span
            >
            <span
              style="font-size:0.75rem; font-weight:600; color:var(--text-primary);"
            >
              {{ t.selesai }}/{{ t.total }} ({{ t.persen }}%)
            </span>
          </div>
          <div
            style="height:8px; border-radius:999px; background:var(--bg-hover); overflow:hidden;"
          >
            <div
              :style="`height:100%; width:${t.persen}%; background:var(--accent); border-radius:999px; transition:width .3s;`"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress TGR per Rekomendasi -->
    <div
      v-if="rekomendasiTgr.length"
      class="glass-card"
      style="padding:0; margin-bottom:1rem;"
    >
      <div
        style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color);"
      >
        <p
          style="font-size:0.85rem; font-weight:600; color:var(--text-primary); margin:0;"
        >
          Progress TGR per Rekomendasi
        </p>
      </div>
      <div class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <thead>
            <tr>
              <th>Temuan</th>
              <th>Pihak</th>
              <th>Nilai Temuan</th>
              <th>Terlunasi</th>
              <th>Sisa</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="r in rekomendasiTgr" :key="r.id">
              <tr>
                <td style="font-size:0.8rem; max-width:200px;">
                  {{ r.temuan?.judul_temuan }}
                </td>
                <td style="font-size:0.8rem;">{{ r.pihak?.nama || '-' }}</td>
                <td style="font-size:0.8rem; white-space:nowrap;">
                  {{ formatRupiah(r.nilai_temuan) }}
                </td>
                <td
                  style="font-size:0.8rem; white-space:nowrap; color:#34d399;"
                >
                  {{ formatRupiah(r.nilai_terlunasi) }}
                </td>
                <td
                  style="font-size:0.8rem; white-space:nowrap; color:#f87171;"
                >
                  {{ formatRupiah((r.nilai_temuan || 0) - (r.nilai_terlunasi || 0)) }}
                </td>
                <td style="min-width:110px;">
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <div
                      style="flex:1; height:6px; background:var(--bg-hover); border-radius:9999px; overflow:hidden;"
                    >
                      <div
                        :style="`height:100%; width:${tgrPersen(r)}%; background:linear-gradient(90deg,#059669,#34d399); border-radius:9999px;`"
                      ></div>
                    </div>
                    <span
                      style="font-size:0.72rem; color:var(--text-muted); white-space:nowrap;"
                      >{{ tgrPersen(r) }}%</span
                    >
                  </div>
                </td>
                <td>
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span
                      :class="`badge badge-${tgrPersen(r) >= 100 ? 'green' : 'yellow'}`"
                      style="font-size:0.68rem;"
                    >
                      {{ tgrPersen(r) >= 100 ? 'Lunas' : 'Belum Lunas' }}
                    </span>
                    <button
                      class="btn-icon"
                      style="font-size:0.68rem;"
                      @click="toggleRiwayatSetoran(r.id)"
                    >
                      {{ expandedSetoran[r.id] ? 'Tutup' : 'Riwayat' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="expandedSetoran[r.id]">
                <td
                  colspan="7"
                  style="padding:0.75rem 1rem; background:var(--bg-hover);"
                >
                  <div
                    v-if="loadingSetoran[r.id]"
                    style="display:flex; justify-content:center; padding:1rem;"
                  >
                    <span class="loading-spinner"></span>
                  </div>
                  <div
                    v-else-if="!riwayatSetoran[r.id]?.length"
                    style="font-size:0.78rem; color:var(--text-muted); padding:0.5rem 0;"
                  >
                    Belum ada setoran untuk rekomendasi ini.
                  </div>
                  <div
                    v-else
                    style="display:flex; flex-direction:column; gap:0.5rem;"
                  >
                    <div
                      v-for="s in riwayatSetoran[r.id]"
                      :key="s.id"
                      style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0.75rem; border-radius:0.5rem; background:var(--bg-card); border:1px solid var(--border-color);"
                    >
                      <div>
                        <p
                          style="font-size:0.8rem; font-weight:500; color:var(--text-primary); margin:0;"
                        >
                          {{ formatRupiah(s.jumlah_setoran) }}
                          <span
                            style="font-size:0.7rem; color:var(--text-muted); font-weight:400;"
                          >
                            — {{ formatDate(s.tanggal_setor) }}</span
                          >
                        </p>
                        <p
                          v-if="s.keterangan"
                          style="font-size:0.72rem; color:var(--text-muted); margin:0.125rem 0 0;"
                        >
                          {{ s.keterangan }}
                        </p>
                        <p
                          style="font-size:0.68rem; color:var(--text-muted); margin:0.125rem 0 0;"
                        >
                          Dicatat oleh {{ s.creator?.nama }}
                        </p>
                      </div>
                      <a
                        v-if="s.file_path"
                        :href="`http://localhost:3000/${s.file_path}`"
                        download
                        class="btn-secondary"
                        style="font-size:0.7rem; padding:0.2rem 0.5rem;"
                      >
                        Download Bukti
                      </a>
                      <a
                        v-else-if="s.link_bukti"
                        :href="s.link_bukti"
                        target="_blank"
                        class="btn-secondary"
                        style="font-size:0.7rem; padding:0.2rem 0.5rem;"
                      >
                        Buka Link
                      </a>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="loading"
      style="display:flex; justify-content:center; padding:2rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="!buktiList.length" class="glass-card">
      <div class="empty-state" style="padding:2rem;">
        <p style="color:var(--text-secondary);">
          Belum ada bukti tindak lanjut.
        </p>
      </div>
    </div>

    <div v-else class="glass-card" style="padding:0;">
      <div class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <thead>
            <tr>
              <th>No</th>
              <th>Judul Bukti</th>
              <th>Tindak Lanjut / Rekomendasi Terkait</th>
              <th>Jenis</th>
              <th>Pihak</th>
              <th>Temuan</th>
              <th>Tanggal Upload</th>
              <th>File/Link</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(bukti, i) in buktiList" :key="bukti.id">
              <td style="color:var(--text-muted); font-size:0.8rem;">
                {{ i + 1 }}
              </td>
              <td style="font-size:0.82rem; font-weight:500; max-width:180px;">
                {{ bukti.judul_bukti }}
                <p
                  v-if="bukti.keterangan"
                  style="font-size:0.7rem; color:var(--text-muted); margin:0.125rem 0 0; font-weight:400;"
                >
                  {{ bukti.keterangan }}
                </p>
              </td>
              <td style="font-size:0.78rem; max-width:220px;">
                <div
                  v-for="(tl, ti) in bukti.relatedTL"
                  :key="ti"
                  style="margin-bottom:0.25rem;"
                >
                  {{ tl.uraian_tl }}
                  <span style="color:var(--text-muted);"
                    >— {{ tl.rekomendasi?.ditujukan_kepada }}</span
                  >
                </div>
              </td>
              <td>
                <div style="display:flex; flex-direction:column; gap:0.2rem;">
                  <span
                    v-for="(jenis, ji) in bukti.jenisSet"
                    :key="ji"
                    :class="`badge badge-${jenis === 'TGR' ? 'purple' : 'blue'}`"
                    style="font-size:0.65rem; width:fit-content;"
                  >
                    {{ jenis }}
                  </span>
                </div>
              </td>
              <td style="font-size:0.78rem;">
                {{ bukti.pihakSet.join(', ') || '-' }}
              </td>
              <td style="font-size:0.78rem; max-width:160px;">
                {{ bukti.temuanSet.join(', ') }}
              </td>
              <td
                style="font-size:0.78rem; white-space:nowrap; color:var(--text-muted);"
              >
                {{ formatDate(bukti.created_at) }}
                <p style="margin:0.125rem 0 0;">{{ bukti.uploader?.nama }}</p>
              </td>
              <td>
                <div style="display:flex; gap:0.375rem; flex-wrap:wrap;">
                  <a
                    v-if="bukti.file_path"
                    :href="`http://localhost:3000/${bukti.file_path}`"
                    download
                    class="btn-secondary"
                    style="font-size:0.72rem; padding:0.2rem 0.5rem;"
                  >
                    Download
                  </a>
                  <a
                    v-if="bukti.link_bukti"
                    :href="bukti.link_bukti"
                    target="_blank"
                    class="btn-secondary"
                    style="font-size:0.72rem; padding:0.2rem 0.5rem;"
                  >
                    Link
                  </a>
                </div>
              </td>
              <td>
                <button
                  v-if="auth.isAdminTL"
                  class="btn-icon"
                  @click="handleDelete(bukti)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    style="width:13px;height:13px;color:#f87171;"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- sampai sini -->
    <!-- Modal Upload Bukti Biasa -->
    <AppModal
      v-model="showForm"
      title="Upload Bukti Tindak Lanjut"
      width="34rem"
    >
      <form
        @submit.prevent="handleSubmit"
        style="display:flex; flex-direction:column; gap:1rem;"
      >
        <div>
          <label class="input-label"
            >Judul Bukti <span style="color:#f87171;">*</span></label
          >
          <input
            v-model="form.judul_bukti"
            type="text"
            class="input-field"
            placeholder="Contoh: Berita Acara TL, Bukti Setor Tahap 1"
          />
        </div>
        <div>
          <label class="input-label">Keterangan</label>
          <input
            v-model="form.keterangan"
            type="text"
            class="input-field"
            placeholder="Keterangan tambahan (opsional)"
          />
        </div>
        <div>
          <label class="input-label"
            >Tindak Lanjut Terkait <span style="color:#f87171;">*</span></label
          >
          <p
            style="font-size:0.72rem; color:var(--text-muted); margin:0 0 0.5rem;"
          >
            Bukti bisa dikaitkan ke lebih dari satu tindak lanjut.
          </p>
          <div
            style="max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:0.375rem; padding:0.625rem; border:1px solid var(--border-color); border-radius:0.625rem;"
          >
            <label
              v-for="tl in tlOptions"
              :key="tl.id"
              style="display:flex; align-items:flex-start; gap:0.5rem; font-size:0.78rem; color:var(--text-secondary); cursor:pointer;"
            >
              <input
                type="checkbox"
                :value="tl.id"
                v-model="form.tindak_lanjut_id"
                style="margin-top:2px;"
              />
              <span
                >{{ tl.rekomendasi?.ditujukan_kepada }} —
                {{ tl.uraian_tl }}</span
              >
            </label>
            <p
              v-if="!tlOptions.length"
              style="font-size:0.75rem; color:var(--text-muted); margin:0;"
            >
              Belum ada tindak lanjut.
            </p>
          </div>
        </div>
        <div>
          <label class="input-label"
            >File / Link <span style="color:#f87171;">*</span></label
          >
          <AppDropzone
            v-model="form.file"
            v-model:link="form.link_bukti"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            hint="PDF, DOC, JPG, PNG (Maks. 20MB) atau link"
          />
        </div>
        <div v-if="errorMsg" class="alert-danger">
          <span>{{ errorMsg }}</span>
        </div>
        <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
          <button type="button" class="btn-secondary" @click="showForm = false">
            Batal
          </button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            <span v-if="submitting" class="loading-spinner"></span>
            {{ submitting ? 'Mengupload...' : 'Upload' }}
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Modal Setoran TGR -->
    <AppModal v-model="showSetoranForm" title="Catat Setoran TGR" width="34rem">
      <form
        @submit.prevent="handleSubmitSetoran"
        style="display:flex; flex-direction:column; gap:1rem;"
      >
        <div>
          <label class="input-label"
            >Rekomendasi TGR <span style="color:#f87171;">*</span></label
          >
          <select v-model="setoranForm.rekomendasi_id" class="select-field">
            <option value="">Pilih rekomendasi TGR</option>
            <option v-for="r in rekomendasiTgr" :key="r.id" :value="r.id">
              {{ r.ditujukan_kepada }} — Sisa
              {{ formatRupiah((r.nilai_temuan || 0) - (r.nilai_terlunasi || 0)) }}
            </option>
          </select>
        </div>
        <div>
          <label class="input-label"
            >Jumlah Setoran (Rp) <span style="color:#f87171;">*</span></label
          >
          <input
            v-model.number="setoranForm.jumlah_setoran"
            type="number"
            min="0"
            class="input-field"
            placeholder="0"
          />
        </div>
        <div>
          <label class="input-label"
            >Tanggal Setor <span style="color:#f87171;">*</span></label
          >
          <input
            v-model="setoranForm.tanggal_setor"
            type="date"
            class="input-field"
          />
        </div>
        <div>
          <label class="input-label">Keterangan</label>
          <input
            v-model="setoranForm.keterangan"
            type="text"
            class="input-field"
            placeholder="Keterangan tambahan (opsional)"
          />
        </div>
        <div>
          <label class="input-label"
            >Bukti Setor <span style="color:#f87171;">*</span></label
          >
          <AppDropzone
            v-model="setoranForm.file"
            v-model:link="setoranForm.link_bukti"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            hint="PDF, DOC, JPG, PNG (Maks. 20MB) atau link"
          />
        </div>
        <div v-if="errorMsgSetoran" class="alert-danger">
          <span>{{ errorMsgSetoran }}</span>
        </div>
        <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
          <button
            type="button"
            class="btn-secondary"
            @click="showSetoranForm = false"
          >
            Batal
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="submittingSetoran"
          >
            <span v-if="submittingSetoran" class="loading-spinner"></span>
            {{ submittingSetoran ? 'Menyimpan...' : 'Simpan Setoran' }}
          </button>
        </div>
      </form>
    </AppModal>

    <AppConfirm
      v-model="showConfirm"
      title="Hapus Bukti"
      :message="`Yakin hapus bukti '${deleteTarget?.judul_bukti}'?`"
      :loading="submitting"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useTindakLanjutStore } from '@/stores/tindaklanjut'
import { useDokumenStore } from '@/stores/dokumen'
import { tindakLanjutService } from '@/services/tindakLanjutService'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import AppDropzone from '@/components/common/AppDropzone.vue'
import { formatDate, formatRupiah } from '@/utils/format'

const props = defineProps({
  penugasanId: { type: Number, required: true },
  dokumenList: { type: Array, default: () => [] }
})

const auth = useAuthStore()
const toast = useToast()
const tlStore = useTindakLanjutStore()
const dokumen = useDokumenStore()

const loading = ref(false)
const submitting = ref(false)
const submittingSetoran = ref(false)
const buktiList = ref([])
const temuanLengkap = ref([])
const showForm = ref(false)
const showSetoranForm = ref(false)
const showConfirm = ref(false)
const deleteTarget = ref(null)
const errorMsg = ref('')
const errorMsgSetoran = ref('')

const form = ref({
  judul_bukti: '',
  keterangan: '',
  file: null,
  link_bukti: '',
  tindak_lanjut_id: []
})

const setoranForm = ref({
  rekomendasi_id: '',
  jumlah_setoran: null,
  tanggal_setor: new Date().toISOString().split('T')[0],
  keterangan: '',
  file: null,
  link_bukti: ''
})

// Semua TL, hasil flatten dari temuan -> rekomendasi -> tindakLanjuts
const tlOptions = computed(() => {
  const out = []
  for (const t of temuanLengkap.value) {
    for (const r of (t.rekomendasis || [])) {
      for (const tl of (r.tindakLanjuts || [])) {
        out.push({ ...tl, rekomendasi: r, temuan: t })
      }
    }
  }
  return out
})

// Semua rekomendasi TGR, untuk dropdown setoran & panel progress TGR
const rekomendasiTgr = computed(() => {
  const out = []
  for (const t of temuanLengkap.value) {
    for (const r of (t.rekomendasis || [])) {
      if (r.adalah_tgr) out.push({ ...r, temuan: t })
    }
  }
  return out
})

const tgrPersen = (r) => {
  const total = r.nilai_temuan || 0
  const lunas = r.nilai_terlunasi || 0
  return total > 0 ? Math.min(100, Math.round((lunas / total) * 100)) : 0
}

const expandedSetoran = ref({})
const riwayatSetoran = ref({})
const loadingSetoran = ref({})

const toggleRiwayatSetoran = async (rekomendasiId) => {
  expandedSetoran.value[rekomendasiId] = !expandedSetoran.value[rekomendasiId]
  if (expandedSetoran.value[rekomendasiId] && !riwayatSetoran.value[rekomendasiId]) {
    loadingSetoran.value[rekomendasiId] = true
    riwayatSetoran.value[rekomendasiId] = await dokumen.fetchSetoranByRekomendasi(rekomendasiId)
    loadingSetoran.value[rekomendasiId] = false
  }
}

// Progress rekomendasi administratif per temuan
const temuanAdministratif = computed(() => {
  const out = []
  for (const t of temuanLengkap.value) {
    const rekAdministratif = (t.rekomendasis || []).filter(r => !r.adalah_tgr)
    if (!rekAdministratif.length) continue
    const selesai = rekAdministratif.filter(r => r.ada_bukti_tl).length
    out.push({
      id: t.id,
      judul_temuan: t.judul_temuan,
      total: rekAdministratif.length,
      selesai,
      persen: Math.round((selesai / rekAdministratif.length) * 100)
    })
  }
  return out
})

const loadBukti = async () => {
  loading.value = true

  const dokLhp = props.dokumenList.filter(d => d.jenis_dokumen === 'LHP')
  const hasilTemuan = []
  for (const dok of dokLhp) {
    const res = await dokumen.fetchTemuan(dok.id)
    hasilTemuan.push(...(res || []))
  }
  temuanLengkap.value = hasilTemuan

  const buktiMap = new Map()
  for (const tl of tlOptions.value) {
    for (const b of (tl.buktis || [])) {
      if (!buktiMap.has(b.id)) {
        buktiMap.set(b.id, { ...b, relatedTL: [] })
      }
      buktiMap.get(b.id).relatedTL.push(tl)
    }
  }

  const enriched = Array.from(buktiMap.values()).map(b => {
    const jenisSet = [...new Set(b.relatedTL.map(tl => tl.rekomendasi?.adalah_tgr ? 'TGR' : 'Administratif'))]
    const pihakSet = [...new Set(b.relatedTL.map(tl => tl.rekomendasi?.pihak?.nama).filter(Boolean))]
    const temuanSet = [...new Set(b.relatedTL.map(tl => tl.temuan?.judul_temuan).filter(Boolean))]
    return { ...b, jenisSet, pihakSet, temuanSet }
  })

  buktiList.value = enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  loading.value = false
}

const openBuktiForm = () => {
  form.value = { judul_bukti: '', keterangan: '', file: null, link_bukti: '', tindak_lanjut_id: [] }
  errorMsg.value = ''
  showForm.value = true
}

const openSetoranForm = () => {
  setoranForm.value = {
    rekomendasi_id: '',
    jumlah_setoran: null,
    tanggal_setor: new Date().toISOString().split('T')[0],
    keterangan: '',
    file: null,
    link_bukti: ''
  }
  errorMsgSetoran.value = ''
  showSetoranForm.value = true
}

const handleSubmit = async () => {
  errorMsg.value = ''
  if (!form.value.judul_bukti.trim()) { errorMsg.value = 'Judul bukti wajib diisi.'; return }
  if (!form.value.tindak_lanjut_id.length) { errorMsg.value = 'Pilih minimal satu tindak lanjut terkait.'; return }
  if (!form.value.file && !form.value.link_bukti) { errorMsg.value = 'File atau link wajib diisi.'; return }

  submitting.value = true
  const result = await tlStore.uploadBukti({ ...form.value })
  submitting.value = false

  if (result.success) {
    toast.success('Bukti berhasil diupload.')
    showForm.value = false
    await loadBukti()
  } else {
    toast.error(result.message)
  }
}

const handleSubmitSetoran = async () => {
  errorMsgSetoran.value = ''
  if (!setoranForm.value.rekomendasi_id) { errorMsgSetoran.value = 'Rekomendasi TGR wajib dipilih.'; return }
  if (!setoranForm.value.jumlah_setoran) { errorMsgSetoran.value = 'Jumlah setoran wajib diisi.'; return }
  if (!setoranForm.value.tanggal_setor) { errorMsgSetoran.value = 'Tanggal setor wajib diisi.'; return }
  if (!setoranForm.value.file && !setoranForm.value.link_bukti) { errorMsgSetoran.value = 'File atau link bukti setor wajib diisi.'; return }

  submittingSetoran.value = true
  const { rekomendasi_id, ...payload } = setoranForm.value
  const result = await dokumen.tambahSetoranTgr(rekomendasi_id, payload)
  submittingSetoran.value = false

  if (result.success) {
    toast.success('Setoran TGR berhasil dicatat.')
    showSetoranForm.value = false
    await loadBukti()
  } else {
    toast.error(result.message)
  }
}

const handleDelete = (bukti) => {
  deleteTarget.value = bukti
  showConfirm.value = true
}

const confirmDelete = async () => {
  submitting.value = true
  try {
    await tindakLanjutService.deleteBukti(deleteTarget.value.id)
    toast.success('Bukti berhasil dihapus.')
    showConfirm.value = false
    await loadBukti()
  } catch(e) {
    toast.error(e.response?.data?.message || 'Gagal menghapus bukti.')
  }
  submitting.value = false
}

watch(() => props.dokumenList, (val) => {
  if (val.length) loadBukti()
}, { immediate: true })
</script>
