// =============================================================================
// progression.ts — What the next load should be, and what counts as a best
//
// Double progression: hold the load until every planned set is done and the
// session did not feel near-maximal, then take one step. A missed set or a
// session rated 9-10 holds; so does a deload week. The suggestion is shown on
// the stepper and taken with one tap; the athlete can always ignore it.
// =============================================================================

import { getLastLoad, getLoadAxis, getLoadHistory, clampToAxis } from './load';
import type { Exercise, LoadAxis, LoadLogEntry, SessionLogEntry } from './types';

/** Session effort above which the load holds even when every set was done. */
export const HOLD_ABOVE_EFFORT = 8;

/**
 * Which way is progress on this axis. Assistance and edge depth fall as you
 * get stronger; added kilos and intensity rise. RPE is a rating, not a load.
 */
export function progressSign(exercise: Exercise, axis: LoadAxis): 1 | -1 | 0 {
  if (axis.unit === 'RPE') return 0;
  if (exercise.load.kind === 'assisted' || axis.unit === 'mm') return -1;
  return 1;
}

export type SuggestionKind = 'up' | 'hold';

export interface LoadSuggestion {
  kind: SuggestionKind;
  value: number;
  reason: string;
}

export function suggestLoad(
  exercise: Exercise,
  loadLog: LoadLogEntry[],
  sessionLog: SessionLogEntry[],
  deload = false,
): LoadSuggestion | null {
  if (exercise.records || exercise.ramp) return null;
  const axis = getLoadAxis(exercise);
  if (!axis) return null;
  const sign = progressSign(exercise, axis);
  if (sign === 0) return null;
  const last = getLastLoad(loadLog, exercise.id);
  if (!last || last.unit !== axis.unit) return null;

  if (deload) return { kind: 'hold', value: last.value, reason: 'Deload week: hold the load.' };

  // The session that logged it: same day, and it did this exercise.
  const session = [...sessionLog].reverse().find(
    s => s.date.slice(0, 10) === last.date && s.sets?.[exercise.id] !== undefined,
  );
  const planned = session?.planned?.[exercise.id];
  const done = session?.sets?.[exercise.id];
  if (planned === undefined || done === undefined) return null;

  if (done < planned) {
    return { kind: 'hold', value: last.value, reason: `Last time ${done} of ${planned} sets. Hold until all are clean.` };
  }
  if (session?.effort !== undefined && session.effort > HOLD_ABOVE_EFFORT) {
    return { kind: 'hold', value: last.value, reason: `All sets done, but the session felt ${session.effort}/10. Hold once more.` };
  }
  const next = clampToAxis(last.value + sign * axis.step, axis);
  if (next === last.value) return null;
  return { kind: 'up', value: next, reason: 'All sets done last time. One step on.' };
}

/** Whether `value` beats every earlier logged load for this exercise. */
export function isPersonalBest(exercise: Exercise, value: number, loadLog: LoadLogEntry[], today: string): boolean {
  const axis = getLoadAxis(exercise);
  if (!axis) return false;
  const sign = progressSign(exercise, axis);
  if (sign === 0) return false;
  const earlier = getLoadHistory(loadLog, exercise.id).filter(e => e.date < today && e.unit === axis.unit);
  if (earlier.length === 0) return false;
  const best = sign > 0 ? Math.max(...earlier.map(e => e.value)) : Math.min(...earlier.map(e => e.value));
  return sign > 0 ? value > best : value < best;
}
