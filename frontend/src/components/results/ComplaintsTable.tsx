import type { Complaint } from '../../types'
import clsx from 'clsx'

interface Props {
  complaints: Complaint[]
}

function SentimentBar({ score }: { score: number }) {
  const pct = Math.round(((score + 1) / 2) * 100)
  const color =
    score < -0.2 ? 'bg-red-500' : score < 0.2 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
        <div
          className={clsx('h-1.5 rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={clsx(
          'text-xs font-mono w-10 text-right',
          score < -0.2 ? 'text-red-400' : score < 0.2 ? 'text-amber-400' : 'text-emerald-400'
        )}
      >
        {score > 0 ? '+' : ''}
        {score.toFixed(2)}
      </span>
    </div>
  )
}

export default function ComplaintsTable({ complaints }: Props) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Top Complaints
        </h3>
        <span className="text-xs text-gray-600">High signal</span>
      </div>

      <div className="space-y-4">
        {complaints.map((c, i) => (
          <div key={i} className="group">
            <div className="flex items-start justify-between gap-4 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-100">{c.topic}</span>
                <span className="text-xs text-gray-500 bg-[#1e1e2e] px-2 py-0.5 rounded-full">
                  {c.mention_count} mentions
                </span>
              </div>
              <span className="text-sm font-bold text-gray-300 shrink-0">
                {Math.round(c.percentage)}%
              </span>
            </div>
            <SentimentBar score={c.sentiment_score} />
            {c.example_quote && (
              <p className="text-xs text-gray-600 italic mt-1.5 line-clamp-2">
                "{c.example_quote}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
