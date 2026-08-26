<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">SKTJM</h1>
        <p class="page-subtitle">Daftar Pihak dengan Riwayat TGR</p>
      </div>
    </div>

    <div
      class="glass-card"
      style="padding:1rem; margin-bottom:1rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;"
    >
      <input
        v-model="search"
        type="text"
        class="input-field"
        style="flex:1; min-width:200px;"
        placeholder="Cari nama, NIP, NIK, atau instansi..."
      />
      <select v-model="filterJenis" class="select-field" style="width:180px;">
        <option value="">Semua Jenis Pihak</option>
        <option v-for="j in JENIS_PIHAK" :key="j" :value="j">{{ j }}</option>
      </select>
      <select v-model="filterStatus" class="select-field" style="width:170px;">
        <option value="">Semua Status</option>
        <option value="BERSIH">Bersih</option>
        <option value="TIDAK BERSIH">Tidak Bersih</option>
      </select>
    </div>

    <div
      v-if="loading"
      style="display:flex; justify-content:center; padding:2rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="!filteredList.length" class="glass-card">
      <div class="empty-state" style="padding:2rem;">
        <p style="color:var(--text-secondary);">
          Belum ada pihak dengan riwayat TGR.
        </p>
      </div>
    </div>

    <div v-else style="display:flex; flex-direction:column; gap:0.75rem;">
      <div
        v-for="p in filteredList"
        :key="p.id"
        class="glass-card"
        style="padding:1rem;"
      >
        <div
          style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.75rem; flex-wrap:wrap;"
        >
          <div>
            <div
              style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;"
            >
              <p
                style="font-size:0.9rem; font-weight:600; color:var(--text-primary); margin:0;"
              >
                {{ p.nama }}
              </p>
              <span
                :class="`badge badge-${BADGE_COLOR[p.jenis_pihak] || 'gray'}`"
                style="font-size:0.68rem;"
              >
                {{ p.jenis_pihak }}
              </span>
            </div>
            <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">
              {{ p.nip ? `NIP: ${p.nip}` : (p.nik ? `NIK: ${p.nik}` : '-') }}
              <span v-if="p.jabatan"> — {{ p.jabatan }}</span>
              <span v-if="p.instansi_perusahaan">
                — {{ p.instansi_perusahaan }}</span
              >
            </p>
          </div>
          <div style="text-align:right;">
            <span :class="`badge badge-${sisaTgr(p) > 0 ? 'red' : 'green'}`">
              {{ sisaTgr(p) > 0 ? 'TIDAK BERSIH' : 'BERSIH' }}
            </span>
            <p
              style="font-size:0.72rem; color:var(--text-muted); margin:0.25rem 0 0;"
            >
              Sisa TGR: {{ formatRupiah(sisaTgr(p)) }}
            </p>
          </div>
        </div>

        <button
          class="btn-secondary"
          style="font-size:0.75rem; padding:0.3rem 0.75rem; margin-top:0.75rem;"
          @click="toggleExpand(p.id)"
        >
          {{ expanded[p.id] ? 'Sembunyikan Riwayat' : 'Lihat Riwayat' }}
          ({{ p.rekomendasis.length }})
        </button>

        <div
          v-if="expanded[p.id]"
          style="margin-top:0.75rem; display:flex; flex-direction:column; gap:0.625rem;"
        >
          <div
            v-for="r in p.rekomendasis"
            :key="r.id"
            style="padding:0.75rem; border-radius:0.625rem; border:1px solid var(--border-color); background:var(--bg-hover);"
          >
            <p
              style="font-size:0.72rem; color:var(--text-muted); margin:0 0 0.25rem;"
            >
              {{ r.temuan.dokumen.penugasan.nama_penugasan }} —
              {{ r.temuan.dokumen.penugasan.pkpt.tahun }} (Keirbanan
              {{ r.temuan.dokumen.penugasan.pkpt.keirbanan }})
            </p>
            <p
              style="font-size:0.8rem; font-weight:600; color:var(--text-primary); margin:0 0 0.25rem;"
            >
              {{ r.temuan.judul_temuan }}
            </p>
            <p
              style="font-size:0.78rem; color:var(--text-secondary); margin:0 0 0.5rem;"
            >
              {{ r.uraian_rekomendasi }}
            </p>
            <div
              style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem;"
            >
              <span
                :class="`badge badge-${statusRekomendasiColor(r.status)}`"
                style="font-size:0.68rem;"
              >
                {{ r.status }}
              </span>
              <span style="font-size:0.72rem; color:var(--text-muted);">
                Nilai: {{ formatRupiah(r.nilai_temuan) }} — Terlunasi:
                {{ formatRupiah(r.nilai_terlunasi) }}
              </span>
            </div>

            <div
              v-if="r.tindakLanjuts?.length"
              style="padding-left:0.75rem; border-left:2px solid var(--border-color);"
            >
              <p
                style="font-size:0.72rem; font-weight:600; color:var(--text-secondary); margin:0 0 0.375rem;"
              >
                Tindak Lanjut:
              </p>
              <div
                v-for="tl in r.tindakLanjuts"
                :key="tl.id"
                style="margin-bottom:0.5rem;"
              >
                <p
                  style="font-size:0.75rem; color:var(--text-secondary); margin:0;"
                >
                  {{ formatDate(tl.tanggal_tl) }} — {{ tl.uraian_tl }}
                  <span
                    :class="`badge badge-${statusPenerimaanColor(tl.status_penerimaan)}`"
                    style="font-size:0.65rem;"
                  >
                    {{ tl.status_penerimaan }}
                  </span>
                </p>
                <div
                  v-if="tl.buktis?.length"
                  style="display:flex; gap:0.375rem; flex-wrap:wrap; margin-top:0.25rem;"
                >
                  <a
                    v-for="b in tl.buktis"
                    :key="b.id"
                    :href="b.file_path ? `http://localhost:3000/${b.file_path}` : b.link_bukti"
                    target="_blank"
                    class="btn-secondary"
                    style="font-size:0.7rem; padding:0.2rem 0.5rem;"
                  >
                    {{ b.judul_bukti }}
                  </a>
                </div>
              </div>
            </div>
            <p
              v-else
              style="font-size:0.72rem; color:var(--text-muted); margin:0;"
            >
              Belum ada tindak lanjut.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { pihakService } from '@/services/pihakService'
import { formatDate, formatRupiah, statusRekomendasiColor, statusPenerimaanColor } from '@/utils/format'
import { JENIS_PIHAK, BADGE_COLOR } from '@/utils/constants'

const loading = ref(false)
const list = ref([])
const search = ref('')
const filterJenis = ref('')
const filterStatus = ref('')
const expanded = ref({})

const sisaTgr = (p) => (p.total_nilai_tgr || 0) - (p.total_terlunasi || 0)

const filteredList = computed(() => {
  return list.value.filter(p => {
    if (filterJenis.value && p.jenis_pihak !== filterJenis.value) return false
    if (filterStatus.value) {
      const status = sisaTgr(p) > 0 ? 'TIDAK BERSIH' : 'BERSIH'
      if (status !== filterStatus.value) return false
    }
    if (search.value.trim()) {
      const q = search.value.toLowerCase()
      const match = [p.nama, p.nip, p.nik, p.instansi_perusahaan]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(q))
      if (!match) return false
    }
    return true
  })
})

const toggleExpand = (id) => {
  expanded.value[id] = !expanded.value[id]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await pihakService.getRiwayatTGR()
    list.value = res.data.data || []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
