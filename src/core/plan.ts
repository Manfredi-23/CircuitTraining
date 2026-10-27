// =============================================================================
// plan.ts — The athlete's week
//
// A weekly plan says what each weekday is for: a programme session, a
// routine, bouldering, rest. On TODAY the plan comes first; the recommender
// still checks it against the same safety rules (finger pain, a healing
// finger, recovery, sore areas, no kit) and steps in, saying why, when the
// planned session should not happen today. When the plan holds, the
// recommender's own pick is offered as the alternative. Pure, no React.
// =============================================================================

import { getModeData } from './data-index';
import { asksPainCheck, getReadiness } from './engine';
import { dayOf, daysBetween, localDate } from './dates';
import { isHealing, lastDone, PAIN_MEMORY_DAYS, type Recommendation, type RecommendInput } from './recommend';
import { isLegHeavy, legSoreness } from './activity';
import { NO_DAY, loadsArea } from './today';
import { routineCircuit, routineMode, type Routine } from './routines';
import type { Circuit, Mode } from './types';

export type PlanItem =
  | { kind: 'SESSION'; mode: Mode; circuitId: string }
  | { kind: 'ROUTINE'; routineId: string }
  | { kind: 'CLIMB' }
  | { kind: 'REST' };

/** Monday 0 to Sunday 6. */
export type WeekPlan = Partial<Record<number, PlanItem[]>>;

export const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const MAX_PER_DAY = 3;

/** Monday 0 to Sunday 6 for a date. */
export const weekdayOf = (d: Date) => (d.getDay() + 6) % 7;

export function plannedOn(plan: WeekPlan, d: Date): PlanItem[] {
  return plan[weekdayOf(d)] ?? [];
}

export interface Resolved {
  mode: Mode;
  circuit: Circuit;
  routineId?: string;
}

/** The circuit a plan item runs, or null for CLIMB, REST and things since deleted. */
export function resolveItem(item: PlanItem, routines: Routine[]): Resolved | null {
  if (item.kind === 'SESSION') {
    const circuit = getModeData(item.mode).find(c => c.id === item.circuitId);
    return circuit ? { mode: item.mode, circuit } : null;
  }
  if (item.kind === 'ROUTINE') {
    const r = routines.find(x => x.id === item.routineId);
    return r ? { mode: routineMode(r), circuit: routineCircuit(r), routineId: r.id } : null;
  }
  return null;
}

export function itemLabel(item: PlanItem, routines: Routine[]): string {
  if (item.kind === 'CLIMB') return 'BOULDERING';
  if (item.kind === 'REST') return 'REST';
  const r = resolveItem(item, routines);
  if (!r) return 'DELETED';
  return item.kind === 'ROUTINE' ? r.circuit.title : `${r.mode} ${r.circuit.circuitNum} ${r.circuit.title}`;
}

/** Why a planned session should not run today, or null when it may. */
export function blockedBecause(r: Resolved, input: RecommendInput): string | null {
  const now = input.now ?? new Date();
  const today = localDate(now);
  const day = input.day ?? NO_DAY;
  const { circuit } = r;
  const pain = [...input.sessionLog].reverse().find(
    s => s.pain !== undefined && daysBetween(dayOf(s.date), today) <= PAIN_MEMORY_DAYS,
  )?.pain ?? 0;
  const fingers = asksPainCheck(circuit);
  if (fingers && pain >= 6) return `finger pain ${pain}/10 lately`;
  if (fingers && day.sore.includes('FOREARMS')) return 'forearms are sore';
  if (day.noKit && r.mode !== 'DAILY') return 'no kit today';
  const sore = day.sore.find(a => loadsArea(circuit, a));
  if (sore) return `${sore.toLowerCase()} are sore`;
  if (legSoreness(input.activityLog ?? [], now) && isLegHeavy(circuit)) return 'legs are sore';
  if (!circuit.stacksOnSession) {
    const ready = getReadiness(circuit, input.progress);
    if (ready.level === 'rest') return 'not recovered yet';
  }
  return null;
}

