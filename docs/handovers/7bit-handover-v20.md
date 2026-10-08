# 7BIT — Handover v20

**Date:** 8 October 2026
**Read this first**, then v19 (the HEAL tab) and v18. Working agreements
unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete saw a physiotherapist about the left ring finger. The physio could
not tell a ruptured or strained tendon from a hand-muscle (lumbrical) injury,
and prescribed:

1. First find out what the **right** ring finger can lift.
2. Then the **left** ring finger alone, other fingers closed in a fist: lift a
   portable edge with weights hung from it, **3 sets of 12**, 60-90 s rest,
   **every second day**, starting very light (1.5-2 kg) and adding kilos.
3. At **80% of the right** it is good to go.

They asked for this in the HEAL tab, with the right-side benchmark and a way
to log the extra kilos.

## 2. What changed

- **HEAL 03 RING REHAB** (`heal-03`, ~13 min): warm hands + tendon glides,
  then `heal-ring-left` 3 x 12 at 90 s, `fixed` (no level or energy scaling),
  then tendon glides.
- **HEAL 04 RING TEST** (`heal-04`, ~20 min): warm-up, then
  `test-ring-right`, a ramp of 3-6 attempts of 12 reps, 3 min apart, each
  0.5-1 kg heavier, MADE IT / FAILED. The best clean 12 is saved as the new
  benchmark `ring-finger-right` (kg, no published standards).
- **New load kind `finger-kg`** (`load.ts` `FINGER_KG_AXIS`): kilos on the
  edge, edge included, 0.5 kg steps from 0.5 to 30. The stepper opens on last
  session's load (2 kg the first time) and suggests +0.5 kg after a clean
  3 x 12.
- **`Exercise.comparesTo`**: the stepper shows the load as a % of a benchmark,
  e.g. `= 31% of right · goal 80% (5.5KG)`. The goal kilos are 80% of the
  right rounded up to the half kilo.
- **`src/core/rehab.ts`** (new, tested in `rehab.test.ts`): `getRingRecovery`
  reads the left load log against the right results (each left session
  against the right as it stood that day), `goalKg`, `percentOf`,
  `RING_GOAL_PCT = 80`, `REHAB_BENCHMARKS`.
- **STATS: RING FINGER section**, shown once there is a right test or a left
  session: left as % of right with the 80% mark, the latest right and left,
  the goal in kilos.
- **Recommender** while healing: a gym HEAL first when it is due, then the
  RING TEST if the right was never tested, otherwise RING REHAB when 2+ days
  have passed since the last one, otherwise a finger-free DAILY.
- **Pain:** 03 and 04 carry `forearm`, so they open with the 0-10 pain check;
  6+ removes the finger work. New rule in `progression.ts`: any suggested load
  holds after a session that started with pain 3+.
- `lastAssess` ignores rehab benchmarks, so recording the right does not
  postpone ASSESS. A ramp test with no history now opens on its `load.value`
  instead of zero.
- `protocols.ts`: new `ring-rehab` protocol with the physio's rules and
  background sources.

### Choices made without asking (easy to change)

- The right is tested as **the heaviest load for 12 clean reps**, the same
  rep count the left trains at, so the two compare like for like and the
  healthy finger is never maxed out on a single rep. If the physio meant a
  single maximal lift, change `test-ring-right` (`work`, `note`, form text).
- The left's percentage uses its 3 x 12 working load, not a max, so it
  understates the left slightly: the conservative side.
- Rehab XP goes to `forearm`, not `crimp`, so hangboard levels are not moved
  by rehab work.
- Pain rule: up to 2/10 during and the next morning is fine, 3+ holds the load.
  The physio's own numbers win if they differ.

## 3. Verified

`npx tsc --noEmit`, `npm test` (102 passing, 16 new), `npm run check:daily`,
`npm run check:cave`, `npm run build`. In the browser at 390 x 844: the home
screen recommends RING REHAB after a gym HEAL day, the pain check opens, the
stepper reads `2KG = 31% of right · goal 80% (5.5KG)` against a 6.5 kg right,
and STATS shows the RING FINGER section.

## 4. Repo state

Branch `claude/heal-ring-finger-rehab`, merged to `main` via PR and deleted.
`main` is the only branch, no open PRs.

## 5. Open items

1. **Confirm with the physio** how the right is tested (12-rep load vs a
   single max) and the pain limit; both are one-line changes.
2. When the left reaches 80%, the app says so (the stepper readout and the
   STATS hint), but returning to climbing is the physio's call.
   Retire HEAL by logging a climb.
3. The ring cards reuse `hangboard.svg`; a dedicated one-finger edge
   illustration belongs to the graphics rework.
4. Everything open in v19 section 5 still stands (barbell stepper label,
   illustrations, cross-education).

## 6. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

```bash
git checkout main
git pull
git branch -d claude/heal-ring-finger-rehab 2>/dev/null
npm install
npx tsc --noEmit
npm test
npm run check:daily
npm run check:cave
npm run build
npx cap sync ios
npx cap open ios          # Xcode: scheme App, Cmd+R
npm run dev               # or the browser, http://localhost:3000
```
