# iAGS + V1.1 统一升级为 Vue 3 方案 V1.0

> 架构决策: 两套系统前端统一升级为 **Vue 3 + Element Plus + Pinia + Tailwind CSS**
> iAGS 后端保持不变 (broker API + MySQL)，V1.1 后端 SQLite → MySQL 对齐
> 日期: 2026-05-20

---

## 一、为什么选 Vue 3？

### 1.1 决策背景

| 维度 | 原方案 (React 18 + Radix UI) | 新方案 (Vue 3 + Element Plus) |
|------|---------------------------|------------------------------|
| V1.1 现有代码 | React/TSX，需复制但保留 | React/TSX **全部重写为 Vue SFC** |
| 团队技术栈 | 技术人员不熟悉 React | Vue 3 学习曲线更平缓 |
| iAGS 旧系统 | EasyUI (jQuery) | EasyUI → Element Plus 映射更自然 |
| UI 组件库 | 48 个自定义 Radix 组件 | Element Plus 内置 80+ 组件，**无需自建** |
| 表单/表格 | 自建封装 | Element Plus 原生企业级表格/表单 |
| 长期维护 | Radix UI 需自维护封装层 | Element Plus 55K+ Star，社区维护 |
| 中文生态 | Radix 无中文文档 | Element Plus 一流中文文档 |

### 1.2 核心结论

**EasyUI 的配置对象驱动模式与 Element Plus 的 prop 驱动 API 高度相似。** 这意味着：
- EasyUI `datagrid` → Element Plus `el-table`（匹配度 95%）
- EasyUI `combobox` → Element Plus `el-select`（匹配度 90%）
- EasyUI `combotree` → Element Plus `el-tree-select`（匹配度 95%）
- EasyUI `datebox` → Element Plus `el-date-picker`（匹配度 100%）

V1.1 已有的 48 个 Radix 自定义组件可以**废弃**，直接用 Element Plus 原生组件替代。

---

## 二、目标架构

```
         ┌─ iAGS 前端 (全新) ─┐        ┌─ iAGS 后端 (不变) ───┐
         │ Vue 3 + SFC        │        │ Express + MySQL       │
         │ Element Plus       │───────│ + broker API          │
         │ Pinia + Vue Router │        │ + IoT PoolingServer   │
         │ Tailwind CSS       │        │ + JWT 认证            │
         │ + V1.1 全部模块    │        └───────────────────────┘
         └───────────────────┘              ↑
              ↑ 从 V1.1 迁移               ↑ SQLite → MySQL
              (React→Vue3 重写)            (V1.1 后端改造)
```

```
两套旧前端 → 一套新前端:

  iAGS EasyUI (90 EJS)  ──→  Vue 3 SFC (Element Plus)
  V1.1 React (266 TSX)   ──→  Vue 3 SFC (Element Plus)
                                    │
           共享: Pinia Store + brokerClient + TypeScript Types
```

### 2.1 改造分工

| 系统 | 做什么 | 不做什么 |
|------|--------|---------|
| **iAGS 前端** | EasyUI EJS → Vue 3 SFC + Element Plus，旧模块 iframe 过渡 | 不一次性重写 16 个旧模块 |
| **iAGS 后端** | **保持不变**（broker API + MySQL + JWT） | 不动 BizServer 逻辑 |
| **V1.1 前端** | React/TSX → Vue 3 SFC 全部重写，模块迁入新项目 | React 代码全部废弃 |
| **V1.1 后端** | SQLite → MySQL，去掉三级降级，API 统一为 broker 模式 | 业务逻辑保留 |

---

## 三、技术栈完整对照

### 3.1 新旧技术栈

| 层级 | V1.1 现状 | iAGS 现状 | 统一后 (Vue 3) |
|------|----------|----------|---------------|
| 框架 | React 18 | jQuery + EasyUI 1.5 | **Vue 3.5** (Composition API) |
| 语法 | TSX | EJS 模板 | **SFC** (`<script setup lang="ts">`) |
| UI 组件 | 48 个 Radix 封装 | EasyUI Widgets | **Element Plus 2.9+** |
| 状态管理 | Zustand 5 (107 个 Store) | jQuery DOM + 全局变量 | **Pinia 2** |
| 路由 | React Router v6 | EJS 服务端路由 + hash | **Vue Router 4** |
| 图表 | Recharts | Highcharts | **vue-echarts** (ECharts 5) |
| CSS | Tailwind CSS 3.4 | EasyUI 主题 + 内联 CSS | **Tailwind CSS 3.4** |
| 构建 | Vite 6 | EJS 服务端渲染 | **Vite 6** |
| HTTP | enhancedApiClient | yjClient.ajax | **brokerClient** (统一 fetch) |
| 类型 | TypeScript 5.6 | 无 (纯 JS) | **TypeScript 5.6** |
| 验证 | Zod 3 | EasyUI validatebox | **Zod 3 + Element Plus 表单验证** |
| 图标 | Lucide React | EasyUI 内置图标 | **lucide-vue-next** |
| 实时 | socket.io-client | socket.io | **socket.io-client** (不变) |
| 文档 | xlsx, file-saver, jspdf | 无 | **xlsx, file-saver, jspdf** (不变) |
| 日期 | date-fns | yjDateTime.js | **date-fns** |
| 桌面 | Electron 42 | 无 | 后续评估 |

### 3.2 可复用的资产（框架无关）

| 资产类型 | 复用率 | 说明 |
|---------|--------|------|
| TypeScript 类型定义 (29 文件) | 95% | 直接复制，类型与框架无关 |
| 工具函数 (date-fns helpers, formatters, validators) | 95% | 直接复制 |
| FIELD_MAP / normalize / denormalize | 100% | 直接复制，纯函数 |
| Zod 校验 Schema | 100% | 直接复制 |
| xlsx / file-saver / jspdf 导出逻辑 | 90% | 触发方式从 React 事件 → Vue 事件 |
| socket.io-client 连接逻辑 | 80% | 连接管理改写为 Vue composable |
| Pinia Store 业务逻辑 | 60% | 从 Zustand 重写为 Pinia，核心业务逻辑不变 |
| Tailwind CSS 类名 | 80% | `className` → `class`，样式值不变 |

### 3.3 必须重写的资产

| 资产类型 | 数量 | 原因 |
|---------|------|------|
| JSX 页面模板 | 266 个 .tsx | JSX → Vue SFC template 语法完全不同 |
| React 业务组件 | 752 个 .tsx | 同上 |
| React Hooks | useEffect/useState/useCallback | → watch/ref/computed |
| Radix UI 封装 (48 个) | 6,607 行 | **废弃**，直接用 Element Plus 替代 |
| enhancedApiClient | 403 行 | 改为 brokerClient（同时去掉 IndexedDB 缓存） |
| EasyUI jQuery 初始化 | 90 个 EJS | → Element Plus 声明式组件 |
| yjDateTime / yj 工具库 | ~20 个 | → date-fns + Vue composable |

---

## 四、组件映射表

### 4.1 EasyUI Widget → Element Plus

| EasyUI Widget | Element Plus 组件 | 匹配度 | 备注 |
|--------------|------------------|--------|------|
| `datagrid` | `el-table` | 95% | 排序/筛选/固定列/汇总行/行内编辑/树形数据 |
| `edatagrid` | `el-table` + 行内编辑 slot | 90% | 可编辑单元格 |
| `combobox` | `el-select` + `filterable` | 90% | 远程搜索/分组/多选 |
| `combogrid` | `el-select` 嵌入 `el-table` | 80% | 需组合实现 |
| `combotree` | `el-tree-select` | 95% | 懒加载/严格模式/筛选 |
| `datebox` | `el-date-picker` | 100% | 日期/周/月/年 |
| `datetimebox` | `el-date-picker` type="datetime" | 100% | |
| `numberbox` | `el-input-number` | 95% | min/max/step/precision |
| `messager` | `ElMessage` / `ElNotification` | 95% | 全局消息/通知 |
| `tabs` | `el-tabs` | 100% | card/border-card 风格 |
| `accordion` | `el-collapse` | 95% | |
| `tree` | `el-tree` | 100% | 拖拽/勾选/懒加载/筛选 |
| `window/dialog` | `el-dialog` | 95% | 可拖拽/可缩放/modal |
| `form` | `el-form` | 90% | rules 验证/布局控制 |
| `validatebox` | `el-form-item` + `rules` | 90% | 内置+自定义验证器 |
| `pagination` | `el-pagination` | 100% | |
| `radiobutton` | `el-radio-group` + `el-radio-button` | 100% | |
| `textbox` | `el-input` | 100% | 所有类型/clearable/密码框 |
| `filebox` | `el-upload` | 85% | API 不同，功能相同 |

### 4.2 V1.1 Radix 组件 → Element Plus

| V1.1 自定义组件 | Element Plus 原生组件 | 匹配度 | 备注 |
|---------------|---------------------|--------|------|
| Button | `el-button` | 100% | |
| Table | `el-table` | 95% | Element Plus 功能更丰富 |
| Select | `el-select` | 100% | |
| Modal / Dialog | `el-dialog` | 95% | 原生支持拖拽/缩放 |
| Tabs | `el-tabs` | 100% | |
| DatePicker | `el-date-picker` | 100% | |
| DateRangePicker | `el-date-picker` type="daterange" | 100% | |
| Checkbox | `el-checkbox` | 100% | |
| Popover | `el-popover` | 95% | |
| DropdownMenu | `el-dropdown` | 95% | |
| Tooltip | `el-tooltip` | 100% | |
| Label | `el-form-item` label | 90% | |
| Input | `el-input` | 100% | |
| TextArea | `el-input` type="textarea" | 100% | |
| NumberInput | `el-input-number` | 100% | |
| Drawer | `el-drawer` | 100% | |
| Sheet | `el-drawer` direction="btt" | 85% | |
| Alert | `el-alert` | 100% | |
| Toast | `ElMessage` / `ElNotification` | 100% | |
| Breadcrumb | `el-breadcrumb` | 100% | |
| Steps | `el-steps` | 95% | |
| Pagination | `el-pagination` | 100% | |
| Skeleton | `el-skeleton` | 95% | |
| Progress | `el-progress` | 95% | |
| Tree | `el-tree` | 100% | |
| TreeSelect | `el-tree-select` | 100% | |
| Cascader | `el-cascader` | 100% | |
| TimePicker | `el-time-picker` | 100% | |
| Avatar | `el-avatar` | 95% | |
| Badge | `el-badge` | 100% | |
| Card | `el-card` | 95% | |
| Divider | `el-divider` | 100% | |
| EmptyState | `el-empty` | 95% | |
| Calendar | `el-calendar` | 90% | |
| Timeline | `el-timeline` | 95% | |
| QRCode | `el-qr-code` (2.9+) | 90% | |
| ImageUploader | `el-upload` | 85% | |
| VirtualTable | `el-table-v2` | 90% | 官方虚拟滚动 |
| FilterBar | `el-form` + `el-select`/`el-input` 组合 | 80% | 需重写 |
| **GanttChart** | **无内置** | 0% | 需重写为 Vue SFC |
| **KanbanBoard** | **无内置** | 0% | 需重写为 Vue SFC |
| Statistics | `el-statistic` | 90% | |
| UnifiedModal | `el-dialog` | 90% | |

