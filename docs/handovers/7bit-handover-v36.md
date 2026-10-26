# 7BIT — Handover v36

**Date:** 26 October 2026
**Read this first**, then v35 (EDIT before START). Working agreements
unchanged (`CLAUDE.md`).

---

## 1. What this session was

After v35 the athlete said: "NOT BAD! but the UI is a bit crowded! work it
out to add some margins and breathing room!"

## 2. What changed

UI only; no behaviour changed.

- **The session editor has its own stylesheet** (`SessionEditor.module.css`).
  It no longer borrows `RoutineEditor.module.css`, so the routine editor is
  untouched.
- **Each exercise is its own outlined card**, 14px apart, with 16px of
  padding:
  - the number, the name on its own line, and its block (plus YOURS when
    added); X to remove sits top right;
  - **SETS** and **REPS** (or SECONDS, / SIDE) as labelled steppers, side
    by side, 44px tall;
  - **LOAD TODAY** as a full-width stepper, with "as last time" or BACK TO
    LAST TIME;
  - up / down and SWAP at the foot, under a faint rule.
- More air around the head of the editor, the + EXERCISE / + PACK buttons,
  the FOR NEXT TIME chips, and the sections (`--section-gap`).
- **Packs** have their own stylesheet (`PackList.module.css`):
  - each row has 18px top and bottom;
  - the name, then the minutes in grey;
  - what the pack is for, then the exercises it adds;
  - a closed pack says why in orange.

  The reserve's PACKS tab gets the same look.

## 3. Verified

All of these passed:
- `npx tsc --noEmit`
- `npm test`: 280 passing
- `npm run build`
- `npm run test:e2e`: 8 passing

Checked by screenshot at 390 px.

## 4. Repo state

Branch `claude/zealous-dijkstra-n51wbg`, restarted from `main` at the v35
merge (`73f37d5`), with one PR to `main`.

## 5. Open items

Unchanged from v35.

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
grep -rl "LOAD TODAY" out/_next/static | head -1
npx cap sync ios
grep -rl "LOAD TODAY" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v36 PR.
- Both `grep` lines print a file name.
- In Xcode, press Shift+Cmd+K, then Cmd+R.

## 7. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/zealous-dijkstra-n51wbg
git fetch origin --prune
git branch -a
```
