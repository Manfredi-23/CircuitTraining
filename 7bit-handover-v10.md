# 7BIT — Training Programme Optimisation

**Handover v10 — September 2026**
Supersedes the training content in `7bit-handoff-v9.md`. The v9 design system,
copy system and screen layouts still stand; everything in this document is about
*what the app prescribes*, not how it looks.

---

## 1. What this session did

1. Read the whole repo and the v9 handoff.
2. Researched the current evidence base for climbing-specific training, with
   Lattice Training's published methodology and dataset as the practical anchor.
3. Audited the v9 programme against it and found nine substantive problems, one
   of which was actively pushing training in the wrong direction.
4. Rewrote the training model end to end: `src/core/types.ts`, `config.ts`,
   `engine.ts`, all three data files, plus two new modules (`protocols.ts`,
   `benchmarks.ts`), and updated the store and screens to match.
5. Verified the result: TypeScript clean, production build clean, every session
   simulated at level 1 and level 5 across all three energy states, and a
   browser pass through the full session flow.

**Nothing about the visual design was touched.** That was not the ask and the
v9 design is good.

---

## 2. The athlete

| | |
|---|---|
| Age / height / weight | 35 / 172cm / 62kg (BMI 21.0) |
| Redpoint | 7a+ sport, granite and gneiss |
| Sessions available | 3 per week, plus climbing |
| Home | Mat, pull-up bar, medium band (no anchor) |
| Gym (Minimum Bouldering Zurich) | Hangboard, rings, TRX, campus board, KB 12kg, DB, bands + anchors, boulders |
| Goal | Improve, hard. Not aesthetics. |

At BMI 21 there is no weight lever to pull, and pulling one would be a mistake.
Every gram of progress has to come from force production, tension, capacity and
skill. That framing drives everything below.

### Note on stale data

The v9 handoff records 60kg / 173cm, 6b-7b, and "4-7 strict pull-ups". Two of
those three numbers have since changed. **Treat the pull-up figure as unverified**
— it is the single most load-bearing assumption in the analysis below, and the
first thing the new ASSESS session measures. If your real weighted pull-up is
already near 165% bodyweight, the priority order in section 7 changes.

---

## 3. Diagnosis: what was wrong with v9

Nine findings, most severe first.

### 3.1 The progression system ran backwards

This is the big one. The v9 level curve did this:

| Level | Reps | Rest |
|---|---|---|
| 1 | base | +15s |
| 4 | +15% | -5s |
| 7 | +25% | -15s |

So as you got stronger the app gave you **more reps and less rest**. That is the
recipe for local muscular endurance. Maximal strength needs the opposite: load
up, reps low, rest long enough to restore phosphocreatine between sets. A
level-7 athlete was getting a max-hang set with 165s rest where the protocol
calls for 180-300s, doing 12-second hangs instead of 10 because the multiplier
said so — which quietly converts a strength stimulus into a strength-endurance
one at an unplanned intensity.

The system was most wrong exactly where the athlete was best equipped to
benefit.

### 3.2 There was no concept of load

Search the v9 data model for a load field. There isn't one. Not added kilos, not
edge depth, not percent of max. The only progression axes were reps, rest, and a
variation *name* that changed at level 4 and 6.

For fingers, progression **is** load — added weight or a smaller edge. For pull
strength at 62kg, it is added weight. Encoding "18mm" as a level-4 string is not
a progression system, it's a label. The app could not answer "how much should I
put on the belt today", which is the only question that matters in a max-hang
session.

### 3.3 The circuit format trained the wrong quality

Every HOME and CAVE session was three rounds of five to eight exercises at
45-90s rest. That is metabolic conditioning. Doing one set of pull-ups, then one
set of push-ups, then one set of squats, then coming back, is a format chosen
for density, not for force production.

Real strength work is consecutive sets of the same movement at the same load
with full recovery between them. The new model runs sets within an exercise and
then moves on.

### 3.4 The muscle-group model was bodybuilding, not climbing

Twelve groups: chest, back, shoulders, triceps, biceps, core, obliques, legs,
glutes, forearms, grip, fingers.

