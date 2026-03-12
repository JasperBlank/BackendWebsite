import type { QueryRequest, QueryResponse, TrendsResponse } from '../types'
import { DEMO_RESULT } from './demoData'

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
    // Simulate network delay for realism
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
