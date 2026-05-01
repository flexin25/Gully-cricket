import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMatchStore from '../store/useMatchStore'
import { useTheme } from '../store/useThemeStore'
import { ballsToOvers, getResult } from '../utils/calculations'
import { downloadPDF } from '../utils/pdf'
import Footer from '../components/Footer'
import { Trash2, Download, ArrowLeft, CheckSquare, Square } from 'lucide-react'

export default function MatchHistory() {
  const t = useTheme()
  const navigate = useNavigate()
  const { matchHistory, deleteHistoryEntry, clearHistory } = useMatchStore()
  
  const [selectedMatches, setSelectedMatches] = useState([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const toggleSelection = (id) => {
    setSelectedMatches(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    )
  }

  const deleteSelected = () => {
    selectedMatches.forEach(id => deleteHistoryEntry(id))
    setSelectedMatches([])
    setIsSelectionMode(false)
  }



  return (
    <div className="page-anim" style={{ background: t.bg, color: t.text, minHeight: '100vh', paddingTop: 60, paddingBottom: 60 }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-t" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', padding: 0 }}>
              <ArrowLeft size={16} />
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: t.accent, margin: 0 }}>Match History</h1>
          </div>
          {matchHistory.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {!isSelectionMode ? (
                <>
                  <button className="btn-t" onClick={() => setIsSelectionMode(true)}
                    style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.muted, fontSize: 11, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Select
                  </button>
                  <button className="btn-t" onClick={() => { if(confirm('Clear all matches?')) clearHistory() }}
                    style={{ background: 'none', border: `1px solid ${t.red}44`, borderRadius: 4, color: t.red, fontSize: 11, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Clear All
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-t" onClick={deleteSelected} disabled={selectedMatches.length === 0}
                    style={{ background: 'none', border: `1px solid ${t.red}`, borderRadius: 4, color: t.red, fontSize: 11, padding: '5px 10px', cursor: selectedMatches.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: selectedMatches.length ? 1 : 0.5 }}>
                    Delete ({selectedMatches.length})
                  </button>
                  <button className="btn-t" onClick={() => { setIsSelectionMode(false); setSelectedMatches([]) }}
                    style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.muted, fontSize: 11, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {matchHistory.length === 0 ? (
          <div style={{ color: t.muted, fontSize: 13, textAlign: 'center', padding: 40 }}>
            No matches yet. Complete a match to see it here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {matchHistory.map((m) => {
              const res = m.innings1 && m.innings2
                ? getResult(
                    { ...m.innings1, teamName: m.innings1.teamName },
                    m.innings2,
                    m.totalOvers,
                  )
                : '—'
              const isSelected = selectedMatches.includes(m.id)
              return (
                <div key={m.id} 
                  onClick={() => isSelectionMode && toggleSelection(m.id)}
                  style={{ 
                    border: `1px solid ${isSelected ? t.accent : t.border}`, 
                    borderRadius: 6, background: t.card, padding: 12,
                    cursor: isSelectionMode ? 'pointer' : 'default',
                    opacity: isSelectionMode && !isSelected && selectedMatches.length > 0 ? 0.6 : 1
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {isSelectionMode && (
                        <div style={{ color: isSelected ? t.accent : t.muted }}>
                          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </div>
                      )}
                      <div>
                        <div style={{ color: t.text, fontSize: 13, fontWeight: 600 }}>{m.matchName}</div>
                        <div style={{ color: t.muted, fontSize: 11, marginTop: 2 }}>
                          {new Date(m.date).toLocaleDateString()} · {m.totalOvers} overs
                        </div>
                      </div>
                    </div>
                    {!isSelectionMode && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-t" onClick={(e) => { e.stopPropagation(); downloadPDF(m) }} title="Download scorecard"
                          style={{ background: 'none', border: 'none', color: t.accent, cursor: 'pointer', padding: 2 }}>
                          <Download size={14} />
                        </button>
                        <button className="btn-t" onClick={(e) => { e.stopPropagation(); deleteHistoryEntry(m.id) }} title="Delete"
                          style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', padding: 2 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Scores */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6, paddingLeft: isSelectionMode ? 26 : 0 }}>
                    {m.innings1 && (
                      <div style={{ fontSize: 11 }}>
                        <span style={{ color: t.muted }}>{m.innings1.teamName}: </span>
                        <span style={{ color: t.accent, fontWeight: 600 }}>{m.innings1.score}/{m.innings1.wickets}</span>
                      </div>
                    )}
                    {m.innings2 && (
                      <div style={{ fontSize: 11 }}>
                        <span style={{ color: t.muted }}>{m.innings2.teamName}: </span>
                        <span style={{ color: t.accent, fontWeight: 600 }}>{m.innings2.score}/{m.innings2.wickets}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ color: t.text, fontSize: 12, fontWeight: 600, paddingLeft: isSelectionMode ? 26 : 0 }}>{res}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
