# 7BIT — The iPhone App

**Handover v11 — September 2026**

Covers the app shell, not the programme. The training content is v10's and is
unchanged by this session: for capacities, blocks, protocols, benchmarks and
the week, read `7bit-handover-v10.md`. For the design system, copy system and
screen layouts, read `7bit-handoff-v9.md`.

What this document adds: how the web app became an iPhone app, and how load
logging works.

---

## 1. What this session did

1. Found the v10 training rewrite sitting unmerged on
   `claude/training-programs-optimization-8o78cb` while `main` still carried the
   v9 muscle-group model, and merged it into the iOS branch. There is no point
   putting an app on a phone that prescribes the programme v10 replaced.
2. Turned the stock Capacitor scaffolding into a configured iPhone app:
   orientation, device family, appearance, status bar, splash, haptics, icon.
3. Fixed the rest timer, which lost time whenever the phone locked.
4. Built the load-logging interface — the functional gap v10 named as the
   biggest one remaining.
5. Verified the chain end to end: type check, production build, Capacitor sync,
   and a scripted browser pass through a whole session.

**No training content was touched.** No exercise, protocol, rest value, level
curve or gate changed. Everything in `src/core/data-*.ts`, `protocols.ts`,
`benchmarks.ts`, `config.ts` and `engine.ts` is exactly as v10 left it, with the
single exception of a new `load.ts` module that reads the existing model rather
than altering it.

---

## 2. The starting position

Two things were true at the same time and neither was obvious from the repo:

- **The v10 rewrite was not in `main`.** `main` had the Capacitor scaffolding
  from PR #3 and the old v9 training model. The v10 branch had both the
  scaffolding and the new model, but had never been merged. Anyone cloning
  `main` and building for iOS would have got a phone app running the programme
  v10 exists to replace.
- **The iOS project existed but was untouched default.** `npx cap add ios` had
  been run and committed, and nothing after that. It carried the Capacitor
  placeholder icon, allowed landscape on a 390px-wide portrait design, required
  `armv7` — a capability last relevant to the iPhone 5 — and had no native
  plugins at all.

So "set up the Xcode project" was mostly configuration and assets, not
scaffolding.

---

## 3. The native shell

### 3.1 Info.plist

| Key | Was | Now | Why |
|---|---|---|---|
| `UIRequiredDeviceCapabilities` | `armv7` | `arm64` | 32-bit iOS ended with iOS 11. `armv7` is Capacitor template residue. |
| `UISupportedInterfaceOrientations` | portrait + both landscapes | portrait | Every screen is `max-width: 390px` and column-laid. Landscape was never designed and never will be. |
| `UIUserInterfaceStyle` | absent | `Light` | The design rule is "no dark theme". Without this, iOS puts a dark-mode phone into dark mode and the parchment palette fights the system. |
| `UIStatusBarStyle` | absent | `UIStatusBarStyleDarkContent` | The pre-JavaScript default, so the status bar is correct from the very first frame rather than from whenever the bridge is ready. |
| `UIViewControllerBasedStatusBarAppearance` | `true` | `true` (deliberately) | See 3.4. |
| `ITSAppUsesNonExemptEncryption` | absent | `false` | Answers an App Store Connect question up front. Harmless now, saves a step later. |

`TARGETED_DEVICE_FAMILY` in the Xcode project moved from `"1,2"` to `1`. This is
an iPhone app: portrait-only, one column, thumb-reachable. Shipping it as a
universal app means iPad screenshots and iPad icon slots for a layout nobody
designed.

### 3.2 Three plugins, all first-party

```
@capacitor/status-bar    8.0.3
@capacitor/splash-screen 8.0.2
@capacitor/haptics       8.0.2
```

Adding or removing any of them means re-running `npx cap sync ios`, which
rewrites `ios/App/CapApp-SPM/Package.swift`. That file is committed, so Xcode
resolves the packages on first build and the checkout is self-contained.

A fourth plugin was considered and rejected. Keeping the screen awake during a
rest timer is a real need — a three-minute rest with the phone face down is
exactly when iOS locks — but the Screen Wake Lock API is supported by WKWebView
on iOS 16.4+, so `src/hooks/use-wake-lock.ts` uses the web standard. It works in
the Capacitor shell and in the browser PWA, with no native dependency and no
version to keep in step. **Prefer a web standard over a plugin wherever one
exists** is now a written rule in `CLAUDE.md`.

### 3.3 The bridge

Everything native lives in `src/native/native.ts` behind two guards: a dynamic
`import()`, and a synchronous platform check that reads the global Capacitor
injects rather than importing `@capacitor/core`.

Both guards are load-bearing. The same bundle is served as a browser PWA, where
these plugins do not exist; and `next build` prerenders the page in Node, where
touching Capacitor globals at module scope would break the static export. With
the guards, every native call is a no-op on the web and nothing throws.

