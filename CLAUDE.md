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
npm run start    # Serve production build

npm run check:morning   # Assert the MORN sessions still fit their 15-minute budget
```

No test framework yet — test manually in browser. The one automated check is
`check:morning`, which guards the two promises MORN makes.

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
    data-home.ts, data-cave.ts, data-hang.ts, data-morning.ts  # Session libraries
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
  `loadLog` are persisted (via `partialize`). UI state is transient.
- **Native code is optional**: everything in `src/native/` is behind a dynamic
  import and a platform check, so the same bundle runs as a browser PWA and
  `next build` can still prerender it in Node. Prefer a web standard over a
  Capacitor plugin where one exists — screen wake uses the Wake Lock API, not a
  plugin, and so works in both shells.
- **Timers count against the clock**: `use-timer` reads a `Date.now()` deadline
  rather than decrementing per tick. iOS suspends timers when the app
  backgrounds or the screen locks, and a decrementing counter silently loses
  that time.

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
  campus board needs a recorded 130% bodyweight 20mm hang; until then it is
  substituted with recruitment pulls.
- `getReadiness()` enforces 48h between maximal finger sessions.
- Skipping and quitting cost **zero** XP. Punishing a skip in an app that
  prescribes maximal finger loading pushes the athlete to train through a
  warning sign.

### Sessions

| Mode | Sessions |
|------|----------|
| HOME | 01 TENSION, 02 PULL, 03 ARMOUR |
| CAVE | 01 MAX, 02 POWER, 03 CAPACITY, 04 ASSESS |
| HANG | 01 MAX HANGS, 02 CAPACITY, 03 DENSITY |
| MORN | 01 ABS + OBLIQUES, 02 SLOW START |

MORN is the wake-up routine: yoga mat, medium band with no anchor, small pull
edge on a sling, done before anything else competes for it. Three constraints
shape it, and `npm run check:morning` is what stops them regressing:

- **`recoveryHours: 0`** on both sessions. Nothing loads a tendon hard enough to
  cost the next session, so readiness never blocks it and it stacks on a
  climbing day.
- **No ACCESSORY block.** TIRED drops that block entirely, and TIRED is exactly
  what a non-morning person reaches for. MORN is built from WARMUP, PREHAB and
  MOBILITY, none of which are dropped and none of which gain sets when FRESH —
  so the session has a hard time ceiling. Worst case is 11 minutes.
- **Fingers last and light.** One submaximal primer set of edge work, placed
  after the trunk work has warmed the tissue. Pulleys are stiffest on waking.
  The real finger dose is HANG 03.

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

Three first-party plugins: `@capacitor/status-bar`, `@capacitor/splash-screen`,
`@capacitor/haptics`. Adding or removing one means re-running `npx cap sync ios`
so `ios/App/CapApp-SPM/Package.swift` is rewritten.

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
- **Wire ASSESS to `recordBenchmark`** so test results open the safety gates.

## Handoff Documents

- **`7bit-handover-v11.md`** — current for the app shell. The iOS setup
  (orientation, appearance, plugins, the status bar trap), the wall-clock timer
  fix, load logging, and asset generation. Defers to v10 for all training
  content.
- **`7bit-handover-v10.md`** — current for the programme. The training model: diagnosis of what was
  wrong with v9's programme, the new capacity/block/load model, all ten sessions,
  benchmarks and targets, the evidence base, and the Mac terminal commands.
- **`7bit-handoff-v9.md`** — design system, screen layouts, copy system, stats
  specification. Still current for everything visual. **Its training content
  (sections 8, 9 and the mode/circuit tables) is superseded by v10.**
