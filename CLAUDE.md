# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**7Bit Circuit Training** — a PWA for circuit training with XP-based muscle group progression. Built for a climber (3 days/week, home + gym). Zero emojis in all code and UI copy.

**Repo:** github.com/manfredi-23/CircuitTraining

## Working Agreements

Read the newest `7bit-handover-vNN.md` before starting. Then, in every session:

1. **End with a new handover.** Write `7bit-handover-vNN.md` one number up:
   what changed, repo state, open items, next steps, Mac terminal commands.
   Point the Handoff Documents list below at it. A message that changes the
   repo updates the current handover before it ends.
2. **End with housekeeping.** Work goes through PRs; merge them once checks
   pass, resolve or close stale PRs, delete merged branches, leave `main`
   building with both checks green. Anything left open is listed in the
   handover.
3. **End every message that changes the app with the Mac terminal commands**
   to pull, build and test it (run from
   `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`; the standard set is in
   the current handover).
4. Ask questions first when a request is ambiguous; brainstorm before building
   when asked to.

## Tech Stack

Next.js 16 (App Router) + TypeScript + React 19. State: Zustand with persist middleware. Charts: Recharts. Gestures: @use-gesture/react. Font: Kode Mono via next/font/google. CSS Modules + global CSS custom properties.

Legacy vanilla JS version preserved in `legacy/` folder for reference.

## Commands

```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build
npx serve out    # Serve the production build (static export: `npm run start` does not work)

npm run check:daily     # DAILY: 20-minute ceiling, TIRED drops nothing, curling last
npm run check:cave      # CAVE 02 and 03 budgets, and the one-arm gates
npm test                # Vitest around src/core/ (src/core/__tests__)
```

The automated checks are `check:daily`, which guards the promises DAILY
makes, `check:cave`, which keeps CAVE 02 and 03 inside 45 minutes NORMAL at
every level and proves the one-arm rungs open on a tested weighted pull-up and
never on XP, and `npm test`. Every new core module gets a test file in
`src/core/__tests__/` in the same commit. UI is still tested by hand in the
browser.

## Architecture

### Directory Structure

```
src/
  core/          # Pure TypeScript, zero React imports (shared with future iOS app)
    types.ts     # All types and interfaces
    config.ts    # Central CONFIG object: levels, energy, decay, recovery
    engine.ts    # Training logic: buildList, scaleWork/Sets/Rest, gates, readiness
    protocols.ts # Named training protocols with parameters, rationale and sources
    benchmarks.ts# Testable standards, athlete profile, %BW to kg conversions
    stats.ts     # Trend scoring, chart data, capacity list sorting
    load.ts      # Load axes, load history, stepper formatting
    climbing.ts  # Climb log: grade scales, gym colours, pyramid and weekly bests
    insights.ts  # STATS data: week strip, core volume, test rows, lifts, climb vs pull,
                 #   freshness, one-arm path, finger weeks, cut short
    training-load.ts # session-RPE load (effort x minutes), weekly totals, acute:chronic
    block.ts     # mesocycle: three build weeks, one deload week
    progression.ts # suggested next load, personal bests
    recommend.ts # which session today
    reminders.ts # which local notifications to schedule
    health.ts    # Apple Health: energy suggestion, merge, weight, climb imports
    widget.ts    # the TodayWidget snapshot
    backup.ts    # export / import format; PERSISTED_KEYS
    dates.ts     # local-date helpers
    data-daily.ts, data-cave.ts, data-assess.ts  # Session libraries, one per tab
    data-oap.ts  # One-arm pull-up path, shared by CAVE 01 and CAVE 02
    data-index.ts  # getModeData(mode) helper
  storage/       # Async storage abstraction (swap localStorage for Supabase later)
  store/         # Zustand store (app / workout / progress / stats / load / climb slices)
  hooks/         # use-timer, use-swipe, use-hydration, use-audio-init, use-wake-lock
  native/        # native.ts — Capacitor bridge: status bar, splash, haptics, notifications
                 # health.ts, widget.ts — bridges to the local Health and TodayWidget plugins
  components/
    screens/     # HomeScreen, WorkoutScreen, RestScreen, CompleteScreen, StatsScreen, ClimbScreen
    shared/      # SettingsOverlay, TimerFlash, LoadLogger, ClimbStats, SessionInfo, StatsSections
  app/           # layout.tsx, page.tsx (screen router), globals.css
ios/             # Xcode project (Capacitor 8, SPM)
tools/           # generate-ios-assets.py — icon and splash from logo.svg
                 # dot-figures.py — the generated (skeleton) session illustrations
                 # pixel-frames.py — hand-drawn grid frames to an animated illustration
design/          # pixel-grid.svg drawing template; illustrations/<name>/NN.svg frames
```

