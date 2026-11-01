// =============================================================================
// phases.ts — A session read as chapters (v43)
//
// The engine orders work by block (WARMUP, PRIMARY, SECONDARY, PREHAB...),
// which says how a set scales but not what it is for. The athlete reads the
// session as phases instead, each with a purpose and its minutes:
//
//   PREP      warm-ups, and mobility or prehab before the first working set
//   SKILL     feet and balance: TECHNIQUE work, the footwork, floor-footwork,
//             foot-loading and balance protocols, and anything that also trains
//             balance (the lunge drive). Early, while fresh (Horst).
//   POWER     the power protocols: fast and fresh
//   STRENGTH  the rest of the working sets
//   CORE      working sets on the abs and obliques
//   CARE      prehab and mobility after the working sets
//   TEST      ASSESS
//
// Derived, never stored: no session data changes for it. Pure, no React.
// =============================================================================

import { estimateDuration } from './engine';
import { areaOf } from './review';
import type { Exercise, ScaledExercise } from './types';

export type Phase = 'PREP' | 'SKILL' | 'POWER' | 'STRENGTH' | 'CORE' | 'CARE' | 'TEST';

export const PHASE_PURPOSE: Record<Phase, string> = {
  PREP: 'Warm and ready to move.',
  SKILL: 'Feet and balance while fresh: learn it before the strength work.',
  POWER: 'Fast and fresh. Stop when a rep slows.',
  STRENGTH: 'Heavy and controlled, full rest.',
  CORE: 'The trunk that keeps the feet on.',
  CARE: 'Shoulders, hips and hands: what keeps you climbing.',
  TEST: 'Numbers to beat.',
};

const SKILL_PROTOCOLS = new Set(['footwork', 'footwork-drill', 'floor-footwork', 'foot-loading', 'balance']);
const POWER_PROTOCOLS = new Set(['lower-power', 'upper-power', 'campus', 'limit-boulder']);
const CARE_BLOCKS = new Set(['PREHAB', 'MOBILITY']);

/** Whether an exercise is skill work, wherever it sits. */
export function isSkill(e: Pick<Exercise, 'intensity' | 'protocolId' | 'alsoTrains' | 'block'>): boolean {
  if (e.block === 'WARMUP' || e.block === 'TEST') return false;
  if (SKILL_PROTOCOLS.has(e.protocolId ?? '') || e.alsoTrains?.includes('balance')) return true;
  // TECHNIQUE on working sets is a drill; on mobility it only means "move well".
  return e.intensity === 'TECHNIQUE' && !CARE_BLOCKS.has(e.block);
}

/** The phase of one exercise. `beforeWork` says whether no working set has come yet. */
export function phaseOf(e: Exercise, beforeWork = false): Phase {
  if (e.block === 'TEST' || e.records) return 'TEST';
  if (e.block === 'WARMUP') return 'PREP';
  if (isSkill(e)) return 'SKILL';
  if (CARE_BLOCKS.has(e.block)) return beforeWork ? 'PREP' : 'CARE';
  if (POWER_PROTOCOLS.has(e.protocolId ?? '')) return 'POWER';
  if (areaOf(e) === 'CORE') return 'CORE';
  return 'STRENGTH';
}

/** The phase of every exercise in a list, in order. */
export function phasesOf(list: Exercise[]): Phase[] {
  let work = false;
  return list.map(e => {
    const p = phaseOf(e, !work);
    if (p !== 'PREP' && p !== 'SKILL' && p !== 'TEST') work = true;
    return p;
  });
}

export interface PhaseRun {
  phase: Phase;
  /** First and one-past-last index in the list. */
  start: number;
  end: number;
  minutes: number;
  names: string[];
}

/** Consecutive exercises of one phase, with their minutes. */
export function phaseRuns(list: ScaledExercise[]): PhaseRun[] {
  const phases = phasesOf(list);
  const out: PhaseRun[] = [];
  phases.forEach((p, i) => {
    const last = out[out.length - 1];
    if (last && last.phase === p) {
      last.end = i + 1;
      last.names.push(list[i].displayName);
    } else {
      out.push({ phase: p, start: i, end: i + 1, minutes: 0, names: [list[i].displayName] });
    }
  });
  for (const r of out) r.minutes = estimateDuration(list.slice(r.start, r.end));
  return out;
}

/** "STRENGTH · 2 OF 3": the phase and where the exercise sits in it. */
export function phaseTag(list: Exercise[], index: number): string {
  const phases = phasesOf(list);
  const p = phases[index];
  if (!p) return '';
  let start = index;
  while (start > 0 && phases[start - 1] === p) start--;
  let end = index + 1;
  while (end < phases.length && phases[end] === p) end++;
  return end - start > 1 ? `${p} · ${index - start + 1} OF ${end - start}` : p;
}
