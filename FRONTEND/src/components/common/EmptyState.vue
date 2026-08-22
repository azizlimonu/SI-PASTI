<template>
  <div class="empty-state-wrap">
    <div class="empty-icon-wrap">
      <slot name="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="empty-icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
          />
        </svg>
      </slot>
    </div>

    <h4 class="empty-title">{{ title }}</h4>
    <p v-if="description" class="empty-desc">{{ description }}</p>

    <div v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Belum Ada Data' },
  description: { type: String, default: 'Data belum tersedia atau tidak sesuai dengan filter pencarian.' }
})
</script>

<style scoped>
.empty-state-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 1.5rem;
  text-align: center;
}

.empty-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 1rem;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  margin-bottom: 1rem;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
}

.empty-icon {
  width: 28px;
  height: 28px;
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0 0 0.35rem;
}

.empty-desc {
  font-size: 0.8rem;
  color: #64748b;
  max-width: 360px;
  margin: 0;
  line-height: 1.5;
}

.empty-action {
  margin-top: 1.25rem;
}
</style>
