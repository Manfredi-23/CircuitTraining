# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**7Bit Circuit Training** — a PWA for circuit training with XP-based muscle group progression. Built for a climber (3 days/week, home + gym). Zero emojis in all code and UI copy.

**Repo:** github.com/manfredi-23/CircuitTraining

## Tech Stack

Next.js 16 (App Router) + TypeScript + React 19. State: Zustand with persist middleware. Charts: Recharts. Gestures: @use-gesture/react. Font: Kode Mono via next/font/google. CSS Modules + global CSS custom properties.

Legacy vanilla JS version preserved in `legacy/` folder for reference.

## Commands

```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build
npx serve out    # Serve the production build (static export: `npm run start` does not work)

npm run check:morning   # Assert the MORN sessions still fit their time budgets
npm run check:cave      # ADD-ON and FEET budgets, and the one-arm gates
```

No test framework yet — test manually in browser. The automated checks are
`check:morning`, which guards the two promises MORN makes, and `check:cave`,
which keeps CAVE 03 and 04 inside 45 minutes NORMAL at every level and proves
the one-arm rungs open on a tested weighted pull-up and never on XP.

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
    data-home.ts, data-cave.ts, data-hang.ts, data-morning.ts, data-assess.ts  # Session libraries
    data-oap.ts  # One-arm pull-up path, shared by CAVE 01, CAVE 03 and HOME 02
    data-index.ts  # getModeData(mode) helper
  storage/       # Async storage abstraction (swap localStorage for Supabase later)
  store/         # Zustand store (app / workout / progress / stats / load slices)
  hooks/         # use-timer, use-swipe, use-hydration, use-audio-init, use-wake-lock
  native/        # native.ts — Capacitor bridge: status bar, splash, haptics
  components/
    screens/     # HomeScreen, WorkoutScreen, RestScreen, CompleteScreen, StatsScreen
    shared/      # SettingsOverlay, TimerFlash, LoadLogger
  app/           # layout.tsx, page.tsx (screen router), globals.css
