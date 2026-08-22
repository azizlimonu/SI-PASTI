<template>
  <div class="pagination-container">
    <div class="pagination-info">
      Menampilkan
      <span class="pagination-highlight">{{ fromItem }}</span>
      -
      <span class="pagination-highlight">{{ toItem }}</span>
      dari
      <span class="pagination-highlight">{{ total }}</span>
      data
    </div>

    <div v-if="totalPages > 1" class="pagination-controls">
      <!-- First Page -->
      <button
        type="button"
        class="page-btn"
        :disabled="currentPage <= 1"
        @click="goToPage(1)"
        title="Halaman Pertama"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5">
          <path fill-rule="evenodd" d="M11.78 12.78a.75.75 0 0 1-1.06 0L6.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L8.06 8l3.72 3.72a.75.75 0 0 1 0 1.06ZM5.5 2.75a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0V2.75Z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Previous Page -->
      <button
        type="button"
        class="page-btn"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
        title="Sebelumnya"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5">
          <path fill-rule="evenodd" d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Page Numbers -->
      <template v-for="(page, idx) in visiblePages" :key="idx">
        <span v-if="page === '...'" class="page-ellipsis">...</span>
        <button
          v-else
          type="button"
          :class="['page-btn', { active: page === currentPage }]"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </template>

      <!-- Next Page -->
      <button
        type="button"
        class="page-btn"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
        title="Selanjutnya"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5">
          <path fill-rule="evenodd" d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Last Page -->
      <button
        type="button"
        class="page-btn"
        :disabled="currentPage >= totalPages"
        @click="goToPage(totalPages)"
        title="Halaman Terakhir"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5">
          <path fill-rule="evenodd" d="M4.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L7.94 8 4.22 4.28a.75.75 0 0 1 0-1.06ZM10.5 2.75a.75.75 0 0 1 1.5 0v10.5a.75.75 0 0 1-1.5 0V2.75Z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  limit: { type: Number, default: 25 },
  totalPages: { type: Number, default: 1 }
})

const emit = defineEmits(['change'])

const currentPage = computed(() => props.page || 1)
const fromItem = computed(() => {
  if (props.total === 0) return 0
  return (currentPage.value - 1) * props.limit + 1
})
const toItem = computed(() => {
  return Math.min(currentPage.value * props.limit, props.total)
})

const visiblePages = computed(() => {
  const current = currentPage.value
  const total = props.totalPages
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 3) {
    return [1, 2, 3, 4, '...', total]
  }
  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total]
  }
  return [1, '...', current - 1, current, current + 1, '...', total]
})

const goToPage = (p) => {
  if (p < 1 || p > props.totalPages || p === currentPage.value) return
  emit('change', p)
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid rgba(30, 58, 95, 0.4);
  background: rgba(10, 15, 30, 0.3);
  font-size: 0.8rem;
  color: #94a3b8;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pagination-highlight {
  color: #f0f4ff;
  font-weight: 600;
  font-family: var(--font-mono, monospace);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(30, 58, 95, 0.5);
  background: rgba(15, 22, 41, 0.6);
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  color: #60a5fa;
}

.page-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  font-weight: 700;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-ellipsis {
  color: #475569;
  padding: 0 0.25rem;
  font-weight: 600;
}
</style>
