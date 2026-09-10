<template>
  <div>
    <div class="page-header">
      <div>
        <RouterLink
          to="/tindak-lanjut"
          style="font-size:0.78rem; color:var(--accent); text-decoration:none;"
        >
          ← Kembali ke daftar TL
        </RouterLink>
        <h1 class="page-title" style="margin-top:0.35rem;">
          {{ penugasan?.nama_penugasan || '...' }}
        </h1>
        <p class="page-subtitle">
          {{ penugasan?.jenis_penugasan }} — Keirbanan
          {{ penugasan?.pkpt?.keirbanan }}, Tahun {{ penugasan?.pkpt?.tahun }}
        </p>
      </div>
    </div>

    <div
      v-if="loading"
      class="glass-card"
      style="padding:2rem; text-align:center;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div
      v-else-if="!temuanList.length"
      class="glass-card empty-state"
      style="padding:2rem;"
    >
      <p style="font-size:0.9rem;">Belum ada LHP/temuan untuk penugasan ini.</p>
    </div>

    <div v-else style="display:flex; flex-direction:column; gap:1rem;">
      <div
        v-for="temuan in temuanList"
        :key="temuan.id"
        class="glass-card"
        style="padding:1.25rem;"
      >
        <h3 class="card-title">{{ temuan.judul_temuan }}</h3>

        <div v-for="rek in temuan.rekomendasis" :key="rek.id" class="rek-block">
          <div
            style="display:flex; align-items:flex-start; justify-content:space-between; gap:0.75rem; flex-wrap:wrap;"
          >
            <div style="flex:1; min-width:240px;">
              <p
                style="font-size:0.85rem; color:var(--text-primary); margin:0 0 0.35rem;"
              >
                {{ rek.uraian_rekomendasi }}
              </p>
              <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">
                Ditujukan: {{ rek.ditujukan_kepada }}
                <span
                  v-if="rek.adalah_tgr"
                  class="badge badge-purple"
                  style="margin-left:0.4rem;"
                  >TGR</span
                >
              </p>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span
                :class="`badge badge-${BADGE_COLOR[rek.status] || 'gray'}`"
                >{{ rek.status }}</span
              >
              <button
                v-if="canEdit"
                class="btn-icon-sm"
                title="Override status manual"
                @click="openStatusOverride(rek)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style="width:16px;height:16px;"
                >
                  <path
                    d="M17.414 2.586a2 2 0 0 0-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 0 0 0-2.828Z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M2 6a2 2 0 0 1 2-2h4a1 1 0 0 1 0 2H4v10h10v-4a1 1 0 1 1 2 0v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Panel TGR: nilai & pembayaran (read-only, sumbernya SetoranTgr) -->
          <div v-if="rek.adalah_tgr" class="tgr-panel">
            <div>
              <span class="tgr-label">Nilai Temuan</span>
              <span
                class="tgr-value"
                >{{ formatRupiah(rek.nilai_temuan) }}</span
              >
            </div>
            <div>
              <span class="tgr-label">Terlunasi</span>
              <span
                class="tgr-value"
                style="color:#34d399;"
                >{{ formatRupiah(rek.nilai_terlunasi) }}</span
              >
            </div>
            <div>
              <span class="tgr-label">Sisa</span>
              <span
                class="tgr-value"
                style="color:#f87171;"
                >{{ formatRupiah((rek.nilai_temuan || 0) - (rek.nilai_terlunasi || 0)) }}</span
              >
            </div>
          </div>

          <!-- Timeline gabungan: Tindak Lanjut + Setoran TGR, urut tanggal terbaru -->
          <div
            v-if="timelineFor(rek).length"
            style="margin-top:0.75rem; display:flex; flex-direction:column; gap:0.5rem;"
          >
            <div
              v-for="entry in timelineFor(rek)"
              :key="`${entry.type}-${entry.item.id}`"
              class="tl-item"
            >
              <!-- Entri: Tindak Lanjut -->
              <template v-if="entry.type === 'tl'">
                <div
                  style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;"
                >
                  <span
                    style="font-size:0.72rem; display:flex; align-items:center; gap:0.4rem;"
                  >
                    <span class="badge badge-blue" style="font-size:0.65rem;"
                      >Tindak Lanjut</span
                    >
                    <span style="color:var(--text-secondary);"
                      >{{ formatDate(entry.item.tanggal_tl) }} —
                      {{ entry.item.creator?.nama || '-' }}</span
                    >
                  </span>
                  <div style="display:flex; align-items:center; gap:0.4rem;">
                    <span
                      :class="`badge badge-${BADGE_COLOR[entry.item.status_penerimaan] || 'gray'}`"
                      style="font-size:0.68rem;"
                      >{{ entry.item.status_penerimaan }}</span
                    >
                    <button
                      v-if="canEdit"
                      class="btn-icon-sm"
                      title="Edit TL"
                      @click="openEditTL(rek, entry.item)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style="width:14px;height:14px;"
                      >
                        <path
                          d="M17.414 2.586a2 2 0 0 0-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 0 0 0-2.828Z"
                        />
                        <path
                          fill-rule="evenodd"
                          d="M2 6a2 2 0 0 1 2-2h4a1 1 0 0 1 0 2H4v10h10v-4a1 1 0 1 1 2 0v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      v-if="canEdit"
                      class="btn-icon-sm"
                      title="Hapus TL"
                      @click="confirmDeleteTL(entry.item)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style="width:14px;height:14px; color:#f87171;"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <p
                  style="font-size:0.8rem; color:var(--text-primary); margin:0.3rem 0;"
                >
                  {{ entry.item.uraian_tl }}
                </p>
                <div
                  v-if="entry.item.buktis?.length"
                  style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.4rem;"
                >
                  <div
                    v-for="bukti in entry.item.buktis"
                    :key="bukti.id"
                    class="bukti-chip"
                  >
                    <a :href="tlBuktiUrl(bukti)" target="_blank">
                      📎 {{ bukti.judul_bukti }}
                    </a>
                    <button
                      v-if="canEdit"
                      class="bukti-remove"
                      title="Hapus bukti"
                      @click="confirmDeleteBukti(bukti)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </template>

              <!-- Entri: Setoran TGR (read-only, backend belum ada edit/hapus) -->
              <template v-else>
                <div
                  style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;"
                >
                  <span
                    style="font-size:0.72rem; display:flex; align-items:center; gap:0.4rem;"
                  >
                    <span class="badge badge-purple" style="font-size:0.65rem;"
                      >Setoran TGR</span
                    >
                    <span style="color:var(--text-secondary);"
                      >{{ formatDate(entry.item.tanggal_setor) }} —
                      {{ entry.item.creator?.nama || '-' }}</span
                    >
                  </span>
                  <span
                    style="font-size:0.82rem; font-weight:700; color:#34d399;"
                    >{{ formatRupiah(entry.item.jumlah_setoran) }}</span
                  >
                </div>
                <p
                  v-if="entry.item.keterangan"
                  style="font-size:0.8rem; color:var(--text-primary); margin:0.3rem 0;"
                >
                  {{ entry.item.keterangan }}
                </p>
                <div style="margin-top:0.4rem;">
                  <button
                    class="bukti-chip"
                    style="border:none; cursor:pointer;"
                    @click="downloadSetoranBukti(entry.item)"
                  >
                    📎 Bukti Setoran
                  </button>
                  <a
                    v-if="entry.item.link_bukti"
                    :href="entry.item.link_bukti"
                    target="_blank"
                    class="bukti-chip"
                    style="margin-left:0.4rem;"
                  >
                    🔗 Link Bukti
                  </a>
                </div>
              </template>
            </div>
          </div>
          <p
            v-else
            style="font-size:0.78rem; color:var(--text-muted); margin-top:0.75rem;"
          >
            Belum ada tindak lanjut.
          </p>

          <button
            v-if="canEdit"
            class="btn-secondary"
            style="font-size:0.75rem; margin-top:0.75rem;"
            @click="openTambahTL(rek)"
          >
            + Tambah Tindak Lanjut
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Tambah / Edit TL (+ opsional setoran TGR sekaligus) -->
    <AppModal
      v-model="showTLModal"
      :title="editingTL ? 'Edit Tindak Lanjut' : 'Tambah Tindak Lanjut'"
      width="34rem"
    >
      <form
        style="display:flex; flex-direction:column; gap:1rem;"
        @submit.prevent="submitTL"
      >
        <div>
          <label class="input-label">Uraian Tindak Lanjut *</label>
          <textarea
            v-model="tlForm.uraian_tl"
            class="input-field"
            rows="3"
            required
          ></textarea>
        </div>
        <div>
          <label class="input-label">Tanggal TL *</label>
          <input
            v-model="tlForm.tanggal_tl"
            type="date"
            class="input-field"
            required
          />
        </div>
        <div>
          <label class="input-label">Status Penerimaan *</label>
          <select v-model="tlForm.status_penerimaan" class="select-field">
            <option v-for="s in STATUS_PENERIMAAN" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </div>
        <div>
          <label class="input-label"
            >Bukti TL (opsional, bisa lebih dari satu)</label
          >
          <AppDropzone
            v-model="buktiFile"
            v-model:link="buktiLink"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            hint="PDF/gambar/dokumen bukti tindak lanjut atau link"
          />
          <input
            v-model="buktiJudul"
            type="text"
            class="input-field"
            placeholder="Judul bukti"
            style="margin-top:0.5rem;"
          />
        </div>

        <!-- Opsional: sekaligus catat setoran TGR — cuma mode tambah & rekomendasi TGR -->
        <div
          v-if="!editingTL && activeRekomendasi?.adalah_tgr"
          style="border-top:1px solid var(--border-color); padding-top:1rem;"
        >
          <label
            style="display:flex; align-items:center; gap:0.5rem; font-size:0.82rem; color:var(--text-primary); cursor:pointer;"
          >
            <input v-model="catatSetoran" type="checkbox" />
            Sekaligus catat setoran TGR?
          </label>

          <div
            v-if="catatSetoran"
            style="display:flex; flex-direction:column; gap:1rem; margin-top:0.75rem; padding:0.875rem; border-radius:0.6rem; background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.2);"
          >
            <div>
              <label class="input-label">Jumlah Setoran (Rp) *</label>
              <input
                v-model.number="setoranForm.jumlah_setoran"
                type="number"
                min="0"
                class="input-field"
              />
            </div>
            <div>
              <label class="input-label">Tanggal Setor *</label>
              <input
                v-model="setoranForm.tanggal_setor"
                type="date"
                class="input-field"
              />
            </div>
            <div>
              <label class="input-label">Keterangan (opsional)</label>
              <input
                v-model="setoranForm.keterangan"
                type="text"
                class="input-field"
              />
            </div>
            <div>
              <label class="input-label">Bukti Setoran *</label>
              <AppDropzone
                v-model="setoranBuktiFile"
                v-model:link="setoranBuktiLink"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                hint="PDF/gambar bukti setor atau link"
              />
            </div>
          </div>
        </div>

        <div v-if="errorMsg" class="alert-danger">
          <span>{{ errorMsg }}</span>
        </div>
        <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
          <button
            type="button"
            class="btn-secondary"
            @click="showTLModal = false"
          >
            Batal
          </button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Override Status -->
    <AppModal
      v-model="showStatusModal"
      title="Override Status Manual"
      width="22rem"
    >
      <form
        style="display:flex; flex-direction:column; gap:1rem;"
        @submit.prevent="submitStatusOverride"
      >
        <div>
          <label class="input-label">Status</label>
          <select v-model="statusForm.status" class="select-field">
            <option v-for="s in STATUS_REKOMENDASI" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
          <p
            style="font-size:0.72rem; color:var(--text-muted); margin-top:0.35rem;"
          >
            Status ini akan dipakai apa adanya, tidak dihitung ulang otomatis
            dari data TL/setoran.
          </p>
        </div>
        <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
          <button
            type="button"
            class="btn-secondary"
            @click="showStatusModal = false"
          >
            Batal
          </button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            Simpan
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Confirm hapus TL -->
    <AppConfirm
      v-model="showConfirmTL"
      title="Hapus Tindak Lanjut"
      message="Yakin hapus tindak lanjut ini? Bukti yang terlampir tidak ikut terhapus."
      type="danger"
      :loading="submitting"
      @confirm="doDeleteTL"
      @cancel="showConfirmTL = false"
    />

    <!-- Confirm hapus bukti -->
    <AppConfirm
      v-model="showConfirmBukti"
      title="Hapus Bukti"
      :message="`Yakin hapus bukti '${deleteBuktiTarget?.judul_bukti}'? File akan terhapus permanen.`"
      type="danger"
      :loading="submitting"
      @confirm="doDeleteBukti"
      @cancel="showConfirmBukti = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTindakLanjutStore } from '@/stores/tindaklanjut'
