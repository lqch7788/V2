<!-- iAGS 2.0 — 主布局（复刻原 iAGS Cool 主题布局）
     顶部: logo + 项目名 + 一级菜单Tab
     左侧: 二三四级树形菜单
     右侧: 主内容区  -->
<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed } from 'vue'
import type { ProcessNode } from '@/stores/useAuthStore'

const auth = useAuthStore()

// 一级菜单节点（显示在顶部 Tab 栏）
const topMenuItems = computed(() => {
  return (auth.processTree || []).filter((n: ProcessNode) => n.isAuthorized)
})

// 当前选中的一级菜单 ProcessAID（优先选有子菜单的）
const activeTopMenu = computed(() => {
  // 优先选第一个有子节点的菜单
  const withChildren = topMenuItems.value.find(
    (n: ProcessNode) => n.children && n.children.length > 0
  )
  if (withChildren) return withChildren.processAID
  return topMenuItems.value[0]?.processAID || ''
})

// 当前一级菜单的子节点（显示在左侧树形菜单）
const sideMenuNodes = computed(() => {
  const active = topMenuItems.value.find(
    (n: ProcessNode) => n.processAID === activeTopMenu.value
  )
  return active?.children || []
})
</script>

<template>
  <div class="app-layout">
    <!-- 顶部工具栏（复刻原 iAGS #layout_header） -->
    <AppHeader
      :menu-items="topMenuItems"
      :active-menu="activeTopMenu"
    />

    <!-- 内容区（复刻原 iAGS #layout_body） -->
    <div class="app-body">
      <!-- 左侧树形菜单（复刻原 iAGS #left_menu） -->
      <AppSidebar
        v-if="sideMenuNodes.length > 0"
        :nodes="sideMenuNodes"
      />

      <!-- 主内容区（复刻原 iAGS #page-middle-content） -->
      <div class="app-content" :class="{ 'has-sidebar': sideMenuNodes.length > 0 }">
        <router-view />
      </div>
    </div>

    <!-- 底部信息栏（复刻原 iAGS #layout_footer） -->
    <footer class="app-footer">
      <span>Copyright &copy; 2026,</span>
      <a href="http://www.techmation.com.cn" target="_blank" class="footer-link">Techmation Co.,Ltd.</a>
      <span>, All rights reserved. | </span>
      <a href="http://beian.miit.gov.cn" target="_blank" class="footer-link">浙ICP备20003786号-7</a>
      <span class="footer-divider">|</span>
      <span>Framework (Foil) version: v1.0 | tmCropCloud version: v1.4.0</span>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 14px;
  color: #333;
  background: #e9eff3;
}

/* ===== 顶部栏 ===== */
/* 由 AppHeader 组件提供样式 */

/* ===== 内容区（flex: 1 填充剩余高度） ===== */
.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ===== 主内容区 ===== */
.app-content {
  flex: 1;
  overflow-y: auto;
  background: #e9eff3;
}

.app-content.has-sidebar {
  /* 左侧菜单可见时，不额外处理 */
}

/* ===== 底部 ===== */
.app-footer {
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #2d3b46;
  color: #888;
  font-size: 12px;
  flex-shrink: 0;
  padding: 0 20px;
  flex-wrap: wrap;
}

.footer-link {
  color: #aab;
  text-decoration: none;
}
.footer-link:hover {
  color: #fff;
}

.footer-divider {
  margin: 0 6px;
  color: #555;
}
</style>
