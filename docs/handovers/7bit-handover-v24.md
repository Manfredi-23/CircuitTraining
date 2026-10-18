# 7BIT — Handover v24

**Date:** 18 October 2026
**Read this first**, then v23 (TODAY, energy switch mid-session).
Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

"Can you improve it? I would like to create custom workouts based on a) what
I am not training enough, b) time available, c) cave or home, d) choice of
muscle groups."

## 2. What changed

- **BUILD A SESSION** on the home screen, under TODAY (`BuildSheet`,
  `src/core/custom.ts`):
  - **WHERE**: HOME (mat, band, portable edge) or CAVE (the gym). Opens on
    CAVE after a logged climb or from the CAVE tab, otherwise HOME.
  - **TIME**: 10 / 15 / 20 / 30 / 45 / 60 min. Opens on the TODAY time cap
    if one is set.
  - **AREAS**: CORE, PULL, ARMS, SHOULDERS, LEGS, MOBILITY, FINGERS. PULL is
    gym only (no bar at home). Closed today: FINGERS while a finger heals or
    after pain 3+, anything sore on the TODAY sheet, LEGS after a long
    descent.
  - **NOT TRAINED ENOUGH**: the areas most overdue, with the reason ("legs
    19 days, fades after 21", "abs 3 of 12 sets this week"), preselected
    until you pick your own; USE SUGGESTION goes back to them.
  - **ENERGY** and a preview of the exact list with its duration, then
    START. Finger work asks the pain check first.
- How it builds: areas take turns, least recently done exercise first (at
  the gym, gym-only exercises first). What would run over the time is left
  out; rest and sets are never shortened. About one working exercise per
  four minutes. Gym opens with the pulse raiser, home with cat-cow; curls
  close the session.
- Custom sessions log as `custom-home` (DAILY) or `custom-cave` (CAVE),
  earn XP and load history like any session; the gym one offers the climb log
  on the complete screen and follows the deload week.
- The reserve (+ ADD EXERCISE) gained a **PULL** tab at the gym: weighted
  pull-ups and the lock-off ladder.
- `isHealing()` moved out of `recommend()` so BUILD and the recommender
  agree on when a finger is healing.
- Tests: `custom.test.ts` (11).

## 3. Verified

`npx tsc --noEmit`, `npm test` (159 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`. In the browser at 390 x 844: BUILD
opens with CORE, SHOULDERS and LEGS suggested on a fresh install; switching
to CAVE opens PULL; START runs "CAVE [CUSTOM]" from the pulse raiser, no
console errors. Screenshots: `docs/screenshots/build-*.png`.

## 4. Repo state

Branch `claude/custom-builder`, PR to `main`. After merge, delete it from the
Mac (section 7).

## 5. Open items

1. A custom session cannot be saved as a favourite yet; each BUILD starts
   fresh. Worth adding if the same build gets repeated.
2. The suggestion thresholds (0.7 of grace days, core pro rata) are a first
   guess; tune after a few weeks of use.
3. Carried from v23: Apple Health hikes not imported; sore-legs thresholds a
   first guess; the on-device language model (BUILD is one more action it
   could call).

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
grep -rl "NOT TRAINED ENOUGH" out/_next/static | head -1
npx cap sync ios
grep -rl "NOT TRAINED ENOUGH" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the custom builder PR.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. The home screen has BUILD A SESSION
  under TODAY.

## 7. Mac housekeeping

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/custom-builder
git push origin --delete claude/day-actions
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`
(skip a delete line that says the branch does not exist).