import { useToast } from '@/composables/useToast'
import { useFileDownload } from '@/composables/useFileDownload'
import { dokumenService } from '@/services/dokumenService'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import AppDropzone from '@/components/common/AppDropzone.vue'
import { formatRupiah, formatDate } from '@/utils/format'
import { BADGE_COLOR, STATUS_PENERIMAAN, STATUS_REKOMENDASI } from '@/utils/constants'

const route = useRoute()
const auth = useAuthStore()
const tindaklanjut = useTindakLanjutStore()
const toast = useToast()
const { triggerDownload } = useFileDownload()

const fileBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''

const loading = ref(false)
const submitting = ref(false)
const errorMsg = ref('')
const penugasan = ref(null)
const setoranMap = ref({}) // { [rekomendasi_id]: SetoranTgr[] }

// Admin TL tidak bisa CRUD Penugasan/Dokumen, tapi bisa CRUD TL & Bukti TL —
// mirip backend canEditTindakLanjut (admin, admin_tl, superadmin).
const canEdit = computed(() => ['admin', 'admin_tl', 'superadmin'].includes(auth.user?.role))

const temuanList = computed(() => penugasan.value?.dokumens?.[0]?.temuans || [])

const loadData = async () => {
  loading.value = true
  const res = await tindaklanjut.fetchPenugasanDetail(route.params.id)
  penugasan.value = res
  loading.value = false

  // Muat riwayat setoran untuk tiap rekomendasi TGR secara paralel
  const tgrRekList = temuanList.value.flatMap(t => (t.rekomendasis || []).filter(r => r.adalah_tgr))
  await Promise.all(tgrRekList.map(async (rek) => {
    try {
      const res = await dokumenService.getSetoranByRekomendasi(rek.id)
      setoranMap.value[rek.id] = res.data.data || []
    } catch {
      setoranMap.value[rek.id] = []
    }
  }))
}

