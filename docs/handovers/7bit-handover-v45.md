# 7BIT — Handover v45

**Date:** 6 November 2026
**Read this first**, then v44 and v43. Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The same session as v44 (the PATATOMETRO, merged as PR #62). Then the
athlete asked for a quicker way to change a session when an exercise does
not fit, they don't want it, or the equipment is taken: **swipe an exercise
to get alternatives**, and **add more at the bottom of the list, by group
(abs, chest, shoulders, lower back, upper back...) or one by one**.

The proposal and the athlete's answers (all five as suggested):

1. Swiping left shows **SWAP and OUT** (rather than going straight to the
   alternatives).
2. It works **during the session too**: the workout card before its first
   set, and the session map.
3. The group list as proposed: ABS, OBLIQUES, LOWER BACK, UPPER BACK, CHEST,
   SHOULDERS, BICEPS, TRICEPS, PULL, LEGS, GLUTES + HAMSTRINGS, FEET +
   HOOKS, MOBILITY, FINGERS.
4. A group tap **adds a ready block of 2-3 at once**; a swipe takes back any
   that is not wanted.
5. **OTHER KIT**: every exercise tagged with its equipment, for the "it's
   occupied" case.

## 2. What changed

### Core

- **`src/core/exercise-tags.ts`** (new): groups and kit for every exercise
  that can be picked (153), by hand. The main group comes first; warm-ups
  have none. Kit is what can be busy or missing (bar, hangboard, rings,
  dumbbells, kettlebells, plates, box, barbell, band, portable edge,
  radiator, the climbing wall, cable); a mat, the floor, a house wall, a
  chair or a towel never count.
- **`src/core/alternatives.ts`** (new):
  - `otherKitFor`: the same job sharing no kit, most alike first (the
    engine's `likeness`, now exported, plus shared groups).
  - `groupList`: ONE BY ONE.
  - `groupBlock`: a group tap. The group's own exercises first, done least
    recently first, working sets before prep, gym kit before the band at the
    gym, one of a kind (`sameJob`), two for PULL, LEGS, GLUTES + HAMSTRINGS
    and FINGERS, three for the rest. Never one already in, labelled,
    maximal, the ring-finger rehab, or cable work.
  - `PACK_GROUPS`: the packs under their groups.
  - `swapInList` / `canSwapAt` for a running session.
  - `editContextFor`: the "what may go in today" rules, shared by every list.
- **`session-edit.ts`**: `itemIndexOf`, which finds the edit item a running
  row stands for (its own, a choice slot's pick, a gate stand-in, the
  no-grip version).
- **Store**: `swapLive(index, id)` and `swappedIds`, so an ENERGY switch
  keeps a swap instead of bringing the old exercise back.

### Screens

- **`SwipeRow`**: swipe left shows SWAP (filled) and OUT (outlined). One row
  is open at a time, a tap closes it, and the click a browser fires after a
  drag is ignored. Vertical scroll stays native. The buttons are focusable,
  with names like "Swap Box Jump".
- **`SwapPicker`** on `ExercisePicker`: tabs **SIMILAR | OTHER KIT | SEARCH
  ALL** ("THE SAME JOB WITHOUT: RINGS / TRX"). OTHER KIT is hidden when the
  exercise needs no kit. Nothing gated is offered in a running session.
- **`AddSheet`**: BY GROUP (14 chips), ADD 3 FOR ABS with its minutes,
  READY-MADE (that group's packs), ONE BY ONE with the minutes and when each
  was last done, SEARCH ALL. In a running session it also shows the minutes
  left in all.
- **Wired into**:
  - **The session page**: today's edit, with KEEP and RESET on the page, a
    short UNDO after OUT (the toast sits under full-screen panels), and the
    line "Swipe an exercise left: SWAP or OUT."
  - **The BUILD preview**: the change holds until a goal or area is tapped
    again.
  - **The session map**: SWAP on anything still to come, and on the
    exercise in hand before its first set; + ADD at the bottom.
  - **The workout card**: swipe the name before the first set (OUT there is
    SKIP), or use SWAP FOR ANOTHER EXERCISE under ADJUST.
  - **The routine editor**: for good, not for today.
  - **EDIT**: its SWAP and + EXERCISE use the same picker and add sheet;
    + PACK is unchanged.

### Tests

- New: `exercise-tags.test.ts` (5) and `alternatives.test.ts` (18).
- The EDIT smoke test now clicks the SEARCH ALL tab.
- A new smoke test covers the whole flow on CAVE 05 FULL BODY: swipe Ring
  Row, swap it via OTHER KIT for the dumbbell row, add 3 for ABS, take Box
  Jump OUT and UNDO, START, swap the suitcase carry in the session map,
  switch to TIRED, and check that the swaps hold.
- Screenshots: `docs/screenshots/v45-swipe-row.png`,
  `v45-swap-other-kit.png`, `v45-add-by-group.png`.

## 3. Verified

- `npx tsc --noEmit`
- `npm test`: 393 passing
- `npm run check:daily`, `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 13 passing
- The screens at 390 x 844: no horizontal scroll, no console errors.
- Not checked: the swipe on a real iPhone. Playwright drags with a mouse, so
  touch feel, the swipe distance and the iOS edge gestures still need trying
  on the phone.

## 4. Repo state

Branch `claude/dazzling-franklin-92a4zm`, restarted from `main` at the v44
merge (`183eb38`). One PR into `main`.

## 5. Open items

- **Try the swipe on the phone.** A row opens at half its 160px of buttons;
  if that feels stiff or loose, change `ACTION_W` in `SwipeRow.tsx` or the
  threshold in its drag handler.
- **The tags are first readings.** For example, the goblet squat is
  KETTLEBELL only, and push-ups with optional ring dips count as no kit. Fix
  them in `exercise-tags.ts` when a swap offers the wrong thing.
- **Cable Face Pull** (`extra-face-pull`) is in the library although the gym
  has no cable. Blocks skip it; SIMILAR and the reserve still offer it, as
  before. Delete it, or replace it with the band face pull.
- Mid-session, SWAP and + ADD don't ask the finger check again if finger
  work comes in. This is the same as + ADD EXERCISE before; the labels still
  show.
- Not changed: an ENERGY switch still brings back what the map's X or OUT
  took out (v43 behaviour). Swaps hold.
- Carried from v44 and v43: the weekly plan holding an area, BODY_BANDS to
  tune, HEAL 05's `footwork` protocol key, and the rest of v43's list.

## 6. Next steps

- At the gym, swipe the first exercise whose kit is taken and use OTHER KIT.
- Use + ADD by group at the end of a short session, and say if a block is
  wrong for the group.

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
grep -rl "THE SAME JOB WITHOUT" out/_next/static | head -1
npx cap sync ios
grep -rl "THE SAME JOB WITHOUT" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v45 PR (swipe, OTHER KIT, + ADD by
  group).
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. Open any session from TRAIN and swipe
  an exercise left.

## 8. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/dazzling-franklin-92a4zm
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`
(skip a delete line that says the branch does not exist).
