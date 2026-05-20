// iAGS 2.0 — iframe postMessage 通信 composable
// 替代 React useEffect + useCallback 模式

import { ref, onMounted, onUnmounted } from 'vue'
import type { IagsMessage, TitleUpdatePayload, ErrorPayload } from '@/types/iframe'

export function useIframeMessage(moduleKey: string) {
  const title = ref('')
  const breadcrumb = ref<string[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  function handleMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) return
    const msg = event.data as IagsMessage
    if (msg.source !== 'iags-legacy') return

    switch (msg.type) {
      case 'IFRAME_READY':
        loading.value = false
        break
      case 'TITLE_UPDATE': {
        const p = msg.payload as TitleUpdatePayload
        title.value = p.title
        breadcrumb.value = p.breadcrumb || []
        break
      }
      case 'ERROR': {
        const p = msg.payload as ErrorPayload
        error.value = p.message
        break
      }
    }
  }

  onMounted(() => window.addEventListener('message', handleMessage))
  onUnmounted(() => window.removeEventListener('message', handleMessage))

  return { title, breadcrumb, loading, error }
}