onMounted(loadData)

// Gabungkan Tindak Lanjut + Setoran TGR jadi 1 timeline, urut tanggal terbaru
const timelineFor = (rek) => {
  const tlItems = (rek.tindakLanjuts || []).map(tl => ({ type: 'tl', date: tl.tanggal_tl, item: tl }))
  const setoranItems = (setoranMap.value[rek.id] || []).map(s => ({ type: 'setoran', date: s.tanggal_setor, item: s }))
  return [...tlItems, ...setoranItems].sort((a, b) => new Date(b.date) - new Date(a.date))
}

const downloadSetoranBukti = (s) => {
  triggerDownload(dokumenService.downloadSetoran(s.id), `Setoran-TGR-${s.id}`)
}

// Bukti TL masih pakai link langsung (belum ada endpoint download khusus
// bukti TL di backend) — normalisasi backslash Windows ke forward slash
// supaya URL-nya valid.
const tlBuktiUrl = (bukti) => {
  if (bukti.link_bukti) return bukti.link_bukti
  const normalized = (bukti.file_path || '').split(String.fromCharCode(92)).join('/')
  return `${fileBaseUrl}/${normalized}`
}

// === Tambah / Edit TL (+ opsional setoran TGR) ===
const showTLModal = ref(false)
const activeRekomendasi = ref(null)
const editingTL = ref(null) // null = mode tambah, terisi = mode edit
const tlForm = ref({ uraian_tl: '', tanggal_tl: '', status_penerimaan: 'Belum Diterima' })
const buktiFile = ref(null)
const buktiLink = ref('')
const buktiJudul = ref('')

