import { useState, useEffect } from 'react'
import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'

export default function BreakTimer() {
  const t = useTheme()
  const { breakActive, breakEndTime, endBreak, startBreak, breaksTaken } = useMatchStore()
  const [remaining, setRemaining] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showFinished, setShowFinished] = useState(false)

  useEffect(() => {
    if (!breakActive || !breakEndTime) return
    const tick = setInterval(() => {
      const left = Math.max(0, breakEndTime - Date.now())
      setRemaining(left)
      if (left <= 0) { 
        endBreak()
        clearInterval(tick)
        setShowFinished(true)
      }
    }, 200)
    return () => clearInterval(tick)
  }, [breakActive, breakEndTime, endBreak])

  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)

  if (breakActive) {
    return (
      <div style={{
        border: `1px solid ${t.yellow}33`,
        borderRadius: 6, padding: '10px 14px', marginBottom: 10,
        background: t.yellow + '0a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ color: t.yellow, fontSize: 12, fontWeight: 600 }}>⏸ BREAK ({breaksTaken}/2)</span>
          <span className="timer-pulse" style={{ color: t.text, fontSize: 20, fontWeight: 700, marginLeft: 12 }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
        <button
          className="btn-t"
          onClick={endBreak}
          style={{
            background: 'none', border: `1px solid ${t.accent}`,
            borderRadius: 4, color: t.accent,
            fontSize: 11, padding: '6px 12px', fontWeight: 600,
          }}
        >
          RESUME
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        className="btn-t"
        disabled={breaksTaken >= 2}
        onClick={() => setShowConfirm(true)}
        style={{
          background: 'none', border: `1px solid ${t.border}`,
          borderRadius: 4, color: t.muted, fontSize: 11,
          padding: '6px 10px', marginBottom: 8, width: '100%',
          opacity: breaksTaken >= 2 ? 0.3 : 1,
          cursor: breaksTaken >= 2 ? 'not-allowed' : 'pointer'
        }}
      >
        ⏸ Drinks Break / Timeout ({breaksTaken}/2)
      </button>

      {showConfirm && (
        <div className="overlay-bg">
          <div style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 6, padding: 20, maxWidth: 320, width: '90%',
          }}>
            <div style={{ color: t.yellow, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              ⚠ Start Timeout?
            </div>
            <p style={{ color: t.muted, fontSize: 12, marginBottom: 16 }}>
              This will start a 2-minute break timer. Match scoring will be paused during the break. ({2 - breaksTaken} left this innings).
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-t" onClick={() => setShowConfirm(false)}
                style={{ flex: 1, background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.muted, padding: '8px', fontSize: 12 }}>
                Cancel
              </button>
              <button className="btn-t" onClick={() => { startBreak(); setShowConfirm(false) }}
                style={{ flex: 1, background: 'none', border: `1px solid ${t.accent}`, borderRadius: 4, color: t.accent, padding: '8px', fontSize: 12, fontWeight: 600 }}>
                Start Break
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinished && (
        <div className="overlay-bg">
          <div style={{
            background: t.surface, border: `1px solid ${t.accent}`,
            borderRadius: 6, padding: 20, maxWidth: 320, width: '90%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏱</div>
            <div style={{ color: t.accent, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              Timeout Finished
            </div>
            <p style={{ color: t.text, fontSize: 13, marginBottom: 16 }}>
              The break time is up. Ready to resume the match?
            </p>
            <button className="btn-t" onClick={() => setShowFinished(false)}
              style={{ width: '100%', background: t.accent, border: 'none', borderRadius: 4, color: t.bg, padding: '10px', fontSize: 13, fontWeight: 700 }}>
              Resume Match
            </button>
          </div>
        </div>
      )}
    </>
  )
}
