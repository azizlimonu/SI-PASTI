<template>
  <aside :class="['sidebar', { 'sidebar-collapsed': isCollapsed }]">
    <!-- Header Sidebar -->
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          alt="Logo"
          class="sidebar-logo-img"
        />
        <div v-else class="sidebar-logo-placeholder">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            style="width:20px;height:20px;color:var(--color-primary-400);"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
            />
          </svg>
        </div>
        <Transition name="fade">
          <div v-if="!isCollapsed" class="sidebar-logo-text">
            <span class="logo-app-name">SI PASTI</span>
            <span class="logo-instansi">Inspektorat Kab. Gorontalo</span>
          </div>
        </Transition>
      </div>

      <!-- Toggle Button -->
      <button class="sidebar-toggle" @click="isCollapsed = !isCollapsed">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          style="width:16px;height:16px;"
        >
          <path
            v-if="!isCollapsed"
            fill-rule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clip-rule="evenodd"
          />
          <path
            v-else
            fill-rule="evenodd"
            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <!-- Dashboard -->
      <div class="nav-section">
        <span v-if="!isCollapsed" class="nav-section-label">Menu Utama</span>
        <RouterLink
          to="/"
          class="sidebar-link"
          :class="{ active: route.path === '/' }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="nav-icon"
          >
            <path
              fill-rule="evenodd"
              d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
              clip-rule="evenodd"
            />
          </svg>
          <Transition name="fade">
            <span v-if="!isCollapsed">Dashboard</span>
          </Transition>
        </RouterLink>
      </div>

      <!-- PKPT & Penugasan -->
      <div
        class="nav-section"
        v-if="!auth.isReadOnly || auth.isIrban || auth.isInspektur"
      >
        <span v-if="!isCollapsed" class="nav-section-label">Pengawasan</span>

        <RouterLink
          to="/pkpt"
          class="sidebar-link"
          :class="{ active: route.path.startsWith('/pkpt') }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="nav-icon"
          >
            <path
              fill-rule="evenodd"
              d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm2 3a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm1 3a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H7Zm-1 5a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Z"
              clip-rule="evenodd"
            />
          </svg>
          <Transition name="fade">
            <span v-if="!isCollapsed">PKPT</span>
          </Transition>
        </RouterLink>

        <RouterLink
          to="/penugasan"
          class="sidebar-link"
          :class="{ active: route.path.startsWith('/penugasan') }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="nav-icon"
          >
            <path
              d="M5.127 3.502 5.25 3.5h9.5c.041 0 .082 0 .123.002A2.251 2.251 0 0 0 12.75 2h-5.5a2.25 2.25 0 0 0-2.123 1.502ZM1 10.25A2.25 2.25 0 0 1 3.25 8h13.5A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5ZM3.25 6.5c-.04 0-.082 0-.123.002A2.25 2.25 0 0 1 5.25 5h9.5a2.25 2.25 0 0 1 2.123 1.502A3.819 3.819 0 0 0 16.75 6.5H3.25Z"
            />
          </svg>
          <Transition name="fade">
            <span v-if="!isCollapsed">Penugasan</span>
          </Transition>
        </RouterLink>
      </div>

      <!-- Dokumen & TL -->
      <div class="nav-section" v-if="auth.isAdmin || auth.isAdminTL">
        <span v-if="!isCollapsed" class="nav-section-label">Dokumen</span>

        <RouterLink
          v-if="auth.isAdmin"
          to="/dokumen"
          class="sidebar-link"
          :class="{ active: route.path.startsWith('/dokumen') || route.path.startsWith('/lhp') }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="nav-icon"
          >
            <path
              fill-rule="evenodd"
              d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z"
              clip-rule="evenodd"
            />
          </svg>
          <Transition name="fade">
            <span v-if="!isCollapsed">Dokumen & LHP</span>
          </Transition>
        </RouterLink>

        <RouterLink
          to="/tindak-lanjut"
          class="sidebar-link"
          :class="{ active: route.path.startsWith('/tindak-lanjut') }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="nav-icon"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
              clip-rule="evenodd"
            />
          </svg>
          <Transition name="fade">
            <span v-if="!isCollapsed">Tindak Lanjut</span>
          </Transition>
        </RouterLink>
      </div>

      <!-- Monitoring -->
      <div class="nav-section">
        <span v-if="!isCollapsed" class="nav-section-label">Monitoring</span>

        <RouterLink
          to="/monitoring"
          class="sidebar-link"
          :class="{ active: route.path === '/monitoring' }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="nav-icon"
          >
            <path
              d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9a1.5 1.5 0 0 0 3 0v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 3.5 10Z"
            />
          </svg>
          <Transition name="fade">
            <span v-if="!isCollapsed">Monitoring PKPT</span>
          </Transition>
        </RouterLink>

        <RouterLink
          to="/sktjm"
          class="sidebar-link"
          :class="{ active: route.path === '/sktjm' }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="nav-icon"
          >
            <path
              fill-rule="evenodd"
              d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
              clip-rule="evenodd"
            />
          </svg>
          <Transition name="fade">
            <span v-if="!isCollapsed">Cek SKTJM</span>
          </Transition>
        </RouterLink>

        <RouterLink
          v-if="auth.isAdmin"
          to="/pihak"
          class="sidebar-link"
          :class="{ active: route.path.startsWith('/pihak') }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="nav-icon"
          >
            <path
              d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.153c.176.433-.02.911-.438 1.07A13.901 13.901 0 0 1 14.5 16Z"
            />
          </svg>
          <Transition name="fade">
            <span v-if="!isCollapsed">Master Pihak</span>
          </Transition>
        </RouterLink>
      </div>

      <!-- Admin Section -->
      <div class="nav-section" v-if="auth.isAdmin">
        <span v-if="!isCollapsed" class="nav-section-label">Administrasi</span>

        <RouterLink
          v-if="auth.isAdmin"
          to="/log"
          class="sidebar-link"
          :class="{ active: route.path === '/log' }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="nav-icon"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
              clip-rule="evenodd"
            />
          </svg>
          <Transition name="fade">
            <span v-if="!isCollapsed">Log Aktivitas</span>
          </Transition>
        </RouterLink>

        <RouterLink
          v-if="auth.isSuperAdmin"
          to="/users"
          class="sidebar-link"
          :class="{ active: route.path === '/users' }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="nav-icon"
          >
            <path
              d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z"
            />
          </svg>
          <Transition name="fade">
            <span v-if="!isCollapsed">Kelola User</span>
          </Transition>
        </RouterLink>

        <RouterLink
          v-if="auth.isSuperAdmin"
          to="/settings"
          class="sidebar-link"
          :class="{ active: route.path === '/settings' }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="nav-icon"
          >
            <path
              fill-rule="evenodd"
              d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              clip-rule="evenodd"
            />
          </svg>
          <Transition name="fade">
            <span v-if="!isCollapsed">Pengaturan</span>
          </Transition>
        </RouterLink>
      </div>
    </nav>

    <!-- User Info Bottom -->
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="user-avatar">
          {{ auth.user?.nama?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
        <Transition name="fade">
          <div v-if="!isCollapsed" class="user-info">
            <span class="user-name">{{ auth.user?.nama || 'User' }}</span>
            <span class="user-role">{{ roleLabel }}</span>
          </div>
        </Transition>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const isCollapsed = ref(false)
const logoUrl = ref(null) // nanti diisi dari settings

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
</script>

<style scoped>
.sidebar {
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
}
.sidebar-collapsed {
  width: 68px;
  min-width: 68px;
}

/* HEADER */
.sidebar-header {
  border-bottom: 1px solid var(--border-color);
}


.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
  padding: 10px;
}

.sidebar-logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 8px;
}

.sidebar-logo-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding : 10px;
}

.sidebar-logo-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding:10px;
}

.logo-app-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}

.logo-instansi {
  font-size: 0.65rem;
  color: #64748b;
  white-space: nowrap;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

/* NAV */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-section {
  margin-bottom: 0.5rem;
}

.nav-section-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.5rem 0.75rem 0.25rem;
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* FOOTER */
.sidebar-footer {
  border-top: 1px solid var(--border-color);
}

.sidebar-user {
  background: var(--bg-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.65rem;
  color: #64748b;
  white-space: nowrap;
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
