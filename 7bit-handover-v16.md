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
phone. All of it is built. Phases 1-5 merged in PR #20; phases 6 (Apple
Health) and 7 (widget) in the PR after it. The Swift in phases 6 and 7 could
not be compiled in the cloud session: build it in Xcode first (section 6).

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

### Phase 6 — Apple Health
- `ios/App/App/HealthPlugin.swift`, a local plugin like `RestActivity`,
  registered in `MainViewController` and added to the App target's Sources.
  Reads sleep (minutes asleep per night, deep and REM where the watch
  records them), HRV (SDNN, daily mean), resting HR, body mass and climbing
  workouts; saves finished sessions as workouts (DAILY as core training,
  CAVE and TEST as strength). Usage strings are in Info.plist.
- `src/core/health.ts`: last night's sleep and today's HRV and resting HR
  against the athlete's own previous 7 days (at least 4 readings) suggest an
  energy. Under 5h asleep, or two of {under 6h, HRV 12% below, resting HR
  +5}: TIRED. 7h+ with HRV at or above the week: FRESH. Otherwise NORMAL.
  Applied once a day to the energy tabs (suggested tab in accent); on a
  TIRED day a banner gives the reasons and the recommender skips STRONG and
  ASSESS.
- Sync on open and on foreground once connected (Settings > APPLE HEALTH >
  CONNECT). A newer weight that moved 0.3 kg or more is recorded as
  bodyweight. Watch climbing workouts of 15 min or more on a day with no
  logged climb become draft entries (GYM BOULDER, the watch's minutes, no
  climbs yet), credited like any climb so the 48h and the load see them;
  RECENT shows them as "From Apple Health ... Tap to add the climbs."
- STATS > RECOVERY (only once connected): 14 nights of sleep with HRV, and
  mean session effort after 7h+ nights against nights under 6h.
- The `health` key is persisted and in backups.

### Phase 7 — Widget
- `TodayWidget` in the existing RestTimerWidget extension (sources in
  `ios/LiveActivity/`, copied into `ios/App/RestTimerWidget/`): small home
  screen, lock screen rectangular and inline. Today's recommended session,
  its reason, the block week, and a countdown to fingers ready that flips to
  READY on its own. A snapshot from an earlier day reads OPEN 7BIT.
- `TodayWidgetPlugin.swift` writes the snapshot (`src/core/widget.ts`) to
  the App Group and reloads the widget only when it changed.

### Follow-up: Settings copy
- "Save sessions as workouts" no longer promises ring credit. The workout is
  saved with start and end only (no energy or heart-rate samples), so it is
  listed in Health and Fitness but does not move the rings; a watch worn
  during the session credits its own measured activity as usual.

### Also fixed in the second PR
- A fresh install was recommended STRONG on day one (no climbs logged reads
  as "fewer than two climbing days"). The STRONG rule now needs a climb
  history.

## 3. Verified

`npx tsc --noEmit`, `npm test` (64 pass), `npm run check:daily` PASS,
`npm run check:cave` OK, `npm run build`. In Chromium at 390 px: export,
import, pain check at 4 and 7, effort saved, climb minutes and effort, TRY
+13KG suggestion, +60S (2:30 -> 3:30), recommended card with its reason, home
screen still 845 px tall, all five STATS sections with seeded data, reminder
switches and time saved; with simulated Health data, TIRED suggested and
banner shown, DAILY recommended instead of STRONG, RECOVERY chart, a draft
climb in RECENT. Not verifiable in the cloud: anything native. The Swift has
not been compiled; notifications, Health and the widget need a device.

## 4. Repo state

All merged: PR #20 (phases 1-5), #21 (phases 6-7), #22 (Settings copy),
#23 (this repo-state update). No open PRs. `main` is the latest.

Branches still on GitHub, all fully contained in `main` (the cloud proxy
refuses deletion, so they are deleted from the Mac, section 6):
`claude/amazing-hawking-c1b0xc`, `claude/assess-stats`,
`claude/assess-tab-drop-power`, `claude/assess-v2`, `claude/climb-log`,
`claude/dot-matrix-illustrations`, `claude/handover-v12`,
`claude/programme-v12`, `claude/session-info-popup`.

One unmerged: `claude/exercise-form-guide-pdf-kzrz1x`, a printed form guide
built for the retired HOME / MORN programme. Archived as the tag
`archive/form-guide-pdf` before deleting, so it can be restored.

Xcode signing (4 October): "PLA Update available" blocked the HealthKit
profile. Accept the updated Program License Agreement at
developer.apple.com/account, then Try Again in Signing & Capabilities.

## 5. Open items

1. **Build the Swift in Xcode** and add the capabilities (section 6). If
   the build fails, the error will be in `HealthPlugin.swift`,
   `TodayWidgetPlugin.swift` or `TodayWidget.swift`; those are the only
   new native files.
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

**Once in Xcode** (App target, then RestTimerWidgetExtension), under
Signing & Capabilities:

1. App: **+ Capability > HealthKit**.
2. App and RestTimerWidgetExtension: **+ Capability > App Groups**, add
   `group.com.sevenbit.circuittraining` to both.
3. Cmd+R.

**On the phone after installing:**

1. Settings > BACKUP > EXPORT, save the file to Files.
2. Settings > REMINDERS: switch one off and on to get the permission dialog.
   Set the DAILY time two minutes ahead to see one fire.
3. Settings > APPLE HEALTH > CONNECT, allow every category.
4. Long-press the home screen > + > 7Bit Today. Lock screen: customise >
   add the 7Bit widget.
