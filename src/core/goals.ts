// =============================================================================
// goals.ts — Where the athlete is going, and the grades on the way
//
// Two goals, one per discipline: a next goal (7C boulder, 7c sport) and the
// final one (8A, 8a). The working grade is read from the climb log: the
// hardest grade sent at least twice in the last four months on boulders, once
// in six months on a rope. Below that the profile's grade stands (7A boulder,
// 7a sport), so the ladder starts where the athlete says it does and moves
// only on sends.
//
// Between the working grade and the final goal sits one milestone per grade.
// Each step carries an estimate in months: a base rate for a climber at this
// level, slower the higher the grade, and replaced by the athlete's own rate
// once the log shows grades gained. It is an estimate, never a deadline.
// =============================================================================

import { ATHLETE } from './benchmarks';
import { FONT_GRADES, FRENCH_GRADES, GYM_COLOURS } from './climbing';
import { addDays, daysBetween, localDate } from './dates';
import type { ClimbSession } from './types';

export type Discipline = 'BOULDER' | 'SPORT';

export interface DisciplineGoal {
  /** The goal being worked on now: Font for boulder, French for sport. */
  next: string;
  /** The goal after it. */
  final: string;
}

export interface Goals {
  boulder: DisciplineGoal;
  sport: DisciplineGoal;
  /** A trip or a season to peak for. Optional: without it the season rolls. */
  event?: { date: string; label: string };
}

export const DEFAULT_GOALS: Goals = {
  boulder: { next: '7C', final: '8A' },
  sport: { next: '7c', final: '8a' },
};

/** The profile's grades, in the log's spelling. */
export const PROFILE_GRADE: Record<Discipline, string> = {
  BOULDER: ATHLETE.boulder.toUpperCase(),
  SPORT: ATHLETE.redpoint,
};

/** Days of log a working grade is read from, and the sends it needs there. */
export const WORKING_WINDOW: Record<Discipline, { days: number; sends: number }> = {
  BOULDER: { days: 120, sends: 2 },
  SPORT: { days: 180, sends: 1 },
};

/**
 * Months a grade step takes for a climber at 7a with four years behind them
 * and structured training started: about four on boulders, five on routes,
 * where the athlete ropes up rarely. Each step above 7B+ / 7b+ takes a quarter
 * longer than the one before. Broad, deliberately: the athlete's own rate
 * replaces it as soon as there is one.
 */
export const BASE_MONTHS: Record<Discipline, number> = { BOULDER: 4, SPORT: 5 };
const SLOWER_FROM: Record<Discipline, string> = { BOULDER: '7B+', SPORT: '7b+' };
const SLOWDOWN = 1.25;

export function scaleOf(d: Discipline): readonly string[] {
  return d === 'BOULDER' ? FONT_GRADES : FRENCH_GRADES;
}

export function rank(d: Discipline, grade: string): number {
  return scaleOf(d).indexOf(grade);
}

/**
 * A gym colour read as a Font grade: the bottom of its published band, so a
 * red counts as 7A+ and never as 7B+. Optimism here would move the ladder on
 * climbs that were not that hard.
 */
export function colourFont(colour: string): string | null {
  const band = GYM_COLOURS.find(c => c.id === colour)?.font;
  if (!band) return null;
  const m = band.match(/(\d[A-C]?\+?)/i);
  const g = m ? m[1].toUpperCase() : null;
  return g && FONT_GRADES.includes(g as typeof FONT_GRADES[number]) ? g : null;
}

/** Every send in a discipline as a grade on its scale, with its day. */
export function sendsOf(log: ClimbSession[], d: Discipline): { date: string; grade: string }[] {
  const out: { date: string; grade: string }[] = [];
  for (const s of log) {
    if (s.draft) continue;
    const rope = s.discipline === 'ROPE';
    if ((d === 'SPORT') !== rope) continue;
    for (const c of s.climbs) {
      if (!c.sent) continue;
      const grade = d === 'BOULDER' && s.venue === 'GYM' ? colourFont(c.grade) : c.grade;
      if (grade && rank(d, grade) >= 0) out.push({ date: s.date, grade });
    }
  }
  return out;
}

/** The hardest grade sent often enough in the window ending on `asOf`, or null. */
export function loggedGrade(log: ClimbSession[], d: Discipline, asOf = localDate()): string | null {
  const { days, sends } = WORKING_WINDOW[d];
  const counts = new Map<string, number>();
  for (const s of sendsOf(log, d)) {
    const age = daysBetween(s.date, asOf);
    if (age < 0 || age > days) continue;
    counts.set(s.grade, (counts.get(s.grade) ?? 0) + 1);
  }
  // Sends of a harder grade count toward every easier one: two 7B sends make 7A+ solid too.
  const scale = scaleOf(d);
  let carried = 0;
  for (let i = scale.length - 1; i >= 0; i--) {
    carried += counts.get(scale[i]) ?? 0;
    if (carried >= sends) return scale[i];
  }
  return null;
}

