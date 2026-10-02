# 7BIT — Handover v12

**Date:** 2 October 2026
**Read this first.** It is the current state of the project. Older handovers are
background: v11 for the iOS shell, v10 for the training model's reasoning, v9 for
the visual design system.

---

## 0. Working agreements

These hold for every future session and every working message. They are also in
`CLAUDE.md` so a new session picks them up without being told.

1. **Every session ends with a new handover.** Write `7bit-handover-vNN.md`, one
   number up, covering what changed, the repo state, open items and the next
   steps. Update the "Handoff Documents" list in `CLAUDE.md` to point at it.
   A message that changes the repo updates the current handover before it ends.
2. **Every session ends with housekeeping.** All work in pull requests, PRs
   merged once checks pass, stale PRs closed or resolved, merged branches
   deleted, `main` building and passing both checks. Nothing left half-done on
   a side branch without being listed in the handover.
3. **Every message that changes the app ends with the Mac terminal commands**
   needed to pull, build and test it. The standard set is in section 9.
4. Ask before starting anything ambiguous; brainstorm first when asked to.
5. Zero emojis in code and UI copy.

---

## 1. Where things stand

`main` at `8b18f5e`. Everything from this session is merged:

| PR | What |
|----|------|
| #13 | Removed CAVE POWER (limit bouldering, campus). ASSESS moved to its own TEST tab. |
| #14 | Climb log: board, gym and outdoor, boulder and rope, with charts in STATS. |
| #15 | Programme restructure into DAILY / CAVE / TEST. |
| #12 | Animated dot-matrix session illustrations (from an earlier session), merged with the above. |

`npx tsc --noEmit`, `npm run build`, `npm run check:daily` and `npm run check:cave`
all pass on `main`.

---

## 2. The athlete and the week

- Boulders twice a week at **Minimum Zurich** (colour circuit).
- Weekends in the mountains: hiking, climbing, bouldering, skiing.
- At home: **yoga mat, resistance band, portable pull edge on a sling**. No bar,
  no hangboard, no weights (the 16kg kettlebell is out for now).
- Lower back is **weak, not painful**. Wrists and fingers are symptomatic.
- Goals: a **one-arm pull-up**; **bigger abs and obliques** (upper, lower,
  obliques); a stronger lower back; pulling power.
- Weighted pull-up: **+15kg for 5 clean** at 62kg, which is about 143%
  bodyweight. Not yet recorded in the app.

Sample week:

| Mon | Tue | Wed | Thu | Fri | Sat / Sun |
|-----|-----|-----|-----|-----|-----------|
| DAILY 01 | Boulder + CAVE 02 | DAILY 04 | DAILY 02 | Boulder + CAVE 03 | Mountains, logged as OUTDOOR |

DAILY 03 fills any free morning. CAVE 01 STRONG replaces a bouldering day in a
week one is skipped.

---

## 3. The programme

| Tab | Session | Where / when | NORMAL |
|-----|---------|--------------|--------|
| DAILY | 01 FRONT CORE | home, before breakfast | 12 min |
| DAILY | 02 OBLIQUES + BACK | home | 14 min |
| DAILY | 03 BAND STRENGTH | home | 14 min |
| DAILY | 04 FINGERS + MOBILITY | home, the tired morning | 15 min |
| CAVE | 01 STRONG | gym, instead of bouldering | 71 min |
| CAVE | 02 PULL + PUSH | gym, after bouldering | 41 min |
| CAVE | 03 LEGS + BACK | gym, after bouldering | 30 min |
| TEST | 01 ASSESS | gym, every 6-8 weeks | 40 min |

Full exercise lists are in `src/core/data-daily.ts`, `data-cave.ts` and
`data-assess.ts`, and in the printable reference produced this session (see 8).

Rules the checks enforce:

- **DAILY** (`check:daily`): 20 minutes at worst at every level and energy;
  `recoveryHours: 0`; no ACCESSORY block, so TIRED drops nothing; spinal
  flexion (reverse crunch, crunch, Russian twist) always closes a session,
  because discs are most swollen just after waking.
- **CAVE** (`check:cave`): 02 and 03 stay inside 45 minutes NORMAL; the one-arm
  rungs open on a tested weighted pull-up, never on XP.

New protocols: `trunk-hypertrophy` (abs and obliques for size) and
`back-strength` (graded lower-back loading).

Retired: HOME, HANG and MORN tabs; CAVE POWER, CAPACITY (repeaters) and FEET;
the TRX body saw; all kettlebell work at home. Reused exercises kept their ids,
so load history carries over.

---

## 4. Climb log

CLIMB LOG button on the home screen, also offered after CAVE 02 and 03.

- Venue BOARD (Kilter or Tension, plus angle), GYM (Minimum colours) or OUTDOOR
  (optional crag). Discipline BOULDER or ROPE.
