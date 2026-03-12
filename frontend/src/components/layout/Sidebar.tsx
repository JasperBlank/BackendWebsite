import { NavLink } from 'react-router-dom'
import { BarChart2, Bell, BookMarked, Swords, TrendingUp, Zap } from 'lucide-react'
import { useQueryStore } from '../../store/queryStore'
import clsx from 'clsx'

const PRODUCTS = ['notion', 'linear', 'figma', 'slack', 'github']

const NAV = [
  { to: '/', label: 'Overview', Icon: BarChart2 },
  { to: '/competitors', label: 'Competitors', Icon: Swords },
  { to: '/trends', label: 'Trends', Icon: TrendingUp },
  { to: '/alerts', label: 'Alerts', Icon: Bell },
]

const SAVED = ['Notion audit', 'Linear vs Jira', 'Market validate']

export default function Sidebar() {
  const { currentProduct, setProduct } = useQueryStore()

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
        {SAVED.map((name) => (
          <button
            key={name}
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
          >
            <BookMarked size={12} />
            {name}
          </button>
        ))}
      </div>
    </aside>
  )
}