### Key Design Decisions

- **Core logic is framework-agnostic**: `src/core/` has zero React imports. Engine
  functions are pure. This enables sharing with the future Capacitor/iOS app.
- **Storage abstraction**: All methods are async. Implement `IStorageAdapter` and
  call `setStorageAdapter()` to move to Supabase.
- **Single-page app**: No Next.js routes. All screens render in `page.tsx` based on
  `useStore(s => s.screen)`.
- **Zustand persist**: Only the keys in `PERSISTED_KEYS` (`src/core/backup.ts`)
  are persisted: `progress`, `sessionLog`, `benchmarkResults`, `loadLog`,
  `climbLog`, `blockStart`, `settings` and `health`. `partialize` reads that list, so a
  new key is persisted and backed up by adding it there. UI state is transient. The blob
  carries `version: 2`, but legacy cleanup runs from `merge`, not `migrate`:
  persist only calls `migrate` when the stored blob has a **numeric** version,
  and no install written before versioning existed has one, so v9 and early-v10
  data alike would skip it. `merge` runs on every hydration and is the only
  hook legacy data reaches. Pre-capacity blobs are detected by content — a key
  that is not a v10 capacity — rather than by version number, so progress
  earned since the v10 merge is never mistaken for v9 data and wiped.
- **Native code is optional**: everything in `src/native/` is behind a dynamic
  import and a platform check, so the same bundle runs as a browser PWA and
  `next build` can still prerender it in Node. Prefer a web standard over a
  Capacitor plugin where one exists — screen wake uses the Wake Lock API, not a
  plugin, and so works in both shells.
- **Timers count against the clock**: `use-timer` reads a `Date.now()` deadline
  rather than decrementing per tick. iOS suspends timers when the app
  backgrounds or the screen locks, and a decrementing counter silently loses
  that time.
- **Reminders are local too**: `reminders.ts` plans them from the logs
  (DAILY morning, fingers recovered, capacity fading, core behind, ASSESS due,
  climbs not logged); `use-reminders` reschedules the whole set on open, on
  foreground and on any change, with ids 1000+. Permission is asked when a
  reminder is switched on in Settings, never at launch. Quiet hours
  21:30-07:00.
- **Rest alerts are local, not push**: the deadline is known on the device, so
  there is nothing for a server to tell us — no APNs, no certificates, no
  network. `use-timer` schedules a local notification with the OS when rest
  starts and cancels it when it would be redundant. It is the only way the end
  of rest reaches you while the webview is suspended, because the Web Audio
  beep and the haptic both need the app to be running. There is no web
  equivalent: without a service worker and Push API the browser PWA cannot
  fire anything while backgrounded, so on web this is a no-op like the rest of
  `src/native/`. Two traps, both fixed: the plugin sets **no sound** unless given
  a sound name, so the alert names `public/rest-over.wav` (the in-app chime,
  kept at the root of `public/` because the plugin only searches one level
  deep); and scheduling awaits the permission dialog on first use, so a
  generation counter makes a cancel win over a schedule still in flight. Alerts
  are Time Sensitive so they get through Focus modes.
- **The rest countdown is a Live Activity**: alongside the alert, `use-timer`
  starts a lock-screen and Dynamic Island countdown and ends it with the rest
  screen. The app sends only the deadline; `Text(timerInterval:)` ticks in the
  widget extension and `staleDate` flips it to GO, so it stays right while the
  app is suspended. Every call resolves quietly when the extension is missing,
  so the web build and older iOS keep working.

## Training Model (v10)

The training content was rewritten in September 2026. See `7bit-handover-v10.md`
for the full rationale and evidence base. The short version:

### Capacities, not muscle groups

Ten climbing-performance axes replace the twelve bodybuilding muscle groups:
`crimp`, `openhand`, `forearm`, `pull`, `contact`, `tension`, `press`,
`shoulder`, `legs`, `mobility`. Chest and biceps are not tracked axes — the
movements that train them exist as joint-health maintenance under `press` and
`shoulder`.

### Progression moves load, never reps

Levels raise a load target and unlock harder variations. They do **not** inflate
reps, and they never shorten rest on PRIMARY, SECONDARY or TEST blocks — rest on
maximal work is set by physiology, not by experience. Only `ACCESSORY`, `PREHAB`
and `MOBILITY` blocks compress with level.

