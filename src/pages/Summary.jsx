import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import {
  ballsToOvers, matchResultText, chasingMaxWickets, completedSuperOvers, tossSummary,
} from '../utils/calculations'
import { downloadPDF } from '../utils/pdf'
import Footer from '../components/Footer'
import ScorecardTable from '../components/ScorecardTable'
import SuperOverCard from '../components/SuperOverCard'
import { Download } from 'lucide-react'

const LAYOUT = { maxWidth: 560, margin: '0 auto', padding: '0 20px 80px' }

export default function Summary() {
  const t = useTheme()
  const navigate = useNavigate()
  const {
    phase, teamA, teamB, innings1, innings2, superOvers,
    score: liveScore, wickets: liveWickets, totalBalls: liveBalls,
    battingTeam, matchName, totalOvers, powerplayOvers, extras,
    batsmanStats: liveBat, bowlerStats: liveBowl,
    resetMatch, saveMatchToHistory,
    matchId, matchHistory,
    tossWinner, tossDecision, tossMethod, tossCaller, tossCall, tossResult,
  } = useMatchStore()

  const tossLine = tossSummary({ teamA, teamB, tossWinner, tossDecision, tossMethod, tossCall })

  // Both innings come from their snapshots. The live-field assembly is only a
  // fallback for a session persisted before innings 2 was snapshotted — and
  // after a Super Over the live fields hold the Super Over, not the 2nd innings,
  // so reading them directly would mislabel everything downstream.
  const inn1 = innings1 || null
  const inn2 = innings2 || {
    score: liveScore, wickets: liveWickets, balls: liveBalls,
    teamName: (battingTeam === 'A' ? teamA : teamB).name,
    extras, batsmanStats: liveBat, bowlerStats: liveBowl,
  }

  const played = completedSuperOvers({ superOvers })
  const resultText = matchResultText(
    { teamA, teamB, innings1: inn1, innings2: inn2, superOvers },
    chasingMaxWickets({ teamA, teamB, innings2: inn2 }),
  )

  // Level regulation scores are not a result while a Super Over is pending or
  // half-played (§1, §6). Nothing links here in those phases, but a stale tab or
  // a reload on this URL can still land on it — so the page must say the match
  // is unfinished and point back at the Super Over instead of printing a winner
  // or a tie as final. The download is held back for the same reason: its
  // result line would be that same wrong verdict, on paper.
  const undecided = phase === 'tied' || phase === 'super'

  // Auto-save to history on mount
  useEffect(() => {
    saveMatchToHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNew = () => { resetMatch(); navigate('/') }

  /** Build the PDF from exactly what this page renders, rather than re-reading
   *  the saved history entry. The two can disagree — that gap is what made the
   *  2nd innings come out as a stub in the download — and the scorecard on
   *  screen is the copy the user is looking at. Shape matches a history entry
   *  so downloadPDF stays one code path. */
  const handleDownload = () => {
    const saved = matchHistory.find((m) => m.id === matchId)
    downloadPDF({
      matchName: matchName || `${teamA.name} vs ${teamB.name}`,
      date: saved?.date || new Date().toISOString(),
      teamA, teamB, totalOvers, powerplayOvers,
      innings1: inn1,
      innings2: inn2,
      superOvers,
      battingTeam,
      tossWinner, tossDecision, tossMethod, tossCaller, tossCall, tossResult,
    })
  }

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
          <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {undecided
              ? (phase === 'super' ? 'SUPER OVER IN PROGRESS' : 'MATCH TIED — SUPER OVER TO COME')
              : played.length ? 'RESULT — DECIDED BY SUPER OVER' : 'RESULT'}
          </div>
          <div style={{ color: t.accent, fontSize: 16, fontWeight: 700 }}>
            ▸ {undecided ? 'No result yet' : resultText}
          </div>
          {undecided && (
            <button className="btn-t" onClick={() => navigate('/match')}
              style={{ marginTop: 10, background: 'none', border: `1px solid ${t.accent}`, borderRadius: 4, color: t.accent, padding: '9px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {phase === 'super' ? 'BACK TO SUPER OVER →' : 'GO TO SUPER OVER →'}
            </button>
          )}
          {/* How it got there: the regulation match was level. */}
          {played.length > 0 && inn1 && (
            <div style={{ color: t.text, fontSize: 11, marginTop: 6 }}>
              Match tied at {inn1.score} — {played.length > 1 ? `${played.length} Super Overs played` : 'settled in the Super Over'}
            </div>
          )}
          {tossLine && <div style={{ color: t.muted, fontSize: 11, marginTop: 6 }}>{tossLine}</div>}
        </div>

        {/* Super Over score strip — the headline numbers, above the regulation
            innings so the deciding contest reads first (§6, §8). */}
        {played.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {played.map((so, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                border: `1px solid ${t.accent}44`, background: t.accent + '0a',
                borderRadius: 6, padding: '9px 12px', marginBottom: 6,
              }}>
                <span style={{ color: t.accent, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                  ⚡ {played.length > 1 ? `SUPER OVER ${i + 1}` : 'SUPER OVER'}
                </span>
                <span style={{ color: t.text, fontSize: 12, textAlign: 'right' }}>
                  {so.inn1.teamName} <b style={{ color: t.accent }}>{so.inn1.score}/{so.inn1.wickets}</b>
                  <span style={{ color: t.muted }}> v </span>
                  {so.inn2.teamName} <b style={{ color: t.accent }}>{so.inn2.score}/{so.inn2.wickets}</b>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Innings side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { label: '1st Inn', team: inn1?.teamName, score: inn1?.score ?? 0, wkts: inn1?.wickets ?? 0, balls: inn1?.balls ?? 0 },
            { label: '2nd Inn', team: inn2.teamName, score: inn2.score, wkts: inn2.wickets, balls: inn2.balls },
          ].map(({ label, team, score, wkts, balls }, i) => (
            <div key={i} className="sc-card" style={{ borderColor: t.border, background: t.card, textAlign: 'center' }}>
              <div style={{ color: t.muted, fontSize: 10, marginBottom: 2 }}>{label}</div>
              <div style={{ color: t.muted, fontSize: 11 }}>{team || '—'}</div>
              <div style={{ color: t.accent, fontSize: 22, fontWeight: 700, lineHeight: 1, marginTop: 4 }}>{score}/{wkts}</div>
              <div style={{ color: t.muted, fontSize: 11, marginTop: 2 }}>{ballsToOvers(balls)} ov</div>
            </div>
          ))}
        </div>

        {/* Full scorecards — the regulation innings, unchanged whether or not a
            Super Over followed. The Super Over's own card comes after. */}
        {inn1?.batsmanStats && <ScorecardTable title={`${inn1.teamName} — Batting`} type="bat" stats={inn1.batsmanStats} />}
        {inn1?.bowlerStats && <ScorecardTable title={`${inn2.teamName} — Bowling (Inn 1)`} type="bowl" stats={inn1.bowlerStats} />}
        {inn2.batsmanStats && <ScorecardTable title={`${inn2.teamName} — Batting`} type="bat" stats={inn2.batsmanStats} />}
        {inn2.bowlerStats && <ScorecardTable title={`${inn1?.teamName || 'Opposition'} — Bowling (Inn 2)`} type="bowl" stats={inn2.bowlerStats} />}

        {/* Super Over scorecards — separate from the above by design (§5) */}
        {played.length > 0 && (
          <>
            <div style={{ color: t.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '18px 0 8px' }}>
              ▸ Super Over Scorecard{played.length > 1 ? 's' : ''}
            </div>
            {played.map((so, i) => (
              <SuperOverCard key={i} superOver={so} index={i} total={played.length} />
            ))}
          </>
        )}

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
        <button className="btn-t" onClick={handleDownload} disabled={undecided}
          title={undecided ? 'Available once the Super Over decides the match' : undefined}
          style={{ width: '100%', background: t.card, border: `1px solid ${t.border}`, borderRadius: 4, color: t.muted, padding: '10px', fontSize: 12, cursor: undecided ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, opacity: undecided ? 0.5 : 1 }}>
          <Download size={14} /> Download Scorecard
        </button>
      </div>
      <Footer />
    </div>
  )
}
