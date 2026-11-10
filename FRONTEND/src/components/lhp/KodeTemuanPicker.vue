<template>
  <div style="display:flex; flex-direction:column; gap:0.75rem;">
    <div>
      <label class="input-label">Jenis Temuan</label>
      <div style="display:flex; gap:0.5rem;">
        <button
          type="button"
          :class="modelValue.mode === 'kode' ? 'btn-primary' : 'btn-secondary'"
          style="flex:1;"
          @click="setMode('kode')"
        >
          Kode baku
        </button>
        <button
          type="button"
          :class="modelValue.mode === 'manual' ? 'btn-primary' : 'btn-secondary'"
          style="flex:1;"
          @click="setMode('manual')"
        >
          Input manual
        </button>
      </div>
    </div>

    <div v-if="loadError" class="alert-danger">
      <span>{{ loadError }}</span>
    </div>

    <template v-if="modelValue.mode === 'kode'">
      <div>
        <label class="input-label">Kelompok</label>
        <select v-model="kelompokId" class="select-field" @change="onKelompok">
          <option :value="null" disabled>Pilih kelompok</option>
          <option v-for="k in kelompoks" :key="k.id" :value="k.id">
            {{ k.kode }} — {{ k.nama }}
          </option>
        </select>
      </div>

      <div v-if="kelompokId">
        <label class="input-label">Sub-kelompok</label>
        <select v-model="subId" class="select-field" @change="onSub">
          <option :value="null" disabled>Pilih sub-kelompok</option>
          <option v-for="s in subs" :key="s.id" :value="s.id">
            {{ s.kode }} — {{ s.nama }}
          </option>
        </select>
      </div>

      <div
        v-if="selectedSub && selectedSub.benang_merah"
        style="padding:0.625rem 0.75rem; border-radius:0.5rem; border:1px solid var(--border-color); background:var(--bg-surface); font-size:0.78rem; color:var(--text-secondary); line-height:1.5;"
      >
        <strong style="color:var(--text-primary);">Benang merah:</strong>
        {{ selectedSub.benang_merah }}
      </div>

      <div v-if="subId">
        <label class="input-label">Kode Temuan</label>
        <select
          :value="modelValue.jenis_temuan_id"
          class="select-field"
          @change="onJenis($event.target.value)"
        >
          <option :value="null" disabled>Pilih kode temuan</option>
          <option v-for="j in jenisList" :key="j.id" :value="j.id">
            {{ j.kode }} — {{ j.uraian }}
          </option>
        </select>
      </div>

      <div
        v-if="selectedJenis"
        style="font-size:0.8rem; color:var(--text-secondary);"
      >
        Kategori:
        <span class="badge badge-blue">{{ selectedJenis.kategori?.nama }}</span>
      </div>
    </template>

    <div v-else>
      <label class="input-label">Kategori Temuan</label>
      <select
        :value="modelValue.kategori_temuan_id"
        class="select-field"
        @change="onKategori($event.target.value)"
      >
        <option :value="null" disabled>Pilih kategori</option>
        <option v-for="k in kategoriList" :key="k.id" :value="k.id">
          {{ k.nama }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { kodeTemuanService } from '@/services/kodeTemuanService'

// modelValue: { mode: 'kode' | 'manual', jenis_temuan_id, kategori_temuan_id }
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ mode: 'kode', jenis_temuan_id: null, kategori_temuan_id: null })
  },
  // Jenis penugasan (mis. 'Audit'): hanya kelompok yang berlaku untuk jenis ini yang ditampilkan
  jenisPenugasan: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'pilih-jenis'])

const kelompoks = ref([])
const kategoriList = ref([])
const loadError = ref('')
const kelompokId = ref(null)
const subId = ref(null)

const subs = computed(
  () => kelompoks.value.find((k) => k.id === kelompokId.value)?.subKelompoks || []
)
const selectedSub = computed(() => subs.value.find((s) => s.id === subId.value) || null)
const jenisList = computed(() => selectedSub.value?.jenisTemuans || [])
const selectedJenis = computed(
  () => jenisList.value.find((j) => j.id === props.modelValue.jenis_temuan_id) || null
)

const ubah = (patch) => emit('update:modelValue', { ...props.modelValue, ...patch })

const setMode = (mode) => {
  if (mode === props.modelValue.mode) return
  ubah({ mode, jenis_temuan_id: null, kategori_temuan_id: null })
  kelompokId.value = null
  subId.value = null
}

const onKelompok = () => {
  subId.value = null
  ubah({ jenis_temuan_id: null })
}

const onSub = () => ubah({ jenis_temuan_id: null })

const onJenis = (value) => {
  const id = Number(value)
  ubah({ jenis_temuan_id: id, kategori_temuan_id: null })
  const jenis = jenisList.value.find((j) => j.id === id)
  if (jenis) emit('pilih-jenis', jenis)
}

const onKategori = (value) => ubah({ kategori_temuan_id: Number(value), jenis_temuan_id: null })

// Saat edit: buka kelompok & sub-kelompok yang memuat kode yang sudah terpilih
const bukaPilihanTersimpan = () => {
  const id = props.modelValue.jenis_temuan_id
  if (!id) return
  for (const k of kelompoks.value) {
    for (const s of k.subKelompoks || []) {
      if ((s.jenisTemuans || []).some((j) => j.id === id)) {
        kelompokId.value = k.id
        subId.value = s.id
        return
      }
    }
  }
}

const muat = async () => {
  loadError.value = ''
  try {
    const [kode, kategori] = await Promise.all([
      kodeTemuanService.getKode(
        props.jenisPenugasan ? { jenis_penugasan: props.jenisPenugasan } : {}
      ),
      kodeTemuanService.getKategori()
    ])
    kelompoks.value = kode.data.data || []
    kategoriList.value = kategori.data.data || []
    bukaPilihanTersimpan()
  } catch {
    loadError.value = 'Gagal memuat daftar kode temuan.'
  }
}

watch(() => props.jenisPenugasan, muat)
onMounted(muat)
</script>
