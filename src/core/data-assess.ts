// =============================================================================
// data-assess.ts — TEST mode: the assessment battery
//
// One gym session, every 6-8 weeks, after a rest day. Built from how climbing
// assessment is done in practice and in the research (IRCRA test battery,
// Lattice protocols, NSCA test order, McGill's torso endurance battery):
//
//   WARM-UP       standardised 15 minutes, identical every time.
//   BODY + RANGE  non-fatiguing first: bodyweight, then range of motion.
//   MAX STRENGTH  ramps, not sets: each attempt harder than the last, MADE IT
//                 or FAILED marked per attempt, the best clean one saved.
//                 Max hang 20mm (7s, Lattice), weighted pull-up 2RM (the
//                 rep range Lattice's 165% standard was collected in).
//   ENDURANCE     one all-out set each: pull-ups, 7:3 repeaters, push-ups.
//   TRUNK         toes-to-bar, hollow hold, prone extension (Ito), left and
//                 right side bridge. Only a bar and a mat: the athlete tests
//                 alone in a gym with no bench, no back extension and no
//                 partner, and a front lever cannot be graded alone. STATS
//                 reads the side bridges as a ratio.
//
// Every result is kept; STATS draws the history. Benchmarks, not XP, open the
// one-arm gates.
// =============================================================================

import type { Circuit, Exercise } from './types';
import { WARMUP_FINGERS } from './data-cave';

const WARMUP_GENERAL: Exercise = {
  id: 'assess-warmup-general',
  name: 'Pulse Raiser + Mobility',
  section: 'WARM-UP',
  capacities: ['mobility', 'shoulder'],
  block: 'WARMUP', intensity: 'EASY',
  sets: 1, work: 420, unit: 'sec', restSec: 30,
  load: { kind: 'bodyweight', text: 'No load' },
  fixed: true,
  progression: 'Never progressed. Identical every test, so the warm-up is never the variable.',
  protocolId: 'warmup',
  note: 'Three minutes raising the pulse, then four of hips, thoracic spine and shoulders.',
  form: {
    setup: 'Space to move, band to hand.',
    execution: 'Three minutes of easy traversing, skipping or rowing. Then leg swings, deep squat, cat-cow, thread the needle, band pass-throughs and external rotations.',
    cue: 'The standardised research batteries open with the same 15-minute warm-up every time. A different warm-up is a different test.',
    breathing: 'Nasal, unhurried.',
    mistakes: 'Rushing it. Changing it between tests.',
  },
};

const WARMUP_PULL: Exercise = {
  id: 'assess-warmup-pull',
  name: 'Scapular Pulls + Easy Pull-Ups',
  section: 'WARM-UP',
  capacities: ['pull', 'shoulder'],
  block: 'WARMUP', intensity: 'EASY',
  sets: 2, work: 5, unit: 'reps', restSec: 60,
  load: { kind: 'bodyweight', text: 'Bodyweight, far from failure' },
  fixed: true,
  progression: 'Never progressed.',
  protocolId: 'warmup',
  note: 'Set 1: five scapular pulls. Set 2: five easy pull-ups.',
  form: {
    setup: 'Pull-up bar, shoulder-width grip.',
    execution: 'Scapular pulls: from a dead hang, pull the shoulder blades down without bending the arms. Then five relaxed pull-ups.',
    cue: 'Wakes up the pulling chain before it is asked for a maximal 2RM.',
    breathing: 'Exhale on the pull.',
    mistakes: 'Turning the warm-up into a set to failure.',
  },
};

