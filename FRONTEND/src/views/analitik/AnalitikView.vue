<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Analitik Monitoring</h1>
        <p class="page-subtitle">{{ subjudul }}</p>
      </div>
    </div>

    <div
      class="glass-card"
      style="padding:0.875rem 1rem; margin-bottom:1rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;"
    >
      <select v-model="periode" class="select-field" style="width:190px;">
        <option value="aktif">Tahun {{ ui.tahunAktif }}</option>
        <option value="semua">Semua tahun</option>
      </select>
      <select v-model="sumber" class="select-field" style="width:160px;">
        <option value="">Semua Sumber</option>
        <option value="PKPT">PKPT</option>
        <option value="NON_PKPT">Non-PKPT</option>
      </select>
      <select
        v-if="auth.hasAllAccess"
        v-model="keirbanan"
        class="select-field"
        style="width:170px;"
      >
        <option value="">Semua Keirbanan</option>
        <option v-for="k in KEIRBANAN" :key="k" :value="k">
          Keirbanan {{ k }}
        </option>
      </select>
      <span v-else class="badge badge-blue"
        >Keirbanan {{ auth.keirbanan }}</span
      >
    </div>

    <div class="tabs-bar">
      <button
        v-for="t in tabs"
        :key="t.key"
        :class="['tab-btn', { active: aktif === t.key }]"
        @click="aktif = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <AnalitikRingkasan v-if="aktif === 'ringkasan'" :filter="filter" />
    <AnalitikPenugasan v-else-if="aktif === 'penugasan'" :filter="filter" />
    <AnalitikTemuan v-else-if="aktif === 'temuan'" :filter="filter" />
    <AnalitikTgr v-else-if="aktif === 'tgr'" :filter="filter" />
    <AnalitikKinerja v-else-if="aktif === 'kinerja'" :filter="filter" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { KEIRBANAN } from '@/utils/constants'
import AnalitikRingkasan from '@/components/analitik/AnalitikRingkasan.vue'
import AnalitikPenugasan from '@/components/analitik/AnalitikPenugasan.vue'
import AnalitikTemuan from '@/components/analitik/AnalitikTemuan.vue'
import AnalitikTgr from '@/components/analitik/AnalitikTgr.vue'
import AnalitikKinerja from '@/components/analitik/AnalitikKinerja.vue'

const auth = useAuthStore()
const ui = useUIStore()

const tabs = [
  { key: 'ringkasan', label: 'Ringkasan' },
  { key: 'penugasan', label: 'Penugasan' },
  { key: 'temuan', label: 'Temuan' },
  { key: 'tgr', label: 'TGR / Piutang' },
  { key: 'kinerja', label: 'Kinerja & Tren' }
]

const aktif = ref('ringkasan')
const periode = ref('aktif')
const sumber = ref('')
const keirbanan = ref('')

// Filter dikirim ke semua tab; admin/irban otomatis dibatasi backend ke keirbanannya sendiri
const filter = computed(() => ({
  tahun: periode.value === 'aktif' ? ui.tahunAktif : undefined,
  sumber: sumber.value || undefined,
  keirbanan: auth.hasAllAccess ? keirbanan.value || undefined : undefined
}))

const subjudul = computed(() => {
  const lingkup = auth.hasAllAccess
    ? keirbanan.value ? `Keirbanan ${keirbanan.value}` : 'Seluruh keirbanan'
    : `Keirbanan ${auth.keirbanan}`
  const waktu = periode.value === 'aktif' ? `Tahun ${ui.tahunAktif}` : 'Semua tahun'
  return `${lingkup} — ${waktu}`
})
</script>

<style scoped>
.tabs-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid var(--border-color);
  background: var(--bg-card, transparent);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: var(--text-primary);
  border-color: var(--accent);
}

.tab-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
</style>
