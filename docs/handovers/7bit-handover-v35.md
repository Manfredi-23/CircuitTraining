# 7BIT — Handover v35

**Date:** 26 October 2026
**Read this first**, then v34 (balance and power at full stretch). Working
agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete asked, looking at the CAVE 05 session page: "I'd like to be able
to swap or change some exercises as well as add when about to begin a
session... maybe also cool to have some presets to exercise to add as well as
individually edit every one."

Their answers to the questions asked first:
- An edit holds for today, with an option to keep it.
- SWAP lists exercises for the same area first, then the whole library.
- Built-in packs, offered mid-session too. No saving their own packs for now.
- Per exercise: sets, reps / seconds, order, target load, and similar
  exercises to swap to.

## 2. What changed

- **EDIT on the session page** (`SessionInfo` gets an EDIT button; the editor
  is `SessionEditor`, opened by `use-launcher`). Per exercise:
  - SWAP;
  - remove;
  - up / down;
  - sets -/+ (1-8) and reps or seconds -/+ (half to double);
  - LOAD -/+ (the load planned for today).

  Fixed protocols, tests and warm-ups keep their sets and work. Rest is
  never on the screen. The numbers shown are the ones that run at today's
  energy.
- **SWAP lists SIMILAR first** (`similarTo`): the stand-in the exercise
  already has, then the same area and main capacity, protocol, block and load
  kind. EVERYTHING follows. `ExercisePicker` gained `similar` and `allow`.
- **+ EXERCISE and + PACK.** Additions go where they belong (`addIds` reuses
  `insertIndex`, now typed on any `{ id, block }` list): heavy first, a
  closing mobility last, curls closing a DAILY.
- **Seven packs** (`PACKS` in `session-edit.ts`), each with a home and a gym
  version:
  - CORE FINISHER
  - ARMS (no XP)
  - SHOULDER CARE
  - MOBILITY 10
  - BALANCE + POWER
  - LEGS
  - FINGERS LIGHT (closed while a finger heals or after finger pain 3+)

  PACKS is also the first tab of + ADD EXERCISE during a workout
  (`addExtras`).
- **Today only, or kept.** Every change is saved as it is made in
  `sessionEdits` (persisted, backed up, by circuit id) with the day. KEEP FOR
  NEXT TIME keeps it until RESET; RESET is on the editor and on the session
  page, which says EDITED FOR TODAY or YOUR VERSION, KEPT.
- **The session stays itself.** The edit keeps the circuit id, so the
  session is still logged as CAVE 05, and recovery and the recommender treat
  it as CAVE 05. `circuitFor` / `sessionListFor` apply it, so the page,
  TRAIN's minutes, the pain check and the workout agree. Energy switches
  mid-session rebuild from the edited session.
- **Target load:** `Exercise.targetLoad`, set from the edit; `primeLoad`
  opens the stepper on it instead of last time's value.
- **Safety** (`allowedToday`) for swaps, additions and packs:
  - home kit at home, and NO KIT keeps it on the mat;
  - no tests;
  - while a finger heals: nothing gripped, pulled or hung, and no finger work;
  - no finger work after pain 3+.

  Gates still substitute when the session runs.
- **MAKE IT MINE** copies the edited list, with its sets and reps.
- Routines have no EDIT button: they already have EDIT ROUTINE.

## 3. Verified

All of these passed:
- `npx tsc --noEmit`
- `npm test`: 280 passing. The new `session-edit.test.ts` has 12 tests.
- `npm run check:daily`: longest 20 min.
- `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 8 passing. The new EDIT test opens CAVE 05, removes the
  box jump, swaps from SIMILAR, adds a pack, keeps the edit, checks 13
  exercises, then RESET back to 12.

## 4. Repo state

Branch `claude/zealous-dijkstra-n51wbg`, from `main` at the v34 merge
(`f5658f1`), with one PR to `main`.

## 5. Open items

- No packs of the athlete's own yet (they chose built-in only). The shape
  (`Pack`) is ready for a persisted list next to `PACKS`.
- An edit kept on a session is not shown on TODAY's card beyond the minutes.
  The session page says it.
- Carried from v34:
  - CAVE 01 STRONG runs 84 min at NORMAL at levels 6-7;
  - HEAL 01 is at 89 of 90 at FRESH;
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
git branch --merged main | grep -v -E '^\*|^ +main$' | while read b; do git branch -d "$b"; done
rm -rf out .next ios/App/App/public
npm ci
npx tsc --noEmit
npm test
npm run check:daily
npm run check:cave
npm run build
grep -rl "KEEP FOR NEXT TIME" out/_next/static | head -1
npx cap sync ios
grep -rl "KEEP FOR NEXT TIME" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v35 PR.
- Both `grep` lines print a file name.
- In Xcode, press Shift+Cmd+K, then Cmd+R. Open any CAVE session in TRAIN:
  EDIT sits next to the minutes.

## 7. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/zealous-dijkstra-n51wbg
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`.
