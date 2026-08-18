<template>
  <div class="login-wrapper">
    <div
      style="position:relative; z-index:1; width:100%; max-width:440px; padding:1.5rem;"
    >
      <div class="login-form-card">
        <!-- Icon -->
        <div style="text-align:center; margin-bottom:1.5rem;">
          <div
            style="width:56px;height:56px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:1rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              style="width:24px;height:24px;color:var(--color-primary-400);"
            >
              <path
                fill-rule="evenodd"
                d="M8 7a5 5 0 000 10h4a5 5 0 000-10H8zm5 8a3 3 0 110-6 3 3 0 010 6z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h2 class="form-title">Ganti Password</h2>
          <p class="form-subtitle">
            Ini adalah login pertama Anda. Silakan ganti password default
            sebelum melanjutkan.
          </p>
        </div>

        <!-- Error -->
        <div v-if="errorMsg" class="alert-danger" style="margin-bottom:1rem;">
          <span style="font-size:0.875rem;">{{ errorMsg }}</span>
        </div>

        <!-- Success -->
        <div
          v-if="successMsg"
          class="alert-success"
          style="margin-bottom:1rem;"
        >
          <span style="font-size:0.875rem;">{{ successMsg }}</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:1rem;">
          <div>
            <label class="input-label">Password Lama</label>
            <input
              v-model="form.oldPassword"
              type="password"
              class="input-field"
              placeholder="Password lama"
            />
          </div>
          <div>
            <label class="input-label">Password Baru</label>
            <input
              v-model="form.newPassword"
              type="password"
              class="input-field"
              placeholder="Minimal 8 karakter"
            />
          </div>
          <div>
            <label class="input-label">Konfirmasi Password Baru</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              class="input-field"
              placeholder="Ulangi password baru"
            />
          </div>

          <button
            class="btn-primary"
            style="width:100%; justify-content:center; padding:0.75rem; margin-top:0.5rem;"
            :disabled="loading"
            @click="handleChangePassword"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Menyimpan...' : 'Simpan Password' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleChangePassword = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!form.value.oldPassword || !form.value.newPassword || !form.value.confirmPassword) {
    errorMsg.value = 'Semua field wajib diisi.'
    return
  }
  if (form.value.newPassword.length < 8) {
    errorMsg.value = 'Password baru minimal 8 karakter.'
    return
  }
  if (form.value.newPassword !== form.value.confirmPassword) {
    errorMsg.value = 'Konfirmasi password tidak cocok.'
    return
  }
  if (form.value.newPassword === form.value.oldPassword) {
    errorMsg.value = 'Password baru tidak boleh sama dengan password lama.'
    return
  }

  loading.value = true
  const result = await auth.changePassword(
    form.value.oldPassword,
    form.value.newPassword,
    form.value.confirmPassword
  )
  loading.value = false

  if (!result.success) {
    errorMsg.value = result.message
    return
  }

  successMsg.value = 'Password berhasil diubah! Mengalihkan...'
  setTimeout(() => router.push('/'), 1500)
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #050d1a 0%, #0a0f1e 50%, #0f1629 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form-card {
  background: rgba(15, 22, 41, 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(30, 58, 95, 0.5);
  border-radius: 1.5rem;
  padding: 2rem;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.5;
}
</style>
