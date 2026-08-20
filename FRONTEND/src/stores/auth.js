import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('sipasti_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('sipasti_user') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isAdmin = computed(() => ['admin', 'superadmin'].includes(user.value?.role))
  const isAdminTL = computed(() => ['admin_tl', 'admin', 'superadmin'].includes(user.value?.role))
  const isIrban = computed(() => user.value?.role === 'irban')
  const isInspektur = computed(() => user.value?.role === 'inspektur')
  const isReadOnly = computed(() => ['irban', 'inspektur'].includes(user.value?.role))
  const keirbanan = computed(() => user.value?.keirbanan)
  const hasAllAccess = computed(() => user.value?.keirbanan === 'ALL')

  const login = async (nip, password) => {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('/auth/login', { nip, password })
      const { token: newToken, user: newUser } = res.data
      token.value = newToken
      user.value = newUser
      localStorage.setItem('sipasti_token', newToken)
      localStorage.setItem('sipasti_user', JSON.stringify(newUser))
      return { success: true, firstLogin: newUser.firstLogin }
    } catch (e) {
      error.value = e.response?.data?.message || 'Terjadi kesalahan.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    loading.value = true
    error.value = null
    try {
      await api.post('/auth/change-password', {
        oldPassword, newPassword, confirmPassword
      })
      if (user.value) {
        user.value.firstLogin = false
        localStorage.setItem('sipasti_user', JSON.stringify(user.value))
      }
      return { success: true }
    } catch (e) {
      error.value = e.response?.data?.message || 'Terjadi kesalahan.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('sipasti_token')
    localStorage.removeItem('sipasti_user')
    router.push('/login')
  }

  // Helper cek apakah user bisa edit (bukan read-only)
  const canEdit = computed(() =>
    ['superadmin', 'admin', 'admin_tl'].includes(user.value?.role)
  )

  // Helper cek apakah user bisa akses lintas keirbanan
  const isLintas = computed(() =>
    ['superadmin', 'admin_tl', 'inspektur'].includes(user.value?.role)
  )

  return {
    token, user, loading, error,
    isLoggedIn, isSuperAdmin, isAdmin,
    isAdminTL, isIrban, isInspektur,
    isReadOnly, keirbanan, hasAllAccess,
    login, changePassword, logout, canEdit,
    isLintas
  }
})