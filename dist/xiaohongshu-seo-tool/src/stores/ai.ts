import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AIPlatformConfig, AICallLog } from '@/types'
import { setItem, getItem } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'

export const useAIStore = defineStore('ai', () => {
  const configs = ref<AIPlatformConfig[]>(getItem<AIPlatformConfig[]>(STORAGE_KEYS.AI_CONFIGS, true) || [])
  const logs = ref<AICallLog[]>(getItem<AICallLog[]>(STORAGE_KEYS.AI_LOGS) || [])
  const currentPlatform = ref<'deepseek' | 'doubao'>('deepseek')

  const deepseekConfig = computed(() => configs.value.find(c => c.name === 'deepseek'))
  const doubaoConfig = computed(() => configs.value.find(c => c.name === 'doubao'))
  const activeConfig = computed(() => configs.value.find(c => c.isEnabled))
  const isConfigured = computed(() => configs.value.some(c => c.apiKey && c.isEnabled))

  function saveConfig(config: AIPlatformConfig) {
    const index = configs.value.findIndex(c => c.id === config.id)
    if (index >= 0) {
      configs.value[index] = config
    } else {
      configs.value.push(config)
    }
    setItem(STORAGE_KEYS.AI_CONFIGS, configs.value, true)
  }

  function deleteConfig(id: string) {
    configs.value = configs.value.filter(c => c.id !== id)
    setItem(STORAGE_KEYS.AI_CONFIGS, configs.value, true)
  }

  function setActivePlatform(platform: 'deepseek' | 'doubao') {
    currentPlatform.value = platform
  }

  function addLog(log: AICallLog) {
    logs.value.unshift(log)
    if (logs.value.length > 1000) {
      logs.value = logs.value.slice(0, 1000)
    }
    setItem(STORAGE_KEYS.AI_LOGS, logs.value)
  }

  function clearLogs() {
    logs.value = []
    setItem(STORAGE_KEYS.AI_LOGS, [])
  }

  return {
    configs,
    logs,
    currentPlatform,
    deepseekConfig,
    doubaoConfig,
    activeConfig,
    isConfigured,
    saveConfig,
    deleteConfig,
    setActivePlatform,
    addLog,
    clearLogs,
  }
})
