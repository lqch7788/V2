<!-- iAGS 2.0 — 404 页面 -->
<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-6xl font-bold text-gray-300">404</h1>
    <p class="text-gray-500 mt-4">页面未找到</p>
    <el-button type="primary" class="mt-6" @click="$router.push('/home')">
      返回首页
    </el-button>
  </div>
</template>