Every exercise carries an explicit `progression` string shown on the card.

### Sets, not rounds

Sessions run consecutive sets of one exercise, then move on. There is no circuit
loop. `Circuit.exercises` is a flat ordered list; each exercise carries its own
`sets`, `work`, `restSec` and `load`.

### Blocks

`WARMUP` | `PRIMARY` | `SECONDARY` | `ACCESSORY` | `PREHAB` | `MOBILITY` | `TEST`.
Order is by neurological cost: fingers and CNS when fresh, conditioning last.

### Pain check, effort and load

Sessions that load the fingers open with a 0-10 finger and wrist pain check
(`applyPainCheck`): up to 2 as written; 3-5 caps finger work at HARD, one set
shorter, and drops maximal finger tests; 6+ removes finger work. The score is
saved on the session. The complete screen asks session effort (1-10); the
climb log takes minutes and effort. Effort x minutes is the training load
(`training-load.ts`), climbing included. The session log keeps `planned` beside
`sets` so "all sets done" can be told from "cut short".

### Mesocycle, suggestions, personal bests

Three build weeks, then a deload week (`block.ts`, counted from
`blockStart` or the first session, restartable in Settings). On a deload week
CAVE loses one working set on PRIMARY and SECONDARY work; DAILY and TEST are
untouched; suggested loads hold. The stepper suggests one step on when every
planned set was done and the session felt 8 or easier (`progression.ts`).
A heavier logged load than ever earns +1 XP, a better test +2.

Finger readiness reads `lastHard` (last HARD or MAX working set, or a boulder
day), so light finger work such as DAILY 04 keeps the capacity trained without
restarting the 48h.

### Energy

FRESH adds a set to working blocks. NORMAL is the session as written. TIRED
removes a set, multiplies rest by 1.25, drops ACCESSORY blocks, and **caps
intensity at HARD** — a tired athlete downgrades rather than grinds.

### Safety

- `fixed: true` marks protocols taken exactly as written (warm-ups, density
  hangs, repeaters). No level or energy scaling.
- `gate` blocks dangerous exercises behind a **tested benchmark**, not XP. The
  one-arm rungs need a recorded weighted pull-up; until then they are
  substituted with the lopsided two-hand ladder. A gate with no `substituteId` hides the
  exercise until it opens. Substitutes are resolved one level deep, so a
  substitute must not carry a gate of its own.
- Benchmarks are recorded in TEST 01 ASSESS, one gym session in five sections
  (WARM-UP, BODY + RANGE, MAX STRENGTH, ENDURANCE, TRUNK), ordered as the NSCA
  and IRCRA batteries order tests. Maximal tests are **ramps**
  (`Exercise.ramp`): attempts get harder, each is marked MADE IT or FAILED, and
  the best clean attempt is saved; they are never fixed sets. The weighted
  pull-up is a tested 2RM (`weighted-pullup-2rm`, the rep range Lattice's 165%
  standard was collected in); old 5RM-method results (`weighted-pullup`) stay as
  history and still count for gates through `gateResult`, divided by 1.067.
  Every result is kept (`addResult`, one per test per day); `gateResult` /
  `latestResult` is the one gates read. % bodyweight conversions use the latest
  recorded bodyweight (`currentBodyweight`). Each TEST exercise carries a
  `records` spec: the result is entered on the load stepper (kilos on the belt,
  seconds, cm, progression number) and saved on the last DONE, converted to the
  benchmark's unit by `benchmarkValueFromEntry` — added kg to % bodyweight, and
  a 5RM to an estimated 1RM at x1.15 of system mass. Weaker side is entered for
  per-side tests. Bodyweight comes from `ATHLETE.bodyweightKg`.
- `getReadiness()` enforces 48h between maximal finger sessions, and otherwise
  gates on the circuit's own `recoveryHours` rather than one flat number, so a
  12h session is available again after 12h.
- `stacksOnSession: true` marks a session built to run straight after another
  one, which never reports a recovery debt. Distinct from `recoveryHours: 0`,
  which means the load is low enough to repeat daily: CAVE 02 PULL + PUSH is
  genuinely demanding and still intended to stack.
- Skipping and quitting cost **zero** XP. Punishing a skip in an app that
  prescribes maximal finger loading pushes the athlete to train through a
  warning sign.

### Sessions

