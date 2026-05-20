// iAGS 2.0 — iframe postMessage 通信协议类型定义

// === 消息信封 ===
export interface IagsMessage<T = unknown> {
  source: 'iags-shell' | 'iags-legacy'
  type: string
  payload: T
  timestamp: number
  messageId: string
}

// === Shell → iframe 消息类型 ===
export type ShellMessageType =
  | 'SHELL_READY'
  | 'USER_INFO'
  | 'ROUTE_CHANGE'
  | 'THEME_CHANGE'
  | 'LOCALE_CHANGE'
  | 'REALTIME_DATA'

// === iframe → Shell 消息类型 ===
export type LegacyMessageType =
  | 'IFRAME_READY'
  | 'IFRAME_RESIZE'
  | 'TITLE_UPDATE'
  | 'NAVIGATION'
  | 'ERROR'

// === 用户信息负载 ===
export interface UserInfoPayload {
  userOID: string
  userAID: string
  userName: string
  orgOID: string
  orgName: string
  roles: string[]
  accessToken: string
}

// === 路由变更负载 ===
export interface RouteChangePayload {
  module: string
  page: string
  params: Record<string, string>
}

// === 主题变更负载 ===
export interface ThemeChangePayload {
  theme: 'light' | 'dark'
  primaryColor: string
  fontSize: number
}

// === 标题更新负载 ===
export interface TitleUpdatePayload {
  title: string
  breadcrumb: string[]
}

// === 高度变更负载 ===
export interface IframeResizePayload {
  height: number
}

// === 错误负载 ===
export interface ErrorPayload {
  code: string
  message: string
  detail?: string
}
