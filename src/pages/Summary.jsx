import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import { ballsToOvers, calcSR, calcEconomy, getResult } from '../utils/calculations'
import Footer from '../components/Footer'

const LAYOUT = { maxWidth: 560, margin: '0 auto', padding: '0 20px 80px' }

export default function Summary() {
  const t = useTheme()
  const navigate = useNavigate()
  const {
    teamA, teamB, innings1,
    score: inn2Score, wickets: inn2Wickets, totalBalls: inn2Balls,
    battingTeam, totalOvers, matchName,
    batsmanStats: inn2Bat, bowlerStats: inn2Bowl,
    resetMatch, saveMatchToHistory,
  } = useMatchStore()

  const inn2Team = battingTeam === 'A' ? teamA : teamB
  const inn1Team = battingTeam === 'A' ? teamB : teamA

  const inn2 = { score: inn2Score, wickets: inn2Wickets, balls: inn2Balls, teamName: inn2Team.name, batsmanStats: inn2Bat, bowlerStats: inn2Bowl }
  const inn1 = innings1 ? { ...innings1, teamName: inn1Team.name } : null

  const resultText = inn1 && inn2 ? getResult(inn1, inn2, totalOvers) : '—'

  // Auto-save to history on mount
  useEffect(() => {
    saveMatchToHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNew = () => { resetMatch(); navigate('/') }

  const th = { color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 5, fontWeight: 500 }
  const td = { color: t.text, fontSize: 12, padding: '5px 0' }
  const tdn = { ...td, textAlign: 'right' }

  return (
    <div className="page-anim" style={{ background: t.bg, color: t.text, minHeight: '100vh', paddingTop: 60 }}>
      <div style={LAYOUT}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: t.accent, margin: 0 }}>Match Summary</h1>
          <button className="btn-t" onClick={handleNew}
            style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.muted, fontSize: 11, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
            [new]
          </button>
        </div>

        {matchName && <div style={{ color: t.muted, fontSize: 12, marginBottom: 10 }}>"{matchName}"</div>}

        {/* Result */}
        <div className="sc-card" style={{ borderColor: t.accent + '44', background: t.accent + '08', textAlign: 'center' }}>
          <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>RESULT</div>
          <div style={{ color: t.accent, fontSize: 16, fontWeight: 700 }}>▸ {resultText}</div>
        </div>

        {/* Innings side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { label: '1st Inn', team: inn1Team.name, score: inn1?.score ?? 0, wkts: inn1?.wickets ?? 0, balls: inn1?.balls ?? 0 },
            { label: '2nd Inn', team: inn2Team.name, score: inn2.score, wkts: inn2.wickets, balls: inn2.balls },
          ].map(({ label, team, score, wkts, balls }, i) => (
            <div key={i} className="sc-card" style={{ borderColor: t.border, background: t.card, textAlign: 'center' }}>
              <div style={{ color: t.muted, fontSize: 10, marginBottom: 2 }}>{label}</div>
              <div style={{ color: t.muted, fontSize: 11 }}>{team}</div>
              <div style={{ color: t.accent, fontSize: 22, fontWeight: 700, lineHeight: 1, marginTop: 4 }}>{score}/{wkts}</div>
              <div style={{ color: t.muted, fontSize: 11, marginTop: 2 }}>{ballsToOvers(balls)} ov</div>
            </div>
          ))}
        </div>

        {/* Full scorecards */}
        {inn1?.batsmanStats && <ScorecardTable t={t} th={th} td={td} tdn={tdn} title={`${inn1Team.name} — Batting`} type="bat" stats={inn1.batsmanStats} />}
        {inn1?.bowlerStats && <ScorecardTable t={t} th={th} td={td} tdn={tdn} title={`${inn2Team.name} — Bowling (Inn 1)`} type="bowl" stats={inn1.bowlerStats} />}
        {inn2.batsmanStats && <ScorecardTable t={t} th={th} td={td} tdn={tdn} title={`${inn2Team.name} — Batting`} type="bat" stats={inn2.batsmanStats} />}
        {inn2.bowlerStats && <ScorecardTable t={t} th={th} td={td} tdn={tdn} title={`${inn1Team.name} — Bowling (Inn 2)`} type="bowl" stats={inn2.bowlerStats} />}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 16 }}>
          <button className="btn-t" onClick={() => navigate('/history')}
            style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.muted, padding: '11px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Match History
          </button>
          <button className="btn-t" onClick={handleNew}
            style={{ background: 'none', border: `1px solid ${t.accent}`, borderRadius: 4, color: t.accent, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            New Match →
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function ScorecardTable({ t, th, td, tdn, title, type, stats }) {
  const entries = Object.entries(stats).filter(([, v]) => type === 'bat' ? v.balls > 0 || v.runs > 0 : (v.balls > 0 || v.overs > 0))
  if (!entries.length) return null

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
              <><th style={{ ...th, textAlign: 'left', width: '36%' }}>NAME</th><th style={{ ...th, textAlign: 'right', width: '14%' }}>O</th><th style={{ ...th, textAlign: 'right', width: '14%' }}>R</th><th style={{ ...th, textAlign: 'right', width: '14%' }}>W</th><th style={{ ...th, textAlign: 'right', width: '18%' }}>ECO</th></>
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
                  <td style={tdn}>{ballsToOvers((s.overs || 0) * 6 + (s.balls || 0))}</td>
                  <td style={tdn}>{s.runs}</td>
                  <td style={{ ...tdn, color: s.wickets > 0 ? t.red : t.text, fontWeight: s.wickets > 0 ? 600 : 400 }}>{s.wickets}</td>
                  <td style={tdn}>{calcEconomy(s.runs, (s.overs || 0) * 6 + (s.balls || 0))}</td>
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
