import { ref } from 'vue'
import type { AIPlatformConfig, AICallLog } from '@/types'
import { chatCompletion as deepseekChat, streamChatCompletion as deepseekStream } from '@/services/deepseek'
import { chatCompletion as doubaoChat, streamChatCompletion as doubaoStream } from '@/services/doubao'
import { setItem, getItem } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'

export function useAI() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const streamingContent = ref('')

  function getConfigs(): AIPlatformConfig[] {
    return getItem<AIPlatformConfig[]>(STORAGE_KEYS.AI_CONFIGS, true) || []
  }

  function getActiveConfig(platform?: 'deepseek' | 'doubao'): AIPlatformConfig | null {
    const configs = getConfigs()
    if (platform) {
      return configs.find(c => c.name === platform && c.isEnabled) || null
    }
    return configs.find(c => c.isEnabled) || null
  }

  function saveConfig(config: AIPlatformConfig): void {
    const configs = getConfigs()
    const index = configs.findIndex(c => c.id === config.id)
    if (index >= 0) {
      configs[index] = config
    } else {
      configs.push(config)
    }
    setItem(STORAGE_KEYS.AI_CONFIGS, configs, true)
  }

  function deleteConfig(id: string): void {
    const configs = getConfigs().filter(c => c.id !== id)
    setItem(STORAGE_KEYS.AI_CONFIGS, configs, true)
  }

  function addLog(log: AICallLog): void {
    const logs = getItem<AICallLog[]>(STORAGE_KEYS.AI_LOGS) || []
    logs.unshift(log)
    if (logs.length > 1000) {
      logs.length = 1000
    }
    setItem(STORAGE_KEYS.AI_LOGS, logs)
  }

  function getLogs(): AICallLog[] {
    return getItem<AICallLog[]>(STORAGE_KEYS.AI_LOGS) || []
  }

  async function callAI(
    messages: Array<{ role: string; content: string }>,
    platform?: 'deepseek' | 'doubao'
  ): Promise<string> {
    const config = getActiveConfig(platform)
    if (!config) {
      throw new Error('未找到有效的AI平台配置，请先配置API密钥')
    }

    isLoading.value = true
    error.value = null
    const startTime = Date.now()

    try {
      let result: string
      if (config.name === 'deepseek') {
        result = await deepseekChat(messages, config)
      } else {
        result = await doubaoChat(messages, config)
      }

      addLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        platform: config.name,
        function: messages[messages.length - 1]?.content?.substring(0, 50) || '',
        status: 'success',
        duration: Date.now() - startTime,
      })

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误'
      error.value = message

      addLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        platform: config.name,
        function: messages[messages.length - 1]?.content?.substring(0, 50) || '',
        status: 'failed',
        errorMessage: message,
        duration: Date.now() - startTime,
      })

      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function streamAI(
    messages: Array<{ role: string; content: string }>,
    onChunk: (chunk: string) => void,
    platform?: 'deepseek' | 'doubao'
  ): Promise<void> {
    const config = getActiveConfig(platform)
    if (!config) {
      throw new Error('未找到有效的AI平台配置，请先配置API密钥')
    }

    isLoading.value = true
    error.value = null
    streamingContent.value = ''
    const startTime = Date.now()

    try {
      const handleChunk = (chunk: string) => {
        streamingContent.value += chunk
        onChunk(chunk)
      }

      if (config.name === 'deepseek') {
        await deepseekStream(messages, config, handleChunk)
      } else {
        await doubaoStream(messages, config, handleChunk)
      }

      addLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        platform: config.name,
        function: messages[messages.length - 1]?.content?.substring(0, 50) || '',
        status: 'success',
        duration: Date.now() - startTime,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误'
      error.value = message

      addLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        platform: config.name,
        function: messages[messages.length - 1]?.content?.substring(0, 50) || '',
        status: 'failed',
        errorMessage: message,
        duration: Date.now() - startTime,
      })

      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    streamingContent,
    getConfigs,
    getActiveConfig,
    saveConfig,
    deleteConfig,
    getLogs,
    callAI,
    streamAI,
  }
}
