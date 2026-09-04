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
```

No test framework yet — test manually in browser.

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
    data-home.ts, data-cave.ts, data-hang.ts  # Session libraries
    data-index.ts  # getModeData(mode) helper
  storage/       # Async storage abstraction (swap localStorage for Supabase later)
  store/         # Zustand store (app / workout / progress / stats slices)
  hooks/         # use-timer, use-swipe, use-hydration, use-audio-init
  components/
    screens/     # HomeScreen, WorkoutScreen, RestScreen, CompleteScreen, StatsScreen
    shared/      # SettingsOverlay, TimerFlash
  app/           # layout.tsx, page.tsx (screen router), globals.css
```

### Key Design Decisions

- **Core logic is framework-agnostic**: `src/core/` has zero React imports. Engine
  functions are pure. This enables sharing with the future Capacitor/iOS app.
- **Storage abstraction**: All methods are async. Implement `IStorageAdapter` and
  call `setStorageAdapter()` to move to Supabase.
- **Single-page app**: No Next.js routes. All screens render in `page.tsx` based on
  `useStore(s => s.screen)`.
- **Zustand persist**: Only `progress`, `sessionLog` and `benchmarkResults` are
  persisted (via `partialize`). UI state is transient.

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

## Planned Future Work

- **Supabase**: Auth + Postgres DB for multi-user. Swap storage adapter, add API routes.
- **Vercel deployment**: Connect repo, configure build.
- **iOS app**: Capacitor wrapper around the web app.

## Handoff Documents

- **`7bit-handover-v10.md`** — current. The training model: diagnosis of what was
  wrong with v9's programme, the new capacity/block/load model, all ten sessions,
  benchmarks and targets, the evidence base, and the Mac terminal commands.
- **`7bit-handoff-v9.md`** — design system, screen layouts, copy system, stats
  specification. Still current for everything visual. **Its training content
  (sections 8, 9 and the mode/circuit tables) is superseded by v10.**