/** The working grade: the profile's, or a harder one the log proves. */
export function workingGrade(log: ClimbSession[], d: Discipline, asOf = localDate()): string {
  const fromLog = loggedGrade(log, d, asOf);
  const profile = PROFILE_GRADE[d];
  return fromLog && rank(d, fromLog) > rank(d, profile) ? fromLog : profile;
}

/** Months the athlete's own log says a grade takes, or null without a grade gained. */
export function observedMonthsPerStep(log: ClimbSession[], d: Discipline, asOf = localDate()): number | null {
  const sends = sendsOf(log, d);
  if (!sends.length) return null;
  const first = sends.reduce((a, s) => (s.date < a ? s.date : a), sends[0].date);
  const days = daysBetween(first, asOf);
  if (days < 60) return null;
  // The grade at the start of the log, read from its own window, against now.
  const startAsOf = addDays(first, WORKING_WINDOW[d].days);
  const then = loggedGrade(log, d, startAsOf < asOf ? startAsOf : asOf);
  const now = loggedGrade(log, d, asOf);
  if (!then || !now) return null;
  const gained = rank(d, now) - rank(d, then);
  if (gained <= 0) return null;
  return Math.min(12, Math.max(2, Math.round(((days / 30.4) / gained) * 10) / 10));
}

function addMonths(date: string, months: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + Math.round(months * 30.4)));
}

export interface Milestone {
  grade: string;
  /** Months from now, rounded to the half month. */
  months: number;
  /** Estimated month, YYYY-MM-DD of its first day. */
  eta: string;
  /** The goal set as the next one. */
  isNext: boolean;
  isFinal: boolean;
}

export interface GoalLadder {
  discipline: Discipline;
  working: string;
  /** Where the working grade came from. */
  from: 'log' | 'profile';
  next: string;
  final: string;
  /** Months per step at the working grade, and whose rate it is. */
  monthsPerStep: number;
  rate: 'yours' | 'typical';
  milestones: Milestone[];
  /** The next goal is already reached: time to set the next one. */
  nextReached: boolean;
}

/** The grades from the working grade to the final goal, each with an estimate. */
export function goalLadder(goals: Goals, log: ClimbSession[], d: Discipline, asOf = localDate()): GoalLadder {
  const g = d === 'BOULDER' ? goals.boulder : goals.sport;
  const scale = scaleOf(d);
  const working = workingGrade(log, d, asOf);
  const from = loggedGrade(log, d, asOf) === working ? 'log' : 'profile';
  const observed = observedMonthsPerStep(log, d, asOf);
  const monthsPerStep = observed ?? BASE_MONTHS[d];
  const slowFrom = rank(d, SLOWER_FROM[d]);

  const milestones: Milestone[] = [];
  let months = 0;
  const start = rank(d, working);
  const end = Math.max(rank(d, g.final), rank(d, g.next));
  for (let i = start + 1; i <= end && i < scale.length; i++) {
    months += monthsPerStep * (i > slowFrom ? SLOWDOWN ** Math.min(i - slowFrom, 4) : 1);
    const rounded = Math.round(months * 2) / 2;
    milestones.push({
      grade: scale[i],
      months: rounded,
      eta: addMonths(asOf, rounded).slice(0, 8) + '01',
      isNext: scale[i] === g.next,
      isFinal: scale[i] === g.final,
    });
  }
  return {
    discipline: d,
    working,
    from,
    next: g.next,
    final: g.final,
    monthsPerStep,
    rate: observed ? 'yours' : 'typical',
    milestones,
    nextReached: rank(d, working) >= rank(d, g.next),
  };
}

const MONTH_FMT = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

/** "Mar 2027" for an ETA. */
export function etaLabel(eta: string): string {
  const [y, m] = eta.split('-').map(Number);
  return MONTH_FMT.format(new Date(y, m - 1, 1));
}

/** The one sentence on top of the GOAL section: when each next goal is due. */
export function goalHeadline(b: GoalLadder, s: GoalLadder): string {
  const due = (l: GoalLadder, what: string) => {
    const m = l.milestones.find(x => x.isNext);
    if (l.nextReached || !m) return `${l.next} ${what} reached`;
    return `${l.next} ${what} around ${etaLabel(m.eta)}`;
  };
  return `${due(b, 'boulder')}; ${due(s, 'sport')}.`;
}

/** Read stored goals, filling in anything missing or no longer on the scale. */
export function withGoalDefaults(g: Partial<Goals> | undefined): Goals {
  const pick = (d: Discipline, v: Partial<DisciplineGoal> | undefined, def: DisciplineGoal): DisciplineGoal => ({
    next: v?.next && rank(d, v.next) >= 0 ? v.next : def.next,
    final: v?.final && rank(d, v.final) >= 0 ? v.final : def.final,
  });
  const out: Goals = {
    boulder: pick('BOULDER', g?.boulder, DEFAULT_GOALS.boulder),
    sport: pick('SPORT', g?.sport, DEFAULT_GOALS.sport),
  };
  if (g?.event?.date && /^\d{4}-\d{2}-\d{2}$/.test(g.event.date)) {
    out.event = { date: g.event.date, label: g.event.label || 'Trip' };
  }
  return out;
}
