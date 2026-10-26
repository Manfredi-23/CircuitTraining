# 7BIT — Handover v33

**Date:** 26 October 2026
**Read this first**, then v32 (the UI and use review) and v31 / v30 / v29 (the
LED redesign). Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete asked for three things:

1. More CAVE sessions for gym days without bouldering. CAVE had one such
   session and two after-bouldering sessions; the athlete wanted at least two
   of each.
2. Full control over how hard the fingers are loaded. The finger is not 100%
   yet, but the app should assume it is healed and ask how ready it is before
   each session.
3. One more UI pass to make the app feel more premium.

The athlete's answers before building:
- Two new no-climbing sessions next to 01 STRONG: **04 POWER** and **05 FULL
  BODY**, 60-75 minutes each.
- **Keep the pain check and add readiness** beside it, in steps (20 / 40 / 60
  / 80 / 100%).
- Light hangboard work stays in 04.
- Gym kit: pull-up bar, weights, kettlebells, TRX rings, mat, boxes,
  hangboard, bands. **No bench, no bar to press.**
- "Add always a bit of core and balance and generate power while stretching."
- UI: overall feel.

HEAL is unchanged.

## 2. What changed

### CAVE: three no-climbing sessions, two after bouldering

| # | id | Title | When | NORMAL |
|---|---|---|---|---|
| 01 | cave-01 | STRONG | no climbing | 75-87 min (unchanged) |
| 02 | cave-05 | PULL + PUSH | after bouldering | 40 |
| 03 | cave-06 | LEGS + BACK | after bouldering | 30 |
| 04 | **cave-07** | **POWER** | no climbing | 70-75 |
| 05 | **cave-08** | **FULL BODY** | no climbing | 65-70 |

**04 POWER**, in order:
1. Pulse warm-up, then the finger warm-up (3 sets).
2. Submax hangs on 20mm at 50%, 6 x 10s / 50s rest. These are MODERATE, so
   they never count as a hard finger day.
3. Explosive pull-ups.
4. Explosive push-ups.
5. Weighted pull-ups for volume: 3 x 6 at RPE 7-8.
6. Single-arm dumbbell row, with the free hand on a box.
7. Half-kneeling dumbbell press.
8. **Floor pullover: power from the stretch.**
9. TRX knee tuck, body saw or pike.
10. **Single-leg balance.**
11. Band face pull.

**05 FULL BODY**, in order. There is no hangboard, so it never competes with
01 STRONG for finger recovery.
1. Pulse warm-up.
2. Box jump.
3. **Lateral hop + stick** (balance).
4. Double kettlebell front squat.
5. Dumbbell RDL.
6. **High-step rock-over drive** (power from the stretch).
7. Push-ups / ring dips.
8. Ring row.
9. Suitcase carry. It swaps to a plate hug carry at readiness 40 or less.
10. **Goblet Cossack squat** (power from the stretch).
11. Copenhagen plank.
12. Russian twist.

**New protocols:**
- `end-range-strength` ("Power at Full Stretch"): Afonso 2021 and Pedrosa
  2022.
- `lower-power`, for the box jumps.

**Shared constants:** `PUSH_DIP`, `RUSSIAN_TWIST` and `COPENHAGEN` are now
shared, so each exercise keeps one history across sessions. `SL_BALANCE` is
exported from `data-extras.ts`. The Copenhagen setup now says box, not bench.

**Recommender (rule 5):**
- From Thursday, in a week where climbing days plus training days are fewer
  than two, a training day is offered.
- STRONG comes first: once a week, with fresh fingers, and not when the
  forearms are sore.
- Otherwise POWER or FULL BODY, whichever was done less recently.
- Nothing on a TIRED day or a short day.
- `STRONG_ID` replaces "the first non-stacking CAVE session".

**`check:cave` now enforces:**
- 04 and 05 stay inside 75 minutes NORMAL at every level.
- Each has core, a balance drill and power at full stretch.
- No bench and no barbell in any setup, execution or load text.
- No HARD or MAX finger set in 04, and no hangboard in 05.

### Finger readiness

The panel before a session is now titled FINGERS + WRISTS (`PainCheck.tsx`).
It asks:
- **PAIN**, 0-10, only when the session loads the fingers. This is the
  safety rule, unchanged.
