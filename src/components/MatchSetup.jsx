import { useState } from 'react'
import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import { Plus, Trash2 } from 'lucide-react'
import TossCoin from './TossCoin'

/** Minimum named players per side. maxWickets is players-1, so 3 is the
 *  smallest roster that still gives a side more than one wicket to lose. */
const MIN_PLAYERS = 3

/** Team names allow letters, digits and spaces and must contain at least one
 *  letter — "Gully XI 11" passes, "12345" and "Team@#!" do not. */
const TEAM_NAME_ALLOWED = /^[A-Za-z0-9 ]+$/
function teamNameError(name) {
  const v = name.trim()
  if (!v) return ''  // blank is allowed; it falls back to "Team A" / "Team B"
  if (!TEAM_NAME_ALLOWED.test(v)) return 'No special characters — letters, numbers and spaces only.'
  if (!/[A-Za-z]/.test(v)) return 'Needs letters, not just numbers.'
  return ''
}

export default function MatchSetup() {
  const t = useTheme()
  const setupMatch = useMatchStore((s) => s.setupMatch)

  const [matchName, setMatchName] = useState('')
  const [teamAName, setTeamAName] = useState('')
  const [teamBName, setTeamBName] = useState('')
  const [playersA, setPlayersA] = useState(['', '', '', '', '', ''])
  const [playersB, setPlayersB] = useState(['', '', '', '', '', ''])
  const [totalOvers, setTotalOvers] = useState(6)
  const [powerplayOvers, setPowerplayOvers] = useState(0)
  const [step, setStep] = useState(1)

  const [captains, setCaptains] = useState({ A: null, B: null })
  const [viceCaptains, setViceCaptains] = useState({ A: null, B: null })

  /** Drop the C/VC badges a slot held once its name changes or the slot goes,
   *  so captains.A can never name someone who left the team sheet. */
  const dropBadges = (team, name) => {
    if (!name) return
    setCaptains((prev) => (prev[team] === name ? { ...prev, [team]: null } : prev))
    setViceCaptains((prev) => (prev[team] === name ? { ...prev, [team]: null } : prev))
  }

  const handlePlayerChange = (team, idx, val) => {
    const list = team === 'A' ? playersA : playersB
    const was = list[idx]
    const u = [...list]; u[idx] = val
    if (team === 'A') setPlayersA(u); else setPlayersB(u)
    if (was !== val) dropBadges(team, was)
  }
  const addPlayer = (team) => {
    if (team === 'A') setPlayersA([...playersA, ''])
    else setPlayersB([...playersB, ''])
  }
  const removePlayer = (team, idx) => {
    const list = team === 'A' ? playersA : playersB
    if (team === 'A') setPlayersA(list.filter((_, i) => i !== idx))
    else setPlayersB(list.filter((_, i) => i !== idx))
    dropBadges(team, list[idx])
  }
  /** Both sides need MIN_PLAYERS named players, else maxWickets collapses. */
  const rosterReady = () =>
    playersA.filter(Boolean).length >= MIN_PLAYERS && playersB.filter(Boolean).length >= MIN_PLAYERS

  /** Which of captain / vice-captain a side has still not picked. Both are
   *  required — they're stored on the team and printed beside the name on the
   *  scorecard, and there's no way to set them once the match has started. */
  const leadersMissing = (team) => {
    const missing = []
    if (!captains[team]) missing.push('captain')
    if (!viceCaptains[team]) missing.push('vice-captain')
    return missing
  }
  const leadersReady = () => !leadersMissing('A').length && !leadersMissing('B').length

  const errA = teamNameError(teamAName)
  const errB = teamNameError(teamBName)
  const namesOk = !errA && !errB

  const shortfall = (players) => MIN_PLAYERS - players.filter(Boolean).length
  const stepTwoReady = rosterReady() && leadersReady()

  const goToToss = () => {
    // The inline warnings below already explain both blockers.
    if (!rosterReady() || !leadersReady()) return
    setStep(3)
  }

  /** `toss` receives the finished toss from TossCoin (or its manual override). */
  const handleStart = (toss) => {
    const namedA = playersA.filter(Boolean)
    const namedB = playersB.filter(Boolean)
    if (namedA.length < MIN_PLAYERS || namedB.length < MIN_PLAYERS || !leadersReady()) {
      setStep(2)
      return
    }
    setupMatch({
      matchName,
      teamA: { name: teamAName || 'Team A', players: namedA, captain: captains.A, viceCaptain: viceCaptains.A },
      teamB: { name: teamBName || 'Team B', players: namedB, captain: captains.B, viceCaptain: viceCaptains.B },
      totalOvers, powerplayOvers: Math.min(powerplayOvers, totalOvers),
      ...toss,
    })
    // No navigate() — Match.jsx renders this wizard while phase === 'setup' and
    // swaps to the scoring UI on its own once setupMatch flips it to 'innings1'.
  }

  const inp = { background: t.bg, border: `1px solid ${t.border}`, borderRadius: 4, color: t.text, fontFamily: 'inherit', fontSize: 13, padding: '9px 12px', width: '100%', outline: 'none' }
  const OVERS = [4, 5, 6, 8, 10, 12, 15, 20, 25, 50]
  const stepNames = ['', 'MATCH INFO', 'PLAYERS', 'TOSS & START']

  const radio = (active) => ({
    background: active ? t.surface : 'transparent',
    border: `1px solid ${active ? t.accent : t.border}`,
    borderRadius: 4, color: active ? t.accent : t.muted,
    fontFamily: 'inherit', fontSize: 13, padding: '10px', cursor: 'pointer',
  })

  return (
    <div style={{ padding: '0 20px 100px', maxWidth: 480, margin: '0 auto' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: t.muted, fontSize: 11, marginBottom: 16 }}>
        {[1, 2, 3].map(s => (
          <span key={s} style={{ color: step >= s ? t.accent : t.muted }}>
            [{step > s ? '✓' : s}]
          </span>
        ))}
        <span style={{ color: t.text, marginLeft: 4 }}>{stepNames[step]}</span>
      </div>

      {/* Step 1 — Match info */}
      {step === 1 && (
        <div>
          <Lbl t={t}>match name (optional)</Lbl>
          <input style={inp} placeholder="e.g. Finals — Sunday League" value={matchName} onChange={e => setMatchName(e.target.value)} />

          <Lbl t={t}>team a</Lbl>
          <input style={{ ...inp, borderColor: errA ? t.red : t.border }} placeholder="e.g. Street Warriors"
            value={teamAName} onChange={e => setTeamAName(e.target.value)}
            aria-invalid={!!errA} aria-describedby={errA ? 'err-team-a' : undefined} />
          {errA && <Warn t={t} id="err-team-a">{errA}</Warn>}

          <Lbl t={t}>team b</Lbl>
          <input style={{ ...inp, borderColor: errB ? t.red : t.border }} placeholder="e.g. Gully Kings"
            value={teamBName} onChange={e => setTeamBName(e.target.value)}
            aria-invalid={!!errB} aria-describedby={errB ? 'err-team-b' : undefined} />
          {errB && <Warn t={t} id="err-team-b">{errB}</Warn>}

          <Lbl t={t}>overs per innings</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
            {OVERS.map(o => (
              <button key={o} className="btn-t" onClick={() => { setTotalOvers(o); if (powerplayOvers > o) setPowerplayOvers(0) }}
                style={radio(totalOvers === o)}>{o}</button>
            ))}
          </div>

          <Lbl t={t}>powerplay overs (0 = off)</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
            {[0, 1, 2, 3, 4, 5, 6, 8, 10].filter(o => o <= totalOvers).map(o => (
              <button key={o} className="btn-t" onClick={() => setPowerplayOvers(o)}
                style={radio(powerplayOvers === o)}>{o || 'Off'}</button>
            ))}
          </div>

          <button id="btn-next-players" className="btn-t" disabled={!namesOk} onClick={() => { if (namesOk) setStep(2) }}
            style={{ marginTop: 20, width: '100%', background: 'none', border: `1px solid ${namesOk ? t.accent : t.border}`, borderRadius: 4, color: namesOk ? t.accent : t.muted, padding: '11px', fontSize: 13, fontWeight: 600 }}>
            Next: Players →
          </button>
        </div>
      )}

      {/* Step 2 — Players */}
      {step === 2 && (
        <div>
          {[{ team: 'A', name: teamAName || 'Team A', players: playersA }, { team: 'B', name: teamBName || 'Team B', players: playersB }].map(({ team, name, players }) => (
            <div key={team}>
              <Lbl t={t}>{name} players</Lbl>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {players.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ color: t.border, fontSize: 12, minWidth: 20 }}>{idx + 1}.</span>
                    <input style={{ ...inp, flex: 1 }} placeholder={`Player ${idx + 1}`} value={p}
                      onChange={e => handlePlayerChange(team, idx, e.target.value)} />
                    {p && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => {
                          setCaptains(prev => ({ ...prev, [team]: prev[team] === p ? null : p }))
                          setViceCaptains(prev => (prev[team] === p ? { ...prev, [team]: null } : prev))
                        }}
                          style={{ background: captains[team] === p ? t.accent : 'transparent', color: captains[team] === p ? t.bg : t.muted, border: `1px solid ${t.border}`, borderRadius: 3, padding: '2px 4px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>C</button>
                        <button onClick={() => {
                          setViceCaptains(prev => ({ ...prev, [team]: prev[team] === p ? null : p }))
                          setCaptains(prev => (prev[team] === p ? { ...prev, [team]: null } : prev))
                        }}
                          style={{ background: viceCaptains[team] === p ? t.accent : 'transparent', color: viceCaptains[team] === p ? t.bg : t.muted, border: `1px solid ${t.border}`, borderRadius: 3, padding: '2px 4px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>VC</button>
                      </div>
                    )}
                    {players.length > MIN_PLAYERS && (
                      <button onClick={() => removePlayer(team, idx)} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', padding: '0 4px' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => addPlayer(team)}
                  style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, textAlign: 'left', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Plus size={12} /> add
                </button>
                {shortfall(players) > 0 && (
                  <Warn t={t}>
                    Needs {shortfall(players)} more {shortfall(players) === 1 ? 'name' : 'names'} — minimum {MIN_PLAYERS} players per team.
                  </Warn>
                )}
                {/* Held back until the roster is full, so a fresh side shows one
                    blocker at a time instead of two warnings at once. */}
                {shortfall(players) <= 0 && leadersMissing(team).length > 0 && (
                  <Warn t={t}>
                    Pick a {leadersMissing(team).join(' and a ')} for {name} — tap C / VC beside a player.
                  </Warn>
                )}
              </div>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 20 }}>
            <button className="btn-t" onClick={() => setStep(1)} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.muted, padding: '10px', fontSize: 12 }}>← Back</button>
            <button id="btn-to-toss" className="btn-t" disabled={!stepTwoReady} onClick={goToToss}
              style={{ background: 'none', border: `1px solid ${stepTwoReady ? t.accent : t.border}`, borderRadius: 4, color: stepTwoReady ? t.accent : t.muted, padding: '10px', fontSize: 13, fontWeight: 600 }}>Toss →</button>
          </div>
        </div>
      )}

      {/* Step 3 — Toss (the app flips the coin) */}
      {step === 3 && (
        <TossCoin
          teamAName={teamAName}
          teamBName={teamBName}
          matchName={matchName}
          totalOvers={totalOvers}
          powerplayOvers={Math.min(powerplayOvers, totalOvers)}
          onBack={() => setStep(2)}
          onConfirm={handleStart}
        />
      )}
    </div>
  )
}

function Lbl({ t, children }) {
  return (
    <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, marginTop: 14 }}>▸ {children}</div>
  )
}

/** Inline validation notice. role="alert" so a screen reader announces it as
 *  soon as it appears, rather than the alert() dialogs this replaced. */
function Warn({ t, id, children }) {
  return (
    <div id={id} role="alert" style={{ color: t.red, fontSize: 11, lineHeight: 1.45, marginTop: 5, display: 'flex', gap: 5 }}>
      <span aria-hidden="true">⚠</span><span>{children}</span>
    </div>
  )
}
