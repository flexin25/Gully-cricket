import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useTheme } from './store/useThemeStore'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Match from './pages/Match'
import Summary from './pages/Summary'
import MatchHistory from './pages/MatchHistory'

function Layout() {
  const t = useTheme()
  const location = useLocation()
  // Hide navbar during active match scoring
  const hideNav = location.pathname === '/match'

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }}>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/match" element={<Match />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/history" element={<MatchHistory />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
