# 7BIT — Circuit Training PWA
## Development Handoff v9 — April 2026

Complete spec for building the 7Bit training PWA from scratch.

---

## 1. CURRENT STATE

- **App name:** 7Bit
- **Live URL:** https://manfredi-23.github.io/CircuitTraining/
- **Repo:** github.com/manfredi-23/CircuitTraining
- **Status:** Previous version broken (encoding corruption). Full rebuild from scratch using Figma design.

---

## 2. USER PROFILE

- **Person:** Manfredi, Switzerland
- **Stats:** Male, 60kg, 173cm, good fitness
- **Climbing:** 6b-7b, granite/gneiss
- **Pull-ups:** 4-7 strict | **Diamond push-ups:** Comfortable | **Hangboard:** 20mm half-crimp (gym only)
- **Gym:** Minimum Bouldering Zurich — KB 12kg, DB, rings, TRX, campus board, hangboard, bands with anchor points
- **Home:** Yoga mat, pull-up bar, medium band (hand-held, no anchor)
- **Goals:** Climbing performance, definition (belly, chest, biceps), stronger shoulders + back
- **Training:** 3 days/week flexible. 40 min home/fingers, up to 60 min gym.
- **Phone:** Propped on floor. Needs large text + touch targets.
- **Alerts:** Audio beeps + visual flash on rest timer.

---

## 3. DESIGN SYSTEM (from Figma export — v9 redesign)

### 3.1 Typography
- **Primary font:** Kode Mono (Google Fonts) — used for ALL text (headings, body, data, timers, labels)
- **No secondary font.** Single-font system throughout.
- Load: `fonts.googleapis.com/css2?family=Kode+Mono:wght@400;500;600;700`

| Element | Weight | Size | Extras |
|---------|--------|------|--------|
| Card title (e.g. "PUSH + CORE") | 700 | 16px | uppercase |
| Card subtitle (e.g. "chest - shoulders - core") | 400 | 12px | lowercase, separated by " - " |
| Mode tabs (HOME / CAVE / HANG) | 600 | 16px | uppercase, letter-spacing 0.1em |
| Humor line (under logo) | 500 | 12px | |
| Energy labels (FRESH / NORMAL / TIRED) | 600 | 16px | uppercase, letter-spacing 0.1em |
| Info bar duration ("35 min.") | 700 | 12px | |
| Circuit number (background) | 600 | 98px | uppercase, letter-spacing -0.05em, rgba(24,22,16,0.22) |
| Stats title ("STATS") | 700 | 16px | |
| Stats subtitle ("Numbers and consequences") | 400 | 12px | |
| Stats interpretation line | 500 | ~16-18px | accent color |
| Muscle group names (stats list) | 400 | 14px | lowercase |
| Muscle level values (e.g. "Lvl04") | 400 | 14px | |
| Trend graph section ("OVERVIEW") | 700 | 14px | uppercase |
| Time filter labels ("7days", "30days") | 400 | 12px | |
| Navigation buttons (STATS, Settings) | 700 | 16px | |

### 3.2 Colors

**LIGHT THEME** — the app has moved from dark to light.

