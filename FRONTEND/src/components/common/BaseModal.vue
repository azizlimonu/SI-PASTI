<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="modal-backdrop"
        @click.self="handleBackdropClick"
        @keydown.esc="handleEsc"
        tabindex="-1"
      >
        <div
          class="modal-container glass-card"
          :style="{ maxWidth: maxWidth }"
          role="dialog"
          aria-modal="true"
        >
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-title-wrap">
              <slot name="icon">
                <div v-if="icon" class="modal-icon" :class="`icon-bg-${iconColor || 'blue'}`">
                  <component :is="icon" class="w-5 h-5" />
                </div>
              </slot>
              <div>
                <h3 class="modal-title">{{ title }}</h3>
                <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
              </div>
            </div>
            <button
              v-if="showClose"
              type="button"
              class="modal-close-btn"
              @click="close"
              title="Tutup"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                style="width:18px;height:18px;"
              >
                <path
                  d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                />
              </svg>
            </button>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div class="modal-body custom-scrollbar">
            <slot />
          </div>

          <!-- Modal Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  maxWidth: { type: String, default: '540px' },
  showClose: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true },
  icon: { type: [Object, Function], default: null },
  iconColor: { type: String, default: 'blue' }
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

const handleEsc = (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background-color: rgba(5, 13, 26, 0.78);
  backdrop-filter: blur(8px);
}

.modal-container {
  width: 100%;
  max-height: calc(100vh - 3rem);
  display: flex;
  flex-direction: column;
  background: #0f1629;
  border: 1px solid rgba(30, 58, 95, 0.6);
  border-radius: 1.25rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.1);
  overflow: hidden;
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(30, 58, 95, 0.4);
  background: rgba(10, 15, 30, 0.5);
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f0f4ff;
  margin: 0;
  letter-spacing: -0.01em;
}

.modal-subtitle {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0.15rem 0 0;
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  color: #cbd5e1;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(30, 58, 95, 0.4);
  background: rgba(10, 15, 30, 0.4);
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
