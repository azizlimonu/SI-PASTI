<template>
  <div>
    <!-- Loading -->
    <div
      v-if="pkpt.loading"
      style="display:flex; justify-content:center; padding:3rem;"
    >
      <span class="loading-spinner"></span>
    </div>

    <div v-else-if="pkpt.current">
      <!-- Header -->
      <div class="page-header">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <RouterLink
            to="/pkpt"
            style="color:var(--text-muted); text-decoration:none; display:flex; align-items:center;"
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
            <h1 class="page-title">{{ pkpt.current.nama_program }}</h1>
            <p class="page-subtitle">
              Tahun {{ pkpt.current.tahun }} — Keirbanan
              {{ pkpt.current.keirbanan }}
            </p>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span
            :class="`badge badge-${pkpt.current.status === 'Aktif' ? 'green' : 'gray'}`"
          >
            {{ pkpt.current.status }}
          </span>
          <button
            v-if="auth.isAdmin"
            class="btn-primary"
            @click="showPenugasanForm = true"
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
            Tambah Penugasan
          </button>
        </div>
      </div>

      <!-- Info Cards -->
      <div
        style="display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.25rem;"
      >
        <div class="glass-card" style="padding:1rem; text-align:center;">
          <p
            style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin:0 0 0.375rem;"
          >
            Total Penugasan
          </p>
          <p
            style="font-size:1.75rem; font-weight:700; color:var(--text-primary); margin:0;"
          >
            {{ penugasanList.length }}
          </p>
        </div>
        <div class="glass-card" style="padding:1rem; text-align:center;">
          <p
            style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin:0 0 0.375rem;"
          >
            Selesai
          </p>
          <p
            style="font-size:1.75rem; font-weight:700; color:#34d399; margin:0;"
          >
            {{ countByStatus('Selesai') }}
          </p>
        </div>
        <div class="glass-card" style="padding:1rem; text-align:center;">
          <p
            style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin:0 0 0.375rem;"
          >
            Dalam Proses
          </p>
          <p
            style="font-size:1.75rem; font-weight:700; color:#60a5fa; margin:0;"
          >
            {{ countByStatus('Dalam Proses') }}
          </p>
        </div>
        <div class="glass-card" style="padding:1rem; text-align:center;">
          <p
            style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin:0 0 0.375rem;"
          >
            Belum Mulai
          </p>
          <p
            style="font-size:1.75rem; font-weight:700; color:#94a3b8; margin:0;"
          >
            {{ countByStatus('Belum Mulai') }}
          </p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="glass-card" style="padding:1.25rem; margin-bottom:1.25rem;">
        <div
          style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.625rem;"
        >
          <span
            style="font-size:0.85rem; font-weight:500; color:var(--text-primary);"
            >Progress Penugasan</span
          >
          <span style="font-size:0.85rem; font-weight:700; color:var(--accent);"
            >{{ progressPersen }}%</span
          >
        </div>
        <div
          style="height:8px; background:var(--bg-hover); border-radius:9999px; overflow:hidden;"
        >
          <div
            :style="{ width: progressPersen + '%', height:'100%', background:'linear-gradient(90deg,#2563eb,#60a5fa)', borderRadius:'9999px', transition:'width 0.5s ease' }"
          ></div>
        </div>
        <p
          style="font-size:0.75rem; color:var(--text-muted); margin:0.375rem 0 0;"
        >
          {{ countByStatus('Selesai') }} dari
          {{ penugasanList.length }} penugasan selesai
        </p>
      </div>

      <!-- Daftar Penugasan -->
      <div class="glass-card">
        <div
          style="padding:1rem 1.25rem; border-bottom:1px solid var(--border-color);"
        >
          <h3
            style="font-size:0.875rem; font-weight:600; color:var(--text-primary); margin:0;"
          >
            Daftar Penugasan
          </h3>
        </div>

        <div
          v-if="!penugasanList.length"
          class="empty-state"
          style="padding:2rem;"
        >
          <div class="empty-state-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              style="width:24px;height:24px;"
            >
              <path
                d="M5.127 3.502 5.25 3.5h9.5c.041 0 .082 0 .123.002A2.251 2.251 0 0 0 12.75 2h-5.5a2.25 2.25 0 0 0-2.123 1.502ZM1 10.25A2.25 2.25 0 0 1 3.25 8h13.5A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5ZM3.25 6.5c-.04 0-.082 0-.123.002A2.25 2.25 0 0 1 5.25 5h9.5a2.25 2.25 0 0 1 2.123 1.502A3.819 3.819 0 0 0 16.75 6.5H3.25Z"
              />
            </svg>
          </div>
          <p style="color:var(--text-secondary); font-weight:500;">
            Belum ada penugasan
          </p>
          <button
            v-if="auth.isAdmin"
            class="btn-primary"
            style="margin-top:0.5rem;"
            @click="showPenugasanForm = true"
          >
            Tambah Penugasan
          </button>
        </div>

        <div v-else class="table-wrapper" style="border:none; border-radius:0;">
          <table class="table-base">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Penugasan</th>
                <th>Jenis</th>
                <th>Tanggal Mulai</th>
                <th>Tanggal Selesai</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in penugasanList" :key="p.id">
                <td style="color:var(--text-muted); font-size:0.8rem;">
                  {{ i + 1 }}
                </td>
                <td>
                  <RouterLink
                    :to="`/penugasan/${p.id}`"
                    style="color:var(--accent); text-decoration:none; font-weight:500;"
                  >
                    {{ p.nama_penugasan }}
                  </RouterLink>
                </td>
                <td style="font-size:0.8rem; color:var(--text-secondary);">
                  {{ p.jenis_penugasan }}
                </td>
                <td style="font-size:0.8rem; color:var(--text-muted);">
                  {{ formatDate(p.tanggal_mulai) }}
                </td>
                <td style="font-size:0.8rem; color:var(--text-muted);">
                  {{ formatDate(p.tanggal_selesai) }}
                </td>
                <td>
                  <span
                    :class="`badge badge-${BADGE_COLOR[p.status] || 'gray'}`"
                    >{{ p.status }}</span
                  >
                </td>
                <td>
                  <RouterLink
                    :to="`/penugasan/${p.id}`"
                    class="btn-icon"
                    title="Lihat Detail"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      style="width:15px;height:15px;color:var(--accent);"
                    >
                      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                      <path
                        fill-rule="evenodd"
                        d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else class="empty-state">
      <p style="color:var(--text-muted);">PKPT tidak ditemukan.</p>
      <RouterLink to="/pkpt" class="btn-secondary" style="margin-top:0.5rem;"
        >Kembali</RouterLink
      >
    </div>

    <!-- Modal Tambah Penugasan -->
    <AppModal
      v-model="showPenugasanForm"
      title="Tambah Penugasan"
      subtitle="Tambahkan penugasan ke dalam PKPT ini"
    >
      <PenugasanForm
        :pkpt-id="pkpt.current?.id"
        :loading="submitting"
        @submit="handleAddPenugasan"
        @cancel="showPenugasanForm = false"
      />
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePkptStore } from '@/stores/pkpt'
import { usePenugasanStore } from '@/stores/penugasan'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import AppModal from '@/components/common/AppModal.vue'
import PenugasanForm from '@/components/penugasan/PenugasanForm.vue'
import { formatDate } from '@/utils/format'
import { BADGE_COLOR } from '@/utils/constants'

const route = useRoute()
const pkpt = usePkptStore()
const penugasan = usePenugasanStore()
const auth = useAuthStore()
const toast = useToast()

const showPenugasanForm = ref(false)
const submitting = ref(false)

const penugasanList = computed(() => pkpt.current?.penugasans || [])

const countByStatus = (status) =>
  penugasanList.value.filter(p => p.status === status).length

const progressPersen = computed(() => {
  const total = penugasanList.value.length
  if (!total) return 0
  return Math.round((countByStatus('Selesai') / total) * 100)
})

const handleAddPenugasan = async (data) => {
  submitting.value = true
  const result = await penugasan.create({ ...data, pkpt_id: pkpt.current.id })
  submitting.value = false

  if (result.success) {
    toast.success('Penugasan berhasil ditambahkan.')
    showPenugasanForm.value = false
    await pkpt.fetchById(route.params.id)
  } else {
    toast.error(result.message)
  }
}

onMounted(() => pkpt.fetchById(route.params.id))
</script>
