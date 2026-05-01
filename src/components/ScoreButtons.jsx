import { useState } from 'react'
import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import { RotateCcw } from 'lucide-react'

const RUNS = [0, 1, 2, 3, 4, 6]
const EXTRAS = [
  { label: 'WD', key: 'wide' },
  { label: 'NB', key: 'noBall' },
  { label: 'BYE', key: 'bye' },
  { label: 'LB', key: 'legBye' },
]
const DISMISSALS = ['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket']
const NEEDS_FIELDER = ['Caught', 'Run Out', 'Stumped']

export default function ScoreButtons() {
  const t = useTheme()
  const {
    addBall, undoBall, ballsHistory,
    needNewBatsman, needNewBowler, breakActive,
    pendingWicket, startWicket, confirmWicket, cancelWicket,
    bowlingTeam, teamA, teamB,
  } = useMatchStore()

  const [pendingExtra, setPendingExtra] = useState(null)
  const [showWicketMenu, setShowWicketMenu] = useState(false)
  const [fielderSearch, setFielderSearch] = useState('')

  const blocked = needNewBatsman || needNewBowler || breakActive
  const bowlingPlayers = (bowlingTeam === 'A' ? teamA : teamB).players

  const baseBtn = {
    background: 'transparent', border: `1px solid ${t.border}`,
    borderRadius: 4, color: t.text, fontFamily: 'inherit',
    fontSize: 14, fontWeight: 500, padding: '11px 0', cursor: 'pointer',
    textAlign: 'center', width: '100%',
  }

  const handleRun = (r) => {
    if (blocked) return
    addBall({ runs: r, extraType: pendingExtra })
    setPendingExtra(null)
  }

  return (
    <div>
      {/* Pending extra banner */}
      {pendingExtra && (
        <div style={{ border: `1px solid ${t.yellow}44`, borderRadius: 4, padding: '6px 10px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: t.yellow }}>▸ {pendingExtra.toUpperCase()} — tap runs</span>
          <button onClick={() => setPendingExtra(null)} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11 }}>[esc]</button>
        </div>
      )}

      {/* Runs 6-col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4, marginBottom: 4 }}>
        {RUNS.map((r) => (
          <button key={r} id={`btn-run-${r}`} className="btn-t" disabled={blocked} onClick={() => handleRun(r)}
            style={{ ...baseBtn, fontWeight: r >= 4 ? 700 : 500, color: r >= 4 ? t.accent : t.text }}
            onMouseEnter={e => e.currentTarget.style.background = t.surface}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{r}</button>
        ))}
      </div>

      {/* Extras 4-col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, marginBottom: 4 }}>
        {EXTRAS.map(({ label, key }) => (
          <button key={key} id={`btn-extra-${key}`} className="btn-t" disabled={blocked}
            onClick={() => { if (!blocked) setPendingExtra(key) }}
            style={{ ...baseBtn, color: key === 'wide' || key === 'noBall' ? t.yellow : t.muted, fontSize: 12, borderColor: pendingExtra === key ? t.yellow : t.border }}
            onMouseEnter={e => e.currentTarget.style.background = t.surface}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{label}</button>
        ))}
      </div>

      {/* Wicket + Undo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <button id="btn-wicket" className="btn-t" disabled={blocked}
            onClick={() => { if (!blocked) setShowWicketMenu(v => !v) }}
            style={{ ...baseBtn, color: t.red, fontWeight: 700 }}
            onMouseEnter={e => e.currentTarget.style.background = t.surface}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            W  WICKET
          </button>
          {showWicketMenu && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 50, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 4, marginBottom: 2, overflow: 'hidden' }}>
              {DISMISSALS.map((d) => (
                <button key={d} onClick={() => { startWicket(d); setShowWicketMenu(false) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'none', border: 'none', borderBottom: `1px solid ${t.border}`, color: t.text, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = t.card}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>▸ {d}</button>
              ))}
            </div>
          )}
        </div>
        <button id="btn-undo" className="btn-t" disabled={!ballsHistory.length || blocked}
          onClick={undoBall}
          style={{ ...baseBtn, color: t.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.background = t.surface}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <RotateCcw size={13} /> UNDO
        </button>
      </div>

      {/* ── Fielder selection overlay ──────────────────────────────────── */}
      {pendingWicket && (
        <div className="overlay-bg">
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 6, padding: 16, maxWidth: 340, width: '90%' }}>
            <div style={{ color: t.red, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              {pendingWicket.dismissal}!
            </div>
            <p style={{ color: t.muted, fontSize: 12, marginBottom: 10 }}>
              Who {pendingWicket.dismissal === 'Caught' ? 'caught the ball' : pendingWicket.dismissal === 'Stumped' ? 'stumped the batsman' : 'effected the run out'}?
            </p>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {bowlingPlayers.map((p) => (
                <button key={p} className="btn-t" onClick={() => confirmWicket(pendingWicket.dismissal, p)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 3, background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.text, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                  ▸ {p}
                </button>
              ))}
            </div>
            <button className="btn-t" onClick={cancelWicket}
              style={{ marginTop: 10, width: '100%', background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.muted, padding: '8px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
