# 7BIT — Handover v47

**Date:** 8 November 2026
**Read this first**, then v46. Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete said the app felt scattered and described how they actually train:

- **Weekday mornings**, not a morning person, coffee first: 15 minutes at
  most, balance, star reaches, foot precision, nothing that bends the stomach.
- **Two or three CAVE days a week**, never under an hour, leaving sore. Abs
  and obliques are a goal of their own (an eight-pack, visible obliques).
- **Two climbing days**, weekends on the rock when possible. After climbing,
  the opposite side: no climber's hunch, the chest open.
- **One suggestion a day**, with a switch for CAVE or climbing.
- A new exercise of their own: the **weighted hanging knee raise**, a
  dumbbell between the feet.

Answers to the questions asked: CAVE days keep the core every time and rotate
the rest; after climbing 25-35 minutes; WAKE UP weekdays, home, 15 minutes;
TODAY asks CAVE or CLIMB; the older sessions stay in TRAIN only; CAVE's pull
day stays while the finger heals, labelled, with ab straps for hanging core;
weekend climbs count as climb days.

Said to the athlete along the way: the knee raise trains the abs only when
the pelvis curls at the top (otherwise hip flexors), and it is not a toe-hook
exercise; the hunch is fixed by the upper back and the chest stretched more
than by pushing; soreness is not the measure; visible abs are mostly body
fat; 5-6 training days with a finger at 33% needs real rest days.

## 2. What changed

### New sessions (`src/core/data-week.ts`, in the DAILY and CAVE tabs)

| Session | Contents | Minutes (L1 NORMAL) |
|---|---|---|
| DAILY 08 WAKE UP FEET | ankle rock, step-down to a mark, shift-lift-place, star reach, single-leg balance, lunge drive | 13 at every energy |
| DAILY 09 WAKE UP FLAGS | 90/90, lateral reach + shift, flag hold, high-knee hold, hip airplane, star reach, lunge drive | 11-12 |
| CAVE 06 CORE + PULL | warm-up, single-leg balance, weighted pull-ups, lock-off ladder, front lever, DB row, floor pullover, cuff; core: weighted knee raise, hollow, Russian twist (3), side plank dip | 67 |
| CAVE 07 CORE + LEGS | warm-up, lunge drive, star reach, DB RDL, Nordic, split squat forward shift, step-up, calf raise, good morning; core: weighted knee raise, Pallof, Copenhagen, lying leg raise | 62-66 |
| CAVE 08 CORE + PUSH | warm-up, lunge drive, box jump, ring push-up, pike push-up, DB press, reverse fly, bent-over Y-T-W, cuff; core: weighted knee raise, hanging oblique, Russian twist (3), side plank dip, hollow | 65 |
| CAVE 09 STRAIGHT BACK | lunge drive, band face pull, pull-apart, bent-over Y-T-W, reverse fly, cuff, push-ups / dips, wall angel, doorway chest stretch | 27-28 |

TIRED runs 48-54 minutes on the CAVE days (one set less, by the app's TIRED
rule); FRESH 81-85.

### New exercises (`data-extras.ts`, tagged, in the reserve)

- **Weighted Hanging Knee Raise** (`extra-weighted-knee-raise`): `hangs`, gym,
  grip, a curl; `added-kg` from 2 kg; the card says curl the pelvis and use
  ab straps while a finger heals. Leads every CAVE core block.
- **Doorway Chest Stretch** (`extra-doorway-pec`): MOBILITY, per side.

### TODAY

- **TODAY IS: CAVE / CLIMB / REST** (`DayKindSwitch`), stored as
  `DayPlan.kind` for the day; REST is the existing REST DAY; a second tap
  clears. What was said today wins over the weekly plan (`use-today`).
- The recommender (`recommend.ts`), in order: pain 6+, no kit, the HEAL block
  (unchanged); climbed today: STRAIGHT BACK; weekday before 12: WAKE UP
  (alternating); CLIMB: STRAIGHT BACK; CAVE: the CAVE day done longest ago,
  CORE + LEGS within two days of a climb (`nextCaveDay`); nothing said:
  `restDue` (three days in a row with a climb or a non-DAILY session) gives
  no pick and "Rest today."; ASSESS when due; else the next CAVE day with
  "CAVE or CLIMB today?".
- ALSO FITS offers only the week's sessions (and ASSESS when due).
- ON THE WALL counts a CLIMB day as a climbing day.
- STRONG, the season's training day and the DAILY rotation are no longer
  suggested; the sessions themselves are unchanged in TRAIN.

### Checks and tests

- `check:cave`: CAVE 06-08 between 60 and 75 minutes NORMAL at every level,
  09 between 25 and 35. `check:daily`: WAKE UP 15 at most.
- New `week.test.ts` (5). Rewritten for the new rules: `activity`,
  `also-fits`, `cave-training`, `phase3`, `today`; the season training-day
  test in `wall` removed; `exercise-tags` knows the knee raise is on the bar.
- New smoke test: TODAY asks CAVE, CLIMB or REST and the pick follows.

## 3. Verified

- `npx tsc --noEmit`
- `npm test`: 407 passing
- `npm run check:daily`, `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 14 passing
- A screenshot of TODAY at 390 px: the switch, then the pick.

## 4. Repo state

Branch `claude/v47-week-structure` from `main` at `f9f69f5`, pushed. The
cloud session has no GitHub login, so **the PR is not opened or merged**:
open it from
https://github.com/Manfredi-23/CircuitTraining/pull/new/claude/v47-week-structure
and merge it, then run the Mac clean update.

## 5. Open items

- **TIRED on a CAVE day is about 50 minutes**, not 60: TIRED takes a set off
  every working exercise by design. Pick NORMAL to get the full hour.
- **The weighted knee raise starts at 2 kg** on the stepper; set your own.
- **Ring rehab** is still not suggested outside the HEAL block: run HEAL 03
  every second day until 80%.
- The weekly plan still exists; the switch wins on the day it is used.
- The season (BASE / STRENGTH / POWER) no longer picks a session. It still
  names the phase on TODAY and drives ON THE WALL.
- Carried: STRONG BACK at home while healing is short; ASSESS keeps the prone
  extension hold.

## 6. Next steps

- A week of use, then COPY FOR COACH and a look at whether the rotation and
  the core block feel right.
- After the finger clears 80%: decide where STRONG (max hangs) comes back.

## 7. Mac clean update

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
grep -rl "WAKE UP FEET" out/_next/static | head -1
npx cap sync ios
grep -rl "WAKE UP FEET" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v47 PR (the week structure).
- `npm test` shows 407 passing.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. TODAY opens with TODAY IS CAVE / CLIMB / REST.

## 8. Mac housekeeping (after the merge only)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/v47-week-structure
git fetch origin --prune
git branch -a
```

`git branch -a` should list only `main` and `remotes/origin/main`.
