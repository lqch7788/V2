# iAGS 前端架构统一升级方案 V1.1

> 制定日期：2026-05-20 | 修订：2026-05-20
> **核心定位**：iAGS 是主体系统，V1.1 是模块来源。统一后只有一个系统——iAGS，前端采用 React + Radix + Tailwind 架构，V1.1 的全部业务模块迁入 iAGS。

---

## 〇、统一策略（两阶段）

### 第一期（现在）：前端统一 + V1.1 接入 iAGS

> **2026-05-20 更新**：API 对接方式从"自建 Express 适配层"优化为"直接使用 iAGS broker 机制"，更符合"iAGS后端不动"原则。

```
V1.1 后端 API 对齐 iAGS → V1.1 系统接入 iAGS 运行 → React 前端统一

当前状态                                    改什么                                    第一期目标
─────────                                ──────────                                ─────────

  iAGS (主体系统)                          iAGS 前端 ✏️                              iAGS 统一前端
  ├── 前端: EasyUI+EJS              →     全重写为 React+Radix                  →   ├── 前端: React 18
  ├── 后端: Foil+MySQL ✔️ 不动              (复用V1.1组件/Store/Service)              │   + Radix UI + Tailwind
  ├── IoT: PoolingServer ✔️ 不动                                                     │   + iAGS 92个页面重写
  ├── broker: getFromBiz/post2Biz ✔️       iAGS 后端 ✔️ 完全不动                      │   + V1.1 业务模块全部迁入
  └── 92个EJS视图                          Fouil框架 + MySQL + broker 原样保留        │
                                            EJS 页面功能 → React 重写                  ├── 后端: Foil框架 ✔️ 不动
  V1.1 (模块来源)                                                                      │   + MySQL ✔️ 不动
  ├── 前端: React+Radix                                                               │   + broker ✔️ 不动
  │   └── 48组件+106Store+79Service →     迁入 iAGS (复制+改用brokerClient)    →     │
  ├── 后端: Express+SQLite                 V1.1 后端 ✏️ 对齐 iAGS                     ├── 数据: iAGS MySQL
  │   (SQLite仅开发测试用)                 ├── SQLite → MySQL (V11_前缀)               │   (V1.1直接读写)
  └── 农业管理15个模块                     ├── API路由 → broker biz文件               │
                                            │   (biz/iAGS/v11/{module}/{action}.m.js)  ├── IoT: PoolingServer
                                            ├── enhancedApiClient → brokerClient       │   原样保留
                                            └── 数据操作 → iAGS MySQL                 │
                                                                                      ├── 认证: iAGS Cookie
                                          IoT 层 ✔️ 不动                               │   (Vite proxy同域)
                                          PoolingServer 原样保留                       │
                                                                                      └── V1.1 repo 归档
```

**API 调用链路对比**：

```
旧方案（Express 适配层，已废弃）:
  React → apiClient → Express:3002 → foilAdapter → BizServer:3000 → MySQL
  问题: 多一层代理，需要维护 JWT↔Session Redis 映射

新方案（broker 直调，采用）:
  React → brokerClient → /app/system/broker/getFromBiz → BizServer:3000 → MySQL
  优势: 零中间层，直接使用 iAGS 已有 broker 机制，Cookie 自动携带
```

### 第二期（以后，待定）：后端架构优化

```
第一期完成后，后端架构是否重构再评估：

现状态                    可选方案A                      可选方案B
────────                  ──────────                    ──────────
Foil 框架                 保持 Foil 不动                逐模块替换为 Express
+ MySQL                   + 仅维护前端 React             + 现代 Node.js LTS
+ Redis                   好处：零风险                    + TypeScript 全栈
                          代价：Node v8 老旧              + 标准 RESTful API
                                                        + 社区生态 + 安全补丁
                                                        - 需要逐个模块重写 .{m}.js

决策时机：第一期完成后，根据实际运维体验和团队资源决定
```

**核心原则**：
- **iAGS 是主体** — 最终 iAGS 统一前端 + 后端，V1.1 repo 归档
- **第一期先接入** — V1.1 后端 API 转为 iAGS broker biz 文件，SQLite→MySQL (V11_前缀)，接入 iAGS 跑起来
- **iAGS 后端不动** — Foil 框架 + MySQL + Redis + broker + IoT PoolingServer 原样保留，零行修改
- **iAGS 前端全重写** — EasyUI+EJS → React+Radix+Tailwind，复用 V1.1 全部组件/Store/Service
- **V1.1 前端迁入 iAGS** — 48组件 + 106Store + 79Service + 67Hook，复制后用 brokerClient 调用 iAGS API
- **认证用 iAGS Cookie** — Vite proxy 同域，Cookie 自动携带，无需 JWT↔Session 桥接
- **第二期再议后端** — 前端全部上线后，根据实际情况决定是否替换 Foil 后端

---

## 一、现状对比

| 维度 | iAGS (主体，当前) | V1.1 (模块来源) | 统一后 (iAGS V2) |
|------|-----------------|----------------|-------------|
| 前端框架 | jQuery EasyUI + EJS 服务端渲染 | React 18 + TypeScript 5.6 + Vite 6 | **React 18 + Vite 6** |
| UI组件 | EasyUI 组件 | Radix UI + Tailwind (48个自研组件) | **Radix UI + Tailwind (48组件)** |
| 模块加载 | SeaJS CMD + 内联脚本 | Vite + ES Modules | **Vite + ES Modules** |
| 后端框架 | 私有 Foil 框架 ✔️ 不改 | Express 4 (开发阶段) | **Foil 框架（保留）** |
| API格式 | Foil MVC 自动路由 + broker | Express RESTful | **broker 直调 (iAGS原生)** |
| 模板引擎 | EJS (92个业务视图) | 无 (全 React CSR) | **无 (全 React CSR)** |
| 数据库 | MySQL (主) + MongoDB + Redis | SQLite (开发测试用) | **MySQL + Redis（iAGS原有）** |
| Node版本 | v8.15.1 (已EOL) | 当前 LTS (v22+) | **当前 LTS (v22+)** |
| 前端状态管理 | 全局变量 + DOM 操作 | Zustand 5 (106Store) + TanStack Query | **Zustand 5 + TanStack Query** |
| API调用 | Foil remote.superagent | apiClient (简洁fetch) + TanStack Query | **apiClient + TanStack Query** |
| IoT通信 | TCP + MQTT ✔️ 不改 | 无 | **TCP + MQTT（保留）** |
| 认证 | Session + RSA | JWT | **JWT（新增）+ Session兼容** |
| 打包构建 | 无 (Seajs 运行时) | Vite + 代码分割 | **Vite + 代码分割** |
| 桌面端 | 无 | Electron 42 | **Electron 42 (可选)** |
| API调用 | Foil remote.superagent | apiClient (简洁fetch) + TanStack Query | **apiClient + TanStack Query** |
| IoT通信 | TCP + MQTT | 无 | **TCP + MQTT (保留)** |
| 认证 | Session + RSA | JWT | **JWT** |
| 打包构建 | 无 (Seajs 运行时) | Vite + 代码分割 | **Vite + 代码分割** |
| 桌面端 | 无 | Electron 42 | **Electron 42 (可选)** |

---

## 二、核心原则

1. **iAGS 是主体** — 最终只有一个系统 iAGS，V1.1 全部模块迁入后其独立 repo 归档
2. **先跑通，后换后端** — 第一期：broker 直调，React 前端通过 iAGS 已有 broker 机制跑起来。第二期：前端全部上线后，Foil 后端逐模块替换为 Express
3. **IoT层不动** — `tm.iAGS.poolingServer` 是经过多年验证的稳定层，TCP/MQTT 通信保持不变
4. **iAGS 前端用 V1.1 架构重写** — 48个 UI 组件、106个 Store、79个 Service、67个 Hooks 直接复用
5. **V1.1 后端对齐 iAGS** — SQLite 仅开发测试用，生产对接到 iAGS MySQL；enhancedApiClient 简化为 apiClient
6. **渐进替换，不停机** — 模块逐个迁移，iframe 做过渡容器，双系统并行
7. **组件模式贯彻** — 所有数据、配置、枚举值从 types/Store 导入，禁止组件内硬编码

---

## 三、新项目结构 (iAGS-v2)

```
D:\iAGS-v2/                              # 新建项目根目录
├── package.json                         # 从 V1.1 复制依赖 + MySQL/Redis 驱动
├── vite.config.ts                       # 从 V1.1 复制 (端口改5189避免冲突)
├── tailwind.config.js                   # 从 V1.1 复制 + iAGS 主题色
├── tsconfig.json                        # 从 V1.1 复制
├── postcss.config.js                    # 从 V1.1 复制
├── index.html                           # 入口 HTML
│
├── src/                                 # ========== 前端 ==========
│   ├── main.tsx                         # 入口 (从 V1.1 复制)
│   ├── App.tsx                          # 统一路由 (V1.1路由 + iAGS新路由)
│   │
│   ├── components/
│   │   ├── ui/                          # [从V1.1完整复制] 48个UI组件
│   │   │   ├── index.ts                 # barrel export
│   │   │   ├── button.tsx / input.tsx / select.tsx / table.tsx
│   │   │   ├── Modal.tsx / UnifiedModal.tsx
│   │   │   ├── DatePicker.tsx / DateRangePicker.tsx / TimePicker.tsx
│   │   │   ├── VirtualTable.tsx / Pagination.tsx / FilterBar.tsx
│   │   │   ├── Tree.tsx / TreeSelect.tsx / Cascader.tsx
│   │   │   ├── GanttChart.tsx / KanbanBoard.tsx / Steps.tsx
│   │   │   ├── Toast.tsx / Alert.tsx / Notification.tsx
│   │   │   ├── Card.tsx / Badge.tsx / Skeleton.tsx / EmptyState.tsx
│   │   │   ├── ImageUploader.tsx / QRCode.tsx / Avatar.tsx
│   │   │   ├── Dialog.tsx / Drawer.tsx / Sheet.tsx / Popover.tsx
│   │   │   ├── Tabs.tsx / Breadcrumb.tsx / Divider.tsx / Space.tsx
│   │   │   ├── Calendar.tsx / Statistic.tsx / Progress.tsx / Timeline.tsx
│   │   │   ├── DropdownMenu.tsx / Tooltip.tsx / Checkbox.tsx
│   │   │   └── Label.tsx / TextArea.tsx / NumberInput.tsx
│   │   │
│   │   ├── layout/                      # [从V1.1完整复制] 布局
│   │   │   ├── MainLayout.tsx           # Sidebar + Header (业务页面)
│   │   │   ├── SimpleLayout.tsx         # 仅 Header (设置/个人中心)
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   │
│   │   ├── farm/                        # [从V1.1完整复制] 农业管理15个模块
│   │   │   ├── agriculture/             # 农事操作记录
│   │   │   ├── crop-variety/            # 作物品种库
│   │   │   ├── fertilizer/              # 施肥管理
│   │   │   ├── harvest/                 # 采收管理
│   │   │   ├── hub/                     # 农场任务枢纽 (FarmHub)
│   │   │   ├── inspection/              # 巡查反馈
│   │   │   ├── instance/                # 作物实例
│   │   │   ├── order/                   # 作物订单
│   │   │   ├── planting/                # 种植管理
│   │   │   ├── problemDispatch/         # 问题调度
│   │   │   ├── seed-source/             # 种子来源
│   │   │   ├── seedling/                # 育苗管理
│   │   │   ├── taskCenter/              # 任务中心
│   │   │   ├── taskDispatch/            # 任务分派
│   │   │   └── trace/                   # 溯源
│   │   │
│   │   ├── labor/                       # [从V1.1完整复制] 劳动力管理
│   │   ├── material/                    # [从V1.1完整复制] 物资管理
│   │   ├── materialReceiving/           # [从V1.1完整复制] 领料管理
│   │   ├── materialReturn/              # [从V1.1完整复制] 退料管理
│   │   ├── dispatch/                    # [从V1.1完整复制] 调度
│   │   ├── production/                  # [从V1.1完整复制] 生产
│   │   ├── warehouse/                   # [从V1.1完整复制] 仓库
│   │   ├── summary/                     # [从V1.1完整复制] 汇总分析
│   │   ├── approval/                    # [从V1.1完整复制] 审批流
│   │   ├── dashboard/                   # [从V1.1完整复制] 仪表盘
│   │   ├── indicators/                  # [从V1.1完整复制] 指标
│   │   ├── settings/                    # [从V1.1完整复制] 设置
│   │   ├── common/                      # [从V1.1完整复制] 通用业务组件
│   │   │
│   │   └── iags/                        # [新建] iAGS 特有业务组件
│   │       ├── curve/                   # 曲线图表 (实时/历史/设备/能耗/施肥/灌溉)
│   │       ├── control/                 # 设备控制面板 (遮阳/喷雾/水肥/风机等)
│   │       ├── warning/                 # 告警中心 (实时告警/历史告警/告警配置)
│   │       ├── camera/                  # 摄像头 (实时预览/回放/截图)
│   │       ├── energy/                  # 能耗监控 (水/电/气/热)
│   │       ├── intelligent/             # 智能控制 (规则引擎/联动策略)
│   │       ├── threed/                  # 3D温室可视化 (Three.js)
│   │       ├── report/                  # 报表 (环控/能耗/灌溉/肥料/产量)
│   │       ├── administration/          # 行政管理 (种子/育苗/采购/区域种植)
│   │       └── home/                    # iAGS首页 (温室概览+实时数据卡片)
│   │
│   ├── pages/                           # ========== 页面 ==========
│   │   ├── iags/                        # [新建] iAGS 特有页面
│   │   │   ├── IagsHomePage.tsx         # 首页仪表盘
│   │   │   ├── CurvePage.tsx            # 曲线中心
│   │   │   ├── ControlPage.tsx          # 设备控制
│   │   │   ├── WarningPage.tsx          # 告警中心
│   │   │   ├── CameraPage.tsx           # 摄像头管理
│   │   │   ├── EnergyPage.tsx           # 能耗管理
│   │   │   ├── IntelligentPage.tsx      # 智能控制
│   │   │   ├── ThreeDPage.tsx           # 3D温室
│   │   │   ├── ReportPage.tsx           # 报表中心
│   │   │   └── AdministrationPage.tsx   # 行政管理
│   │   │
│   │   ├── Dashboard/                   # [从V1.1复制]
│   │   ├── farm/                        # [从V1.1复制]
│   │   ├── crop/                        # [从V1.1复制]
│   │   ├── labor/                       # [从V1.1复制]
│   │   ├── material/                    # [从V1.1复制]
│   │   ├── summary/                     # [从V1.1复制]
│   │   ├── system/                      # [从V1.1复制] (iAGS集成11模块)
│   │   ├── authority/                   # [从V1.1复制]
│   │   ├── approval/                    # [从V1.1复制]
│   │   ├── hr/                          # [从V1.1复制]
│   │   ├── warehouse/                   # [从V1.1复制]
│   │   └── [约80个散页文件]             # [从V1.1复制]
│   │
│   ├── stores/                          # ========== 状态管理 ==========
│   │   ├── index.ts                     # [从V1.1复制] barrel export
│   │   ├── [约100个Store文件]           # [从V1.1完整复制]
│   │   └── iags/                        # [新建] iAGS 特有 Store
│   │       ├── useCurveStore.ts          # 曲线数据
│   │       ├── useRealtimeDataStore.ts   # 实时监测数据
│   │       ├── useDeviceControlStore.ts  # 设备控制状态
│   │       ├── useWarningStore.ts        # 告警数据
│   │       ├── useCameraStore.ts         # [已有，从V1.1 system复制]
│   │       ├── useEnergyStore.ts         # 能耗数据
│   │       ├── useIntelligentStore.ts    # 智能控制规则
│   │       ├── useThreeDStore.ts         # 3D场景状态
│   │       └── useIagsReportStore.ts     # iAGS报表数据
│   │
│   ├── services/                        # ========== API服务层 ==========
│   │   ├── [约75个Service文件]          # [从V1.1完整复制]
│   │   ├── apiClient.ts                 # [从V1.1复制] 基础fetch客户端
│   │   └── iags/                        # [新建] iAGS 特有 Service
│   │       ├── apiCurveService.ts
│   │       ├── apiRealtimeService.ts
│   │       ├── apiDeviceControlService.ts
│   │       ├── apiWarningService.ts
│   │       ├── apiCameraService.ts
│   │       ├── apiEnergyService.ts
│   │       ├── apiIntelligentService.ts
│   │       └── apiIagsReportService.ts
│   │
│   ├── hooks/                           # ========== Hooks ==========
│   │   ├── [约65个Hook文件]             # [从V1.1完整复制]
│   │   └── iags/                        # [新建] iAGS 特有 Hooks
│   │       ├── useRealtimeConnection.ts  # WebSocket 实时数据连接
│   │       ├── useDeviceCommand.ts       # 设备命令下发
│   │       ├── useHistoricalData.ts      # 历史数据查询
│   │       └── useThreedInteraction.ts   # 3D场景交互
│   │
│   ├── types/                           # ========== 类型定义 ==========
│   │   ├── [约20个类型文件]             # [从V1.1完整复制]
│   │   └── iags/                        # [新建] iAGS 特有类型
│   │       ├── curve.ts                 # 曲线数据类型
│   │       ├── device.ts                # 设备类型
│   │       ├── warning.ts               # 告警类型
│   │       ├── energy.ts                # 能耗类型
│   │       ├── iot.ts                   # IoT协议数据类型
│   │       └── intelligent.ts           # 智能控制类型
│   │
│   │   @tanstack/react-query             # [已有] TanStack Query v5
│   │
│   ├── services/                        # ========== API服务层 ==========
│   │   ├── brokerClient.ts              # [新建] iAGS broker 统一客户端 (~90行)
│   │   │                                #   核心: brokerGet / brokerPost / brokerPut / brokerDelete
│   │   │                                #   路径: /app/system/broker/getFromBiz + post2Biz
│   │   │                                #   认证: credentials: 'include' (Cookie自动携带)
│   │   ├── realtimeBridge.ts            # [新建] Socket.IO 实时数据桥接
│   │   │                                #   统一管理 Socket.IO 连接 → postMessage 转发给 iframe
│   │   ├── [约75个Service文件]          # [从V1.1完整复制]
│   │   └── iags/                        # [新建] iAGS 特有 Service
│   │       ├── apiCurveService.ts
│   │       ├── apiRealtimeService.ts
│   │       ├── apiDeviceControlService.ts
│   │       ├── apiWarningService.ts
│   │       ├── apiCameraService.ts
│   │       ├── apiEnergyService.ts
│   │       ├── apiIntelligentService.ts
│   │       └── apiIagsReportService.ts
│   │
│   ├── lib/                             # ========== 工具库 ==========
│   │   ├── apiClient.ts                 # [从V1.1简化] 简洁 apiClient (~80行)
│   │   ├── queryClient.ts              # TanStack Query 配置
│   │   ├── staleTimes.ts               # [新建] 缓存策略常量
│   │   ├── utils.ts                     # [从V1.1复制] 通用工具函数
│   │   └── validators.ts               # [从V1.1复制] Zod 验证 schemas
│   │
│   └── contexts/                        # [从V1.1复制] React Context
│       └── ...
│
│   ⚠️ 以下 iAGS 原有后端组件保持不动（零行修改）:
│   ├── tm.iags_biz/                     # iAGS 业务逻辑层 (不动)
│   │   └── biz/iAGS/v11/                # [新建] V1.1 业务对应的 broker biz 文件
│   │       ├── crop/                    #   getVarietyList.{m}.js, saveVariety.{m}.js ...
│   │       ├── material/                #   getMaterialList.{m}.js, ...
│   │       ├── labor/                   #   getAttendanceList.{m}.js, ...
│   │       ├── approval/                #   ...
│   │       ├── summary/                 #   ...
│   │       └── system/                  #   ...
│   ├── yujiang.foil.node/               # Foil 核心框架 (不动)
│   ├── yujiang.foil.node.bizserver/     # Biz 服务器 (不动, 端口3000)
│   ├── yujiang.foil.node.webserver/     # Web 服务器 (逐步废弃，被 React 替代)
│   └── tm.iAGS.poolingServer/           # IoT 设备通信 (不动)
│
├── electron/                            # [从V1.1复制] Electron 桌面端 (可选)
│   └── main.cjs
│
├── shared/                              # 共享资源 (两系统最终合并用)
│   └── types/                           # 跨项目共享类型
│       ├── api.ts                       # API 请求/响应统一类型
│       ├── entity.ts                    # 核心实体类型
│       └── iot.ts                       # IoT 数据类型
│
└── public/                              # 静态资源
    └── favicon.ico
```

