<template>
  <div class="keyword-mining-page">
    <el-page-header title="关键词挖掘" content="输入核心关键词，AI自动挖掘相关长尾词、热门词" />

    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="核心关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入核心关键词，如：护肤、穿搭"
            style="width: 300px"
            @keyup.enter="mineKeywords"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="选择分类" style="width: 150px">
            <el-option
              v-for="cat in KEYWORD_CATEGORIES"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="mineKeywords" :loading="loading">
            <el-icon><Search /></el-icon>
            挖掘关键词
          </el-button>
          <el-button @click="exportKeywords">
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="keywords.length > 0" class="result-card">
      <template #header>
        <div class="card-header">
          <span>挖掘结果 ({{ keywords.length }}个)</span>
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="table">表格</el-radio-button>
            <el-radio-button label="card">卡片</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table v-if="viewMode === 'table'" :data="keywords" style="width: 100%" v-loading="loading">
        <el-table-column type="index" width="50" />
        <el-table-column prop="word" label="关键词" width="200">
          <template #default="{ row }">
            <el-tag size="small">{{ row.word }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="heat" label="热度">
          <template #default="{ row }">
            <el-progress :percentage="row.heat" :color="heatColors" />
          </template>
        </el-table-column>
        <el-table-column prop="competition" label="竞争度">
          <template #default="{ row }">
            <el-progress :percentage="row.competition" :color="competitionColors" />
          </template>
        </el-table-column>
        <el-table-column prop="searchVolume" label="搜索量" width="120" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ getCategoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usage" label="适用场景" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="u in row.usage"
              :key="u"
              size="small"
              :type="u === 'title' ? 'primary' : u === 'content' ? 'success' : 'warning'"
              class="usage-tag"
            >
              {{ u === 'title' ? '标题' : u === 'content' ? '正文' : '标签' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="adaptability" label="适配度" width="100">
          <template #default="{ row }">
            <el-rate :model-value="row.adaptability / 20" disabled show-score />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="copyKeyword(row.word)">复制</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row v-else :gutter="16">
        <el-col v-for="keyword in keywords" :key="keyword.id" :span="6">
          <el-card class="keyword-card" shadow="hover">
            <div class="keyword-title">{{ keyword.word }}</div>
            <div class="keyword-meta">
              <el-tag size="small" type="info">{{ getCategoryLabel(keyword.category) }}</el-tag>
              <span class="search-volume">搜索量: {{ keyword.searchVolume }}</span>
            </div>
            <div class="keyword-metrics">
              <div class="metric">
                <span>热度</span>
                <el-progress :percentage="keyword.heat" :color="heatColors" />
              </div>
              <div class="metric">
                <span>竞争度</span>
                <el-progress :percentage="keyword.competition" :color="competitionColors" />
              </div>
            </div>
            <div class="keyword-usage">
              <el-tag
                v-for="u in keyword.usage"
                :key="u"
                size="small"
                :type="u === 'title' ? 'primary' : u === 'content' ? 'success' : 'warning'"
              >
                {{ u === 'title' ? '标题' : u === 'content' ? '正文' : '标签' }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-empty v-else-if="!loading" description="输入核心关键词开始挖掘" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import { useAI } from '@/composables/useAI'
import { KEYWORD_CATEGORIES } from '@/utils/constants'
import type { Keyword } from '@/types'
import * as XLSX from 'xlsx'

const { callAI, isLoading } = useAI()

const loading = isLoading
const viewMode = ref<'table' | 'card'>('table')
const keywords = ref<Keyword[]>([])

const searchForm = reactive({
  keyword: '',
  category: '',
})

const heatColors = [
  { color: '#67C23A', percentage: 30 },
  { color: '#E6A23C', percentage: 70 },
  { color: '#F56C6C', percentage: 100 },
]

const competitionColors = [
  { color: '#67C23A', percentage: 30 },
  { color: '#E6A23C', percentage: 70 },
  { color: '#F56C6C', percentage: 100 },
]

function getCategoryLabel(value: string): string {
  return KEYWORD_CATEGORIES.find(c => c.value === value)?.label || value
}

async function mineKeywords() {
  if (!searchForm.keyword.trim()) {
    ElMessage.warning('请输入核心关键词')
    return
  }

  try {
    const prompt = `请基于核心关键词"${searchForm.keyword}"，挖掘相关的小红书SEO关键词。
要求：
1. 提供15-20个相关关键词，包括长尾词、热门词、低竞争高流量词
2. 每个关键词标注：热度(0-100)、竞争度(0-100)、预估搜索量
3. 按行业/产品/场景/人群分类
4. 标注每个关键词的适用场景（标题/正文/标签）
5. 给出与个人运营内容的适配度评分(0-100)

请以JSON格式返回，格式如下：
{
  "keywords": [
    {
      "word": "关键词",
      "heat": 85,
      "competition": 60,
      "searchVolume": 5000,
      "category": "industry|product|scene|audience",
      "usage": ["title", "content", "tag"],
      "adaptability": 90
    }
  ]
}`

    const result = await callAI([
      { role: 'system', content: '你是一个专业的小红书SEO关键词分析师，擅长挖掘高价值关键词。' },
      { role: 'user', content: prompt },
    ])

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0])
      keywords.value = (data.keywords || []).map((k: Keyword, index: number) => ({
        ...k,
        id: `kw-${Date.now()}-${index}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }))
      ElMessage.success(`成功挖掘 ${keywords.value.length} 个关键词`)
    } else {
      ElMessage.warning('未能解析关键词数据，请重试')
    }
  } catch (error) {
    ElMessage.error('关键词挖掘失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

function exportKeywords() {
  if (keywords.value.length === 0) {
    ElMessage.warning('没有可导出的关键词')
    return
  }

  const data = keywords.value.map(k => ({
    关键词: k.word,
    热度: k.heat,
    竞争度: k.competition,
    搜索量: k.searchVolume,
    分类: getCategoryLabel(k.category),
    适用场景: k.usage.map(u => u === 'title' ? '标题' : u === 'content' ? '正文' : '标签').join('、'),
    适配度: k.adaptability,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '关键词')
  XLSX.writeFile(wb, `关键词挖掘_${searchForm.keyword}_${new Date().toLocaleDateString()}.xlsx`)
  ElMessage.success('导出成功')
}

function copyKeyword(word: string) {
  navigator.clipboard.writeText(word).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}
</script>

<style scoped lang="scss">
.keyword-mining-page {
  .search-card {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .usage-tag {
    margin-right: 4px;
  }

  .keyword-card {
    margin-bottom: 16px;

    .keyword-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .keyword-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .search-volume {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .keyword-metrics {
      margin-bottom: 12px;

      .metric {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        span {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          width: 40px;
        }
      }
    }

    .keyword-usage {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }
}
</style>
