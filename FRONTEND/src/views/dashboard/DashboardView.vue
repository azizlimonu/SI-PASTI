<template>
  <component :is="dashboardComponent" />
</template>

<script setup>
import { defineAsyncComponent, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const DashboardInspektur = defineAsyncComponent(() => import('./DashboardInspekturView.vue'))
const DashboardTL = defineAsyncComponent(() => import('./DashboardTLView.vue'))
const DashboardIrban = defineAsyncComponent(() => import('./DashboardIrbanView.vue'))
const DashboardAdmin = defineAsyncComponent(() => import('./DashboardAdminView.vue'))

const auth = useAuthStore()

const dashboardComponent = computed(() => {
  const role = auth.user?.role
  if (role === 'inspektur') return DashboardInspektur
  if (role === 'admin_tl') return DashboardTL
  if (role === 'irban') return DashboardIrban
  return DashboardAdmin // superadmin and admin
})
</script>
