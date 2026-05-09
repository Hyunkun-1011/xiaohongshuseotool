# 小红书SEO工具

个人专属的小红书SEO自动化Web端工具，纯前端应用，无需后端服务器。

## 功能模块

- **AI平台配置** - 对接DeepSeek、豆包AI双平台，API密钥加密存储
- **关键词挖掘** - AI挖掘长尾词、热门词，支持分类筛选和Excel导出
- **内容分析** - SEO诊断、竞品分析，支持PDF/Excel报告导出
- **内容生成** - 自动生成笔记标题、正文、标签，支持在线编辑
- **数据监控** - 笔记数据趋势图表，支持日/周/月筛选
- **辅助功能** - 笔记模板、系统设置、数据备份导入导出

## 技术栈

- Vue 3 + TypeScript
- Element Plus
- Pinia + Vue Router
- ECharts
- Vite

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物在 `dist/` 目录，可直接部署为静态网站。

## 部署

支持 GitHub Pages、Netlify、Vercel、Cloudflare Pages 等平台。

## 配置

首次使用需在"AI平台配置"页面配置 API 密钥：
- DeepSeek：在 platform.deepseek.com 获取
- 豆包AI：在 ark.bytedance.net 获取