<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Pihak</h1>
        <p class="page-subtitle">
          Data ASN, Instansi, Perusahaan &amp; Perorangan
        </p>
      </div>
      <button v-if="auth.isAdmin" class="btn-primary" @click="openCreateForm">
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
        Tambah Pihak
      </button>
    </div>

    <!-- Filter -->
    <div
      class="glass-card"
      style="padding:1rem; margin-bottom:1rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;"
    >
      <input
        v-model="search"
        type="text"
        class="input-field"
        style="flex:1; min-width:220px;"
        placeholder="Cari nama, NIP, NIK, atau instansi/perusahaan..."
        @input="handleSearch"
      />
      <select
        v-model="filterJenis"
        class="select-field"
        style="width:180px;"
        @change="loadData"
      >
        <option value="">Semua Jenis</option>
        <option v-for="j in JENIS_PIHAK" :key="j" :value="j">{{ j }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="glass-card">
      <div
        v-if="pihak.loading"
        style="padding:3rem; display:flex; justify-content:center;"
      >
        <span class="loading-spinner"></span>
      </div>

      <div v-else-if="!pihak.list.length" class="empty-state">
        <p style="font-weight:500; color:var(--text-secondary);">
          Belum ada data pihak
        </p>
      </div>

      <div v-else class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <thead>
            <tr>
              <th>Nama</th>
              <th>NIP / NIK</th>
              <th>Jabatan</th>
              <th>Instansi / Perusahaan</th>
              <th>Jenis</th>
              <th v-if="auth.isAdmin" style="text-align:right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in pihak.list" :key="p.id">
              <td>
                <RouterLink
                  :to="`/pihak/${p.id}`"
                  style="color:var(--accent); text-decoration:none; font-weight:500;"
                >
                  {{ p.nama }}
                </RouterLink>
              </td>
              <td style="font-size:0.82rem;">{{ p.nip || p.nik || '-' }}</td>
              <td style="font-size:0.82rem;">{{ p.jabatan || '-' }}</td>
              <td style="font-size:0.82rem;">
                {{ p.instansi_perusahaan || '-' }}
              </td>
              <td>
                <span
                  :class="`badge badge-${BADGE_COLOR[p.jenis_pihak] || 'gray'}`"
                >
                  {{ p.jenis_pihak === 'Lainnya' && p.jenis_pihak_lainnya ? p.jenis_pihak_lainnya : p.jenis_pihak }}
                </span>
              </td>
              <td v-if="auth.isAdmin">
                <div
                  style="display:flex; gap:0.375rem; justify-content:flex-end;"
                >
                  <button
                    class="btn-secondary"
                    style="font-size:0.72rem; padding:0.25rem 0.625rem;"
                    @click="openEditForm(p)"
                  >
                    Edit
                  </button>
                  <button
                    class="btn-secondary"
                    style="font-size:0.72rem; padding:0.25rem 0.625rem; color:#f87171;"
                    @click="confirmDelete(p)"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination
        :current-page="pihak.pagination.page"
        :total="pihak.pagination.total"
        :per-page="pihak.pagination.limit"
        @update:current-page="pihak.setPage"
      />
    </div>

    <!-- Modal Tambah/Edit -->
    <AppModal
      v-model="showForm"
      :title="editTarget ? 'Edit Pihak' : 'Tambah Pihak'"
      width="30rem"
    >
      <PihakForm
        :initial-data="editTarget"
        :loading="submitting"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </AppModal>

    <!-- Confirm hapus -->
    <AppConfirm
      v-model="showConfirmDelete"
      title="Hapus Pihak"
      :message="`Yakin hapus '${deleteTarget?.nama}' dari master data? Data ini tidak bisa dihapus kalau masih punya riwayat rekomendasi.`"
      type="danger"
      :loading="submitting"
      @confirm="doDelete"
      @cancel="showConfirmDelete = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePihakStore } from '@/stores/pihak'
import { useToast } from '@/composables/useToast'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import PihakForm from '@/components/pihak/PihakForm.vue'
import { JENIS_PIHAK, BADGE_COLOR } from '@/utils/constants'

const auth = useAuthStore()
const pihak = usePihakStore()
const toast = useToast()

const search = ref('')
const filterJenis = ref('')

const showForm = ref(false)
const showConfirmDelete = ref(false)
const submitting = ref(false)
const editTarget = ref(null)
const deleteTarget = ref(null)

let searchTimeout = null

const loadData = () => {
  pihak.setPage(1)
  pihak.fetchAll({
    search: search.value || undefined,
    jenis_pihak: filterJenis.value || undefined
  })
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadData, 400)
}

const openCreateForm = () => {
  editTarget.value = null
  showForm.value = true
}

const openEditForm = (p) => {
  editTarget.value = p
  showForm.value = true
}

const handleSubmit = async (data) => {
  submitting.value = true
  const result = editTarget.value
    ? await pihak.update(editTarget.value.id, data)
    : await pihak.create(data)
  submitting.value = false

  if (result.success) {
    toast.success(editTarget.value ? 'Pihak berhasil diupdate.' : 'Pihak berhasil ditambahkan.')
    showForm.value = false
    if (editTarget.value) loadData()
  } else {
    toast.error(result.message)
  }
}

const confirmDelete = (p) => {
  deleteTarget.value = p
  showConfirmDelete.value = true
}

const doDelete = async () => {
  submitting.value = true
  const result = await pihak.remove(deleteTarget.value.id)
  submitting.value = false
  showConfirmDelete.value = false
  if (result.success) {
    toast.success('Pihak berhasil dihapus.')
  } else {
    toast.error(result.message)
  }
}

onMounted(loadData)
</script>
