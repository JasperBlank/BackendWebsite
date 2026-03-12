import type { QueryResponse, SavedReport } from '../types'

const STORAGE_KEY = 'hearo_saved_reports'

export function getReports(): SavedReport[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveReport(opts: {
  name: string
  product: string
  query: string
  results: QueryResponse
}): SavedReport {
  const reports = getReports()
  const report: SavedReport = {
    id: Date.now().toString(36),
    name: opts.name,
    product: opts.product,
    query: opts.query,
    results: opts.results,
    saved_at: new Date().toISOString(),
  }
  reports.unshift(report)
  // Keep max 20 reports
  if (reports.length > 20) reports.length = 20
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  return report
}

export function deleteReport(id: string): void {
  const reports = getReports().filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}
