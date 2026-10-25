# 7BIT — Handover v32

**Date:** 25 October 2026
**Read this first**, then v31 (the second taste-skill pass) and v30 / v29 (the
LED redesign). Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

A UI and use review of every main screen at 390 x 844 with the seed history,
then all seven groups of suggestions built, as the athlete approved them.
The common thread: the button you need now stays on screen, everything else
waits one tap away, and the app says back what a session did.

## 2. What changed

| Before | After |
|---|---|
| TODAY: START sat under the tab bar at 844px; the figure took the room | The card is shorter on TODAY (`SessionCard compact`, 290px, figure 128px) and START is `position: sticky` just above the tab bar |
| Workout card: the screen grew with its content, so SKIP / DONE scrolled away on long exercises | The workout screen is one screen tall (`height: 100dvh`); the card scrolls inside, SKIP / DONE are always in reach |
| Workout card: about 13 controls at once | One **ADJUST** row (closed by default, shows a lasting tweak as its line) holds EASIER / HARDER / -SET / +SET, SWAP, NEXT STEP, ENERGY, + ADD EXERCISE and FINISH NOW. Reps, load, stepper, note and FORM GUIDE stay out |
| FINISH NOW asked with a browser `confirm()` | No dialog: the complete screen offers UNDO for six seconds (`finishNow` restores `sessionLog`, `progress` and `screen: 'workout'`). DONE clears the offer |
| Complete screen: `[OK]`, a meta box, one effort row, then empty space | Title and `MODE · TITLE · ENERGY`, then three LED tiles: MINUTES, SETS done / planned, XP earned (`totalXP` against `startXP` taken at start). Level-ups and PBs, effort, each loaded lift with **NEXT TIME** from `suggestLoad` (it updates as feel and effort are given), THIS WEEK (the week rail), then LOG TODAY'S CLIMBS and DONE |
| "DAILY [LEGS + CORE]" on the workout header and complete screen; " - " separators in subtitles and set tags | `·` everywhere. `displaySubtitle` also drops a leading "daily -" (the tab or crumb already says it) |
| TRAIN: boxed energy chips | The same underline control as the workout card, ENERGY label in front |
| Session page: MAKE IT MINE as heavy as START | An underlined text link |
| STATS BODY: eight open sections, about 3,300px | Each section folds to its title, period and headline sentence; a tap opens the evidence (`Section fold`). OVERVIEW, PROGRESS and CLIMBING are unchanged |
| LEVELS chart: only the overall line unless a capacity was tapped | Every capacity in faint grey, overall in black, the tapped one in orange on top |
| The LED `%` read as scattered dots | The slash runs the full height (`led-font.ts`) |
| A climb was three taps away (LOG, + CLIMB) | TODAY shows **+ LOG TODAY'S CLIMBS** when a CAVE session that follows bouldering was done today, or bouldering is planned, until a climb is logged (`climbToLog` in `plan.ts`). STRONG does not ask; it replaces a bouldering day |
| Coming back after the app slept through a rest: nothing said so | The workout card says REST ENDED m:ss AGO when the deadline passed 15 s or more before the app saw it (`useTimer` passes the overrun to `endRest`; `restOverrun`, reset on the next DONE, SKIP or attempt) |
| LOG: one stream only | ALL / SESSIONS / CLIMBS / OUTSIDE (`filterDays` in `history.ts`) |
| Rest: the full form guide opened for a new exercise | Opens on three lines of EXECUTION with THE WHOLE GUIDE + (`FormGuide brief`) |

New core helpers, each with tests: `climbToLog` (`routines.test.ts`),
`totalXP` (`engine.test.ts`), `filterDays` (`history.test.ts`),
`displaySubtitle` (`daily.test.ts`). The smoke test now finishes through
ADJUST, takes FINISH NOW back with UNDO, finishes again, and filters LOG.

Screenshots: `docs/screenshots/v32-*.png` (`v32-before-*` for TODAY, the
workout card and the complete screen before).

## 3. Verified

`npx tsc --noEmit`, `npm test` (248 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`, `npm run test:e2e` (6 passing), no
console errors on any screen driven. In the cloud session Chromium is now at
`/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` (the path in
`CLAUDE.md` was updated).

## 4. Repo state

Branch `claude/eager-babbage-vien8j` from `main` after the v31 merge, one PR
to `main`.

## 5. Open items

- On the phone: START above the tab bar with the home indicator; the
  one-screen workout card on a small iPhone (SE); REST ENDED after locking the
  phone through a rest.
- FINGER LOAD and RING FINGER have no headline sentence, so folded they show
  only their title.
- An UNDO of FINISH NOW after Apple Health already saved the workout leaves
  that workout in Health; the real finish saves a second one.
- Carried: the LED ring and countdown on the phone; Health outdoor workouts
  on the phone; the Monday summary; reminders do not read the weekly plan.

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
grep -rl "THE WHOLE GUIDE" out/_next/static | head -1
npx cap sync ios
grep -rl "THE WHOLE GUIDE" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v32 PR.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. TODAY shows START above the tab bar;
  the workout card has one ADJUST row and DONE never scrolls away.

## 7. Mac housekeeping (after the merge only)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/eager-babbage-vien8j
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`.
