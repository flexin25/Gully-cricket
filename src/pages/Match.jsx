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
import SuperOverIntro from '../components/SuperOverIntro'

const LAYOUT = { maxWidth: 480, margin: '0 auto', paddingLeft: 20, paddingRight: 20 }

export default function Match() {
  const t = useTheme()
  const navigate = useNavigate()
  const {
    phase, needNewBatsman, needNewBowler,
    battingTeam, bowlingTeam, teamA, teamB,
    currentBatsmen, currentBowler, lastOverBowler,
    batsmanStats, superOvers, newBatsmanSlot,
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

  // Which Super Over we're on. Only ever used for labelling; the engine derives
  // everything it needs from `phase` and the last superOvers entry itself.
  const inSuper = phase === 'super'
  const superNo = superOvers?.length || 0
  const superLabel = superNo > 1 ? `SUPER OVER ${superNo}` : 'SUPER OVER'

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

  // ── Tied — Super Over ahead ──
  // Must come before needOpening: a wicket-ended innings leaves striker null, so
  // needOpening would be true and the tie would render as a players screen.
  if (phase === 'tied') return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }}>
      <Header t={t} navigate={navigate} matchName={matchName}
        title={superNo > 0 ? `SUPER OVER ${superNo} TIED` : 'MATCH TIED'} />
      <SuperOverIntro />
    </div>
  )

  // ── Opening ──
  // `newBatsmanSlot` is set only when a wicket has left one specific slot empty
  // mid-innings; it's null at the start of an innings. Without that guard a
  // wicket (which nulls the dismissed batsman) satisfies the test below, so the
  // full three-select screen renders instead of the next-batsman list further
  // down — re-picking both batsmen and letting the bowler be changed mid-over.
  const needOpening = !newBatsmanSlot
    && (!currentBatsmen.striker || !currentBatsmen.nonStriker || !currentBowler)
  if (needOpening) return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }}>
      <Header t={t} navigate={navigate} matchName={matchName}
        title={inSuper ? `${superLabel} — SELECT PLAYERS` : phase === 'innings2' ? 'INN 2 SETUP' : 'OPENING PLAYERS'} />
      <div style={{ ...LAYOUT, paddingTop: 4 }}>
        {inSuper && <SuperBand t={t} label={superLabel} sub={`${battingObj.name} batting · ${bowlingObj.name} bowling`} />}
        <Lbl t={t}>{battingObj.name} — batsmen</Lbl>
        <Select label="striker" players={availableBat.filter(p => p !== nonStriker)} value={striker} onChange={setStriker} t={t} sel={sel} />
        <Select label="non-striker" players={availableBat.filter(p => p !== striker)} value={nonStriker} onChange={setNonStriker} t={t} sel={sel} />
        <Lbl t={t}>{bowlingObj.name} — bowler</Lbl>
        <Select label="bowler" players={availableBowl} value={bowler} onChange={setBowler} t={t} sel={sel} />
        {inSuper && (
          <Note t={t}>
            Anyone in the squad can bat or bowl this over — being out or having bowled
            in the match doesn't rule them out. One over, two wickets.
          </Note>
        )}
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
        <Header t={t} navigate={navigate} matchName={matchName}
          title={inSuper ? `${superLabel} — WICKET` : 'WICKET — NEXT BATSMAN'} />
        <div style={{ ...LAYOUT, paddingTop: 4 }}>
          {inSuper && <SuperBand t={t} label={superLabel} sub="1 down — the next wicket ends the over" />}
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
    // One bowler can't bowl two overs on the trot. They're shown but disabled,
    // with the reason spelled out below the list — hiding them silently reads
    // as a missing player.
    const squad = bowlingObj.players
    const eligible = squad.filter(p => p !== lastOverBowler)
    // Nobody else to turn to (a one-bowler side) — the rule has to yield.
    const ruleApplies = eligible.length > 0
    return (
      <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }}>
        <Header t={t} title="END OF OVER — BOWLER" navigate={navigate} matchName={matchName} />
        <div style={{ ...LAYOUT, paddingTop: 4 }}>
          <Lbl t={t}>select next bowler</Lbl>
          {squad.map(p => {
            const resting = ruleApplies && p === lastOverBowler
            return (
              <button key={p} className="btn-t" disabled={resting}
                onClick={() => { if (!resting) selectNewBowler(p) }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  width: '100%', textAlign: 'left', marginBottom: 4, background: 'none',
                  border: `1px solid ${t.border}`, borderRadius: 4,
                  color: resting ? t.muted : t.text,
                  fontFamily: 'inherit', fontSize: 13, padding: '10px',
                  cursor: resting ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!resting) e.currentTarget.style.borderColor = t.accent }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border }}>
                <span>▹ {p}</span>
                {resting && <span style={{ fontSize: 10, letterSpacing: '0.06em' }}>BOWLED LAST OVER</span>}
              </button>
            )
          })}
          {ruleApplies && lastOverBowler && (
            <Note t={t}>
              {lastOverBowler} bowled the last over and has to sit this one out — they can come
              back the over after.
            </Note>
          )}
        </div>
      </div>
    )
  }

  // ── Main scoring ──
  return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header t={t} navigate={navigate} matchName={matchName}
        title={inSuper ? `${superLabel} · ${battingObj.name}` : `${battingObj.name} batting`} />
      <div style={{ ...LAYOUT, flex: 1, paddingTop: 10, paddingBottom: 24, overflowY: 'auto' }}>
        <Scoreboard />
        {/* No drinks break in a one-over innings. */}
        {!inSuper && <BreakTimer />}
        <ScoreButtons />
        <BatsmanStats />
        <BowlerStats />
      </div>
    </div>
  )
}

/** Accent strip marking a Super Over screen, so no screen in the phase can be
 *  mistaken for the normal innings it followed. */
function SuperBand({ t, label, sub }) {
  return (
    <div style={{
      background: t.accent + '14', border: `1px solid ${t.accent}44`, borderRadius: 5,
      padding: '8px 12px', marginTop: 10, textAlign: 'center',
    }}>
      <div style={{ color: t.accent, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em' }}>⚡ {label}</div>
      {sub && <div style={{ color: t.muted, fontSize: 10, marginTop: 2 }}>{sub}</div>}
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

/** Inline rule explanation. role="note" — it's context, not an error, so it
 *  shouldn't interrupt a screen reader the way role="alert" would. */
function Note({ t, children }) {
  return (
    <div role="note" style={{
      color: t.muted, fontSize: 11, lineHeight: 1.45, marginTop: 8,
      display: 'flex', gap: 5, alignItems: 'flex-start',
      border: `1px solid ${t.border}`, borderRadius: 4, padding: '8px 10px',
      background: 'color-mix(in oklab, var(--primary) 6%, var(--card))',
    }}>
      <span aria-hidden="true">ℹ</span><span>{children}</span>
    </div>
  )
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
