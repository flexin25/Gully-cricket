import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import {
  ballsToOvers, calcCRR, calcRRR, tossSummaryShort,
  groupBallsIntoOvers, activeSuperOver, superOverInnings, superOverMaxWickets,
} from '../utils/calculations'
import BallTokens from './BallTokens'

export default function Scoreboard() {
  const t = useTheme()
  const {
    score, wickets, totalBalls, totalOvers, powerplayOvers,
    battingTeam, teamA, teamB,
    phase, innings1, superOvers, ballsHistory, isFreeHit,
    tossWinner, tossDecision,
  } = useMatchStore()

  const batting = battingTeam === 'A' ? teamA : teamB
  const oversStr = ballsToOvers(totalBalls)
  const crr = calcCRR(score, totalBalls)
  const tossLine = tossSummaryShort({ teamA, teamB, tossWinner, tossDecision })

  // A Super Over is one over with a two-wicket cap and its own first innings to
  // chase, so every limit below switches over. Everything else is unchanged.
  const inSuper = phase === 'super'
  const so = inSuper ? activeSuperOver({ superOvers }) : null
  const soInn = superOverInnings(so)
  const superNo = superOvers?.length || 0
  const superLabel = superNo > 1 ? `SUPER OVER ${superNo}` : 'SUPER OVER'
  const wicketCap = inSuper ? superOverMaxWickets(batting) : null

  // The innings being chased, if any — the Super Over's first half, else innings 1.
  const chaseRef = soInn === 2 ? so.inn1 : (inSuper ? null : innings1)
  const isChasing = soInn === 2 || phase === 'innings2'
  const oversLimit = inSuper ? 1 : totalOvers
  const target = chaseRef ? chaseRef.score + 1 : null
  const ballsLeft = isChasing ? (oversLimit * 6) - totalBalls : 0
  const rrr = isChasing ? calcRRR(target, score, ballsLeft) : null
  const needed = isChasing ? target - score : null

  // Powerplay is a normal-innings concept; a match that had one would otherwise
  // light the PP badge through the whole Super Over.
  const isPowerplay = !inSuper && powerplayOvers > 0 && totalBalls < powerplayOvers * 6

  const oversList = groupBallsIntoOvers(ballsHistory)
  const displayBalls = oversList.length > 0 ? oversList[oversList.length - 1] : []

  return (
    <div className="sc-card" style={{
      '--border': t.border, '--card': t.card,
      borderColor: inSuper ? t.accent + '55' : t.border,
      background: t.card, textAlign: 'center',
    }}>
      {/* Phase band — §8's "don't let them think this is still the normal innings". */}
      {inSuper && (
        <div style={{
          margin: '-4px -4px 8px', padding: '6px 10px', borderRadius: 4,
          background: t.accent + '14', border: `1px solid ${t.accent}44`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: t.accent, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>⚡ {superLabel}</span>
          <span style={{ color: t.muted, fontSize: 10, letterSpacing: '0.06em' }}>
            1 OVER · {wicketCap} WKT{wicketCap !== 1 ? 'S' : ''}
          </span>
        </div>
      )}

      {/* Team + innings */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color: t.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {batting.name}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {isFreeHit && (
            <span style={{ color: t.red, fontSize: 10, fontWeight: 700, border: `1px solid ${t.red}44`, background: t.red + '11', borderRadius: 3, padding: '2px 6px' }}>
              FREE HIT
            </span>
          )}
          {isPowerplay && (
            <span style={{ color: t.yellow, fontSize: 10, fontWeight: 600, border: `1px solid ${t.yellow}33`, borderRadius: 3, padding: '2px 6px' }}>
              PP
            </span>
          )}
          <span style={{ color: t.muted, fontSize: 11 }}>
            {inSuper
              ? `SO INN ${soInn || 2} · ${totalBalls}/6 balls`
              : `${phase === 'innings2' ? 'INN 2' : 'INN 1'} · ${totalOvers}ov`}
          </span>
        </div>
      </div>

      {/* Score */}
      {/* px, not rem: html is now at the browser default so rem here would rescale */}
      <div style={{ color: t.accent, fontSize: 49, fontWeight: 700, lineHeight: 1, margin: '4px 0' }}>
        {score}<span style={{ color: t.muted, fontSize: 28, fontWeight: 400 }}>
          /{wickets}{inSuper ? <span style={{ fontSize: 18 }}> of {wicketCap}</span> : null}
        </span>
      </div>
      <div style={{ color: t.muted, fontSize: 13, marginBottom: tossLine && !inSuper ? 2 : 8 }}>({oversStr} ov)</div>
      {tossLine && !inSuper && (
        <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          {tossLine}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 12, marginBottom: 8 }}>
        <Stat label="CRR" value={crr} color={t.text} t={t} />
        {isChasing && (
          <>
            <Stat label="TGT" value={target} color={t.accent} t={t} />
            <Stat label="NEED" value={`${needed}(${ballsLeft}b)`} color={t.yellow} t={t} />
            <Stat label="RRR" value={rrr} color={t.red} t={t} />
          </>
        )}
      </div>

      {/* Reference score being chased */}
      {isChasing && chaseRef && (
        <div style={{ color: t.muted, fontSize: 11, paddingTop: 6, borderTop: `1px solid ${t.border}` }}>
          {inSuper && <span style={{ color: t.accent }}>{superLabel} · </span>}
          {chaseRef.teamName}: <span style={{ color: t.text }}>{chaseRef.score}/{chaseRef.wickets}</span> ({ballsToOvers(chaseRef.balls)} ov)
        </div>
      )}

      {/* Ball-by-ball history */}
      {displayBalls.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <BallTokens balls={displayBalls} />
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
