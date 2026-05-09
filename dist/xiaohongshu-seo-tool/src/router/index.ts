import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/layout/MainLayout.vue'),
    redirect: '/ai-config',
    children: [
      {
        path: 'ai-config',
        name: 'AIConfig',
        component: () => import('@/views/ai-config/index.vue'),
        meta: { title: 'AI平台配置', icon: 'Setting' },
      },
      {
        path: 'keyword-mining',
        name: 'KeywordMining',
        component: () => import('@/views/keyword-mining/index.vue'),
        meta: { title: '关键词挖掘', icon: 'Search' },
      },
      {
        path: 'content-analysis',
        name: 'ContentAnalysis',
        component: () => import('@/views/content-analysis/index.vue'),
        meta: { title: '内容分析', icon: 'Document' },
      },
      {
        path: 'content-generation',
        name: 'ContentGeneration',
        component: () => import('@/views/content-generation/index.vue'),
        meta: { title: '内容生成', icon: 'EditPen' },
      },
      {
        path: 'data-monitor',
        name: 'DataMonitor',
        component: () => import('@/views/data-monitor/index.vue'),
        meta: { title: '数据监控', icon: 'TrendCharts' },
      },
      {
        path: 'auxiliary',
        name: 'Auxiliary',
        component: () => import('@/views/auxiliary/index.vue'),
        meta: { title: '辅助功能', icon: 'Tools' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory('/xiaohongshuseotool/'),
  routes,
})

export default router
