<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Kelola User</h1>
        <p class="page-subtitle">Manajemen Pengguna Sistem</p>
      </div>
      <button class="btn-primary" @click="openCreateForm">
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
        Tambah User
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
        style="flex:1; min-width:200px;"
        placeholder="Cari nama, NIP, atau jabatan..."
        @input="handleSearch"
      />
      <select
        v-model="filterRole"
        class="select-field"
        style="width:180px;"
        @change="loadData"
      >
        <option value="">Semua Role</option>
        <option v-for="r in ROLE_OPTIONS" :key="r.value" :value="r.value">
          {{ r.label }}
        </option>
      </select>
      <select
        v-model="filterStatus"
        class="select-field"
        style="width:150px;"
        @change="loadData"
      >
        <option value="">Semua Status</option>
        <option value="AKTIF">Aktif</option>
        <option value="NONAKTIF">Nonaktif</option>
      </select>
    </div>

    <!-- Table -->
    <div class="glass-card">
      <div
        v-if="userStore.loading"
        style="padding:3rem; display:flex; justify-content:center;"
      >
        <span class="loading-spinner"></span>
      </div>

      <div v-else-if="!userStore.list.length" class="empty-state">
        <p style="font-weight:500; color:var(--text-secondary);">
          Belum ada user
        </p>
      </div>

      <div v-else class="table-wrapper" style="border:none; border-radius:0;">
        <table class="table-base">
          <thead>
            <tr>
              <th>No</th>
              <th>NIP</th>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Role</th>
              <th>Keirbanan</th>
              <th>Status</th>
              <th style="text-align:right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, i) in userStore.list" :key="u.id">
              <td style="color:var(--text-muted); font-size:0.8rem;">
                {{ i + 1 }}
              </td>
              <td style="font-size:0.82rem;">{{ u.nip }}</td>
              <td style="font-size:0.85rem; font-weight:500;">{{ u.nama }}</td>
              <td style="font-size:0.82rem;">{{ u.jabatan }}</td>
              <td>
                <span :class="`badge badge-${BADGE_COLOR[u.role] || 'gray'}`">
                  {{ roleLabel(u.role) }}
                </span>
              </td>
              <td>
                <span
                  :class="`badge badge-${BADGE_COLOR[u.keirbanan] || 'gray'}`"
                >
                  {{ u.keirbanan === 'ALL' ? 'Semua' : u.keirbanan }}
                </span>
              </td>
              <td>
                <span
                  :class="`badge badge-${u.status === 'AKTIF' ? 'green' : 'gray'}`"
                >
                  {{ u.status }}
                </span>
              </td>
              <td>
                <div
                  style="display:flex; gap:0.375rem; justify-content:flex-end; flex-wrap:wrap;"
                >
                  <button
                    class="btn-secondary"
                    style="font-size:0.72rem; padding:0.25rem 0.625rem;"
                    @click="openEditForm(u)"
                  >
                    Edit
                  </button>
                  <button
                    class="btn-secondary"
                    style="font-size:0.72rem; padding:0.25rem 0.625rem;"
                    @click="handleResetPassword(u)"
                  >
                    Reset Password
                  </button>
                  <button
                    v-if="u.status === 'AKTIF'"
                    class="btn-secondary"
                    style="font-size:0.72rem; padding:0.25rem 0.625rem; color:#f87171;"
                    :disabled="u.id === auth.user?.id"
                    @click="handleToggleStatus(u)"
                  >
                    Nonaktifkan
                  </button>
                  <button
                    v-else
                    class="btn-secondary"
                    style="font-size:0.72rem; padding:0.25rem 0.625rem; color:#4ade80;"
                    @click="handleToggleStatus(u)"
                  >
                    Aktifkan
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination
        v-if="userStore.pagination.total_pages > 1"
        :current-page="userStore.pagination.page"
        :total-pages="userStore.pagination.total_pages"
        :total="userStore.pagination.total"
        :per-page="userStore.pagination.limit"
        @change="userStore.setPage"
      />
    </div>

    <!-- Modal Create/Edit -->
    <AppModal
      v-model="showForm"
      :title="editTarget ? 'Edit User' : 'Tambah User'"
      width="30rem"
    >
      <form
        @submit.prevent="handleSubmit"
        style="display:flex; flex-direction:column; gap:1rem;"
      >
        <div>
          <label class="input-label"
            >NIP <span style="color:#f87171;">*</span></label
          >
          <input
            v-model="form.nip"
            type="text"
            class="input-field"
            :disabled="!!editTarget"
            placeholder="Nomor Induk Pegawai"
          />
        </div>
        <div>
          <label class="input-label"
            >Nama <span style="color:#f87171;">*</span></label
          >
          <input v-model="form.nama" type="text" class="input-field" />
        </div>
        <div>
          <label class="input-label"
            >Jabatan <span style="color:#f87171;">*</span></label
          >
          <input v-model="form.jabatan" type="text" class="input-field" />
        </div>
        <div>
          <label class="input-label"
            >Role <span style="color:#f87171;">*</span></label
          >
          <select
            v-model="form.role"
            class="select-field"
            :disabled="editTarget?.id === auth.user?.id"
          >
            <option value="">Pilih role</option>
            <option v-for="r in ROLE_OPTIONS" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </div>
        <div v-if="butuhKeirbanan">
          <label class="input-label"
            >Keirbanan <span style="color:#f87171;">*</span></label
          >
          <select v-model="form.keirbanan" class="select-field">
            <option value="">Pilih keirbanan</option>
            <option v-for="kb in KEIRBANAN" :key="kb" :value="kb">
              Keirbanan {{ kb }}
            </option>
          </select>
        </div>
        <div v-if="!editTarget">
          <label class="input-label">Password (opsional)</label>
          <input
            v-model="form.password"
            type="text"
            class="input-field"
            placeholder="Kosongkan untuk pakai password default sistem"
          />
        </div>
        <div v-if="editTarget">
          <label class="input-label">Status</label>
          <select v-model="form.status" class="select-field">
            <option value="AKTIF">Aktif</option>
            <option value="NONAKTIF">Nonaktif</option>
          </select>
        </div>
        <div v-if="errorMsg" class="alert-danger">
          <span>{{ errorMsg }}</span>
        </div>
        <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
          <button type="button" class="btn-secondary" @click="showForm = false">
            Batal
          </button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            <span v-if="submitting" class="loading-spinner"></span>
            {{ submitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </AppModal>

    <AppConfirm
      v-model="showConfirmReset"
      title="Reset Password"
      :message="`Reset password ${confirmTarget?.nama} ke password default sistem?`"
      :loading="submitting"
      @confirm="confirmResetPassword"
      @cancel="showConfirmReset = false"
    />

    <AppConfirm
      v-model="showConfirmToggle"
      :title="confirmTarget?.status === 'AKTIF' ? 'Nonaktifkan User' : 'Aktifkan User'"
      :message="`Yakin ${confirmTarget?.status === 'AKTIF' ? 'menonaktifkan' : 'mengaktifkan'} ${confirmTarget?.nama}?`"
      :loading="submitting"
      @confirm="confirmToggleStatus"
      @cancel="showConfirmToggle = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import AppModal from '@/components/common/AppModal.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import { ROLE_OPTIONS, KEIRBANAN, BADGE_COLOR } from '@/utils/constants'

const userStore = useUserStore()
const auth = useAuthStore()
const toast = useToast()

const search = ref('')
const filterRole = ref('')
const filterStatus = ref('')

const showForm = ref(false)
const showConfirmReset = ref(false)
const showConfirmToggle = ref(false)
const submitting = ref(false)
const errorMsg = ref('')
const editTarget = ref(null)
const confirmTarget = ref(null)

const form = ref({
  nip: '', nama: '', jabatan: '', role: '', keirbanan: '', password: '', status: 'AKTIF'
})

let searchTimeout = null

const roleLabel = (role) => ROLE_OPTIONS.find(r => r.value === role)?.label || role

const butuhKeirbanan = computed(() => ['admin', 'irban'].includes(form.value.role))

const loadData = () => {
  userStore.fetchAll({
    search: search.value || undefined,
    role: filterRole.value || undefined,
    status: filterStatus.value || undefined
  })
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadData, 400)
}

const openCreateForm = () => {
  editTarget.value = null
  form.value = { nip: '', nama: '', jabatan: '', role: '', keirbanan: '', password: '', status: 'AKTIF' }
  errorMsg.value = ''
  showForm.value = true
}

const openEditForm = (u) => {
  editTarget.value = u
  form.value = {
    nip: u.nip, nama: u.nama, jabatan: u.jabatan,
    role: u.role, keirbanan: u.keirbanan === 'ALL' ? '' : u.keirbanan,
    password: '', status: u.status
  }
  errorMsg.value = ''
  showForm.value = true
}

const handleSubmit = async () => {
  errorMsg.value = ''
  if (!form.value.nama.trim()) { errorMsg.value = 'Nama wajib diisi.'; return }
  if (!form.value.jabatan.trim()) { errorMsg.value = 'Jabatan wajib diisi.'; return }
  if (!form.value.role) { errorMsg.value = 'Role wajib dipilih.'; return }
  if (butuhKeirbanan.value && !form.value.keirbanan) { errorMsg.value = 'Keirbanan wajib dipilih untuk role ini.'; return }

  submitting.value = true
  let result
  if (editTarget.value) {
    result = await userStore.update(editTarget.value.id, {
      nama: form.value.nama,
      jabatan: form.value.jabatan,
      role: form.value.role,
      keirbanan: form.value.keirbanan || undefined,
      status: form.value.status
    })
  } else {
    if (!form.value.nip.trim()) { errorMsg.value = 'NIP wajib diisi.'; submitting.value = false; return }
    result = await userStore.create({
      nip: form.value.nip,
      nama: form.value.nama,
      jabatan: form.value.jabatan,
      role: form.value.role,
      keirbanan: form.value.keirbanan || undefined,
      password: form.value.password || undefined
    })
  }
  submitting.value = false

  if (result.success) {
    toast.success(editTarget.value ? 'User berhasil diupdate.' : 'User berhasil dibuat.')
    showForm.value = false
  } else {
    errorMsg.value = result.message
  }
}

const handleResetPassword = (u) => {
  confirmTarget.value = u
  showConfirmReset.value = true
}

const confirmResetPassword = async () => {
  submitting.value = true
  const result = await userStore.resetPassword(confirmTarget.value.id)
  submitting.value = false
  if (result.success) {
    toast.success('Password berhasil direset ke default.')
    showConfirmReset.value = false
  } else {
    toast.error(result.message)
  }
}

const handleToggleStatus = (u) => {
  confirmTarget.value = u
  showConfirmToggle.value = true
}

const confirmToggleStatus = async () => {
  submitting.value = true
  const result = confirmTarget.value.status === 'AKTIF'
    ? await userStore.nonaktifkan(confirmTarget.value.id)
    : await userStore.aktifkan(confirmTarget.value.id)
  submitting.value = false
  if (result.success) {
    toast.success('Status user berhasil diubah.')
    showConfirmToggle.value = false
  } else {
    toast.error(result.message)
  }
}

onMounted(loadData)
</script>
