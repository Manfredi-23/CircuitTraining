// =============================================================================
// live-edit.ts — The session map: changing what is still to come (v43)
//
// Tapping the progress bar mid-session opens the whole list, phase by phase.
// Each exercise still to come can be moved to the end (DO LATER, for a busy
// rack), taken out, moved up or down among the ones to come, or given a set
// more or less. The exercise in hand and everything done stay where they are:
// this changes the future, never the record. Rest is never touched, and fixed
// protocols, tests and warm-ups keep their sets. Pure, no React.
// =============================================================================

import { setBounds } from './adjust';
import type { ScaledExercise } from './types';

/** Whether an exercise at `index` is still to come (after the one in hand). */
export const isAhead = (stepIndex: number, index: number, length: number) => index > stepIndex && index < length;

/** Move an exercise still to come to the end of the session. */
export function doLater(list: ScaledExercise[], stepIndex: number, index: number): ScaledExercise[] {
  if (!isAhead(stepIndex, index, list.length) || index === list.length - 1) return list;
  const out = [...list];
  const [ex] = out.splice(index, 1);
  out.push(ex);
  return out;
}

/** Take an exercise still to come out of today's session. */
export function dropAhead(list: ScaledExercise[], stepIndex: number, index: number): ScaledExercise[] {
  if (!isAhead(stepIndex, index, list.length)) return list;
  return list.filter((_, i) => i !== index);
}

/** Swap an exercise still to come with its neighbour, never past the one in hand. */
export function moveAhead(list: ScaledExercise[], stepIndex: number, index: number, dir: -1 | 1): ScaledExercise[] {
  const j = index + dir;
  if (!isAhead(stepIndex, index, list.length) || !isAhead(stepIndex, j, list.length)) return list;
  const out = [...list];
  [out[index], out[j]] = [out[j], out[index]];
  return out;
}

/** A set more or fewer on an exercise still to come, between 1 and 8. */
export function setsAhead(list: ScaledExercise[], stepIndex: number, index: number, delta: number): ScaledExercise[] {
  const ex = list[index];
  if (!ex || !isAhead(stepIndex, index, list.length)) return list;
  const bounds = setBounds(ex, 1);
  if (!bounds) return list;
  const sets = Math.max(bounds[0], Math.min(bounds[1], ex.scaledSets + delta));
  if (sets === ex.scaledSets) return list;
  return list.map((e, i) => (i === index ? { ...e, scaledSets: sets } : e));
}

/** Whether the sets of an exercise may change at all. */
export const setsEditable = (ex: ScaledExercise) => setBounds(ex, 1) !== null;
