import axios, { AxiosInstance } from 'axios'
import type { AIPlatformConfig } from '@/types'

let client: AxiosInstance | null = null

export function initDeepSeekClient(config: AIPlatformConfig): AxiosInstance {
  client = axios.create({
    baseURL: config.baseURL || '/api/deepseek',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        return Promise.reject(new Error('API密钥无效，请检查配置'))
      }
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('请求超时，请稍后重试'))
      }
      return Promise.reject(error)
    }
  )

  return client
}

export async function chatCompletion(
  messages: Array<{ role: string; content: string }>,
  config: AIPlatformConfig
): Promise<string> {
  if (!client) {
    initDeepSeekClient(config)
  }

  const response = await client!.post('/chat/completions', {
    model: config.model || 'deepseek-chat',
    messages,
    max_tokens: config.maxTokens || 1500,
    temperature: config.temperature || 0.7,
    stream: false,
  })

  return response.data.choices[0]?.message?.content || ''
}

export async function streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  config: AIPlatformConfig,
  onChunk: (chunk: string) => void
): Promise<void> {
  if (!client) {
    initDeepSeekClient(config)
  }

  const response = await client!.post('/chat/completions', {
    model: config.model || 'deepseek-chat',
    messages,
    max_tokens: config.maxTokens || 1500,
    temperature: config.temperature || 0.7,
    stream: true,
  }, {
    responseType: 'stream',
  })

  const reader = response.data.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '))

    for (const line of lines) {
      const data = line.replace('data: ', '')
      if (data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices[0]?.delta?.content
        if (content) {
          onChunk(content)
        }
      } catch {
        // 忽略解析错误
      }
    }
  }
}
