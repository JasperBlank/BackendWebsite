import QueryInput from '../components/query/QueryInput'
import SentimentCard from '../components/results/SentimentCard'
import ComplaintsTable from '../components/results/ComplaintsTable'
import KeyFindings from '../components/results/KeyFindings'
import SourcesBar from '../components/results/SourcesBar'
import { ResultsSkeleton } from '../components/shared/Skeleton'
import { useQueryStore } from '../store/queryStore'
import { AlertCircle, FlaskConical } from 'lucide-react'
import { IS_DEMO } from '../api/client'

export default function Overview() {
  const { results, isLoading, error } = useQueryStore()

  return (
    <div className="flex-1 flex flex-col gap-6 p-8 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Product Intelligence</h1>
        <p className="text-sm text-gray-500">Ask anything about your product's public reputation.</p>
      </div>

      {IS_DEMO && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 text-xs text-amber-400">
          <FlaskConical size={13} />
          <span><strong>Demo mode</strong> — responses use sample data. Deploy the backend for live analysis.</span>
        </div>
      )}

      <QueryInput />

      {isLoading && <ResultsSkeleton />}

      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-300">Analysis failed</p>
            <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
            {error.includes('No data indexed') && (
              <p className="text-xs text-gray-500 mt-2">
                Tip: Go to the Ingest tab and trigger data collection first, or run{' '}
                <code className="bg-[#1e1e2e] px-1 rounded">python -m scripts.seed_data notion</code>
              </p>
            )}
          </div>
        </div>
      )}

      {results && !isLoading && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SentimentCard data={results} />
            {results.top_complaints.length > 0 && (
              <ComplaintsTable complaints={results.top_complaints} />
            )}
          </div>

          {results.key_findings.length > 0 && (
            <KeyFindings findings={results.key_findings} />
          )}

          {results.sources.length > 0 && (
            <SourcesBar sources={results.sources} />
          )}
        </div>
      )}

      {!results && !isLoading && !error && (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <div className="text-4xl mb-3">✦</div>
            <p className="text-gray-500 text-sm">Ask a question to analyze your product's reputation</p>
            <p className="text-gray-700 text-xs mt-1">Powered by live Reddit, App Store, and HN data</p>
          </div>
        </div>
      )}
    </div>
  )
}
