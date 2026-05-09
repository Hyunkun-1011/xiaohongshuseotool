<template>
  <el-container class="main-layout">
    <el-header class="layout-header">
      <div class="header-left">
        <el-icon class="logo-icon"><Collection /></el-icon>
        <span class="app-title">小红书SEO工具</span>
      </div>
      <div class="header-right">
        <el-badge :value="notificationCount" class="notification-badge">
          <el-button circle :icon="Bell" @click="showNotifications" />
        </el-badge>
        <el-button circle :icon="Setting" @click="goToSettings" />
        <el-button circle :icon="QuestionFilled" @click="showHelp" />
      </div>
    </el-header>

    <el-container class="main-container">
      <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
        <div class="collapse-btn" @click="toggleCollapse">
          <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          class="layout-menu"
        >
          <el-menu-item v-for="route in menuRoutes" :key="route.path" :index="route.path">
            <el-icon>
              <component :is="route.meta?.icon" />
            </el-icon>
            <template #title>{{ route.meta?.title }}</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <el-footer class="layout-footer">
      <div class="footer-content">
        <span>小红书SEO工具 v0.1.0-beta</span>
        <el-divider direction="vertical" />
        <span>纯前端应用，数据本地存储</span>
        <el-divider direction="vertical" />
        <el-link type="primary" @click="showDeployGuide">部署指南</el-link>
      </div>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Collection,
  Bell,
  Setting,
  QuestionFilled,
  Fold,
  Expand,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const isCollapse = ref(false)
const notificationCount = ref(3)

const activeMenu = computed(() => route.path)

const menuRoutes = [
  { path: '/ai-config', meta: { title: 'AI平台配置', icon: 'Setting' } },
  { path: '/keyword-mining', meta: { title: '关键词挖掘', icon: 'Search' } },
  { path: '/content-analysis', meta: { title: '内容分析', icon: 'Document' } },
  { path: '/content-generation', meta: { title: '内容生成', icon: 'EditPen' } },
  { path: '/data-monitor', meta: { title: '数据监控', icon: 'TrendCharts' } },
  { path: '/auxiliary', meta: { title: '辅助功能', icon: 'Tools' } },
]

function toggleCollapse() {
  isCollapse.value = !isCollapse.value
}

function showNotifications() {
  ElMessage.info('通知功能开发中...')
}

function goToSettings() {
  router.push('/auxiliary')
}

function showHelp() {
  ElMessage.info('帮助中心开发中...')
}

function showDeployGuide() {
  ElMessage.info('部署指南开发中...')
}
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--el-color-primary);
  color: white;
  height: 60px;
  padding: 0 20px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo-icon {
      font-size: 28px;
    }

    .app-title {
      font-size: 20px;
      font-weight: 600;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;

    .notification-badge {
      margin-right: 8px;
    }
  }
}

.main-container {
  flex: 1;
  overflow: hidden;
}

.layout-aside {
  background-color: var(--el-menu-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s;

  .collapse-btn {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-bottom: 1px solid var(--el-border-color-light);
    color: var(--el-text-color-regular);

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  .layout-menu {
    border-right: none;
    height: calc(100% - 40px);
  }
}

.layout-main {
  padding: 20px;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
}

.layout-footer {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  font-size: 12px;
  color: var(--el-text-color-secondary);

  .footer-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
