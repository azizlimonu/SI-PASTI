<template>
  <div>
    <div
      v-if="loading"
      style="display:flex; justify-content:center; padding:3rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="data">
      <!-- Header -->
      <div class="page-header">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <RouterLink
            to="/penugasan"
            style="color:var(--text-muted); text-decoration:none;"
          >
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
          </RouterLink>
          <div>
            <h1 class="page-title">{{ data.nama_penugasan }}</h1>
            <p class="page-subtitle">
              {{ data.jenis_penugasan }} — {{ data.pkpt?.tahun }} Keirbanan
              {{ data.pkpt?.keirbanan }}
            </p>
          </div>
        </div>
        <span
          :class="`badge badge-${BADGE_COLOR[data.status] || 'gray'}`"
          style="font-size:0.8rem; padding:0.35rem 0.875rem;"
        >
          {{ data.status }}
        </span>
      </div>

      <!-- Tabs -->
      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </div>

      <!-- Tab: SPT & Tim -->
      <div v-if="activeTab === 'spt'">
        <div
          v-if="!sptData"
          class="glass-card"
          style="padding:2rem; text-align:center;"
        >
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                style="width:24px;height:24px;"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm2 3a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm1 3a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H7Zm-1 5a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <p style="font-weight:500; color:var(--text-secondary);">
              SPT belum dibuat
            </p>
            <button
              v-if="auth.isAdmin"
              class="btn-primary"
              style="margin-top:0.5rem;"
              @click="showSptForm = true"
            >
              Buat SPT
            </button>
          </div>
        </div>

        <div v-else class="glass-card" style="padding:1.25rem;">
          <!-- SPT Info -->
          <div
            style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;"
          >
            <h3
              style="font-size:0.9rem; font-weight:600; color:var(--text-primary); margin:0;"
            >
              Detail SPT
            </h3>
            <button
              v-if="auth.isAdmin"
              class="btn-secondary"
              style="font-size:0.8rem; padding:0.375rem 0.75rem;"
              @click="showSptForm = true"
            >
              Edit SPT
            </button>
          </div>

          <div
            style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.25rem;"
          >
            <div>
              <p class="info-label">Nomor SPT</p>
              <p class="info-value">{{ sptData.nomor_spt }}</p>
            </div>
            <div>
              <p class="info-label">Jenis Kegiatan</p>
              <p class="info-value">
                {{ sptData.jenis_kegiatan }}
                <span
                  v-if="sptData.jenis_kegiatan === 'Lainnya' && sptData.jenis_kegiatan_lainnya"
                >
                  — {{ sptData.jenis_kegiatan_lainnya }}
                </span>
              </p>
            </div>
            <div>
              <p class="info-label">Uraian Kegiatan</p>
              <p class="info-value">{{ sptData.uraian_kegiatan }}</p>
            </div>
            <div>
              <p class="info-label">Jumlah Hari</p>
              <p class="info-value">{{ sptData.jumlah_hari }} hari</p>
            </div>
            <div>
              <p class="info-label">Tanggal Mulai</p>
              <p class="info-value">{{ formatDate(sptData.tanggal_mulai) }}</p>
            </div>
            <div>
              <p class="info-label">Tanggal Selesai</p>
              <p class="info-value">
                {{ formatDate(sptData.tanggal_selesai) }}
              </p>
            </div>
          </div>

          <!-- File/Link SPT -->
          <div
            v-if="sptData.file_spt || sptData.link_spt"
            style="display:flex; gap:0.5rem; margin-bottom:1.25rem;"
          >
            <a
              v-if="sptData.file_spt"
              :href="`http://localhost:3000/${sptData.file_spt}`"
              target="_blank"
              class="btn-secondary"
              style="font-size:0.8rem; padding:0.375rem 0.75rem;"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                style="width:14px;height:14px;"
              >
                <path
                  d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z"
                />
                <path
                  d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z"
                />
              </svg>
              Download File SPT
            </a>
            <a
              v-if="sptData.link_spt"
              :href="sptData.link_spt"
              target="_blank"
              class="btn-secondary"
              style="font-size:0.8rem; padding:0.375rem 0.75rem;"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                style="width:14px;height:14px;"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z"
                  clip-rule="evenodd"
                />
                <path
                  fill-rule="evenodd"
                  d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z"
                  clip-rule="evenodd"
                />
              </svg>
              Buka Link SPT
            </a>
          </div>

          <!-- Tim -->
          <div>
            <div
              style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;"
            >
              <h4
                style="font-size:0.85rem; font-weight:600; color:var(--text-primary); margin:0;"
              >
                Tim Penugasan
              </h4>
              <button
                v-if="auth.isAdmin"
                class="btn-secondary"
                style="font-size:0.78rem; padding:0.3rem 0.625rem;"
                @click="showTimForm = true"
              >
                + Tambah Anggota
              </button>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <div
                v-for="tim in sptData.tims"
                :key="tim.id"
                style="display:flex; align-items:center; justify-content:space-between; padding:0.625rem 0.875rem; border-radius:0.625rem; background:var(--bg-hover);"
              >
                <div style="display:flex; align-items:center; gap:0.625rem;">
                  <div
                    style="width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--accent),#60a5fa); display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:700; color:white; flex-shrink:0;"
                  >
                    {{ tim.nama?.charAt(0)?.toUpperCase() }}
                  </div>
                  <div>
                    <p
                      style="font-size:0.82rem; font-weight:500; color:var(--text-primary); margin:0;"
                    >
                      {{ tim.nama }}
                    </p>
                    <p
                      style="font-size:0.72rem; color:var(--text-muted); margin:0;"
                    >
                      {{ tim.nip }}
                    </p>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span
                    :class="`badge badge-${jabatanColor(tim.jabatan_tim)}`"
                    >{{ tim.jabatan_tim }}</span
                  >
                  <button
                    v-if="auth.isAdmin"
                    class="btn-icon"
                    @click="hapusTim(tim.id)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      style="width:14px;height:14px;color:#f87171;"
                    >
                      <path
                        d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L6.94 8l-1.72 1.72a.75.75 0 1 0 1.06 1.06L8 9.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L9.06 8l1.72-1.72a.75.75 0 0 0-1.06-1.06L8 6.94 6.28 5.22Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                v-if="!sptData.tims?.length"
                style="text-align:center; padding:1rem; color:var(--text-muted); font-size:0.8rem;"
              >
                Belum ada anggota tim
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Dokumen -->
      <div v-if="activeTab === 'dokumen'">
        <div
          style="display:flex; justify-content:flex-end; margin-bottom:1rem;"
        >
          <button
            v-if="auth.isAdmin"
            class="btn-primary"
            @click="showDokumenForm = true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              style="width:16px;height:16px;"
            >
              <path
                d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"
              />
            </svg>
            Upload Dokumen
          </button>
        </div>

        <div
          v-if="loadingDokumen"
          style="display:flex; justify-content:center; padding:2rem;"
        >
          <span class="loading-spinner"></span>
        </div>

        <div v-else-if="!dokumenList.length" class="glass-card">
          <div class="empty-state" style="padding:2rem;">
            <p style="color:var(--text-secondary); font-weight:500;">
              Belum ada dokumen
            </p>
          </div>
        </div>

        <div v-else style="display:flex; flex-direction:column; gap:0.75rem;">
          <div
            v-for="dok in dokumenList"
            :key="dok.id"
            class="glass-card"
            style="padding:1rem; display:flex; align-items:center; justify-content:space-between;"
          >
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div class="dok-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  style="width:18px;height:18px;"
                >
                  <path
                    d="M3 3.5A1.5 1.5 0 0 1 4.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 13 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 12.5v-9Z"
                  />
                </svg>
              </div>
              <div>
                <p
                  style="font-size:0.85rem; font-weight:500; color:var(--text-primary); margin:0;"
                >
                  {{ dok.judul_dokumen }}
                </p>
                <div
                  style="display:flex; align-items:center; gap:0.5rem; margin-top:0.25rem;"
                >
                  <span
                    :class="`badge badge-${jenisColor(dok.jenis_dokumen)}`"
                    >{{ dok.jenis_dokumen }}</span
                  >
                  <span
                    style="font-size:0.72rem; color:var(--text-muted);"
                    >{{ formatDate(dok.created_at) }}</span
                  >
                </div>
              </div>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <!-- Tombol khusus LHP -->
              <RouterLink
                v-if="dok.jenis_dokumen === 'LHP'"
                :to="`/lhp/${dok.id}`"
                class="btn-secondary"
                style="font-size:0.78rem; padding:0.375rem 0.75rem;"
              >
                Lihat Temuan
              </RouterLink>
              <a
                v-if="dok.file_path"
                :href="`http://localhost:3000/${dok.file_path}`"
                target="_blank"
                class="btn-icon"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  style="width:15px;height:15px;color:var(--accent);"
                >
                  <path
                    d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z"
                  />
                  <path
                    d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z"
                  />
                </svg>
              </a>
              <a
                v-if="dok.link_dokumen"
                :href="dok.link_dokumen"
                target="_blank"
                class="btn-icon"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  style="width:15px;height:15px;color:var(--accent);"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z"
                    clip-rule="evenodd"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </a>
              <button
                v-if="auth.isAdmin"
                class="btn-icon"
                @click="handleDeleteDokumen(dok)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  style="width:15px;height:15px;color:#f87171;"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Temuan -->
      <div v-if="activeTab === 'temuan'">
        <TabTemuan
          :penugasan-id="Number(route.params.id)"
          :dokumen-list="dokumenList"
        />
      </div>

      <!-- Tab: Rekomendasi -->
      <div v-if="activeTab === 'rekomendasi'">
        <TabRekomendasi
          :penugasan-id="Number(route.params.id)"
          :dokumen-list="dokumenList"
        />
      </div>

      <!-- Tab: Tindak Lanjut -->
      <div v-if="activeTab === 'tindaklanjut'">
        <TabTindakLanjut
          :penugasan-id="Number(route.params.id)"
          :dokumen-list="dokumenList"
        />
      </div>

      <!-- Tab: Bukti TL -->
      <div v-if="activeTab === 'bukti'">
        <TabBuktiTL
          :penugasan-id="Number(route.params.id)"
          :dokumen-list="dokumenList"
        />
      </div>
    </div>

    <!-- SPT Form Modal -->
    <AppModal
      v-model="showSptForm"
      title="Form SPT"
      subtitle="Surat Perintah Tugas"
      width="40rem"
    >
      <SptForm
        :item="sptData"
        :penugasan-id="Number(route.params.id)"
        :loading="submitting"
        @submit="handleSptSubmit"
        @cancel="showSptForm = false"
      />
    </AppModal>

    <!-- Tim Form Modal -->
    <AppModal v-model="showTimForm" title="Tambah Anggota Tim">
      <TimForm
        :loading="submitting"
        @submit="handleTimSubmit"
        @cancel="showTimForm = false"
      />
    </AppModal>

    <!-- Dokumen Form Modal -->
    <AppModal v-model="showDokumenForm" title="Upload Dokumen" width="38rem">
      <DokumenForm
        :penugasan-id="Number(route.params.id)"
        :loading="submitting"
        @submit="handleDokumenSubmit"
        @cancel="showDokumenForm = false"
      />
    </AppModal>

    <!-- Confirm hapus dokumen -->
    <AppConfirm
      v-model="showConfirmDokumen"
      title="Hapus Dokumen"
      :message="`Yakin hapus dokumen '${deleteDokTarget?.judul_dokumen}'?`"
      :loading="submitting"
      @confirm="confirmDeleteDokumen"
      @cancel="showConfirmDokumen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePenugasanStore } from '@/stores/penugasan'
