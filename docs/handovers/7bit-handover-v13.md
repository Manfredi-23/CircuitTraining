# 7BIT — Handover v13

**Date:** 3 October 2026
**Read this first, then v12.** This session was small: a review of how test
results are recorded, and an info popup on every session card. v12 is still the
reference for the athlete, the programme, the climb log and the graphics plan
(its sections 2, 3, 4 and 6); this document supersedes its repo state and open
items.

Working agreements are unchanged (v12 section 0, and `CLAUDE.md`): every
session ends with a new handover and with housekeeping, and every message that
changes the app ends with the Mac terminal commands.

---

## 1. What changed

### Session info popup

Every session card has an **i** button in its bottom bar, next to the
difficulty dots. Tapping it opens a full-screen list of what the session holds
**as it would run right now**: at today's capacity levels, the selected energy,
and with any locked exercise already swapped for its stand-in (marked
STAND-IN UNTIL TESTED in accent).

Each row shows the exercise name (the current variation), its block, the load
line, sets x reps or seconds (with /side), and rest. Then the session note, and
a START button that launches the session. X or Escape closes it.

- `src/components/shared/SessionInfo.tsx` + `.module.css`: new.
- `HomeScreen.tsx`: builds the list once (`buildList`) and uses it for both the
  card's minutes and the popup, so the two can never disagree.
- The panel is solid parchment rather than the translucent settings overlay:
  a list read over the card behind it was hard to read.

### Test recording: reviewed, unchanged

Verified end to end in Chromium on `main`. How it works today:

1. TEST tab, 01 ASSESS. Five tests, each a normal exercise card.
2. Each test card has a **stepper** in place of the load logger, labelled with
   what to enter: BEST 10S, ADDED (kg on the belt); BEST 5RM, ADDED; WEAKER
   SIDE (seconds); PROGRESSION HELD 10S (front lever level 0-5); FOOT RAISE,
   WEAKER (cm).
3. For kilo entries the stepper shows the converted value live, e.g. +15kg on
   the pull-up test reads **= 143% BW** (5RM to estimated 1RM at x1.15 of
   system mass, at 62kg bodyweight).
4. The result is saved as a benchmark on the **DONE of the last set** of that
   test (3 DONE taps for the pull-up, 4 for the max hang; SKIP REST shortens
   the rests). SKIP saves nothing. Other tests can be skipped freely.
5. Saved benchmarks open gates immediately: 143% opens the band-assisted
   one-arms in CAVE 01 and 02.

Gaps found (proposed to the athlete, not built):

- **No confirmation.** Nothing says "saved" on that last DONE.
- **Nowhere to see results.** `benchmarkResults` is never displayed: no list of
  what was recorded, when, or which gates it opened.
- **No direct entry.** A number already known (like +15kg x 5) can only be
  entered by running the session and tapping through every set.

Proposed fix: a RESULTS section in STATS listing each test with its last value
and date, the gate it opens (open / needs N%), and an EDIT that uses the same
stepper to record a result without running the session. Plus a short "saved:
143% BW" line on the complete screen after ASSESS.

---

## 2. Repo state

`main` includes this session's PR (see the PR list on GitHub; the last merge
is the "session info popup" PR). Builds; `check:daily` PASS; `check:cave` OK.

Still on GitHub because the session proxy refuses branch deletion (delete in
GitHub's branch view, or enable *Automatically delete head branches*):
`claude/assess-tab-drop-power`, `claude/climb-log`,
`claude/dot-matrix-illustrations`, `claude/programme-v12`,
`claude/handover-v12`, `claude/session-info-popup`.

Stale, unmerged, never a PR: `claude/exercise-form-guide-pdf-kzrz1x`, a
printed form guide for the old programme. Awaiting a decision: delete, or
rebuild for the current sessions.

---

## 3. Open items

1. **Test results UI** (section 1): results list, direct entry, save
   confirmation. Waiting on the athlete's go.
2. **Record the weighted pull-up** (+15kg x 5 = 143%) once 1 exists, or now
   through ASSESS.
3. **DAILY 04 raises the finger caution banner** on CAVE 01 (light no-hangs
   stamp `crimp`/`openhand` `lastTrained`). Warning only.
4. **CAVE 01 STRONG** runs 71-83 min NORMAL; **CAVE 03** has 15 minutes spare.
5. The athlete is still reviewing every exercise from the printed programme.
6. Graphics rework (v12 section 6): waiting on the athlete's logo and frames.
7. Still planned: Vitest around `src/core/`, Supabase, Vercel production.

---

## 4. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

```bash
# Get the latest
git checkout main
git pull
npm install

# Check it
npx tsc --noEmit
npm run check:daily
npm run check:cave

# Browser (http://localhost:3000)
npm run dev

# iPhone
npm run build
npx cap sync ios
npx cap open ios          # then Cmd+R in Xcode
```

Full set (illustrations, icon, housekeeping): v12 section 9.
