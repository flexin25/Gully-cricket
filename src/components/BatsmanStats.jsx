import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import { calcSR } from '../utils/calculations'

export default function BatsmanStats() {
  const t = useTheme()
  const { currentBatsmen, batsmanStats } = useMatchStore()
  const { striker, nonStriker } = currentBatsmen
  if (!striker && !nonStriker) return null

  const th = { color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 5, fontWeight: 500 }
  const td = { color: t.text, fontSize: 12, padding: '5px 0' }
  const tdn = { ...td, textAlign: 'right' }

  return (
    <div className="sc-card" style={{ borderColor: t.border, background: t.card }}>
      <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>BATTING</div>
      <div className="table-wrapper">
        <table className="sc-table" style={{ '--border': t.border }}>
          <colgroup>
          <col style={{ width: '38%' }} />
          <col style={{ width: '12%' }} /><col style={{ width: '12%' }} /><col style={{ width: '11%' }} /><col style={{ width: '11%' }} /><col style={{ width: '16%' }} />
        </colgroup>
        <thead><tr>
          <th style={{ ...th, textAlign: 'left' }}>NAME</th>
          <th style={{ ...th, textAlign: 'right' }}>R</th>
          <th style={{ ...th, textAlign: 'right' }}>B</th>
          <th style={{ ...th, textAlign: 'right' }}>4s</th>
          <th style={{ ...th, textAlign: 'right' }}>6s</th>
          <th style={{ ...th, textAlign: 'right' }}>SR</th>
        </tr></thead>
        <tbody>
          {striker && <Row t={t} name={striker} s={batsmanStats[striker]} on th={th} td={td} tdn={tdn} />}
          {nonStriker && <Row t={t} name={nonStriker} s={batsmanStats[nonStriker]} td={td} tdn={tdn} />}
        </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ t, name, s: raw, on, td, tdn }) {
  const s = raw || { runs: 0, balls: 0, fours: 0, sixes: 0 }
  return (
    <tr style={{ borderTop: `1px solid ${t.border}` }}>
      <td style={{ ...td, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 0 }}>
        <span style={{ color: on ? t.accent : t.text, marginRight: 4, fontWeight: on ? 700 : 400 }}>{on ? '▸' : ' '}</span>
        {name}
      </td>
      <td style={{ ...tdn, color: t.accent, fontWeight: 600 }}>{s.runs}</td>
      <td style={tdn}>{s.balls}</td>
      <td style={tdn}>{s.fours}</td>
      <td style={tdn}>{s.sixes}</td>
      <td style={tdn}>{calcSR(s.runs, s.balls)}</td>
    </tr>
  )
}