Each plugin call also gets its own `try`/`catch`. A single shared one was the
first draft, and it was wrong: one rejected call would have skipped every call
after it.

### 3.4 The status bar trap

`UIViewControllerBasedStatusBarAppearance` reads like something you set to
`false` when you want to control the status bar from code. It is the opposite.

The Capacitor status bar plugin implements `setStyle` as
`bridge.statusBarStyle = style`, and Capacitor's view controller returns that
from `preferredStatusBarStyle`. iOS only consults `preferredStatusBarStyle` when
`UIViewControllerBasedStatusBarAppearance` is `YES`. Set it to `NO` and the
plugin still resolves its promise, reports success, and changes nothing.

This session set it to `false`, then caught it by reading the plugin's Swift
source in `node_modules`, which is also where the plugin README says so
outright. It is now `true`, with a note in `CLAUDE.md` so the next person does
not repeat the reasoning.

The lesson generalises: a plugin call that resolves is not evidence that the
plugin did anything.

### 3.5 The splash screen

The launch screen is configured to hide two ways at once:

- `launchAutoHide: true` with `launchShowDuration: 2000` in
  `capacitor.config.ts`, and
- an explicit `SplashScreen.hide()` from `initNativeShell()` as soon as React
  mounts.

Whichever fires first wins. The explicit hide normally does, at a few hundred
milliseconds. The native auto-hide is the backstop, so a JavaScript failure can
never strand you on the launch screen with no way forward — which is exactly
what `launchAutoHide: false` alone would have risked.

`ios.backgroundColor` is set to the parchment `#E4E2DD` and
`ios.contentInset: 'never'`, so the native view never flashes white and never
double-insets content the CSS is already insetting with
`env(safe-area-inset-*)`.

`ios.scrollEnabled: false` was tried and reverted. It suppresses webview
rubber-banding, which looks tidier, but not every screen has an inner
`overflow` container, so on a short device it would have stranded content below
the fold with no way to reach it. Rubber-banding is already handled by
`overscroll-behavior: none` on `body`. A cosmetic gain is not worth a
functional risk.

---

## 4. The rest timer was losing time

The v9 timer decremented a counter once per `setInterval` tick.

On a phone, that is broken. iOS throttles timers in background tabs and
suspends them outright when the app backgrounds or the screen locks. Put the
phone in your pocket during a 180-second rest between max hangs and the
countdown simply stops; come back and it resumes from where it paused, having
silently lost the minute you were away.

That matters more here than in most apps. The whole argument of v10 section 3.1
is that rest on maximal work is set by physiology and must not be shortened. A
timer that quietly under-counts rest does exactly what the level curve was
rewritten to stop doing.

`use-timer.ts` now stores a `Date.now()` deadline and computes the remaining
seconds from the clock on every tick, at 250ms so the display stays honest
without appearing to skip. Backgrounding costs nothing: the deadline does not
care whether the app was running. The warning and completion cues are guarded by
refs so a resumed tick cannot re-fire them.

The screen is also held awake for the duration, and the existing audio cues are
now paired with haptics. A gym is loud and the phone is often across the mat;
the buzz is the part you actually notice.

---

## 5. Load logging

### 5.1 Why this was the gap

v10 gave the model a place for load — `LoadSpec`, with a `kind` and an optional
numeric `value` — and correctly identified that progression on this programme
*is* load. What it did not have was any way to put a number in.

So the app could tell you "20mm, 85-90% of tested 10s max" and could not tell
you what you actually hung last Tuesday. In a max-hang session, that is the only
question being asked.

### 5.2 The axis

`getLoadAxis(exercise)` in `src/core/load.ts` derives the logging axis from the
exercise's existing `LoadSpec.kind`. Nothing in the training data had to change.

| `LoadSpec.kind` | Axis | Step | Range | Reads as |
|---|---|---|---|---|
| `added-kg` | kg | 1 | 0-80 | `+14KG` |
| `assisted` | kg | 1 | 0-60 | `-8KG` |
| `edge-mm` | mm | 1 | 6-40 | `20MM` |
| `percent-max` | % | 5 | 20-100 | `85%` |
| `rpe` | RPE | 0.5 | 5-10 | `RPE 7.5` |
| `bodyweight`, `band` | none | | | not logged |

Assistance is logged as the assistance *removed*, so the number falls as you get
stronger and reaching zero is the milestone.

Steps are equipment-shaped, not arbitrary: 1kg is the smallest increment a belt
or plate stack realistically gives you, and it is the unit the `progression`
strings are already written in ("add 1-2kg next session").

### 5.3 What it does not log, on purpose

Two exclusions, both deliberate:

- **Bodyweight and band work.** These progress through the variation ladder, not
  through load. A number there would be noise pretending to be a trend.
