<template>
  <div class="dropzone-wrapper">
    <!-- Tabs -->
    <div class="dropzone-tabs">
      <button
        type="button"
        :class="['tab-btn', { active: activeTab === 'file' }]"
        @click="activeTab = 'file'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          style="width:14px;height:14px;"
        >
          <path
            d="M3 3.5A1.5 1.5 0 0 1 4.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 13 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 12.5v-9Z"
          />
        </svg>
        Upload File
      </button>
      <button
        type="button"
        :class="['tab-btn', { active: activeTab === 'link' }]"
        @click="activeTab = 'link'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          style="width:14px;height:14px;"
        >
          <path
            fill-rule="evenodd"
            d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
          <path
            fill-rule="evenodd"
            d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z"
            clip-rule="evenodd"
          />
        </svg>
        Link URL
      </button>
    </div>

    <!-- Upload File -->
    <div v-if="activeTab === 'file'">
      <div
        :class="['dropzone-area', { dragging: isDragging, 'has-file': selectedFile }]"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerInput"
      >
        <input
          ref="fileInput"
          type="file"
          :accept="accept"
          style="display:none;"
          @change="handleChange"
        />

        <div v-if="!selectedFile" class="dropzone-empty">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="dropzone-icon"
          >
            <path
              fill-rule="evenodd"
              d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="dropzone-text">
            <span style="color:var(--accent); font-weight:500;"
              >Klik untuk upload</span
            >
            atau drag & drop
          </p>
          <p class="dropzone-hint">{{ hint }}</p>
        </div>

        <div v-else class="dropzone-file">
          <div class="file-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              style="width:22px;height:22px;color:var(--accent);"
            >
              <path
                d="M3 3.5A1.5 1.5 0 0 1 4.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 13 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 12.5v-9Z"
              />
            </svg>
          </div>
          <div style="flex:1; min-width:0;">
            <p
              style="font-size:0.82rem; font-weight:500; color:var(--text-primary); margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
            >
              {{ selectedFile.name }}
            </p>
            <p
              style="font-size:0.72rem; color:var(--text-muted); margin:0.125rem 0 0;"
            >
              {{ formatSize(selectedFile.size) }}
            </p>
          </div>
          <button type="button" class="btn-icon" @click.stop="removeFile">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              style="width:15px;height:15px;color:#f87171;"
            >
              <path
                d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L6.94 8l-1.72 1.72a.75.75 0 1 0 1.06 1.06L8 9.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L9.06 8l1.72-1.72a.75.75 0 0 0-1.06-1.06L8 6.94 6.28 5.22Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Link URL -->
    <div v-if="activeTab === 'link'">
      <input
        v-model="linkValue"
        type="url"
        class="input-field"
        placeholder="https://drive.google.com/file/..."
        @input="emit('update:link', linkValue)"
      />
      <p
        style="font-size:0.72rem; color:var(--text-muted); margin:0.375rem 0 0;"
      >
        Google Drive, SharePoint, atau URL dokumen lainnya
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: File, default: null },
  link: { type: String, default: '' },
  accept: { type: String, default: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png' },
  hint: { type: String, default: 'PDF, DOC, DOCX, XLS, XLSX (Maks. 20MB)' }
})

const emit = defineEmits(['update:modelValue', 'update:link'])

const activeTab = ref('file')
const isDragging = ref(false)
const selectedFile = ref(null)
const linkValue = ref(props.link || '')
const fileInput = ref(null)

const triggerInput = () => fileInput.value?.click()

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) setFile(file)
}

const handleChange = (e) => {
  const file = e.target.files[0]
  if (file) setFile(file)
}

const setFile = (file) => {
  selectedFile.value = file
  emit('update:modelValue', file)
}

const removeFile = () => {
  selectedFile.value = null
  emit('update:modelValue', null)
  if (fileInput.value) fileInput.value.value = ''
}

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.dropzone-wrapper { display: flex; flex-direction: column; gap: 0.625rem; }

.dropzone-tabs {
  display: flex;
  gap: 0.375rem;
  background: var(--bg-hover);
  border-radius: 0.625rem;
  padding: 0.25rem;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.425rem 0.75rem;
  border-radius: 0.375rem;
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn.active {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.dropzone-area {
  border: 2px dashed var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-hover);
}

.dropzone-area:hover,
.dropzone-area.dragging {
  border-color: var(--accent);
  background: var(--accent-light);
}

.dropzone-area.has-file {
  border-style: solid;
  border-color: rgba(59,130,246,0.4);
  background: var(--accent-light);
}

.dropzone-empty { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }

.dropzone-icon {
  width: 28px;
  height: 28px;
  color: var(--text-muted);
}

.dropzone-text { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
.dropzone-hint { font-size: 0.72rem; color: var(--text-muted); margin: 0; }

.dropzone-file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
}

.file-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  background: var(--accent-light);
  border: 1px solid rgba(59,130,246,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
