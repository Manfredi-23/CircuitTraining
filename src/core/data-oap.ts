// =============================================================================
// data-oap.ts — The one-arm pull-up path, shared by every session that uses it
//
// The athlete wants a one-arm pull-up. It lives in two places — CAVE 01 STRONG,
// where the arms are fresh, and CAVE 02 PULL + PUSH after bouldering — so the
// exercises are built here once and given a session-specific id, keeping the
// load log per session and the prescription in one place.
//
// The ladder follows Lattice's one-arm menu (scap shrugs, lock-offs, archers,
// assisted one-arms, assisted negatives, weighted pull-ups, hammer curls):
// two or three of them a week, low reps, long rest. Weighted two-arm pull-ups
// stay the main driver until the gates open — a two-arm pull-up with roughly
// half of bodyweight added is about the strength of one one-arm pull-up.
//
// Loading one arm with the whole body is the elbow's worst day, so the genuinely
// one-armed work is gated on a TESTED weighted pull-up, never on XP:
//   assisted one-arm pull-ups  weighted pull-up 2RM >= 131% bodyweight
//   one-arm negatives          weighted pull-up 2RM >= 141% bodyweight
// These are the original 140% and 150% one-rep thresholds expressed on the
// 2RM scale ASSESS now tests (1RM = 2RM x 1.067, Epley). A result recorded
// with the old 5RM method still counts, converted (see gateResult).
// Record the number in TEST 01 ASSESS; until then the gate shows the
// two-handed-but-lopsided substitute instead.
// =============================================================================

import type { Exercise } from './types';

export const OAP_ASSISTED_GATE = 131;
export const OAP_NEGATIVE_GATE = 141;

/**
 * Uneven grip, then archer, then typewriter: both hands on, the load shifted
 * progressively onto one. The substitute whenever the assisted gate is shut.
 */
export function oneArmPath(id: string): Exercise {
  return {
    id,
    name: 'One-Arm Path — Lopsided Pull-Ups',
    capacities: ['pull'],
    block: 'SECONDARY', intensity: 'HARD',
    sets: 3, work: 3, unit: 'reps', restSec: 150,
    load: { kind: 'bodyweight', text: 'Bodyweight. The lower hand only helps as much as it has to.' },
    perSide: true,
    progression:
      'Three clean reps a side on every set, then lower the helping hand (uneven grip) or '
      + 'straighten the helping arm more (archer). Next rung only when the current one is easy.',
    protocolId: 'one-arm-pull',
    note: 'Three reps with the working arm high, then swap. Full dead hang every rep.',
    variations: [
      { minLevel: 1, name: 'Uneven-Grip Pull-Up', load: 'One hand on the bar, the other on a sling or towel 30cm lower' },
      { minLevel: 3, name: 'Archer Pull-Up', load: 'Wide grip, pull to one hand, the other arm near straight' },
      { minLevel: 5, name: 'Typewriter Pull-Up', load: 'Pull to one hand, slide across at the top, lower from the other' },
    ],
    form: {
      setup: 'Uneven grip: working hand on the bar, the other on a sling or towel hanging 30cm lower. Archer: grip twice shoulder width. Shoulders engaged before the pull starts.',
      execution: 'Pull the chest to the working hand, elbow driving down to the ribs. The other hand guides and assists, never leads. Lower under control to a full dead hang.',
      cue: 'Squeeze the free side of the ribs down. A one-arm pull is as much trunk as arm: without it the body rotates away from the bar.',
      breathing: 'Exhale on the pull.',
      mistakes: 'Letting the helping hand do the work. Twisting the body to cheat the top. Cutting the bottom half of the rep, which is where one-arm pull-ups are lost.',
    },
  };
}

/**
 * The real movement with the load taken off: a pulley counterweight in the gym
 * (logged, so the assistance falls toward zero), a band at home.
 */
