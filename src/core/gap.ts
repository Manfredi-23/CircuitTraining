// =============================================================================
// gap.ts — What the next grades ask of the body, against what was tested
//
// For each test with a grade standard, the latest result is read against the
// standard at the working grade, at the next goal and at the final one. The
// point is the answer to one question: is strength what stands between the
// athlete and the next grade? If every tested number already meets the next
// goal's standard, it is not, and the work belongs on the wall.
//
// Finger strength reads Lattice's published V-grade table. The weighted
// pull-up and the front lever have no published grade table: theirs below are
// approximate, built toward Lattice's 165% pull-up standard and the common
// coaching reading of the lever, and say so on the screen.
// =============================================================================

import { FONT_GRADE_MAP, currentBodyweight, getBenchmark, latestResult, standardToAddedKg } from './benchmarks';
import type { Goals } from './goals';
import type { BenchmarkResult } from './types';

export interface GradeTable {
  benchmarkId: string;
  /** Font grade (lowercase, as the benchmark tables spell it) to the standard. */
  standardAt: (fontGrade: string) => number | null;
  source: string;
  approximate: boolean;
}

/** A V-grade table on the benchmark itself, read through Font. */
function vTable(benchmarkId: string): (fontGrade: string) => number | null {
  return (font: string) => {
    const v = FONT_GRADE_MAP[font.toLowerCase()];
    return getBenchmark(benchmarkId)?.standards.find(s => s.label === v)?.value ?? null;
  };
}

/** % bodyweight, 2RM. 165% at 8A, about 5 points a grade below it. */
const PULLUP_BY_FONT: Record<string, number> = {
  '6c': 125, '6c+': 128, '7a': 132, '7a+': 136, '7b': 140, '7b+': 145, '7c': 150, '7c+': 157, '8a': 165, '8a+': 170,
};

/** Front lever level (1 tuck to 5 full): a tuck at 7A, a one-leg at 7C, a straddle at 8A. */
const LEVER_BY_FONT: Record<string, number> = {
  '6c': 1, '6c+': 1, '7a': 1, '7a+': 2, '7b': 2, '7b+': 2, '7c': 3, '7c+': 3, '8a': 4, '8a+': 4,
};

export const GRADE_TABLES: GradeTable[] = [
  {
    benchmarkId: 'fs-2arm-20mm',
    standardAt: vTable('fs-2arm-20mm'),
    source: 'Lattice Training finger strength dataset.',
    approximate: false,
  },
  {
    benchmarkId: 'weighted-pullup-2rm',
    standardAt: f => PULLUP_BY_FONT[f.toLowerCase()] ?? null,
    source: 'Approximate: built toward Lattice\'s 165% standard, about 5 points a grade below it.',
    approximate: true,
  },
  {
    benchmarkId: 'front-lever',
    standardAt: f => LEVER_BY_FONT[f.toLowerCase()] ?? null,
    source: 'Approximate: the common coaching reading of the front lever by grade.',
    approximate: true,
  },
];

export type GapStatus = 'goal' | 'next' | 'short' | 'untested';

export interface GapRow {
  benchmarkId: string;
  name: string;
  short: string;
  value: number | null;
  date: string | null;
  /** Standards at the working grade, the next goal and the final goal. */
  now: number | null;
  next: number | null;
  final: number | null;
  status: GapStatus;
  /** For % bodyweight tests short of the next goal: kilos to add on the belt. */
  addKg: number | null;
  source: string;
  approximate: boolean;
}

export interface Gap {
  rows: GapRow[];
  working: string;
  next: string;
  final: string;
  /** Every tested row meets the next goal's standard. */
  strengthReady: boolean;
  headline: string;
}

/**
 * The gap for the boulder goal. Tests never taken show as untested, except
 * the front lever, which ASSESS no longer runs: it shows only once recorded.
 */
export function boulderGap(goals: Goals, working: string, results: BenchmarkResult[]): Gap {
  const bw = currentBodyweight(results);
  const next = goals.boulder.next;
  const final = goals.boulder.final;
  const rows: GapRow[] = [];
  for (const t of GRADE_TABLES) {
    const bench = getBenchmark(t.benchmarkId);
    if (!bench) continue;
    const latest = latestResult(results, t.benchmarkId);
    if (!latest && t.benchmarkId === 'front-lever') continue;
    const std = { now: t.standardAt(working), next: t.standardAt(next), final: t.standardAt(final) };
    const value = latest?.value ?? null;
    const status: GapStatus = value === null ? 'untested'
      : std.final !== null && value >= std.final ? 'goal'
      : std.next !== null && value >= std.next ? 'next'
      : 'short';
    const pct = bench.short === '% BW';
    rows.push({
      benchmarkId: t.benchmarkId,
      name: bench.name,
      short: bench.short ?? '',
      value,
      date: latest?.date ?? null,
      ...std,
      status,
      addKg: status === 'short' && pct && std.next !== null && value !== null
        ? Math.max(0, Math.round((standardToAddedKg(std.next, bw) - standardToAddedKg(value, bw)) * 2) / 2)
        : null,
      source: t.source,
      approximate: t.approximate,
    });
  }
  const tested = rows.filter(r => r.status !== 'untested');
  const strengthReady = tested.length > 0 && tested.every(r => r.status !== 'short');
  return { rows, working, next, final, strengthReady, headline: gapHeadline(rows, next, strengthReady) };
}

function gapHeadline(rows: GapRow[], next: string, ready: boolean): string {
  const tested = rows.filter(r => r.status !== 'untested');
  if (!tested.length) return `Nothing tested yet. ASSESS measures what ${next} asks of the body.`;
  if (ready) return `Strength is ready for ${next}. What stands between you and it is on the wall.`;
  const short = tested.filter(r => r.status === 'short');
  const first = short[0];
  const what = first.addKg ? `${first.name}: ${first.addKg} kg more on the belt` : `${first.name} is short`;
  return short.length === 1 ? `One gap to ${next}. ${what}.` : `${short.length} gaps to ${next}. First: ${what}.`;
}
