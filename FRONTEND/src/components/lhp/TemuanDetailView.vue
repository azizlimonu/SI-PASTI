<template>
  <div>
    <div
      v-if="loading"
      style="display:flex; justify-content:center; padding:3rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="temuan">
      <!-- Header -->
      <div class="page-header">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <button class="btn-icon" @click="router.back()">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              style="width:16px;height:16px;"
            >
              <path
                fill-rule="evenodd"
                d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <div>
            <h1 class="page-title">{{ temuan.judul_temuan }}</h1>
            <p class="page-subtitle">Detail Temuan & Tindak Lanjut</p>
          </div>
        </div>
      </div>

      <!-- Uraian Temuan -->
      <div class="glass-card" style="padding:1.25rem; margin-bottom:1.25rem;">
        <h3
          style="font-size:0.8rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin:0 0 0.75rem;"
        >
          Uraian Temuan
        </h3>
        <p
          style="font-size:0.875rem; color:var(--text-primary); line-height:1.7; margin:0; white-space:pre-wrap;"
        >
          {{ temuan.uraian_temuan }}
        </p>
      </div>

      <!-- Rekomendasi & TL -->
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <div v-for="(rek, i) in rekomendasis" :key="rek.id" class="glass-card">
          <!-- Rekomendasi Header -->
          <div
            style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color);"
          >
            <div
              style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem;"
            >
              <div style="flex:1;">
                <div
                  style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem; flex-wrap:wrap;"
                >
                  <span
                    style="font-size:0.75rem; font-weight:700; color:var(--accent); background:var(--accent-light); border-radius:0.375rem; padding:0.2rem 0.5rem;"
                  >
                    Rekomendasi {{ i + 1 }}
                  </span>
                  <span v-if="rek.adalah_tgr" class="badge badge-red">TGR</span>
                  <span
                    :class="`badge badge-${BADGE_COLOR[rek.status] || 'gray'}`"
                    >{{ rek.status }}</span
                  >
                  <span
                    v-if="rek.batas_waktu_tl && isLewatBatas(rek.batas_waktu_tl) && rek.status !== 'Selesai'"
                    class="badge badge-red"
                  >
                    ⚠ Terlambat {{ hariTerlambat(rek.batas_waktu_tl) }} hari
                  </span>
                </div>
                <p
                  style="font-size:0.875rem; color:var(--text-primary); margin:0 0 0.5rem; white-space:pre-wrap;"
                >
                  {{ rek.uraian_rekomendasi }}
                </p>
                <div style="display:flex; gap:1.25rem; flex-wrap:wrap;">
                  <span style="font-size:0.78rem; color:var(--text-muted);"
                    >Kepada:
                    <strong
                      style="color:var(--text-secondary);"
                      >{{ rek.ditujukan_kepada }}</strong
                    ></span
                  >
                  <span
                    v-if="rek.adalah_tgr"
                    style="font-size:0.78rem; color:#f87171;"
                    >Nilai:
                    <strong>{{ formatRupiah(rek.nilai_temuan) }}</strong></span
                  >
                  <span
                    v-if="rek.adalah_tgr"
                    style="font-size:0.78rem; color:#34d399;"
                    >Terlunasi:
                    <strong
                      >{{ formatRupiah(rek.nilai_terlunasi) }}</strong
                    ></span
                  >
                  <span
                    v-if="rek.batas_waktu_tl"
                    style="font-size:0.78rem; color:var(--text-muted);"
                    >Batas:
                    <strong>{{ formatDate(rek.batas_waktu_tl) }}</strong></span
                  >
                </div>
              </div>
              <button
                v-if="auth.isAdminTL"
                class="btn-primary"
                style="font-size:0.78rem; padding:0.375rem 0.75rem; flex-shrink:0;"
                @click="openTLForm(rek)"
              >
                + Tindak Lanjut
              </button>
            </div>
          </div>

          <!-- TL List -->
          <div style="padding:1rem 1.25rem;">
            <h4
              style="font-size:0.78rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin:0 0 0.75rem;"
            >
              Tindak Lanjut
            </h4>

            <div
              v-if="!tlMap[rek.id]?.length"
              style="text-align:center; padding:1rem; color:var(--text-muted); font-size:0.8rem; background:var(--bg-hover); border-radius:0.625rem;"
            >
              Belum ada tindak lanjut
            </div>

            <div
              v-else
              style="display:flex; flex-direction:column; gap:0.625rem;"
            >
              <div
                v-for="(tl, j) in tlMap[rek.id]"
                :key="tl.id"
                style="padding:0.875rem; border-radius:0.625rem; border:1px solid var(--border-color); background:var(--bg-surface);"
              >
                <div
                  style="display:flex; align-items:flex-start; justify-content:space-between; gap:0.75rem; margin-bottom:0.5rem;"
                >
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span style="font-size:0.72rem; color:var(--text-muted);"
                      >TL {{ j + 1 }}</span
                    >
                    <span
                      :class="`badge badge-${BADGE_COLOR[tl.status_penerimaan] || 'gray'}`"
                      >{{ tl.status_penerimaan }}</span
                    >
                    <span
                      style="font-size:0.72rem; color:var(--text-muted);"
                      >{{ formatDate(tl.tanggal_tl) }}</span
                    >
                  </div>
                </div>
                <p
                  style="font-size:0.82rem; color:var(--text-primary); margin:0 0 0.5rem; white-space:pre-wrap;"
                >
                  {{ tl.uraian_tl }}
                </p>

                <!-- Bukti TL -->
                <div
                  v-if="tl.buktis?.length"
                  style="display:flex; flex-wrap:wrap; gap:0.375rem; margin-top:0.5rem;"
                >
                  <a
                    v-for="bukti in tl.buktis"
                    :key="bukti.id"
                    :href="bukti.file_path ? `http://localhost:3000/${bukti.file_path}` : bukti.link_bukti"
                    target="_blank"
                    style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.25rem 0.625rem; border-radius:0.375rem; background:var(--accent-light); border:1px solid rgba(59,130,246,0.3); color:var(--accent); font-size:0.72rem; text-decoration:none;"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      style="width:12px;height:12px;"
                    >
                      <path
                        d="M3 3.5A1.5 1.5 0 0 1 4.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 13 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 12.5v-9Z"
                      />
                    </svg>
                    {{ bukti.judul_bukti }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal TL -->
    <AppModal v-model="showTLForm" title="Tambah Tindak Lanjut" width="38rem">
      <TLForm
        :rekomendasi="selectedRek"
        :loading="submitting"
        @submit="handleTLSubmit"
        @cancel="showTLForm = false"
      />
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useTindakLanjutStore } from '@/stores/tindaklanjut'
import { dokumenService } from '@/services/dokumenService'
import { tindakLanjutService } from '@/services/tindakLanjutService'
import AppModal from '@/components/common/AppModal.vue'
import TLForm from '@/components/tindaklanjut/TLForm.vue'
import { formatDate, formatRupiah } from '@/utils/format'
import { BADGE_COLOR } from '@/utils/constants'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const tlStore = useTindakLanjutStore()

