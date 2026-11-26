# 7BIT v2 — The plan

**A living document.** Started 26 November 2026. Every session that works on
v2 reads this first and updates it. Nothing is built until section 6 says so.

How this file works:

- **1. Input log**: what the athlete said, dated. Entries are added, never
  rewritten.
- **2. Decisions**: one line each, with a status: AGREED (the athlete said
  so), PROPOSED (waiting for an OK), OPEN (a question decides it).
- **3. Design draft**: how v2 works, as far as it is decided. Changes as the
  decisions do.
- **4. What v1 already has** that the design reuses.
- **5. Open questions** (V01...). The printed review keeps its own IDs (B, C,
  F01-F76, Q01-Q40, S1-S4): `docs/v2/7bit-v2-review-R1.pdf`.
- **6. Plan of work**: planning steps first, building last.
- **7. Changes to R1**: where a later input overrules the printed review.
- **8. Design skills**: the research behind the visual redesign.

---

## 1. Input log

### I1 — 23 November 2026: streamline it

> "It got a little bit overstacked and there is way too much and it's
> becoming complicated to use. [...] Suggest me a way to make it much more
> efficient, powerful, fast to use, and overall better experience."

Answered with a full read of v1 and the printed review **R1** (19 A4 pages:
what v1 is, why it feels heavy B1-B8, a proposal C1-C8, every feature
F01-F76, questions Q01-Q40, sketches S1-S4). R1 is with the athlete for
comments.

### I2 — 26 November 2026: build my own session, and how I feel today

What the athlete said, in short:

- **The main use is making my own session.** Example: today is a CAVE day
  and I know I want shoulders, core and legs.
- **Sliders for the mix**: how much the session leans each way, e.g. legs
  60%, core 20-30%, shoulders 10%.
- **A time**: 60, 75, 80, 90 minutes, whatever it is.
- **The app builds the whole exercise list**, and I can still swap, remove
  and replace exercises.
- **Suggestions from what I usually do**: "I really love to have some
  suggestions of what it makes sense to do based on what I'm usually doing."
- **How I feel today matters as much**: "Maybe today was a pull day or a push
  day, but I have a little pain in my elbow, so I would like to skip that and
  replace it with something else."
- **Do not build yet**: log this, and plan the redesign of the whole logic
  and system first.

### I3 — 26 November 2026: redesign the look too

> "I think we also ought to redesign the app. I kind of like the general
> design concept, but I really am not fully convinced of the execution."

Before anything else: an in-depth search for Claude skills (GitHub, blogs,
directories) that would make the design work better. The athlete offered to
download them if needed. Findings: section 8.

---

## 2. Decisions

| ID | Decision | Status | From |
|---|---|---|---|
| D01 | The main way in is **building today's session**: areas, mix, time, then a list to edit, then START. | AGREED | I2 |
| D02 | The mix is set with **sliders**: each area's share of the session. | AGREED | I2 (meaning of a share: V03) |
| D03 | **Time is a target** the builder fills. | AGREED | I2 (options: V05, V06) |
| D04 | Every exercise in the built list can be **swapped, removed or replaced**. | AGREED | I2 |
| D05 | The app **suggests** a mix from what the athlete usually does. | AGREED | I2 (how: V07, V08) |
| D06 | **How I feel today** changes the list: a sore joint takes out what loads it and puts something else in. | AGREED | I2 (joints and levels: V11-V13) |
| D07 | **Plan first, build later.** No app code changes until section 6 says so. | AGREED | I2 |
| D08 | R1's advice to cut BUILD (F24) is **reversed**: the builder is the heart of v2. R1's fixed rotation (C3) becomes at most an input to the suggestion. | PROPOSED | I2 vs R1 |
| D09 | Rebuild on a v2 track and import the history, rather than refactor v1 (R1 C7). | OPEN | Q02 |
| D10 | One set of tags per exercise (areas, pattern, role, joint loads, kit, flags) replaces v1's six overlapping systems (R1 B4). | PROPOSED | R1 B4, needed by D01-D06 |
| D11 | The visual design is redesigned too. The concept stays (LED, dot matrix, Kode Mono, parchment, one orange); the execution changes. | AGREED (concept kept: PROPOSED) | I3 |
| D12 | A few vetted design skills, not a pile: Impeccable, Emil Kowalski's skills, an Apple HIG reviewer. The current design is captured in a DESIGN.md first, so no skill can overwrite the brand (section 8). | PROPOSED | I3 |