### 4.3 需自建的组件（Element Plus 无内置）

| 组件 | V1.1 行数 | Vue 3 实现方案 |
|------|----------|--------------|
| GanttChart | 228 行 | 基于 ECharts 甘特图 + `vue-echarts` 重建 |
| KanbanBoard | 180 行 | 基于 `vue-draggable-plus` (SortableJS) 重建 |
| FilterBar | 87 行 | `el-form` + `el-select`/`el-input` 组合封装 |
| LabelResumeTimeline | 200 行 | `el-timeline` + 自定义内容 |

---

## 五、状态管理：Zustand → Pinia

### 5.1 改造模式对比

```typescript
// ═══════════ 改造前: Zustand (React) ═══════════
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { enhancedApiClient } from '@/lib/apiClient'

const FIELD_MAP: Record<string, string> = {
  crop_code: 'cropCode',
  variety_name: 'varietyName',
}

function normalize(row: Record<string, any>): CropVariety {
  const result: Record<string, any> = {}
  for (const [dbKey, jsKey] of Object.entries(FIELD_MAP)) {
    result[jsKey] = row[dbKey] ?? null
  }
  return result as CropVariety
}

function denormalize(data: Partial<CropVariety>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [dbKey, jsKey] of Object.entries(FIELD_MAP)) {
    if (data[jsKey as keyof CropVariety] !== undefined) {
      result[dbKey] = data[jsKey as keyof CropVariety]
    }
  }
  return result
}

export const useCropVarietyStore = create<CropVarietyState>()(
  persist(
    (set, get) => ({
      data: [],
      loading: false,

      fetchList: async (query) => {
        set({ loading: true })
        // 乐观更新：先改本地
        const localData = [...get().data]
        set({ data: localData })
        const result = await enhancedApiClient.get('/api/cropVariety/list', { params: query })
        set({ data: result.data.map(normalize), loading: false })
      },

      save: async (record) => {
        // 乐观更新：先加临时ID
        const tempId = 'temp-' + Date.now()
        set((s) => ({ data: [...s.data, { ...record, id: tempId }] }))
        const result = await enhancedApiClient.post('/api/cropVariety/save', denormalize(record))
        // API 确认后替换
        set((s) => ({
          data: s.data.map((item) =>
            item.id === tempId ? normalize(result.data) : item
          ),
        }))
      },
    }),
    {
      name: 'crop-variety-storage',
      partialize: (state) => ({ data: state.data }),
    }
  )
)
```

```typescript
// ═══════════ 改造后: Pinia (Vue 3) ═══════════
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { brokerGet, brokerPost } from '@/services/brokerClient'

// FIELD_MAP / normalize / denormalize 提取为纯函数，直接复用
import { normalizeList, denormalizeRecord } from '@/lib/transformers'
import type { CropVariety } from '@/types/crop'

export const useCropVarietyStore = defineStore('cropVariety', () => {
  // ===== State (替代 Zustand initial state) =====
  const data = ref<CropVariety[]>([])
  const loading = ref(false)
  const total = ref(0)

  // ===== Getters (替代 Zustand selectors) =====
  const activeVarieties = computed(() =>
    data.value.filter((v) => v.status === 'active')
  )
  const varietyOptions = computed(() =>
    data.value.map((v) => ({ label: v.varietyName, value: v.varietyOID }))
  )

  // ===== Actions (替代 Zustand functions) =====
  async function fetchList(query: Record<string, any> = {}) {
    loading.value = true
    try {
      const result = await brokerGet<CropVariety[]>(
        ['iAGS', 'v11Crop', 'getVarietyList'],
        query
      )
      data.value = (result.rows || []) as CropVariety[]
      total.value = result.total || 0
    } finally {
      loading.value = false
    }
  }

  async function save(record: Partial<CropVariety>) {
    // 不再乐观更新，等 API 确认
    await brokerPost(['iAGS', 'v11Crop', 'saveVariety'], record)
    // API 成功后刷新
    await fetchList({})
  }

  async function remove(oid: string) {
    await brokerPost(['iAGS', 'v11Crop', 'deleteVariety'], { oid })
    await fetchList({})
  }

  return { data, loading, total, activeVarieties, varietyOptions, fetchList, save, remove }
})
```

**改造后使用方式**:

```vue
<!-- Vue 组件中使用 Pinia Store -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useCropVarietyStore } from '@/stores/useCropVarietyStore'

const store = useCropVarietyStore()

onMounted(() => {
  store.fetchList({ status: 'active' })
})
</script>

<template>
  <el-table :data="store.data" v-loading="store.loading">
    <el-table-column prop="varietyName" label="品种名称" />
    <el-table-column prop="cropCode" label="作物编码" />
  </el-table>
</template>
```

### 5.2 关键映射速查

| Zustand 概念 | Pinia 概念 | 代码变化 |
|-------------|-----------|---------|
| `create<T>()((set,get)=>({...}))` | `defineStore('name', () => { ... })` | 函数签名不同 |
| `data: []` | `const data = ref([])` | `ref()` 包装 |
| `set({ key: val })` | `stateRef.value = val` | 直接赋值 |
| `get().someKey` (action 内) | 直接访问 `ref` 变量 | 更简洁 |
| `persist(...)` | `pinia-plugin-persistedstate` | 插件方式 |
| `partialize: (s) => ({...})` | `persist: { paths: [...] }` | 配置方式 |
| selector: `store((s) => s.x)` | `computed(() => store.x)` | Vue computed |
| `subscribe(callback)` | `store.$subscribe(callback)` | API 不同 |
| `useXxxStore.getState()` | `useXxxStore().$state` | API 不同 |
| `devtools` | Vue DevTools 内置 Pinia 支持 | 无需配置 |

### 5.3 Store 分级改造方案（107 个 Store 详细清单）

#### 分级标准

| 级别 | 定义 | 操作 | 数量 |
|------|------|------|------|
| **A 级** | 数据源完全对应 iAGS MySQL 表，仅改 API 调用 | 改 import + 改 brokerClient 调用，persist→pinia-plugin-persistedstate | ~60 |
| **B 级** | 数据跨多个模块/表，需拆分+合并逻辑 | 拆分数据源 + 合并逻辑 + TanStack Vue Query | ~25 |
| **C 级** | 依赖 enhancedApiClient 离线/缓存特性 | 重写为 TanStack Vue Query useQuery/useMutation | ~12 |
| **D 级** | 纯前端状态，不涉及后端数据 | 直接移植: create→defineStore, set→ref | ~10 |

#### A 级 Store 清单（~60个，改动最小）

```
核心业务 (15):
  useCropVarietyStore, useSeedSourceStore, useSeedlingStore, usePlantingStore,
  useHarvestStore, useFertilizerStore, useCropStorageStore, usePlantLabelStore,
  usePlantingRecordStore, useRegionStore, useOrderStore, useOrderDataStore,
  useProductionPlanStore, useTechSolutionStore, usePurchasePlanStore

农场任务 (8):
  useFarmTaskStore, useTaskStore, useTempTaskStore, useInspectionStore,
  useInspectionDataStore, useProblemStore, useScheduleStore, useDispatchStore

劳动力/HR (15):
  useAttendanceStore, useAttendanceRepairStore, useLeaveStore, useOvertimeStore,
  usePersonnelStore, useSalaryStore, useContractStore, useOnboardingStore,
  useResignationStore, useRecruitmentStore, useContractRenewalStore,
  useSalaryAdjustmentStore, useSalaryBudgetStore, useScheduleStore, useShiftStore

物资/仓库 (8):
  useWarehouseMaterialStore, useInboundStore, useSupplierStore,
  useWarehouseStore, useMaterialTypeStore, useEquipmentStore,
  useMaterialCodeRuleStore, useSupplierCodeRuleStore

iAGS 集成 (9):
  useFarmPartitionStore, useAreaSystemStore, useDeviceSystemStore,
  useCameraStore, useEnergyConfigStore, useAlarmConfigStore,
  useWaterFertilizerStore, usePlantSettingStore, useDeviceDistributionStore

基础设施 (6):
  useOrganizationStore, useDepartmentStore, usePositionStore, useTeamStore,
  useBlockStore, useZoneStore, useGreenhouseStore, useBaseStore, useDeviceStore
```

#### B 级 Store 清单（~25个，拆分+合并）

```
useDashboardStore       — 数据来自多个 iAGS 模块 + V1.1 汇总
useSummaryDataStore     — 跨模块聚合（742行，最大Store）
useIndicatorDataStore   — 指标数据 + 评估数据
useStatisticsStore      — 物资统计跨多表
useExecuteDataStore     — 物资执行 + 库存联动
useMaterialRequestDataStore — 申请+审批联动
useMaterialReturnStore  — 退料+库存联动
useApprovalStore        — 审批跨多业务类型
useApprovalWorkflowStore — 工作流+级别配置联动
useNotificationStore    — 通知跨渠道
useCostStore            — 成本跨物资+能耗
useCompensationStore    — 薪酬跨考勤+加班+绩效
useBudgetStore          — 预算跨多类型
usePerformanceStore     — 绩效跨多数据源
useRiskStore            — 风险跨模块
useEfficiencyStore      — 效率跨模块
useSkillStore           — 技能+培训
useTempWorkerStore      — 临时工+考勤
useWorkLogStore         — 日志+任务关联
useTeamManageStore      — 团队+人员关联
useMonthlyReportStore   — 月报跨模块
useAnnouncementStore    — 公告+模板+发送
useAnnouncementDataStore — 公告数据+已读状态
useAnnouncementTemplateStore — 模板+使用统计
```

