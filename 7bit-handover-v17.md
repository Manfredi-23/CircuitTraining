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

Then, from the same ASSESS: the front lever ramp, the trunk flexor hold and
the back extension hold were skipped. The athlete tests alone, the gym
reliably has only a bar, and a front lever cannot be graded alone. Those three
were replaced with tests that need only a bar or a mat and score themselves.

Last, a mat-only DAILY for the core, weighted to the obliques, with
push-ups, Russian twists, spidermans and mountain climbers. The athlete chose
to rebuild DAILY 01, which keeps DAILY 02's lower-back work as it was.

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
- **ASSESS, bar and mat only.** Front lever ramp -> max strict
  **toes-to-bar** (TRUNK, a rep counts only if the toes touch). McGill
  trunk flexor hold -> **hollow body hold** (ends when the lower back leaves
  the mat). Back extension hold (Biering-Sorensen) -> **prone extension
  hold**, the Ito test (face down, breastbone just off the floor). New
  benchmarks `toes-to-bar`, `hollow-hold`, `prone-extension-hold`, with no
  standards: tracked against your own results. The old three benchmarks stay,
  so any results show as history, sorted last in STATS. The McGill ratios
  now show only left / right side bridge unless old flexor or extensor
  results exist. ASSESS is now 76 min NORMAL, 88 TIRED (was 81).
  `src/core/__tests__/assess.test.ts` checks every ASSESS result maps to a
  benchmark and none of the retired ones is recorded.
- **DAILY 01 is now CORE + OBLIQUES, mat only** (13 min NORMAL, 19 FRESH,
  8 TIRED): 90/90 breathing, dead bug (no band), push-up on fists 2x10
  (`daily-pushup`, hypertrophy, 45s), spiderman plank 2x6/side
  (`daily-spiderman`), cross-body mountain climber 2x12 (`daily-mountain-climber`),
  then reverse crunch and Russian twist, curling last as always. The band
  dead bug, band leg lowers, band press-out, hollow hold and slow crunch
  left the session: first built with side plank dips and the hollow hold,
  it ran 30 min on FRESH, so exercises were cut, never rests. The Russian
  twist is now one shared `RUSSIAN_TWIST` for DAILY 01 and 02; `CRUNCH` is
  gone. The new plank drills count as oblique sets in STATS core volume.
  Abs (rectus) volume is lower than before; the core-volume panel will show
  it.
- New core module `src/core/session-progress.ts` (`sessionProgress`), tested
  in `src/core/__tests__/session-progress.test.ts`.
- New shared components `SessionProgressBar` and `FormGuide` (the guide was
  lifted out of `WorkoutScreen` so rest can use it).

## 3. Verified

`npx tsc --noEmit`, `npm test` (71 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`. Walked TEST 01 and CAVE 01 in a
390 x 844 browser: workout card, rest before another set, rest before a new
exercise. Largest session is CAVE 01 FRESH at 38 sets over 10 exercises;
ASSESS is 31 cells over 18 groups, both fit the 342px width.

## 4. Repo state

Merged: PR #25 (rest preview, `claude/rest-preview-progress`), #26 (ASSESS,
`claude/assess-bar-and-mat`), and the DAILY 01 PR after it
(`claude/daily-core-obliques`). Delete the three branches from the Mac if the
cloud proxy refused (section 6). Otherwise as
in v16: no open PRs, `main` is the latest.

## 5. Open items

1. Try the rest preview on the phone during a real session: whether the form
   guide should also open for every set, and whether the load stepper belongs
   on rest too (left on the card for now, so a load is never set from two
   places).
2. The next ASSESS is the first baseline for toes-to-bar, hollow hold and
   prone extension: no comparison until the one after.
3. DAILY 01 after a week: if the abs fall short of 12 hard sets in STATS
   core volume, the slow crunch can come back into DAILY 02 only by cutting
   something there (02 is at 20 min FRESH).
4. Everything open in v16 section 5 still stands (Xcode build and
   capabilities, ASSESS retest, graphics rework, Supabase, Vercel).

## 6. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

```bash
git checkout main
git pull
git branch -d claude/rest-preview-progress 2>/dev/null
git push origin --delete claude/rest-preview-progress 2>/dev/null
git branch -d claude/assess-bar-and-mat 2>/dev/null
git push origin --delete claude/assess-bar-and-mat 2>/dev/null
git push origin --delete claude/daily-core-obliques 2>/dev/null
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
