# 7BIT — Handover v28

**Date:** 22 October 2026
**Read this first**, then v27 (STATS overview, Apple Health connect).
Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete asked for a review of the app and how it could be improved,
especially: separating the recommended session from the programme, building
their own sessions, and STATS that are easier to read than one long page.
They agreed to the whole proposal (navigation, routines, STATS split, smarter
logic, small fixes), with my defaults where they left a question open:
routines are **fixed lists**, there is a **weekly plan**, and there is a
**tab bar**. They also asked for the UI to be reviewed and improved with the
taste skill (github.com/leonxlnx/taste-skill).

## 2. What changed

### Navigation (`components/shell/`, `TodayScreen`, `TrainScreen`, `LogScreen`)

- The single-card home screen with six equal buttons is gone. A bottom tab
  bar: **TODAY, TRAIN, STATS, LOG**; SETTINGS top right on every tab.
- **TODAY**: the pick, large (PLANNED or RECOMMENDED, the reason in words,
  the session card, one START), then ADJUST TODAY (the old TODAY sheet,
  inline), then ALSO FITS TODAY: up to two more sessions that pass the same
  safety rules, each with why it is second (`also-fits.ts`).
- **TRAIN**: DAILY / CAVE / TEST / HEAL / MINE as a list: minutes at the
  chosen energy, recovery or last done, TODAY on the pick. A row opens the
  session with energy tabs, START and MAKE IT MINE.
- **LOG**: + CLIMB, + ACTIVITY, then everything done, newest first
  (`history.ts`). A past session opens: sets of planned, loads, effort to
  correct, DELETE.

### Your own sessions (`routines.ts`, `plan.ts`, `RoutineEditor`, `WeekPlanner`)

- **Routines** are fixed lists run through the normal engine (level,
  energy, deload, gates, pain check, load history all apply). Start blank,
  copy a programme session (MAKE IT MINE), or freeze a BUILD preview (SAVE
  THIS LIST AS A ROUTINE). Edit order, swap, remove, add from the whole
  library, sets 1-8 and reps or seconds within half to double. **Rest is
  never editable.** Warnings, not blocks: gym kit at home, curls early in a
  morning session, heavy work late, two hard finger exercises, no warm-up.
- **Weekly plan** (THIS WEEK in TRAIN MINE): up to three items a day
  (bouldering, rest, routines, programme sessions). TODAY leads with the
  plan unless a safety rule stops it, and then says so: "CAVE 01 was
  planned, but finger pain 7/10 lately."
- BUILD presets can be renamed.

### STATS (`StatsScreen`, `stats-headlines.ts`, `ExerciseDetail`)

- Four tabs: OVERVIEW, PROGRESS, BODY, CLIMBING. Each section names its
  period and opens with one sentence ("Most of the work went to core (34%);
  fingers got 7%.").
- A lift opens its own page: every load on a scaled chart, latest, best,
  NEXT TIME and why, a stall if there is one, recent sessions.

### Smarter (`adapt.ts`)

- The complete screen asks **EASY / RIGHT / HARD** for each loaded exercise;
  the next load suggestion follows it before the session effort.
- **Deload now** on a load spike, sessions averaging 8.5+, or finger pain 3+
  twice in a week; **skip the deload** after build weeks with under three
  hard sessions. One tap on TODAY.
- **Stalled lifts** (same load four sessions running) in WHAT STANDS OUT and
  on the exercise page.
- **Monday 08:30 notification**: last week in one line (Settings, Monday
  summary).
- **Apple Health outdoor workouts** (hike, run, ride, swim, yoga, ski tour)
  become activity entries. Closes the v26 open item.

### Small fixes

- UNDO for six seconds after deleting a session, climb, activity or routine.
- Reset all data now also clears presets (and the new routines and plan).
- The hollow body hold was defined twice in `benchmarks.ts`, so it showed
  twice under TESTS. One entry now, with the ASSESS protocol text; a test
  keeps ids unique.
- The launcher and STATS subscribe to the store keys they read.
- **Playwright smoke tests** (`e2e/smoke.spec.ts`, `npm run test:e2e`) on
  the built app with an eight-week sample history (`npm run seed`).

## 3. The taste-skill review

The skill is for websites and, in `references/app-screens.md`, for app
screens. Its house style bans things that are this app's brand (monospace,
uppercase labels, 2px outlined cards, the parchment gradient, orange on
cream, 01/02 numbering). CLAUDE.md wins there, as the skill itself says for
an existing brand (`--keep palette,type`). What was applied:

| Finding (before) | Fix |
|---|---|
| Secondary text at 50% ink: about 3.2:1 at the top of the parchment, 2.8:1 at the bottom (floor 4.5:1) | `--ink-dim` at 74% |
| 27 places with 9-10px text (floor 11px) | 11px |
| The home screen had no single answer and six equal buttons; orange on the STATS button (accent on chrome) | TODAY leads with one pick and one filled START |
| STATS: about 5300px, 16 sections, one scroll; findings in small captions | Four tabs; the answer first in each section |
| A missing value as a large "--"; an effort change coloured as if bad; orange "Fading now" on 9 of 10 rows | A short grey word; effort neutral; fading in ink |
| Level trend smoothed (invents values) | Straight segments |
| Orange on six things on the workout card | Orange on the load and the suggested step only |
| Row actions under 44px | 44px or more on the new screens |

The skill's lint (`lint.mjs --app`) now reports only the brand gradient and
the 01/02 numbering. Its inspector expects one URL per screen and desktop
widths; this app is a single page at 390px, so screens were driven with
Playwright and critiqued by eye instead. Screenshots:
`docs/screenshots/v28-*.png` (`v28-before-home.png` is the old home).

## 4. Verified

`npx tsc --noEmit`, `npm test` (235 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`, `npm run test:e2e` (6 passing). Every
new screen rendered at 390px with the seed history, no console errors.

**Not verified**: `HealthPlugin.swift` (`queryOutdoor`) has not been
compiled; the Monday notification and the Health import need the phone.

## 5. Repo state

Branch `claude/beautiful-curie-6oh123`, one PR to `main` with a commit per
phase, merged once checks are green.

## 6. Open items

1. **On the phone**: Apple Health > READ NOW should now also report
   "N outdoor workouts". If Xcode fails to compile, the error is in
   `queryOutdoor` at the end of `HealthPlugin.swift`.
2. Reminders do not read the weekly plan: a day planned as REST still gets
   the DAILY morning reminder (a day marked REST under ADJUST TODAY does
   not). Worth doing if it nags.
3. FINISH NOW has no UNDO (the session is logged and XP given).
4. The level trend still has no y-scale: its 0-100 score has no unit worth
   reading. Candidate for removal if nobody uses it.
5. Carried from v26/v27: TEST 02 FEET; technique note on the complete
   screen.
6. Vercel deployment would let the web build be tried on the phone without
   Xcode; needs the athlete's Vercel account.

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
grep -rl "ALSO FITS TODAY" out/_next/static | head -1
npx cap sync ios
grep -rl "ALSO FITS TODAY" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v28 PR.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. The app opens on TODAY with the tab
  bar at the bottom.

Optional, for the browser tests on the Mac (one-time download):

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
npx playwright install chromium
npm run test:e2e
```

## 8. Mac housekeeping (after the merge only)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/beautiful-curie-6oh123
git push origin --delete claude/build-presets
git push origin --delete claude/quiet-feet
git push origin --delete claude/stats-overview
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`
(skip a delete line that says the branch does not exist).
