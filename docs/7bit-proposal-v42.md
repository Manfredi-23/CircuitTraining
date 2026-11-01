# 7BIT — Proposal v42: clearer sessions, and climbing with the legs

**Date:** 1 November 2026. **Status: built in v43** (`docs/handovers/7bit-handover-v43.md`), all of it
except the weekly plan holding an area (P8, last item). The athlete's answers to section 10:
home has a chair (maybe a sofa); every area on BODY THIS WEEK; slots pick by default; skill moves
to the start of CAVE and HEAL; TEST 02 FEET is a section of ASSESS; all in one go.
The athlete asked for two things:

1. How the app could be structured so it is easier to use, explains more,
   gives more freedom in choosing, and gets them training: during a session
   (where am I, how much is left, change it on the go) and before one (where
   am I, what can I train, what did I already train, what am I over- or
   under-training).
2. Thorough research on off-wall exercises, at home or in the cave, that make
   a better climber, above all for technique and feet: exercises that do not
   only strengthen the legs but teach the body to climb with them. The
   athlete likes the single-leg star reach and the toe-tip plate drag.

Part one is the app. Part two is the research and an exercise catalogue.
Part three is how the catalogue goes into the app. Section 10 lists the
questions to settle before building.

---

# Part one: the app

## 1. What works, and what gets in the way

What already works: one pick on TODAY with its reason; the pain and
readiness check; the set-by-set progress bar on the workout card and on
rest; rest that shows the next exercise; EDIT before START; the reserve and
packs; FINISH NOW with UNDO; energy switched mid-session.

What gets in the way, from reading the code:

| Question the athlete asks | Where the answer lives today | The problem |
|---|---|---|
| What did I train this week, what is due, what is too much? | Four places: BUILD's NOT TRAINED ENOUGH (`areaNeeds`), STATS BODY's WHERE THE WORK WENT (`getWorkSplit`), FRESHNESS (`getFreshness`), CORE THIS WEEK (`getCoreVolume`) | Each needs two to four taps, folded, on another tab. None is on TODAY, where the choice is made. Nothing says "too much". |
| What will this session do for me? | Session page: title, subtitle, focus line, the list | No areas or set counts, and nothing on how the session would change the week. |
| How much is left? | Progress bar: `EXERCISE 4/9`, `17/31 SETS` | No minutes left and no finish time. You cannot see the exercises after the next one. |
| What is this block for? | The card's tag reads `SECONDARY · SET 1/3` | `PRIMARY / SECONDARY / PREHAB` are engine words. Sections exist only in ASSESS. |
| Why this exercise, for my climbing? | FORM GUIDE, WHY: the protocol's rationale | One tap down, and it explains the protocol, not the move on the wall it serves. |
| Am I getting better at footwork? | Nowhere | Toe taps say "score it: clean first touches out of eight", but bodyweight has no load axis (`getLoadAxis` returns null), so the score is never saved. The athlete's first limiter has no number. |
| The machine is busy, I'll do it later | Not possible | Mid-session you can skip, swap or add, but not move an exercise to the end or reorder what is left. |

## 2. Proposals

Ordered by value to the athlete. Size is S (a day), M (two or three days),
L (a week). Each keeps the house rules: logic in `src/core/` with a test
file, suggest and never remove, rest never on the screen.

### P1. BODY THIS WEEK on TODAY (M) — the answer before choosing

One compact panel between the week rail and the pick, one row per area:

```
BODY THIS WEEK                          MON-SUN
FINGERS   ......        rest 14h        HEALING
PULL      ########      9 sets          ENOUGH
CORE      ######..      14 of 18        ON TRACK
BACK      ##......      2 of 8          DUE
LEGS      ####....      6 of 10         ON TRACK
FEET      #.......      4 of 30 min     DUE
MOBILITY  ###.....      3 days ago      ON TRACK
```

- Sets per area this week against a target band (min to max), from the
  session log. Words, not colours alone: DUE, ON TRACK, ENOUGH, TOO MUCH,
  RECOVERING, HEALING. Orange only on the area today's pick serves (the one
  accent rule).
- TOO MUCH when an area passes the top of its band, or the acute:chronic
  ratio is over 1.5 (`training-load.ts` already has it), or finger pain went
  3+ twice in a week (`adapt.ts` has it). RECOVERING reads `getReadiness`.
- A tap on a row opens **TRAIN THIS**: the sessions, routines and packs that
  hit that area and pass today's safety rules, minutes beside each, START on
  each. That is the freedom: "I want legs today" is two taps, and the app
  still says what it would pick.
- Core logic: a new `body-week.ts` that joins `areaNeeds`, `getWorkSplit`,
  `getCoreVolume` and readiness into one `AreaStatus[]`. Targets in
  `config.ts` beside `CORE_TARGETS`; first guesses, tuned after a month.
- STATS BODY keeps the history; TODAY gets only this week.

### P2. What this session adds (S) — on the session page and TODAY's card