#### C 级 Store 清单（~12个，重写为 TanStack Vue Query）

```
useAuthStore            — 认证流程完全重写 (iAGS Cookie 认证)
useSettingsStore        — 系统设置涉及多配置表
useSystemConfigStore    — 系统配置 KV + 缓存策略
useDictionaryStore      — 字典数据 + 多级缓存
useInfrastructureStore  — 基础设施数据
useIotStore             — IoT 数据实时推送
useAlertStore           — 告警实时推送
useUserStore            — 用户管理
useWorkerStore          — 工作线程状态
useProcessDefinitionStore — 工序定义缓存
useApprovalLevelStore   — 审批级别缓存
useNotificationSettingsStore — 通知设置
```

#### D 级 Store 清单（~10个，基本不动）

```
useToastStore           — 纯前端 UI 状态
useAnnouncementStore    — 纯前端公告缓存（部分）
useMaterialCodeRuleStore — 编码规则纯前端缓存
usePlantLabelStore      — 标签纯前端状态
useSettingsStore        — 部分纯前端设置
index.ts                — barrel export，无逻辑
```

---

## 六、路由方案：React Router v6 → Vue Router 4

### 6.1 路由定义对比

```typescript
// ═══════════ React Router v6 ═══════════
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'crop/variety',
        element: <CropVarietyPage />,
        loader: () => authLoader(),
      },
    ],
  },
])

// ═══════════ Vue Router 4 ═══════════
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: 'crop/variety',
          component: () => import('@/pages/v11/crop/CropVarietyPage.vue'),
          meta: { requiresAuth: true, title: '作物品种' },
        },
      ],
    },
  ],
})
```

### 6.2 路由守卫

```typescript
// Vue Router 全局前置守卫（替代 React AuthGuard 组件）
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 登录页无需认证
  if (to.path === '/login') {
    return next()
  }

  // 检查认证状态
  if (!authStore.isAuthenticated) {
    const valid = await authStore.checkAuth()
    if (!valid) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }
  }

  // 检查页面权限
  if (to.meta.requiresAuth && !authStore.hasPermission(to.meta.processAID as string)) {
    return next({ path: '/403' })
  }

  next()
})
```

### 6.3 路由概念映射

| React Router v6 | Vue Router 4 | 说明 |
|----------------|--------------|------|
| `<Route path="/" element={<Layout />}>` | `{ path: '/', component: Layout }` | 路由定义 |
| `<Outlet />` | `<router-view />` | 子路由渲染 |
| `useParams()` | `useRoute().params` | 路由参数 |
| `useSearchParams()` | `useRoute().query` | 查询参数 |
| `useNavigate()` | `useRouter().push()` | 编程导航 |
| `<Navigate to="/login" />` | `router.push('/login')` 或 `<router-link>` | 导航 |
| `React.lazy(() => import('./Page'))` | `() => import('./Page.vue')` | 懒加载（Vue 更简洁） |
| `<Route path="*" element={<NotFound />}>` | `{ path: '/:pathMatch(.*)*', component: NotFound }` | 404 |
| `loader` 函数 | `beforeEnter` 守卫 | 数据预加载 |
| `action` 函数 | Pinia action 在 `onMounted` 中调用 | 表单提交 |

---

## 七、核心代码模式

### 7.1 brokerClient（框架无关，直接复用）

```typescript
// src/services/brokerClient.ts — 与 React 方案完全一致
const IAGS_BASE = '/app/system/broker'

export async function brokerGet<T>(params: string[], query: Record<string, any> = {}): Promise<BrokerResponse<T>> {
  const sp = new URLSearchParams()
  sp.set('bizURLParams', JSON.stringify(params))
  sp.set('data', JSON.stringify(query))
  const res = await fetch(`${IAGS_BASE}/getFromBiz?${sp.toString()}`, { credentials: 'include' })
  if (!res.ok) throw new Error(`Broker GET failed: ${res.status}`)
  return res.json()
}

export async function brokerPost<T>(params: string[], data: Record<string, any> = {}): Promise<BrokerResponse<T>> {
  const res = await fetch(`${IAGS_BASE}/post2Biz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ bizURLParams: params, data }),
  })
  if (!res.ok) throw new Error(`Broker POST failed: ${res.status}`)
  return res.json()
}
```

### 7.2 Auth Store (Pinia 版)

```typescript
// src/stores/useAuthStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { brokerGet } from '@/services/brokerClient'

interface User {
  userOID: string
  userAID: string
  userName: string
  orgOID: string
  orgName: string
  roles: string[]
}

interface ProcessNode {
  processOID: string
  processAID: string
  name: string
  route: string
  children: ProcessNode[]
  isAuthorized: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const processTree = ref<ProcessNode[]>([])
  const isLoading = ref(true)

  const isAuthenticated = computed(() => user.value !== null && processTree.value.length > 0)

  const hasPermission = (processAID: string): boolean => {
    const find = (nodes: ProcessNode[]): boolean =>
      nodes.some((n) => n.processAID === processAID && n.isAuthorized || find(n.children || []))
    return find(processTree.value)
  }

  async function login(username: string, password: string) {
    const res = await fetch('/app/account/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ loginType: 'userID', UserAID: username, Password: password, isCreateToken: true }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.errmessage || '登录失败')
    }
    await fetchUserInfo()
    await fetchProcessTree()
  }

  async function logout() {
    await fetch('/app/account/logout', { method: 'POST', credentials: 'include' })
    user.value = null
    processTree.value = []
  }

  async function fetchUserInfo() {
    const result = await brokerGet<User>(['account', 'getMyInfo'])
    user.value = result as any
  }

  async function fetchProcessTree() {
    const result = await brokerGet<{ children: ProcessNode[] }>(['org', 'getUserProcessTree'])
    processTree.value = (result as any)?.children || []
  }

  async function checkAuth(): Promise<boolean> {
    isLoading.value = true
    try {
      const result = await brokerGet<{ valid: boolean }>(['account', 'checkLogin'])
      if ((result as any)?.valid) {
        await fetchUserInfo()
        await fetchProcessTree()
        isLoading.value = false
        return true
      }
    } catch { /* token 无效 */ }
    isLoading.value = false
    return false
  }

  return { user, processTree, isLoading, isAuthenticated, hasPermission, login, logout, fetchUserInfo, fetchProcessTree, checkAuth }
})
```

### 7.3 Vue SFC 页面模板（以作物品种管理为例）

```vue
<!-- src/pages/v11/crop/CropVarietyPage.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from 'lucide-vue-next'
import { useCropVarietyStore } from '@/stores/useCropVarietyStore'

const store = useCropVarietyStore()
const dialogVisible = ref(false)
const formRef = ref()
const formData = ref({
  cropCode: '',
  varietyName: '',
  categoryName: '',
  status: 'active',
})

const rules = {
  cropCode: [{ required: true, message: '请输入作物编码', trigger: 'blur' }],
  varietyName: [{ required: true, message: '请输入品种名称', trigger: 'blur' }],
}

const columns = [
  { prop: 'cropCode', label: '作物编码', width: 120 },
  { prop: 'varietyName', label: '品种名称', width: 150 },
  { prop: 'categoryName', label: '分类', width: 120 },
  { prop: 'status', label: '状态', width: 100 },
  { label: '操作', width: 180, slot: 'actions' },
]

onMounted(() => {
  store.fetchList({ status: 'active' })
})

async function handleSave() {
  await formRef.value?.validate()
  await store.save(formData.value)
  ElMessage.success('保存成功')
  dialogVisible.value = false
}

async function handleDelete(oid: string) {
  await ElMessageBox.confirm('确定删除该品种？', '删除确认', { type: 'warning' })
  await store.remove(oid)
  ElMessage.success('删除成功')
}
</script>

<template>
  <div class="p-4">
    <!-- 操作栏 -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">作物品种管理</h2>
      <el-button type="primary" :icon="Plus" @click="dialogVisible = true">
        新增品种
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="store.data" v-loading="store.loading" border stripe>
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        v-bind="col"
      >
        <template v-if="col.slot === 'actions'" #default="{ row }">
          <el-button size="sm" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
          <el-button size="sm" type="danger" :icon="Delete" @click="handleDelete(row.varietyOID)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.varietyOID ? '编辑品种' : '新增品种'"
      width="600px"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="作物编码" prop="cropCode">
          <el-input v-model="formData.cropCode" placeholder="请输入作物编码" />
        </el-form-item>
        <el-form-item label="品种名称" prop="varietyName">
          <el-input v-model="formData.varietyName" placeholder="请输入品种名称" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryName">
          <el-select v-model="formData.categoryName" placeholder="请选择分类" class="w-full">
            <el-option label="蔬菜" value="蔬菜" />
            <el-option label="水果" value="水果" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

### 7.4 Composable 模式（替代 React Custom Hooks）

```typescript
// src/composables/useIframeMessage.ts — 替代 React useEffect + useCallback
import { ref, onMounted, onUnmounted } from 'vue'
import type { IagsMessage } from '@/types/iframe'

export function useIframeMessage(moduleKey: string) {
  const title = ref('')
  const breadcrumb = ref<string[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  function handleMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) return
    const msg = event.data as IagsMessage
    if (msg.source !== 'iags-legacy') return

    switch (msg.type) {
      case 'IFRAME_READY':
        loading.value = false
        break
      case 'TITLE_UPDATE':
        title.value = msg.payload.title
        breadcrumb.value = msg.payload.breadcrumb || []
        break
      case 'ERROR':
        error.value = msg.payload.message
        break
    }
  }

  onMounted(() => window.addEventListener('message', handleMessage))
  onUnmounted(() => window.removeEventListener('message', handleMessage))

  return { title, breadcrumb, loading, error }
}
```

---

## 八、V1.1 代码迁移策略

### 8.1 迁移流水线

