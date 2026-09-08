<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tindak Lanjut</h1>
        <p class="page-subtitle">
          Penugasan sudah ada LHP, belum tuntas TL — {{ scopeLabel }} — Tahun
          {{ ui.tahunAktif }}
        </p>
      </div>
    </div>

    <!-- Tabs (khusus role ber-akses ALL: superadmin, inspektur, admin_tl) -->
    <div v-if="auth.hasAllAccess" class="tabs-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <span
          v-if="tab.key !== 'ALL'"
          class="tab-dot"
          :style="{ backgroundColor: keirbanHexMap[tab.key] }"
        ></span>
        {{ tab.label }}
      </button>
    </div>

    <div class="glass-card" style="padding:0.75rem 1rem; margin-bottom:1rem;">
      <input
        v-model="search"
        type="text"
        class="input-field"
        placeholder="Cari nama penugasan..."
        style="max-width:320px;"
        @input="debouncedSearch"
      />
    </div>

    <div
      v-if="loading"
      class="glass-card"
      style="padding:2rem; text-align:center;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div
      v-else-if="!penugasanList.length"
      class="glass-card empty-state"
      style="padding:2rem;"
    >
      <p style="font-size:0.9rem;">
        Tidak ada penugasan yang perlu tindak lanjut untuk tahun/keirbanan ini.
        🎉
      </p>
    </div>

    <div v-else class="glass-card table-wrapper">
      <table class="table-base">
        <thead>
          <tr>
            <th>Nama Penugasan</th>
            <th>Jenis</th>
            <th v-if="showKeirbananColumn">Keirbanan</th>
            <th>Belum TL</th>
            <th>Proses TL</th>
            <th>Selesai</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in penugasanList" :key="p.id">
            <td style="font-weight:500;">{{ p.nama_penugasan }}</td>
            <td style="font-size:0.78rem; color:var(--text-secondary);">
              {{ p.jenis_penugasan }}
            </td>
            <td v-if="showKeirbananColumn">
              <span
                :class="`badge badge-${BADGE_COLOR[p.pkpt?.keirbanan] || 'gray'}`"
                >{{ p.pkpt?.keirbanan }}</span
              >
            </td>
            <td>
              <span class="badge badge-red">{{ p.rekomendasi.belum }}</span>
            </td>
            <td>
              <span
                class="badge badge-yellow"
                >{{ p.rekomendasi.dalam_proses }}</span
              >
            </td>
            <td>
              <span class="badge badge-green">{{ p.rekomendasi.selesai }}</span>
            </td>
            <td>
              <RouterLink
                :to="`/tindak-lanjut/${p.id}`"
                class="btn-secondary"
                style="font-size:0.75rem; padding:0.35rem 0.75rem;"
              >
                Kelola TL →
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useTindakLanjutStore } from '@/stores/tindaklanjut'
import { KEIRBANAN, BADGE_COLOR } from '@/utils/constants'

const auth = useAuthStore()
const ui = useUIStore()
const tindaklanjut = useTindakLanjutStore()

const loading = ref(false)
const penugasanList = ref([])
const search = ref('')
const activeTab = ref('ALL')

const tabs = [
  { key: 'ALL', label: 'Total (Seluruh Keirbanan)' },
  ...KEIRBANAN.map((kb) => ({ key: kb, label: `Keirbanan ${kb}` }))
]

const keirbanHexMap = { I: '#3b82f6', II: '#10b981', III: '#f59e0b', IV: '#8b5cf6', V: '#ef4444' }

const showKeirbananColumn = computed(() => auth.hasAllAccess && activeTab.value === 'ALL')

const scopeLabel = computed(() => {
  if (!auth.hasAllAccess) return `Keirbanan ${auth.user?.keirbanan}`
  return activeTab.value === 'ALL' ? 'Seluruh Keirbanan' : `Keirbanan ${activeTab.value}`
})

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadData, 400)
}

const loadData = async () => {
  loading.value = true
  const params = { tahun: ui.tahunAktif }
  if (search.value) params.search = search.value
  if (auth.hasAllAccess && activeTab.value !== 'ALL') params.keirbanan = activeTab.value
  const res = await tindaklanjut.fetchPenugasanList(params)
  penugasanList.value = res
  loading.value = false
}

onMounted(loadData)
watch(() => ui.tahunAktif, loadData)
watch(activeTab, loadData)
</script>

<style scoped>
.tabs-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
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
  background: transparent;
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

.tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
