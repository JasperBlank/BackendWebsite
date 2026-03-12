import { create } from 'zustand'
import type { QueryResponse } from '../types'
import { submitQuery } from '../api/client'

interface QueryStore {
  currentQuery: string
  currentProduct: string
  results: QueryResponse | null
  isLoading: boolean
  error: string | null
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

  setQuery: (q) => set({ currentQuery: q }),
  setProduct: (p) => set({ currentProduct: p, results: null }),
  clearResults: () => set({ results: null, error: null }),
  loadResults: (r) => set({ results: r, isLoading: false, error: null }),

  submit: async () => {
    const { currentQuery, currentProduct } = get()
    if (!currentQuery.trim()) return

    set({ isLoading: true, error: null })
    try {
      const results = await submitQuery({ query: currentQuery, product: currentProduct })
      set({ results, isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false,
      })
    }
  },
}))
