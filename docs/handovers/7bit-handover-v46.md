# 7BIT — Handover v46

**Date:** 8 November 2026
**Read this first**, then v45. Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

A review of the athlete's last four weeks (COPY FOR COACH, pasted into a
chat), then "update the app". The review found the same exercises skipped
again and again. The athlete said why, exercise by exercise:

- **Reverse crunch, plate crunch**: never learned the form, feels wrong.
- **Cobra + open book, prone extensions, supermen, prone Y-T-W**: the
  athlete broke a vertebra (D12) years ago. Fine now, but arching face down
  feels constricted. The back is still their weak spot and they want it
  stronger.
- **Plate hug good morning**: the good morning is fine, the plate is not.
  The dumbbell RDL they like.
- **Plate hug carry**: does not want to walk round the gym.
- **TRX knee tuck / pike**: awkward (TRX push-ups they like).
- **Foothold balance, silent feet**: wall drills; the floor balance drills
  (star reach and the like) they like and keep.
- **Russian twists**: loved. Kept, once a session, heavy.

Three choices, all as recommended:

1. **Clean the built-in sessions**: take the dropped exercises out of DAILY,
   CAVE and HEAL and put the agreed replacements in.
2. **Never auto-picked**: the dropped exercises stay in the library (SEARCH
   ALL finds them), but nothing chooses them by itself.
3. **Healing lasts until 80%**: a logged climb no longer ends the healing
   finger. The export before this change had lost its finger warning
   because a climb on 5 Nov ended it, with the left ring finger at 33%.

## 2. What changed

### Sessions

| Session | Out | In |
|---|---|---|
| DAILY 01 | Reverse Crunch | Lying Leg Raise (2 x 10), before the twist |
| DAILY 02 | Prone Back Extension | Bent-Over Y-T-W |
| DAILY 05 | Cobra + Open Book | 90/90 Hip Switch |
| CAVE 03 LEGS + BACK | Floor Back Extension; Plate Crunch | Good Morning, Hands Behind Head; Lying Leg Raise |
| CAVE 04 POWER | TRX Knee Tuck / Pike | Front Lever Progression, 3 sets |
| CAVE 05 FULL BODY | Plate Hug Carry (no-grip stand-in) | Band Pallof Press |
| HEAL 01 | Floor Back Extension; Plate Crunch | Good Morning, Hands Behind Head; Lying Leg Raise |
| HEAL 02 | Prone Y-T-W; Cobra + Open Book | Bent-Over Y-T-W; 90/90 Hip Switch |

Budgets hold: `check:daily` (longest DAILY 01 FRESH at 20) and `check:cave`
(03 at 40 NORMAL, 04 at 70-75).

### New exercises (`data-extras.ts`)

- **Bent-Over Y-T-W** (`extra-bent-ytw`): the Y, T and W standing in the
  good-morning hinge, back flat. Home, nothing gripped, `upper-back`.
  Progression 0.5, 1, 2 kg a hand.
- **Band Pallof Press** (`extra-band-pallof`): anti-rotation, band anchored
  at chest height, the end pressed between flat palms (no grip). Gym only:
  the home band has no anchor. `tension-iso`.
- **Lying Leg Raise** (`morn-leg-lowers`) moved here from HEAL 02 as
  `LYING_LEG_RAISE`, same id.
- `HIP_9090` (DAILY), `FRONT_LEVER` (CAVE) became shared constants.

### Not picked (`not-picked.ts`, new)

