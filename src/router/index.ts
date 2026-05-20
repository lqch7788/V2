// iAGS 2.0 — Vue Router 4 路由配置
// 认证守卫: 检查 iAGS Cookie 是否有效，无效则跳转登录页
// 权限守卫: 检查用户是否有对应 processAID 的访问权限

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ===== 登录页（无需认证）=====
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { title: 'iAGS 登录' },
    },

    // ===== 主布局（需认证）=====
    {
      path: '/',
      component: () => import('@/components/layout/MainLayout.vue'),
      redirect: '/home',
      children: [
        // 首页仪表盘
        {
          path: 'home',
          name: 'Home',
          component: () => import('@/pages/HomePage.vue'),
          meta: { title: '首页', requiresAuth: true },
        },

        // ===== 旧模块 iframe 过渡页（动态路由）=====
        {
          path: 'legacy/:module',
          name: 'LegacyPage',
          component: () => import('@/pages/legacy/LegacyPage.vue'),
          meta: { title: '旧模块', requiresAuth: true },
        },

        // ===== V1.1 模块迁入占位（后续逐步添加）=====
        // 作物管理、计划管理、库存管理、人工管理等模块将在
        // iAGS 旧模块全部迁移完成后，从 V1.1 整合进来

        // 404
        {
          path: ':pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('@/pages/NotFoundPage.vue'),
          meta: { title: '404' },
        },
      ],
    },
  ],
})

// === 全局前置守卫：认证 + 权限 ===
router.beforeEach(async (to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || 'iAGS 2.0'} — 智慧农业管理系统`

  // 登录页无需认证
  if (to.path === '/login') {
    return next()
  }

  // 检查 iAGS Cookie 认证状态
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    const valid = await auth.checkAuth()
    if (!valid) {
      // Cookie 无效 → 跳转登录页
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }
  }

  // 检查页面权限（如果路由配置了 processAID）
  const processAID = to.meta.processAID as string | undefined
  if (processAID && !auth.hasPermission(processAID)) {
    return next({ path: '/403' })
  }

  next()
})

export { router }
