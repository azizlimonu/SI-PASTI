import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isDark = ref(
    localStorage.getItem('sipasti_theme') === 'dark' ||
    (!localStorage.getItem('sipasti_theme') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const setTheme = (dark) => {
    isDark.value = dark
  }

  // Apply ke DOM setiap kali berubah
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

  return { isDark, toggleTheme, setTheme }
})