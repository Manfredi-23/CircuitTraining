# 7BIT — Handover v21

**Date:** 8 October 2026
**Read this first**, then v20 (ring finger rehab) and v19 (the HEAL tab).
Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

Second request of the day, after v20 merged (PR #33). Footwork is the
athlete's weak spot, and the break from hard pulling is the time to work on
it: drills on the gym's easy slabs, feet only. On a gym day: finger rehab,
then the foot drills, then HEAL 01 or 02.

Answers to the questions asked first:
- After the drills, the **full** HEAL 01 or 02 (not a cut-down version).
- Flat palms on the wall for balance are fine; nothing gripped.

## 2. What changed

- **HEAL 05 FOOTWORK** (`heal-05`, 28 min at every level and energy,
  `recoveryHours: 0`): feet, ankles + hips warm-up (barefoot first), then
  - Silent Feet 2 x 90s: up and back down, no foot makes a sound.
  - Sticky Feet 2 x 90s: a placed foot may not move or readjust.
  - Inside, Outside, Tip, Smear 2 x 45s per foot on one low foothold.
  - No-Hands Slab 3 x 60s: two or three moves up and down, hands behind the back.
  - Foothold Balance 2 x 20s per foot, hands off.
  Every drill is `fixed` (energy does not change it), bodyweight, `legs` +
  `tension`, with level variations (smaller holds, steeper slab, eyes closed).
  Nothing loads a finger, so there is no pain check.
- New protocol `footwork` in `protocols.ts` with the reasoning (one rule per
  drill, easy terrain, done fresh) and sources.
- **Recommender, gym day** (every other day while healing): the ring rehab
  first if due (the right-hand test once, before the first), then FOOTWORK,
  then 01 or 02. Footwork only comes up on gym days. Ids live in
  `data-heal.ts`: `HEAL_GYM_IDS`, `RING_REHAB_ID`, `RING_TEST_ID`, `FOOTWORK_ID`.
- `heal.test.ts`: five HEAL sessions, the gym-day order, footwork free of
  finger work and inside 15-30 minutes.

A gym day is now about 13 + 28 + 60-70 minutes: roughly 1h45 to 2h.

## 3. Verified

`npx tsc --noEmit`, `npm test` (105 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`. In the browser at 390 x 844, with the
rehab done earlier the same gym day, the home screen opens on FOOTWORK
("Gym day: footwork while fresh.").

## 4. Repo state

Branch `claude/heal-footwork`, merged to `main` via PR and deleted. `main` is
the only branch, no open PRs.

## 5. Open items

1. FOOTWORK reuses `squats.svg`; a slab-and-feet illustration belongs to the
   graphics rework.
2. Footwork earns `legs` and `tension` XP, which moves those variations a
   little. If that feels wrong, give it `mobility` only.
3. Everything open in v20 section 5 still stands (confirm the right-hand test
   method and pain limit with the physio).

## 6. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

```bash
git checkout main
git pull
git branch -d claude/heal-footwork claude/heal-ring-finger-rehab 2>/dev/null
npm install
npx tsc --noEmit
npm test
npm run check:daily
npm run check:cave
npm run build
npx cap sync ios
npx cap open ios          # Xcode: scheme App, Cmd+R
npm run dev               # or the browser, http://localhost:3000
```
