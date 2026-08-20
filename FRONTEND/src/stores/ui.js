import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // ═══ THEME ═══
  const isDark = ref(
    localStorage.getItem('sipasti_theme') === 'dark' ||
    (!localStorage.getItem('sipasti_theme') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  const toggleTheme = () => { isDark.value = !isDark.value }
  const setTheme = (dark) => { isDark.value = dark }

  watch(isDark, (val) => {
    if (val) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('sipasti_theme', val ? 'dark' : 'light')
  }, { immediate: true })

  // ═══ TAHUN AKTIF (hanya untuk PKPT & turunannya) ═══
  const currentYear = new Date().getFullYear()
  const tahunAktif = ref(
    parseInt(localStorage.getItem('sipasti_tahun_aktif')) || currentYear
  )

  const setTahunAktif = (tahun) => {
    tahunAktif.value = tahun
    localStorage.setItem('sipasti_tahun_aktif', tahun)
  }

  // Daftar tahun tersedia (5 tahun ke belakang + tahun ini)
  const daftarTahun = computed(() => {
    const years = []
    for (let y = currentYear; y >= currentYear - 4; y--) {
      years.push(y)
    }
    return years
  })

  return {
    isDark, toggleTheme, setTheme,
    tahunAktif, setTahunAktif, daftarTahun
  }
})