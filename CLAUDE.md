# CLAUDE.md — iAGS 2.0 智慧农业管理系统

## 🎯 项目身份

**项目名称**：iAGS 2.0 — 智慧农业管理系统统一前端
**项目路径**：`D:\iAGS2.0`
**角色**：本项目是 iAGS（智慧农业管理系统）的前端 Vue 3 重构工程。
**目标**：将 iAGS 旧系统（jQuery EasyUI + EJS 服务端渲染）全面升级为 Vue 3 + Element Plus + Pinia + Tailwind CSS 的现代 SPA 架构。

## 🏗️ 核心架构铁律

```
Vue 3 前端 (本项目)              iAGS 后端 (不动！)
───────────────                 ──────────────
                                Fouil 框架 + MySQL + Redis
brokerClient ───────────────→  /app/system/broker/getFromBiz
(fetch + Cookie)               /app/system/broker/post2Biz
                                     │
Pinia Store ← brokerClient ←───  broker biz 文件 → MySQL/Redis
     │
Vue SFC 组件 → Pinia Store → brokerClient
```

**铁律**：
- 组件**绝不**直接调用 fetch/axios，所有数据走 Pinia Store → brokerClient
- iAGS 后端（Foil 框架 + MySQL + Redis + broker + IoT PoolingServer）**完全不修改**
- V1.1 种植管理系统代码**暂不整合**，等 iAGS 旧模块全部迁移为 Vue 3 后再处理
- 所有 API 调用通过 brokerClient，走 iAGS 已有 broker 接口
- 认证使用 iAGS Cookie（Vite proxy 同域，自动携带），无需 JWT 桥接

## 📁 项目结构

```
D:\iAGS2.0\
├── CLAUDE.md                     # 项目指南（当前文件）
├── package.json                  # Vue 3 依赖清单
├── vite.config.ts                # Vite 构建 + proxy 配置
├── tsconfig.json                 # TypeScript 配置
├── index.html                    # 入口 HTML
├── .gitignore
├── docs/                         # 规划文档（只读参考）
│   ├── 升级为VUE方案V1.0.md       # Vue 3 升级完整方案（主文档）
│   ├── iAGS升级规划方案V1.0.md     # React 方案参考（细节丰富）
│   └── iags升级规划20260520.md     # 早期规划参考
├── src/
│   ├── main.ts                   # Vue 应用入口
│   ├── App.vue                   # 根组件
│   ├── i18n.ts                   # vue-i18n 多语言
│   ├── styles/
│   │   └── index.css             # Tailwind + Element Plus 主题
│   ├── router/
│   │   └── index.ts              # Vue Router 4 + 认证守卫
│   ├── stores/
│   │   └── useAuthStore.ts       # 认证 Store (Pinia)
│   ├── services/
│   │   └── brokerClient.ts       # iAGS broker API 客户端
│   ├── composables/
│   │   ├── useIframeMessage.ts   # iframe postMessage 通信
│   │   └── useRealtimeBridge.ts  # Socket.IO 实时数据桥接
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.vue    # Header + Sidebar + Content
│   │   │   ├── AppSidebar.vue    # 侧边栏菜单
│   │   │   └── AppHeader.vue     # 顶部栏
│   │   └── legacy/
│   │       └── IframeContainer.vue # 旧模块 iframe 容器
│   ├── pages/
│   │   ├── LoginPage.vue         # 登录页
│   │   ├── HomePage.vue          # 首页（占位）
│   │   ├── NotFoundPage.vue      # 404 页
│   │   └── legacy/
│   │       └── LegacyPage.vue    # 旧模块包装页
│   ├── lib/
│   │   └── staleTimes.ts         # TanStack Vue Query 缓存策略
│   ├── types/
│   │   ├── index.ts              # 核心实体类型
│   │   └── iframe.ts             # postMessage 协议类型
│   └── locales/
│       └── zh-CN.json            # 中文词条
```

## 🔧 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Vue 3.5 | Composition API (`<script setup lang="ts">`) |
| UI 组件 | Element Plus 2.9+ | 替代 EasyUI + Radix UI |
| 状态管理 | Pinia 2 | 替代 Zustand |
| 路由 | Vue Router 4 | 替代 React Router |
| 缓存 | @tanstack/vue-query | 替代 IndexedDB 三级缓存 |
| 图表 | vue-echarts (ECharts 5) | 替代 Highcharts / Recharts |
| CSS | Tailwind CSS 3.4 | 框架无关，从 V1.1 继承 |
| 图标 | lucide-vue-next + @element-plus/icons-vue | |
| 多语言 | vue-i18n | 从 iAGS MultiLang 迁移 |
| 构建 | Vite 6 | |
| 类型 | TypeScript 5.6 | |
| 验证 | Zod 3 | |
| 实时 | socket.io-client | iAGS 已有，不动 |

