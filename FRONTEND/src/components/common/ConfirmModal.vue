<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="title"
    :max-width="'460px'"
    :close-on-backdrop="!loading"
    :show-close="!loading"
  >
    <template #icon>
      <div class="confirm-icon" :class="`icon-bg-${type}`">
        <svg
          v-if="type === 'danger'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          style="width:20px;height:20px;"
        >
          <path
            fill-rule="evenodd"
            d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="type === 'warning'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          style="width:20px;height:20px;"
        >
          <path
            fill-rule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          style="width:20px;height:20px;"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </template>

    <div class="confirm-content">
      <p class="confirm-message">{{ message }}</p>
      <p v-if="subMessage" class="confirm-submessage">{{ subMessage }}</p>
    </div>

    <template #footer>
      <button
        type="button"
        class="btn-secondary"
        :disabled="loading"
        @click="cancel"
      >
        {{ cancelText }}
      </button>
      <button
        type="button"
        :class="confirmBtnClass"
        :disabled="loading"
        @click="confirm"
      >
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? 'Memproses...' : confirmText }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi Aksi' },
  message: { type: String, required: true },
  subMessage: { type: String, default: 'Tindakan ini tidak dapat dibatalkan.' },
  confirmText: { type: String, default: 'Ya, Lanjutkan' },
  cancelText: { type: String, default: 'Batal' },
  type: {
    type: String,
    default: 'danger',
    validator: (val) => ['danger', 'warning', 'info'].includes(val)
  },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const confirmBtnClass = computed(() => {
  if (props.type === 'danger') return 'btn-danger'
  if (props.type === 'warning') return 'btn-warning'
  return 'btn-primary'
})

const confirm = () => emit('confirm')
const cancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<style scoped>
.confirm-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-bg-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.icon-bg-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.icon-bg-info {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.confirm-message {
  font-size: 0.95rem;
  color: #f1f5f9;
  font-weight: 500;
  line-height: 1.5;
}

.confirm-submessage {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
}

.btn-warning {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: white;
  border: 1px solid rgba(245, 158, 11, 0.4);
  padding: 0.5rem 1rem;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-warning:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
}
</style>
