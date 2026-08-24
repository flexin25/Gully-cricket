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