const loading = ref(false)
const submitting = ref(false)
const temuan = ref(null)
const rekomendasis = ref([])
const tlMap = ref({})
const showTLForm = ref(false)
const selectedRek = ref(null)

const isLewatBatas = (tgl) => dayjs().isAfter(dayjs(tgl))
const hariTerlambat = (tgl) => Math.abs(dayjs().diff(dayjs(tgl), 'day'))

const openTLForm = (rek) => {
  selectedRek.value = rek
  showTLForm.value = true
}

const loadTL = async (rekId) => {
  try {
    const res = await tindakLanjutService.getByRekomendasi(rekId)
    tlMap.value[rekId] = res.data.data || []
  } catch {
    tlMap.value[rekId] = []
  }
}

const handleTLSubmit = async (data) => {
  submitting.value = true
  const result = await tlStore.create({ ...data, rekomendasi_id: selectedRek.value.id })
  submitting.value = false
  if (result.success) {
    toast.success('Tindak lanjut berhasil ditambahkan.')
    showTLForm.value = false
    await loadTL(selectedRek.value.id)
    // Reload rekomendasi untuk update status
    const res = await dokumenService.getRekomendasiByTemuan(route.params.id)
    rekomendasis.value = res.data.data || []
  } else {
    toast.error(result.message)
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // Ambil data temuan dari rekomendasi endpoint
    const rekRes = await dokumenService.getRekomendasiByTemuan(route.params.id)
    rekomendasis.value = rekRes.data.data || []

    // Set temuan dari rekomendasi pertama jika ada
    if (rekomendasis.value.length > 0) {
      temuan.value = rekomendasis.value[0].temuan || { judul_temuan: 'Detail Temuan', uraian_temuan: '' }
    } else {
      temuan.value = { judul_temuan: 'Detail Temuan', uraian_temuan: '' }
    }

    // Load TL untuk setiap rekomendasi
    for (const rek of rekomendasis.value) {
      await loadTL(rek.id)
    }
  } catch (e) {
    toast.error('Gagal memuat data temuan.')
  }
  loading.value = false
})
</script>
