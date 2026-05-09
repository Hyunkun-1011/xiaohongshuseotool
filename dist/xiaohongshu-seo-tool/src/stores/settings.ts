import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppSettings } from '@/types'
import { setItem, getItem } from '@/utils/storage'
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/utils/constants'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>(getItem<AppSettings>(STORAGE_KEYS.APP_SETTINGS) || DEFAULT_SETTINGS)

  function updateSettings(newSettings: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    setItem(STORAGE_KEYS.APP_SETTINGS, settings.value)
    applyTheme()
  }

  function applyTheme() {
    const theme = settings.value.theme
    const html = document.documentElement
    if (theme === 'dark') {
      html.classList.add('dark')
    } else if (theme === 'light') {
      html.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  }

  function init() {
    applyTheme()
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme)
  }

  return {
    settings,
    updateSettings,
    applyTheme,
    init,
  }
})
