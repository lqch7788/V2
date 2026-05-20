<!-- iAGS 2.0 — 顶部栏（面包屑 + 用户信息 + 语言切换） -->
<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
    <!-- 左侧：面包屑 -->
    <div class="flex items-center gap-2">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧：用户信息 -->
    <div class="flex items-center gap-3">
      <span class="text-sm text-gray-600">
        {{ auth.userOrgName }} — {{ auth.userName }}
      </span>
      <el-button size="small" @click="handleLogout">退出</el-button>
    </div>
  </header>
</template>
