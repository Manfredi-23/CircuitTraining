// =============================================================================
// session-progress.ts — where you are in a session, set by set.
//
// One group per exercise, one cell per set. Everything before the current
// exercise counts as passed (done or skipped: this is position, not
// achievement). In the current exercise the sets before `setIndex` are done
// and `setIndex` itself is the one in hand: being done on the workout card,
// or waiting at the end of rest, because the store has already moved on by
// the time rest starts.
// =============================================================================

import type { ScaledExercise } from './types';

export type CellState = 'done' | 'current' | 'todo';

export interface SessionProgress {
  /** One array per exercise, one cell per set. */
  groups: CellState[][];
  setsDone: number;
  setsTotal: number;
}

/**
 * Sets an exercise is drawn with. A ramp shows its expected attempts and grows
 * one cell at a time if the ladder runs past them.
 */
function cellsFor(ex: ScaledExercise, setIndex: number | null): number {
  const planned = Math.max(1, ex.scaledSets);
  if (ex.ramp && setIndex !== null) return Math.min(ex.ramp.maxAttempts, Math.max(planned, setIndex));
  return planned;
}

export function sessionProgress(
  list: ScaledExercise[],
  stepIndex: number,
  setIndex: number,
): SessionProgress {
  let setsDone = 0;
  let setsTotal = 0;
  const groups = list.map((ex, i) => {
    const n = cellsFor(ex, i === stepIndex ? setIndex : null);
    setsTotal += n;
    return Array.from({ length: n }, (_, s): CellState => {
      const state: CellState = i < stepIndex ? 'done'
        : i > stepIndex ? 'todo'
        : s + 1 < setIndex ? 'done'
        : s + 1 === setIndex ? 'current'
        : 'todo';
      if (state === 'done') setsDone++;
      return state;
    });
  });
  return { groups, setsDone, setsTotal };
}