---

## 四、分阶段实施路线图（6个月 / 24周）

### 阶段0：基础搭建（第1-2周）

**目标**：项目骨架跑通，V1.1 页面能在新项目中正常渲染，brokerClient 调通 iAGS 后端

```
Week 1: 项目初始化
  ├── [Day1-2] 创建 D:\iAGS-v2 项目目录
  ├── [Day1-2] 从 V1.1 复制 package.json / vite.config.ts / tailwind / tsconfig / postcss
  ├── [Day2-3] 从 package.json 移除 dexie (SQLite仅V1.1开发用, 生产不用)
  ├── [Day2-3] npm install，验证构建通过
  ├── [Day3-5] 从 V1.1 完整复制 src/components/ui/ (48个组件)
  ├── [Day3-5] 从 V1.1 复制 src/components/layout/ (MainLayout, SimpleLayout)
  ├── [Day4-5] 从 V1.1 复制 src/lib/ (apiClient, queryClient, utils, validators)
  ├── [Day5]   编写 brokerClient.ts: iAGS broker 统一客户端 (~90行)
  │            - brokerGet:  GET → /app/system/broker/getFromBiz?bizURLParams=["iAGS","module","action"]
  │            - brokerPost: POST → /app/system/broker/post2Biz
  │            - credentials: 'include' (Cookie 自动携带，无需 JWT 桥接)
  └── [Day5]   验证: 空 App 启动，UI 组件库渲染正常，brokerClient 调通 iAGS 后端

Week 2: 后端对接 (iAGS 后端不动，仅新建 biz 文件 + 数据库)
  ├── [Day1-2] 编写 broker biz 文件模板，验证第一个 biz 文件跑通
  │           biz/iAGS/v11/crop/getVarietyList.{m}.js
  ├── [Day2-3] 在 iAGS MySQL 中创建 V11_ 前缀表（建表脚本）
  ├── [Day3-4] 实现登录页对接 iAGS Cookie 认证
  │           POST /app/account/login → Set-Cookie → 后续请求自动携带
  ├── [Day4-5] 编写 V1.1 核心业务对应的 biz 文件（按模块分类）
  ├── [Day5]   验证: 登录 → brokerGet 调用 iAGS API → 数据正确返回
  └── [Day5]   iAGS Fouil 后端 0 行修改，broker 机制原样复用

关键决策：
  - iAGS 后端 (Foil + MySQL + Redis + broker) 完全不动，0 行代码修改
  - 前端通过 brokerClient 直接调用 iAGS 已有 broker 接口
  - 认证使用 iAGS 原生 Cookie (Vite proxy 同域，自动携带)
  - V1.1 独有业务逻辑写成 broker biz 文件，放入 biz/iAGS/v11/ 命名空间
  - iAGS MySQL 数据库原样使用，V1.1 独有表加 V11_ 前缀

---

### 阶段1：架构对齐 — V1.1 全部模块迁移（第3-5周）

**目标**：V1.1 所有业务模块在新系统运行，全部通过适配器调用 iAGS 后端

```
Week 3: 前端全部迁移
  ├── 从 V1.1 完整复制 src/stores/ (106个Store)
  ├── 从 V1.1 完整复制 src/services/ (79个Service)
  ├── 从 V1.1 完整复制 src/hooks/ (67个Hook)
  ├── 从 V1.1 完整复制 src/types/ (20个类型文件)
  ├── 从 V1.1 完整复制 src/components/farm/ (15个模块)
  ├── 从 V1.1 完整复制 src/components/labor/ (全部)
  ├── 从 V1.1 完整复制 src/components/material/ (全部)
  ├── 从 V1.1 完整复制 src/components/dashboard/ charts/ cards/ modals/ tables/
  ├── 从 V1.1 完整复制其他业务组件 (approval, warehouse, summary, indicators...)
  ├── 从 V1.1 完整复制 src/pages/ (200+页面文件)
  └── 从 V1.1 完整复制 src/contexts/

Week 4-5: 路由 & 集成验证
  ├── 编写 App.tsx 统一路由 (V1.1 85路由 + iAGS 新路由占位)
  ├── 配置 Vite proxy: /app → localhost:3000 (iAGS BizServer)
  ├── Store 改造: enhancedApiClient → brokerClient 调用 iAGS broker
  ├── 逐个验证 V1.1 核心模块运行:
  │   ├── 作物品种库 → 育苗 → 种植 → 采收 → 施肥 (完整种植周期)
  │   ├── 农场任务枢纽 + 巡查 + 问题调度
  │   ├── 劳动力管理 (考勤/工资/绩效/招聘)
  │   ├── 物资管理 (申请/执行/统计/退料)
  │   ├── 审批流 (工作流配置 → 提交 → 审批)
  │   ├── 仪表盘 (数据看板/图表)
  │   └── 系统设置 (用户/角色/权限/字典)
  ├── iAGS 特有路由预留占位 (CurvePage, ControlPage...)
  └── 验证: 所有 V1.1 页面可用，数据通过 MySQL API 正确读写
```

**交付物**：
- 新系统 = V1.1 全部功能 + MySQL 数据库
- V1.1 已有模块零修改跑通
- 为 iAGS 特有页面预留了路由和目录结构

---

### 阶段2：iAGS 核心业务模块逐个重写（第6-16周）

按业务价值排序，优先重写 iAGS 的高频使用页面。

#### Week 6-7: 用户认证 & 权限系统

```
  ├── [复用V1.1] Login 页面 (JWT登录，替换旧Session登录)
  ├── [复用V1.1] 用户管理 / 角色管理 / 权限配置 (authority/)
  ├── [复用V1.1] OrganizationManagement (组织架构)
  ├── [复用V1.1] UserPermissionHub (权限统一管理)
  ├── [新建] iAGS 多组织/多基地权限树适配
  ├── [新建] 14套主题 → Tailwind CSS变量主题系统
  │   └── 每套主题定义: 主色/辅色/字体/圆角/阴影 CSS变量集
  ├── [适配] 旧Foil Session → 新JWT Token 无感切换
  └── 切换: 旧登录页 → 新JWT登录页 (灰度: 部分用户先切)
```

#### Week 8-9: 首页仪表盘 (iAGS最高频入口)

```
  ├── [新建] IagsHomePage (React组件)
  │   ├── 顶部: 温室状态概览卡片行 (温度/湿度/CO2/光照/土壤)
  │   ├── 中部: 实时环境数据曲线缩略图
  │   ├── 中部: 设备运行状态网格 (风机/遮阳/喷雾/水肥)
  │   ├── 底部: 最新告警列表 (滚动)
  │   └── 底部: 今日任务/农事安排
  ├── [复用V1.1] Statistic 统计数值组件
  ├── [复用V1.1] Card 卡片容器
  ├── [复用V1.1] Alert 告警组件
  ├── [新建] GreenhouseStatusCard (温室综合状态卡片)
  ├── [新建] DeviceStatusGrid (设备状态网格)
  ├── [新建] RealtimeEnvCard (实时环境数据卡片)
  ├── [新建] useIagsHomeStore (首页数据聚合Store)
  └── API: GET /api/iags/home/summary 聚合首页全部数据
```

#### Week 10-11: 曲线/环境监控 (iAGS最高频功能页面)

```
  ├── [新建] CurvePage (曲线中心主页面)
  │   ├── 左侧: 温室/传感器选择器 (TreeSelect 或 Cascader)
  │   ├── 顶部工具栏: 时间范围 (DateRangePicker) + 刷新 + 导出
  │   ├── 主区: Recharts 多线曲线图 (温度/湿度/CO2/光照 同时显示)
  │   └── 底部: 数据表格 (时间段内统计: 最高/最低/平均)
  ├── [新增子页面] 设备运行曲线 / 能耗曲线 / 施肥曲线 / 灌溉曲线 / 历史曲线对比
  ├── [复用V1.1] DateRangePicker (时间范围选择)
  ├── [复用V1.1] VirtualTable (大数据量传感器列表)
  ├── [复用V1.1] TreeSelect (温室/区域/设备树选择)
  ├── [复用V1.1] FilterBar (快速筛选项)
  ├── [新建] SensorSelector (传感器多选组件)
  ├── [新建] MultiLineChart (多Y轴曲线组件, Recharts封装)
  ├── [新建] CurveStatTable (曲线统计表格)
  ├── [新建] useCurveStore (曲线查询条件+数据+缓存)
  ├── [新建] useRealtimeDataStore (实时推送数据)
  ├── [新建] useRealtimeConnection Hook (WebSocket实时数据订阅)
  ├── [新建] apiCurveService (历史数据查询API)
  ├── [新建] apiRealtimeService (实时数据推送API)
  ├── API: GET /api/iags/curves/historical?greenhouseId=&sensorIds=&start=&end=&interval=
  ├── API: GET /api/iags/curves/realtime?greenhouseId=&sensorIds=
  ├── WebSocket: ws://host/iags/realtime (订阅实时数据推送)
  └── 数据源: IoT PoolingServer → iAGS BizServer → foilAdapter → Store → Recharts

  对应 iAGS 旧页面:
  - tm.iags_web/app/iAGS/curve/showCurve.{v}.ejs → 全部重写为 React
  - 子视图: realtimeCurve, historyCurve, deviceRunCurve, energyCurve, fertilizerCurve
```

#### Week 12-13: 告警中心

```
  ├── [新建] WarningPage (告警中心主页面)
  │   ├── 实时告警面板 (Socket推送, 顶部横幅 + 声音提醒)
  │   ├── 告警列表: FilterBar (级别/时间/类型/状态) + VirtualTable
  │   ├── 告警详情侧滑面板 (Sheet/Drawer): 触发时间/指标/处置建议
  │   ├── 告警处理流程: 确认 → 处理中 → 已解决 → 关闭
  │   └── 告警统计: 今日告警数/处理率/响应时间 (Statistic组件)
  ├── [新建] AlertConfigPage (告警规则配置)
  │   ├── 规则列表: 监控指标/阈值/通知方式/生效时段
  │   └── 规则编辑表单: Modal + FormField
  ├── [复用V1.1] useAlarmConfigStore (已有, system/ 下)
  ├── [复用V1.1] VirtualTable + Pagination + FilterBar
  ├── [复用V1.1] Sheet + Modal + Badge + Statistic
  ├── [复用V1.1] Toast/Notification 通知组件
  ├── [新建] useWarningStore (告警列表+实时告警)
  ├── [新建] useAlertRuleStore (告警规则CRUD)
  ├── [新建] WarningSoundPlayer (浏览器声音提醒)
  ├── API: GET /api/iags/warnings (告警列表)
  ├── API: POST /api/iags/warnings/:id/acknowledge (确认告警)
  ├── API: POST /api/iags/warnings/:id/resolve (解决告警)
  ├── API: CRUD /api/iags/alert-rules (告警规则)
  └── WebSocket: 实时告警推送

  对应 iAGS 旧页面:
  - tm.iags_web/app/iAGS/warning/showWarning.{v}.ejs
  - tm.iags_web/app/iAGS/warning/ 下全部子视图
```

#### Week 14-15: 设备管理

```
  ├── [新建] DevicePage (设备管理主页)
  │   ├── 设备分类Tab: 环控/遮阳/喷雾/水肥/风机/卷帘/...
  │   ├── 设备列表: Table + 状态Badge (在线/离线/故障)
  │   ├── 设备详情: Drawer (运行参数/历史数据/维护记录)
  │   └── 设备控制: 启停/参数调节 (Modal确认)
  ├── [新建] DeviceControlPanel (设备控制面板)
  │   ├── 开关按钮组 (带确认的 Button + Dialog)
  │   ├── 参数滑块 (NumberInput / Slider)
  │   └── 控制日志 (时间线 Timeline)
  ├── [复用V1.1] useDeviceSystemStore (已有, system/ 下)
  ├── [复用V1.1] Tabs + Table + Badge + Drawer + Modal
  ├── [复用V1.1] Timeline (控制日志时间线)
  ├── [复用V1.1] NumberInput (参数输入)
  ├── [新建] useDeviceControlStore (设备状态+控制指令)
  ├── [新建] useDeviceCommand Hook (指令下发+状态轮询)
  ├── API: GET /api/iags/devices (设备列表)
  ├── API: GET /api/iags/devices/:id/status (设备实时状态)
  ├── API: POST /api/iags/devices/:id/control (下发控制指令)
  └── 控制链路: React前端 → foilAdapter → poolingServer HTTP → TCP → 物理设备

  对应 iAGS 旧页面:
  - tm.iags_web/app/iAGS/device/showDevice.{v}.ejs
  - tm.iags_web/app/iAGS/control/showControl.{v}.ejs
