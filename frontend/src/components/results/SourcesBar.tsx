import type { SourceBreakdown } from '../../types'

const SOURCE_LABELS: Record<string, string> = {
  reddit: 'Reddit',
  appstore: 'App Store',
  hackernews: 'Hacker News',
}

const SOURCE_COLORS: Record<string, string> = {
  reddit: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  appstore: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  hackernews: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

const SOURCE_ICONS: Record<string, string> = {
  reddit: '🤖',
  appstore: '',
  hackernews: '▲',
}

interface Props {
  sources: SourceBreakdown[]
}

export default function SourcesBar({ sources }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap pt-1">
      <span className="text-xs text-gray-600">Sources:</span>
      {sources.map((s) => (
        <span
          key={s.source}
          className={`flex items-center gap-1.5 text-xs border px-2.5 py-1 rounded-full font-medium ${SOURCE_COLORS[s.source] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}
        >
          <span>{SOURCE_ICONS[s.source] || '•'}</span>
          {SOURCE_LABELS[s.source] || s.source} · {s.post_count.toLocaleString()} posts
        </span>
      ))}
    </div>
  )
}
