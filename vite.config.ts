import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// iAGS 2.0 — Vue 3 前端 Vite 配置
// 核心策略：通过 proxy 将 /app 请求转发到 iAGS BizServer (localhost:4000)
// Cookie 认证在 proxy 层自动处理，浏览器视角为"同源"
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    // === iAGS 后端代理配置 ===
    proxy: {
      // 所有 /app 请求转发到 iAGS BizServer（broker API + 登录 + 静态资源）
      '/app': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // 确保 iAGS 的 Set-Cookie 能在 localhost:5173 上生效
            const cookies = proxyRes.headers['set-cookie']
            if (cookies) {
              cookies.forEach((cookie, i) => {
                if (cookies[i]) {
                  cookies[i] = cookies[i]
                    .replace(/Domain=[^;]+;?/i, '')   // 移除 Domain 限制
                    .replace(/Secure;?/i, '')          // 开发环境移除 Secure
                }
              })
            }
          })
        },
      },

      // WebSocket 代理（Socket.IO 实时数据推送）
      '/socket.io': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          'chart-vendor': ['echarts', 'vue-echarts'],
          'utils-vendor': ['date-fns', 'zod', 'xlsx', 'file-saver', 'jspdf'],
        },
      },
    },
  },
})