```

#### Week 16: 摄像头 & 能耗

```
  ├── [新建] CameraPage (摄像头管理)
  │   ├── 摄像头网格布局 (Grid/画廊模式)
  │   ├── 单个摄像头全屏预览 (Modal)
  │   ├── 云台控制 (方向按钮+变焦)
  │   └── 截图/录像回放
  ├── [复用V1.1] useCameraStore (已有, system/ 下)
  ├── [复用V1.1] Modal (全屏预览)
  ├── [新建] CameraGrid (摄像头网格组件)
  ├── [新建] PTZController (云台控制组件)
  │
  ├── [新建] EnergyPage (能耗管理)
  │   ├── 能耗概览: 今日/本月/本年 水/电/气/热 统计卡片
  │   ├── 能耗曲线: Recharts 柱状图+折线图
  │   ├── 能耗对比: 同期对比/环比 (Statistic + 趋势箭头)
  │   └── 分表管理: 各区域/设备独立计量
  ├── [复用V1.1] useEnergyConfigStore (已有, system/ 下)
  ├── [新建] EnergyOverview (能耗概览组件)
  ├── [新建] EnergyCompareChart (能耗对比图表)
  ├── [新建] useEnergyStore (能耗数据Store)
  └── API: GET /api/iags/energy/* (能耗查询)

  对应 iAGS 旧页面:
  - tm.iags_web/app/iAGS/camera/showCamera.{v}.ejs
  - tm.iags_web/app/iAGS/energy/showEnergy.{v}.ejs
```

---

### 阶段3：农业管理模块完整对接（第17-20周）

V1.1 已有完整实现的农业管理模块，直接对接 iAGS 真实数据。

#### Week 17-18: 种植全周期管理

```
  ├── [复用V1.1] SeedSourcePage → 对接 iAGS 种子来源数据
  │   └── Store数据源: SQLite种子 → MySQL iAGS种子表
  ├── [复用V1.1] SeedlingPage → 对接 iAGS 育苗数据
  │   └── 关联 iAGS 温室/苗床实际位置
  ├── [复用V1.1] PlantingPage → 对接 iAGS 定植数据
  │   └── 关联 iAGS 种植区域/地块 (已有FarmPartitionStore)
  ├── [复用V1.1] HarvestPage → 对接 iAGS 采收数据
  │   └── 对接产量统计 + 品质分级
  ├── [复用V1.1] FertilizerPage → 对接 iAGS 水肥一体机数据
  │   └── 对接施肥记录 + EC/pH监测
  ├── [复用V1.1] CropVarietyTree → 对接 iAGS 品种库
  └── [复用V1.1] 作物实例/订单管理系统

  对应 iAGS 旧模块:
  - tm.iags_web/app/iAGS/administration/ 下全部子模块
  - 种子管理 (seedManage)
  - 育苗管理 (seedlingManage)
  - 采购管理 (purchaserManagement)
  - 区域种植 (regionalplanting)
```

#### Week 19: 任务调度 & 问题管理

```
  ├── [复用V1.1] FarmHubPage → 替换 iAGS more/morechild 下20+子页面
  │   ├── AreaCropsManage → V1.1 区域作物管理
  │   ├── Camera → V1.1 摄像头 (已有)
  │   ├── DeviceWarning → V1.1 告警 (新建, Week12-13)
  │   ├── Fertilize → V1.1 施肥 (已有)
  │   ├── Parameter → V1.1 参数配置 (已有)
  │   ├── Spray → 新建喷雾控制 (Week14-15)
  │   ├── Water → 新建灌溉控制 (Week14-15)
  │   └── ... 其余12个子页面逐一映射
  ├── [复用V1.1] TaskCenterPage → iAGS 任务中心
  ├── [复用V1.1] ProblemDispatchPage → iAGS 问题调度
  ├── [复用V1.1] DailyWorkSummary → iAGS 日报总结
  └── 全部对接到 iAGS 人员/组织/基地数据

  对应 iAGS 旧模块:
  - tm.iags_web/app/iAGS/more/morechild/ (20+子模块, 全部替换)
  - 旧 SeaJS 模块加载 → Vite ES Modules (打包优化)
```

#### Week 20: 报表 & 履历

```
  ├── [复用V1.1] SummaryOverview → iAGS 报表总览
  ├── [复用V1.1] BusinessAnalysis → iAGS 业务分析
  ├── [复用V1.1] BatchManagement → iAGS 批次管理
  ├── [复用V1.1] ProblemSummary → iAGS 问题汇总
  ├── [复用V1.1] yield/cost/labor analysis → iAGS 产量/成本/用工分析
  │
  ├── [新建] iAGS 特有报表页面
  │   ├── EnergyReport (能耗报表: 日/周/月/年)
  │   ├── EnvironmentReport (环控报表: 温湿度统计/超限分析)
  │   ├── IrrigationReport (灌溉报表: 用水量/肥料量/EC/pH)
  │   └── DeviceReport (设备报表: 运行时长/故障率/维护记录)
  │
  ├── [新建] ResumePage (种植履历) → V1.1 TraceabilityPage 扩展
  │   ├── 完整种植周期履历查询 (从育苗到采收)
  │   ├── 农事操作时间线 (Timeline组件)
  │   └── 投入品追溯 (种子/肥料/农药来源)
  │
  ├── [复用V1.1] Recharts → 替换 Highcharts 全部图表
  ├── [复用V1.1] Timeline, Statistic, Table, DateRangePicker
  ├── [新建] 报表导出功能 (xlsx → Excel, jspdf → PDF, docx → Word)
  └── [复用V1.1] 已有的 docx/xlsx/jspdf 依赖

  对应 iAGS 旧模块:
  - tm.iags_web/app/iAGS/report/ (全部报表)
  - tm.iags_web/app/iAGS/resume/ (全部履历)
  - Highcharts 图表 → Recharts 图表 (全部替换)
```

---

### 阶段4：高级功能 & 收尾上线（第21-24周）

#### Week 21-22: 智能控制 & 3D 温室

```
  ├── [新建] IntelligentPage (智能控制主页面)
  │   ├── 控制规则列表: Table (规则名称/条件/动作/生效时间/状态)
  │   ├── 规则编辑器: Modal + FormField
  │   │   ├── 条件编辑器: 指标选择 + 比较符 + 阈值
  │   │   ├── 动作编辑器: 设备选择 + 动作类型 + 参数
  │   │   └── 时间计划: 生效时段 + 优先级
  │   ├── 联动策略: 多个规则组合 (温度过高→遮阳+喷雾+风机)
  │   └── 模拟预览: 规则触发模拟
  ├── [新建] IntelligentRuleEditor (规则可视化编辑器)
  ├── [新建] useIntelligentStore (规则CRUD + 执行日志)
  ├── API: CRUD /api/iags/intelligent/rules
  ├── API: POST /api/iags/intelligent/rules/:id/test (测试规则)
  │
  ├── [新建] ThreeDPage (3D温室可视化)
  │   ├── 从 iAGS 迁移 Three.js 模型和场景 (client/3D/)
  │   ├── React 组件封装: <ThreeDGreenhouse greenhouseId={} />
  │   ├── 实时数据映射: 传感器值 → 3D模型颜色/透明度/动画
  │   ├── 交互: 点击设备→弹出控制面板, 点击区域→显示详情
  │   └── 多温室切换
  ├── [新建] ThreeDGreenhouse (Three.js React封装组件)
  ├── [新建] useThreeDStore (3D场景状态)
  ├── [新建] useThreedInteraction Hook (3D点击/悬停交互)
  └── 依赖: three (从 iAGS client/3D/ 迁移)

  对应 iAGS 旧模块:
  - tm.iags_web/app/iAGS/intelligentcontrol/ (智能控制)
  - tm.iags_web/app/iAGS/3D/index.{v}.ejs (3D温室)
  - tm.iags_web/client/3D/ (Three.js资源)
```

#### Week 23: 系统设置 & 数据管理

```
  ├── [复用V1.1] Settings 全部设置页面 (system/ 下11个模块)
  │   ├── FarmPartitionManagement (园区分区)
  │   ├── AreaSystemManagement (区域系统)
  │   ├── DeviceSystemManagement (设备系统)
  │   ├── CameraManagement (摄像头)
  │   ├── EnergyConfigManagement (能耗配置)
  │   ├── AlarmConfigManagement (告警配置)
  │   ├── WaterFertilizerManagement (水肥管理)
  │   ├── PlantSettingManagement (种植设置)
  │   ├── DeviceDistributionManagement (设备分布)
  │   └── ProjectDebugManagement (项目调试)
  ├── [复用V1.1] SystemConfig / DictionaryManagement
  ├── [新建] IotProtocolConfig (IoT协议配置)
  ├── [新建] FirmwareManagement (设备固件管理)
  ├── [新建] BackupRecovery (MySQL备份恢复)
  │   └── mysqldump 自动备份 + 定时任务
  ├── [新建] MultiLanguageManagement (多语言词条管理)
  └── [新建] OperationLogPage (操作审计日志)

  对应 iAGS 旧模块:
  - tm.iags_web/app/iAGS/systemset/showSystemset.{v}.ejs
  - tm.iags_biz/biz/system/ 下全部配置
```

#### Week 24: 全量测试 & 正式上线

```
  ├── [Day1-3] 功能回归测试
  │   ├── iAGS 全部核心业务流程端到端验证
  │   ├── V1.1 已有模块在新系统兼容性验证
  │   ├── IoT设备通信链路验证
  │   └── 数据迁移完整性抽样检查
  │
  ├── [Day4-5] 性能压测
  │   ├── API 并发压测 (对比旧系统)
  │   ├── 前端首屏加载时间
  │   ├── 大数据量曲线图渲染性能
  │   └── WebSocket 实时数据推送延迟
  │
  ├── [Day6-7] 灰度上线
  │   ├── 选择1-2个低风险温室先切新系统
  │   ├── 旧系统保持只读运行
  │   ├── 监控错误日志 + 用户反馈
  │   └── 灰度比例: 10% → 30% → 60% → 100%
  │
  ├── [Day8-9] 全量切换
  │   ├── 所有用户切换到新系统
  │   ├── 旧系统保留30天回滚窗口 (只读)
  │   └── 数据同步: 新系统 → 旧系统 (回滚用)
  │
  └── [Day10] 清理 & 文档
      ├── 旧系统归档 (备份后下线)
      ├── 运维文档更新 (部署/备份/监控)
      └── 开发文档更新 (组件库/Store标准/API规范)
```

---

## 五、技术对接方案 (关键难点)

### 5.1 API 对接：V1.1 前端 → iAGS broker 直调

> **2026-05-20 更新**：废弃 Express 适配层方案，改为直接使用 iAGS 已有的 broker 机制。这是 iAGS 原生支持的 API 调用方式，零中间层。

**核心策略**：iAGS 后端 Fouil 框架 + MySQL + broker 完全不动。V1.1 的 React 前端通过 `brokerClient` 直接调用 iAGS broker 接口。

```
V1.1 React 前端                     iAGS broker (已有)              iAGS BizServer (不动)
(brokerClient)                  (getFromBiz / post2Biz)             (Foil MVC + MySQL)
        │                              │                              │
        ├── brokerGet(                 │                              │
        │     ['iAGS','v11Crop',       │                              │
        │      'getVarietyList'],      │                              │
        │     { page:1, pageSize:20 }  │                              │
        │   )                          │                              │
        └──────────────→  GET /app/system/broker/getFromBiz          │
                          ?bizURLParams=["iAGS","v11Crop","getVarietyList"]
                          &data={"page":1,"pageSize":20}             │
                          credentials: 'include' (Cookie自动携带)     │
                                   │                                  │
                                   └──────────────────────────────→   │
                                   │    biz/iAGS/v11/crop/            │
                                   │    getVarietyList.{m}.js         │
                                   │    → yjDBService.query(...)      │
                                   │    → MySQL                       │
                                   │                                  │
                                   │ { code:0, msg:"ok",              │
                                   │   data: { rows:[...], total } }  │
                                   ←──────────────────────────────   │
        { rows:[...],             │                                   │
          total:100 }  ←───────────│                                   │
```

**iAGS broker 接口格式（已有，不动）**：
```
GET  /app/system/broker/getFromBiz?bizURLParams=["模块","子模块","动作"]&data={查询参数}
POST /app/system/broker/post2Biz  Body: { bizURLParams: [...], data: {...} }

响应格式: { code: 0, msg: "操作成功", data: { rows: [...], total: 100 } }
```

**brokerClient 实现（约90行，零中间层）**：

```typescript
// src/services/brokerClient.ts — iAGS broker 统一客户端
// 直接使用 iAGS 已有 broker 机制，无需自建代理层

const IAGS_BASE = '/app/system/broker';

interface BrokerResponse<T> {
  code: number;
  msg: string;
  data?: { rows?: T[]; total?: number; [key: string]: any };
}

/**
 * GET 请求（通过 broker getFromBiz）
 * @param bizParams bizURLParams 三段式数组 ["iAGS","module","action"]
 * @param query URL 查询参数
 */
export async function brokerGet<T>(
  bizParams: string[],
  query: Record<string, any> = {}
): Promise<{ rows: T[]; total: number }> {
  const sp = new URLSearchParams();
  sp.set('bizURLParams', JSON.stringify(bizParams));
  sp.set('data', JSON.stringify(query));

  const res = await fetch(`${IAGS_BASE}/getFromBiz?${sp.toString()}`, {
    credentials: 'include', // Cookie 自动携带，无需 JWT 桥接
  });

  if (!res.ok) {
    throw new Error(`Broker GET failed: ${res.status} ${res.statusText}`);
  }

  const json: BrokerResponse<T> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.msg || '请求失败');
  }

  return {
    rows: json.data?.rows || [],
    total: json.data?.total || 0,
  };
}

/**
 * POST 请求（通过 broker post2Biz）
 */
