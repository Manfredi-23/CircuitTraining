// =============================================================================
// review.ts — The overview at the top of STATS
//
// STATS used to open on a random line and a level number. This answers the
// questions an athlete actually asks of a training log, from data the app
// already records:
//
// - HOW MUCH: training days, hours, sessions and climbs over the last four
//   weeks, against the four before (`getOverview`).
// - HOW WELL: the share of planned sets that were done, and how hard
//   sessions felt.
// - WHERE IT WENT: working sets split by area (fingers, pull, push and
//   shoulder, core, legs, mobility), this period against the last
//   (`getWorkSplit`).
// - WHAT STANDS OUT: a short list of facts worth acting on, worked out from
//   the logs (`getInsights`): the biggest lift gain, gates that are open,
//   climbs not logged, pulling while a finger heals, a retest due, loads
//   logged as 0 that read as a drop.
//
// Pure functions, no React.
// =============================================================================

import { gateResult } from './benchmarks';
import { OAP_ASSISTED_GATE, OAP_NEGATIVE_GATE } from './data-oap';
import { addDays, dayOf, daysBetween, localDate } from './dates';
import { estimateActivity, type ActivitySession } from './activity';
import { exerciseLibrary } from './reserve';
import { isHealing, lastAssess, RETEST_WEEKS } from './recommend';
import type { BenchmarkResult, Capacity, ClimbSession, Exercise, LoadLogEntry, SessionLogEntry } from './types';

/** Days in one period of the overview. */
export const PERIOD_DAYS = 28;

// ---- How much, how well ----------------------------------------------------------

export interface PeriodStats {
  /** Days with an app session, a climb or an activity. */
  trainingDays: number;
  /** App sessions with at least one set done or a minute logged. */
  sessions: number;
  climbs: number;
  activities: number;
  /** App sessions, climbing and activities, in minutes. */
  minutes: number;
  /** Planned sets that were done, 0-100, or null with no plan to compare against. */
  completion: number | null;
  setsDone: number;
  /** Mean session effort, 1-10, or null with no rated session. */
  effort: number | null;
}

export interface Overview {
  current: PeriodStats;
  previous: PeriodStats;
  /** Training days per week over the current period. */
  daysPerWeek: number;
}

const inRange = (day: string, from: string, to: string) => day >= from && day <= to;

/** Did anything happen in this session? Zero-minute, zero-set entries are taps, not training. */
const counts = (s: SessionLogEntry) =>
  s.duration > 0 || Object.values(s.sets ?? {}).some(n => n > 0);

export function periodStats(
  sessionLog: SessionLogEntry[], climbLog: ClimbSession[], activityLog: ActivitySession[],
  from: string, to: string,
): PeriodStats {
  const days = new Set<string>();
  let sessions = 0, minutes = 0, planned = 0, done = 0, setsDone = 0;
  const efforts: number[] = [];
  for (const s of sessionLog) {
    const day = dayOf(s.date);
    if (!inRange(day, from, to) || !counts(s)) continue;
    days.add(day);
    sessions++;
    minutes += s.duration;
    if (s.effort !== undefined) efforts.push(s.effort);
    const sets = s.sets ?? {};
    setsDone += Object.values(sets).reduce((a, b) => a + b, 0);
    for (const [id, n] of Object.entries(s.planned ?? {})) {
      planned += n;
      done += Math.min(n, sets[id] ?? 0);
    }
  }
  let climbs = 0;
  for (const c of climbLog) {
    if (!inRange(c.date, from, to)) continue;
    climbs++;
    days.add(c.date);
    minutes += c.durationMin ?? 0;
    if (c.effort !== undefined) efforts.push(c.effort);
  }
  let activities = 0;
  for (const a of activityLog) {
    if (!inRange(a.date, from, to)) continue;
    activities++;
    days.add(a.date);
    minutes += estimateActivity(a).durationMin;
  }
  const mean = efforts.length ? Math.round((efforts.reduce((a, b) => a + b, 0) / efforts.length) * 10) / 10 : null;
  return {
    trainingDays: days.size, sessions, climbs, activities, minutes,
    completion: planned ? Math.round((done / planned) * 100) : null,
    setsDone, effort: mean,
  };
}

export function getOverview(
  sessionLog: SessionLogEntry[], climbLog: ClimbSession[], activityLog: ActivitySession[], now = new Date(),
): Overview {
  const today = localDate(now);
  const start = addDays(today, -(PERIOD_DAYS - 1));
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(PERIOD_DAYS - 1));
  const current = periodStats(sessionLog, climbLog, activityLog, start, today);
  const previous = periodStats(sessionLog, climbLog, activityLog, prevStart, prevEnd);
  return { current, previous, daysPerWeek: Math.round((current.trainingDays / (PERIOD_DAYS / 7)) * 10) / 10 };
}

// ---- Where the work went -----------------------------------------------------------

