<!-- iAGS 2.0 — 顶部工具栏（复刻原 iAGS Cool 主题）
     左侧: Logo + 项目名称 + 描述 + 状态标记
     右侧: 一级菜单 Tab（进程树根节点） -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import type { ProcessNode } from '@/stores/useAuthStore'

const props = defineProps<{
  menuItems: ProcessNode[]
  activeMenu: string
}>()

const emit = defineEmits<{
  'update:activeMenu': [value: string]
}>()

const router = useRouter()
const auth = useAuthStore()

// 内联 SVG Logo（不依赖后端静态资源）
const LOGO_SVG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="%2327ae60" stroke="%23fff" stroke-width="2"/><path d="M14 30 Q24 10 34 30" fill="none" stroke="%23fff" stroke-width="2.5" stroke-linecap="round"/><line x1="24" y1="32" x2="24" y2="42" stroke="%23fff" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="24" r="4" fill="%23fff"/></svg>')
const logoUrl = computed(() => LOGO_SVG)
const projectName = computed(() => 'tmCropCloud')
const projectDesc = computed(() => 'Techmation Intelligent Crop Cloud')
const projectStatus = computed(() => '') // 测试环境状态文本，正式为空

// 一级菜单点击 → 切换左侧子菜单
function handleTopMenuClick(item: ProcessNode) {
  emit('update:activeMenu', item.processAID)
}

// 登出
async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <!-- 左侧：Logo + 品牌信息 -->
    <div class="header-left">
      <img :src="logoUrl" class="header-logo" alt="Logo" />
      <div class="header-brand">
        <p class="brand-name-line">
          <strong>{{ projectName }}</strong>
          <span class="brand-cn">{{ projectName }}</span>
        </p>
        <div class="brand-desc">{{ projectDesc }}</div>
      </div>
      <span v-if="projectStatus" class="project-status">{{ projectStatus }}</span>
    </div>

    <!-- 右侧：一级菜单 Tab + 用户信息 -->
    <div class="header-right">
      <nav class="top-menu-nav">
        <button
          v-for="item in menuItems"
          :key="item.processAID"
          :class="['top-menu-item', { active: item.processAID === activeMenu }]"
          @click="handleTopMenuClick(item)"
        >
          {{ item.name }}
        </button>
      </nav>
      <div class="header-user">
        <span class="user-info">{{ auth.userOrgName }} — {{ auth.userName }}</span>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ===== 顶部栏容器 ===== */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 65px;
  background: linear-gradient(to bottom, #3dcaed, #33b1d0);
  padding: 0 15px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  flex-shrink: 0;
  position: relative;
  z-index: 100;
}

/* ===== 左侧品牌区 ===== */
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.header-logo {
  height: 48px;
  object-fit: contain;
}

.header-brand {
  color: #fff;
  max-width: 380px;
}

.brand-name-line {
  margin: 0;
  padding-top: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-name-line strong {
  font-size: 24px;
  padding-right: 10px;
  font-family: 'Arial', sans-serif;
}

.brand-cn {
  font-size: 22px;
  letter-spacing: 3px;
}

.brand-desc {
  font-size: 13px;
  padding-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-status {
  font-size: 18px;
  color: red;
  padding: 35px 0 6px 5px;
}

/* ===== 右侧菜单区 ===== */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.top-menu-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.top-menu-item {
  background: none;
  border: none;
  color: rgba(255,255,255,0.85);
  font-size: 18px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  cursor: pointer;
  padding: 15px 12px;
  position: relative;
  white-space: nowrap;
  transition: color 0.2s;
}
.top-menu-item:hover {
  color: #fff;
}
.top-menu-item.active {
  color: #fff;
  font-weight: 600;
  background: linear-gradient(to bottom, #38bee0, #1c71da); /* 原 iAGS 激活菜单渐变 */
}

/* ===== 用户区 ===== */
.header-user {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.user-info {
  color: #fff;
  font-size: 13px;
  white-space: nowrap;
}

.logout-btn {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  padding: 4px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
}
.logout-btn:hover {
  background: rgba(255,255,255,0.25);
}
</style>
