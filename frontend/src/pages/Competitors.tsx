import { useState } from 'react'
import { Swords } from 'lucide-react'
import { submitQuery } from '../api/client'
import { useQueryStore } from '../store/queryStore'
import type { QueryResponse } from '../types'
import ComplaintsTable from '../components/results/ComplaintsTable'
import { Skeleton } from '../components/shared/Skeleton'

const COMPETITOR_MAP: Record<string, string[]> = {
  notion: ['Obsidian', 'Confluence', 'Coda'],
  linear: ['Jira', 'Asana', 'Trello'],
  figma: ['Sketch', 'Adobe XD', 'Framer'],
  slack: ['Teams', 'Discord', 'Loom'],
  github: ['GitLab', 'Bitbucket', 'Azure DevOps'],
}

export default function Competitors() {
  const { currentProduct } = useQueryStore()
  const competitors = COMPETITOR_MAP[currentProduct] || []
  const [results, setResults] = useState<Record<string, QueryResponse | null>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const analyze = async (competitor: string) => {
    setLoading((l) => ({ ...l, [competitor]: true }))
    try {
      const result = await submitQuery({
        query: `What are the biggest complaints and weaknesses of ${competitor}?`,
        product: currentProduct,
      })
      setResults((r) => ({ ...r, [competitor]: result }))
    } catch {
      // ignore
    } finally {
      setLoading((l) => ({ ...l, [competitor]: false }))
    }
  }

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-white mb-1">Competitor Analysis</h1>
      <p className="text-sm text-gray-500 mb-6">
        Identify weaknesses in competing products — in users' own words.
      </p>

      <div className="space-y-4">
        {competitors.map((competitor) => (
          <div key={competitor} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Swords size={15} className="text-violet-400" />
                <h2 className="font-semibold text-white">{competitor}</h2>
              </div>
              <button
                onClick={() => analyze(competitor)}
                disabled={loading[competitor]}
                className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                {loading[competitor] ? 'Analyzing...' : 'Analyze weaknesses'}
              </button>
            </div>

            {loading[competitor] && <Skeleton className="h-24" />}

            {results[competitor]?.top_complaints && (
              <div className="mt-2">
                <ComplaintsTable complaints={results[competitor]!.top_complaints.slice(0, 3)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