| Token | Value | Usage |
|-------|-------|-------|
| --bg | radial-gradient(433% 99% at 50% 0.71%, #E4E2DD 0%, #B2AD9F 100%) | Page background (warm parchment radial gradient) |
| --text-primary | #181610 | Primary text, borders, icons (near-black warm) |
| --text-secondary | #181610 | Same hue, used at lighter weights for subtitles |
| --text-ghost | rgba(24, 22, 16, 0.22) | Circuit number watermark behind card |
| --accent | #E64D19 | Accent color: humor line, STATS button border, Stats title, interpretation line |
| --card-bg | transparent / inherit | Cards have no fill — outlined only |
| --card-border | 2px solid #181610 | Card border (solid, not glassmorphism) |
| --card-radius | 12px | Card corner radius |
| --info-border | 2px solid #181610 | Info bar (duration + energy dots) |
| --info-radius | 6px | Info bar corner radius |
| --dot-filled | #181610 (solid fill) | Energy dot — active |
| --dot-outline | 1px solid #181610 | Energy dot — inactive |
| --tab-active | 6px solid #181610 (bottom border) | Active mode tab indicator |
| --tab-inactive | 2px solid #181610 (bottom border) | Inactive mode tab indicator |
| --stats-border | 2px solid #E64D19 | Stats card border (accent) |
| --settings-border | 2px solid #181610 | Settings card border |
| --decline-indicator | #E64D19 (red bar) | Decline indicator left-side bar on muscle list |

**Key change from v7/v8:** NO glassmorphism. NO dark gradient. NO mode-colored accents per section. The entire app uses a single warm parchment light background with near-black (#181610) as the primary UI color and #E64D19 (vermillion/burnt orange) as the sole accent.

### Muscle group indicators (stats)
- Trend arrows: up arrow, down arrow, or dash — displayed after level value
- Decline warning: small red (#E64D19) vertical bar to the left of the muscle name for groups trending down significantly (see Stats screen: legs, glutes)

### 3.3 Layout tokens
- Page padding: 48px top, 24px sides, 24px bottom
- Section gap: 24px
- Card size: 342w x 342h px (full-width, square)
- Card padding: 24px internal
- Card radius: 12px
- Card border: 2px solid #181610
- Info bar: 294w x 39h px, 2px border, 6px radius, 12px internal padding
- Energy dots: 12px circles, 6px gap. Filled #181610 = active, 1px border #181610 = inactive
- Activity illustrations: ~175-215px pixel-art isometric, centered in card
- Mode tabs: 3 equal columns (114px each), bottom-border style
- Circuit number watermark: 98px, positioned top-right of card, behind content

### 3.4 Illustrations
**Pixel-art isometric style** — NOT Iconoir SVGs. Each exercise card uses a custom isometric pixel-art illustration showing the exercise figure. These are rasterized assets (PNG) with:
- Monochrome palette: #181610 (black outlines/fills) + #808080 (grey midtones/shadows)
- Isometric perspective
- Character performing the exercise
- Equipment visible where relevant (barbell, dumbbell, kettlebell, hangboard, pull-up bar)

Illustration set:
- HOME: push-ups (floor position), pull-ups (hanging from bar), squats (weighted squat)
- CAVE: kettlebell (KB swing/carry), dumbbell (curl), barbell (deadlift)
- HANG: max hangs (hanging figure), density hangs (hangboard isometric)

### 3.5 Background
Full page: `background: radial-gradient(433.05% 99.29% at 50% 0.71%, #E4E2DD 0%, #B2AD9F 100%);`
Warm parchment/paper tone. No noise texture, no overlay. Clean gradient only.

### 3.6 Logo
7Bit logo: custom pixel-art logotype, #0F110C fill on light background. ~150w x 60h px max (187.5 x 75 max). Centered at top of page.

---

## 4. COPY SYSTEM (rotating humor)

All humor lines rotate randomly on each visit.
Font: Kode Mono 500, 12px, color #E64D19 (accent).
Positioned below the 7Bit logo, centered.

### App humor line (under 7Bit logo)
Randomly selected on each visit from the combined pool:
```
"Suffer smarter, not harder."
"Your fingers called. They hate you."
"Because the wall won't climb itself."
"Gainz for granite enthusiasts."
"Training app. Excuse eliminator."
"Powered by chalk and poor decisions."
"The app your physio warned you about."
"Vertical ambition. Horizontal recovery."
"Floor is lava. You are push-up."
"Your mat misses you. Allegedly."
"Resistance band goes brrr."
"No gym. No excuses. No mercy."
"Bodyweight: the original kettlebell."
"Sweat deposit for the living room."
"Minimum effort. Maximum suffering."
"The kettlebell doesn't judge. Much."
"Rings: because instability is a feature."
"Campus board: fingers go brrr."
"TRX: suspended disbelief in your fitness."
"12kg of existential growth."
"Hang in there. Literally."
"20mm of pure personality."
"Tendons: the world's slowest gains."
"Half-crimp, full commitment."
"Your forearms will write a memoir."
"Edge lord training protocol."
```

**v9 change:** Per-mode card humor lines removed (cards no longer have individual humor text). All lines merged into a single subtitle pool displayed under the logo.

---

## 5. HOME SCREEN LAYOUT (from Figma v9)

The home screen is a SINGLE PAGE with a top mode selector and a swipeable card for circuit selection.

```
[7Bit Logo - 150x60px, centered, #0F110C]
[Rotating humor line - Kode Mono 500 12px #E64D19 centered]

[MODE TABS: HOME | CAVE | HANG]  <-- 3-column tab bar, bottom-border style
  Active tab: 6px bottom border
  Inactive tabs: 2px bottom border

[SINGLE CARD - 342x342px, 2px border #181610, 12px radius]
  Title row: "PUSH + CORE" (Kode Mono 700 16px uppercase)
  Subtitle: "chest - shoulders - core" (Kode Mono 400 12px)
  Divider: 2px solid #181610 under subtitle
  Circuit number watermark: "01" at 98px, top-right, rgba(24,22,16,0.22)
  Illustration: pixel-art isometric figure, centered, ~175-215px
  Energy row: FRESH | NORMAL | TIRED (Kode Mono 600 16px, bottom-border tabs)
    Active energy: 6px bottom border
    Inactive energy: 2px bottom border
  Info bar: [35 min.] [energy dots] — bordered pill, 6px radius

  SWIPE LEFT/RIGHT to change circuit within mode
  Energy dots update to reflect which circuit is shown (e.g. 1 of 3)
```

[STATS button] — 342w x 68h px, 2px border #E64D19, 12px radius, "STATS" + arrow
[Settings button] — 342w x 68h px, 2px border #181610, 12px radius, "Settings" + arrow

### Navigation model (v9 change)
- **NO bottom nav tabs.** Navigation is via the top mode tabs + bottom action buttons.
- **NO horizontal card scroll row.** Replaced by swipe within a single full-width card.
- **NO separate pre-workout screen.** Energy is selected directly on the card (FRESH / NORMAL / TIRED tabs inside the card). Tapping the card or a START action begins the workout.
- **Mode selection:** HOME / CAVE / HANG tabs at top switch the card content.
- **Circuit selection:** Swipe left/right on the card to cycle through circuits within the selected mode (e.g. HOME has 3 circuits: Push+Core, Pull+Biceps, Legs+Body).
- **Stats access:** Dedicated STATS button below the card (accent-bordered).
- **Settings access:** Dedicated Settings button below Stats.

---

## 6. THREE MODES

| Mode | Tab Label | Old Label | Equipment |
|------|-----------|-----------|-----------|
| HOME | HOME | Home Workouts | Mat, pull-up bar, medium band (no anchor) |
| CAVE | CAVE | Paincave | KB 12kg, DB, rings, TRX, campus, hangboard, bands+anchors |
| HANG | HANG | Fingers | Hangboard at gym, 20mm half-crimp |

**v9 change:** Mode labels shortened to HOME / CAVE / HANG for the tab bar. No per-mode accent colors — all UI uses #181610 + #E64D19.

Sessions:
- HOME: 01 Push+Core, 02 Pull+Biceps, 03 Legs+Body (swipe to select)
- CAVE: 01 Push+Core, 02 Pull+Biceps, 03 Legs+Body (swipe to select)
- HANG: 01 Max Hangs, 02 Density Hangs (swipe to select)

Circuit numbering: displayed as "01", "02", "03" watermark at 98px in the card background.

---

## 7. ENERGY DIAL

**v9 change:** Energy is now selected DIRECTLY ON THE CARD via tab-style buttons (FRESH / NORMAL / TIRED), not on a separate pre-workout screen.

Energy tabs use the same bottom-border pattern as mode tabs:
- Active energy: 6px solid #181610 bottom border
- Inactive energy: 2px solid #181610 bottom border

| Level | Reps | Rounds | Rest |
|-------|------|--------|------|
| FRESH | x1.2 | As written | 0 |
| NORMAL | x1.0 | As written | +10s |
| TIRED | x0.75 | -1 round/circuit | +20s |

Energy indicator in info bar: 3 dots (12px). Filled #181610 = FRESH position, outlined = other levels. Dot count reflects which circuit is selected (e.g. 2 filled = circuit 02 of 03).

---

## 8. ADAPTIVE PROGRESSION

Each of 12 muscle groups progresses independently. Front-loaded XP curve. 7 levels.

### XP Earning
- Completed exercise = +1 XP to each muscle group it targets
- Only DONE exercises count, not skipped

### XP-to-Level Curve

| Level | XP Needed | Cumul | Reps | Rest | Unlocks |
|-------|-----------|-------|------|------|---------|
| 1 | 0 | 0 | Base | +15s | Starting exercises |
| 2 | 6 | 6 | +10% | -5s | Rep increases |
| 3 | 10 | 16 | +15% | -10s | Tempo prescriptions |
| 4 | 14 | 30 | +15% | -10s | VARIATION SWAPS |
| 5 | 20 | 50 | +20% | -15s | NEW exercises added |
| 6 | 30 | 80 | +20% | -15s | Advanced variations |
| 7 | 40+ | 120+ | +25% | -15s | Peak programming |

### Derank / Decay

| Trigger | Penalty | Affected |
|---------|---------|----------|
| Quit early | -1 XP per group in undone exercises | Skipped muscles only |
| Skip exercise | -1 XP for that exercise's muscles | That exercise only |
| Inactivity 10+ days | -2 XP all groups per 7-day window | All groups |

- No floor, can drop to L1
- Variation unlocks lost when level drops
- Dismissable notification banner on home: motivational tone
- Example: "Your Back dropped to L3. Time for pull-ups?"

### Formula
```
final_reps = base_reps * energy_mult * muscle_level_mult
final_rest = base_rest + energy_offset + muscle_level_offset (uses lowest group in circuit)
variation = highest where min_level <= group_level (user can tap to swap back)
```

---

## 9. VARIATION TREES

L1 = base. L4 = swap. L5 = new exercise added. L6 = advanced swap.

### CHEST
- L1: Wide Push-Ups > L4: Archer > L6: Ring Archer (gym)
- L1: Diamond Push-Ups > L4: Close-Grip Ring (gym)
- L1: Decline Push-Ups > L4: Ring Push-Ups (gym) / Deficit Decline (home)
- L5 NEW: Band Chest Fly (gym)
- L1 gym: KB Floor Press > L4: 4s negative
- L1 gym: Ring Push-Ups > L4: feet elevated

### SHOULDERS
- L1: Pike Push-Ups > L4: Deficit Pike > L6: Ring Pike (gym)
- L1: Band OH Press (home) / Arnold Press (gym) > L4: KB Single-Arm Press
- L1: Band Front+Lateral Raise > L5: KB version (gym)
- L5 NEW: Band Face Pull (both)
- L5 NEW: TRX Y-Raise (gym)

### BACK
- L1: Pull-Ups > L4: 4s negative > L6: Typewriter
- L1: Wide-Grip > L4: 3s pause at top
- L1: Band Row (home) / KB Gorilla Row (gym) > L4: KB Single-Arm pause
- L5 NEW: Band Lat Pulldown (gym)
- L1 gym: Ring Pull-Ups > L4: false grip

### BICEPS
- L1: Chin-Ups > L4: 4s negative > L6: Weighted
- L1: Band Curls (home) / KB Hammer (gym) > L4: Ring Curls (gym)
- L1: Iso Chin Hold > L4: + 8s super-slow negative
- L5 NEW: KB Crush Curl (gym)
- L5 NEW: Band OH Tricep Extension (gym)

### CORE & OBLIQUES
- L1: Russian Twists > L4: Weighted (KB)
- L1: Hollow Body > L4: Rocks > L6: V-Up
- L1: Plank K2E > L4: 3s tempo
- L1: Dead Bug > L4: band resistance
- L5 NEW: Band Pallof Press (gym)
- L5 NEW: TRX Body Saw, TRX Pike (gym)

### LEGS & GLUTES
- L1: Bulgarian Split > L4: KB Bulgarian > L6: TRX Pistol (gym)
- L1: Squat Pulse > L4: KB Goblet (gym) / Jump Squats (home)
- L1: Band Good Mornings > L4: KB Romanian DL (gym)
- L5 NEW: Band Hip Abduction, KB Swing (gym)
- L6 NEW: KB Clean & Press (gym)

### FOREARMS & GRIP
- L1: Dead Hang > L4: 3-grip rotation
- L1 gym: KB Bottom-Up Hold > L4: Bottom-Up Press
- L5 NEW: KB Farmer's Walk (gym)

### FINGERS
- L1: Max Hangs 20mm > L4: 18mm > L6: 15mm
- L1: Repeaters BW > L4: Weighted
- L1: Open Hand 25mm > L4: 20mm
- L5 NEW: One-arm assisted, Campus speed ladders

---

## 10. SCREENS & UI FLOW

### 10.1 Home (single card with mode tabs)
- 7Bit pixel-art logo (centered, #0F110C)
- Rotating humor line (Kode Mono 500 12px, #E64D19, centered)
- Mode tab bar: HOME | CAVE | HANG (3-column, bottom-border active indicator)
- Single exercise card (342x342, 2px border, 12px radius):
  - Title + subtitle + divider
  - Circuit number watermark (98px, ghost opacity, top-right)
  - Pixel-art isometric illustration (centered)
  - Energy tab row: FRESH | NORMAL | TIRED (bottom-border style)
  - Info bar: duration + energy/circuit dots
  - Swipe L/R to change circuit within mode
- STATS button (accent-bordered #E64D19)
- Settings button (#181610-bordered)
- Derank banner when decay detected (dismissable)

### 10.2 Pre-Workout
**REMOVED in v9.** Energy is selected directly on the home card. Workout starts on card tap or explicit START action.

### 10.3 Workout
- Top: exit, mode+circuit label, energy badge, step X/Y
- Progress bar
- Circuit tag + round
- Exercise name HUGE + muscle tags with level badge
- Reps HUGE
- Variation swap (if unlocked): swap icon + "or: [base exercise]"
- Form guide toggle (5 sections)
- SKIP + DONE (large targets)
- Swipe L/R

### 10.4 Rest Timer
- Fullscreen, big countdown
- Audio beeps + visual flash
- SKIP button

### 10.5 Complete
- Check, title, duration, mode+energy labels
- Level-up notifications (e.g. "Chest > L4! Archer Push-Ups unlocked")
- DONE button

### 10.6 Stats
See **Section 13: STATS — OVERVIEW & TREND SYSTEM** for full specification.

**v9 Stats screen layout (from Figma):**
The Stats screen opens as an expanded panel (accent-bordered #E64D19, full-width) containing:
1. Header: "STATS" (#E64D19) + "Numbers and consequences" + back arrow
2. Overall level: large circuit-number-style watermark (e.g. "04") + interpretation line in #E64D19 (e.g. "Acceptable improvement.")
3. Last session reference: "Last:" + "Home [Push + core]"
4. MUSCLE GROUPS section:
   - Sort tabs: strongest | weakest | recent (bottom-border active style)
   - List of 12 muscle groups: name + "Lvl04" + trend arrow (up/down/dash)
   - Decline indicator: small #E64D19 vertical bar left of muscle name for declining groups
5. OVERVIEW section (trend graph):
   - Time filter tabs: 7days | 30days | 90days | total (bottom-border active style)
   - Line chart: multiple lines (black = overall, #E64D19 = selected muscle, dashed = others)
6. Settings button at bottom

### 10.7 Session Log
- Date-grouped entries
- Accessible via Stats or navigation

### 10.8 Exercises
- EXERCISES button (full-width, bordered, with arrow) sits above the STATS panel
- Provides access to exercise library / history

---

## 11. FILE STRUCTURE

```
CircuitTraining/
  index.html
  manifest.json
  sw.js
  css/style.css
  assets/
    logo.png             (7Bit pixel-art logo)
    home-pushups.png     (pixel-art isometric illustrations)
    home-pullups.png
    home-squats.png
    cave-kettlebell.png
    cave-dumbbell.png
    cave-barbell.png
    fingers-maxhangs.png
    fingers-hangboard.png
  js/config.js           (modes, energy, levels, muscle map, humor lines)
  js/data-home.js        (HOME exercises + variation trees)
  js/data-cave.js        (CAVE exercises + variation trees)
  js/data-hang.js        (HANG exercises + variation trees)
  js/engine.js           (buildList, scaleReps, levels, decay, variations)
  js/ui.js               (all render functions)
  js/timer.js            (rest timer + audio)
  js/stats.js            (stats calculations, trend scoring, chart rendering)
  js/app.js              (state, events, swipe, localStorage, init)
```

Vanilla JS only. No React, no build tools. Global state object S in app.js.
Load order: config > data > engine > ui > timer > stats > app.

**v9 changes:** Removed js/icons.js (pixel-art PNGs replace Iconoir SVGs). Renamed data-gym.js to data-cave.js, data-fingers.js to data-hang.js. Added stats.js for the trend system. Added assets/ folder for illustrations.

---

## 12. PROMPT FOR NEW CHAT

```
I am building 7Bit, a Circuit Training PWA, from scratch. Attached: handoff document v9 with complete specs — light parchment theme, Kode Mono single-font system, pixel-art isometric illustrations, tab-based mode selector (HOME/CAVE/HANG) with swipeable circuit cards, in-card energy selection, muscle-group adaptive progression with derank/decay, exercise variation trees, stats & trend system with sortable muscle list and trend graph, and multi-file vanilla JS architecture. Also attached: my Figma screen exports and pixel-art illustration assets. Build as separate files per Section 11. Vanilla JS, zero emojis. GitHub Pages at manfredi-23.github.io/CircuitTraining/. Read the handoff doc fully, then build each file starting with config.js. For exercise form guide text, write detailed descriptions (setup, execution, mental cue, breathing, common mistakes) for each exercise.
```

---

## 13. STATS — OVERVIEW & TREND SYSTEM

### Purpose

The Stats page provides a clear diagnosis of the system.

It answers three questions:
- Where am I?
- What is changing?
- What needs attention?

The page is composed of three main parts:
1. Overall level (with interpretation)
2. Muscle group list (with sorting and trends)
3. Trend graph (time-based evolution)

---

### 13.1 Overall Level (top card)

**What it shows**

At the top of the Stats page:
- A large overall level (average of all muscle groups)
- A short interpretation line

Example:

```
Lvl 4
Holding steady.
```

**How overall level is calculated**
- Average of all 12 muscle group levels
- Rounded to nearest integer for display
- Internally still uses full values for trend calculations

**Interpretation line (Racconsthaus style)**

This line reflects:
- Recent trend
- Behaviour quality
- General condition

Tone:
- Dry
- Slightly ironic
- Never motivational

**Suggested lines (50 options)**

Stable / neutral:
```
"Holding together."
"Acceptable."
"Still operational."
"Not collapsing."
"Functional."
"Surviving."
"It works."
"Maintained."
"No surprises."
"As expected."
```

Improving:
```
"Slightly better."
"Progress detected."
"Not pointless."
"Something is working."
"Marginal gains."
"Moving up."
"Less embarrassing."
"Improving, quietly."
"Unexpected progress."
"Acceptable improvement."
```

Declining:
```
"Slipping."
"That's fading."
"Less convincing."
"Needs attention."
"Dropping off."
"Not ideal."
"Decline detected."
"Slowly falling apart."
"Could be better."
"Losing ground."
```

Low effort / inconsistency:
```
"Inconsistent."
"Unconvincing."
"That was optional."
"Effort unclear."
"Not committed."
"Half done."
"Could try harder."
"Mostly theoretical."
"Intermittent."
"Questionable."
```

Fatigue / poor conditions:
```
"Running on fumes."
"Tired work."
"Not fresh."
"Energy questionable."
"Slower than usual."
"Low output."
"Underpowered."
"Slightly worn."
"Not peak."
"Limited effort."
```

General tone / fallback:
```
"It continues."
"Still here."
"Nothing dramatic."
"Carry on."
"This exists."
```

---

### 13.2 Muscle Group List

**Purpose**

Shows the state of each muscle group and allows quick comparison.

**Full list of 12 muscle groups:**
Chest, Back, Shoulders, Triceps, Biceps, Core, Obliques, Legs, Glutes, Forearms, Grip, Fingers

**Each row shows:**
- Muscle name
- Level (e.g. Lvl 4)
- Trend indicator (up / down / none)

**Example:**

```
Chest        Lvl 4  ↑
Back         Lvl 3  ↓
Core         Lvl 5
```

**Trend indicator**
- ↑ = recent improvement
- ↓ = recent decline (decay or skips)
- no arrow = stable

This reflects recent change, not long-term level.

**Sorting system**

User can sort the list:
- **Strong** = highest level first
- **Weak** = lowest level first
- **Recent** = most recently changed first

This changes order only, not content.

**Interpretation**
- Strongest = what carries the system
- Weakest = what holds it back
- Recent = what is changing now

---

### 13.3 Trend Graph

**Purpose**

Shows how each muscle group evolves over time. This is the dynamic view of the system.

**What the user sees**

A line chart with:
- Time filters: 7D / 30D / 90D / ALL
- Muscle selection (multi-select): Overall + all muscle groups

**Default view**
- Overall (always visible)
- Optionally one recently trained muscle

**Interaction**
- User taps muscle names to toggle lines on/off
- Multiple lines can be shown simultaneously
- Changing time filter updates chart

**What the graph represents**

Each line is based on a daily progress score (0–100) for each muscle group. This score is not shown directly.

**How each muscle group trend is calculated**

Each day, for each muscle group, the system calculates a score based on:

1. **Level (foundation)**
   - Higher level = higher baseline
   - Defines long-term position

2. **Progress within level**
   - XP progress toward next level
   - Smooths transitions between levels
   - Avoids sharp jumps

3. **Training behaviour** (evaluated over the selected time window)
   - **Completion:** finishing exercises improves score, skipping reduces it
   - **Energy:** fresh sessions slightly improve score, tired sessions reduce it
   - **Rest discipline:** respecting rest improves score, skipping rest reduces it
   - **Frequency:** regular training improves score, long gaps reduce it
   - These act as small modifiers, not dominant factors.

4. **Decay (inactivity)**
   - If no training occurs, score gradually decreases over time
   - Reflects loss of conditioning

5. **Smoothing**
   - Score is slightly averaged with previous days
   - Prevents sharp spikes
   - Creates a clean, readable line

**How to read the graph**
- Upward trend = improvement
- Flat line = maintenance
- Downward trend = loss / inactivity

**What it reveals**
- Which muscles are progressing
- Which are stagnating
- Which are declining
- Whether training is effective

---

### 13.4 Stats Page Structure Summary

```
Overall
  Lvl X
  [interpretation line]

Muscle Groups
  [sortable list with levels and arrows]

Trend
  [time filter + interactive line chart]
```

**Design principle:**
- Level = identity
- List = structure
- Graph = behaviour over time

This keeps the system: readable, honest, slightly unforgiving, but always clear.
