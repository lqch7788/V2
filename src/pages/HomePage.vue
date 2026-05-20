<!-- iAGS 2.0 — 首页仪表盘（复刻原 iAGS 地图首页）
     原 iAGS 登录后跳转 /app/map 显示 Baidu Map + 站点列表
     Vue 3 过渡期: 仪表盘卡片布局 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const auth = useAuthStore()
const currentTime = ref(new Date().toLocaleString('zh-CN'))

onMounted(() => {
  setInterval(() => {
    currentTime.value = new Date().toLocaleString('zh-CN')
  }, 1000)
})
</script>

<template>
  <div class="home-dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-banner">
      <h2 class="welcome-title">欢迎回来，{{ auth.userName }}</h2>
      <p class="welcome-time">{{ currentTime }}</p>
      <p class="welcome-org">所属组织：{{ auth.userOrgName }}</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-green">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 20h20M5 20V12m5 8V8m5 8v-4m5 4V4"/>
          </svg>
        </div>
        <div class="stat-body">
          <p class="stat-label">系统状态</p>
          <p class="stat-value text-green-600">运行中</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-blue">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8m-4-4v4"/>
          </svg>
        </div>
        <div class="stat-body">
          <p class="stat-label">可访问模块</p>
          <p class="stat-value text-blue-600">{{ auth.processTree.length }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-amber">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 7v5l3 3"/>
          </svg>
        </div>
        <div class="stat-body">
          <p class="stat-label">当前时间</p>
          <p class="stat-value text-amber-600">{{ currentTime.split(' ')[1] }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-purple">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <div class="stat-body">
          <p class="stat-label">系统版本</p>
          <p class="stat-value text-purple-600">v2.0.0</p>
        </div>
      </div>
    </div>

    <!-- 快捷操作区域（原 iAGS 此处为 Baidu Map） -->
    <div class="quick-actions">
      <h3 class="section-title">快捷操作</h3>
      <div class="actions-grid">
        <div class="action-card" @click="$router.push('/legacy/home')">
          <p class="action-title">旧版仪表盘</p>
          <p class="action-desc">查看原 iAGS 系统仪表盘数据</p>
        </div>
        <div class="action-card" @click="$router.push('/legacy/map')">
          <p class="action-title">站点地图</p>
          <p class="action-desc">选择并进入站点管理页面</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-dashboard {
  padding: 24px;
  max-width: 1200px;
}

.welcome-banner {
  background: linear-gradient(135deg, #1e8449, #27ae60);
  color: #fff;
  padding: 28px 32px;
  border-radius: 10px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.16);
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 6px;
}

.welcome-time, .welcome-org {
  font-size: 14px;
  opacity: 0.85;
  margin: 2px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-green { background: #e8f5e9; color: #2e7d32; }
.stat-icon-blue { background: #e3f2fd; color: #1565c0; }
.stat-icon-amber { background: #fff8e1; color: #e65100; }
.stat-icon-purple { background: #f3e5f5; color: #7b1fa2; }

.stat-label {
  font-size: 13px;
  color: #888;
  margin: 0 0 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.action-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}
.action-card:hover {
  border-color: #27ae60;
  box-shadow: 0 2px 8px rgba(39,174,96,0.15);
}

.action-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px;
}

.action-desc {
  font-size: 13px;
  color: #888;
  margin: 0;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
