# 7BIT — Handover v29

**Date:** 22 October 2026
**Read this first**, then v28 (tab bar, routines, plan, STATS tabs).
Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

After v28 the athlete said the app was usable but not beautiful, and asked
for one more UI pass: professional, contemporary, innovative, keeping the
app's style. Read as a visual redesign inside the existing design system
(Kode Mono, parchment, ink, one orange, 2px outlines, 6px tab underlines).

## 2. The direction

From the taste skill (`draw.mjs --app --keep palette,type`), the dealt style
was **achromatic ledger**: chrome in ink, the one hue on the screen's main
figure only, a near-black primary action. That is the brand already. The
skill also asks for one element only this product has. For 7Bit that is the
**LED dot-matrix** the session illustrations are drawn on, so the
interface now speaks it:

- **LED numerals** (`Led`, `src/core/led-font.ts`, 5 x 7 glyphs): the
  session number on the card (with its unlit dots, orange on today's pick),
  the rest countdown, the reps on the workout card and on rest, the STATS
  overview figures, the minutes on the START bar, the list numbers in TRAIN
  and ALSO FITS TODAY. They light up column by column (none under reduced
  motion).
- **The week rail** on TODAY (`WeekRail`, `week-rail.ts`): seven LED
  columns, filled from the bottom, a climb in orange, a session in ink, an
  outside day in grey, a ring on a planned day ahead, today underlined, and
  a line: "4 sessions, 1 climb so far this week."
- **Pixel tab icons**: a calendar, a dumbbell, chart columns, log lines,
  each 7 x 7 LED; the active one lights up.
- **The LED rest ring**: 48 dots that go out as the rest runs down, orange
  in the last seconds, the time in LED numerals in the middle.
- **Dot-grid paper**: an unlit LED every 12px over the parchment, on the
  page and on every full-screen panel.
- **Type**: 30px page titles, a 20px card title, an 18px reason on TODAY,
  a 64px START bar with the minutes in LED; subtitles in the secondary ink.

Rule learned in the look rounds: unlit dots only on large displays. On the
STATS figures they made "21" hard to read, so small LEDs draw lit dots only.

## 3. Verified

`npx tsc --noEmit`, `npm test` (241 passing: LED font and week rail tests
added), `npm run check:daily`, `npm run check:cave`, `npm run build`,
`npm run test:e2e` (6 passing). Three look rounds at 390px with the seed
history; `docs/screenshots/v29-*.png` (today, train, stats, workout, rest).

## 4. Repo state

Branch `claude/beautiful-curie-6oh123` restarted from `main` after the v28
merge, one PR to `main`, merged once checks are green.

## 5. Open items

1. On the phone: check the LED rest ring and countdown are crisp at the
   device's pixel ratio and that the dot animation feels quick, not slow.
2. Candidates for the LED language next, if wanted: the session progress
   bar as a row of dots, the complete screen's [OK], the LOG day numbers.
3. Carried from v28: Health outdoor workouts on the phone, Monday summary,
   reminders do not read the weekly plan, FINISH NOW has no UNDO.

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
grep -rl "so far this week" out/_next/static | head -1
npx cap sync ios
grep -rl "so far this week" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v29 PR.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. TODAY opens with the week rail of
  dots, and the tab bar has pixel icons.

## 7. Mac housekeeping (after the merge only)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/beautiful-curie-6oh123
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`.