```
V1.1 源代码                          Vue 3 目标代码
───────────                         ────────────

① TypeScript 类型 ───────────────>  直接复制 (src/types/)
② 工具函数 (lib/) ──────────────>  直接复制 (src/lib/)
③ Zod Schema ──────────────────>  直接复制 (src/validators/)
④ FIELD_MAP/normalize ──────────>  直接复制 (src/lib/transformers.ts)

⑤ Zustand Store ────────────────>  Pinia Store (重写)
   保留: 业务逻辑/FIELD_MAP/API调用
   改写: create→defineStore, set→ref, persist→插件

⑥ React TSX 页面 ───────────────>  Vue SFC 页面 (重写)
   保留: 业务逻辑/数据流/交互顺序
   改写: JSX→template, hooks→composables, 事件→@event

⑦ React 业务组件 ───────────────>  Vue SFC 组件 (重写)
   保留: 组件 props 接口/emit 事件
   改写: JSX→template, Radix→Element Plus

⑧ Radix UI 封装 ────────────────>  废弃
   直接用 Element Plus 组件替代

⑨ enhancedApiClient ────────────>  brokerClient (重写)
   去掉 IndexedDB 缓存/持久化
   改为直接 HTTP + credentials:'include'

⑩ 后端路由 (server/src/routes/) ──>  iAGS biz 文件 (重写)
   保留: SQL 查询逻辑
   改写: Express route→Foil biz 模式
```

### 8.2 按模块迁移优先级

**第一批 — 基础设施** (4周):
1. Vue 3 项目脚手架 + Vite + Element Plus + Tailwind
2. 类型文件复制 (29文件)
3. brokerClient 实现
4. useAuthStore (Pinia 版)
5. MainLayout + Sidebar + Header
6. Vue Router 配置 + AuthGuard
7. 登录页 (LoginPage.vue)

**第二批 — 简单 CRUD 模块** (4周):
1. 作物品种管理 (1页 + 1Store)
2. 种源管理 (1页 + 1Store)
3. 字典管理 (1页 + 1Store)
4. 供应商管理 (1页 + 1Store)

**第三批 — 核心业务模块** (8周):
1. 育苗管理 + 种植管理 + 采收入库 (crop 模块)
2. 生产计划 + 采购计划 + 技术方案 (production 模块)
3. 仓库物料 + 入库 + 退料 + 领料 (material 模块)

**第四批 — 人资与审批** (6周):
1. 考勤 + 请假 + 加班 + 入职/离职 + 招聘 + 薪酬 (labor 模块)
2. 审批流程 + 审批列表 + 我的申请 (approval 模块)

**第五批 — 汇总与仪表盘** (4周):
1. 生产汇总 (10页，含图表)
2. 仪表盘 (10页，含图表和地图)

**第六批 — 系统管理** (3周):
1. 权限管理 (authority 12页)
2. 系统设置 (12页)
3. 备份恢复 + 系统监控

### 8.3 代码复用率估算

| 模块 | 总代码量 | 可复用 | 需重写 | 复用率 |
|------|---------|--------|--------|--------|
| TypeScript 类型 | 8,389 行 | 7,970 行 | 419 行 | 95% |
| 工具函数 | ~5,000 行 | 4,750 行 | 250 行 | 95% |
| Pinia Store | ~20,000 行 | 12,000 行 | 8,000 行 | 60% |
| Vue SFC 页面 | ~52,000 行 | 0 行 | 52,000 行 | 0% |
| Vue SFC 组件 | ~180,000 行 | 0 行 | 180,000 行 | 0% |
| brokerClient | 403 行 | 200 行 | 203 行 | 50% |
| 后端 biz 文件 | ~28,000 行 | 14,000 行 | 14,000 行 | 50% |
| **合计** | **~293,000 行** | **~38,920 行** | **~254,872 行** | **~13%** |

---

## 九、iAGS 旧模块过渡方案

### 9.1 过渡策略

```
第一阶段: Vue 3 外壳 + V1.1 模块 (React → Vue 3 重写)
         └─ iframe 嵌入 15 个 iAGS 旧模块 (EasyUI 不变)

第二阶段: 按优先级逐步将 iAGS 旧模块从 EasyUI → Vue 3 重写
         └─ 平行: V1.1 后端 SQLite → MySQL + broker 对接

最终态:   全部 Vue 3 + Element Plus + 统一 MySQL 后端
```

### 9.2 IframeContainer（Vue 3 版）

```vue
<!-- src/components/legacy/IframeContainer.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const props = defineProps<{
  src: string
  moduleKey: string
}>()

const emit = defineEmits<{
  titleChange: [title: string, breadcrumb: string[]]
  error: [error: { code: string; message: string }]
}>()

const iframeRef = ref<HTMLIFrameElement>()
const loading = ref(true)
const error = ref<string | null>(null)
const auth = useAuthStore()

function handleMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  const msg = event.data
  if (msg.source !== 'iags-legacy') return

  switch (msg.type) {
    case 'IFRAME_READY':
      loading.value = false
      // 向 iframe 发送用户信息
      iframeRef.value?.contentWindow?.postMessage({
        source: 'iags-shell',
        type: 'USER_INFO',
        payload: auth.user,
        timestamp: Date.now(),
        messageId: crypto.randomUUID(),
      }, window.location.origin)
      break
    case 'TITLE_UPDATE':
      emit('titleChange', msg.payload.title, msg.payload.breadcrumb || [])
      break
    case 'IFRAME_RESIZE':
      if (iframeRef.value) {
        iframeRef.value.style.height = `${msg.payload.height}px`
      }
      break
    case 'ERROR':
      error.value = msg.payload.message
      emit('error', msg.payload)
      break
  }
}

onMounted(() => window.addEventListener('message', handleMessage))
onUnmounted(() => window.removeEventListener('message', handleMessage))
</script>

<template>
  <div class="iframe-container relative w-full h-full">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
      <div class="text-center">
        <el-icon class="animate-spin" :size="32"><Loading /></el-icon>
        <p class="mt-2 text-sm text-gray-500">正在加载 {{ moduleKey }} 模块...</p>
      </div>
    </div>
    <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
      <div class="text-center">
        <p class="text-red-500 mb-2">{{ error }}</p>
        <el-button type="primary" @click="error = null; loading = true; iframeRef && (iframeRef.src = props.src)">
          重新加载
        </el-button>
      </div>
    </div>
    <iframe
      ref="iframeRef"
      :src="src"
      class="w-full border-none"
      style="min-height: 600px"
      :title="moduleKey"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  </div>
</template>
```

---

## 十、新项目结构

```
iags-vue-frontend/                   # 新项目根目录
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── main.ts                      # 入口: createApp + use Pinia + use Router
│   ├── App.vue                      # 根组件: <router-view />
│   │
│   ├── router/
│   │   └── index.ts                 # Vue Router 配置 + beforeEach 守卫
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.vue       # Header + Sidebar + <router-view>
│   │   │   ├── AppSidebar.vue       # 统一菜单
│   │   │   ├── AppHeader.vue        # 顶部栏（用户信息/面包屑/通知）
│   │   │   └── BreadcrumbBar.vue    # 面包屑
│   │   ├── legacy/
│   │   │   ├── IframeContainer.vue  # iframe 容器
│   │   │   └── LegacyPage.vue       # 旧模块包装页
│   │   └── common/                  # 共享业务组件（迁移自 V1.1）
│   │       ├── BatchActionBar.vue
│   │       ├── ExportButton.vue
│   │       └── ...
│   │
│   ├── pages/
│   │   ├── login/
│   │   │   └── LoginPage.vue
│   │   ├── v11/                     # V1.1 迁入页面（全部 .vue SFC）
│   │   │   ├── crop/                # 作物管理 (7页)
│   │   │   ├── production/          # 计划管理 (4页)
│   │   │   ├── material/            # 库存管理 (5页)
│   │   │   ├── labor/               # 人工管理 (4页)
│   │   │   ├── summary/             # 生产汇总 (5页)
│   │   │   ├── approval/            # 审批管理
│   │   │   ├── dashboard/           # 仪表盘
│   │   │   ├── authority/           # 权限管理
│   │   │   ├── system/              # 系统设置
│   │   │   └── settings/            # 配置
│   │   └── legacy/
│   │       └── LegacyPage.vue       # 旧模块 iframe 页
│   │
│   ├── stores/                      # Pinia Store（替代 Zustand）
│   │   ├── useAuthStore.ts
│   │   ├── useCropVarietyStore.ts
│   │   ├── useMaterialStore.ts
│   │   └── ...
│   │
│   ├── composables/                 # Vue Composables（替代 React Hooks）
│   │   ├── useIframeMessage.ts
│   │   ├── useMenuItems.ts
│   │   ├── useRealtimeData.ts
│   │   └── ...
│   │
│   ├── services/
│   │   ├── brokerClient.ts          # broker API 客户端
│   │   └── realtimeBridge.ts        # Socket.IO 实时数据
│   │
│   ├── lib/                         # 从 V1.1 直接复制
│   │   ├── transformers.ts          # FIELD_MAP / normalize / denormalize
│   │   ├── utils.ts                 # 工具函数
│   │   ├── validators.ts           # Zod Schema
│   │   └── constants.ts            # 常量/枚举
│   │
│   └── types/                       # 从 V1.1 直接复制
│       ├── crop.ts
│       ├── material.ts
│       ├── labor.ts
│       ├── ...
│       └── index.ts
```

---

## 十一、实施计划

### 第一阶段：基础设施搭建（4 周）

**第1周 — 项目创建与配置**:
- [ ] 创建 Vue 3 + Vite + TypeScript 项目
- [ ] 安装依赖: Element Plus, Pinia, Vue Router, Tailwind CSS, vue-echarts, lucide-vue-next
- [ ] 配置 Vite proxy (`/app` → `localhost:3000`, `/socket.io` → ws)
- [ ] 配置 Tailwind + Element Plus 主题色
- [ ] 配置路径别名 (`@/` → `src/`)
- [ ] 复制 V1.1 类型文件 (29 文件 → `src/types/`)
- [ ] 复制工具函数 + Zod Schema (→ `src/lib/`)
- [ ] 实现 brokerClient.ts

**第2周 — 认证与布局**:
- [ ] 实现 useAuthStore (Pinia)
- [ ] 实现 MainLayout.vue + AppSidebar.vue + AppHeader.vue
- [ ] 实现 Vue Router 路由配置 + beforeEach 守卫
- [ ] 实现 LoginPage.vue（对接 /app/account/login）
- [ ] 实现菜单生成（process tree → 菜单项）

