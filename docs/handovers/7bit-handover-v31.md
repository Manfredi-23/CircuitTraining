# 7BIT — Handover v31

**Date:** 22 October 2026
**Read this first**, then v30 (larger LED dots, dotted section rules) and v29
(the LED redesign). Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

A second taste-skill pass over the UI (github.com/leonxlnx/taste-skill, the
`references/app-screens.md` run). As in v28, the brand wins where the skill's
house style bans it (monospace, uppercase labels, 2px outlined cards, the
parchment, 01/02 numbering, orange on cream). Every main screen was shot at
390px with the seed history and critiqued against the app-screen rules.

## 2. What changed

| Finding (before) | Fix |
|---|---|
| Workout card: a long exercise name ran to three lines at 30px and out-shouted the reps, the figure the card exists for | Names over 19 characters step down to 25px, over 40 to 22px (`nameSize` in `WorkoutScreen.tsx`); two lines for every name in the library at 390px |
| Complete screen: about 480px of empty parchment above SESSION COMPLETE (a spacer pushed it to the middle) | Content starts at the top; DONE stays at the bottom |
| STATS overview: every drop in orange, so "-1 vs 4 wks before" on 22 training days read as an alarm, and orange is reserved for the screen's main figure | Only a drop of 15% or more against the four weeks before is orange; smaller changes are grey (`Delta` in `StatsOverview.tsx`) |
| Session page: the minutes twice ("... - 13 min" in the subtitle and "13 MIN" in the line under it); the subtitle's figure is also wrong at FRESH or TIRED | The subtitle goes through `displaySubtitle`, as on the card and in TRAIN |
| Session page: two heavy lines 40px apart under the energy tabs | The list's top rule is dropped when the energy tabs are there |

Looked at and left: TRAIN's boxed energy chips (they sit under the DAILY /
CAVE tabs, and a second underline row would read as more navigation); the
workout card's control count (each control has a job, and DONE is in thumb
reach); LOG, TODAY and rest, which read well.

Screenshots: `docs/screenshots/v31-*.png` (`v31-before-*` for the before).

## 3. Verified

`npx tsc --noEmit`, `npm test` (241 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`, `npm run test:e2e` (6 passing), no
console errors on any screen driven.

## 4. Repo state

Branch `claude/dazzling-pascal-v5ozv3` from `main` after the v30 merge, one
PR to `main`.

## 5. Open items

Carried from v28-v30: check the LED ring and countdown on the phone; Health
outdoor workouts on the phone; the Monday summary; reminders do not read the
weekly plan; FINISH NOW has no UNDO.

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
grep -rl "exNameMid" out/_next/static | head -1
npx cap sync ios
grep -rl "exNameMid" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v31 PR.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. A long exercise name fits on two lines;
  SESSION COMPLETE sits at the top.

## 7. Mac housekeeping (after the merge only)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/dazzling-pascal-v5ozv3
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`.