import { useDokumenStore } from '@/stores/dokumen'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { penugasanService } from '@/services/penugasanService'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import SptForm from '@/components/spt/SptForm.vue'
import TimForm from '@/components/spt/TimForm.vue'
import DokumenForm from '@/components/dokumen/DokumenForm.vue'
import { formatDate } from '@/utils/format'
import { BADGE_COLOR } from '@/utils/constants'
import TabTemuan from '@/components/penugasan/TabTemuan.vue'
import TabRekomendasi from '@/components/penugasan/TabRekomendasi.vue'
import TabTindakLanjut from '@/components/penugasan/TabTindakLanjut.vue'
import TabBuktiTL from '@/components/penugasan/TabBuktiTL.vue'

const route = useRoute()
const penugasan = usePenugasanStore()
const dokumen = useDokumenStore()
const auth = useAuthStore()
const toast = useToast()

const loading = ref(false)
const loadingDokumen = ref(false)
const submitting = ref(false)
const data = ref(null)
const sptData = ref(null)
const dokumenList = ref([])
const activeTab = ref('spt')
const showSptForm = ref(false)
const showTimForm = ref(false)
const showDokumenForm = ref(false)
const showConfirmDokumen = ref(false)
const deleteDokTarget = ref(null)

const tabs = computed(() => {
  const baseTabs = [
    { key: 'spt', label: 'SPT & Tim' }
  ]
  // Tab tambahan hanya untuk admin & superadmin keirbanan
  if (auth.isAdmin) {
    baseTabs.push(
      { key: 'dokumen', label: 'Dokumen', badge: dokumenList.value.length || null },
      { key: 'temuan', label: 'Temuan' },
      { key: 'rekomendasi', label: 'Rekomendasi' },
      { key: 'tindaklanjut', label: 'Tindak Lanjut' },
      { key: 'bukti', label: 'Bukti TL' }
    )
  }
  return baseTabs
})

