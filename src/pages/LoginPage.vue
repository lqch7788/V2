<!-- iAGS 2.0 — 登录页（复刻原 iAGS Cool 主题绿色风格） -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

// 回车登录
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleLogin()
  } else {
    errorMsg.value = ''
  }
}

async function handleLogin() {
  if (!username.value.trim()) {
    errorMsg.value = '请输入用户名'
    return
  }
  if (!password.value) {
    errorMsg.value = '请输入密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.login(username.value.trim(), password.value, rememberMe.value)
    const redirect = (route.query.redirect as string) || '/home'
    router.push(redirect)
  } catch (err: any) {
    errorMsg.value = err.message || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}

// 检查是否已登录或可自动登录
onMounted(async () => {
  if (auth.isAuthenticated) {
    router.push('/home')
    return
  }
  const autoLoggedIn = await auth.tryAutoLogin()
  if (autoLoggedIn) {
    router.push('/home')
  }
})
</script>

<template>
  <div class="login-page">
    <!-- 全屏背景 -->
    <div class="login-body">

      <!-- 左侧：TagCanvas 文字云效果区（与原 iAGS 一致） -->
      <div class="login-left">
        <div class="login-brand-content">
          <div class="brand-logo-area">
            <!-- SVG 植物图标（模拟原 CoolTaiwan 左侧 canvas 动画） -->
            <svg viewBox="0 0 200 180" class="brand-svg">
              <!-- 叶子 -->
              <ellipse cx="70" cy="90" rx="28" ry="45" fill="rgba(255,255,255,0.12)" transform="rotate(-20 70 90)"/>
              <ellipse cx="130" cy="90" rx="28" ry="45" fill="rgba(255,255,255,0.12)" transform="rotate(20 130 90)"/>
              <ellipse cx="100" cy="100" rx="10" ry="25" fill="rgba(255,255,255,0.2)"/>
              <!-- 茎 -->
              <line x1="100" y1="125" x2="100" y2="170" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
              <!-- 土 -->
              <ellipse cx="100" cy="172" rx="40" ry="6" fill="rgba(255,255,255,0.15)"/>
            </svg>
          </div>
          <h1 class="brand-name">iAGS 2.0</h1>
          <p class="brand-subtitle">智慧农业管理系统</p>
          <p class="brand-desc">Techmation Intelligent Crop Cloud</p>
        </div>
      </div>

      <!-- 右侧：登录表单 -->
      <div class="login-right">
        <div class="login-card">
          <h2 class="login-title">用户登录</h2>

          <div class="login-form">
            <!-- 用户名 -->
            <div class="form-group">
              <label class="form-label">用户名 (*):</label>
              <div class="input-wrap">
                <input
                  v-model="username"
                  type="text"
                  class="form-input"
                  placeholder="请输入用户名"
                  @keydown="handleKeydown"
                />
              </div>
            </div>

            <!-- 密码 -->
            <div class="form-group">
              <label class="form-label">密码 (*):</label>
              <div class="input-wrap password-wrap">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input password-input"
                  placeholder="请输入密码"
                  @keydown="handleKeydown"
                />
                <span
                  class="password-eye"
                  @click="showPassword = !showPassword"
                  :title="showPassword ? '隐藏密码' : '显示密码'"
                >
                  {{ showPassword ? '&#x1f441;' : '&#x1f576;' }}
                </span>
              </div>
            </div>

            <!-- 错误提示 -->
            <div v-if="errorMsg" class="error-bar">
              <textarea readonly class="error-textarea" :value="errorMsg" rows="1"></textarea>
            </div>

            <!-- 记住密码 + 登录按钮 -->
            <div class="remember-row">
              <label class="remember-label">
                <input type="checkbox" v-model="rememberMe" class="remember-checkbox" />
                <span>记住密码，下次自动登录</span>
              </label>
            </div>

            <div class="login-btn-row">
              <button
                class="login-submit-btn"
                :disabled="loading"
                @click="handleLogin"
              >
                <span v-if="loading">登录中...</span>
                <span v-else>登 录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 登录页整体 ===== */
.login-page {
  width: 100%;
  min-height: 100vh;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
}

.login-body {
  display: flex;
  align-items: flex-start;
  min-height: 100vh;
  padding: 105px 0;
  color: #000;
  /* 原 iAGS 使用背景图 background.jpg，此处使用绿色渐变模拟 */
  background: linear-gradient(135deg, #134e2a 0%, #1a6b3a 25%, #1d7a42 50%, #229954 75%, #27ae60 100%);
}

/* ===== 左侧品牌区 ===== */
.login-left {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 40px;
}

.login-brand-content {
  text-align: center;
  color: #ffffff;
}

.brand-logo-area {
  margin-bottom: 24px;
}

.brand-svg {
  width: 180px;
  height: 160px;
}

.brand-name {
  font-size: 38px;
  font-weight: 700;
  letter-spacing: 6px;
  margin: 0 0 10px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.25);
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
}

.brand-subtitle {
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 6px;
  letter-spacing: 4px;
}

.brand-desc {
  font-size: 13px;
  opacity: 0.6;
  margin: 0;
  letter-spacing: 1px;
}

/* ===== 右侧表单区 ===== */
.login-right {
  flex: 0 0 460px;
  display: flex;
  justify-content: center;
  padding: 0 50px;
}

.login-card {
  width: 310px;
  background: rgba(255,255,255,.9);
  border-radius: 15px;
  padding: 30px 15px 60px;
  box-shadow: 0 0 10px 0 #9e9e9e;
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 0 0 30px;
  letter-spacing: 3px;
}

/* ===== 表单控件 ===== */
.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 4px;
}