Chest and biceps had their own XP tracks and their own unlock trees. For a 62kg
climber trying to improve at 7a+, hypertrophy in the pecs is mass you then have
to haul up the wall. Meanwhile the things that actually predict climbing grade —
finger strength by grip type, body tension, forearm capacity, contact strength —
were either absent or lumped into a single "fingers" bucket.

Finger strength on a small edge is the strongest physical predictor of climbing
performance in the literature: r = 0.89 against bouldering grade and r = 0.67
against redpoint grade, well ahead of general grip strength or pull-up
performance. It deserved better than one-twelfth of the model.

### 3.5 Finger training was under-specified and internally contradictory

- `max-hang-halfcrimp` carried the note "10s on / 3 min rest x 5 sets" but was
  encoded as `baseReps: 10, baseRest: 180, rounds: 1` — the note and the engine
  disagreed about how many sets would actually happen.
- With level scaling applied, a level-5 user got **12-second** max hangs at
  **165s** rest. Both numbers moved in the wrong direction.
- `repeaters-bw` encoded "7s on / 3s off x 6" as `baseReps: 6, unit: 'reps'`, so
  level scaling produced *seven* reps of a protocol whose whole identity is the
  6-rep 7:3 structure. Repeater intensity is set by load, not by rep count.
- Both HANG sessions claimed 40 minutes. Adding up the prescribed sets and rests
  gives 45-55 minutes of pure finger work, well past the "quality over quantity"
  note printed on the same card.
- **No warm-up existed anywhere in the app.** Progressive finger loading before
  maximal work is the most consistently recommended injury-reduction step in
  climbing, and it was simply absent.

### 3.6 The campus board was gated on XP

`campus-speed-ladder` unlocked at level 5 — a level reachable by accumulating XP
from dead hangs and pull-ups. Campus boarding is the highest injury-risk tool in
a climbing gym, loading fingers, elbows and shoulders explosively, and those are
the three commonest injury sites in the sport. Access to it should depend on a
tested finger-strength standard and a clean injury history, not on having
pressed DONE enough times.

### 3.7 Skipping was punished

`skipPenalty: -1` — skip an exercise, lose XP for its muscle groups.

In an app that prescribes maximal finger loading, this is a design flaw with a
plausible injury pathway attached. The moment a pulley feels tender is exactly
the moment the athlete should skip, and the app was set up to charge them for it.
Quitting a session cost XP on every remaining exercise, which is the same
incentive at larger scale.

### 3.8 There was no recovery logic

The only temporal rule in v9 was a *penalty for not training*. Finger flexor
tendons and pulleys need 48-72 hours between maximal sessions. The app would
happily let you run MAX HANGS three days running and award XP each time.

A training app that has an opinion about you resting too much, and no opinion
about you resting too little, has its incentives pointing the wrong way.

### 3.9 Detraining was modelled as one flat rate

-2 XP per 7-day window for all twelve groups after 10 days idle. In reality
maximal strength holds for weeks with no training, while aerobic capacity and
mobility fade within days. Worse, a 10-day trigger punishes the planned deload
week that the same literature recommends (3 weeks loading, 1 week light).

### Also entirely missing

- Antagonist and rotator cuff work, despite upper-extremity injuries making up
  the large majority of climbing injuries.
- Wrist extensor and pronator work — the standard prevention for medial elbow
  tendinopathy, which is the classic injury of a 35-year-old climber adding
  training volume.
- Hip mobility, a genuinely trainable determinant, measured in climbing
  assessment batteries via foot-raise height and straddle depth.
- Any endurance quality at all, for a **sport** climber whose limit is 7a+.
  Routes are 20-40 moves. Forearm aerobic capacity is usually the primary
  limiter at that grade and there was no protocol for it anywhere.
- Any way to know where you actually stand. No test, no benchmark, no number.

---

## 4. The new model

### 4.1 Ten capacities, not twelve muscles

