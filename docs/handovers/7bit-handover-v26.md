# 7BIT — Handover v26

**Date:** 19 October 2026
**Read this first**, then v25 (BUILD presets and goals).
Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete shared "Climbing-Specific Off-Wall Training" (an analysis of the
18 October backup with a four-week plan: Rockover Engine, Quiet Feet, Hips +
Control, four lower-body benchmarks) and asked what was worth taking over.

Assessment: its main point holds. The app trains leg strength but has no
practice for placing a foot once and moving the weight over it, except HEAL
05 on the gym walls. One correction to the document: it read the `contact`
capacity as foot contact; it is contact strength, a finger quality.

Chosen by the athlete: DAILY 06 QUIET FEET, and ROCKOVER ENGINE and HIPS +
CONTROL as BUILD presets; the footwork and balance drills earn `legs` +
`tension` XP. Not taken now: the four movement-quality tests (TEST 02 FEET)
and a technique note on the complete screen; both stay in the open items.
Not adopted: the document's five-session week (the work fits into DAILY and
BUILD instead) and dropping goblet squats, Nordics and Copenhagen planks
(only sensible while the hand heals, which HEAL already covers).

## 2. What changed

- **DAILY 06 QUIET FEET** (mat only, hands free, 16 min, TIRED 13):
  knee-to-wall ankle rock, short foot + toe control, precision toe taps on
  tape marks, single-leg star reach, slow rock-over transfer, standing flag
  hold. The four drills are `fixed` TECHNIQUE work earning `legs` + `tension`.
  `legHeavy: true` keeps it off the recommendation while legs are sore from a
  descent (new optional `Circuit.legHeavy`, read by `isLegHeavy`).
- **BUILD goals** ROCKOVER and HIPS, and presets **ROCKOVER ENGINE** (home,
  30 min: step-up + slow lower, split squat with forward shift, single-leg
  RDL, calf raise, glute bridge) and **HIPS + CONTROL** (home, 15 min: 90/90,
  Cossack, high-knee hold, knee-to-wall ankle, side-lying abduction, dead bug
  hands on chest). Sore legs close ROCKOVER. The preset times are what the
  app's estimate gives (it does not count changeovers); the document's 35-40
  and 20-25 minutes include a warm-up and transitions.
- New exercises: five in `data-daily.ts` (DAILY 06), five in
  `data-extras.ts`; the BALANCE goal's single-leg balance and star reach now
  earn `legs` + `tension`. New protocols `floor-footwork` and
  `rockover-strength`, with the document's sources. The step-up, split
  squat, side-lying abduction, ankle rock and high-knee hold are also in the
  reserve (LEGS, MOBILITY).
- Tests: DAILY 06 in `daily.test.ts`, the new presets in `custom.test.ts`,
  `isLegHeavy` in `activity.test.ts`.

## 3. Verified

`npx tsc --noEmit`, `npm test` (174 passing), `npm run check:daily` (06 at
16 min NORMAL and FRESH, 13 TIRED, all exercises kept), `npm run check:cave`,
`npm run build`. In the browser at 390 x 844: DAILY 06 card on the DAILY tab;
ROCKOVER ENGINE preset starts "DAILY [ROCKOVER ENGINE]"; no console errors.
Screenshot: `docs/screenshots/daily-06-quiet-feet.png`.

## 4. Repo state

v25 went in as **PR #41**: PR #40 was closed unmerged when its branch was
deleted before the merge (the housekeeping block was handed over too early).
Same commit. This session: branch `claude/quiet-feet`, PR to `main`.
Housekeeping commands are only to be run after the merge is confirmed.

## 5. Open items

1. **TEST 02 FEET**, from the document: single-leg balance (s per side), clean
   toe taps out of 10 per foot, controlled step-downs per side, highest smooth
   step in cm; retest every 4 weeks; a feet section in STATS.
2. **Technique note**: one optional line on the complete screen, kept with the
   session ("right knee collapses on the step-down").
3. Carried from v25: goal exercises without XP do not move the suggestion; a
   saved preset cannot be renamed; suggestion thresholds a first guess; Apple
   Health hikes not imported; the on-device language model.

## 6. Mac clean update

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git stash push -u -m "mac-local-$(date +%Y%m%d-%H%M)"
git checkout main
git fetch origin --prune
git pull --ff-only origin main
git log -1 --oneline
git branch --merged main | grep -v -E '^\*|^ +main$' | while read b; do git branch -d "$b"; done
rm -rf out .next ios/App/App/public
npm ci
npx tsc --noEmit
npm test
npm run check:daily
npm run check:cave
npm run build
grep -rl "QUIET FEET" out/_next/static | head -1
npx cap sync ios
grep -rl "QUIET FEET" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the quiet feet PR.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. The DAILY tab has 06 QUIET FEET; BUILD
  has ROCKOVER and HIPS goals and the two new presets.

## 7. Mac housekeeping (after the merge only)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/build-presets
git push origin --delete claude/quiet-feet
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`
(skip a delete line that says the branch does not exist).
