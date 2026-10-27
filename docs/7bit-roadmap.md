# 7BIT — Improvement Roadmap

**Started:** 4 October 2026. **All chunks built the same day**; phases 6 and 7
are Swift and still need checking on a device (handover v16, section 6). Agreed with the athlete: build all of it, in
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
| 1.1 | [x] Backup: export and import all data as JSON from Settings | Share sheet on iOS, file download on web, clipboard fallback. Import validates and asks before replacing. |
| 1.2 | [x] Vitest around `src/core/` | The four invariants from CLAUDE.md, then a test file per new core module. |

## Phase 2 — Record what matters

| # | Chunk | Notes |
|---|-------|-------|
| 2.1 | [x] Session effort (1-10) on the complete screen; planned sets in the session log | sRPE x minutes is the training load unit. Planned sets let the app tell "all sets done" from "cut short". |
| 2.2 | [x] Climb log: duration and effort | Optional fields, so old entries still read. |
| 2.3 | [x] Finger and wrist pain check before finger sessions | 0-2 as written, 3-5 TIRED caps applied, 6+ finger work removed. Score saved on the session. |

## Phase 3 — Training logic

| # | Chunk | Notes |
|---|-------|-------|
| 3.1 | [x] Training load: daily sRPE load (climbing included), weekly totals, acute:chronic ratio | `src/core/training-load.ts`. |
| 3.2 | [x] Mesocycle: three build weeks, one deload week | Uses `recovery.mesocycleWeeks`. Deload: one set fewer on PRIMARY and SECONDARY work, loads held. Block start persisted, restartable from Settings. |
| 3.3 | [x] Suggested next load | Previous load + one step when every planned set was done and the session felt 8 or easier; hold otherwise. Shown on the stepper, one tap to take it. |
| 3.4 | [x] XP for personal bests | +1 when a logged load beats the previous best, +2 when a test improves. |
| 3.5 | [x] Recommended session on the home screen | Readiness, deload week, neglected capacities, core volume. Home opens on it. |
| 3.6 | [x] Rest +60s; DAILY 04 no longer trips the CAVE 01 finger warning | v15 open items 1 and 4. |

## Phase 4 — Visualisations

| # | Chunk | Notes |
|---|-------|-------|
| 4.1 | [x] LOAD section: weekly load bars, acute:chronic ratio | From 3.1. |
| 4.2 | [x] FRESHNESS section: days since trained against decay grace, per capacity | |
| 4.3 | [x] ONE-ARM PATH: pull-up 2RM %BW against the 131% / 141% gates, projected date | |
| 4.4 | [x] FINGERS: pain against weekly finger load | From 2.3 and 3.1. |
| 4.5 | [x] SKIPPED: exercises cut short most often | From 2.1. |

## Phase 5 — Reminders (local notifications, iOS)

| # | Chunk | Notes |
|---|-------|-------|
| 5.1 | [x] `src/core/reminders.ts`: plan the next reminders from state | Fingers recovered, capacity about to decay, core behind on Thursday, DAILY morning, ASSESS retest due, climb not logged. Pure and tested. |
| 5.2 | [x] Schedule them on app open, foreground and session end; switches and a DAILY time in Settings | Reuses `@capacitor/local-notifications`; one id range per reminder kind, so rescheduling replaces. |

## Phase 6 — Apple Health

Built to work with whatever Health holds: sleep and HRV need a watch worn at
night, bodyweight needs a scale or manual entries in Health. Missing data
simply leaves that feature quiet.

| # | Chunk | Notes |
|---|-------|-------|
| 6.1 | [x] `HealthPlugin.swift` local plugin + `src/native/health.ts` bridge; Settings: CONNECT APPLE HEALTH | HealthKit capability, usage strings. Reads sleep, HRV (SDNN), resting HR, body mass, workouts. |
| 6.2 | [x] Morning readiness: suggest FRESH / NORMAL / TIRED from sleep and HRV against a 7-day baseline | Suggestion with its reason on the home card. |
| 6.3 | [x] Bodyweight sync into the bodyweight benchmark | |
| 6.4 | [x] Watch climbing workouts become draft climb log entries | |
| 6.5 | [x] Completed sessions written to Health as workouts | |
| 6.6 | [x] STATS: sleep and HRV against session effort and loads | |

## Phase 7 — Widget

| # | Chunk | Notes |
|---|-------|-------|
| 7.1 | [x] Home and lock screen widget: today's recommended session, finger recovery countdown | App Group shared with `RestTimerWidget`. |

## Phase 8 — Usability (October 2026, handover v28)

Asked for by the athlete: separate the recommended session from the
programme and from their own, make building their own easy, split STATS,
make it smarter, and review the UI with the taste skill.