- **READINESS**, 20 to 100% in five steps, default 100.

Readiness is asked whenever the session loads the fingers or hangs from the
hands. CAVE 02 now asks readiness without pain.

| Readiness | Finger work |
|---|---|
| 100 | As written |
| 80 | Capped at HARD, one set fewer |
| 60 | Capped at MODERATE, one set fewer, no maximal finger tests; next finger load holds |
| 40 | Swapped for its `noGripId` substitute, or out |
| 20 | As 40, and everything that hangs (`hangs: true`) or pulls is out |

`applyFingerCheck` runs pain first and then readiness, so the stricter of the
two wins. It runs when a session starts and again on a mid-session energy
switch. START reads PAIN FIRST until pain is answered, and is filled and
sticky at the bottom of the panel.

Readiness is saved on the session as `readiness`. It shows in three places:
- LOG rows, as "ready 60%".
- The session page, as "Pain · Ready".
- FINGER LOAD in STATS, as the lowest readiness each week, under the week
  labels.

New exercise fields: `hangs` and `noGripId`. `hangs: true` is set on the
lock-off, front lever, hanging leg raise, hanging oblique raise and the
explosive and volume pull-ups.

### UI pass

- **Selected tabs no longer jump.** Every underline tab row and chip (TRAIN
  shelves and energy, STATS, LOG filters, session energy tabs, BUILD /
  TODAY / routine / week chips, climb and activity pickers) grew its bottom
  border from 2px to 6px, which moved the selected label 4px up. The extra
  thickness is now an inset `box-shadow`, so the labels stay level.
- **Press feedback everywhere:** every button sinks to 97% while pressed
  (`globals.css`).
- **Focus:** a keyboard focus ring in accent, never shown on a tap.
- **Type rendering:** antialiased text, and an accent-tinted text selection.
- **Panels:** full-screen panels respect the safe areas at top and bottom.
  New class `.overlay-btn-primary` for a panel's one main action (filled,
  sticky, faded edge).
- **Copy:**
  - "Last not done yet" now reads "Not done yet".
  - The CAVE line on TRAIN names which sessions are for which day.
  - STATS deltas read "vs prior", so they no longer wrap in the tile.

Screenshots: `docs/screenshots/v33-*.png` (`v33-before-train-cave.png` shows
the label jump).

## 3. Verified

All of these passed:
- `npx tsc --noEmit`
- `npm test`: 264 passing. New test files: `readiness.test.ts` and
  `cave-training.test.ts`.
- `npm run check:daily`
- `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 7 passing. The new smoke test starts CAVE 04 with pain
  1 and readiness 40%, then checks that the finger warm-up and the hangs are
  gone (EXERCISE 1/10).

No console errors on any screen that was driven.

## 4. Repo state

Branch `claude/relaxed-cori-q5513z` from `main` at the v32 merge, with one PR
to `main`. `main` is the only other remote branch.

## 5. Open items

- On the phone:
  - The press scale on long rows (LOG, TRAIN).
  - The sticky START on the finger check, above the home indicator.
  - CAVE 04 and 05 durations against real rest times.
- 01 STRONG runs 83-87 min NORMAL at levels 6-7, over its 75-minute note. It
  was this long before v33. It also has no balance drill or end-range work
  yet: adding them means cutting something, so that is the athlete's call.
- `scripts/make-seed.ts` has no CAVE 04 or 05 sessions in the sample
  history.
- Carried from v32:
  - FINGER LOAD and RING FINGER have no headline sentence.
  - Undoing FINISH NOW leaves an Apple Health workout behind.
  - The Monday summary.
  - Reminders do not read the weekly plan.

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
grep -rl "Power from the Stretch" out/_next/static | head -1
npx cap sync ios
grep -rl "Power from the Stretch" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v33 PR.
- Both `grep` lines print a file name.
- In Xcode, press Shift+Cmd+K, then Cmd+R.
- To check on the phone:
  - TRAIN > CAVE lists 01 to 05.
  - Starting 04 POWER asks PAIN and READINESS.

## 7. Mac housekeeping (after the merge only)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/relaxed-cori-q5513z
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`.