export async function brokerPost<T>(
  bizParams: string[],
  data: Record<string, any> = {}
): Promise<T> {
  const res = await fetch(`${IAGS_BASE}/post2Biz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ bizURLParams: bizParams, data }),
  });

  if (!res.ok) {
    throw new Error(`Broker POST failed: ${res.status} ${res.statusText}`);
  }

  const json: BrokerResponse<T> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.msg || '请求失败');
  }

  return json.data as T;
}

/**
 * PUT 请求
 */
export async function brokerPut<T>(
  bizParams: string[],
  data: Record<string, any> = {}
): Promise<T> {
  return brokerPost<T>(bizParams, data); // iAGS broker PUT 也走 post2Biz
}

/**
 * DELETE 请求
 */
export async function brokerDelete(
  bizParams: string[],
  query: Record<string, any> = {}
): Promise<void> {
  const sp = new URLSearchParams();
  sp.set('bizURLParams', JSON.stringify(bizParams));
  sp.set('data', JSON.stringify(query));

  const res = await fetch(`${IAGS_BASE}/getFromBiz?${sp.toString()}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Broker DELETE failed: ${res.status} ${res.statusText}`);
  }
}
```

**broker bizURLParams 命名规范**：

V1.1 业务统一使用 `["iAGS", "v11{Module}", "{action}"]` 三段式：

| V1.1 模块 | bizURLParams | biz 文件目录 |
|-----------|-------------|-------------|
| Crop | `["iAGS","v11Crop","..."]` | `biz/iAGS/v11/crop/` |
| Farm | `["iAGS","v11Farm","..."]` | `biz/iAGS/v11/farm/` |
| Labor/HR | `["iAGS","v11Labor","..."]` | `biz/iAGS/v11/labor/` |
| Material | `["iAGS","v11Material","..."]` | `biz/iAGS/v11/material/` |
| Approval | `["iAGS","v11Approval","..."]` | `biz/iAGS/v11/approval/` |
| Summary | `["iAGS","v11Summary","..."]` | `biz/iAGS/v11/summary/` |
| System | `["iAGS","v11System","..."]` | `biz/iAGS/v11/system/` |
| iAGS 已有模块 | `["iAGS","curve","..."]` | `biz/iAGS/curve/` (已有) |

**关键点**：
- iAGS broker **完全不动**，不修改任何已有代码
- brokerClient ~90 行，零外部依赖，仅封装 fetch
- 认证通过 `credentials: 'include'` 自动携带 iAGS Cookie，无需 JWT↔Session 映射
- V1.1 独有业务写成 biz 文件放入 `biz/iAGS/v11/` 命名空间
- 每个 V1.1 API 路由 → 一个独立的 broker biz 文件

### 5.2 数据库：iAGS MySQL 原样使用 + V11_ 前缀隔离

**策略**：iAGS MySQL 数据库完全不动。V1.1 独有的业务表在 iAGS MySQL 中新建，统一使用 `V11_` 前缀与 iAGS 原有表清晰隔离。

| V1.1 开发阶段 | iAGS 生产环境 |
|-------------|-------------|
| SQLite (开发测试用) | MySQL (iAGS 现有，不动) |
| 独立 .db 文件 | V1.1 独有表 → `V11_` 前缀新建 |

**V1.1 数据对接方式**：

1. **表已存在的** — 直接读写 iAGS MySQL 现有表，通过 broker biz 文件操作
2. **V1.1 独有的表**（如审批工作流、公告模板等）— 在 iAGS MySQL 中以 `V11_` 前缀新建
3. **SQLite 种子数据** — 作为初始化数据导入 iAGS MySQL，一次性操作

**V11_ 前缀建表示例**：

```sql
-- V1.1 作物品种表（iAGS 中没有对应表，需新建）
CREATE TABLE V11_CropVarieties (
  VarietyOID VARCHAR(50) PRIMARY KEY,
  CropCode VARCHAR(50),
  CategoryCode VARCHAR(50),
  CategoryName VARCHAR(100),
  TypeCode VARCHAR(50),
  TypeName VARCHAR(100),
  VarietyCode VARCHAR(50),
  VarietyName VARCHAR(100),
  SubVariety1Code VARCHAR(50),
  DetailVarietyCode VARCHAR(50),
  Alias VARCHAR(200),
  Image TEXT,
  Description TEXT,
  GerminationPeriod INT,
  SeedlingPeriod INT,
  FloweringPeriod INT,
  FruitingPeriod INT,
  HarvestPeriod INT,
  AirTemperature DECIMAL(5,2),
  AirHumidity DECIMAL(5,2),
  CO2Content DECIMAL(10,2),
  LightIntensity DECIMAL(10,2),
  SoilTemperature DECIMAL(5,2),
  SoilHumidity DECIMAL(5,2),
  SoilPH DECIMAL(4,2),
  SoilEC DECIMAL(8,2),
  Remarks TEXT,
  Status VARCHAR(20) DEFAULT 'active',
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

```typescript
// V1.1 前端通过 broker biz 文件操作 MySQL
// brokerClient → broker → biz 文件 → yjDBService → MySQL

// V1.1 Store (前端)
const result = await brokerGet(['iAGS', 'v11Crop', 'getVarietyList'], { page: 1, pageSize: 20 });
      ↓
// broker biz 文件 (tm.iags_biz/biz/iAGS/v11/crop/getVarietyList.{m}.js)
module.exports = function(sender) {
    let query = sender.req.query;
    yjDBService.exec({
        sql: `SELECT * FROM V11_CropVarieties WHERE Status='active'
              LIMIT ? OFFSET ?`,
        parameters: [pageSize, (page - 1) * pageSize],
        success: (result) => sender.success({ rows: yjDB.dataSet2ObjectList(result.meta, result.rows), total: result.rows.length }),
        error: (err) => sender.error(err),
    });
};
```

**SQLite → MySQL 一次性数据迁移**：

```bash
# 第一步：导出 V1.1 SQLite 独有表的结构和数据
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

### 5.3 IoT 层：完全不动，数据走 Redis

> **2026-05-20 更新**：poolingServer 零行修改，数据通过已有的 Redis 出口读取。

**策略**：`tm.iAGS.poolingServer` 完全不动。poolingServer 已经通过 yjPusher 机制将实时数据写入 Redis，broker biz 文件直接从 Redis 读取，无需在 poolingServer 上加任何新接口。

```
React 前端                    broker + biz 文件              PoolingServer (不动)        IoT 设备
─────────                    ──────────────                 ────────────────────        ────────
brokerGet(                   biz 文件:
  ['iAGS','iot',             yjRedis.get('realtime:...')
  'getRealtimeData'],  →     ↓                              Redis ←── yjPusher ←───→ TCP/MQTT ←→ [物理设备]
  {deviceId:'x'})            返回数据给前端                  (已有机制，不动)
```

**数据读取路径**：
```
  实时传感器数据:
    broker biz 文件 → yjRedis.get('realtime:sensor:{greenhouseId}') → 返回前端
  
  设备状态:
    broker biz 文件 → yjRedis.get('device:status:{deviceId}') → 返回前端
  
  告警数据:
    broker biz 文件 → yjRedis.get('warning:active') → 返回前端
  
  控制指令下发 (写操作):
    React 前端 → brokerPost(['iAGS','control','sendCommand'], {...})
    → biz 文件 → yjPusher → poolingServer TCP → 物理设备
```

**关键原则**：
- poolingServer **零行修改** — 数据已经写入 Redis，直接读
- 不下发控制指令到 poolingServer HTTP — 控制指令走已有的 yjPusher/TCP 链路
- 如确需下发控制指令，broker biz 文件通过 iAGS 已有的 MQTT/TCP 客户端发送

### 5.4 iframe 集成过渡

**过渡期架构**：

```
┌──────────────────────────────────────────────────┐
│              iAGS 主系统 (旧)                      │
│  ┌────────────────────┐  ┌─────────────────────┐ │
│  │  EasyUI 菜单栏     │  │  右侧内容区          │ │
│  │  ├ 首页 (旧EJS)    │  │                      │ │
│  │  ├ 曲线 (旧EJS)    │  │  ┌────────────────┐  │ │
│  │  ├ 设备 (旧EJS)    │  │  │                │  │ │
│  │  ├ 种植 (← iframe) │──┼─→│  V1.1种植模块  │  │ │
│  │  ├ 育苗 (← iframe) │──┼─→│  V1.1育苗模块  │  │ │
│  │  ├ 农事 (← iframe) │──┼─→│  V1.1农事模块  │  │ │
│  │  └ ...              │  │  │                │  │ │
│  └────────────────────┘  │  └────────────────┘  │ │
│                           └─────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**iAGS-v2 完成后反过来**：

```
┌──────────────────────────────────────────────────┐
│              iAGS-v2 (新系统)                      │
│  ┌────────────────────┐  ┌─────────────────────┐ │
│  │  React 菜单栏      │  │  右侧内容区          │ │
│  │  ├ 首页 (React)     │  │                      │ │
│  │  ├ 曲线 (React)     │  │  React 页面          │ │
│  │  ├ 设备 (React)     │  │  ...正常渲染...      │ │
│  │  ├ 种植 (React)     │  │                      │ │
│  │  ├ 旧报表 (→ iframe)│──┼─→│ 旧EasyUI报表页面  │ │
│  │  └ ...              │  │  (暂未迁移)          │ │
│  └────────────────────┘  └─────────────────────┘ │
└──────────────────────────────────────────────────┘
```

#### 5.4.1 Socket.IO 实时数据桥接（RealtimeBridge）

> **2026-05-20 新增**：iAGS 旧模块（device/control/warning/curve）依赖 Socket.IO 接收实时数据。在 iframe 过渡模式下，由 React Shell 统一管理 Socket.IO 连接，通过 postMessage 转发给 iframe 内的 EasyUI 页面。

```
React Shell                    Socket.IO                 iAGS PoolingServer
──────────                    ──────────                 ──────────────────
  realtimeBridge.connect() ──→ io('/') ────────────────→ IoT 实时数据推送
       │                           ↑
       │  on('RealTimeData')       │  on('warningData')
       │  on('device_operation')   │  on('control_state')
       │                           │
       ├── postMessage ──→ iframe.contentWindow
       │    { type: 'REALTIME_DATA',
       │      payload: { event, data } }
       │                           │
       ↓                           ↓
  [React 页面直接渲染]    [iframe EasyUI 页面渲染]
```

```typescript
// src/services/realtimeBridge.ts
// 统一管理 Socket.IO 连接，将实时数据转发给所有注册的 iframe

import { io, Socket } from 'socket.io-client';

class RealtimeBridge {
  private socket: Socket | null = null;
  private iframeRefs: Map<string, HTMLIFrameElement> = new Map();

  connect() {
    this.socket = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    // 监听所有 iAGS 实时数据事件
    const realtimeEvents = [
      'RealTimeData',           // 传感器实时数据
      'warningData',            // 告警实时推送
      'device_operation_record', // 设备操作记录
      'control_state',          // 设备控制状态
      'run_settings_result',    // 运行参数设置结果
    ];

    realtimeEvents.forEach(eventName => {
      this.socket?.on(eventName, (data) => {
        this.broadcastToAllIframes(eventName, data);
      });
    });
  }

  // 转发实时数据到所有注册的 iframe
  private broadcastToAllIframes(event: string, data: any) {
    this.iframeRefs.forEach((iframe) => {
      iframe.contentWindow?.postMessage({
        source: 'iags-shell',
        type: 'REALTIME_DATA',
        payload: { event, data },
        timestamp: Date.now(),
        messageId: crypto.randomUUID(),
      }, window.location.origin);
    });
  }

  registerIframe(key: string, iframe: HTMLIFrameElement) {
    this.iframeRefs.set(key, iframe);
  }

  unregisterIframe(key: string) {
    this.iframeRefs.delete(key);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const realtimeBridge = new RealtimeBridge();
```

**iframe 内 EasyUI 页面接收实时数据**（通过注入脚本）：

```javascript
// 由 WebServer 中间件注入到 EasyUI 页面 <head> 中
window.addEventListener('message', function(event) {
  if (event.origin !== window.location.origin) return;
  var msg = event.data;
  if (msg.source !== 'iags-shell' || msg.type !== 'REALTIME_DATA') return;

  var eventName = msg.payload.event;
  var data = msg.payload.data;

  // 触发 EasyUI 原有的数据更新逻辑
  switch (eventName) {
    case 'RealTimeData':
      // 更新 datagrid / 曲线图
      if (window.updateRealtimeData) window.updateRealtimeData(data);
      break;
    case 'warningData':
      // 弹窗告警
      if (window.showWarning) window.showWarning(data);
      break;
    case 'control_state':
      // 更新设备状态指示灯
      if (window.updateControlState) window.updateControlState(data);
      break;
  }
});
```

### 5.5 多语言方案

iAGS 现有 Acroprise MultiLang 方案 (私有框架)。新方案：

```
[旧系统] Acroprise MultiLang 词条
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
[新系统] useI18nStore (Zustand)
    └── <I18nProvider> (React Context)
        └── useT(key) Hook → 组件内使用
```

**V1.1 已有的字典系统可以扩展为多语言框架**：
- `useDictionaryStore` 已有 category_code + dict_code 管理
- 扩展 `translations` 表: dict_code + locale + translated_text
- 组件层封装 `<T key="curve.title" />` 翻译组件

### 5.6 V1.1 API层简化方案：去除三级缓存

#### 5.6.1 问题分析

V1.1 当前 `enhancedApiClient` 实现了三级降级缓存（API → IndexedDB → localStorage + 离线队列），是为"田间地头断网"场景设计的**预防性架构**。实际情况：

| 评估维度 | 实际情况 |
|---------|---------|
| 离线使用场景 | Web 应用不是移动端，田间没信号不会有人开电脑操作 |
| 网络问题 | 偶尔抖动 TanStack Query 的 staleTime + 重试足够应对 |
| IndexedDB 缓存 | 增加了一层复杂性和维护负担 |
| 离线队列 | 从未验证过"恢复网络后自动同步"的完整流程 |
| Dexie 依赖 | 多一个第三方库，版本升级有兼容风险 |

**结论**：三级缓存是过度设计。简化为与 iAGS 一致的方案——直接 fetch + TanStack Query 缓存。两系统最终统一使用同一套 API 调用模式。

#### 5.6.2 简化后对比

```
当前 enhancedApiClient (397行):
├── Dexie IndexedDB 数据库类 (11行)
├── EnhancedApiClient 类 (386行)
│   ├── request() 主方法 (73行)
│   ├── get/post/put/delete/patch (21行)
│   ├── getFromCache/saveToCache/clearCache (34行)
│   ├── addToOfflineQueue/getOfflineQueue/processOfflineQueue (68行)
│   ├── setupNetworkListeners (13行)
│   ├── fetch() 内部请求 (73行)
│   └── delay() 工具 (3行)

简化后 apiClient (~80行):
├── request() 统一请求 (20行)
│   ├── JWT token 注入
│   ├── 超时控制
│   ├── 统一响应 {success, data, error} 处理
│   └── 2次重试
├── get/post/put/delete (8行)
└── 无外部依赖

缓存由 TanStack Query 接管:
├── useQuery({ queryKey, queryFn, staleTime })
├── useMutation({ mutationFn, onSuccess, onError })
└── queryClient.invalidateQueries() 手动刷新
```

#### 5.6.3 简化后 apiClient 完整实现

```typescript
// src/lib/apiClient.ts (简化版, ~80行, 零额外依赖)

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const TIMEOUT = 30000;   // 30秒超时
const MAX_RETRIES = 2;   // 最多重试2次

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  total?: number;
  message?: string;
  error?: string;
}

/** 核心请求方法 */
async function request<T>(
  url: string,
  method: string,
  data?: unknown,
  retries = MAX_RETRIES
): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // JWT token 注入
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // 超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const json: ApiResponse<T> = await res.json();

    if (json.success === false) {
      throw new Error(json.error || json.message || '请求失败');
    }

    return (json.data ?? json) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      if (retries > 0) return request<T>(url, method, data, retries - 1);
      throw new Error(`请求超时 (${TIMEOUT / 1000}秒)`);
    }
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return request<T>(url, method, data, retries - 1);
    }
    throw err;
  }
}

/** 公开的简洁 API */
export const apiClient = {
  get:    <T>(url: string)                          => request<T>(url, 'GET'),
  post:   <T>(url: string, data?: unknown)           => request<T>(url, 'POST', data),
  put:    <T>(url: string, data?: unknown)           => request<T>(url, 'PUT', data),
  patch:  <T>(url: string, data?: unknown)           => request<T>(url, 'PATCH', data),
  delete: <T>(url: string)                           => request<T>(url, 'DELETE'),
};
```

#### 5.6.4 TanStack Query 接管缓存 (Store 使用示例)

```typescript
// 改造前：Store 内手动管理缓存 (enhancedApiClient 模式)
import { enhancedApiClient } from '@/lib/apiClient';

const useOldStore = create<OldState>((set, get) => ({
  data: [],
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true });
    try {
      const data = await enhancedApiClient.get('/api/items', {
        useCache: true,
        cacheStrategy: 'cache-first',
      });
      set({ data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createItem: async (item) => {
    set({ loading: true });
    try {
      const result = await enhancedApiClient.post('/api/items', item, {
        offlineQueue: true,  // 离线时入队
      });
      set(state => ({ data: [...state.data, result], loading: false }));
    } catch (err) {
      if (err.message.includes('OFFLINE_QUEUED')) {
        // 离线队列特殊处理
      }
    }
  },
}));


// 改造后：TanStack Query 接管缓存 + apiClient 简洁调用
import { apiClient } from '@/lib/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 查询 Hook — TanStack Query 管理缓存
export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: () => apiClient.get<Item[]>('/api/items'),
    staleTime: 30 * 1000,     // 30秒内不重新请求
    retry: 2,                 // 失败重试2次
  });
}

// 变更 Hook — 乐观更新
export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: CreateItemDto) =>
      apiClient.post<Item>('/api/items', item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
}
```

#### 5.6.5 缓存策略分层 (按数据类型配置 staleTime)

| 数据类型 | staleTime | 说明 |
|---------|-----------|------|
| 实时传感器数据 | 0 (不缓存) | 必须最新，WebSocket 推送 |
| 设备状态 | 5秒 | 允许短暂缓存 |
| 告警列表 | 10秒 | 准实时 |
| 用户/权限信息 | 5分钟 | 很少变动 |
| 温室/区域/设备配置 | 5分钟 | 配置类数据 |
| 字典/枚举值 | 30分钟 | 基本不变 |
| 历史曲线数据 | 1分钟 | 查询后缓存减少重复请求 |

```typescript
// 统一的 TanStack Query 配置常量
export const STALE_TIMES = {
  REALTIME:   0,           // 实时数据 — 不缓存
  NEAR_REAL:  5 * 1000,    // 准实时 — 5秒
  NORMAL:     30 * 1000,   // 常规 — 30秒
  STABLE:     5 * 60 * 1000,     // 稳定 — 5分钟
  REFERENCE:  30 * 60 * 1000,    // 参考 — 30分钟
} as const;
```

#### 5.6.6 WebSocket 实时数据 (iAGS 核心场景)

```typescript
// hooks/useRealtimeConnection.ts
// 实时数据走 WebSocket，不走 HTTP 请求，不经过缓存

interface RealtimeMessage {
  type: 'sensor_data' | 'alarm' | 'device_status';
  payload: Record<string, unknown>;
  timestamp: number;
}

export function useRealtimeConnection(greenhouseId: string) {
  const setRealtimeData = useRealtimeDataStore(s => s.setData);
  const addAlert = useWarningStore(s => s.addRealtimeAlert);

  useEffect(() => {
    const ws = new WebSocket(`ws://${location.host}/api/iags/realtime?greenhouseId=${greenhouseId}`);

    ws.onmessage = (event) => {
      const msg: RealtimeMessage = JSON.parse(event.data);
      switch (msg.type) {
        case 'sensor_data':
          setRealtimeData(msg.payload);                           // 直接写 Zustand Store
          break;
        case 'alarm':
          addAlert(msg.payload);                                  // 直接写 Zustand Store
          break;
      }
    };

    return () => ws.close();
  }, [greenhouseId]);
}
```

**WebSocket 数据流**：

```
IoT PoolingServer → WebSocket → onmessage → Zustand Store(set) → React 重渲染
                                                  ↑
                                         不经过任何缓存层
```

#### 5.6.7 V1.1 改造实施计划 (2周)

```
第1周: 基础改造
  ├── [Day1] 编写新的 src/lib/apiClient.ts (~80行, 零依赖)
  ├── [Day1] 添加 STALE_TIMES 常量
  ├── [Day2-3] 改造 src/stores/ (59个文件)
  │   ├── 删除 enhancedApiClient 导入
  │   ├── 删除手动缓存逻辑 (useCache/cacheStrategy/offlineQueue)
  │   ├── 删除离线队列相关代码
  │   ├── 替换为 apiClient 导入
  │   └── 缓存逻辑迁移到 TanStack Query useQuery/useMutation
  ├── [Day4-5] 改造 src/services/ (48个文件)
  │   └── 同 Store 改造模式
  └── [Day5] 删除 src/lib/apiClient.ts (旧 enhancedApiClient)

第2周: 验证 & 清扫
  ├── [Day1-2] TypeScript 编译检查 (tsc --noEmit)
  ├── [Day2-3] 逐个模块运行验证 (种植/任务/巡查/审批/仪表盘)
  ├── [Day4] 修复编译错误和运行时错误
  ├── [Day4] 从 package.json 移除 dexie 依赖
  ├── [Day5] 清理 IndexedDB 数据库 (yuanxingtu-api-cache)
  └── [Day5] 更新 CLAUDE.md 架构铁律 (移除 enhancedApiClient 引用)
