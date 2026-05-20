// iAGS 2.0 — Vue 3 应用入口
// 加载顺序: Pinia → Vue Router → Element Plus → vue-i18n → App 挂载

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

import App from './App.vue'
import { router } from './router'
import { i18n } from './i18n'

// 全局样式
import './styles/index.css'

const app = createApp(App)

// 1. Pinia 状态管理（+ 持久化插件）
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// 2. Vue Router 路由
app.use(router)

// 3. Element Plus UI 组件库（中文语言包）
app.use(ElementPlus, { locale: zhCn })

// 4. TanStack Vue Query（服务端状态缓存）
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})
app.use(VueQueryPlugin, { queryClient })

// 5. vue-i18n 多语言
app.use(i18n)

// 挂载
app.mount('#app')
