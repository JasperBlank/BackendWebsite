import type { QueryResponse } from '../../types'

interface Props {
  data: QueryResponse
}

export default function SentimentCard({ data }: Props) {
  const pct = data.overall_sentiment_positive_pct
  const color = pct >= 60 ? '#7c3aed' : pct >= 40 ? '#d97706' : '#dc2626'

  // SVG circle gauge
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Overall Sentiment
        </h3>
        <span className="text-xs text-gray-600 font-medium">
          {pct >= 60 ? 'Positive' : pct >= 40 ? 'Mixed' : 'Negative'}
        </span>
      </div>

      <div className="flex items-center gap-5 mt-4">
        {/* Circular gauge */}
        <svg width={100} height={100} className="shrink-0">
          <circle
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            stroke="#1e1e2e"
            strokeWidth={8}
          />
          <circle
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <text
            x={50}
            y={50}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={18}
            fontWeight={700}
            fontFamily="Inter, sans-serif"
          >
            {Math.round(pct)}%
          </text>
        </svg>

        <div>
          <p className="text-2xl font-bold text-white">{Math.round(pct)}%</p>
          <p className="text-sm text-gray-400 mt-0.5">positive mentions</p>
          <p className="text-xs text-gray-600 mt-2">
            Based on {data.total_posts_analyzed.toLocaleString()} posts · last {data.time_range_days} days
          </p>
        </div>
      </div>
    </div>
  )
}
