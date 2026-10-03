// =============================================================================
// insights.ts — The numbers behind the STATS screen
//
// Everything here is read from data the app already records: the session log,
// the load log, benchmark results and the climb log. Pure functions, no React.
// =============================================================================

import { BENCHMARKS, latestResult, resultHistory, targetsForBoulderGrade } from './benchmarks';
import { getBestPerWeek, localDate, mondayOf, viewFor, type ClimbView } from './climbing';
import type {
  Benchmark, BenchmarkResult, ClimbSession, LoadLogEntry, SessionLogEntry,
} from './types';

function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + n));
}

// ---- 1. Week strip -------------------------------------------------------------

export type DayKind = 'CLIMB' | 'CAVE' | 'TEST' | 'DAILY';

/** What a day shows when several things happened: the biggest load wins. */
const DAY_PRIORITY: DayKind[] = ['CLIMB', 'CAVE', 'TEST', 'DAILY'];

/** Retired modes still in old logs, mapped onto today's tabs. */
const LEGACY_MODE: Record<string, DayKind> = {
  DAILY: 'DAILY', MORN: 'DAILY', HOME: 'DAILY', CAVE: 'CAVE', HANG: 'CAVE', TEST: 'TEST',
};

export interface StripDay { date: string; kind: DayKind | null; future: boolean }
export interface WeekStrip {
  /** Oldest week first; each week Monday to Sunday. */
  weeks: { monday: string; days: StripDay[] }[];
  thisWeek: Record<DayKind, number>;
}

export function getWeekStrip(
  sessionLog: SessionLogEntry[],
  climbLog: ClimbSession[],
  weeks = 12,
  now = new Date(),
): WeekStrip {
  const today = localDate(now);
  const kinds = new Map<string, Set<DayKind>>();
  const mark = (date: string, kind: DayKind) => {
    if (!kinds.has(date)) kinds.set(date, new Set());
    kinds.get(date)!.add(kind);
  };
  for (const s of sessionLog) {
    const kind = LEGACY_MODE[s.mode];
    if (kind) mark(localDate(new Date(s.date)), kind);
  }
  for (const c of climbLog) mark(c.date, 'CLIMB');

  const thisMonday = mondayOf(today);
  const out: WeekStrip = { weeks: [], thisWeek: { CLIMB: 0, CAVE: 0, TEST: 0, DAILY: 0 } };
  for (let w = weeks - 1; w >= 0; w--) {
    const monday = addDays(thisMonday, -7 * w);
    const days: StripDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(monday, d);
      const set = kinds.get(date);
      const kind = set ? DAY_PRIORITY.find(k => set.has(k)) ?? null : null;
      days.push({ date, kind, future: date > today });
      if (w === 0 && set) for (const k of set) out.thisWeek[k]++;
    }
    out.weeks.push({ monday, days });
  }
  return out;
}

// ---- 2. Test results against standards -------------------------------------------

export interface BenchmarkRow {
  bench: Benchmark;
  latest: BenchmarkResult;
  previous: BenchmarkResult | null;
  history: BenchmarkResult[];
  /** Highest standard reached, or null. */
  reached: string | null;
  /** The next standard up, or null at the top or when there are none. */
  next: { label: string; value: number } | null;
  /** For grade-keyed standards: the athlete's boulder grade and the one above. */
  gradeTargets: { current: number | null; next: number | null };
}

export function getBenchmarkRows(results: BenchmarkResult[]): BenchmarkRow[] {
  const rows: BenchmarkRow[] = [];
  for (const bench of BENCHMARKS) {
    if (bench.id === 'bodyweight') continue;
    const history = resultHistory(results, bench.id);
    if (!history.length) continue;
    const latest = history[history.length - 1];
    const lower = bench.better === 'lower';
    const ok = (v: number) => (lower ? latest.value <= v : latest.value >= v);
    const passed = bench.standards.filter(s => ok(s.value));
    const ordered = [...bench.standards].sort((a, b) => (lower ? b.value - a.value : a.value - b.value));
    rows.push({
      bench,
      latest,
      previous: history.length > 1 ? history[history.length - 2] : null,
      history,
      reached: passed.length ? ordered.filter(s => ok(s.value)).pop()!.label : null,
      next: ordered.find(s => !ok(s.value)) ?? null,
      gradeTargets: targetsForBoulderGrade(bench.id),
    });
  }
  return rows;
}

export function getBodyweight(results: BenchmarkResult[]): BenchmarkResult | null {
  return latestResult(results, 'bodyweight');
}