| Capacity | What it is |
|---|---|
| `crimp` | Half-crimp finger strength, 20mm reference edge |
| `openhand` | Open-hand / three-finger-drag finger strength |
| `forearm` | Finger endurance: critical force, recovery on the wall |
| `pull` | Vertical pulling chain: lat, scapula, elbow flexors |
| `contact` | Contact strength, rate of force development, power |
| `tension` | Body tension: anti-extension, anti-rotation, hip flexion |
| `press` | Antagonist pressing |
| `shoulder` | Rotator cuff, scapular control, elbow armour |
| `legs` | Lower-body strength and hip drive |
| `mobility` | Hip, shoulder and ankle range |

Fingers are split by grip type because the two grips adapt semi-independently
and train at different loads. Chest, biceps, triceps and glutes are gone as
tracked axes — the movements that train them are still in the programme, but as
joint-health maintenance under `press` and `shoulder`, where they belong.

### 4.2 Blocks

Every exercise carries a block that fixes its place in the session and how it
gets scaled:

| Block | Purpose | Rest behaviour |
|---|---|---|
| `WARMUP` | Preparation and readiness check | Fixed |
| `PRIMARY` | Maximal-quality work, done fresh | Protocol floor, never compressed |
| `SECONDARY` | Supporting strength, still heavy | Protocol floor, never compressed |
| `ACCESSORY` | Volume work | May compress with level |
| `PREHAB` | Cuff, elbow, wrist — never to failure | May compress with level |
| `MOBILITY` | Range of motion | May compress with level |
| `TEST` | Assessment | Protocol floor |

Sessions are ordered by neurological cost. Fingers and CNS get the session while
they are fresh; conditioning goes last, where fatigue costs nothing.

### 4.3 Progression moves load, not reps

| Level | Cumulative XP | Load step | Bonus PRIMARY sets | Unlocks |
|---|---|---|---|---|
| 1 | 0 | 1.00x | 0 | Movement quality, submaximal loads |
| 2 | 8 | 1.05x | 0 | Load progression starts |
| 3 | 20 | 1.10x | +1 | Volume step |
| 4 | 36 | 1.15x | +1 | Harder variations |
| 5 | 60 | 1.20x | +1 | New exercises enter |
| 6 | 92 | 1.25x | +2 | Advanced variations, unilateral work |
| 7 | 132 | 1.30x | +2 | Peak protocols, minimum edge |

**Level never touches rest on maximal work.** A max hang needs three minutes at
level 1 and at level 7 alike — that is physiology, not experience. Only energy
can extend it, and only upward. Accessory and prehab blocks are still allowed to
get denser with level, because density genuinely is a training variable there.

Every exercise also carries an explicit `progression` string, shown on the
workout card under NEXT STEP: *"All four sets clean at 10s, then add 1-2kg next
session."* The rule is on the card, not in your head.

Set counts are capped at 6 on PRIMARY and 5 on SECONDARY. Volume on maximal work
has a sharp point of diminishing return.

### 4.4 Energy changes quality, not just quantity

| | Sets | Rest | Intensity ceiling | Dropped |
|---|---|---|---|---|
| FRESH | +1 on working blocks | protocol | none | — |
| NORMAL | as written | protocol | none | — |
| TIRED | -1 | x1.25 | capped at HARD | ACCESSORY |

The important change is the intensity cap. The correct response to arriving
tired at a maximal finger session is to lower the ceiling, not to do the same
session slightly smaller. Chasing a PR on tired tendons is the classic mechanism
for a pulley injury.

### 4.5 Skipping and quitting are free

`skipPenalty: 0`, `quitPenalty: 0`. Missed work earns nothing. It costs nothing.
Skipping the whole exercise, remaining sets included, is one tap — a half-done
max-hang set is worse than none.

XP is awarded once per exercise, on completing its final set, and warm-ups and
prehab do not earn XP at all. They mark the capacity as trained, so the recovery
clock is accurate, but they are maintenance rather than stimulus.

### 4.6 Detraining is capacity-specific

| Capacity | Grace | Per week after |
|---|---|---|
| crimp, openhand, pull, press, legs | 21 days | -1 |
| contact, tension, shoulder | 14 days | -1 to -2 |
| forearm, mobility | 10 days | -3 |