ios/             # Xcode project (Capacitor 8, SPM)
tools/           # generate-ios-assets.py — icon and splash from logo.svg
```

### Key Design Decisions

- **Core logic is framework-agnostic**: `src/core/` has zero React imports. Engine
  functions are pure. This enables sharing with the future Capacitor/iOS app.
- **Storage abstraction**: All methods are async. Implement `IStorageAdapter` and
  call `setStorageAdapter()` to move to Supabase.
- **Single-page app**: No Next.js routes. All screens render in `page.tsx` based on
  `useStore(s => s.screen)`.
- **Zustand persist**: Only `progress`, `sessionLog`, `benchmarkResults` and
  `loadLog` are persisted (via `partialize`). UI state is transient. The blob
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
- Benchmarks are recorded in TEST 01 ASSESS, which has its own tab so it is
  there when wanted and out of the way otherwise. Each TEST exercise carries a
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
  which means the load is low enough to repeat daily: CAVE 03 ADD-ON is
  genuinely demanding and still intended to stack.
- Skipping and quitting cost **zero** XP. Punishing a skip in an app that
  prescribes maximal finger loading pushes the athlete to train through a
  warning sign.

### Sessions

| Mode | Sessions |
|------|----------|
| HOME | 01 TENSION, 02 PULL, 03 ARMOUR, 04 WRISTS |
| CAVE | 01 MAX, 02 CAPACITY, 03 ADD-ON, 04 FEET |
| HANG | 01 MAX HANGS, 02 CAPACITY, 03 DENSITY |
| MORN | 01 ABS + OBLIQUES, 02 SLOW START, 03 FEET ON, 04 BAND ONLY |
| TEST | 01 ASSESS |

There is deliberately no limit-bouldering or campus session. Free bouldering is
the athlete's own time and stays unprogrammed: CAVE 02 POWER was removed in
October 2026, and the campus board and its 130% gate with it. Circuit ids were
kept (`cave-03`, `cave-05`, `cave-06`) and only `circuitNum` renumbered, so
session logs stay consistent. Nothing trains `contact` any more.

### After bouldering: ADD-ON and FEET

CAVE 03 and 04 are alternatives, picked on the day, both `stacksOnSession`, both
kept at 45 minutes NORMAL by `check:cave`. Neither loads the fingers.

- **03 ADD-ON**: weighted pull-ups (SECONDARY here, so level adds no sets —
  the fresh, level-scaled version is in CAVE 01 and HOME 02), the one-arm path,
  push-ups/dips, goblet squat, then the trunk: spiderman + cross-body mountain
  climber and hanging oblique knee raise to windshield wipers (both SECONDARY,
  so TIRED keeps them), TRX body saw to pike, cuff.
- **04 FEET**: slab and feet-on work. Wall drills first while coordinated
  (silent feet, fewer-hands slab — `fixed`, TECHNIQUE), then steep foot walk,
  toe-hook hold, toe-tip calf raise on a foothold, single-leg balance,
  rock-over step-up, pike compression, Cossack squat, frogger. Logged under
  `legs`, `tension` and `mobility`; there is deliberately no footwork axis.
- The athlete's wrists and fingers are symptomatic: every plank-based card
  names a fist, handle or forearm option, and hanging core stays at two sets
  with ab straps allowed.

### One-arm pull-up

The goal is a one-arm pull-up. `data-oap.ts` builds the path once: a
one-arm scap shrug, then a lopsided two-hand ladder (uneven grip, archer,
typewriter) until the gates open. Assisted one-arms open at a tested 140%
bodyweight weighted pull-up, one-arm negatives (CAVE 01 only) at 150%. The
weighted pull-up is the main driver until then. It lives in CAVE 01, HOME 02
and CAVE 03.

MORN is the wake-up routine: yoga mat, medium band with no anchor, small pull
edge on a sling, done before anything else competes for it. 03 FEET ON swaps
the edge for one 16kg kettlebell; 04 BAND ONLY is the same session with the
band doing the kettlebell's job. No MORN session uses a pull-up bar or asks
the athlete to jump: it runs early, in a flat with neighbours. Three constraints shape it, and
`npm run check:morning` is what stops them regressing:

- **`recoveryHours: 0`** on every session. Nothing loads a tendon hard enough to
  cost the next session, so readiness never blocks it and it stacks on a
  climbing day.
- **No ACCESSORY block.** TIRED drops that block entirely, and TIRED is exactly
  what a non-morning person reaches for. MORN is built from WARMUP, PREHAB and
  MOBILITY, none of which are dropped and none of which gain sets when FRESH —
  so the session has a hard time ceiling. 01 and 02 stay inside 15 minutes
  (worst case 11). 03 FEET ON and 04 BAND ONLY have a 20-minute budget and
  are the sessions that use SECONDARY: 03's swing, row and floor press and
  04's split squat, row and push-up gain a set on FRESH and lose one on TIRED,
  without ever being dropped. SECONDARY takes no level set bonus, so the
  ceiling holds — 03 runs TIRED 11, NORMAL 16, FRESH 20 at every level with no
  margin left, 04 about a minute less. Adding volume there will break the budget; the check
  will say so.
- **Fingers last and light.** One submaximal primer set of edge work, placed
  after the trunk work has warmed the tissue. Pulleys are stiffest on waking.
  The real finger dose is HANG 03.
- **Practice, not max.** Nothing in 03 or 04 is above MODERATE. The heavy pulling
  stays in HOME 02 and CAVE 01.
- **No lumbar flexion until last.** Discs are most swollen in the first hour
  after waking. 03 and 04 keep the lower back neutral until the Russian twist,
  which closes the session, done tall and slow.

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

## iOS

Capacitor 8 with Swift Package Manager. Portrait-only, iPhone-only, light
appearance locked, bundle ID `com.sevenbit.circuittraining`.

Four first-party plugins: `@capacitor/status-bar`, `@capacitor/splash-screen`,
`@capacitor/haptics`, `@capacitor/local-notifications`. Adding or removing one
means re-running `npx cap sync ios` so `ios/App/CapApp-SPM/Package.swift` is
rewritten.

One local plugin, `RestActivity` (`ios/App/App/RestActivityPlugin.swift`),
starts and ends the rest Live Activity; no npm package covers ActivityKit.
Local plugins are not auto-discovered, so `MainViewController` registers it in
`capacitorDidLoad()`, and `Main.storyboard` points at `MainViewController`
instead of `CAPBridgeViewController`. `NSSupportsLiveActivities` is `true` in
Info.plist.

The countdown UI is the `RestTimerWidget` Widget Extension target. Its sources
live in `ios/LiveActivity/` and are copied into the target once it has been
created in Xcode (see the README there). `RestActivityAttributes` is defined in
both targets and the two must stay identical — ActivityKit matches them by type
name and encoded shape. The extension needs a minimum deployment of iOS 16.2.

The App target should carry the **Time Sensitive Notifications** capability so
rest alerts break through Focus. Without it the alert is still delivered, at
the normal level.

`UIViewControllerBasedStatusBarAppearance` must stay `true` in Info.plist —
the status bar plugin sets the style through the view controller, and setting
that key to false makes `setStyle` a silent no-op.

Icon and splash are generated from `public/images/logo.svg` by
`tools/generate-ios-assets.py`, so editing the logo and re-running the script
keeps all three in sync. Do not hand-edit the PNGs.

## Planned Future Work

- **Supabase**: Auth + Postgres DB for multi-user. Swap storage adapter, add API routes.
- **Vercel deployment**: Connect repo, configure build.
- **Vitest around `src/core/`**: no test framework exists yet. The invariants
  worth covering first: `scaleRest` never returns below the protocol value on a
  PRIMARY block, gates resolve to their substitute when closed, decay respects
  the grace periods, and `getLoadAxis` stays null for unlogged blocks.

## Handoff Documents

- **`7bit-handover-v11.md`** — current for the app shell. The iOS setup
  (orientation, appearance, plugins, the status bar trap), the wall-clock timer
  fix, load logging, and asset generation. Defers to v10 for all training
  content.
- **`7bit-handover-v10.md`** — current for the programme. The training model: diagnosis of what was
  wrong with v9's programme, the new capacity/block/load model, the original ten
  sessions (HOME 04, CAVE 05 and all of MORN came later and are documented in
  their data files and the Sessions section above),
  benchmarks and targets, the evidence base, and the Mac terminal commands.
- **`7bit-handoff-v9.md`** — design system, screen layouts, copy system, stats
  specification. Still current for everything visual. **Its training content
  (sections 8, 9 and the mode/circuit tables) is superseded by v10.**