const catatSetoran = ref(false)
const setoranForm = ref({ jumlah_setoran: null, tanggal_setor: '', keterangan: '' })
const setoranBuktiFile = ref(null)
const setoranBuktiLink = ref('')

const resetSetoranForm = () => {
  catatSetoran.value = false
  setoranForm.value = { jumlah_setoran: null, tanggal_setor: '', keterangan: '' }
  setoranBuktiFile.value = null
  setoranBuktiLink.value = ''
}

const openTambahTL = (rek) => {
  activeRekomendasi.value = rek
  editingTL.value = null
  tlForm.value = { uraian_tl: '', tanggal_tl: '', status_penerimaan: 'Belum Diterima' }
  buktiFile.value = null
  buktiLink.value = ''
  buktiJudul.value = ''
  resetSetoranForm()
  errorMsg.value = ''
  showTLModal.value = true
}

const openEditTL = (rek, tl) => {
  activeRekomendasi.value = rek
  editingTL.value = tl
  tlForm.value = {
    uraian_tl: tl.uraian_tl,
    tanggal_tl: tl.tanggal_tl,
    status_penerimaan: tl.status_penerimaan
  }
  buktiFile.value = null
  buktiLink.value = ''
  buktiJudul.value = ''
  resetSetoranForm()
  errorMsg.value = ''
  showTLModal.value = true
}

