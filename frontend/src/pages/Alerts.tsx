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
      <h1 className="text-2xl font-bold text-white mb-1">Alerts</h1>
      <p className="text-sm text-gray-500 mb-6">
        Get notified when complaint topics spike for{' '}
        <span className="text-violet-400 capitalize">{currentProduct}</span>.
      </p>

      {/* Add alert */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 mb-4">
        <p className="text-sm font-medium text-gray-300 mb-3">New alert</p>
        <div className="flex gap-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Topic (e.g. performance)"
            className="flex-1 bg-[#17172a] border border-[#2a2a3e] text-sm text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
          />
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-20 bg-[#17172a] border border-[#2a2a3e] text-sm text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
          />
          <span className="text-sm text-gray-500 flex items-center">% threshold</span>
          <button
            onClick={add}
            className="flex items-center gap-1 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
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
            <div key={i} className="h-14 bg-[#111118] border border-[#1e1e2e] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-gray-600 text-center py-8">No alerts yet. Add one above.</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between bg-[#111118] border border-[#1e1e2e] rounded-xl px-5 py-3"
            >
              <div className="flex items-center gap-3">
                <Bell size={14} className={alert.active ? 'text-violet-400' : 'text-gray-600'} />
                <span className="text-sm text-gray-200 font-medium">{alert.topic}</span>
                <span className="text-xs text-gray-500">&ge; {alert.threshold}% mentions</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => remove(alert.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => toggle(alert.id)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${alert.active ? 'bg-violet-600' : 'bg-[#2a2a3e]'}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${alert.active ? 'translate-x-5' : 'translate-x-0.5'}`}
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
