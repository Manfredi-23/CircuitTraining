// =============================================================================
// data-assess.ts — TEST mode: the full benchmark battery
//
// One gym session, every 6-8 weeks, on a rest day, fully fresh. Each TEST
// exercise records a benchmark (see `records`). Every result is kept, so STATS
// can show the history; benchmarks, not XP, are what open the one-arm gates.
//
// Order follows neurological cost, as everywhere else: bodyweight first (the %
// results convert against it), then maximal fingers and pulling while fresh,
// then the trunk, then pushing, then the forearm endurance test that empties
// the grip, then mobility as the cool-down.
//
// Equipment: hangboard with a 20mm edge, lifting block, weight belt, pull-up
// bar, bench or 45-degree back extension, scale, tape measure.
// =============================================================================

import type { Circuit, Exercise } from './types';
import { WARMUP_PULSE, WARMUP_FINGERS } from './data-cave';

const BODYWEIGHT: Exercise = {
  id: 'test-bodyweight',
  name: 'TEST — Bodyweight',
  capacities: ['legs'],
  block: 'TEST', intensity: 'EASY',
  sets: 1, work: 1, unit: 'reps', restSec: 15,
  load: { kind: 'bodyweight', text: 'On the scale, before warming up' },
  progression: 'Not a performance number. Every % bodyweight result below is computed against it.',
  protocolId: 'assessment',
  note: 'First on purpose: the hang and pull-up results convert against this number.',
  records: {
    benchmarkId: 'bodyweight',
    axis: { unit: 'kg', step: 0.5, min: 40, max: 120, prefix: '', label: 'BODYWEIGHT' },
    convert: 'identity',
  },
  form: {
    setup: 'Gym scale, shoes off, before eating if you can. Same conditions each test.',
    execution: 'Step on, read it, enter it.',
    cue: 'A kilo of difference moves every % bodyweight result by about 1.5 points. Weigh in, do not guess.',
    breathing: 'Normal.',
    mistakes: 'Using last month\'s number. Weighing after the session.',
  },
};

const ONE_ARM_PULL: Exercise = {
  id: 'test-one-arm-pull',
  name: 'TEST — One-Arm Block Pull 20mm',
  capacities: ['crimp'],
  block: 'TEST', intensity: 'MAX',
  sets: 3, work: 7, unit: 'sec', restSec: 180,
  load: { kind: 'added-kg', text: 'Lifting block on a 20mm edge, plates on the pin' },
  progression: 'Enter the kilos lifted by the WEAKER hand for a clean 7s. Saved as % bodyweight. Font 7a asks for about 61%.',
  protocolId: 'assessment',
  perSide: true,
  note: 'Each hand. Work up in 2.5-5kg jumps; stop at the first lift that loses the half-crimp.',
  records: {
    benchmarkId: 'fs-1arm-20mm',
    axis: { unit: 'kg', step: 1, min: 0, max: 80, prefix: '', label: 'WEAKER HAND, KG LIFTED' },
    convert: 'kg-to-pct-bw',
  },
  form: {
    setup: 'Lifting block with a 20mm edge, loaded pin, standing over it with a soft knee. Half-crimp, thumb off the index finger, shoulder packed.',
    execution: 'Lift the block just off the floor and hold seven seconds with a still arm. Lower, rest three minutes, add weight. Both hands, alternating.',
    cue: 'The one-arm number shows what each hand can really do, and how far apart they are. A gap over 10% is worth knowing about.',
    breathing: 'Brace, keep breathing short.',
    mistakes: 'Jerking the block up. Letting the grip open into a drag. Testing the strong hand only.',
  },
};

