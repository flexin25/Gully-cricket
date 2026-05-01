import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import { Plus, Trash2 } from 'lucide-react'

export default function MatchSetup() {
  const t = useTheme()
  const setupMatch = useMatchStore((s) => s.setupMatch)
  const navigate = useNavigate()

  const [matchName, setMatchName] = useState('')
  const [teamAName, setTeamAName] = useState('')
  const [teamBName, setTeamBName] = useState('')
  const [playersA, setPlayersA] = useState(['', '', '', '', '', ''])
  const [playersB, setPlayersB] = useState(['', '', '', '', '', ''])
  const [totalOvers, setTotalOvers] = useState(6)
  const [powerplayOvers, setPowerplayOvers] = useState(0)
  const [toss, setToss] = useState('A')
  const [decision, setDecision] = useState('bat')
  const [step, setStep] = useState(1)

  const [captains, setCaptains] = useState({ A: null, B: null })
  const [viceCaptains, setViceCaptains] = useState({ A: null, B: null })

  const handlePlayerChange = (team, idx, val) => {
    if (team === 'A') { const u = [...playersA]; u[idx] = val; setPlayersA(u) }
    else { const u = [...playersB]; u[idx] = val; setPlayersB(u) }
  }
  const addPlayer = (team) => {
    if (team === 'A') setPlayersA([...playersA, ''])
    else setPlayersB([...playersB, ''])
  }
  const removePlayer = (team, idx) => {
    if (team === 'A') setPlayersA(playersA.filter((_, i) => i !== idx))
    else setPlayersB(playersB.filter((_, i) => i !== idx))
  }
  const handleStart = () => {
    setupMatch({
      matchName,
      teamA: { name: teamAName || 'Team A', players: playersA.filter(Boolean), captain: captains.A, viceCaptain: viceCaptains.A },
      teamB: { name: teamBName || 'Team B', players: playersB.filter(Boolean), captain: captains.B, viceCaptain: viceCaptains.B },
      totalOvers, powerplayOvers: Math.min(powerplayOvers, totalOvers),
      toss, decision,
    })
    navigate('/match')
  }

  const inp = { background: t.bg, border: `1px solid ${t.border}`, borderRadius: 4, color: t.text, fontFamily: 'inherit', fontSize: 13, padding: '9px 12px', width: '100%', outline: 'none' }
  const OVERS = [4, 5, 6, 8, 10, 12, 15, 20, 25, 50]
  const stepNames = ['', 'MATCH INFO', 'PLAYERS', 'TOSS & START']

  const Lbl = ({ children }) => (
    <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, marginTop: 14 }}>▸ {children}</div>
  )

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
          <Lbl>match name (optional)</Lbl>
          <input style={inp} placeholder="e.g. Finals — Sunday League" value={matchName} onChange={e => setMatchName(e.target.value)} />

          <Lbl>team a</Lbl>
          <input style={inp} placeholder="e.g. Street Warriors" value={teamAName} onChange={e => setTeamAName(e.target.value)} />
          <Lbl>team b</Lbl>
          <input style={inp} placeholder="e.g. Gully Kings" value={teamBName} onChange={e => setTeamBName(e.target.value)} />

          <Lbl>overs per innings</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
            {OVERS.map(o => (
              <button key={o} className="btn-t" onClick={() => { setTotalOvers(o); if (powerplayOvers > o) setPowerplayOvers(0) }}
                style={radio(totalOvers === o)}>{o}</button>
            ))}
          </div>

          <Lbl>powerplay overs (0 = off)</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
            {[0, 1, 2, 3, 4, 5, 6, 8, 10].filter(o => o <= totalOvers).map(o => (
              <button key={o} className="btn-t" onClick={() => setPowerplayOvers(o)}
                style={radio(powerplayOvers === o)}>{o || 'Off'}</button>
            ))}
          </div>

          <button className="btn-t" onClick={() => setStep(2)}
            style={{ marginTop: 20, width: '100%', background: 'none', border: `1px solid ${t.accent}`, borderRadius: 4, color: t.accent, padding: '11px', fontSize: 13, fontWeight: 600 }}>
            Next: Players →
          </button>
        </div>
      )}

      {/* Step 2 — Players */}
      {step === 2 && (
        <div>
          {[{ team: 'A', name: teamAName || 'Team A', players: playersA }, { team: 'B', name: teamBName || 'Team B', players: playersB }].map(({ team, name, players }) => (
            <div key={team}>
              <Lbl>{name} players</Lbl>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {players.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ color: t.border, fontSize: 12, minWidth: 20 }}>{idx + 1}.</span>
                    <input style={{ ...inp, flex: 1 }} placeholder={`Player ${idx + 1}`} value={p}
                      onChange={e => handlePlayerChange(team, idx, e.target.value)} />
                    {p && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setCaptains(prev => ({ ...prev, [team]: prev[team] === p ? null : p }))}
                          style={{ background: captains[team] === p ? t.accent : 'transparent', color: captains[team] === p ? t.bg : t.muted, border: `1px solid ${t.border}`, borderRadius: 3, padding: '2px 4px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>C</button>
                        <button onClick={() => setViceCaptains(prev => ({ ...prev, [team]: prev[team] === p ? null : p }))}
                          style={{ background: viceCaptains[team] === p ? t.accent : 'transparent', color: viceCaptains[team] === p ? t.bg : t.muted, border: `1px solid ${t.border}`, borderRadius: 3, padding: '2px 4px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>VC</button>
                      </div>
                    )}
                    {players.length > 2 && (
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
              </div>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 20 }}>
            <button className="btn-t" onClick={() => setStep(1)} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.muted, padding: '10px', fontSize: 12 }}>← Back</button>
            <button className="btn-t" onClick={() => setStep(3)} style={{ background: 'none', border: `1px solid ${t.accent}`, borderRadius: 4, color: t.accent, padding: '10px', fontSize: 13, fontWeight: 600 }}>Toss →</button>
          </div>
        </div>
      )}

      {/* Step 3 — Toss */}
      {step === 3 && (
        <div>
          <Lbl>toss winner</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {[{ val: 'A', lbl: teamAName || 'Team A' }, { val: 'B', lbl: teamBName || 'Team B' }].map(({ val, lbl }) => (
              <button key={val} className="btn-t" onClick={() => setToss(val)} style={radio(toss === val)}>
                {toss === val ? '[●] ' : '[○] '}{lbl}
              </button>
            ))}
          </div>
          <Lbl>elected to</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {[{ val: 'bat', lbl: 'BAT' }, { val: 'bowl', lbl: 'BOWL' }].map(({ val, lbl }) => (
              <button key={val} className="btn-t" onClick={() => setDecision(val)} style={radio(decision === val)}>
                {decision === val ? '[●] ' : '[○] '}{lbl}
              </button>
            ))}
          </div>

          {/* Summary */}
          <div style={{ marginTop: 14, color: t.muted, fontSize: 12, borderTop: `1px solid ${t.border}`, paddingTop: 10 }}>
            {matchName && <div style={{ color: t.text, marginBottom: 4 }}>"{matchName}"</div>}
            <span style={{ color: t.text }}>{toss === 'A' ? teamAName || 'Team A' : teamBName || 'Team B'}</span>
            {' '}won toss → <span style={{ color: t.text }}>{decision}</span>
            {' '} · <span style={{ color: t.text }}>{totalOvers}</span>ov
            {powerplayOvers > 0 && <> · <span style={{ color: t.yellow }}>PP {powerplayOvers}ov</span></>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 20 }}>
            <button className="btn-t" onClick={() => setStep(2)} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.muted, padding: '10px', fontSize: 12 }}>← Back</button>
            <button id="btn-start-match" className="btn-t" onClick={handleStart}
              style={{ background: 'none', border: `1px solid ${t.accent}`, borderRadius: 4, color: t.accent, padding: '11px', fontSize: 13, fontWeight: 700 }}>
              START MATCH →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
