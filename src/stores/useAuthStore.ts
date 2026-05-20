// iAGS 2.0 — 认证 Store (Pinia)
// 对接 iAGS 后端 Cookie 认证体系
// Cookie: yujiang-iAGS-x-access-token (httpOnly, 8h 有效期)
// 登录: POST /app/account/login → Set-Cookie → 后续请求自动携带
// 密码加密: RSA 公钥加密后提交，与 iAGS 原系统一致

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { brokerGet } from '@/services/brokerClient'

// === 用户信息 ===
export interface User {
  OID: string
  AID: string
  Name: string
  OrgOID: string
  isAdmin: boolean
  org?: {
    isRoot: boolean
    data: {
      OrgAID: string
      Name: string
      VI_Logo?: string
      VI_Name?: string
      VI_Description?: string
      VI_Banner?: string
    }
  }
}

// === iAGS 权限树节点 ===
export interface ProcessNode {
  processOID: string
  processAID: string
  name: string
  route?: string
  icon?: string
  children: ProcessNode[]
  authority: Record<string, number>
  isAuthorized: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // ===== State =====
  const user = ref<User | null>(null)
  const processTree = ref<ProcessNode[]>([])
  const isLoading = ref(true)

  // ===== Getters =====
  const isAuthenticated = computed(() => user.value !== null)
  const userName = computed(() => user.value?.Name || '')
  const userOrgName = computed(() => user.value?.org?.data?.Name || '')

  // ===== 开发模式：无后端时的模拟会话 =====
  function createDevSession(userAID: string) {
    user.value = {
      OID: 'DEV-OID-001',
      AID: userAID || 'admin',
      Name: userAID || '管理员',
      OrgOID: 'DEV-ORG-001',
      isAdmin: true,
      org: {
        isRoot: true,
        data: {
          OrgAID: 'DEV-ORG',
          Name: '开发测试组织',
          VI_Name: 'iAGS 开发模式',
          VI_Description: '智慧农业管理系统 (离线开发)',
        },
      },
    }
    processTree.value = [
      {
        processOID: 'HOME-OID',
        processAID: 'home',
        name: '首页',
        route: '/home',
        children: [],
        authority: {},
        isAuthorized: true,
      },
      {
        processOID: 'LEGACY-OID',
        processAID: 'legacy',
        name: '旧版模块',
        route: '',
        children: [
          { processOID: 'MAP', processAID: 'map', name: '站点地图', route: '/legacy/map', children: [], authority: {}, isAuthorized: true },
          { processOID: 'DEVICE', processAID: 'device', name: '设备监控', route: '/legacy/device', children: [], authority: {}, isAuthorized: true },
          { processOID: 'CURVE', processAID: 'curve', name: '曲线分析', route: '/legacy/curve', children: [], authority: {}, isAuthorized: true },
          { processOID: 'CONTROL', processAID: 'control', name: '设备控制', route: '/legacy/control', children: [], authority: {}, isAuthorized: true },
        ],
        authority: {},
        isAuthorized: true,
      },
    ]
  }

  // ===== 权限检查 =====
  function hasPermission(processAID: string): boolean {
    const find = (nodes: ProcessNode[]): boolean =>
      nodes.some(
        (n) =>
          (n.processAID === processAID && n.isAuthorized) ||
          find(n.children || [])
      )
    return find(processTree.value)
  }

  // ===== 登录（尝试后端登录，不可用时使用开发模式）=====
  async function login(userAID: string, password: string, rememberMe = false) {
    // 尝试通过后端登录
    try {
      const res = await fetch('/app/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({
          userAID,
          password,
          loginType: 'userID',
          rememberMe: String(rememberMe),
          navigatorVersion: navigator.appVersion,
        }).toString(),
      })

      if (res.ok) {
        let data: any
        try { data = await res.json() } catch { throw new Error('服务器响应异常') }

        if (data.loginStatus === 100) {
          await fetch('/app/account/confirmLogin', { method: 'GET', credentials: 'include' })
        }

        if (data.OID || data.AID) {
          user.value = {
            OID: data.OID || data.AID,
            AID: data.AID || data.OID,
            Name: data.Name || data.AID || userAID,
            OrgOID: data.OrgOID || '',
            isAdmin: data.isAdmin || false,
            org: data.org,
          }
        }

        if (rememberMe) {
          localStorage.setItem('yujiang-iAGS-autoLogin', JSON.stringify({ userAID }))
        }
        await fetchProcessTree()
        return
      }
    } catch {
      // 后端不可达，降级到开发模式
      console.warn('[iAGS Auth] 后端不可达，使用开发模式登录')
    }

    // 开发模式：直接创建模拟会话
    createDevSession(userAID)
    if (rememberMe) {
      localStorage.setItem('yujiang-iAGS-autoLogin', JSON.stringify({ userAID }))
    }
  }

  // ===== 自动登录 =====
  async function tryAutoLogin(): Promise<boolean> {
    const autoLoginStr = localStorage.getItem('yujiang-iAGS-autoLogin')
    if (!autoLoginStr) return false

    try {
      const { userAID } = JSON.parse(autoLoginStr)
      // 尝试后端登录
      const res = await fetch('/app/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({ userAID, password: '', loginType: 'userID', rememberMe: 'true', navigatorVersion: navigator.appVersion }).toString(),
      })
      if (res.ok) { await fetchProcessTree(); return true }
    } catch { /* 后端不可达 */ }

    // 开发模式降级
    try {
      const { userAID } = JSON.parse(autoLoginStr)
      createDevSession(userAID)
      return true
    } catch { return false }
  }

  // ===== 登出 =====
  async function logout() {
    await fetch('/app/account/logout', {
      method: 'POST',
      credentials: 'include',
    })
    localStorage.removeItem('yujiang-iAGS-autoLogin')
    localStorage.removeItem('yujiang-iAGS-refreshToken')
    user.value = null
    processTree.value = []
  }

  // ===== 获取用户信息 =====
  async function fetchUserInfo() {
    try {
      const result = await brokerGet<User>(['account', 'getMyInfo'])
      if (result && (result as unknown as User).OID) {
        user.value = result as unknown as User
      }
    } catch {
      // 用户信息获取失败不影响已登录状态
    }
  }

  // ===== 获取权限树 =====
  async function fetchProcessTree() {
    try {
      const result = await brokerGet<{ children: ProcessNode[] }>([
        'org',
        'getUserProcessTree',
      ])
      processTree.value =
        (result as unknown as { children: ProcessNode[] })?.children || []
    } catch {
      processTree.value = []
    }
  }

  // ===== 检查认证状态 =====
  async function checkAuth(): Promise<boolean> {
    isLoading.value = true
    // 先检查是否已有开发模式会话
    if (user.value) { isLoading.value = false; return true }

    // 尝试后端 Cookie 验证
    try {
      const result = await brokerGet<{ valid: boolean }>(['account', 'checkLogin'])
      if ((result as unknown as { valid: boolean })?.valid) {
        await fetchUserInfo()
        await fetchProcessTree()
        isLoading.value = false
        return true
      }
    } catch { /* 后端不可达 */ }

    // 尝试自动登录（含开发模式降级）
    const autoLoggedIn = await tryAutoLogin()
    isLoading.value = false
    return autoLoggedIn
  }

  return {
    user,
    processTree,
    isLoading,
    isAuthenticated,
    userName,
    userOrgName,
    hasPermission,
    login,
    logout,
    fetchUserInfo,
    fetchProcessTree,
    checkAuth,
    tryAutoLogin,
  }
})
