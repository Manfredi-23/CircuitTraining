// =============================================================================
// adjust.ts — HARDER and EASIER on the workout card
//
// "Too easy" changes the prescription for good: the tap is stored as a tweak
// on the exercise (types.ts ExerciseTweak) and every later session builds it
// that way, wherever the exercise appears, until it is reset.
//
// What a tap moves, in order:
// 1. The variation ladder, one rung. Harder stops one rung above what the level
//    has earned.
// 2. The work: 2 reps or 5 seconds, between half and double the written work.
//    Never on fixed protocols, tests, PRIMARY or maximal work.
// Easier undoes an added rep before it drops a rung, and harder undoes a
// removed rep before it climbs one, so a tap back always reverses the last tap.
// Loaded exercises get harder on the stepper, which already carries over.
// Rest is never touched: rest on quality work is set by physiology.
// Pure functions, no React.
// =============================================================================

import {
  scaleWork, tweakedVariation, variationShiftRange, workAdjustable, workBounds, workStep,
} from './engine';
import { getLoadAxis } from './load';
import type { EnergyKey, Exercise, ExerciseTweak, Progress } from './types';

export type AdjustDir = 1 | -1;

export type AdjustResult =
  | { ok: true; tweak: ExerciseTweak; text: string }
  | { ok: false; text: string };

const clean = (t: ExerciseTweak): ExerciseTweak => {
  const out: ExerciseTweak = {};
  if (t.variation) out.variation = t.variation;
  if (t.work) out.work = t.work;
  return out;
};

export function isTweaked(t: ExerciseTweak | undefined): boolean {
  return Boolean(t && (t.variation || t.work));
}

/** Whether HARDER / EASIER apply to this exercise at all. */
export function adjustable(exercise: Exercise): boolean {
  return !exercise.fixed && !exercise.ramp && !exercise.records && exercise.block !== 'WARMUP';
}

export function adjust(
  exercise: Exercise,
  progress: Progress,
  energy: EnergyKey,
  tweak: ExerciseTweak | undefined,
  dir: AdjustDir,
): AdjustResult {
  if (!adjustable(exercise)) return { ok: false, text: 'A fixed protocol: taken as written.' };

  const t: ExerciseTweak = { ...tweak };
  const shift = t.variation ?? 0;
  const work = t.work ?? 0;
  const [lowShift, highShift] = variationShiftRange(exercise, progress);
  // The shift the engine actually applies: a stored shift beyond the range is clamped.
  const applied = Math.max(lowShift, Math.min(highShift, shift));
  const canWork = workAdjustable(exercise);
  const base = scaleWork(exercise, energy);
  const [lo, hi] = workBounds(base);
  const step = workStep(exercise);
  const unit = exercise.unit === 'sec' ? 's' : ' reps';

  const moveWork = (delta: number): AdjustResult | null => {
    const next = Math.max(lo, Math.min(hi, base + work + delta)) - base;
    if (next === work) return null;
    return {
      ok: true, tweak: clean({ ...t, work: next }),
      text: `${base + work}${unit} to ${base + next}${unit}. Kept for next time.`,
    };
  };
  const moveVariation = (delta: number): AdjustResult | null => {
    const next = applied + delta;
    if (next < lowShift || next > highShift) return null;
    const v = tweakedVariation(exercise, progress, next);
    return { ok: true, tweak: clean({ ...t, variation: next }), text: `${v?.name ?? exercise.name}. Kept for next time.` };
  };

  const steps: Array<() => AdjustResult | null> = dir > 0
    ? [() => (work < 0 ? moveWork(step) : null), () => moveVariation(1), () => (canWork ? moveWork(step) : null)]
    : [() => (work > 0 ? moveWork(-step) : null), () => moveVariation(-1), () => (canWork ? moveWork(-step) : null)];
  for (const s of steps) {
    const r = s();
    if (r) return r;
  }

  if (getLoadAxis(exercise)) {
    return { ok: false, text: dir > 0 ? 'Add load on the stepper: it opens there next time.' : 'Take load off on the stepper.' };
  }
  return { ok: false, text: dir > 0 ? 'Nothing harder here until the next level.' : 'Already the easiest version.' };
}

/** One line on the card saying what the tweak does, or null when there is none. */
export function describeTweak(exercise: Exercise, tweak: ExerciseTweak | undefined): string | null {
  if (!isTweaked(tweak)) return null;
  const parts: string[] = [];
  if (tweak!.variation) parts.push(`${tweak!.variation > 0 ? 'harder' : 'easier'} variation`);
  if (tweak!.work) {
    const unit = exercise.unit === 'sec' ? 's' : ' reps';
    parts.push(`${tweak!.work > 0 ? '+' : ''}${tweak!.work}${unit}`);
  }
  return `YOUR CHANGE: ${parts.join(', ')}`;
}

/** Sets an exercise may run today after +/- SET: never below the sets already done, never above 8. */
export function setBounds(exercise: Exercise, doneSoFar: number): [number, number] | null {
  if (exercise.fixed || exercise.ramp || exercise.records || exercise.block === 'WARMUP') return null;
  return [Math.max(1, doneSoFar), 8];
}