const submitTL = async () => {
  submitting.value = true
  errorMsg.value = ''

  if (catatSetoran.value && (!setoranForm.value.jumlah_setoran || !setoranForm.value.tanggal_setor)) {
    errorMsg.value = 'Jumlah dan tanggal setoran wajib diisi kalau ingin sekaligus dicatat.'
    submitting.value = false
    return
  }
  if (catatSetoran.value && !setoranBuktiFile.value && !setoranBuktiLink.value) {
    errorMsg.value = 'Bukti setoran wajib diisi (file atau link).'
    submitting.value = false
    return
  }

  let tlId
  if (editingTL.value) {
    const res = await tindaklanjut.update(editingTL.value.id, {
      uraian_tl: tlForm.value.uraian_tl,
      tanggal_tl: tlForm.value.tanggal_tl,
      status_penerimaan: tlForm.value.status_penerimaan
    })
    if (!res.success) {
      errorMsg.value = res.message
      submitting.value = false
      return
    }
    tlId = editingTL.value.id
  } else {
    const res = await tindaklanjut.create({
      rekomendasi_id: activeRekomendasi.value.id,
      uraian_tl: tlForm.value.uraian_tl,
      tanggal_tl: tlForm.value.tanggal_tl,
      status_penerimaan: tlForm.value.status_penerimaan
    })
    if (!res.success) {
      errorMsg.value = res.message
      submitting.value = false
      return
    }
    tlId = res.data.id
  }

  // Upload bukti TL (opsional) langsung diattach ke TL
  if ((buktiFile.value || buktiLink.value) && buktiJudul.value) {
    await tindaklanjut.uploadBukti({
      judul_bukti: buktiJudul.value,
      file: buktiFile.value,
      link_bukti: buktiLink.value,
      tindak_lanjut_id: tlId
    })
  }

  // Sekaligus catat setoran TGR kalau diisi (cuma mode tambah)
  if (!editingTL.value && catatSetoran.value) {
    try {
      await dokumenService.tambahSetoranTgr(activeRekomendasi.value.id, {
        jumlah_setoran: setoranForm.value.jumlah_setoran,
        tanggal_setor: setoranForm.value.tanggal_setor,
        keterangan: setoranForm.value.keterangan,
        file: setoranBuktiFile.value,
        link_bukti: setoranBuktiLink.value
      })
    } catch (e) {
      toast.error('Tindak lanjut tersimpan, tapi setoran gagal: ' + (e.response?.data?.message || 'terjadi kesalahan'))
    }
  }

  toast.success(editingTL.value ? 'Tindak lanjut berhasil diupdate.' : 'Tindak lanjut berhasil ditambahkan.')
  showTLModal.value = false
  submitting.value = false
  await loadData()
}