- **The `WARMUP`, `PREHAB` and `MOBILITY` blocks.** Warm-ups are ramps. Prehab
  and mobility are explicitly never taken to failure. Logging kilos on them puts
  points in the history that look like progress and are not.

The second exclusion was added after testing: the stepper first appeared on
"Progressive Finger Loading", a warm-up, which is precisely the kind of clutter
that makes a log stop being read.

### 5.4 When it commits

The stepper opens on **what you did last time for that exercise**, falling back
to the prescription's own anchor if there is no history. That is the whole
design: adding load should be a decision against a known number, not a guess
from cold. The card also shows `LAST +12KG · 04 SEP` and, once you move the
stepper, `+2 vs last`.

The value is written to `loadLog` when the exercise's **final set** is marked
DONE — the same moment XP is awarded, and for the same reason. Consequences
attach to completed work.

- **Skipping records nothing.** Nothing was lifted. This matches
  `skipPenalty: 0`: skipping must stay free in every sense.
- **One entry per exercise per day.** Repeating a session the same day
  overwrites rather than stacks, so the DENSITY block — designed to be run twice
  daily — produces one point per training day instead of a jagged double.
- **If you change the load between sets, the last value entered wins.** Dropping
  weight on set four records set four. That is the honest number.

`loadLog` is persisted alongside `progress`, `sessionLog` and
`benchmarkResults`, and is cleared by the existing reset control.

---

## 6. Icon and splash

Both are generated from `public/images/logo.svg` by
`tools/generate-ios-assets.py`.

The logo is pixel-art built entirely from `<rect>` elements, which means it can
be redrawn exactly rather than approximated: the script parses the rects
straight out of the SVG and re-renders them at icon resolution over the
parchment gradient. Edit the logo, re-run the script, and the home screen icon,
the launch screen, the PWA manifest icons and the in-app logo cannot drift
apart.

- **Icon**: the pixel `7` alone, with the foot of its stem in accent orange. The
  full `7BIT` wordmark is unreadable at 60x60 on a home screen; a single glyph
  is what makes an icon findable.
- **Launch screen**: the full wordmark, small on a large square, because the one
  asset is stretched across every device size.

The `apple-touch-icon` and both PWA manifest icons were pointing at
`home-pushups.png`, a push-up illustration. They now point at the app icon.

Do not hand-edit the PNGs.

---

## 7. What changed in the code

```
src/core/
  load.ts         NEW        getLoadAxis / getLastLoad / getLoadHistory /
                             getOpeningLoad / clampToAxis / formatLoad /
                             formatLoadDate. Reads the v10 model, changes none
                             of it.
  types.ts        ADDED      LoadAxis, LoadLogEntry. Nothing removed or altered.

src/native/
  native.ts       NEW        isNative / initNativeShell / hapticWarning /
                             hapticDone / hapticTap. Dynamic imports behind a
                             platform check.

src/hooks/
  use-timer.ts    REWRITTEN  Wall-clock deadline instead of per-tick
                             decrement. Haptics and wake lock wired in.
  use-wake-lock.ts NEW       Screen Wake Lock API, re-acquired on
                             visibilitychange, silent where unsupported.

src/store/
  slices/load-slice.ts   NEW      loadLog, pendingLoad, primeLoad, adjustLoad,
                                  commitLoad, clearLoadLog.
  slices/workout-slice.ts UPDATED primeLoad on every exercise change;
                                  commitLoad on the final set only.
  slices/progress-slice.ts UPDATED resetAllData clears the load log.
  store.ts               UPDATED  Registers the slice, persists loadLog.

src/components/shared/
  LoadLogger.tsx         NEW      The stepper. Renders nothing without an axis.
  LoadLogger.module.css  NEW      Outlined card, 2px, no fill, per the design
                                  rules.

src/components/screens/
  WorkoutScreen.tsx      UPDATED  LoadLogger under the load prescription.

src/app/
  page.tsx               UPDATED  initNativeShell on mount.
  layout.tsx             UPDATED  apple-touch-icon points at the app icon.

ios/
  App/App/Info.plist                     Orientation, device capability,
                                         appearance, status bar, encryption.
  App/App.xcodeproj/project.pbxproj      iPhone-only device family.
  App/App/Base.lproj/LaunchScreen.storyboard  Parchment behind the splash.
  App/App/Assets.xcassets/...            Regenerated icon and splash.
  App/CapApp-SPM/Package.swift           Three plugins, written by cap sync.

capacitor.config.ts     Splash config, iOS background and content inset.
tools/generate-ios-assets.py   NEW.
public/manifest.json    Real icons.
CLAUDE.md, README.md    Architecture, iOS notes, load logging, the status bar
                        trap, regeneration commands.
```

32 files, +902 / -68.

---

## 8. Verification

**Performed:**

