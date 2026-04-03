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
    config.ts    # Central CONFIG object
    engine.ts    # Training logic: buildList, scaleReps, applyXP, checkDecay, etc.
    stats.ts     # Trend scoring, chart data generation, muscle list sorting
    data-home.ts, data-cave.ts, data-hang.ts  # Exercise libraries
    data-index.ts  # getModeData(mode) helper
  storage/       # Async storage abstraction (swap localStorage for Supabase later)
    storage.interface.ts  # IStorageAdapter interface
    local-storage.adapter.ts
    index.ts     # Factory: getStorageAdapter() / setStorageAdapter()
  store/         # Zustand store
    store.ts     # Combined store with persist middleware
    slices/      # app-slice, workout-slice, progress-slice, stats-slice
  hooks/         # React hooks
    use-timer.ts   # Web Audio beeps + setInterval countdown
    use-swipe.ts   # @use-gesture/react wrapper
    use-hydration.ts  # SSR guard for Zustand persist
    use-audio-init.ts # One-time AudioContext init (iOS)
    audio-context.ts  # Module-scoped AudioContext singleton
  components/
    screens/     # One component + CSS module per screen
      HomeScreen, WorkoutScreen, RestScreen, CompleteScreen, StatsScreen
    shared/      # SettingsOverlay, TimerFlash
  app/
    layout.tsx   # Root layout: Kode Mono font, metadata, viewport
    page.tsx     # Screen router based on Zustand screen state
    globals.css  # CSS custom properties, base resets, shared keyframes
```

### Key Design Decisions

- **Core logic is framework-agnostic**: `src/core/` has zero React imports. Engine functions are pure — they take progress/config and return new state. This enables sharing with the future Capacitor/iOS app.
- **Storage abstraction**: All methods are async (Promise-based). Currently backed by localStorage. To add Supabase later, implement `IStorageAdapter` and call `setStorageAdapter()`.
- **Single-page app**: No Next.js routes. All screens render in `page.tsx` based on `useStore(s => s.screen)`. Screen switching is managed by Zustand state.
- **Zustand persist**: Only `progress` and `sessionLog` are persisted (via `partialize`). UI state is transient.

### State Model (Zustand Store)

Four slices in a single store:
- **AppSlice**: mode, circuitIndex, energy, screen, humorLine
- **WorkoutSlice**: circuit, exerciseList, stepIndex, round, currentExercise, swapActive, formGuideOpen
- **ProgressSlice**: progress (per-muscle XP/history), sessionLog, pendingDecayEvents, sessionLevelUps
- **StatsSlice**: statsSort, statsTimeFilter, activeChartMuscles, highlightMuscle

### Three Modes

| Mode | Equipment | Circuits |
|------|-----------|----------|
| HOME | Mat, pull-up bar, medium band (no anchor) | 01 Push+Core, 02 Pull+Biceps, 03 Legs+Body |
| CAVE | KB 12kg, DB, rings, TRX, campus board, hangboard, bands+anchors | 01 Push+Core, 02 Pull+Biceps, 03 Legs+Body |
| HANG | Hangboard (gym), 20mm half-crimp | 01 Max Hangs, 02 Density Hangs |

### Progression System

7 levels per muscle group (12 groups). XP thresholds: 0 / 6 / 16 / 30 / 50 / 80 / 120.

```
final_reps = base_reps * energy_mult * muscle_level_mult
final_rest = base_rest + energy_offset + muscle_level_offset (uses lowest group in circuit)
variation  = highest where min_level <= group_level
```

Energy: FRESH (x1.2 reps, +0s rest), NORMAL (x1.0, +10s), TIRED (x0.75, +20s, -1 round).
Decay: -2 XP all groups per 7-day inactivity window (checked at 10+ days). Skip: -1 XP.
Variation unlocks: L1=base, L4=harder variant, L5=new exercise, L6=advanced variant.

## Styling

Kode Mono monospace font. Mobile-first, max-width 390px. CSS Modules per component, global custom properties in `globals.css`.

**Color tokens:** `--ink` (#181610), `--accent` (#E64D19), `--bg` (parchment gradient), `--ink-ghost`/`--ink-dim`/`--ink-faint` for opacity variants.

**Design rules:** No glassmorphism. No dark theme. Cards outlined (2px solid), not filled. Tab indicators use bottom-border style (6px active, 2px inactive).

## Planned Future Work

- **Supabase**: Auth + Postgres DB for multi-user. Swap storage adapter, add API routes.
- **Vercel deployment**: Connect repo, configure build.
- **iOS app**: Capacitor wrapper around the web app.

## Handoff Document

`7bit-handoff-v9.md` contains the complete spec: design system, variation trees, screen layouts, copy system, stats specification.
