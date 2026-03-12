export interface Complaint {
  topic: string
  mention_count: number
  percentage: number
  sentiment_score: number
  example_quote: string
}

export interface KeyFinding {
  finding: string
  supporting_sources: string[]
  source_label: string
}

export interface SourceBreakdown {
  source: string
  post_count: number
  icon: string
}

export interface QueryResponse {
  query: string
  product: string
  overall_sentiment_positive_pct: number
  total_posts_analyzed: number
  time_range_days: number
  top_complaints: Complaint[]
  key_findings: KeyFinding[]
  sources: SourceBreakdown[]
  generated_at: string
}

export interface QueryRequest {
  query: string
  product: string
  days?: number
}

export interface TrendPoint {
  date: string
  sentiment_positive_pct: number
  post_count: number
}

export interface TrendsResponse {
  product: string
  metric: string
  data: TrendPoint[]
}

export interface Alert {
  id: string
  product: string
  topic: string
  threshold: number
  active: boolean
  created_at: string
}

export interface AlertCreate {
  product: string
  topic: string
  threshold: number
}

export interface SavedReport {
  id: string
  name: string
  product: string
  query: string
  results: QueryResponse
  saved_at: string
}
