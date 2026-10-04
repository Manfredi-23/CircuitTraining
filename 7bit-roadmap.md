# 7BIT — Improvement Roadmap

**Started:** 4 October 2026. Agreed with the athlete: build all of it, in
small chunks. This file is the plan; the handovers record what was actually
done. Tick a chunk here when its PR merges.

---

## Principles

1. **Data first, then logic, then pictures, then the phone.** Every chart and
   every reminder reads data that has to be recorded first, and every new piece
   of data has to be backed up before it is worth anything.
2. **One phase, one PR; one chunk, one commit.** Each chunk leaves `main`
   building, with `check:daily`, `check:cave` and `npm test` green.
3. **Logic lives in `src/core/` and is tested there.** Each chunk that adds
   core logic adds its Vitest file in the same commit.
4. **Native last and isolated.** HealthKit, reminders and the widget sit behind
   `src/native/` and the platform check, like everything else there: the web
   build never depends on them. Swift cannot be compiled in the cloud session,
   so native chunks ship as "written, verify in Xcode" and their handover
   says so.
5. **Suggest, never override.** Health data, pain scores and load suggestions
   propose a choice; the athlete makes it. The one exception is a high pain
   score, which removes the finger work from that session.
6. **Nothing changes the training model silently.** Protocol values (rest,
   sets, intensity) stay where `protocols.ts` puts them; new logic moves
   loads, sets on a deload week, and what is recommended.

---

## Phase 1 — Safety net

| # | Chunk | Notes |
|---|-------|-------|
| 1.1 | [ ] Backup: export and import all data as JSON from Settings | Share sheet on iOS, file download on web, clipboard fallback. Import validates and asks before replacing. |
| 1.2 | [ ] Vitest around `src/core/` | The four invariants from CLAUDE.md, then a test file per new core module. |

## Phase 2 — Record what matters

| # | Chunk | Notes |
|---|-------|-------|
| 2.1 | [ ] Session effort (1-10) on the complete screen; planned sets in the session log | sRPE x minutes is the training load unit. Planned sets let the app tell "all sets done" from "cut short". |
| 2.2 | [ ] Climb log: duration and effort | Optional fields, so old entries still read. |
| 2.3 | [ ] Finger and wrist pain check before finger sessions | 0-2 as written, 3-5 TIRED caps applied, 6+ finger work removed. Score saved on the session. |

## Phase 3 — Training logic

| # | Chunk | Notes |
|---|-------|-------|
| 3.1 | [ ] Training load: daily sRPE load (climbing included), weekly totals, acute:chronic ratio | `src/core/training-load.ts`. |
| 3.2 | [ ] Mesocycle: three build weeks, one deload week | Uses `recovery.mesocycleWeeks`. Deload: one set fewer on PRIMARY and SECONDARY work, loads held. Block start persisted, restartable from Settings. |
| 3.3 | [ ] Suggested next load | Previous load + one step when every planned set was done and the session felt 8 or easier; hold otherwise. Shown on the stepper, one tap to take it. |
| 3.4 | [ ] XP for personal bests | +1 when a logged load beats the previous best, +2 when a test improves. |
| 3.5 | [ ] Recommended session on the home screen | Readiness, deload week, neglected capacities, core volume. Home opens on it. |
| 3.6 | [ ] Rest +60s; DAILY 04 no longer trips the CAVE 01 finger warning | v15 open items 1 and 4. |

## Phase 4 — Visualisations

| # | Chunk | Notes |
|---|-------|-------|
| 4.1 | [ ] LOAD section: weekly load bars, acute:chronic ratio | From 3.1. |
| 4.2 | [ ] FRESHNESS section: days since trained against decay grace, per capacity | |
| 4.3 | [ ] ONE-ARM PATH: pull-up 2RM %BW against the 131% / 141% gates, projected date | |
| 4.4 | [ ] FINGERS: pain against weekly finger load | From 2.3 and 3.1. |
| 4.5 | [ ] SKIPPED: exercises cut short most often | From 2.1. |

## Phase 5 — Reminders (local notifications, iOS)

| # | Chunk | Notes |
|---|-------|-------|
| 5.1 | [ ] `src/core/reminders.ts`: plan the next reminders from state | Fingers recovered, capacity about to decay, core behind on Thursday, DAILY morning, ASSESS retest due, climb not logged. Pure and tested. |
| 5.2 | [ ] Schedule them on app open, foreground and session end; switches and a DAILY time in Settings | Reuses `@capacitor/local-notifications`; one id range per reminder kind, so rescheduling replaces. |

## Phase 6 — Apple Health

Waiting on two answers: an Apple Watch worn at night (sleep stages and HRV),
and a smart scale (bodyweight).

| # | Chunk | Notes |
|---|-------|-------|
| 6.1 | [ ] `HealthPlugin.swift` local plugin + `src/native/health.ts` bridge; Settings: CONNECT APPLE HEALTH | HealthKit capability, usage strings. Reads sleep, HRV (SDNN), resting HR, body mass, workouts. |
| 6.2 | [ ] Morning readiness: suggest FRESH / NORMAL / TIRED from sleep and HRV against a 7-day baseline | Suggestion with its reason on the home card. |
| 6.3 | [ ] Bodyweight sync into the bodyweight benchmark | |
| 6.4 | [ ] Watch climbing workouts become draft climb log entries | |
| 6.5 | [ ] Completed sessions written to Health as workouts | |
| 6.6 | [ ] STATS: sleep and HRV against session effort and loads | |

## Phase 7 — Widget

| # | Chunk | Notes |
|---|-------|-------|
| 7.1 | [ ] Home and lock screen widget: today's recommended session, finger recovery countdown | App Group shared with `RestTimerWidget`. |
