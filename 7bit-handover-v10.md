# 7BIT — Training Programme Optimisation

**Handover v10 — September 2026**
*Revised after the athlete questionnaire: sections 2, 6, 7 and 7a.*
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

Assessed by questionnaire, September 2026. No physical testing — every number
below is self-reported and the ones that matter are flagged as unverified.

| | |
|---|---|
| Age / height / weight | 35 / 172cm / 62kg (BMI 21.0) |
| Climbing for | 4 years |
| Sport redpoint | 7a in 5-15 tries, best 7b |
| Sport onsight | 6b |
| Boulder (Font) | 7a in 5-15 tries, best 7b, flash 6b+ |
| Strict pull-ups | 8 |
| One-arm dead hang | 30-45s |
| Weighted pull-ups | Never done |
| Hangboard / gym training history | **None** |
| Sessions per week | **3, all of them climbing** — 2 boulder gym, 1 outdoor lead |
| Fails on | A single hard move, fingers open. Also backs off mentally. |
| Pump recovery | Slow — needs long rests |
| Strong on | Crimps, overhangs |
| Weak on | Slabs, technical climbing |
| Hip mobility | Poor |
| Shoulders | Acceptable |
| **Current symptoms** | **Fingers and wrists both "worrying me"** |
| Goal | Get stronger, more comfortable, better shape. No target route or date. |

At BMI 21 there is no weight lever to pull, and pulling one would be a mistake.
Every gram of progress has to come from force production, tension, capacity and
skill.

### The finger number does not fit

The reported figure was **60-61kg, one arm, 10mm edge**. At 62kg bodyweight that
is 97% of bodyweight through one arm on a 10mm edge.

For scale: Lattice's one-arm dataset is measured on a **20mm** edge, and tops out
around 91% of bodyweight at V11. A 10mm edge produces substantially *lower*
numbers than 20mm for the same fingers. So as stated, the figure sits beyond
V11 on a harder edge — while the same athlete does 8 strict pull-ups, has never
trained fingers systematically, and boulders Font 7a. Those things cannot all be
true.

The likely explanations, in order:

1. **It was a two-arm measurement.** 61kg across both arms on 10mm is about 98%
   of bodyweight, which fits a Font 7a boulderer well and is entirely plausible.
2. **The setup allowed leverage.** A block pull with feet planted and an anchor
   near the floor lets the legs and trunk contribute, inflating the reading
   against a true hang.
3. Different units, or a different edge than remembered.

**Either way the number cannot set training loads**, because it was not measured
on the 20mm reference edge and nothing on another edge converts cleanly. The
programme therefore starts at level 1 and the load comes from a proper 20mm
test later.

### Two answers that reshaped the programme

**"Fingers and wrists are worrying me."** This is the most important line in the
questionnaire and it overrides the generic prescription. A loading programme
should not be started on a structure that is already complaining without knowing
what is complaining. Concretely, until things are quiet:

- No maximal hangs. The MAX HANGS session carries a note saying so.
- No 10mm or smaller edges, for testing or training. 20mm is the floor.
- No campus board — already gated, and the gate stays shut.
- DENSITY hangs become the primary finger tool. Ten minutes at 40% is precisely
  the low-load, high-frequency loading that irritable tendon responds to, and
  it is the safest on-ramp available.
- Wrist conditioning is promoted from one afterthought exercise to a proper
  four-direction block.

**Get a diagnosis.** Wrist pain in a crimp-and-steep-ground specialist has
several common causes that want different handling, and none of them are
distinguishable from a questionnaire. See a physio who treats climbers. The
programme below is built to be safe while you find out, not to substitute for
finding out.

**"3 sessions per week — 2 boulder gym, 1 outdoor lead."** The v10 programme was
written assuming three *spare* slots alongside climbing. There are none. All
three are already climbing. Adding three structured sessions would put a
symptomatic pair of hands on six loaded days a week.

