<template>
  <div>
    <div class="page-header">
      <RouterLink
        to="/sktjm"
        style="color:var(--text-muted); text-decoration:none; font-size:0.8rem; display:flex; align-items:center; gap:0.375rem; margin-bottom:0.5rem;"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          style="width:14px;height:14px;"
        >
          <path
            fill-rule="evenodd"
            d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
            clip-rule="evenodd"
          />
        </svg>
        Kembali ke SKTJM
      </RouterLink>
      <div>
        <h1 class="page-title">{{ pihak?.nama || 'Memuat...' }}</h1>
        <p class="page-subtitle">Profil &amp; Riwayat TGR</p>
      </div>
    </div>

    <div
      v-if="loading"
      style="display:flex; justify-content:center; padding:3rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="!pihak" class="glass-card">
      <div class="empty-state" style="padding:2rem;">
        <p style="color:var(--text-secondary);">Pihak tidak ditemukan.</p>
      </div>
    </div>

    <div v-else style="display:flex; flex-direction:column; gap:1rem;">
      <!-- Profil Pihak -->
      <div class="glass-card" style="padding:1.25rem;">
        <div
          style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem;"
        >
          <div style="display:flex; align-items:center; gap:0.625rem;">
            <span
              :class="`badge badge-${BADGE_COLOR[pihak.jenis_pihak] || 'gray'}`"
              >{{ pihak.jenis_pihak }}</span
            >
            <span :class="`badge badge-${sisaTgr > 0 ? 'red' : 'green'}`">
              {{ sisaTgr > 0 ? 'TIDAK BERSIH' : 'BERSIH' }}
            </span>
          </div>
        </div>
        <div class="profile-grid">
          <div>
            <span class="profile-label">NIP</span>
            <p class="profile-value">{{ pihak.nip || '-' }}</p>
          </div>
          <div>
            <span class="profile-label">NIK</span>
            <p class="profile-value">{{ pihak.nik || '-' }}</p>
          </div>
          <div>
            <span class="profile-label">Jabatan</span>
            <p class="profile-value">{{ pihak.jabatan || '-' }}</p>
          </div>
          <div>
            <span class="profile-label">Instansi/Perusahaan</span>
            <p class="profile-value">{{ pihak.instansi_perusahaan || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- Ringkasan TGR -->
      <div class="glass-card" style="padding:1.25rem;">
        <h3 class="card-title">Ringkasan TGR</h3>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          <div style="display:flex; justify-content:space-between;">
            <span style="font-size:0.78rem; color:var(--text-muted);"
              >Total Nilai TGR</span
            >
            <span
              style="font-size:0.82rem; font-weight:600;"
              >{{ formatRupiah(pihak.statistik.total_nilai_tgr) }}</span
            >
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="font-size:0.78rem; color:var(--text-muted);"
              >Terlunasi</span
            >
            <span
              style="font-size:0.82rem; font-weight:600; color:#34d399;"
              >{{ formatRupiah(pihak.statistik.total_terlunasi) }}</span
            >
          </div>
          <div class="progress-track">
            <div class="progress-bar" :style="{ width: tgrPersen + '%' }"></div>
          </div>
          <div
            style="display:flex; justify-content:space-between; padding:0.625rem; border-radius:0.625rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2);"
          >
            <span style="font-size:0.78rem; color:#f87171;">Sisa TGR</span>
            <span
              style="font-size:0.82rem; font-weight:700; color:#f87171;"
              >{{ formatRupiah(sisaTgr) }}</span
            >
          </div>
        </div>
      </div>

      <!-- Riwayat per Rekomendasi -->
      <div class="glass-card" style="padding:0;">
        <div
          style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color);"
        >
          <h3 class="card-title" style="margin:0;">
            Riwayat Temuan &amp; Tindak Lanjut
          </h3>
        </div>
        <div
          style="padding:1.25rem; display:flex; flex-direction:column; gap:0.875rem;"
        >
          <div
            v-for="r in pihak.rekomendasis"
            :key="r.id"
            style="padding:0.875rem; border-radius:0.625rem; border:1px solid var(--border-color); background:var(--bg-hover);"
          >
            <div
              style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.5rem;"
            >
              <p style="font-size:0.72rem; color:var(--text-muted); margin:0;">
                {{ r.temuan.dokumen.penugasan.nama_penugasan }} —
                {{ r.temuan.dokumen.penugasan.pkpt.tahun }} (Keirbanan
                {{ r.temuan.dokumen.penugasan.pkpt.keirbanan }})
              </p>
              <span
                :class="`badge badge-${r.adalah_tgr ? 'purple' : 'blue'}`"
                style="font-size:0.68rem;"
              >
                {{ r.adalah_tgr ? 'TGR' : 'Administratif' }}
              </span>
            </div>

            <p
              style="font-size:0.82rem; font-weight:600; color:var(--text-primary); margin:0 0 0.375rem;"
            >
              {{ r.temuan.judul_temuan }}
            </p>

            <p
              style="font-size:0.78rem; color:var(--text-secondary); margin:0 0 0.5rem;"
            >
              <strong>Rekomendasi:</strong> {{ r.uraian_rekomendasi }}
            </p>

            <div
              style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.625rem; flex-wrap:wrap;"
            >
              <span
                :class="`badge badge-${statusRekomendasiColor(r.status)}`"
                style="font-size:0.68rem;"
              >
                {{ r.status }}
              </span>
              <span
                v-if="r.adalah_tgr"
                style="font-size:0.72rem; color:var(--text-muted);"
              >
                Nilai: {{ formatRupiah(r.nilai_temuan) }} — Terlunasi:
                {{ formatRupiah(r.nilai_terlunasi) }}
              </span>
            </div>

            <div
              v-if="r.tindakLanjuts?.length"
              style="padding-left:0.75rem; border-left:2px solid var(--border-color); display:flex; flex-direction:column; gap:0.625rem;"
            >
              <div v-for="tl in r.tindakLanjuts" :key="tl.id">
                <p
                  style="font-size:0.78rem; color:var(--text-secondary); margin:0;"
                >
                  <strong>Tindak Lanjut:</strong> {{ tl.uraian_tl }}
                  <span
                    :class="`badge badge-${statusPenerimaanColor(tl.status_penerimaan)}`"
                    style="font-size:0.65rem; margin-left:0.25rem;"
                  >
                    {{ tl.status_penerimaan }}
                  </span>
                </p>
                <p
                  style="font-size:0.7rem; color:var(--text-muted); margin:0.125rem 0 0;"
                >
                  {{ formatDate(tl.tanggal_tl) }}
                </p>

                <div v-if="tl.buktis?.length" style="margin-top:0.375rem;">
                  <p
                    style="font-size:0.74rem; color:var(--text-secondary); margin:0 0 0.25rem;"
                  >
                    <strong>Bukti Tindak Lanjut:</strong>
                  </p>
                  <div style="display:flex; gap:0.375rem; flex-wrap:wrap;">
                    <a
                      v-for="b in tl.buktis"
                      :key="b.id"
                      :href="b.file_path ? `http://localhost:3000/${b.file_path}` : b.link_bukti"
                      target="_blank"
                      download
                      class="btn-secondary"
                      style="font-size:0.7rem; padding:0.2rem 0.5rem;"
                    >
                      {{ b.judul_bukti }}
                    </a>
                  </div>
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

          <p
            v-if="!pihak.rekomendasis?.length"
            style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:1rem 0;"
          >
            Belum ada riwayat rekomendasi.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { pihakService } from '@/services/pihakService'
import { formatDate, formatRupiah, statusRekomendasiColor, statusPenerimaanColor } from '@/utils/format'
import { BADGE_COLOR } from '@/utils/constants'

const route = useRoute()
const loading = ref(false)
const pihak = ref(null)

const sisaTgr = computed(() => pihak.value?.statistik?.sisa_tgr || 0)
const tgrPersen = computed(() => {
  const total = pihak.value?.statistik?.total_nilai_tgr || 0
  const lun = pihak.value?.statistik?.total_terlunasi || 0
  return total > 0 ? Math.round((lun / total) * 100) : 0
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await pihakService.getById(route.params.id)
    pihak.value = res.data.data
  } catch {
    pihak.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.card-title { font-size:0.875rem; font-weight:600; color:var(--text-primary); margin:0 0 0.75rem; }
.profile-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
.profile-label { font-size:0.72rem; color:var(--text-muted); }
.profile-value { font-size:0.85rem; color:var(--text-primary); font-weight:500; margin:0.125rem 0 0; }
.progress-track { height:6px; background:var(--bg-hover); border-radius:9999px; overflow:hidden; }
.progress-bar { height:100%; border-radius:9999px; background:linear-gradient(90deg,#059669,#34d399); transition:width .5s ease; }
@media(max-width:640px) { .profile-grid { grid-template-columns:1fr; } }
</style>
