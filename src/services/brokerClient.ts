// iAGS 2.0 — broker API 统一客户端（框架无关，纯 TypeScript + fetch）
//
// iAGS broker 接口格式（已有，不动）:
//   GET  /app/system/broker/getFromBiz?bizURLParams=["模块","子模块","动作"]&data={查询参数}
//   POST /app/system/broker/post2Biz  Body: { bizURLParams: [...], data: {...} }
//
// 认证: credentials: 'include' 自动携带 iAGS Cookie (Vite proxy 同域)
// 响应: { code: 0, msg: "操作成功", data: { rows: [...], total: 100 } }

const IAGS_BASE = '/app/system/broker'

// === broker 标准响应格式 ===
export interface BrokerResponse<T = unknown> {
  code: number
  msg: string
  data?: {
    rows?: T[]
    total?: number
    [key: string]: unknown
  }
}

// === GET 请求（通过 broker getFromBiz）===
export async function brokerGet<T>(
  bizParams: string[],
  query: Record<string, unknown> = {}
): Promise<{ rows: T[]; total: number; [key: string]: unknown }> {
  const sp = new URLSearchParams()
  sp.set('bizURLParams', JSON.stringify(bizParams))
  sp.set('data', JSON.stringify(query))

  const res = await fetch(`${IAGS_BASE}/getFromBiz?${sp.toString()}`, {
    credentials: 'include', // Cookie 自动携带
  })

  if (!res.ok) {
    throw new Error(`Broker GET failed: ${res.status} ${res.statusText}`)
  }

  const json: BrokerResponse<T> = await res.json()
  if (json.code !== 0) {
    throw new Error(json.msg || '请求失败')
  }

  return {
    rows: json.data?.rows || [],
    total: json.data?.total || 0,
  }
}

// === POST 请求（通过 broker post2Biz）===
export async function brokerPost<T>(
  bizParams: string[],
  data: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(`${IAGS_BASE}/post2Biz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ bizURLParams: bizParams, data }),
  })

  if (!res.ok) {
    throw new Error(`Broker POST failed: ${res.status} ${res.statusText}`)
  }

  const json: BrokerResponse<T> = await res.json()
  if (json.code !== 0) {
    throw new Error(json.msg || '请求失败')
  }

  return json.data as T
}

// === PUT 请求（iAGS broker 也走 post2Biz）===
export async function brokerPut<T>(
  bizParams: string[],
  data: Record<string, unknown> = {}
): Promise<T> {
  return brokerPost<T>(bizParams, data)
}

// === DELETE 请求 ===
export async function brokerDelete(
  bizParams: string[],
  query: Record<string, unknown> = {}
): Promise<void> {
  const sp = new URLSearchParams()
  sp.set('bizURLParams', JSON.stringify(bizParams))
  sp.set('data', JSON.stringify(query))

  const res = await fetch(`${IAGS_BASE}/getFromBiz?${sp.toString()}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`Broker DELETE failed: ${res.status} ${res.statusText}`)
  }
}
