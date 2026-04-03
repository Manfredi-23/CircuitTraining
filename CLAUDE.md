# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**7Bit Circuit Training** — a Progressive Web App (PWA) for circuit training with XP-based muscle group progression. Built for a single user (climber, 3 days/week, home + gym). Pure vanilla JavaScript, no build tools, no dependencies, no framework. Zero emojis in all code and UI copy.

**Live:** https://manfredi-23.github.io/CircuitTraining/
**Repo:** github.com/manfredi-23/CircuitTraining

## Development

No build step. To run locally, serve the directory with any HTTP server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. No test framework — test manually in browser. Use hard refresh (Cmd+Shift+R) to bypass Service Worker cache during development.

## Deployment

Static files hosted on GitHub Pages. Push to `main` to deploy. No CI/CD pipeline. The Service Worker (`sw.js`) caches all assets for full offline support. After changing files, the SW updates on next page load — users may need two reloads to see changes (SW lifecycle: install → activate → serve).

## Architecture

### Script Load Order (matters — no modules/bundler)

`config.js` → `data-home.js` → `data-cave.js` → `data-hang.js` → `engine.js` → `ui.js` → `timer.js` → `stats.js` → `app.js`

All loaded via `<script>` tags in `index.html`. Scripts depend on globals from earlier scripts.

### Module Responsibilities

- **config.js** — Central `CONFIG` object: modes, energy levels, 12 muscle groups, XP thresholds, storage keys, humor line pools, UI constants
- **engine.js** — Training logic: `buildList()`, `scaleReps()`, level/XP calculations, variation selection by muscle level, decay system (-2 XP per 7-day inactivity window)
- **ui.js** — All `render*()` functions: screen transitions (home → workout → rest → complete → stats), exercise cards, stat lists
- **stats.js** — Trend scoring (0–100 daily score per muscle group), behavior analysis (completion/energy/frequency modifiers), chart data generation with smoothing
- **timer.js** — Rest countdown with Web Audio API beeps and screen flash effects
- **app.js** — Main orchestrator: global state object `S`, event binding, swipe handling, localStorage persistence, init
- **data-home.js / data-cave.js / data-hang.js** — Exercise libraries for three modes (HOME=bodyweight at home, CAVE=gym equipment, HANG=hangboard)
- **sw.js** — Service Worker for offline caching

### State Model

Single global `S` object in `app.js` holds all runtime state. Persisted to localStorage under keys:
- `7bit_state` — Current app state
- `7bit_progress` — Per-muscle-group XP, levels, history (12 groups)
- `7bit_sessions` — Session log with timestamps, modes, durations
- `7bit_settings` — User preferences

### Three Modes

| Mode | Equipment | Circuits |
|------|-----------|----------|
| HOME | Mat, pull-up bar, medium band (no anchor) | 01 Push+Core, 02 Pull+Biceps, 03 Legs+Body |
| CAVE | KB 12kg, DB, rings, TRX, campus board, hangboard, bands+anchors | 01 Push+Core, 02 Pull+Biceps, 03 Legs+Body |
| HANG | Hangboard (gym), 20mm half-crimp | 01 Max Hangs, 02 Density Hangs |

### Progression System

7 levels per muscle group (12 groups: chest, back, shoulders, triceps, biceps, core, obliques, legs, glutes, forearms, grip, fingers). XP thresholds: 0 → 6 → 16 → 30 → 50 → 80 → 120.

**Scaling formula:**
```
final_reps = base_reps × energy_mult × muscle_level_mult
final_rest = base_rest + energy_offset + muscle_level_offset (uses lowest group in circuit)
variation  = highest where min_level ≤ group_level
```

**Energy states:** FRESH (×1.2 reps, +0s rest), NORMAL (×1.0, +10s), TIRED (×0.75, +20s, -1 round)

**Decay:** -2 XP all groups per 7-day inactivity window (checked every 10 days). Skip penalty: -1 XP. Can drop levels and lose variation unlocks.

**Variation unlocks:** L1=base exercises, L4=swap to harder variant, L5=new exercise added, L6=advanced variant.

## Exercise Data Format

```javascript
{
  id: 'wide-pushup',
  name: 'Wide Push-Ups',
  muscles: ['chest', 'shoulders'],
  baseReps: 12,
  baseRest: 60,          // seconds
  unit: 'reps',          // or 'sec' for holds
  variations: [
    { minLevel: 1, name: 'Wide Push-Ups' },
    { minLevel: 4, name: 'Archer Push-Ups' },
    { minLevel: 6, name: 'Ring Archer Push-Ups' }
  ],
  form: {
    setup: "...",
    execution: "...",
    cue: "...",
    breathing: "...",
    mistakes: "..."
  }
}
```

Circuits wrap exercises: `{ id, circuitNum, title, subtitle, muscles[], illustration, duration, rounds, exercises[] }`.

## Styling

Single font: **Kode Mono** (Google Fonts, weights 400–700). Mobile-first layout, max-width 390px.

**Color tokens:**
- Background: `radial-gradient(433% 99% at 50% 0.71%, #E4E2DD 0%, #B2AD9F 100%)` (warm parchment)
- Primary ink: `#181610` (near-black, used for text, borders, icons)
- Accent: `#E64D19` (burnt orange — humor lines, stats border, decline indicators)
- Ghost: `rgba(24, 22, 16, 0.22)` (circuit number watermark)

**Key design rules:** No glassmorphism. No dark theme. No per-mode accent colors. Cards are outlined (2px solid #181610), not filled. Tab indicators use bottom-border style (6px active, 2px inactive). Illustrations are pixel-art isometric PNGs in monochrome (#181610 + #808080).

## Stats System

Stats page has three sections:
1. **Overall level** — average of all 12 muscle group levels + dry/ironic interpretation line
2. **Muscle group list** — sortable (strongest/weakest/recent), each row shows name + level + trend arrow (↑/↓/—)
3. **Trend graph** — line chart with time filters (7D/30D/90D/ALL), multi-select muscle groups, daily 0–100 score per group based on level + XP progress + behavior modifiers + decay + smoothing

## Handoff Document

`7bit-handoff-v9.md` contains the complete spec: design system, variation trees for all muscle groups, screen layouts, copy system (humor line pools), and stats specification. Consult it for detailed requirements.
