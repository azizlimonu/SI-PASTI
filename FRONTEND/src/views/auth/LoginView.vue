<template>
  <div class="login-wrapper">
    <!-- Particle Background -->
    <div id="particles-js" class="particles-bg"></div>

    <!-- Content -->
    <div class="login-content">
      <!-- LEFT — Branding (polos, tanpa card, mengikuti proporsi referensi) -->
      <div class="login-left">
        <!-- Top: mark + nama instansi -->
        <div class="brand-top">
          <div class="brand-mark">
            <img
              v-if="logoUrl"
              :src="logoUrl"
              alt="Logo Instansi"
              class="brand-mark-img"
            />
            <div v-else class="brand-mark-placeholder">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                style="width:22px;height:22px;color:var(--color-primary-400);"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                />
              </svg>
            </div>
          </div>
          <div>
            <p class="brand-mark-name">SI PASTI</p>
            <p class="brand-mark-sub">Inspektorat Kab. Gorontalo</p>
          </div>
        </div>

        <!-- Middle: headline -->
        <div class="brand-middle">
          <p class="brand-eyebrow">Selamat Datang di SI PASTI</p>
          <h1 class="brand-title">
            Sistem Informasi<br />Pengelolaan Arsip Terpusat
          </h1>
          <p class="brand-subtitle">
            Pengelolaan pengawasan internal secara terintegrasi — mulai dari
            PKPT, penugasan, dokumen hasil pemeriksaan, hingga tindak lanjut
            rekomendasi.
          </p>
        </div>

        <!-- Bottom: footer note -->
        <div class="brand-bottom">
          <p>Inspektorat Daerah Kabupaten Gorontalo</p>
        </div>
      </div>

      <!-- RIGHT — Form Login (card tunggal, lebar tetap) -->
      <div class="login-right">
        <div class="login-form-card">
          <div class="form-header">
            <div class="form-logo">
              <img
                v-if="logoUrl"
                :src="logoUrl"
                alt="Logo Instansi"
                class="form-logo-img"
              />
              <div v-else class="form-logo-placeholder">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  style="width:28px;height:28px;color:var(--color-primary-400);"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                  />
                </svg>
              </div>
            </div>
            <h2 class="form-title">Masuk ke Akun Anda</h2>
            <p class="form-subtitle">Masukkan NIP dan password Anda</p>
          </div>

          <!-- Error Alert — slot tinggi reserved, card tidak ikut berubah ukuran -->
          <div class="alert-slot">
            <Transition name="alert-fade">
              <div v-if="errorMsg" class="alert-danger">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style="width:18px;height:18px;flex-shrink:0;"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span style="font-size:0.875rem;">{{ errorMsg }}</span>
              </div>
            </Transition>
          </div>

          <!-- Form -->
          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            <!-- NIP -->
            <div>
              <label class="input-label">NIP</label>
              <div style="position:relative;">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:#64748b;"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  />
                </svg>
                <input
                  v-model="form.nip"
                  type="text"
                  class="input-field"
                  style="padding-left:2.5rem;"
                  placeholder="Masukkan NIP Anda"
                  maxlength="20"
                  @keydown.enter="handleLogin"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="input-label">Password</label>
              <div style="position:relative;">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:#64748b;"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input-field"
                  style="padding-left:2.5rem; padding-right:2.5rem;"
                  placeholder="Masukkan password Anda"
                  @keydown.enter="handleLogin"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#64748b;"
                >
                  <svg
                    v-if="!showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style="width:18px;height:18px;"
                  >
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path
                      fill-rule="evenodd"
                      d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style="width:18px;height:18px;"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                      clip-rule="evenodd"
                    />
                    <path
                      d="M10.748 13.93l2.523 2.523a10.003 10.003 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              class="btn-primary"
              style="width:100%; justify-content:center; padding:0.75rem;"
              :disabled="loading"
              @click="handleLogin"
            >
              <span v-if="loading" class="loading-spinner"></span>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                style="width:18px;height:18px;"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                  clip-rule="evenodd"
                />
                <path
                  fill-rule="evenodd"
                  d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ loading ? 'Memverifikasi...' : 'Masuk' }}
            </button>
          </div>

          <p class="form-footer-note">
            Hubungi administrator untuk mendapatkan akses
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ nip: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const logoUrl = ref(null)

const handleLogin = async () => {
  errorMsg.value = ''

  if (!form.value.nip || !form.value.password) {
    errorMsg.value = 'NIP dan password wajib diisi.'
    return
  }

  loading.value = true
  const result = await auth.login(form.value.nip, form.value.password)
  loading.value = false

  if (!result.success) {
    errorMsg.value = result.message
    return
  }

  if (result.firstLogin) {
    router.push('/ganti-password')
  } else {
    router.push('/')
  }
}

onMounted(() => {
  // Load particles jika tersedia
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 60, density: { enable: true, value_area: 800 } },
        color: { value: '#3b82f6' },
        shape: { type: 'circle' },
        opacity: { value: 0.4, random: true },
        size: { value: 2.5, random: true },
        line_linked: { enable: true, distance: 150, color: '#60a5fa', opacity: 0.2, width: 1 },
        move: { enable: true, speed: 1.2, random: true, out_mode: 'bounce' }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' }
        },
        modes: {
          grab: { distance: 160, line_linked: { opacity: 0.5 } },
          push: { particles_nb: 3 }
        }
      },
      retina_detect: true
    })
  }
})
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #050d1a 0%, #0a0f1e 50%, #0f1629 100%);
  position: relative;
  display: flex;
  overflow: hidden;
}

.particles-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.login-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  width: 100%;
  min-height: 100vh;
}

/* ═══════════════════════════════════════════
   LEFT — polos, tersebar top/middle/bottom
═══════════════════════════════════════════ */
.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem clamp(2rem, 6vw, 5rem);
}

.brand-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-mark {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.brand-mark-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-mark-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-mark-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.02em;
}

.brand-mark-sub {
  font-size: 0.7rem;
  color: #64748b;
}

.brand-middle {
  max-width: 480px;
}

.brand-eyebrow {
  font-size: 0.85rem;
  color: #60a5fa;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.brand-title {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
  color: white;
  line-height: 1.25;
  letter-spacing: -0.01em;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.35);
  margin-bottom: 1rem;
}

.brand-subtitle {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.7;
}

.brand-bottom {
  font-size: 0.75rem;
  color: #475569;
}

/* ═══════════════════════════════════════════
   RIGHT — card tunggal, lebar tetap
═══════════════════════════════════════════ */
.login-right {
  flex-shrink: 0;
  width: min(460px, 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem clamp(1rem, 4vw, 3rem);
}

.login-form-card {
  width: 100%;
  background: rgba(15, 22, 41, 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(30, 58, 95, 0.5);
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-sizing: border-box;
}

.form-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
}

.form-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.form-logo-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 24px rgba(59, 130, 246, 0.25);
}

.form-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.375rem;
}

.form-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
}

.form-footer-note {
  text-align: center;
  font-size: 0.75rem;
  color: #475569;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid color-mix(in srgb, var(--color-navy-600) 50%, transparent);
}

/* ALERT SLOT — ruang reserved supaya card tidak berubah ukuran
   saat pesan error muncul/hilang */
.alert-slot {
  min-height: 3.25rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: flex-start;
}

.alert-slot .alert-danger {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.6); }
}

@media (max-width: 768px) {
  .login-content {
    flex-direction: column;
  }

  .login-left {
    display: none;
  }

  .login-right {
    width: 100%;
    min-height: 100vh;
    padding: 1.5rem;
  }
}
</style>
