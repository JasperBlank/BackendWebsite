import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getTrends } from '../api/client'
import { useQueryStore } from '../store/queryStore'
import type { TrendPoint } from '../types'
import { Skeleton } from '../components/shared/Skeleton'

export default function Trends() {
  const { currentProduct } = useQueryStore()
  const [data, setData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getTrends(currentProduct)
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [currentProduct])

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
      <h1 className="font-serif text-3xl text-[#F0EEE8] mb-1">Sentiment Trends</h1>
      <p className="text-sm text-[#9898A2] font-light mb-6">Weekly sentiment score over time for <span className="text-[#C8F04A] capitalize">{currentProduct}</span></p>

      {loading && <Skeleton className="h-72" />}

      {!loading && data.length === 0 && (
        <div className="bg-[#111114] border border-[#1C1C22] rounded-xl p-8 text-center">
          <p className="text-[#78787F] text-sm">No trend data yet. Ingest some data first.</p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="bg-[#111114] border border-[#1C1C22] rounded-xl p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1C22" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#78787F', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#1C1C22' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#78787F', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111114',
                  border: '1px solid #242430',
                  borderRadius: '8px',
                  color: '#F0EEE8',
                  fontSize: '12px',
                  fontFamily: 'Epilogue, sans-serif',
                }}
                formatter={(v: number) => [`${v}%`, 'Positive sentiment']}
              />
              <Line
                type="monotone"
                dataKey="sentiment_positive_pct"
                stroke="#C8F04A"
                strokeWidth={2}
                dot={{ fill: '#C8F04A', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
