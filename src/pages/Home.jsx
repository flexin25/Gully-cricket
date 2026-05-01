import { useNavigate } from 'react-router-dom'
import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import Footer from '../components/Footer'

export default function Home() {
  const navigate = useNavigate()
  const { resetMatch, phase } = useMatchStore()
  const t = useTheme()

  return (
    <div className="page-anim" style={{ background: t.bg, color: t.text, minHeight: '100vh', paddingTop: 60, paddingBottom: 60 }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>🏏</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: t.accent, margin: 0, letterSpacing: '-0.02em' }}>
            CricHub<span style={{ color: t.muted, fontWeight: 300 }}>.in</span>
          </h1>
          <p style={{ color: t.muted, fontSize: 13, marginTop: 8, lineHeight: 1.6, maxWidth: 360, margin: '8px auto 0' }}>
            The fastest, terminal-grade cricket scoring app for gully matches,
            street tournaments, and weekend leagues. No login. No cloud. Just cricket.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 30 }}>
          <ActionBtn t={t} accent onClick={() => { resetMatch(); navigate('/match') }} id="btn-new-match">
            ▸ New Match
          </ActionBtn>
          {(phase === 'innings1' || phase === 'innings2') && (
            <ActionBtn t={t} onClick={() => navigate('/match')} id="btn-continue-match">
              ▸ Continue Match
            </ActionBtn>
          )}
          {phase === 'done' && (
            <ActionBtn t={t} onClick={() => navigate('/summary')} id="btn-view-summary">
              ▸ View Last Result
            </ActionBtn>
          )}
          <ActionBtn t={t} muted onClick={() => navigate('/history')}>
            ▸ Match History
          </ActionBtn>
        </div>

        {/* How it works */}
        <SectionLabel t={t}>How It Works</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 30 }}>
          {[
            { step: '01', text: 'Enter team names, add players, and set overs + powerplay.' },
            { step: '02', text: 'Select opening batsmen and bowler, then score ball-by-ball.' },
            { step: '03', text: 'Match auto-transitions between innings and shows the result.' },
            { step: '04', text: 'View summary scorecard and save to match history.' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${t.border}` }}>
              <span style={{ color: t.accent, fontWeight: 700, fontSize: 13, minWidth: 24 }}>{step}</span>
              <span style={{ color: t.muted, fontSize: 12 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid-3" style={{ marginBottom: 20 }}>
          {[
            { label: 'Offline First', val: '100%' },
            { label: 'Data Saved', val: 'Locally' },
            { label: 'Open Source', val: 'Free' },
          ].map(({ label, val }) => (
            <div key={label} style={{ border: `1px solid ${t.border}`, borderRadius: 6, padding: 10, textAlign: 'center', background: t.card }}>
              <div style={{ color: t.accent, fontWeight: 700, fontSize: 16 }}>{val}</div>
              <div style={{ color: t.muted, fontSize: 10, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

      </div>
      <Footer />
    </div>
  )
}

function ActionBtn({ children, onClick, id, t, accent, muted }) {
  return (
    <button id={id} className="btn-t" onClick={onClick}
      style={{
        background: 'transparent', border: `1px solid ${accent ? t.accent : t.border}`,
        borderRadius: 5, color: accent ? t.accent : muted ? t.muted : t.text,
        fontFamily: 'inherit', fontSize: 13, padding: '12px', textAlign: 'left',
        fontWeight: accent ? 700 : 400, width: '100%', cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = t.surface}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {children}
    </button>
  )
}

function SectionLabel({ t, children }) {
  return <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>▸ {children}</div>
}
