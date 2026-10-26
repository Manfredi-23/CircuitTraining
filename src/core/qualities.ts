// =============================================================================
// qualities.ts — Balance and power at full stretch, in every session
//
// Since v34 every training session carries a dose of both, in proportion to
// its length: one short drill in a DAILY, more on a training day. What counts:
// a balance or footwork protocol, power at full stretch (end-range-strength),
// or an exercise that says it also trains the quality (`alsoTrains`).
// Tests (ASSESS, the ring test) and the physio's ring rehab are left as they
// are.
// =============================================================================

import type { Circuit, Exercise, Quality } from './types';

const BALANCE_PROTOCOLS = ['balance', 'footwork', 'floor-footwork'];
const STRETCH_PROTOCOLS = ['end-range-strength'];

export function trains(exercise: Exercise, quality: Quality): boolean {
  if (exercise.alsoTrains?.includes(quality)) return true;
  const protocols = quality === 'balance' ? BALANCE_PROTOCOLS : STRETCH_PROTOCOLS;
  return Boolean(exercise.protocolId && protocols.includes(exercise.protocolId));
}

/** Sessions exempt from the rule: test batteries and the physio's ring plan. */
export const QUALITY_EXEMPT = ['assess-01', 'heal-03', 'heal-04'];

/** The qualities a session is missing. */
export function missingQualities(circuit: Circuit): Quality[] {
  return (['balance', 'stretch'] as Quality[])
    .filter(q => !circuit.exercises.some(e => e.block !== 'WARMUP' && trains(e, q)));
}
