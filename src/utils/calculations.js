/**
 * calculations.js – Pure cricket math utilities
 */

/** Format balls into overs string (e.g. 13 balls → "2.1") */
export function ballsToOvers(balls) {
  const overs = Math.floor(balls / 6)
  const rem = balls % 6
  return `${overs}.${rem}`
}

/** Total balls bowled, from a bowler stat object ({ overs, balls }) */
export function bowlerBalls(s) {
  return (s?.overs || 0) * 6 + (s?.balls || 0)
}

/** Current Run Rate */
export function calcCRR(runs, balls) {
  if (!balls) return '0.00'
  return ((runs / balls) * 6).toFixed(2)
}

/** Required Run Rate */
export function calcRRR(target, currentRuns, ballsLeft) {
  if (!ballsLeft) return '∞'
  const needed = target - currentRuns
  if (needed <= 0) return '0.00'
  return ((needed / ballsLeft) * 6).toFixed(2)
}

/** Batsman strike rate */
export function calcSR(runs, balls) {
  if (!balls) return '0.00'
  return ((runs / balls) * 100).toFixed(1)
}

/** Bowler economy */
export function calcEconomy(runs, balls) {
  if (!balls) return '0.00'
  return ((runs / balls) * 6).toFixed(2)
}

/** Check if a ball counts as a legal delivery (wickets, runs, byes, legbyes consume a ball) */
export function isLegalDelivery(extraType) {
  return !extraType || extraType === 'bye' || extraType === 'legBye'
}

/**
 * Runs charged to the bowler for one delivery. Byes and leg-byes are batting
 * extras, not the bowler's fault, so they don't count against the bowler (and
 * an over of only byes can still be a maiden). Wides and no-balls DO count.
 */
export function bowlerChargedRuns(ball) {
  if (ball.extraType === 'bye' || ball.extraType === 'legBye') return 0
  return ball.runsToAdd || 0
}

/**
 * Was the over that just finished a maiden — i.e. no runs charged to the bowler?
 * Call at end-of-over with the full ballsHistory (whose last entry is the 6th
 * legal ball). Walks back through this over's deliveries, including any leading
 * wide/no-ball, and stops at the previous over's final legal ball. A completed
 * over never has trailing illegal deliveries, so contiguous illegals sitting
 * before the sixth-counted legal ball belong to this over and are included.
 */
export function lastOverWasMaiden(ballsHistory) {
  let legalSeen = 0
  let runs = 0
  for (let i = ballsHistory.length - 1; i >= 0; i--) {
    const b = ballsHistory[i]
    if (b.legal && legalSeen === 6) break  // reached the previous over
    if (b.legal) legalSeen++
    runs += bowlerChargedRuns(b)
  }
  return legalSeen === 6 && runs === 0
}

/** Max wickets the chasing (2nd-innings) team can lose = squad size − 1 (gully last-man rule) */
export function chasingMaxWickets(match) {
  const chasingName = match?.innings2?.teamName
  const team = [match?.teamA, match?.teamB].find((tm) => tm && tm.name === chasingName)
  const count = team?.players?.length ?? 0
  return count > 0 ? Math.max(1, count - 1) : 10
}

/** Get result string. maxWicketsChasing = wickets the chasing side had in hand (squad − 1). */
export function getResult(inningsA, inningsB, maxWicketsChasing = 10) {
  const { score: scoreA } = inningsA
  const { score: scoreB, wickets: wicketsB, teamName: teamNameB } = inningsB

  if (scoreB > scoreA) {
    const wicketsLeft = Math.max(0, maxWicketsChasing - wicketsB)
    return `${teamNameB} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`
  }
  if (scoreA > scoreB) {
    const runs = scoreA - scoreB
    return `${inningsA.teamName} won by ${runs} run${runs !== 1 ? 's' : ''}`
  }
  return 'Match Tied!'
}

/**
 * Split a flat ballsHistory into per-over groups. An over closes on its sixth
 * *legal* delivery, so a group can hold more than six entries when there were
 * wides or no-balls. A part-played over comes back as the last group.
 */
