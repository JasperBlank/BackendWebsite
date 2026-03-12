import type { SourceBreakdown } from '../../types'

const SOURCE_LABELS: Record<string, string> = {
  reddit: 'Reddit',
  appstore: 'App Store',
  hackernews: 'Hacker News',
}

interface Props {
  sources: SourceBreakdown[]
}

export default function SourcesBar({ sources }: Props) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap pt-1 px-1 border-t border-[#1C1C22] mt-1 pt-3">
      <span className="text-[10px] text-[#78787F] shrink-0">Sources:</span>
      {sources.map((s) => (
        <span
          key={s.source}
          className="text-[10px] text-[#9898A2] bg-[rgba(255,255,255,0.04)] border border-[#1C1C22] px-2 py-1 rounded whitespace-nowrap"
        >
          {SOURCE_LABELS[s.source] || s.source} · {s.post_count.toLocaleString()} posts
        </span>
      ))}
    </div>
  )
}
