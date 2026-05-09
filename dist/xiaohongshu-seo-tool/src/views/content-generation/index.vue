<template>
  <div class="content-generation-page">
    <el-page-header title="内容生成" content="AI自动生成小红书笔记标题、正文、标签" />

    <el-row :gutter="20" class="generation-form">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>生成配置</span>
          </template>

          <el-form :model="form" label-width="100px">
            <el-form-item label="核心关键词">
              <el-input
                v-model="form.keywords"
                placeholder="输入核心关键词，多个用逗号分隔"
                :disabled="generating"
              />
            </el-form-item>

            <el-form-item label="笔记类型">
              <el-radio-group v-model="form.noteType" :disabled="generating">
                <el-radio-button v-for="type in NOTE_TYPES" :key="type.value" :label="type.value">
                  {{ type.label }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="内容风格">
              <el-select v-model="form.style" style="width: 200px" :disabled="generating">
                <el-option
                  v-for="style in CONTENT_STYLES"
                  :key="style.value"
                  :label="style.label"
                  :value="style.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="字数">
              <el-slider v-model="form.wordCount" :min="500" :max="2000" :step="100" show-stops :disabled="generating" />
              <span class="slider-value">{{ form.wordCount }}字</span>
            </el-form-item>

            <el-form-item label="选项">
              <el-checkbox v-model="form.includeTopics" :disabled="generating">添加话题</el-checkbox>
              <el-checkbox v-model="form.includeEmojis" :disabled="generating">添加表情</el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="generateContent" :loading="generating" :disabled="!form.keywords.trim()">
                <el-icon><MagicStick /></el-icon>
                生成笔记
              </el-button>
              <el-button @click="generateTitleOnly" :loading="generating" :disabled="!form.keywords.trim()">
                仅生成标题
              </el-button>
              <el-button @click="generateTagsOnly" :loading="generating" :disabled="!form.keywords.trim()">
                仅生成标签
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>生成历史</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="item in history"
              :key="item.id"
              :timestamp="new Date(item.createdAt).toLocaleString()"
              placement="top"
            >
              <el-card size="small">
                <div class="history-title">{{ item.title }}</div>
                <div class="history-tags">
                  <el-tag v-for="tag in item.tags.slice(0, 3)" :key="tag" size="small">{{ tag }}</el-tag>
                </div>
                <div class="history-actions">
                  <el-button type="primary" size="small" @click="loadHistory(item)">加载</el-button>
                  <el-button size="small" @click="copyContent(item)">复制</el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-if="history.length === 0" description="暂无生成历史" />
        </el-card>
      </el-col>
    </el-row>

    <el-card v-if="generatedContent" class="result-card">
      <template #header>
        <div class="card-header">
          <span>生成结果</span>
          <div class="actions">
            <el-button type="primary" size="small" @click="copyContent(generatedContent)">
              <el-icon><DocumentCopy /></el-icon>
              复制全部
            </el-button>
            <el-button size="small" @click="saveDraft">
              <el-icon><FolderChecked /></el-icon>
              保存草稿
            </el-button>
          </div>
        </div>
      </template>

      <div class="content-preview">
        <div class="title-section">
          <h3>标题</h3>
          <el-input v-model="editableTitle" type="textarea" :rows="2" />
        </div>

        <div class="body-section">
          <h3>正文</h3>
          <el-input v-model="editableBody" type="textarea" :rows="15" />
        </div>

        <div class="tags-section">
          <h3>标签</h3>
          <div class="tags-edit">
            <el-tag
              v-for="(tag, index) in editableTags"
              :key="index"
              closable
              @close="removeTag(index)"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputTagVisible"
              ref="tagInputRef"
              v-model="inputTagValue"
              size="small"
              style="width: 100px"
              @keyup.enter="addTag"
              @blur="addTag"
            />
            <el-button v-else size="small" @click="showTagInput">+ 添加标签</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, DocumentCopy, FolderChecked } from '@element-plus/icons-vue'
import { useAI } from '@/composables/useAI'
import { NOTE_TYPES, CONTENT_STYLES, STORAGE_KEYS } from '@/utils/constants'
import { setItem, getItem } from '@/utils/storage'
import type { GeneratedContent } from '@/types'

const { callAI, isLoading } = useAI()

const generating = isLoading
const history = ref<GeneratedContent[]>(getItem<GeneratedContent[]>(STORAGE_KEYS.GENERATED_CONTENTS) || [])
const generatedContent = ref<GeneratedContent | null>(null)

const form = reactive({
  keywords: '',
  noteType: 'image',
  style: 'casual',
  wordCount: 800,
  includeTopics: true,
  includeEmojis: true,
})

const editableTitle = ref('')
const editableBody = ref('')
const editableTags = ref<string[]>([])
const inputTagVisible = ref(false)
const inputTagValue = ref('')
const tagInputRef = ref<HTMLInputElement | null>(null)