A three-week grace on strength means a planned deload week never costs you
anything.

### 4.7 Readiness

`getReadiness(circuit, progress)` compares the hours since the relevant
capacities were last loaded against what the session demands. Sessions with
`recoveryHours: 48` (the two maximal finger sessions and the power session)
report `rest` until 48 hours have passed, with a banner on the home screen
naming what to do instead. Sessions with `recoveryHours: 0` — the density block
— never report a debt, because they are designed to be repeatable daily.

### 4.8 Safety gates

The campus board carries a gate, not a level requirement:

```
benchmarkId: 'fs-2arm-20mm'
minValue:    130     (% bodyweight on a 20mm two-arm max hang)
substitute:  Recruitment Pulls
```

Until you have recorded a qualifying test result, campus ladders are replaced by
recruitment pulls — five-second maximal isometric efforts against a fixed edge,
which train the same quality (rate of force development) at a fraction of the
tissue cost. The substitution is visible and explains itself on the card.

---

## 5. The sessions

Ten sessions. Every one has a single job, and none of them duplicates another.
The v9 programme had eight sessions that were largely the same push/pull/legs
split reskinned three times.

### HOME — 40-45 min, mat + bar + band

| | Session | Trains | Contents |
|---|---|---|---|
| 01 | **TENSION** | tension, pull | Front lever progression 5x10s / hanging leg raise 4x8 / hollow + arch 3x30s / Pallof press / Copenhagen plank / band external rotation |
| 02 | **PULL** | pull, shoulder, forearm | Weighted pull-ups 5x4 @150s / lock-off ladder / inverted row / dead hang / wrist armour |
| 03 | **ARMOUR** | press, shoulder, legs, mobility | Pike press 4x8 / push-ups / Bulgarian split squat / single-leg RDL / cuff circuit / wrist armour / hip flow |

None of these load the fingers maximally, so any of them can sit 24 hours after
a hard climbing or gym day without competing for tendon recovery.

### CAVE — 45-60 min, full gym

| | Session | Trains | Contents |
|---|---|---|---|
| 01 | **MAX** | crimp, pull, tension | Warm-up / max hangs 4-6x10s @180s / weighted pull-ups 4-6x4 @180s / lock-off ladder / front lever / cuff |
| 02 | **POWER** | contact, crimp, pull, tension | Warm-up / limit bouldering 6-7 attempts @180s / campus **or** recruitment pulls / explosive pull-ups / ring toe-hooks / TRX Y-T-W |
| 03 | **CAPACITY** | forearm, pull, press, legs | Warm-up / repeaters 6x(7:3 x6) @150s / pull-up strength endurance / KB overhead press / split squat / wrist armour |
| 04 | **ASSESS** | everything | The test battery. Every 6-8 weeks, on a rest day, fresh. |

### HANG — 12-45 min, hangboard

| | Session | Trains | Contents |
|---|---|---|---|
| 01 | **MAX HANGS** | crimp, openhand | Warm-up / half-crimp 20mm 5x10s @180s / three-finger drag 3x10s @180s. **Eight working hangs is the whole session.** |
| 02 | **CAPACITY** | forearm, crimp | Warm-up / repeaters 6x60s @150s / critical force block 4min (L5+) / dead hang grip rotation |
| 03 | **DENSITY** | crimp, openhand | 10 x 10s at ~40%, 50s rest. Twelve minutes. Feet on the floor. |

**DENSITY is the highest-return addition in this rewrite.** A 2024 analysis in
*Sports Medicine - Open* of climbers' logged training found that frequent
low-intensity finger loading produced grip-strength gains comparable to max
hangs, and that running both concurrently was additive. It is consistent with
tendon-loading work showing collagen synthesis responds best to short bouts
spaced roughly six hours apart rather than to one long session.

Caveat, stated plainly: that study is a retrospective analysis of app-logged
training, not a randomised trial. The effect size should be treated as
promising rather than established. But the load is so low that the downside risk
is close to zero, and the upside is real.

**This needs a small edge at home.** See section 9.