export type WorkArea = 'FINGERS' | 'PULL' | 'PUSH' | 'CORE' | 'LEGS' | 'MOBILITY' | 'ARMS';
export const WORK_AREAS: WorkArea[] = ['FINGERS', 'PULL', 'PUSH', 'CORE', 'LEGS', 'MOBILITY', 'ARMS'];
export const WORK_AREA_LABEL: Record<WorkArea, string> = {
  FINGERS: 'Fingers', PULL: 'Pull', PUSH: 'Push + shoulder', CORE: 'Core', LEGS: 'Legs', MOBILITY: 'Mobility', ARMS: 'Arm extras',
};

const AREA_OF: Record<Capacity, WorkArea> = {
  crimp: 'FINGERS', openhand: 'FINGERS', forearm: 'FINGERS', contact: 'FINGERS',
  pull: 'PULL', press: 'PUSH', shoulder: 'PUSH', tension: 'CORE', legs: 'LEGS', mobility: 'MOBILITY',
};

/** The area an exercise trains first, or null for warm-ups and tests, which are not working sets. */
export function areaOf(e: Exercise): WorkArea | null {
  if (e.block === 'WARMUP' || e.block === 'TEST') return null;
  return e.capacities.length ? AREA_OF[e.capacities[0]] : 'ARMS';
}

export interface AreaShare {
  area: WorkArea;
  sets: number;
  /** Share of all working sets in the period, 0-100. */
  share: number;
  previousSets: number;
}

/** Working sets per area, the current period against the one before. Exercises no longer in the app are left out. */
export function getWorkSplit(sessionLog: SessionLogEntry[], now = new Date()): AreaShare[] {
  const lib = exerciseLibrary();
  const today = localDate(now);
  const start = addDays(today, -(PERIOD_DAYS - 1));
  const prevStart = addDays(start, -PERIOD_DAYS);
  const cur = new Map<WorkArea, number>();
  const prev = new Map<WorkArea, number>();
  for (const s of sessionLog) {
    const day = dayOf(s.date);
    const into = inRange(day, start, today) ? cur : inRange(day, prevStart, addDays(start, -1)) ? prev : null;
    if (!into) continue;
    for (const [id, n] of Object.entries(s.sets ?? {})) {
      const e = lib.get(id);
      const area = e ? areaOf(e) : null;
      if (area && n > 0) into.set(area, (into.get(area) ?? 0) + n);
    }
  }
  const total = [...cur.values()].reduce((a, b) => a + b, 0);
  return WORK_AREAS.map(area => ({
    area,
    sets: cur.get(area) ?? 0,
    share: total ? Math.round(((cur.get(area) ?? 0) / total) * 100) : 0,
    previousSets: prev.get(area) ?? 0,
  }));
}

// ---- What stands out ---------------------------------------------------------------

export type InsightTone = 'good' | 'warn' | 'info';
export interface Insight {
  tone: InsightTone;
  text: string;
}

