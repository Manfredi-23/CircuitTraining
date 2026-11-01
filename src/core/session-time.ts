// =============================================================================
// session-time.ts — How much is left (v43)
//
// The workout card and rest say the minutes left and when the session ends,
// and an addition says what it costs before it goes in. The same arithmetic
// as `estimateDuration`, over what remains: the sets of the exercise in hand
// not yet done, then everything after it, rest included. Pure, no React.
// =============================================================================

import { estimateDuration, exerciseSeconds } from './engine';
import type { ScaledExercise } from './types';

/**
 * Seconds of work and rest left. `setIndex` is the set in hand (1-based), on
 * the workout card being done, on rest coming up: either way not done yet.
 */
export function secondsLeft(list: ScaledExercise[], stepIndex: number, setIndex: number): number {
  let s = 0;
  list.forEach((ex, i) => {
    if (i < stepIndex) return;
    const sets = i === stepIndex ? Math.max(0, ex.scaledSets - (setIndex - 1)) : ex.scaledSets;
    s += exerciseSeconds(ex, sets);
  });
  const last = list[list.length - 1];
  return Math.max(0, s - (last && stepIndex < list.length ? last.scaledRest : 0));
}

export function minutesLeft(list: ScaledExercise[], stepIndex: number, setIndex: number): number {
  return Math.max(0, Math.round(secondsLeft(list, stepIndex, setIndex) / 60));
}

/** "~19:42": the clock time the session ends. */
export function finishTime(list: ScaledExercise[], stepIndex: number, setIndex: number, now = new Date()): string {
  const end = new Date(now.getTime() + secondsLeft(list, stepIndex, setIndex) * 1000);
  return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
}

/** What an addition costs, and the session's minutes left with it in. */
export function addCost(
  extra: ScaledExercise[], list: ScaledExercise[], stepIndex: number, setIndex: number,
): { minutes: number; total: number } {
  const minutes = extra.length ? estimateDuration(extra) + Math.round(extra[extra.length - 1].scaledRest / 60) : 0;
  return { minutes, total: minutesLeft(list, stepIndex, setIndex) + minutes };
}

/** "+6 MIN, 34 LEFT IN ALL" */
export function costLabel(cost: { minutes: number; total: number }): string {
  return `+${cost.minutes} MIN, ${cost.total} LEFT IN ALL`;
}
