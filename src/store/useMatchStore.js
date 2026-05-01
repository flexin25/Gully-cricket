import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { isLegalDelivery } from '../utils/calculations'

const defaultBatsmanStat = () => ({ runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: '', fielder: '' })
const defaultBowlerStat = () => ({ overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0, dotBalls: 0 })

const initialState = {
  // Setup
  matchId: null,
  matchName: '',
  teamA: { name: 'Team A', players: [] },
  teamB: { name: 'Team B', players: [] },
  totalOvers: 6,
  powerplayOvers: 0,
  tossWinner: 'A',
  tossDecision: 'bat',

  // Match phase: 'setup' | 'innings1' | 'innings2' | 'done'
  phase: 'setup',

  // Innings 1 stored result
  innings1: null,

  // Current innings
  battingTeam: 'A',
  bowlingTeam: 'B',
  score: 0,
  wickets: 0,
  balls: 0,
  totalBalls: 0,
  extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },

  currentBatsmen: { striker: null, nonStriker: null },
  currentBowler: null,

  batsmanStats: {},
  bowlerStats: {},
  ballsHistory: [],

  // UI prompts
  needNewBatsman: false,
  needNewBowler: false,
  newBatsmanSlot: null,

  // Wicket flow
  pendingWicket: null, // { dismissal } — waiting for fielder

  // Match state
  isFreeHit: false,

  // Break timer
  breakActive: false,
  breakEndTime: null,
  breaksTaken: 0,
}

const useMatchStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ─── Match History (separate key) ────────────────────────────────────────
      matchHistory: [],

      saveMatchToHistory: () => {
        const s = get()
        if (!s.matchId) return

        set((state) => {
          if (state.matchHistory.some(m => m.id === state.matchId)) return state

          const entry = {
            id: state.matchId,
            matchName: s.matchName || `${s.teamA.name} vs ${s.teamB.name}`,
            date: new Date().toISOString(),
            teamA: s.teamA,
            teamB: s.teamB,
            totalOvers: s.totalOvers,
            powerplayOvers: s.powerplayOvers,
            innings1: s.innings1,
            innings2: {
              score: s.score,
              wickets: s.wickets,
              balls: s.totalBalls,
              teamName: (s.battingTeam === 'A' ? s.teamA : s.teamB).name,
              extras: s.extras,
              batsmanStats: s.batsmanStats,
              bowlerStats: s.bowlerStats,
            },
            battingTeam: s.battingTeam,
          }
          return { matchHistory: [entry, ...state.matchHistory] }
        })
      },

      deleteHistoryEntry: (id) =>
        set((s) => ({ matchHistory: s.matchHistory.filter((m) => m.id !== id) })),

      clearHistory: () => set({ matchHistory: [] }),

      // ─── Setup ───────────────────────────────────────────────────────────────
      setupMatch: ({ matchName, teamA, teamB, totalOvers, powerplayOvers, toss, decision }) => {
        const batsmanStats = {}
        teamA.players.forEach((p) => { batsmanStats[p] = defaultBatsmanStat() })
        teamB.players.forEach((p) => { batsmanStats[p] = defaultBatsmanStat() })

        const battingTeam = decision === 'bat' ? toss : toss === 'A' ? 'B' : 'A'
        const bowlingTeam = battingTeam === 'A' ? 'B' : 'A'

        set({
          ...initialState,
          matchId: Date.now(),
          matchName: matchName || '',
          teamA, teamB, totalOvers,
          powerplayOvers: powerplayOvers || 0,
          tossWinner: toss,
          tossDecision: decision,
          battingTeam, bowlingTeam,
          batsmanStats,
          bowlerStats: {},
          phase: 'innings1',
          score: 0, wickets: 0, balls: 0, totalBalls: 0,
          extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
          currentBatsmen: { striker: null, nonStriker: null },
          currentBowler: null,
          ballsHistory: [],
          innings1: null,
          needNewBatsman: false, needNewBowler: false,
          pendingWicket: null,
          breakActive: false, breakEndTime: null, breaksTaken: 0,
          isFreeHit: false,
        })
      },

      // ─── Opening players ──────────────────────────────────────────────────────
      setOpeningPlayers: ({ striker, nonStriker, bowler }) => {
        const bowlerStats = { ...get().bowlerStats }
        if (!bowlerStats[bowler]) bowlerStats[bowler] = defaultBowlerStat()
        set({
          currentBatsmen: { striker, nonStriker },
          currentBowler: bowler,
          bowlerStats,
          needNewBowler: false,
          needNewBatsman: false,
        })
      },

      // ─── Select new batsman ───────────────────────────────────────────────────
      selectNewBatsman: (name) => {
        const { batsmanStats, newBatsmanSlot } = get()
        const updated = { ...batsmanStats }
        if (!updated[name]) updated[name] = defaultBatsmanStat()
        set((s) => ({
          currentBatsmen: { ...s.currentBatsmen, [newBatsmanSlot]: name },
          batsmanStats: updated,
          needNewBatsman: false,
          newBatsmanSlot: null,
        }))
      },

      // ─── Select new bowler ────────────────────────────────────────────────────
      selectNewBowler: (name) => {
        const stats = { ...get().bowlerStats }
        if (!stats[name]) stats[name] = defaultBowlerStat()
        set({ currentBowler: name, bowlerStats: stats, needNewBowler: false })
      },

      // ─── Wicket flow: start (pending) → confirm with fielder ─────────────────
      startWicket: (dismissalType) => {
        // Bowled and LBW don't need a fielder
        if (dismissalType === 'Bowled' || dismissalType === 'LBW' || dismissalType === 'Hit Wicket') {
          get().confirmWicket(dismissalType, '')
        } else {
          set({ pendingWicket: { dismissal: dismissalType } })
        }
      },

      confirmWicket: (dismissal, fielder) => {
        const fullDismissal = fielder
          ? `${dismissal} (${fielder})`
          : dismissal
        get().addBall({ runs: 0, isWicket: true, dismissal: fullDismissal })
        set({ pendingWicket: null })
      },

      cancelWicket: () => set({ pendingWicket: null }),

      // ─── Break timer ──────────────────────────────────────────────────────────
      startBreak: () => set((s) => ({ breakActive: true, breakEndTime: Date.now() + 120_000, breaksTaken: s.breaksTaken + 1 })),
      endBreak: () => set({ breakActive: false, breakEndTime: null }),

      // ─── Add Ball ─────────────────────────────────────────────────────────────
      addBall: ({ runs = 0, extraType = null, isWicket = false, dismissal = '' }) => {
        const state = get()
        const {
          score, wickets, balls, totalBalls, totalOvers,
          currentBatsmen, currentBowler, batsmanStats, bowlerStats,
          extras, ballsHistory, phase, battingTeam, bowlingTeam,
          teamA, teamB, innings1, powerplayOvers,
        } = state

        const legal = isLegalDelivery(extraType)
        const newBalls = legal ? balls + 1 : balls
        const newTotalBalls = legal ? totalBalls + 1 : totalBalls
        const isEndOfOver = legal && newBalls === 6

        const newExtras = { ...extras }
        if (extraType === 'wide') newExtras.wides++
        if (extraType === 'noBall') newExtras.noBalls++
        if (extraType === 'bye') newExtras.byes++
        if (extraType === 'legBye') newExtras.legByes++

        let runsToAdd = runs
        if (extraType === 'wide' || extraType === 'noBall') runsToAdd += 1
        const newScore = score + runsToAdd

        // Batsman stats
        const newBatsmanStats = { ...batsmanStats }
        const striker = currentBatsmen.striker
        if (striker && newBatsmanStats[striker]) {
          const bs = { ...newBatsmanStats[striker] }
          if (extraType !== 'wide') {
            if (!isWicket || extraType === null) {
              if (!extraType || extraType === 'noBall') bs.runs += runs
              bs.balls++
            } else {
              bs.balls++
            }
            if (runs === 4 && !extraType) bs.fours++
            if (runs === 6 && !extraType) bs.sixes++
          }
          if (isWicket) {
            bs.out = true
            bs.dismissal = dismissal || 'out'
          }
          newBatsmanStats[striker] = bs
        }

        // Bowler stats
        const newBowlerStats = { ...bowlerStats }
        if (currentBowler && newBowlerStats[currentBowler]) {
          const bw = { ...newBowlerStats[currentBowler] }
          if (legal) bw.balls++
          if (extraType !== 'bye' && extraType !== 'legBye') bw.runs += runsToAdd
          if (isWicket) bw.wickets++
          if (legal && runs === 0 && !extraType) bw.dotBalls++
          if (bw.balls === 6) {
            bw.overs++
            bw.balls = 0
          }
          newBowlerStats[currentBowler] = bw
        }

        let { striker: newStriker, nonStriker: newNonStriker } = currentBatsmen
        if (!isWicket) {
          if (runs % 2 === 1) [newStriker, newNonStriker] = [newNonStriker, newStriker]
        }

        let updatedBatsmen = { striker: newStriker, nonStriker: newNonStriker }
        if (isWicket) {
          updatedBatsmen.striker = null
        }
        
        if (isEndOfOver) {
          const temp = updatedBatsmen.striker
          updatedBatsmen.striker = updatedBatsmen.nonStriker
          updatedBatsmen.nonStriker = temp
        }

        const histEntry = { runs, extraType, isWicket, dismissal, legal, runsToAdd }
        const newHistory = [...ballsHistory, histEntry]

        const battingTeamObj = battingTeam === 'A' ? teamA : teamB
        const maxWickets = Math.max(1, battingTeamObj.players.length - 1)
        const allOut = isWicket && (wickets + 1) >= maxWickets
        const oversUp = isEndOfOver && (Math.floor(newTotalBalls / 6) >= totalOvers)
        const inningsOver = allOut || oversUp

        let newIsFreeHit = state.isFreeHit
        if (extraType === 'noBall') newIsFreeHit = true
        else if (extraType !== 'wide') newIsFreeHit = false
        const chasing = phase === 'innings2'
        const target = innings1 ? innings1.score + 1 : null
        const chasersWon = chasing && newScore >= (target || Infinity)

        if (chasersWon) {
          set({
            score: newScore,
            wickets: isWicket ? wickets + 1 : wickets,
            balls: isEndOfOver ? 0 : newBalls,
            totalBalls: newTotalBalls,
            extras: newExtras,
            batsmanStats: newBatsmanStats,
            bowlerStats: newBowlerStats,
            currentBatsmen: { striker: newStriker, nonStriker: newNonStriker },
            ballsHistory: newHistory,
            phase: 'done',
            needNewBatsman: false, needNewBowler: false,
            isFreeHit: newIsFreeHit,
          })
          return
        }

        if (inningsOver) {
          if (phase === 'innings1') {
            const inn1 = {
              score: newScore,
              wickets: isWicket ? wickets + 1 : wickets,
              balls: newTotalBalls,
              teamName: battingTeamObj.name,
              extras: newExtras,
              batsmanStats: newBatsmanStats,
              bowlerStats: newBowlerStats,
            }
            const newBattingTeam = bowlingTeam
            const newBowlingTeam = battingTeam
            const inn2BatsmanStats = {}
            const inn2Team = newBattingTeam === 'A' ? teamA : teamB
            inn2Team.players.forEach((p) => { inn2BatsmanStats[p] = defaultBatsmanStat() })

            set({
              innings1: inn1,
              phase: 'innings2',
              battingTeam: newBattingTeam,
              bowlingTeam: newBowlingTeam,
              score: 0, wickets: 0, balls: 0, totalBalls: 0,
              extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
              currentBatsmen: { striker: null, nonStriker: null },
              currentBowler: null,
              batsmanStats: inn2BatsmanStats,
              bowlerStats: {},
              ballsHistory: [],
              needNewBatsman: true,
              needNewBowler: true,
              newBatsmanSlot: null,
              breaksTaken: 0,
              isFreeHit: false,
            })
          } else {
            set({
              score: newScore,
              wickets: isWicket ? wickets + 1 : wickets,
              balls: isEndOfOver ? 0 : newBalls,
              totalBalls: newTotalBalls,
              extras: newExtras,
              batsmanStats: newBatsmanStats,
              bowlerStats: newBowlerStats,
              currentBatsmen: { striker: newStriker, nonStriker: newNonStriker },
              ballsHistory: newHistory,
              phase: 'done',
              needNewBatsman: false, needNewBowler: false,
              isFreeHit: newIsFreeHit,
            })
          }
          return
        }

        const needBatsman = isWicket && !allOut
        const slot = updatedBatsmen.striker === null ? 'striker' : 'nonStriker'
        const needBowler = isEndOfOver && !allOut

        set({
          score: newScore,
          wickets: isWicket ? wickets + 1 : wickets,
          balls: isEndOfOver ? 0 : newBalls,
          totalBalls: newTotalBalls,
          extras: newExtras,
          batsmanStats: newBatsmanStats,
          bowlerStats: newBowlerStats,
          currentBatsmen: updatedBatsmen,
          ballsHistory: newHistory,
          needNewBatsman: needBatsman,
          needNewBowler: needBowler,
          newBatsmanSlot: needBatsman ? slot : null,
          isFreeHit: newIsFreeHit,
        })
      },

      // ─── Undo ─────────────────────────────────────────────────────────────────
      undoBall: () => {
        const { ballsHistory, score, wickets, balls, totalBalls } = get()
        if (!ballsHistory.length) return
        const last = ballsHistory[ballsHistory.length - 1]
        set({
          score: Math.max(0, score - last.runsToAdd),
          wickets: last.isWicket ? Math.max(0, wickets - 1) : wickets,
          balls: last.legal ? Math.max(0, balls === 0 ? 5 : balls - 1) : balls,
          totalBalls: last.legal ? Math.max(0, totalBalls - 1) : totalBalls,
          ballsHistory: ballsHistory.slice(0, -1),
        })
      },

      // ─── Reset ────────────────────────────────────────────────────────────────
      resetMatch: () => {
        const { matchHistory } = get()
        set({ ...initialState, matchHistory })
      },
    }),
    { 
      name: 'crichub-match-v2',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)

export default useMatchStore
