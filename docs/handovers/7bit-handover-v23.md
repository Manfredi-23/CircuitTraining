# 7BIT — Handover v23

**Date:** 12 October 2026
**Read this first**, then v22 (activity log, harder / easier, the reserve).
Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

"Proceed with next steps" after v22. The next actions from v22's open items:
switching energy mid-session and the day-level actions. Each one is also an
action the on-device language model can call later.

## 2. What changed

- **TODAY** on the home screen (`DaySheet`, `src/core/today.ts`,
  `day-slice.ts`; persisted `dayPlan` and `offDays`, both in backups):
  - **Time** 10 / 15 / 20 / 30 / 45 min: the session is cut to fit by dropping
    whole exercises, lightest block first and from the end; warm-ups and
    tests stay, rest and sets never change. The home card shows the cut
    duration. 30 min or less keeps ASSESS and STRONG off the recommendation.
  - **No kit**: DAILY loses band, edge and loaded work, the recommendation is
    a mat-only DAILY, the reserve offers bodyweight only.
  - **Sore** legs / back / shoulders / forearms, today and tomorrow: sessions
    loading the area step aside on the recommendation ("Shoulders sore.
    Something else today."); forearms keeps finger sessions, ASSESS and
    STRONG off.
  - **Rest day / sick**: nothing recommended, a banner, no reminders that day,
    and the day does not count towards decay (`checkDecay(progress, offDays)`).
  - The button shows what is set, e.g. "REST DAY · 10 MIN · SORE SHOULDERS".
- **ENERGY** row on the workout card: switching rebuilds what is left at the
  new energy (same deload, kit, tweaks, pain check; extras kept; sets already
  done kept).
- Tests: `today.test.ts` (12) and `session-store.test.ts` (2, the store's
  energy switch and time cap).

## 3. Verified

`npx tsc --noEmit`, `npm test` (148 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`. In the browser at 390 x 844: DAILY 01
at 13 min drops to 10 min with a 10-minute cap; SORE SHOULDERS and REST DAY
show on the button and the banner, `offDays` holds today; in a session,
TIRED takes the session from 13 sets to 7.

## 4. Repo state

PRs #36 and #37 merged (v22). Branch `claude/day-actions`, PR to `main`.
After merge, delete it from the Mac (section 7).

## 5. Open items

1. Apple Health hikes are not imported (Swift change, test on the phone).
2. Sore-legs thresholds for activities are a first guess (v22).
3. The time cap is not reapplied after an energy switch mid-session, on
   purpose: the athlete just chose more or less.
4. Next: the on-device language model. Try PocketPal on the phone with
   Qwen3.5 2B and Qwen3 1.7B first (v22 section 1); the actions it would call
   now all exist: log an activity, harder / easier, +/- set, add from the
   reserve, switch energy, finish now, and the TODAY settings.

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
grep -rl "a mat-only DAILY" out/_next/static | head -1
npx cap sync ios
grep -rl "a mat-only DAILY" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the day actions PR.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. The home screen has TODAY above STATS;
  the workout card has an ENERGY row at the bottom.

## 7. Mac housekeeping

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/activity-log
git push origin --delete claude/session-controls
git push origin --delete claude/day-actions
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`
(skip a delete line that says the branch does not exist).
