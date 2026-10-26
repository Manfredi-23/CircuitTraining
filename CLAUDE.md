# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**7Bit Circuit Training** — a PWA for circuit training with XP-based muscle group progression. Built for a climber (3 days/week, home + gym). Zero emojis in all code and UI copy.

**Repo:** github.com/manfredi-23/CircuitTraining

## Working Agreements

Read the newest `docs/handovers/7bit-handover-vNN.md` before starting. Then, in every session:

1. **End with a new handover.** Write `docs/handovers/7bit-handover-vNN.md` one number up:
   what changed, repo state, open items, next steps, and the **Mac clean
   update** block below (filled in) plus any **Mac housekeeping** commands.
   Point the Handoff Documents list below at it. A message that changes the
   repo updates the current handover before it ends.
2. **End with housekeeping, done or handed over.** Work goes through PRs;
   open, check and merge every PR the session needs, resolve or close stale
   PRs, delete merged branches, leave `main` building with both checks green.
   `main` is the only long-lived branch: every session branches from the
   latest `main`, and its branch is deleted once merged. Whatever cannot be
   done from the cloud session (branch deletes are refused by the git proxy
   there; a merge without GitHub access) is handed to the athlete as **Mac
   housekeeping** commands, in the message and in the handover, e.g.
   `git push origin --delete <branch>` for each stale remote branch. Anything
   left open is listed in the handover.
