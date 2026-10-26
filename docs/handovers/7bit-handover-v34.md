# 7BIT — Handover v34

**Date:** 26 October 2026
**Read this first**, then v33 (CAVE 04 and 05, finger readiness, the UI
pass). Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete asked for this after v33: "Add balance and power generating while
in a stretch to all (obviously with different proportions)."

Every training session now carries a dose of both qualities, sized to its
length.

## 2. What changed

- **`LUNGE_DRIVE`** (`extra-lunge-drive`, `data-extras.ts`) is the common
  dose: a fixed MOBILITY drill, 5 reps per leg.
  - Sink into the deep lunge for three seconds, drive up onto the front leg,
    stick for two seconds.
  - It counts for both balance and power at full stretch.
  - Variations by level: a 2s pause at L3, a hop stick at L5.
- **New field `Exercise.alsoTrains`** (`Quality`: `balance` | `stretch`).
- **New module `qualities.ts`.** It decides what counts:
  - balance: the `balance`, `footwork` and `floor-footwork` protocols;
  - power at full stretch: the `end-range-strength` protocol;
  - or `alsoTrains` on the exercise.
- **`COSSACK`** is now a shared constant in `data-cave.ts`.
- **DAILY 02 lost the standing band chop (`morn-chop`).** With the lunge
  drive added it ran 21 minutes at FRESH, one over the limit, and the rule is
  to cut an exercise, never a rest. The obliques still get the side plank dip
  and the Russian twist. Old logs keep the chop's history.

| Session | Added | Longest (T / N / F) |
|---|---|---|
| DAILY 01-06 | 1 set lunge drive (before the curls; before the edge in 04) | 01 20, 02 19, 03 20, 04 16, 05 19, 06 17 at FRESH |
| CAVE 01 STRONG | 2 sets lunge drive, before the cuff | 77 / 84 / 93 |
| CAVE 02 PULL + PUSH | 1 set, before the cuff | 30 / 41 / 54 |
| CAVE 03 LEGS + BACK | Goblet Cossack 2 x 6, single-leg balance 2 x 30s | 24 / 36 / 50 |
| CAVE 04 / 05 | already had their own (v33) | unchanged |
| HEAL 01 / 02 | 2 sets lunge drive, before the closing mobility | 01: 64 / 74 / 89, 02: 62 / 72 / 85 |
| HEAL 05 FOOTWORK | 1 set, last | 29 |

Left as they were (`QUALITY_EXEMPT`):
- TEST 01 ASSESS: extra work before or between tests would move the scores.
- HEAL 03 RING REHAB and 04 RING TEST: the physio's plan.

## 3. Verified

All of these passed:
- `npx tsc --noEmit`
- `npm test`: 268 passing. The new `qualities.test.ts` checks every
  non-exempt session for both qualities, including on a TIRED day.
- `npm run check:daily`: longest 20 min.
- `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 7 passing.
- `heal.test.ts`: still 45-90 min at every level and energy, with HEAL 01 at
  89 at FRESH.

## 4. Repo state

Branch `claude/relaxed-cori-q5513z`, restarted from `main` at the v33 merge
(`ccbbc04`), with one PR to `main`.

## 5. Open items

- CAVE 01 STRONG now runs 84 min at NORMAL at levels 6-7. It was 83 before
  this change, and is well over the 75 in its note. If that is too long on the
  day, NORMAL to TIRED or the TODAY time cap cuts it.
- HEAL 01 is at 89 of 90 at FRESH: nothing more fits there without a cut.
- Carried from v33:
  - the press scale and the sticky START on the phone;
  - `make-seed.ts` has no CAVE 04 or 05 sessions;
  - FINGER LOAD and RING FINGER have no headlines;
  - undoing FINISH NOW leaves a Health workout behind;
  - reminders do not read the weekly plan.

## 6. Mac clean update

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git stash push -u -m "mac-local-$(date +%Y%m%d-%H%M)"
git checkout main
git fetch origin --prune
git pull --ff-only origin main
git log -1 --oneline
git status -sb
git branch --merged main | grep -v -E '^\*|^ +main$' | while read b; do git branch -d "$b"; done
rm -rf out .next ios/App/App/public
npm ci
npx tsc --noEmit
npm test
npm run check:daily
npm run check:cave
npm run build
grep -rl "Deep Lunge Drive" out/_next/static | head -1
npx cap sync ios
grep -rl "Deep Lunge Drive" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v34 PR.
- `git status -sb` shows `## main...origin/main`.
- Both `grep` lines print a file name.
- In Xcode, press Shift+Cmd+K, then Cmd+R. Open any DAILY in TRAIN: it lists
  Deep Lunge Drive + Stick.

## 7. Mac housekeeping (only after the merge, never before)

Deleting the branch before the merge closes the PR. That is what happened
to PR #50.

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/relaxed-cori-q5513z
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`.
