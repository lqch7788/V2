<!-- iAGS 2.0 — 侧边栏菜单 -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import type { ProcessNode } from '@/stores/useAuthStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// 从 iAGS processTree 生成菜单项
interface MenuItem {
  index: string
  title: string
  icon?: string
  children?: MenuItem[]
}

function buildMenu(nodes: ProcessNode[]): MenuItem[] {
  return nodes
    .filter((n) => n.isAuthorized)
    .map((n) => ({
      index: n.route || `/legacy/${n.processAID}`,
      title: n.name,
      children: n.children?.length ? buildMenu(n.children) : undefined,
    }))
}

const menuItems = computed(() => buildMenu(auth.processTree))

function handleSelect(index: string) {
  router.push(index)
}
</script>

<template>
  <aside class="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
    <!-- Logo -->
    <div class="h-14 flex items-center px-4 border-b border-gray-200">
      <span class="text-lg font-bold text-green-700">iAGS 2.0</span>
    </div>

    <!-- 菜单 -->
    <el-menu
      :default-active="route.path"
      class="flex-1 border-none"
      @select="handleSelect"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.index"
        :index="item.index"
      >
        <span>{{ item.title }}</span>
      </el-menu-item>
    </el-menu>
  </aside>
</template>
