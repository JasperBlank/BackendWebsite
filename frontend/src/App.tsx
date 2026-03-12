import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Overview from './pages/Overview'
import Competitors from './pages/Competitors'
import Trends from './pages/Trends'
import Alerts from './pages/Alerts'

const basename = import.meta.env.VITE_DEMO_MODE === 'true' ? '/hearo' : '/'

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