- Tap a grade to add a climb; attempts with -/+ (1 = flash); PROJ for unsent.
- Grades: Font for board and outdoor boulders, French for rope, colour bands for
  the gym (yellow to 4+, green 5-6A, orange 6A+-6B+, blue 6C-7A, red 7A+-7B+,
  white 7C-8A, black 8A+).
- STATS > CLIMBING: per-scale pyramid, flash rate, attempts per send, best send
  and best flash per week.
- A boulder session counts against the 48h finger rule and earns contact and
  tension XP; rope earns forearm. Never crimp or open-hand XP.

No Kilter/Tension integration: neither has a public API. Logged by hand on
purpose.

---

## 5. Open items

1. **Record the weighted pull-up** in TEST 01 ASSESS (+15 on the stepper). It
   opens band-assisted one-arms in CAVE 01 and 02.
2. **DAILY 04 raises the finger caution banner.** Any done exercise listing
   `crimp`/`openhand` stamps `lastTrained`, so the light no-hangs make CAVE 01
   show the 48h warning. A warning, not a block. Fix: exempt PREHAB density work
   from the finger readiness clock in `getReadiness` or `applyXP`.
3. **CAVE 01 STRONG is long** (71-83 min NORMAL) since the hanging leg raise
   was added. Fine for a day that replaces bouldering; trim if it drags.
4. **CAVE 03 LEGS + BACK has room** (30 min of a 45 budget) if anything is
   wanted there.
5. **The athlete has not reviewed every exercise yet.** Expect another round of
   changes from the printed programme.
6. **Remote branches to delete.** The session proxy refuses branch deletion, so
   these merged branches are still on GitHub: `claude/assess-tab-drop-power`,
   `claude/climb-log`, `claude/dot-matrix-illustrations`,
   `claude/programme-v12`. Delete them in GitHub's branch view, or turn on
   *Settings > General > Automatically delete head branches* so it never piles
   up again.
7. **Stale branch `claude/exercise-form-guide-pdf-kzrz1x`** (14 Sept, never a
   PR): a printable form guide for the old HOME/HANG/MORN programme. Obsolete
   now. Delete it, or ask to rebuild it for the current sessions.
8. Still planned: Vitest around `src/core/`, Supabase, Vercel production.

---

## 6. Graphics rework: logo and illustrations

The direction: keep the dot-matrix look, possibly move to a square pixel grid.
The athlete designs the logo and the illustrations; the code renders and
animates them.

### 6.1 The logo

- Deliver **one SVG built only from plain `<rect>` elements** on a whole-number
  grid: `x`, `y`, `width`, `height` and a `fill`, no `transform`, no `<path>`,
  no strokes. The current logo is 16 rects in a 150 x 60 viewBox.
- Why: `tools/generate-ios-assets.py` parses those rects directly and redraws
  them pixel-perfect into the iOS app icon and splash. A path-based logo would
  need that script changed.
- Use the two brand colours only: ink `#181610`, accent `#E64D19`.
- The app icon today is **the "7" alone**: the generator keeps the rects with
  `x < 32` and turns the last one accent. A new logo breaks that selection, so
  also deliver **`icon.svg`**, the square mark for the home screen, built the
  same way. The generator then needs a small change to read it instead of
  cutting the 7 out of the wordmark.
- The header shows the logo at 120 x 48 (`HomeScreen.tsx`). Different
  proportions mean changing that size.
- Replace `public/images/logo.svg`, then run the generator (section 9).

### 6.2 Illustrations: the grid

Use the template **`design/pixel-grid.svg`**:

- **30 x 30 cells, 10px each**, on a 300 x 300 artboard. That matches the
  current figures exactly, so new art drops into the card with the same size
  and margin. Thick guide every 5 cells; the dashed line marks row 28, the floor
  the current figures stand on.
- A faint squat figure sits in the template as a size reference. Draw over it.
  The importer ignores it and the guides.
- **Every lit cell is a 10 x 10 rect** on the grid. Bigger rects are fine (a
  20 x 10 rect lights two cells). No transforms.
- **Three fills, exactly:**
  - `#181610` ink: the body
  - `#8A8780` dim: far-side limbs and the floor (rendered as ink at 42%)
  - `#E64D19` accent: equipment (bar, band, kettlebell, edge)
- **Dots or squares is not decided at drawing time.** The art is stored as
  cells, and `anim.json` picks `"shape": "dot"` (round LEDs, as now) or
  `"square"` (pixels). It can be switched per illustration with one word.

Works in Figma, Illustrator or any editor that exports rectangles as `<rect>`.
In Figma: snap to a 10px grid, draw rectangles, export the frame as SVG with
"Outline text" off. Do not flatten or union the rects.

### 6.3 Illustrations: the frames

