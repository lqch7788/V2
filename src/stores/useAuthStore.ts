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
    // 模拟原 iAGS 16 个模块的完整菜单树
    processTree.value = [
      {
        processOID: 'HOME-OID', processAID: 'home', name: '首页',
        route: '/home', children: [], authority: {}, isAuthorized: true,
      },
      {
        processOID: 'DEVICE-OID', processAID: 'device', name: '设备监控',
        route: '', children: [
          { processOID: 'DEV-AIR', processAID: 'device_air', name: '空调系统', route: '/legacy/device', children: [], authority: {}, isAuthorized: true },
          { processOID: 'DEV-TEMP', processAID: 'device_temp', name: '温度控制', route: '/legacy/device', children: [], authority: {}, isAuthorized: true },
          { processOID: 'DEV-SPRAY', processAID: 'device_spray', name: '喷雾系统', route: '/legacy/device', children: [], authority: {}, isAuthorized: true },
          { processOID: 'DEV-WATER', processAID: 'device_water', name: '水肥一体', route: '/legacy/device', children: [], authority: {}, isAuthorized: true },
          { processOID: 'DEV-SHADE', processAID: 'device_shade', name: '内遮阳', route: '/legacy/device', children: [], authority: {}, isAuthorized: true },
          { processOID: 'DEV-FAN', processAID: 'device_fan', name: '侧窗风机', route: '/legacy/device', children: [], authority: {}, isAuthorized: true },
          { processOID: 'DEV-VALVE', processAID: 'device_valve', name: '风阀', route: '/legacy/device', children: [], authority: {}, isAuthorized: true },
          { processOID: 'DEV-ENV', processAID: 'device_env', name: '环境监控', route: '/legacy/device', children: [], authority: {}, isAuthorized: true },
        ], authority: {}, isAuthorized: true,
      },
      {
        processOID: 'CURVE-OID', processAID: 'curve', name: '曲线分析',
        route: '', children: [
          { processOID: 'CUR-REALTIME', processAID: 'curve_realtime', name: '实时曲线', route: '/legacy/curve', children: [], authority: {}, isAuthorized: true },
          { processOID: 'CUR-HISTORY', processAID: 'curve_history', name: '历史曲线', route: '/legacy/curve', children: [], authority: {}, isAuthorized: true },
          { processOID: 'CUR-FERT', processAID: 'curve_fert', name: '施肥曲线', route: '/legacy/curve', children: [], authority: {}, isAuthorized: true },
          { processOID: 'CUR-YIELD', processAID: 'curve_yield', name: '产量曲线', route: '/legacy/curve', children: [], authority: {}, isAuthorized: true },
          { processOID: 'CUR-ENERGY', processAID: 'curve_energy', name: '能耗曲线', route: '/legacy/curve', children: [], authority: {}, isAuthorized: true },
          { processOID: 'CUR-DEVRUN', processAID: 'curve_devrun', name: '设备运行', route: '/legacy/curve', children: [], authority: {}, isAuthorized: true },
        ], authority: {}, isAuthorized: true,
      },
      {
        processOID: 'CONTROL-OID', processAID: 'control', name: '设备控制',
        route: '', children: [
          { processOID: 'CTL-SMART', processAID: 'control_smart', name: '智能控制', route: '/legacy/control', children: [], authority: {}, isAuthorized: true },
          { processOID: 'CTL-MONITOR', processAID: 'control_monitor', name: '运行监测', route: '/legacy/control', children: [], authority: {}, isAuthorized: true },
          { processOID: 'CTL-MATRIX', processAID: 'control_matrix', name: '矩阵控制', route: '/legacy/control', children: [], authority: {}, isAuthorized: true },
        ], authority: {}, isAuthorized: true,
      },
      {
        processOID: 'REPORT-OID', processAID: 'report', name: '报表中心',
        route: '', children: [
          { processOID: 'RPT-DAY', processAID: 'report_day', name: '日报表', route: '/legacy/report', children: [], authority: {}, isAuthorized: true },
          { processOID: 'RPT-MONTH', processAID: 'report_month', name: '月报表', route: '/legacy/report', children: [], authority: {}, isAuthorized: true },
          { processOID: 'RPT-CUSTOM', processAID: 'report_custom', name: '自定义报表', route: '/legacy/report', children: [], authority: {}, isAuthorized: true },
        ], authority: {}, isAuthorized: true,
      },
      {
        processOID: 'WARNING-OID', processAID: 'warning', name: '告警管理',
        route: '', children: [
          { processOID: 'WARN-CURRENT', processAID: 'warning_current', name: '当前告警', route: '/legacy/warning', children: [], authority: {}, isAuthorized: true },
          { processOID: 'WARN-HISTORY', processAID: 'warning_history', name: '历史告警', route: '/legacy/warning', children: [], authority: {}, isAuthorized: true },
        ], authority: {}, isAuthorized: true,
      },
      {
        processOID: 'ENERGY-OID', processAID: 'energy', name: '能耗管理',
        route: '', children: [
          { processOID: 'ENG-ELEC', processAID: 'energy_elec', name: '用电能耗', route: '/legacy/energy', children: [], authority: {}, isAuthorized: true },
          { processOID: 'ENG-WATER', processAID: 'energy_water', name: '用水能耗', route: '/legacy/energy', children: [], authority: {}, isAuthorized: true },
        ], authority: {}, isAuthorized: true,
      },
      {
        processOID: 'RESUME-OID', processAID: 'resume', name: '履历管理',
        route: '', children: [
          { processOID: 'RSM-DEVICE', processAID: 'resume_device', name: '设备履历', route: '/legacy/resume', children: [], authority: {}, isAuthorized: true },
          { processOID: 'RSM-CROP', processAID: 'resume_crop', name: '种植履历', route: '/legacy/resume', children: [], authority: {}, isAuthorized: true },
        ], authority: {}, isAuthorized: true,
      },
      {
        processOID: 'APP-OID', processAID: 'application', name: '智能应用',
        route: '', children: [
          { processOID: 'APP-FERT', processAID: 'app_fert', name: '智能施肥', route: '/legacy/application', children: [], authority: {}, isAuthorized: true },
          { processOID: 'APP-IRR', processAID: 'app_irr', name: '智能灌溉', route: '/legacy/application', children: [], authority: {}, isAuthorized: true },
        ], authority: {}, isAuthorized: true,
      },
      {
        processOID: 'CAMERA-OID', processAID: 'camera', name: '视频监控',
        route: '', children: [
          { processOID: 'CAM-LIVE', processAID: 'camera_live', name: '实时视频', route: '/legacy/camera', children: [], authority: {}, isAuthorized: true },
        ], authority: {}, isAuthorized: true,
      },
      {
        processOID: 'MORE-OID', processAID: 'more', name: '更多设置',
        route: '', children: [
          { processOID: 'MORE-PARAM', processAID: 'more_param', name: '参数设置', route: '/legacy/more', children: [], authority: {}, isAuthorized: true },
          { processOID: 'MORE-AREA', processAID: 'more_area', name: '温室区域', route: '/legacy/more', children: [], authority: {}, isAuthorized: true },
          { processOID: 'MORE-CROP', processAID: 'more_crop', name: '作物管理', route: '/legacy/more', children: [], authority: {}, isAuthorized: true },
        ], authority: {}, isAuthorized: true,
      },
      {
        processOID: 'SYSTEM-OID', processAID: 'systemset', name: '系统设置',
        route: '', children: [
          { processOID: 'SYS-CONFIG', processAID: 'sys_config', name: '系统配置', route: '/legacy/systemset', children: [], authority: {}, isAuthorized: true },
        ], authority: {}, isAuthorized: true,
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
