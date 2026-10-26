// =============================================================================
// data-cave.ts — CAVE mode: full gym sessions
// Equipment: hangboard, pull-up bar, TRX rings, kettlebells, dumbbells and
//            plates, weighted pull-up harness, boxes, bands, a mat, the
//            bouldering wall. No bench, no barbell to press, no cables.
//
// Five sessions: three for a day without climbing, two for straight after
// bouldering.
//   01 STRONG      — no climbing, fresh: max hangs, heavy weighted pull-ups,
//                    the one-arm path, front lever.
//   02 PULL + PUSH — after bouldering: weighted pull-ups at RPE 8, band-assisted
//                    one-arms, pushing, then the trunk.
//   03 LEGS + BACK — after bouldering: legs, the lower back, toes, abs and
//                    obliques, hips. Nothing loads the fingers.
//   04 POWER       — no climbing: explosive pulling and pushing, pull-up
//                    volume, rows and presses for size, light hangs only.
//   05 FULL BODY   — no climbing: power, a heavy squat and hinge, push, row,
//                    a carry. No hangboard, so it never competes with 01.
// 04 and 05 always carry a bit of core, a balance drill and power at full
// stretch (end-range strength).
//
// Free bouldering is the athlete's own and stays unprogrammed. The test
// battery lives in its own TEST tab (data-assess.ts).
//
// Order inside every session is fixed by neurological cost: the fingers and the
// nervous system get the session while they are fresh, and the conditioning
// work goes last where fatigue costs nothing.
// =============================================================================

import type { Circuit, Exercise } from './types';
import { oneArmPath, assistedOneArm, oneArmNegative, oneArmShrug } from './data-oap';
import { SIDE_PLANK_DIP } from './data-daily';
import { SL_BALANCE } from './data-extras';

export const WARMUP_PULSE = {
  id: 'cave-warmup-pulse',
  name: 'Pulse Raiser + Shoulder Prep',
  capacities: ['shoulder' as const],
  block: 'WARMUP' as const, intensity: 'EASY' as const,
  sets: 1, work: 300, unit: 'sec' as const, restSec: 30,
  load: { kind: 'bodyweight' as const, text: 'No load' },
  fixed: true,
  progression: 'Never progressed. Preparation, not training.',
  protocolId: 'warmup',
  note: 'Pulse raiser, band external rotations, scapular pull-ups, easy traversing.',
  form: {
    setup: 'Band anchored at elbow height. Space to move.',
    execution: 'Three minutes raising the pulse, then 15 band external rotations per side, 10 scapular pull-ups, 5 minutes of easy traversing or jugs.',
    cue: 'Warm and switched on, not tired. You should finish wanting to climb.',
    breathing: 'Nasal, unhurried.',
    mistakes: 'Treating it as optional because you feel fine. Turning it into a session.',
  },
};

export const WARMUP_FINGERS = {
  id: 'cave-warmup-fingers',
  name: 'Progressive Finger Loading',
  capacities: ['crimp' as const, 'openhand' as const],
  block: 'WARMUP' as const, intensity: 'EASY' as const,
  sets: 3, work: 10, unit: 'sec' as const, restSec: 60,
  load: { kind: 'percent-max' as const, value: 50, text: 'Jug > 30mm > 20mm, 40-60%' },
  fixed: true,
  progression: 'Never progressed.',
  protocolId: 'warmup',
  form: {
    setup: 'Biggest hold first, stepping down in size. Feet on the floor to control load.',
    execution: 'Ten seconds on, sixty off, three times.',
    cue: 'The last warm-up hang is the readiness check. Tender or sharp means the session gets downgraded, today, without negotiation.',
    breathing: 'Normal throughout.',
    mistakes: 'Skipping straight to the working load.',
  },
};

// Shared between sessions: one id, one load history.