export function assistedOneArm(
  id: string,
  substituteId: string,
  assist: 'pulley' | 'band',
): Exercise {
  const pulley = assist === 'pulley';
  return {
    id,
    name: 'Assisted One-Arm Pull-Up',
    capacities: ['pull'],
    block: 'SECONDARY', intensity: 'HARD',
    sets: 3, work: 3, unit: 'reps', restSec: 180,
    load: pulley
      ? { kind: 'assisted', value: 20, text: 'Pulley counterweight: the least that still gives three clean reps' }
      : { kind: 'band', text: 'Band in the free hand: grip lower on it to take assistance away' },
    perSide: true,
    progression: pulley
      ? 'Three clean reps a side on every set, then take 1-2kg off the counterweight. Zero is the goal.'
      : 'Three clean reps a side, then grip the band lower, then a lighter band.',
    protocolId: 'one-arm-pull',
    gate: {
      benchmarkId: 'weighted-pullup-2rm',
      minValue: OAP_ASSISTED_GATE,
      reason:
        'Assisted one-arm pull-ups put the whole pull through one elbow. They open when a '
        + 'tested weighted pull-up 2RM reaches 131% bodyweight (about +19kg for two clean reps at 62kg) — record it '
        + 'in TEST 01 ASSESS. Until then the lopsided two-hand ladder builds the same strength '
        + 'with the load shared.',
      substituteId,
    },
    form: {
      setup: pulley
        ? 'Pulley under the bar with a handle on the counterweight side. Working hand on the bar, free hand on the handle, straight arm.'
        : 'Band looped over the bar. Working hand on the bar, free hand holding the band — higher on the band is more help.',
      execution: 'Engage the shoulder, then pull the chest to the working hand, elbow to the ribs. Two to three seconds on the way down. Full dead hang between reps.',
      cue: 'The free hand holds on, it does not pull. If the free arm bends, the assistance is doing the rep.',
      breathing: 'Exhale on the pull.',
      mistakes: 'Rushing the lowering. Starting from a bent arm. Grinding a fourth rep — the elbow pays for that, not the lat.',
    },
  };
}

/**
 * Slow lowering on one arm. Eccentrics build arm strength fastest and irritate
 * elbows fastest, so this is gated a step past the assisted pulls and has no
 * substitute: while shut, it simply is not in the session.
 */
export function oneArmNegative(id: string): Exercise {
  return {
    id,
    name: 'One-Arm Negative',
    capacities: ['pull'],
    block: 'SECONDARY', intensity: 'HARD',
    sets: 3, work: 2, unit: 'reps', restSec: 180,
    load: { kind: 'assisted', value: 10, text: 'Pulley assist as needed: five seconds down, controlled all the way' },
    perSide: true,
    progression: 'Two five-second lowerings a side, then less counterweight. Never more reps.',
    protocolId: 'one-arm-pull',
    gate: {
      benchmarkId: 'weighted-pullup-2rm',
      minValue: OAP_NEGATIVE_GATE,
      reason: 'One-arm negatives open at a tested 141% bodyweight weighted pull-up 2RM (about +25kg for two at 62kg).',
    },
    form: {
      setup: 'Step or jump to the top position on one arm, chin over the bar, free hand on the pulley handle or at the side.',
      execution: 'Lower for a full five seconds to a dead hang, slowest through 90 degrees. Step back up, do not pull back up.',
      cue: 'The elbow should feel worked, never sharp. Any pain on the inside of the elbow ends the exercise for the week.',
      breathing: 'Slow exhale through the whole lowering.',
      mistakes: 'Dropping through the bottom third. Adding reps instead of removing assistance.',
    },
  };
}

/** One-arm scapular shrug. A prerequisite on every one-arm list, and cheap. */
export function oneArmShrug(id: string): Exercise {
  return {
    id,
    name: 'One-Arm Scap Shrug',
    capacities: ['pull', 'shoulder'],
    block: 'PREHAB', intensity: 'EASY',
    sets: 2, work: 5, unit: 'reps', restSec: 45,
    load: { kind: 'bodyweight', text: 'One arm on the bar, feet assisting as needed' },
    perSide: true,
    progression: 'Feet off the floor, then a two-second hold at the top of each shrug.',
    protocolId: 'prehab',
    note: 'The shoulder is the first joint a one-arm pull asks to engage. Five a side before the pull.',
    form: {
      setup: 'Hang from a bar or jug with one hand, arm straight, feet touching a box or the floor if needed.',
      execution: 'Without bending the elbow, pull the shoulder down away from the ear, lifting the body a few centimetres. Lower slowly back to a relaxed hang.',
      cue: 'Every one-arm pull starts here. A shoulder that cannot engage alone hands the load to the elbow.',
      breathing: 'Exhale on the shrug.',
      mistakes: 'Bending the elbow to fake the lift. Dropping into the bottom of the hang.',
    },
  };
}