**第3周 — 旧模块过渡**:
- [ ] 实现 IframeContainer.vue + postMessage 协议
- [ ] 实现 realtimeBridge（Socket.IO）
- [ ] 编写 iframe 注入脚本（EasyUI 页面中间件）
- [ ] 验证登录 → 菜单 → React 页面 + Legacy 页面均正常

**第4周 — 首个完整 CRUD 验证**:
- [ ] 改造第一个 Pinia Store（useCropVarietyStore）
- [ ] 实现第一个 Vue SFC 页面（CropVarietyPage.vue）
- [ ] 改造第一个后端路由 → iAGS biz 文件
- [ ] 端到端验证：登录 → 菜单 → CRUD → API → MySQL

### 第二阶段：V1.1 模块 Vue 3 重写（18 周）

| 批次 | 模块 | 页面数 | Store数 | 工期 |
|------|------|--------|---------|------|
| 2.1 | 作物管理 (crop) | 7 | 7 | 3周 |
| 2.2 | 计划管理 (production) | 4 | 4 | 2周 |
| 2.3 | 库存管理 (material) | 5 | 8 | 3周 |
| 2.4 | 人工管理 (labor) | 4 | 15 | 4周 |
| 2.5 | 生产汇总 (summary) | 5 | 3 | 3周 |
| 2.6 | 审批管理 (approval) | 8 | 5 | 3周 |

### 第三阶段：系统管理 + 仪表盘（7 周）

| 批次 | 模块 | 页面数 | Store数 | 工期 |
|------|------|--------|---------|------|
| 3.1 | 权限管理 (authority) | 12 | 5 | 3周 |
| 3.2 | 系统设置 (system + settings) | 24 | 10 | 3周 |
| 3.3 | 仪表盘 (dashboard) | 10 | 2 | 1周 |

### 第四阶段：旧模块过渡与后端统一（3 周）

- [ ] IframeContainer 完善（高度同步、加载态、错误处理）
- [ ] postMessage 通信完善
- [ ] EasyUI 主题色与 Element Plus 统一
- [ ] V1.1 全部后端路由 → iAGS biz 文件完成
- [ ] SQLite 全部数据 → MySQL 完成

### 第五阶段：长期（持续进行）

**iAGS 旧模块 Vue 3 重写（按优先级）**:
1. **P1 — home (仪表盘)**: 328行 EJS → 1-2 周
2. **P2 — device/control/curve**: 核心监控 → 8-12 周
3. **P3 — more (系统配置)**: 最大模块 24 个 EJS → 6-8 周
4. **P4 — report/resume/warning/energy/camera/application/systemset/SystemMore** → 6-8 周
5. **P5 — 3D/intelligentcontrol**: Three.js + MQTT → 后续评估

---

## 十二、工作量估算对比

| 方案 | 总工期 | 代码复用率 | 新增风险 |
|------|--------|----------|---------|
| **原方案** (React 复制) | ~27 周 | 70%（复制 V1.1 代码） | 团队不熟悉 React |
| **Vue 3 方案** | ~32 周 | 13%（类型+工具函数） | V1.1 全部代码需重写 |
| **差额** | +5 周 (~19%) | -57% | — |

### 12.1 为什么 Vue 3 方案工期增加有限？

1. **Element Plus 减少自建组件工作**: 不需要维护 48 个 Radix 封装组件（6,607 行），Element Plus 原生提供
2. **Pinia 比 Zustand 更简洁**: `set({k:v})` vs `ref.value = v`，action 内直接访问状态
3. **Vue SFC 比 TSX 开发效率高**: template 语法更结构化，`v-model` 双向绑定减少模板代码
4. **V1.1 代码可作参考实现**: 虽然语法不同，但业务逻辑、交互流程、API 调用可直接参照

---

## 十三、关键技术风险

| 风险 | 级别 | 应对措施 |
|------|------|---------|
| GanttChart/KanbanBoard 无 Element Plus 内置 | 中 | 基于 ECharts + vue-draggable-plus 自建，V1.1 代码作参考 |
| 752 个业务组件全量重写 | 高 | 按模块分批，每个模块先跑通核心流程再补边缘功能 |
| Vue 3 团队学习成本 | 中 | Composition API 与 React Hooks 相似，学习曲线平缓 |
| iAGS brokder API Cookie 跨域 | 低 | Vite proxy 统一代理，`credentials: 'include'` |
| 旧 EasyUI 主题与 Element Plus 视觉不一致 | 低 | 统一用 Tailwind + Element Plus 主题变量覆盖 |
| Element Plus 版本升级兼容性 | 低 | 锁定主版本号，定期升级测试 |

---

## 十四、依赖清单

```bash
# 核心依赖
npm install vue@3 vue-router@4 pinia
npm install element-plus
npm install @element-plus/icons-vue

# 样式
npm install tailwindcss @tailwindcss/vite

# 图表
npm install echarts vue-echarts

# 图标
npm install lucide-vue-next

# 工具
npm install @vueuse/core           # Vue Composition 工具集
npm install date-fns
npm install zod
npm install pinia-plugin-persistedstate  # Pinia 持久化

# 文档处理（不变）
npm install xlsx file-saver jspdf

# 拖拽
npm install vue-draggable-plus    # SortableJS Vue 3 封装

# 实时通信（不变）
npm install socket.io-client

# 开发依赖
npm install -D @vitejs/plugin-vue
npm install -D typescript
npm install -D vite
npm install -D vue-tsc             # Vue TypeScript 类型检查
npm install -D tailwindcss
npm install -D unplugin-vue-components  # Element Plus 按需导入（可选）
npm install -D unplugin-auto-import    # Vue API 自动导入（可选）
```

---

## 十五、验证标准

### 第一阶段验证
- [ ] `npm run dev` 正常启动，无编译错误
- [ ] 登录页正常渲染，POST `/app/account/login` 成功获取 Cookie
- [ ] 菜单正确渲染（Vue 模块 + Legacy 模块）
- [ ] `brokerGet(['iAGS','v11Crop','getVarietyList'])` 返回 MySQL 数据
- [ ] Pinia Store 数据正确显示在 Vue 页面
- [ ] 旧模块 iframe 加载正常，postMessage 通信正常

### 第二阶段验证
- [ ] 全部 V1.1 模块在 Vue 3 外壳中 CRUD 正常
- [ ] 数据来自 MySQL，无 IndexedDB/localStorage 残留
- [ ] 100 个 Zustand persist 全部转为 Pinia（开发阶段可保留 persist 插件）
- [ ] 全部 API 通过 broker 模式调用
- [ ] Element Plus 组件在所有核心页面正常工作

### 第三阶段验收
- [ ] Vue DevTools 可正常调试 Pinia Store
- [ ] Vue Router 路由切换流畅，懒加载正常
- [ ] iframe 内 EasyUI 页面视觉与 Vue 外壳统一
- [ ] 面包屑/标题同步正常
- [ ] Socket.IO 实时数据正常推送到 iframe

---

## 十六、多语言方案（i18n）

### 16.1 迁移策略

```
[旧系统] iAGS Acroprise MultiLang 词条
    │
    ▼ 导出为 JSON
[中间格式] iags_locale.json
    │
    ├── zh-CN.json  (中文简体)
    ├── zh-TW.json  (中文繁体)
    ├── en.json     (英文)
    └── ja.json     (日文)
    │
    ▼ 导入
[新系统] useI18nStore (Pinia) + vue-i18n
    └── <i18n-t> 组件 / $t() 函数
```

### 16.2 vue-i18n 集成方案

```typescript
// src/stores/useI18nStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createI18n } from 'vue-i18n'

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref('zh-CN')
  const messages = ref<Record<string, any>>({})

  async function loadLocale(lang: string) {
    const mod = await import(`@/locales/${lang}.json`)
    messages.value[lang] = mod.default
    locale.value = lang
  }

  return { locale, messages, loadLocale }
})

// src/i18n.ts — vue-i18n 实例
import { createI18n } from 'vue-i18n'
export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
})
```

### 16.3 V1.1 字典系统扩展

V1.1 已有 `useDictionaryStore` 管理 category_code + dict_code，可扩展为多语言词条管理：

- 扩展 `translations` 表: dict_code + locale + translated_text
- 组件层封装 `$t(key)` 翻译函数
- 旧 EasyUI 页面的多语言词条 → 迁移到 vue-i18n JSON

---

## 十七、API 层简化详细方案

### 17.1 问题分析

V1.1 当前 `enhancedApiClient` 实现了三级降级缓存（API → IndexedDB → localStorage + 离线队列），是为"田间地头断网"场景设计的**预防性架构**。实际情况：

| 评估维度 | 实际情况 |
|---------|---------|
| 离线使用场景 | Web 应用不是移动端，田间不会有人开电脑操作 |
| 网络问题 | 偶尔抖动 TanStack Query 的 staleTime + 重试足够应对 |
| IndexedDB 缓存 | 增加了一层复杂性和维护负担 |
| 离线队列 | 从未验证过"恢复网络后自动同步"的完整流程 |
| Dexie 依赖 | 多一个第三方库，版本升级有兼容风险 |

**结论**：三级缓存是过度设计。简化为 brokerClient + TanStack Vue Query 缓存。

### 17.2 简化后对比

```
当前 enhancedApiClient (397行):
├── Dexie IndexedDB 数据库类 (11行)
├── EnhancedApiClient 类 (386行)
│   ├── request() 主方法 (73行)
│   ├── get/post/put/delete/patch (21行)
│   ├── getFromCache/saveToCache/clearCache (34行)
│   ├── addToOfflineQueue/getOfflineQueue/processOfflineQueue (68行)
│   ├── setupNetworkListeners (13行)
│   └── fetch() 内部请求 (73行)

简化后 brokerClient (~90行):
├── brokerGet — GET 请求封装
├── brokerPost — POST 请求封装
├── brokerPut — PUT 请求封装
├── brokerDelete — DELETE 请求封装
└── 零外部依赖，仅封装 fetch + credentials:'include'

缓存由 TanStack Vue Query 接管:
├── useQuery({ queryKey, queryFn, staleTime })
├── useMutation({ mutationFn, onSuccess, onError })
└── queryClient.invalidateQueries() 手动刷新
```

### 17.3 TanStack Vue Query 使用模式

