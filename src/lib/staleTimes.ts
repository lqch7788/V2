// iAGS 2.0 — TanStack Vue Query 缓存策略常量
// 按数据类型分层配置 staleTime，替代 V1.1 的三级缓存（IndexedDB + localStorage）

export const STALE_TIMES = {
  /** 实时数据 — 不缓存（WebSocket 推送，不走 HTTP 缓存） */
  REALTIME: 0,

  /** 准实时 — 5秒（设备状态） */
  NEAR_REAL: 5 * 1000,

  /** 常规 — 30秒（CRUD 列表、业务数据） */
  NORMAL: 30 * 1000,

  /** 稳定 — 5分钟（用户信息、权限、配置） */
  STABLE: 5 * 60 * 1000,

  /** 参考数据 — 30分钟（字典、枚举、静态配置） */
  REFERENCE: 30 * 60 * 1000,
} as const

export type StaleTimeKey = keyof typeof STALE_TIMES
