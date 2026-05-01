import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useThemeStore, { useTheme, THEMES } from '../store/useThemeStore'
import { Palette } from 'lucide-react'

const LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const t = useTheme()
  const { currentTheme, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const activeIdx = LINKS.findIndex((l) => l.path === location.pathname)
  const [themeOpen, setThemeOpen] = useState(false)

  return (
    <nav
      style={{
        position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 999, display: 'flex', alignItems: 'center', gap: '4px',
        background: t.surface + 'e6',
        border: `1px solid ${t.border}`,
        borderRadius: '8px',
        padding: '4px 6px',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Brand */}
      <button
        onClick={() => navigate('/')}
        className="btn-t"
        style={{
          background: 'none', border: 'none', color: t.accent,
          fontWeight: 700, fontSize: '13px', padding: '6px 10px', letterSpacing: '0.02em',
        }}
      >
        CricHub<span style={{color: t.muted, fontWeight: 400}}>.in</span>
      </button>

      <div style={{ width: 1, height: 18, background: t.border, margin: '0 4px' }} />

      {/* Links */}
      <div style={{ position: 'relative', display: 'flex' }}>
        {LINKS.map((link, i) => (
          <button
            key={link.path}
            className="btn-t"
            onClick={() => navigate(link.path)}
            style={{
              background: activeIdx === i ? t.accent + '11' : 'none', 
              border: 'none',
              borderRadius: '4px',
              color: (activeIdx === i) ? t.accent : t.muted,
              fontSize: '12px', padding: '6px 14px',
              fontWeight: activeIdx === i ? 600 : 400,
              fontFamily: 'inherit',
              position: 'relative', zIndex: 2,
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 18, background: t.border, margin: '0 4px' }} />

      {/* Theme Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn-t"
          onClick={() => setThemeOpen(!themeOpen)}
          style={{
            background: 'none', border: 'none', color: t.muted,
            padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Palette size={14} />
        </button>
        {themeOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setThemeOpen(false)} />
            <div
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                background: t.card, border: `1px solid ${t.border}`, borderRadius: 6,
                padding: 4, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 2,
                minWidth: 140, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ color: t.muted, fontSize: 10, padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Theme</div>
              {Object.entries(THEMES).map(([key, th]) => (
                <button
                  key={key}
                  className="btn-t"
                  onClick={() => { setTheme(key); setThemeOpen(false) }}
                  style={{
                    background: currentTheme === key ? th.accent + '22' : 'transparent',
                    border: 'none', borderRadius: 4,
                    color: currentTheme === key ? th.accent : t.text,
                    padding: '8px 10px', fontSize: 12, textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = currentTheme === key ? th.accent + '22' : t.surface}
                  onMouseLeave={e => e.currentTarget.style.background = currentTheme === key ? th.accent + '22' : 'transparent'}
                >
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: th.accent }} />
                  {th.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
