# 7BIT — Handover v43

**Date:** 1 November 2026
**Read this first**, then `docs/7bit-proposal-v42.md` (what was asked and the
research behind it) and v42. Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete answered the six questions of the v42 proposal and asked for
**all of it in one go**:

1. Home kit: a chair, maybe a sofa. So DAILY 07 uses a chair against a wall,
   and the toe-hook sit-back (radiator or sofa) stays at the gym.
2. BODY THIS WEEK shows **every area** (the answer was "yes"; read as the first
   option, with DUE and TOO MUCH underlined so they still stand out).
3. Choice slots **pick by default**, changeable.
4. Skill work **moves to the start** of CAVE and HEAL sessions.
5. TEST 02 FEET is **a section of ASSESS**.
6. Everything at once.

## 2. What changed

### Knowing where you are (before choosing)

- **BODY THIS WEEK** on TODAY, under the week rail (`body-week.ts`,
  `BodyWeek.tsx`): eight areas, sets this week against a band, a word for
  each (DUE / ON TRACK / ENOUGH / TOO MUCH / RECOVERING / HEALING). The area
  today's pick serves is orange. A row opens **TRAIN THIS**: the sessions and
  routines that train it, minutes and readiness beside each, and its packs.
  Under the rows, when the climb log says so, a line from WHERE YOU FALL
  ("Foot slipped in 8 of 24 falls. The FEET pack trains it").
- **What a session adds**: the session page says THIS SESSION (sets per
  area) and WEEK AFTER; ALSO FITS rows and TRAIN rows say what each trains.
- **I WANT** on TRAIN filters a shelf to the sessions for one area.

### Knowing where you are (in the session), changing it on the go

- **Phases** (`phases.ts`): PREP, SKILL, POWER, STRENGTH, CORE, CARE, TEST,
  derived from block, intensity and protocol (no data change). On the
  session page as headers with minutes and purpose, on the card's tag
  (`SKILL · SET 1/3`), as gaps in the progress bar, in the map.
- **Minutes left and the finish time** under the progress bar
  (`session-time.ts`), on the workout card and on rest.
- **The session map** (`SessionMap.tsx`, `live-edit.ts`): tap the progress
  bar. Everything still to come: UP, DOWN, -SET, +SET, LATER (to the end), X.
- **Rest** shows THEN (the two after the next) and LAST TIME's note.
- **The card**: the FOR line (`transfer.ts`, the moves it serves), a large
  focus cue on skill work, LAST TIME's note; ADJUST adds the slot's options
  (before the first set) and NOTE FOR NEXT TIME.
- **+ ADD** shows each addition's minutes and the minutes left in all.
- **Choice slots** (`slots.ts`): DAILY 06 toe taps (with step-down to a mark
  and shift-lift-place), CAVE 03 goblet squat and CAVE 05 front squat (with
  the box pistol). The least recently done runs; SWAP on EDIT lists the
  options first and holds the choice.

### Climbing with the legs

- **Twenty exercises** in `data-feet.ts`, hands free or flat throughout;
  protocols `foot-loading`, `active-range`, `hook-strength`.
- **DAILY 07 HOOKS + HIGH FEET** (14 min NORMAL, 19 FRESH).
- **CAVE 03** opens with a SKILL block (wall high-step, edge stand, one set
  of balance) at 44 of its 45 minutes. **Skill straight after the warm-up**
  in CAVE 01, 02, 04 and HEAL 01, 02.
- **FEET** as an area everywhere, a **HOOKS** goal, a **FOOTWORK** preset,
  **FEET** and **HOOKS** packs; the plate drag is FEET now.
- **Scored drills** (load kind `score`): toe taps and the step-down; STATS
  PROGRESS has a FEET section with the scores and the ASSESS feet tests.
- **ASSESS** has a FEET section after BODY + RANGE: the foot raise (moved
  there), foot loading, hips from the wall, knee to wall, single-leg balance
  eyes closed, toe-tap precision. Five new benchmarks. About 83 min NORMAL.
- **ON THE WALL**: six more drills (target practice, tracking, pause before
  placing, foot swaps, flag higher and closer, pull in with the toes).

### Tests

New: `feet.test.ts`, `session-structure.test.ts`, `body-week.test.ts`; five
existing tests updated for the new behaviour; `check:daily` and `check:cave`
hold the budgets for every slot option; one Playwright test for BODY THIS
WEEK, TRAIN THIS and the session map. Screenshots: `docs/screenshots/v43-*.png`.

## 3. Verified

- `npx tsc --noEmit`
- `npm test`: 362 passing
- `npm run check:daily`, `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 11 passing
- Screens checked at 390 x 844 on the seed history: TODAY, TRAIN THIS, the
  session page, the workout card on a SKILL drill, the session map; no
  console errors.

## 4. Repo state

Branch `claude/upbeat-darwin-v0cnex`, restarted from `main` at the v42 merge
(`bf2a6ae`), one PR into `main`.

## 5. Open items

- **Not built**: the weekly plan holding an area ("Thu: LEGS + FEET") rather
  than a session (proposal P8, last item).
- **BODY_BANDS are first guesses.** Tune them after a month of logs; a
  boulder session counts 4 finger and 2 pull sets.
- HEAL 01 did not get the heel-hook hold or the high step: it is at 86 of 90
  minutes FRESH. The FEET and HOOKS packs add them on the day.
- CAVE 03 is at 44 of 45 minutes NORMAL with the box pistol in the slot.
- ASSESS TIRED reads 96 min (rest x1.25); ASSESS is meant for a fresh day.
- Noticed, not changed: HEAL 05's drills name protocol `footwork`, which is
  not a key in `protocols.ts` (the key is `footwork-drill`), so their WHY
  section is empty.
- Carried from v41/v42: the "(right)" label on the left ring finger in
  `coachSummary`; the e2e seed's old back extension name; the 24-25 October
  climbs to check; the rehab frequency; a BACK section in STATS; BUILD's extra
  sets on deload and TIRED days; grade tables approximate; input zoom checks;
  CAVE 01 at 84 min at levels 6-7; undoing FINISH NOW leaves a Health workout;
  reminders do not read the weekly plan.

## 6. Next steps

- Try DAILY 07 with the chair against a wall; check the heel on the chair edge
  holds without sliding.
- Run ASSESS once to put numbers in the FEET section, then retest in 6-8 weeks.
- Score the toe taps and the step-down each time: the FEET section draws them.
- Leave a NOTE FOR NEXT TIME on any drill that goes wrong.

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
grep -rl "HOOKS + HIGH FEET" out/_next/static | head -1
npx cap sync ios
grep -rl "HOOKS + HIGH FEET" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v43 PR (BODY THIS WEEK, the session
  map, the feet work).
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. TODAY shows BODY THIS WEEK; DAILY has
  07 HOOKS + HIGH FEET.

## 8. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/busy-gauss-xg88dk
git push origin --delete claude/upbeat-darwin-v0cnex
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`
(skip a delete line that says the branch does not exist).