```

#### 5.6.8 关联改动清单

| 改动项 | 文件 | 说明 |
|--------|------|------|
| 新建 | `src/lib/apiClient.ts` | 80行简洁 apiClient |
| 新建 | `src/lib/staleTimes.ts` | 缓存策略常量 |
| 改造 | `src/stores/` 59个文件 | 删除 enhancedApiClient，接入 TanStack Query |
| 改造 | `src/services/` 48个文件 | 同上 |
| 删除 | `src/lib/apiClient.ts` (旧) | 397行 enhancedApiClient |
| 删除依赖 | `package.json` → `dexie` | 移除 Dexie |
| 清理数据 | IndexedDB `yuanxingtu-api-cache` | 浏览器端清理 |

#### 5.6.9 效果对比

| 指标 | 旧方案 (enhancedApiClient) | 新方案 (apiClient + TanStack Query) |
|------|---------------------------|-----------------------------------|
| 代码行数 | 397行 | 80行 (-80%) |
| 外部依赖 | Dexie (额外维护负担) | 无 (仅 fetch) |
| 缓存策略 | 手写 IndexedDB + 过期检查 | TanStack Query (成熟的库) |
| 离线支持 | 离线队列 (未充分验证) | 无离线 (不需要) |
| 学习成本 | 需要理解 IndexedDB + Dexie API | 标准 TanStack Query (团队已会) |
| 与 iAGS 统一 | 不一致 | **完全一致** |

---

## 六、风险与对策

| 风险 | 概率 | 影响 | 对策 |
|------|------|------|------|
| IoT 通信协议文档缺失，对接困难 | 高 | 高 | **poolingServer 保持不动**，只新增最小 HTTP 查询接口，不修改任何 IoT 协议代码 |
| 92个EJS视图业务逻辑分散在M/V/C | 高 | 中 | 按模块逐个梳理，先写数据流文档再写React代码，每个模块2周 |
| 用户习惯 EasyUI 交互，抵触新UI | 中 | 低 | V1.1 48组件交互已验证成熟，灰度切换+培训 |
| iAGS Cookie 认证兼容 | 低 | 低 | Vite proxy 同域，Cookie 自动携带，无需桥接 |
| 性能退化(单页应用 vs MPA) | 低 | 中 | Vite代码分割+懒加载+TanStack Query缓存 |
| 实时数据推送延迟 | 中 | 高 | WebSocket 复用 poolingServer 现有推送通道 |
| 团队人力不足 | 高 | 高 | V1.1 约 90% 代码直接复用，实际新建代码约115个文件，1-2人可完成 |
| 双系统并行期间数据一致性问题 | 低 | 低 | 适配层直连 iAGS 后端，无数据同步问题 |

---

## 七、代码复用分析

### 从 V1.1 直接复制（零修改）
| 类别 | 文件数 | 占比 |
|------|--------|------|
| UI 组件库 | 48 | 100% |
| 布局组件 | 8 | 100% |
| Zustand Store | 106 | 95% (仅改baseURL) |
| API Service | 79 | 90% (仅改baseURL) |
| Custom Hooks | 67 | 85% |
| Type 定义 | 20 | 80% |
| 业务组件 (farm/labor/material/...) | ~600 | 85% |
| 页面组件 | ~200 | 80% |
| 后端路由 | 66 | 改为 foilAdapter 映射配置 (适配层) |
| 工具函数 (lib/) | 10 | 95% |

### 需要新建的 iAGS 特有代码
| 类别 | 数量 | 说明 |
|------|------|------|
| iAGS 页面 | ~30 | 曲线/控制/告警/摄像头/能耗/智能/3D/报表/首页/行政 |
| iAGS 业务组件 | ~40 | 传感器选择器/设备控制面板/曲线图/告警面板/摄像头网格/... |
| iAGS Store | ~12 | 曲线/实时数据/设备控制/告警/能耗/智能/3D/报表/首页 |
| iAGS API Service | ~8 | 曲线/实时/设备控制/告警/摄像头/能耗/智能/报表 |
| iAGS Hooks | ~4 | WebSocket连接/设备指令/历史查询/3D交互 |
| iAGS 后端路由 | ~10 | 曲线/实时/设备/控制/告警/能耗/智能/IoT/报表 |
| iAGS 后端Service | ~5 | 曲线聚合/IoT解析/控制编排/告警引擎/报表生成 |
| iAGS 类型定义 | ~6 | curve/device/warning/energy/iot/intelligent |

### 总代码量估算
- **复用 V1.1**: ~1200 文件 (直接复制，适配量 <5%)
- **新建 iAGS 特有**: ~115 文件 (全部从零写)
- **新建/改造比例**: 约 9% 全新代码，91% 复用

---

## 八、里程碑交付

| 里程碑 | 时间 | 交付物 | 验收标准 |
|--------|------|--------|---------|
| **M0** | 第2周末 | 项目骨架 + API 适配层跑通 | npm run dev 启动成功；JWT 登录；apiClient 通过 foilAdapter 调通 iAGS 后端；UI 组件库渲染正常 |
| **M1** | 第5周末 | V1.1 全部业务模块迁入 | 种植全周期走通；任务枢纽/巡查/问题调度可用；审批流可用；85个页面全部渲染正常；全部通过 iAGS 后端读写数据 |
| **M2** | 第11周末 | 曲线/环境监控上线 | 实时曲线图展示温湿度/CO2/光照数据；支持历史查询对比；WebSocket实时推送延迟<2秒 |
| **M3** | 第16周末 | 告警+设备+摄像头+能耗上线 | 告警实时推送+声音提醒；设备状态面板+控制指令下发；摄像头预览；能耗日/月统计图表 |
| **M4** | 第20周末 | 全部农业管理模块对接完成 | V1.1 种植/育苗/施肥/采收 对接 iAGS 真实数据；旧 20+ more子模块全部替换；报表+履历可用 |
| **M5** | 第24周末 | 全功能上线，旧系统下线 | 智能控制规则引擎可用；3D温室可视化可用；灰度100%全量切换；旧系统归档下线 |

---

## 九、运维与持续维护

### 部署架构 (上线后)

> **2026-05-20 更新**：上线部署也用 broker 直调，无需 Express 适配层。

```
┌─────────────────────────────────────────────────────────┐
│                     Nginx (反向代理)                      │
│  ├── /app/*          → localhost:3000 (iAGS BizServer)   │
│  ├── /socket.io/*    → localhost:3000 (WebSocket)        │
│  └── /*              → localhost:5189 (React 静态文件)    │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   React 静态文件     iAGS BizServer     PoolingServer
   (Vite build)      (端口3000,不动)     (TCP/MQTT,不动)
                     - Foil 框架          - IoT 数据采集
                     - broker 接口        - Redis 写入
                     - MySQL 操作
                     - Cookie 认证
```

**关键变化**：
- 不再需要独立的 Express 代理层（端口3002）
- Nginx 直接将 `/app` 请求转发到 iAGS BizServer
- Cookie 认证在 Nginx 层面代理后仍然正常工作（同域部署时无需特殊处理）
- 比旧方案少一层网络跳转，响应延迟更低

### 监控指标
- API 响应时间 (p50 / p95 / p99)
- 前端首屏加载时间 (FCP / LCP)
- WebSocket 消息延迟
- 数据库连接池状态
- IoT 设备在线率

### 长期演进方向
1. V1.1 全部模块迁入 iAGS 后，**V1.1 独立 repo 归档**，只保留 iAGS 一个仓库
2. 共享组件库抽为独立 npm 包 `@yuanxingtu/ui`，供未来其他子系统使用
3. 微前端架构 (qiankun/Module Federation) — 如果后续还有其他子系统接入
4. 移动端 App (React Native) 复用 Zustand Store 和 API Service

---

## 附录A：iAGS 旧系统模块 → 新系统映射表

| iAGS 旧页面 (EJS) | iAGS-v2 页面 (React) | 复用来源 | 优先级 |
|-------------------|---------------------|---------|--------|
| `iAGS/home/showHome` | `IagsHomePage.tsx` | 新建 | P0 |
| `iAGS/curve/showCurve` | `CurvePage.tsx` | 新建 | P0 |
| `iAGS/control/showControl` | `ControlPage.tsx` + `DevicePage.tsx` | 新建 + V1.1部分 | P0 |
| `iAGS/device/showDevice` | `DevicePage.tsx` | 新建 + V1.1 system/ | P0 |
| `iAGS/warning/showWarning` | `WarningPage.tsx` | 新建 + V1.1 system/ | P0 |
| `iAGS/camera/showCamera` | `CameraPage.tsx` | 新建 + V1.1 system/ | P1 |
| `iAGS/energy/showEnergy` | `EnergyPage.tsx` | 新建 + V1.1 system/ | P1 |
| `iAGS/report/showReport` | `ReportPage.tsx` | 新建 + V1.1 summary/ | P1 |
| `iAGS/resume/showResume` | `ResumePage.tsx` (→ `TraceabilityPage`扩展) | V1.1 trace/ 扩展 | P2 |
| `iAGS/intelligentcontrol/showIntelligentcontrol` | `IntelligentPage.tsx` | 新建 | P2 |
| `iAGS/3D/index` | `ThreeDPage.tsx` | 新建 | P3 |
| `iAGS/application/showApplication` | → 合并到 `Settings/SystemConfig` | V1.1 settings/ | P2 |
| `iAGS/systemset/showSystemset` | `Settings` 下11个页面 | V1.1 system/ (已有) | P2 |
| `iAGS/administration/*` | 种子/育苗/采购/区域种植 | V1.1 farm/ (已有) | P1 |
| `iAGS/more/morechild/*` (20+子页) | `FarmHubPage` + 各专项页面 | V1.1 farm/hub/ (已有) | P1 |
| `SystemMore/ChangePassword` | → `Profile` 安全设置 | V1.1 (已有) | P2 |
| `SystemMore/IDCManag` | → `SystemMonitor` | V1.1 system/ | P3 |
| `account/showLogin` | `Login` | V1.1 (已有) | P0 |
| `account/registerAccount` | → `Login` 注册Tab | V1.1 扩展 | P3 |

## 附录B：V1.1 已有 iAGS 集成模块 (11个)

这些模块已在 V1.1 `src/pages/system/` 下实现，可直接复用：

| 模块 | Store | 路由 | 前端页面 |
|------|-------|------|---------|
| 园区分区管理 | `useFarmPartitionStore` | `/api/farm-partitions` | `FarmPartitionManagement` |
| 区域系统管理 | `useAreaSystemStore` | `/api/area-systems` | `AreaSystemManagement` |
| 设备系统管理 | `useDeviceSystemStore` | `/api/device-systems` | `DeviceSystemManagement` |
| 摄像头管理 | `useCameraStore` | `/api/cameras` | `CameraManagement` |
| 能耗配置管理 | `useEnergyConfigStore` | `/api/energy-configs` | `EnergyConfigManagement` |
| 告警配置管理 | `useAlarmConfigStore` | `/api/alarm-configs` | `AlarmConfigManagement` |
| 水肥管理 | `useWaterFertilizerStore` | `/api/water-fertilizer` | `WaterFertilizerManagement` |
| 种植设置管理 | `usePlantSettingStore` | `/api/plant-settings` | `PlantSettingManagement` |
| 项目调试管理 | - | `/api/debug` | `ProjectDebugManagement` |
| 设备分布管理 | `useDeviceDistributionStore` | `/api/device-distributions` | `DeviceDistributionManagement` |
| 系统监控 | - | `/api/monitoring` | `SystemMonitor` |

## 附录C：依赖变更清单

| 依赖 | V1.1 使用 | iAGS-v2 变更 | 原因 |
|------|----------|-------------|------|
| `sql.js` | SQLite 浏览器端 | **移除** | 生产环境用 iAGS MySQL |
| `better-sqlite3` | SQLite 服务端 | **移除** | 生产环境用 iAGS MySQL |
| `three` | 无 | **新增** | 3D 温室可视化 |
| `@react-three/fiber` | 无 | **新增** | Three.js React 封装 |
| `highcharts` / `highcharts-react-official` | 无 | **移除** | 用 Recharts 替代 (旧 iAGS 依赖) |
| `echarts` | 无 | **移除** | 用 Recharts 替代 (旧 iAGS 依赖) |
| `jquery` | 无 | **移除** | React 替代 (旧 iAGS 依赖) |
| `rc-easyui` | 无 | **移除** | Radix UI 替代 (旧 iAGS 依赖) |
| `seajs` | 无 | **移除** | Vite ES Modules 替代 |
| `ejs` | 无 | **移除** | React CSR 替代 |
| `dexie` | IndexedDB 封装 | **移除** | enhancedApiClient 简化 |
| 其他 V1.1 依赖 | 全部保留 | **无变更** | 完全兼容 |

---

## 十、架构师审查意见及应对

> 审查日期：2026-05-20 | 审查方式：独立架构师审核 + 两系统全量代码级对比

### 10.1 总体评价

两阶段策略（先统一前端、保持Foil不动，后续再议后端替换）在架构上属于"绞杀者模式"的正确应用，降低短期风险的方向是对的。但存在**4个阻塞级技术缺口**，必须在执行前解决。

### 10.2 阻塞级问题及解决方案

#### 阻塞 #1：JWT 与 Foil Session 无法直接互通（严重程度：已解决 ✅）

> **2026-05-20 更新**：此问题已被新方案彻底消除。

**原问题**：旧方案中适配器把 JWT token 直接塞进 Foil 请求的 `{token, data}` 结构，但 Foil 的 token 是其自有 Session+RSA 体系签发的，**不是 JWT**。适配器无法只做"注入"就完成翻译。

**新方案（已采纳）**：放弃 JWT 桥接，直接使用 iAGS 原生 Cookie 认证。

```
┌──────────────────────────────────────────────────────────────────┐
│                 认证流程（broker 直调方案）                         │
│                                                                  │
│  用户登录                                                        │
│  ├── POST /app/account/login { UserAID, Password }               │
│  ├── Vite proxy 转发到 iAGS WebServer → BizServer                │
│  ├── BizServer 验证密码，返回 access_token                        │
│  ├── WebServer 设置 Cookie:                                       │
│  │   Set-Cookie: yujiang-iAGS-x-access-token=<token>;             │
│  │               HttpOnly; Path=/; SameSite=Lax                  │
│  └── React 前端收到登录成功响应                                    │
│                                                                  │
│  后续 API 调用（broker 模式）                                      │
│  ├── brokerClient 调用 /app/system/broker/getFromBiz             │
│  ├── credentials: 'include' → Cookie 自动携带                     │
│  ├── iAGS WebServer 中间件验证 Cookie → 解析 Session              │
│  ├── 转发到 BizServer 执行业务逻辑                                 │
│  └── 返回 { code: 0, data: { rows: [...] } }                    │
│                                                                  │
│  为什么可行？                                                     │
│  ├── Vite proxy 让前端 (localhost:5173) 和后端 (localhost:3000)  │
│  │   在浏览器看来是"同源"（都走 5173 的 proxy）                   │
│  ├── Cookie 的 Domain/Path 在 proxy 层自动适配                    │
│  └── 不需要 JWT，不需要 Redis 映射表，不需要 Session 续期逻辑     │
└──────────────────────────────────────────────────────────────────┘
```

**关键实现点**：

```typescript
// vite.config.ts — Cookie 代理配置
proxy: {
  '/app': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('proxyRes', (proxyRes) => {
        // 确保 Set-Cookie 在 localhost:5173 生效
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
          cookies.forEach((cookie, i) => {
            if (cookies[i]) {
              cookies[i] = cookies[i]
                .replace(/Domain=[^;]+;?/i, '')
                .replace(/Secure;?/i, '');
            }
          });
        }
      });
    },
  },
}
```

**效果对比**：

| 维度 | 旧方案（JWT桥接） | 新方案（Cookie直通） |
|------|------------------|---------------------|
| 代码量 | ~120行 authAdapter | 0行（Vite proxy 配置） |
| 外部依赖 | Redis 映射表 | 无 |
| Session 续期 | 需定时任务 | iAGS 原生续期 |
| 安全风险 | JWT + Session 双重维护 | 单一 Cookie（iAGS 原生安全） |
| 复杂度 | 高 | **极低** |

#### 阻塞 #2：Node v8.15.1 安全风险（严重程度：高）

**问题**：Node v8 于 2019 年 12 月 EOL，不再接收安全补丁。第一期 24 周内整个生产环境运行在无安全补丁的运行时上。已知 v8 存在多个高危 CVE（如 CVE-2021-22931、CVE-2021-22940 等）。

**解决方案**：Phase 1 第 1-2 周先做 Node 版本升级可行性评估

```
Week 1 并行任务: Node 升级评估
  ├── [Day1-2] 在隔离环境安装 Node v14 (Foil 框架依赖测试)
  │   ├── 测试 yujiang.foil.node 核心模块兼容性
  │   ├── 测试 mysql/mongodb/redis 驱动兼容性
  │   └── 测试 cluster 模块行为变化
  ├── [Day3] 如果 v14 通过，测试 v16
  ├── [Day4] 如果 v16 通过，测试 v18 (LTS)
  └── [Day5] 输出评估报告: 最高可升级版本 + 需要修改的代码清单

情况A: 可升级到 v14+ → Phase 1 就升级，消除安全风险
情况B: 无法升级 (框架耦合 v8 API) → 接受风险，加强网络层防护 (WAF + 最小端口暴露)
```

#### 阻塞 #3：PoolingServer 修改与"后端不动"原则冲突（严重程度：已解决 ✅）

> **2026-05-20 更新**：此问题已被新方案消除。旧方案需要 Express 适配层，才引入"poolingServer 加 HTTP 接口"的需求。新方案采用 broker 直调，**poolingServer 完全不动**。

**原问题**：旧方案 §5.3 提出在 poolingServer 上加 HTTP 接口（约 30 行），这与"iAGS 后端完全不动"矛盾。

**新方案（已采纳）**：poolingServer 零修改，数据出口走已有机制。

```
数据读取:
  方案A (推荐): 直接读 Redis
    poolingServer 已经将实时数据写入 Redis (yjPusher 机制)
    broker biz 文件直接读 Redis 获取传感器数据
    不需要修改 poolingServer 任何代码

  方案B: 读 MySQL
    poolingServer 定时写入 MySQL (已有机制)
    broker biz 文件查询最新记录

数据写入（控制指令）:
  React 前端 → brokerPost(['iAGS','control','sendCommand'], {...})
  → broker biz 文件 → yjPusher → TCP → 物理设备
  走 iAGS 已有的控制链路，不经过 poolingServer HTTP
```

**修正结论**：**完全不动 poolingServer**，数据出口走 Redis / MySQL 已有通道，控制指令走已有 yjPusher 机制。

#### 阻塞 #4：适配器复杂度被低估（严重程度：已解决 ✅）

> **2026-05-20 更新**：旧方案的 ~700 行 Express 适配层已被废弃。新方案采用 broker 直调，复杂度大幅降低。

**原问题**：旧方案声称适配层 ~200 行，实际需要 ~700 行。

**新方案评估**（broker 直调）：

| 组件 | 估计行数 | 说明 |
|------|---------|------|
| brokerClient.ts | ~90行 | brokerGet/brokerPost/brokerPut/brokerDelete |
| realtimeBridge.ts | ~50行 | Socket.IO 连接 + iframe 转发 |
| broker biz 文件 | 每个 ~30-50行 | 对应 V1.1 一个 API 路由 |
| Vite proxy 配置 | ~20行 | Cookie 代理（vite.config.ts） |
| **总计（前端新增）** | **~160行** | 远小于旧方案的 700 行 |

**核心简化原因**：
1. 不需要 URL 映射表 — broker bizURLParams 三段式即路由
2. 不需要响应格式转换 — broker 返回格式标准统一
3. 不需要 JWT↔Session 适配 — Cookie 自动携带
4. 不需要错误处理适配 — broker 错误格式标准统一

**真实工作量**：63 个 V1.1 后端路由 → 63 个 broker biz 文件（每个 30-50 行），总计约 2,500 行业务代码。每个文件是独立的 CRUD 模板，编写模式统一可批量生成。

### 10.3 架构师建议采纳情况

| 建议 | 采纳 | 说明 |
|------|------|------|
| JWT/Session 映射方案 | ✅ 采纳 | 见阻塞 #1 解决方案 |
| Node v8 升级评估提前 | ✅ 采纳 | 见阻塞 #2 解决方案，Week 1 并行执行 |
| 选 2-3 个 API 做原型验证 | ✅ 采纳 | 见 §11.4 |
| 明确 V1.1 独有表建表策略 | ✅ 采纳 | 见 §11.3 |
| PoolingServer 不修改 | ✅ 采纳 | 见阻塞 #3 修正方案 |
| 适配器复杂度预期调整 | ✅ 采纳 | ~700 行，非 200 行 |

---

## 十一、八大关键领域深化方案

### 11.1 V1.1 现有资产完整盘点

#### 11.1.1 页面清单（266 个 .tsx 文件）

**散页（93 个）**：`src/pages/*.tsx`

```
AgricultureRecord, AlertInfo, Announcement, ApprovalLevelConfig, Approvals,
ApprovalWorkflowConfig, Approved, AuditLog, BaseSettings, BlockManagement,
BranchManagement, CodeRule, Contract, CostAccounting, CropManagement,
DailyPlanningPage, DailyProblemSummary, DailyWorkSummary, Dashboard,
DepartmentSettings, DeviceManagement, DeviceMonitor, DictionaryManagement,
Efficiency, EnvControl, EnvironmentMonitor, FarmActivityManagement, FarmApproval,
Harvest, HomePage, HrApproval, HrApprovalDocuments, HrAttendance,
IndicatorBudgetApproval, Indicators, InventoryV3, IoTMonitor, Leave, Login,
MaterialApproval, MaterialCategory, MaterialManagement, MaterialReceiving,
MaterialReturn, Materials, Messages, MonthlyPlanningPage, MonthlyReport,
MyApplications, MyApproval, NotificationSettings, Onboarding, Overtime,
ParkArchive, PendingApproval, Performance, PersonnelManagement, Piecework,
PlanSummary, PlantAreaManagement, PositionManagement, ProcessManagement,
ProduceCodeRule, ProduceInventory, Production, ProductionApproval, Profile,
PurchasePlan, Recruitment, Reports, Risk, Salary, SalaryBudget, Schedule,
Settings, Skill, SmartDispatch, StaffManagement, SupplierCodeRule,
SupplierManagement, SystemConfig, Tasks, Team, TeamManagement, TechSolution,
TempTask, TempWorker, Traceability, UserPermission, WarehouseManagement,
WorkLog, WorkOrders, WorkerAttendance
```

**分模块页面（173 个）**：

| 模块目录 | 文件数 |
|---------|--------|
| `pages/Dashboard/` | 10 |
| `pages/authority/` | 12 |
| `pages/crop/` | 7 |
| `pages/farm/` | 4 |
| `pages/hr/` | 2 |
| `pages/labor/` | 54 |
| `pages/material/` | 21 |
| `pages/summary/` | 10 |
| `pages/sync/` | 1 |
| `pages/system/` | 12 |
| `pages/warehouse/` | 11 |
| `pages/components/` | 28 |

#### 11.1.2 Store 清单（103 个）

完整列表（按模块分类）：

**核心业务 (15)**：
`useCropVarietyStore`, `useSeedSourceStore`, `useSeedlingStore`, `usePlantingStore`, `useHarvestStore`, `useFertilizerStore`, `useCropStorageStore`, `usePlantLabelStore`, `usePlantingRecordStore`, `useRegionStore`, `useOrderStore`, `useOrderDataStore`, `useProductionPlanStore`, `useTechSolutionStore`, `usePurchasePlanStore`

**农场任务 (8)**：
`useFarmTaskStore`, `useTaskStore`, `useTempTaskStore`, `useInspectionStore`, `useInspectionDataStore`, `useProblemStore`, `useScheduleStore`, `useDispatchStore`

**劳动力/HR (25)**：
`useAttendanceStore`, `useAttendanceRepairStore`, `useLeaveStore`, `useOvertimeStore`, `usePersonnelStore`, `useCompensationStore`, `useContractStore`, `useContractRenewalStore`, `useSalaryAdjustmentStore`, `useSalaryBudgetStore`, `useSalaryStore`, `useOnboardingStore`, `useRecruitmentStore`, `useRecruitmentManageStore`, `useResignationStore`, `usePerformanceStore`, `useRiskStore`, `useEfficiencyStore`, `useSkillStore`, `usePieceworkStore`, `useTempWorkerStore`, `useWorkLogStore`, `useTeamManageStore`, `useShiftStore`, `useMonthlyReportStore`

**物资/仓库 (12)**：
`useMaterialRequestDataStore`, `useMaterialReturnStore`, `useMaterialTypeStore`, `useMaterialCodeRuleStore`, `useExecuteDataStore`, `useStatisticsStore`, `useWarehouseMaterialStore`, `useInboundStore`, `useSupplierStore`, `useSupplierCodeRuleStore`, `useWarehouseStore`, `useEquipmentStore`

**审批/通知 (6)**：
`useApprovalStore`, `useApprovalWorkflowStore`, `useApprovalLevelStore`, `useNotificationStore`, `useNotificationSettingsStore`, `useBudgetStore`

**仪表盘/汇总 (3)**：
`useDashboardStore`, `useSummaryDataStore`, `useIndicatorDataStore`, `useIndicatorStore`

**iAGS 集成 (9)**：
`useFarmPartitionStore`, `useAreaSystemStore`, `useDeviceSystemStore`, `useCameraStore`, `useEnergyConfigStore`, `useAlarmConfigStore`, `useWaterFertilizerStore`, `usePlantSettingStore`, `useDeviceDistributionStore`

**基础设施 (9)**：
`useAuthStore`, `useUserStore`, `useOrganizationStore`, `useDepartmentStore`, `usePositionStore`, `useTeamStore`, `useBlockStore`, `useZoneStore`, `useGreenhouseStore`, `useBaseStore`, `useDeviceStore`, `useWorkerStore`, `useInfrastructureStore`

**系统/工具 (14)**：
`useSettingsStore`, `useSystemConfigStore`, `useDictionaryStore`, `useToastStore`, `useAnnouncementStore`, `useAnnouncementDataStore`, `useAnnouncementTemplateStore`, `useIotStore`, `useAlertStore`, `useCostStore`, `useProcessDefinitionStore`, `useRegionStore`

#### 11.1.3 API Service 清单（41 个）及后端路由映射

| Service 文件 | 后端路由 |
|-------------|---------|
| `apiAnnouncementService.ts` | `/api/announcements` |
| `apiApprovalWorkflowService.ts` | `/api/approval-workflows` |
| `apiAttendanceRepairService.ts` | `/api/attendance` |
| `apiBasicDataService.ts` | `/api/basic-data` + `/api/dictionary` |
| `apiContractRenewalService.ts` | `/api/contract-renewal` |
| `apiCropBatchService.ts` | `/api/production-plans` |
| `apiCropInstanceService.ts` | `/api/crop-instances` |
| `apiCropOrderService.ts` | `/api/crop-orders` |
| `apiCropVarietyService.ts` | `/api/crop-varieties` |
| `apiDeviceDistributionService.ts` | `/api/device-distributions` |
| `apiFarmTaskService.ts` | `/api/farm-tasks` |
| `apiHarvestService.ts` | `/api/harvest` |
| `apiInspectionService.ts` | `/api/inspections` |
| `apiInventoryService.ts` | `/api/inventory` |
| `apiLaborService.ts` | `/api/labor` |
| `apiLeaveService.ts` | `/api/leave` |
| `apiMaterialCodeCategoryService.ts` | `/api/material-code-categories` |
| `apiMaterialRequestService.ts` | `/api/material-requests` |
| `apiMaterialReturnService.ts` | `/api/material-returns` |
| `apiNotificationService.ts` | `/api/notifications` |
| `apiOnboardingService.ts` | `/api/onboarding` |
| `apiOperationLogService.ts` | `/api/operation-logs` |
| `apiOvertimeService.ts` | `/api/overtime` |
| `apiPlantingRecordService.ts` | `/api/planting-records` |
| `apiPlantingService.ts` | `/api/plantings` |
| `apiProblemService.ts` | `/api/problems` |
| `apiProductionPlanLocalService.ts` | `/api/production-plans` |
| `apiPurchasePlanService.ts` | `/api/purchase-plans` |
| `apiRecruitmentService.ts` | `/api/recruitment` |
| `apiResignationService.ts` | `/api/resignation` |
| `apiSalaryAdjustmentService.ts` | `/api/salary-adjustment` |
| `apiSalaryBudgetService.ts` | `/api/salary-budget` |
| `apiSeedlingService.ts` | `/api/seedlings` |
| `apiSeedSourceService.ts` | `/api/seed-sources` |
| `apiSupplierService.ts` | `/api/suppliers` |
| `apiTechSolutionService.ts` | `/api/tech-solutions` |
| `apiWarehouseMaterialService.ts` | `/api/materials` |

#### 11.1.4 Server 路由完整清单（63 个）

全部挂载在 `/api` 下，除标注外均使用 `requireAuth` 中间件：

```
/api/crop-varieties        /api/inventory           /api/seedlings
/api/seed-sources          /api/plantings            /api/harvest
/api/suppliers             /api/crop-instances       /api/farm-tasks
/api/inspections           /api/problems             /api/labor
/api/overtime              /api/leave                /api/temp-tasks
/api/purchase-plans        /api/material-requests    /api/basic-data (可选认证)
/api/dictionary            /api/authority (公开)      /api/notifications (可选认证)
/api/approval-workflows    /api/approvals            /api/approval-linkage
/api/operation-logs        /api/crop-orders          /api/production-plans
/api/tech-solutions        /api/summary              /api/material-costs
/api/material-returns      /api/material-executes    /api/material-statistics
/api/monitoring            /api/sync                 /api/announcements
/api/indicators            /api/indicator-evaluations /api/schedules
/api/attendance            /api/personnel            /api/onboarding
/api/iot                   /api/alerts               /api/materials
/api/material-code-categories  /api/planting-records /api/resignation
/api/recruitment           /api/contract-renewal     /api/salary-budget
/api/fertilizer            /api/region               /api/plant-labels
/api/backup                /api/farm-partitions      /api/area-systems
/api/device-systems        /api/cameras              /api/energy-configs
/api/alarm-configs         /api/water-fertilizer     /api/plant-settings
/api/debug                 /api/device-distributions
```

#### 11.1.5 V1.1 Store-Service 耦合问题及修复

调研发现 Store → Service → API 调用链有 3 种不一致的模式：

| 模式 | 示例 Store | 问题 |
|------|-----------|------|
| **纯 Service** | `useHarvestStore`, `usePlantingStore` | ✅ 规范，只需改 Service 的 baseURL |
| **混用** | `useCropVarietyStore`, `useSeedlingStore` | ⚠️ 同时 import Service 和 enhancedApiClient |
| **裸调** | `useFarmTaskStore` | ❌ 绕过 Service，直调 enhancedApiClient |

**迁移时统一修复**：所有 Store 改为调用 brokerClient（不直接调 enhancedApiClient），brokerClient 底层走 iAGS broker 接口。

---

### 11.2 iAGS 旧模块迁移优先级排序

#### 11.2.1 Web 视图层复杂度

| 模块 | EJS 视图数 | EJS 总行数 | .m.js 数 | 最大文件(行) | 复杂度 |
|------|-----------|-----------|---------|-------------|--------|
| **more/morechild** | 27 | 10,624 | 20 | 1,827 (ParameterSetting) | **高** |
| **administration** | 7 | 6,475 | 59 | 1,858 (regionalplanting) | **高** |
| **device** | 10 | 5,569 | 3 | 796 (TempControlDevice) | **高** |
| **application** | 4 | 4,413 | 1 | 3,011 (intelligentControl) | **高** |
| **control** | 7 | 3,439 | 3 | 1,362 (intelligentControl) | **高** |
| **curve** | 8 | 3,230 | 4 | 553 (deviceRun) | **中** |
| **resume** | 4 | 3,194 | 5 | 1,007 (resumelist) | **中** |
| **3D** | 3 | 2,499 | 0 | 670 (getData) | **中** |
| **report** | 7 | 2,175 | 4 | 388 (showReport) | **中** |
| **intelligentcontrol** | 1 | 1,749 | 1 | 1,749 | **中** |
| **warning** | 2 | 1,234 | 5 | 1,106 (showWarning) | **低** |
| **camera** | 1 | 632 | 1 | 632 | **低** |
| **energy** | 1 | 498 | 1 | 498 | **低** |
| **home** | 1 | 328 | 1 | 328 | **低** |
| **systemset** | 1 | 327 | 1 | 327 | **低** |

#### 11.2.2 Biz 逻辑层复杂度

| 模块 | .js 总数 | .m.js 数 | 总行数 | 最大文件(行) | 复杂度 |
|------|---------|---------|--------|-------------|--------|
| **appDataCenter** | 157 | 146 | 17,622 | 3,282 (control subs) | **极高** |
| **more** | 108 | 108 | 6,172 | <100 each | **中** |
| **administration** | 66 | 54 | 6,227 | ~500 | **高** |
| **application** | 40 | 34 | 4,339 | 334 | **高** |
| **report** | 16 | 8 | 3,856 | 1,531 | **高** |
| **control** | 27 | 24 | 3,317 | 307 | **高** |
| **curve** | 18 | 12 | 3,276 | 595 | **中** |
| **device** | 25 | 24 | 2,810 | 300 | **中** |
| **plantRecord** | 19 | 12 | 2,590 | 412 | **中** |
| **IoTDataParse** | 14 | 11 | 2,005 | 341 | **中** |
| **energy** | 8 | 8 | 1,519 | 845 | **中** |
| **其他模块** | 42 | 37 | 4,044 | - | **低** |

#### 11.2.3 迁移优先级排序

**P0 — 第一期最先做（Week 6-7）**：

| 模块 | 理由 |
|------|------|
| **认证/账户** (webserver/account) | 登录、token、session — 一切依赖此模块 |
| **home** | 仪表盘入口；低复杂度（328行EJS），快速见效 |

**P1 — 核心业务（Week 8-16）**：

| 模块 | Biz行数 | EJS行数 | 理由 |
|------|---------|---------|------|
| **control** | 3,317 | 3,439 | 设备监控主界面，使用频率最高 |
| **curve** | 3,276 | 3,230 | 环境曲线，决策支持核心 |
| **device** | 2,810 | 5,569 | 全部设备类型状态视图 |
| **administration** | 6,227 | 6,475 | 种植全周期管理（对接到V1.1） |
| **application** | 4,339 | 4,413 | 智能控制模式 + 阈值配置 |

**P2 — 重要但非阻塞（Week 17-20）**：

| 模块 | 理由 |
|------|------|
| **report** | 报表生成（含最大单体文件1,531行biz） |
| **warning** | 告警管理 |
| **resume** | 种植履历/历史 |
| **energy** | 能耗分析 |
| **intelligentcontrol** | 智能控制 |

**P3 — 支撑/简单模块（Week 21-24）**：

| 模块 | 理由 |
|------|------|
| **more/morechild** (21子模块) | 配置页面，薄封装；但10,624行EJS，批量处理 |
| **camera** | 简单（632行），但需处理视频流 |
| **3D** | 可视化，零 biz 逻辑，纯前端迁移 Three.js |
| **systemset** | 单页面（327行） |
| **appDataCenter** (18子模块) | 移动端后台，依赖 Web 模块，延后处理 |

#### 11.2.4 大型单体文件（需特别关注）

| 文件 | 行数 | 模块 | 迁移策略 |
|------|------|------|---------|
| `application/intelligentControl.ejs` | 3,011 | application | 拆分为 8-10 个 React 组件 |
| `morechild/ParameterSetting.{v}.ejs` | 1,827 | more | 配置表单化，拆分为 10+ 子组件 |
| `administration/regionalplanting.ejs` | 1,825 | administration | 区域种植可视化，对接 V1.1 FarmStructure |
| `administration/seedlingManagement.ejs` | 1,758 | administration | 育苗管理，对接 V1.1 SeedlingPage |
| `intelligentcontrol/showIntelligentcontrol.{v}.ejs` | 1,749 | intelligentcontrol | 规则引擎配置界面 |
| `report/getSelectedData.js` | 1,531 | report (biz) | 最大的后端逻辑文件 |

---

### 11.3 数据库完整映射表

#### 11.3.1 V1.1 SQLite → iAGS MySQL 映射策略

**策略**：iAGS MySQL 原样使用。V1.1 独有表在 iAGS MySQL 中新建。

##### V1.1 与 iAGS 共有的表（直接使用 iAGS 现有表）

| V1.1 表 | iAGS MySQL 对应表 | 操作 |
|---------|------------------|------|
| `greenhouses` | iAGS GreenhouseInfo 等相关表 | 读 iAGS 表，写 Foil API |
| `departments` | iAGS org 相关表 | 读 iAGS 表 |
| `users` / `organizations` | iAGS user/org 表 | 读 iAGS 表 |
| `crop_varieties` | iAGS crop 相关表 | 读 iAGS 表 |

##### V1.1 独有表（需在 iAGS MySQL 中新建）

| V1.1 表 | 列数 | 说明 | 建表方式 |
|---------|------|------|---------|
| `approval_workflows` | 18 | 审批工作流定义 | 通过 Foil yjDBService 或直接 SQL |
| `approvals` | 28 | 审批记录 | 同上 |
| `approval_rules` | 11 | 审批规则 | 同上 |
| `announcements` | 14 | 公告 | 同上 |
| `announcement_templates` | 10 | 公告模板 | 同上 |
| `indicators` | 12 | 指标定义 | 同上 |
| `indicator_evaluations` | 8 | 指标评估 | 同上 |
| `farm_tasks` | 40+ | 农场任务（含20+迁移列） | 同上 |
| `task_operation_records` | 11 | 任务操作日志 | 同上 |
| `problem_flow_records` | 8 | 问题流转记录 | 同上 |
| `material_requests` | 22 | 物资申请 | 同上 |
| `material_returns` | 16 | 物资退料 | 同上 |
| `material_executes` | 14 | 物资执行 | 同上 |
| `material_costs` | 18 | 物资成本 | 同上 |
| `cost_categories` | 8 | 成本分类 | 同上 |
| `cost_budgets` | 9 | 成本预算 | 同上 |
| `procure_plans` | 20 | 采购计划 | 同上 |
| `tech_solutions` | 20 | 技术方案 | 同上 |
| `production_plans` | 25 | 生产计划 | 同上 |
| `crop_orders` | 22 | 作物订单 | 同上 |
| `crop_instances` | 21 | 作物实例 | 同上 |
| `seed_sources` | 28+ | 种子来源 | 同上 |
| `seedlings` | 24 | 育苗记录 | 同上 |
| `plantings` | 24+ | 种植记录 | 同上 |
| `harvest_records` | 22 | 采收记录 | 同上 |
| `fertilizer_records` | 22 | 施肥记录 | 同上 |
| `overtime_records` | 19 | 加班 | 同上 |
| `leave_records` | 16 | 请假 | 同上 |
| `leave_quotas` | 10 | 假期配额 | 同上 |
| `onboarding_records` | 17 | 入职 | 同上 |
| `resignation_records` | 17 | 离职 | 同上 |
| `recruitment_records` | 17 | 招聘 | 同上 |
| `contract_renewal_records` | 15 | 合同续签 | 同上 |
| `salary_budget_records` | 14 | 薪资预算 | 同上 |
| `plant_labels` | 10 | 种植标签 | 同上 |
| `plant_label_resume` | 9 | 标签履历 | 同上 |
| `plant_marks` | 8 | 标签标记 | 同上 |
| `inbound_records` | 6 | 入库记录 | 同上 |
| `materials` | 17 | 物资 | 同上 |
| `suppliers` | 22 | 供应商 | 同上 |
| `daily_records` | 15 | 日报 | 同上 |
| `transplant_records` | 20 | 移栽 | 同上 |
| `propagation_records` | 25 | 繁殖记录 | 同上 |
| `inventory` | 22 | 库存 | 同上 |
| `code_rules` | 9 | 编码规则 | 同上 |
| `process_definitions` | 9 | 工序定义 | 同上 |
| `approval_level_configs` | 9 | 审批级别配置 | 同上 |
| `approval_amount_thresholds` | 6 | 审批金额阈值 | 同上 |
| `approval_type_rules` | 9 | 审批类型规则 | 同上 |
| `notification_channels` | 8 | 通知渠道 | 同上 |
| `notification_rules` | 12 | 通知规则 | 同上 |
| `notification_preferences` | 11 | 通知偏好 | 同上 |
| `schedules` | 10 | 排班 | 同上 |
| `swap_requests` | 8 | 换班申请 | 同上 |
| `iot_devices` | 6 | IoT设备 | 同上 |

**共计约 55 张 V1.1 独有表**，需要在 iAGS MySQL 中新建。

#### 11.3.2 SQLite → MySQL 迁移策略

```bash
# 第一步：导出 V1.1 SQLite 独有表的结构和数据
sqlite3 server/data/yuanxingtu.db .schema > v1.1_schema.sql
sqlite3 server/data/yuanxingtu.db .dump > v1.1_data.sql

# 第二步：转换 SQLite 语法 → MySQL 语法
# - AUTOINCREMENT → AUTO_INCREMENT
# - TEXT → VARCHAR(255) 或 TEXT (按字段语义)
# - INTEGER → INT
# - REAL → DOUBLE
# - 移除 sqlite_sequence 等 SQLite 特有条目

# 第三步：在 iAGS MySQL 中建表
# 通过 Foil yjDBService 或直连 MySQL 执行
mysql -u root -p iags_db < v1.1_schema_mysql.sql

# 第四步：导入数据
mysql -u root -p iags_db < v1.1_data_mysql.sql
```

---

### 11.4 API 逐条改造清单

#### 11.4.1 V1.1 API → iAGS Foil API 路由映射

V1.1 的 63 个路由需要映射到 iAGS Foil 的三段式命名 `["模块", "子模块", "动作"]`。

##### 已有 iAGS 对应的（直接映射）

| V1.1 路由 | iAGS Foil 三段式 | 对应文件 |
|-----------|-----------------|---------|
| `/api/farm-partitions` | `["iAGS", "administration", "getFarmPartitions"]` | 需确认 |
| `/api/area-systems` | `["iAGS", "more", "getAreaSystem"]` | more/AreaSystem |
| `/api/device-systems` | `["iAGS", "more", "getDeviceSystem"]` | more/deviceSystem |
| `/api/cameras` | `["iAGS", "camera", "getCameraList"]` | camera |
| `/api/energy-configs` | `["iAGS", "energy", "getEnergyConfig"]` | energy |
| `/api/alarm-configs` | `["iAGS", "warning", "getAlarmConfig"]` | warning |
| `/api/water-fertilizer` | `["iAGS", "more", "getWaterFertilizer"]` | more/WaterFertilizer |
| `/api/plant-settings` | `["iAGS", "more", "getPlantSetting"]` | more/Plantset |
| `/api/device-distributions` | `["iAGS", "more", "getDeviceDistribution"]` | more/DeviceDistribution |

##### 需要新增 biz 模块的（V1.1 特有业务）

| V1.1 路由 | 需新建的 Foil Biz 文件 | 说明 |
|-----------|----------------------|------|
| `/api/approval-workflows` | `tm.iags_biz/biz/V1.1/approval/getWorkflows.{m}.js` | 审批流 — V1.1 独有 |
| `/api/approvals` | `tm.iags_biz/biz/V1.1/approval/getApprovals.{m}.js` | 审批记录 |
| `/api/announcements` | `tm.iags_biz/biz/V1.1/announcement/getAnnouncements.{m}.js` | 公告 |
| `/api/indicators` | `tm.iags_biz/biz/V1.1/indicator/getIndicators.{m}.js` | 指标 |
| `/api/farm-tasks` | `tm.iags_biz/biz/V1.1/task/getFarmTasks.{m}.js` | 农场任务 |
| `/api/crop-varieties` | `tm.iags_biz/biz/V1.1/crop/getVarieties.{m}.js` | 作物品种 |
| `/api/plantings` | `tm.iags_biz/biz/V1.1/crop/getPlantings.{m}.js` | 种植管理 |
| `/api/harvest` | `tm.iags_biz/biz/V1.1/crop/getHarvests.{m}.js` | 采收管理 |
| `/api/summary` | `tm.iags_biz/biz/V1.1/summary/getSummary.{m}.js` | 汇总分析 |
| ... | ... (其余约 40 个路由) | |

**策略**：V1.1 独有业务统一归入 `tm.iags_biz/biz/V1.1/` 命名空间，与 iAGS 原有 `biz/iAGS/` 平行，互不干扰。

#### 11.4.2 broker biz 文件编写模式

> **2026-05-20 更新**：每个 V1.1 API 路由对应一个独立的 broker biz 文件，放入 `biz/iAGS/v11/{module}/` 目录。

**标准 biz 文件模板**：

```javascript
// 文件: tm.iags_biz/biz/iAGS/v11/crop/getVarietyList.{m}.js
// 对应 V1.1: GET /api/crop-varieties → broker bizURLParams: ["iAGS","v11Crop","getVarietyList"]
const yjDBService = global.yjRequire("yujiang.Foil").yjDBService;
const yjDB = global.yjRequire("yujiang.Foil").yjDB;

module.exports = function(sender) {
    let query = sender.req.query;  // broker 传入的查询参数
    let data = JSON.parse(query.data || '{}');
    let page = parseInt(data.page) || 1;
    let pageSize = parseInt(data.pageSize) || 20;
    let keyword = data.keyword || '';

    let sql = `SELECT * FROM V11_CropVarieties WHERE Status='active'`;
    let params = [];

    if (keyword) {
        sql += ` AND (VarietyName LIKE ? OR VarietyCode LIKE ?)`;
        params.push(`%${keyword}%`, `%${keyword}%`);
    }
    sql += ` LIMIT ? OFFSET ?`;
    params.push(pageSize, (page - 1) * pageSize);

    yjDBService.exec({
        sql: sql,
        parameters: params,
        success: function(result) {
            let data = yjDB.dataSet2ObjectList(result.meta, result.rows);
            sender.success({ rows: data, total: data.length });
        },
        error: function(err) {
            console.log('[v11Crop.getVarietyList] Error:', err);
            sender.error(err);
        }
    });
};
```

**CRUD biz 文件清单（以 crop 模块为例）**：

| biz 文件 | 功能 | V1.1 原路由 |
|----------|------|------------|
| `getVarietyList.{m}.js` | 品种列表（分页+搜索） | `GET /api/crop-varieties` |
| `getVarietyDetail.{m}.js` | 品种详情 | `GET /api/crop-varieties/:id` |
| `saveVariety.{m}.js` | 新增/编辑品种 | `POST /api/crop-varieties` |
| `deleteVariety.{m}.js` | 删除品种 | `DELETE /api/crop-varieties/:id` |

#### 11.4.3 API 原型验证计划（Week 2 执行）

选取 3 个代表性接口做实测，验证 broker 直调方案：

| 验证接口 | 验证内容 | 预计耗时 |
|---------|---------|---------|
| **登录** | iAGS Cookie 认证 + Vite proxy Cookie 转发 | 0.5天 |
| **品种列表查询** | brokerClient → biz 文件 → V11_CropVarieties → 响应 | 0.5天 |
| **设备数据读取** | brokerClient → Redis 读取传感器实时数据 | 1天 |

---

### 11.5 Store 分级改造方案（103 个）

#### 11.5.1 分级标准

| 级别 | 定义 | 操作 | 数量 |
|------|------|------|------|
| **A 级** | 数据源完全对应 iAGS MySQL 表，仅改 API 调用 | 改 import + 改 apiClient 调用 | ~60 |
| **B 级** | 数据部分在 iAGS、部分在 V1.1 独有表 | 拆分数据源 + 合并逻辑 | ~25 |
| **C 级** | 依赖 enhancedApiClient 离线/缓存特性 | 重写为 TanStack Query | ~10 |
| **D 级** | 纯前端状态，不涉及后端数据 | 不动 | ~8 |

#### 11.5.2 分级清单

**A 级（~60个，改 import + apiClient 调用）**：

```
useCropVarietyStore, useSeedSourceStore, useSeedlingStore, usePlantingStore,
useHarvestStore, useFertilizerStore, useInventoryStore, useSupplierStore,
useGreenhouseStore, useZoneStore, useBlockStore, useBaseStore,
useDepartmentStore, usePositionStore, useTeamStore, useDeviceStore,
useFarmPartitionStore, useAreaSystemStore, useDeviceSystemStore,
useCameraStore, useEnergyConfigStore, useAlarmConfigStore,
useWaterFertilizerStore, usePlantSettingStore, useDeviceDistributionStore,
useOrganizationStore, useUserStore, usePersonnelStore, useAttendanceStore,
useLeaveStore, useOvertimeStore, useSalaryStore, useContractStore,
useOnboardingStore, useResignationStore, useRecruitmentStore,
useContractRenewalStore, useSalaryAdjustmentStore, useSalaryBudgetStore,
useScheduleStore, useShiftStore, useWarehouseStore, useInboundStore,
useWarehouseMaterialStore, useMaterialTypeStore, usePurchasePlanStore,
useTechSolutionStore, useProductionPlanStore, useOrderStore, useOrderDataStore,
useRegionStore, useCropStorageStore, usePlantLabelStore, usePlantingRecordStore,
useFarmTaskStore, useTaskStore, useTempTaskStore, useInspectionStore,
useInspectionDataStore, useProblemStore, useDispatchStore
```

**B 级（~25个，拆分+合并）**：

```
useDashboardStore       — 数据来自多个 iAGS 模块 + V1.1 汇总
useSummaryDataStore     — 跨模块聚合
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
useMaterialCodeRuleStore — 编码规则+物料类型
```

**C 级（~10个，重写为 TanStack Query）**：

```
useAuthStore            — 认证流程完全重写 (iAGS Cookie 认证)
useSettingsStore        — 系统设置涉及多配置表
useSystemConfigStore    — 系统配置 KV + 缓存策略
useDictionaryStore      — 字典数据 + 多级缓存
useSupplierCodeRuleStore — 供应商编码规则
useEquipmentStore       — 设备数据 + 实时状态
useInfrastructureStore  — 基础设施数据
useIotStore             — IoT 数据实时推送
useAlertStore           — 告警实时推送
useToastStore           — 纯前端 (D 级)
```

**D 级（~8个，不动）**：

```
useToastStore           — 纯前端 UI 状态
useWorkerStore          — 纯前端工作线程状态
useProcessDefinitionStore — 纯前端工序定义缓存
useApprovalLevelStore   — 纯前端审批级别缓存
useNotificationSettingsStore — 纯前端通知设置
```

---

### 11.6 iframe 通信协议详细规范

#### 11.6.1 过渡期集成架构

```
┌────────────────────────────────────────────────────────────┐
│                    iAGS 旧系统 (EasyUI)                      │
│  ┌──────────┐  ┌──────────────────────────────────────────┐│
│  │ EasyUI   │  │  内容区 (iframe)                          ││
│  │ 菜单栏   │  │  ┌──────────────────────────────────────┐ ││
│  │          │  │  │  V1.1 React 应用                     │ ││
│  │  ├ 首页   │  │  │  http://localhost:5189/farm-hub     │ ││
│  │  ├ 曲线   │  │  │                                      │ ││
│  │  ├ 设备   │  │  │  消息通道: window.postMessage        │ ││
│  │  ├ 种植◄──┼──┼──┤  ├─ 接收: 菜单切换/主题/语言        │ ││
│  │  ├ 育苗◄──┼──┼──┤  ├─ 发送: 页面标题/路由变化/需要认证  │ ││
│  │  └ ...    │  │  └──────────────────────────────────────┘ │ ││
│  └──────────┘  └──────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

#### 11.6.2 postMessage 消息格式

```typescript
// ========== 消息信封 ==========
interface IframeMessage {
  // 消息唯一ID (UUID v4)，用于请求-响应配对
  id: string;

  // 消息类型
  type: IframeMessageType;

  // 发送方
  source: 'iags-host' | 'v1.1-iframe';

  // 消息体
  payload: Record<string, unknown>;

  // 时间戳 (ISO 8601)
  timestamp: string;
}

type IframeMessageType =
  // ===== 生命周期 =====
  | 'iframe:ready'            // V1.1 初始化完成
  | 'iframe:loaded'           // V1.1 页面加载完成
  | 'iframe:error'            // V1.1 内部错误

  // ===== 导航 =====
  | 'nav:change'              // 宿主切换菜单 → V1.1 切换页面
  | 'nav:changed'             // V1.1 确认页面已切换
  | 'nav:report'              // V1.1 上报当前路由

  // ===== 认证 =====
  | 'auth:token'              // 宿主传递 token → V1.1
  | 'auth:expired'            // V1.1 报告 token 过期
  | 'auth:logout'             // 宿主发起登出

  // ===== 主题/语言 =====
  | 'theme:change'            // 宿主切换主题
  | 'locale:change'           // 宿主切换语言

  // ===== 数据 =====
  | 'data:shared'             // 宿主传递共享数据 (用户信息等)
  | 'data:request'            // V1.1 请求宿主数据

  // ===== 响应 =====
  | 'ack'                     // 确认收到
  | 'error';                  // 错误响应


// ========== 具体 Payload 类型 ==========

// 导航消息
interface NavChangePayload {
  path: string;               // 目标路由，如 '/farm-hub/tasks'
  params?: Record<string, string>;  // 查询参数
  title?: string;             // 页面标题
}

// 认证消息
interface AuthTokenPayload {
  token: string;              // JWT token
  refreshToken?: string;
  expiresAt: number;          // Unix timestamp (ms)
}

// 主题消息
interface ThemeChangePayload {
  theme: string;              // 主题名称
  primaryColor?: string;      // 主色
  borderRadius?: string;      // 圆角
  fontSize?: string;          // 字号
}

// 共享数据消息
interface SharedDataPayload {
  user?: {
    oid: string;
    name: string;
    orgName: string;
    roles: string[];
  };
  greenhouseId?: string;      // 当前选中的温室
  locale?: string;            // 当前语言
}
```

#### 11.6.3 安全校验

```typescript
// V1.1 iframe 端 (消息接收器)
window.addEventListener('message', (event: MessageEvent) => {
  // 1. 来源校验 — 仅接受 iAGS 宿主
  if (event.origin !== ALLOWED_ORIGINS.iags) {
    console.warn('[iframe] 拒绝非法来源:', event.origin);
    return;
  }

  // 2. 格式校验
  const msg = event.data as IframeMessage;
  if (!msg.id || !msg.type || !msg.source || !msg.timestamp) {
    console.warn('[iframe] 消息格式无效');
    return;
  }

  // 3. 来源声明校验
  if (msg.source !== 'iags-host') {
    console.warn('[iframe] 来源声明不匹配');
    return;
  }

  // 4. 时效校验 (5分钟内)
  const age = Date.now() - new Date(msg.timestamp).getTime();
  if (Math.abs(age) > 5 * 60 * 1000) {
    console.warn('[iframe] 消息已过期');
    return;
  }

  // 5. 分发处理
  handleMessage(msg);
});

// 白名单
const ALLOWED_ORIGINS = {
  iags: 'http://localhost:3001',        // 开发环境
  iags_prod: 'https://iags.example.com', // 生产环境
};
```

#### 11.6.4 错误处理流程

```
V1.1 iframe 内部错误
  ├── React ErrorBoundary 捕获
  ├── 通过 postMessage 上报: { type: 'iframe:error', payload: { code, message, stack? } }
  ├── 宿主 iAGS 收到后:
  │   ├── 显示 Toast 通知用户
  │   ├── 记录到操作日志
  │   └── 严重错误 → 提示刷新 iframe
  └── V1.1 内部自动恢复 (重试/降级)

V1.1 iframe 长时间无响应 (30秒心跳超时)
  ├── 宿主 iAGS 检测心跳超时
  ├── 显示 "模块加载中..." → "加载失败，点击重试"
  └── 用户点击重试 → 重新加载 iframe src
```

---

### 11.7 认证与权限深度方案

#### 11.7.1 iAGS Process Tree 权限模型

iAGS 的权限基于 Process Tree：

```
Process (菜单/功能点)
├── process_code: 唯一标识
├── parent_oid: 父节点
├── route: 前端路由
├── icon: 图标
└── is_hidden: 是否隐藏

Role (角色)
├── role_code: 角色编码
└── 关联 Permissions (Action 粒度)

Role Authority (角色权限)
├── role_oid + process_oid + action_oid
└── value: 0=无权限, 1=只读, 2=读写

User Authority (用户权限)
├── user_oid + process_oid + action_oid
└── value: 覆盖角色权限的个性化设置
```

#### 11.7.2 React 端认证方案（Cookie 直通模式）

> **2026-05-20 更新**：采用 iAGS 原生 Cookie 认证，无需 JWT 桥接。

```typescript
// ========== 认证数据流（Cookie 直通） ==========
//
// 登录:
// POST /app/account/login { loginType:'userID', UserAID, Password }
//   → Vite proxy → iAGS WebServer → BizServer
//   → 验证通过 → Set-Cookie: yujiang-iAGS-x-access-token=<token>
//   → React 前端收到 200 → 调用 brokerGet(['account','getMyInfo']) 获取用户信息
//   → 调用 brokerGet(['org','getUserProcessTree']) 获取权限树
//   → 前端 useAuthStore 存储
//
// 后续 API 调用:
// brokerClient 所有请求默认 credentials: 'include'
// → Cookie 自动携带 → iAGS WebServer 验证 → BizServer 执行
//
// 关键: 前端不接触 token，不管理 Session，全部由 iAGS 原生机制处理

// ========== useAuthStore ==========
import { create } from 'zustand';
import { brokerGet } from '@/services/brokerClient';

interface User {
  userOID: string;
  userAID: string;
  userName: string;
  orgOID: string;
  orgName: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  processTree: ProcessNode[];
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];

  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  processTree: [],
  isAuthenticated: false,
  isLoading: true,
  permissions: [],

  login: async (username, password) => {
    const res = await fetch('/app/account/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        loginType: 'userID',
        UserAID: username,
        Password: password,
        isCreateToken: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.errmessage || '登录失败');
    }

    // Cookie 已由 iAGS 设置，现在获取用户信息和权限树
    const userInfo = await brokerGet<{ userInfo: User }>(['account', 'getMyInfo']);
    const processTree = await brokerGet<{ children: ProcessNode[] }>(['org', 'getUserProcessTree']);

    set({
      user: userInfo as any,
      processTree: (processTree as any)?.children || [],
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    await fetch('/app/account/logout', {
      method: 'POST',
      credentials: 'include',
    });
    set({ user: null, processTree: [], isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const result = await brokerGet<{ valid: boolean }>(['account', 'checkLogin']);
      if ((result as any)?.valid) {
        // 已登录，刷新用户信息
        const userInfo = await brokerGet<{ userInfo: User }>(['account', 'getMyInfo']);
        set({ user: userInfo as any, isAuthenticated: true, isLoading: false });
        return true;
      }
    } catch {
      // Cookie 无效或过期
    }
    set({ isAuthenticated: false, isLoading: false });
    return false;
  },
}));


// ========== 菜单过滤 ==========
// 根据 processTree 的 is_hidden + 用户权限 过滤 Sidebar 菜单项
function filterMenuByPermissions(
  processTree: ProcessNode[],
  permissions: string[]
): ProcessNode[] {
  return processTree
    .filter(node => !node.is_hidden)
    .filter(node => permissions.includes(node.process_code))
    .map(node => ({
      ...node,
      children: filterMenuByPermissions(node.children || [], permissions),
    }));
}


// ========== 按钮级权限 ==========
// <Can action="crop:write" process="crop_management">
//   <Button>新增</Button>
// </Can>

function Can({ children, action, process }: CanProps) {
  const permissions = useAuthStore(s => s.permissions);
  const can = permissions.includes(`${process}:${action}`);
  return can ? <>{children}</> : null;
}


// ========== API 鉴权 ==========
// 由 iAGS WebServer 中间件自动处理（通过 Cookie 中的 Session）
// 前端不需要额外做任何事——broker 请求失败返回 401 时自动跳转登录
}
```

#### 11.7.3 完整认证时序（Cookie 直通模式）

```
用户                     React前端                   Vite Proxy              iAGS WebServer/BizServer
 │                         │                           │                          │
 │  输入用户名密码          │                           │                          │
 │────────────────────────→│                           │                          │
 │                         │  POST /app/account/login  │                          │
 │                         │  {loginType:'userID',     │                          │
 │                         │   UserAID, Password}      │                          │
 │                         │──────────────────────────→│                          │
 │                         │                           │─────────────────────────→│
 │                         │                           │                          │ 验证密码
 │                         │                           │                          │ 查询权限树
 │                         │                           │                          │ 生成 access_token
 │                         │                           │                          │
 │                         │                           │  Set-Cookie:             │
 │                         │                           │  yujiang-iAGS-x-         │
 │                         │                           │  access-token=<token>    │
 │                         │                           │←─────────────────────────│
 │                         │                           │                          │
 │                         │  200 OK (Cookie已设置)     │                          │
 │                         │←──────────────────────────│                          │
 │                         │                           │                          │
 │  获取用户信息            │                           │                          │
 │                         │  GET /app/system/broker/  │                          │
 │                         │  getFromBiz?bizURLParams= │                          │
 │                         │  ["account","getMyInfo"]  │                          │
 │                         │  credentials:'include'    │                          │
 │                         │──────────────────────────→│                          │
 │                         │  Cookie 自动携带 ─────────┼─────────────────────────→│
 │                         │                           │                          │ 验证Session
 │                         │                           │  {code:0,                │
 │                         │                           │   data:{userOID,...}}    │
 │                         │←──────────────────────────┼──────────────────────────│
 │                         │                           │                          │
 │  获取权限树              │                           │                          │
 │                         │  GET /app/system/broker/  │                          │
 │                         │  getFromBiz?bizURLParams= │                          │
 │                         │  ["org","getUserProcess   │                          │
 │                         │   Tree"]                  │                          │
 │                         │──────────────────────────→│                          │
 │                         │  Cookie 自动携带 ─────────┼─────────────────────────→│
 │                         │                           │  {code:0,                │
 │                         │                           │   data:{children:[...]}} │
 │                         │←──────────────────────────┼──────────────────────────│
 │                         │                           │                          │
 │  缓存用户信息+权限树      │                           │                          │
 │  渲染权限菜单            │                           │                          │
 │←────────────────────────│                           │                          │
 │                         │                           │                          │
 │  === 后续API调用 ===     │                           │                          │
 │                         │  brokerGet(['iAGS',       │                          │
 │                         │   'v11Crop',              │                          │
 │                         │   'getVarietyList'],      │                          │
 │                         │   {page:1})               │                          │
 │                         │──────────────────────────→│                          │
 │                         │  Cookie 自动携带 ─────────┼─────────────────────────→│
 │                         │                           │                          │ 验证Session
 │                         │                           │                          │ 执行业务逻辑
 │                         │                           │  {code:0,                │
 │                         │                           │   data:{rows:[...]}}     │
 │                         │←──────────────────────────┼──────────────────────────│
 │                         │                           │                          │
```

**关键优势**：
- 前端完全不接触 token 字符串，不存在 token 泄漏风险
- Session 续期由 iAGS 原生机制处理（Cookie 过期自动刷新）
- Token 过期时 iAGS 自动返回 401，前端只需拦截跳转登录
- 零代码维护认证逻辑

---

### 11.8 开发环境搭建细节

#### 11.8.1 完整开发环境配置（broker 直调模式）

> **2026-05-20 更新**：废弃 Express 适配层，React 前端直接通过 Vite proxy 调用 iAGS broker。

```typescript
// vite.config.ts (唯一需要的配置)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 5189,
    proxy: {
      // 所有 /app 请求转发到 iAGS WebServer → BizServer
      '/app': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // 确保 Set-Cookie 在 localhost:5189 生效
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              cookies.forEach((cookie, i) => {
                if (cookies[i]) {
                  cookies[i] = cookies[i]
                    .replace(/Domain=[^;]+;?/i, '')
                    .replace(/Secure;?/i, '');
                }
              });
            }
          });
        },
      },
      // WebSocket 代理（用于 Socket.IO 实时数据）
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
    hmr: { overlay: true },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
          'vendor-charts': ['recharts'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
          ],
        },
      },
    },
  },
});
```

#### 11.8.2 本地开发启动顺序

```bash
# 1. 启动 iAGS 后端 (BizServer + PoolingServer)
cd D:\iAGS
# 启动 BizServer (端口 3000，含 WebServer + broker)
node yujiang.foil.node.bizserver/index.js
# 启动 PoolingServer (IoT 数据)
node tm.iAGS.poolingServer/index.js

# 2. 启动 React 前端 (端口 5189)
cd D:\iAGS-v2
npm run dev

# 3. 浏览器访问
# 新 React 前端: http://localhost:5189
# Vite proxy 自动将 /app 请求转发到 http://localhost:3000
# Cookie 通过 proxy 自动处理，前端无需额外配置
```

#### 11.8.3 跨域 Cookie 处理

```
开发环境 Cookie 流向 (broker 直调):
  Browser (localhost:5189)
    │
    ├── 登录请求 POST /app/account/login
    │   → Vite Proxy → localhost:3000 (iAGS BizServer)
    │   → 验证密码 → 生成 Session
    │   → Set-Cookie: yujiang-iAGS-x-access-token=<foil_token>; HttpOnly; Path=/
    │
    ├── Vite Proxy 自动处理 Set-Cookie:
    │   → 移除 Secure 标记 (localhost 非 HTTPS)
    │   → 移除 Domain 限制 (保证 localhost:5189 可用)
    │   → Cookie 写入浏览器
    │
    └── 后续 broker 请求自动携带:
        Cookie: yujiang-iAGS-x-access-token=<foil_token>
        → Vite Proxy 转发到 localhost:3000
        → iAGS WebServer 中间件验证 Session
        → BizServer 执行业务逻辑
```

**Cookie 关键参数**：
- Cookie 名称: `yujiang-iAGS-x-access-token`
- Access Token 有效期: 8小时（iAGS 默认）
- Refresh Token 有效期: 30天
- Cookie 类型: httpOnly（JS 无法读取，防 XSS）
- 免登录 URL: `/app/account/showLogin`, `/app/account/login`, `/app/system/broker/*`

---

## 附录A：iAGS 旧系统模块 → 新系统映射表（更新版）
> 制定依据：V1.1 系统架构全量分析 + iAGS 系统架构全量分析 + 两系统代码级对比
>
> **策略概要**：
> - **第一期（现在，24周）**：V1.1 后端 API 对齐 iAGS → SQLite→MySQL → V1.1 系统接入 iAGS 运行 → iAGS 前端全重写为 React → V1.1 业务模块全部迁入 iAGS。**iAGS 后端不动。**
> - **第二期（以后，待定）**：前端全部上线后，根据实际情况决定是否逐模块替换 Foil 后端为 Express。

---

## 附录D：文档更新日志

| 日期 | 版本 | 更新内容 |
|------|------|---------|
| 2026-05-20 | V1.0 | 初始版本，基于两系统全量资产盘点 |
| 2026-05-20 | V1.1 | 加入架构师审查意见 + 八大关键领域深化方案（§10-§11） |
| 2026-05-20 | V1.2 | **重大优化**：废弃 Express 适配层方案，改为 broker 直调 + Cookie 认证。主要变更： |
|      |      | - API 对接：foilAdapter(~700行) → brokerClient(~90行)，直接使用 iAGS broker 机制 |
|      |      | - 认证方案：JWT+Redis桥接 → iAGS Cookie 直通（Vite proxy 同域） |
|      |      | - 数据库：新增 V11_ 前缀命名规范 + 建表示例 |
|      |      | - iframe：新增 Socket.IO RealtimeBridge 实时数据桥接方案 |
|      |      | - IoT 层：poolingServer HTTP 接口 → Redis 直读（零行修改） |
|      |      | - 部署架构：去除 Express 代理层（端口3002），减少一层网络跳转 |
|      |      | - 开发环境：仅需 Vite proxy 配置 + iAGS BizServer，无需启动额外服务 |
|      |      | 以上优化来源于 `iags升级规划20260520.md` 方案的对比分析 |
