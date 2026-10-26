# 7BIT — Handover v37

**Date:** 26 October 2026
**Read this first**, then v36 (the roomier editor) and v35 (EDIT before
START). Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

After v36 the athlete said: "the swap screen is still WAY too crowded and
dense and un-usable". Their screenshot showed why: the search box opened the
keyboard by itself, and iOS zoomed the page in on it (the search text was
14px; under 16px iOS zooms on focus), so the screen ran off both edges.

## 2. What changed

- **`ExercisePicker` no longer focuses the search.** Its text is 16px, so
  iOS does not zoom.
- **A swap opens on SIMILAR only.** At the top, under INSTEAD OF, is the
  exercise being swapped, large. Below it are up to eight similar exercises
  in roomy rows (72px, 15px names), each with USE. **SEARCH ALL EXERCISES**
  opens the search, the area filters and the whole list, and **BACK TO
  SIMILAR** returns. ADD EXERCISE (nothing to swap) opens straight on the
  search, without the keyboard.
- **A warm-up's SIMILAR list is the other warm-ups** (`similarTo`).
- The routine editor's SWAP gets the same screen (`replacing`).
- The crumb is just SWAP; the name moved into the INSTEAD OF line.

## 3. Verified

All of these passed:
- `npx tsc --noEmit`
- `npm test`: 280 passing. `session-edit.test.ts` now also checks the
  warm-up alternatives.
- `npm run build`
- `npm run test:e2e`: 8 passing. The EDIT test now also checks SEARCH ALL
  EXERCISES.

Checked by screenshot at 390 px.

## 4. Repo state

Branch `claude/zealous-dijkstra-n51wbg`, restarted from `main` at the v36
merge (`a60b6ba`), with one PR to `main`.

## 5. Open items

- Other text inputs (BUILD, settings, the climb and activity logs, the
  routine name) were not checked for the iOS zoom. Any under 16px zooms on
  focus.
- Carried from v35 / v34 as listed there.

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
grep -rl "SEARCH ALL EXERCISES" out/_next/static | head -1
npx cap sync ios
grep -rl "SEARCH ALL EXERCISES" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v37 PR.
- Both `grep` lines print a file name.
- In Xcode, press Shift+Cmd+K, then Cmd+R.

## 7. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/zealous-dijkstra-n51wbg
git fetch origin --prune
git branch -a
```
