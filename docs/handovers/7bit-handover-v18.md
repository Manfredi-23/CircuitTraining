# 7BIT — Handover v18

**Date:** 5 October 2026
**Read this first**, then v17 (rest preview, progress bar, ASSESS bar-and-mat,
DAILY 01) and v16 (the roadmap and the Xcode steps it still needs). Working
agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete asked for one more mat-only DAILY morning session, done straight
after waking, aimed at different muscles from DAILY 01: more legs and core.
Constraints from the request: do not shake the body, especially the belly;
keep mountain climbers and spidermans; some squats, some stretching to get
the back moving, a few push-ups.

## 2. What changed

- **DAILY 05 LEGS + CORE** (`daily-05`), mat only, 13 min NORMAL, 18 FRESH,
  9 TIRED at every level:
  1. Cat-Cow + Thread the Needle (MOBILITY, shared with DAILY 04)
  2. Spiderman Lunge + Reach 1x5/side (MOBILITY, `daily-spiderman-lunge`)
     — the spiderman as a hip and upper-back opener
  3. Cossack Shift 1x5/side (MOBILITY, `daily-cossack-shift`)
  4. Bodyweight Squat 2x12, 45s (`daily-bw-squat`, submax-practice): tempo
     is the load — 3s lower + pause, 1.5 reps, skater squat at L7
  5. Glute Bridge 2x12, 30s (`daily-glute-bridge`, back-strength): march,
     then single-leg
  6. Push-Up 2x10, 45s (`daily-pushup`, shared with DAILY 01)
  7. Slow Mountain Climber 2x12, 30s (`daily-plank-climber`,
     trunk-hypertrophy): knee straight in, anti-extension; DAILY 01 keeps
     the cross-body one
  8. Cobra + Open Book 75s (MOBILITY, fixed, `daily-back-unwind`)
- **Belly-gentle by design:** nothing jumps, nothing curls. No crunch, no
  twist, no fast climbers, and the back stretch is extension and rotation,
  never folding forward while the discs are full from the night.
- `PUSH_UP` and `CAT_COW` lifted to shared constants in `data-daily.ts`, so
  DAILY 05 uses the same ids, levels and load history as DAILY 01 and 04.
- STATS core volume: the slow mountain climber counts as abs, the glute
  bridge as back.
- New test `src/core/__tests__/daily.test.ts`: DAILY 05 is mat only, never
  curls, has no ACCESSORY, opens and closes with mobility, shares the push-up
  and cat-cow, and counts in core volume.
- The recommender rotates through five DAILY sessions; a never-done session
  comes up in list order, so DAILY 05 is suggested once 01-04 have each been
  done.

## 3. Verified

`npx tsc --noEmit`, `npm test` (76 passing), `npm run check:daily` (05 at
13 / 18 / 9 min), `npm run check:cave`, `npm run build`. The DAILY 05 card
renders on the home screen at 390 x 844.

## 4. Repo state

PR from `claude/happy-einstein-hj67u7` with this change; merged once its
checks pass. If the cloud proxy refuses the branch delete, delete it from the
Mac (section 6).

## 5. Open items

1. Try DAILY 05 a few mornings: whether the squat should be harder sooner
   (the tempo levels need XP in `legs`), and whether the Cossack shift
   belongs in the working sets instead of the warm-up. There is 2 minutes
   of room on FRESH.
2. The card uses `squats.svg`, like DAILY 01 and 04. A dedicated
   illustration belongs to the graphics rework.
3. Everything open in v17 section 5 still stands.

## 6. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

```bash
git checkout main
git pull
git branch -d claude/happy-einstein-hj67u7 2>/dev/null
git push origin --delete claude/happy-einstein-hj67u7 2>/dev/null
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
