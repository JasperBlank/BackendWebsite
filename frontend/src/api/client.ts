import type { QueryRequest, QueryResponse, TrendsResponse, Alert, AlertCreate } from '../types'
import { DEMO_RESULT } from './demoData'

/** Sentinel so we can distinguish backend error events from JSON parse failures */
class StreamError extends Error {}

// In demo mode (GitHub Pages / no backend), use mock data
export const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const BASE = import.meta.env.VITE_API_BASE || '/api/v1'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function submitQuery(req: QueryRequest): Promise<QueryResponse> {
  if (IS_DEMO) {
    await new Promise((r) => setTimeout(r, 1800))
    return { ...DEMO_RESULT, query: req.query, product: req.product }
  }
  const res = await fetch(`${BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days: 90, ...req }),
  })
  return handleResponse<QueryResponse>(res)
}

export type StreamCallback = (event: string, data: Record<string, unknown>) => void

export async function submitQueryStream(req: QueryRequest, onEvent: StreamCallback): Promise<QueryResponse> {
  if (IS_DEMO) {
    onEvent('step', { step: 'validating', message: 'Checking indexed data...' })
    await new Promise((r) => setTimeout(r, 400))
    onEvent('step', { step: 'retrieving', message: 'Searching vector database...' })
    await new Promise((r) => setTimeout(r, 600))
    onEvent('step', { step: 'synthesizing', message: 'Claude is analyzing patterns...' })
    await new Promise((r) => setTimeout(r, 800))
    onEvent('step', { step: 'done', message: 'Analysis complete' })
    return { ...DEMO_RESULT, query: req.query, product: req.product }
  }

  const res = await fetch(`${BASE}/query/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days: 90, ...req }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let finalResult: QueryResponse | null = null
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    let eventType = ''
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7)
      } else if (line.startsWith('data: ') && eventType) {
        try {
          const data = JSON.parse(line.slice(6))
          onEvent(eventType, data)
          if (eventType === 'result') {
            finalResult = data as QueryResponse
          }
          if (eventType === 'error') {
            const msg = (data as { message?: string }).message || 'Analysis failed'
            throw new StreamError(msg)
          }
        } catch (e) {
          if (e instanceof StreamError) {
            throw new Error(e.message)
          }
          // JSON parse error — skip malformed SSE lines
        }
        eventType = ''
      }
    }
  }

  if (!finalResult) throw new Error('No result received from stream')
  return finalResult
}

export async function triggerIngest(product: string, sources: string[]): Promise<void> {
  await fetch(`${BASE}/ingest/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product, sources }),
  })
}

export async function getIngestStatus(product: string): Promise<{ indexed_chunks: number }> {
  const res = await fetch(`${BASE}/ingest/status/${product}`)
  return handleResponse(res)
}

export async function getTrends(product: string, days = 90): Promise<TrendsResponse> {
  const res = await fetch(`${BASE}/trends?product=${product}&days=${days}`)
  return handleResponse<TrendsResponse>(res)
}

// ── Alerts ──────────────────────────────────────────────────────────
export async function listAlerts(product?: string): Promise<Alert[]> {
  const url = product ? `${BASE}/alerts?product=${product}` : `${BASE}/alerts`
  const res = await fetch(url)
  return handleResponse<Alert[]>(res)
}

export async function createAlert(body: AlertCreate): Promise<Alert> {
  const res = await fetch(`${BASE}/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<Alert>(res)
}

export async function updateAlert(id: string, body: { active?: boolean; threshold?: number }): Promise<Alert> {
  const res = await fetch(`${BASE}/alerts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<Alert>(res)
}

export async function deleteAlert(id: string): Promise<void> {
  await fetch(`${BASE}/alerts/${id}`, { method: 'DELETE' })
}
