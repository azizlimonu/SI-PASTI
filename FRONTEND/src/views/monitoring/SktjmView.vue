<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">SKTJM</h1>
        <p class="page-subtitle">Cari Pihak dengan Riwayat TGR</p>
      </div>
    </div>

    <div class="glass-card" style="padding:1.25rem; margin-bottom:1rem;">
      <form @submit.prevent="handleSearch" style="display:flex; gap:0.75rem;">
        <input
          v-model="keyword"
          type="text"
          class="input-field"
          style="flex:1;"
          placeholder="Cari nama, NIP, NIK, atau instansi/perusahaan..."
        />
        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Mencari...' : 'Cari' }}
        </button>
      </form>
      <p
        style="font-size:0.75rem; color:var(--text-muted); margin:0.625rem 0 0;"
      >
        Pencarian mencakup seluruh tahun (tidak dibatasi tahun berjalan).
      </p>
    </div>

    <div v-if="!searched" class="glass-card">
      <div class="empty-state" style="padding:2.5rem;">
        <p style="color:var(--text-secondary);">
          Masukkan kata kunci lalu klik <strong>Cari</strong> untuk menampilkan
          pihak dengan riwayat TGR.
        </p>
      </div>
    </div>

    <div
      v-else-if="loading"
      style="display:flex; justify-content:center; padding:2rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="!list.length" class="glass-card">
      <div class="empty-state" style="padding:2rem;">
        <p style="color:var(--text-secondary);">
          Tidak ditemukan pihak dengan riwayat TGR untuk kata kunci "{{ lastKeyword
          }}".
        </p>
      </div>
    </div>

    <div v-else style="display:flex; flex-direction:column; gap:0.75rem;">
      <RouterLink
        v-for="p in list"
        :key="p.id"
        :to="`/pihak/${p.id}`"
        class="glass-card"
        style="padding:1rem; display:block; text-decoration:none; transition:border-color .15s;"
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
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { pihakService } from '@/services/pihakService'
import { formatRupiah } from '@/utils/format'
import { BADGE_COLOR } from '@/utils/constants'

const keyword = ref('')
const lastKeyword = ref('')
const loading = ref(false)
const searched = ref(false)
const list = ref([])

const sisaTgr = (p) => (p.total_nilai_tgr || 0) - (p.total_terlunasi || 0)

const handleSearch = async () => {
  if (!keyword.value.trim()) return
  loading.value = true
  searched.value = true
  lastKeyword.value = keyword.value
  try {
    const res = await pihakService.getRiwayatTGR(keyword.value)
    list.value = res.data.data || []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}
</script>
