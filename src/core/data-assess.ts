// =============================================================================
// data-assess.ts — TEST mode: the benchmark battery
//
// Its own tab rather than a CAVE session, so it is there when wanted and out of
// the way the rest of the time. Every 6-8 weeks, on a rest day. Each TEST
// exercise records a benchmark (see `records`), and benchmarks — not XP — are
// what open the one-arm pull-up gates.
//
// Equipment is the CAVE gym: hangboard with a 20mm edge, weight belt, pull-up
// bar, tape measure.
// =============================================================================

import type { Circuit } from './types';
import { WARMUP_PULSE, WARMUP_FINGERS } from './data-cave';

export const DATA_ASSESS: Circuit[] = [
  {
    id: 'assess-01', circuitNum: '01',
    title: 'ASSESS', subtitle: 'test - not train',
    focus: 'Find the limiter. Numbers now, opinions later.',
    capacities: ['crimp', 'openhand', 'pull', 'tension', 'mobility'],
    illustration: 'dumbbell.svg',
    duration: 45,
    recoveryHours: 48,
    note:
      'Run this every 6-8 weeks on a rest day, fully warm and fresh. Enter each result on '
      + 'the stepper before the last DONE: it is saved as a benchmark, and benchmarks are '
      + 'what open the one-arm gates and draw the trend on STATS.',
    exercises: [
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
    ],
  },
];
