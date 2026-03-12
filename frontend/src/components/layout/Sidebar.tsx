import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart2, Bell, BookMarked, Swords, TrendingUp, Trash2, Zap } from 'lucide-react'
import { useQueryStore } from '../../store/queryStore'
import { getReports, deleteReport } from '../../lib/reports'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

const PRODUCTS = ['notion', 'linear', 'figma', 'slack', 'github']

const NAV = [
  { to: '/', label: 'Overview', Icon: BarChart2 },
  { to: '/competitors', label: 'Competitors', Icon: Swords },
  { to: '/trends', label: 'Trends', Icon: TrendingUp },
  { to: '/alerts', label: 'Alerts', Icon: Bell },
]

export default function Sidebar() {
  const { currentProduct, setProduct, setQuery, loadResults } = useQueryStore()
  const navigate = useNavigate()
  const [reports, setReports] = useState(getReports())

  // Refresh reports list when localStorage changes (e.g. after saving)
  useEffect(() => {
    const refresh = () => setReports(getReports())
    window.addEventListener('storage', refresh)
    const interval = setInterval(refresh, 2000)
    return () => {
      window.removeEventListener('storage', refresh)
      clearInterval(interval)
    }
  }, [])

  const handleLoadReport = (report: (typeof reports)[0]) => {
    setProduct(report.product)
    setQuery(report.query)
    loadResults(report.results)
    navigate('/')
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteReport(id)
    setReports(getReports())
  }

  return (
    <aside className="w-56 min-h-screen bg-[#0d0d15] border-r border-[#1e1e2e] flex flex-col p-4 gap-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 py-1">
        <Zap size={18} className="text-violet-400" />
        <span className="font-bold text-white text-lg tracking-tight">Hearo</span>
      </div>

      {/* Product selector */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 px-2">Product</p>
        <select
          value={currentProduct}
          onChange={(e) => setProduct(e.target.value)}
          className="w-full bg-[#17172a] border border-[#2a2a3e] text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
        >
          {PRODUCTS.map((p) => (
            <option key={p} value={p} className="capitalize">
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-violet-500/15 text-violet-300 font-medium'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Saved reports */}
      <div className="mt-auto">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 px-2">Saved Reports</p>
        {reports.length === 0 ? (
          <p className="text-xs text-gray-700 px-3">No saved reports yet.</p>
        ) : (
          reports.slice(0, 8).map((report) => (
            <button
              key={report.id}
              onClick={() => handleLoadReport(report)}
              className="group flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
            >
              <BookMarked size={12} className="shrink-0" />
              <span className="truncate flex-1">{report.name}</span>
              <Trash2
                size={11}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                onClick={(e) => handleDelete(e, report.id)}
              />
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