```typescript
// src/composables/useCropVarieties.ts — Vue Query 接管缓存
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { brokerGet, brokerPost } from '@/services/brokerClient'
import { STALE_TIMES } from '@/lib/staleTimes'
import type { CropVariety } from '@/types/crop'

// 查询 — TanStack Vue Query 管理缓存
export function useCropVarieties(query: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['cropVarieties', query],
    queryFn: () => brokerGet<CropVariety[]>(['iAGS', 'v11Crop', 'getVarietyList'], query),
    staleTime: STALE_TIMES.NORMAL,  // 30秒内不重新请求
    retry: 2,
  })
}

// 变更 — 成功后自动刷新
export function useCreateCropVariety() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (record: Partial<CropVariety>) =>
      brokerPost(['iAGS', 'v11Crop', 'saveVariety'], record),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cropVarieties'] }),
  })
}
```

### 17.4 缓存策略分层 (staleTime 配置)

```typescript
// src/lib/staleTimes.ts
export const STALE_TIMES = {
  REALTIME:   0,                // 实时数据 — 不缓存 (WebSocket 推送)
  NEAR_REAL:  5 * 1000,         // 准实时 — 5秒 (设备状态)
  NORMAL:     30 * 1000,        // 常规 — 30秒 (CRUD 列表)
  STABLE:     5 * 60 * 1000,    // 稳定 — 5分钟 (用户/权限/配置)
  REFERENCE:  30 * 60 * 1000,   // 参考 — 30分钟 (字典/枚举)
} as const
```

| 数据类型 | staleTime | 说明 |
|---------|-----------|------|
| 实时传感器数据 | 0 (不缓存) | 必须最新，WebSocket 推送 |
| 设备状态 | 5秒 | 允许短暂缓存 |
| 告警列表 | 10秒 | 准实时 |
| 用户/权限信息 | 5分钟 | 很少变动 |
| 温室/区域/设备配置 | 5分钟 | 配置类数据 |
| 字典/枚举值 | 30分钟 | 基本不变 |
| 历史曲线数据 | 1分钟 | 查询后缓存减少重复请求 |

### 17.5 改造效果对比

| 指标 | 旧方案 (enhancedApiClient) | 新方案 (brokerClient + Vue Query) |
|------|---------------------------|----------------------------------|
| 代码行数 | 397行 | 90行 (-77%) |
| 外部依赖 | Dexie (额外维护负担) | 无 (仅 fetch) |
| 缓存策略 | 手写 IndexedDB + 过期检查 | TanStack Vue Query (成熟库) |
| 离线支持 | 离线队列 (未充分验证) | 无离线 (不需要) |
| 与 iAGS 统一 | 不一致 | **完全一致** |

---

## 十八、架构师审查 — 4 个阻塞问题及应对

> 基于 2026-05-20 两系统全量代码级对比的独立审查

### 阻塞 #1：JWT 与 iAGS Cookie 互通（状态：已解决 ✅）

**原问题**：旧方案需要 JWT↔Session 桥接，但 iAGS 的 token 是其自有 Session+RSA 体系签发的，不是 JWT。

**Vue 3 方案应对**：放弃 JWT 桥接，直接使用 iAGS 原生 Cookie 认证。

```
用户登录
├── POST /app/account/login { UserAID, Password }
├── Vite proxy 转发到 iAGS BizServer
├── BizServer 验证密码，设置 Cookie:
│   Set-Cookie: yujiang-iAGS-x-access-token=<token>;
│               HttpOnly; Path=/; SameSite=Lax
└── 后续 broker 请求自动携带 Cookie (credentials: 'include')

为什么可行？
├── Vite proxy 让前端 (localhost:5173) 和后端 (localhost:3000)
│   在浏览器看来是"同源"（都走 5173 的 proxy）
├── Cookie 的 Domain/Path 在 proxy 层自动适配
└── 不需要 JWT，不需要 Redis 映射表，不需要 Session 续期逻辑
```

### 阻塞 #2：Node v8.15.1 安全风险（状态：需评估 ⚠️）

**问题**：Node v8 于 2019 年 12 月 EOL，存在多个高危 CVE。

**应对方案**：项目启动第 1 周并行执行 Node 版本升级评估

```
Week 1 并行任务: Node 升级评估
├── [Day1-2] 在隔离环境安装 Node v14 (Foil 框架依赖测试)
├── [Day3]   如果 v14 通过，测试 v16
├── [Day4]   如果 v16 通过，测试 v18 (LTS)
└── [Day5]   输出评估报告: 最高可升级版本 + 需修改的代码清单

情况A: 可升级到 v14+ → 项目初期就升级，消除安全风险
情况B: 无法升级 (框架耦合 v8 API) → 接受风险，加强网络层防护
```

### 阻塞 #3：PoolingServer 修改与"后端不动"原则（状态：已解决 ✅）

**原则**：`tm.iAGS.poolingServer` **完全不动**，数据出口走已有机制。

```
数据读取（推荐: 直接读 Redis）:
  poolingServer 已经将实时数据写入 Redis (yjPusher 机制)
  broker biz 文件直接读 Redis 获取传感器数据
  不需要修改 poolingServer 任何代码

数据写入（控制指令）:
  Vue 前端 → brokerPost(['iAGS','control','sendCommand'], {...})
  → broker biz 文件 → yjPusher → TCP → 物理设备
  走 iAGS 已有的控制链路，不经过 poolingServer HTTP
```

### 阻塞 #4：适配器复杂度（状态：已解决 ✅）

Vue 3 方案采用 broker 直调，远低于原自建适配层方案的复杂度：

| 组件 | 行数 | 说明 |
|------|------|------|
| brokerClient.ts | ~90行 | brokerGet/brokerPost/brokerPut/brokerDelete |
| realtimeBridge.ts | ~50行 | Socket.IO 连接 + iframe 转发 |
| broker biz 文件 | 每个 ~30-50行 | 对应 V1.1 一个 API 路由 |
| Vite proxy 配置 | ~20行 | Cookie 代理 |
| **总计（前端新增）** | **~160行** | 远低于旧方案 |

---

## 十九、iAGS 旧模块迁移优先级详细排序

### 19.1 迁移优先级总览

| 优先级 | 模块 | EJS行数 | Biz行数 | 复杂度 | 工期估算 |
|--------|------|---------|---------|--------|---------|
| **P0** | 认证/账户 + home (仪表盘) | 328 | — | 低—中 | 1-2周 |
| **P1** | device + control + curve | 12,238 | 9,403 | 高 | 8-12周 |
| **P1** | administration | 6,475 | 6,227 | 高 | 3-4周 |
| **P2** | report + resume + warning + energy | 8,341 | 8,500+ | 中—高 | 4-6周 |
| **P2** | more/morechild (21子模块) | 10,624 | 6,172 | 中 | 6-8周 |
| **P3** | camera + application + systemset | 5,372 | 4,666 | 低—中 | 2-3周 |
| **P4** | 3D + intelligentcontrol | 4,248 | 1,749 | 极高 | 后续评估 |

### 19.2 各模块详情

**P0 — 第一期最先做**：

| 模块 | 理由 |
|------|------|
| **认证/账户** | 登录、token、session — 一切依赖此模块 |
| **home** | 仪表盘入口；低复杂度（328行EJS），快速见效 |

**P1 — 核心业务（使用频率最高）**：

| 模块 | Biz行数 | EJS行数 | 迁移要点 |
|------|---------|---------|---------|
| **device** | 2,810 | 5,569 | 10个EJS：空调/温度/喷雾/水肥/遮阳/侧窗/风机/风阀，EasyUI datagrid + Highcharts |
| **control** | 3,317 | 3,439 | 7个EJS：智能控制(1362行最大)、运行监测，MQTT/TCP指令下发 |
| **curve** | 3,276 | 3,230 | 8种曲线图：实时/历史/施肥/产量/能耗/设备/蓄电，Highcharts→ECharts |
| **administration** | 6,227 | 6,475 | 种源/育苗/区域种植/采购/施肥/生产管理 — 由V1.1对应模块替换 |

**P2 — 重要但非阻塞**：

| 模块 | 理由 |
|------|------|
| **report** | 报表生成（含最大单体biz文件1,531行） |
| **warning** | 告警管理 |
| **resume** | 种植履历/历史 |
| **energy** | 能耗分析 |
| **more/morechild** | 21个子模块，10,624行EJS，批量处理 |

**P3 — 支撑/简单模块**：

| 模块 | 理由 |
|------|------|
| **camera** | 简单（632行），但需处理视频流 |
| **application** | 智能控制模式 + 阈值配置 |
| **systemset** | 单页面（327行） |

**P4 — 高技术难度，后续评估**：

| 模块 | 理由 |
|------|------|
| **3D** | Three.js 温室可视化（1,884行），零biz逻辑，纯前端迁移 |
| **intelligentcontrol** | 规则引擎（1,749行），需深入理解控制逻辑 |

### 19.3 大型单体文件（需特别关注）

| 文件 | 行数 | 模块 | 迁移策略 |
|------|------|------|---------|
| `application/intelligentControl.ejs` | 3,011 | application | 拆分为 8-10 个 Vue 组件 |
| `morechild/ParameterSetting.{v}.ejs` | 1,827 | more | 配置表单化，拆分为 10+ 子组件 |
| `administration/regionalplanting.ejs` | 1,825 | administration | 区域种植可视化，对接 V1.1 FarmStructure |
| `administration/seedlingManagement.ejs` | 1,758 | administration | 育苗管理，对接 V1.1 SeedlingPage |
| `intelligentcontrol/showIntelligentcontrol.{v}.ejs` | 1,749 | intelligentcontrol | 规则引擎配置界面 |
| `report/getSelectedData.js` | 1,531 | report (biz) | 最大的后端逻辑文件 |

---

## 二十、数据库完整映射表

### 20.1 数据迁移策略

**核心原则**：iAGS MySQL 原样使用。V1.1 独有表在 iAGS MySQL 中新建，统一使用 `V11_` 前缀与 iAGS 原有表清晰隔离。

| V1.1 开发阶段 | iAGS 生产环境 |
|-------------|-------------|
| SQLite (开发测试用) | MySQL (iAGS 现有，不动) |
| 独立 .db 文件 | V1.1 独有表 → `V11_` 前缀新建 |

