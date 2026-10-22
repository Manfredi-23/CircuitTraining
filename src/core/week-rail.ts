// =============================================================================
// week-rail.ts — This week at a glance, for the top of TODAY
//
// Monday to Sunday: what was done each day (sessions, climbs, outside days),
// what the weekly plan holds for the days still ahead, and which day is today.
// Pure, no React.
// =============================================================================

import { addDays, dayOf, localDate, mondayOf } from './dates';
import { plannedOn, type WeekPlan } from './plan';
import type { ActivitySession } from './activity';
import type { ClimbSession, SessionLogEntry } from './types';

export interface RailDay {
  date: string;
  /** M T W T F S S */
  letter: string;
  sessions: number;
  climbs: number;
  outside: number;
  /** Items on the plan for this day, CLIMB and REST included. */
  planned: number;
  restPlanned: boolean;
  today: boolean;
  future: boolean;
}

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function weekRail(
  sessionLog: SessionLogEntry[], climbLog: ClimbSession[], activityLog: ActivitySession[], plan: WeekPlan, now = new Date(),
): RailDay[] {
  const today = localDate(now);
  const monday = mondayOf(today);
  return LETTERS.map((letter, i) => {
    const date = addDays(monday, i);
    const [y, m, d] = date.split('-').map(Number);
    const items = plannedOn(plan, new Date(y, m - 1, d, 12));
    return {
      date, letter,
      sessions: sessionLog.filter(s => dayOf(s.date) === date).length,
      climbs: climbLog.filter(c => c.date === date).length,
      outside: activityLog.filter(a => a.date === date).length,
      planned: items.length,
      restPlanned: items.some(it => it.kind === 'REST'),
      today: date === today,
      future: date > today,
    };
  });
}

/** One line under the rail, e.g. "3 sessions, 1 climb so far this week." */
export function railLine(days: RailDay[]): string {
  const s = days.reduce((a, d) => a + d.sessions, 0);
  const c = days.reduce((a, d) => a + d.climbs, 0);
  const o = days.reduce((a, d) => a + d.outside, 0);
  if (!s && !c && !o) return 'Nothing logged yet this week.';
  const parts = [`${s} session${s === 1 ? '' : 's'}`];
  if (c) parts.push(`${c} climb${c === 1 ? '' : 's'}`);
  if (o) parts.push(`${o} outside`);
  return `${parts.join(', ')} so far this week.`;
}
