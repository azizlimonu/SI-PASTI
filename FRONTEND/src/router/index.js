import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/ganti-password',
      name: 'change-password',
      component: () => import('@/views/auth/ChangePasswordView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue')
        },
        {
          path: 'pkpt',
          name: 'pkpt',
          component: () => import('@/views/pkpt/PkptListView.vue'),
          meta: { filterTahun: true }
        }, ,
        {
          path: 'pkpt/:id',
          name: 'pkpt-detail',
          component: () => import('@/views/pkpt/PkptDetailView.vue')
        },
        {
          path: 'penugasan',
          name: 'penugasan',
          component: () => import('@/views/penugasan/PenugasanListView.vue'),
          meta: { filterTahun: true }
        },
        {
          path: 'penugasan/:id',
          name: 'penugasan-detail',
          component: () => import('@/views/penugasan/PenugasanDetailView.vue'),
          meta: { filterTahun: true }
        },
        {
          path: 'tindak-lanjut',
          name: 'tindak-lanjut',
          component: () => import('@/views/tindaklanjut/TLListView.vue')
        },
        {
          path: 'monitoring',
          name: 'monitoring',
          component: () => import('@/views/monitoring/MonitoringView.vue')
        },
        {
          path: 'sktjm',
          name: 'sktjm',
          component: () => import('@/views/monitoring/SktjmView.vue')
        },
        {
          path: 'pihak',
          name: 'pihak',
          component: () => import('@/views/pihak/PihakListView.vue')
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/users/UserManagementView.vue'),
          meta: { requiresSuperAdmin: true }
        },
        {
          path: 'log',
          name: 'log',
          component: () => import('@/views/log/LogView.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/SettingsView.vue'),
          meta: { requiresSuperAdmin: true }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresGuest && auth.isLoggedIn) return next('/')
  if (to.meta.requiresAuth && !auth.isLoggedIn) return next('/login')
  if (to.meta.requiresSuperAdmin && !auth.isSuperAdmin) return next('/')
  if (to.meta.requiresAdmin && !auth.isAdmin) return next('/')
  if (auth.isLoggedIn && auth.user?.firstLogin && to.name !== 'change-password') {
    return next('/ganti-password')
  }

  next()
})

export default router