---

## 6. The week

The three training sessions have to fit around climbing without stealing from
it. A workable default:

```
MON   HOME 03 ARMOUR              45 min   (or rest)
TUE   Climb (bouldering)
WED   CAVE 01 MAX                 60 min   fingers + heavy pull, fresh
THU   Rest / HOME 03 ARMOUR
FRI   Climb, or CAVE 02 POWER
SAT   Outdoors / CAVE 03 CAPACITY 60 min
SUN   Rest

DAILY  HANG 03 DENSITY  10 min, once or twice, at least 6h apart
```

Rules that matter more than the exact days:

1. **48 hours minimum between maximal finger sessions.** CAVE 01, CAVE 02 and
   HANG 01 all count. The app will tell you.
2. **Fingers first, always.** Maximal finger work goes at the front of a session
   or on its own day. Never after climbing.
3. **Density hangs do not count as a finger day.** That is the point of them.
4. **Three weeks loading, one week light.** In the light week, halve the sets on
   PRIMARY blocks and keep everything else. The decay grace period is set to 21
   days precisely so this costs you nothing.
5. **Climbing is the priority.** These sessions support climbing; they do not
   replace it. If a session would wreck tomorrow's climbing day, pick ARMOUR.

---

## 7. Benchmarks: where to aim

All figures at 62kg bodyweight. Two-arm hang scores are total load (bodyweight
plus added) divided by bodyweight.

### Fingers — 20mm flat edge, half-crimp, 10s

| Standard | % BW | Total | Added |
|---|---|---|---|
| V4 (~7a) | 128% | 79.4kg | **+17.4kg** |
| V5 (~7a+) | 134% | 83.1kg | **+21.1kg** |
| V6 (~7b/7c) | 140% | 86.8kg | **+24.8kg** |
| V7 | 146% | 90.5kg | **+28.5kg** |

Lattice's two-arm dataset runs from 128% at V4 up in roughly 6-point steps per
V-grade. Their data is published against boulder grades, so the sport-grade
column is an approximation for a route-focused climber and is deliberately
conservative. **Your near-term target is +21kg; the number that would put you on
7b/7c terrain is +25kg.**

### Pulling — weighted pull-up 1RM

| Standard | % BW | Added |
|---|---|---|
| Developing | 120% | +12kg |
| Solid | 140% | +25kg |
| **Lattice male standard** | **165%** | **+40kg** |

Lattice's analysis of over 700 weighted pull-up assessments found that below
roughly 160-165% of bodyweight, pulling strength is usually a genuine limiter,
and above it returns diminish sharply — from V9 to V12, four full grades, the
average barely moves.

**This is probably your biggest single lever, and it is the one thing v9's data
does not let us confirm.** If the "4-7 strict pull-ups" figure still holds, your
estimated 1RM is around 115% of bodyweight — roughly 50 percentage points below
the threshold where pull strength stops limiting you. That is a large, cheap,
trainable gap, and it is why weighted pull-ups appear as PRIMARY work in two
separate sessions.

Test it in week one before you commit to that priority.

### Everything else

| Test | Developing | Solid | Strong |
|---|---|---|---|
| Strict pull-ups | 8 | 15 | 20 |
| 90-degree lock-off, one arm | 5s | 10s | 15s |
| Critical force (% of max) | 55% | 63% | 70% |
| Front lever | tuck | one-leg | straddle |
| Foot raise height | 65cm | 74cm | 85cm |

Run the full battery in CAVE 04 every 6-8 weeks, on a rest day, fully warm.
Change nothing between tests except your training — same edge, same grip, same
shoulder position, ideally the same time of day.

---

## 8. Recovery and nutrition, briefly

Not the focus of this session, but three things are cheap and well supported:

- **Protein**: roughly 1.6-2.0 g/kg/day, so about 100-125g at 62kg. Enough to
  support adaptation without adding mass you have to carry.
- **Collagen loading**: 15g gelatin or hydrolysed collagen with ~200mg vitamin C
  taken 30-60 minutes before finger loading roughly doubled markers of collagen
  synthesis in Baar's work. Pair it with the density hangs — the protocol was
  designed around exactly this timing.
