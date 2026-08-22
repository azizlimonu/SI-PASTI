<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <!-- ═══ HEADER ═══ -->
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <img :src="logoSrc" alt="Logo SI PASTI" class="sidebar-logo-img" />
        <Transition name="fade-text">
          <span v-if="!isCollapsed" class="sidebar-app-name">SI PASTI</span>
        </Transition>
      </div>
      <button
        class="sidebar-toggle"
        @click="isCollapsed = !isCollapsed"
        :title="isCollapsed ? 'Perluas' : 'Perkecil'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          style="width:14px;height:14px;"
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

    <!-- ═══ TAHUN AKTIF (hanya tampil kalau tidak collapsed) ═══ -->
    <Transition name="fade-text">
      <div
        v-if="!isCollapsed"
        class="tahun-selector"
        @click="showTahunModal = true"
      >
        <span class="tahun-label">Tahun PKPT</span>
        <div class="tahun-display">
          <span class="tahun-value">{{ ui.tahunAktif }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            style="width:12px;height:12px;color:var(--text-muted);"
          >
            <path
              d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z"
            />
            <path
              d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z"
            />
          </svg>
        </div>
      </div>
    </Transition>

    <!-- Modal Ganti Tahun -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showTahunModal"
          class="modal-overlay"
          @click.self="showTahunModal = false"
        >
          <div class="modal-container" style="max-width:20rem;">
            <div class="modal-header">
              <h3
                style="font-size:1rem; font-weight:600; color:var(--text-primary); margin:0;"
              >
                Pilih Tahun PKPT
              </h3>
              <button class="btn-icon" @click="showTahunModal = false">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style="width:18px;height:18px;color:var(--text-muted);"
                >
                  <path
                    d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                  />
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <p
                style="font-size:0.8rem; color:var(--text-muted); margin:0 0 1rem;"
              >
                Mengganti tahun akan me-reload halaman ke Dashboard dan memuat
                ulang data sesuai tahun yang dipilih.
              </p>
              <div style="display:flex; flex-direction:column; gap:0.5rem;">
                <button
                  v-for="tahun in daftarTahun"
                  :key="tahun"
                  :class="['tahun-option-btn', { active: ui.tahunAktif === tahun }]"
                  @click="gantiTahun(tahun)"
                >
                  {{ tahun }}
                  <svg
                    v-if="ui.tahunAktif === tahun"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    style="width:14px;height:14px;color:var(--accent);"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══ NAVIGATION ═══ -->
    <nav class="sidebar-nav">
      <!-- Dashboard — semua role -->
      <div class="nav-section">
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
          <Transition name="fade-text">
            <span v-if="!isCollapsed">Dashboard</span>
          </Transition>
        </RouterLink>
      </div>

      <!-- PKPT — superadmin, admin, irban, inspektur -->
      <div class="nav-section" v-if="showMenu('pkpt')">
        <span v-if="!isCollapsed" class="nav-label">Pengawasan</span>

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
          <Transition name="fade-text">
            <span v-if="!isCollapsed">PKPT</span>
          </Transition>
        </RouterLink>

        <!-- Penugasan — superadmin, admin, irban, inspektur -->
        <RouterLink
          v-if="showMenu('penugasan')"
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
          <Transition name="fade-text">
            <span v-if="!isCollapsed">Penugasan</span>
          </Transition>
        </RouterLink>
      </div>

      <!-- Dokumen & LHP — superadmin, admin, admin_tl, irban, inspektur -->
      <div class="nav-section" v-if="showMenu('dokumen')">
        <span v-if="!isCollapsed && !showMenu('pkpt')" class="nav-label"
          >Dokumen</span
        >

        <RouterLink
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
          <Transition name="fade-text">
            <span v-if="!isCollapsed">Dokumen & LHP</span>
          </Transition>
        </RouterLink>
      </div>

      <!-- Tindak Lanjut — semua role kecuali irban & inspektur (mereka lihat saja) -->
      <div class="nav-section" v-if="showMenu('tindaklanjut')">
        <span
          v-if="!isCollapsed && !showMenu('dokumen') && !showMenu('pkpt')"
          class="nav-label"
          >Tindak Lanjut</span
        >

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
          <Transition name="fade-text">
            <span v-if="!isCollapsed">Tindak Lanjut</span>
          </Transition>
        </RouterLink>
      </div>

      <!-- Monitoring & SKTJM — semua role -->
      <div class="nav-section">
        <span v-if="!isCollapsed" class="nav-label">Monitoring</span>

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
          <Transition name="fade-text">
            <span v-if="!isCollapsed">Monitoring</span>
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
          <Transition name="fade-text">
            <span v-if="!isCollapsed">Cek SKTJM</span>
          </Transition>
        </RouterLink>
      </div>

      <!-- Master Pihak — superadmin & admin saja -->
      <div class="nav-section" v-if="showMenu('pihak')">
        <span v-if="!isCollapsed" class="nav-label">Master Data</span>

        <RouterLink
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
          <Transition name="fade-text">
            <span v-if="!isCollapsed">Master Pihak</span>
          </Transition>
        </RouterLink>
      </div>

      <!-- Administrasi — superadmin & admin saja -->
      <div class="nav-section" v-if="showMenu('admin')">
        <span v-if="!isCollapsed" class="nav-label">Administrasi</span>

        <!-- Log Aktivitas — superadmin & admin -->
        <RouterLink
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
          <Transition name="fade-text">
            <span v-if="!isCollapsed">Log Aktivitas</span>
          </Transition>
        </RouterLink>

        <!-- Kelola User — superadmin saja -->
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
          <Transition name="fade-text">
            <span v-if="!isCollapsed">Kelola User</span>
          </Transition>
        </RouterLink>

        <!-- Settings — superadmin saja -->
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
          <Transition name="fade-text">
            <span v-if="!isCollapsed">Pengaturan</span>
          </Transition>
        </RouterLink>
      </div>
    </nav>

    <!-- ═══ FOOTER USER ═══ -->
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="user-avatar">
          {{ auth.user?.nama?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
        <Transition name="fade-text">
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
import { useUIStore } from '@/stores/ui'
import logoSrc from '@/assets/images/logo.png'

const route = useRoute()
const auth = useAuthStore()
const ui = useUIStore()
const isCollapsed = ref(false)

// ═══ ROLE LABEL ═══
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

// === Ganti Tahun PKPT ====
const showTahunModal = ref(false)

const currentYear = new Date().getFullYear()
const daftarTahun = Array.from(
  { length: 5 },
  (_, i) => currentYear + 1 - i
)

const gantiTahun = (tahun) => {
  if (ui.tahunAktif === tahun) {
    showTahunModal.value = false
    return
  }
  ui.setTahunAktif(tahun)
  showTahunModal.value = false
  router.push('/')
}

// ═══ MENU VISIBILITY PER ROLE ═══
const showMenu = (menu) => {
  const role = auth.user?.role

  const rules = {
    // PKPT: superadmin, admin, irban, inspektur (BUKAN admin_tl)
    pkpt: ['superadmin', 'admin', 'irban', 'inspektur'].includes(role),

    // Penugasan: sama dengan PKPT
    penugasan: ['superadmin', 'admin', 'irban', 'inspektur'].includes(role),

    // Dokumen: semua role
    dokumen: ['superadmin', 'admin', 'admin_tl', 'irban', 'inspektur'].includes(role),

    // Tindak Lanjut: semua role
    tindaklanjut: ['superadmin', 'admin', 'admin_tl', 'irban', 'inspektur'].includes(role),

    // Master Pihak: superadmin & admin saja
    pihak: ['superadmin', 'admin'].includes(role),

    // Administrasi (Log, User, Settings): superadmin & admin saja
    admin: ['superadmin', 'admin'].includes(role),
  }

  return rules[menu] ?? false
}
</script>

<style scoped>
/* ═══════════════════ WRAPPER ═══════════════════ */
.sidebar {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease, min-width 0.25s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 60px;
  min-width: 60px;
}

/* ═══════════════════ HEADER ═══════════════════ */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  height: 60px;
  min-height: 60px;
  border-bottom: 1px solid var(--border-color);
  gap: 0.5rem;
  flex-shrink: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  overflow: hidden;
  flex: 1;
  min-width: 0;
}

.sidebar-logo-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 5px;
}

.sidebar-app-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-shadow: 0 0 12px var(--accent-glow);
}

