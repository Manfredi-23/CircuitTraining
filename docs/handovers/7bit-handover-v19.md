# 7BIT — Handover v19

**Date:** 7 October 2026
**Read this first**, then v18 (DAILY 05) and v17. Working agreements
unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete hurt a finger (cause unknown): no climbing for a while, and no
pulling for the next couple of weeks. They asked for a new home-screen tab with
two gym sessions, 45-90 minutes each, that keep them fit, strengthen the core,
build some muscle and stay useful for climbing.

Answers to the questions asked first:
- Gym: the bouldering gym's training area. One barbell, no machines.
- No pulling at all, no machines.
- Tab name: **HEAL**.

## 2. What changed

- **HEAL tab** (`src/core/data-heal.ts`, `Mode` gains `'HEAL'`).
  The rule every exercise obeys: the hands only rest on things or press flat.
  Nothing gripped, nothing pulled.
- **HEAL 01 LEGS + TRUNK** (`heal-01`), 67 min NORMAL at L1 (55 TIRED, 84 FRESH):
  warm-up (bike / step-ups, hands open) - box jump 4x3 - barbell back squat
  4x5 PRIMARY, RPE 7-8, 180s - barbell hip thrust 3x8 - rear-foot-elevated
  split squat 3x8/leg (plate hugged) - 45-degree back extension - Copenhagen
  plank - TRX body saw on the forearms - plate crunch - toe-tip plate drag -
  frogger - tendon glides.
- **HEAL 02 PUSH + HINGE** (`heal-02`), 59 min NORMAL at L1 (49 TIRED, 72 FRESH):
  warm-up - barbell good morning 4x6 PRIMARY - weighted push-up 4x6 PRIMARY
  (flat palms, plates in a pack) - half-kneeling landmine press 3x8/arm
  (bar end in an open palm) - incline prone Y-T-W - band external rotation
  with the band round the wrist - landmine rotation (palms flat) - side plank
  hip dip - reverse crunch - cobra + open book - tendon glides.
- Shared exercises are the same objects as in CAVE 03 and DAILY (back
  extension, Copenhagen, plate crunch, toe drag, frogger, side plank dip,
  reverse crunch, cobra + open book), so levels and load history carry over.
- Two protocols in `protocols.ts`: `train-around` (training around a finger
  injury, tendon glides) and `heal-strength` (barbell leg and hinge strength),
  with sources.
- **Recommender:** a HEAL session in the last 10 days and no climb logged since
  means "healing": HEAL every other day, a DAILY without finger work between
  (DAILY 04's edge no-hangs never come up). Logging a climb ends it.
- STATS: HEAL counts as a CAVE-type day in the week strip and training load;
  body saw, landmine rotation, good morning and hip thrust count in core volume.
- The `added-kg` stepper now goes to 200 kg so a loaded barbell fits; barbell
  lifts are logged as the total on the bar.
- New test `src/core/__tests__/heal.test.ts`.

## 2b. Revised after the athlete read the exercise list

The barbell is for the squat only, there are no TRX foot cradles and no
adjustable bench, and some exercises were simply not liked. Swapped:

| Was | Now | Why |
|-----|-----|-----|
| Barbell hip thrust (01) | Box step-up, plate hugged | disliked; the high step loaded |
| TRX body saw (01) | Hollow body hold (`morn-hollow`) | no TRX cradles |
| Barbell good morning (02) | Nordic hamstring curl, PRIMARY 3x5 | barbell for squats only; heel-hook hamstrings |
| Landmine press (02) | Pike push-up, flat palms | no landmine |
| Incline prone Y-T-W (02) | Prone Y-T-W on the floor | no bench |
| Landmine rotation (02) | Russian twist, plate hugged (`addon-russian-twist`) | no landmine |
| Reverse crunch (02) | Lying leg raise (`morn-leg-lowers`) | disliked |
| (new, 02) | Single-leg calf raise on the box edge | keeps 02 at 45+ min TIRED |

The split squat's back foot and the Copenhagen plank's top leg go on the box.
Retired ids `morn-hollow` and `morn-leg-lowers` are reused so their old history
and STATS core-volume counting carry on. Durations now: 01 66-73 min NORMAL
(55-62 TIRED, 84-87 FRESH); 02 61-71 NORMAL (49-61 TIRED, 77-84 FRESH).

## 3. Verified

`npx tsc --noEmit`, `npm test` (86 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`. The HEAL tab and the first workout card
render at 390 x 844.

## 4. Repo state

HEAL merged in PR #29. A second PR from the same branch tidied the repo:

- Handovers v9-v19 moved to `docs/handovers/`, the roadmap to
  `docs/7bit-roadmap.md`. `CLAUDE.md` and `README.md` point there.
- The 15 review screenshots that sat in the repo root moved to
  `docs/screenshots/`; root `*.png` is now git-ignored so new ones do not
  land there.
- `backup.json` (a test export) is now `docs/sample-backup.json`.
- The exercise swaps in 2b went through a third PR from the same branch.
- GitHub: `main` is the only branch once the merged branch is deleted, no open PRs. `CLAUDE.md` now says so as
  a rule: every session branches from the latest `main`, merged branches are
  deleted.

## 5. Open items

1. **See a hand therapist or physio** if the finger is not clearly better in
   one to two weeks, or if there was a pop, swelling or bowstringing. The app
   does not rehab the finger; loading it back up (and when to retire HEAL) is
   their call.
2. Barbell lifts show the stepper label ADDED although they log the total on
   the bar. A `barbell` load kind with its own label would be cleaner.
3. The squat and good morning cards use existing illustrations
   (`squats.svg`, `pushups.svg`); dedicated ones belong to the graphics rework.
4. Optional later: cross-education (training the healthy hand's grip keeps
   some strength in the injured one). Left out because it would bring finger
   capacities and the pain check into HEAL.
5. Everything open in v18 section 5 still stands.

## 6. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

```bash
git checkout main
git pull
git branch -d claude/upbeat-archimedes-is1y1e 2>/dev/null
git push origin --delete claude/upbeat-archimedes-is1y1e 2>/dev/null
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