### 20.2 V1.1 独有表清单（约55张，需在 iAGS MySQL 中新建）

**组织架构 (7)**：
`V11_Departments`, `V11_Positions`, `V11_Teams`, `V11_Organizations`, `V11_Users`, `V11_Roles`, `V11_UserRoles`

**权限 (5)**：
`V11_Permissions`, `V11_RolePermissions`, `V11_Processes`, `V11_Actions`, `V11_UsersAuthority`

**作物种植 (8)**：
`V11_CropVarieties`, `V11_SeedSources`, `V11_Seedlings`, `V11_Plantings`, `V11_HarvestRecords`, `V11_FertilizerRecords`, `V11_CropInstances`, `V11_CropOrders`

**生产计划 (3)**：
`V11_ProductionPlans`, `V11_PurchasePlans`, `V11_TechSolutions`

**库存物料 (6)**：
`V11_Inventory`, `V11_Materials`, `V11_MaterialRequests`, `V11_MaterialReturns`, `V11_MaterialExecutes`, `V11_MaterialCosts`

**人工管理 (9)**：
`V11_LaborRecords`, `V11_AttendanceRecords`, `V11_Employees`, `V11_Schedules`, `V11_OvertimeRecords`, `V11_LeaveRecords`, `V11_LeaveQuotas`, `V11_OnboardingRecords`, `V11_ResignationRecords`

**审批 (5)**：
`V11_Approvals`, `V11_ApprovalWorkflows`, `V11_ApprovalRules`, `V11_ApprovalLevelConfigs`, `V11_ApprovalTypeRules`

**任务问题 (5)**：
`V11_FarmTasks`, `V11_TempTasks`, `V11_Inspections`, `V11_Problems`, `V11_TaskOperationRecords`

**系统配置 (6)**：
`V11_SystemConfigs`, `V11_OperationLogs`, `V11_ProcessDefinitions`, `V11_Shifts`, `V11_Dictionaries`, `V11_DictionaryCategories`

**其他 (6)**：
`V11_CodeRules`, `V11_MaterialCodeCategories`, `V11_Announcements`, `V11_Indicators`, `V11_Suppliers`, `V11_RecruitmentRecords`

### 20.3 SQLite → MySQL 迁移步骤

```bash
# 第一步：导出 V1.1 SQLite 独有表的结构和数据
sqlite3 server/data/yuanxingtu.db .schema > v1.1_schema.sql
sqlite3 server/data/yuanxingtu.db .dump > v1.1_data.sql

# 第二步：转换 SQLite 语法 → MySQL 语法
# - AUTOINCREMENT → AUTO_INCREMENT
# - TEXT → VARCHAR(255) 或 TEXT (按字段语义)
# - INTEGER → INT / REAL → DOUBLE
# - 表名加 V11_ 前缀

# 第三步：在 iAGS MySQL 中建表
mysql -u root -p iags_db < v1.1_schema_mysql.sql

# 第四步：导入数据
mysql -u root -p iags_db < v1.1_data_mysql.sql
```

### 20.4 broker biz 文件示例

```javascript
// 文件: tm.iags_biz/biz/iAGS/v11/crop/getVarietyList.{m}.js
// 对应 V1.1: GET /api/crop-varieties
// broker bizURLParams: ["iAGS","v11Crop","getVarietyList"]
const yjDBService = global.yjRequire("yujiang.Foil").yjDBService;
const yjDB = global.yjRequire("yujiang.Foil").yjDB;

module.exports = function(sender) {
    let query = sender.req.query;
    let data = JSON.parse(query.data || '{}');
    let page = parseInt(data.page) || 1;
    let pageSize = parseInt(data.pageSize) || 20;

    yjDBService.exec({
        sql: `SELECT * FROM V11_CropVarieties WHERE Status='active'
              LIMIT ? OFFSET ?`,
        parameters: [pageSize, (page - 1) * pageSize],
        success: function(result) {
            let rows = yjDB.dataSet2ObjectList(result.meta, result.rows);
            sender.success({ rows: rows, total: result.rows.length });
        },
        error: function(err) {
            console.log('[v11Crop] Error:', err);
            sender.error(err);
        }
    });
};
```

---

## 二十一、iframe postMessage 通信协议完整规范

### 21.1 过渡期架构

```
┌────────────────────────────────────────────────────────────┐
│                  Vue 3 Shell (新前端)                        │
│  ┌──────────┐  ┌──────────────────────────────────────────┐│
│  │ Sidebar  │  │  Content Area                             ││
│  │ (Vue)    │  │  ┌──────────────────────────────────────┐ ││
│  │          │  │  │  IframeContainer                      │ ││
│  │ Vue 菜单 │  │  │  ┌──────────────────────────────┐    │ ││
│  │ - Vue页  │  │  │  │ iframe (iAGS EasyUI 旧页面)   │    │ ││
│  │ - 旧模块 │──┼──┤  │ postMessage ↔                │    │ ││
│  │          │  │  │  └──────────────────────────────┘    │ ││
│  └──────────┘  │  └──────────────────────────────────────┘ ││
│                └──────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### 21.2 消息格式定义

```typescript
// src/types/iframe.ts — 框架无关的 postMessage 协议

// ===== 消息信封 =====
interface IframeMessage<T = any> {
  id: string                    // UUID v4，用于请求-响应配对
  type: IframeMessageType       // 消息类型
  source: 'iags-shell' | 'iags-legacy'  // 发送方
  payload: T                    // 消息体
  timestamp: number             // Unix timestamp (ms)
}

type IframeMessageType =
  // ===== 生命周期 =====
  | 'IFRAME_READY'              // iframe 初始化完成
  | 'IFRAME_LOADED'             // iframe 页面加载完成
  | 'IFRAME_ERROR'              // iframe 内部错误

  // ===== 导航 =====
  | 'NAV_CHANGE'                // Shell 切换菜单 → iframe 切换页面
  | 'NAV_CHANGED'               // iframe 确认页面已切换
  | 'NAV_REPORT'                // iframe 上报当前路由

  // ===== 认证 =====
  | 'USER_INFO'                 // Shell 传递用户信息 → iframe
  | 'AUTH_EXPIRED'              // iframe 报告 token 过期

  // ===== 主题/语言 =====
  | 'THEME_CHANGE'              // Shell 切换主题
  | 'LOCALE_CHANGE'             // Shell 切换语言

  // ===== 标题 =====
  | 'TITLE_UPDATE'              // iframe 上报页面标题+面包屑

  // ===== 尺寸 =====
  | 'IFRAME_RESIZE'             // iframe 请求调整高度

  // ===== 实时数据 =====
  | 'REALTIME_DATA'             // Shell 转发 Socket.IO 实时数据 → iframe

  // ===== 响应 =====
  | 'ACK'                       // 确认收到
  | 'ERROR'                     // 错误响应
```

### 21.3 安全校验（iframe 端）

```typescript
// iframe 内注入脚本 — 消息安全校验
window.addEventListener('message', (event: MessageEvent) => {
  // 1. 来源校验 — 仅接受同源
  if (event.origin !== window.location.origin) return

  // 2. 格式校验
  const msg = event.data
  if (!msg.id || !msg.type || !msg.source || !msg.timestamp) return

  // 3. 来源声明校验
  if (msg.source !== 'iags-shell') return

  // 4. 时效校验（5分钟内）
  const age = Date.now() - msg.timestamp
  if (Math.abs(age) > 5 * 60 * 1000) return

  // 5. 消息处理
  handleMessage(msg)
})
```

### 21.4 Socket.IO 实时数据桥接

```
Vue 3 Shell                   Socket.IO                 PoolingServer
──────────                    ──────────                 ─────────────
  realtimeBridge.connect() ──→ io('/') ────────────────→ IoT 实时数据
       │                           ↑
       │  on('RealTimeData')       │  on('warningData')
       │  on('device_operation')   │  on('control_state')
       │
       ├── postMessage ──→ iframe.contentWindow
       │    { type: 'REALTIME_DATA',
       │      payload: { event, data } }
       │
       ↓
  [Vue 页面直接渲染]    [iframe EasyUI 页面渲染]
```

```typescript
// src/composables/useRealtimeBridge.ts — Vue 3 composable
import { io, Socket } from 'socket.io-client'
import { onMounted, onUnmounted, ref } from 'vue'

const REALTIME_EVENTS = [
  'RealTimeData',           // 传感器实时数据
  'warningData',            // 告警实时推送
  'device_operation_record', // 设备操作记录
  'control_state',          // 设备控制状态
]

export function useRealtimeBridge() {
  const socket = ref<Socket | null>(null)
  const iframeRefs = new Map<string, HTMLIFrameElement>()

  function connect() {
    socket.value = io('/', { path: '/socket.io', transports: ['websocket', 'polling'] })
    REALTIME_EVENTS.forEach(eventName => {
      socket.value?.on(eventName, (data) => broadcastToAllIframes(eventName, data))
    })
  }

  function broadcastToAllIframes(event: string, data: any) {
    iframeRefs.forEach((iframe) => {
      iframe.contentWindow?.postMessage({
        source: 'iags-shell', type: 'REALTIME_DATA',
        payload: { event, data }, timestamp: Date.now(),
        id: crypto.randomUUID(),
      }, window.location.origin)
    })
  }

  function registerIframe(key: string, iframe: HTMLIFrameElement) {
    iframeRefs.set(key, iframe)
  }

  function disconnect() { socket.value?.disconnect() }

  return { connect, registerIframe, disconnect }
}
```

---

## 二十二、API 原型验证计划

选取 3 个代表性接口做实测，验证 broker 直调方案（项目第1-2周执行）：

| 验证接口 | bizURLParams | 验证内容 | 预计耗时 |
|---------|-------------|---------|---------|
| **登录** | — | iAGS Cookie 认证 + Vite proxy Cookie 转发 | 0.5天 |
| **品种列表查询** | `["iAGS","v11Crop","getVarietyList"]` | brokerClient → biz 文件 → V11_CropVarieties → 响应 | 0.5天 |
| **设备数据读取** | `["iAGS","iot","getRealtimeData"]` | brokerClient → Redis 读取传感器实时数据 | 1天 |

**验证通过标准**：
- 登录后 Cookie `yujiang-iAGS-x-access-token` 正确设置
- brokerClient GET 返回 `{ rows: [...], total: N }` 格式数据
- 实时数据从 Redis 成功读取，延迟 < 1秒

---

## 二十三、Nginx 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                     Nginx (反向代理)                      │
│  ├── /app/*          → localhost:3000 (iAGS BizServer)   │
│  ├── /socket.io/*    → localhost:3000 (WebSocket)        │
│  └── /*              → Vue 3 静态文件 (Vite build)       │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   Vue 3 静态文件     iAGS BizServer     PoolingServer
   (Vite build)      (端口3000,不动)     (TCP/MQTT,不动)
                     - Foil 框架          - IoT 数据采集
                     - broker 接口        - Redis 写入
                     - MySQL 操作
                     - Cookie 认证
```