So the structure inverts: the strength work rides along with the climbing
sessions rather than being added to them. Section 6 has the revised week, and a
new 20-minute CAVE 05 ADD-ON exists specifically for this.

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
| 05 | **ADD-ON** | pull, tension, shoulder | 20 min bolted onto the end of a boulder session. Weighted pull-ups / front lever / cuff. No finger loading. |

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

Three climbing sessions are already spoken for. Nothing here adds a fourth
training day; it bolts short blocks onto what you already do.

```
MON   HOME 03 ARMOUR             45 min   wrists, hips, shoulders, legs
TUE   Boulder gym  + CAVE 05 ADD-ON  20 min   pull-ups, front lever, cuff
WED   Rest
THU   Boulder gym  + CAVE 05 ADD-ON  20 min
FRI   HOME 03 ARMOUR (or HOME 01 TENSION)
SAT   Outdoor lead
SUN   Rest

DAILY HANG 03 DENSITY   10 min, once or twice, at least 6h apart
```

That is three climbing sessions, two short home sessions, two 20-minute gym
add-ons, and a daily ten-minute finger block. Total added load: about 110
minutes a week, none of it maximal.

Rules that matter more than the exact days:

1. **Density hangs are the finger programme for now.** Not max hangs. They do
   not count as a finger day and can run every day, including climbing days.
2. **The add-on comes after bouldering, never before.** Bouldering is the finger
   and power session; the add-on is pulling and tension only, deliberately.
3. **ARMOUR is the priority session**, not the leftovers one. Wrists are
   symptomatic and hips are the stated weakness on slabs. Twice a week, minimum.
4. **48 hours minimum between maximal finger sessions** — once you get to them.
   Right now nothing in the week qualifies, which is intentional.
5. **Three weeks loading, one week light.** Halve the PRIMARY sets in the light
   week. The decay grace period is 21 days so this costs nothing.
6. **One boulder session a week should be spent on what you are bad at.** See
   section 7a. This is free grade and it costs no recovery.

### Re-entry to maximal finger work

Do not test or max hang until **all** of these are true:

- Fingers and wrists have been symptom-free for at least four weeks.
- You have been doing density hangs consistently for six to eight weeks.
- You have a diagnosis, or a physio has cleared you.

Then run CAVE 04 ASSESS on a rest day and let the numbers set the loads.

## 7. Benchmarks: where to aim

All figures at 62kg. Two-arm hang scores are total load (bodyweight plus added)
divided by bodyweight, on a **20mm** flat edge.

### Read the finger table off your BOULDER grade, not your route grade

Lattice's finger-strength dataset is built against boulder grades. Your boulder
grades are Font, and **Font 7a is V6** — not V4, which is what you get if you
read a Font grade as though it were a French sport grade. That mistake
understates the target by two full grades, and it is the mistake the first
version of this document made.

| Reading | V-grade | Standard | Added at 62kg |
|---|---|---|---|
| Sport redpoint 7a | V4 | 128% | +17kg |
| **Boulder Font 7a (your working grade)** | **V6** | **140%** | **+25kg** |
| Boulder Font 7b (your best) | V8 | 152% | +32kg |

### What the number actually tells you

This is a **diagnostic, not a target.** The table says what a V6 climber
typically hangs. You already boulder V6. So:

- **If you test near 140% (+25kg)**, your fingers are on par with your grade,
  and the thing holding you back is somewhere else — most likely technique,
  tactics, head, and forearm capacity.
- **If you test well below**, your fingers are behind your climbing and finger
  strength is the lever. Given you have never trained them, this is quite
  likely.
- **If you test well above**, you are climbing below your physical potential and
  the answer is almost entirely technical.

You cannot know which until you test on 20mm — and per section 2, not yet.

### Pulling — weighted pull-up

| Standard | % BW | Added |
|---|---|---|
| Developing | 120% | +12kg |
| Solid | 140% | +25kg |
| **Lattice male standard** | **165%** | **+40kg** |

