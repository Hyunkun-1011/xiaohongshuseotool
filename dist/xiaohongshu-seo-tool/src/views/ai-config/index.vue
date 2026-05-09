<template>
  <div class="ai-config-page">
    <el-page-header title="AI平台配置" content="配置DeepSeek和豆包AI的API密钥及调用参数" />

    <el-row :gutter="20" class="config-cards">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>DeepSeek配置</span>
              <el-tag v-if="deepseekConfig?.isEnabled" type="success">已启用</el-tag>
              <el-tag v-else type="info">未启用</el-tag>
            </div>
          </template>

          <el-form :model="deepseekForm" label-width="120px">
            <el-form-item label="API密钥">
              <el-input
                v-model="deepseekForm.apiKey"
                type="password"
                show-password
                placeholder="请输入DeepSeek API密钥"
              />
            </el-form-item>

            <el-form-item label="模型选择">
              <el-select v-model="deepseekForm.model" style="width: 100%">
                <el-option
                  v-for="model in AI_PLATFORMS.DEEPSEEK.models"
                  :key="model"
                  :label="model"
                  :value="model"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="最大字数">
              <el-slider v-model="deepseekForm.maxTokens" :min="500" :max="2000" :step="100" show-stops />
              <span class="slider-value">{{ deepseekForm.maxTokens }}字</span>
            </el-form-item>

            <el-form-item label="温度值">
              <el-slider v-model="deepseekForm.temperature" :min="0.3" :max="0.8" :step="0.1" show-stops />
              <span class="slider-value">{{ deepseekForm.temperature }}</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveDeepseekConfig" :loading="saving">
                保存配置
              </el-button>
              <el-button @click="testDeepseekConnection" :loading="testingDeepseek">
                测试连接
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>豆包AI配置</span>
              <el-tag v-if="doubaoConfig?.isEnabled" type="success">已启用</el-tag>
              <el-tag v-else type="info">未启用</el-tag>
            </div>
          </template>

          <el-form :model="doubaoForm" label-width="120px">
            <el-form-item label="API密钥">
              <el-input
                v-model="doubaoForm.apiKey"
                type="password"
                show-password
                placeholder="请输入豆包AI API密钥"
              />
            </el-form-item>

            <el-form-item label="模型选择">
              <el-select v-model="doubaoForm.model" style="width: 100%">
                <el-option
                  v-for="model in AI_PLATFORMS.DOUBAO.models"
                  :key="model"
                  :label="model"
                  :value="model"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="最大字数">
              <el-slider v-model="doubaoForm.maxTokens" :min="500" :max="2000" :step="100" show-stops />
              <span class="slider-value">{{ doubaoForm.maxTokens }}字</span>
            </el-form-item>

            <el-form-item label="温度值">
              <el-slider v-model="doubaoForm.temperature" :min="0.3" :max="0.8" :step="0.1" show-stops />
              <span class="slider-value">{{ doubaoForm.temperature }}</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveDoubaoConfig" :loading="saving">
                保存配置
              </el-button>
              <el-button @click="testDoubaoConnection" :loading="testingDoubao">
                测试连接
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="logs-card">
      <template #header>
        <div class="card-header">
          <span>调用日志</span>
          <el-button type="danger" size="small" @click="clearLogs">清空日志</el-button>
        </div>
      </template>

      <el-table :data="logs" style="width: 100%" max-height="400">
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.timestamp).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="platform" label="平台" width="100">
          <template #default="{ row }">
            <el-tag :type="row.platform === 'deepseek' ? 'primary' : 'success'">
              {{ row.platform === 'deepseek' ? 'DeepSeek' : '豆包' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="function" label="功能" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时(ms)" width="100" />
        <el-table-column prop="errorMessage" label="错误信息" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAIStore } from '@/stores/ai'
import { AI_PLATFORMS } from '@/utils/constants'
import type { AIPlatformConfig } from '@/types'

const aiStore = useAIStore()

const saving = ref(false)
const testingDeepseek = ref(false)
const testingDoubao = ref(false)

const deepseekConfig = ref<AIPlatformConfig | undefined>()
const doubaoConfig = ref<AIPlatformConfig | undefined>()

const deepseekForm = reactive({
  apiKey: '',
  model: AI_PLATFORMS.DEEPSEEK.defaultModel,
  maxTokens: 1500,
  temperature: 0.7,
})

const doubaoForm = reactive({
  apiKey: '',
  model: AI_PLATFORMS.DOUBAO.defaultModel,
  maxTokens: 1500,
  temperature: 0.7,
})

const logs = ref(aiStore.logs)

onMounted(() => {
  loadConfigs()
})

function loadConfigs() {
  deepseekConfig.value = aiStore.deepseekConfig
  doubaoConfig.value = aiStore.doubaoConfig

  if (deepseekConfig.value) {
    deepseekForm.apiKey = deepseekConfig.value.apiKey
    deepseekForm.model = deepseekConfig.value.model
    deepseekForm.maxTokens = deepseekConfig.value.maxTokens
    deepseekForm.temperature = deepseekConfig.value.temperature
  }

  if (doubaoConfig.value) {
    doubaoForm.apiKey = doubaoConfig.value.apiKey
    doubaoForm.model = doubaoConfig.value.model
    doubaoForm.maxTokens = doubaoConfig.value.maxTokens
    doubaoForm.temperature = doubaoConfig.value.temperature
  }
}

function saveDeepseekConfig() {
  if (!deepseekForm.apiKey.trim()) {
    ElMessage.warning('请输入API密钥')
    return
  }

  saving.value = true
  aiStore.saveConfig({
    id: deepseekConfig.value?.id || 'deepseek-' + Date.now(),
    name: 'deepseek',
    apiKey: deepseekForm.apiKey,
    baseURL: AI_PLATFORMS.DEEPSEEK.baseURL,
    model: deepseekForm.model,
    maxTokens: deepseekForm.maxTokens,
    temperature: deepseekForm.temperature,
    isEnabled: true,
  })
  saving.value = false
  ElMessage.success('DeepSeek配置保存成功')
  loadConfigs()
}

function saveDoubaoConfig() {
  if (!doubaoForm.apiKey.trim()) {
    ElMessage.warning('请输入API密钥')
    return
  }

  saving.value = true
  aiStore.saveConfig({
    id: doubaoConfig.value?.id || 'doubao-' + Date.now(),
    name: 'doubao',
    apiKey: doubaoForm.apiKey,
    baseURL: AI_PLATFORMS.DOUBAO.baseURL,
    model: doubaoForm.model,
    maxTokens: doubaoForm.maxTokens,
    temperature: doubaoForm.temperature,
    isEnabled: true,
  })
  saving.value = false
  ElMessage.success('豆包AI配置保存成功')
  loadConfigs()
}

async function testDeepseekConnection() {
  testingDeepseek.value = true
  try {
    const { useAI } = await import('@/composables/useAI')
    const { callAI } = useAI()
    await callAI(
      [{ role: 'user', content: '你好，这是一个测试消息' }],
      'deepseek'
    )
    ElMessage.success('DeepSeek连接测试成功')
  } catch (error) {
    ElMessage.error('DeepSeek连接测试失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    testingDeepseek.value = false
  }
}

async function testDoubaoConnection() {
  testingDoubao.value = true
  try {
    const { useAI } = await import('@/composables/useAI')
    const { callAI } = useAI()
    await callAI(
      [{ role: 'user', content: '你好，这是一个测试消息' }],
      'doubao'
    )
    ElMessage.success('豆包AI连接测试成功')
  } catch (error) {
    ElMessage.error('豆包AI连接测试失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    testingDoubao.value = false
  }
}

function clearLogs() {
  aiStore.clearLogs()
  logs.value = []
  ElMessage.success('日志已清空')
}
</script>

<style scoped lang="scss">
.ai-config-page {
  .config-cards {
    margin-top: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .slider-value {
    margin-left: 12px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }

  .logs-card {
    margin-top: 20px;
  }
}
</style>