Under the title: the areas it hits with sets, and how the week would look
after it:

```
THIS SESSION    LEGS 9 · FEET 12 min · CORE 6 · BACK 3
AFTER IT        LEGS 15 of 10 (ENOUGH) · FEET 16 of 30 · CORE 20 of 18
```

Same core function as P1, fed the session's list. ALSO FITS TODAY rows get
the first line too, so the alternatives can be compared at a glance.

### P3. Phases instead of engine blocks (M) — the session explains itself

Every session reads as named chapters, each with a purpose line and minutes:

```
PREP       6 min   Pulse, hips, ankles
SKILL      8 min   Feet: place once, weight, stand. Fresh, before the strength work.
STRENGTH  24 min   Squat, single-leg RDL, back extension
CORE      10 min   Crunch, Copenhagen, side plank
CARE       5 min   Frogger, cuff
```

- No data rewrite: a derived `phaseOf(exercise)` from block, intensity and
  protocol. WARMUP and opening MOBILITY are PREP; TECHNIQUE intensity and the
  `footwork`, `floor-footwork` and `balance` protocols are SKILL; PRIMARY and
  SECONDARY are STRENGTH, or POWER under a power protocol; the trunk
  protocols are CORE; PREHAB and closing MOBILITY are CARE; TEST stays TEST.
  An explicit `Exercise.section` (ASSESS) wins.
- Shown on the session page (headers in the list), on the editor, on the
  progress bar (a gap and a short label between phases), and on the card's
  tag: `STRENGTH · 2 OF 3 · SET 1/3` instead of `SECONDARY · SET 1/3`.
- The ordering rule follows the research in section 5 (L1): skill work goes
  right after PREP, while fresh. In CAVE and HEAL sessions that means the
  footwork drills move from the end to after the warm-up. They are low cost
  and double as part of the warm-up. DAILY keeps its own rules (curling last,
  fingers last).

### P4. Time left and the session map (M) — where am I, what is left

- The header shows **minutes left and a finish time**: `24 MIN LEFT · DONE
  ~19:42`, from `estimateDuration` over what remains, rest included. It
  updates when an exercise is added, a set removed or energy switched.
- **Adding shows the cost**: + ADD EXERCISE and packs read `+6 min, 84 min in
  all`. The coach review found sessions creeping to 77-86 minutes, so the
  number belongs on the button.
- **The session map**: a tap on the progress bar opens the whole list, phase
  by phase. Each exercise shows done, skipped, in hand, or to come. Each one
  still to come has **DO LATER** (moves it to the end, for a busy rack),
  **SKIP**, **SWAP**, **-SET / +SET**, and up / down. Built on the
  `session-edit.ts` moves, applied to the live `exerciseList` from
  `stepIndex + 1` on.
- On rest, under UP NEXT, one line: `THEN: Copenhagen, Plate crunch, +3`.

### P5. Choice slots (M) — freedom without losing the plan

A slot is one job with two to four exercises that do it equally well:

```
SINGLE-LEG STRENGTH   choose one
  > Box pistol           (last: 2 weeks ago)
    Step-up, slow lower  (last: 5 days ago)
    Skater squat
```

- The athlete picks at START or on the card. The app pre-selects the one
  done least recently. That builds variety in, and varied practice is what
  transfers to new climbs (L2 in section 5).
- Load history follows the exercise id, as now. The slot only names the job.
- Data: an optional `options: string[]` on an exercise in a circuit,
  resolved like `substitutes`. Today's SWAP becomes a first-class choice
  with the slot's purpose shown, using `similarTo` for the candidates.
- Start with the leg and footwork slots in CAVE 03, DAILY 06 and the new
  sessions in part three. Keep PRIMARY finger work and tests fixed.

### P6. "For the wall" on every exercise (S) — why, in climbing words

A `transfer` field on exercises: the move each one serves. HIGH STEP,
ROCKOVER, HEEL HOOK, TOE HOOK, EDGE, SMEAR, FLAG, DROP KNEE, STEM, BALANCE,
FEET ON (steep), LOCK-OFF, CRIMP, DEADPOINT. Shown as one line on the card
(`FOR: standing up on a high foot`) and as chips on the session page.

It also links the logs. WHERE YOU FALL already tags styles and why a climb
fell (`limiters.ts`: FEET CUT, FOOT SLIPPED, SCARED...). With `transfer`,
"FOOT SLIPPED in 5 of 12 falls" can point at the EDGE and SMEAR drills, and
SLAB as a weak style at the high-step and smear ones. Same suggest-never-
remove rule: a line on TODAY and a pack, not a forced change.

### P7. Score the skill (S) — footwork gets a number

- A new load kind, `score`: clean reps out of the set ("6 / 8"), on the
  stepper like kilos, saved on the last DONE as loads are. Precision toe
  taps, step-down to a mark, foothold balance and edge stands get it.
  STATS PROGRESS gets a FEET row like LIFTS.
