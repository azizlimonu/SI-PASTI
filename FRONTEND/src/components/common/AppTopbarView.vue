<template>
  <header class="topbar">
    <!-- Breadcrumb -->
    <div class="topbar-left">
      <nav class="breadcrumb">
        <RouterLink to="/" class="breadcrumb-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            style="width:14px;height:14px;"
          >
            <path
              d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z"
            />
          </svg>
        </RouterLink>
        <template v-if="breadcrumbs.length > 0">
          <span class="breadcrumb-sep">/</span>
          <span
            v-for="(crumb, i) in breadcrumbs"
            :key="i"
            class="breadcrumb-item"
            :class="{ 'breadcrumb-active': i === breadcrumbs.length - 1 }"
          >
            {{ crumb }}
            <span v-if="i < breadcrumbs.length - 1" class="breadcrumb-sep"
              >/</span
            >
          </span>
        </template>
      </nav>
    </div>

    <!-- Right -->
    <div class="topbar-right">
      <!-- Date -->
      <span class="topbar-date">{{ currentDate }}</span>

      <!-- Keirbanan Badge -->
      <span v-if="auth.user?.keirbanan !== 'ALL'" class="badge badge-blue">
        Keirbanan {{ auth.user?.keirbanan }}
      </span>
      <span v-else class="badge badge-purple"> Semua Keirbanan </span>

      <!-- User Dropdown -->
      <div class="user-dropdown" ref="dropdownRef">
        <button class="user-btn" @click="dropdownOpen = !dropdownOpen">
          <div class="topbar-avatar">
            {{ auth.user?.nama?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <span
            class="topbar-username"
            >{{ auth.user?.nama?.split(' ')[0] || 'User' }}</span
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            :style="{ width:'14px', height:'14px', transition:'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }"
          >
            <path
              fill-rule="evenodd"
              d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="dropdown">
          <div v-if="dropdownOpen" class="dropdown-menu">
            <!-- User Info -->
            <div class="dropdown-user-info">
              <div class="dropdown-avatar">
                {{ auth.user?.nama?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
              <div>
                <p class="dropdown-name">{{ auth.user?.nama }}</p>
                <p class="dropdown-nip">NIP: {{ auth.user?.nip }}</p>
                <p class="dropdown-role">{{ roleLabel }}</p>
              </div>
            </div>

            <div class="dropdown-divider"></div>

            <!-- Menu Items -->
            <RouterLink
              to="/ganti-password"
              class="dropdown-item"
              @click="dropdownOpen = false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                style="width:15px;height:15px;"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
                  clip-rule="evenodd"
                />
              </svg>
              Ganti Password
            </RouterLink>

            <div class="dropdown-divider"></div>

            <button
              class="dropdown-item dropdown-item-danger"
              @click="handleLogout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                style="width:15px;height:15px;"
              >
                <path
                  fill-rule="evenodd"
                  d="M2 4.75A2.75 2.75 0 0 1 4.75 2h3a2.75 2.75 0 0 1 2.75 2.75v.5a.75.75 0 0 1-1.5 0v-.5c0-.69-.56-1.25-1.25-1.25h-3c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h3c.69 0 1.25-.56 1.25-1.25v-.5a.75.75 0 0 1 1.5 0v.5A2.75 2.75 0 0 1 7.75 14h-3A2.75 2.75 0 0 1 2 11.25v-6.5Zm9.47.47a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H5.25a.75.75 0 0 1 0-1.5h7.19l-.97-.97a.75.75 0 0 1 0-1.06Z"
                  clip-rule="evenodd"
                />
              </svg>
              Keluar
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
dayjs.locale('id')

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const currentDate = computed(() =>
  dayjs().format('dddd, D MMMM YYYY')
)

const breadcrumbs = computed(() => {
  const map = {
    '/pkpt': ['PKPT'],
    '/penugasan': ['Penugasan'],
    '/dokumen': ['Dokumen & LHP'],
    '/tindak-lanjut': ['Tindak Lanjut'],
    '/monitoring': ['Monitoring'],
    '/sktjm': ['Monitoring', 'Cek SKTJM'],
    '/pihak': ['Master Pihak'],
    '/users': ['Kelola User'],
    '/log': ['Log Aktivitas'],
    '/settings': ['Pengaturan'],
    '/ganti-password': ['Ganti Password'],
  }
  const path = route.path
  for (const key of Object.keys(map).sort((a, b) => b.length - a.length)) {
    if (path.startsWith(key)) return map[key]
  }
  return []
})

const roleLabel = computed(() => {
  const labels = {
    superadmin: 'Super Admin',
    admin: `Admin Keirbanan ${auth.user?.keirbanan}`,
    admin_tl: 'Admin Tindak Lanjut',
    irban: `Irban ${auth.user?.keirbanan}`,
    inspektur: 'Inspektur'
  }
  return labels[auth.user?.role] || auth.user?.role
})

const handleLogout = () => {
  dropdownOpen.value = false
  auth.logout()
}

// Close dropdown on outside click
const handleOutsideClick = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style scoped>
.topbar {
  height: 60px;
  min-height: 60px;
  background-color: var(--color-navy-800);
  border-bottom: 1px solid color-mix(in srgb, var(--color-navy-600) 50%, transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* BREADCRUMB */
.topbar-left { display: flex; align-items: center; }

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
}

.breadcrumb-item {
  color: #64748b;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: color 0.2s;
}

.breadcrumb-item:hover { color: #94a3b8; }

.breadcrumb-active { color: #e2e8f0; font-weight: 500; }

.breadcrumb-sep { color: #334155; }

/* RIGHT */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.topbar-date {
  font-size: 0.75rem;
  color: #475569;
  white-space: nowrap;
}

/* USER DROPDOWN */
.user-dropdown { position: relative; }

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: color-mix(in srgb, var(--color-navy-700) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-navy-600) 50%, transparent);
  border-radius: 0.75rem;
  padding: 0.375rem 0.75rem 0.375rem 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.user-btn:hover {
  background-color: var(--color-navy-700);
  border-color: var(--color-navy-600);
}

.topbar-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.topbar-username {
  font-size: 0.8rem;
  font-weight: 500;
  color: #e2e8f0;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* DROPDOWN MENU */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  background-color: var(--color-navy-800);
  border: 1px solid color-mix(in srgb, var(--color-navy-600) 50%, transparent);
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  z-index: 50;
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
}

.dropdown-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.dropdown-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-nip {
  font-size: 0.7rem;
  color: #64748b;
  font-family: var(--font-mono);
}

.dropdown-role {
  font-size: 0.7rem;
  color: #60a5fa;
}

.dropdown-divider {
  height: 1px;
  background-color: color-mix(in srgb, var(--color-navy-600) 50%, transparent);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.8rem;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.15s;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background-color: color-mix(in srgb, var(--color-navy-700) 60%, transparent);
  color: white;
}

.dropdown-item-danger { color: #f87171; }
.dropdown-item-danger:hover { background-color: rgba(239, 68, 68, 0.1); color: #f87171; }

/* TRANSITIONS */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