3. **End every message that changes the app with the Mac clean update** block,
   exactly as below with `<MARKER>` replaced by a string only this session's
   change puts in the build (a new session title, say), and the Mac
   housekeeping commands when there are any. Rules for every Mac block: the
   folder is `~/Desktop/Manfredi/04_Bit-apps/CircuitTraining`; **no `#`
   comments** (the Mac's zsh runs them as commands); one command per line;
   safe to paste whole. Local edits on the Mac once blocked `git pull` and an
   old build went to the phone unnoticed: the block stashes them, pulls
   `--ff-only`, uses `npm ci` so the lockfile is never rewritten, and greps
   the build and the iOS copy for the marker.

   ```bash
   cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
   git stash push -u -m "mac-local-$(date +%Y%m%d-%H%M)"
   git checkout main
   git fetch origin --prune
   git pull --ff-only origin main
   git log -1 --oneline
   git branch --merged main | grep -v -E '^\*|^ +main$' | while read b; do git branch -d "$b"; done
   rm -rf out .next ios/App/App/public
   npm ci
   npx tsc --noEmit
   npm test
   npm run check:daily
   npm run check:cave
   npm run build
   grep -rl "<MARKER>" out/_next/static | head -1
   npx cap sync ios
   grep -rl "<MARKER>" ios/App/App/public/_next/static | head -1
   npx cap open ios
   ```

   Then in Xcode: Shift+Cmd+K, then Cmd+R. The message says what `git log -1`
   must show and that both `grep` lines must print a file name. `git stash
   list` keeps any stashed Mac edits; `git stash drop` deletes the newest.
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
npm run check:cave      # CAVE budgets (02/03 45 min, 04/05 75), 04/05 contents, one-arm gates
npm test                # Vitest around src/core/ (src/core/__tests__)
npm run test:e2e        # Playwright smoke tests on the built out/ (run npm run build first)
npm run seed            # Rewrite e2e/fixtures/athlete.json, an eight-week sample history
```

The automated checks are `check:daily`, which guards the promises DAILY
makes, `check:cave`, which keeps CAVE 02 and 03 inside 45 minutes NORMAL and
04 and 05 inside 75 at every level, holds 04 and 05 to core, balance, power at
full stretch, no bench or barbell and no hard finger set, and proves the
one-arm rungs open on a tested weighted pull-up and never on XP, and `npm test`. Every new core module gets a test file in
`src/core/__tests__/` in the same commit. The screens have Playwright smoke
tests in `e2e/smoke.spec.ts` (TODAY, a session from TRAIN to LOG, the finger
check on CAVE 04, EDIT before START, MAKE IT MINE, the weekly plan, STATS, UNDO), run against the static build with the
seed history; `e2e/serve.mjs` serves `out/`. In the cloud session set
`PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`; on the Mac
run `npx playwright install chromium` once.

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
    activity.ts  # Activity log: hikes, tours, runs; time/effort estimates, sore legs
    insights.ts  # STATS data: week strip, core volume, test rows, lifts, climb vs pull,
                 #   freshness, one-arm path, finger weeks, cut short
    review.ts    # STATS overview: last 28 days vs the 28 before, work split by area,
                 #   WHAT STANDS OUT insights
    training-load.ts # session-RPE load (effort x minutes), weekly totals, acute:chronic
    block.ts     # mesocycle: three build weeks, one deload week
    rehab.ts     # injured ring finger vs the healthy one: % of right, the 80% goal
    qualities.ts # balance and power at full stretch: what counts, which sessions are exempt
    progression.ts # suggested next load, personal bests
    recommend.ts # which session today
    reminders.ts # which local notifications to schedule
    health.ts    # Apple Health: energy suggestion, merge, weight, climb imports
    widget.ts    # the TodayWidget snapshot
    backup.ts    # export / import format; PERSISTED_KEYS
    dates.ts     # local-date helpers
    session-progress.ts # the set-by-set progress bar on the workout card and rest
    adjust.ts    # HARDER / EASIER (kept as tweaks), +/- SET today
    reserve.ts   # extra exercises to add mid-session, by area, place and safety
    data-extras.ts # reserve-only exercises: arm extras (no XP), lateral raise, face pull
    today.ts     # ADJUST TODAY: time cap, no kit, sore areas, rest / sick days
    custom.ts    # BUILD: place, time, goals and areas in/out, avoid, presets; what is not trained enough
    routines.ts  # the athlete's own routines: fixed lists, copy a session, freeze a build, warnings
    session-edit.ts # EDIT on the session page: swap (similar first), remove, move, sets, reps,
                 #   load planned for today, + exercise, + pack; today only or kept
    plan.ts      # the weekly plan, and how it leads TODAY unless a safety rule stops it
    also-fits.ts # TODAY: up to two more sessions that pass the same safety rules
    history.ts   # LOG: everything done as one stream; delete or correct a past session
    stats-headlines.ts # the one-sentence answer on top of each STATS section
    adapt.ts     # deload early / skip a deload, stalled lifts, the Monday summary line
    led-font.ts  # the 5 x 7 LED glyphs and 7 x 7 icons behind the LED numerals
    week-rail.ts # this week Monday to Sunday for the rail on TODAY
    data-daily.ts, data-cave.ts, data-assess.ts, data-heal.ts  # Session libraries, one per tab
    data-oap.ts  # One-arm pull-up path, shared by CAVE 01 and CAVE 02
    data-index.ts  # getModeData(mode) helper
  storage/       # Async storage abstraction (swap localStorage for Supabase later)
  store/         # Zustand store (app / workout / progress / stats / load / climb / routine / history slices)
  hooks/         # use-timer, use-swipe, use-hydration, use-audio-init, use-wake-lock,
                 #   use-today (recommendation, plan, alternatives), use-launcher (open or start any session)
  native/        # native.ts — Capacitor bridge: status bar, splash, haptics, notifications
                 # health.ts, widget.ts — bridges to the local Health and TodayWidget plugins
  components/
    shell/       # AppShell (the four tabs), TabBar, ScreenHeader, UndoToast
    screens/     # TodayScreen, TrainScreen, StatsScreen, LogScreen (the tabs); WorkoutScreen,
                 #   RestScreen, CompleteScreen, ClimbScreen, ActivityScreen
    shared/      # SettingsOverlay, TimerFlash, LoadLogger, ClimbStats, SessionInfo, StatsSections,
                 #   FormGuide, SessionProgressBar, AdjustControls, ReservePicker, DayControls,
                 #   BuildSheet, StatsOverview, SessionCard, RoutineEditor, ExercisePicker,
                 #   WeekPlanner, SessionDetail, ExerciseDetail, Led, WeekRail,
                 #   SessionEditor, PackList
e2e/             # Playwright smoke tests, the seed history (fixtures/athlete.json), serve.mjs
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
  `useStore(s => s.screen)`. The `'home'` screen is `AppShell`: four tabs
  (`tab`: TODAY, TRAIN, STATS, LOG) and a bottom bar. Full-screen panels
  (`.overlay-panel`) hide the bar while open (`body:has(.overlay-panel)`), and
  the screen entrance animation ends on `transform: none` so a screen never
  becomes the containing block for its fixed panels.
- **Zustand persist**: Only the keys in `PERSISTED_KEYS` (`src/core/backup.ts`)
  are persisted: `progress`, `sessionLog`, `benchmarkResults`, `loadLog`,
  `climbLog`, `activityLog`, `tweaks`, `dayPlan`, `offDays`, `blockStart`,
  `settings`, `health`, `buildPresets`, `routines`, `weekPlan` and `sessionEdits`. `partialize` reads that list, so a
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
- **Rest is for getting ready**: the rest screen previews the next piece of
  work (the store already points at it when rest starts) with its form guide
  open on three lines for a new exercise, and both screens carry the
  set-by-set progress bar. When the app slept through the end of a rest, the
  workout card says how long ago it ended (`restOverrun`).
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

The training content was rewritten in September 2026. See `docs/handovers/7bit-handover-v10.md`
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

### Pain check, readiness, effort and load

Sessions that load the fingers open with a 0-10 finger and wrist pain check
(`applyPainCheck`): up to 2 as written; 3-5 caps finger work at HARD, one set
shorter, and drops maximal finger tests; 6+ removes finger work. The score is
saved on the session.

Beside it, **finger readiness** (v33, the athlete's own call): 20 / 40 / 60 /
80 / 100%, default 100, asked on the same panel (`PainCheck`) before any
session that loads the fingers or hangs from the hands (`asksReadiness`: finger
capacities, `pull`, or `hangs: true`). `applyReadiness`: 80 caps finger work
at HARD, one set fewer; 60 caps it at MODERATE, one set fewer, no maximal
finger tests; 40 swaps finger work for its `noGripId` substitute (in
`circuit.substitutes`) or takes it out; 20 also takes out everything that
hangs or pulls. `applyFingerCheck` runs pain then readiness, so the stricter
wins, at start and on an energy switch. Saved as `readiness`; 60 or less holds
the next suggested finger load; shown in LOG, on the session page and under
FINGER LOAD. The complete screen asks session effort (1-10); the
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
  and IRCRA batteries order tests. It needs only a bar and a mat, and every test
  can be scored alone: the front lever ramp and the McGill flexor and
  back extension holds were replaced by toes-to-bar, a hollow body hold and
  the prone (Ito) extension hold. The old benchmarks stay for history. Maximal tests are **ramps**
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
fit that week; HEAL was added as a fourth while a finger heals.

| Mode | Sessions |
|------|----------|
| DAILY | 01 CORE + OBLIQUES, 02 OBLIQUES + BACK, 03 BAND STRENGTH, 04 FINGERS + MOBILITY, 05 LEGS + CORE, 06 QUIET FEET |
| CAVE | 01 STRONG, 04 POWER, 05 FULL BODY (no climbing); 02 PULL + PUSH, 03 LEGS + BACK (after bouldering) |
| TEST | 01 ASSESS (five sections, ramps, ~76-88 min) |
| HEAL | 01 LEGS + TRUNK, 02 PUSH + HINGE (injured finger, gym, ~60-70 min), 03 RING REHAB, 04 RING TEST (home, portable edge), 05 FOOTWORK (gym slabs, ~28 min) |

A typical week: DAILY most mornings, CAVE 02 or 03 straight after each
bouldering session, and a training day in place of a skipped bouldering day:
CAVE 01 STRONG first (once a week, fingers fresh), then 04 POWER or 05 FULL
BODY, least recently done (recommender rule 5, from Thursday, while climbing
days plus training days are under two).

HOME, HANG and MORN no longer exist. Their exercises that fit a mat-and-band
flat moved into DAILY with their ids unchanged, so load history carries over.
There is deliberately no limit-bouldering, campus or repeater session: free
bouldering is the athlete's own time and stays unprogrammed. Circuit ids in
CAVE were kept (`cave-01`, `cave-05`, `cave-06`) and only `circuitNum` and the
content changed. Old session-log entries may still carry the retired mode
names; they are display-only.

### HEAL

Added in October 2026 when the athlete hurt a finger: no climbing and no
pulling for a few weeks. Two gym sessions for the bouldering gym's training
area: one barbell **used for the squat only**, plates, a box, a stool, a
radiator to hook the feet under, bands, a mat. No machines, **no bench of any
kind** (the back extension is done over a stool, the Nordic curl with the heels
under the radiator), no TRX foot cradles. Alternated two or three times a week. The rule: **the hands only
rest on things or press flat.** Nothing is gripped (no dumbbell, kettlebell,
ring, bar hang or band handle) and nothing pulls; plates are hugged to the
chest, push-ups and pike push-ups are on flat palms. 01 LEGS + TRUNK: box jump,
back squat, step-up, split squat, back extension, Copenhagen, hollow hold,
plate crunch, toe drag, frogger. 02 PUSH + HINGE: Nordic curl, weighted
push-up, pike push-up, calf raise, prone Y-T-W on the floor, band ER, Russian
twist (plate hugged), side plank dip, lying leg raise, cobra + open book. Both
open with `heal-warmup` (no rower: it is a grip) and close with pain-free
tendon glides.

03 RING REHAB and 04 RING TEST are the physio's plan for the left ring finger
(tendon or lumbrical): the finger alone lifts the portable edge with weights
hung from it, the other fingers closed in a fist. 04 is a 12-rep ramp on the
right ring finger, saved as benchmark `ring-finger-right` (not an ASSESS:
`lastAssess` skips `REHAB_BENCHMARKS`). 03 is `heal-ring-left`, 3 x 12 at 90s,
`fixed`, from 2kg on the `finger-kg` stepper (0.5kg steps, edge included).
`Exercise.comparesTo` shows the left as a % of the right on the stepper, and
STATS has a RING FINGER section; 80% of the right is the physio's clearance
(`rehab.ts`). They carry `forearm`, so they ask the pain check, and any
suggested load holds after a session with pain 3+.

05 FOOTWORK is technique on the gym's easy slabs and vertical walls, hands
flat on the wall or off it: feet/ankle warm-up, silent feet (up and down),
sticky feet, inside / outside / tip / smear, no-hands slab, foothold balance.
Every drill is `fixed` (energy changes nothing, level picks the variation),
bodyweight, `legs` + `tension`, protocol `footwork`, 28 min at every energy;
no finger capacity, so no pain check. `heal.test.ts` keeps the gym sessions free of finger and pull capacities,
off the barbell except the squat, with no bench in any setup, and inside 45-90 minutes at every level and
energy. The recommender treats a HEAL session in the last 10 days with no
climb logged since as "healing": every other day is a gym day, run as the
ring rehab (if due; the ring test once before the first), then FOOTWORK, then
01 or 02 (`HEAL_GYM_IDS`); between gym days the ring rehab when due,
otherwise a finger-free DAILY;
logging a climb ends it. The `added-kg` stepper goes to 200 so a
loaded barbell fits (logged as the total on the bar).

### DAILY

Short home sessions before breakfast. `npm run check:daily` holds the rules:

- **`recoveryHours: 0`** on every session, so readiness never blocks it and it
  stacks on a climbing day.
- **20 minutes at worst**, every level and energy. Working sets are SECONDARY
  (FRESH +1 set, TIRED -1, no level set bonus); prep work is PREHAB, MOBILITY
  or WARMUP. **No ACCESSORY**: TIRED would drop it. Over budget means cut an
  exercise, never shorten a rest.
- **Curling last.** Discs are most swollen in the first hour after waking, so
  loaded flexion (`daily-reverse-crunch`, the Russian twist) only ever closes
  a session. Extension and hinging may sit anywhere.
- **Fingers last and light.** DAILY 04 does density no-hangs on the portable
  edge (`density-hang`, about 40%) after the mobility work.
- **DAILY 05 LEGS + CORE** is mat only and gentle on the belly: nothing jumps,
  nothing curls. Cat-cow, spiderman lunge + reach and Cossack shifts (MOBILITY)
  open it; bodyweight squat (tempo progressions to the skater squat), glute
  bridge, push-up and a slow straight mountain climber are the working sets;
  cobra + open book closes it, extension and rotation only. `PUSH_UP` and
  `CAT_COW` are shared constants, so their ids and history are the ones
  DAILY 01 and 04 already use. 13 min NORMAL, 18 FRESH, 9 TIRED.
- **DAILY 06 QUIET FEET** is floor footwork, hands free, from the October 2026
  off-wall analysis (`docs/handovers/7bit-handover-v26.md`): knee-to-wall
  ankle rock (MOBILITY), short foot + toe control (PREHAB, protocol
  `floor-footwork`), then precision toe taps on tape marks, the single-leg star
  reach (`extra-sl-reach`, shared with BUILD), slow rock-over transfers and
  standing flag holds, all `fixed` SECONDARY TECHNIQUE drills that earn `legs`
  + `tension`. 16 min at every energy (TIRED 13). `legHeavy: true`: fixed
  drills normally do not count as leg load, but fifteen minutes on one leg is
  poor practice on legs sore from a descent, so the recommender steps around it
  then.

### Balance and power at full stretch

Since v34 every training session carries a dose of both, in proportion to its
length (`qualities.ts`, held by `qualities.test.ts`, TIRED included). What
counts: a `balance`, `footwork` or `floor-footwork` protocol, power at full
stretch (`end-range-strength`: three seconds into the stretch, drive out
fast), or `alsoTrains` on the exercise. The common dose is
`LUNGE_DRIVE` (`extra-lunge-drive`, `data-extras.ts`, fixed MOBILITY): sink
into the deep lunge, drive up onto the front leg, stick two seconds; it counts
for both.

| Session | Dose |
|---|---|
| Every DAILY | one set of the lunge drive (before the curls; before the edge in 04) |
| CAVE 01 STRONG | two sets of the lunge drive, before the cuff |
| CAVE 02 PULL + PUSH | one set, before the cuff |
| CAVE 03 LEGS + BACK | `COSSACK` (goblet Cossack, 2 x 6) and single-leg balance (2 x 30s) |
| CAVE 04 / 05 | their own: floor pullover, rock-over drive, Cossack; single-leg balance, hop + stick |
| HEAL 01 / 02 | two sets of the lunge drive, before the closing mobility |
| HEAL 05 FOOTWORK | one set, last |

Exempt (`QUALITY_EXEMPT`): TEST 01 ASSESS (extra work would move the
scores), HEAL 03 RING REHAB and 04 RING TEST (the physio's plan). DAILY 02
lost the standing band chop to stay inside 20 minutes FRESH.

### Core

Abs, obliques and the lower back are an explicit goal: size, not only
endurance. `trunk-hypertrophy` covers abs and obliques (hard sets near failure,
reverse crunch for the lower abs, side-bending and rotation for the obliques).
DAILY 01 CORE + OBLIQUES is mat only and weighted to the waist: push-ups on
fists, spiderman plank (knee to the same elbow), cross-body mountain climber,
reverse crunch, Russian twist. The band dead bug, leg lowers, press-out,
hollow hold and slow crunch left it to fit the 20 minutes. `back-strength` covers the lower back, which is
weak but not painful: bird dog, then prone extension, then band good morning in
DAILY 02, then the loaded 45-degree back extension and single-leg RDL in CAVE
03. `SIDE_PLANK_DIP` is shared between DAILY 02 and CAVE 03.

### CAVE

Five sessions (v33): three for a day without climbing, two for straight after
bouldering. The gym kit: pull-up bar, hangboard, TRX rings, kettlebells,
dumbbells, plates, boxes, bands, a mat. **No bench, no barbell to press, no
cables.**

- **01 STRONG** replaces a bouldering day: max hangs, heavy weighted pull-ups,
  the one-arm path, lock-offs, front lever, hanging leg raise. 70-80 minutes.
- **04 POWER** (`cave-07`), no climbing, about 70 min: light 20mm hangs at
  50% (MODERATE, so `lastHard` does not move), explosive pull-ups, explosive
  push-ups, weighted pull-ups for volume (RPE 7-8, 3 x 6), single-arm dumbbell
  row (hand on a box), half-kneeling dumbbell press, floor pullover (power
  from the stretch), TRX knee tuck / pike, single-leg balance, band face pull.
- **05 FULL BODY** (`cave-08`), no climbing, about 65-70 min, no hangboard:
  box jump, lateral hop + stick, double kettlebell front squat, dumbbell RDL,
  high-step rock-over drive, push-ups / ring dips, ring row, suitcase carry
  (the one grip load; `noGripId` swaps it for a plate hug carry at readiness
  40 or less), goblet Cossack squat, Copenhagen, Russian twist.
- 04 and 05 always carry **core, a balance drill and power at full stretch**
  (protocol `end-range-strength`: three seconds into the stretch, drive out
  fast). Box jumps use `lower-power`. `PUSH_DIP`, `RUSSIAN_TWIST` and
  `COPENHAGEN` are shared constants in `data-cave.ts`, so their history is one.
- **02 PULL + PUSH**, after bouldering: weighted pull-ups at RPE 8 (SECONDARY,
  so level adds no sets), band-assisted one-arms, push-ups/dips, spiderman +
  cross-body mountain climber, hanging oblique raise (ab straps allowed),
  weighted Russian twist, cuff.
- **03 LEGS + BACK**, after bouldering: goblet squat, 45-degree back extension,
  single-leg RDL, toe-tip plate drag, Copenhagen plank, plate crunch, side
  plank hip dip, frogger. Nothing loads the fingers.
- 02 and 03 are `stacksOnSession` and `check:cave` keeps them inside 45
  minutes NORMAL; 04 and 05 (24h, not stacking) inside 75.
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

**Design rules:** No glassmorphism. No dark theme. Cards outlined (2px solid), not filled. Tab indicators use bottom-border style (6px active, 2px inactive): the extra 4px is an inset `box-shadow`, never a wider border, so the active label does not move. Every button sinks on press (`button:active` in `globals.css`).

**The LED language** (v29). The interface speaks the dot-matrix of the
illustrations:

- Big figures are LED numerals (`Led`, glyphs in `src/core/led-font.ts`, a
  5 x 7 grid): the session number on the card, the rest countdown, the reps
  on the workout card and on rest, the four STATS overview figures, the
  minutes on TODAY's START bar, list numbers. A glyph the font lacks falls
  back to a space: add it to `LED_GLYPHS` (7 rows, one width).
- Unlit dots (`--led-off`) only on large displays (the card number, the rest
  ring); small LEDs draw lit dots only.
- Sizes (v30, made larger for readability): the pitch is 1.3 dots so strokes
  read as lines; list numbers and the START minutes 4px, STATS figures and the
  next reps on rest 5px, the rest countdown 5.4px, the card number 6px, the
  workout reps 8px, tab icons 3.6px. Nothing smaller than 3.6px.
- The one orange lights the screen's main figure (today's pick, a rest in its
  last seconds), never chrome.
- The tab bar icons are 7 x 7 LED icons (`LED_ICONS`).
- The page and every full-screen panel sit on `--dots`: an unlit LED every
  12px over the parchment.
- The rest timer is a ring of 48 dots that go out as the rest runs down.
- TODAY opens with the week rail (`WeekRail`, `week-rail.ts`): seven LED
  columns filled from the bottom (a climb in orange, a session in ink, an
  outside day in grey), a ring on a planned day ahead, today underlined.
- **Sections**: a section that follows another opens with `.dot-rule` (a
  row of faint LED dots, `--rule`, and 26px of air) or, in a panel's CSS, the
  same rule on `.section + .section`; settings sections get it from
  `.overlay-section + .overlay-section`. The gap between sections
  (`--section-gap`, 28-36px) is always clearly larger than the gap inside one
  (12-14px). Section labels are 12-13px, bold, tracked 0.12em
  (`.section-label`).
- Type: `--fs-h1` 30px page titles, 16-20px titles, 13px body, 11px meta;
  nothing under 11px; secondary text in `--ink-dim` (74%, 4.5:1 on the
  parchment).

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

The athlete's own climbing, logged by hand after the session from + CLIMB on
the LOG tab (and from the complete screen after any
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

## Changing a session while in it

The workout screen is one screen tall: the card scrolls inside and SKIP /
DONE never leave thumb reach. Reps, load, the stepper, the note and FORM
GUIDE are always shown; everything that changes the session sits in one
**ADJUST** row, closed by default (its line shows a lasting tweak):

- **HARDER / EASIER** change the exercise **for good** (`adjust.ts`): stored in
  `tweaks` (persisted, by exercise id) and applied by `buildList` /
  `scaleExercise` wherever the exercise appears. A tap moves one variation
  rung (at most one above the level's rung; extras with no capacity may climb
  their whole ladder) or 2 reps / 5 s, between half and double the written
  work. Never on fixed protocols, tests, warm-ups, PRIMARY or MAX work; never
  rest. Loaded work gets harder on the stepper. A tap back undoes the last
  tap; RESET restores the programme.
- **-SET / +SET** are today only, between the sets already done and 8.
- **NEXT STEP**, the exercise's progression rule, and **SWAP** are in ADJUST
  too.
- **+ ADD EXERCISE** (workout card and rest screen) opens the reserve
  (`ReservePicker`, `reserve.ts`): CORE, PULL (gym only), ARMS, SHOULDERS,
  LEGS, MOBILITY, FINGERS, least recently done first. Home sessions (DAILY, HEAL 03 / 04) get
  home kit only; HEAL gets nothing gripped and no finger work; a pain score of
  3+ closes FINGERS; gated, test and warm-up exercises are never offered. Most
  entries are programme exercises (same ids, same history and XP); the arm
  extras in `data-extras.ts` have no capacity and earn no XP. A pick goes
  after the exercise in hand and after the last remaining exercise of its
  block or heavier (`insertIndex`); in a DAILY before the curls, and an added
  curl closes it. The session log lists picks in `added`.
- **FINISH NOW** logs the session as it stands (cut short, no XP lost). No
  dialog: the complete screen offers UNDO for six seconds, which goes back to
  the set in hand.
- **ENERGY** (FRESH / NORMAL / TIRED) at the bottom of the card rebuilds what
  is left of the session at the new energy (`switchEnergy`): same deload,
  kit, tweaks and pain check, extras kept, the exercise in hand keeps the sets
  already done. Today's time cap is not reapplied.

## TODAY

The first tab (`TodayScreen`, `use-today.ts`) answers one question: what do
I train now? The pick leads, large: PLANNED when the weekly plan holds
(`applyPlan`), otherwise RECOMMENDED, with the reason in words, the session
card (energy tabs, duration, info), and one START. Under it ADJUST TODAY,
then ALSO FITS TODAY: up to two more sessions (`alsoFits`) that pass the same
safety rules, each with why it is second (the recommender's own pick first
when the plan led). A banner offers a deload now, or skipping one, when the
logs say so (`deloadAdvice`). With nothing due it says why (rest day, done
for today) and points to TRAIN.

**ADJUST TODAY** (`DayControls`, `today.ts`, `day-slice.ts`) takes what the
logs cannot know. Stored in `dayPlan`; time, kit and off hold for the day
they were set, soreness for that day and the next.

- **Time** (10 / 15 / 20 / 30 / 45 min): `fitToMinutes` drops whole exercises,
  ACCESSORY first, then MOBILITY, PREHAB, SECONDARY, PRIMARY, each from the
  end, until the estimate fits. Warm-ups and tests stay, at least one working
  exercise stays, rest and sets are never changed. Applied in
  `sessionListFor`, so the card shows the cut duration. A cap of 30 or
  less keeps ASSESS and STRONG off the recommendation.
- **No kit**: DAILY drops band, edge and loaded work (`needsKit`); the
  recommendation is a DAILY with three or more mat-only working exercises
  ("No kit today: a mat-only DAILY."); the reserve offers bodyweight only.
- **Sore** legs / back / shoulders / forearms: `loadsArea` (two or more
  non-fixed working exercises on the area; forearms: any finger session)
  steers the recommendation away while another session fits, with the reason
  "Shoulders sore. Something else today." Sore forearms also skip ASSESS and
  STRONG.
- **Rest day / sick**: no recommendation, a banner, no reminders that day,
  and the date goes into `offDays`, which `checkDecay` subtracts from the
  days since a capacity was trained.

**+ LOG TODAY'S CLIMBS** shows on TODAY while no climb is logged today and
either a CAVE session that follows bouldering was done today or bouldering is
planned (`climbToLog` in `plan.ts`); STRONG does not ask. START is sticky
just above the tab bar, and the card is the shorter `compact` one.

## TRAIN

The library (`TrainScreen`): DAILY, CAVE, TEST, HEAL and MINE as tabs. Each
programme session is a row with its minutes at the chosen energy, recovery
or when it was last done, and TODAY on the pick. A row opens the session
(`SessionInfo` through `use-launcher`): every exercise as it will run, energy
tabs, START, and MAKE IT MINE. Every session, programme, routine or built,
starts through `startCustom` with the list built by `sessionListFor`, so
what is shown is what runs.

MINE holds the athlete's routines, BUILD A SESSION, and THIS WEEK.

## EDIT before START

The session page has **EDIT** (`SessionEditor`, `session-edit.ts`, v35), on
every programme session (a routine has EDIT ROUTINE instead):

- Per exercise: SWAP, remove, up / down, sets (1-8) and reps or seconds (half
  to double), and **LOAD**, the load planned for today: the stepper opens on
  it (`Exercise.targetLoad`, read by `primeLoad`) instead of last time's.
  Fixed protocols, tests and warm-ups keep their sets and work. Rest is never
  on the screen. The editor shows sets and reps as they run at today's energy.
- **SWAP** lists **SIMILAR** first (`similarTo`: the stand-in it already has,
  same area, same main capacity, protocol, block and load kind), then
  everything the place allows.
- **+ EXERCISE** and **+ PACK**. Additions go where they belong (`addIds`,
  `insertIndex`): heavy first, a closing mobility last, curls closing a DAILY.
- Safety (`allowedToday`): home kit at home, NO KIT keeps it on the mat, no
  tests, nothing gripped, pulled or hung and no finger work while a finger
  heals, no finger work after pain 3+. Gates still substitute when it runs,
  and the pain check asks if finger work was added.
- An edit is saved as it is made and holds **for today**; KEEP FOR NEXT TIME
  keeps it until RESET (`sessionEdits`, persisted, by circuit id). The session
  keeps its circuit id, so it logs, recovers and is recommended as itself.
  `sessionListFor` and `circuitFor` apply it, so the page, TODAY's minutes
  and the workout agree. MAKE IT MINE copies the edited list.
- **Packs** (`PACKS`): CORE FINISHER, ARMS (no XP), SHOULDER CARE, MOBILITY
  10, BALANCE + POWER, LEGS, FINGERS LIGHT (closed while healing or after pain
  3+), each with a home and a gym version. Also the first tab of + ADD
  EXERCISE mid-session (`addExtras`).

## Routines

A routine (`routines.ts`, `routine-slice.ts`, `RoutineEditor`) is a fixed
list: these exercises, in this order. It is turned into a circuit
(`routineCircuit`, id `routine-<id>`, circuit number R) and runs through
`buildList` like any session, so level picks the variation, energy and the
deload week scale sets, gates substitute (one-arm rungs stay closed until
tested), the pain check asks, and load history and XP follow the exercise id.
HOME routines log as DAILY (`recoveryHours: 0`), CAVE routines as CAVE (24h,
`stacksOnSession`), as BUILD sessions do.

- Made from blank (+ NEW), from any programme session (MAKE IT MINE copies
  `circuit.exercises`), or frozen from a BUILD preview (SAVE THIS LIST AS A
  ROUTINE: a preset picks again each time, a routine keeps the list).
- The editor: name, HOME / CAVE, move up and down, SWAP, remove, + ADD
  EXERCISE (`ExercisePicker`: the whole library allowed by the place's kit,
  by area and search, one row per name, tests left out). Sets 1-8 and reps
  or seconds between half and double the written work; fixed protocols,
  tests, ramps and warm-ups are taken as written. **Rest is never on the
  screen.** At most 16 exercises.
- Warnings, never blocks (`routineWarnings`): gym kit in a home routine,
  curling work before the end of a morning session, maximal work after
  lighter work, two hard finger exercises, no warm-up before hard work.
- Deleting a routine also takes it off the weekly plan, with UNDO.

## Weekly plan

THIS WEEK in TRAIN MINE (`WeekPlanner`, `plan.ts`, `weekPlan`, Monday 0 to
Sunday 6): up to three items a day from BOULDERING, REST, routines and every
programme session; an empty day is left to the recommender. On TODAY the
first planned session not done today leads, unless `blockedBecause` says
otherwise (healing finger or pain 6+ on a finger session, sore forearms, no
kit for a gym session, a sore area it loads, sore legs on a leg-heavy one,
not recovered): then the recommendation leads and says "CAVE 01 was planned,
but finger pain 7/10 lately." REST planned leaves no pick and offers the
recommendation; BOULDERING planned adds a note.

## LOG

The LOG tab (`LogScreen`, `history.ts`): + CLIMB and + ACTIVITY, then every
session, climb and activity as one stream, newest day first, 14 days at a
time, filtered ALL / SESSIONS / CLIMBS / OUTSIDE (`filterDays`). A climb or activity opens its editor; a session opens `SessionDetail`
(sets done of planned per exercise, the load logged that day, effort to
correct, DELETE). Deleting a session also removes that day's loads for its
exercises unless another session that day shares them; XP stays. Every
delete (session, climb, activity, routine) offers UNDO for six seconds
(`UndoToast`, `history-slice.ts`).

## BUILD

BUILD A SESSION in TRAIN MINE (`BuildSheet`, `custom.ts`, presets in
`build-slice.ts`) makes a session on the spot:

- **PRESETS**: one tap fills in everything. Six built in (`BUILT_IN_PRESETS`:
  PULL DAY, PUSH + CHEST, LEGS + BALANCE, QUICK HOME, ROCKOVER ENGINE (home,
  30: step-up + slow lower, split squat with forward shift, single-leg RDL,
  calf raise, glute bridge), HIPS + CONTROL (home, 15: 90/90, Cossack,
  high-knee hold, knee-to-wall ankle, side-lying abduction, dead bug)); SAVE AS PRESET stores
  the athlete's own in `buildPresets` (persisted, in backups); an own preset
  can be renamed or deleted. SAVE THIS LIST AS A ROUTINE freezes the preview.
- **WHERE**: HOME (mat, band, portable edge) or CAVE (the gym, with dumbbells
  and rings / TRX). **TIME**: 15 / 30 / 45 / 60 / 90 min.
- **GOALS** (PULL POWER, PUSH POWER, CHEST, BALANCE, ROCKOVER, HIPS) and **AREAS** (CORE,
  PULL, ARMS, SHOULDERS, LEGS, MOBILITY, FINGERS), each tapped in, out or off
  (`cycleTarget`). A goal is an ordered list in `GOAL_ENTRIES`, key lift
  first; an area comes from the reserve, least recently done first. A target
  tapped out removes everything that `touches` it, wherever it came from (NO
  CORE also drops a plank picked for the shoulders).
- **AVOID**: NO JUMPING, NO GRIP, NO FLOOR, from the `jump`, `grip` and
  `floor` flags on reserve and goal entries (`flagsOf`). NO GRIP (or healing)
  swaps the gym warm-up for `heal-warmup`; NO FLOOR drops the cat-cow opener.
- **NOT TRAINED ENOUGH** (`areaNeeds`, `suggestAreas`): each area's stalest
  capacity, days since trained over its decay grace days (never trained counts
  as due); CORE also counts this week's hard sets against `CORE_TARGETS`, pro
  rata to the weekday. Due is 0.7 or more; up to three are preselected until
  the athlete picks. The first tap on a goal starts an empty plan, on an area
  from the suggestion. `buildWarnings` says when a due area is tapped out, and
  when an hour or more of power follows a logged climb (a warning, not a block).
- Safety as everywhere: home kit at home, nothing gripped, no pulling (PULL
  POWER closed) and no finger work while healing (`isHealing` in
  `recommend.ts`), no finger work after pain 3+, NO KIT keeps it on the mat, a
  sore area under ADJUST TODAY (or legs sore from an activity) is closed; sore
  shoulders close every push and pull target. PULL POWER keeps the one-arm
  gates: assisted rungs substitute the lopsided ladder, negatives stay hidden.
  The two weighted pull-ups never share a session (`SAME_MOVEMENT`).
- **Building** (`buildCustom`): targets take turns. An exercise that would run
  over the time is passed over; rest and sets are never touched. About one
  working exercise per four minutes (at most 14; mobility and prehab do not
  count), and the first working exercise always goes in. Gym opens with the
  pulse raiser, home with cat-cow; heavy blocks first, curls last.
- The goal exercises in `data-extras.ts` (`GOAL_EXERCISES`): ring dip,
  explosive push-up, dumbbell floor press, ring push-up, ring fly and feet-up
  push-up carry no capacity and earn no XP (push power uses the `upper-power`
  protocol); single-leg balance and star reach earn `legs` + `tension`; the
  rock-over and hip drills (step-up + slow lower, split squat forward shift,
  high-knee hold, side-lying abduction, dead bug hands on chest) earn `legs`,
  `mobility` or `tension` (protocols `rockover-strength`, `mobility`,
  `balance`, `daily-trunk`). Sore legs close ROCKOVER.
- The circuit is `custom-home` (mode DAILY, `recoveryHours: 0`) or
  `custom-cave` (mode CAVE, `recoveryHours: 24`, `stacksOnSession`, follows
  the deload week), titled with the preset's name when one is used.
  `startCustom` runs it, switching the home tab to that mode; finger work asks
  the pain check as usual. Custom sessions never match a programme circuit id.

## STATS

Four tabs, each answering its own question. Every section names its period
on the right and opens with its answer in one sentence (`stats-headlines.ts`).

- **OVERVIEW** (`StatsOverview`, `review.ts`): the last 28 days against the
  28 before in four tiles (training days and days a week, hours with sessions
  and climbs, share of planned sets done, mean effort; effort changes are not
  coloured good or bad), the level, **WHAT STANDS OUT** (`getInsights`, at
  most 7, in this order: pulling logged while a finger heals, the biggest load
  gain, a lift stalled four sessions (`plateaus`), one-arm gates a tested
  pull-up already opens, training days against the period before,
  after-bouldering sessions with no climb logged, completion under 85%, when
  ASSESS is due, loads logged as 0 after a real value), then WEEKS.
- **PROGRESS**: LIFTS (a row opens `ExerciseDetail`: every load on a scaled
  chart, latest and best, NEXT TIME with the reason from `suggestLoad`, a
  stall, how it progresses, recent sessions), ONE-ARM PATH, TESTS.
- **BODY** (each section folds to its title and headline; a tap opens it):
  WHERE THE WORK WENT (`getWorkSplit`), LOAD, RECOVERY, FRESHNESS,
  CORE THIS WEEK, CUT SHORT, RING FINGER, FINGER LOAD, LEVELS (capacities and
  the level trend, straight segments: every capacity in grey, overall in
  black, a tapped one in orange).
- **CLIMBING**: CLIMBS, CLIMBING VS PULLING.

Lift series drop 0 kg entries (a stepper left unset) and leave out all-zero
bodyweight series; CUT SHORT leaves tests out and names retired ids readably
(`retiredName`).

## Adapting the block

`adapt.ts`, all suggestions with their reason:

- **Deload now** (week 2 or later): a load spike (acute:chronic over 1.5),
  the last rated sessions averaging 8.5/10 or more, or finger pain of 3+ in
  two sessions within a week. TODAY offers MAKE THIS THE DELOAD WEEK
  (`deloadNow` moves `blockStart` so this week is the deload).
- **Skip the deload**: on a deload week after fewer than three hard sessions
  or climbs in the build weeks. TODAY offers a new block (`restartBlock`).
- **How each lift felt**: the complete screen asks EASY / RIGHT / HARD for
  each loaded exercise done (`feel` on the session entry). `suggestLoad`
  reads it before the session effort: easy or right steps on, hard holds.
- **Stalled lifts**: the same load four sessions running, the last within
  four weeks.
- **Monday summary**: a Monday 08:30 local notification (reminder kind
  `weekly`) with last week in one line.

## Activity Log

Everything done outside the app (hike, via ferrata, ski tour, trail run, run,
bike, swim, yoga, other), from + ACTIVITY on the LOG tab.
`src/core/activity.ts`. The athlete types what they remember, often only the
type and the metres climbed; every missing field is estimated and the
assumption is named on the screen:

- **Descent** equals the climb. **Distance** from a km-per-100-m figure per
  type. **Time** from the DIN 33466 walking-time rule (larger of vertical and
  horizontal time plus half the smaller), with up / down / flat rates per type.
- **Effort** (CR10) from a base per type, +1 above 600 m a day, +1 above
  1200, +1 heavy pack, +1 above 2500 m, capped at 10.

What it changes:
- **Load**: effort x minutes, spread over the days, in its own lane
  (`ACTIVITY`). It shows in the weekly bars and the week strip ("outside") but
  not in the acute:chronic ratio (`climbingLane`): eight easy hours would read
  as a finger-load spike.
- **XP**: 2 per day (at most 3 days) to the type's capacities (`legs`; via
  ferrata also `pull`; swim `shoulder`; yoga `mobility`), once, on first save.
  Edits and deletes leave XP alone, as in the climb log.
- **Sore legs**: metres down per day against per-type thresholds open a 24h or
  48h window from 18:00 on the last day (`legSoreness`). While it is open the
  recommender skips leg-heavy sessions (`isLegHeavy`: two or more non-fixed
  working exercises that train legs first: DAILY 03 and 05, CAVE 03, HEAL 01
  and 02) whenever another one fits, with the reason "Legs sore from the hike.
  Upper body."

Apple Health hikes, runs, rides, swims, yoga and ski tours become activity
entries on a read (`activitiesToImport`): a run that climbs over 300 m is a
trail run, a day with a hand-logged activity of the same type is left alone,
under 15 minutes is skipped, ids go into `health.importedActivities`.

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
HRV, resting HR, body mass, climbing workouts and outdoor workouts and saves sessions as
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

CONNECT APPLE HEALTH reports why it failed (`connectHealth` returns a
`HealthConnect`, `connectMessage` words it): web, plugin missing from the
build (Clean Build Folder), Health unavailable, or HealthKit's own error text,
with a missing capability or entitlement translated into the Xcode step. The
plugin returns the error from `requestAuthorization`, per-type query errors
(`errors`) and whether the permission sheet was answered (`sheet` on
`isAvailable`). READ NOW reads 30 days and says what came back
(`describeRead`), or where to allow the categories when nothing did.

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
- **The improvement roadmap**: `docs/7bit-roadmap.md`. All seven phases built; the
  native ones still need checking on a device.

## Handoff Documents

All in `docs/handovers/` (the roadmap is `docs/7bit-roadmap.md`).
Screenshots taken for review go in `docs/screenshots/`, not the repo root
(root `*.png` is git-ignored). `docs/sample-backup.json` is an example of the
export format.

- **`7bit-handover-v36.md`** — **start here.** More room in the session
  editor: one card per exercise, labelled steppers, airier packs.
- **`7bit-handover-v35.md`** — EDIT before START: swap
  (similar first), remove, move, sets, reps, load for today, add exercises
  and packs; today only or kept. Packs mid-session too.
- **`7bit-handover-v34.md`** — Balance and power at full
  stretch in every session, in proportion to its length.
- **`7bit-handover-v33.md`** — CAVE 04 POWER and 05 FULL
  BODY, finger readiness beside the pain check, and a UI pass: tab labels
  that no longer jump, press feedback on every button, the finger check's
  START filled and in reach.
- **`7bit-handover-v32.md`** — The UI and use review:
  START and DONE always in reach, the workout card's ADJUST row, FINISH NOW
  with UNDO, the complete screen summary, folded BODY sections, LOG filters,
  + LOG TODAY'S CLIMBS on TODAY, the rest overrun.
- **`7bit-handover-v31.md`** — A second taste-skill pass:
  long exercise names on two lines, the complete screen from the top, deltas
  orange only on a real drop, the session page's doubled minutes and rules.
- **`7bit-handover-v30.md`** — Polish: larger LED dots,
  dotted section rules and more space between sections.
- **`7bit-handover-v29.md`** — The LED redesign: LED
  numerals, the week rail on TODAY, pixel tab icons, the LED rest ring, the
  dot-grid paper.
- **`7bit-handover-v28.md`** — The tab bar (TODAY, TRAIN,
  STATS, LOG), routines and the weekly plan, STATS in four tabs, the session
  and exercise pages, deload advice, how each lift felt, UNDO, Playwright, and
  the taste-skill UI review.
- **`7bit-handover-v27.md`** — STATS overview and WHAT
  STANDS OUT, work split, regrouped sections; Apple Health connect reports why.
- **`7bit-handover-v26.md`** — DAILY 06 QUIET FEET and the
  ROCKOVER / HIPS goals and presets, from the off-wall footwork analysis.
- **`7bit-handover-v25.md`** — BUILD presets, goals (pull
  power, push power, chest, balance), targets tapped out, AVOID, 90 minutes.
- **`7bit-handover-v24.md`** — BUILD: custom sessions from
  place, time and areas, with what is not trained enough suggested.
- **`7bit-handover-v23.md`** — TODAY (time cap, no kit,
  sore areas, rest / sick days) and switching energy mid-session.
- **`7bit-handover-v22.md`** — The activity log (hikes and
  the rest, estimated from little data), HARDER / EASIER kept for next time,
  the exercise reserve and FINISH NOW.
- **`7bit-handover-v21.md`** — HEAL 05 FOOTWORK and the
  gym-day order (rehab, footwork, strength).
- **`7bit-handover-v20.md`** — HEAL 03 RING REHAB and
  04 RING TEST: the physio's plan for the left ring finger.
- **`7bit-handover-v19.md`** — The HEAL tab: two gym
  sessions for training around an injured finger.
- **`7bit-handover-v18.md`** — DAILY 05 LEGS + CORE, the
  mat-only morning session for legs and trunk.
- **`7bit-handover-v17.md`** — Rest shows the next exercise
  with its form guide; a set-by-set progress bar on the card and on rest;
  ASSESS tests that need only a bar and a mat; DAILY 01 rebuilt as mat-only
  CORE + OBLIQUES.
- **`7bit-handover-v16.md`** — The whole improvement roadmap:
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
