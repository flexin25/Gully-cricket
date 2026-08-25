import { useTheme } from '../store/useThemeStore'

/**
 * Ball-by-ball chips for a run of deliveries. Lifted out of Scoreboard so the
 * Super Over card renders an identical strip — the scoreboard passes the
 * current over, the Super Over card passes the whole (one-over) innings.
 */
export default function BallTokens({ balls, justify = 'center' }) {
  const t = useTheme()
  if (!balls?.length) return null

  const token = (b) => {
    if (b.isWicket) return { label: 'W', color: t.red }
    if (b.extraType === 'wide') return { label: b.runs > 0 ? `Wd+${b.runs}` : 'Wd', color: t.yellow }
    if (b.extraType === 'noBall') return { label: b.runs > 0 ? `Nb+${b.runs}` : 'Nb', color: t.yellow }
    if (b.extraType === 'bye') return { label: `B${b.runs}`, color: t.muted }
    if (b.extraType === 'legBye') return { label: `Lb${b.runs}`, color: t.muted }
    if (b.runs === 4) return { label: '4', color: t.accent }
    if (b.runs === 6) return { label: '6', color: t.accent }
    return { label: b.runs === 0 ? '·' : String(b.runs), color: t.muted }
  }

  return (
    <div style={{ display: 'flex', justifyContent: justify, gap: 4, flexWrap: 'wrap' }}>
      {balls.map((b, i) => {
        const tk = token(b)
        const bold = tk.label === 'W' || tk.label === '4' || tk.label === '6'
        return (
          <span key={i} style={{
            width: 22, height: 22, borderRadius: 3,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: bold ? 700 : 400,
            color: tk.color,
            border: `1px solid ${tk.color}22`,
            background: tk.color + '0a',
          }}>
            {tk.label}
          </span>
        )
      })}
    </div>
  )
}