export function groupBallsIntoOvers(ballsHistory) {
  const overs = []
  let current = []
  let legal = 0
  for (const b of ballsHistory || []) {
    current.push(b)
    if (b.legal) legal++
    if (legal === 6) {
      overs.push(current)
      current = []
      legal = 0
    }
  }
  if (current.length > 0) overs.push(current)
  return overs
}

/**
 * The Super Over currently in play, or null. Always the last entry — a tied
 * Super Over appends a new one — so there is no index to keep in sync.
 * Accepts the live store state or a saved history entry.
 */
export function activeSuperOver(m) {
  const list = m?.superOvers
  return list && list.length ? list[list.length - 1] : null
}

/** Which innings of a Super Over is live: 1, 2, or 0 when it's finished/absent. */
export function superOverInnings(so) {
  if (!so) return 0
  if (so.inn1 === null || so.inn1 === undefined) return 1
  if (so.inn2 === null || so.inn2 === undefined) return 2
  return 0
}

/** Super Overs that were played to completion, in order. */
export function completedSuperOvers(m) {
  return (m?.superOvers || []).filter((so) => so?.inn1 && so?.inn2)
}

/** Chasing side's max wickets in a Super Over — two, and never more than the
 *  squad can actually lose (guards a legacy 2-player side). */
export function superOverMaxWickets(team) {
  const count = team?.players?.length ?? 0
  return count > 0 ? Math.min(2, Math.max(1, count - 1)) : 2
}

/**
 * Final result line for a match, whether it was decided in normal play or by a
 * Super Over. Delegates to getResult when no Super Over was played, so normal
 * matches and history entries saved before this feature read exactly as before.
 */
export function matchResultText(match, maxWicketsChasing = chasingMaxWickets(match)) {
  const played = completedSuperOvers(match)
  if (!played.length) {
    // An abandoned or in-progress match has no result to state yet.
    if (!match?.innings1 || !match?.innings2) return '—'
    return getResult(match.innings1, match.innings2, maxWicketsChasing)
  }

  const last = played[played.length - 1]
  // Only number it once there's been more than one — "won the Super Over" reads
  // better than "won Super Over 1" in the common case.
  const label = played.length > 1 ? `Super Over ${played.length}` : 'the Super Over'
  const { inn1, inn2 } = last
  if (inn2.score > inn1.score) return `${inn2.teamName} won ${label} (${inn2.score} v ${inn1.score})`
  if (inn1.score > inn2.score) return `${inn1.teamName} won ${label} (${inn1.score} v ${inn2.score})`
  // Defensive: a tied Super Over sends the match back for another one, so a
  // finished match never ends here.
  return played.length > 1 ? `Super Over ${played.length} Tied` : 'Super Over Tied'
}

/**
 * One-line toss summary, e.g.
 *   "Gully Kings won the toss (called heads) and chose to bowl"
 *   "Gully Kings won the toss and chose to bat"   (manual entry — no call/result)
 *
 * Accepts either the live store state or a saved history entry; both carry
 * teamA/teamB plus the toss fields. Returns '' when there's nothing to show.
 */
export function tossSummary(m) {
  if (!m?.tossWinner) return ''
  const team = m.tossWinner === 'A' ? m.teamA : m.teamB
  const name = team?.name || (m.tossWinner === 'A' ? 'Team A' : 'Team B')
  const called = m.tossMethod === 'coin' && m.tossCall ? ` (called ${m.tossCall})` : ''
  const decision = m.tossDecision === 'bowl' ? 'bowl' : 'bat'
  return `${name} won the toss${called} and chose to ${decision}`
}

/** Compact toss line for the scoreboard, e.g. "Gully Kings won toss · chose to bowl" */
export function tossSummaryShort(m) {
  if (!m?.tossWinner) return ''
  const team = m.tossWinner === 'A' ? m.teamA : m.teamB
  const name = team?.name || (m.tossWinner === 'A' ? 'Team A' : 'Team B')
  return `${name} won toss · chose to ${m.tossDecision === 'bowl' ? 'bowl' : 'bat'}`
}