- `npx tsc --noEmit` clean.
- `npm run build` clean, static export generated.
- `npx cap sync ios` resolves all three plugins into `Package.swift`.
- Scripted browser pass at 390x844 with touch emulation: home, mode switch,
  session start, every set, every rest, completion, stats. Zero console errors.
- Load logging exercised end to end: stepper renders only where it should,
  stepping works, the value survives to `localStorage` under `7bit_store` with
  the right exercise id, unit and date.
- Readiness banner confirmed firing after a finger session
  (`0h since the last hard session. This needs 48h.`).
- Icon and splash rendered and inspected.
- Clone, install, build, sync and Xcode open confirmed working on the target
  Mac.

**Not performed, and it matters:**

- **The app has never run on a device or simulator.** Everything native — the
  status bar style, the splash handover, haptics, the wake lock, safe-area
  insets on a notched screen — is verified by reading the plugin sources and the
  configuration, not by watching it happen. Xcode was opened at the end of the
  session but nothing was built.
- **No unit tests exist.** Still true, still the obvious next step, still listed
  below.

---

## 9. Noticed, not changed

One thing surfaced during testing that is training content rather than app
code, so it was left alone:

**`cave-max-hang` shows three different units at level 1.** The card reads
`INTENSITY 90%` from `LoadSpec`, the level-1 variation text says "Feet assisted.
10s at RPE 7", and NEXT STEP says "add 1-2kg next session". Percent, RPE and
kilos, on one card, for one exercise. Nothing is broken — the load logger just
made the inconsistency visible by putting a number on it. Deciding which unit
that exercise progresses on is a programme decision, not a code one.

---

## 10. Open questions

1. **Does it run?** Build to the phone and find out. Everything in section 8's
   "not performed" list resolves in about five minutes on a device.
2. **What unit should `cave-max-hang` progress on?** See section 9.
3. **Should the load log be visible anywhere but the workout card?** The data is
   being collected now. Right now the only place you can see it is `LAST` on the
   card for that one exercise.
4. **The two questions v10 asked and this session cannot answer for you** stand
   unchanged: what is actually wrong with the wrists and fingers, and was the
   60-61kg block pull one arm or two.

---

## 11. Next

In order of value:

1. **Run it on the phone for four to six weeks.** v10 section 13 opened with
   this and it is still right. Everything below is speculative until the
   programme has been tested by the person doing it.
2. **Vitest around `src/core/`.** Still no test framework. The invariants worth
   pinning first: `scaleRest` never returns below the protocol value on a
   PRIMARY block, gates resolve to their substitute when closed, decay respects
   the grace periods, and `getLoadAxis` returns null for every unlogged block.
3. **Wire ASSESS to `recordBenchmark`.** The gate logic works and nothing feeds
   it, so the campus board gate can never open no matter what you test.
4. **A load history view.** A sparkline per exercise in Stats, now that there is
   something to draw.
5. **New illustrations.** The v9 pixel-art set maps imperfectly onto the v10
   session names, and `squats.svg` is unused.
6. **Supabase and Vercel**, if this ever needs to be more than one athlete on
   one phone.

---

## 12. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

### Build and run

```bash
npm install
npm run build
npx cap sync ios
npx cap open ios
```

Then in Xcode: select your iPhone or a simulator, Cmd+R. The first build
resolves three Swift packages; that takes a minute once and is cached after.

### After any code change

```bash
npm run build && npx cap sync ios
```

Then Cmd+R in Xcode.

### Faster loop: the browser

```bash
npm run dev
```

Everything except the native shell behaves identically at `localhost:3000`, and
the reload is instant. Use the phone to check the native pieces, the browser for
everything else.

### On a physical iPhone

Connect by USB, select the device in Xcode, set your Apple ID under Signing and
Capabilities, Cmd+R. Then on the phone: Settings, General, VPN and Device
Management, and trust the certificate. No paid developer account is needed; a
free one re-signs every seven days.

### Verify before trusting it

```bash
npx tsc --noEmit
npm run build
npx serve out -l 4321
```

### Regenerate the icon and splash

```bash
pip3 install pillow
python3 tools/generate-ios-assets.py
```

### Reset stored progress

In Safari or Chrome devtools on localhost:

```js
localStorage.removeItem('7bit_store'); location.reload();
```

Or the reset control in the app's Settings overlay. On the phone, deleting and
reinstalling the app does the same thing.

### Read the new code

```bash
sed -n '1,60p' src/core/load.ts
sed -n '1,50p' src/native/native.ts
sed -n '1,40p' capacitor.config.ts
```

### Git

```bash
git status
git add -A
git commit -m "your message"
git push -u origin claude/xcode-project-setup-rdd1se
```

---

*App shell built September 2026. The programme is v10's and unchanged. Run it on
the phone before building anything else.*
