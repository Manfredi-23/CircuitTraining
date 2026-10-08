// =============================================================================
// rehab.ts — The injured ring finger against the healthy one
//
// October 2026: the athlete hurt the left ring finger (tendon or lumbrical, the
// physio could not tell which). The physio's plan: test what the right ring
// finger lifts on a portable edge, then load the left one alone, 3 x 12 every
// second day from 1.5-2kg, adding kilos as it allows. At 80% of the right it
// is good to go.
//
// The right is recorded as a benchmark (HEAL 04 RING TEST), the left as the
// load on the stepper (HEAL 03 RING REHAB). This module reads the two together.
// Pure functions, no React.
// =============================================================================

import { latestResult, resultHistory } from './benchmarks';
import { getLoadHistory } from './load';
import type { BenchmarkResult, LoadLogEntry } from './types';

export const RING_RIGHT_BENCHMARK = 'ring-finger-right';
export const RING_LEFT_EXERCISE = 'heal-ring-left';
/** The physio's clearance: the injured finger lifts this share of the healthy one. */
export const RING_GOAL_PCT = 80;

/** Benchmarks recorded outside ASSESS, so they never count as an ASSESS. */
export const REHAB_BENCHMARKS = [RING_RIGHT_BENCHMARK];

/** Left as a whole percentage of right, or null with no right to compare to. */
export function percentOf(left: number, right: number | null | undefined): number | null {
  if (!right || right <= 0) return null;
  return Math.round((left / right) * 100);
}

/** The left load that clears the goal, rounded up to the next half kilo. */
export function goalKg(right: number, goalPct = RING_GOAL_PCT): number {
  return Math.ceil((right * goalPct) / 100 * 2) / 2;
}

export interface RingPoint {
  date: string;
  left: number;
  /** Against the right result on record that day (the first one, before any). */
  pct: number | null;
}

export interface RingRecovery {
  right: BenchmarkResult | null;
  left: LoadLogEntry | null;
  pct: number | null;
  goalKg: number | null;
  reached: boolean;
  points: RingPoint[];
}

export function getRingRecovery(loadLog: LoadLogEntry[], results: BenchmarkResult[]): RingRecovery {
  const rights = resultHistory(results, RING_RIGHT_BENCHMARK);
  const right = latestResult(results, RING_RIGHT_BENCHMARK);
  const lefts = getLoadHistory(loadLog, RING_LEFT_EXERCISE);
  const left = lefts.length ? lefts[lefts.length - 1] : null;

  // Each left session is read against the right as it stood that day, so a
  // retest of the right does not rewrite how far along the left was.
  const rightOn = (date: string) => {
    const before = rights.filter(r => r.date.slice(0, 10) <= date);
    return (before.length ? before[before.length - 1] : rights[0])?.value ?? null;
  };
  const points = lefts.map(e => ({ date: e.date, left: e.value, pct: percentOf(e.value, rightOn(e.date)) }));

  const pct = left && right ? percentOf(left.value, right.value) : null;
  return {
    right,
    left,
    pct,
    goalKg: right ? goalKg(right.value) : null,
    reached: pct !== null && pct >= RING_GOAL_PCT,
    points,
  };
}
