<template>
  <div
    :class="[
      'stat-card',
      `stat-card--${color}`,
      { 'stat-card--alert': alert, 'is-loading': loading }
    ]"
  >
    <!-- Top Row: Icon + Alert/Badge -->
    <div class="stat-card-header">
      <div class="stat-card-icon-wrap" :class="`icon-bg-${color}`">
        <slot name="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style="width: 20px; height: 20px"
          >
            <path
              fill-rule="evenodd"
              d="M1 2.75A.75.75 0 0 1 1.75 2h16.5a.75.75 0 0 1 0 1.5H18v8.75A2.75 2.75 0 0 1 15.25 15h-1.072l.798 3.06a.75.75 0 0 1-1.452.38L12.784 15H7.216l-.74 2.84a.75.75 0 1 1-1.452-.38l.798-3.06H4.75A2.75 2.75 0 0 1 2 12.25V3.5h-.25A.75.75 0 0 1 1 2.75Z"
              clip-rule="evenodd"
            />
          </svg>
        </slot>
      </div>

      <div
        v-if="alert"
        class="stat-card-alert-badge"
        title="Memerlukan Perhatian"
      >
        <span class="alert-ping"></span>
        <span class="alert-dot"></span>
        <span class="alert-text">Perhatian</span>
      </div>
      <div
        v-else-if="badgeText"
        :class="['badge', `badge-${badgeColor || color}`]"
      >
        {{ badgeText }}
      </div>
    </div>

    <!-- Main Metric -->
    <div class="stat-card-body">
      <p class="stat-card-label">{{ label }}</p>
      <div class="stat-card-value-row">
        <h3 class="stat-card-value">
          <span v-if="loading" class="stat-skeleton"></span>
          <template v-else>{{ formattedValue }}</template>
        </h3>
      </div>
      <p v-if="sub" class="stat-card-sub">{{ sub }}</p>
    </div>

    <!-- Optional Progress Bar -->
    <div
      v-if="progress !== undefined && progress !== null"
      class="stat-card-progress-wrap"
    >
      <div class="progress-info">
        <span class="progress-label">{{ progressLabel || 'Progress' }}</span>
        <span class="progress-val">{{ progress }}%</span>
      </div>
      <div class="progress-track">
        <div
          :class="['progress-bar', `progress-${color}`]"
          :style="{ width: Math.min(100, Math.max(0, progress)) + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  sub: { type: String, default: '' },
  color: {
    type: String,
    default: 'blue',
    validator: (val) => ['blue', 'green', 'yellow', 'red', 'purple', 'gray'].includes(val)
  },
  progress: { type: [Number, String], default: null },
  progressLabel: { type: String, default: '' },
  alert: { type: Boolean, default: false },
  badgeText: { type: String, default: '' },
  badgeColor: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  isCurrency: { type: Boolean, default: false }
})

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) return '0'
  if (props.isCurrency && typeof props.value === 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(props.value)
  }
  if (typeof props.value === 'number') {
    return new Intl.NumberFormat('id-ID').format(props.value)
  }
  return props.value
})
</script>

<style scoped>
/* ═══════════════════════════════════════════
   CARD BASE — mengikuti var tema (dark/light)
═══════════════════════════════════════════ */
.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
  border-radius: 1rem;
  overflow: hidden;
  background-color: var(--bg-card);
  backdrop-filter: blur(24px);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow:
    var(--shadow-card),
    0 0 15px var(--accent-glow);
}

.stat-card--alert {
  border-color: rgba(239, 68, 68, 0.4) !important;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, var(--bg-card) 100%);
}

.stat-card--alert:hover {
  border-color: rgba(239, 68, 68, 0.6) !important;
  box-shadow:
    var(--shadow-card),
    0 0 15px rgba(239, 68, 68, 0.2);
}

/* ═══════════════════════════════════════════
   HEADER / ICON
═══════════════════════════════════════════ */
.stat-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.875rem;
}

.stat-card-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.stat-card:hover .stat-card-icon-wrap {
  transform: scale(1.05);
}

.icon-bg-blue {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.25);
}
.icon-bg-green {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}
.icon-bg-yellow {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.25);
}
.icon-bg-red {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.icon-bg-purple {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.25);
}
.icon-bg-gray {
  background: rgba(148, 163, 184, 0.12);
  color: #64748b;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

/* Dark mode: warna icon dibuat lebih terang agar tetap kontras di background gelap */
:global(.dark) .icon-bg-blue { color: #60a5fa; box-shadow: 0 0 12px rgba(59, 130, 246, 0.15); }
:global(.dark) .icon-bg-green { color: #34d399; box-shadow: 0 0 12px rgba(16, 185, 129, 0.15); }
:global(.dark) .icon-bg-yellow { color: #fbbf24; box-shadow: 0 0 12px rgba(245, 158, 11, 0.15); }
:global(.dark) .icon-bg-red { color: #f87171; box-shadow: 0 0 12px rgba(239, 68, 68, 0.15); }
:global(.dark) .icon-bg-purple { color: #c084fc; box-shadow: 0 0 12px rgba(168, 85, 247, 0.15); }
:global(.dark) .icon-bg-gray { color: #94a3b8; }

/* Alert badge dengan radar pulse */
.stat-card-alert-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  position: relative;
}

.alert-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ef4444;
}

.alert-ping {
  position: absolute;
  left: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ef4444;
  animation: stat-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.alert-text {
  font-size: 0.68rem;
  font-weight: 600;
  color: #dc2626;
  letter-spacing: 0.02em;
}

:global(.dark) .alert-text {
  color: #f87171;
}

@keyframes stat-ping {
  75%,
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

/* ═══════════════════════════════════════════
   BODY
═══════════════════════════════════════════ */
.stat-card-body {
  margin-top: 0.25rem;
}

.stat-card-label {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
  letter-spacing: 0.01em;
}

.stat-card-value-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.stat-card-value {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
  font-family: var(--font-sans, sans-serif);
}

.stat-card-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 0.375rem;
  line-height: 1.4;
}

/* ═══════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════ */
.stat-card-progress-wrap {
  margin-top: 0.875rem;
  padding-top: 0.625rem;
  border-top: 1px solid var(--border-color);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.progress-label {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.progress-val {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
  font-family: var(--font-mono, monospace);
}

.progress-track {
  width: 100%;
  height: 6px;
  background: color-mix(in srgb, var(--border-color) 70%, transparent);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-blue { background: linear-gradient(90deg, #2563eb, #60a5fa); }
.progress-green { background: linear-gradient(90deg, #059669, #34d399); }
.progress-yellow { background: linear-gradient(90deg, #d97706, #fbbf24); }
.progress-red { background: linear-gradient(90deg, #dc2626, #f87171); }
.progress-purple { background: linear-gradient(90deg, #7c3aed, #c084fc); }
.progress-gray { background: #64748b; }

/* ═══════════════════════════════════════════
   SKELETON LOADING
═══════════════════════════════════════════ */
.stat-skeleton {
  display: inline-block;
  width: 70px;
  height: 1.65rem;
  border-radius: 0.375rem;
  background: var(--bg-hover);
  animation: stat-pulse 1.5s ease-in-out infinite;
}

@keyframes stat-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
