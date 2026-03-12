import type { QueryResponse } from '../../types'

interface Props {
  data: QueryResponse
}

export default function SentimentCard({ data }: Props) {
  const pct = data.overall_sentiment_positive_pct
  const color = pct >= 60 ? '#C8F04A' : pct >= 40 ? '#FFB86B' : '#FF6B6B'
  const label = pct >= 60 ? 'Positive' : pct >= 40 ? 'Mixed' : 'Negative'

  // SVG circle gauge
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="bg-[#111114] border border-[#1C1C22] rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="section-label">Overall Sentiment</h3>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{
            color: color,
            backgroundColor: color + '18',
          }}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-5 mt-4">
        <svg width={100} height={100} className="shrink-0">
          <circle cx={50} cy={50} r={radius} fill="none" stroke="#1C1C22" strokeWidth={8} />
          <circle
            cx={50} cy={50} r={radius} fill="none"
            stroke={color} strokeWidth={8} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <text
            x={50} y={50} textAnchor="middle" dominantBaseline="central"
            fill="#F0EEE8" fontSize={18} fontWeight={700} fontFamily="Epilogue, sans-serif"
          >
            {Math.round(pct)}%
          </text>
        </svg>

        <div>
          <p className="text-2xl font-bold text-[#F0EEE8]">{Math.round(pct)}%</p>
          <p className="text-sm text-[#9898A2] mt-0.5">positive mentions</p>
          <p className="text-xs text-[#78787F] mt-2">
            Based on {data.total_posts_analyzed.toLocaleString()} posts · last {data.time_range_days} days
          </p>
        </div>
      </div>
    </div>
  )
}