The athlete boulders twice a week at Minimum, spends weekends in the mountains,
and has only a mat, a band and a portable pull edge at home: no bar, no
hangboard, no weights. The programme was cut to three tabs in October 2026 to
fit that week.

| Mode | Sessions |
|------|----------|
| DAILY | 01 FRONT CORE, 02 OBLIQUES + BACK, 03 BAND STRENGTH, 04 FINGERS + MOBILITY |
| CAVE | 01 STRONG, 02 PULL + PUSH, 03 LEGS + BACK |
| TEST | 01 ASSESS (five sections, ramps, ~81-90 min) |

A typical week: DAILY most mornings, CAVE 02 or 03 straight after each
bouldering session, CAVE 01 only in a week a bouldering day is skipped.

HOME, HANG and MORN no longer exist. Their exercises that fit a mat-and-band
flat moved into DAILY with their ids unchanged, so load history carries over.
There is deliberately no limit-bouldering, campus or repeater session: free
bouldering is the athlete's own time and stays unprogrammed. Circuit ids in
CAVE were kept (`cave-01`, `cave-05`, `cave-06`) and only `circuitNum` and the
content changed. Old session-log entries may still carry the retired mode
names; they are display-only.

### DAILY

Short home sessions before breakfast. `npm run check:daily` holds the rules:

- **`recoveryHours: 0`** on every session, so readiness never blocks it and it
  stacks on a climbing day.
- **20 minutes at worst**, every level and energy. Working sets are SECONDARY
  (FRESH +1 set, TIRED -1, no level set bonus); prep work is PREHAB, MOBILITY
  or WARMUP. **No ACCESSORY**: TIRED would drop it. Over budget means cut an
  exercise, never shorten a rest.
- **Curling last.** Discs are most swollen in the first hour after waking, so
  loaded flexion (`daily-reverse-crunch`, `daily-crunch`, the Russian twist)
  only ever closes a session. Extension and hinging may sit anywhere.
- **Fingers last and light.** DAILY 04 does density no-hangs on the portable
  edge (`density-hang`, about 40%) after the mobility work.

### Core

Abs, obliques and the lower back are an explicit goal: size, not only
endurance. `trunk-hypertrophy` covers abs and obliques (hard sets near failure,
reverse crunch for the lower abs, crunch for the upper, side-bending and
rotation for the obliques). `back-strength` covers the lower back, which is
weak but not painful: bird dog, then prone extension, then band good morning in
DAILY 02, then the loaded 45-degree back extension and single-leg RDL in CAVE
03. `SIDE_PLANK_DIP` is shared between DAILY 02 and CAVE 03.

### CAVE

CAVE is almost always done straight after bouldering.

- **01 STRONG** replaces a bouldering day: max hangs, heavy weighted pull-ups,
  the one-arm path, lock-offs, front lever, hanging leg raise. 70-80 minutes.
- **02 PULL + PUSH**, after bouldering: weighted pull-ups at RPE 8 (SECONDARY,
  so level adds no sets), band-assisted one-arms, push-ups/dips, spiderman +
  cross-body mountain climber, hanging oblique raise (ab straps allowed),
  weighted Russian twist, cuff.
- **03 LEGS + BACK**, after bouldering: goblet squat, 45-degree back extension,
  single-leg RDL, toe-tip plate drag, Copenhagen plank, plate crunch, side
  plank hip dip, frogger. Nothing loads the fingers.
- 02 and 03 are `stacksOnSession` and `check:cave` keeps them inside 45
  minutes NORMAL.
- The athlete's wrists and fingers are symptomatic: plank-based cards name a
  fist, handle or forearm option, and hanging core stays at two sets.

### One-arm pull-up

The goal is a one-arm pull-up. `data-oap.ts` builds the path once: a
one-arm scap shrug, then a lopsided two-hand ladder (uneven grip, archer,
typewriter) until the gates open. Assisted one-arms (band in the free hand)
open at a tested 131% bodyweight weighted pull-up 2RM, one-arm negatives (CAVE
01 only) at 141% (the original 140% / 150% one-rep thresholds on the 2RM
scale). The weighted pull-up is the main driver. It lives in CAVE 01 and
CAVE 02.

### Adding or changing an exercise

1. Every exercise needs `block`, `intensity`, `sets`, `work`, `unit`, `restSec`,
   `load` and `progression`.
2. Link a `protocolId` from `protocols.ts` — the workout card shows its rationale
   and source under the form guide's WHY section.
3. Rest values are protocol values. Do not tune them for session length; cut an
   exercise instead.
