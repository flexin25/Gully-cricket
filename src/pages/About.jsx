import { useTheme } from '../store/useThemeStore'
import Footer from '../components/Footer'

const USPS = [
  { icon: '⚡', title: '100% Offline', desc: 'No internet needed. Score matches anywhere — rooftops, maidan, parking lots.' },
  { icon: '🔒', title: 'Privacy First', desc: 'All data stays on YOUR device. No accounts, no cloud, no tracking.' },
  { icon: '⏱', title: 'Built for Speed', desc: 'Designed for one-thumb scoring. Ball-by-ball in under a second per tap.' },
  { icon: '📋', title: 'Detailed Stats', desc: 'Full batsman & bowler scorecards with SR, economy, 4s, 6s, and dismissal details.' },
  { icon: '🎯', title: 'Smart Logic', desc: 'Auto strike rotation, over changes, powerplay tracking, target/RRR calculations.' },
  { icon: '📥', title: 'PDF Export', desc: 'Download any match scorecard as a clean PDF from match history.' },
]

const FEATURES = [
  { icon: '📊', title: 'Ball-by-Ball', desc: 'Score every delivery with runs, extras, wickets, and fielder details.' },
  { icon: '📈', title: 'Live CRR & RRR', desc: 'Automatic run rate and required rate calculations in real time.' },
  { icon: '⏪', title: 'Undo Support', desc: 'Made a mistake? Undo the last ball instantly with one tap.' },
  { icon: '🔄', title: 'Auto Strike Rotate', desc: 'Strike rotation is handled automatically — odd runs, end of over.' },
  { icon: '🎯', title: 'Powerplay', desc: 'Set custom powerplay overs per match for field restriction tracking.' },
  { icon: '⏸', title: 'Timeout / Breaks', desc: 'Strategic timeout with a 2-minute timer. Resume when ready.' },
  { icon: '🏆', title: 'Match History', desc: 'All finished matches are saved locally. Download as PDF anytime.' },
  { icon: '🎨', title: 'Theme Selector', desc: 'Choose from 5 curated dark themes to match your style.' },
]

export default function About() {
  const t = useTheme()
  return (
    <div className="page-anim" style={{ background: t.bg, color: t.text, minHeight: '100vh', paddingTop: 60, paddingBottom: 60 }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px' }}>

        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 24, fontWeight: 700, color: t.accent, marginBottom: 8, marginTop: 20 }}>
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke={t.accent} strokeWidth="6"/>
            <path d="M40 30L60 50L40 70" stroke={t.accent} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          CricHub.in
        </h1>
        <p style={{ color: t.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
          CricHub.in was built by Abhishek Bardhan, a rookie developer with a passion for building "useless" but fun tools. Fuelled by Diet Coke and Linkin Park, this app was created to solve a simple problem: scoring gully cricket without the bloat.
        </p>
        <p style={{ color: t.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 30 }}>
          It's minimal, offline-first, and designed to get out of your way so you can focus on the next ball.
        </p>

        <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>▸ USPs</div>
        <div className="grid-2" style={{ marginBottom: 30 }}>
          {USPS.map((u) => (
            <div key={u.title} style={{ border: `1px solid ${t.border}`, borderRadius: 6, padding: 12, background: t.card }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{u.icon}</div>
              <div style={{ color: t.text, fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{u.title}</div>
              <div style={{ color: t.muted, fontSize: 11, lineHeight: 1.4 }}>{u.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>▸ Features</div>
        <div className="grid-2" style={{ marginBottom: 30 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ border: `1px solid ${t.border}`, borderRadius: 6, padding: '12px', background: t.card }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
              <div style={{ color: t.text, fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{f.title}</div>
              <div style={{ color: t.muted, fontSize: 11, lineHeight: 1.4 }}>{f.desc}</div>
            </div>
          ))}
        </div>


      </div>
      <Footer />
    </div>
  )
}
