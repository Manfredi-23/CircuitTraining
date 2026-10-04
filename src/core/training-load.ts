// =============================================================================
// training-load.ts — One load number for climbing and training alike
//
// Session-RPE load (Foster 2001): effort on the CR10 scale times minutes. It is
// the one measure that puts a two-hour boulder session, a CAVE session and a
// DAILY on the same axis, which matters because climbing is most of the week's
// load and was invisible to the app before.
//
// The acute:chronic ratio compares the last 7 days with the weekly average of
// the last 28. It is a guide, not a predictor (the research on it is mixed),
// but a week far above what the tissues are used to is exactly the pattern
// behind most pulley injuries, so it is worth seeing.
// =============================================================================

import { addDays, dayOf, localDate, mondayOf } from './dates';
import type { ClimbSession, SessionLogEntry } from './types';

export type LoadSource = 'CLIMB' | 'CAVE' | 'DAILY' | 'TEST';

/**
 * Effort assumed when a session was not rated: a typical value for the kind of
 * session, so an unrated week is still roughly right rather than empty.
 */
export const DEFAULT_EFFORT: Record<LoadSource, number> = { CLIMB: 7, CAVE: 7, DAILY: 4, TEST: 8 };

/** Minutes assumed for a climbing session logged before duration existed. */
export const DEFAULT_CLIMB_MINUTES = 120;

const MODE_SOURCE: Record<string, LoadSource> = {
  DAILY: 'DAILY', MORN: 'DAILY', HOME: 'DAILY', CAVE: 'CAVE', HANG: 'CAVE', TEST: 'TEST',
};

export interface LoadItem {
  date: string;
  source: LoadSource;
  load: number;
  estimated: boolean;
}

export function loadItems(sessionLog: SessionLogEntry[], climbLog: ClimbSession[]): LoadItem[] {
  const out: LoadItem[] = [];
  for (const s of sessionLog) {
    const source = MODE_SOURCE[s.mode];
    if (!source || !s.duration) continue;
    const effort = s.effort ?? DEFAULT_EFFORT[source];
    out.push({ date: dayOf(s.date), source, load: effort * s.duration, estimated: s.effort === undefined });
  }
  for (const c of climbLog) {
    const minutes = c.durationMin ?? DEFAULT_CLIMB_MINUTES;
    const effort = c.effort ?? DEFAULT_EFFORT.CLIMB;
    out.push({
      date: c.date, source: 'CLIMB', load: effort * minutes,
      estimated: c.effort === undefined || c.durationMin === undefined,
    });
  }
  return out;
}

export interface WeekLoad {
  monday: string;
  total: number;
  bySource: Record<LoadSource, number>;
  /** Share of the total that came from estimated (unrated) sessions, 0-1. */
  estimatedShare: number;
}

/** Weekly totals, oldest first, the current week last. */
export function weeklyLoad(items: LoadItem[], weeks = 12, now = new Date()): WeekLoad[] {
  const thisMonday = mondayOf(localDate(now));
  const out: WeekLoad[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const monday = addDays(thisMonday, -7 * w);
    const end = addDays(monday, 7);
    const week: WeekLoad = { monday, total: 0, bySource: { CLIMB: 0, CAVE: 0, DAILY: 0, TEST: 0 }, estimatedShare: 0 };
    let estimated = 0;
    for (const i of items) {
      if (i.date < monday || i.date >= end) continue;
      week.total += i.load;
      week.bySource[i.source] += i.load;
      if (i.estimated) estimated += i.load;
    }
    week.estimatedShare = week.total ? estimated / week.total : 0;
    out.push(week);
  }
  return out;
}

export type RatioZone = 'low' | 'steady' | 'high' | 'spike';

export interface LoadRatio {
  acute: number;
  /** Mean weekly load over the last 28 days. */
  chronic: number;
  ratio: number;
  zone: RatioZone;
}

/** Days of history needed before a ratio means anything. */
export const RATIO_MIN_HISTORY_DAYS = 21;

export function zoneOf(ratio: number): RatioZone {
  if (ratio > 1.5) return 'spike';
  if (ratio > 1.3) return 'high';
  if (ratio < 0.8) return 'low';
  return 'steady';
}

export const ZONE_TEXT: Record<RatioZone, string> = {
  low: 'Below your usual load. Fine for a deload; otherwise there is room.',
  steady: 'In line with what your tissues are used to.',
  high: 'Well above your usual week. Keep the finger work submaximal.',
  spike: 'A spike. Take the next hard session off or make it easy.',
};

export function loadRatio(items: LoadItem[], now = new Date()): LoadRatio | null {
  const today = localDate(now);
  const first = items.reduce<string | null>((min, i) => (min === null || i.date < min ? i.date : min), null);
  if (!first || first > addDays(today, -RATIO_MIN_HISTORY_DAYS)) return null;
  const sum = (fromDaysAgo: number) => {
    const from = addDays(today, -fromDaysAgo + 1);
    return items.filter(i => i.date >= from && i.date <= today).reduce((t, i) => t + i.load, 0);
  };
  const acute = sum(7);
  const chronic = sum(28) / 4;
  if (!chronic) return null;
  const ratio = Math.round((acute / chronic) * 100) / 100;
  return { acute, chronic: Math.round(chronic), ratio, zone: zoneOf(ratio) };
}
