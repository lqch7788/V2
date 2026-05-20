<!-- iAGS 2.0 — 登录页 -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.login(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/home'
    router.push(redirect)
  } catch (err: any) {
    errorMsg.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div class="bg-white rounded-xl shadow-lg p-8 w-96">
      <h1 class="text-2xl font-bold text-center text-green-700 mb-6">
        iAGS 2.0
      </h1>
      <p class="text-center text-sm text-gray-500 mb-6">智慧农业管理系统</p>

      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="username"
            placeholder="用户名"
            size="large"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
          />
        </el-form-item>

        <el-alert
          v-if="errorMsg"
          :title="errorMsg"
          type="error"
          show-icon
          class="mb-4"
        />

        <el-button
          type="primary"
          size="large"
          class="w-full"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>
