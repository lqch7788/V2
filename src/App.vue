<!-- iAGS 2.0 — 根组件 -->
<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore'
import { onMounted } from 'vue'

const auth = useAuthStore()

onMounted(async () => {
  // 应用启动时检查登录状态（Cookie 是否仍有效）
  await auth.checkAuth()
})
</script>

<template>
  <!-- Vue Router 根据路由渲染不同布局 -->
  <router-view />
</template>
