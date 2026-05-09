<template>
  <div class="auxiliary-page">
    <el-page-header title="辅助功能" content="模板库、系统设置、数据管理" />

    <el-row :gutter="20" class="feature-cards">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>笔记模板</span>
          </template>
          <el-collapse>
            <el-collapse-item title="种草模板" name="1">
              <div class="template-content">
                <p>标题：{{ templates.planting.title }}</p>
                <p>结构：{{ templates.planting.structure }}</p>
                <el-button type="primary" size="small" @click="useTemplate('planting')">使用模板</el-button>
              </div>
            </el-collapse-item>
            <el-collapse-item title="测评模板" name="2">
              <div class="template-content">
                <p>标题：{{ templates.review.title }}</p>
                <p>结构：{{ templates.review.structure }}</p>
                <el-button type="primary" size="small" @click="useTemplate('review')">使用模板</el-button>
              </div>
            </el-collapse-item>
            <el-collapse-item title="教程模板" name="3">
              <div class="template-content">
                <p>标题：{{ templates.tutorial.title }}</p>
                <p>结构：{{ templates.tutorial.structure }}</p>
                <el-button type="primary" size="small" @click="useTemplate('tutorial')">使用模板</el-button>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>系统设置</span>
          </template>
          <el-form :model="settingsForm" label-width="120px">
            <el-form-item label="界面主题">
              <el-radio-group v-model="settingsForm.theme" @change="updateTheme">
                <el-radio-button label="light">浅色</el-radio-button>
                <el-radio-button label="dark">深色</el-radio-button>
                <el-radio-button label="auto">跟随系统</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="备份频率">
              <el-select v-model="settingsForm.backupFrequency" style="width: 150px">
                <el-option label="每天" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
                <el-option label="从不" value="never" />
              </el-select>
            </el-form-item>
            <el-form-item label="额度预警">
              <el-slider v-model="settingsForm.aiQuotaWarning" :min="50" :max="95" :step="5" />
              <span>{{ settingsForm.aiQuotaWarning }}%</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>数据管理</span>
          </template>
          <div class="data-actions">
            <el-button type="primary" @click="exportData">
              <el-icon><Download /></el-icon>
              导出所有数据
            </el-button>
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleImport"
              accept=".json"
              style="display: inline-block; margin-left: 8px"
            >
              <el-button type="success">
                <el-icon><Upload /></el-icon>
                导入数据
              </el-button>
            </el-upload>
            <el-divider />
            <el-button type="danger" @click="clearAllData">
              <el-icon><Delete /></el-icon>
              清空所有数据
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload, Delete } from '@element-plus/icons-vue'
import { useSettingsStore } from '@/stores/settings'
import { exportAllData, importAllData, clearAll } from '@/utils/storage'

const settingsStore = useSettingsStore()

const settingsForm = reactive({
  theme: 'light' as 'light' | 'dark' | 'auto',
  backupFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'never',
  aiQuotaWarning: 80,
})

const templates = {
  planting: {
    title: '【真实测评】XXX真的好用吗？亲测30天告诉你答案',
    structure: '痛点引入 -> 产品介绍 -> 使用体验 -> 效果展示 -> 购买建议',
  },
  review: {
    title: '【深度测评】XXX vs YYY，到底哪个更值得买？',
    structure: '产品对比 -> 维度分析 -> 优缺点 -> 适用人群 -> 总结推荐',
  },
  tutorial: {
    title: '【保姆级教程】3分钟学会XXX，新手也能轻松上手',
    structure: '问题引入 -> 步骤拆解 -> 注意事项 -> 成果展示 -> 互动引导',
  },
}

onMounted(() => {
  settingsForm.theme = settingsStore.settings.theme
  settingsForm.backupFrequency = settingsStore.settings.backupFrequency
  settingsForm.aiQuotaWarning = settingsStore.settings.aiQuotaWarning
})

function updateTheme() {
  settingsStore.updateSettings({ theme: settingsForm.theme })
}

function saveSettings() {
  settingsStore.updateSettings({
    theme: settingsForm.theme,
    backupFrequency: settingsForm.backupFrequency,
    aiQuotaWarning: settingsForm.aiQuotaWarning,
  })
  ElMessage.success('设置保存成功')
}

function useTemplate(type: keyof typeof templates) {
  const template = templates[type]
  ElMessage.success(`已加载${type === 'planting' ? '种草' : type === 'review' ? '测评' : '教程'}模板`)
  console.log('Template:', template)
}

function exportData() {
  const data = exportAllData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `xhs-seo-tool-backup-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('数据导出成功')
}

function handleImport(file: { raw: File }) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (importAllData(content)) {
      ElMessage.success('数据导入成功')
      window.location.reload()
    } else {
      ElMessage.error('数据导入失败，请检查文件格式')
    }
  }
  reader.readAsText(file.raw)
}

async function clearAllData() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有数据吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    clearAll()
    ElMessage.success('数据已清空')
    window.location.reload()
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.auxiliary-page {
  .feature-cards {
    margin-top: 20px;
  }

  .template-content {
    p {
      margin-bottom: 8px;
      font-size: 14px;
    }
  }

  .data-actions {
    .el-button {
      margin-bottom: 8px;
    }
  }
}
</style>
