// iAGS 2.0 — 核心实体类型定义
// 从 V1.1 src/types/ 复制，框架无关，可直接复用

// === 通用类型 ===
export interface BaseEntity {
  oid: string
  createdAt: string
  updatedAt: string
}

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
  children?: SelectOption[]
}

// === 分页 ===
export interface PaginationQuery {
  page: number
  pageSize: number
  keyword?: string
  [key: string]: unknown
}

export interface PaginatedResult<T> {
  rows: T[]
  total: number
}

// === broker API 参数 ===
// bizURLParams 三段式: ["iAGS", "module", "action"]
export type BizModule = 'iAGS' | 'v11Crop' | 'v11Farm' | 'v11Labor' | 'v11Material' | 'v11Approval' | 'v11Summary' | 'v11System' | 'v11Production'
export type BizParams = [string, string, string]

// === 作物品种 ===
export interface CropVariety extends BaseEntity {
  varietyOID: string
  cropCode: string
  categoryCode: string
  categoryName: string
  typeCode: string
  typeName: string
  varietyCode: string
  varietyName: string
  alias: string
  status: 'active' | 'inactive'
}

// === 用户 ===
export interface User extends BaseEntity {
  userOID: string
  userAID: string
  userName: string
  orgOID: string
  orgName: string
  roles: string[]
}

// === 权限节点 ===
export interface ProcessNode {
  processOID: string
  processAID: string
  name: string
  route: string
  icon?: string
  children: ProcessNode[]
  authority: Record<string, number>
  isAuthorized: boolean
}
