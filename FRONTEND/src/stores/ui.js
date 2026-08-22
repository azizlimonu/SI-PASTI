import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isDark = ref(
    localStorage.getItem('sipasti_theme') === 'dark' ||
    (!localStorage.getItem('sipasti_theme') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  const toggleTheme = () => { isDark.value = !isDark.value }

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

  const currentYear = new Date().getFullYear()
  const tahunAktif = ref(
    parseInt(localStorage.getItem('sipasti_tahun_aktif')) || currentYear
  )

  const setTahunAktif = (tahun) => {
    tahunAktif.value = tahun
    localStorage.setItem('sipasti_tahun_aktif', tahun)
  }

  return { isDark, toggleTheme, tahunAktif, setTahunAktif }
})