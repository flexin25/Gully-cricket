import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import MatchSetup from '../components/MatchSetup'
import Scoreboard from '../components/Scoreboard'
import ScoreButtons from '../components/ScoreButtons'
import BatsmanStats from '../components/BatsmanStats'
import BowlerStats from '../components/BowlerStats'
import BreakTimer from '../components/BreakTimer'

const LAYOUT = { maxWidth: 480, margin: '0 auto', padding: '0 20px' }

export default function Match() {
  const t = useTheme()
  const navigate = useNavigate()
  const {
    phase, needNewBatsman, needNewBowler,
    battingTeam, bowlingTeam, teamA, teamB,
    currentBatsmen, currentBowler,
    batsmanStats,
    setOpeningPlayers, selectNewBatsman, selectNewBowler,
    matchName,
  } = useMatchStore()

  useEffect(() => {
    if (phase === 'done') navigate('/summary')
  }, [phase, navigate])

  const [striker, setStriker] = useState('')
  const [nonStriker, setNonStriker] = useState('')
  const [bowler, setBowler] = useState('')

  const battingObj = battingTeam === 'A' ? teamA : teamB
  const bowlingObj = bowlingTeam === 'A' ? teamA : teamB
  const availableBat = battingObj.players.filter(p => !batsmanStats[p]?.out)
  const availableBowl = bowlingObj.players

  const sel = (val) => ({
    background: t.bg, border: `1px solid ${val ? t.accent : t.border}`,
    borderRadius: 4, color: val ? t.text : t.muted,
    fontFamily: 'inherit', fontSize: 13, padding: '9px 12px', width: '100%', outline: 'none', cursor: 'pointer',
  })

  // ── Setup ──
  if (phase === 'setup') return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }}>
      <Header t={t} title="MATCH SETUP" navigate={navigate} matchName={matchName} />
      <MatchSetup />
    </div>
  )

  // ── Opening ──
  const needOpening = !currentBatsmen.striker || !currentBatsmen.nonStriker || !currentBowler
  if (needOpening) return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }}>
      <Header t={t} title={phase === 'innings2' ? 'INN 2 SETUP' : 'OPENING PLAYERS'} navigate={navigate} matchName={matchName} />
      <div style={{ ...LAYOUT, paddingTop: 4 }}>
        <Lbl t={t}>{battingObj.name} — batsmen</Lbl>
        <Select label="striker" players={availableBat.filter(p => p !== nonStriker)} value={striker} onChange={setStriker} t={t} sel={sel} />
        <Select label="non-striker" players={availableBat.filter(p => p !== striker)} value={nonStriker} onChange={setNonStriker} t={t} sel={sel} />
        <Lbl t={t}>{bowlingObj.name} — bowler</Lbl>
        <Select label="bowler" players={availableBowl} value={bowler} onChange={setBowler} t={t} sel={sel} />
        <button id="btn-confirm-players" className="btn-t" disabled={!striker || !nonStriker || !bowler}
          onClick={() => { if (striker && nonStriker && bowler) setOpeningPlayers({ striker, nonStriker, bowler }) }}
          style={{ marginTop: 16, width: '100%', background: 'none', border: `1px solid ${t.accent}`, borderRadius: 4, color: t.accent, padding: '11px', fontSize: 13, fontWeight: 600 }}>
          CONFIRM & START →
        </button>
      </div>
    </div>
  )

  // ── New batsman ──
  if (needNewBatsman) {
    const available = battingObj.players.filter(p => p !== currentBatsmen.nonStriker && !batsmanStats[p]?.out)
    return (
      <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }}>
        <Header t={t} title="WICKET — NEXT BATSMAN" navigate={navigate} matchName={matchName} />
        <div style={{ ...LAYOUT, paddingTop: 4 }}>
          <Lbl t={t}>who comes in next?</Lbl>
          {available.length === 0
            ? <div style={{ color: t.red, fontSize: 12 }}>No more batsmen</div>
            : available.map(p => (
                <button key={p} className="btn-t" onClick={() => selectNewBatsman(p)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 4, background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.text, fontFamily: 'inherit', fontSize: 13, padding: '10px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                  ▸ {p}
                </button>
              ))
          }
        </div>
      </div>
    )
  }

  // ── New bowler ──
  if (needNewBowler) {
    const eligible = bowlingObj.players.filter(p => p !== currentBowler)
    const pool = eligible.length > 0 ? eligible : bowlingObj.players
    return (
      <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }}>
        <Header t={t} title="END OF OVER — BOWLER" navigate={navigate} matchName={matchName} />
        <div style={{ ...LAYOUT, paddingTop: 4 }}>
          <Lbl t={t}>select next bowler</Lbl>
          {pool.map(p => (
            <button key={p} className="btn-t" onClick={() => selectNewBowler(p)}
              style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 4, background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.text, fontFamily: 'inherit', fontSize: 13, padding: '10px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
              ▹ {p}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Main scoring ──
  return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title={`${battingObj.name} batting`} navigate={navigate} matchName={matchName} />
      <div style={{ ...LAYOUT, flex: 1, paddingTop: 10, paddingBottom: 24, overflowY: 'auto' }}>
        <Scoreboard />
        <BreakTimer />
        <ScoreButtons />
        <BatsmanStats />
        <BowlerStats />
      </div>
    </div>
  )
}

function Header({ t, title, navigate, matchName }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 40, padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: t.bg, borderBottom: `1px solid ${t.border}`,
    }}>
      <button className="btn-t" onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, padding: 0 }}>
        [home]
      </button>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: t.text, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
        {matchName && <div style={{ color: t.muted, fontSize: 10, marginTop: 1 }}>"{matchName}"</div>}
      </div>
      <div style={{ width: 40 }} />
    </div>
  )
}

function Lbl({ t, children }) {
  return <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '12px 0 6px' }}>▸ {children}</div>
}

function Select({ label, players, value, onChange, t, sel }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ color: t.border, fontSize: 11, marginBottom: 2 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)} style={sel(value)}>
        <option value="">-- select --</option>
        {players.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
  )
}
