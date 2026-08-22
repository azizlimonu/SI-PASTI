<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="cancel">
        <div class="modal-container" style="max-width:24rem;">
          <div class="modal-body" style="text-align:center;">
            <!-- Icon -->
            <div :class="['confirm-icon', `confirm-icon-${type}`]">
              <svg
                v-if="type === 'danger'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                style="width:24px;height:24px;"
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
                style="width:24px;height:24px;"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <h3
              style="font-size:1rem; font-weight:600; color:var(--text-primary); margin:1rem 0 0.5rem;"
            >
              {{ title }}
            </h3>
            <p
              style="font-size:0.875rem; color:var(--text-secondary); margin:0 0 1.5rem; line-height:1.5;"
            >
              {{ message }}
            </p>

            <div style="display:flex; gap:0.75rem; justify-content:center;">
              <button
                class="btn-secondary"
                style="flex:1;"
                @click="cancel"
                :disabled="loading"
              >
                {{ cancelText }}
              </button>
              <button
                :class="type === 'danger' ? 'btn-danger' : 'btn-primary'"
                style="flex:1; justify-content:center;"
                @click="confirm"
                :disabled="loading"
              >
                <span v-if="loading" class="loading-spinner"></span>
                {{ loading ? 'Memproses...' : confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: 'Apakah Anda yakin?' },
  type: { type: String, default: 'danger' },
  confirmText: { type: String, default: 'Ya, Hapus' },
  cancelText: { type: String, default: 'Batal' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const confirm = () => emit('confirm')

const cancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<style scoped>
.confirm-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.confirm-icon-danger {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.confirm-icon-warning {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.confirm-icon-info {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