- **Sleep** is the largest single recovery variable and the one most often
  traded away. Trading it for a fourth training session is a bad exchange.

---

## 9. Equipment gaps

Two things would meaningfully change what the programme can deliver.

| Item | Cost | Why |
|---|---|---|
| **A portable edge** (Tension Block, Lattice rung, or a bolted 20mm wooden edge) | ~CHF 40-70 | Unlocks DENSITY hangs at home. This is the single highest-return purchase in the list — it turns finger training from a twice-weekly gym trip into a daily ten-minute habit. |
| **A weight belt or a pulley + plates** | ~CHF 30-60 | Weighted pull-ups and weighted hangs both need it. A loaded rucksack works but is unstable and hard to increment by 1-2kg. |

Optional, and genuinely useful if you want the numbers to be real:

| Item | Cost | Why |
|---|---|---|
| **Tindeq Progressor or similar force gauge** | ~CHF 300 | Turns critical force from an estimate into a measurement, enables one-arm testing without a hang, and makes recruitment pulls quantifiable. Nice to have, not required. |

---

## 10. Evidence base

Primary sources behind the prescriptions. Every protocol in `src/core/protocols.ts`
carries its own `rationale` and `source` field, shown in-app under the WHY
section of the form guide.

**Finger strength and climbing performance**
- Climbing performance in males: the importance of climbing-specific finger
  strength. *Eur J Appl Physiol* (2025). Finger strength r = 0.89 vs bouldering,
  r = 0.67 vs redpoint; more predictive than general grip or pull-up strength.
  https://link.springer.com/article/10.1007/s00421-025-05802-5
- Physical performance testing in climbing: a systematic review. *Front Sports
  Act Living* (2023). https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2023.1130812/full
- Sport climbing performance determinants and functional testing methods: a
  systematic review (2024). https://www.sciencedirect.com/science/article/pii/S2095254624001303

**Hangboard protocols**
- Effects of Different Loading Programs on Finger Strength in Rock Climbers.
  *Sports Medicine - Open* (2024). The Abrahangs / density-hang analysis.
  Retrospective app-data cohort, not an RCT.
  https://sportsmedicine-open.springeropen.com/articles/10.1186/s40798-024-00793-7
- Hangboard training in advanced climbers: a randomized controlled trial.
  *Scientific Reports* (2021). https://www.nature.com/articles/s41598-021-92898-2
- Effects of Different Hangboard Training Intensities on Finger Grip Strength,
  Stamina, and Endurance. *Front Sports Act Living* (2022).
  https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2022.862782/full

**Lattice methodology and datasets**
- Two-arm finger strength test and benchmarks. https://latticetraining.com/2-arm-fs-test/
- Finger strength vs climbing grade. https://latticetraining.com/blog/lattice_data_finger_strength_grades
- Is pull-up training a waste of time for climbers? (the 165% threshold and the
  diminishing-returns curve). https://latticetraining.com/blog/pull-ups-dimishing-returns
- Minimum effective dose for climbers. https://latticetraining.com/blog/minimum-effective-dose-for-climbers-how-to-train-strength-over-summer-without-living-in-the-gym/
- Lattice Training's guide to better hangboarding, parts 1-2, *Climbing*.
  https://www.climbing.com/skills/tom-randalls-guide-to-better-hangboarding-part-1/

**Endurance and critical force**
- Measuring critical force in sport climbers: validation of the 4-min all-out
  test on finger flexors (2024). https://pmc.ncbi.nlm.nih.gov/articles/PMC11365833/
- The single-bout forearm critical force test. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3974771/
- What is endurance training in climbing? https://latticetraining.com/blog/what-is-endurance-training-in-climbing

**Core and body tension**
- Saeterbakken et al. Effects of ten weeks dynamic or isometric core training on
  climbing performance among highly trained climbers. *PLOS ONE* (2018).
  10.8-33.8% improvement in climbing-specific tests; dynamic and isometric
  broadly equivalent. https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0203766

