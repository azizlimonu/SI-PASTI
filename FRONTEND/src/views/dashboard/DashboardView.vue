<template>
  <component :is="dashboardComponent" />
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const dashboardComponent = computed(() => {
  switch (auth.user?.role) {
    case 'inspektur': return defineAsyncComponent(() => import('./DashboardInspekturView.vue'))
    case 'admin_tl': return defineAsyncComponent(() => import('./DashboardTLView.vue'))
    case 'irban': return defineAsyncComponent(() => import('./DashboardIrbanView.vue'))
    default: return defineAsyncComponent(() => import('./DashboardAdminView.vue'))
  }
})
</script>

<script>
import { defineAsyncComponent } from 'vue'
</script>
