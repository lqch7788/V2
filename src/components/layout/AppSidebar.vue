<!-- iAGS 2.0 — 左侧树形菜单（复刻原 iAGS left_menu）
     支持 2-4 级树形菜单，带图标 + 文字 + 展开/折叠 -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ProcessNode } from '@/stores/useAuthStore'

const props = defineProps<{
  nodes: ProcessNode[]
}>()

const router = useRouter()

// 展开的节点
const expandedNodes = ref<Set<string>>(new Set())
// 当前选中的节点
const selectedNode = ref<string>('')

function toggleExpand(processAID: string) {
  if (expandedNodes.value.has(processAID)) {
    expandedNodes.value.delete(processAID)
  } else {
    expandedNodes.value.add(processAID)
  }
  // 触发响应式更新
  expandedNodes.value = new Set(expandedNodes.value)
}

function isExpanded(processAID: string): boolean {
  return expandedNodes.value.has(processAID)
}

function handleMenuClick(node: ProcessNode) {
  selectedNode.value = node.processAID
  // 导航到对应页面（暂用 legacy iframe 过渡）
  const route = node.route || `/legacy/${node.processAID}`
  router.push(route)

  // 如果有子节点，切换展开
  if (node.children && node.children.length > 0) {
    toggleExpand(node.processAID)
  }
}

// 内联 SVG 图标（不依赖后端静态资源）
const ICON_PLUS = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="2" fill="%23999" rx="1"/><rect x="7" y="3" width="2" height="10" fill="%23999" rx="1"/></svg>')
const ICON_MINUS = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="2" fill="%23999" rx="1"/></svg>')
const ICON_DOT = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="8" fill="none" stroke="%23aaa" stroke-width="1.5"/><circle cx="14" cy="14" r="3" fill="%23aaa"/></svg>')

function getIconUrl(_node: ProcessNode): string {
  return ICON_DOT
}
</script>

<template>
  <aside class="app-sidebar">
    <div class="sidebar-scroll">
      <ul class="tree-menu">
        <template v-for="node in nodes" :key="node.processAID">
          <!-- 有子节点的菜单项 -->
          <li v-if="node.children && node.children.length > 0" class="tree-item">
            <div
              class="tree-node has-children"
              :class="{ selected: selectedNode === node.processAID }"
              @click="handleMenuClick(node)"
            >
              <span class="toggle-icon" @click.stop="toggleExpand(node.processAID)">
                <img
                  :src="isExpanded(node.processAID) ? ICON_MINUS : ICON_PLUS"
                  class="toggle-img"
                  alt=""
                />
              </span>
              <span class="node-icon">
                <img :src="getIconUrl(node)" class="icon-img" alt="" />
              </span>
              <span class="node-text" :title="node.name">{{ node.name }}</span>
            </div>

            <!-- 子菜单（仅展开时显示） -->
            <ul v-if="isExpanded(node.processAID)" class="tree-submenu">
              <!-- 二级菜单 -->
              <template v-for="child2 in node.children" :key="child2.processAID">
                <li class="tree-item">
                  <div
                    class="tree-node has-children level-2"
                    :class="{ selected: selectedNode === child2.processAID }"
                    @click="handleMenuClick(child2)"
                  >
                    <span v-if="child2.children && child2.children.length > 0" class="toggle-icon" @click.stop="toggleExpand(child2.processAID)">
                      <img
                        :src="isExpanded(child2.processAID) ? ICON_MINUS : ICON_PLUS"
                        class="toggle-img"
                        alt=""
                      />
                    </span>
                    <span v-else class="toggle-icon placeholder"></span>
                    <span class="node-icon">
                      <img :src="getIconUrl(child2)" class="icon-img" alt="" />
                    </span>
                    <span class="node-text" :title="child2.name">{{ child2.name }}</span>
                  </div>

                  <!-- 三级菜单 -->
                  <ul v-if="child2.children && child2.children.length > 0 && isExpanded(child2.processAID)" class="tree-submenu level-3-submenu">
                    <template v-for="child3 in child2.children" :key="child3.processAID">
                      <li class="tree-item">
                        <div
                          class="tree-node has-children level-3"
                          :class="{ selected: selectedNode === child3.processAID }"
                          @click="handleMenuClick(child3)"
                        >
                          <span v-if="child3.children && child3.children.length > 0" class="toggle-icon" @click.stop="toggleExpand(child3.processAID)">
                            <img
                              :src="isExpanded(child3.processAID) ? ICON_MINUS : ICON_PLUS"
                              class="toggle-img"
                              alt=""
                            />
                          </span>
                          <span v-else class="toggle-icon placeholder"></span>
                          <span class="node-text" :title="child3.name">{{ child3.name }}</span>
                        </div>

                        <!-- 四级菜单 -->
                        <ul v-if="child3.children && child3.children.length > 0 && isExpanded(child3.processAID)" class="tree-submenu level-4-submenu">
                          <li v-for="child4 in child3.children" :key="child4.processAID" class="tree-item">
                            <div
                              class="tree-node level-4"
                              :class="{ selected: selectedNode === child4.processAID }"
                              @click="handleMenuClick(child4)"
                            >
                              <span class="node-text" :title="child4.name">{{ child4.name }}</span>
                            </div>
                          </li>
                        </ul>
                      </li>
                    </template>
                  </ul>
                </li>
              </template>
            </ul>
          </li>

          <!-- 无子节点的菜单项（末级） -->
          <li v-else class="tree-item">
            <div
              class="tree-node"
              :class="{ selected: selectedNode === node.processAID }"
              @click="handleMenuClick(node)"
            >
              <span class="toggle-icon placeholder"></span>
              <span class="node-icon">
                <img :src="getIconUrl(node)" class="icon-img" alt="" />
              </span>
              <span class="node-text" :title="node.name">{{ node.name }}</span>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
/* ===== 侧边栏容器 ===== */
.app-sidebar {
  width: 250px;
  min-width: 250px;
  background: rgba(50, 66, 78, 1);
  border-right: 2px solid rgb(82, 165, 218); /* 原 iAGS Cool 主题侧边栏右边框 */
  color: #ccc;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 14px;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar-scroll {
  height: 100%;
  overflow-y: auto;
}

/* ===== 树形菜单 ===== */
.tree-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-item {
  list-style: none;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 9px 0;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}
.tree-node:hover {
  background: rgba(255,255,255,0.05);
}
.tree-node.selected .node-text {
  color: #0b79ff;
}

/* ===== 层级缩进 ===== */
.tree-node.level-2 {
  padding-left: 30px;
}
.tree-node.level-3 {
  padding-left: 40px;
}
.tree-node.level-4 {
  padding-left: 50px;
}

.tree-submenu {
  list-style: none;
  margin: 0;
  padding: 0;
}
.level-3-submenu {
  padding-left: 0;
}
.level-4-submenu {
  padding-left: 0;
}

/* ===== 展开/折叠图标 ===== */
.toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  flex-shrink: 0;
}
.toggle-icon.placeholder {
  width: 24px;
}

.toggle-img {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

/* ===== 节点图标 ===== */
.node-icon {
  display: inline-flex;
  align-items: center;
  margin-right: 5px;
  flex-shrink: 0;
}

.icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

/* ===== 节点文字 ===== */
.node-text {
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.level-2 .node-text {
  max-width: 130px;
}

.level-3 .node-text, .level-4 .node-text {
  max-width: 140px;
}
</style>
