import { useEffect, useState } from 'react'
import { Coins, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/** Whole rotations before the coin settles. Matches the 1.15s spin in index.css. */
const SPINS = 5

const other = (side) => (side === 'A' ? 'B' : 'A')

/**
 * Fair coin. crypto.getRandomValues, not Math.random() — the app is being
 * trusted to decide the toss, so the result should be defensibly random.
 * A uniform byte's low bit is itself uniform.
 */
function flipCoin() {
  return crypto.getRandomValues(new Uint8Array(1))[0] & 1 ? 'tails' : 'heads'
}

/**
 * The toss: one side calls, the app flips, the winner elects to bat or bowl.
 *
 * Stages: call → flip → reveal (dialog) → done.  `manual` is a separate branch
 * for "we tossed our own coin", which records the outcome without a call/result.
 *
 * Owns no store state; it hands the finished toss up through onConfirm so
 * MatchSetup stays the only caller of setupMatch.
 */
export default function TossCoin({
  teamAName,
  teamBName,
  matchName,
  totalOvers,
  powerplayOvers,
  onBack,
  onConfirm,
}) {
  const [stage, setStage] = useState('call')
  const [caller, setCaller] = useState('A')
  const [call, setCall] = useState('heads')
  const [result, setResult] = useState(null)
  const [decision, setDecision] = useState(null)

  const [manual, setManual] = useState(false)
  const [manualWinner, setManualWinner] = useState('A')
  const [manualDecision, setManualDecision] = useState('bat')

  const nameOf = (side) =>
    (side === 'A' ? teamAName : teamBName) || (side === 'A' ? 'Team A' : 'Team B')

  // Not asked for — derived. Calling right wins, calling wrong hands it over.
  const winner = result ? (call === result ? caller : other(caller)) : null

  const flip = () => {
    setResult(flipCoin()) // decided first; the spin is only the reveal
    setDecision(null)
    setStage('flip')
  }

  const redo = () => {
    setResult(null)
    setDecision(null)
    setStage('call')
  }

  // The spin's animationend drives the reveal, so the two can't desync. This is
  // only a stall guard for the case where the animation never runs at all —
  // the result is already decided either way, so it can't change the outcome.
  useEffect(() => {
    if (stage !== 'flip') return
    const id = setTimeout(() => setStage('reveal'), 2500)
    return () => clearTimeout(id)
  }, [stage])

  const start = () =>
    onConfirm({
      toss: winner,
      decision,
      tossMethod: 'coin',
      tossCaller: caller,
      tossCall: call,
      tossResult: result,
    })

  const startManual = () =>
    onConfirm({
      toss: manualWinner,
      decision: manualDecision,
      tossMethod: 'manual',
      tossCaller: null,
      tossCall: null,
      tossResult: null,
    })

  const summary = (
    <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
      {matchName && <div className="mb-1 text-foreground">&ldquo;{matchName}&rdquo;</div>}
      <span className="text-foreground">{totalOvers}</span> ov
      {powerplayOvers > 0 && (
        <>
          {' · '}
          <span className="text-info">PP {powerplayOvers} ov</span>
        </>
      )}
    </div>
  )

  // ── Manual override: they tossed a real coin, we just record it ────────────
  if (manual) {
    return (
      <div>
        <Lbl>who won the toss</Lbl>
        <Pick
          label="Toss winner"
          value={manualWinner}
          onChange={setManualWinner}
          options={[
            { value: 'A', label: nameOf('A') },
            { value: 'B', label: nameOf('B') },
          ]}
        />

        <Lbl>{nameOf(manualWinner)} elected to</Lbl>
        <Pick
          label="Elected to"
          value={manualDecision}
          onChange={setManualDecision}
          options={[
            { value: 'bat', label: 'BAT' },
            { value: 'bowl', label: 'BOWL' },
          ]}
        />

        {summary}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-12" onClick={() => setManual(false)}>
            ← Use the coin
          </Button>
          <Button id="btn-start-match" className="h-12 font-bold" onClick={startManual}>
            START MATCH →
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Coin */}
      <div className="flex justify-center pt-2 pb-1 [perspective:800px]">
        <div
          className={cn('coin', stage === 'flip' && 'coin--flipping')}
          style={{
            '--coin-end': `${result ? SPINS * 360 + (result === 'tails' ? 180 : 0) : 0}deg`,
          }}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) setStage('reveal')
          }}
        >
          <div className="coin-face border-primary bg-primary text-primary-foreground">
            <span className="font-display text-3xl leading-none font-extrabold">H</span>
            <span className="text-label uppercase opacity-75">Heads</span>
          </div>
          <div className="coin-face coin-face--back border-input bg-card text-foreground">
            <span className="font-display text-3xl leading-none font-extrabold">T</span>
            <span className="text-label text-muted-foreground uppercase">Tails</span>
          </div>
        </div>
      </div>

      <p
        aria-live="polite"
        className="text-label text-muted-foreground min-h-4 text-center uppercase"
      >
        {stage === 'call' && `${nameOf(caller)} to call`}
        {stage === 'flip' && 'Coin in the air…'}
        {(stage === 'reveal' || stage === 'done') && `It's ${result}`}
      </p>

      {/* Stage: call ─────────────────────────────────────────────────────── */}
      {stage === 'call' && (
        <div>
          <Lbl>who&apos;s calling</Lbl>
          <Pick
            label="Calling team"
            value={caller}
            onChange={setCaller}
            options={[
              { value: 'A', label: nameOf('A') },
              { value: 'B', label: nameOf('B') },
            ]}
          />

          <Lbl>their call</Lbl>
          <Pick
            label="The call"
            value={call}
            onChange={setCall}
            options={[
              { value: 'heads', label: 'HEADS' },
              { value: 'tails', label: 'TAILS' },
            ]}
          />

          <Button onClick={flip} className="mt-5 h-14 w-full text-base font-bold tracking-wide">
            <Coins /> FLIP THE COIN
          </Button>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-11" onClick={onBack}>
              ← Back
            </Button>
            <Button variant="ghost" className="text-muted-foreground h-11" onClick={() => setManual(true)}>
              We flipped our own →
            </Button>
          </div>
        </div>
      )}

      {/* Stage: flip ─────────────────────────────────────────────────────── */}
      {stage === 'flip' && (
        <p className="text-muted-foreground mt-5 text-center text-xs">
          {nameOf(caller)} called {call}
        </p>
      )}

      {/* Stage: reveal / done ────────────────────────────────────────────────
          Rendered under the reveal dialog too, so dismissing the dialog without
          choosing lands on a coherent screen rather than a blank one. */}
      {(stage === 'reveal' || stage === 'done') && (
        <div>
          <div className="border-border mt-4 border-t pt-3 text-center text-sm">
            <span className="text-foreground font-display font-bold">{nameOf(winner)}</span>
            <span className="text-muted-foreground"> won the toss</span>
            <div className="text-label text-muted-foreground mt-1 uppercase">
              {nameOf(caller)} called {call} · landed {result}
            </div>
          </div>

          <Lbl>{nameOf(winner)} elected to</Lbl>
          <Pick
            label="Elected to"
            value={decision}
            onChange={setDecision}
            options={[
              { value: 'bat', label: 'BAT' },
              { value: 'bowl', label: 'BOWL' },
            ]}
          />
          {!decision && (
            <p className="text-muted-foreground mt-2 text-xs">
              Pick one to start — {nameOf(winner)} chooses.
            </p>
          )}

          {summary}

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-12" onClick={onBack}>
              ← Back
            </Button>
            <Button
              id="btn-start-match"
              className="h-12 font-bold"
              disabled={!decision}
              onClick={start}
            >
              START MATCH →
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground mt-2 w-full"
            onClick={redo}
          >
            <RotateCcw /> Redo toss
          </Button>
        </div>
      )}

      {/* Reveal */}
      <Dialog
        open={stage === 'reveal'}
        onOpenChange={(open) => {
          if (!open) setStage('done')
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {nameOf(winner)} won the toss
            </DialogTitle>
            <DialogDescription>
              The coin landed <span className="text-foreground font-semibold">{result}</span>
              {' · '}
              {nameOf(caller)} called {call}.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Lbl>elect to</Lbl>
            <Pick
              label="Elected to"
              value={decision}
              onChange={(v) => {
                setDecision(v)
                setStage('done')
              }}
              options={[
                { value: 'bat', label: 'BAT' },
                { value: 'bowl', label: 'BOWL' },
              ]}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Two-up radio pair. min-h-12 keeps every target at the 48px thumb minimum. */
function Pick({ label, value, onChange, options }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-2">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'btn-t flex min-h-12 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium',
              active
                ? 'border-primary bg-secondary text-primary'
                : 'border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground bg-transparent',
            )}
          >
            <span aria-hidden="true">{active ? '●' : '○'}</span>
            <span className="truncate">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function Lbl({ children }) {
  return (
    <div className="text-label text-muted-foreground mt-4 mb-1.5 uppercase">▸ {children}</div>
  )
}