**Power and campus board**
- Effects of Two vs. Four Weekly Campus Board Training Sessions on Bouldering
  Performance. *Front Physiol* (2021). https://pmc.ncbi.nlm.nih.gov/articles/PMC8256519/
- Differences in Upper-Body Peak Force and Rate of Force Development in Male
  Intermediate, Advanced, and Elite Sport Climbers. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9274001/

**Injury prevention and tendon loading**
- The Connection Between Resistance Training, Climbing Performance, and Injury
  Prevention. *Sports Medicine - Open* (2024). https://link.springer.com/article/10.1186/s40798-024-00677-w
- Editorial: Injuries, injury prevention and training in climbing (2024).
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10973541/
- Baar, K. Tendon stiffness, collagen production and gelatin for performance and
  injury. https://sigmanutrition.com/podcast/episode143/
- Vitamin C-enriched gelatin supplementation before intermittent activity
  augments collagen synthesis. https://www.sciencedirect.com/science/article/pii/S0002916522047372
- Treating climber's elbow: rehab and prehab protocol.
  https://trainingforclimbing.com/treating-climbers-elbow-medial-epicondylitis/
- To tape or not to tape: annular ligament (pulley) injuries in rock climbers —
  a systematic review. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9344739/

**Mobility**
- Climbing performance mobility assessment. https://theclimbingdoctor.com/climbing-performance-mobility-assessment/
- Flexibility assessment and the role of flexibility as a determinant of
  performance in rock climbing.

---

## 11. What changed in the code

```
src/core/
  types.ts        REWRITTEN  Capacity replaces MuscleGroup. Added BlockType,
                             Intensity, LoadSpec, Gate, Protocol, Benchmark,
                             Readiness. Exercise gained sets/work/restSec/load/
                             progression/block/intensity/fixed/gate.
  config.ts       REWRITTEN  New level curve (load-based, rest never shrinks on
                             quality work). Energy caps intensity. Capacity-
                             specific decay. Recovery constants.
  protocols.ts    NEW        14 named protocols with exact parameters, rationale
                             and source. Referenced by id from the exercise data.
  benchmarks.ts   NEW        8 testable standards with published reference
                             values, the athlete profile, and helpers converting
                             % bodyweight to kilos at 62kg.
  engine.ts       REWRITTEN  scaleWork / scaleSets / scaleRest / resolveLoadText
                             / applyIntensityCap / buildList with gate resolution
                             / estimateDuration / getReadiness / getLimiter.
                             Capacity-specific decay. Skip and quit cost nothing.
  data-home.ts    REWRITTEN  3 sessions: TENSION, PULL, ARMOUR.
  data-cave.ts    REWRITTEN  4 sessions: MAX, POWER, CAPACITY, ASSESS.
  data-hang.ts    REWRITTEN  3 sessions: MAX HANGS, CAPACITY, DENSITY.
  stats.ts        UPDATED    Capacity terminology.

src/store/
  slices/workout-slice.ts   REWRITTEN  Sets within an exercise replace rounds of
                                       a circuit. XP once per exercise.
  slices/progress-slice.ts  UPDATED    benchmarkResults + recordBenchmark.
  store.ts                  UPDATED    Persists benchmarkResults.

src/components/screens/
  WorkoutScreen.tsx   UPDATED  Shows block, set counter, load prescription,
                               NEXT STEP progression rule, and protocol
                               rationale + source in the form guide.
  HomeScreen.tsx      UPDATED  Readiness banner, session focus line, computed
                               duration instead of a hardcoded number.
  CompleteScreen.tsx  UPDATED  Capacity labels.
  StatsScreen.tsx     UPDATED  Capacity labels.
  RestScreen.tsx      UPDATED  Dead completion branch removed.
```

**Verification performed**: `tsc --noEmit` clean; `next build` clean; all ten
sessions simulated at levels 1 and 5 across FRESH/NORMAL/TIRED with estimated
durations checked against their card values; gate open/closed both exercised;
full browser pass through home > session > sets > rest > complete > stats.

