<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengaturan</h1>
        <p class="page-subtitle">Profil Akun &amp; Keamanan</p>
      </div>
    </div>

    <div
      style="display:flex; flex-direction:column; gap:1rem; max-width:36rem;"
    >
      <!-- Profil -->
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

      <!-- Ganti Password -->
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
              v-model="form.oldPassword"
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
              v-model="form.newPassword"
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
              v-model="form.confirmPassword"
              type="password"
              class="input-field"
              autocomplete="new-password"
            />
          </div>
          <div v-if="errorMsg" class="alert-danger">
            <span>{{ errorMsg }}</span>
          </div>
          <div style="display:flex; justify-content:flex-end;">
            <button type="submit" class="btn-primary" :disabled="submitting">
              <span v-if="submitting" class="loading-spinner"></span>
              {{ submitting ? 'Menyimpan...' : 'Simpan Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { ROLE_OPTIONS, BADGE_COLOR } from '@/utils/constants'

const auth = useAuthStore()
const toast = useToast()

const submitting = ref(false)
const errorMsg = ref('')

const form = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })

const roleLabel = computed(() => ROLE_OPTIONS.find(r => r.value === auth.user?.role)?.label || auth.user?.role)

const handleChangePassword = async () => {
  errorMsg.value = ''
  if (!form.value.oldPassword) { errorMsg.value = 'Password lama wajib diisi.'; return }
  if (!form.value.newPassword || form.value.newPassword.length < 6) { errorMsg.value = 'Password baru minimal 6 karakter.'; return }
  if (form.value.newPassword !== form.value.confirmPassword) { errorMsg.value = 'Konfirmasi password tidak cocok.'; return }

  submitting.value = true
  const result = await auth.changePassword(form.value.oldPassword, form.value.newPassword, form.value.confirmPassword)
  submitting.value = false

  if (result.success) {
    toast.success('Password berhasil diubah.')
    form.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } else {
    errorMsg.value = result.message
  }
}
</script>
