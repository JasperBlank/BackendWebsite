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
    <div className="bg-[#111114] border border-[#1C1C22] rounded-xl p-6 space-y-5">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-all duration-300 ${
              i < currentIndex ? 'bg-[#C8F04A] text-[#09090B]' :
              i === currentIndex ? 'bg-[#C8F04A]/20 text-[#C8F04A] ring-2 ring-[#C8F04A]/40' :
              'bg-[#1C1C22] text-[#78787F]'
            }`}>
              {i < currentIndex ? <Check size={12} /> : i === currentIndex ? <Loader2 size={12} className="animate-spin" /> : i + 1}
            </div>
            <span className={`text-xs truncate ${i <= currentIndex ? 'text-[#F0EEE8]' : 'text-[#78787F]'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px transition-colors duration-300 ${i < currentIndex ? 'bg-[#C8F04A]/40' : 'bg-[#1C1C22]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Current status */}
      <div className="flex items-center gap-2 text-sm text-[#C8F04A]">
        <Loader2 size={14} className="animate-spin" />
        {message}
      </div>

      {/* Partial results */}
      {partial && (
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#1C1C22]">
          <div>
            <p className="text-xs text-[#78787F] mb-1">Sentiment</p>
            <p className="text-lg font-bold text-[#F0EEE8]">{partial.overall_sentiment_positive_pct}%</p>
            <p className="text-xs text-[#78787F]">positive</p>
          </div>
          <div>
            <p className="text-xs text-[#78787F] mb-1">Posts analyzed</p>
            <p className="text-lg font-bold text-[#F0EEE8]">{partial.total_posts_analyzed}</p>
          </div>
          <div>
            <p className="text-xs text-[#78787F] mb-1">Sources</p>
            <div className="flex flex-wrap gap-1">
              {partial.sources?.map((s) => (
                <span key={s.source} className="text-[10px] bg-[rgba(255,255,255,0.04)] border border-[#1C1C22] text-[#9898A2] px-2 py-0.5 rounded">
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
    const name = currentQuery.length > 40 ? currentQuery.slice(0, 40) + '...' : currentQuery
    saveReport({ name, product: currentProduct, query: currentQuery, results })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex-1 flex flex-col gap-6 p-8 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="font-serif text-3xl text-[#F0EEE8] mb-1">Product Intelligence</h1>
        <p className="text-sm text-[#9898A2] font-light">Ask anything about your product&apos;s public reputation.</p>
      </div>

      {IS_DEMO && (
        <div className="flex items-center gap-2 bg-[#FFB86B]/10 border border-[#FFB86B]/20 rounded-lg px-4 py-2 text-xs text-[#FFB86B]">
          <FlaskConical size={13} />
          <span><strong className="font-semibold">Demo mode</strong> — responses use sample data. Deploy the backend for live analysis.</span>
        </div>
      )}

      <QueryInput />

      {isLoading && (
        <AnalysisProgress step={progressStep} message={progressMessage || 'Starting analysis...'} partial={partial} />
      )}

      {error && (
        <div className="flex items-start gap-3 bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-xl p-4">
          <AlertCircle size={16} className="text-[#FF6B6B] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#FF6B6B]">Analysis failed</p>
            <p className="text-xs text-[#FF6B6B]/80 mt-0.5">{error}</p>
            {error.includes('No data indexed') && (
              <p className="text-xs text-[#78787F] mt-2">
                Tip: Go to the Ingest tab and trigger data collection first, or run{' '}
                <code className="bg-[#1C1C22] px-1.5 py-0.5 rounded text-[#9898A2]">python -m scripts.seed_data notion</code>
              </p>
            )}
          </div>
        </div>
      )}

      {results && !isLoading && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 text-xs text-[#78787F] hover:text-[#C8F04A] transition-colors"
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
            <div className="text-4xl mb-3 text-[#C8F04A]/60">&#10022;</div>
            <p className="text-[#9898A2] text-sm">Ask a question to analyze your product&apos;s reputation</p>
            <p className="text-[#78787F] text-xs mt-1">Powered by live Reddit, App Store, and HN data</p>
          </div>
        </div>
      )}
    </div>
  )
}