/**
 * Why a planned session is not recommended, though it may run: it loads the
 * fingers while one heals. The plan is the athlete's own; it leads, labelled.
 */
export function cautionBecause(r: Resolved, input: RecommendInput): string | null {
  const now = input.now ?? new Date();
  return asksPainCheck(r.circuit) && isHealing(input.sessionLog, input.climbLog, now)
    ? 'it loads the fingers while one heals'
    : null;
}

export type TodayPick = Recommendation & { routineId?: string; planned?: boolean };

export interface PlanOutcome {
  /** What leads on TODAY. */
  pick: TodayPick | null;
  /** The recommender's own pick when the plan led, offered as an alternative. */
  also: TodayPick | null;
  /** Bouldering or rest is planned today. */
  note: string | null;
}

/**
 * The plan against the recommender. The first planned session not yet done
 * today leads unless a safety rule stops it; then the recommendation leads and
 * says what was planned and why not.
 */
export function applyPlan(
  plan: WeekPlan, routines: Routine[], input: RecommendInput, recommendation: Recommendation | null,
): PlanOutcome {
  const now = input.now ?? new Date();
  const today = localDate(now);
  const items = plannedOn(plan, now);
  const climbing = items.some(i => i.kind === 'CLIMB');
  const rest = items.some(i => i.kind === 'REST');
  const climbedToday = input.climbLog.some(c => c.date === today);
  const note = rest ? 'Rest is planned today.' : climbing && !climbedToday ? 'Bouldering is planned today. Log it after.' : null;
  if ((input.day ?? NO_DAY).off) return { pick: null, also: null, note };

  for (const item of items) {
    const r = resolveItem(item, routines);
    if (!r || lastDone(input.sessionLog, r.circuit.id) === today) continue;
    const why = blockedBecause(r, input);
    const label = r.routineId ? r.circuit.title : `${r.mode} ${r.circuit.circuitNum}`;
    if (why) {
      return {
        pick: recommendation ? { ...recommendation, reason: `${label} was planned, but ${why}. ${recommendation.reason}` } : null,
        also: null,
        note,
      };
    }
    const caution = cautionBecause(r, input);
    const reason = caution ? `Planned. Not recommended yet: ${caution}.` : 'Planned for today.';
    const pick: TodayPick = { mode: r.mode, circuitId: r.circuit.id, reason, planned: true, ...(r.routineId ? { routineId: r.routineId } : {}) };
    const also = recommendation && recommendation.circuitId !== pick.circuitId ? recommendation : null;
    return { pick, also, note };
  }
  // Rest planned and nothing else: no pick, the recommendation becomes an option.
  if (rest) return { pick: null, also: recommendation, note };
  return { pick: recommendation, also: null, note };
}

/**
 * Whether TODAY should offer to log a climb: bouldering is planned today, or
 * a session built to follow a climbing session (CAVE 02 and 03, a CAVE routine
 * or build) was done today, and no climb is logged yet. CAVE 01 replaces a
 * bouldering day, so it does not ask.
 */
export function climbToLog(
  plan: WeekPlan,
  sessionLog: { date: string; mode: Mode; circuitId: string }[],
  climbLog: { date: string }[],
  now = new Date(),
): 'planned' | 'after' | null {
  const today = localDate(now);
  if (climbLog.some(c => c.date === today)) return null;
  const stacked = sessionLog.some(s => {
    if (dayOf(s.date) !== today || s.mode !== 'CAVE') return false;
    const programme = getModeData('CAVE').find(c => c.id === s.circuitId);
    return programme ? !!programme.stacksOnSession : true;
  });
  if (stacked) return 'after';
  return plannedOn(plan, now).some(i => i.kind === 'CLIMB') ? 'planned' : null;
}
