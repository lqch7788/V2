<!-- iAGS 2.0 — 首页仪表盘（占位） -->
<script setup lang="ts">
// 首页将在 iAGS home 模块迁移时实现
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">仪表盘</h2>
    <el-row :gutter="16">
      <el-col :span="6" v-for="i in 4" :key="i">
        <el-card class="mb-4">
          <el-skeleton :rows="3" animated />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