**Not done**: no unit test framework exists in the repo. The verification above
was done with a throwaway script and a browser pass, not committed tests. Adding
Vitest around `src/core/` is the obvious next step and is listed below.

---

## 12. Open questions for you

1. **What is your actual weighted pull-up max?** Section 7 leans on an estimate
   from a stale note. Run CAVE 04 in week one.
2. **What can you hang on a 20mm edge right now?** Everything in the finger
   programme is expressed as a percentage of that number, and the app cannot
   prescribe a real load until you record it.
3. **Do you want the density hangs?** They need a small edge at home (~CHF 50).
   Without one, HANG 03 is gym-only and loses most of its value.
4. **Is 7a+ a redpoint or an onsight?** It changes the endurance emphasis
   materially. This document assumes redpoint.
5. **Any current niggles?** Fingers, elbows, shoulders. The gates and prehab are
   generic right now; a known issue would change the prescription.

---

## 13. Next: the iPhone app

The rewrite deliberately kept `src/core/` free of React, which is what makes the
Capacitor path and any future native port straightforward. Suggested order:

1. **Test the programme for 4-6 weeks first.** Rebuilding the shell around
   training content you have not validated is the wrong order.
2. Add Vitest and cover `src/core/` — `scaleRest` must never return less than
   the protocol value on a PRIMARY block, gates must resolve correctly, decay
   must respect grace periods. These are the invariants that keep the training
   sound.
3. Build a load-logging UI. The model now has a place for load; the interface
   does not yet let you enter one. This is the biggest functional gap.
4. Wire the ASSESS session to `recordBenchmark` so tests write results and gates
   open automatically.
5. New illustrations. The v9 pixel-art set maps imperfectly onto the new session
   names, and `squats.svg` is now unused.
6. Then Capacitor, then the App Store if you want it.

---

## 14. Mac terminal commands

Everything below assumes a Mac with Homebrew. Run from your usual projects
directory.

### Get the branch

```bash
# First time
git clone https://github.com/manfredi-23/CircuitTraining.git
cd CircuitTraining

# Already cloned
cd ~/path/to/CircuitTraining
git fetch origin claude/training-programs-optimization-8o78cb
git checkout claude/training-programs-optimization-8o78cb
git pull origin claude/training-programs-optimization-8o78cb
```

### Prerequisites

```bash
# Node 18+ (this repo was verified on Node 20)
brew install node
node --version

# Xcode from the App Store, then:
xcode-select --install
sudo xcodebuild -license accept
brew install cocoapods
```

### Run the web app

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Verify before you trust it

```bash
npx tsc --noEmit          # type check
npm run build             # production build into out/
npx serve out -l 4321     # serve the static export
```

### Build and run on iPhone

```bash
npm run build
npx cap sync ios
npx cap open ios
# In Xcode: pick a simulator (iPhone 16) or your device, then Cmd+R
```

After any code change:

```bash
npm run build && npx cap sync ios
# then Cmd+R in Xcode
```

For a physical iPhone: connect by USB, select the device in Xcode, set your
Apple ID under Signing & Capabilities, Cmd+R. Then on the phone go to
Settings > General > VPN & Device Management and trust the certificate. No paid
developer account is needed for personal use.

### Reset the app's stored progress

The app persists to `localStorage` under `7bit_store`. In Safari or Chrome
devtools console on localhost:

```js
localStorage.removeItem('7bit_store'); location.reload();
```

Or use the reset control in the app's Settings overlay.

### Read the new training model

```bash
sed -n '1,60p' src/core/protocols.ts      # the sourced protocols
sed -n '1,80p' src/core/benchmarks.ts     # the standards and your targets
sed -n '1,40p' src/core/config.ts         # the level curve and why it changed
grep -n "progression:" src/core/data-*.ts # every progression rule at a glance
```

### Add tests (recommended next step)

```bash
npm install -D vitest
npx vitest init
# then: npx vitest run
```

### Git

```bash
git status
git add -A
git commit -m "your message"
git push -u origin claude/training-programs-optimization-8o78cb
```

---

*Programme rewritten September 2026. Test in week one, then train the limiter.*