---

## 3. Design draft: building today's session

### 3.1 The flow

1. **WHERE**: GYM or HOME. Remembered from last time.
2. **HOW I FEEL**: energy, and any sore joint (3.6). One screen, remembered
   until changed, skipped with one tap when nothing changed.
3. **MIX**: sliders, pre-filled by the suggestion (3.5), each showing its
   minutes as well as its share.
4. **TIME**: 60, 75, 90... (V05).
5. **THE LIST**: built at once. Swipe to swap or take out, + ADD, regenerate
   one area or all of it (3.7).
6. **START**, run, log.

Shortcuts on the same screen: **AGAIN** (the last session of this kind,
rebuilt for today) and **saved mixes** (V19), e.g. "CAVE LEGS DAY: LEGS 60 ·
CORE 30 · SHOULDERS 10, 75 min".

**Target**: from opening the app to START in under 30 seconds and five taps
when the suggestion is taken as it is.

### 3.2 What the builder must know about each exercise

One tag set, filled once per exercise. Most of it can be derived from v1's
data; the joint loads are new.

| Tag | Values (draft) | Example | In v1? |
|---|---|---|---|
| **Areas, weighted** | LEGS, CORE, BACK, PULL, PUSH, SHOULDERS, ARMS, FEET, FINGERS, MOBILITY (V01) | Copenhagen plank: CORE 0.6, LEGS 0.4 | Groups with the main one first, no weights |
| **Pattern** | SQUAT, HINGE, SINGLE-LEG, CALF / FOOT, PUSH (horizontal, vertical), PULL (vertical, horizontal), CARRY, ANTI-EXTENSION, ANTI-ROTATION, ROTATION, FLEXION, LATERAL, SHOULDER CARE, POWER / JUMP, BALANCE, MOBILITY | Dumbbell RDL: HINGE | Partly (protocols, `SAME_MOVEMENT`) |
| **Role** | WARM-UP, SKILL, POWER, MAIN, ACCESSORY, CORE, CARE | Goblet squat heavy: MAIN | Block plus phase, two systems |
| **Joint load** | ELBOW, SHOULDER, WRIST, FINGERS, LOWER BACK, KNEE, HIP, ANKLE, NECK, each NONE / LIGHT / HEAVY | Weighted hanging knee raise: ELBOW HEAVY, FINGERS HEAVY, SHOULDER LIGHT | Fingers only (capacities), plus `hangs` and grip flags |
| **Kit, place** | BAR, RINGS, DUMBBELL, KETTLEBELL, PLATE, BOX, BAND, EDGE...; GYM or HOME | Band face pull: BAND, HOME | Yes (`exercise-tags.ts`, reserve) |
| **Flags** | curls the spine, face down, jumps, on the floor, grips | Russian twist: curls | Partly |
| **Time per set** | from work and rest | 4 x 5 at 150 s: 11 min | Yes (`estimateDuration`) |
| **Your status** | favourite, hidden, pinned (V10) | Prone extension: hidden | Hidden only (`not-picked.ts`) |

### 3.3 How a mix becomes a list (draft rules)

1. **Fixed blocks sit outside the mix**: the warm-up (it depends on the place
   and on what is coming) and, if wanted, a short closing mobility (V04).
2. **Working minutes** = the time picked, minus the fixed blocks, minus
   transitions if they are counted (V06).
3. **Minutes per area** = its share of the working minutes.
4. **Each area fills by pattern, in order.** LEGS: a squat or single-leg main
   lift, a hinge, a single-leg, calf and feet. CORE: hanging or flexion,
   anti-rotation, rotation, lateral. SHOULDERS: care (external rotation, face
   pull), then a press. Within a pattern the pick is the pinned exercise, or
   else the one done least recently. It must also use kit the place has, be
   safe for today's joints, and not be hidden.
