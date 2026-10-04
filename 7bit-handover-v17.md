# 7BIT — Handover v17

**Date:** 4 October 2026
**Read this first**, then v16 (the improvement roadmap and the Xcode steps it
still needs). Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete, mid-ASSESS, asked for two things on every session: rest should
show what is coming next, with its form guide, so there is time to get ready;
and a progress bar that shows both the set within the exercise and the place
in the whole session.

## 2. What changed

- **Rest shows what is next.** Under a smaller ring (with +60S and SKIP REST
  beside it) sits an outlined card: UP NEXT for a new exercise, NEXT SET for
  another set of the same one, with block or section, set or attempt number,
  name, work, load prescription and note. Ramp tests show the best clean
  attempt so far. The FORM GUIDE follows, **open** for a new exercise and
  folded for another set (it was just read on the card). The rest screen is
  now fixed height so the timer stays in view while the preview scrolls.
- **Set-by-set progress bar** on the workout card and on rest: one cell per
  set, grouped by exercise. Done in ink, the set in hand in accent (on rest,
  the set coming up), the rest faint. Below it, EXERCISE n/N and done/total
  SETS. It replaces the old one-line bar and the n/N in the workout header.
  Ramps draw their expected attempts and grow a cell at a time if the ladder
  runs past them, up to the hard stop. Skipped exercises count as passed:
  the bar is position, not achievement.
- New core module `src/core/session-progress.ts` (`sessionProgress`), tested
  in `src/core/__tests__/session-progress.test.ts`.
- New shared components `SessionProgressBar` and `FormGuide` (the guide was
  lifted out of `WorkoutScreen` so rest can use it).

## 3. Verified

`npx tsc --noEmit`, `npm test` (68 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`. Walked TEST 01 and CAVE 01 in a
390 x 844 browser: workout card, rest before another set, rest before a new
exercise. Largest session is CAVE 01 FRESH at 38 sets over 10 exercises;
ASSESS is 31 cells over 18 groups, both fit the 342px width.

## 4. Repo state

This work merged as one PR from `claude/rest-preview-progress`; branch
deleted from the Mac if the cloud proxy refused (section 6). Otherwise as
in v16: no open PRs, `main` is the latest.

## 5. Open items

1. Try the rest preview on the phone during a real session: whether the form
   guide should also open for every set, and whether the load stepper belongs
   on rest too (left on the card for now, so a load is never set from two
   places).
2. Everything open in v16 section 5 still stands (Xcode build and
   capabilities, ASSESS retest, graphics rework, Supabase, Vercel).

## 6. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

```bash
git checkout main
git pull
git branch -d claude/rest-preview-progress 2>/dev/null
git push origin --delete claude/rest-preview-progress 2>/dev/null
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

The Xcode capability steps and on-phone checks from v16 section 6 still
apply if not done yet.