| # | Chunk | Notes |
|---|-------|-------|
| 8.1 | [x] Tab bar: TODAY, TRAIN, STATS, LOG | TODAY leads with one session; TRAIN is the library; LOG is history. |
| 8.2 | [x] Routines: fixed lists, MAKE IT MINE, a BUILD preview saved as a routine | Same engine, gates and pain check; rest never editable. |
| 8.3 | [x] Weekly plan | Leads TODAY unless a safety rule stops it, and says which. |
| 8.4 | [x] STATS in four tabs, a sentence on each section, an exercise page | |
| 8.5 | [x] Session history: read back, correct effort, delete, UNDO | |
| 8.6 | [x] How each lift felt; deload now / skip a deload; stalled lifts; Monday summary | `adapt.ts`. |
| 8.7 | [x] Health outdoor workouts into the activity log | Swift written, not compiled in the cloud session. |
| 8.8 | [x] Playwright smoke tests | `npm run test:e2e`. |
| 8.9 | [x] Taste-skill review: contrast, text size, accent on data and one action | |

## Phase 9 — The LED redesign (handover v29)

| # | Chunk | Notes |
|---|-------|-------|
| 9.1 | [x] LED numerals and pixel tab icons | `led-font.ts`, `Led`. |
| 9.2 | [x] The week rail on TODAY | `week-rail.ts`, `WeekRail`. |
| 9.3 | [x] The LED rest ring; dot-grid paper; type scale | |
| 9.4 | [x] Polish: larger LED dots, dotted section rules, more space between sections | Handover v30. |

---

# Part two: the climbing weapon (handover v38)

**Agreed:** 27 October 2026, after a brainstorm with the athlete. The off-wall
programme was strong; the app barely saw the climbing itself. Goals: **7c,
then 8a, in boulder and sport**. What holds the athlete back, in their own
words: **technique and feet, then the head** ("I'm scared and I rarely give
110%"), and **stamina** with little rope time. The ring finger still heals: it
is usable, bad only when isolated.

Rules agreed for this part:

1. **Suggest, never remove.** While a finger heals, exercises and grips are
   labelled NOT RECOMMENDED YET with the reason; nothing is taken away. A pain
   score of 6+ still removes finger work: that is the one hard rule.
2. **Milestones, not a deadline.** The ladder from 7a to 8a is a grade at a
   time; the estimate for each step comes from the athlete's own sends once
   there are enough of them.
3. **Profile stays at 7a boulder** for ease of progress; the logs move it up.
4. **Every new screen is checked against the taste skill**
   (github.com/leonxlnx/taste-skill, `references/app-screens.md`): one
   question per screen, the finding first, colour on data only.

## Phase 10 — Calmer screens

| # | Chunk | Notes |
|---|-------|-------|
| 10.1 | [ ] TODAY: the pick, START and one line for the wall; ADJUST TODAY and ALSO FITS fold into one row | |
| 10.2 | [ ] Session page: one line per exercise (name, sets x reps, load); block and rest move to the workout card | |
| 10.3 | [ ] STATS overview: WHAT STANDS OUT shows three, the rest behind MORE | |

## Phase 11 — Goals and the gap

| # | Chunk | Notes |
|---|-------|-------|
| 11.1 | [ ] Goals (`goals.ts`): boulder and sport goal, the working grade from the logs, milestones with an estimate | Persisted `goals`. |
| 11.2 | [ ] The gap (`gap.ts`): each tested standard against now, the next milestone and the goal; what is already enough | |
| 11.3 | [ ] GOAL section on STATS PROGRESS, goal sheet in Settings | |

## Phase 12 — Why climbs fail

| # | Chunk | Notes |
|---|-------|-------|
| 12.1 | [ ] Tags on each climb: angle, holds, moves, why it failed (incl. BACKED OFF), and a TRIED 110% mark on the session | Optional, two taps. |
| 12.2 | [ ] Limiters (`limiters.ts`): send rate per style against the athlete's own average; the weakest three | |
| 12.3 | [ ] WHERE YOU FALL on STATS CLIMBING | |

## Phase 13 — On the wall

| # | Chunk | Notes |
|---|-------|-------|
| 13.1 | [ ] Wall focus (`wall.ts`): one technique or feet drill, one head drill, stamina when due, picked from the limiters and the season | Shown on TODAY as a suggestion. |
| 13.2 | [ ] Finger, soft: while healing, grip types and exercises are labelled NOT RECOMMENDED YET, never removed | Pain 6+ stays hard. |

## Phase 14 — The season

| # | Chunk | Notes |
|---|-------|-------|
| 14.1 | [ ] Season (`season.ts`): BASE, STRENGTH, POWER, PEAK, by block, planned back from a goal date or a trip when one is set | |
| 14.2 | [ ] The phase steers the training-day pick and the wall focus, and names itself on TODAY | |

## Phase 15 — The coach

| # | Chunk | Notes |
|---|-------|-------|
| 15.1 | [ ] COPY FOR COACH: the last four weeks in one text to paste into Claude | Nothing leaves the phone unless sent. |
| 15.2 | [ ] COACH in the app with the athlete's own API key | The key stays on the phone and out of backups; the review is text, never a change to the plan. |
