import { useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useQueryStore } from '../../store/queryStore'

const PRODUCT_PLACEHOLDERS: Record<string, string> = {
  notion: "What are the biggest complaints about Notion's onboarding?",
  linear: "How do users feel about Linear's performance and speed?",
  figma: 'What are the top feature requests for Figma?',
  slack: 'What frustrations do users have with Slack notifications?',
  github: 'How is sentiment around GitHub Copilot?',
}

const DEFAULT_PLACEHOLDER = 'What are users saying about this product?'

export default function QueryInput() {
  const { currentQuery, currentProduct, isLoading, setQuery, submit } = useQueryStore()
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
      <div className="flex items-start gap-3 bg-[#111114] border border-[#1C1C22] rounded-xl px-4 py-3 focus-within:border-[#C8F04A]/40 transition-colors">
        <Search size={18} className="text-[#78787F] mt-1 shrink-0" />
        <textarea
          ref={textareaRef}
          rows={1}
          value={currentQuery}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PRODUCT_PLACEHOLDERS[currentProduct] || DEFAULT_PLACEHOLDER}
          className="flex-1 bg-transparent text-[#F0EEE8] placeholder-[#78787F] text-sm resize-none focus:outline-none min-h-[24px] max-h-48 leading-relaxed"
        />
        <button
          onClick={submit}
          disabled={isLoading || !currentQuery.trim()}
          className="shrink-0 flex items-center gap-2 px-4 py-1.5 bg-[#C8F04A] hover:bg-[#d4f55e] disabled:opacity-40 disabled:cursor-not-allowed text-[#09090B] text-sm font-semibold rounded-lg transition-colors"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          {isLoading ? 'Analyzing...' : 'Run'}
        </button>
      </div>
      <p className="text-xs text-[#78787F] mt-1 ml-1">⌘↵ to submit</p>
    </div>
  )
}
