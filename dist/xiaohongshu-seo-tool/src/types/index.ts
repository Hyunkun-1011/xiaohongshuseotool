export interface AIPlatformConfig {
  id: string
  name: 'deepseek' | 'doubao'
  apiKey: string
  baseURL: string
  model: string
  maxTokens: number
  temperature: number
  isEnabled: boolean
}

export interface AICallLog {
  id: string
  timestamp: number
  platform: string
  function: string
  status: 'success' | 'failed'
  tokensUsed?: number
  errorMessage?: string
  duration: number
}

export interface Keyword {
  id: string
  word: string
  heat: number
  competition: number
  searchVolume: number
  category: string
  usage: ('title' | 'content' | 'tag')[]
  adaptability: number
  createdAt: number
  updatedAt: number
}

export interface KeywordGroup {
  id: string
  name: string
  keywords: Keyword[]
  category: string
}

export interface SEOAnalysisReport {
  id: string
  title: string
  content: string
  url?: string
  scores: {
    keywordDensity: number
    titleMatch: number
    tagRationality: number
    contentQuality: number
    overall: number
  }
  suggestions: string[]
  risks: string[]
  createdAt: number
}

export interface CompetitorAnalysis {
  id: string
  accountUrl: string
  strategy: string
  keywords: string[]
  differentiation: string[]
}

export interface GeneratedContent {
  id: string
  title: string
  body: string
  tags: string[]
  keywords: string[]
  type: 'note' | 'title' | 'tag'
  style: string
  isOptimized: boolean
  createdAt: number
}

export interface ContentDraft {
  id: string
  content: GeneratedContent
  editedContent?: string
  status: 'draft' | 'published'
  savedAt: number
}

export interface NoteData {
  id: string
  noteId: string
  title: string
  date: string
  exposure: number
  clicks: number
  likes: number
  collections: number
  comments: number
  keywordRanks: Record<string, number>
}

export interface DataReport {
  id: string
  period: [string, string]
  notes: NoteData[]
  trends: {
    dates: string[]
    exposures: number[]
    clicks: number[]
    likes: number[]
  }
  analysis: string
  suggestions: string[]
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'never'
  aiQuotaWarning: number
  language: 'zh-CN'
}
