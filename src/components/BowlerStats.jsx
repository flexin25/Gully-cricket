import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import { ballsToOvers, calcEconomy } from '../utils/calculations'

export default function BowlerStats() {
  const t = useTheme()
  const { currentBowler, bowlerStats } = useMatchStore()
  if (!currentBowler) return null

  const stats = bowlerStats[currentBowler] || { balls: 0, overs: 0, runs: 0, wickets: 0 }
  const totalB = (stats.overs * 6) + stats.balls
  const oversStr = ballsToOvers(totalB)
  const economy = calcEconomy(stats.runs, totalB)

  const th = { color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 5, fontWeight: 500 }
  const td = { color: t.text, fontSize: 12, padding: '5px 0' }
  const tdn = { ...td, textAlign: 'right' }

  return (
    <div className="sc-card" style={{ borderColor: t.border, background: t.card }}>
      <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>BOWLING</div>
      <div className="table-wrapper">
        <table className="sc-table" style={{ '--border': t.border }}>
          <colgroup>
          <col style={{ width: '38%' }} /><col style={{ width: '15%' }} /><col style={{ width: '15%' }} /><col style={{ width: '15%' }} /><col style={{ width: '17%' }} />
        </colgroup>
        <thead><tr>
          <th style={{ ...th, textAlign: 'left' }}>NAME</th>
          <th style={{ ...th, textAlign: 'right' }}>O</th>
          <th style={{ ...th, textAlign: 'right' }}>R</th>
          <th style={{ ...th, textAlign: 'right' }}>W</th>
          <th style={{ ...th, textAlign: 'right' }}>ECO</th>
        </tr></thead>
        <tbody>
          <tr style={{ borderTop: `1px solid ${t.border}` }}>
            <td style={{ ...td, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 0 }}>
              <span style={{ color: t.muted, marginRight: 4 }}>{'▹'}</span>{currentBowler}
            </td>
            <td style={tdn}>{oversStr}</td>
            <td style={tdn}>{stats.runs}</td>
            <td style={{ ...tdn, color: stats.wickets > 0 ? t.red : t.text, fontWeight: stats.wickets > 0 ? 600 : 400 }}>{stats.wickets}</td>
            <td style={tdn}>{economy}</td>
          </tr>
        </tbody>
        </table>
      </div>
    </div>
  )
}
