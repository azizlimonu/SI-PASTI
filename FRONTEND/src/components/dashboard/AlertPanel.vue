<template>
  <div class="glass-card" style="padding:0;">
    <div
      style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between;"
    >
      <h3
        style="font-size:0.875rem; font-weight:600; color:var(--text-primary); margin:0;"
      >
        Alert &amp; Peringatan
      </h3>
    </div>

    <div
      style="padding:1.25rem; display:flex; flex-direction:column; gap:1.25rem;"
    >
      <!-- SPT belum ada LHP -->
      <div>
        <div
          style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.625rem;"
        >
          <p
            style="font-size:0.8rem; font-weight:600; color:var(--text-secondary); margin:0;"
          >
            SPT &gt;30 Hari Belum Ada LHP
          </p>
          <span class="badge badge-red">{{ alertSpt.length }}</span>
        </div>
        <div
          v-if="!alertSpt.length"
          style="font-size:0.78rem; color:var(--text-muted); padding:0.5rem 0;"
        >
          Tidak ada SPT yang terlambat.
        </div>
        <div v-else style="display:flex; flex-direction:column; gap:0.5rem;">
          <div
            v-for="item in alertSpt.slice(0, limit)"
            :key="item.penugasan_id"
            style="display:flex; justify-content:space-between; align-items:center; padding:0.625rem 0.75rem; border-radius:0.625rem; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15);"
          >
            <div style="min-width:0;">
              <p
                style="font-size:0.8rem; font-weight:500; color:var(--text-primary); margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
              >
                {{ item.nama_penugasan }}
              </p>
              <p
                style="font-size:0.7rem; color:var(--text-muted); margin:0.125rem 0 0;"
              >
                <span v-if="showKeirbanan"
                  >Keirbanan {{ item.keirbanan }} — </span
                >SPT No. {{ item.nomor_spt }}
              </p>
            </div>
            <span class="badge badge-red" style="flex-shrink:0;"
              >{{ item.hari_terlambat }} hari</span
            >
          </div>
        </div>
      </div>

      <!-- TL akan jatuh tempo (H-3) -->
      <div>
        <div
          style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.625rem;"
        >
          <p
            style="font-size:0.8rem; font-weight:600; color:var(--text-secondary); margin:0;"
          >
            Tindak Lanjut Akan Jatuh Tempo (H-3)
          </p>
          <span class="badge badge-yellow">{{ akanJatuhTempo.length }}</span>
        </div>
        <div
          v-if="!akanJatuhTempo.length"
          style="font-size:0.78rem; color:var(--text-muted); padding:0.5rem 0;"
        >
          Tidak ada tindak lanjut yang mendekati batas waktu.
        </div>
        <div v-else style="display:flex; flex-direction:column; gap:0.5rem;">
          <div
            v-for="item in akanJatuhTempo.slice(0, limit)"
            :key="item.rekomendasi_id"
            style="display:flex; justify-content:space-between; align-items:center; padding:0.625rem 0.75rem; border-radius:0.625rem; background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.15);"
          >
            <div style="min-width:0;">
              <p
                style="font-size:0.8rem; font-weight:500; color:var(--text-primary); margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
              >
                {{ item.ditujukan_kepada }}
              </p>
              <p
                style="font-size:0.7rem; color:var(--text-muted); margin:0.125rem 0 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
              >
                <span v-if="showKeirbanan"
                  >Keirbanan {{ item.keirbanan }} — </span
                >{{ item.penugasan }}
              </p>
            </div>
            <span class="badge badge-yellow" style="flex-shrink:0;"
              >H-{{ item.hari_tersisa }}</span
            >
          </div>
        </div>
      </div>

      <!-- TL sudah terlambat -->
      <div>
        <div
          style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.625rem;"
        >
          <p
            style="font-size:0.8rem; font-weight:600; color:var(--text-secondary); margin:0;"
          >
            Tindak Lanjut Sudah Terlambat
          </p>
          <span class="badge badge-red">{{ terlambat.length }}</span>
        </div>
        <div
          v-if="!terlambat.length"
          style="font-size:0.78rem; color:var(--text-muted); padding:0.5rem 0;"
        >
          Tidak ada tindak lanjut yang terlambat.
        </div>
        <div v-else style="display:flex; flex-direction:column; gap:0.5rem;">
          <div
            v-for="item in terlambat.slice(0, limit)"
            :key="item.rekomendasi_id"
            style="display:flex; justify-content:space-between; align-items:center; padding:0.625rem 0.75rem; border-radius:0.625rem; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15);"
          >
            <div style="min-width:0;">
              <p
                style="font-size:0.8rem; font-weight:500; color:var(--text-primary); margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
              >
                {{ item.ditujukan_kepada }}
              </p>
              <p
                style="font-size:0.7rem; color:var(--text-muted); margin:0.125rem 0 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
              >
                <span v-if="showKeirbanan"
                  >Keirbanan {{ item.keirbanan }} — </span
                >{{ item.penugasan }}
              </p>
            </div>
            <span class="badge badge-red" style="flex-shrink:0;"
              >{{ item.hari_terlambat }} hari</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  alertSpt: { type: Array, default: () => [] },
  akanJatuhTempo: { type: Array, default: () => [] },
  terlambat: { type: Array, default: () => [] },
  showKeirbanan: { type: Boolean, default: false },
  limit: { type: Number, default: 6 }
})
</script>
