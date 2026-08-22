<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">PKPT</h1>
        <p class="page-subtitle">
          Program Kerja Pengawasan Tahunan — {{ ui.tahunAktif }}
        </p>
      </div>
      <button v-if="auth.isAdmin" class="btn-primary" @click="openForm()">
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
        Tambah PKPT
      </button>
    </div>

    <!-- Filter & Search -->
    <div
      class="glass-card"
      style="padding:1rem; margin-bottom:1rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;"
    >
      <div style="position:relative; flex:1; min-width:200px;">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--text-muted);"
        >
          <path
            fill-rule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clip-rule="evenodd"
          />
        </svg>
        <input
          v-model="search"
          type="text"
          class="input-field"
          style="padding-left:2.25rem;"
          placeholder="Cari nama program..."
          @input="handleSearch"
        />
      </div>

      <select
        v-model="filterStatus"
        class="select-field"
        style="width:150px;"
        @change="loadData"
      >
        <option value="">Semua Status</option>
        <option value="Aktif">Aktif</option>
        <option value="Selesai">Selesai</option>
      </select>

      <select
        v-if="auth.hasAllAccess"
        v-model="filterKeirbanan"
        class="select-field"
        style="width:160px;"
        @change="loadData"
      >
        <option value="">Semua Keirbanan</option>
        <option v-for="kb in KEIRBANAN" :key="kb" :value="kb">
          Keirbanan {{ kb }}
        </option>
      </select>
    </div>

    <!-- Table -->
    <div class="glass-card">
      <!-- Loading -->
      <div
        v-if="pkpt.loading"
        style="padding:3rem; display:flex; justify-content:center;"
      >
        <span class="loading-spinner"></span>
      </div>

      <!-- Empty -->
      <div v-else-if="!pkpt.list.length" class="empty-state">
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
          Belum ada PKPT
        </p>
        <p style="font-size:0.8rem;">
          PKPT untuk tahun {{ ui.tahunAktif }} belum dibuat.
        </p>
        <button
          v-if="auth.isAdmin"
          class="btn-primary"
          style="margin-top:0.5rem;"
          @click="openForm()"
        >
          Buat PKPT Sekarang
        </button>
      </div>

      <!-- Table -->
      <div v-else>
        <div class="table-wrapper" style="border:none; border-radius:0;">
          <table class="table-base">
            <thead>
              <tr>
                <th>No</th>
                <th>Tahun</th>
                <th>Nama Program</th>
                <th v-if="auth.hasAllAccess">Keirbanan</th>
                <th>Penugasan</th>
                <th>Status</th>
                <th v-if="auth.isAdmin">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in pkpt.list" :key="item.id">
                <td style="color:var(--text-muted); font-size:0.8rem;">
                  {{ (pkpt.pagination.page - 1) * pkpt.pagination.limit + i + 1 }}
                </td>
                <td>
                  <span class="badge badge-blue">{{ item.tahun }}</span>
                </td>
                <td>
                  <RouterLink
                    :to="`/pkpt/${item.id}`"
                    style="color:var(--accent); text-decoration:none; font-weight:500;"
                  >
                    {{ item.nama_program }}
                  </RouterLink>
                </td>
                <td v-if="auth.hasAllAccess">
                  <span
                    :class="`badge badge-${BADGE_COLOR[item.keirbanan] || 'gray'}`"
                  >
                    Keirbanan {{ item.keirbanan }}
                  </span>
                </td>
                <td>
                  <span style="font-size:0.8rem; color:var(--text-secondary);">
                    {{ item.penugasans?.length || 0 }} penugasan
                  </span>
                </td>
                <td>
                  <span
                    :class="`badge badge-${item.status === 'Aktif' ? 'green' : 'gray'}`"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td v-if="auth.isAdmin">
                  <div style="display:flex; gap:0.375rem;">
                    <button
                      class="btn-icon"
                      title="Edit"
                      @click="openForm(item)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        style="width:15px;height:15px;color:var(--accent);"
                      >
                        <path
                          d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z"
                        />
                        <path
                          d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z"
                        />
                      </svg>
                    </button>
                    <button
                      class="btn-icon"
                      title="Hapus"
                      @click="handleDelete(item)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        style="width:15px;height:15px;color:#f87171;"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.712Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <AppPagination
          v-model:current-page="pkpt.pagination.page"
          :total="pkpt.pagination.total"
          :per-page="pkpt.pagination.limit"
          @update:current-page="onPageChange"
        />
      </div>
    </div>

    <!-- Form Modal -->
    <AppModal
      v-model="showForm"
      :title="editItem ? 'Edit PKPT' : 'Tambah PKPT'"
      subtitle="Program Kerja Pengawasan Tahunan"
    >
      <PkptForm
        :item="editItem"
        :loading="submitting"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </AppModal>

    <!-- Confirm Delete -->
    <AppConfirm
      v-model="showConfirm"
      title="Hapus PKPT"
      :message="`Yakin ingin menghapus PKPT '${deleteTarget?.nama_program}'? Pastikan tidak ada penugasan di dalamnya.`"
      :loading="submitting"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { usePkptStore } from '@/stores/pkpt'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import PkptForm from '@/components/pkpt/PkptForm.vue'
import { KEIRBANAN, BADGE_COLOR } from '@/utils/constants'

const pkpt = usePkptStore()
const auth = useAuthStore()
const ui = useUIStore()
const toast = useToast()

const search = ref('')
const filterStatus = ref('')
const filterKeirbanan = ref('')
const showForm = ref(false)
const showConfirm = ref(false)
const editItem = ref(null)
const deleteTarget = ref(null)
const submitting = ref(false)

let searchTimeout = null

const loadData = () => {
  pkpt.fetchAll({
    search: search.value || undefined,
    status: filterStatus.value || undefined,
    keirbanan: filterKeirbanan.value || undefined
  })
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadData, 400)
}

const onPageChange = (page) => {
  pkpt.pagination.page = page
  loadData()
}

const openForm = (item = null) => {
  editItem.value = item
  showForm.value = true
}

const handleSubmit = async (data) => {
  submitting.value = true
  let result
  if (editItem.value) {
    result = await pkpt.update(editItem.value.id, data)
  } else {
    result = await pkpt.create(data)
  }
  submitting.value = false

  if (result.success) {
    toast.success(editItem.value ? 'PKPT berhasil diupdate.' : 'PKPT berhasil dibuat.')
    showForm.value = false
    editItem.value = null
  } else {
    toast.error(result.message)
  }
}

const handleDelete = (item) => {
  deleteTarget.value = item
  showConfirm.value = true
}

const confirmDelete = async () => {
  submitting.value = true
  const result = await pkpt.remove(deleteTarget.value.id)
  submitting.value = false

  if (result.success) {
    toast.success('PKPT berhasil dihapus.')
    showConfirm.value = false
    deleteTarget.value = null
  } else {
    toast.error(result.message)
  }
}

// Reload kalau tahun aktif berubah
watch(() => ui.tahunAktif, loadData)

onMounted(loadData)
</script>
