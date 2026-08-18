<template>
  <div
    style="display:flex; height:100vh; overflow:hidden; background-color:var(--color-navy-900);"
  >
    <AppSidebar />
    <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
      <AppTopbar />
      <main style="flex:1; overflow-y:auto; padding:1.5rem;">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppTopbar from '@/components/common/AppTopbar.vue'
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
