export const STORAGE_KEYS = {
  AI_CONFIGS: 'xhs_ai_configs',
  AI_LOGS: 'xhs_ai_logs',
  KEYWORDS: 'xhs_keywords',
  KEYWORD_GROUPS: 'xhs_keyword_groups',
  ANALYSIS_REPORTS: 'xhs_analysis_reports',
  COMPETITOR_ANALYSES: 'xhs_competitor_analyses',
  GENERATED_CONTENTS: 'xhs_generated_contents',
  CONTENT_DRAFTS: 'xhs_content_drafts',
  NOTE_DATA: 'xhs_note_data',
  DATA_REPORTS: 'xhs_data_reports',
  APP_SETTINGS: 'xhs_app_settings',
  NOTIFICATIONS: 'xhs_notifications',
  TEMPLATES: 'xhs_templates',
}

export const AI_PLATFORMS = {
  DEEPSEEK: {
    name: 'deepseek' as const,
    label: 'DeepSeek',
    baseURL: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
    maxTokensRange: [500, 2000],
    temperatureRange: [0.3, 0.8],
  },
  DOUBAO: {
    name: 'doubao' as const,
    label: '豆包AI',
    baseURL: 'https://ark.bytedance.net/api/v3',
    models: ['doubao-1.5-pro-32k', 'doubao-1.5-lite-32k'],
    defaultModel: 'doubao-1.5-pro-32k',
    maxTokensRange: [500, 2000],
    temperatureRange: [0.3, 0.8],
  },
}

export const KEYWORD_CATEGORIES = [
  { value: 'industry', label: '行业' },
  { value: 'product', label: '产品' },
  { value: 'scene', label: '场景' },
  { value: 'audience', label: '人群' },
]

export const CONTENT_STYLES = [
  { value: 'casual', label: '轻松随意' },
  { value: 'professional', label: '专业严谨' },
  { value: 'story', label: '故事叙事' },
  { value: 'tutorial', label: '教程攻略' },
  { value: 'review', label: '测评种草' },
]

export const NOTE_TYPES = [
  { value: 'image', label: '图文笔记' },
  { value: 'video', label: '视频笔记' },
  { value: 'live', label: '直播笔记' },
]

export const DEFAULT_SETTINGS = {
  theme: 'light' as const,
  backupFrequency: 'weekly' as const,
  aiQuotaWarning: 80,
  language: 'zh-CN' as const,
}