const MAX_PULLUPS: Exercise = {
  id: 'test-max-pullups',
  name: 'TEST — Max Strict Pull-Ups',
  capacities: ['pull'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 15, unit: 'reps', restSec: 240,
  load: { kind: 'bodyweight', text: 'Bodyweight, one all-out set' },
  progression: 'Enter the strict reps. Solid is 15, strong is 20.',
  protocolId: 'assessment',
  note: 'After the 5RM, with at least four minutes rest: one set to failure.',
  records: {
    benchmarkId: 'max-pullups',
    axis: { unit: 'reps', step: 1, min: 0, max: 50, prefix: '', label: 'STRICT REPS' },
    convert: 'identity',
  },
  form: {
    setup: 'Dead hang, shoulder-width overhand grip.',
    execution: 'Chin over the bar, full dead hang at the bottom of every rep. The set ends at the first rep that needs a kick or stops short.',
    cue: 'Strength (the 5RM) and how many times you can repeat it (this) are different qualities. Climbing needs both.',
    breathing: 'Exhale on each pull.',
    mistakes: 'Counting half reps. Kipping. Resting at the bottom.',
  },
};

const LEG_RAISE: Exercise = {
  id: 'test-leg-raise',
  name: 'TEST — Max Hanging Leg Raises',
  capacities: ['tension'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 12, unit: 'reps', restSec: 180,
  load: { kind: 'bodyweight', text: 'Straight legs to horizontal or higher, straps allowed' },
  progression: 'Enter the strict reps. Tracked against your own previous result.',
  protocolId: 'assessment',
  records: {
    benchmarkId: 'leg-raise-reps',
    axis: { unit: 'reps', step: 1, min: 0, max: 50, prefix: '', label: 'STRICT REPS' },
    convert: 'identity',
  },
  form: {
    setup: 'Dead hang, shoulders engaged. Ab straps if the fingers complain: this is a trunk test, not a grip test.',
    execution: 'Raise straight legs to at least horizontal, lower under control, no swing. The set ends at the first rep below horizontal or with a swing.',
    cue: 'The lower abs and hip flexors pulling the feet up while hanging: the move that puts a foot back on after a cut.',
    breathing: 'Exhale on the way up.',
    mistakes: 'Swinging. Bent knees. Dropping the legs.',
  },
};

const HOLLOW: Exercise = {
  id: 'test-hollow',
  name: 'TEST — Hollow Body Hold',
  capacities: ['tension'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 60, unit: 'sec', restSec: 120,
  load: { kind: 'bodyweight', text: 'Arms overhead, legs straight and low' },
  progression: 'Enter the seconds held with the lower back flat. Solid is 60s.',
  protocolId: 'assessment',
  records: {
    benchmarkId: 'hollow-hold',
    axis: { unit: 's', step: 1, min: 0, max: 240, prefix: '', label: 'SECONDS, BACK FLAT' },
    convert: 'identity',
  },
  form: {
    setup: 'On your back, arms by the ears, legs straight, both a hand-width off the floor. Lower back pressed into the floor.',
    execution: 'Hold. The clock stops the moment the lower back lifts, not when you give up.',
    cue: 'The front of the abdominal wall, measured without any movement to hide behind.',
    breathing: 'Short controlled breaths.',
    mistakes: 'Holding on with an arched back. Bending the knees mid-test.',
  },
};

const SIDE_PLANK: Exercise = {
  id: 'test-side-plank',
  name: 'TEST — Side Plank Hold',
  capacities: ['tension'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 90, unit: 'sec', restSec: 120,
  load: { kind: 'bodyweight', text: 'Forearm side plank, feet stacked' },
  progression: 'Enter the WEAKER side in seconds. Average is about 95s. Note the gap between sides.',
  protocolId: 'assessment',
  perSide: true,
  note: 'Both sides, two minutes apart. On the forearm, so the wrists are spared.',
  records: {
    benchmarkId: 'side-plank',
    axis: { unit: 's', step: 1, min: 0, max: 300, prefix: '', label: 'WEAKER SIDE, SECONDS' },
    convert: 'identity',
  },
  form: {
    setup: 'Elbow under the shoulder, feet stacked, straight line from head to heels, top hand on the hip.',
    execution: 'Hold until the hips drop out of line. Then the other side.',
    cue: 'Oblique and lateral trunk endurance, side by side. A difference of more than 5% between sides is worth training out.',
    breathing: 'Steady.',
    mistakes: 'Hips sagging or piking. Rolling forward. Only testing the good side.',
  },
};

const BACK_HOLD: Exercise = {
  id: 'test-back-extension',
  name: 'TEST — Back Extension Hold',
  capacities: ['tension'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 120, unit: 'sec', restSec: 180,
  load: { kind: 'bodyweight', text: 'Torso horizontal over the bench edge, arms crossed' },
  progression: 'Enter the seconds held level. Average is about 146s. This is the number for your lower back.',
  protocolId: 'assessment',
  note: 'The Biering-Sorensen test. The 45-degree back extension works if you hold the torso level with the floor.',
  records: {
    benchmarkId: 'back-extension-hold',
    axis: { unit: 's', step: 1, min: 0, max: 300, prefix: '', label: 'SECONDS LEVEL' },
    convert: 'identity',
  },
  form: {
    setup: 'Hips on the edge of a bench or the back extension pad, ankles fixed, arms crossed on the chest.',
    execution: 'Hold the torso horizontal, in line with the legs. The time ends when it drops below horizontal or you put a hand down.',
    cue: 'Lower-back endurance is what the extensors are mostly asked for. This is the test the research uses, so the number means something.',
    breathing: 'Slow and steady.',
    mistakes: 'Arching above horizontal. Pad too high, blocking the hips. Stopping at the first discomfort rather than the first drop.',
  },
};

const PUSHUPS: Exercise = {
  id: 'test-pushups',
  name: 'TEST — Max Push-Ups',
  capacities: ['press'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 25, unit: 'reps', restSec: 180,
  load: { kind: 'bodyweight', text: 'Bodyweight, fists or handles if the wrists complain' },
  progression: 'Enter the clean reps. Good is about 22. The check that pushing keeps up with pulling.',
  protocolId: 'assessment',
  records: {
    benchmarkId: 'max-pushups',
    axis: { unit: 'reps', step: 1, min: 0, max: 100, prefix: '', label: 'CLEAN REPS' },
    convert: 'identity',
  },
  form: {
    setup: 'Hands just outside the shoulders, body straight heels to head.',
    execution: 'Chest to a fist from the floor, full lockout. The set ends at the first rep that sags or stops short.',
    cue: 'Climbers pull all day and rarely push. A weak push next to a strong pull is how shoulders get unbalanced.',
    breathing: 'Inhale down, exhale up.',
    mistakes: 'Half reps. Hips sagging. Elbows flared to 90 degrees.',
  },
};

const REPEATERS: Exercise = {
  id: 'test-repeaters',
  name: 'TEST — 7:3 Repeaters to Failure',
  capacities: ['forearm', 'crimp'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 180, unit: 'sec', restSec: 240,
  load: { kind: 'bodyweight', text: '20mm edge, half-crimp, bodyweight' },
  progression: 'Enter the completed 7s hangs. Tracked against your own previous result.',
  protocolId: 'assessment',
  note: 'Late on purpose: it empties the forearms. Skip it if the fingers are complaining today.',
  records: {
    benchmarkId: 'repeaters-20mm',
    axis: { unit: 'reps', step: 1, min: 0, max: 60, prefix: '', label: 'HANGS COMPLETED' },
    convert: 'identity',
  },
  form: {
    setup: 'Same 20mm edge as the max hang, half-crimp, a timer running 7 on / 3 off.',
    execution: 'Hang 7 seconds, step off for 3, repeat. The test ends at the first hang you cannot hold for the full 7.',
    cue: 'This is your engine: how long the forearms keep producing force. Strong boulderers with slow pump recovery usually score low here.',
    breathing: 'Breathe on every rest.',
    mistakes: 'Letting the grip open into a drag to survive. Shortening the rests.',
  },
};

const STRADDLE: Exercise = {
  id: 'test-straddle',
  name: 'TEST — Seated Straddle',
  capacities: ['mobility'],
  block: 'TEST', intensity: 'MODERATE',
  sets: 1, work: 30, unit: 'sec', restSec: 30,
  load: { kind: 'bodyweight', text: 'Back to a wall, legs straight' },
  progression: 'Enter heel-to-heel distance in cm.',
  protocolId: 'assessment',
  records: {
    benchmarkId: 'straddle',
    axis: { unit: 'cm', step: 1, min: 50, max: 220, prefix: '', label: 'HEEL TO HEEL, CM' },
    convert: 'identity',
  },
  form: {
    setup: 'Sit with the back against a wall, legs straight and wide, kneecaps pointing up.',
    execution: 'Slide the legs as wide as they go without the knees rolling in. Measure heel to heel.',
    cue: 'Hip abduction: what lets you bridge a corner and get the hips flat to the wall on a slab.',
    breathing: 'Exhale into the end range.',
    mistakes: 'Leaning forward. Knees rolling inward. Bouncing.',
  },
};

const SIT_REACH: Exercise = {
  id: 'test-sit-reach',
  name: 'TEST — Sit and Reach',
  capacities: ['mobility'],
  block: 'TEST', intensity: 'MODERATE',
  sets: 1, work: 30, unit: 'sec', restSec: 30,
  load: { kind: 'bodyweight', text: 'Legs straight and together' },
  progression: 'Enter cm past the toes. Negative if you stop short of them.',
  protocolId: 'assessment',
  records: {
    benchmarkId: 'sit-reach',
    axis: { unit: 'cm', step: 1, min: -30, max: 40, prefix: '', label: 'CM PAST THE TOES' },
    convert: 'identity',
  },
  form: {
    setup: 'Seated, legs straight and together, feet flexed, a tape measure along the legs with 0 at the toes.',
    execution: 'Reach slowly forward with both hands, hold two seconds at the furthest point. Best of two.',
    cue: 'Hamstring and back length: the range behind high steps and heel hooks.',
    breathing: 'Exhale as you reach.',
    mistakes: 'Bouncing. Bending the knees. One hand ahead of the other.',
  },
};

const SHOULDER_REACH: Exercise = {
  id: 'test-shoulder-reach',
  name: 'TEST — Overhead Reach',
  capacities: ['shoulder', 'mobility'],
  block: 'TEST', intensity: 'MODERATE',
  sets: 1, work: 30, unit: 'sec', restSec: 30,
  load: { kind: 'bodyweight', text: 'On your back, lower back flat' },
  progression: 'Enter the gap in cm from the thumbs to the floor. 0 is full range; lower is better.',
  protocolId: 'assessment',
  records: {
    benchmarkId: 'shoulder-reach',
    axis: { unit: 'cm', step: 1, min: 0, max: 40, prefix: '', label: 'GAP TO FLOOR, CM' },
    convert: 'identity',
  },
  form: {
    setup: 'On your back, knees bent, feet flat, lower back pressed into the floor. Arms straight, thumbs together.',
    execution: 'Lower the straight arms overhead toward the floor without the lower back lifting. Measure thumbs to floor.',
    cue: 'Shoulder flexion: reaching overhead without arching the back. Short range here is the classic climber\'s shoulder.',
    breathing: 'Exhale as the arms lower.',
    mistakes: 'Arching the lower back to fake range. Bending the elbows.',
  },
};

export const DATA_ASSESS: Circuit[] = [
  {
    id: 'assess-01', circuitNum: '01',
    title: 'ASSESS', subtitle: 'full battery - fingers - pull - core - range',
    focus: 'Find the limiter. Numbers now, opinions later.',
    capacities: ['crimp', 'openhand', 'forearm', 'pull', 'press', 'tension', 'mobility'],
    illustration: 'dumbbell.svg',
    duration: 86,
    recoveryHours: 48,
    note:
      'Every 6-8 weeks on a rest day, fully warm and fresh. Enter each result on the '
      + 'stepper before the last DONE: it is saved as a benchmark and drawn on STATS. '
      + 'SKIP any test you cannot do today; nothing is lost.',
    exercises: [
      BODYWEIGHT,
      WARMUP_PULSE,
      { ...WARMUP_FINGERS, sets: 4 },
      {
        id: 'test-max-hang',
        name: 'TEST — Max Hang 20mm Half-Crimp',
        capacities: ['crimp'],
        block: 'TEST', intensity: 'MAX',
        sets: 4, work: 10, unit: 'sec', restSec: 180,
        load: { kind: 'percent-max', text: 'Build up until 10s is the most you can hold' },
        progression: 'Record (bodyweight + added) / bodyweight x 100. At 62kg: 128% = +17kg, 134% = +21kg, 140% = +25kg.',
        protocolId: 'assessment',
        note: 'Work up in 3-5kg jumps. Stop at the first failed 10s and record the last success.',
        records: {
          benchmarkId: 'fs-2arm-20mm',
          axis: { unit: 'kg', step: 1, min: 0, max: 80, prefix: '+', label: 'BEST 10S, ADDED' },
          convert: 'added-kg-to-pct-bw',
        },
        form: {
          setup: 'Identical setup every test: same edge, same grip, same shoulder position, same time of day if possible.',
          execution: 'Ten seconds. Successive attempts with three minutes between. Record the heaviest clean 10s.',
          cue: 'A test only works if it is repeatable. Change nothing between tests except your training.',
          breathing: 'Normal.',
          mistakes: 'Testing tired. Changing edge size between tests and comparing the numbers anyway.',
        },
      },
      ONE_ARM_PULL,
      {
        id: 'test-weighted-pullup',
        name: 'TEST — Weighted Pull-Up 5RM',
        capacities: ['pull'],
        block: 'TEST', intensity: 'MAX',
        sets: 3, work: 5, unit: 'reps', restSec: 180,
        load: { kind: 'added-kg', text: 'Build to the heaviest clean set of 5' },
        progression: 'Estimated 1RM = 5RM load x 1.15. Record as % bodyweight. Lattice male standard is 165%.',
        protocolId: 'assessment',
        note: 'A 5RM is safer and almost as informative as a true single.',
        records: {
          benchmarkId: 'weighted-pullup',
          axis: { unit: 'kg', step: 1, min: 0, max: 80, prefix: '+', label: 'BEST 5RM, ADDED' },
          convert: 'five-rm-to-pct-bw',
        },
        form: {
          setup: 'Dead hang start, weight on a belt.',
          execution: 'Five strict reps, chin over bar, full extension each rep. Add weight and repeat until five is no longer clean.',
          cue: 'This is the number that tells you whether pulling strength is still limiting you. Under 165% total, it usually is.',
          breathing: 'Exhale on each pull.',
          mistakes: 'Counting reps that did not start from a dead hang.',
        },
      },
      MAX_PULLUPS,
      {
        id: 'test-lockoff',
        name: 'TEST — 90 Degree Lock-Off',
        capacities: ['pull'],
        block: 'TEST', intensity: 'MAX',
        sets: 1, work: 30, unit: 'sec', restSec: 120,
        load: { kind: 'bodyweight', text: 'One arm, other hand lightly on the wrist' },
        progression: 'Enter the WEAKER side: that is the one that limits you. Solid is 10s, strong is 15s.',
        protocolId: 'assessment',
        perSide: true,
        records: {
          benchmarkId: 'lockoff-90',
          axis: { unit: 's', step: 1, min: 0, max: 60, prefix: '', label: 'WEAKER SIDE' },
          convert: 'identity',
        },
        form: {
          setup: 'Pull to 90 degrees of elbow flexion on one arm, free hand resting on the wrist.',
          execution: 'Hold until the elbow angle opens past 90. Time both sides and note the difference.',
          cue: 'A large left-right gap is worth training out. Climbers accumulate asymmetry without noticing.',
          breathing: 'Keep breathing.',
          mistakes: 'Pulling with the assisting hand.',
        },
      },
      {
        id: 'test-front-lever',
        name: 'TEST — Front Lever Hold',
        capacities: ['tension'],
        block: 'TEST', intensity: 'MAX',
        sets: 1, work: 30, unit: 'sec', restSec: 120,
        load: { kind: 'bodyweight', text: 'Hardest progression with a flat lower back' },
        progression: 'Enter the hardest progression held a clean 10s: 1 tuck, 2 advanced tuck, 3 one-leg, 4 straddle, 5 full. 0 if none yet.',
        protocolId: 'assessment',
        records: {
          benchmarkId: 'front-lever',
          axis: { unit: 'LVL', step: 1, min: 0, max: 5, prefix: '', label: 'PROGRESSION HELD 10S' },
          convert: 'identity',
        },
        form: {
          setup: 'Straight arms on a bar.',
          execution: 'Hold your hardest clean progression to failure of position, not failure of grip.',
          cue: 'The moment the lower back arches, the test is over. Arching is how people fake this hold.',
          breathing: 'Short controlled breaths.',
          mistakes: 'Recording a time that included five arched seconds.',
        },
      },
      LEG_RAISE,
      HOLLOW,
      SIDE_PLANK,
      BACK_HOLD,
      PUSHUPS,
      REPEATERS,
      {
        id: 'test-hip-mobility',
        name: 'TEST — Foot Raise + Straddle',
        capacities: ['mobility'],
        block: 'TEST', intensity: 'MODERATE',
        sets: 1, work: 120, unit: 'sec', restSec: 30,
        load: { kind: 'bodyweight', text: 'No load' },
        progression: 'Enter the WEAKER side foot raise in cm. Note the straddle separately. Average foot raise is about 74cm.',
        protocolId: 'assessment',
        records: {
          benchmarkId: 'hip-footraise',
          axis: { unit: 'cm', step: 1, min: 30, max: 130, prefix: '', label: 'FOOT RAISE, WEAKER' },
          convert: 'identity',
        },
        form: {
          setup: 'Stand next to a wall with a tape measure. Then sit into a maximal straddle with legs straight and feet flat.',
          execution: 'Raise one foot as high as possible with the hip flexed, abducted and externally rotated, knee bent. Measure floor to heel. Both sides. Then measure the straddle.',
          cue: 'Combined abduction and external rotation is what makes high steps, drop knees and bridging available. It is cheap to train and costs no recovery.',
          breathing: 'Relaxed, exhale into end range.',
          mistakes: 'Leaning the torso away to fake height. Not testing both sides.',
        },
      },
      STRADDLE,
      SIT_REACH,
      SHOULDER_REACH,
    ],
  },
];
