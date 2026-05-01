/**
 * calculations.js – Pure cricket math utilities
 */

/** Format balls into overs string (e.g. 13 balls → "2.1") */
export function ballsToOvers(balls) {
  const overs = Math.floor(balls / 6)
  const rem = balls % 6
  return `${overs}.${rem}`
}

/** Parse overs string to total balls */
export function oversToBalls(oversStr) {
  const [o, b = 0] = String(oversStr).split('.').map(Number)
  return o * 6 + b
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

/** Check if this ball should rotate strike (odd runs, or end of over for non-extras) */
export function shouldRotateStrike(runs, isExtra, extraType, isEndOfOver) {
  if (isEndOfOver && !isExtra) return true
  if (isExtra && (extraType === 'wide' || extraType === 'noBall')) return false
  if (runs % 2 === 1) return true
  return false
}

/** Check if a ball counts as a legal delivery (wickets, runs, byes, legbyes consume a ball) */
export function isLegalDelivery(extraType) {
  return !extraType || extraType === 'bye' || extraType === 'legBye'
}

/** Get result string */
export function getResult(inningsA, inningsB, totalOvers) {
  const { score: scoreA, wickets: wicketsA } = inningsA
  const { score: scoreB, wickets: wicketsB, balls: ballsB, teamName: teamNameB } = inningsB
  const ballsUsed = ballsB
  const totalBalls = totalOvers * 6

  if (scoreB > scoreA) {
    const wicketsLeft = 10 - wicketsB
    return `${teamNameB} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`
  }
  if (scoreA > scoreB) {
    const runs = scoreA - scoreB
    return `${inningsA.teamName} won by ${runs} run${runs !== 1 ? 's' : ''}`
  }
  return 'Match Tied!'
}
