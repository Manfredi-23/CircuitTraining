# 7BIT — Handover v27

**Date:** 21 October 2026
**Read this first**, then v26 (DAILY 06 QUIET FEET, ROCKOVER / HIPS).
Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete sent the 21 October backup: "optimize the stats page to give
more insightful insights and a clearer overview of my overall training. And
connect to Apple Health doesn't really work."

The old STATS page, rendered with that backup: a random line and level 02 at
the top, fifteen sections in one scroll, the Russian twist showing "0 kg -9"
in red (a 0 logged after 12 kg), the back extension a flat line at 0 kg,
CUT SHORT naming `test-trunk-flexor`, and the facts that matter buried (both
one-arm gates already open at 149%).

## 2. What changed

- **Overview** at the top (`src/core/review.ts`, `StatsOverview.tsx`): the
  last 28 days against the 28 before: training days (and per week), hours
  with sessions and climbs, share of planned sets done, mean effort; the
  level stays as a small label.
- **WHAT STANDS OUT**, worked out from the logs. With this backup:
  - Finger healing since 12 Oct, but pulling logged on 3 days.
  - Weighted pull-ups: 10 kg to 20 kg since 23 Sep.
  - The 149% tested pull-up opens both one-arm stages.
  - 13 training days in 4 weeks, up from 4 (3.3 a week).
  - 2 after-bouldering sessions with no climb logged (healing days excluded).
  - Next ASSESS around 22 Nov.
  - Russian twist logged at 0 kg after 10 kg.
- **WHERE THE WORK WENT**: working sets by area over 28 days, the 28 before
  as a ghost bar. This backup: core 39%, push + shoulder 21%, legs 21%, pull
  9%, mobility 7%, fingers 1%.
- **Order**: overview, weeks, work split, load, recovery, then groups
  PROGRESS (lifts, one-arm path, tests), GAPS (freshness, core this week, cut
  short), FINGERS, CLIMBING, LEVELS (capacities, level trend; the old
  OVERVIEW chart renamed).
- **Fixes**: lift series skip 0 kg entries and leave out all-zero bodyweight
  work; CUT SHORT leaves tests out and names retired exercises readably;
  RECOVERY says where to connect Health instead of being absent.
- **Apple Health**: the native wiring was already right (plugin registered in
  `MainViewController`, HealthKit entitlement, both usage strings). What was
  wrong is that every failure said the same vague thing. Now:
  - `HealthPlugin.swift` returns HealthKit's error from the permission sheet,
    per-type query errors, and whether the sheet has been answered.
  - CONNECT says which of four things happened: not the iPhone app, plugin
    missing from the build (Clean Build Folder), Health unavailable, or
    HealthKit's own error, with a missing capability translated into the
    Xcode step.
  - **READ NOW** (next to DISCONNECT) reads 30 days and says what came back,
    e.g. "14 nights of sleep, 12 days of HRV ...", or where to allow the
    categories when nothing came back.
- Tests: `review.test.ts` (6), lifts and cut short in `insights.test.ts`,
  connect messages in `health.test.ts`.

## 3. Verified

`npx tsc --noEmit`, `npm test` (183 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`. STATS rendered with the athlete's
backup at 390 px, no console errors; `docs/screenshots/stats-overview.png`.
**Not verified**: the Swift changes have not been compiled (no Xcode in the
cloud session); the Health flow needs the phone.

## 4. Repo state

Branch `claude/stats-overview`, PR to `main`, merged when both checks are
green. Stale remote branches from v25 and v26 still to delete from the Mac:
`claude/build-presets`, `claude/quiet-feet` (section 7, after the merge).

## 5. Open items

1. **Apple Health on the phone**: after this build, Settings > APPLE HEALTH >
   CONNECT, and note the exact message. If it names the HealthKit capability:
   Xcode > App target > Signing & Capabilities > + Capability > HealthKit (if
   Xcode asks, accept the Program License Agreement at developer.apple.com,
   see v16). If it connects but reads nothing: iPhone Settings > Health >
   Data Access & Devices > 7Bit > Turn On All, then READ NOW.
2. If the Swift does not compile, the error is in `HealthPlugin.swift`
   (closures now take `(rows, error)`).
3. Carried from v26: TEST 02 FEET; technique note on the complete screen;
   presets cannot be renamed; Apple Health hikes not imported.

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
grep -rl "WHAT STANDS OUT" out/_next/static | head -1
npx cap sync ios
grep -rl "WHAT STANDS OUT" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the stats overview PR.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. STATS opens on LAST 28 DAYS and WHAT
  STANDS OUT; Settings > APPLE HEALTH has CONNECT (and READ NOW once
  connected).

## 7. Mac housekeeping (after the merge only)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/build-presets
git push origin --delete claude/quiet-feet
git push origin --delete claude/stats-overview
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`
(skip a delete line that says the branch does not exist).