export interface InsightInput {
  sessionLog: SessionLogEntry[];
  climbLog: ClimbSession[];
  activityLog: ActivitySession[];
  loadLog: LoadLogEntry[];
  benchmarkResults: BenchmarkResult[];
  now?: Date;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDay = (day: string) => {
  const [, m, d] = day.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
};
const kg = (n: number) => `${Math.round(n * 10) / 10} kg`;

/** Sessions built to follow a bouldering session. */
const STACKING = new Set(['cave-05', 'cave-06']);

/**
 * The biggest gain on a logged load, from its first real value to its latest:
 * zeros are a stepper left unset, not a load, so they are skipped.
 */
export function bestGain(loadLog: LoadLogEntry[]): { name: string; from: number; to: number; since: string } | null {
  const byId = new Map<string, LoadLogEntry[]>();
  for (const e of loadLog) {
    if (e.exerciseId.startsWith('test-') || e.unit !== 'kg' || e.value <= 0) continue;
    byId.set(e.exerciseId, [...(byId.get(e.exerciseId) ?? []), e]);
  }
  let best: { name: string; from: number; to: number; since: string; gain: number } | null = null;
  for (const entries of byId.values()) {
    if (entries.length < 2) continue;
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const gain = (last.value - first.value) / first.value;
    if (last.value > first.value && (!best || gain > best.gain)) {
      best = { name: last.exerciseName, from: first.value, to: last.value, since: first.date, gain };
    }
  }
  return best;
}

/** Loads whose latest entry is 0 after a real value: the stepper was not set, and it reads as a drop. */
export function zeroDrops(loadLog: LoadLogEntry[]): { name: string; before: number }[] {
  const byId = new Map<string, LoadLogEntry[]>();
  for (const e of loadLog) {
    if (e.exerciseId.startsWith('test-')) continue;
    byId.set(e.exerciseId, [...(byId.get(e.exerciseId) ?? []), e]);
  }
  const out: { name: string; before: number }[] = [];
  for (const entries of byId.values()) {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const before = [...sorted].reverse().find(e => e.value > 0);
    if (last.value === 0 && before) out.push({ name: last.exerciseName, before: before.value });
  }
  return out;
}

/**
 * Facts worth acting on, most important first, at most `max`. Each is worked
 * out from the logs and says what it is based on.
 */
export function getInsights(input: InsightInput, max = 7): Insight[] {
  const now = input.now ?? new Date();
  const today = localDate(now);
  const lib = exerciseLibrary();
  const out: Insight[] = [];

  // Pulling while a finger heals: HEAL's rule is no pulling until the physio clears it.
  let healingSince: string | null = null;
  if (isHealing(input.sessionLog, input.climbLog, now)) {
    const lastClimb = input.climbLog.map(c => c.date).sort().pop() ?? '';
    const heal = input.sessionLog.filter(s => s.mode === 'HEAL' && dayOf(s.date) > lastClimb);
    const since = heal.length ? dayOf(heal[0].date) : today;
    healingSince = since;
    const pullDays = new Set(input.sessionLog
      .filter(s => dayOf(s.date) >= since && Object.entries(s.sets ?? {})
        .some(([id, n]) => n > 0 && (lib.get(id)?.capacities.includes('pull') ?? false)))
      .map(s => dayOf(s.date)));
    if (pullDays.size) {
      out.push({
        tone: 'warn',
        text: `Finger healing since ${fmtDay(since)}, but pulling logged on ${pullDays.size} day${pullDays.size === 1 ? '' : 's'}. HEAL means no pulling until the physio clears it.`,
      });
    }
  }

  // The biggest load gain.
  const gain = bestGain(input.loadLog);
  if (gain) {
    out.push({ tone: 'good', text: `${gain.name}: ${kg(gain.from)} to ${kg(gain.to)} since ${fmtDay(gain.since)}.` });
  }

  // One-arm gates that a tested pull-up already opens.
  const pull = gateResult(input.benchmarkResults, 'weighted-pullup-2rm');
  if (pull && pull.value >= OAP_NEGATIVE_GATE) {
    out.push({ tone: 'good', text: `Your tested pull-up (${Math.round(pull.value)}% bodyweight) opens both one-arm stages: assisted pulls and negatives.` });
  } else if (pull && pull.value >= OAP_ASSISTED_GATE) {
    out.push({ tone: 'good', text: `Assisted one-arms are open (${Math.round(pull.value)}%). Negatives open at ${OAP_NEGATIVE_GATE}%.` });
  }

  // Training days against the period before.
  const ov = getOverview(input.sessionLog, input.climbLog, input.activityLog, now);
  if (ov.current.trainingDays || ov.previous.trainingDays) {
    const d = ov.current.trainingDays, p = ov.previous.trainingDays;
    out.push({
      tone: d >= p ? 'good' : 'info',
      text: `${d} training days in the last 4 weeks${p ? `, ${d >= p ? 'up' : 'down'} from ${p}` : ''}: ${ov.daysPerWeek} a week.`,
    });
  }

  // Climbs not logged: after-bouldering sessions without a climb on the log.
  // Days while a finger heals are not climbing days.
  const start = addDays(today, -(PERIOD_DAYS - 1));
  const stackDays = new Set(input.sessionLog
    .filter(s => STACKING.has(s.circuitId) && dayOf(s.date) >= start && counts(s))
    .filter(s => !healingSince || dayOf(s.date) < healingSince)
    .map(s => dayOf(s.date)));
  const climbDays = new Set(input.climbLog.filter(c => c.date >= start).map(c => c.date));
  const unlogged = [...stackDays].filter(d => !climbDays.has(d)).length;
  if (unlogged >= 2) {
    out.push({
      tone: 'warn',
      text: `${unlogged} after-bouldering sessions with no climb logged that day. Log the climbs so grades and finger load count.`,
    });
  }

  // Completion of planned sets.
  if (ov.current.completion !== null && ov.current.completion < 85) {
    out.push({ tone: 'warn', text: `${ov.current.completion}% of planned sets done in 4 weeks. CUT SHORT shows what keeps getting dropped.` });
  }

  // Retest.
  const last = lastAssess(input.benchmarkResults);
  if (last) {
    const due = addDays(last, RETEST_WEEKS * 7);
    out.push(daysBetween(due, today) >= 0
      ? { tone: 'warn', text: `ASSESS is due: the last one was ${fmtDay(last)}. Retest to see what the block did.` }
      : { tone: 'info', text: `Next ASSESS around ${fmtDay(due)}, ${RETEST_WEEKS} weeks after ${fmtDay(last)}.` });
  }

  // Loads logged as 0 after a real value.
  const zeros = zeroDrops(input.loadLog);
  if (zeros.length) {
    const z = zeros[0];
    out.push({
      tone: 'info',
      text: `${z.name} logged at 0 kg after ${kg(z.before)}${zeros.length > 1 ? ` (and ${zeros.length - 1} more)` : ''}. Set the stepper, or progress reads it as a drop.`,
    });
  }

  return out.slice(0, max);
}