.form-label {
  display: block;
  padding: 20px 0 8px;
  font-size: 18px;
  color: #333;
}

.input-wrap {
  height: 32px;
  border: 1px solid #909191;
  border-radius: 3px;
  box-sizing: border-box;
  background: #fff;
  padding: 0 3px;
}

.password-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  padding: 0 4px;
  box-sizing: border-box;
}

.password-input {
  padding-right: 28px;
}

.password-eye {
  position: absolute;
  top: 4px;
  right: 6px;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.5;
  user-select: none;
}
.password-eye:hover {
  opacity: 0.9;
}

/* ===== 错误提示 ===== */
.error-bar {
  margin-top: 12px;
}

.error-textarea {
  border: 1px solid red;
  width: 100%;
  background: transparent;
  color: red;
  font-size: 13px;
  padding: 4px 6px;
  box-sizing: border-box;
  resize: none;
  outline: none;
}

/* ===== 记住密码 ===== */
.remember-row {
  padding-top: 14px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
}

.remember-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #e50232;
}

/* ===== 登录按钮（原 iAGS 绿色渐变风格） ===== */
.login-btn-row {
  padding-top: 20px;
}

.login-submit-btn {
  display: block;
  width: 100%;
  padding: 6px 0;
  background: linear-gradient(to right, #54bdb6, #a6cf66);
  border: none;
  border-radius: 3px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 6px;
  cursor: pointer;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
}
.login-submit-btn:hover {
  opacity: 0.85;
}
.login-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== 响应式 ===== */
@media (max-width: 1367px) {
  .login-body {
    padding: 55px 0;
  }
  .login-card {
    padding: 15px 15px 30px;
  }
  .form-label {
    padding: 15px 0 6px;
  }
  .input-wrap {
    height: 26px;
  }
  .login-btn-row {
    padding-top: 10px;
  }
  .login-left {
    flex: 0 0 50%;
  }
}

@media (max-width: 768px) {
  .login-left {
    display: none;
  }
  .login-right {
    flex: 1;
    padding: 0 20px;
  }
}
</style>
