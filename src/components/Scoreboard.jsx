import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import { ballsToOvers, calcCRR, calcRRR } from '../utils/calculations'

export default function Scoreboard() {
  const t = useTheme()
  const {
    score, wickets, totalBalls, totalOvers, powerplayOvers,
    battingTeam, teamA, teamB,
    phase, innings1, ballsHistory,
  } = useMatchStore()

  const batting = battingTeam === 'A' ? teamA : teamB
  const oversStr = ballsToOvers(totalBalls)
  const crr = calcCRR(score, totalBalls)

  const isSecondInnings = phase === 'innings2'
  const target = innings1 ? innings1.score + 1 : null
  const ballsLeft = isSecondInnings ? (totalOvers * 6) - totalBalls : 0
  const rrr = isSecondInnings ? calcRRR(target, score, ballsLeft) : null
  const needed = isSecondInnings ? target - score : null

  const isPowerplay = powerplayOvers > 0 && totalBalls < powerplayOvers * 6

  // Group balls into overs
  const oversList = []
  let currentOverGrp = []
  let legalInCurrent = 0
  for (const b of ballsHistory) {
    currentOverGrp.push(b)
    if (b.legal) legalInCurrent++
    if (legalInCurrent === 6) {
      oversList.push(currentOverGrp)
      currentOverGrp = []
      legalInCurrent = 0
    }
  }
  if (currentOverGrp.length > 0) oversList.push(currentOverGrp)
  const displayBalls = oversList.length > 0 ? oversList[oversList.length - 1] : []

  // Ball history tokens
  const tokens = displayBalls.map((b) => {
    if (b.isWicket) return { label: 'W', color: t.red }
    if (b.extraType === 'wide') return { label: b.runs > 0 ? `Wd+${b.runs}` : 'Wd', color: t.yellow }
    if (b.extraType === 'noBall') return { label: b.runs > 0 ? `Nb+${b.runs}` : 'Nb', color: t.yellow }
    if (b.extraType === 'bye') return { label: `B${b.runs}`, color: t.muted }
    if (b.extraType === 'legBye') return { label: `Lb${b.runs}`, color: t.muted }
    if (b.runs === 4) return { label: '4', color: t.accent }
    if (b.runs === 6) return { label: '6', color: t.accent }
    return { label: b.runs === 0 ? '·' : String(b.runs), color: t.muted }
  })

  return (
    <div className="sc-card" style={{ '--border': t.border, '--card': t.card, borderColor: t.border, background: t.card, textAlign: 'center' }}>
      {/* Team + innings */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color: t.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {batting.name}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {isPowerplay && (
            <span style={{ color: t.yellow, fontSize: 10, fontWeight: 600, border: `1px solid ${t.yellow}33`, borderRadius: 3, padding: '2px 6px' }}>
              PP
            </span>
          )}
          <span style={{ color: t.muted, fontSize: 11 }}>
            {isSecondInnings ? 'INN 2' : 'INN 1'} · {totalOvers}ov
          </span>
        </div>
      </div>

      {/* Score */}
      <div style={{ color: t.accent, fontSize: '3.5rem', fontWeight: 700, lineHeight: 1, margin: '4px 0' }}>
        {score}<span style={{ color: t.muted, fontSize: '2rem', fontWeight: 400 }}>/{wickets}</span>
      </div>
      <div style={{ color: t.muted, fontSize: 13, marginBottom: 8 }}>({oversStr} ov)</div>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 12, marginBottom: 8 }}>
        <Stat label="CRR" value={crr} color={t.text} t={t} />
        {isSecondInnings && (
          <>
            <Stat label="TGT" value={target} color={t.accent} t={t} />
            <Stat label="NEED" value={`${needed}(${ballsLeft}b)`} color={t.yellow} t={t} />
            <Stat label="RRR" value={rrr} color={t.red} t={t} />
          </>
        )}
      </div>

      {/* Inn1 ref */}
      {isSecondInnings && innings1 && (
        <div style={{ color: t.muted, fontSize: 11, paddingTop: 6, borderTop: `1px solid ${t.border}` }}>
          {innings1.teamName}: <span style={{ color: t.text }}>{innings1.score}/{innings1.wickets}</span> ({ballsToOvers(innings1.balls)} ov)
        </div>
      )}

      {/* Ball-by-ball history */}
      {tokens.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          {tokens.map((tk, i) => (
            <span key={i} style={{
              width: 22, height: 22, borderRadius: 3,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: tk.label === 'W' || tk.label === '4' || tk.label === '6' ? 700 : 400,
              color: tk.color,
              border: `1px solid ${tk.color}22`,
              background: tk.color + '0a',
            }}>
              {tk.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color, t }) {
  return (
    <div>
      <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color, fontWeight: 600 }}>{value}</div>
    </div>
  )
}
