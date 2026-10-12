# 7BIT — Handover v22

**Date:** 12 October 2026
**Read this first**, then v21 (FOOTWORK) and v20 (ring finger rehab).
Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete asked about putting a small on-device language model in the app
to talk to it ("this weekend I hiked 1300 m up and down over two days", "today
was too easy, add some core"). Conclusion of the research (no code):

- The iPhone 13 mini (4 GB, iOS 26.6) cannot run Apple's Foundation Models
  (Apple Intelligence needs a 15 Pro or newer). llama.cpp with a 1-2B GGUF
  model can run on it: Qwen3.5 2B first, Qwen3 1.7B as the safe fallback,
  FunctionGemma 270M fine-tuned on the app's actions as the long-term option.
- The model would only translate speech into a fixed set of actions,
  grammar-constrained to JSON, confirmed on a card, applied by the engine.
  So the actions come first, and this session builds them with buttons.

Agreed in the brainstorm:
1. Arms (biceps, triceps) as **extras** with no XP.
2. Activities outside the app **earn XP**.
3. "Too easy" **changes the prescription** for good.
4. No streak.
5. Order left to Claude: the activity log first, then in-session controls
   and the exercise reserve.

## 2. What changed: the activity log

- `src/core/activity.ts` (new, tested in `activity.test.ts`): nine types
  (hike, via ferrata, ski tour, trail run, run, bike, swim, yoga, other).
  From whatever is entered it estimates descent (= climb), distance (km per
  100 m gained), time (DIN 33466 walking-time rule, per-type rates) and effort
  (base per type, +1 above 600 m a day, +1 above 1200, +1 heavy pack, +1 above
  2500 m, max 10). Every assumption is named on the screen.
  The athlete's weekend, +1300 m over 2 days: -1300 m, 13 km, 8h30, effort 5,
  load 2550, +4 XP legs, legs sore 24h.
- **Load:** a new `ACTIVITY` lane in `training-load.ts`, spread over the days.
  It shows in the weekly bars and the week strip as "outside", but the
  acute:chronic ratio reads only climbing and training (`climbingLane`).
- **XP:** 2 per day, at most 3 days, once on first save (`creditActivity`).
- **Sore legs:** metres down per day open a 24h / 48h window (`legSoreness`);
  the recommender skips leg-heavy sessions while it is open (`isLegHeavy`:
  DAILY 03 and 05, CAVE 03, HEAL 01 and 02; FOOTWORK is not), reason
  "Legs sore from the hike. Upper body."
- **Store:** `activity-slice.ts`, `activityLog` persisted and in backups
  (the import summary counts activities). New screen `activity`
  (`ActivityScreen.tsx`), opened from ACTIVITY LOG on the home screen.

## 3. What changed: changing a session while in it (second PR)

- **HARDER / EASIER** on the workout card (`AdjustControls`, `adjust.ts`):
  kept for good as a per-exercise tweak (`tweaks`, persisted and backed up),
  applied by `buildList` / `scaleExercise` everywhere the exercise appears.
  One variation rung (at most one above the level's rung) or 2 reps / 5 s,
  between half and double the written work. Never on fixed protocols, tests,
  warm-ups, PRIMARY or MAX work, never rest; loaded work uses the stepper.
  The card says what changed ("Push-Up, 3s Lower. Kept for next time.") and
  shows YOUR CHANGE with RESET.
- **-SET / +SET**, today only.
- **+ ADD EXERCISE** on the card and on rest: the reserve (`reserve.ts`,
  `ReservePicker`) by area (CORE, ARMS, SHOULDERS, LEGS, MOBILITY, FINGERS),
  filtered by place (home kit for DAILY and the ring rehab), grip and finger
  work while healing, pain 3+, never gated / test / warm-up. Arm extras
  (`data-extras.ts`: band curl, hammer curl, overhead triceps, close-hand
  push-up, dumbbell curl, chin-up negative) earn no XP; a band lateral raise
  and a cable face pull train `shoulder`. Picks slot in block order after the
  exercise in hand; in a DAILY before the curls, and an added curl goes last.
  Logged in `added` on the session.
- **FINISH NOW** logs the session as it stands.

## 4. Verified

`npx tsc --noEmit`, `npm test` (134 passing; `activity.test.ts`,
`reserve.test.ts`), `npm run check:daily`, `npm run check:cave`,
`npm run build`. In the browser at 390 x 844: the weekend hike shows the
estimate above, saves, and STATS shows it as "outside". A DAILY 01 run:
HARDER on Push-Up moves to "Push-Up, 3s Lower" and is saved in `tweaks`;
+SET gives 3 sets; ADD > ARMS > Close-Hand Push-Up lands before the reverse
crunch; FINISH NOW logs the session with `added`.

## 5. Repo state

PR #36 (activity log) merged. Branch `claude/session-controls`, second PR to
`main`. After merge, delete both branches from the Mac (section 8).

## 6. Open items

1. Apple Health hikes are not imported: `HealthPlugin.swift` reads climbing
   workouts only. Adding hiking / running / skiing workouts with elevation is
   a Swift change to test on the phone.
2. The sore-legs thresholds (400 / 800 m down a day for a hike) are a first
   guess; tune them against how the legs actually feel.
3. Not built from the brainstorm: switching energy mid-session, the
   day-level actions ("only 10 minutes", "sore here", "away / no kit",
   "rest day / sick"). Each would be another action for the language model
   later.
4. The reserve shows each exercise's written dose; once added it runs at
   your level and with your tweak, which can differ slightly.
5. The on-device model itself (llama.cpp plugin, Qwen3.5 2B) is the step after
   the actions; try PocketPal on the phone first.

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
grep -rl "Kept for next time" out/_next/static | head -1
npx cap sync ios
grep -rl "Kept for next time" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the session controls PR.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. The home screen has ACTIVITY LOG under
  CLIMB LOG; the workout card has EASIER / HARDER / -SET / +SET and
  + ADD EXERCISE.

## 8. Mac housekeeping

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/activity-log
git push origin --delete claude/session-controls
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`.
