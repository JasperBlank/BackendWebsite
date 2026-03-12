import QueryInput from '../components/query/QueryInput'
import SentimentCard from '../components/results/SentimentCard'
import ComplaintsTable from '../components/results/ComplaintsTable'
import KeyFindings from '../components/results/KeyFindings'
import SourcesBar from '../components/results/SourcesBar'
import { useQueryStore } from '../store/queryStore'
import { AlertCircle, FlaskConical, Save, Check, Loader2, Search, Database, Brain, Sparkles } from 'lucide-react'
import { IS_DEMO } from '../api/client'
import { saveReport } from '../lib/reports'
import { useState } from 'react'

const STEP_CONFIG: Record<string, { icon: typeof Search; label: string; index: number }> = {
  validating:   { icon: Database,  label: 'Checking indexed data',       index: 0 },
  validated:    { icon: Database,  label: 'Data found',                  index: 0 },
  retrieving:   { icon: Search,    label: 'Searching vector database',   index: 1 },
  retrieved:    { icon: Search,    label: 'Posts retrieved',             index: 1 },
  synthesizing: { icon: Brain,     label: 'Claude is analyzing patterns', index: 2 },
  done:         { icon: Sparkles,  label: 'Analysis complete',           index: 3 },
}

const STEPS = ['Check data', 'Retrieve posts', 'Analyze with Claude', 'Done']

function AnalysisProgress({ step, message, partial }: {
  step: string
  message: string
  partial: { overall_sentiment_positive_pct?: number; total_posts_analyzed?: number; sources?: { source: string; post_count: number }[] } | null
}) {
  const config = STEP_CONFIG[step]
  const currentIndex = config?.index ?? -1

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 space-y-5">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-all duration-300 ${
              i < currentIndex ? 'bg-violet-600 text-white' :
              i === currentIndex ? 'bg-violet-500/20 text-violet-300 ring-2 ring-violet-500/40' :
              'bg-[#1e1e2e] text-gray-600'
            }`}>
              {i < currentIndex ? <Check size={12} /> : i === currentIndex ? <Loader2 size={12} className="animate-spin" /> : i + 1}
            </div>
            <span className={`text-xs truncate ${i <= currentIndex ? 'text-gray-300' : 'text-gray-600'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px transition-colors duration-300 ${i < currentIndex ? 'bg-violet-600/40' : 'bg-[#1e1e2e]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Current status */}
      <div className="flex items-center gap-2 text-sm text-violet-300">
        <Loader2 size={14} className="animate-spin" />
        {message}
      </div>

      {/* Partial results — shown immediately after retrieval, before Claude finishes */}
      {partial && (
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#1e1e2e]">
          <div>
            <p className="text-xs text-gray-500 mb-1">Sentiment</p>
            <p className="text-lg font-bold text-white">{partial.overall_sentiment_positive_pct}%</p>
            <p className="text-xs text-gray-600">positive</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Posts analyzed</p>
            <p className="text-lg font-bold text-white">{partial.total_posts_analyzed}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Sources</p>
            <div className="flex flex-wrap gap-1">
              {partial.sources?.map((s) => (
                <span key={s.source} className="text-xs bg-[#1e1e2e] text-gray-400 px-2 py-0.5 rounded-full">
                  {s.source} ({s.post_count})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Overview() {
  const { results, isLoading, error, currentQuery, currentProduct, progressStep, progressMessage, partial } = useQueryStore()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!results || !currentQuery) return
    const name = currentQuery.length > 40 ? currentQuery.slice(0, 40) + '…' : currentQuery
    saveReport({ name, product: currentProduct, query: currentQuery, results })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

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

      {isLoading && (
        <AnalysisProgress step={progressStep} message={progressMessage || 'Starting analysis...'} partial={partial} />
      )}

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
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-300 transition-colors"
            >
              <Save size={13} />
              {saved ? 'Saved!' : 'Save report'}
            </button>
          </div>
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
