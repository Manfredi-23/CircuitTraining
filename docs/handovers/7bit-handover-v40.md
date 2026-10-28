# 7BIT — Handover v40

**Date:** 28 October 2026
**Read this first**, then v39 (BUILD keeps the time, the coach trial) and v38
(the climbing weapon). Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete: the back has been their weak spot since childhood, the lower
back and the middle of it. Building a routine under CORE gave mostly abs and
obliques, too little back. They asked for more back exercises, a preset that
trains the back, and BACK as an area of its own, apart from CORE.

## 2. What changed

- **BACK is an area of its own** everywhere an area is picked:
  - BUILD's AREAS (`CUSTOM_GROUPS`), between CORE and PULL. Tapped in, it
    gives back work; tapped out, it removes everything that `touches` it
    (`back-strength` and `upper-back` protocols). CORE no longer counts
    `back-strength` as its own, so NO CORE keeps the back and NO BACK keeps
    the abs. A sore back under ADJUST TODAY closes BACK.
  - The reserve (+ ADD EXERCISE, `reserve.ts`): a BACK tab. The prone
    extension, band good morning and 45-degree back extension moved from
    CORE to BACK (ids unchanged, so history and XP carry over); the bird dog,
    band row, dumbbell RDL and single-arm dumbbell row joined it.
  - The routine and swap picker (`WORK_AREAS`, `areaOf` in `review.ts`): a
    BACK filter. `back-strength` and `upper-back` work is BACK unless the legs
    lead it (the RDLs and the swing stay LEGS). STATS WHERE THE WORK WENT
    now shows BACK too, so some sets that were CORE show as BACK.
  - NOT TRAINED ENOUGH: the lower-back hard sets of the week (`CORE_EXERCISES.back`,
    target 9) are BACK's need now; CORE counts abs and obliques.
- **Seven new exercises** (`BACK_EXERCISES`, `data-extras.ts`), each with
  variations, form guide and progression, and they earn XP (`tension`,
  `shoulder`, `legs`):
  - Home, nothing gripped: **Prone Swimmer** (middle and lower back
    together), **Prone Cobra Hold** (between the shoulder blades), **Good
    Morning, Hands Behind Head** (the hinge without a band, so it stays while
    the finger heals), **Wall Angel** (PREHAB, thoracic spine).
  - Gym: **Plate Hug Good Morning** (loaded hinge, nothing gripped),
    **Bent-Over Dumbbell Reverse Fly** (standing, no bench), **Kettlebell
    Swing**.
  - New protocol `upper-back` (Mid-Back Strength) with its rationale and
    sources (Cools et al. 2007; Ekstrom et al. 2003). Swimmer, both good
    mornings and the swing count as lower-back hard sets.
- **Two presets** (eight built in now):
  - **STRONG BACK**: HOME, 30 min, BACK only. About 29 min NORMAL: cat-cow,
    prone extension, swimmer, cobra hold, good morning (hands behind head),
    band good morning, band row, bird dog, wall angel, with the extra sets
    BUILD adds to keep the time. While the finger heals the band work drops
    out (21-28 min).
  - **BACK + CORE**: CAVE, 45 min: back extension, plate good morning,
    dumbbell RDL / swing, reverse fly and row next to the core work. While the
    finger heals nothing gripped goes in, the plate good morning stays.
- **A BACK pack** (`PACKS`, `session-edit.ts`) for EDIT and + ADD EXERCISE:
  prone extension, swimmer, cobra at home; back extension, plate good
  morning, reverse fly at the gym.
- A sore back now also steps around sessions with `upper-back` work
  (`hitsArea`, `today.ts`).

## 3. Verified

- `npx tsc --noEmit`
- `npm test`: 323 passing (318 before). New: `custom.test.ts` (STRONG BACK
  back-only, no curls, inside 30 at every energy, no grips while healing;
  BACK + CORE keeps the plate hinge while healing; NO CORE / NO BACK; sore
  back; BACK's need), `reserve.test.ts` (the BACK group), `review.test.ts`
  (`areaOf`).
- `npm run check:daily`, `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 10 passing
- Screenshots of BUILD with STRONG BACK at 390px: the eight area chips wrap
  on two rows.

## 4. Repo state

Branch `claude/busy-gauss-xg88dk` from `main` at `4f914f6` (the v39
merge), one PR into `main`.

## 5. Open items

- STATS: CORE THIS WEEK still lists the lower back with abs and obliques
  (it is trunk volume); WHERE THE WORK WENT now splits BACK out. If the
  athlete wants a BACK section in STATS with its own weekly target, that is
  next.
- No DAILY session changed: DAILY 02 OBLIQUES + BACK is still the morning
  back session. STRONG BACK is a BUILD preset; MAKE IT MINE on its preview
  (SAVE THIS LIST AS A ROUTINE) makes it a fixed routine for the weekly plan.
- Carried from v39: the coach trial, BUILD's extra sets on deload and TIRED
  days, grade tables approximate, input zoom checks, CAVE 01 at 84 min at
  levels 6-7, HEAL 01 at 89 of 90 FRESH, undoing FINISH NOW leaves a Health
  workout, reminders do not read the weekly plan.

## 6. Next steps

- TRAIN, MINE, BUILD A SESSION, STRONG BACK: try it at home; tap BACK in a
  routine's + ADD EXERCISE to see the filter.
- If a set count feels too much (the prone extension can reach 4 sets when
  BUILD fills the time), pick 15 MIN or tap one exercise out with SWAP.

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
grep -rl "STRONG BACK" out/_next/static | head -1
npx cap sync ios
grep -rl "STRONG BACK" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v40 PR (BACK as its own area).
- Both `grep` lines print a file name.
- In Xcode, press Shift+Cmd+K, then Cmd+R.

## 8. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/busy-gauss-xg88dk
git fetch origin --prune
git branch -a
```