**关键点**：
- 不需要独立的 Express 代理层
- Nginx 直接将 `/app` 请求转发到 iAGS BizServer
- Cookie 认证在 Nginx 层面代理后仍然正常工作（同域部署）
- 比旧方案少一层网络跳转，响应延迟更低

---

## 二十四、开发环境搭建细节

### 24.1 项目创建

```bash
# 1. 创建 Vue 3 + Vite + TypeScript 项目
npm create vite@latest iags-vue-frontend -- --template vue-ts

# 2. 安装核心依赖
cd iags-vue-frontend
npm install vue@3 vue-router@4 pinia
npm install element-plus @element-plus/icons-vue
npm install @vueuse/core
npm install @tanstack/vue-query
npm install vue-i18n
npm install pinia-plugin-persistedstate

# 3. 样式
npm install tailwindcss @tailwindcss/vite

# 4. 图表
npm install echarts vue-echarts

# 5. 图标
npm install lucide-vue-next

# 6. 工具
npm install date-fns zod
npm install xlsx file-saver jspdf

# 7. 拖拽
npm install vue-draggable-plus

# 8. 实时通信
npm install socket.io-client

# 9. 开发依赖
npm install -D @vitejs/plugin-vue typescript vite vue-tsc
npm install -D tailwindcss
```

### 24.2 Vite proxy 配置

```typescript
// vite.config.ts — Cookie 代理配置
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5173,
    proxy: {
      '/app': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // 确保 Set-Cookie 在 localhost:5173 生效
            const cookies = proxyRes.headers['set-cookie']
            if (cookies) {
              cookies.forEach((cookie, i) => {
                if (cookies[i]) {
                  cookies[i] = cookies[i]
                    .replace(/Domain=[^;]+;?/i, '')
                    .replace(/Secure;?/i, '')
                }
              })
            }
          })
        },
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
```

### 24.3 启动流程

```bash
# ===== 后端启动顺序 =====
# 1. MySQL 服务（必须运行）
# 2. BizServer (port 3000)
cd D:/iAGS/tm.iags_biz
node start.js
# 3. PoolingServer (port 3088) — IoT 数据
cd D:/iAGS/tm.iAGS.poolingServer
node start.js

# ===== 前端启动 =====
cd D:/iAGS/iags-vue-frontend
npm run dev
# → http://localhost:5173
```

### 24.4 开发流程

```
1. 启动 iAGS 全套后端（MySQL + BizServer + PoolingServer）
2. 启动 npm run dev（Vite dev server, port 5173）
3. 访问 http://localhost:5173
4. 登录 → Cookie 设置 → Vue 3 外壳渲染
5. 点击菜单：
   - Vue 页面 → 直接渲染 src/pages/v11/ 中的 .vue 组件
   - Legacy 页面 → IframeContainer 加载旧 EasyUI 页面
6. API 调用 → brokerClient → /app/system/broker/getFromBiz → BizServer → MySQL
7. 实时数据 → Socket.IO → useRealtimeBridge → postMessage → iframe
```

---

## 二十五、完整依赖变更清单

| 依赖 | V1.1 使用 | Vue 3 方案变更 | 原因 |
|------|----------|-------------|------|
| `react` / `react-dom` | React 18 | **移除** | Vue 3 替代 |
| `react-router-dom` | React Router v6 | **移除** | Vue Router 4 替代 |
| `zustand` | 状态管理 | **移除** | Pinia 替代 |
| `@radix-ui/*` (10+包) | UI 组件库 | **移除** | Element Plus 替代 |
| `@tanstack/react-query` | React Query | **移除** | @tanstack/vue-query 替代 |
| `lucide-react` | 图标库 | **移除** | lucide-vue-next 替代 |
| `recharts` | 图表库 | **移除** | vue-echarts 替代 |
| `dexie` | IndexedDB | **移除** | 去掉前端缓存 |
| `sql.js` | SQLite 浏览器端 | **移除** | iAGS MySQL 替代 |
| `better-sqlite3` | SQLite 服务端 | **移除** | iAGS MySQL 替代 |
| `jquery` | iAGS 旧系统 | **移除** | Vue 3 替代 |
| `seajs` | iAGS 旧系统 | **移除** | Vite ES Modules 替代 |
| `ejs` | iAGS 旧系统 | **移除** | Vue SFC 替代 |
| `highcharts` | iAGS 旧系统 | **移除** | ECharts 替代 |
| `vue` / `vue-router` / `pinia` | 无 | **新增** | Vue 3 核心 |
| `element-plus` | 无 | **新增** | 统一 UI 组件库 |
| `@element-plus/icons-vue` | 无 | **新增** | Element Plus 图标 |
| `vue-echarts` / `echarts` | 无 | **新增** | 图表解决方案 |
| `lucide-vue-next` | 无 | **新增** | 通用图标库 |
| `@vueuse/core` | 无 | **新增** | Vue Composition 工具集 |
| `@tanstack/vue-query` | 无 | **新增** | Vue Query 缓存 |
| `vue-i18n` | 无 | **新增** | 多语言 |
| `vue-draggable-plus` | 无 | **新增** | 拖拽（看板） |
| `pinia-plugin-persistedstate` | 无 | **新增** | Pinia 持久化 |
| `vue-tsc` | 无 | **新增** | Vue TypeScript 类型检查 |
| `xlsx` / `file-saver` / `jspdf` | 文档处理 | **保留** | 框架无关 |
| `date-fns` | 日期处理 | **保留** | 框架无关 |
| `zod` | 数据验证 | **保留** | 框架无关 |
| `socket.io-client` | 实时通信 | **保留** | 框架无关 |
| `tailwindcss` | CSS 框架 | **保留** | 框架无关 |
| `typescript` | 类型系统 | **保留** | 框架无关 |
| `vite` | 构建工具 | **保留** | 框架无关 |

---

## 附录 A: React → Vue 3 关键语法速查

| React (TSX) | Vue 3 (SFC) | 说明 |
|------------|-------------|------|
| `const [val, setVal] = useState(0)` | `const val = ref(0)` | 状态声明 |
| `setVal(1)` | `val.value = 1` | 更新状态 |
| `useEffect(() => {...}, [dep])` | `watch(dep, () => {...})` | 副作用 |
| `useEffect(() => {...}, [])` | `onMounted(() => {...})` | 挂载 |
| `useMemo(() => x, [dep])` | `computed(() => x)` | 计算属性 |
| `useCallback(fn, [dep])` | 不需要（自动） | 函数缓存 |
| `useRef(null)` | `const el = ref(null)` + `ref="el"` | DOM 引用 |
| `onClick={handler}` | `@click="handler"` | 事件绑定 |
| `{cond && <Comp/>}` | `v-if="cond"` | 条件渲染 |
| `{items.map(i => <Comp/>)}` | `v-for="i in items" :key="i.id"` | 列表渲染 |
| `<div className="flex">` | `<div class="flex">` | CSS 类名 |
| `<Comp prop={val}>` | `<Comp :prop="val">` | 动态属性 |
| `<Comp onSave={fn}>` | `<Comp @save="fn">` | 事件传递 |
| `<Suspense fallback={<Spin/>}>` | `<Suspense><template #fallback><Spin/></template></Suspense>` | 懒加载 |
| `lazy(() => import('./X'))` | `() => import('./X.vue')` | 组件懒加载 |
| `useContext(MyCtx)` | `inject(key)` | 上下文注入 |
| `value={val} onChange={e => setVal(e.target.value)}` | `v-model="val"` | 表单双向绑定 |

---

## 附录 B: 需要废弃的 V1.1 内容

| 文件/模块 | 原有行数 | 废弃原因 |
|-----------|---------|---------|
| `src/components/ui/*` (48 文件) | 6,607 | Element Plus 替代 |
| `src/lib/apiClient.ts` | 403 | brokerClient 替代 |
| Dexie (IndexedDB) 依赖 | — | 不再需要前端缓存 |
| Zustand `persist` middleware | 100 个 Store | Pinia persist 插件替代 |
| Zustand `partialize` | 90 个 Store | Pinia paths 配置替代 |
| 乐观更新逻辑 | 3 个 Store | API 确认模式替代 |
| `src/services/localDataService.ts` | — | 本地数据废弃 |
| `src/services/syncToLocalStorage.ts` | 630 | 同步废弃 |
| `src/services/unifiedCache.ts` | — | 缓存废弃 |
| React/JSX 特定语法 | 266 页 + 752 组件 | Vue SFC 替代 |
| Radix UI 相关依赖 | 10+ 个 npm 包 | Element Plus 替代 |
| React Hooks (useEffect 等) | 散布全局 | Vue Composables 替代 |

## 附录 C: 可复用的 V1.1 内容

| 文件/模块 | 行数 | 处理方式 |
|-----------|------|---------|
| `src/types/*` (29 文件) | 8,389 | 直接复制 |
| `src/lib/utils.ts` 等 | ~5,000 | 直接复制 |
| Zod Schema | ~2,000 | 直接复制 |
| FIELD_MAP / normalize / denormalize | ~3,000 | 直接复制 |
| xlsx/file-saver/jspdf 逻辑 | ~500 | 适配 Vue 事件 |
| socket.io-client 连接 | ~200 | 改写为 composable |
| Store 业务逻辑 | ~12,000 | Pinia 改写（60% 保留） |
| ECharts 配置项 | ~1,500 | 直接复制到 vue-echarts |
| Tailwind 类名 | 散布全局 | 直接复制 |

---

> 规划版本: Vue 方案 V1.1 | 日期: 2026-05-20 | 基于 React 方案(iAGS升级规划方案V1.0)深度对比+细节补充
