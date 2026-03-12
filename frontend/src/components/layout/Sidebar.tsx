import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart2, Bell, BookMarked, Swords, TrendingUp, Trash2 } from 'lucide-react'
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
    <aside className="w-56 min-h-screen bg-[#0F0F12] border-r border-[#1C1C22] flex flex-col p-4 gap-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 py-1">
        <span className="font-serif text-xl text-[#F0EEE8] tracking-tight">Hearo</span>
      </div>

      {/* Product selector */}
      <div>
        <p className="section-label mb-2 px-2">Product</p>
        <select
          value={currentProduct}
          onChange={(e) => setProduct(e.target.value)}
          className="w-full bg-[#111114] border border-[#1C1C22] text-[#F0EEE8] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#C8F04A]/40 transition-colors"
        >
          {PRODUCTS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        <p className="section-label mb-1 px-2">Workspace</p>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#C8F04A]/10 text-[#C8F04A] font-medium'
                  : 'text-[#9898A2] hover:text-[#F0EEE8] hover:bg-white/[0.03]'
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
        <p className="section-label mb-2 px-2">Saved Reports</p>
        {reports.length === 0 ? (
          <p className="text-xs text-[#78787F] px-3">No saved reports yet.</p>
        ) : (
          reports.slice(0, 8).map((report) => (
            <button
              key={report.id}
              onClick={() => handleLoadReport(report)}
              className="group flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-[#78787F] hover:text-[#F0EEE8] rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <BookMarked size={12} className="shrink-0" />
              <span className="truncate flex-1">{report.name}</span>
              <Trash2
                size={11}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-[#78787F] hover:text-[#FF6B6B] transition-all"
                onClick={(e) => handleDelete(e, report.id)}
              />
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
