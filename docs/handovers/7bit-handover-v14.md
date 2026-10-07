# 7BIT — Handover v14

**Date:** 3 October 2026
**Read this first, then v12.** v12 remains the reference for the athlete, the
programme, the climb log and the graphics plan (its sections 2, 3, 4 and 6).
v13 added the session info popup. This document supersedes both for repo state
and open items.

Working agreements unchanged (`CLAUDE.md`): new handover and housekeeping every
session; Mac terminal commands after every change.

---

## 1. What changed

### TEST 01 ASSESS: the full battery, one gym session

Was 5 tests; now 17, one session, about 86 minutes. Order follows neurological
cost:

| # | Test | Entered as | Benchmark |
|---|------|-----------|-----------|
| 1 | Bodyweight | kg (scale) | `bodyweight` |
| — | Pulse raiser, finger warm-up | | |
| 2 | Max hang 20mm | kg added | `fs-2arm-20mm` (% BW) |
| 3 | One-arm block pull 20mm | kg lifted, weaker hand | `fs-1arm-20mm` (% BW) — new |
| 4 | Weighted pull-up 5RM | kg added | `weighted-pullup` (% BW est. 1RM) |
| 5 | Max strict pull-ups | reps | `max-pullups` — new in ASSESS |
| 6 | 90-degree lock-off | s, weaker side | `lockoff-90` |
| 7 | Front lever | level 0-5 | `front-lever` |
| 8 | Hanging leg raises | reps | `leg-raise-reps` — new |
| 9 | Hollow hold | s | `hollow-hold` — new |
| 10 | Side plank | s, weaker side | `side-plank` — new |
| 11 | Back extension hold (Biering-Sorensen) | s | `back-extension-hold` — new |
| 12 | Max push-ups | reps | `max-pushups` — new |
| 13 | 7:3 repeaters to failure 20mm | hangs | `repeaters-20mm` — new |
| 14 | Foot raise | cm | `hip-footraise` |
| 15 | Straddle | cm | `straddle` — new |
| 16 | Sit and reach | cm past toes | `sit-reach` — new |
| 17 | Overhead reach gap | cm, lower is better | `shoulder-reach` — new |

- **Bodyweight first.** Every % bodyweight result now converts against the
  latest recorded bodyweight (`currentBodyweight`), falling back to
  `ATHLETE.bodyweightKg` (62) until one exists.
- New conversion `kg-to-pct-bw` for the one-arm block pull.
- New axis unit `reps`.
- Standards: published where they exist (Lattice, McGill trunk endurance
  norms, Biering-Sorensen), marked approximate where they are general norms,
  and empty ("tracked against yourself") where nothing credible exists.
  `Benchmark.better: 'lower'` for the overhead reach gap.
- Steppers on test cards now say "saved on the last DONE"; the complete screen
  after ASSESS lists every result saved that day.

### Benchmark history

`benchmarkResults` keeps every result now (`addResult`): one per test per day, a
same-day re-run replaces. `latestResult` decides gates (`meetsStandard`).
Results recorded before this change are kept and become the first entry.

### Session log records sets

`SessionLogEntry.sets` is a per-exercise count of sets marked DONE, written on
session complete. Older entries do not have it.

### STATS

New pure module `src/core/insights.ts`; components in
`src/components/shared/StatsSections.tsx`. Order on the screen:

1. **WEEKS** — 12-week dot grid, one dot per day: climb (accent), CAVE (ink),
   DAILY (dim), TEST (ring). Retired modes in old logs map onto today's tabs.
   "This week" counts underneath.
2. **CORE THIS WEEK** — hard sets since Monday against the targets (abs 12,
   obliques 10, lower back 9), one cell per set, overflow in accent. Exercise
   lists in `CORE_EXERCISES`. Counts only sessions logged with `sets`.
3. **TESTS** — every test with a result: value, change since the previous
   test, a bar with the published standards as ticks and the next boulder
   grade's standard in accent, the standard reached and the next one.
4. **LIFTS** — every logged load (tests excluded), sparkline, latest value and
   change since the first entry. Eight most recent.
5. **CAPACITIES** — level bar to the next level; "fades in Nd" from 5 days
   out, "fading now" once decay has started.
6. Existing OVERVIEW and CLIMBING sections.
7. **CLIMBING VS PULLING** — best send per week in the most-used climb view
   above heaviest weighted pull-up per week, same 12 weeks, separate scales.

Verified in Chromium with 12 weeks of seeded history and a real ASSESS run
(bodyweight 63 then +15kg x 5 = 142% BW).

---

## 2. Repo state

`main` includes this session's PR ("Full ASSESS battery, test history and new
STATS sections"). Builds; `check:daily` PASS; `check:cave` OK.

Merged branches still on GitHub (the session proxy refuses deletion):
`claude/assess-tab-drop-power`, `claude/climb-log`,
`claude/dot-matrix-illustrations`, `claude/programme-v12`,
`claude/handover-v12`, `claude/session-info-popup`, `claude/assess-stats`.
Delete them in GitHub's branch view, or enable *Automatically delete head
branches*.

Stale and unmerged: `claude/exercise-form-guide-pdf-kzrz1x` (old-programme
form guide). Awaiting a decision.

---

## 3. Open items

1. **Direct result entry.** Results can only be entered by running ASSESS. An
   EDIT in STATS > TESTS was proposed and not yet asked for.
2. **Core volume starts empty.** It only counts sessions finished from this
   version on.
3. **DAILY 04 raises the finger caution banner** on CAVE 01 (light no-hangs
   stamp `lastTrained`). Warning only.
4. **The next-grade marker** on finger tests uses `targetsForBoulderGrade`
   with `ATHLETE.boulder` (7a). Update the profile if the grade moves.
5. CAVE 01 STRONG runs 71-83 min; CAVE 03 has 15 minutes spare.
6. Graphics rework (v12 section 6): waiting on the logo and frames.
7. Still planned: Vitest around `src/core/`, Supabase, Vercel production.

---

## 4. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

```bash
git checkout main
git pull
npm install

npx tsc --noEmit
npm run check:daily
npm run check:cave

npm run dev                     # browser, http://localhost:3000

npm run build
npx cap sync ios
npx cap open ios                # Xcode: scheme App (not RestTimerWidget), Cmd+R
```

Full set (illustrations, icon, housekeeping): v12 section 9.
