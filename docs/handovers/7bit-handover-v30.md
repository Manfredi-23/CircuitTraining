# 7BIT — Handover v30

**Date:** 22 October 2026
**Read this first**, then v29 (the LED redesign) and v28 (tab bar, routines,
plan, STATS tabs). Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete liked the LED redesign and asked for a last polish pass:

1. The dotted numbers are loved but hard to read: make the dots larger.
2. Sections sit too close together and are hard to tell apart: more space,
   or very subtle dividers, so the hierarchy reads at a glance.

## 2. What changed

### LED numerals

- Dots set closer: the pitch went from 1.5 to 1.3 dot widths, so the strokes
  read as lines rather than scattered dots.
- Every size up:

| Where | Before | Now |
|---|---|---|
| List numbers (TRAIN, ALSO FITS TODAY) | 3px | 4px |
| START minutes | 3px | 4px |
| STATS overview figures | 4px | 5px |
| Next reps on rest | 4px | 5px |
| Rest countdown | 4px | 5.4px (ring 168 to 196px, dots 3.4px) |
| Card session number | 5px | 6px |
| Workout reps | 7px | 8px |
| Tab icons | 3px | 3.6px |

### Sections

- A divider in the app's own language: one row of faint LED dots
  (`--rule`, `.dot-rule` in `globals.css`), with 26px of air under it.
- Used before every section that follows another: TODAY (the pick, ALSO
  FITS TODAY), every STATS section and WHAT STANDS OUT, TRAIN MINE (BUILD,
  THIS WEEK), each day in LOG, and between sections of the session and
  exercise pages, the routine editor, the BUILD sheet and Settings.
- More space between sections than inside them: `--section-gap` 28-36px
  between, 12-14px within. Section labels unified at 12-13px bold, tracked
  0.12em.
- The load line on the rest screen is now ink, as it is on the workout card.

## 3. Verified

`npx tsc --noEmit`, `npm test` (241 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`, `npm run test:e2e` (6 passing).
Looked at TODAY, STATS overview and BODY, LOG, workout and rest at 390px;
`docs/screenshots/v30-*.png`.

## 4. Repo state

Branch `claude/beautiful-curie-6oh123` restarted from `main` after the v29
merge, one PR to `main`, merged once both checks are green.

## 5. Open items

Carried from v28/v29: check the LED ring and countdown on the phone; Health
outdoor workouts on the phone; the Monday summary; reminders do not read the
weekly plan; FINISH NOW has no UNDO.

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
grep -rl "dot-rule" out/_next/static | head -1
npx cap sync ios
grep -rl "dot-rule" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v30 PR.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. The numerals are larger and sections
  are separated by rows of faint dots.

## 7. Mac housekeeping (after the merge only)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/beautiful-curie-6oh123
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`.
