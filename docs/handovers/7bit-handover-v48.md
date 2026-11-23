# 7BIT — Handover v48

**Date:** 23 November 2026
**Read this first**, then v47. Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete sent thirteen frames of a climbing-gym reel (hip and leg drills)
and asked which were worth adding, the first one above all. The verdict given:

| # | In the reel | Verdict |
|---|---|---|
| 1 | Seated, one leg out to the side, the other foot lifted up and over a dumbbell, both sides | **Added.** Active range for the high step to the side (knee turned out). The seated leg lift (straight legs in front) and the box lift-off (standing) do not cover that plane. The target gives an external focus. |
| 2 | Standing on one leg, a 2.5 kg dumbbell held by the toes of the other, three leg circles each side | **Already in the app**: Hip CARs, Knee Turned Down (`feet-hip-cars`). Added the reel's version as its top rung. The dumbbell is the minor part: it adds a toe grip and a longer lever, and a dropped one lands on a bare foot. |
| 3 | Prone swimmers, light plates, 3 sets | **Not added.** Face down and arching: out since v46 (`extra-prone-swimmer` is in `NOT_PICKED`, the D12). The bent-over Y-T-W does the job held flat. |
| 4 | On the back, knees dropped to one side, the "open" foot pressing the inside knee down | **Not added.** Passive internal rotation. The 90/90 hip switch and the 90/90 lift-off already train it actively. The overpressure levers partly through the knee. |
| 5 | On the back, one foot by the hip (reclined half-hero), the knee lifted and lowered | **Not added.** Full knee bend with a twist under bodyweight, and lying back on it arches the lower back when the front of the hip is tight. The 90/90 lift-off trains internal rotation without either. |

## 2. What changed

- **Seated Lift-Over** (`feet-seated-lift-over`, `data-feet.ts`, the
  twenty-first feet exercise): MOBILITY, MODERATE, 2 x 6 per leg, 20 s,
  protocol `active-range`, capacities `mobility` + `legs`, bodyweight. Rungs:
  low target (L1), dumbbell on end (L3), hands off the floor (L5). Focus cue
  "Clear the target. Set the foot down without a sound." Hands flat or on the
  fists (the wrists).
- **DAILY 09 WAKE UP FLAGS**: the lift-over follows the 90/90 on the floor as a
  choice slot, **HIGH KNEE: SEATED OR STANDING**, with the standing high-knee
  hold (which moved up from after the flag hold). The lift-over runs first
  and then they alternate (done least recently runs). Still 12 min NORMAL
  at every level, 10-11 TIRED, inside the 15 of WAKE UP.
- Everywhere else the library reaches: reserve (MOBILITY, home, floor),
  BUILD's HIPS goal, groups MOBILITY + FEET / HOOKS (no kit: a shoe or bottle
  is the target at home), transfer HIGH STEP.
- **Hip CARs** got rungs: hand on the wall (L1), free-standing (L4),
  free-standing with a 1-2.5 kg dumbbell held by the toes or a heavy shoe
  (L6). Not in any session; reached through + ADD, BUILD and HIPS.

## 3. Verified

- `npx tsc --noEmit`
- `npm test`: 410 passing (3 new in `feet.test.ts`: the slot and its order,
  the lift-over's filing, the hip CARs rungs; the catalogue count is 21)
- `npm run check:daily`, `npm run check:cave`
- `npm run build`, marker `SEATED OR STANDING` in `out/_next/static`
- `npm run test:e2e`: 14 passing

## 4. Repo state

Branch `claude/dreamy-fermat-0eqaxf` from `main` at `7e6a057` (the v47 merge),
PR opened and merged from this session (GitHub access worked this time). No
other PR open. The cloud git proxy refuses branch deletes, so two merged
branches are left for the Mac: `claude/v47-week-structure` and this one.

## 5. Open items

- **The lift-over is my read of two frames.** If the reel's version differs
  (straight leg over, a different start), say so and the card changes.
- The WAKE UP note says "nothing on the floor"; the 90/90 and now the
  lift-over sit on the floor at the start. Both are seated tall, nothing
  curls. Reword the note if it bothers you.
- Carried from v47: TIRED on a CAVE day is about 50 minutes; the weighted
  knee raise starts at 2 kg; ring rehab is still not suggested outside the
  HEAL block; ASSESS keeps the prone extension hold.

## 6. Next steps

- Two weeks of WAKE UP FLAGS with the slot, then decide whether the lift-over
  should replace the high-knee hold outright.
- COPY FOR COACH after a week of the v47 rotation, as planned.

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
grep -rl "SEATED OR STANDING" out/_next/static | head -1
npx cap sync ios
grep -rl "SEATED OR STANDING" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v48 PR (the seated lift-over).
- `npm test` shows 410 passing.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. TRAIN, DAILY 09 WAKE UP FLAGS: the
  second exercise is Seated Lift-Over, under HIGH KNEE: SEATED OR STANDING.

## 8. Mac housekeeping

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/v47-week-structure
git push origin --delete claude/dreamy-fermat-0eqaxf
git fetch origin --prune
git branch -a
```

`git branch -a` should list only `main` and `remotes/origin/main`.
