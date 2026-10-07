# 7BIT — Handover v15

**Date:** 4 October 2026
**Read this first.** Then v14 (STATS, test history) and v12 (athlete, programme,
climb log, graphics plan). This document supersedes earlier repo state and
open items. Working agreements unchanged (`CLAUDE.md`).

---

## 1. Why ASSESS was rebuilt

The athlete pointed out that the max hang test read like a circuit (4 x 10s,
3 min off). It was: tests were modelled as training sets. Research done this
session (IRCRA test battery, Lattice protocols, 2024 and 2025 systematic
reviews of climbing testing, NSCA test administration, McGill torso endurance)
found five problems:

1. **Sets instead of ramps.** A strength test is a ramp: each attempt harder
   than the last until one fails; the score is the best clean attempt (Lattice:
   4-8 hangs of 7s, 2 min apart; NSCA: warm-up sets then up to 3-5 attempts,
   3-5 min apart).
2. **Wrong pull-up comparison.** Lattice's 165% is a 2-rep max (733 tests); the
   app compared a 5RM-estimated 1RM against it, flattering the result.
3. **Order.** NSCA: non-fatiguing tests first (body, range), then maximal
   strength, then endurance. Mobility had been placed last.
4. **Non-standard trunk tests.** McGill's four (flexor, extensor, left and right
   side bridge) have norms and diagnostic ratios; the hollow hold and a
   weaker-side-only side plank did not.
5. **No explicit warm-up section**, and the first test is a familiarisation
   baseline (scores rise on retest).

Finger strength explains about two thirds of the variance in climbing grade and
intermittent finger endurance most of the rest, so the battery spends its fresh
time there.

## 2. The new TEST 01 ASSESS (~81 min NORMAL, 18 cards)

| Section | Tests |
|---------|-------|
| WARM-UP (15 min, identical every time) | pulse raiser + mobility, scapular pulls + easy pull-ups, progressive finger loading |
| BODY + RANGE | bodyweight, foot raise, straddle, sit and reach, overhead reach |
| MAX STRENGTH (ramps) | max hang 20mm 7s (up to 8 attempts, 2 min), weighted pull-up 2RM (up to 6, 3 min), front lever progression (up to 5, 2 min) |
| ENDURANCE | max strict pull-ups, 7:3 repeaters to failure on 20mm, max push-ups |
| TRUNK (McGill four) | flexor hold, back extension hold, side plank left, side plank right |

Dropped (agreed): one-arm block pull, 90-degree lock-off, hollow hold, hanging
leg raises. Power test (powerslap) declined. Their benchmarks stay in
`BENCHMARKS` so old results still show.

## 3. How ramps work

- `Exercise.ramp = { maxAttempts, startBelow }`; `sets` is the expected number
  of attempts (for the duration estimate).
- The card reads `SECTION - ATTEMPT n OF UP TO m` and `BEST CLEAN SO FAR: x`.
- Buttons: **MADE IT** (records the attempt as clean, rests, next attempt),
  **FAILED** (ends the test on the best clean attempt), plus SKIP TEST and
  STOP HERE, SAVE x.
- The best clean attempt is saved as the benchmark (`finishExercise`). With no
  clean attempt nothing is saved.
- The stepper opens `startBelow` under the last result (8kg for hangs and pulls,
  one progression for the lever), at zero added the first time. The max hang
  axis now goes negative for a counterweight.
- Store: `rampBest`, `attemptMade`, `attemptFailed`, `finishRamp`,
  `finishExercise` in `workout-slice.ts`.

## 4. Benchmarks and gates

- New: `weighted-pullup-2rm` (standards 120 / 140 / Lattice 165),
  `trunk-flexor-hold` (McGill ~144s), `side-plank-left`, `side-plank-right`.
- `weighted-pullup` renamed "est. 1RM (old method)", standards removed.
- One-arm gates moved to the 2RM scale: assisted **131%**, negatives **141%**
  (140 / 150 one-rep divided by 1.067, Epley). `gateResult` reads the 2RM, or
  an old-method result converted, so earlier recordings still open gates.
  `check:cave` now proves an old 142% opens assisted and not negatives.
- `fs-2arm-20mm` protocol text now matches the 7s Lattice ramp.

## 5. STATS

- Test rows ordered as the session runs; retired tests last.
- **Trunk balance (McGill ratios)** under the tests: flexor/back < 1.00, each
  side/back < 0.75, left/right 0.95-1.05; out-of-range values in accent.

## 6. Verified

`npx tsc --noEmit`, `npm run build`, `check:daily` PASS, `check:cave` OK
(including the old-method case). In Chromium: bodyweight 63; max hang +5 made,
+10 made, +14 failed -> saved 116%; pull-up 2RM +10, +15 made, STOP HERE ->
124%; front lever opened on attempt 1 at level 1; session info lists the five
sections; ratios render.

## 7. Repo state

Merged this session: "Rebuild ASSESS from the research". Merged branches still
on GitHub (proxy refuses deletion): `claude/assess-tab-drop-power`,
`claude/climb-log`, `claude/dot-matrix-illustrations`, `claude/programme-v12`,
`claude/handover-v12`, `claude/session-info-popup`, `claude/assess-stats`,
`claude/assess-v2`. Stale unmerged: `claude/exercise-form-guide-pdf-kzrz1x`.

## 8. Open items

1. **Rest between tests.** IRCRA uses 5 minutes between tests; the app rests
   for the next test's own interval (2-5 min). SKIP REST shortens, nothing
   lengthens it yet.
2. **First ASSESS is a baseline.** Retest after 6-8 weeks before reading trends.
3. Direct result entry in STATS still not built (not asked for).
4. DAILY 04 raises the finger caution banner on CAVE 01 (warning only).
5. Graphics rework (v12 section 6) waiting on the logo and frames.
6. Still planned: Vitest, Supabase, Vercel production.

## 9. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

```bash
git checkout main
git pull
npm install
npx tsc --noEmit
npm run check:daily
npm run check:cave
npm run build
npx cap sync ios
npx cap open ios          # Xcode: scheme App, Cmd+R
npm run dev               # or the browser, http://localhost:3000
```
