import { useTheme } from '../store/useThemeStore'
import { ballsToOvers, calcSR, calcEconomy, bowlerBalls } from '../utils/calculations'

/**
 * One innings' batting or bowling card. Was local to Summary; shared now so the
 * Super Over card renders the same table rather than a second implementation.
 * Returns null when nobody batted/bowled, so an empty card never shows.
 */
export default function ScorecardTable({ title, type, stats }) {
  const t = useTheme()
  const entries = Object.entries(stats || {}).filter(([, v]) => type === 'bat' ? v.balls > 0 || v.runs > 0 : (v.balls > 0 || v.overs > 0))
  if (!entries.length) return null

  const th = { color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 5, fontWeight: 500 }
  const td = { color: t.text, fontSize: 12, padding: '5px 0' }
  const tdn = { ...td, textAlign: 'right' }

  return (
    <div className="sc-card" style={{ borderColor: t.border, background: t.card, marginBottom: 10 }}>
      <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{title}</div>
      <div className="table-wrapper">
        <table className="sc-table" style={{ '--border': t.border }}>
          <thead>
          <tr>
            {type === 'bat' ? (
              <><th style={{ ...th, textAlign: 'left', width: '36%' }}>NAME</th><th style={{ ...th, textAlign: 'right', width: '10%' }}>R</th><th style={{ ...th, textAlign: 'right', width: '10%' }}>B</th><th style={{ ...th, textAlign: 'right', width: '10%' }}>4s</th><th style={{ ...th, textAlign: 'right', width: '10%' }}>6s</th><th style={{ ...th, textAlign: 'right', width: '14%' }}>SR</th></>
            ) : (
              <><th style={{ ...th, textAlign: 'left', width: '32%' }}>NAME</th><th style={{ ...th, textAlign: 'right', width: '12%' }}>O</th><th style={{ ...th, textAlign: 'right', width: '12%' }}>M</th><th style={{ ...th, textAlign: 'right', width: '12%' }}>R</th><th style={{ ...th, textAlign: 'right', width: '12%' }}>W</th><th style={{ ...th, textAlign: 'right', width: '18%' }}>ECO</th></>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, s]) => (
            <tr key={name} style={{ borderTop: `1px solid ${t.border}` }}>
              {type === 'bat' ? (
                <>
                  <td style={{ ...td, textAlign: 'left', maxWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                    {s.out && s.dismissal && <span style={{ display: 'block', color: t.muted, fontSize: 10 }}>{s.dismissal}</span>}
                  </td>
                  <td style={{ ...tdn, color: t.accent, fontWeight: 600 }}>{s.runs}</td>
                  <td style={tdn}>{s.balls}</td>
                  <td style={tdn}>{s.fours}</td>
                  <td style={tdn}>{s.sixes}</td>
                  <td style={tdn}>{calcSR(s.runs, s.balls)}</td>
                </>
              ) : (
                <>
                  <td style={{ ...td, textAlign: 'left', maxWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</td>
                  <td style={tdn}>{ballsToOvers(bowlerBalls(s))}</td>
                  <td style={{ ...tdn, color: (s.maidens || 0) > 0 ? t.accent : t.text, fontWeight: (s.maidens || 0) > 0 ? 600 : 400 }}>{s.maidens || 0}</td>
                  <td style={tdn}>{s.runs}</td>
                  <td style={{ ...tdn, color: s.wickets > 0 ? t.red : t.text, fontWeight: s.wickets > 0 ? 600 : 400 }}>{s.wickets}</td>
                  <td style={tdn}>{calcEconomy(s.runs, bowlerBalls(s))}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  )
}
