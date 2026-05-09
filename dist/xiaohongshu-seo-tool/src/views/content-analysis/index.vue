<template>
  <div class="content-analysis-page">
    <el-page-header title="内容分析" content="AI分析笔记SEO情况，生成诊断报告" />

    <el-card class="input-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="单篇分析" name="single">
          <el-form :model="singleForm" label-width="100px">
            <el-form-item label="笔记链接">
              <el-input
                v-model="singleForm.url"
                placeholder="粘贴小红书笔记链接（可选）"
              />
            </el-form-item>
            <el-form-item label="笔记标题">
              <el-input
                v-model="singleForm.title"
                placeholder="输入笔记标题"
              />
            </el-form-item>
            <el-form-item label="笔记内容">
              <el-input
                v-model="singleForm.content"
                type="textarea"
                :rows="10"
                placeholder="粘贴笔记正文内容"
              />
            </el-form-item>
            <el-form-item label="标签">
              <el-input
                v-model="singleForm.tags"
                placeholder="输入标签，用空格或逗号分隔"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="analyzeSingle" :loading="analyzing">
                开始分析
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="批量分析" name="batch">
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".txt,.md"
            multiple
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 .txt 和 .md 格式，每篇笔记用 --- 分隔
              </div>
            </template>
          </el-upload>
          <el-button type="primary" @click="analyzeBatch" :loading="analyzing" :disabled="batchFiles.length === 0">
            批量分析
          </el-button>
        </el-tab-pane>

        <el-tab-pane label="竞品分析" name="competitor">
          <el-form :model="competitorForm" label-width="120px">
            <el-form-item label="竞品账号链接">
              <el-input
                v-model="competitorForm.accountUrl"
                placeholder="输入竞品小红书账号主页链接"
              />
            </el-form-item>
            <el-form-item label="竞品笔记链接">
              <el-input
                v-model="competitorForm.noteUrl"
                placeholder="输入竞品笔记链接（可选）"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="analyzeCompetitor" :loading="analyzing">
                分析竞品
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-card v-if="report" class="report-card">
      <template #header>
        <div class="card-header">
          <span>SEO诊断报告</span>
          <div class="actions">
            <el-button type="primary" size="small" @click="exportPDF">
              <el-icon><Document /></el-icon>
              导出PDF
            </el-button>
            <el-button size="small" @click="exportExcel">
              <el-icon><Grid /></el-icon>
              导出Excel
            </el-button>
          </div>
        </div>
      </template>

      <div class="report-content">
        <div class="score-overview">
          <el-row :gutter="20">
            <el-col :span="4">
              <div class="score-item overall">
                <div class="score-value">{{ report.scores.overall }}</div>
                <div class="score-label">综合评分</div>
              </div>
            </el-col>
            <el-col :span="5">
              <div class="score-item">
                <el-progress type="dashboard" :percentage="report.scores.keywordDensity" />
                <div class="score-label">关键词密度</div>
              </div>
            </el-col>
            <el-col :span="5">
              <div class="score-item">
                <el-progress type="dashboard" :percentage="report.scores.titleMatch" />
                <div class="score-label">标题适配度</div>
              </div>
            </el-col>
            <el-col :span="5">
              <div class="score-item">
                <el-progress type="dashboard" :percentage="report.scores.tagRationality" />
                <div class="score-label">标签合理性</div>
              </div>
            </el-col>
            <el-col :span="5">
              <div class="score-item">
                <el-progress type="dashboard" :percentage="report.scores.contentQuality" />
                <div class="score-label">内容质量</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-divider />

        <div class="suggestions-section">
          <h3>优化建议</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(suggestion, index) in report.suggestions"
              :key="index"
              type="primary"
            >
              {{ suggestion }}
            </el-timeline-item>
          </el-timeline>
        </div>

        <el-divider />

        <div v-if="report.risks.length > 0" class="risks-section">
          <h3>风险提示</h3>
          <el-alert
            v-for="(risk, index) in report.risks"
            :key="index"
            :title="risk"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 8px"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Document, Grid } from '@element-plus/icons-vue'
import { useAI } from '@/composables/useAI'
import type { SEOAnalysisReport } from '@/types'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

