# 7BIT — Handover v44

**Date:** 6 November 2026
**Read this first**, then v43. Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete asked for **the patatometro** at the bottom of TODAY: one tap to
say whether there was patata that day, so that over time the app can say
when patata is at its highest, with FLUELA and OERLIKON kept apart.

Questions asked first, and the answers:

1. Time of day: **yes, saved with every tap**. The stats look for when
   patata is at its **highest**.
2. The gyms: **a FLUELA | OERLIKON toggle** that remembers the last gym,
   then PATATA / NO PATATA.
3. When shown: **always**, folded to one line like ALSO FITS.
4. The stats: **inside the PATATOMETRO section on TODAY**, nothing in STATS.
5. Several taps on one day at one gym: **keep every tap**.

## 2. What changed

- **`src/core/patata.ts`** (new, pure): the reading (`id`, `at`, `gym`,
  `patata`), the slots (BEFORE 12, 12-16, 16-18, 18-20, AFTER 20), the
  observations (one per gym, day and slot; patata if any tap in it said
  so), the weekday x slot grid per gym with DAY and ALL totals, the peak
  (named once a cell has been seen twice with patata at least once, ranked by
  (yes + 1) / (n + 2), so one lucky visit never beats 4 of 5), the headline,
  now and the rest of today, visits with patata per gym, the folded line.
- **`src/store/slices/patata-slice.ts`** (new): `patataLog`, `logPatata`,
  `deletePatata`; both offer UNDO through the history slice.
- **`patataLog` is persisted and in backups** (`PERSISTED_KEYS`, an array key).
- **`Patatometro.tsx`** (new) closes TODAY, after ALSO FITS. Folded: today's
  last tap (orange when it was PATATA), else "Most patata: OERLIKON, TUE
  18-20", else "Was there patata today? One tap." Open: the gym toggle,
  PATATA / NO PATATA (with a haptic tap on the phone), today's taps with X,
  then WHEN THERE IS PATATA: the peak in one sentence, now at each gym, the
  best of the rest of today, visits with patata per gym, and the selected
  gym's grid (darker cells for more patata, the peak outlined in orange).
- **Fixed on the way**: RESET ALL DATA and a backup import left
  `sessionEdits` and `exerciseNotes` from the device in place, against
  "keys the backup does not carry start empty". They are cleared now, with
  `patataLog`.
- **Tests**: `patata.test.ts` (8), one Playwright test (tap at OERLIKON, the
  folded line, UNDO, kept over a reload with the gym, the peak cell).
- Screenshots: `docs/screenshots/v44-patatometro-folded.png`,
  `v44-patatometro-open.png` (a sample history, not the seed).

## 3. Verified

- `npx tsc --noEmit`
- `npm test`: 370 passing
- `npm run check:daily`, `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 12 passing
- TODAY at 390 x 844: no horizontal scroll, no console errors.

## 4. Repo state

Branch `claude/dazzling-franklin-92a4zm` from `main` at the v43 merge
(`b56f06b`), one PR into `main`. Before this session the remote held only
`main`.

## 5. Open items

- **The time is the time of the tap.** A tap made at home after the visit
  lands in the evening slot. Tap at the gym; an "earlier" picker could come
  later if it matters.
- The slots are a first guess at gym hours. Change `PATATA_SLOTS` if the
  visits cluster differently; old taps are re-read, nothing is stored per slot.
- Not in the coach text, STATS or LOG, by the athlete's choice. Deleting is
  only for today's taps (and UNDO); older taps go with a backup edit or not
  at all.
- Carried from v43: the weekly plan holding an area, BODY_BANDS to tune,
  HEAL 05's `footwork` protocol key, and the rest of v43's list.

## 6. Next steps

- Tap every visit for a few weeks, at both gyms, NO PATATA included: a
  slot needs two looks before it can be named.

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
grep -rl "WHEN THERE IS PATATA" out/_next/static | head -1
npx cap sync ios
grep -rl "WHEN THERE IS PATATA" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v44 PR (the patatometro).
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. TODAY ends with PATATOMETRO.

## 8. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/dazzling-franklin-92a4zm
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`
(skip a delete line that says the branch does not exist).
