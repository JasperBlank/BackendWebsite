import { Bell, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQueryStore } from '../store/queryStore'
import { listAlerts, createAlert, updateAlert, deleteAlert, IS_DEMO } from '../api/client'
import type { Alert } from '../types'

const DEMO_ALERTS: Alert[] = [
  { id: '1', product: 'notion', topic: 'performance', threshold: 30, active: true, created_at: new Date().toISOString() },
  { id: '2', product: 'notion', topic: 'onboarding', threshold: 20, active: false, created_at: new Date().toISOString() },
]

export default function Alerts() {
  const { currentProduct } = useQueryStore()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [topic, setTopic] = useState('')
  const [threshold, setThreshold] = useState('20')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (IS_DEMO) {
      setAlerts(DEMO_ALERTS)
      setLoading(false)
      return
    }
    listAlerts(currentProduct)
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }, [currentProduct])

  const toggle = async (id: string) => {
    const alert = alerts.find((a) => a.id === id)
    if (!alert) return
    const updated = { ...alert, active: !alert.active }
    setAlerts((a) => a.map((al) => (al.id === id ? updated : al)))
    if (!IS_DEMO) {
      await updateAlert(id, { active: updated.active }).catch(() => {})
    }
  }

  const add = async () => {
    if (!topic.trim()) return
    if (IS_DEMO) {
      setAlerts((a) => [
        ...a,
        { id: Date.now().toString(), product: currentProduct, topic, threshold: parseInt(threshold), active: true, created_at: new Date().toISOString() },
      ])
    } else {
      const alert = await createAlert({ product: currentProduct, topic, threshold: parseInt(threshold) })
      setAlerts((a) => [...a, alert])
    }
    setTopic('')
  }

  const remove = async (id: string) => {
    setAlerts((a) => a.filter((al) => al.id !== id))
    if (!IS_DEMO) {
      await deleteAlert(id).catch(() => {})
    }
  }

  return (
    <div className="flex-1 p-8 max-w-3xl mx-auto w-full">
      <h1 className="font-serif text-3xl text-[#F0EEE8] mb-1">Alerts</h1>
      <p className="text-sm text-[#9898A2] font-light mb-6">
        Get notified when complaint topics spike for{' '}
        <span className="text-[#C8F04A] capitalize">{currentProduct}</span>.
      </p>

      {/* Add alert */}
      <div className="bg-[#111114] border border-[#1C1C22] rounded-xl p-5 mb-4">
        <p className="text-sm font-medium text-[#F0EEE8] mb-3">New alert</p>
        <div className="flex gap-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Topic (e.g. performance)"
            className="flex-1 bg-[#111114] border border-[#242430] text-sm text-[#F0EEE8] placeholder-[#78787F] rounded-lg px-3 py-2 focus:outline-none focus:border-[#C8F04A]/40 transition-colors"
          />
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-20 bg-[#111114] border border-[#242430] text-sm text-[#F0EEE8] rounded-lg px-3 py-2 focus:outline-none focus:border-[#C8F04A]/40 transition-colors"
          />
          <span className="text-sm text-[#78787F] flex items-center">% threshold</span>
          <button
            onClick={add}
            className="flex items-center gap-1 px-3 py-2 bg-[#C8F04A] hover:bg-[#d4f55e] text-[#09090B] text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* Alert list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-[#111114] border border-[#1C1C22] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-[#78787F] text-center py-8">No alerts yet. Add one above.</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between bg-[#111114] border border-[#1C1C22] rounded-xl px-5 py-3"
            >
              <div className="flex items-center gap-3">
                <Bell size={14} className={alert.active ? 'text-[#C8F04A]' : 'text-[#78787F]'} />
                <span className="text-sm text-[#F0EEE8] font-medium">{alert.topic}</span>
                <span className="text-xs text-[#78787F]">&ge; {alert.threshold}% mentions</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => remove(alert.id)}
                  className="text-[#78787F] hover:text-[#FF6B6B] transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => toggle(alert.id)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${alert.active ? 'bg-[#C8F04A]' : 'bg-[#242430]'}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-transform ${alert.active ? 'bg-[#09090B] translate-x-5' : 'bg-[#78787F] translate-x-0.5'}`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
