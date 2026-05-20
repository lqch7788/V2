<!-- iAGS 2.0 — iAGS 旧模块 iframe 过渡包装页 -->
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const moduleKey = computed(() => (route.params.module as string) || 'unknown')

// 根据模块名生成 iAGS 旧页面 URL
const iframeSrc = computed(() => {
  const mod = route.params.module as string
  // iAGS 旧系统 EJS 视图路径映射
  const modulePathMap: Record<string, string> = {
    curve: '/app/iAGS/curve/showCurve',
    device: '/app/iAGS/device/showDevice',
    control: '/app/iAGS/control/showControl',
    warning: '/app/iAGS/warning/showWarning',
    camera: '/app/iAGS/camera/showCamera',
    energy: '/app/iAGS/energy/showEnergy',
    report: '/app/iAGS/report/showReport',
    resume: '/app/iAGS/resume/showResume',
    administration: '/app/iAGS/administration/showAdministration',
    application: '/app/iAGS/application/showApplication',
    systemset: '/app/iAGS/systemset/showSystemset',
    home: '/app/iAGS/home/showHome',
    more: '/app/iAGS/more/showMore',
    '3D': '/app/iAGS/3D/index',
    intelligentcontrol: '/app/iAGS/intelligentcontrol/showIntelligentcontrol',
  }
  return modulePathMap[mod] || `/app/iAGS/${mod}/show`
})
</script>

<template>
  <iframe
    :src="iframeSrc"
    class="w-full border-none"
    style="min-height: calc(100vh - 120px)"
    :title="moduleKey"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  />
</template>
