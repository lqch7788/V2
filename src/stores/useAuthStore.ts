// iAGS 2.0 — 认证 Store (Pinia)
// 对接 iAGS 后端 Cookie 认证体系
// Cookie: yujiang-iAGS-x-access-token (httpOnly, 8h 有效期)
// 登录: POST /app/account/login → Set-Cookie → 后续请求自动携带

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { brokerGet } from '@/services/brokerClient'

// === 用户信息 ===
export interface User {
  userOID: string
  userAID: string
  userName: string
  orgOID: string
  orgName: string
  roles: string[]
  avatar?: string
}

// === iAGS 权限树节点 ===
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

export const useAuthStore = defineStore('auth', () => {
  // ===== State =====
  const user = ref<User | null>(null)
  const processTree = ref<ProcessNode[]>([])
  const isLoading = ref(true)

  // ===== Getters =====
  const isAuthenticated = computed(() => user.value !== null)
  const userName = computed(() => user.value?.userName || '')
  const userOrgName = computed(() => user.value?.orgName || '')

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

  // ===== 登录（对接 iAGS Cookie 认证）=====
  async function login(username: string, password: string) {
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
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.errmessage || '登录失败')
    }

    // Cookie 已由 iAGS 后端设置，现在获取用户信息和权限树
    await fetchUserInfo()
    await fetchProcessTree()
  }

  // ===== 登出 =====
  async function logout() {
    await fetch('/app/account/logout', {
      method: 'POST',
      credentials: 'include',
    })
    user.value = null
    processTree.value = []
  }

  // ===== 获取用户信息 =====
  async function fetchUserInfo() {
    const result = await brokerGet<User>(['account', 'getMyInfo'])
    user.value = result as unknown as User
  }

  // ===== 获取权限树 =====
  async function fetchProcessTree() {
    const result = await brokerGet<{ children: ProcessNode[] }>(
      ['org', 'getUserProcessTree']
    )
    processTree.value =
      (result as unknown as { children: ProcessNode[] })?.children || []
  }

  // ===== 检查认证状态（应用启动时调用）=====
  async function checkAuth(): Promise<boolean> {
    isLoading.value = true
    try {
      const result = await brokerGet<{ valid: boolean }>([
        'account',
        'checkLogin',
      ])
      if ((result as unknown as { valid: boolean })?.valid) {
        await fetchUserInfo()
        await fetchProcessTree()
        isLoading.value = false
        return true
      }
    } catch {
      // Cookie 过期或无效
    }
    isLoading.value = false
    return false
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
  }
})
