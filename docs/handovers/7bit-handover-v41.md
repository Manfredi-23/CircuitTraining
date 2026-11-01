# 7BIT — Handover v41

**Date:** 1 November 2026
**Read this first**, then v40 (BACK as its own area) and v39. Working
agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

Two parts.

1. **A coach review** (the trial: COPY FOR COACH pasted into the chat) of 1-28
   October. Main points: the ring finger on track (17% to 28% of the right,
   pain 4 to 1) but rehab only every five days; pulling six times in twelve
   days while healing, when the pull-up is already at the 7C standard (149% BW)
   and the fingers are the gap; the lower back trained but never loaded; HEAL
   05 FOOTWORK, the answer to the athlete's own first limiter, done zero
   times; three climbing sessions on 24-25 October against the note "didn't
   climb" (probably watch drafts: delete them, or stay off steep boards);
   sessions sprawling to 77-86 minutes with additions. Hold POWER for the
   fingers and upper body until the left is at about 60%.
2. **No back extension station at the gym.** The athlete has a mat and can
   hook the heels under a radiator, nothing else.

## 2. What changed

- **`legs-back-extension` is now the Floor Back Extension, Heels Anchored**
  (`data-cave.ts`). Same id, so its history, loads and XP carry over. Face
  down on the mat, heels hooked under the radiator, lift until the lower ribs
  leave the mat, two-second hold. Variations: hands by the hips, hands behind
  the head (level 3), a plate hugged to the chest (level 5); the stepper still
  takes the plate (`added-kg`). Protocol, sets and rest unchanged
  (`back-strength`, 3 x 10, 90s).
- It replaces the 45-degree back extension **everywhere it appeared**: CAVE
  03 LEGS + BACK, HEAL 01 (which had used a stool; now the same mat version,
  shared, no override), the reserve's BACK group (now flagged `floor`, so NO
  FLOOR leaves it out), the BACK pack, BUILD's BACK and BACK + CORE preset,
  and any routine or kept edit that holds the id.
- DAILY 02's prone extension cue no longer points at "the 45-degree bench".
- **Test** (`cave-training.test.ts`): no exercise in the library names a
  45-degree back extension, roman chair, GHD, hip pad, rollers or a stool, and
  the back extension's setup names the radiator.

The retired benchmark `back-extension-hold` (Biering-Sorensen, history only)
still describes its old bench setup; ASSESS uses the prone (Ito) hold.

## 3. Verified

- `npx tsc --noEmit`
- `npm test`: 324 passing
- `npm run check:daily`, `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 10 passing

## 4. Repo state

Branch `claude/busy-gauss-xg88dk`, restarted from `main` at the v40 merge
(`3af4917`), one PR into `main`.

## 5. Open items

- The coach summary prints "(right)" after the LEFT ring finger loads in the
  RING FINGER section ("2.5 kg (right)"): a label bug in `coachSummary`, not
  yet fixed.
- The e2e seed (`e2e/fixtures/athlete.json`) still names the exercise
  "45-Degree Back Extension" in its load log; old logs keep their old names,
  which is how history works. `npm run seed` rewrites it if wanted.
- From the review: the climbing entries of 24-25 October to check (delete if
  they were watch drafts), the rehab frequency to match the physio's plan.
- Carried from v40 and v39: a BACK section in STATS, the coach trial,
  BUILD's extra sets on deload and TIRED days, grade tables approximate,
  input zoom checks, CAVE 01 at 84 min at levels 6-7, HEAL 01 at 89 of 90
  FRESH, undoing FINISH NOW leaves a Health workout, reminders do not read
  the weekly plan.

## 6. Next steps

- CAVE 03 or STRONG BACK / BACK + CORE: the back extension reads FLOOR BACK
  EXTENSION; test the radiator before the first rep.
- Put the plate's kilos on the stepper once hands behind the head is easy, so
  the load is tracked.

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
grep -rl "Floor Back Extension, Heels Anchored" out/_next/static | head -1
npx cap sync ios
grep -rl "Floor Back Extension, Heels Anchored" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v41 PR (the floor back extension).
- Both `grep` lines print a file name.
- In Xcode, press Shift+Cmd+K, then Cmd+R.

## 8. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/busy-gauss-xg88dk
git fetch origin --prune
git branch -a
```