async function generateContent() {
  if (!form.keywords.trim()) {
    ElMessage.warning('请输入核心关键词')
    return
  }

  try {
    const prompt = `请为小红书平台生成一篇完整的笔记，要求如下：
核心关键词：${form.keywords}
笔记类型：${NOTE_TYPES.find(t => t.value === form.noteType)?.label}
内容风格：${CONTENT_STYLES.find(s => s.value === form.style)?.label}
字数：${form.wordCount}字左右
${form.includeTopics ? '需要添加相关话题标签' : ''}
${form.includeEmojis ? '适当添加表情符号' : ''}

要求：
1. 标题吸引人，包含核心关键词，符合小红书平台调性
2. 正文内容实用、有干货，结构清晰
3. 标签精准，覆盖核心词和长尾词
4. 避免违规内容，符合平台规则
5. 自然融入关键词，不堆砌

请以JSON格式返回：
{
  "title": "笔记标题",
  "body": "笔记正文内容",
  "tags": ["标签1", "标签2", "标签3"]
}`

    const result = await callAI([
      { role: 'system', content: '你是小红书平台的内容创作专家，擅长撰写高质量的种草笔记。' },
      { role: 'user', content: prompt },
    ])

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0])
      const content: GeneratedContent = {
        id: `content-${Date.now()}`,
        title: data.title || '',
        body: data.body || '',
        tags: data.tags || [],
        keywords: form.keywords.split(',').map(k => k.trim()),
        type: 'note',
        style: form.style,
        isOptimized: false,
        createdAt: Date.now(),
      }

      generatedContent.value = content
      editableTitle.value = content.title
      editableBody.value = content.body
      editableTags.value = [...content.tags]

      history.value.unshift(content)
      if (history.value.length > 20) {
        history.value = history.value.slice(0, 20)
      }
      setItem(STORAGE_KEYS.GENERATED_CONTENTS, history.value)

      ElMessage.success('内容生成成功')
    } else {
      ElMessage.warning('未能解析生成内容，请重试')
    }
  } catch (error) {
    ElMessage.error('内容生成失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

async function generateTitleOnly() {
  if (!form.keywords.trim()) {
    ElMessage.warning('请输入核心关键词')
    return
  }

  try {
    const prompt = `请为小红书平台生成10个吸引人的笔记标题，核心关键词：${form.keywords}
要求：
1. 每个标题都包含核心关键词
2. 标题风格：${CONTENT_STYLES.find(s => s.value === form.style)?.label}
3. 标题要有吸引力，能引发用户点击
4. 符合小红书平台调性

请以JSON格式返回：{"titles": ["标题1", "标题2", ...]}`

    const result = await callAI([
      { role: 'system', content: '你是小红书平台的标题创作专家。' },
      { role: 'user', content: prompt },
    ])

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0])
      const titles = data.titles || []
      editableTitle.value = titles.join('\n')
      ElMessage.success('标题生成成功')
    }
  } catch (error) {
    ElMessage.error('标题生成失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

async function generateTagsOnly() {
  if (!form.keywords.trim()) {
    ElMessage.warning('请输入核心关键词')
    return
  }

  try {
    const prompt = `请为小红书笔记生成20个精准标签，核心关键词：${form.keywords}
要求：
1. 标签要覆盖核心词、长尾词、热门话题
2. 标签要精准，与内容高度相关
3. 包含一些热门通用标签

请以JSON格式返回：{"tags": ["标签1", "标签2", ...]}`

    const result = await callAI([
      { role: 'system', content: '你是小红书平台的标签优化专家。' },
      { role: 'user', content: prompt },
    ])

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0])
      editableTags.value = data.tags || []
      ElMessage.success('标签生成成功')
    }
  } catch (error) {
    ElMessage.error('标签生成失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

function loadHistory(item: GeneratedContent) {
  generatedContent.value = item
  editableTitle.value = item.title
  editableBody.value = item.body
  editableTags.value = [...item.tags]
}

function copyContent(item: GeneratedContent) {
  const text = `${item.title}\n\n${item.body}\n\n${item.tags.map(t => '#' + t).join(' ')}`
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

function saveDraft() {
  if (!generatedContent.value) return

  const draft = {
    ...generatedContent.value,
    title: editableTitle.value,
    body: editableBody.value,
    tags: [...editableTags.value],
  }

  const drafts = getItem<GeneratedContent[]>(STORAGE_KEYS.CONTENT_DRAFTS) || []
  drafts.unshift(draft)
  setItem(STORAGE_KEYS.CONTENT_DRAFTS, drafts)
  ElMessage.success('草稿保存成功')
}

function removeTag(index: number) {
  editableTags.value.splice(index, 1)
}

function showTagInput() {
  inputTagVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

function addTag() {
  if (inputTagValue.value.trim()) {
    editableTags.value.push(inputTagValue.value.trim())
    inputTagValue.value = ''
  }
  inputTagVisible.value = false
}
</script>

<style scoped lang="scss">
.content-generation-page {
  .generation-form {
    margin-top: 20px;
  }

  .slider-value {
    margin-left: 12px;
    color: var(--el-text-color-secondary);
  }

  .result-card {
    margin-top: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .content-preview {
    .title-section,
    .body-section,
    .tags-section {
      margin-bottom: 20px;

      h3 {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .tags-edit {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .tag-item {
        margin-right: 4px;
      }
    }
  }

  .history-title {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .history-tags {
    margin-bottom: 8px;

    .el-tag {
      margin-right: 4px;
      margin-bottom: 4px;
    }
  }

  .history-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
