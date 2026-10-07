// =============================================================================
// insights.ts — The numbers behind the STATS screen
//
// Everything here is read from data the app already records: the session log,
// the load log, benchmark results and the climb log. Pure functions, no React.
// =============================================================================

import { BENCHMARKS, currentBodyweight, latestResult, resultHistory, targetsForBoulderGrade } from './benchmarks';
import { CONFIG } from './config';
import { getModeData } from './data-index';
import { OAP_ASSISTED_GATE, OAP_NEGATIVE_GATE } from './data-oap';
import { asksPainCheck } from './engine';
import { loadItems, weeklyLoad } from './training-load';
import { GOOD_SLEEP_MIN, SHORT_SLEEP_MIN, type HealthData } from './health';
import { getBestPerWeek, localDate, mondayOf, viewFor, type ClimbView } from './climbing';
import type {
  Benchmark, BenchmarkResult, Capacity, ClimbSession, LoadLogEntry, Progress, SessionLogEntry,
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
  DAILY: 'DAILY', MORN: 'DAILY', HOME: 'DAILY', CAVE: 'CAVE', HANG: 'CAVE', TEST: 'TEST', HEAL: 'CAVE',
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

/** Session order: strength, endurance, trunk, range; retired tests last. */
const ROW_ORDER = [
  'fs-2arm-20mm', 'weighted-pullup-2rm',
  'max-pullups', 'repeaters-20mm', 'max-pushups',
  'toes-to-bar', 'hollow-hold', 'prone-extension-hold', 'side-plank-left', 'side-plank-right',
  'hip-footraise', 'straddle', 'sit-reach', 'shoulder-reach',
  'front-lever', 'trunk-flexor-hold', 'back-extension-hold',
];
const rank = (id: string) => {
  const i = ROW_ORDER.indexOf(id);
  return i === -1 ? ROW_ORDER.length : i;
};

export function getBenchmarkRows(results: BenchmarkResult[]): BenchmarkRow[] {
  const rows: BenchmarkRow[] = [];
  for (const bench of [...BENCHMARKS].sort((a, b) => rank(a.id) - rank(b.id))) {
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

export interface TrunkRatio {
  label: string;
  value: number;
  /** Plain-language target, e.g. 'below 1.00'. */
  target: string;
  ok: boolean;
}

/**
 * McGill's torso endurance ratios. They separate people who have had back
 * trouble from those who have not better than any single hold does:
 * flexor / extensor below 1.0, each side bridge / extensor below 0.75, and
 * left / right within 0.05 of 1.0. ASSESS now records only the side bridges
 * of the four; the flexor and extensor ratios appear only from older results.
 */
export function getTrunkRatios(results: BenchmarkResult[]): TrunkRatio[] {
  const v = (id: string) => latestResult(results, id)?.value ?? null;
  const flex = v('trunk-flexor-hold');
  const ext = v('back-extension-hold');
  const left = v('side-plank-left');
  const right = v('side-plank-right');
  const out: TrunkRatio[] = [];
  const r = (a: number, b: number) => Math.round((a / b) * 100) / 100;
  if (flex !== null && ext) {
    const x = r(flex, ext);
    out.push({ label: 'Flexor / back', value: x, target: 'below 1.00', ok: x < 1 });
  }
  if (left !== null && ext) {
    const x = r(left, ext);
    out.push({ label: 'Side left / back', value: x, target: 'below 0.75', ok: x < 0.75 });
  }
  if (right !== null && ext) {
    const x = r(right, ext);
    out.push({ label: 'Side right / back', value: x, target: 'below 0.75', ok: x < 0.75 });
  }
  if (left !== null && right) {
    const x = r(left, right);
    out.push({ label: 'Side left / right', value: x, target: '0.95 to 1.05', ok: Math.abs(x - 1) <= 0.05 });
  }
  return out;
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
    'legs-plate-crunch', 'home-leg-raise', 'cave-front-lever', 'daily-plank-climber',
  ],
  obliques: [
    'daily-side-plank-dip', 'morn-bw-russian-twist', 'addon-russian-twist',
    'addon-hanging-oblique', 'addon-mountain-climber', 'home-copenhagen',
    'daily-spiderman', 'daily-mountain-climber',
  ],
  back: [
    'daily-prone-extension', 'daily-band-good-morning', 'legs-back-extension',
    'legs-sl-rdl', 'home-sl-rdl', 'daily-glute-bridge',
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


// ---- 7. Freshness ------------------------------------------------------------------

export interface FreshnessRow {
  capacity: Capacity;
  /** Whole days since last trained, or null if never. */
  days: number | null;
  graceDays: number;
}

/** Days since each capacity was trained, against the grace before it starts to fade. Stalest first, never-trained last. */
export function getFreshness(progress: Progress, now = new Date()): FreshnessRow[] {
  const rows = CONFIG.capacities.map(capacity => {
    const last = progress[capacity]?.lastTrained;
    const days = last ? Math.floor((now.getTime() - new Date(last).getTime()) / 86400000) : null;
    return { capacity, days, graceDays: CONFIG.decay.rates[capacity].graceDays };
  });
  // Never trained sorts last: that is a new install, not neglect.
  const share = (r: FreshnessRow) => (r.days === null ? -1 : r.days / r.graceDays);
  return rows.sort((a, b) => share(b) - share(a));
}

// ---- 8. One-arm path -------------------------------------------------------------------

export interface OapGate {
  label: string;
  value: number;
  /** Kilos on the belt for a 2RM at this gate, at the current bodyweight. */
  addedKg: number;
  reached: boolean;
  /** Projected date from the trend of tested results, when it is rising. */
  projected: string | null;
}

export interface OapPath {
  points: { date: string; value: number }[];
  gates: OapGate[];
}

/** Days of tested history needed before a projection is drawn. */
const OAP_PROJECTION_MIN_DAYS = 21;
/** Projections further out than this are noise, not a plan. */
const OAP_PROJECTION_MAX_DAYS = 730;

/**
 * Weighted pull-up 2RM as % bodyweight, against the two one-arm gates. Old
 * 5RM-method results are converted the way the gates read them.
 */
export function getOneArmPath(results: BenchmarkResult[]): OapPath {
  const direct = resultHistory(results, 'weighted-pullup-2rm');
  const old = resultHistory(results, 'weighted-pullup')
    .map(r => ({ ...r, value: Math.round(r.value / 1.067) }));
  const points = [...old, ...direct]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => ({ date: r.date.slice(0, 10), value: r.value }));

  const bw = currentBodyweight(results);
  const latest = points.length ? points[points.length - 1].value : null;

  // Least-squares slope in % per day over the tested history.
  let slope: number | null = null;
  if (points.length >= 2) {
    const t = points.map(p => new Date(`${p.date}T12:00:00`).getTime() / 86400000);
    const span = t[t.length - 1] - t[0];
    if (span >= OAP_PROJECTION_MIN_DAYS) {
      const mt = t.reduce((a, b) => a + b, 0) / t.length;
      const mv = points.reduce((a, p) => a + p.value, 0) / points.length;
      const num = t.reduce((a, ti, i) => a + (ti - mt) * (points[i].value - mv), 0);
      const den = t.reduce((a, ti) => a + (ti - mt) ** 2, 0);
      slope = den ? num / den : null;
    }
  }

  const gate = (label: string, value: number): OapGate => {
    const reached = latest !== null && latest >= value;
    let projected: string | null = null;
    if (!reached && latest !== null && slope && slope > 0) {
      const days = Math.ceil((value - latest) / slope);
      if (days <= OAP_PROJECTION_MAX_DAYS) {
        const last = points[points.length - 1].date;
        projected = addDays(last, Math.max(1, days));
      }
    }
    return { label, value, addedKg: Math.round((bw * value) / 100 - bw), reached, projected };
  };

  return {
    points,
    gates: [gate('Assisted one-arms', OAP_ASSISTED_GATE), gate('One-arm negatives', OAP_NEGATIVE_GATE)],
  };
}

// ---- 9. Fingers: pain against finger load ----------------------------------------------

export interface FingerWeek {
  monday: string;
  /** Session-RPE load from boulder sessions and finger-loading training sessions. */
  load: number;
  /** Highest pain score given that week, or null if none was asked. */
  maxPain: number | null;
}

export function getFingerWeeks(
  sessionLog: SessionLogEntry[],
  climbLog: ClimbSession[],
  weeks = 12,
  now = new Date(),
): FingerWeek[] {
  const fingerCircuits = new Set(
    CONFIG.modes.flatMap(m => getModeData(m)).filter(asksPainCheck).map(c => c.id),
  );
  const items = loadItems(
    sessionLog.filter(s => fingerCircuits.has(s.circuitId)),
    climbLog.filter(c => c.discipline === 'BOULDER'),
  );
  const loads = weeklyLoad(items, weeks, now);
  return loads.map(w => {
    const end = addDays(w.monday, 7);
    const pains = sessionLog
      .filter(s => s.pain !== undefined)
      .filter(s => { const d = localDate(new Date(s.date)); return d >= w.monday && d < end; })
      .map(s => s.pain!);
    return { monday: w.monday, load: w.total, maxPain: pains.length ? Math.max(...pains) : null };
  });
}

// ---- 10. Exercises cut short -------------------------------------------------------------

export interface SkipRow {
  exerciseId: string;
  name: string;
  /** Sessions in which it was planned. */
  planned: number;
  /** Of those, sessions where fewer sets were done than planned. */
  short: number;
  /** Of those, sessions where it was skipped outright. */
  skipped: number;
}

/** Exercises cut short most often over the last `days`, worst first. Needs planned sets, so newer sessions only. */
export function getSkipped(sessionLog: SessionLogEntry[], days = 90, now = new Date()): SkipRow[] {
  const since = addDays(localDate(now), -days);
  const names = new Map<string, string>();
  for (const c of CONFIG.modes.flatMap(m => getModeData(m))) {
    for (const e of [...c.exercises, ...(c.substitutes ?? [])]) names.set(e.id, e.name);
  }
  const rows = new Map<string, SkipRow>();
  for (const s of sessionLog) {
    if (!s.planned || localDate(new Date(s.date)) < since) continue;
    for (const [id, planned] of Object.entries(s.planned)) {
      const done = s.sets?.[id] ?? 0;
      const row = rows.get(id) ?? { exerciseId: id, name: names.get(id) ?? id, planned: 0, short: 0, skipped: 0 };
      row.planned++;
      if (done < planned) row.short++;
      if (done === 0) row.skipped++;
      rows.set(id, row);
    }
  }
  return [...rows.values()]
    .filter(r => r.short > 0)
    .sort((a, b) => b.short / b.planned - a.short / a.planned || b.short - a.short);
}

// ---- 11. Recovery: sleep and HRV against how sessions felt -----------------------------

export interface RecoveryNight {
  date: string;
  sleepH: number | null;
  hrv: number | null;
}

export interface RecoveryCompare {
  label: string;
  sessions: number;
  /** Mean session effort, 1-10, or null with no rated sessions. */
  effort: number | null;
}

export interface Recovery {
  nights: RecoveryNight[];
  compare: RecoveryCompare[];
}

/**
 * The last `days` nights, and mean session effort on days after a good night
 * against days after a short one. The same session feeling harder after short
 * sleep is the athlete's own evidence for taking TIRED seriously.
 */
export function getRecovery(health: HealthData, sessionLog: SessionLogEntry[], days = 14, now = new Date()): Recovery {
  const today = localDate(now);
  const sleep = new Map(health.sleep.map(s => [s.date, s.asleepMin]));
  const hrv = new Map(health.hrv.map(h => [h.date, h.value]));
  const nights: RecoveryNight[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const min = sleep.get(date);
    nights.push({ date, sleepH: min === undefined ? null : Math.round((min / 60) * 10) / 10, hrv: hrv.get(date) ?? null });
  }
  const good: number[] = [];
  const short: number[] = [];
  for (const s of sessionLog) {
    if (s.effort === undefined) continue;
    const min = sleep.get(localDate(new Date(s.date)));
    if (min === undefined) continue;
    if (min >= GOOD_SLEEP_MIN) good.push(s.effort);
    else if (min < SHORT_SLEEP_MIN) short.push(s.effort);
  }
  const mean = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);
  return {
    nights,
    compare: [
      { label: 'After 7h+ sleep', sessions: good.length, effort: mean(good) },
      { label: 'After under 6h', sessions: short.length, effort: mean(short) },
    ],
  };
}