// === Hapus TL ===
const showConfirmTL = ref(false)
const deleteTLTarget = ref(null)

const confirmDeleteTL = (tl) => {
  deleteTLTarget.value = tl
  showConfirmTL.value = true
}

const doDeleteTL = async () => {
  submitting.value = true
  const res = await tindaklanjut.remove(deleteTLTarget.value.id)
  submitting.value = false
  showConfirmTL.value = false
  if (!res.success) {
    toast.error(res.message)
    return
  }
  toast.success('Tindak lanjut berhasil dihapus.')
  await loadData()
}

// === Hapus Bukti TL ===
const showConfirmBukti = ref(false)
const deleteBuktiTarget = ref(null)

const confirmDeleteBukti = (bukti) => {
  deleteBuktiTarget.value = bukti
  showConfirmBukti.value = true
}

const doDeleteBukti = async () => {
  submitting.value = true
  const res = await tindaklanjut.removeBukti(deleteBuktiTarget.value.id)
  submitting.value = false
  showConfirmBukti.value = false
  if (!res.success) {
    toast.error(res.message)
    return
  }
  toast.success('Bukti berhasil dihapus.')
  await loadData()
}

// === Override Status Manual ===
const showStatusModal = ref(false)
const statusForm = ref({ status: 'Belum Ditindaklanjuti' })

const openStatusOverride = (rek) => {
  activeRekomendasi.value = rek
  statusForm.value = { status: rek.status }
  showStatusModal.value = true
}

const submitStatusOverride = async () => {
  submitting.value = true
  const res = await tindaklanjut.updateProgress(activeRekomendasi.value.id, {
    status: statusForm.value.status
  })
  submitting.value = false
  if (!res.success) {
    toast.error(res.message)
    return
  }
  toast.success('Status berhasil diupdate.')
  showStatusModal.value = false
  await loadData()
}
</script>

<style scoped>
.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem;
}

.rek-block {
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  margin-bottom: 0.75rem;
}

.rek-block:last-child {
  margin-bottom: 0;
}

.tgr-panel {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.6rem;
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.tgr-label {
  display: block;
  font-size: 0.68rem;
  color: var(--text-muted);
}

.tgr-value {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tl-item {
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  background: var(--bg-hover);
}

.btn-icon-sm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 0.4rem;
  background: transparent;
  cursor: pointer;
  color: var(--text-muted);
}

.btn-icon-sm:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.bukti-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem 0.2rem 0.5rem;
  border-radius: 0.4rem;
  background: rgba(59, 130, 246, 0.12);
}

.bukti-chip a {
  color: var(--accent);
  text-decoration: none;
}

.bukti-remove {
  border: none;
  background: transparent;
  color: #f87171;
  cursor: pointer;
  font-size: 0.7rem;
  line-height: 1;
  padding: 0 0.15rem;
}
</style>
