import { useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useQueryStore } from '../../store/queryStore'

const PLACEHOLDERS = [
  "What are the biggest complaints about Notion's onboarding?",
  'What features are users requesting most?',
  'How is sentiment trending over the last 90 days?',
  "Where does this product fall short vs competitors?",
]

export default function QueryInput() {
  const { currentQuery, isLoading, setQuery, submit } = useQueryStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [currentQuery])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex items-start gap-3 bg-[#111118] border border-[#2a2a3e] rounded-xl px-4 py-3 focus-within:border-violet-500/60 transition-colors">
        <Search size={18} className="text-gray-500 mt-1 shrink-0" />
        <textarea
          ref={textareaRef}
          rows={1}
          value={currentQuery}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDERS[0]}
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 text-sm resize-none focus:outline-none min-h-[24px] max-h-48 leading-relaxed"
        />
        <button
          onClick={submit}
          disabled={isLoading || !currentQuery.trim()}
          className="shrink-0 flex items-center gap-2 px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-1 ml-1">⌘↵ to submit</p>
    </div>
  )
}
