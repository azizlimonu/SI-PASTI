<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Penugasan</h1>
        <p class="page-subtitle">Tahun {{ ui.tahunAktif }}</p>
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
        Tambah Penugasan
      </button>
    </div>

    <!-- Filter -->
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
          placeholder="Cari nama penugasan..."
          @input="handleSearch"
        />
      </div>
      <select
        v-model="filterStatus"
        class="select-field"
        style="width:160px;"
        @change="loadData"
      >
        <option value="">Semua Status</option>
        <option v-for="s in STATUS_PENUGASAN" :key="s" :value="s">
          {{ s }}
        </option>
      </select>
      <select
        v-model="filterPkpt"
        class="select-field"
        style="width:200px;"
        @change="loadData"
      >
        <option value="">Semua PKPT</option>
        <option v-for="p in pkptOptions" :key="p.id" :value="p.id">
          {{ p.tahun }} — {{ p.nama_program }}
        </option>
      </select>
    </div>

    <!-- Table -->
    <div class="glass-card">
      <div
        v-if="penugasan.loading"
        style="padding:3rem; display:flex; justify-content:center;"
      >
        <span class="loading-spinner"></span>
      </div>

      <div v-else-if="!penugasan.list.length" class="empty-state">
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
        <p style="font-weight:500; color:var(--text-secondary);">
          Belum ada penugasan
        </p>
        <button
          v-if="auth.isAdmin"
          class="btn-primary"
          style="margin-top:0.5rem;"
          @click="openForm()"
        >
          Tambah Penugasan
        </button>
      </div>

      <div v-else>
        <div class="table-wrapper" style="border:none; border-radius:0;">
          <table class="table-base">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Penugasan</th>
                <th>Jenis</th>
                <th>PKPT</th>
                <th>Tanggal</th>
                <th>SPT</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in penugasan.list" :key="item.id">
                <td style="color:var(--text-muted); font-size:0.8rem;">
                  {{ (penugasan.pagination.page - 1) * penugasan.pagination.limit + i + 1 }}
                </td>
                <td>
                  <RouterLink
                    :to="`/penugasan/${item.id}`"
                    style="color:var(--accent); text-decoration:none; font-weight:500;"
                  >
                    {{ item.nama_penugasan }}
                  </RouterLink>
                </td>
                <td style="font-size:0.8rem; color:var(--text-secondary);">
                  {{ item.jenis_penugasan }}
                </td>
                <td>
                  <span
                    v-if="item.pkpt"
                    style="font-size:0.78rem; color:var(--text-muted);"
                  >
                    {{ item.pkpt.tahun }} — Keirbanan {{ item.pkpt.keirbanan }}
                  </span>
                </td>
                <td style="font-size:0.78rem; color:var(--text-muted);">
                  {{ formatDate(item.tanggal_mulai) }}
                  <span v-if="item.tanggal_selesai">
                    s/d {{ formatDate(item.tanggal_selesai) }}</span
                  >
                </td>
                <td>
                  <span v-if="item.spt" class="badge badge-green">Ada</span>
                  <span v-else class="badge badge-gray">Belum</span>
                </td>
                <td>
                  <span
                    :class="`badge badge-${BADGE_COLOR[item.status] || 'gray'}`"
                    >{{ item.status }}</span
                  >
                </td>
                <td>
                  <div style="display:flex; gap:0.375rem;">
                    <RouterLink
                      :to="`/penugasan/${item.id}`"
                      class="btn-icon"
                      title="Detail"
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
                    <button
                      v-if="auth.isAdmin"
                      class="btn-icon"
                      title="Edit"
                      @click="openForm(item)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        style="width:15px;height:15px;color:#60a5fa;"
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
                      v-if="auth.isAdmin"
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
        <AppPagination
          v-model:current-page="penugasan.pagination.page"
          :total="penugasan.pagination.total"
          :per-page="penugasan.pagination.limit"
          @update:current-page="onPageChange"
        />
      </div>
    </div>

    <!-- Modal Form -->
    <AppModal
      v-model="showForm"
      :title="editItem ? 'Edit Penugasan' : 'Tambah Penugasan'"
    >
      <PenugasanForm
        :item="editItem"
        :loading="submitting"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </AppModal>

    <!-- Confirm Delete -->
    <AppConfirm
      v-model="showConfirm"
      title="Hapus Penugasan"
      :message="`Yakin ingin menghapus penugasan '${deleteTarget?.nama_penugasan}'?`"
      :loading="submitting"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { usePenugasanStore } from '@/stores/penugasan'
import { usePkptStore } from '@/stores/pkpt'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import PenugasanForm from '@/components/penugasan/PenugasanForm.vue'
import { formatDate } from '@/utils/format'
import { STATUS_PENUGASAN, BADGE_COLOR } from '@/utils/constants'

const penugasan = usePenugasanStore()
const pkptStore = usePkptStore()
const auth = useAuthStore()
const ui = useUIStore()
const toast = useToast()

const search = ref('')
const filterStatus = ref('')
const filterPkpt = ref('')
const showForm = ref(false)
const showConfirm = ref(false)
const editItem = ref(null)
const deleteTarget = ref(null)
const submitting = ref(false)
const pkptOptions = ref([])

let searchTimeout = null

const loadData = () => {
  penugasan.fetchAll({
    search: search.value || undefined,
    status: filterStatus.value || undefined,
    pkpt_id: filterPkpt.value || undefined
  })
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadData, 400)
}

const onPageChange = (page) => {
  penugasan.pagination.page = page
  loadData()
}

const openForm = (item = null) => {
  editItem.value = item
  showForm.value = true
}

const handleSubmit = async (data) => {
  submitting.value = true
  const result = editItem.value
    ? await penugasan.update(editItem.value.id, data)
    : await penugasan.create(data)
  submitting.value = false

  if (result.success) {
    toast.success(editItem.value ? 'Penugasan berhasil diupdate.' : 'Penugasan berhasil dibuat.')
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
  const result = await penugasan.remove(deleteTarget.value.id)
  submitting.value = false
  if (result.success) {
    toast.success('Penugasan berhasil dihapus.')
    showConfirm.value = false
  } else {
    toast.error(result.message)
  }
}

watch(() => ui.tahunAktif, loadData)

onMounted(async () => {
  loadData()
  await pkptStore.fetchAll({ limit: 100 })
  pkptOptions.value = pkptStore.list
})
</script>