- A **technique note** on the complete screen (open item since v26): one
  line, kept with the session ("right knee caves on the step-down"). It
  shows on the card the next time that exercise comes up, as `LAST TIME:`.
- **TEST 02 FEET** (open since v26), every 4-6 weeks, home or gym, about 20
  minutes, every test scored alone. Section 7 has the tests.

### P8. Smaller things noticed

- TRAIN rows: area chips under each title (`LEGS · FEET · CORE`) and a
  filter `I WANT: LEGS`, the same TRAIN THIS list as P1.
- The card's capacity tags (`LEGS L4 · TENSION L3`) say little mid-set.
  Replace them with the P6 line; keep levels on STATS.
- External-focus cues (L4 in section 5): give drills a short `focus` cue,
  shown large on SKILL work: "The floor stays quiet", "Hips over the box
  edge", "Push the floor away". The FORM GUIDE keeps the detail.
- The weekly plan could hold a phase or an area, not only a session: "Thu:
  LEGS + FEET", filled by the recommender with whatever fits that day.

---

# Part two: the research

**About sources.** Searches ran across coaching sites (Hooper's Beta, The
Climbing Doctor, Lattice, Training for Climbing / Eric Hörst, Power Company,
UKC / Neil Gresham, Dave MacLeod) and the research literature. The session's
network blocked opening most coaching sites directly, so their content comes
from search excerpts. Where a claim has a study behind it, the study is
named. Where it is coaching experience, this proposal says so.

## 3. What the research actually says

1. **The test that best separates climbing grades is a weight transfer onto
   a high foot, not a stretch.** Draper et al. (2009) compared four
   lower-body flexibility tests in climbers. The sit-and-reach did not
   correlate with ability (r = 0.15), nor did the classic foot raise. The
   climbing-specific foot raise did (r = 0.53). The **foot-loading test**, a
   high foot plus moving the weight onto it, did best (r = 0.65) and told
   ability groups apart. A 2023 systematic review of 14 lower-limb
   flexibility tests found only these two correlated well with ability.
   **Implication:** train the high step as a movement: reach the foot high,
   then move the hips over it and stand. Passive splits matter less. The
   slow rock-over transfer and the rock-over drive are on the right track;
   section 4 adds the version closest to the test.
2. **Active range beats passive range.** Coaching sources agree that high
   steps need strong hip flexors at the end of their range: lift the knee
   with no hands, then hold it there. An EMG review found the iliopsoas
   works hardest in deep hip flexion during leg-raising work. Programme
   end-range strength like strength work, 1-2 times a week (coaching
   advice).
3. **Leg strength and power: real, but not the whole story.** Winkler,
   Künzell and Augste (Augsburg, 2023) modelled competition performance.
   Hip flexibility predicted women's bouldering (β 0.42). Lower-body power
   predicted men's bouldering (β 0.41, as much as upper-body power) and
   men's lead. A 2025 study of recreational climbers found no link between
   leg strength and grade. Read: legs matter more as the climbing gets
   harder and more dynamic. The blog claim that "leg strength is the number
   one factor" goes further than the study.
4. **Weight on the feet is a matter of position.** On a vertical wall the
   feet carry most of the lifting (Quaine, Martin and Blanchi, 1997). When a
   limb comes off, its load moves to the opposite side (Quaine and Martin,
   1999). As the wall steepens, load moves from feet to hands. A 2025
   instrumented-wall study found a lower body position moved load back to
   the feet at every angle. Dave MacLeod's coaching adds that on steep
   ground the feet **pull in** as well as push down.
5. **Hips close to the wall is not a law.** Experts keep their centre of
   mass further from the wall than novices and shift it side to side more
   (Zampagni 2011). A 2023 study found wall distance hardly changed energy
   cost. A 2025 review argues that close hips cut the torque the fingers
   hold. Probably both are true: close when static on steep ground, free to
   swing when moving. **Implication:** train the weight shift itself, not a
   frozen posture.
6. **Foot strength helps balance; nobody has tested it on grades.** No
   study links toe-flexor strength to climbing ability. Foot-core training
   (short foot, toe curls) improves balance in reviews of general
   populations, given about 8 weeks with 5-second holds, progressing from
   sitting to standing. Hooper's Beta calls the big-toe flexor (FHL) the
   "unknown hero" of standing on small edges. **Implication:** keep the plate
   drag and the short foot. They are cheap, low risk and plausible. Do not
   expect miracles from them alone.
7. **Toe hooks need the shin and the hip flexors.** Coaches and physios
   agree a toe hook needs ankle range plus tibialis anterior and toe
   extensor strength, held isometrically, with the hip flexors and abs.
   MaxClimbing argues most failed hooks are a wrong force direction, not
   weakness. Both are covered: strength off the wall, direction on it.