// ---- 3. Lift progress ------------------------------------------------------------

export interface LiftSeries {
  exerciseId: string;
  name: string;
  unit: string;
  points: { date: string; value: number }[];
}

/** Every logged load, one series per exercise, most recently trained first. Tests excluded. */
export function getLiftSeries(log: LoadLogEntry[]): LiftSeries[] {
  const byId = new Map<string, LiftSeries>();
  for (const e of [...log].sort((a, b) => a.date.localeCompare(b.date))) {
    if (e.exerciseId.startsWith('test-')) continue;
    const s = byId.get(e.exerciseId)
      ?? { exerciseId: e.exerciseId, name: e.exerciseName, unit: e.unit, points: [] };
    s.points.push({ date: e.date, value: e.value });
    byId.set(e.exerciseId, s);
  }
  return [...byId.values()].sort(
    (a, b) => b.points[b.points.length - 1].date.localeCompare(a.points[a.points.length - 1].date),
  );
}

// ---- 4. Core volume --------------------------------------------------------------

export type CoreGroup = 'abs' | 'obliques' | 'back';

/**
 * Exercises that count as hard core sets. Only working sets (SECONDARY and
 * PRIMARY): prep work like the dead bug or bird dog is not a growth stimulus.
 */
export const CORE_EXERCISES: Record<CoreGroup, string[]> = {
  abs: [
    'morn-hollow', 'morn-leg-lowers', 'daily-reverse-crunch', 'daily-crunch',
    'legs-plate-crunch', 'home-leg-raise', 'cave-front-lever',
  ],
  obliques: [
    'daily-side-plank-dip', 'morn-bw-russian-twist', 'addon-russian-twist',
    'addon-hanging-oblique', 'addon-mountain-climber', 'home-copenhagen',
  ],
  back: [
    'daily-prone-extension', 'daily-band-good-morning', 'legs-back-extension',
    'legs-sl-rdl', 'home-sl-rdl',
  ],
};

/** Weekly hard-set targets from the trunk-hypertrophy and back-strength protocols. */
export const CORE_TARGETS: Record<CoreGroup, number> = { abs: 12, obliques: 10, back: 9 };

export function getCoreVolume(sessionLog: SessionLogEntry[], now = new Date()): Record<CoreGroup, number> {
  const monday = mondayOf(localDate(now));
  const out: Record<CoreGroup, number> = { abs: 0, obliques: 0, back: 0 };
  for (const s of sessionLog) {
    if (!s.sets || localDate(new Date(s.date)) < monday) continue;
    for (const group of Object.keys(CORE_EXERCISES) as CoreGroup[]) {
      for (const id of CORE_EXERCISES[group]) out[group] += s.sets[id] ?? 0;
    }
  }
  return out;
}

// ---- 6. Climbing against pulling strength ------------------------------------------

const WEIGHTED_PULLUP_IDS = ['cave-weighted-pullup', 'addon-weighted-pullup'];

export interface ClimbPullWeek {
  week: string;
  /** Hardest send that week as a grade index in the chosen view, or null. */
  bestSend: number | null;
  /** Heaviest weighted pull-up logged that week, kg added, or null. */
  pullKg: number | null;
}

/** The view with the most sessions: the one a weekly trend is most readable in. */
export function primaryClimbView(sessions: ClimbSession[]): ClimbView | null {
  const counts = new Map<ClimbView, number>();
  for (const s of sessions) counts.set(viewFor(s), (counts.get(viewFor(s)) ?? 0) + 1);
  let best: ClimbView | null = null;
  for (const [v, n] of counts) if (!best || n > (counts.get(best) ?? 0)) best = v;
  return best;
}

export function getClimbVsPull(
  climbLog: ClimbSession[],
  loadLog: LoadLogEntry[],
  view: ClimbView | null,
  weeks = 12,
  now = new Date(),
): ClimbPullWeek[] {
  const thisMonday = mondayOf(localDate(now));
  const sends = new Map((view ? getBestPerWeek(climbLog, view) : []).map(w => [w.week, w.bestSend]));
  const pulls = new Map<string, number>();
  for (const e of loadLog) {
    if (!WEIGHTED_PULLUP_IDS.includes(e.exerciseId)) continue;
    const w = mondayOf(e.date);
    pulls.set(w, Math.max(pulls.get(w) ?? -Infinity, e.value));
  }
  const out: ClimbPullWeek[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const week = addDays(thisMonday, -7 * i);
    out.push({ week, bestSend: sends.get(week) ?? null, pullKg: pulls.get(week) ?? null });
  }
  return out;
}

