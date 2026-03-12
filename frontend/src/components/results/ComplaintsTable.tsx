import type { Complaint } from '../../types'
import clsx from 'clsx'

interface Props {
  complaints: Complaint[]
}

const BAR_COLORS: Record<string, string> = {
  red: '#FF6B6B',
  orange: '#FFB86B',
  green: '#C8F04A',
}

function SentimentBar({ score }: { score: number }) {
  const pct = Math.round(((score + 1) / 2) * 100)
  const color = score < -0.2 ? BAR_COLORS.red : score < 0.2 ? BAR_COLORS.orange : BAR_COLORS.green

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 bg-[#1C1C22] rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-mono w-10 text-right"
        style={{ color }}
      >
        {score > 0 ? '+' : ''}
        {score.toFixed(2)}
      </span>
    </div>
  )
}

export default function ComplaintsTable({ complaints }: Props) {
  return (
    <div className="bg-[#111114] border border-[#1C1C22] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-label">Top Complaints</h3>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF6B6B] bg-[#FF6B6B]/10 px-2 py-0.5 rounded-full">
          High signal
        </span>
      </div>

      <div className="space-y-4">
        {complaints.map((c, i) => (
          <div key={i} className="group">
            <div className="flex items-start justify-between gap-4 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#F0EEE8]">{c.topic}</span>
                <span className="text-xs text-[#78787F] bg-[#1C1C22] px-2 py-0.5 rounded-full">
                  {c.mention_count} mentions
                </span>
              </div>
              <span className="text-sm font-bold text-[#9898A2] shrink-0">
                {Math.round(c.percentage)}%
              </span>
            </div>
            <SentimentBar score={c.sentiment_score} />
            {c.example_quote && (
              <p className="text-xs text-[#78787F] italic mt-1.5 line-clamp-2">
                &ldquo;{c.example_quote}&rdquo;
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