## 🚀 开发命令

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (端口 5173)
npm run build        # 生产构建
npm run preview      # 预览生产构建
npm run type-check   # TypeScript 类型检查
npm run lint         # ESLint 检查
```

## 🔗 后端依赖

开发前需要启动 iAGS 后端：

```bash
# 1. MySQL 服务（必须运行）
# 2. iAGS BizServer (端口 3000)
cd D:\iAGS\tm.iags_biz
node start.js
# 3. iAGS PoolingServer (端口 3088, IoT 数据)
cd D:\iAGS\tm.iAGS.poolingServer
node start.js
```

Vite proxy 将自动把 `/app` 请求转发到 iAGS BizServer。

## ⚠️ 重要约束

### 禁止操作
- **禁止修改 iAGS 后端任何文件**（D:\iAGS\* 的所有文件）
- **禁止修改 V1.1 源文件**（D:\TMcrop\yuanxingtu\V1.1\* 的所有文件）
- **禁止删除文件**（除非用户明确要求）
- **禁止擅自提交 Git**（需用户确认）
- **禁止：`git reset`、`git reflog`、`git rebase`、`git clean -f`、`git reset --hard`**

### 允许操作
- 读取 iAGS 和 V1.1 的所有文件（只读参考）
- 在本项目内创建/修改/删除文件（D:\iAGS2.0\*）
- `git status`、`git diff`、`git log`、`git add`、`git commit`（需用户确认）
- `npm install`、`npm run dev`、`npm run build`

## 📋 当前状态

**阶段**：项目初始化完成，基础框架已搭建

**已完成**：
- [x] Vue 3 项目骨架（package.json、vite.config.ts、tsconfig.json）
- [x] brokerClient 实现（90行，对接 iAGS broker API）
- [x] useAuthStore（Pinia，对接 iAGS Cookie 认证）
- [x] Vue Router 路由配置 + 认证守卫
- [x] MainLayout + Sidebar + Header 布局
- [x] LoginPage 登录页
- [x] IframeContainer 旧模块过渡容器
- [x] LegacyPage 旧模块 iframe 包装页
- [x] postMessage 通信类型定义
- [x] Socket.IO 实时数据桥接
- [x] vue-i18n 多语言基础配置
- [x] TanStack Vue Query 缓存策略常量
- [x] Git 初始化

**待完成**（按优先级）：
1. **P0**: `npm install` 安装依赖，验证项目能启动
2. **P0**: 对接 iAGS 后端，验证 brokerClient 能调通 broker API
3. **P0**: 验证登录流程（Cookie 认证）
4. **P1**: iAGS 旧模块逐个从 EasyUI → Vue 3 重写（按 docs/升级为VUE方案V1.0.md §19 优先级）
5. **P1**: 16个旧模块 iframe 过渡验证
6. **P2**: V1.1 种植管理模块整合（等 iAGS 迁移完成后）

## 📖 关键文档

| 文档 | 路径 | 说明 |
|------|------|------|
| Vue 3 升级方案 | `docs/升级为VUE方案V1.0.md` | **主文档** — 25章节完整规划 |
| React 方案参考 | `docs/iAGS升级规划方案V1.0.md` | 细节丰富，可借鉴 |
| iAGS 旧系统 | `D:\iAGS\tm.iags_web\` | EJS 视图（只读） |
| iAGS 业务逻辑 | `D:\iAGS\tm.iags_biz\` | broker biz 文件（只读） |
| V1.1 种植管理 | `D:\TMcrop\yuanxingtu\V1.1\` | React 代码（只读参考） |

## 🔑 关键代码模式

### brokerClient 调用
```typescript
import { brokerGet, brokerPost } from '@/services/brokerClient'

// GET 查询
const { rows, total } = await brokerGet(['iAGS', 'v11Crop', 'getVarietyList'], { page: 1 })

// POST 提交
await brokerPost(['iAGS', 'v11Crop', 'saveVariety'], { varietyName: 'xxx' })
```

### Pinia Store
```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { brokerGet } from '@/services/brokerClient'

export const useDataStore = defineStore('data', () => {
  const data = ref([])
  const loading = ref(false)

  async function fetchList(query = {}) {
    loading.value = true
    try {
      const result = await brokerGet(['iAGS', 'module', 'getList'], query)
      data.value = result.rows
    } finally { loading.value = false }
  }

  return { data, loading, fetchList }
})
```

### Vue SFC 页面
```vue
<script setup lang="ts">
import { useDataStore } from '@/stores/useDataStore'
const store = useDataStore()
</script>

<template>
  <el-table :data="store.data" v-loading="store.loading" />
</template>
```

---

> **项目启动日期**: 2026-05-20 | **目标**: iAGS + V1.1 统一为 Vue 3 前端 + MySQL 后端
> **GitHub**: https://github.com/lqch7788/V2