5. **Fit**: an exercise that would overrun its area's minutes is passed over
   for a shorter one in the same pattern. Minutes left over go to the next
   exercise that fits, or one more set on a main lift (at most two, as v1's
   BUILD does).
6. **Order**: warm-up, skill and balance, power, main lifts (heaviest
   first), accessories, core, care and mobility. Spine curls come last before
   noon (v1's DAILY rule).
7. **Shown with the list**: total minutes, minutes and share per area, and
   what it adds to the week.

### 3.4 Worked example: GYM, 60 min, LEGS 60 · CORE 30 · SHOULDERS 10

Minutes are v1's own engine estimate (work plus rest, level 1, NORMAL).
Walking between kit is not counted (V06).

| Part | Exercise | Sets | Min |
|---|---|---|---|
| Warm-up (fixed) | Pulse Raiser + Shoulder Prep | 1 x 5 min | 5.5 |
| Warm-up (fixed) | Deep Lunge Drive + Stick | 1 x 5 / side | 0.8 |
| LEGS (budget 32.2) | Goblet Squat — Heavy | 4 x 5 | 11.0 |
| | Dumbbell Romanian Deadlift | 3 x 8 | 7.2 |
| | Split Squat, Forward Shift | 3 x 8 / side | 5.4 |
| | Single-Leg Calf Raise | 3 x 12 / side | 6.6 |
| CORE (budget 16.1) | Weighted Hanging Knee Raise | 3 x 8 | 5.7 |
| | Band Pallof Press | 3 x 10 / side | 5.3 |
| | Russian Twist | 2 x 16 | 3.6 |
| SHOULDERS (budget 5.4) | Band Face Pull | 2 x 15 | 3.2 |
| Left-over fill | Side Plank Hip Dip | 2 x 12 / side | 3.4 |
| | | **Total** | **57.7** |

What the example shows:

- Working time split: LEGS 30.2 (59%), CORE 18.0 (35%), SHOULDERS 3.2 (6%).
  **A small share rounds hard**: at 60 minutes, 10% is about 5 minutes, which
  is one short exercise or nothing. Sliders should show minutes, and probably
  snap in steps of 10%.
- The step-up (6.9 min) did not fit LEGS and the external rotation (4.7) did
  not fit SHOULDERS. Both stay available as swaps.

**The same session with a sore elbow:**

- **GO LIGHT** (heavy elbow loads out): the weighted hanging knee raise hangs
  from the bar and comes out. The lying leg raise (2 x 10, 2.5 min) takes its
  place. The left-over then refills, at most with one more exercise or set.
  Nothing else changes.
- **AVOID** (light loads out too): the RDL and the goblet squat hold weights,
  and the face pull pulls on a band, so all three are swapped as well. The RDL
  could become the good morning with the hands behind the head.

So the level matters (V12). The joint tags in this example are my first
reading and need checking (V14).

### 3.5 Suggestions from what you usually do

Three inputs, each given as a reason in words:

- **Your usual mix**: the average share per area over the last 6-8 weeks of
  sessions of this kind (gym or home).
- **What is due**: areas behind their usual share this week, or not trained
  for longer than usual.
- **Recovery**: climbed yesterday, so FINGERS and PULL go down. Heavy legs two
  days ago, so LEGS goes down. A sore joint lowers the areas that load it.

The result is pre-filled sliders and one line. Example: "Suggested: LEGS 50 ·
CORE 30 · PUSH 20. Pull is at twice its usual share this week and you
climbed yesterday." The athlete moves the sliders from there (V07, V08).

### 3.6 How I feel today

- **Energy**: FRESH / NORMAL / TIRED, or less (R1 Q30, V21).
- **Sore or painful**: tap a joint (V11). Each one is AVOID or GO LIGHT (V12),
  remembered until cleared or for a set number of days (V13).
- **Fingers**: the 0-10 pain rule stays as the safety floor: 6+ removes
  finger work, 3-5 caps it. A healing finger still labels grips, pulls and
  hangs (R1 C4).
- Effect: what is out never appears, in the build, in a swap or in + ADD. The
  list says what changed, e.g. "Elbow: 1 swapped".

### 3.7 Editing the list

- **Swipe**: SWAP (same pattern and area first, then the same area; only
  joint-safe exercises with available kit) and OUT.
- **Reorder** by drag. **Sets** by tap.
- **+ ADD** by area or by search.
- **REGENERATE** one area, or everything. **PIN** an exercise so a
  regenerate keeps it (V10).
- **Keep it**: save the list as a template, or save the mix as a preset (V19).

### 3.8 Where the rest of v1 goes (provisional, pending R1 answers)

- WAKE UP mornings and STRAIGHT BACK after climbing become saved templates
  or presets, one tap each (V20).
- The 24 programme sessions become templates: examples to start from, or
  archived (R1 Q17).
- TODAY becomes the front door of the builder: "Build today", with the
  suggestion pre-filled, AGAIN, and the saved ones.

---

## 4. What v1 already has

| v1 piece | What it does | In v2 |
|---|---|---|
| `custom.ts` BUILD | Place, time (15-90), areas in / out / off taking equal turns, AVOID flags, least recently done, fills the time, up to 2 extra sets | The builder's skeleton. Equal turns become weighted minutes; patterns and joints are added |
| `exercise-tags.ts` | Groups (main first) and kit on every pickable exercise | First draft of areas and kit |
| `reserve.ts` | Exercises by area and place, with caution labels | The pools the builder picks from |
| `alternatives.ts` | SIMILAR and OTHER KIT for swaps | The swap rules, plus joint safety |
| `engine.ts` | Pain check, gates, `estimateDuration` | The safety floor and the minutes |
| `not-picked.ts` | 11 exercises never chosen automatically | The "hidden" status |
| `progression.ts` | Next load from the last one and how it felt | Unchanged in spirit |

**Missing in v1**: weighted mixes, patterns, joint loads, pinned exercises, a
mix suggested from history, sore joints remembered across days.

---

## 5. Open questions

Answer by ID. Short is fine.

**Sliders and time**

- **V01** Which areas go on the sliders? Draft: LEGS, CORE, BACK, PULL, PUSH,
  SHOULDERS, ARMS, FEET, FINGERS, MOBILITY. Is SHOULDERS separate from PUSH?
- **V02** How many areas in one session at most? Draft: all available, about
  four in use.
- **V03** Is a share a share of working time or of sets? Draft: time.
- **V04** Should the warm-up and a closing mobility sit outside the mix,
  added automatically? Draft: yes.
- **V05** Time options: fixed steps (30 / 45 / 60 / 75 / 90 / 105 / 120), or
  a stepper in 5-minute steps?
- **V06** Does "60 minutes" mean 60 on the clock, walking between kit
  included? v1 counts only work and rest.

**Suggestions**

- **V07** Should the sliders start pre-filled with the suggestion, or blank
  with a SUGGEST button?
- **V08** What should the suggestion read: your usual mix, what is due this
  week, recovery after climbing? All three?
- **V09** Variety or progress? One choice is the same main lift per area
  every time for a block (say four weeks) with the rest rotating; the other
  is rotating everything. Loads only progress on lifts you repeat. Draft: a
  fixed main lift, everything else rotates.
- **V10** Can you pin an exercise ("always in when LEGS is in")?

**How I feel**

- **V11** Which joints: elbow, shoulder, wrist, fingers, lower back, knee,
  hip, ankle, neck? Left and right apart?
- **V12** Two levels (AVOID, GO LIGHT) or one?
- **V13** How long is a sore joint remembered: today only, until cleared, or
  a number of days?
- **V14** Joint loads per exercise: I tag a first reading from the form
  guides, you correct it. OK?
- **V21** Energy: does TIRED mean fewer sets, lower intensity, or both? Or
  should energy go away and the time do that job?

**The list**

- **V15** Gym kit: assume everything is there, or tick what is missing or
  busy before building?
- **V16** The climbing-specific doses (balance and power at full stretch in
  every session, the lunge drive): automatic, optional, or gone?
- **V17** Can FINGERS be a slider area at the gym (hangs), given the healing
  rule?
- **V18** After building: the list first (to read and edit), or straight to
  START with an EDIT button?
- **V19** Do you want saved mixes, like "CAVE LEGS DAY: LEGS 60 · CORE 30 ·
  SHOULDERS 10, 75 min"?
- **V20** WAKE UP mornings and STRAIGHT BACK: saved templates, builder
  presets, or the builder with HOME and 15 minutes?
- **V22** Should an area also say how: HEAVY (few reps, long rest) or VOLUME
  (more reps, shorter rest)?

**The look (I3)**

- **V23** "Not convinced of the execution": which parts? For example: the LED
  numerals, the dot paper, the outlined cards, the density, the type sizes,
  the tab bar, the colours, the animations. Name two or three screens that
  bother you most.
- **V24** Which skills to install (section 8)? Draft: Impeccable, Emil
  Kowalski's skills, an Apple HIG reviewer.
- **V25** How to install them: committed to the repo's `.claude/skills/`
  (every cloud session has them, where the licence allows), installed on
  your Mac only, or enabled as claude.ai plugins?
- **V26** Is there an app (any app) whose look or feel you want 7Bit closer
  to? Screenshots welcome.

---

## 6. Plan of work

Planning first. Building starts only once P1-P4 are agreed.

| Step | Output | Status |
|---|---|---|
| **P0** | R1 comments back; answers to V01-V22; section 2 filled in | WAITING ON THE ATHLETE |
| **P1** | **The exercise sheet**: every exercise with areas, pattern, role, joint loads, kit and flags, as a table to correct (`docs/v2/`) | NEXT, once V01, V11, V12 and V14 are answered |
| **P2** | **Builder rules** written out, with four worked examples: the gym legs day, the same with a sore elbow, home 30 minutes, after climbing | After P1 |
| **P2b** | **Design tools and brand anchor**: install the agreed skills (V24, V25); capture today's visual system in `DESIGN.md`; a scored critique of every v1 screen at phone size | After V23-V25; can run beside P1-P2 |
| **P3** | **Screen flows** and the R2 sketches: TODAY, how I feel, mix, time, list, run, log | After P2 and P2b |
| **P4** | **Data and migration**: what v1's history (sessions, loads, climbs, tests) becomes in v2 | With P3 |
| **P5** | Build order, then building | After P1-P4 are agreed |

---

## 7. Changes to R1

- **F24 BUILD + presets**: R1 said CUT. I2 makes the builder the core (D08).
- **F25 Packs**: still CUT; + ADD by area and saved mixes cover them.
- **C3 The week is a rotation**: no longer the way in. At most an input to
  the suggestion (D08).
- **S1 TODAY sketch**: becomes "Build today" with the suggestion, AGAIN and
  saved mixes (R2).
- **Q05 Who decides**: partly answered by I2. The app suggests, the athlete
  sets the mix.
- **Q33 The look**: I3 says keep the concept, change the execution (D11).

---

## 8. Design skills (research, 26 November 2026)

Searched: GitHub (stars, licence and last push read from GitHub search on
26 November), eight blog roundups, the skill directories, and claude.ai's
plugin catalog. Each shortlisted README was read. No skill code was run or
installed.

### What 7Bit needs from a skill

It must improve an **existing app with its own identity**, on a **phone**
(Capacitor webview on iOS), through **review of rendered screens**. A skill
that generates a new aesthetic works against that.

### The candidates

| Skill | Stars | Licence | Last push | What it is | Verdict |
|---|---|---|---|---|---|
| **Impeccable** (`pbakaus/impeccable`) | 117k | Apache-2.0 | 26 Nov | 24 commands: critique (scored UX review), audit (P0-P3), polish, harden, clarify, adapt, quieter, bolder, distill... `document` writes a DESIGN.md of the existing system. `PRODUCT.md` takes Platform: ios, so the commands follow Apple HIG. A 62-rule detector, no LLM. | **Take.** The best fit: built for refining existing screens, with a brand anchor. Turn telemetry off. Skip `live`: it can run the agent with sandboxing off. It downloads an engine binary, and its hooks run even when commands are denied. |
| **Emil Kowalski's skills** (`emilkowalski/skills`) | 60k | MIT | 15 Nov | Motion and interaction: `emil-design-eng`, `review-animations`, `improve-animations`, `gestures`, `mobile-native` (safe areas, the 100vh bug, tap highlight, input zoom), `break-ui`, `learn-taste`. | **Take.** It fixes feel, not look, so it cannot fight the brand. `mobile-native` is exactly the webview-on-iPhone problem. |
| **Apple HIG reviewer** (`dickwu/apple-design-skill`) | 3.9k | none stated (the HIG text is Apple's) | 26 Nov | A reviewer grounded in 123 HIG pages: tab bars, sheets, safe areas, control sizes with numbers, accessibility as blocking. Modes for navigation, forms, onboarding. | **Take, as a reviewer only.** It pushes Apple's conventions; the brand wins where they clash. No licence, so install it locally rather than committing it. |
| Interface Design (`Dammyjay93/interface-design`) | 6k | MIT | 20 Jun | App and dashboard UI. Remembers decisions in `.interface-design/system.md`; `design-review` and `design-deslop`. | Optional. It overlaps Impeccable's DESIGN.md. Pick one. |
| UI UX Pro Max (`nextlevelbuilder/ui-ux-pro-max-skill`) | 155k | MIT | 26 Nov | A searchable library of styles, palettes and font pairings, plus a generator that writes a new design system. Python, standard library only, no network (per its README). Upsells a paid tier. | **Skip for now.** A generator for new products. It would propose a new look, not refine this one. |
| Taste (`Leonxlnx/taste-skill`) | 122k | MIT | 26 Nov | v2 builds company websites: deals a palette and fonts by trade, eleven hero layouts. Node scripts, a Stop hook, network fetches. v1 (used for the v28 and v31 reviews, with its app-screens reference) survives as `design-taste-frontend-v1`. | **Skip v2.** Websites only, with its own aesthetic. |
| Anthropic frontend-design (`anthropics/skills`) | 201k (whole repo) | per skill | 16 Nov | One file: plan, critique, build, distinctive web UI. | **Skip.** Web-first, and it lists "monospace for small data labels" and "warm cream background" as signs of generated UI. That describes 7Bit's identity. |
| Designer Skills (`Owl-Listener/designer-skills`) | 3.5k | MIT | 19 Nov | 273 skills and 76 commands in 33 plugins. Has a platform audit and a screen critique. | **Skip.** The size is the problem v1 has. |
| Vercel agent skills (`vercel-labs/agent-skills`) | 35k | none stated | 20 Nov | Vercel's web interface guidelines, React practices. | Not read in detail. Web standards; may help the Next.js side later. |

### Already available, nothing to install

- **This cloud session** has Anthropic's design plugin: `design-critique`,
  `design-system`, `ux-copy`, `accessibility-review`, `user-research`.
- **claude.ai's plugin catalog** offers, among others: Anthropic
  `frontend-design` (same caveat as above); **UI Design Review** (UXKIN,
  community: reviews rendered phone screens, fixes "in your app's own style",
  compares with real iOS app screens through its own MCP server); **UI/UX
  Behaves** (community: rules for every screen state, such as empty,
  invalid, undo, grounded in Norman and Nielsen).

### How to use them safely

- A skill runs with the agent's permissions. Read its SKILL.md and scripts
  before installing, pin a version, turn telemetry off, and use no hooks
  you do not need.
- **The brand goes first.** Run `/impeccable document` (or write DESIGN.md by
  hand) before any steering command, and keep CLAUDE.md's styling rules as
  the authority, as the taste-skill reviews did in v28 and v31.
- **Few, not many.** Three skills with distinct jobs: review and polish
  (Impeccable), feel and motion (Emil), platform conventions (HIG).
