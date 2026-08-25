import { useTheme } from '../store/useThemeStore'
import { ballsToOvers, groupBallsIntoOvers } from '../utils/calculations'
import ScorecardTable from './ScorecardTable'
import BallTokens from './BallTokens'

/** Total of one innings' extras map. */
function extrasTotal(e) {
  if (!e) return 0
  return (e.wides || 0) + (e.noBalls || 0) + (e.byes || 0) + (e.legByes || 0)
}

/** "2w 1nb" — only the kinds that actually happened. */
function extrasLine(e) {
  if (!e) return ''
  return [
    e.wides ? `${e.wides}w` : null,
    e.noBalls ? `${e.noBalls}nb` : null,
    e.byes ? `${e.byes}b` : null,
    e.legByes ? `${e.legByes}lb` : null,
  ].filter(Boolean).join(' ')
}

/**
 * One Super Over, scored end to end (§5). Kept wholly separate from the normal
 * innings cards — those stay exactly as they were and are still shown above
 * this. Reuses ScorecardTable and BallTokens rather than restyling either.
 */
export default function SuperOverCard({ superOver, index, total }) {
  const t = useTheme()
  const { inn1, inn2 } = superOver || {}
  if (!inn1) return null

  const label = total > 1 ? `SUPER OVER ${index + 1}` : 'SUPER OVER'
  const verdict = !inn2
    ? 'In progress'
    : inn2.score > inn1.score
      ? `${inn2.teamName} won by ${Math.max(0, 2 - (inn2.wickets || 0))} wicket${Math.max(0, 2 - (inn2.wickets || 0)) !== 1 ? 's' : ''}`
      : inn1.score > inn2.score
        ? `${inn1.teamName} won by ${inn1.score - inn2.score} run${inn1.score - inn2.score !== 1 ? 's' : ''}`
        : 'Tied'

  // Both halves, in batting order. The bowling side of each is the other's
  // batting side, so no team lookup is needed.
  const halves = [
    { inn: inn1, bowling: inn2?.teamName, ord: '1st' },
    { inn: inn2, bowling: inn1?.teamName, ord: '2nd' },
  ].filter((h) => h.inn)

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Phase band — the same accent strip the live Super Over scoreboard uses,
          so the two read as the same thing in two places. */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: t.accent + '14', border: `1px solid ${t.accent}44`,
        borderRadius: '6px 6px 0 0', borderBottom: 'none', padding: '7px 12px',
      }}>
        <span style={{ color: t.accent, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>⚡ {label}</span>
        <span style={{ color: t.text, fontSize: 11, fontWeight: 600 }}>{verdict}</span>
      </div>

      <div style={{ border: `1px solid ${t.border}`, borderTop: `1px solid ${t.accent}44`, borderRadius: '0 0 6px 6px', background: t.bg, padding: 12 }}>
        {halves.map(({ inn, bowling, ord }, i) => (
          <div key={ord} style={{ marginTop: i ? 14 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <div>
                <div style={{ color: t.text, fontSize: 13, fontWeight: 600 }}>{inn.teamName}</div>
                <div style={{ color: t.muted, fontSize: 10 }}>
                  {ord} · bowling: {bowling || '—'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: t.accent, fontSize: 20, fontWeight: 700 }}>{inn.score}/{inn.wickets}</span>
                <div style={{ color: t.muted, fontSize: 10 }}>
                  {ballsToOvers(inn.balls)} ov · {inn.balls} ball{inn.balls !== 1 ? 's' : ''}
                  {extrasTotal(inn.extras) > 0 && ` · ex ${extrasTotal(inn.extras)} (${extrasLine(inn.extras)})`}
                </div>
              </div>
            </div>

            {/* Every delivery of the over — for a one-over innings the
                ball-by-ball IS the scorecard. */}
            {inn.ballsHistory?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {groupBallsIntoOvers(inn.ballsHistory).map((over, oi) => (
                  <BallTokens key={oi} balls={over} justify="flex-start" />
                ))}
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <ScorecardTable title={`${inn.teamName} — Batting`} type="bat" stats={inn.batsmanStats} />
              <ScorecardTable title={`${bowling || 'Opposition'} — Bowling`} type="bowl" stats={inn.bowlerStats} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
