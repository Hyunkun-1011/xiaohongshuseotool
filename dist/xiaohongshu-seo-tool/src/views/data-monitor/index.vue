<template>
  <div class="data-monitor-page">
    <el-page-header title="数据监控" content="监控笔记数据，生成趋势图表" />

    <el-card class="input-card">
      <template #header>
        <span>数据录入</span>
      </template>

      <el-form :model="dataForm" inline>
        <el-form-item label="笔记标题">
          <el-input v-model="dataForm.title" placeholder="笔记标题" style="width: 200px" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="dataForm.date" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="曝光">
          <el-input-number v-model="dataForm.exposure" :min="0" />
        </el-form-item>
        <el-form-item label="点击">
          <el-input-number v-model="dataForm.clicks" :min="0" />
        </el-form-item>
        <el-form-item label="点赞">
          <el-input-number v-model="dataForm.likes" :min="0" />
        </el-form-item>
        <el-form-item label="收藏">
          <el-input-number v-model="dataForm.collections" :min="0" />
        </el-form-item>
        <el-form-item label="评论">
          <el-input-number v-model="dataForm.comments" :min="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addData">添加数据</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="notesData.length > 0" class="chart-card">
      <template #header>
        <div class="card-header">
          <span>数据趋势</span>
          <el-radio-group v-model="timeRange" size="small" @change="updateChart">
            <el-radio-button label="week">近7天</el-radio-button>
            <el-radio-button label="month">近30天</el-radio-button>
            <el-radio-button label="quarter">近90天</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <div ref="chartRef" class="chart-container" />
    </el-card>

    <el-card v-if="notesData.length > 0" class="table-card">
      <template #header>
        <span>数据明细</span>
      </template>

      <el-table :data="notesData" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="exposure" label="曝光" width="100" />
        <el-table-column prop="clicks" label="点击" width="100" />
        <el-table-column prop="likes" label="点赞" width="100" />
        <el-form-item label="收藏" width="100">
          <template #default="{ row }">
            {{ row.collections }}
          </template>
        </el-form-item>
        <el-table-column prop="comments" label="评论" width="100" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="deleteData(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-empty v-else description="暂无数据，请添加笔记数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { setItem, getItem } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import type { NoteData } from '@/types'

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const timeRange = ref('week')
const notesData = ref<NoteData[]>(getItem<NoteData[]>(STORAGE_KEYS.NOTE_DATA) || [])

const dataForm = reactive({
  title: '',
  date: new Date().toISOString().split('T')[0],
  exposure: 0,
  clicks: 0,
  likes: 0,
  collections: 0,
  comments: 0,
})

onMounted(() => {
  if (chartRef.value && notesData.value.length > 0) {
    initChart()
  }
})

onUnmounted(() => {
  chartInstance?.dispose()
})

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  updateChart()

  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}

function updateChart() {
  if (!chartInstance) return

  const filteredData = filterDataByRange(notesData.value, timeRange.value)
  const dates = filteredData.map(d => d.date)
  const exposures = filteredData.map(d => d.exposure)
  const clicks = filteredData.map(d => d.clicks)
  const likes = filteredData.map(d => d.likes)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['曝光', '点击', '点赞'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '曝光',
        type: 'line',
        smooth: true,
        data: exposures,
        itemStyle: { color: '#409EFF' },
        areaStyle: { opacity: 0.1 },
      },
      {
        name: '点击',
        type: 'line',
        smooth: true,
        data: clicks,
        itemStyle: { color: '#67C23A' },
        areaStyle: { opacity: 0.1 },
      },
      {
        name: '点赞',
        type: 'line',
        smooth: true,
        data: likes,
        itemStyle: { color: '#E6A23C' },
        areaStyle: { opacity: 0.1 },
      },
    ],
  }

  chartInstance.setOption(option)
}

function filterDataByRange(data: NoteData[], range: string): NoteData[] {
  const now = new Date()
  const days = range === 'week' ? 7 : range === 'month' ? 30 : 90
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  return data
    .filter(d => new Date(d.date) >= cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function addData() {
  if (!dataForm.title.trim()) {
    ElMessage.warning('请输入笔记标题')
    return
  }

  const noteData: NoteData = {
    id: `note-${Date.now()}`,
    noteId: '',
    title: dataForm.title,
    date: dataForm.date,
    exposure: dataForm.exposure,
    clicks: dataForm.clicks,
    likes: dataForm.likes,
    collections: dataForm.collections,
    comments: dataForm.comments,
    keywordRanks: {},
  }

  notesData.value.push(noteData)
  setItem(STORAGE_KEYS.NOTE_DATA, notesData.value)

  dataForm.title = ''
  dataForm.exposure = 0
  dataForm.clicks = 0
  dataForm.likes = 0
  dataForm.collections = 0
  dataForm.comments = 0

  ElMessage.success('数据添加成功')

  nextTick(() => {
    if (!chartInstance && chartRef.value) {
      initChart()
    } else {
      updateChart()
    }
  })
}

function deleteData(id: string) {
  notesData.value = notesData.value.filter(n => n.id !== id)
  setItem(STORAGE_KEYS.NOTE_DATA, notesData.value)
  updateChart()
  ElMessage.success('数据删除成功')
}
</script>

<style scoped lang="scss">
.data-monitor-page {
  .input-card {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .chart-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      height: 400px;
    }
  }

  .table-card {
    margin-bottom: 20px;
  }
}
</style>
