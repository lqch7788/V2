// iAGS 2.0 — WebSocket 实时数据桥接 composable
// 统一管理 Socket.IO 连接，转发给 iframe 内的 EasyUI 旧页面

import { io, Socket } from 'socket.io-client'
import { onMounted, onUnmounted, ref } from 'vue'

const REALTIME_EVENTS = [
  'RealTimeData',            // 传感器实时数据
  'warningData',             // 告警实时推送
  'device_operation_record', // 设备操作记录
  'control_state',           // 设备控制状态
  'run_settings_result',     // 运行参数设置结果
]

export function useRealtimeBridge() {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const iframeRefs = new Map<string, HTMLIFrameElement>()

  function connect() {
    socket.value = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    })

    socket.value.on('connect', () => {
      isConnected.value = true
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
    })

    // 监听所有 iAGS 实时数据事件，转发到已注册的 iframe
    REALTIME_EVENTS.forEach((eventName) => {
      socket.value?.on(eventName, (data) => {
        broadcastToAllIframes(eventName, data)
      })
    })
  }

  function broadcastToAllIframes(event: string, data: unknown) {
    iframeRefs.forEach((iframe) => {
      iframe.contentWindow?.postMessage(
        {
          source: 'iags-shell',
          type: 'REALTIME_DATA',
          payload: { event, data },
          timestamp: Date.now(),
          messageId: crypto.randomUUID(),
        },
        window.location.origin
      )
    })
  }

  function registerIframe(key: string, iframe: HTMLIFrameElement) {
    iframeRefs.set(key, iframe)
  }

  function unregisterIframe(key: string) {
    iframeRefs.delete(key)
  }

  function disconnect() {
    socket.value?.disconnect()
    iframeRefs.clear()
  }

  return { isConnected, connect, disconnect, registerIframe, unregisterIframe }
}
