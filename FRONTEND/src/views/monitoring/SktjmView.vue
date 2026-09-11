<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">SKTJM</h1>
        <p class="page-subtitle">
          Cek Riwayat Temuan &amp; Tindak Lanjut Pihak
        </p>
      </div>
    </div>

    <div
      class="glass-card no-print"
      style="padding:1.25rem; margin-bottom:1rem;"
    >
      <form @submit.prevent="handleSearch" style="display:flex; gap:0.75rem;">
        <input
          v-model="keyword"
          type="text"
          class="input-field"
          style="flex:1;"
          placeholder="Cari nama, NIP, atau NIK..."
        />
        <button
          type="submit"
          class="btn-primary"
          :disabled="pihak.loadingSktjm"
        >
          <span v-if="pihak.loadingSktjm" class="loading-spinner"></span>
          {{ pihak.loadingSktjm ? 'Mencari...' : 'Cek' }}
        </button>
      </form>
    </div>

    <div v-if="!searched" class="glass-card">
      <div class="empty-state" style="padding:2.5rem;">
        <p style="color:var(--text-secondary);">
          Masukkan nama, NIP, atau NIK, lalu klik <strong>Cek</strong> untuk
          menampilkan status SKTJM.
        </p>
      </div>
    </div>

    <div
      v-else-if="pihak.loadingSktjm"
      style="display:flex; justify-content:center; padding:2rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="notFound" class="glass-card">
      <div class="empty-state" style="padding:2rem;">
        <p style="color:var(--text-secondary);">
          Pihak tidak ditemukan untuk kata kunci "{{ lastKeyword }}".
        </p>
      </div>
    </div>

    <!-- Lebih dari 1 kandidat cocok — user pilih dulu -->
    <div
      v-else-if="pihak.sktjmCandidates.length"
      class="glass-card"
      style="padding:1.25rem;"
    >
      <p
        style="font-size:0.82rem; color:var(--text-secondary); margin:0 0 1rem;"
      >
        Ditemukan {{ pihak.sktjmCandidates.length }} pihak yang cocok dengan "{{ lastKeyword
        }}". Pilih salah satu:
      </p>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        <button
          v-for="c in pihak.sktjmCandidates"
          :key="c.id"
          class="candidate-item"
          @click="pilihKandidat(c)"
        >
          <div style="text-align:left;">
            <p
              style="font-size:0.85rem; font-weight:600; color:var(--text-primary); margin:0;"
            >
              {{ c.nama }}
            </p>
            <p
              style="font-size:0.75rem; color:var(--text-muted); margin:0.15rem 0 0;"
            >
              {{ c.nip ? `NIP: ${c.nip}` : (c.nik ? `NIK: ${c.nik}` : '') }}
              <span v-if="c.jabatan"> — {{ c.jabatan }}</span>
              <span v-if="c.instansi_perusahaan">
                — {{ c.instansi_perusahaan }}</span
              >
            </p>
          </div>
          <span
            :class="`badge badge-${BADGE_COLOR[c.jenis_pihak] || 'gray'}`"
            style="font-size:0.68rem;"
            >{{ c.jenis_pihak }}</span
          >
        </button>
      </div>
    </div>

    <div
      v-else-if="result"
      style="display:flex; flex-direction:column; gap:1rem;"
    >
      <!-- Badge besar + info pihak -->
      <div class="glass-card" style="padding:1.5rem; text-align:center;">
        <p
          style="font-size:0.85rem; color:var(--text-muted); margin:0 0 0.25rem;"
        >
          {{ result.pihak.nama }}
        </p>
        <p style="font-size:0.75rem; color:var(--text-muted); margin:0 0 1rem;">
          {{ result.pihak.nip ? `NIP: ${result.pihak.nip}` : (result.pihak.nik ? `NIK: ${result.pihak.nik}` : '') }}
          <span v-if="result.pihak.jabatan"> — {{ result.pihak.jabatan }}</span>
        </p>
        <span
          :class="`status-badge status-${result.status_sktjm === 'BERSIH' ? 'bersih' : 'tidak-bersih'}`"
        >
          {{ result.status_sktjm }}
        </span>
        <p
          style="font-size:0.85rem; color:var(--text-secondary); margin:1rem auto 0; max-width:32rem;"
        >
          {{ result.kesimpulan }}
        </p>
        <button
          class="btn-secondary no-print"
          style="margin-top:1.25rem; font-size:0.78rem;"
          @click="doPrint"
        >
          🖨️ Print
        </button>
      </div>

      <!-- Ringkasan -->
      <div class="ringkasan-grid">
        <div class="glass-card ringkasan-item">
          <span
            class="ringkasan-value"
            >{{ result.ringkasan.total_rekomendasi }}</span
          >
          <span class="ringkasan-label">Total Rekomendasi</span>
        </div>
        <div class="glass-card ringkasan-item">
          <span
            class="ringkasan-value"
            style="color:#a78bfa;"
            >{{ result.ringkasan.temuan_tgr_aktif }}</span
          >
          <span class="ringkasan-label">TGR Aktif</span>
        </div>
        <div class="glass-card ringkasan-item">
          <span
            class="ringkasan-value"
            style="color:#60a5fa;"
            >{{ result.ringkasan.temuan_administratif_aktif }}</span
          >
          <span class="ringkasan-label">Administratif Aktif</span>
        </div>
        <div class="glass-card ringkasan-item">
          <span
            class="ringkasan-value"
            style="color:#34d399;"
            >{{ result.ringkasan.temuan_selesai }}</span
          >
          <span class="ringkasan-label">Sudah Selesai</span>
        </div>
      </div>

      <!-- Temuan TGR Aktif -->
      <div
        v-if="result.temuan_aktif.tgr.length"
        class="glass-card"
        style="padding:0;"
      >
        <div
          style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color);"
        >
          <h3 class="card-title" style="margin:0;">Temuan TGR Aktif</h3>
        </div>
        <div class="table-wrapper" style="border:none; border-radius:0;">
          <table class="table-base">
            <thead>
              <tr>
                <th>Penugasan</th>
                <th>Tahun</th>
                <th>Keirbanan</th>
                <th>Uraian Rekomendasi</th>
                <th>Nilai</th>
                <th>Sisa</th>
                <th>Batas Waktu</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in result.temuan_aktif.tgr" :key="t.rekomendasi_id">
                <td style="font-size:0.78rem;">{{ t.penugasan }}</td>
                <td style="font-size:0.78rem;">{{ t.tahun_pkpt }}</td>
                <td>
                  <span
                    :class="`badge badge-${BADGE_COLOR[t.keirbanan] || 'gray'}`"
                    >{{ t.keirbanan }}</span
                  >
                </td>
                <td style="font-size:0.78rem;">{{ t.uraian_rekomendasi }}</td>
                <td style="font-size:0.78rem;">
                  {{ formatRupiah(t.nilai_temuan) }}
                </td>
                <td style="font-size:0.78rem; color:#f87171; font-weight:600;">
                  {{ formatRupiah(t.sisa) }}
                </td>
                <td style="font-size:0.78rem;">
                  {{ t.batas_waktu_tl ? formatDate(t.batas_waktu_tl) : '-' }}
                </td>
                <td>
                  <span
                    :class="`badge badge-${statusRekomendasiColor(t.status)}`"
                    >{{ t.status }}</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Temuan Administratif Aktif -->
      <div
        v-if="result.temuan_aktif.administratif.length"
        class="glass-card"
        style="padding:0;"
      >
        <div
          style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color);"
        >
          <h3 class="card-title" style="margin:0;">
            Temuan Administratif Aktif
          </h3>
        </div>
        <div class="table-wrapper" style="border:none; border-radius:0;">
          <table class="table-base">
            <thead>
              <tr>
                <th>Penugasan</th>
                <th>Tahun</th>
                <th>Keirbanan</th>
                <th>Uraian Rekomendasi</th>
                <th>Batas Waktu</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="t in result.temuan_aktif.administratif"
                :key="t.rekomendasi_id"
              >
                <td style="font-size:0.78rem;">{{ t.penugasan }}</td>
                <td style="font-size:0.78rem;">{{ t.tahun_pkpt }}</td>
                <td>
                  <span
                    :class="`badge badge-${BADGE_COLOR[t.keirbanan] || 'gray'}`"
                    >{{ t.keirbanan }}</span
                  >
                </td>
                <td style="font-size:0.78rem;">{{ t.uraian_rekomendasi }}</td>
                <td style="font-size:0.78rem;">
                  {{ t.batas_waktu_tl ? formatDate(t.batas_waktu_tl) : '-' }}
                </td>
                <td>
                  <span
                    :class="`badge badge-${statusRekomendasiColor(t.status)}`"
                    >{{ t.status }}</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Riwayat Selesai -->
      <div
        v-if="result.temuan_selesai.length"
        class="glass-card"
        style="padding:0;"
      >
        <div
          style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color);"
        >
          <h3 class="card-title" style="margin:0;">Riwayat Temuan Selesai</h3>
        </div>
        <div class="table-wrapper" style="border:none; border-radius:0;">
          <table class="table-base">
            <thead>
              <tr>
                <th>Penugasan</th>
                <th>Tahun</th>
                <th>Keirbanan</th>
                <th>Uraian Rekomendasi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in result.temuan_selesai" :key="t.rekomendasi_id">
                <td style="font-size:0.78rem;">{{ t.penugasan }}</td>
                <td style="font-size:0.78rem;">{{ t.tahun_pkpt }}</td>
                <td>
                  <span
                    :class="`badge badge-${BADGE_COLOR[t.keirbanan] || 'gray'}`"
                    >{{ t.keirbanan }}</span
                  >
                </td>
                <td style="font-size:0.78rem;">{{ t.uraian_rekomendasi }}</td>
                <td>
                  <span class="badge badge-green">{{ t.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePihakStore } from '@/stores/pihak'
import { formatDate, formatRupiah, statusRekomendasiColor } from '@/utils/format'
import { BADGE_COLOR } from '@/utils/constants'

const route = useRoute()
const pihak = usePihakStore()

const keyword = ref('')
const lastKeyword = ref('')
const searched = ref(false)

const result = computed(() => pihak.sktjmResult)
const notFound = computed(() =>
  searched.value && !pihak.loadingSktjm && !result.value && !pihak.sktjmCandidates.length
)

const handleSearch = async () => {
  if (!keyword.value.trim()) return
  searched.value = true
  lastKeyword.value = keyword.value
  await pihak.cariSktjm(keyword.value.trim())
}

// Dibuka lewat link "Cek SKTJM" dari halaman Pihak (?pihak_id=X di URL)
// -> langsung tampilkan detail, tidak perlu cari manual lagi.
onMounted(async () => {
  if (route.query.pihak_id) {
    searched.value = true
    lastKeyword.value = ''
    await pihak.cekSktjm({ pihak_id: route.query.pihak_id })
  }
})

const pilihKandidat = async (c) => {
  await pihak.cekSktjm({ pihak_id: c.id })
}

const doPrint = () => window.print()
</script>

<style scoped>
.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.status-bersih {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-tidak-bersih {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.ringkasan-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.ringkasan-item {
  padding: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ringkasan-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.ringkasan-label {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.candidate-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease;
}

.candidate-item:hover {
  border-color: var(--accent);
}

@media (max-width: 768px) {
  .ringkasan-grid { grid-template-columns: repeat(2, 1fr); }
}

@media print {
  .no-print { display: none !important; }
}
</style>