const { callAI, isLoading } = useAI()

const analyzing = isLoading
const activeTab = ref('single')
const report = ref<SEOAnalysisReport | null>(null)
const batchFiles = ref<File[]>([])

const singleForm = reactive({
  url: '',
  title: '',
  content: '',
  tags: '',
})

const competitorForm = reactive({
  accountUrl: '',
  noteUrl: '',
})

function handleFileChange(file: { raw: File }) {
  batchFiles.value.push(file.raw)
}

async function analyzeSingle() {
  if (!singleForm.title && !singleForm.content) {
    ElMessage.warning('请输入标题或内容')
    return
  }

  try {
    const prompt = `请对以下小红书笔记进行SEO分析：
标题：${singleForm.title}
内容：${singleForm.content}
标签：${singleForm.tags}

请从以下维度进行分析：
1. 关键词密度和分布
2. 标题与内容的相关性
3. 标签的合理性和覆盖度
4. 内容质量和结构
5. 违规风险排查

请以JSON格式返回：
{
  "scores": {
    "keywordDensity": 85,
    "titleMatch": 90,
    "tagRationality": 75,
    "contentQuality": 88,
    "overall": 85
  },
  "suggestions": ["建议1", "建议2"],
  "risks": ["风险1"]
}`

    const result = await callAI([
      { role: 'system', content: '你是小红书平台的SEO诊断专家。' },
      { role: 'user', content: prompt },
    ], 'doubao')

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0])
      report.value = {
        id: `report-${Date.now()}`,
        title: singleForm.title,
        content: singleForm.content,
        url: singleForm.url,
        scores: data.scores,
        suggestions: data.suggestions,
        risks: data.risks,
        createdAt: Date.now(),
      }
      ElMessage.success('分析完成')
    }
  } catch (error) {
    ElMessage.error('分析失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

async function analyzeBatch() {
  ElMessage.info('批量分析功能开发中...')
}

async function analyzeCompetitor() {
  if (!competitorForm.accountUrl) {
    ElMessage.warning('请输入竞品账号链接')
    return
  }

  try {
    const prompt = `请分析以下小红书竞品账号的SEO策略：
账号链接：${competitorForm.accountUrl}
笔记链接：${competitorForm.noteUrl}

请分析：
1. 竞品的关键词策略
2. 内容布局和结构
3. 标签使用习惯
4. 差异化建议

请以JSON格式返回分析结果。`

    const result = await callAI([
      { role: 'system', content: '你是小红书平台的竞品分析专家。' },
      { role: 'user', content: prompt },
    ], 'doubao')

    ElMessage.success('竞品分析完成')
    console.log(result)
  } catch (error) {
    ElMessage.error('竞品分析失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

async function exportPDF() {
  if (!report.value) return

  const element = document.querySelector('.report-content')
  if (!element) return

  try {
    const canvas = await html2canvas(element as HTMLElement)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`SEO诊断报告_${new Date().toLocaleDateString()}.pdf`)
    ElMessage.success('PDF导出成功')
  } catch {
    ElMessage.error('PDF导出失败')
  }
}

function exportExcel() {
  if (!report.value) return

  const data = [{
    标题: report.value.title,
    综合评分: report.value.scores.overall,
    关键词密度: report.value.scores.keywordDensity,
    标题适配度: report.value.scores.titleMatch,
    标签合理性: report.value.scores.tagRationality,
    内容质量: report.value.scores.contentQuality,
    优化建议: report.value.suggestions.join('; '),
    风险提示: report.value.risks.join('; '),
  }]

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'SEO诊断')
  XLSX.writeFile(wb, `SEO诊断报告_${new Date().toLocaleDateString()}.xlsx`)
  ElMessage.success('Excel导出成功')
}
</script>

<style scoped lang="scss">
.content-analysis-page {
  .input-card {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .report-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .score-overview {
    .score-item {
      text-align: center;
      padding: 20px;

      &.overall {
        .score-value {
          font-size: 48px;
          font-weight: 700;
          color: var(--el-color-primary);
        }
      }

      .score-label {
        margin-top: 8px;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .suggestions-section,
  .risks-section {
    h3 {
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 600;
    }
  }
}
</style>