8. **Heel hooks are hamstring and calf, and the high heel hook is the risky
   one.** A 2022 case report describes severe proximal hamstring injuries
   from high heel hooks: deep hip flexion, bent knee, isometric. The
   consensus progression is bridges, then ball or slider curls, then
   single-leg curls with the heel turned out, plus isometric heel pulls.
   Nordic curls are recommended for heel-hook strength (Hooper's).
9. **Drop knees need hip internal rotation.** Without it the knee or the
   lower back pays (Climbing Doctor). The drills: 90/90 work, internal-
   rotation lift-offs, hip CARs with the knee turned down, knee taps.
10. **Slacklining makes you good at slacklining.** A meta-analysis (2016)
    found large gains on the line and small transfer to other balance tasks.
    A 12-week study found no transfer. Balance work should look like the
    task: a foot placed on a mark, weight moved onto it, the free leg as a
    counterweight.
11. **How skill is learned (motor learning), from climbing research:**
    - Varied practice transfers to new routes, while repeating one route
      specialises to that route. Variability also trained a more forward-
      looking gaze (Seifert's group; Hacques et al., 2022).
    - Hörst: a few identical repetitions to learn a move, then vary it.
      Learn new skills fresh. Practise under fatigue only once learned.
    - An **external focus** (the effect of the movement) beats an internal
      one (the body part) for learning (Wulf, reviews of 10 and 15 years;
      applied to climbing by UKC's psychology series).
    - Hörst's **target practice**: eyes on the foot until it is weighted.
      Gresham: **pause before placing**; re-adjusting a placed foot is a
      nervous habit.
    - Expert coaches watch the feet and the hips more than the hands
      (eye-tracking, 2020).
    - A route preview gives fewer and shorter stops (Sanchez 2012).

## 4. The catalogue

Grouped by the move on the wall it serves. **HAVE** is in the app already,
**VARIANT** extends an existing exercise (same id and history), **NEW** is
new. Kit: H = home (mat, band, portable edge, a chair or step, a wall), C =
cave. Hands: FREE, FLAT (resting or pressing flat, fine while a finger
heals), or GRIP. Dose is a starting point, from the source where one
exists.

### A. Precise, quiet feet (skill)

| Exercise | Status | Kit / hands | Dose | What it teaches |
|---|---|---|---|---|
| Precision toe taps | HAVE (DAILY 06) | H / FREE | 3 x 8 per foot | Place once, no slide. Gets a score (P7). |
| **Step-down to a mark** | NEW | H step or chair, C box / FREE | 3 x 6 per leg, fixed | Stand on a step on one leg. Lower the other toe slowly to a tape mark or coin in front, beside or behind, silent, eyes on the mark until the foot takes weight. Stand back up without pushing off it. Hörst's target practice and Gresham's pause, plus eccentric single-leg control. Progress: higher step, smaller mark, further, a 2 s hover. Score: clean touches out of 6. |
| **Shift, lift, place** | NEW | H / FREE | 3 x 60 s | Feet on two marks wider than the hips. Shift until one foot weighs nothing (it lifts 1 cm and the trunk does not move), place it on a new mark, shift again. The basic climbing pattern of unweight, move, place, weight (Quaine and Martin). The app draws a new mark layout each session (L2). |
| **Edge stand** | NEW | H portable edge or a step edge / FREE (a fingertip on the wall allowed) | 2 rounds: inside edge, outside edge (backstep), front point, 20 s each per foot | Heel low and still, then a slow knee drive over the toe (a rock-over on an edge). Edging is ankle stiffness plus toe strength: "the toe is a precision instrument" (Gresham). Progress: thinner edge, eyes closed, one-leg rock-over. |
| Slow rock-over transfer, standing flag hold, single-leg star reach | HAVE | H / FREE | as now | Keep. The star reach is a dynamic-balance reach, the same family as the star-excursion balance test. |

### B. Foot and toe strength

| Exercise | Status | Kit / hands | Dose | Why |
|---|---|---|---|---|
| Toe-tip plate drag | HAVE (CAVE 03) | C / FREE | 2 x 8 per foot | Toe flexors, as in pulling on a toe or a steep edge. Add a home version: **towel drag** with a book on the towel (VARIANT). |
| Short foot + toe control | HAVE (DAILY 06) | H / FREE | 2 x 8 per foot, 3 s holds | Foot core. Balance benefits show after about 8 weeks. |
| **Toe-edge calf raise** | VARIANT of the single-leg calf raise | H edge or step, C box / FLAT on a wall | 3 x 8-12 per leg, 3 s down, 1 s up | Only the toes on the edge, full stretch at the bottom. Ankle strength through the whole range is what lets a climber come out of a deep rock-over or a slab smear (physio source). Add a backpack later. |
| **Toe-pull bridge** | NEW | H chair or step, C box / FREE | 3 x 8 per leg, 2 s hold | Single-leg bridge with the toes, not the heel, on an edge, pulling down and back into it. The big-toe flexor, calf, hamstring and glute, as in a toe pull on steep ground (Hooper's). |

### C. Toe hooks

| Exercise | Status | Kit / hands | Dose | Why |
|---|---|---|---|---|
| **Tibialis wall raise** | NEW | H wall / FREE | 3 x 15, 2 s at the top | Back against a wall, heels 30 cm out, lift the toes and forefoot. Progress: heels further out, one leg, a band over the forefoot. The muscle that holds a toe hook (Hooper's, Evolution PT, The Block). |
| **Toe-hook sit-back** | NEW | C radiator, H a sofa or a low band / FLAT | 3 x 6, 5 s hold | Sit with the tops of the feet hooked under the radiator. Pull the toes up into it, lower the trunk slowly to 45 degrees, hold, come up. Shin, hip flexors and abs, the three a toe hook uses (Hooper's suggests sit-ups with the toes tucked and toe-anchored leans). It is a curl, so in a DAILY it closes the session (the curling-last rule). |
| Knee-to-wall ankle rock | HAVE | H / FREE | as now | Ankle range, the other half of a toe hook. |

### D. Heel hooks

| Exercise | Status | Kit / hands | Dose | Why |
|---|---|---|---|---|
| **Heel-hook bridge hold** | NEW | H chair, C box / FREE | 3-5 x 5 s per leg, 3 times a week | On the back, one heel on the box edge, knee at 90 degrees, hip turned out so the outer heel bites. Pull the heel down and in, hips up, hold. Climbing Doctor isometrics are 2-5 sets of 5 s. Progress: straighter knee, then (slowly, weeks later) a deeper hip and knee bend, the high heel-hook position that injures hamstrings. |
| **Slider hamstring curl, heel out** | NEW | H towel on a smooth floor / FLAT | 3 x 6-8 | Bridge up, curl the heels in. Two legs, then lowering only, then one leg with the heel turned out (the Climbing.com ball progression, Hörst). The athlete already uses towel slides. |
| Nordic curl, single-leg RDL | HAVE (HEAL 02, CAVE 03) | | | Recommended for heel-hook strength and tension. |

### E. High steps and rock-overs

| Exercise | Status | Kit / hands | Dose | Why |
|---|---|---|---|---|
| **Wall high-step + load** | NEW, the first one to build | H chair by a wall, C box by a wall / FLAT on the wall | 3 x 4 per leg, fixed | Face the wall, hands flat on it. Step onto a chair or box set close to the wall at the highest height you can reach. Move the hips over the foot and stand without pushing off the floor foot, then lower slowly. This is the foot raise and foot-loading test turned into practice: the two tests that track grade (section 3, finding 1). Progress: higher, closer to the wall, a 2 s pause halfway up. |
| **Box lift-off** | NEW | C box ~60 cm, H chair / FLAT on a wall | 3 x 5 per leg, 3 s hold | Foot on the box, lift it off by driving the knee up, hold, lower. Hip-flexor strength at the end of range (Atomic PT). |
| **Seated leg lift (compression)** | NEW | H mat / FLAT beside the knees | 3 x 5, 3-5 s | Sit tall with straight legs and lift one or both 2-5 cm off the mat. The hip flexors working deep in flexion (the EMG review). Hands flat, so fine while healing. |
| Standing high-knee hold | HAVE | H / FREE | | Add the Climbing Doctor version: lift the knee with the hands, let go, hold 10 s. |
| **Box pistol to pistol** | NEW | H chair, C box / FREE | 3-4 x 4-6 per leg, 2-3 min rest, twice a week | Sit to a box on one leg and stand without momentum. Lower the box over the weeks, then a full pistol, then a goblet pistol. "Most closely replicates the high step" (Hörst); "if you've high-stepped and stood up, you've squatted" (Hampton). A strength exercise: SECONDARY, loadable. |
| Rock-over drive, step-up + slow lower, split squat forward shift | HAVE | | | Keep. |

### F. Drop knees and backsteps

| Exercise | Status | Kit / hands | Dose | Why |
|---|---|---|---|---|
| **90/90 internal-rotation lift-off** | VARIANT of the 90/90 hip switch | H / FLAT | 2 x 6 per side, 3 s | In 90/90, lift the back foot off the mat and hold. Internal-rotation strength for drop knees (Climbing Doctor). |
| **Hip CARs, knee turned down** | NEW | H / FLAT on a wall | 2 x 3 each way per leg | The slowest, biggest circle the hip makes, with the knee turned down at the bottom "as in a drop knee". Active range. |
| Knee taps (windshield wipers) | VARIANT of the hip mobility flow | H / FLAT | 2 x 8 | |

### G. Flagging, stemming, wide feet

| Exercise | Status | Kit / hands | Dose | Why |
|---|---|---|---|---|
| **Lateral foot reach + shift** | NEW | H chair, C box / FLAT on a wall | 3 x 4 per leg | Face the wall, hands flat. Step one foot out to the side as high and wide as you can onto a box or chair, then move the weight across over it. Draper's lateral foot reach (abduction and external rotation) with the load added. |
| **Active frog + foot lifts** | NEW | H mat / FLAT | 2 x 8 rocks + 3 lifts per foot | Frog position, rock back and forth, then lift each foot. Turnout that lets the hips come in on frog positions. |
| **Hip airplane** | NEW | H / FREE (a wall touch allowed) | 2 x 6 per leg | Hinge on one leg and turn the pelvis open and closed. Single-leg rotation control, as in turning a flag or a backstep. No climbing study: a physio exercise, included for the pattern. |
| Cossack shift, goblet Cossack, Copenhagen, side-lying abduction | HAVE | | | Keep. |

### H. Leg drive and power

| Exercise | Status | Kit / hands | Dose | Why |
|---|---|---|---|---|
| **High-foot drive + stick** | VARIANT of the rock-over drive | C box / FREE | 3 x 3 per leg | From a high foot on the box, drive up hard to stand, hop on that leg, and stick the landing on the box. For dynamic moves off a high foot. Lower-body power predicted men's bouldering (Augsburg); Hampton progresses to single-leg jumps. Only when fresh. Not while legs are sore. |
| Box jump, lateral hop + stick, deep lunge drive + stick | HAVE | | | Keep. |

### I. Not recommended, or later

- **Slackline**: little transfer (finding 10). For fun, not as training.
- **Bat hangs** (toe hooks from a bar): Hooper's lists them "at your own
  risk". The tibialis raise and the sit-back cover the same muscle.
- **Toe-edge inverted row** (Hooper's, rows with the toes on an edge):
  excellent for toe pull and tension, but it grips. Add it to CAVE 02 once
  the finger is cleared, labelled NOT RECOMMENDED YET until then.

## 5. Learning rules to build in

| | Rule | Source | In the app |
|---|---|---|---|
| L1 | Skill work early, while fresh; under fatigue only once learned | Hörst | P3: SKILL straight after PREP |
| L2 | Two or three identical reps, then vary: height, direction, layout, eyes | Hörst; Seifert, Hacques | A daily layout on the drill ("today: 6 marks, 3 behind you, eyes closed on the last two"); P5 slots rotate exercises |
| L3 | Eyes on the foot until it takes weight; place it once | Hörst, Gresham | The `focus` cue on every placing drill |
| L4 | External focus: what the movement does, not the body part | Wulf | Cues rewritten: "the floor stays quiet", not "engage the glutes" |
| L5 | A number to beat | — | P7 scores and TEST 02 FEET |
| L6 | Read every foothold before the first move | Sanchez 2012 | Already in ON THE WALL (`read-first`); also as a 10 s check before each attempt |

## 6. On-wall drills for ON THE WALL

`wall.ts` already rotates silent, hover and sticky feet, toes on and hips
in, hooks, flag instead of matching, squeeze, hips over the foot, read
first. Worth adding:

- **Target practice** (Hörst): one route a grade below the on-sight, eyes on
  each foot until it is weighted, nothing else matters.
- **Tracking** (Hörst): the feet may only use the holds the hands used.
- **Pause before placing** (Gresham): stints of 1-3 minutes, 2 minutes
  rest, 3-4 rounds, no re-adjusting a placed foot.
- **Foot swaps** (MacLeod): five swaps on a traverse. On steep ground, a
  flick of the hips stops the swing.
- **Flag check** (MacLeod): the flag foot is usually too low and too far.
  Put it higher and closer, then feel the difference.
- **Pull in with the toes** (MacLeod): on steep ground, drive the hips in by
  pulling with the toes before each move.

---

# Part three: into the app

## 7. What to add

1. **A FEET area** in BUILD, the reserve, the packs and the routine picker,
   beside CORE, BACK and LEGS. Its need in NOT TRAINED ENOUGH and BODY THIS
   WEEK counts minutes of SKILL plus sets of foot strength. FEET stays a
   label over `legs` + `tension`; no new capacity, so XP and levels stay as
   they are.
2. **The FEET pack** (home and gym versions, about 10 minutes), for EDIT and
   + ADD mid-session: home is step-down to a mark, edge stand, tibialis wall
   raise, toe-pull bridge; gym is wall high-step + load, edge stand,
   toe-edge calf raise, plate drag. Also a **HOOKS pack**: tibialis raise,
   toe-hook sit-back, heel-hook bridge hold, slider curl.
3. **DAILY 07 HOOKS + HIGH FEET** (home, mat + chair + band, about 16
   minutes, `recoveryHours: 0`, inside `check:daily`'s 20 minutes):
   knee-to-wall ankle rock (shared), seated leg lift, tibialis wall raise,
   heel-hook bridge hold, toe-pull bridge, wall high-step + load (a door
   frame or a wall), one set of the lunge drive, and the toe-hook sit-back
   last (it curls). DAILY 06 QUIET FEET stays the precision day. The two
   alternate.
4. **CAVE 03 LEGS + BACK**: a SKILL phase after the warm-up (wall high-step +
   load and edge stand, about 6 minutes) in place of the second set of
   single-leg balance, to stay inside 45 minutes. **CAVE 05 FULL BODY**: the
   box pistol as a slot (P5) with the double kettlebell front squat.
5. **HEAL**: every new exercise in A-H keeps the hands free or flat, so all
   of it is open while the finger heals. HEAL 01 can take the heel-hook
   bridge hold and the wall high-step + load.
6. **BUILD**: a FEET goal and a **FOOTWORK** preset (home, 20 minutes), and
   HOOKS joins the ROCKOVER and HIPS goals.
7. **TEST 02 FEET** (P7), every 4-6 weeks, about 20 minutes, no grip:

   | Test | How | Scored as |
   |---|---|---|
   | Climbing foot raise | Face a wall at 23 cm, hands flat at shoulder width, raise one foot as high as possible along a tape scale | cm, per leg, weaker side saved (Draper) |
   | Foot loading | The highest box or step you can step onto and stand up on without pushing off the floor foot | cm |
   | Lateral foot reach | The furthest side mark you can step to and move onto | cm ÷ height |
   | Hips from the wall | Half squat facing the wall, hips in as far as they go, measure hip bone to wall | mm (Climbing Doctor: good under 130, poor over 170) |
   | Knee to wall | Furthest toe-to-wall distance with the knee touching and the heel down | cm per leg |
   | Single-leg balance | Eyes open, then eyes closed, until the foot moves | s per leg (Climbing Doctor's norm at age 20-30: 30 s) |
   | Toe-tap precision | Clean first touches out of 10 per foot | score |

   Ramps where it fits (`Exercise.ramp`), the result saved through
   `records` like ASSESS. STATS PROGRESS gets a FEET section with each
   test's line.
8. **Links to the climb log**: P6's `transfer` lets WHERE YOU FALL suggest
   the pack: FOOT SLIPPED points to edge and smear work, FEET CUT to toe pull
   and tension, SLAB to the high-step and smear drills, REACH to the
   lateral foot reach. A line on TODAY with ADD THE PACK, never an automatic
   change.

## 8. Suggested order

| Step | What | Size |
|---|---|---|
| 1 | P4 minutes left, finish time, cost of an addition; P3 phases on the session page and card | M |
| 2 | The new exercises (A-H), the FEET and HOOKS packs, the FEET area | M |
| 3 | P7 score load kind and the technique note; DAILY 07; the CAVE 03 SKILL phase | M |
| 4 | P1 BODY THIS WEEK and P2 what this session adds | M |
| 5 | P4 session map (DO LATER, reorder); P5 choice slots | L |
| 6 | TEST 02 FEET and the STATS FEET section; P6 transfer tags and the climb-log links | L |

Each step is one PR with its tests; `check:daily` and `check:cave` hold
the time budgets.

## 9. What not to change

- Rest stays protocol-set and off the screen.
- PRIMARY finger work and tests stay fixed and outside slots.
- The finger gates and the pain check stay as they are. Every new exercise
  here is free-handed or flat-handed.
- No new capacity axis: FEET is an area over `legs` + `tension`.

## 10. Questions for the athlete

1. At home, is there a chair or step you can stand on next to a wall, and a
   sofa or radiator to hook the feet under? That decides DAILY 07's kit.
2. BODY THIS WEEK on TODAY: as many rows as above, or only the areas that are
   DUE or TOO MUCH?
3. Choice slots: should the app pick by default (least recently done) and
   let you change it, or ask every time?
4. Should SKILL move to the start of CAVE and HEAL sessions (the research
   says yes), or stay at the end where it is now?
5. TEST 02 FEET as its own session, or folded into ASSESS's warm-up?
6. Which step of section 8 first?

---

## Sources

Research
- Draper et al. 2009, flexibility and climbing performance: [ResearchGate](https://www.researchgate.net/publication/233607138_Flexibility_assessment_and_the_role_of_flexibility_as_a_determinant_of_performance_in_rock_climbing)
- Physical performance testing in climbing, a systematic review (2023): [Frontiers](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2023.1130812/full)
- Winkler, Künzell, Augste 2023, performance predictors: [PubMed](https://pubmed.ncbi.nlm.nih.gov/37486001/)
- Lower limb determinants in sport climbing (2025): [Applied Sciences](https://doi.org/10.3390/app15168797)
- Quaine and Martin 1999, equilibrium in climbing: [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0966636299000247)
- Muscle excitation and force distribution at different wall angles (2025): [Springer](https://link.springer.com/article/10.1007/s00421-025-06047-y)
- Centre of mass position does not drive energetic costs (2023): [JEB](https://doi.org/10.1242/jeb.246943)
- Biomechanical principles and techniques for sport climbing: [MDPI](https://www.mdpi.com/2411-5142/11/1/103)
- Toe flexor strength and balance, a systematic review: [PubMed](https://pubmed.ncbi.nlm.nih.gov/32679464/)
- Four weeks of foot exercises, an RCT (2024): [Scientific Reports](https://www.nature.com/articles/s41598-024-71585-y)
- Short-foot exercise in balance rehabilitation, an RCT: [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8544541/)
- Hip flexor activation during exercises (EMG review): [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11546833/)
- Slackline training and balance, a meta-analysis: [PubMed](https://pubmed.ncbi.nlm.nih.gov/27704483/); three months, task-specific only: [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6261037/)
- Hacques et al. 2022, variable practice and gaze: [PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0269794)
- Seifert et al., skill transfer in climbing: [ResearchGate](https://www.researchgate.net/publication/256928696_Skill_transfer_affordances_and_dexterity_in_different_climbing_environments)
- Wulf, attentional focus and motor learning: [review](https://docs.univr.it/documenti/OccorrenzaIns/matdid/matdid407907.pdf)
- Sanchez et al. 2012, route preview: [Wiley](https://onlinelibrary.wiley.com/doi/10.1111/j.1600-0838.2010.01151.x)
- Coaches' visual search of climbing movement (2020): [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7326104/)
- High heel hook hamstring injury, case report (2022): [DOAJ](https://doaj.org/article/6f1b9a417ad247fbb2b31e7d39c33db1)

Coaching and physio
- Hooper's Beta, top 10 undertrained muscles: [link](https://www.hoopersbeta.com/library/top-10-undertrained-muscles-in-rock-climbers-niche-to-game-changing); full-body guide: [link](https://www.hoopersbeta.com/library/how-to-train-for-climbing-full-body-guide); ankle mobility and strength: [link](https://www.hoopersbeta.com/library/increase-ankle-mobility-amp-strength-for-massive-footwork-gains)
- The Climbing Doctor, mobility assessment: [link](https://theclimbingdoctor.com/climbing-performance-mobility-assessment/); heel hook hamstring rehab: [link](https://theclimbingdoctor.com/mastering-the-heel-hook-a-climbers-guide-to-hamstring-injury-rehab/); knee injuries while heel hooking: [link](https://theclimbingdoctor.com/common-knee-injuries-while-heel-hooking-diagnosis-rehab-prehab-and-more/); drop knees: [link](https://theclimbingdoctor.com/thigh-stretches-and-functional-exercises-for-drop-knees/); lower body training: [link](https://theclimbingdoctor.com/lower-body-training-performance-for-climbers/)
- Climbing.com, three exercises for heel hooking: [link](https://www.climbing.com/gym-climbing/three-exercises-for-heel-hooking/); feet as precision instruments: [link](https://www.climbing.com/skills/quit-floundering-turn-your-feet-into-precision-instruments-with-these-10-tips/)
- Eric Hörst, target practice: [link](https://trainingforclimbing.com/improve-climbing-footwork-with-target-practice/); heel and toe hooks: [link](https://trainingforclimbing.com/develop-fantastic-footwork-with-heel-hook-and-toe-hook-technique/); unilateral strength: [link](https://trainingforclimbing.com/unilateral-strength-exercises-for-climbers/)
- Neil Gresham, improve your movement (UKC): [link](https://www.ukclimbing.com/articles/skills/series/neil_gresham_technique_and_training/improve_your_movement-12519)
- UKC psychology series, attentional focus: [link](https://www.ukclimbing.com/articles/skills/series/the_psychology_series/2_attentional_focus_and_mental_tools_for_climbers-16743)
- Dave MacLeod, feet are for pulling too: [link](http://onlineclimbingcoach.blogspot.com/2006/08/specific-technique-feet-are-for.html); footwork habits (Gripped): [link](https://gripped.com/indoor-climbing/correct-your-footwork-bad-habits-with-climbing-pro-dave-macleod/); foot swaps: [link](https://www.davemacleod.com/blog/swap)
- Power Company Climbing, the basic movements: [link](https://www.powercompanyclimbing.com/blog/2015/05/strength-training-4-basic-movements-you.html)
- Lattice, why flexibility matters: [link](https://latticetraining.com/blog/why-is-flexibility-important-in-climbing)
- Toe hooks: Boulder Movement [link](https://bouldermovement.substack.com/p/better-toe-and-heel-hooks-the-small), Evolution PT [link](https://www.evolutionphysicaltherapy.com/post/toe-hooks-for-climbing/), MaxClimbing [link](https://www.maxclimbing.com/blogs/knowledge-hub-technique-movement/heel-toe-hooks-force-direction-lever-arms-stability)
- Hip strength for climbers, Atomic PT: [link](https://atomicpt.com/blog/hipstrengthforclimbers)
- Ankle strength for climbers, Elios Health: [link](https://www.elioshealth.com/blog/ankle2)
- Pistol squat for climbers, Rockstar Volumes: [link](https://www.rockstarvolumes.com/post/3-leg-workouts-for-climbers)