4. Anything with real injury risk gets a `gate`, not a `minLevel`.

## Styling

Kode Mono monospace font. Mobile-first, max-width 390px. CSS Modules per component, global custom properties in `globals.css`.

**Color tokens:** `--ink` (#181610), `--accent` (#E64D19), `--bg` (parchment gradient), `--ink-ghost`/`--ink-dim`/`--ink-faint` for opacity variants.

**Design rules:** No glassmorphism. No dark theme. Cards outlined (2px solid), not filled. Tab indicators use bottom-border style (6px active, 2px inactive).

## Session illustrations

The card illustrations are animated dot-matrix figures generated by
`tools/dot-figures.py`: stick skeletons posed at keyframes, tweened, and
rasterised onto a 30 x 30 LED grid. Body in ink, far limbs dimmed, equipment
in accent, over faint unlit dots. Each is a self-animating SVG (CSS opacity
steps) under the filename the session data already uses, plus a still key pose
in `public/images/still/`. The card picks the still through `<picture>` under
`prefers-reduced-motion`, because an SVG loaded as an image does not reliably
see that preference itself. Edit a pose in the script and re-run it; do not
hand-edit the SVGs.

Hand-drawn illustrations use the same renderer through `tools/pixel-frames.py`.
Frames are drawn on the 30 x 30 template `design/pixel-grid.svg` as 10px
`<rect>` cells in three exact fills (`#181610` ink, `#8A8780` dim, `#E64D19`
accent) and saved as `design/illustrations/<name>/01.svg, 02.svg ...` with an
optional `anim.json` (`ms`, `loop` pingpong|cycle, `still`, `shape` dot|square).
Frames play as steps, never tweened. The script writes `public/images/<name>.svg`
and its still. Folders starting with `_` are examples and skipped by `--all`.

The logo must stay plain `<rect>` elements: `tools/generate-ios-assets.py`
parses them to draw the icon (the "7", rects with `x < 32`) and the splash.

## Load Logging

Progression on this programme is load, so what was actually lifted is recorded,
not just what was prescribed.

`getLoadAxis(exercise)` in `src/core/load.ts` derives the numeric axis from the
exercise's `LoadSpec.kind` — kg added, kg of assistance, mm of edge, percent of
max, or RPE. It returns null for bodyweight and band work, which progress
through the variation ladder instead, and for the WARMUP, PREHAB and MOBILITY
blocks, where load is not a training variable.

The stepper on the workout card opens on last session's value for that
exercise, so adding load is a decision against a known number. The value is
written to `loadLog` when the exercise's last set is marked DONE — the same
moment XP is awarded. Skipping records nothing. One entry per exercise per day;
repeating a session the same day overwrites rather than stacking.

## Climb Log

The athlete's own climbing, logged by hand after the session from the CLIMB LOG
button on the home screen (and from the complete screen after any
`stacksOnSession` session, since those follow a climbing day). No board app
integration: Kilter and Tension have no public API, and typing a grade is faster
than keeping a scraper alive.

A `ClimbSession` is a date, a venue (`BOARD`, `GYM`, `OUTDOOR`), a discipline
(`BOULDER`, `ROPE`; board is always boulder), the board and angle or an optional
crag name, and a list of climbs: grade, attempts, sent or project. One attempt on
a sent climb is a flash. Sessions are independent; a project sent next week is a
new entry.

Each view is one grade scale and they are never mixed on a chart: BOARD and ROCK
use Font, ROPE uses French sport grades, GYM uses the Minimum Zurich colour
circuit (`GYM_COLOURS`, each a published Font band). STATS shows a pyramid
(flash / send / project, mean attempts per send) and the hardest send and flash
per week.

Training link, applied once on first save (edits and deletes do not touch XP):
a boulder session moves `lastTrained` on `crimp` and `openhand` so the 48h
finger rule sees it, and earns `CLIMB_SESSION_XP` in `contact` and `tension`.
A roped session earns it in `forearm`. Climbing never earns crimp or open-hand
XP, because those levels set hangboard loads.

## iOS

Capacitor 8 with Swift Package Manager. Portrait-only, iPhone-only, light
appearance locked, bundle ID `com.sevenbit.circuittraining`.

Four first-party plugins: `@capacitor/status-bar`, `@capacitor/splash-screen`,
`@capacitor/haptics`, `@capacitor/local-notifications`. Adding or removing one
means re-running `npx cap sync ios` so `ios/App/CapApp-SPM/Package.swift` is
rewritten.

Three local plugins in `ios/App/App/`, each with a bridge in `src/native/`:
`RestActivity` (`RestActivityPlugin.swift`) starts and ends the rest Live
Activity; `Health` (`HealthPlugin.swift`, `src/native/health.ts`) reads sleep,
HRV, resting HR, body mass and climbing workouts and saves sessions as
workouts; `TodayWidget` (`TodayWidgetPlugin.swift`, `src/native/widget.ts`)
hands the home-screen widget its snapshot. Local plugins are not
auto-discovered, so `MainViewController` registers them in
`capacitorDidLoad()`; adding one also means adding it to the App target's
Sources in `project.pbxproj`, and `Main.storyboard` points at `MainViewController`
instead of `CAPBridgeViewController`. `NSSupportsLiveActivities` is `true` in
Info.plist.

The countdown UI and the `TodayWidget` live in the `RestTimerWidget` Widget
Extension target. Its sources live in `ios/LiveActivity/` and are copied into
`ios/App/RestTimerWidget/`, a synchronized folder, so a new file there compiles
without touching the project (keep the two copies identical). `RestActivityAttributes` is defined in
both targets and the two must stay identical — ActivityKit matches them by type
name and encoded shape. The extension needs a minimum deployment of iOS 16.2.

Capabilities, added in Xcode under Signing & Capabilities:

- **Time Sensitive Notifications** (App) so rest alerts break through Focus.
  Without it the alert is still delivered, at the normal level.
- **HealthKit** (App). Without it CONNECT APPLE HEALTH reports that Health did
  not connect; nothing else is affected. Info.plist carries
  `NSHealthShareUsageDescription` and `NSHealthUpdateUsageDescription`.
- **App Groups** `group.com.sevenbit.circuittraining` (App and
  RestTimerWidgetExtension). Without it the widget shows its placeholder.

Apple Health suggests the energy from sleep and HRV / resting HR against the
athlete's own 7-day baseline (`src/core/health.ts`), applied once a day; on a
TIRED day the recommender skips STRONG and ASSESS. A newer Health weight is
recorded as bodyweight; watch climbing workouts become draft climb entries.

`UIViewControllerBasedStatusBarAppearance` must stay `true` in Info.plist —
the status bar plugin sets the style through the view controller, and setting
that key to false makes `setStyle` a silent no-op.

Icon and splash are generated from `public/images/logo.svg` by
`tools/generate-ios-assets.py`, so editing the logo and re-running the script
keeps all three in sync. Do not hand-edit the PNGs.

## Planned Future Work

- **Supabase**: Auth + Postgres DB for multi-user. Swap storage adapter, add API routes.
- **Vercel deployment**: Connect repo, configure build.
- **The improvement roadmap**: `7bit-roadmap.md`. All seven phases built; the
  native ones still need checking on a device.

## Handoff Documents

- **`7bit-handover-v16.md`** — **start here.** The whole improvement roadmap:
  backup, Vitest, pain check, effort and load, mesocycle, suggested loads,
  recommended session, six STATS sections, reminders, Apple Health, widget,
  and the Xcode steps the native parts still need.
- **`7bit-roadmap.md`** — the plan those phases come from, and what remains.
- **`7bit-handover-v15.md`** — ASSESS rebuilt from the
  research: five sections, ramp tests (MADE IT / FAILED), 2RM pull-up, McGill
  trunk four with ratios. Supersedes earlier repo state and open items.
- **`7bit-handover-v14.md`** — test history, sets in the session log, the STATS sections.
- **`7bit-handover-v13.md`** — the session info popup and the test-recording review.
- **`7bit-handover-v12.md`** — read second. The full picture: the DAILY / CAVE /
  TEST programme, the climb log, open items, the graphics rework plan (grid,
  frames, logo), working agreements and the Mac terminal commands.
- **`7bit-handover-v11.md`** — current for the app shell. The iOS setup
  (orientation, appearance, plugins, the status bar trap), the wall-clock timer
  fix, load logging, and asset generation. Defers to v10 for all training
  content.
- **`7bit-handover-v10.md`** — current for the training model: diagnosis of what was
  wrong with v9's programme, the capacity/block/load model, benchmarks and
  targets, the evidence base, and the Mac terminal commands. Its session list
  is historical: the current sessions are the ones in the Sessions section
  above and in the data files.
- **`7bit-handoff-v9.md`** — design system, screen layouts, copy system, stats
  specification. Still current for everything visual. **Its training content
  (sections 8, 9 and the mode/circuit tables) is superseded by v10.**
