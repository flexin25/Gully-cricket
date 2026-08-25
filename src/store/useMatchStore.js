import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { isLegalDelivery, lastOverWasMaiden, activeSuperOver, superOverInnings, superOverMaxWickets } from '../utils/calculations'

const defaultBatsmanStat = () => ({ runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: '', fielder: '' })
const defaultBowlerStat = () => ({ overs: 0, balls: 0, runs: 0, wickets: 0, dotBalls: 0, maidens: 0 })

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
  // How the toss was settled. `tossWinner` is DERIVED from the call vs the
  // result when tossMethod === 'coin' (see TossCoin.jsx); 'manual' means the
  // teams tossed a real coin themselves and entered the outcome directly, so
  // tossCall/tossResult stay null.
  // Set once at setup and never touched by addBall — deliberately NOT part of
  // the undo snapshot, and not stripped by partialize (must survive a reload).
  tossMethod: 'coin',   // 'coin' | 'manual'
  tossCaller: 'A',      // which side called it
  tossCall: null,       // 'heads' | 'tails' — what they called
  tossResult: null,     // 'heads' | 'tails' — what the coin landed on

  // Match phase.
  //   'setup' → 'innings1' → 'innings2' → 'done'
  //   'tied'  — scores level, waiting for the user to start a Super Over. Covers
  //             both a tied normal match and a tied Super Over; the screen tells
  //             them apart from superOvers.length.
  //   'super' — a Super Over is being set up or scored.
  phase: 'setup',

  // Completed-innings snapshots. Innings 2 used to have none — it lived only in
  // the live fields below and was assembled at save time — which is why the
  // Super Over needs one: startSuperOver reuses those live fields, so without a
  // snapshot the normal 2nd innings would be overwritten and lost.
  innings1: null,
  innings2: null,

  // One entry per Super Over played, in order:
  //   { battingFirst: 'A'|'B', inn1: snapshot|null, inn2: snapshot|null }
  // The live Super Over is always the last entry, and which of its innings is
  // being scored is derived (inn1 === null → 1st, else → 2nd) so there is no
  // index to keep in sync. A tied Super Over appends another entry.
  superOvers: [],

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
  // Who bowled the over that just finished. Cricket's one-over-at-a-time rule:
  // they are ineligible for the very next over, but free again the over after.
  // Set at end-of-over, cleared per innings, and part of the undo snapshot
  // because undoing across an over boundary has to un-retire that bowler.
  lastOverBowler: null,

  batsmanStats: {},
  bowlerStats: {},
  ballsHistory: [],
  undoStack: [],

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

      // ─── Match History (persisted in the same key as the live match state) ────
      matchHistory: [],

      // Records the finished match. Both innings are stored snapshots by the time
      // the match is over; the live-field assembly below is only a fallback for a
      // session that was persisted by an earlier build.
      saveMatchToHistory: () => {
        const s = get()
        if (!s.matchId) return
        // Nothing but a completed match belongs in history. Reaching Summary
        // mid-chase used to file an entry holding a part-played 2nd innings.
        // A tie sits on 'tied' and an unfinished Super Over on 'super', so
        // neither can be filed half-played either.
        if (s.phase !== 'done') return

        set((state) => {
          const entry = {
            id: state.matchId,
            matchName: s.matchName || `${s.teamA.name} vs ${s.teamB.name}`,
            date: new Date().toISOString(),
            teamA: s.teamA,
            teamB: s.teamB,
            totalOvers: s.totalOvers,
            powerplayOvers: s.powerplayOvers,
            innings1: s.innings1,
            innings2: s.innings2 || {
              score: s.score,
              wickets: s.wickets,
              balls: s.totalBalls,
              teamName: (s.battingTeam === 'A' ? s.teamA : s.teamB).name,
              extras: s.extras,
              batsmanStats: s.batsmanStats,
              bowlerStats: s.bowlerStats,
            },
            superOvers: s.superOvers,
            battingTeam: s.battingTeam,
            // Same field names as the live state, so tossSummary() reads either.
            tossWinner: s.tossWinner,
            tossDecision: s.tossDecision,
            tossMethod: s.tossMethod,
            tossCaller: s.tossCaller,
            tossCall: s.tossCall,
            tossResult: s.tossResult,
          }
          const idx = state.matchHistory.findIndex((m) => m.id === state.matchId)
          if (idx === -1) return { matchHistory: [entry, ...state.matchHistory] }
          // Upsert instead of bailing out. An entry filed from an earlier state
          // (or by an older build) has to be corrected in place — the PDF and
          // the history list both read from here, so a stale one is what made
          // the 2nd innings look missing. Keep its slot and original date so
          // history doesn't reshuffle under the user.
          const next = [...state.matchHistory]
          next[idx] = { ...entry, date: state.matchHistory[idx].date || entry.date }
          return { matchHistory: next }
        })
      },

      /**
       * Both deleters have to clear the loaded match as well as the list entry,
       * or the deletion doesn't stick. matchId and phase survive partialize, and
       * Summary re-files on every mount — so with the entry gone, findIndex above
       * misses and files it straight back in. Home's "View Last Result" makes
       * that one tap away. A match still being scored is deliberately spared;
       * only a finished one can be re-filed.
       */
      deleteHistoryEntry: (id) => {
        set((s) => ({ matchHistory: s.matchHistory.filter((m) => m.id !== id) }))
        const s = get()
        if (s.matchId === id && s.phase === 'done') s.resetMatch()
      },

      clearHistory: () => {
        set({ matchHistory: [] })
        const s = get()
        if (s.phase === 'done') s.resetMatch()
      },


      // ─── Setup ───────────────────────────────────────────────────────────────
      // `toss` is the winning side ('A'|'B') and `decision` is what they chose.
      // With a coin flip the caller passes the raw ritual too (method/caller/
      // call/result) so the toss can be replayed and printed later; `toss` itself
      // is derived from call vs result by TossCoin.jsx.
      setupMatch: ({
        matchName, teamA, teamB, totalOvers, powerplayOvers, toss, decision,
        tossMethod = 'coin', tossCaller = 'A', tossCall = null, tossResult = null,
      }) => {
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
          tossMethod, tossCaller, tossCall, tossResult,
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
          innings2: null,
          superOvers: [],
          needNewBatsman: false, needNewBowler: false,
          pendingWicket: null,
          breakActive: false, breakEndTime: null, breaksTaken: 0,
          isFreeHit: false,
        })
      },

      // ─── Super Over ───────────────────────────────────────────────────────────
      /**
       * Begin a Super Over from the 'tied' phase. Scoring then runs through the
       * same live fields and the same addBall as a normal innings — only the
       * limits differ (one over, two wickets), which addBall derives from the
       * phase. Nothing here duplicates the scoring engine.
       *
       * The side that batted second in the normal match bats first, which is
       * already the current battingTeam when the tie lands, so there's no swap.
       * For a repeat Super Over that's the previous Super Over's chasing side —
       * the same rule applied again.
       */
      startSuperOver: () => {
        const s = get()
        if (s.phase !== 'tied') return  // guards a double tap or a stale click

        const battingFirst = s.battingTeam
        const bowlingFirst = battingFirst === 'A' ? 'B' : 'A'
        const battingTeamObj = battingFirst === 'A' ? s.teamA : s.teamB

        // The normal 2nd innings normally gets snapshotted by the ball that ends
        // it, but a session persisted by an earlier build won't have one — and
        // the lines below overwrite the live fields it lives in. Belt and braces.
        const innings2 = s.innings2 || {
          score: s.score, wickets: s.wickets, balls: s.totalBalls,
          teamName: battingTeamObj.name,
          extras: s.extras, batsmanStats: s.batsmanStats, bowlerStats: s.bowlerStats,
        }

        // Fresh cards for the batting side only. This is what delivers "any
        // playing member may bat": nobody is marked out, so the picker offers
        // the whole squad even to players dismissed in the normal match.
        const soBatsmanStats = {}
        battingTeamObj.players.forEach((p) => { soBatsmanStats[p] = defaultBatsmanStat() })

        set({
          innings2,
          superOvers: [...s.superOvers, { battingFirst, inn1: null, inn2: null }],
          phase: 'super',
          battingTeam: battingFirst,
          bowlingTeam: bowlingFirst,
          score: 0, wickets: 0, balls: 0, totalBalls: 0,
          extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
          currentBatsmen: { striker: null, nonStriker: null },
          currentBowler: null,
          batsmanStats: soBatsmanStats,
          bowlerStats: {},
          ballsHistory: [],
          needNewBatsman: false, needNewBowler: false,
          newBatsmanSlot: null,
          // null, so the bowler who bowled the last over of the normal match is
          // eligible — the no-consecutive-overs rule doesn't cross the phase.
          lastOverBowler: null,
          breaksTaken: 0,
          isFreeHit: false,
          pendingWicket: null,
          // Emptied so undo can't roll back out of the Super Over into the
          // finished normal match and un-tie it.
          undoStack: [],
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
      // Enforces the no-consecutive-overs rule at the data layer, not just in the
      // picker, so a stale click or a restored session can't sneak the same
      // bowler through. Waived only if the side has nobody else to turn to.
      selectNewBowler: (name) => {
        const { lastOverBowler, bowlingTeam, teamA, teamB } = get()
        const squad = (bowlingTeam === 'A' ? teamA : teamB).players || []
        const hasAlternative = squad.some((p) => p !== lastOverBowler)
        if (name === lastOverBowler && hasAlternative) return
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
          teamA, teamB, innings1, lastOverBowler, superOvers,
        } = state

        // Free hit: only a run out can dismiss the batsman — ignore any other wicket.
        const isRunOut = dismissal.startsWith('Run Out')
        if (state.isFreeHit && isWicket && !isRunOut) {
          isWicket = false
          dismissal = ''
        }

        // Snapshot pre-ball state so undoBall can restore it exactly (survives an
        // innings switch, and a Super Over innings switch). innings2/superOvers
        // are in here because the ball that ends an innings writes them —
        // rolling that ball back has to un-write them too.
        const snapshot = {
          score, wickets, balls, totalBalls, extras,
          batsmanStats, bowlerStats, currentBatsmen, currentBowler, lastOverBowler,
          ballsHistory, phase, battingTeam, bowlingTeam, innings1,
          innings2: state.innings2,
          superOvers: state.superOvers,
          isFreeHit: state.isFreeHit,
          needNewBatsman: state.needNewBatsman,
          needNewBowler: state.needNewBowler,
          newBatsmanSlot: state.newBatsmanSlot,
        }
        const newUndoStack = [...(state.undoStack || []), snapshot].slice(-30)

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
          if (isWicket && !isRunOut) bw.wickets++
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

        // Maiden over — credited once the sixth legal ball lands with nothing
        // charged to the bowler. Read off the history rather than a running
        // counter so undo needs no extra bookkeeping: rolling the ball back
        // restores the whole bowlerStats object from the snapshot.
        if (isEndOfOver && currentBowler && newBowlerStats[currentBowler] && lastOverWasMaiden(newHistory)) {
          const bw = newBowlerStats[currentBowler]
          newBowlerStats[currentBowler] = { ...bw, maidens: (bw.maidens || 0) + 1 }
        }

        const battingTeamObj = battingTeam === 'A' ? teamA : teamB

        // A Super Over is scored through these same live fields and this same
        // engine — only the two innings limits differ. Which Super Over innings
        // is live is derived from the last entry rather than tracked separately.
        const inSuper = phase === 'super'
        const so = inSuper ? activeSuperOver(state) : null
        const soInn = superOverInnings(so)

        const maxWickets = inSuper
          ? superOverMaxWickets(battingTeamObj)
          : Math.max(1, battingTeamObj.players.length - 1)
        const oversLimit = inSuper ? 1 : totalOvers
        const allOut = isWicket && (wickets + 1) >= maxWickets
        const oversUp = isEndOfOver && (Math.floor(newTotalBalls / 6) >= oversLimit)
        const inningsOver = allOut || oversUp

        let newIsFreeHit = state.isFreeHit
        if (extraType === 'noBall') newIsFreeHit = true
        else if (extraType !== 'wide') newIsFreeHit = false
        const chasing = phase === 'innings2' || soInn === 2
        const target = soInn === 2
          ? so.inn1.score + 1
          : (innings1 ? innings1.score + 1 : null)
        const chasersWon = chasing && newScore >= (target || Infinity)

        // The live innings, frozen. Same shape as the innings1 snapshot below,
        // plus ballsHistory for Super Overs — a one-over innings is small and
        // its ball-by-ball IS the scorecard.
        const snapInnings = (withHistory = false) => ({
          score: newScore,
          wickets: isWicket ? wickets + 1 : wickets,
          balls: newTotalBalls,
          teamName: battingTeamObj.name,
          extras: newExtras,
          batsmanStats: newBatsmanStats,
          bowlerStats: newBowlerStats,
          ...(withHistory ? { ballsHistory: newHistory } : {}),
        })

        /** Fields common to every "this ball ended things" set(). */
        const closingBall = () => ({
          score: newScore,
          wickets: isWicket ? wickets + 1 : wickets,
          balls: isEndOfOver ? 0 : newBalls,
          totalBalls: newTotalBalls,
          extras: newExtras,
          batsmanStats: newBatsmanStats,
          bowlerStats: newBowlerStats,
          currentBatsmen: updatedBatsmen,
          ballsHistory: newHistory,
          needNewBatsman: false, needNewBowler: false,
          isFreeHit: newIsFreeHit,
          undoStack: newUndoStack,
        })

        /** Replace the live Super Over's innings-1 or innings-2 slot. */
        const withSuperInnings = (key) => {
          const next = [...superOvers]
          next[next.length - 1] = { ...so, [key]: snapInnings(true) }
          return next
        }

        if (chasersWon) {
          if (inSuper) {
            // Target passed inside the Super Over — decided, no need to finish it.
            set({ ...closingBall(), superOvers: withSuperInnings('inn2'), phase: 'done' })
            return
          }
          set({ ...closingBall(), innings2: snapInnings(), phase: 'done' })
          return
        }

        if (inningsOver) {
          if (phase === 'innings1') {
            const newBattingTeam = bowlingTeam
            const newBowlingTeam = battingTeam
            const inn2BatsmanStats = {}
            const inn2Team = newBattingTeam === 'A' ? teamA : teamB
            inn2Team.players.forEach((p) => { inn2BatsmanStats[p] = defaultBatsmanStat() })

            set({
              innings1: snapInnings(),
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
              lastOverBowler: null,
              breaksTaken: 0,
              isFreeHit: false,
              undoStack: newUndoStack,
            })
          } else if (inSuper && soInn === 1) {
            // First half of the Super Over done — hand over exactly the way the
            // normal innings break does, so the existing setup screen picks up
            // the other side's batters and bowler.
            const newBattingTeam = bowlingTeam
            const newBowlingTeam = battingTeam
            const soBatsmanStats = {}
            const soTeam = newBattingTeam === 'A' ? teamA : teamB
            soTeam.players.forEach((p) => { soBatsmanStats[p] = defaultBatsmanStat() })

            set({
              superOvers: withSuperInnings('inn1'),
              phase: 'super',
              battingTeam: newBattingTeam,
              bowlingTeam: newBowlingTeam,
              score: 0, wickets: 0, balls: 0, totalBalls: 0,
              extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
              currentBatsmen: { striker: null, nonStriker: null },
              currentBowler: null,
              batsmanStats: soBatsmanStats,
              bowlerStats: {},
              ballsHistory: [],
              needNewBatsman: true,
              needNewBowler: true,
              newBatsmanSlot: null,
              lastOverBowler: null,
              breaksTaken: 0,
              isFreeHit: false,
              undoStack: newUndoStack,
            })
          } else if (inSuper) {
            // Second half done, and the target wasn't passed (chasersWon caught
            // that above) — so it's a Super Over win for the side batting first,
            // or level, which earns another Super Over.
            set({
              ...closingBall(),
              superOvers: withSuperInnings('inn2'),
              phase: newScore === so.inn1.score ? 'tied' : 'done',
            })
          } else {
            // End of the normal 2nd innings. A tie can only surface here:
            // chasersWon needs innings1.score + 1, and both all-out and overs-up
            // funnel through this one branch.
            set({
              ...closingBall(),
              innings2: snapInnings(),
              phase: innings1 && newScore === innings1.score ? 'tied' : 'done',
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
          // Retire the current bowler from the next over only (they may return
          // the over after). Untouched mid-over so it survives until the changeover.
          lastOverBowler: isEndOfOver ? currentBowler : lastOverBowler,
          isFreeHit: newIsFreeHit,
          undoStack: newUndoStack,
        })
      },

      // ─── Undo (restore the pre-ball snapshot) ──────────────────────────────────
      undoBall: () => {
        const { undoStack } = get()
        if (!undoStack || !undoStack.length) return
        const prev = undoStack[undoStack.length - 1]
        set({ ...prev, undoStack: undoStack.slice(0, -1) })
      },

      // ─── Reset ────────────────────────────────────────────────────────────────
      resetMatch: () => {
        const { matchHistory } = get()
        set({ ...initialState, matchHistory })
      },
    }),
    {
      name: 'crichub-match-v2',
      storage: createJSONStorage(() => localStorage),
      // Persist match state + history; skip transient UI/timer state and the undo stack.
      partialize: (state) => {
        // eslint-disable-next-line no-unused-vars
        const { pendingWicket, breakActive, breakEndTime, undoStack, ...rest } = state
        return rest
      },
    }
  )
)

export default useMatchStore
