<template>
  <div class="glass-card" style="padding:0;">
    <div
      style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between;"
    >
      <h3
        style="font-size:0.875rem; font-weight:600; color:var(--text-primary); margin:0;"
      >
        Breakdown per Penugasan
      </h3>
      <span style="font-size:0.75rem; color:var(--text-muted);"
        >Tahun {{ tahun }}</span
      >
    </div>

    <div
      v-if="loading"
      style="padding:3rem; display:flex; justify-content:center;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="!items.length" class="empty-state" style="padding:2rem;">
      <p style="color:var(--text-secondary); font-size:0.85rem;">
        Belum ada data penugasan.
      </p>
    </div>

    <div v-else class="table-wrapper" style="border:none; border-radius:0;">
      <table class="table-base">
        <thead>
          <tr>
            <th>No</th>
            <th v-if="showKeirbanan">Keirbanan</th>
            <th>Nama Penugasan</th>
            <th>LHP</th>
            <th>Temuan</th>
            <th>Rekomendasi</th>
            <th>Status TL</th>
            <th>Bukti TL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in items" :key="item.penugasan_id">
            <td style="color:var(--text-muted); font-size:0.8rem;">
              {{ i + 1 }}
            </td>
            <td v-if="showKeirbanan">
              <span
                :class="`badge badge-${BADGE_COLOR[item.keirbanan] || 'gray'}`"
              >
                Irban {{ item.keirbanan }}
              </span>
            </td>
            <td>
              <RouterLink
                :to="`/penugasan/${item.penugasan_id}`"
                style="color:var(--accent); text-decoration:none; font-weight:500; font-size:0.82rem;"
              >
                {{ item.nama_penugasan }}
              </RouterLink>
            </td>
            <td>
              <span
                :class="`badge badge-${item.ada_lhp ? 'green' : 'gray'}`"
                style="font-size:0.7rem;"
              >
                {{ item.ada_lhp ? 'Ada' : 'Belum' }}
              </span>
            </td>
            <td style="font-size:0.82rem;">{{ item.jumlah_temuan }}</td>
            <td style="font-size:0.82rem;">{{ item.jumlah_rekomendasi }}</td>
            <td>
              <div style="display:flex; gap:0.3rem; flex-wrap:wrap;">
                <span
                  class="badge badge-green"
                  style="font-size:0.65rem;"
                  >{{ item.status_tindak_lanjut.selesai }}</span
                >
                <span
                  class="badge badge-yellow"
                  style="font-size:0.65rem;"
                  >{{ item.status_tindak_lanjut.dalam_proses }}</span
                >
                <span
                  class="badge badge-red"
                  style="font-size:0.65rem;"
                  >{{ item.status_tindak_lanjut.belum }}</span
                >
              </div>
            </td>
            <td style="font-size:0.82rem;">{{ item.jumlah_bukti_tl }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { BADGE_COLOR } from '@/utils/constants'

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  tahun: { type: [Number, String], default: '' },
  showKeirbanan: { type: Boolean, default: false }
})
</script>
