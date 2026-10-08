// =============================================================================
// load.ts — What the athlete actually lifted.
//
// The v10 model progresses by load: kilos on the belt, millimetres of edge,
// percent of a tested max. That only works if the number is written down. This
// module derives the axis an exercise is logged on and reads the history back,
// so the workout card can answer the one question a max-hang session is
// really asking: what did I do last time, and am I adding to it today?
//
// Pure functions, no React — same rule as the rest of src/core.
// =============================================================================

import type { BlockType, Exercise, LoadAxis, LoadLogEntry } from './types';

/**
 * Blocks whose load is not a progression axis. Warm-ups are ramps, and prehab
 * and mobility are explicitly never taken to failure — logging kilos there
 * clutters the card and puts noise in the history that reads like progress.
 */
const UNLOGGED_BLOCKS: BlockType[] = ['WARMUP', 'PREHAB', 'MOBILITY'];

/**
 * One finger on a portable edge, the edge itself included in the total. Half
 * a kilo is the step: rehab starts at 1.5-2kg, where a whole kilo is a 50% jump.
 */
export const FINGER_KG_AXIS: LoadAxis = { unit: 'kg', step: 0.5, min: 0.5, max: 30, prefix: '', label: 'ON THE EDGE' };

/**
 * The numeric axis this exercise is logged on, or null when load is not its
 * progression axis. Bodyweight and band work progress through the variation
 * ladder instead, and asking for a number there would be noise.
 *
 * Ranges are deliberately generous rather than tuned to one athlete: the point
 * is to catch a fat-fingered entry, not to cap ambition.
 */
export function getLoadAxis(exercise: Exercise): LoadAxis | null {
  // A test result is entered on the benchmark's own stepper — seconds, cm,
  // kilos on the belt — not on the load the exercise happens to carry.
  if (exercise.records) return exercise.records.axis;

  if (UNLOGGED_BLOCKS.includes(exercise.block)) return null;

  switch (exercise.load.kind) {
    case 'added-kg':
      // 1kg steps: the smallest increment a plate stack or a belt realistically
      // gives you, and the step size the progression rules are written in.
      // 200 leaves room for a loaded barbell (HEAL), logged as the total on the bar.
      return { unit: 'kg', step: 1, min: 0, max: 200, prefix: '+', label: 'ADDED' };

    case 'assisted':
      // Logged as the assistance removed, so the number falls as you get
      // stronger and reaching zero is the milestone.
      return { unit: 'kg', step: 1, min: 0, max: 60, prefix: '-', label: 'ASSIST' };

    case 'edge-mm':
      return { unit: 'mm', step: 1, min: 6, max: 40, prefix: '', label: 'EDGE' };

    case 'percent-max':
      return { unit: '%', step: 5, min: 20, max: 100, prefix: '', label: 'INTENSITY' };

    case 'rpe':
      return { unit: 'RPE', step: 0.5, min: 5, max: 10, prefix: '', label: 'RPE' };

    case 'finger-kg':
      return FINGER_KG_AXIS;

    case 'bodyweight':
    case 'band':
    default:
      return null;
  }
}

/** The most recent logged load for an exercise, or null if it is new. */
export function getLastLoad(log: LoadLogEntry[], exerciseId: string): LoadLogEntry | null {
  let latest: LoadLogEntry | null = null;
  for (const entry of log) {
    if (entry.exerciseId !== exerciseId) continue;
    if (!latest || entry.date > latest.date) latest = entry;
  }
  return latest;
}

/** Every logged load for an exercise, oldest first. */
export function getLoadHistory(log: LoadLogEntry[], exerciseId: string): LoadLogEntry[] {
  return log
    .filter(e => e.exerciseId === exerciseId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * The value the stepper opens on: what you did last time if there is a record,
 * otherwise the prescription's own anchor, otherwise the bottom of the axis.
 * Opening on last session's number is the whole point — progression is a
 * decision to add to a known figure, not a guess from cold.
 */
export function getOpeningLoad(exercise: Exercise, log: LoadLogEntry[]): number {
  const axis = getLoadAxis(exercise);
  if (!axis) return 0;

  const last = getLastLoad(log, exercise.id);
  if (last && last.unit === axis.unit) return clampToAxis(last.value, axis);

  if (typeof exercise.load.value === 'number') return clampToAxis(exercise.load.value, axis);
  return axis.min;
}

export function clampToAxis(value: number, axis: LoadAxis): number {
  const clamped = Math.min(axis.max, Math.max(axis.min, value));
  // Snap to the axis step so half-kilo drift cannot accumulate through taps.
  const snapped = Math.round(clamped / axis.step) * axis.step;
  return Math.round(snapped * 10) / 10;
}

/** How the number reads on the card, e.g. "+14KG", "20MM", "85%". */
export function formatLoad(value: number, axis: LoadAxis): string {
  const n = Number.isInteger(value) ? String(value) : value.toFixed(1);
  if (axis.unit === 'RPE' || axis.unit === 'LVL') return `${axis.unit} ${n}`;
  if (axis.unit === 'reps') return `${n} REPS`;
  // A negative value on a '+' axis is assistance (a counterweight on a max
  // hang), so it reads as minus rather than '+-'.
  const prefix = value < 0 && axis.prefix === '+' ? '' : axis.prefix;
  return `${prefix}${n}${axis.unit.toUpperCase()}`;
}

/** Short date for the LAST readout, e.g. "04 SEP". */
export function formatLoadDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en', { month: 'short' }).toUpperCase();
  return `${day} ${month}`;
}