const BODYWEIGHT: Exercise = {
  id: 'test-bodyweight',
  name: 'TEST — Bodyweight',
  section: 'BODY + RANGE',
  capacities: ['legs'],
  block: 'TEST', intensity: 'EASY',
  sets: 1, work: 1, unit: 'reps', restSec: 15,
  load: { kind: 'bodyweight', text: 'On the scale, shoes off' },
  progression: 'Not a performance number. Every % bodyweight result below is computed against it.',
  protocolId: 'assessment',
  note: 'Before the strength tests on purpose: the hang and pull-up results convert against this number.',
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

const STRADDLE: Exercise = {
  id: 'test-straddle',
  name: 'TEST — Seated Straddle',
  section: 'BODY + RANGE',
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
  section: 'BODY + RANGE',
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
  section: 'BODY + RANGE',
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

const MAX_PULLUPS: Exercise = {
  id: 'test-max-pullups',
  name: 'TEST — Max Strict Pull-Ups',
  section: 'ENDURANCE',
  capacities: ['pull'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 15, unit: 'reps', restSec: 300,
  load: { kind: 'bodyweight', text: 'Bodyweight, one all-out set' },
  progression: 'Enter the strict reps. Solid is 15, strong is 20.',
  protocolId: 'assessment',
  note: 'First endurance test, five minutes after the strength block: one set to failure.',
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

const REPEATERS: Exercise = {
  id: 'test-repeaters',
  name: 'TEST — 7:3 Repeaters to Failure',
  section: 'ENDURANCE',
  capacities: ['forearm', 'crimp'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 180, unit: 'sec', restSec: 300,
  load: { kind: 'bodyweight', text: '20mm edge, half-crimp, bodyweight' },
  progression: 'Enter the completed 7s hangs. Tracked against your own previous result.',
  protocolId: 'assessment',
  note: 'Intermittent finger endurance, the second-best predictor of climbing grade after finger strength. It empties the forearms, so it comes after the hangs and pulls. Skip it if the fingers are complaining today.',
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

const PUSHUPS: Exercise = {
  id: 'test-pushups',
  name: 'TEST — Max Push-Ups',
  section: 'ENDURANCE',
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

const TOES_TO_BAR: Exercise = {
  id: 'test-toes-to-bar',
  name: 'TEST — Max Strict Toes-to-Bar',
  section: 'TRUNK',
  capacities: ['tension'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 10, unit: 'reps', restSec: 180,
  load: { kind: 'bodyweight', text: 'Bodyweight, one all-out set' },
  progression: 'Enter the strict reps. Tracked against your own last result.',
  protocolId: 'assessment',
  note: 'Replaces the front lever ramp: a rep counts or it does not, so it can be scored alone.',
  records: {
    benchmarkId: 'toes-to-bar',
    axis: { unit: 'reps', step: 1, min: 0, max: 50, prefix: '', label: 'STRICT REPS' },
    convert: 'identity',
  },
  form: {
    setup: 'Dead hang, shoulder-width overhand grip, legs together. Same grip every test: ab straps are fine if they are used every time.',
    execution: 'Lift the legs until the toes touch the bar, lower under control to a still dead hang. The set ends at the first rep that misses the bar or needs a swing.',
    cue: 'Compression and straight-arm lat work on a bar: the same chain the front lever loads, scored as reps.',
    breathing: 'Exhale on the way up.',
    mistakes: 'Kipping off the swing. Bending the arms to shorten the lever. Counting a rep the toes did not touch.',
  },
};

const HOLLOW_HOLD: Exercise = {
  id: 'test-hollow-hold',
  name: 'TEST — Hollow Body Hold',
  section: 'TRUNK',
  capacities: ['tension'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 60, unit: 'sec', restSec: 120,
  load: { kind: 'bodyweight', text: 'On the mat, arms overhead, lower back pressed down' },
  progression: 'Enter the seconds held. Tracked against your own last result.',
  protocolId: 'assessment',
  note: 'Replaces the McGill flexor hold, which needs a wedge or a partner.',
  records: {
    benchmarkId: 'hollow-hold',
    axis: { unit: 's', step: 1, min: 0, max: 300, prefix: '', label: 'SECONDS HELD' },
    convert: 'identity',
  },
  form: {
    setup: 'On your back, lower back pressed flat into the mat. Arms straight overhead by the ears, legs straight and together.',
    execution: 'Lift shoulders and feet a hand\'s width off the floor and hold. Time ends the moment the lower back leaves the mat, or a heel or hand touches down.',
    cue: 'The lower back on the mat is the judge: you can feel the moment it lifts, so no one else is needed to call it.',
    breathing: 'Short breaths, ribs kept down.',
    mistakes: 'Letting the back arch and still counting. Lifting the shoulders so high it becomes a sit-up.',
  },
};

const PRONE_HOLD: Exercise = {
  id: 'test-prone-extension',
  name: 'TEST — Prone Extension Hold',
  section: 'TRUNK',
  capacities: ['tension'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 120, unit: 'sec', restSec: 120,
  load: { kind: 'bodyweight', text: 'Face down on the mat, chest just off the floor' },
  progression: 'Enter the seconds held. Tracked against your own last result.',
  protocolId: 'assessment',
  note: 'The Ito test. Replaces the back extension hold, which needs a bench and fixed ankles.',
  records: {
    benchmarkId: 'prone-extension-hold',
    axis: { unit: 's', step: 1, min: 0, max: 400, prefix: '', label: 'SECONDS HELD' },
    convert: 'identity',
  },
  form: {
    setup: 'Face down, a folded towel or small cushion under the lower belly, arms by the sides, legs straight.',
    execution: 'Lift the chest until the breastbone just clears the floor, chin tucked, and hold. Time ends when the chest touches down.',
    cue: 'Lower-back endurance without any equipment. Lift only as far as clearing the floor: higher turns it into a test of how far you can arch.',
    breathing: 'Slow and steady.',
    mistakes: 'Arching high. Lifting the head instead of the chest. Pushing with the hands.',
  },
};

const sidePlank = (side: 'left' | 'right'): Exercise => ({
  id: `test-side-plank-${side}`,
  name: `TEST — Side Plank, ${side === 'left' ? 'Left' : 'Right'}`,
  section: 'TRUNK',
  capacities: ['tension'],
  block: 'TEST', intensity: 'MAX',
  sets: 1, work: 90, unit: 'sec', restSec: 120,
  load: { kind: 'bodyweight', text: `On the ${side} forearm, legs straight, top foot in front` },
  progression: 'Enter the seconds held. Average is about 95s; left and right should be within 5% of each other.',
  protocolId: 'assessment',
  records: {
    benchmarkId: `side-plank-${side}`,
    axis: { unit: 's', step: 1, min: 0, max: 300, prefix: '', label: 'SECONDS HELD' },
    convert: 'identity',
  },
  form: {
    setup: `Lie on the ${side} side, elbow under the shoulder, legs straight, top foot placed in front of the bottom one, free hand on the opposite shoulder.`,
    execution: 'Lift the hips into a straight line and hold. Time ends when the hips drop out of line.',
    cue: 'Both sides are recorded: the gap between them is part of the result.',
    breathing: 'Steady.',
    mistakes: 'Hips sagging or piking. Rolling forward. Resting on the free hand.',
  },
});


export const DATA_ASSESS: Circuit[] = [
  {
    id: 'assess-01', circuitNum: '01',
    title: 'ASSESS', subtitle: 'warm-up - range - strength - endurance - trunk',
    focus: 'Find the limiter. Numbers now, opinions later.',
    capacities: ['crimp', 'openhand', 'forearm', 'pull', 'press', 'tension', 'mobility'],
    illustration: 'dumbbell.svg',
    duration: 90,
    recoveryHours: 48,
    note:
      'After a rest day, every 6-8 weeks. Strength tests are ramps: set the load, '
      + 'attempt, mark MADE IT or FAILED, and the best clean attempt is saved. Other '
      + 'tests save the stepper value on DONE. SKIP anything you cannot do today. '
      + 'The first time is a baseline: expect the second test to read higher just '
      + 'from familiarity.',
    exercises: [
      WARMUP_GENERAL,
      WARMUP_PULL,
      { ...WARMUP_FINGERS, section: 'WARM-UP', sets: 4 },
      BODYWEIGHT,
      {
        id: 'test-hip-mobility',
        name: 'TEST — Foot Raise',
        section: 'BODY + RANGE',
        capacities: ['mobility'],
        block: 'TEST', intensity: 'MODERATE',
        sets: 1, work: 60, unit: 'sec', restSec: 30,
        load: { kind: 'bodyweight', text: 'No load' },
        progression: 'Enter the WEAKER side in cm. Average is about 74cm.',
        protocolId: 'assessment',
        records: {
          benchmarkId: 'hip-footraise',
          axis: { unit: 'cm', step: 1, min: 30, max: 130, prefix: '', label: 'FOOT RAISE, WEAKER' },
          convert: 'identity',
        },
        form: {
          setup: 'Stand side-on to a wall with a tape measure.',
          execution: 'Raise one foot as high as possible with the hip flexed, abducted and externally rotated, knee bent. Measure floor to heel. Both sides.',
          cue: 'Combined abduction and external rotation is what makes high steps, drop knees and bridging available. It is cheap to train and costs no recovery.',
          breathing: 'Relaxed, exhale into end range.',
          mistakes: 'Leaning the torso away to fake height. Not testing both sides.',
        },
      },
      STRADDLE,
      SIT_REACH,
      SHOULDER_REACH,
      {
        id: 'test-max-hang',
        name: 'TEST — Max Hang 20mm, 7s Ramp',
        section: 'MAX STRENGTH',
        capacities: ['crimp'],
        block: 'TEST', intensity: 'MAX',
        sets: 5, work: 7, unit: 'sec', restSec: 120,
        load: { kind: 'added-kg', text: 'Each hang heavier than the last; minus for a counterweight' },
        progression: 'Enter the load of each attempt, then MADE IT or FAILED. The heaviest clean 7s is saved as (bodyweight + added) / bodyweight.',
        protocolId: 'assessment',
        note: 'A ramp, not sets: 4-8 hangs, each 2-5kg heavier, 2 minutes apart, reaching your max inside that window so fatigue never decides it.',
        ramp: { maxAttempts: 8, startBelow: 8 },
        records: {
          benchmarkId: 'fs-2arm-20mm',
          axis: { unit: 'kg', step: 1, min: -30, max: 80, prefix: '+', label: 'THIS ATTEMPT, ADDED' },
          convert: 'added-kg-to-pct-bw',
        },
        form: {
          setup: '20mm flat edge, half-crimp, thumb off. Same edge, grip and shoulder position every test.',
          execution: 'Hang seven seconds with straight arms and engaged shoulders. Two minutes off, add 2-5kg (less as it gets hard), repeat. The first hang that slips, opens or stops short is FAILED: the previous one is your score.',
          cue: 'This is the Lattice protocol, and their grade standards are built on it. Finger strength explains about two thirds of the difference in climbing grade between climbers, so this is the number that matters most.',
          breathing: 'Breathe normally through the hang.',
          mistakes: 'Jumping straight to a max. Taking more than eight attempts. Changing the edge between tests. Counting a hang where the grip opened.',
        },
      },
      {
        id: 'test-weighted-pullup',
        name: 'TEST — Weighted Pull-Up 2RM Ramp',
        section: 'MAX STRENGTH',
        capacities: ['pull'],
        block: 'TEST', intensity: 'MAX',
        sets: 4, work: 2, unit: 'reps', restSec: 180,
        load: { kind: 'added-kg', text: 'Two strict reps per attempt, heavier each time' },
        progression: 'Enter the belt load of each attempt, then MADE IT if both reps were clean. The heaviest clean pair is saved. Lattice\'s standard is 165%.',
        protocolId: 'assessment',
        note: 'Five minutes after the hangs. Three to five attempts after the warm-up pull-ups, three minutes apart.',
        ramp: { maxAttempts: 6, startBelow: 8 },
        records: {
          benchmarkId: 'weighted-pullup-2rm',
          axis: { unit: 'kg', step: 1, min: 0, max: 80, prefix: '+', label: 'THIS ATTEMPT, ADDED' },
          convert: 'added-kg-to-pct-bw',
        },
        form: {
          setup: 'Weight belt, shoulder-width overhand grip, dead hang start.',
          execution: 'Two reps: chin over the bar, full dead hang between them, no kip. Three minutes off, add weight, repeat. The first pair that is not clean is FAILED.',
          cue: 'Tested as a 2RM because that is how Lattice collected the 165% standard, so the number compares straight across with no estimate in between.',
          breathing: 'Exhale on each pull.',
          mistakes: 'Kipping the second rep. Not returning to a dead hang. Adding too much at once and failing early.',
        },
      },
      MAX_PULLUPS,
      REPEATERS,
      PUSHUPS,
      TOES_TO_BAR,
      HOLLOW_HOLD,
      PRONE_HOLD,
      sidePlank('left'),
      sidePlank('right'),
    ],
  },
];