const jabatanColor = (jabatan) => {
  const map = { 'Ketua Tim': 'blue', 'Pengendali Teknis': 'purple', 'Pengendali Mutu': 'yellow', 'Anggota': 'gray' }
  return map[jabatan] || 'gray'
}

const jenisColor = (jenis) => {
  const map = { 'LHP': 'blue', 'P2HP': 'purple', 'Telaahan Awal': 'yellow', 'Kertas Kerja': 'green', 'Lainnya': 'gray' }
  return map[jenis] || 'gray'
}

const handleSptSubmit = async (formData) => {
  submitting.value = true
  let result
  if (sptData.value) {
    result = await penugasan.updateSpt(sptData.value.id, formData)
  } else {
    result = await penugasan.createSpt({ ...formData, penugasan_id: Number(route.params.id) })
  }
  submitting.value = false
  if (result.success) {
    toast.success(sptData.value ? 'SPT berhasil diupdate.' : 'SPT berhasil dibuat.')
    sptData.value = result.data
    showSptForm.value = false
  } else {
    toast.error(result.message)
  }
}

const handleTimSubmit = async (formData) => {
  submitting.value = true
  try {
    await penugasanService.tambahTim(sptData.value.id, formData)
    toast.success('Anggota tim berhasil ditambahkan.')
    showTimForm.value = false
    sptData.value = await penugasan.fetchSpt(route.params.id)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Gagal menambah anggota tim.')
  }
  submitting.value = false
}