Eight strict pull-ups puts your estimated 1RM around 125-130% of bodyweight, or
roughly +16 to +19kg. That is meaningfully below the ~165% threshold where
Lattice's data shows pulling strength stops limiting climbers.

**This is your best risk-adjusted lever right now.** You have never done a
weighted pull-up, which means the gains are large, fast, and — crucially —
available in tissue that is *not* currently complaining. While the fingers get
eight quiet weeks of density work, the pulling number can move a long way.

### Everything else

| Test | Developing | Solid | Strong | You |
|---|---|---|---|---|
| Strict pull-ups | 8 | 15 | 20 | **8** |
| One-arm dead hang | 10s | 30s | 45s+ | **30-45s** — strong |
| 90-degree lock-off, one arm | 5s | 10s | 15s | untested |
| Critical force (% of max) | 55% | 63% | 70% | untested, probably low |
| Front lever | tuck | one-leg | straddle | **untrained** |
| Foot raise height | 65cm | 74cm | 85cm | **poor** |

The one-arm hang at 30-45 seconds against only 8 strict pull-ups is an
interesting split: your grip endurance and shoulder integrity are better than
your pulling strength. That is a good problem — it means adding load to
pull-ups is unlikely to be limited by your hands giving out first.

## 7a. The thing an app cannot train

Three of your answers point the same direction and it would be dishonest to
bury it in the training tables:

- Onsight 6b against a 7a redpoint — a four-step gap.
- "I suck at slabs, and technical climbs."
- You back off mentally before you fall.

A gap that size, plus a whole style of climbing you avoid, plus falling
hesitancy, is not a strength problem. Someone who redpoints 7a has the physical
capacity to onsight well above 6b. The gap is movement repertoire, footwork,
reading, commitment and falling practice.

**No amount of hangboarding closes it.** Realistically it is worth more grades
to you over the next year than anything in `src/core/`, and it costs almost no
recovery, which means it competes with nothing.

What that looks like in practice, and why it is not in the app:

- Spend one boulder session in four on slabs and vertical technical problems.
  Badly, in public, on purpose.
- Take practice falls until they are boring. This is a trainable skill with a
  known method, not a personality trait.
- Onsight-mileage days: volume at 6a-6b+, many routes, reading from the ground.
- Consider a few sessions with a coach who watches you climb. Four years in,
  with self-taught technique and a stated aversion to a whole angle, an outside
  eye is worth more per hour than any protocol here.

The app tracks `mobility` because it is loadable and measurable. It does not
track technique, because a rest-timer app has no business pretending to.

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
                             values, the athlete profile and its standing
                             constraints, Font and French grade maps, and
                             helpers converting % bodyweight to kilos at 62kg.
  engine.ts       REWRITTEN  scaleWork / scaleSets / scaleRest / resolveLoadText
                             / applyIntensityCap / buildList with gate resolution
                             / estimateDuration / getReadiness / getLimiter.
                             Capacity-specific decay. Skip and quit cost nothing.
  data-home.ts    REWRITTEN  3 sessions: TENSION, PULL, ARMOUR.
  data-cave.ts    REWRITTEN  5 sessions: MAX, POWER, CAPACITY, ASSESS, ADD-ON.
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

1. **What is actually wrong with the wrists and fingers?** Get it looked at. It
   is the one thing blocking the whole finger programme, and it is not
   answerable from here.
2. **Was that 60-61kg one arm or two?** See section 2. If two-arm, it is a
   plausible 10mm number and worth keeping as a baseline for that edge. If
   genuinely one-arm, the setup needs checking.
3. **Sleep, work, stress** — you skipped question 14's back half. At 35 with a
   new loading programme and symptomatic tissue, recovery capacity is not a
   footnote.
4. **How long have you been at 7a?** Six months of plateau and three years of
   plateau are different problems.
5. **Do you want the portable edge?** Around CHF 50, and it is what makes the
   daily density block possible. Without it the highest-value part of this
   programme only happens on gym days.

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
