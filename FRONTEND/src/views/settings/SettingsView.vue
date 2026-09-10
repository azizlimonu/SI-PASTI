<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengaturan</h1>
        <p class="page-subtitle">
          {{ activeTab === 'profil' ? 'Profil Akun & Keamanan' : 'Branding Aplikasi' }}
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <div v-if="auth.isSuperAdmin" class="tabs-bar">
      <button
        :class="['tab-btn', { active: activeTab === 'profil' }]"
        @click="activeTab = 'profil'"
      >
        Profil Saya
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'aplikasi' }]"
        @click="activeTab = 'aplikasi'"
      >
        Pengaturan Aplikasi
      </button>
    </div>

    <!-- ══════════════ TAB: PROFIL SAYA ══════════════ -->
    <div
      v-if="activeTab === 'profil'"
      style="display:flex; flex-direction:column; gap:1rem; max-width:36rem;"
    >
      <div class="glass-card" style="padding:1.25rem;">
        <p
          style="font-size:0.9rem; font-weight:600; color:var(--text-primary); margin:0 0 1rem;"
        >
          Profil Akun
        </p>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          <div
            style="display:flex; justify-content:space-between; padding-bottom:0.625rem; border-bottom:1px solid var(--border-color);"
          >
            <span style="font-size:0.8rem; color:var(--text-muted);">Nama</span>
            <span
              style="font-size:0.85rem; color:var(--text-primary); font-weight:500;"
              >{{ auth.user?.nama }}</span
            >
          </div>
          <div
            style="display:flex; justify-content:space-between; padding-bottom:0.625rem; border-bottom:1px solid var(--border-color);"
          >
            <span style="font-size:0.8rem; color:var(--text-muted);">NIP</span>
            <span
              style="font-size:0.85rem; color:var(--text-primary); font-weight:500;"
              >{{ auth.user?.nip }}</span
            >
          </div>
          <div
            style="display:flex; justify-content:space-between; padding-bottom:0.625rem; border-bottom:1px solid var(--border-color);"
          >
            <span style="font-size:0.8rem; color:var(--text-muted);"
              >Jabatan</span
            >
            <span
              style="font-size:0.85rem; color:var(--text-primary); font-weight:500;"
              >{{ auth.user?.jabatan }}</span
            >
          </div>
          <div
            style="display:flex; justify-content:space-between; padding-bottom:0.625rem; border-bottom:1px solid var(--border-color);"
          >
            <span style="font-size:0.8rem; color:var(--text-muted);">Role</span>
            <span
              :class="`badge badge-${BADGE_COLOR[auth.user?.role] || 'gray'}`"
            >
              {{ roleLabel }}
            </span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="font-size:0.8rem; color:var(--text-muted);"
              >Keirbanan</span
            >
            <span
              :class="`badge badge-${BADGE_COLOR[auth.user?.keirbanan] || 'gray'}`"
            >
              {{ auth.user?.keirbanan === 'ALL' ? 'Semua' : auth.user?.keirbanan }}
            </span>
          </div>
        </div>
      </div>

      <div class="glass-card" style="padding:1.25rem;">
        <p
          style="font-size:0.9rem; font-weight:600; color:var(--text-primary); margin:0 0 1rem;"
        >
          Ganti Password
        </p>
        <form
          @submit.prevent="handleChangePassword"
          style="display:flex; flex-direction:column; gap:1rem;"
        >
          <div>
            <label class="input-label"
              >Password Lama <span style="color:#f87171;">*</span></label
            >
            <input
              v-model="passwordForm.oldPassword"
              type="password"
              class="input-field"
              autocomplete="current-password"
            />
          </div>
          <div>
            <label class="input-label"
              >Password Baru <span style="color:#f87171;">*</span></label
            >
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="input-field"
              autocomplete="new-password"
            />
          </div>
          <div>
            <label class="input-label"
              >Konfirmasi Password Baru
              <span style="color:#f87171;">*</span></label
            >
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="input-field"
              autocomplete="new-password"
            />
          </div>
          <div v-if="passwordError" class="alert-danger">
            <span>{{ passwordError }}</span>
          </div>
          <div style="display:flex; justify-content:flex-end;">
            <button
              type="submit"
              class="btn-primary"
              :disabled="submittingPassword"
            >
              <span v-if="submittingPassword" class="loading-spinner"></span>
              {{ submittingPassword ? 'Menyimpan...' : 'Simpan Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════ TAB: PENGATURAN APLIKASI (superadmin) ══════════════ -->
    <div
      v-else-if="activeTab === 'aplikasi' && auth.isSuperAdmin"
      class="glass-card"
      style="padding:1.25rem; max-width:36rem;"
    >
      <div
        v-if="pengaturan.loading && !pengaturan.data"
        style="display:flex; justify-content:center; padding:2rem;"
      >
        <span class="loading-spinner"></span>
      </div>

      <form
        v-else
        @submit.prevent="handleSaveAplikasi"
        style="display:flex; flex-direction:column; gap:1.25rem;"
      >
        <div>
          <label class="input-label">Logo Instansi</label>
          <div style="display:flex; align-items:center; gap:1rem;">
            <div class="logo-preview">
              <img :src="logoPreview" alt="Preview logo" />
            </div>
            <div style="flex:1;">
              <input
                ref="logoInput"
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                style="display:none;"
                @change="handleLogoChange"
              />
              <button
                type="button"
                class="btn-secondary"
                style="font-size:0.78rem;"
                @click="logoInput.click()"
              >
                Pilih File Logo
              </button>
              <p
                style="font-size:0.7rem; color:var(--text-muted); margin:0.4rem 0 0;"
              >
                PNG, JPG, atau SVG — maks. 2MB
              </p>
            </div>
          </div>
        </div>

        <div>
          <label class="input-label">Nama Instansi</label>
          <input
            v-model="aplikasiForm.nama_instansi"
            type="text"
            class="input-field"
            placeholder="Contoh: Inspektorat Kabupaten Gorontalo"
          />
        </div>

        <div>
          <label class="input-label">Nama Aplikasi</label>
          <input
            v-model="aplikasiForm.nama_aplikasi"
            type="text"
            class="input-field"
            placeholder="SI PASTI"
          />
          <p
            style="font-size:0.7rem; color:var(--text-muted); margin:0.4rem 0 0;"
          >
            Nama ini akan tampil di sidebar menggantikan "SI PASTI".
          </p>
        </div>

        <div v-if="aplikasiError" class="alert-danger">
          <span>{{ aplikasiError }}</span>
        </div>

        <div style="display:flex; justify-content:flex-end;">
          <button
            type="submit"
            class="btn-primary"
            :disabled="submittingAplikasi"
          >
            <span v-if="submittingAplikasi" class="loading-spinner"></span>
            {{ submittingAplikasi ? 'Menyimpan...' : 'Simpan Pengaturan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePengaturanStore } from '@/stores/pengaturan'
import { useToast } from '@/composables/useToast'
import { ROLE_OPTIONS, BADGE_COLOR } from '@/utils/constants'
import logoDefault from '@/assets/images/logo.png'

const auth = useAuthStore()
const pengaturan = usePengaturanStore()
const toast = useToast()

const activeTab = ref('profil')

const roleLabel = computed(() => ROLE_OPTIONS.find(r => r.value === auth.user?.role)?.label || auth.user?.role)

// === Ganti Password ===
const submittingPassword = ref(false)
const passwordError = ref('')
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })

const handleChangePassword = async () => {
  passwordError.value = ''
  if (!passwordForm.value.oldPassword) { passwordError.value = 'Password lama wajib diisi.'; return }
  if (!passwordForm.value.newPassword || passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'Password baru minimal 6 karakter.'; return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Konfirmasi password tidak cocok.'; return
  }

  submittingPassword.value = true
  const result = await auth.changePassword(
    passwordForm.value.oldPassword,
    passwordForm.value.newPassword,
    passwordForm.value.confirmPassword
  )
  submittingPassword.value = false

  if (result.success) {
    toast.success('Password berhasil diubah.')
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } else {
    passwordError.value = result.message
  }
}

// === Pengaturan Aplikasi (superadmin) ===
const logoInput = ref(null)
const logoFile = ref(null)
const logoPreviewLocal = ref('')
const submittingAplikasi = ref(false)
const aplikasiError = ref('')
const aplikasiForm = ref({ nama_instansi: '', nama_aplikasi: '' })

const fileBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''

const logoPreview = computed(() => {
  if (logoPreviewLocal.value) return logoPreviewLocal.value
  if (pengaturan.data?.logo_path) {
    return `${fileBaseUrl}/${pengaturan.data.logo_path.replace(/\\/g, '/')}`
  }
  return logoDefault
})

const handleLogoChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  logoFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => { logoPreviewLocal.value = ev.target.result }
  reader.readAsDataURL(file)
}

const handleSaveAplikasi = async () => {
  aplikasiError.value = ''
  submittingAplikasi.value = true

  const result = await pengaturan.update({
    nama_instansi: aplikasiForm.value.nama_instansi,
    nama_aplikasi: aplikasiForm.value.nama_aplikasi,
    logo: logoFile.value || undefined
  })

  submittingAplikasi.value = false

  if (result.success) {
    toast.success('Pengaturan aplikasi berhasil disimpan.')
    logoFile.value = null
    logoPreviewLocal.value = ''
  } else {
    aplikasiError.value = result.message
  }
}

watch(
  () => pengaturan.data,
  (data) => {
    if (data) {
      aplikasiForm.value = {
        nama_instansi: data.nama_instansi || '',
        nama_aplikasi: data.nama_aplikasi || ''
      }
    }
  }
)

onMounted(async () => {
  if (auth.isSuperAdmin && !pengaturan.data) {
    await pengaturan.fetch()
  }
})
</script>

<style scoped>
.tabs-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
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

.logo-preview {
  width: 64px;
  height: 64px;
  border-radius: 0.6rem;
  border: 1px solid var(--border-color);
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.logo-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
