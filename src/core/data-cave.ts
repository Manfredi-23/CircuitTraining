// =============================================================================
// data-cave.ts — CAVE mode: full gym sessions
// Equipment: hangboard, rings, TRX, kettlebells, dumbbells and
//            plates, pull-up bars, weighted pull-up harness, a pulley under the
//            hangboard, bands + anchors, bouldering wall with slab and steep.
//
// CAVE is almost always done straight after a bouldering session at Minimum.
// Three sessions:
//   01 STRONG      — the one that REPLACES bouldering, fresh: max hangs, heavy
//                    weighted pull-ups, the one-arm path, front lever.
//   02 PULL + PUSH — after bouldering: weighted pull-ups at RPE 8, band-assisted
//                    one-arms, pushing, then the trunk.
//   03 LEGS + BACK — after bouldering: legs, the lower back, toes, abs and
//                    obliques, hips. Nothing loads the fingers.
//
// Free bouldering is the athlete's own and stays unprogrammed. The test
// battery lives in its own TEST tab (data-assess.ts).
//
// Order inside every session is fixed by neurological cost: the fingers and the
// nervous system get the session while they are fresh, and the conditioning
// work goes last where fatigue costs nothing.
// =============================================================================

import type { Circuit } from './types';
import { oneArmPath, assistedOneArm, oneArmNegative, oneArmShrug } from './data-oap';
import { SIDE_PLANK_DIP } from './data-daily';

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

export const DATA_CAVE: Circuit[] = [
  {
    id: 'cave-01', circuitNum: '01',
    title: 'STRONG', subtitle: 'instead of bouldering - fingers - pull',
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
      {
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
      },
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
      {
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
      },
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
      {
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
          setup: 'Side plank on the forearm, top leg resting on a chair or bench at knee or ankle height.',
          execution: 'Lift the hips so the body is a straight line, with the bottom leg lifted toward the top one. Hold.',
          cue: 'The adductors do a lot of work in climbing and almost never get trained directly. This is the fix.',
          breathing: 'Steady.',
          mistakes: 'Hips sagging. Rolling the chest toward the floor.',
        },
      },
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
];