.sidebar-toggle {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-input);
}

/* ═══════════════════ TAHUN SELECTOR ═══════════════════ */
.tahun-selector {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.tahun-label {
  display: block;
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.375rem;
}

.tahun-tabs {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.tahun-btn {
  font-size: 0.72rem;
  font-weight: 500;
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-color);
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.tahun-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.tahun-btn.active {
  background-color: var(--accent-light);
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}

/* ═══════════════════ NAV ═══════════════════ */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.625rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.nav-section {
  margin-bottom: 0.375rem;
}

.nav-label {
  display: block;
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.4rem 0.625rem 0.2rem;
  white-space: nowrap;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.collapsed .sidebar-link {
  justify-content: center;
  padding: 0.6rem;
}

/* ═══════════════════ FOOTER ═══════════════════ */
.sidebar-footer {
  padding: 0.5rem;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 0.75rem;
  background: var(--bg-hover);
  overflow: hidden;
  min-width: 0;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #60a5fa);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 0 8px var(--accent-glow);
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.user-name {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.62rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ═══════════════════ TRANSITIONS ═══════════════════ */
.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 0.15s ease;
  overflow: hidden;
}

.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}

/* =================== STYLE TAHUN PKPT ================ */
.tahun-selector {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.15s;
}

.tahun-selector:hover {
  background: var(--bg-hover);
}

.tahun-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
}

.tahun-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent);
  text-shadow: 0 0 10px var(--accent-glow);
}

.tahun-option-btn {
  width: 100%;
  padding: 0.625rem 1rem;
  border-radius: 0.625rem;
  border: 1px solid var(--border-color);
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tahun-option-btn:hover {
  background: var(--bg-input);
  color: var(--text-primary);
}

.tahun-option-btn.active {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent);
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
