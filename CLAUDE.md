# CLAUDE.md — iAGS 2.0 智慧农业管理系统

## 🎯 项目身份

**项目名称**：iAGS 2.0 — 智慧农业管理系统统一前端
**项目路径**：`D:\iAGS2.0`
**角色**：本项目是 iAGS（智慧农业管理系统）的前端 Vue 3 重构工程。

> **一句话定位**：iAGS 是一个**完整的智慧农业系统**（含温室环控、IoT设备、曲线监控、告警、能耗等16个模块），V1.1 只是其中**"生产管理"这一个模块**的升级来源。先完成 iAGS 全部前端的 Vue 3 改造，再把 V1.1 作为"生产管理"模块整合进来。

## 🚨 系统关系（进入项目必须先读）

```
iAGS 2.0 (本项目) ← 主体，正在改造
    │
    ├─ iAGS 旧系统 (D:\iAGS\) ← 参考源，前端正在 Vue 3 重写
    │    ├── 16 个模块: home/device/control/curve/warning/camera/
    │    │              energy/report/resume/administration/application/
    │    │              intelligentcontrol/3D/systemset/more/SystemMore
    │    ├── 后端: Foil + MySQL + broker API（不动！）
    │    └── IoT: PoolingServer TCP/MQTT（不动！）
    │
    └─ V1.1 种植管理 (D:\TMcrop\yuanxingtu\V1.1\) ← 只读参考，暂不整合
         └── 角色: iAGS 中"生产管理"模块的升级来源
         └── 时机: 等 iAGS 16个模块全部 Vue 3 改造完成后再整合
         └── 原因: 避免前期两套代码直接合并导致类型不匹配、路由冲突报错
```

**当前任务**：只改造 iAGS 的 16 个模块，V1.1 暂时不动。

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
- **V1.1 代码暂不复制、暂不整合、暂不引入本项目** — 等 iAGS 16个模块全部 Vue 3 改造完成后再处理
- V1.1 只是 iAGS 中"生产管理"一个模块的升级来源，不是对等系统
- V1.1 的 React/TSX 语法与 Vue 3 完全不兼容，提前合并会制造大量编译报错
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
# 2. iAGS BizServer (端口 8088)
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

## 📋 任务队列（进入项目后按顺序执行）

> **当前阶段**：Vue 3 项目骨架已搭建（30个文件），下一步是安装依赖 + 验证后端联通。

### 🔴 第一步：环境验证（P0 — 立即执行）

```bash
# 1. 安装依赖
cd D:\iAGS2.0
npm install

# 2. 启动 iAGS 后端（必须先启动）
#    MySQL 服务 + BizServer(8088) + PoolingServer(3088)
cd D:\iAGS\tm.iags_biz && node start.js

# 3. 启动 Vue 前端
cd D:\iAGS2.0
npm run dev
# → http://localhost:5173
```

**验证清单**：
- [ ] `npm install` 无错误
- [ ] `npm run dev` 启动成功
- [ ] 浏览器访问 http://localhost:5173 显示登录页
- [ ] 输入 iAGS 用户名/密码 → 登录成功 → Cookie 正确设置
- [ ] brokerClient 调通（F12 Network 查看 broker API 返回 200）
- [ ] 侧边栏菜单从 iAGS processTree 正确渲染

### 🟡 第二步：iAGS 旧模块 Vue 3 改造（P1 — 核心工作）

按照 `docs/升级为VUE方案V1.0.md` §19 优先级逐个改造：

| 优先级 | 模块 | 工期 | 说明 |
|--------|------|------|------|
| **P0** | 认证 + home(仪表盘) | 1-2周 | 登录已实现，完成首页 |
| **P1** | device + control + curve | 8-12周 | 核心监控，使用频率最高 |
| **P1** | administration | 3-4周 | 种植管理 — 后续由 V1.1 替换 |
| **P2** | report/warning/resume/energy | 4-6周 | 报表告警履历能耗 |
| **P2** | more (21子模块) | 6-8周 | 最大模块，配置表单为主 |
| **P3** | camera/application/systemset | 2-3周 | 摄像头/智能应用/系统设置 |
| **P4** | 3D/intelligentcontrol | 后续评估 | 技术难度极高 |

**每个模块改造流程**：
1. 读取 iAGS 旧 EJS 页面，理解业务逻辑
2. 创建 Vue SFC 页面 + Element Plus 组件
3. 如果 EJS 中有 EasyUI datagrid → 改为 `el-table`
4. 如果 EJS 中有 Highcharts 图表 → 改为 `vue-echarts`
5. 如果旧页面依赖 Socket.IO 实时数据 → 使用 `useRealtimeBridge`
6. 创建 Pinia Store（通过 brokerClient 调用 broker API）
7. `npm run dev` 浏览器验证功能正常
8. 提交代码

### 🟢 第三步：V1.1 "生产管理"模块整合（P2 — 等 iAGS 改造完成后）

**触发条件**：iAGS 16个旧模块全部 Vue 3 改造完成且验证通过后

**整合内容**：
- V1.1 的作物管理、计划管理、库存管理、人工管理、生产汇总、审批管理
- V1.1 的仪表盘、系统设置、权限管理
- 参考 `docs/升级为VUE方案V1.0.md` §8 迁移策略

**⚠️ 在此之前不要复制 V1.1 任何代码文件到 iAGS2.0！**

### ✅ 已完成

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
- [x] Git 初始化 + 首次提交已推送 GitHub

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
