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
      <h1 className="text-2xl font-bold text-white mb-1">Sentiment Trends</h1>
      <p className="text-sm text-gray-500 mb-6">Weekly sentiment score over time for {currentProduct}</p>

      {loading && <Skeleton className="h-72" />}

      {!loading && data.length === 0 && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">No trend data yet. Ingest some data first.</p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#1e1e2e' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111118',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                }}
                formatter={(v: number) => [`${v}%`, 'Positive sentiment']}
              />
              <Line
                type="monotone"
                dataKey="sentiment_positive_pct"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ fill: '#7c3aed', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
