// =============================================================================
// data-hang.ts — HANG mode: dedicated finger sessions
// Equipment: hangboard with a 20mm flat edge, pulley or weight belt, small
//            portable edge for the density block.
//
// Three sessions, three distinct qualities:
//   01 MAX HANGS  — maximal strength. Long rests. Quality over quantity.
//   02 CAPACITY   — repeaters and critical force. The route climber's session.
//   03 DENSITY    — 10 minutes at 40%. Daily-safe. The highest-ROI habit here.
//
// Sessions 01 and 02 must be at least 48h apart. Session 03 does not count
// against that: it is deliberately far below the threshold that needs recovery.
// =============================================================================

import type { Circuit } from './types';

export const DATA_HANG: Circuit[] = [
  {
    id: 'hang-01', circuitNum: '01',
    title: 'MAX HANGS', subtitle: 'half-crimp - open hand',
    focus: 'Raise peak finger force. Eight working hangs, nothing else.',
    capacities: ['crimp', 'openhand'],
    illustration: 'maxhangs.svg',
    duration: 35,
    recoveryHours: 48,
    note: 'Eight hard hangs is the whole session. Adding volume here costs recovery and buys nothing.',
    exercises: [
      {
        id: 'hang-warmup-pulse',
        name: 'Pulse Raiser + Shoulder Prep',
        capacities: ['shoulder'],
        block: 'WARMUP', intensity: 'EASY',
        sets: 1, work: 300, unit: 'sec', restSec: 30,
        load: { kind: 'bodyweight', text: 'No load' },
        fixed: true,
        progression: 'Never progressed. This is preparation, not training.',
        protocolId: 'warmup',
        note: 'Skipping rope or arm swings, then band external rotations and scapular pull-ups.',
        form: {
          setup: 'Somewhere with room to swing your arms. Band anchored at elbow height for the rotations.',
          execution: 'Two to three minutes raising the pulse. Then 15 band external rotations per side, 10 scapular pull-ups, 10 shoulder circles each direction.',
          cue: 'You want warm, not tired. If you are breathing hard, back off.',
          breathing: 'Nasal, relaxed. This should feel easy throughout.',
          mistakes: 'Going straight to the board cold. Turning the warm-up into a workout.',
        },
      },
      {
        id: 'hang-warmup-progressive',
        name: 'Progressive Finger Loading',
        capacities: ['crimp', 'openhand'],
        block: 'WARMUP', intensity: 'EASY',
        sets: 4, work: 10, unit: 'sec', restSec: 60,
        load: { kind: 'percent-max', value: 50, text: 'Jug > 30mm > 20mm, 40-60% effort' },
        fixed: true,
        progression: 'Never progressed. Same four hangs every session.',
        protocolId: 'warmup',
        note: 'Set 1-2 jug. Set 3 on 30mm. Set 4 on 20mm at about 60%. Feet on the floor as needed.',
        form: {
          setup: 'Start on the largest hold on the board. Shoulders packed, elbows soft, ribs down.',
          execution: 'Ten seconds on, sixty off, stepping down in hold size each set. Take weight off with your feet to control the load.',
          cue: 'The fourth hang is the readiness check. If any finger feels sharp, tight or tender, the session becomes a density session instead.',
          breathing: 'Breathe normally through every hang. If you cannot, the load is too high for a warm-up.',
          mistakes: 'Jumping straight onto the 20mm edge. Ignoring a warning signal because the session is written down.',
        },
      },
      {
        id: 'max-hang-halfcrimp',
        name: 'Max Hang — Half-Crimp 20mm',
        capacities: ['crimp'],
        block: 'PRIMARY', intensity: 'MAX',
        sets: 5, work: 10, unit: 'sec', restSec: 180,
        load: { kind: 'percent-max', value: 88, text: '20mm, 85-90% of tested 10s max' },
        progression:
          'When all five sets are clean at 10s with no form breakdown on the last set, '
          + 'add 1-2kg next session. If set 5 fails short, hold the load until it does not.',
        protocolId: 'max-hang',
        variations: [
          { minLevel: 1, name: 'Half-Crimp 20mm — Assisted', load: 'Pulley assistance to reach a hard 10s' },
          { minLevel: 3, name: 'Half-Crimp 20mm — Bodyweight', load: 'Bodyweight, 10s hard' },
          { minLevel: 4, name: 'Half-Crimp 20mm — Weighted', load: '20mm + added weight' },
          { minLevel: 6, name: 'Half-Crimp 20mm — Heavy', load: '20mm, 130%+ bodyweight' },
          { minLevel: 7, name: 'Half-Crimp 15mm', load: '15mm edge. Only once 20mm is well past 140%.' },
        ],
        form: {
          setup: 'Fingers on the 20mm edge, second knuckles bent to about 90 degrees, first knuckles extended, thumb off. Arms slightly bent, shoulders pulled down and back, ribs down, glutes on.',
          execution: 'Ten seconds. Come off before form breaks, not after. Step off deliberately rather than dropping.',
          cue: 'Pull the edge toward you rather than hanging off it. The whole body is a plank, not a rag.',
          breathing: 'Breathe through the hang. Holding your breath spikes tension in the shoulders and shortens the hang.',
          mistakes: 'Letting the fingers drift into a full crimp or an open drag when it gets hard — that is a different exercise at a different load. Straight locked elbows. Adding weight before the current load is clean.',
        },
      },
      {
        id: 'max-hang-openhand',
        name: 'Max Hang — Three-Finger Drag 20mm',
        capacities: ['openhand'],
        block: 'PRIMARY', intensity: 'MAX',
        sets: 3, work: 10, unit: 'sec', restSec: 180,
        load: { kind: 'percent-max', value: 88, text: '20mm three-finger drag, 85-90% of max' },
        progression: 'Same rule as half-crimp: five clean seconds on the last set before adding load.',
        protocolId: 'max-hang',
        note: 'Index, middle and ring. Open position, no thumb. Expect roughly 70-80% of your half-crimp load.',
        variations: [
          { minLevel: 1, name: 'Four-Finger Open Hand 20mm' },
          { minLevel: 4, name: 'Three-Finger Drag 20mm' },
          { minLevel: 6, name: 'Three-Finger Drag 20mm — Weighted' },
        ],
        form: {
          setup: 'Fingers draped over the edge, knuckles almost flat, thumb resting alongside and doing nothing.',
          execution: 'Ten seconds. Resist the urge to curl into a crimp as fatigue arrives.',
          cue: 'This grip is the one that keeps working when the crimp is sore. Train it like it matters, because it does on real rock.',
          breathing: 'Steady through the hang.',
          mistakes: 'Sliding into a crimp mid-hang. Using the pinky, which changes the exercise.',
        },
      },
    ],
  },
  {
    id: 'hang-02', circuitNum: '02',
    title: 'CAPACITY', subtitle: 'repeaters - critical force',
    focus: 'The route climber session: sustain force and recover between moves.',
    capacities: ['forearm', 'crimp'],
    illustration: 'hangboard.svg',
    duration: 45,
    recoveryHours: 24,
    note: 'Load is 55-65% of your max hang. At L5 the critical force block is added — if time is short, drop to four sets of repeaters rather than skipping it.',
    exercises: [
      {
        id: 'hang02-warmup-pulse',
        name: 'Pulse Raiser + Shoulder Prep',
        capacities: ['shoulder'],
        block: 'WARMUP', intensity: 'EASY',
        sets: 1, work: 300, unit: 'sec', restSec: 30,
        load: { kind: 'bodyweight', text: 'No load' },
        fixed: true,
        progression: 'Never progressed.',
        protocolId: 'warmup',
        form: {
          setup: 'Room to move. Band available.',
          execution: 'Three minutes pulse raiser, then band external rotations and scapular pull-ups.',
          cue: 'Warm, not tired.',
          breathing: 'Easy and nasal.',
          mistakes: 'Skipping it because the session is only submaximal.',
        },
      },
      {
        id: 'hang02-warmup-progressive',
        name: 'Progressive Finger Loading',
        capacities: ['crimp', 'openhand'],
        block: 'WARMUP', intensity: 'EASY',
        sets: 3, work: 10, unit: 'sec', restSec: 60,
        load: { kind: 'percent-max', value: 45, text: 'Jug > 30mm > 20mm, easy' },
        fixed: true,
        progression: 'Never progressed.',
        protocolId: 'warmup',
        form: {
          setup: 'Largest hold first, stepping down in size.',
          execution: 'Ten seconds on, sixty off, three sets.',
          cue: 'Check in with the fingers before loading them for twelve minutes straight.',
          breathing: 'Normal.',
          mistakes: 'Going too hard and blunting the repeaters that follow.',
        },
      },
      {
        id: 'repeaters-73',
        name: 'Repeaters 7:3',
        capacities: ['forearm', 'crimp'],
        block: 'PRIMARY', intensity: 'HARD',
        sets: 6, work: 60, unit: 'sec', restSec: 150,
        load: { kind: 'percent-max', value: 60, text: '55-65% of max hang load' },
        fixed: true,
        progression:
          'Six sets is the dose. Progress by load: when all six complete without the last '
          + 'rep dropping early, add 1kg.',
        protocolId: 'repeaters',
        note: '7s on, 3s off, six times = one 60s set. Half-crimp on 20mm.',
        variations: [
          { minLevel: 1, name: 'Repeaters 7:3 — Assisted', load: 'Pulley assist to reach 55-65%' },
          { minLevel: 3, name: 'Repeaters 7:3 — Bodyweight' },
          { minLevel: 5, name: 'Repeaters 7:3 — Weighted' },
        ],
        form: {
          setup: 'Same half-crimp position as max hangs. Timer running before you start so you are not watching a clock.',
          execution: 'Seven on, three off, six times. In the three seconds off, shake out and let blood back in — do not just relax on the edge.',
          cue: 'The last two reps of each set should be a fight. If set six feels the same as set one, add load next time.',
          breathing: 'Deep and rhythmic. Exhale during the three-second releases.',
          mistakes: 'Going too heavy and turning it into six short max hangs. Hanging on through the rest windows. Cutting the last set because it burns.',
        },
      },
      {
        id: 'critical-force-block',
        name: 'Critical Force Block',
        capacities: ['forearm'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 1, work: 240, unit: 'sec', restSec: 300,
        fixed: true,
        load: { kind: 'percent-max', value: 65, text: 'At or just above critical force, roughly 60-70% of max' },
        progression: 'Retest critical force every 6-8 weeks and reset the training load from it.',
        protocolId: 'critical-force',
        minLevel: 5,
        note: '7s on / 3s off continuously for 4 minutes. 24 pulls. Brutal and boring.',
        form: {
          setup: 'Same edge and grip as repeaters. Five clear minutes.',
          execution: 'Twenty-four consecutive 7:3 cycles at a load you can just sustain. The last minute should be at the edge of failure without falling off.',
          cue: 'This is the closest thing on a board to being pumped mid-route and having to keep going. Train the thing you keep failing on.',
          breathing: 'Settle into a rhythm early. Panic breathing burns the set.',
          mistakes: 'Starting too heavy and blowing up at 2 minutes. Reducing effort in the middle to survive to the end.',
        },
      },
      {
        id: 'dead-hang-3grip',
        name: 'Dead Hang — Grip Rotation',
        capacities: ['forearm', 'openhand'],
        block: 'ACCESSORY', intensity: 'MODERATE',
        sets: 3, work: 45, unit: 'sec', restSec: 60,
        load: { kind: 'bodyweight', text: 'Bodyweight on a jug or large edge' },
        progression: 'Add 5s per set when 45s is comfortable, up to 60s. Then add load rather than time.',
        note: 'Switch grip every 15s: half-crimp, open hand, three-finger drag.',
        form: {
          setup: 'Large hold or bar. Shoulders packed, not passive.',
          execution: 'Forty-five seconds, changing grip every fifteen without dropping off.',
          cue: 'Pull the shoulders down and imagine bending the bar apart. A passive hang trains nothing but skin tolerance.',
          breathing: 'Slow and even.',
          mistakes: 'Dead shoulders. Hanging on skin and pain tolerance instead of position.',
        },
      },
    ],
  },
  {
    id: 'hang-03', circuitNum: '03',
    title: 'DENSITY', subtitle: 'low load - high frequency',
    focus: 'Ten minutes at 40%. Twice a day if you like. The cheapest strength on offer.',
    capacities: ['crimp', 'openhand'],
    illustration: 'hangboard.svg',
    duration: 12,
    recoveryHours: 0,
    note: 'Feet stay on the floor. Light strain only. This never counts as a hard finger day.',
    exercises: [
      {
        id: 'density-hangs',
        name: 'Density Hangs',
        capacities: ['crimp', 'openhand'],
        block: 'PRIMARY', intensity: 'EASY',
        sets: 10, work: 10, unit: 'sec', restSec: 50,
        load: { kind: 'percent-max', value: 40, text: 'About 40% of max — light strain, feet on the ground' },
        fixed: true,
        progression:
          'Do not chase load. Progress by doing it more often: one block daily, then '
          + 'two blocks at least 6h apart. Load only creeps up as bodyweight support reduces naturally.',
        protocolId: 'density-hang',
        note: 'Alternate grips across the ten hangs: half-crimp, open hand, three-finger drag, two-finger pockets if healthy.',
        form: {
          setup: 'Any edge, at home or the gym. Stand under it with both feet on the floor and take only part of your weight through the fingers.',
          execution: 'Ten seconds on, fifty seconds off, ten times. Ten minutes, one hundred seconds of hanging.',
          cue: 'It should feel almost too easy. That is the protocol working as designed, not you slacking.',
          breathing: 'Completely normal. Have a conversation through it.',
          mistakes: 'Turning it into a max session because it feels too light. Doing it twice a day with less than six hours between blocks.',
        },
      },
    ],
  },
];