`NOT_PICKED`: reverse crunch, plate crunch, cobra + open book, plate hug good
morning, plate hug carry, TRX tuck / pike, floor back extension, prone
extension, prone swimmer, prone cobra hold, prone Y-T-W. Filtered out of
`reserveFor` (so BUILD and + ADD EXERCISE), `groupList` / `groupBlock`,
`similarTo` (unless the slot's own option), `otherKitFor` and `packsFor`.
`OUT_OF_SESSIONS` keeps their objects in `exerciseLibrary`.

Packs: CORE FINISHER uses the leg raises; BACK is bird dog, good morning,
bent-over Y-T-W at home, RDL, good morning, reverse fly at the gym;
SHOULDER CARE has the bent-over Y-T-W, and the gym version the band face
pull (closes the v45 open item about the cable face pull in a pack);
MOBILITY 10 ends with cat-cow.

### BUILD

- Never picks one exercise twice under two ids. The home and gym Russian
  twists share a name, which is why two rounds kept turning up.

### A healing finger (`recommend.ts`)

- `isHealing(sessionLog, climbLog, now, ring?)`: with the ring finger's
  numbers, healing until the left reaches 80% of the right; without them,
  healing while the ring rehab ran in the last ten days; otherwise the old
  rule. `fingerHealing(store)` passes the numbers; the TODAY wall card, the
  coach export, BUILD, the reserve, EDIT, the session map and the workout
  screen use it. STATS WHAT STANDS OUT too.
- `inHealBlock` is the old rule (a climb ends it). It still decides
  recommender rule 2, the HEAL routine, so climbing again goes back to the
  normal week.
- Core volume: the Pallof press counts for the obliques; the bent-over Y-T-W
  and the dumbbell RDL for the back.

### Tests

- New `not-picked.test.ts` (8): every dropped exercise still in the library
  and found by search, in no session, never offered by the reserve, a group,
  a pack, SIMILAR or OTHER KIT; the replacements in place; healing through a
  climb until 80%.
- Updated: `custom` (STRONG BACK and BACK + CORE contents; the CORE hour
  reaches 55 at FRESH, 35+ at NORMAL and TIRED now that four core exercises
  are not picked; no twins), `heal`, `readiness`, `reserve`, the swipe smoke
  test (SIMILAR offers the Pallof press), `check:daily` (the leg raise is
  flexion and closes a DAILY).

## 3. Verified

- `npx tsc --noEmit`
- `npm test`: 402 passing
- `npm run check:daily`, `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 13 passing

## 4. Repo state

Branch `claude/v46-review-cleanup` from `main` at `da359d8`, pushed. The
GitHub CLI had no working login in the cloud session, so **the PR is not
opened or merged yet**: open it from
https://github.com/Manfredi-23/CircuitTraining/pull/new/claude/v46-review-cleanup
and merge it, then run the Mac clean update. `main` is unchanged until then.

## 5. Open items

- **STRONG BACK at home while healing** builds only about 14 of its 30
  minutes: the prone work is gone and the band work grips. More home back
  work that is flat and gripless would fill it.
- **The ring rehab after climbing again**: TODAY recommends it only inside
  the HEAL block. Once climbs are logged it is not suggested; do it from
  TRAIN > HEAL 03 every second day until 80%.
- **ASSESS** still has the prone (Ito) extension hold. It is a test, so it
  was left alone; skip it or ask for a flat-back test instead.
- The plan from the review (three templates: pull + front lever, legs +
  hinge + balance, home push + core + back; climbing twice a week with one
  slab and head session) was not built as sessions. MAKE IT MINE or routines
  can hold it.
- Carried from v45: the swipe on a real phone, the tags as first readings,
  the ENERGY switch bringing back what OUT took out.

## 6. Next steps

- At the gym: CAVE 03 after bouldering, and check the good morning and leg
  raise read right on the card.
- After the next session: COPY FOR COACH should again say the finger is
  healing.

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
grep -rl "Bent-Over Y-T-W" out/_next/static | head -1
npx cap sync ios
grep -rl "Bent-Over Y-T-W" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v46 PR (the review clean-up).
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. Open TRAIN > DAILY 02 and look for
  Bent-Over Y-T-W.

## 8. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/v46-review-cleanup
git push origin --delete claude/dazzling-franklin-92a4zm
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`
(skip a delete line that says the branch does not exist).
