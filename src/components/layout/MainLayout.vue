<!-- iAGS 2.0 — 主布局（Header + Sidebar + Content） -->
<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const auth = useAuthStore()
</script>

<template>
  <div class="h-screen flex overflow-hidden bg-gray-50">
    <!-- 侧边栏 -->
    <AppSidebar />

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部栏 -->
      <AppHeader />

      <!-- 页面内容 -->
      <main class="flex-1 overflow-auto p-4">
        <router-view />
      </main>
    </div>
  </div>
</template>
