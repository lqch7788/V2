<!-- iAGS 2.0 — 旧模块 iframe 容器（带加载态/错误态/postMessage通信） -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const props = defineProps<{
  src: string
  moduleKey: string
}>()

const emit = defineEmits<{
  titleChange: [title: string, breadcrumb: string[]]
  error: [error: { code: string; message: string }]
}>()

const iframeRef = ref<HTMLIFrameElement>()
const loading = ref(true)
const error = ref<string | null>(null)
const auth = useAuthStore()

function handleMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  const msg = event.data
  if (msg.source !== 'iags-legacy') return

  switch (msg.type) {
    case 'IFRAME_READY':
      loading.value = false
      // 向 iframe 发送用户信息
      iframeRef.value?.contentWindow?.postMessage(
        {
          source: 'iags-shell',
          type: 'USER_INFO',
          payload: auth.user,
          timestamp: Date.now(),
          messageId: crypto.randomUUID(),
        },
        window.location.origin
      )
      break
    case 'TITLE_UPDATE':
      emit('titleChange', msg.payload.title, msg.payload.breadcrumb || [])
      break
    case 'IFRAME_RESIZE':
      if (iframeRef.value) {
        iframeRef.value.style.height = `${msg.payload.height}px`
      }
      break
    case 'ERROR':
      error.value = msg.payload.message
      emit('error', msg.payload)
      break
  }
}

onMounted(() => window.addEventListener('message', handleMessage))
onUnmounted(() => window.removeEventListener('message', handleMessage))
</script>

<template>
  <div class="iframe-container relative w-full h-full">
    <!-- 加载态 -->
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-gray-50 z-10"
    >
      <div class="text-center">
        <el-icon class="animate-spin" :size="32"><Loading /></el-icon>
        <p class="mt-2 text-sm text-gray-500">正在加载 {{ moduleKey }} 模块...</p>
      </div>
    </div>

    <!-- 错误态 -->
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-gray-50 z-10"
    >
      <div class="text-center">
        <p class="text-red-500 mb-2">{{ error }}</p>
        <el-button type="primary" @click="error = null; loading = true; iframeRef && (iframeRef.src = props.src)">
          重新加载
        </el-button>
      </div>
    </div>

    <!-- iframe -->
    <iframe
      ref="iframeRef"
      :src="src"
      class="w-full border-none"
      style="min-height: 600px"
      :title="moduleKey"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  </div>
</template>
