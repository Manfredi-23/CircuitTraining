# 7BIT — Handover v16

**Date:** 4 October 2026
**Read this first.** Then `7bit-roadmap.md` (the plan this session works
through), then v15 (ASSESS) and v12 (athlete, programme, climb log). Working
agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

The athlete asked for a review of the app and a list of improvements, then
asked for all of them, broken into chunks. The plan is `7bit-roadmap.md`:
seven phases, 25 chunks, data first, then logic, then charts, then the
phone. Phases 1-5 are built, tested and merged in this PR. Phases 6
(Apple Health) and 7 (widget) are native Swift and follow in their own PR.

## 2. What changed, by phase

### Phase 1 — Safety net
- **Backup.** Settings > BACKUP: EXPORT writes every persisted key as one JSON
  file (share sheet on iOS, download in a browser, clipboard as a last
  resort). IMPORT validates the whole file and asks before replacing.
  `PERSISTED_KEYS` in `src/core/backup.ts` is the single list; `partialize`
  reads it.
- **Vitest.** `npm test`. 50 tests in `src/core/__tests__/`, including the
  four invariants CLAUDE.md asked for.

### Phase 2 — Record what matters
- **Session effort** 1-10 on the complete screen (`rateLastSession`).
- **Planned sets** in the session log beside done sets (ramps excluded).
- **Climb log**: minutes (default 120) and effort.
- **Pain check** before any session with finger work: 0-2 as written, 3-5
  finger work capped at HARD and one set shorter, maximal finger tests
  dropped; 6+ finger work removed. If nothing would be left, START is
  disabled with a pointer to DAILY.

### Phase 3 — Training logic
- `training-load.ts`: effort x minutes per session and climb; unrated
  sessions use a typical effort and are flagged; weekly totals; acute:chronic
  ratio after 21 days of history.
- `block.ts`: three build weeks, one deload week, counted from `blockStart`
  or the Monday of the first session. Deload: CAVE loses one set on PRIMARY
  and SECONDARY work, loads and rest untouched; DAILY and TEST unchanged.
  Settings > TRAINING BLOCK > START NEW BLOCK.
- `progression.ts`: the stepper shows a reason and a TRY button: one step on
  when every planned set was done and the session felt 8 or easier; hold on a
  missed set, a 9-10 session or a deload week. Assistance and edge depth step
  down.
- Personal bests: +1 XP for a heavier logged load than ever, +2 for a better
  test. Listed on the complete screen.
- `recommend.ts`: the home screen opens once a day on the session the week
  calls for, with the reason under the logo (where the joke line is on other
  cards). Rules in order: recent pain 6+ -> a DAILY without finger work;
  climbed today -> CAVE 02/03 alternating; ASSESS due (7 weeks, or no
  baseline after 2 weeks) with fresh fingers -> TEST; Thursday on with fewer
  than two climbing days -> CAVE 01; otherwise the DAILY rotation. The block
  week shows beside the duration on the card.
- Rest screen: **+60S**.
- **Fixed:** DAILY 04's light no-hangs no longer trip the CAVE 01 finger
  warning (v15 open item 4). Readiness reads `lastHard`, set by HARD or MAX
  working sets and by boulder days.
- **Fixed:** level-ups from earlier sessions no longer pile up on the
  complete screen (`sessionLevelUps` was never cleared).

### Phase 4 — STATS
New sections: LOAD (weekly bars by source, ratio), FINGERS (finger load and
highest pain per week), FRESHNESS (days since trained against grace),
ONE-ARM PATH (2RM %BW against 131% / 141%, kilos needed, projected dates),
CUT SHORT (exercises done short of plan, 90 days).

### Phase 5 — Reminders
`reminders.ts` plans local notifications from the logs; `use-reminders`
reschedules them all on open, on foreground and whenever logs or settings
change. Kinds: DAILY morning (default 07:30), fingers recovered, capacity
fading, core behind (Thursday 19:00), ASSESS due (Saturday 09:00), climbs not
logged (21:00). Quiet hours 21:30-07:00. Settings > REMINDERS has a switch
each and the DAILY time; permission is asked when one is switched on. Uses the
existing `@capacitor/local-notifications` plugin: no `cap sync` needed.

## 3. Verified

`npx tsc --noEmit`, `npm test` (50 pass), `npm run check:daily` PASS,
`npm run check:cave` OK, `npm run build`. In Chromium at 390 px: export,
import, pain check at 4 and 7, effort saved, climb minutes and effort, TRY
+13KG suggestion, +60S (2:30 -> 3:30), recommended card with its reason, home
screen still 845 px tall, all five STATS sections with seeded data, reminder
switches and time saved. Not verifiable in the cloud: notifications on a real
iPhone (check one fires: set the DAILY time two minutes ahead).

## 4. Repo state

This session's work is on `claude/amazing-hawking-c1b0xc` and goes to
`main` through its PR. Older merged branches still on GitHub (the proxy
refuses deletion): `claude/assess-tab-drop-power`, `claude/climb-log`,
`claude/dot-matrix-illustrations`, `claude/programme-v12`,
`claude/handover-v12`, `claude/session-info-popup`, `claude/assess-stats`,
`claude/assess-v2`. Stale unmerged: `claude/exercise-form-guide-pdf-kzrz1x`.

## 5. Open items

1. **Roadmap phases 6 and 7** (Apple Health, widget): native, need Xcode.
2. Old data has no `lastHard`: until the first hard session or boulder day
   after updating, finger readiness falls back to `lastTrained` as before.
3. Load suggestions need `planned` sets, so they start after the first
   session finished in this version.
4. First ASSESS is a baseline; retest after 6-8 weeks (the reminder does
   this now).
5. Graphics rework (v12 section 6) still waiting on the logo and frames.
6. Supabase, Vercel production: still planned.

## 6. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

```bash
git checkout main
git pull
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

On the phone after installing: Settings > REMINDERS, switch one off and on to
get the permission dialog, then Settings > BACKUP > EXPORT and save the file to
Files.
