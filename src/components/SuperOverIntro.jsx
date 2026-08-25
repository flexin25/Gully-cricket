import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import { ballsToOvers, completedSuperOvers } from '../utils/calculations'

/**
 * The 'tied' phase (§1, §7). Deliberately full-bleed rather than another card —
 * the point is that the user cannot mistake this for more normal scoring.
 *
 * Serves both tie kinds: a tied normal match and a tied Super Over. Which one it
 * is comes from how many Super Overs have already been played, so there is one
 * screen and one phase instead of two of each.
 */
export default function SuperOverIntro() {
  const t = useTheme()
  const { innings1, innings2, superOvers, battingTeam, teamA, teamB, startSuperOver } = useMatchStore()

  const played = completedSuperOvers({ superOvers })
  const isSuperTie = played.length > 0
  const next = played.length + 1

  // The level pair to show: the two Super Over innings if a Super Over tied,
  // otherwise the two normal innings.
  const last = isSuperTie ? played[played.length - 1] : null
  const pair = isSuperTie
    ? [{ ...last.inn1, label: `SO ${played.length} · 1st` }, { ...last.inn2, label: `SO ${played.length} · 2nd` }]
    : [{ ...(innings1 || {}), label: '1st Inn' }, { ...(innings2 || {}), label: '2nd Inn' }]

  // Whoever is the current batting side bats first in the Super Over — after a
  // normal tie that's the side who chased, which is the real rule.
  const battingFirst = (battingTeam === 'A' ? teamA : teamB).name

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 20px 60px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 12 }}>🤝</div>

      <div style={{ color: t.yellow, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
        {isSuperTie ? `Super Over ${played.length}` : 'Scores Level'}
      </div>
      <h1 style={{ color: t.accent, fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
        {isSuperTie ? `Super Over ${played.length} Tied` : 'Match Tied'}
      </h1>
      <div style={{ color: t.text, fontSize: 13, marginTop: 10, lineHeight: 1.6 }}>
        Proceeding to {isSuperTie ? `Super Over ${next}` : 'Super Over'}.
      </div>

      {/* The level scores, side by side, so it's plain why nobody has won. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '20px 0' }}>
        {pair.map((inn, i) => (
          <div key={i} style={{ border: `1px solid ${t.border}`, borderRadius: 6, background: t.card, padding: 12 }}>
            <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{inn.label}</div>
            <div style={{ color: t.muted, fontSize: 11, marginTop: 2 }}>{inn.teamName || '—'}</div>
            <div style={{ color: t.accent, fontSize: 22, fontWeight: 700, lineHeight: 1, marginTop: 4 }}>
              {inn.score ?? 0}/{inn.wickets ?? 0}
            </div>
            <div style={{ color: t.muted, fontSize: 11, marginTop: 2 }}>{ballsToOvers(inn.balls ?? 0)} ov</div>
          </div>
        ))}
      </div>

      {/* The rules, up front — a Super Over is not scored like the innings just
          finished, and the user is about to pick players for it. */}
      <div role="note" style={{
        border: `1px solid ${t.border}`, borderRadius: 6, padding: '10px 12px',
        background: 'color-mix(in oklab, var(--primary) 6%, var(--card))',
        color: t.muted, fontSize: 11, lineHeight: 1.65, textAlign: 'left', marginBottom: 16,
      }}>
        <div style={{ color: t.text, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Super Over rules
        </div>
        <div>▸ One over per side — 6 legal deliveries.</div>
        <div>▸ Two wickets only; the innings ends on the 2nd.</div>
        <div>▸ <span style={{ color: t.text }}>{battingFirst}</span> bats first.</div>
        <div>▸ Any playing member may bat or bowl, whatever happened in the match.</div>
      </div>

      <button id="btn-start-super-over" className="btn-t" onClick={startSuperOver}
        style={{
          width: '100%', background: t.accent + '14', border: `1px solid ${t.accent}`,
          borderRadius: 5, color: t.accent, fontFamily: 'inherit', fontSize: 14,
          fontWeight: 700, padding: '13px', cursor: 'pointer', letterSpacing: '0.04em',
        }}>
        START {isSuperTie ? `SUPER OVER ${next}` : 'SUPER OVER'} →
      </button>
    </div>
  )
}
