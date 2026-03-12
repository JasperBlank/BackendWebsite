import { create } from 'zustand'
import type { QueryResponse, SourceBreakdown } from '../types'
import { submitQueryStream } from '../api/client'

export interface PartialResults {
  overall_sentiment_positive_pct?: number
  total_posts_analyzed?: number
  sources?: SourceBreakdown[]
}

interface QueryStore {
  currentQuery: string
  currentProduct: string
  results: QueryResponse | null
  isLoading: boolean
  error: string | null
  progressStep: string
  progressMessage: string
  partial: PartialResults | null
  setQuery: (q: string) => void
  setProduct: (p: string) => void
  submit: () => Promise<void>
  clearResults: () => void
  loadResults: (r: QueryResponse) => void
}

export const useQueryStore = create<QueryStore>((set, get) => ({
  currentQuery: '',
  currentProduct: 'notion',
  results: null,
  isLoading: false,
  error: null,
  progressStep: '',
  progressMessage: '',
  partial: null,

  setQuery: (q) => set({ currentQuery: q }),
  setProduct: (p) => set({ currentProduct: p, results: null }),
  clearResults: () => set({ results: null, error: null, partial: null }),
  loadResults: (r) => set({ results: r, isLoading: false, error: null, partial: null }),

  submit: async () => {
    const { currentQuery, currentProduct } = get()
    if (!currentQuery.trim()) return

    set({ isLoading: true, error: null, results: null, partial: null, progressStep: '', progressMessage: '' })
    try {
      const results = await submitQueryStream(
        { query: currentQuery, product: currentProduct },
        (event, data) => {
          if (event === 'step') {
            set({ progressStep: data.step as string, progressMessage: data.message as string })
          } else if (event === 'partial') {
            set({ partial: data as unknown as PartialResults })
          }
        }
      )
      set({ results, isLoading: false, progressStep: '', progressMessage: '', partial: null })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false,
        progressStep: '',
        progressMessage: '',
      })
    }
  },
}))