**Draw 2-4 key frames per illustration. They are played as steps, not
tweened.** In-betweening hand-drawn pixel art automatically produces mush, and
the steppy look is the LED look. So:

- **Repetition movements** (pull-up, squat, row, crunch): 3 frames (start,
  middle, end). Played ping-pong, 1-2-3-2-1, which reads as a full rep.
  Suggested timing `[500, 150, 500]`: hold the ends, flick through the middle.
- **Holds** (hang, plank, hollow): 2 frames, the hold and a tiny change (a
  breath, a dot of strain), `"loop": "cycle"`, around 800 ms each.
- **One frame is enough to start.** Send a single key frame for a style check
  and I can rough the other frames in the same style for you to correct. Final
  frames drawn by you look better than mine.

Files go in one folder per illustration:

```
design/illustrations/<name>/01.svg
design/illustrations/<name>/02.svg
design/illustrations/<name>/03.svg
design/illustrations/<name>/anim.json   (optional)
```

```json
{ "ms": [500, 150, 500], "loop": "pingpong", "still": 1, "shape": "dot" }
```

`still` is the frame shown under reduced motion. Then
`python3 tools/pixel-frames.py <name>` writes `public/images/<name>.svg` and
`public/images/still/<name>.svg`, and the session's `illustration` field points
at it. `design/illustrations/_example-squat/` is a worked example (folders
starting with `_` are skipped by `--all`).

### 6.4 What needs drawing

One per session is the natural set; today four files are shared across eight
cards:

| Session | Today | Suggested subject |
|---------|-------|-------------------|
| DAILY 01 FRONT CORE | squats | hollow hold or reverse crunch |
| DAILY 02 OBLIQUES + BACK | kettlebell | side plank hip dip or prone extension |
| DAILY 03 BAND STRENGTH | dumbbell | band row |
| DAILY 04 FINGERS + MOBILITY | squats | no-hang on the portable edge |
| CAVE 01 STRONG | maxhangs | max hang or weighted pull-up |
| CAVE 02 PULL + PUSH | dumbbell | one-arm pull-up (band) |
| CAVE 03 LEGS + BACK | squats | goblet squat or back extension |
| TEST 01 ASSESS | dumbbell | anything with a timer row |

### 6.5 The other animations

UI motion lives in CSS: `screen-enter` and `screenFadeUp` in `globals.css`,
the card slide and `illusPop` in `HomeScreen.module.css`, the rest flash in
`TimerFlash`. When the visual direction is settled, describe the feel wanted
(snappier, steppier, more LED-like) and they get retuned together, with
`prefers-reduced-motion` respected.

---

## 7. Code map, what changed this session

- `src/core/data-daily.ts` new; `data-home.ts`, `data-hang.ts`,
  `data-morning.ts` deleted; `data-cave.ts` rewritten; `data-assess.ts` new.
- `src/core/types.ts`: `Mode` is `'DAILY' | 'CAVE' | 'TEST'`; climb log types.
- `src/core/climbing.ts`, `src/store/slices/climb-slice.ts`,
  `ClimbScreen`, `ClimbStats`: the climb log.
- `src/core/protocols.ts`: `trunk-hypertrophy`, `back-strength`.
- `scripts/check-daily.ts` replaces `check-morning-budget.ts`.
- `tools/dot-figures.py` (from #12): the generated figures.
- `tools/pixel-frames.py`, `design/`: the hand-drawn pipeline (this session).

---

## 8. Printed material

Two PDFs were produced this session, not committed (regenerate on request):

- *Programme review*: the old programme with keep / change / drop boxes.
- *7bit-programme.pdf*: the current programme as a reference, with a sample
  week, every exercise, dose, progression and cue.

---

## 9. Mac terminal commands

Run from `~/Desktop/Manfredi/05_Bit-apps/CircuitTraining`.

### Get the latest

```bash
git checkout main
git pull
npm install
```

### Try it in the browser

```bash
npm run dev
```

Open `http://localhost:3000`. Phone-sized: Safari > Develop > Enter Responsive
Design Mode, or Chrome DevTools device toolbar at 390px.

### Check it

```bash
npx tsc --noEmit
npm run check:daily
npm run check:cave
npm run build
```

### Production build in the browser

```bash
npm run build && npx serve out
```

### On the iPhone

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Then Cmd+R in Xcode with the phone or a simulator selected.

### Illustrations and logo

```bash
python3 tools/pixel-frames.py <name>       # one hand-drawn illustration
python3 tools/pixel-frames.py --all        # every folder in design/illustrations
python3 tools/dot-figures.py               # regenerate the skeleton figures
pip3 install pillow                        # once, for the icon generator
python3 tools/generate-ios-assets.py       # icon + splash from logo.svg
```

### Housekeeping

```bash
git fetch --prune
git branch -r                              # what is left on GitHub
git push origin --delete <branch>          # remove a merged branch
```