export const PUSH_DIP: Exercise = {
  id: 'addon-pushup',
  name: 'Push-Ups / Ring Dips',
  capacities: ['press', 'shoulder'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 10, unit: 'reps', restSec: 90,
  load: { kind: 'bodyweight', text: 'Bodyweight. Add a pack or a belt once three sets of twelve are easy.' },
  progression:
    'Reps to 12 across all three sets, then move up the variation ladder before '
    + 'you add any weight. Range before load on a pressing pattern you have barely trained.',
  protocolId: 'strength-endurance',
  note: 'Wrists sore: push-ups on fists, dumbbells or push-up handles, so the wrist stays straight. Rings and dips already keep it neutral.',
  variations: [
    { minLevel: 1, name: 'Push-Ups' },
    { minLevel: 2, name: 'Ring Push-Ups' },
    { minLevel: 4, name: 'Ring Dips' },
    { minLevel: 6, name: 'Weighted Ring Dips', load: 'Belt or pack, RPE 8' },
  ],
  form: {
    setup: 'Push-ups: hands under the shoulders, body one straight line from heels to crown. Rings: set just above floor height, shoulders packed down. Dips: rings at hip height, arms locked, ribs down.',
    execution: 'Lower with the elbows tracking back at about 45 degrees from the ribs, chest to the floor or to the rings, then press to full lockout. On rings, finish each rep by turning the rings out until the palms face forward.',
    cue: 'Climbing is two hours of pulling and zero pressing, and the shoulder pays for that imbalance long before the fingers do. This is the single most useful thing in the session even though it feels like the least climbing-specific.',
    breathing: 'Inhale down, exhale on the press.',
    mistakes: 'Hips sagging. Elbows flaring to 90 degrees. On dips, dropping below the point where the shoulder stays packed - a deep dip loads the front of the shoulder hard and is not worth the extra range. Chasing the harder ring variation before the easier one is clean.',
  },
};

export const RUSSIAN_TWIST: Exercise = {
  id: 'addon-russian-twist',
  name: 'Russian Twist',
  capacities: ['tension'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 2, work: 16, unit: 'reps', restSec: 60,
  load: { kind: 'added-kg', text: 'A plate or dumbbell held at the chest, or none to start' },
  progression:
    'Sixteen slow reps with a straight back, then feet up, then add a plate in '
    + '2.5kg steps. Slower before heavier.',
  protocolId: 'trunk-hypertrophy',
  note: 'Left plus right is 2 reps. Tall and slow: the obliques do the turning, not the arms.',
  variations: [
    { minLevel: 1, name: 'Russian Twist - Feet Down' },
    { minLevel: 3, name: 'Russian Twist - Feet Up' },
    { minLevel: 5, name: 'Weighted Russian Twist - Feet Up' },
    { minLevel: 7, name: 'Weighted Russian Twist - Feet Up, 1s Pause' },
  ],
  form: {
    setup: 'Sit with knees bent and heels on the floor. Lean back to about 45 degrees with the chest up and the lower back straight, not rounded into a C. Plate held at the chest in both hands.',
    execution: 'Turn the ribcage and the plate together to one side until the plate is beside the hip, then to the other. Move slowly. The pelvis stays still; the rotation comes from the ribs and the middle of the back.',
    cue: 'After bouldering the spine is warm, which makes this the place to load the twist. A straight back and a slow turn make the obliques work harder than a fast swing, because speed lets momentum do the turning.',
    breathing: 'Exhale as you turn to each side.',
    mistakes: 'Rounding the lower back. Swinging the plate with the arms while the chest faces forward. Going fast. Tapping the floor by bending sideways instead of turning.',
  },
};

export const COPENHAGEN: Exercise = {
  id: 'home-copenhagen',
  name: 'Copenhagen Plank',
  capacities: ['tension', 'legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 2, work: 20, unit: 'sec', restSec: 60,
  load: { kind: 'bodyweight', text: 'Bodyweight' },
  progression: 'Bent knee on the support, then the full straight-leg version, then add time to 30s.',
  protocolId: 'tension-iso',
  perSide: true,
  note: 'Adductor strength. Drop knees, bridging and knee health all live here.',
  form: {
    setup: 'Side plank on the forearm, top leg resting on a box at knee or ankle height.',
    execution: 'Lift the hips so the body is a straight line, with the bottom leg lifted toward the top one. Hold.',
    cue: 'The adductors do a lot of work in climbing and almost never get trained directly. This is the fix.',
    breathing: 'Steady.',
    mistakes: 'Hips sagging. Rolling the chest toward the floor.',
  },
};

export const DATA_CAVE: Circuit[] = [
  {
    id: 'cave-01', circuitNum: '01',
    title: 'STRONG', subtitle: 'no climbing - fingers - pull',
    focus: 'Raise the ceiling: peak finger force and maximal pulling, both fresh.',
    capacities: ['crimp', 'pull', 'tension'],
    illustration: 'maxhangs.svg',
    duration: 75,
    recoveryHours: 48,
    note:
      'The session for a day you skip bouldering. Every set here is meant to be hard '
      + 'and well rested. If you are rushing, cut an exercise, not the rest.',
    exercises: [
      WARMUP_PULSE,
      { ...WARMUP_FINGERS, sets: 4 },
      {
        id: 'cave-max-hang',
        name: 'Max Hang — Half-Crimp 20mm',
        capacities: ['crimp'],
        block: 'PRIMARY', intensity: 'MAX',
        sets: 4, work: 10, unit: 'sec', restSec: 180,
        load: { kind: 'percent-max', value: 88, text: '20mm, 85-90% of tested 10s max' },
        progression: 'All four sets clean at 10s, then add 1-2kg next session.',
        protocolId: 'max-hang',
        note: 'Twenty millimetres, always. Smaller edges concentrate load over a shorter contact area and are not a testing tool for fingers that are complaining. Any sharpness, tenderness or joint ache: stop the session and do DENSITY instead.',
        variations: [
          { minLevel: 1, name: 'Half-Crimp 20mm — Build', load: 'Feet assisted. 10s at RPE 7: comfortably hard, never maximal. Live here 6-8 weeks.' },
          { minLevel: 3, name: 'Half-Crimp 20mm — Bodyweight', load: 'Bodyweight or light assist, 10s at RPE 8' },
          { minLevel: 4, name: 'Half-Crimp 20mm — Weighted', load: '20mm + weight, 85-90% of tested 10s max' },
          { minLevel: 6, name: 'Half-Crimp 20mm — Heavy', load: '20mm at 140%+ bodyweight (+25kg at 62kg)' },
          { minLevel: 7, name: 'Half-Crimp 15mm', load: '15mm. Only past 150% on 20mm, and only after a quiet season.' },
        ],
        form: {
          setup: 'Second knuckles at roughly 90 degrees, first knuckles extended, thumb off. Elbows slightly bent, shoulders down and back, ribs down, glutes engaged.',
          execution: 'Ten seconds, then step off deliberately. Stop the set when the position degrades, not when the timer says so.',
          cue: 'Pull the edge toward you. The body is a plank hanging from the fingers, not a sack.',
          breathing: 'Breathe through it.',
          mistakes: 'Drifting into full crimp or open drag under fatigue. Locked elbows. Adding load before the current load is clean.',
        },
      },
      {
        id: 'cave-weighted-pullup',
        name: 'Weighted Pull-Ups',
        capacities: ['pull'],
        block: 'PRIMARY', intensity: 'MAX',
        sets: 4, work: 4, unit: 'reps', restSec: 180,
        load: { kind: 'added-kg', text: 'RPE 8-9 — a load leaving 1-2 reps in reserve' },
        progression:
          'When all four sets hit 4 clean reps, add 2kg. This is the single highest-value '
          + 'strength lift in the programme while your weighted pull-up sits under 165% bodyweight.',
        protocolId: 'max-strength',
        variations: [
          { minLevel: 1, name: 'Pull-Ups — Bodyweight', load: 'Bodyweight, 4-5 hard reps' },
          { minLevel: 2, name: 'Pull-Ups — Slow Eccentric', load: 'Bodyweight, 4s lower' },
          { minLevel: 4, name: 'Weighted Pull-Ups', load: 'Belt or pack, RPE 8-9' },
          { minLevel: 6, name: 'Weighted Pull-Ups — Heavy', load: '+20% bodyweight or more' },
        ],
        form: {
          setup: 'Full dead hang, pronated grip just outside shoulder width. Weight on a belt hanging between the legs, or a loaded pack.',
          execution: 'Pull elbows down and back until the chin clears the bar, chest leading. Lower under control to a complete dead hang every rep.',
          cue: 'Elbows to your back pockets. Start each rep from a genuine dead hang or you are training half a movement.',
          breathing: 'Exhale on the pull, inhale on the descent.',
          mistakes: 'Kipping. Stopping short of a dead hang. Choosing a load that turns four reps into a grinding set of eight.',
        },
      },
      // One-arm pull-up path, fresh. Gated rungs appear as the tested weighted
      // pull-up clears them; see data-oap.ts.
      oneArmShrug('cave01-oap-shrug'),
      assistedOneArm('cave01-oap-assisted', 'cave01-oap-path', 'band'),
      oneArmNegative('cave01-oap-negative'),
      {
        id: 'cave-lockoff',
        name: 'Lock-Off Ladder',
        capacities: ['pull'],
        hangs: true,
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 15, unit: 'sec', restSec: 120,
        load: { kind: 'bodyweight', text: 'Bodyweight, assisted or weighted as needed' },
        progression: 'Add 2s per position, then remove assistance, then add weight.',
        protocolId: 'lock-off',
        perSide: true,
        note: '5s at 120 degrees, 5s at 90, 5s at 60. One continuous descent per set.',
        form: {
          setup: 'Bar or rings. Pull to the top, then lower into the first hold position.',
          execution: 'Hold five seconds at each of three elbow angles on the way down. Use the free hand lightly on the wrist for one-arm versions.',
          cue: 'Climbing pulling is mostly isometric and position-specific. Train the angle where you actually fail: usually 90 degrees.',
          breathing: 'Keep breathing through the holds.',
          mistakes: 'Sinking through positions instead of holding them. Shrugging into the ears.',
        },
      },
      {
        id: 'cave-front-lever',
        name: 'Front Lever Progression',
        capacities: ['tension'],
        hangs: true,
        block: 'SECONDARY', intensity: 'HARD',
        sets: 4, work: 10, unit: 'sec', restSec: 90,
        load: { kind: 'bodyweight', text: 'Hardest progression you can hold with a flat lower back' },
        progression: 'Hold 4 x 12s clean, then move to the next progression and reset to 8s.',
        protocolId: 'tension-iso',
        variations: [
          { minLevel: 1, name: 'Tuck Front Lever' },
          { minLevel: 3, name: 'Advanced Tuck Front Lever' },
          { minLevel: 5, name: 'One-Leg Front Lever' },
          { minLevel: 6, name: 'Straddle Front Lever' },
          { minLevel: 7, name: 'Full Front Lever' },
        ],
        form: {
          setup: 'Hang from a bar or rings, arms straight, shoulders depressed and protracted slightly.',
          execution: 'Pull the body to horizontal in your chosen progression and hold. Lower back stays flat against an imaginary wall.',
          cue: 'Push the bar away with straight arms rather than pulling. Ribs down, glutes squeezed, pelvis tucked.',
          breathing: 'Short controlled breaths. Do not hold your breath for the whole set.',
          mistakes: 'Arching the lower back, which makes the hold easier and trains nothing. Bent arms. Chasing the next progression before the current one is clean.',
        },
      },
      {
        id: 'home-leg-raise',
        name: 'Hanging Leg Raise',
        capacities: ['tension'],
        hangs: true,
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 8, unit: 'reps', restSec: 90,
        load: { kind: 'bodyweight', text: 'Bodyweight, slow and controlled' },
        progression: 'Knees to chest, then straight legs to horizontal, then toes to bar, then slow lowering with a 3s eccentric.',
        protocolId: 'tension-iso',
        variations: [
          { minLevel: 1, name: 'Hanging Knee Raise' },
          { minLevel: 3, name: 'Hanging Straight Leg Raise' },
          { minLevel: 5, name: 'Toes to Bar' },
          { minLevel: 6, name: 'Toes to Bar with 3s Lower' },
        ],
        form: {
          setup: 'Dead hang, shoulders packed before the first rep.',
          execution: 'Raise the legs under control, pause at the top, lower slowly without swinging. Reset the swing before the next rep rather than using it.',
          cue: 'Hip flexor strength with a locked trunk is what keeps your feet on the wall when it steepens. Speed defeats the purpose.',
          breathing: 'Exhale on the way up.',
          mistakes: 'Swinging into each rep. Letting the shoulders go passive at the bottom.',
        },
      },
      {
        id: 'cave-band-er',
        name: 'Band External Rotation',
        capacities: ['shoulder'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 2, work: 15, unit: 'reps', restSec: 45,
        load: { kind: 'band', text: 'Light band — never to failure' },
        progression: 'Add reps to 20, then a slightly heavier band. Never heavy.',
        protocolId: 'prehab',
        perSide: true,
        form: {
          setup: 'Band anchored at elbow height. Elbow tucked to the ribs at 90 degrees, towel under the armpit if that helps hold position.',
          execution: 'Rotate the forearm outward, keeping the elbow pinned. Slow return.',
          cue: 'Climbing loads the internal rotators relentlessly and the external rotators barely at all. This is the balance payment.',
          breathing: 'Exhale on the rotation out.',
          mistakes: 'Elbow drifting from the ribs. Using body English. Going heavy — this is maintenance, not a lift.',
        },
      },
    ],
    substitutes: [oneArmPath('cave01-oap-path')],
  },
  {
    id: 'cave-05', circuitNum: '02',
    title: 'PULL + PUSH', subtitle: 'after bouldering - pull - press - core',
    focus: 'Pulling power on top of the climbing, the pushing it never trains, then the trunk.',
    capacities: ['pull', 'press', 'tension', 'shoulder'],
    illustration: 'dumbbell.svg',
    duration: 40,
    recoveryHours: 12,
    stacksOnSession: true,
    note:
      'Runs straight after a boulder session, while you are already warm. No finger '
      + 'loading: the bouldering was the finger session. Pulling first while there is '
      + 'something left, then the pushing climbing never trains, then the trunk. If you '
      + 'are too cooked, pick TIRED: it keeps every exercise and takes a set off each.',
    exercises: [
      {
        id: 'addon-weighted-pullup',
        name: 'Weighted Pull-Ups',
        capacities: ['pull'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 4, unit: 'reps', restSec: 150,
        load: { kind: 'added-kg', text: 'RPE 8 — two reps in reserve. You are pre-fatigued, so go lighter than you think.' },
        progression:
          'Bodyweight sets of 4 first. Once four sets of four are easy, start adding '
          + '2kg at a time. This is the lift that carries a one-arm pull-up for the '
          + 'first year: a two-arm pull-up with about half your bodyweight added is '
          + 'roughly the strength of one one-arm rep.',
        protocolId: 'max-strength',
        // SECONDARY, not PRIMARY: level adds no sets here. The fresh,
        // level-scaled weighted pull-up is in CAVE 01 STRONG; after two
        // hours of bouldering, extra sets buy fatigue rather than strength.
        variations: [
          { minLevel: 1, name: 'Pull-Ups — Bodyweight', load: 'Bodyweight, 4 clean reps, stop well short of failure' },
          { minLevel: 2, name: 'Pull-Ups — 4s Eccentric', load: 'Bodyweight, four seconds down' },
          { minLevel: 4, name: 'Weighted Pull-Ups', load: 'Belt or pack, RPE 8' },
          { minLevel: 6, name: 'Weighted Pull-Ups — Heavy', load: '+20% bodyweight or more' },
        ],
        form: {
          setup: 'Full dead hang, pronated grip just outside shoulder width. Harness and plates for the weighted version.',
          execution: 'Pull elbows down and back, chest leading, chin clearly over. Lower under control to a complete dead hang every rep.',
          cue: 'Four reps means four good reps. After bouldering you have less than you think, and a grinding fifth rep buys nothing.',
          breathing: 'Exhale on the pull.',
          mistakes: 'Treating this as a finisher to burn out on. It is a strength set that happens to come late in the day.',
        },
      },
      { ...oneArmShrug('addon-oap-shrug'), sets: 1 },
      assistedOneArm('addon-oap-assisted', 'addon-oap-path', 'band'),
      PUSH_DIP,
      {
        id: 'addon-mountain-climber',
        name: 'Spiderman + Cross-Body Mountain Climber',
        capacities: ['tension'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 3, work: 16, unit: 'reps', restSec: 60,
        load: { kind: 'bodyweight', text: 'Bodyweight. Slow, hips at plank height' },
        progression:
          'Sixteen slow reps with level hips on every set, then a two-second hold at each '
          + 'elbow, then feet in the TRX straps.',
        protocolId: 'dynamic-core',
        note:
          'One rep is one knee: to the same elbow, back, to the opposite elbow, back. '
          + 'Alternate legs. Wrists sore: plank on fists or dumbbell handles, or drop to the forearms.',
        variations: [
          { minLevel: 1, name: 'Spiderman + Cross-Body Mountain Climber' },
          { minLevel: 3, name: 'Spiderman + Cross-Body, 2s Holds' },
          { minLevel: 5, name: 'TRX Spiderman + Cross-Body', load: 'Feet in the TRX straps, hands on the floor or on handles' },
        ],
        form: {
          setup: 'High plank, hands under the shoulders, body straight heels to head, glutes on. For the wrists: fists, dumbbells on their sides, or forearms. TRX version: toes in the foot cradles at mid-shin height.',
          execution: 'Draw the right knee outside the right arm toward the right elbow, return, then under the body toward the left elbow, return. Then the left leg. Hips stay at plank height and level throughout.',
          cue: 'This is the feet-on move: the hips and lower abs pulling a knee up and in while the arms hold. Outside the arm is a high step with the hip open; across the body is a drop-knee. Slow, it is not cardio.',
          breathing: 'Exhale as the knee comes in.',
          mistakes: 'Going fast and bouncing. Hips piking up or sagging. Shoulders drifting behind the hands. Bent wrists grinding through pain when a fist would do.',
        },
      },
      {
        id: 'addon-hanging-oblique',
        name: 'Hanging Oblique Knee Raise',
        capacities: ['tension'],
        hangs: true,
        block: 'SECONDARY', intensity: 'HARD',
        sets: 2, work: 8, unit: 'reps', restSec: 90,
        load: { kind: 'bodyweight', text: 'Bodyweight. Ab straps if the grip or fingers complain.' },
        progression:
          'Eight controlled reps with no swing on both sets, then half wipers with bent '
          + 'knees, then full windshield wipers.',
        protocolId: 'dynamic-core',
        note: 'Left plus right is 2 reps. Kept to two sets on purpose while the fingers are symptomatic.',
        variations: [
          { minLevel: 1, name: 'Hanging Oblique Knee Raise' },
          { minLevel: 4, name: 'Half Windshield Wiper', load: 'Knees bent, legs up at the bar, rotate side to side' },
          { minLevel: 6, name: 'Windshield Wiper', load: 'Legs straight at the bar, rotate side to side' },
        ],
        form: {
          setup: 'Hang from a bar, shoulders engaged, not passive. After bouldering, elbow slings or ab straps take the fingers out of it: the exercise is the trunk, not the grip.',
          execution: 'Draw both knees up and across toward one shoulder, lower under control, then the other side. Wipers: legs up at the bar, lower them to one side, return through the top, then the other side.',
          cue: 'Hörst calls wipers his favourite climbing core exercise: it is the position of cutting loose and getting the feet back on while hanging from the hands.',
          breathing: 'Exhale as the knees come up.',
          mistakes: 'Swinging to generate the lift. Dead shoulders. Grinding through a finger that is complaining when straps would remove it.',
        },
      },
      RUSSIAN_TWIST,
      {
        id: 'addon-cuff',
        name: 'Band External Rotation',
        capacities: ['shoulder'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 2, work: 15, unit: 'reps', restSec: 45,
        load: { kind: 'band', text: 'Light band — never to failure' },
        progression: 'Reps to 20, then a marginally heavier band.',
        protocolId: 'prehab',
        perSide: true,
        form: {
          setup: 'Band at elbow height, elbow tucked to the ribs at 90 degrees.',
          execution: 'Rotate the forearm outward keeping the elbow pinned, slow return.',
          cue: 'Two minutes. Do it on the way out of the gym.',
          breathing: 'Exhale rotating out.',
          mistakes: 'Skipping it because the session is nominally over.',
        },
      },
    ],
    substitutes: [oneArmPath('addon-oap-path')],
  },
  {
    id: 'cave-06', circuitNum: '03',
    title: 'LEGS + BACK', subtitle: 'after bouldering - legs - lower back - abs',
    focus: 'Everything climbing leaves alone: legs, the lower back, the toes, and the abs that curl.',
    capacities: ['legs', 'tension', 'mobility'],
    illustration: 'squats.svg',
    duration: 30,
    recoveryHours: 12,
    stacksOnSession: true,
    note:
      'Runs straight after a boulder session, the alternative to PULL + PUSH. Nothing '
      + 'here loads the fingers or asks for grip, so it is the one to pick on a day they '
      + 'are complaining. Legs and back first while there is strength left, then the '
      + 'feet, then the trunk, then the hips.',
    exercises: [
      {
        id: 'addon-goblet-squat',
        name: 'Goblet Squat',
        capacities: ['legs'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 10, unit: 'reps', restSec: 90,
        load: { kind: 'added-kg', value: 12, text: 'Kettlebell or dumbbell at the chest. Bodyweight until the depth is honest.' },
        progression:
          'Full depth with a flat back for two sets of twelve first. Then a 3s pause in '
          + 'the hole, then a heavier bell. Legs recover fast - this is the one place in '
          + 'the programme you can be impatient.',
        protocolId: 'strength-endurance',
        variations: [
          { minLevel: 1, name: 'Bodyweight Squat' },
          { minLevel: 2, name: 'Goblet Squat' },
          { minLevel: 4, name: 'Goblet Squat — 3s Pause' },
          { minLevel: 6, name: 'Goblet Squat — Heavy' },
        ],
        form: {
          setup: 'Feet shoulder-width, toes turned slightly out. Bell held at the chest by the horns, elbows inside the knees.',
          execution: 'Sit down between the hips until the hip crease passes the knee, chest tall, heels planted. Drive up through the whole foot. The bell at the chest is what lets you stay upright.',
          cue: 'Climbers get strong at pulling and at one-legged rockovers and stay weak at loaded knee flexion. Two sets is a maintenance dose that costs you nothing on the wall tomorrow.',
          breathing: 'Big breath in at the top, brace, exhale on the way up.',
          mistakes: 'Cutting depth to move weight. Heels lifting - park them on a 2cm plate if the ankles are stiff. Knees collapsing inward. Rounding the lower back at the bottom.',
        },
      },
      {
        id: 'legs-back-extension',
        name: '45-Degree Back Extension',
        capacities: ['tension', 'legs'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 3, work: 10, unit: 'reps', restSec: 90,
        load: { kind: 'added-kg', value: 0, text: 'Bodyweight, then a plate held at the chest' },
        progression:
          'Three sets of ten with a one-second hold at the top on bodyweight. Then hold a '
          + 'plate at the chest and add 2.5kg once all three sets are clean again.',
        protocolId: 'back-strength',
        note: 'Your weak point, so this is the loaded version of the prone extension in DAILY 02. No bench: a partner on the ankles over a box works.',
        variations: [
          { minLevel: 1, name: '45-Degree Back Extension' },
          { minLevel: 3, name: '45-Degree Back Extension, 2s Hold' },
          { minLevel: 5, name: 'Weighted 45-Degree Back Extension' },
        ],
        form: {
          setup: 'Hip pad just below the hip bones, so the hips can hinge freely. Ankles locked under the rollers. Arms crossed at the chest, or a plate held there.',
          execution: 'Lower the torso by hinging at the hips with the back flat until you feel the hamstrings stretch. Rise until the body is a straight line from heels to head, squeeze the glutes, hold one second. Do not go past straight.',
          cue: 'The extensors are trained here by holding the spine rigid while the hips move it through a big range against a growing load. That is what turns a weak lower back into a strong one, without ever bending it under load.',
          breathing: 'Inhale on the way down, exhale on the way up.',
          mistakes: 'Hyperextending at the top. Rounding at the bottom to get lower. Pad too high, which blocks the hinge and turns it into a lower-back crunch. Swinging up with momentum.',
        },
      },
      {
        id: 'legs-sl-rdl',
        name: 'Single-Leg Romanian Deadlift',
        capacities: ['legs', 'tension'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 8, unit: 'reps', restSec: 60,
        load: { kind: 'added-kg', value: 8, text: 'Dumbbell in the hand opposite the standing leg' },
        progression: 'Eight steady reps a side with a flat back, then a heavier dumbbell in 2kg steps.',
        protocolId: 'back-strength',
        perSide: true,
        note: 'Per leg. Hamstrings, glutes and single-leg balance: a high step, slowed down.',
        variations: [
          { minLevel: 1, name: 'Single-Leg Romanian Deadlift' },
          { minLevel: 4, name: 'Single-Leg Romanian Deadlift, 3s Lower' },
        ],
        form: {
          setup: 'Stand on one leg with a soft knee, dumbbell in the opposite hand, other hand free for balance or on a rack.',
          execution: 'Hinge at the hip, reaching the dumbbell toward the floor while the free leg extends straight back, until the torso is near parallel or the hamstring stops you. Back flat, hips square. Drive the hip forward to stand.',
          cue: 'The free leg and the torso move as one plank, pivoting at the standing hip. Square hips are the whole difficulty.',
          breathing: 'Inhale on the way down, exhale on the way up.',
          mistakes: 'Opening the hip of the free leg toward the ceiling. Rounding the back to reach lower. Locking the standing knee.',
        },
      },
      {
        id: 'legs-toe-drag',
        name: 'Toe-Tip Plate Drag',
        capacities: ['legs'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 8, unit: 'reps', restSec: 45,
        load: { kind: 'added-kg', value: 5, text: 'A plate flat on a smooth floor, dragged by the toes' },
        progression: 'Eight full drags a side, then a heavier plate in 2.5kg steps, then a slower drag.',
        protocolId: 'foot-strength',
        perSide: true,
        note: 'Per foot. Toe flexor strength: the toes pulling, the way they pull on a toe hook or a steep edge.',
        variations: [
          { minLevel: 1, name: 'Toe-Tip Plate Drag' },
          { minLevel: 4, name: 'Toe-Tip Plate Drag, Slow' },
        ],
        form: {
          setup: 'Sit on a box or bench, barefoot or in socks, a plate flat on a smooth floor in front of you. Place the tips of the toes on the far edge of the plate, heel on the floor.',
          execution: 'Curl the toes down into the plate and drag it toward you along the floor using only the toes and the front of the foot, heel staying planted. Reset the toes at the far edge and drag again. Eight drags, then the other foot.',
          cue: 'The strength that keeps a toe on a smear or a steep edge is in the toe flexors, and almost nothing else in a gym trains them. Small muscles: slow and controlled, never cramped.',
          breathing: 'Normal and relaxed.',
          mistakes: 'Lifting the heel to use the calf. Kicking the plate with the whole leg. Going so heavy the toes cramp.',
        },
      },
      COPENHAGEN,
      {
        id: 'legs-plate-crunch',
        name: 'Plate Crunch',
        capacities: ['tension'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 12, unit: 'reps', restSec: 60,
        load: { kind: 'added-kg', value: 5, text: 'A plate held on the chest, then behind the head' },
        progression:
          'Twelve slow reps with a one-second squeeze, then add 2.5kg, then move the plate '
          + 'from the chest to behind the head, then a decline.',
        protocolId: 'trunk-hypertrophy',
        note: 'The upper abs with real load. The spine is warm by now, so this is the place for curling under weight.',
        variations: [
          { minLevel: 1, name: 'Plate Crunch' },
          { minLevel: 4, name: 'Plate Crunch - Plate Behind Head' },
          { minLevel: 6, name: 'Decline Plate Crunch' },
        ],
        form: {
          setup: 'On your back, knees bent, feet flat or hooked under something. Plate held on the chest with both hands.',
          execution: 'Curl the ribcage toward the pelvis until the shoulder blades leave the floor, squeeze one second, lower slowly. A short range: this is a crunch, not a sit-up.',
          cue: 'Size comes from load and hard sets. The daily crunch keeps the habit; this one adds the weight that grows the muscle.',
          breathing: 'Exhale fully on the curl.',
          mistakes: 'Pulling the head forward with the hands. Sitting all the way up. Bouncing off the floor. Load so heavy the range shrinks.',
        },
      },
      SIDE_PLANK_DIP,
      {
        id: 'feet-frogger',
        name: 'Frogger + Active Straddle',
        capacities: ['mobility'],
        block: 'MOBILITY', intensity: 'EASY',
        sets: 2, work: 45, unit: 'sec', restSec: 15,
        load: { kind: 'bodyweight', text: 'No load' },
        progression: 'Knees wider, then the hips closer to the floor. Active lifts higher and longer.',
        protocolId: 'mobility',
        note: 'Set 1: frogger. Set 2: seated straddle, lift one straight leg then the other, 5 each.',
        form: {
          setup: 'Frogger: on the forearms, knees wide, inside edges of the feet on the floor. Straddle: seated, legs wide and straight.',
          execution: 'Frogger: rock the hips gently back and forward, sinking a little wider each time. Straddle: hands on the floor, lift one leg off the floor as high as possible and hold two seconds.',
          cue: 'Wide, flat-to-the-wall hips are what put the weight over the toes on a slab. Passive range makes it possible, active strength makes it usable.',
          breathing: 'Long exhales into the stretch.',
          mistakes: 'Forcing the range. Arching the lower back in the frogger.',
        },
      },
    ],
  },

  {
    id: 'cave-07', circuitNum: '04',
    title: 'POWER', subtitle: 'no climbing - power - pull - push',
    focus: 'Pull and push fast, then build the size that holds it: the upper body, fresh.',
    capacities: ['pull', 'contact', 'press', 'shoulder', 'tension'],
    illustration: 'pullups.svg',
    duration: 70,
    recoveryHours: 24,
    note:
      'For a training day without climbing. Light hangs keep the fingers loaded without '
      + 'making it a hard finger day, so STRONG can follow two days later. Power first, '
      + 'while every rep can be fast, then the volume, then the stretch, the trunk and '
      + 'the balance. Stop a power set the moment a rep slows down.',
    exercises: [
      WARMUP_PULSE,
      { ...WARMUP_FINGERS, sets: 3 },
      {
        id: 'power-light-hang',
        name: 'Submax Hangs — 20mm',
        capacities: ['crimp', 'openhand'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 6, work: 10, unit: 'sec', restSec: 50,
        load: { kind: 'percent-max', value: 50, text: '20mm, about half of your 10s max. Feet on a box if needed.' },
        progression: 'Same load for the block. Two more hangs before any more weight: this is volume, never a max.',
        protocolId: 'density-hang',
        note: 'Light on purpose. The finger flexors and pulleys get loaded without the 48 hours a max hang costs.',
        form: {
          setup: '20mm edge, half-crimp or open hand, alternating each hang. Feet on a box under you to take weight off.',
          execution: 'Ten seconds on, fifty off. Step down between hangs, shake out.',
          cue: 'It should feel easy all the way through. If the last hang is hard, the load is too high.',
          breathing: 'Normal breathing throughout.',
          mistakes: 'Turning it into max hangs. Drifting into a full crimp.',
        },
      },
      {
        id: 'power-explosive-pullup',
        name: 'Explosive Pull-Ups',
        capacities: ['pull', 'contact'],
        block: 'PRIMARY', intensity: 'HARD',
        sets: 4, work: 3, unit: 'reps', restSec: 150,
        load: { kind: 'bodyweight', text: 'Bodyweight. Every rep as fast as you can pull it.' },
        progression: 'Chest to the bar on every rep, then a short release of the hands at the top, then a light belt.',
        protocolId: 'upper-power',
        hangs: true,
        note: 'Three reps, all fast. The moment one slows down, the set is over: speed is the load.',
        variations: [
          { minLevel: 1, name: 'Explosive Pull-Ups — Chin Over' },
          { minLevel: 3, name: 'Explosive Pull-Ups — Chest to Bar' },
          { minLevel: 5, name: 'Explosive Pull-Ups — Hand Release', load: 'Hands leave the bar for a moment at the top' },
          { minLevel: 7, name: 'Explosive Pull-Ups — +5kg', load: 'Light belt, the same speed' },
        ],
        form: {
          setup: 'Dead hang, shoulder-width grip, shoulders set before the first rep.',
          execution: 'From the dead hang, pull as hard and fast as you can, aiming the chest at the bar. Lower under control to a full hang. Reset, then the next.',
          cue: 'This is the move to a far hold: the force arrives in the first half of the pull, so start it violently.',
          breathing: 'Sharp exhale on the pull.',
          mistakes: 'Kipping to fake speed. Dropping into the bottom on straight, passive shoulders. A fourth slow rep.',
        },
      },
      {
        id: 'power-explosive-pushup',
        name: 'Explosive Push-Ups',
        capacities: ['press'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 5, unit: 'reps', restSec: 120,
        load: { kind: 'bodyweight', text: 'Bodyweight. Hands leave the floor on every rep.' },
        progression: 'Hands off the floor every rep, then a clap, then feet on a box.',
        protocolId: 'upper-power',
        note: 'Wrists sore: do them on push-up handles or fists and stop at hands-off, no clap.',
        variations: [
          { minLevel: 1, name: 'Explosive Push-Ups — Hands Off' },
          { minLevel: 4, name: 'Clap Push-Ups' },
          { minLevel: 6, name: 'Clap Push-Ups — Feet on a Box' },
        ],
        form: {
          setup: 'High plank, hands just outside the shoulders, body one line, glutes on.',
          execution: 'Lower under control, then push so hard the hands leave the floor. Land with soft elbows and go straight into the next.',
          cue: 'The press-out and the mantel ask for a fast push the wall never trains. Speed, not reps.',
          breathing: 'Inhale down, sharp exhale on the push.',
          mistakes: 'Hips sagging on landing. Locked elbows on landing. Grinding a slow rep.',
        },
      },
      {
        id: 'power-weighted-pullup',
        name: 'Weighted Pull-Ups — Volume',
        capacities: ['pull'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 6, unit: 'reps', restSec: 150,
        load: { kind: 'added-kg', text: 'RPE 7-8: lighter than STRONG, two or three reps in reserve' },
        progression: 'Three sets of six clean, then add 2kg. Keep it well under your STRONG load.',
        protocolId: 'hypertrophy',
        hangs: true,
        note: 'The size behind the strength: more reps at a lighter load than STRONG.',
        variations: [
          { minLevel: 1, name: 'Pull-Ups — Bodyweight', load: 'Bodyweight, six clean reps' },
          { minLevel: 3, name: 'Pull-Ups — 3s Lower', load: 'Bodyweight, three seconds down' },
          { minLevel: 4, name: 'Weighted Pull-Ups — Volume', load: 'Belt or pack, RPE 7-8' },
        ],
        form: {
          setup: 'Dead hang, pronated grip just outside shoulder width. Belt or pack for the weight.',
          execution: 'Pull until the chin clears the bar, lower to a full dead hang every rep, a steady tempo.',
          cue: 'Six good reps, two left in the tank. Size comes from many hard sets, not one grinding set.',
          breathing: 'Exhale on the pull.',
          mistakes: 'Half reps. Going heavy enough that rep six becomes a fight.',
        },
      },
      {
        id: 'power-db-row',
        name: 'Single-Arm Dumbbell Row',
        capacities: ['pull', 'shoulder'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 3, work: 10, unit: 'reps', restSec: 75,
        load: { kind: 'added-kg', value: 16, text: 'One dumbbell, the free hand on a box' },
        progression: 'Ten clean reps a side with a one-second squeeze, then 2kg heavier.',
        protocolId: 'hypertrophy',
        perSide: true,
        note: 'Per arm. The horizontal pull climbing barely trains, done without a bench: the free hand on a box.',
        form: {
          setup: 'Staggered stance, free hand on a box at knee height, back flat and nearly horizontal. Dumbbell hanging under the shoulder.',
          execution: 'Row the elbow back past the ribs, squeeze the shoulder blade for one second, lower all the way to a stretch.',
          cue: 'Elbow to the hip pocket, not to the ceiling. The shoulder blade moves first.',
          breathing: 'Exhale on the row.',
          mistakes: 'Twisting the torso to heave the weight. Shrugging. Cutting the stretch at the bottom.',
        },
      },
      {
        id: 'power-db-press',
        name: 'Half-Kneeling Dumbbell Press',
        capacities: ['press', 'shoulder'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 3, work: 8, unit: 'reps', restSec: 90,
        load: { kind: 'added-kg', value: 10, text: 'One dumbbell or kettlebell' },
        progression: 'Eight clean reps a side with the ribs down, then 2kg heavier.',
        protocolId: 'hypertrophy',
        perSide: true,
        note: 'Per arm. The overhead press without a bar to press: kneeling on one knee, so the trunk has to hold.',
        form: {
          setup: 'Half-kneeling on the mat, the knee down on the same side as the dumbbell. Weight at the shoulder, glute of the down leg squeezed.',
          execution: 'Press straight up until the biceps is beside the ear, lower slowly to the shoulder.',
          cue: 'Ribs down, glute on. If the lower back arches to finish the rep, the weight is too heavy.',
          breathing: 'Exhale on the press.',
          mistakes: 'Leaning away from the weight. Arching the lower back. Pressing forward instead of up.',
        },
      },
      {
        id: 'power-floor-pullover',
        name: 'Floor Pullover — Power from the Stretch',
        capacities: ['shoulder', 'mobility'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 3, work: 8, unit: 'reps', restSec: 75,
        load: { kind: 'added-kg', value: 8, text: 'One dumbbell held in both hands' },
        progression: 'Deeper behind the head with the ribs down, then a one-second pause in the stretch, then 2kg heavier.',
        protocolId: 'end-range-strength',
        note: 'Three seconds down into the stretch overhead, a short pause, then pull it back over the chest fast. The reach above your head, made strong.',
        form: {
          setup: 'On your back on the mat, knees bent, lower back flat. Dumbbell held over the chest in both hands, elbows soft.',
          execution: 'Lower the dumbbell behind the head in three seconds, as far as the ribs stay down. Pause, then drive it back over the chest quickly.',
          cue: 'The lats and the shoulder at full stretch are where a long reach fails. Strength there is range you can use.',
          breathing: 'Inhale as it goes back, exhale on the drive.',
          mistakes: 'Ribs flaring to fake the range. Bending the elbows into a press. Bouncing out of the bottom.',
        },
      },
      {
        id: 'power-trx-pike',
        name: 'TRX Knee Tuck / Pike',
        capacities: ['tension'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 10, unit: 'reps', restSec: 60,
        load: { kind: 'bodyweight', text: 'Feet in the TRX straps, hands on the floor' },
        progression: 'Knee tucks with a pause, then body saws, then straight-leg pikes.',
        protocolId: 'trunk-hypertrophy',
        note: 'Wrists sore: fists, push-up handles, or the forearms for the body saw.',
        variations: [
          { minLevel: 1, name: 'TRX Knee Tuck' },
          { minLevel: 3, name: 'TRX Body Saw', load: 'On the forearms, rock back and forth from the shoulders' },
          { minLevel: 5, name: 'TRX Pike' },
        ],
        form: {
          setup: 'Toes in the TRX foot cradles at mid-shin height, high plank, hands under the shoulders.',
          execution: 'Tuck: knees to the chest, back to plank. Pike: hips straight up with straight legs, back to plank. Slow on the way out.',
          cue: 'The same lower-abs pull that brings a foot up to a high hold on a steep wall.',
          breathing: 'Exhale as the knees or hips come up.',
          mistakes: 'Hips sagging between reps. Shoulders drifting behind the hands. Swinging.',
        },
      },
      SL_BALANCE,
      {
        id: 'power-band-face-pull',
        name: 'Band Face Pull',
        capacities: ['shoulder'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 2, work: 15, unit: 'reps', restSec: 45,
        load: { kind: 'band', text: 'Light band anchored at face height' },
        progression: 'Reps to 20 with a pause at the face, then a slightly heavier band.',
        protocolId: 'prehab',
        form: {
          setup: 'Band anchored at face height, a hand on each end, step back until the arms are straight.',
          execution: 'Pull the band to the face, hands finishing beside the ears, elbows high. Pause, return slowly.',
          cue: 'Rear shoulder and rotator cuff against all the pulling. Finish like a double-biceps pose.',
          breathing: 'Exhale as you pull.',
          mistakes: 'Elbows dropping. Shrugging. A band so heavy the back leans.',
        },
      },
    ],
  },
  {
    id: 'cave-08', circuitNum: '05',
    title: 'FULL BODY', subtitle: 'no climbing - legs - push - pull - trunk',
    focus: 'Everything strong in one session: jump, squat, hinge, push, row, carry.',
    capacities: ['legs', 'contact', 'press', 'pull', 'tension', 'mobility'],
    illustration: 'kettlebell.svg',
    duration: 70,
    recoveryHours: 24,
    note:
      'For a training day without climbing, alternated with POWER. No hangboard: the '
      + 'carry is the only grip load, and it swaps for a plate hugged to the chest when '
      + 'the fingers are not ready. Jumps first, then the heavy legs, then the upper body, '
      + 'the stretch, and the trunk.',
    exercises: [
      WARMUP_PULSE,
      {
        id: 'full-box-jump',
        name: 'Box Jump',
        capacities: ['legs', 'contact'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 4, work: 3, unit: 'reps', restSec: 90,
        load: { kind: 'bodyweight', text: 'A box you land on softly in a quarter squat' },
        progression: 'A higher box only when every landing is quiet. Then seated starts, then single-leg take-offs.',
        protocolId: 'lower-power',
        note: 'Step down, never jump down.',
        variations: [
          { minLevel: 1, name: 'Box Jump' },
          { minLevel: 3, name: 'Box Jump — Seated Start', load: 'From sitting on a second box: no countermovement' },
          { minLevel: 5, name: 'Single-Leg Box Jump', load: 'Low box, three a leg' },
        ],
        form: {
          setup: 'Box at about knee height, a step in front of it. Feet hip-width.',
          execution: 'Swing the arms back, dip, jump onto the box, land on the whole foot in a quarter squat. Stand, step down, reset.',
          cue: 'Dynos and big moves off poor feet are the legs firing fast. Three fresh reps train that.',
          breathing: 'In on the dip, out on the jump.',
          mistakes: 'A box so high you land in a deep squat. Knees caving. Jumping down.',
        },
      },
      {
        id: 'full-hop-stick',
        name: 'Lateral Hop + Stick',
        capacities: ['legs', 'tension'],
        block: 'PREHAB', intensity: 'TECHNIQUE',
        sets: 2, work: 5, unit: 'reps', restSec: 45,
        load: { kind: 'bodyweight', text: 'Bodyweight, one foot to the other' },
        progression: 'Longer hops, then a two-second stick, then eyes on a point that is not the floor.',
        protocolId: 'balance',
        fixed: true,
        perSide: true,
        note: 'Balance under speed: land on one foot and freeze. A wobble means the hop was too long.',
        form: {
          setup: 'Stand on one foot, knee soft, space to the side.',
          execution: 'Hop sideways onto the other foot and stick the landing for two seconds without moving. Hop back.',
          cue: 'Absorb with the ankle, knee and hip together; the knee stays over the middle toes.',
          breathing: 'Exhale on the landing.',
          mistakes: 'Landing on a straight leg. Knee caving in. Putting the other foot down to save it.',
        },
      },
      {
        id: 'full-front-squat',
        name: 'Double Kettlebell Front Squat',
        capacities: ['legs'],
        block: 'PRIMARY', intensity: 'HARD',
        sets: 4, work: 5, unit: 'reps', restSec: 150,
        load: { kind: 'added-kg', value: 24, text: 'Two kettlebells or dumbbells at the shoulders, total kg' },
        progression: 'Four sets of five at full depth with a flat back, then 2-4kg more in total.',
        protocolId: 'max-strength',
        note: 'The heavy leg lift of the week. Racked at the shoulders, so the trunk works too.',
        variations: [
          { minLevel: 1, name: 'Goblet Squat — Heavy', load: 'One bell at the chest' },
          { minLevel: 3, name: 'Double Kettlebell Front Squat' },
          { minLevel: 5, name: 'Double Kettlebell Front Squat — 2s Pause' },
        ],
        form: {
          setup: 'Bells racked on the forearms at the shoulders, elbows in, feet shoulder-width, toes slightly out.',
          execution: 'Sit down between the hips until the hip crease passes the knee, chest tall. Drive up through the whole foot.',
          cue: 'Brace before you descend and keep the brace all the way up. The legs push the floor away.',
          breathing: 'Big breath in at the top, brace, exhale through the top half.',
          mistakes: 'Cutting depth. Heels lifting. The chest dropping so the bells pull you forward.',
        },
      },
      {
        id: 'full-db-rdl',
        name: 'Dumbbell Romanian Deadlift',
        capacities: ['legs', 'tension'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 8, unit: 'reps', restSec: 120,
        load: { kind: 'added-kg', value: 32, text: 'Two dumbbells or kettlebells, total kg' },
        progression: 'Eight reps with a flat back and a deep hamstring stretch, then 4kg more in total.',
        protocolId: 'back-strength',
        note: 'The hinge under load. Your lower back is the weak point, so the back stays flat and the hips do the moving.',
        form: {
          setup: 'Feet hip-width, a weight in each hand in front of the thighs, knees soft.',
          execution: 'Push the hips back, sliding the weights down the thighs until the hamstrings stop you, back flat. Drive the hips forward to stand.',
          cue: 'A long stretch on the hamstrings at the bottom, then stand up hard. Hips, not the lower back.',
          breathing: 'Inhale down, exhale up.',
          mistakes: 'Rounding the back to go lower. Squatting it. Leaning back at the top.',
        },
      },
      {
        id: 'full-rockover-drive',
        name: 'High-Step Rock-Over Drive',
        capacities: ['legs', 'mobility'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 4, unit: 'reps', restSec: 90,
        load: { kind: 'added-kg', value: 0, text: 'Bodyweight, then a dumbbell in each hand' },
        progression: 'A higher box, then a pause in the deep position, then dumbbells in 2kg steps.',
        protocolId: 'end-range-strength',
        perSide: true,
        note: 'Per leg. The high step on the wall: sink into the deep stretch over the foot, then drive up to stand, fast.',
        variations: [
          { minLevel: 1, name: 'Rock-Over Drive — Knee-Height Box' },
          { minLevel: 3, name: 'Rock-Over Drive — Hip-Height Box' },
          { minLevel: 5, name: 'Rock-Over Drive — Hip-Height, 2s Pause' },
        ],
        form: {
          setup: 'Whole foot on a stable box, the other on the floor. Hands free or holding light dumbbells.',
          execution: 'Shift the pelvis forward over the high foot and sink into the deepest position you can drive out of. Hold a breath, then stand up on the box as fast as you can. Step down slowly.',
          cue: 'No push from the floor foot. The power comes from the bent leg at full stretch, exactly as on a high foothold.',
          breathing: 'Inhale sinking in, exhale on the drive.',
          mistakes: 'Bouncing off the back foot. Knee caving. Going deeper than you can drive out of.',
        },
      },
      { ...PUSH_DIP, sets: 3 },
      {
        id: 'full-ring-row',
        name: 'Ring Row',
        capacities: ['pull', 'shoulder'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 3, work: 10, unit: 'reps', restSec: 75,
        load: { kind: 'bodyweight', text: 'TRX rings, body straight. Feet further forward is harder.' },
        progression: 'Feet further forward, then feet on a box, then a three-second lower.',
        protocolId: 'hypertrophy',
        variations: [
          { minLevel: 1, name: 'Ring Row' },
          { minLevel: 3, name: 'Ring Row — Feet on a Box' },
          { minLevel: 5, name: 'Ring Row — Feet on a Box, 3s Lower' },
        ],
        form: {
          setup: 'Rings at waist height, lean back with straight arms, body one line from heels to head.',
          execution: 'Row the chest up to the rings, elbows close to the ribs, squeeze one second, lower slowly.',
          cue: 'The shoulder blades pull together first. The body stays a plank.',
          breathing: 'Exhale on the row.',
          mistakes: 'Hips sagging. Leading with the chin. Half reps.',
        },
      },
      {
        id: 'full-suitcase-carry',
        name: 'Suitcase Carry',
        capacities: ['forearm', 'tension'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 3, work: 30, unit: 'sec', restSec: 60,
        load: { kind: 'added-kg', value: 20, text: 'One heavy kettlebell or dumbbell' },
        progression: 'Walk the time tall and level, then 4kg heavier.',
        protocolId: 'tension-iso',
        perSide: true,
        noGripId: 'full-plate-carry',
        note: 'Per side. One weight, so the trunk stops you leaning: the obliques and the grip together.',
        form: {
          setup: 'A heavy bell in one hand at your side, shoulders level, standing tall.',
          execution: 'Walk slowly for the time without leaning toward or away from the weight. Swap hands.',
          cue: 'Tall and level, as if a string pulls the crown of the head up.',
          breathing: 'Short, steady breaths under the brace.',
          mistakes: 'Leaning. The shoulder dropping. Walking fast.',
        },
      },
      {
        id: 'full-cossack',
        name: 'Goblet Cossack Squat',
        capacities: ['legs', 'mobility'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 6, unit: 'reps', restSec: 60,
        load: { kind: 'added-kg', value: 8, text: 'A light bell or plate hugged at the chest' },
        progression: 'Deeper with the heel down, then a pause at the bottom, then 2kg heavier.',
        protocolId: 'end-range-strength',
        perSide: true,
        note: 'Per side. Slowly down into the side split, then drive out of it: drop knees and wide stems.',
        form: {
          setup: 'Wide stance, toes slightly out, a light weight at the chest.',
          execution: 'Shift into one hip, bending that knee until the other leg is straight with the toes up. Three seconds down, then push back to the middle fast.',
          cue: 'Adductors at full stretch, then strong from there. Only as deep as you can drive out of.',
          breathing: 'Inhale down, exhale on the drive.',
          mistakes: 'The bent heel lifting. Rounding the back. Collapsing into the bottom.',
        },
      },
      COPENHAGEN,
      RUSSIAN_TWIST,
    ],
    substitutes: [
      {
        id: 'full-plate-carry',
        name: 'Plate Hug Carry',
        capacities: ['tension', 'legs'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 3, work: 30, unit: 'sec', restSec: 60,
        load: { kind: 'added-kg', value: 15, text: 'A plate hugged to the chest, nothing gripped' },
        progression: 'Walk the time tall, then a heavier plate.',
        protocolId: 'tension-iso',
        note: 'The carry without the grip: the plate rests on the forearms against the chest.',
        form: {
          setup: 'A plate hugged flat against the chest, forearms under it, hands open.',
          execution: 'Walk slowly for the time, standing tall with the ribs down.',
          cue: 'The trunk holds, the hands rest.',
          breathing: 'Short, steady breaths under the brace.',
          mistakes: 'Leaning back to hold the plate. Gripping the edge.',
        },
      },
    ],
  },
];