const hapusTim = async (timId) => {
  try {
    await penugasanService.hapusTim(sptData.value.id, timId)
    sptData.value.tims = sptData.value.tims.filter(t => t.id !== timId)
    toast.success('Anggota tim berhasil dihapus.')
  } catch (e) {
    toast.error('Gagal menghapus anggota tim.')
  }
}

const handleDokumenSubmit = async (formData) => {
  submitting.value = true
  const result = await dokumen.create({ ...formData, penugasan_id: Number(route.params.id) })
  submitting.value = false
  if (result.success) {
    toast.success('Dokumen berhasil diupload.')
    showDokumenForm.value = false
    await loadDokumen()
  } else {
    toast.error(result.message)
  }
}

const handleDeleteDokumen = (dok) => {
  deleteDokTarget.value = dok
  showConfirmDokumen.value = true
}

const confirmDeleteDokumen = async () => {
  submitting.value = true
  const result = await dokumen.remove(deleteDokTarget.value.id)
  submitting.value = false
  if (result.success) {
    toast.success('Dokumen berhasil dihapus.')
    showConfirmDokumen.value = false
    dokumenList.value = dokumenList.value.filter(d => d.id !== deleteDokTarget.value.id)
  } else {
    toast.error(result.message)
  }
}

const loadDokumen = async () => {
  loadingDokumen.value = true
  const res = await dokumen.fetchByPenugasan(route.params.id)
  dokumenList.value = dokumen.list
  loadingDokumen.value = false
}

onMounted(async () => {
  loading.value = true
  const res = await penugasan.fetchById(route.params.id)
  data.value = res
  loading.value = false
  sptData.value = await penugasan.fetchSpt(route.params.id)
  await loadDokumen()
})
</script>

<style scoped>
.tab-bar {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.25rem;
  padding-bottom: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -1px;
}

.tab-btn:hover { color: var(--text-primary); }

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tab-badge {
  background: var(--accent-light);
  color: var(--accent);
  border-radius: 9999px;
  padding: 0.1rem 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
}

.info-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.25rem;
}

.info-value {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
  margin: 0;
}

.dok-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  background: var(--accent-light);
  border: 1px solid rgba(59,130,246,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}
</style>
