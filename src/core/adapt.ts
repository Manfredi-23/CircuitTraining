// =============================================================================
// adapt.ts — Reading the block back and adjusting it
//
// The block is three build weeks and a deload by the calendar. The logs can
// say more: a load spike, sessions that all felt 9/10, finger pain coming back
// say deload now; build weeks that barely happened say the deload has nothing
// to recover from. A lift logged at the same number four times running has
// stalled, and adding more of the same rarely moves it. Each is a suggestion
// with its reason; the athlete decides. Pure, no React.
// =============================================================================

import { addDays, dayOf, daysBetween, localDate, mondayOf } from './dates';
import { CONFIG } from './config';
import { getLiftSeries } from './insights';
import { loadItems, loadRatio, climbingLane } from './training-load';
import type { BlockWeek } from './block';
import type { ActivitySession } from './activity';
import type { ClimbSession, LoadLogEntry, SessionLogEntry } from './types';

export type DeloadAdvice =
  | { kind: 'early'; reason: string }
  | { kind: 'skip'; reason: string };

/** Mean effort at or above this over the last rated sessions says the block is grinding. */
export const GRIND_EFFORT = 8.5;
const GRIND_SESSIONS = 4;
/** Fewer hard sessions than this in the build weeks leaves nothing for a deload to recover from. */
export const LIGHT_BLOCK_SESSIONS = 3;

/** blockStart that makes this week the deload week. */
export function deloadNowStart(now = new Date()): string {
  return addDays(mondayOf(localDate(now)), -7 * CONFIG.recovery.mesocycleWeeks);
}

export function deloadAdvice(input: {
  block: BlockWeek;
  sessionLog: SessionLogEntry[];
  climbLog: ClimbSession[];
  activityLog?: ActivitySession[];
  now?: Date;
}): DeloadAdvice | null {
  const now = input.now ?? new Date();
  const today = localDate(now);
  const { block, sessionLog } = input;
  // A hard session: one the deload would lighten (not DAILY, not a test).
  const hard = (s: SessionLogEntry) => s.mode === 'CAVE' || s.mode === 'HEAL';

  if (block.deload) {
    const inBuild = sessionLog.filter(s => hard(s) && dayOf(s.date) >= block.blockStart && dayOf(s.date) < mondayOf(today)).length
      + input.climbLog.filter(c => c.date >= block.blockStart && c.date < mondayOf(today)).length;
    if (inBuild < LIGHT_BLOCK_SESSIONS) {
      return { kind: 'skip', reason: `Only ${inBuild} hard session${inBuild === 1 ? '' : 's'} or climbs in the build weeks: nothing much to recover from. Keep building?` };
    }
    return null;
  }
  if (block.week < 2) return null;

  const ratio = loadRatio(climbingLane(loadItems(sessionLog, input.climbLog, input.activityLog ?? [])), now);
  if (ratio?.zone === 'spike') {
    return { kind: 'early', reason: `This week is ${Math.round(ratio.ratio * 100)}% of your usual load. A lighter week now beats a forced one later.` };
  }
  const rated = sessionLog.filter(s => s.effort !== undefined && daysBetween(dayOf(s.date), today) <= 14).slice(-6);
  if (rated.length >= GRIND_SESSIONS) {
    const mean = rated.reduce((a, s) => a + s.effort!, 0) / rated.length;
    if (mean >= GRIND_EFFORT) {
      return { kind: 'early', reason: `The last ${rated.length} sessions averaged ${Math.round(mean * 10) / 10}/10. Deload now rather than grind.` };
    }
  }
  const sore = sessionLog.filter(s => (s.pain ?? 0) >= 3 && daysBetween(dayOf(s.date), today) <= 7);
  if (sore.length >= 2) {
    return { kind: 'early', reason: `Finger pain of 3 or more in ${sore.length} sessions this week. Fingers recover slower than muscle: deload now.` };
  }
  return null;
}

export interface Plateau {
  exerciseId: string;
  name: string;
  value: number;
  unit: string;
  sessions: number;
}

/** Sessions at one number before a lift counts as stalled. */
export const PLATEAU_SESSIONS = 4;

/** Lifts logged at the same load four sessions running, the last of them within four weeks. */
export function plateaus(loadLog: LoadLogEntry[], now = new Date()): Plateau[] {
  const since = addDays(localDate(now), -28);
  const out: Plateau[] = [];
  for (const s of getLiftSeries(loadLog)) {
    if (s.points.length < PLATEAU_SESSIONS) continue;
    const last = s.points[s.points.length - 1];
    if (last.date < since) continue;
    let run = 1;
    for (let i = s.points.length - 2; i >= 0 && s.points[i].value === last.value; i--) run++;
    if (run >= PLATEAU_SESSIONS) out.push({ exerciseId: s.exerciseId, name: s.name, value: last.value, unit: s.unit, sessions: run });
  }
  return out;
}

export const PLATEAU_TEXT = 'Same load four sessions running. Change something: a harder variation, a set more at a lighter load, or a retest.';

/** Last Monday to Sunday in one line, for the Monday notification. */
export function weekSummary(sessionLog: SessionLogEntry[], climbLog: ClimbSession[], now = new Date()): string {
  const thisMonday = mondayOf(localDate(now));
  const from = addDays(thisMonday, -7);
  const sessions = sessionLog.filter(s => dayOf(s.date) >= from && dayOf(s.date) < thisMonday);
  const climbs = climbLog.filter(c => c.date >= from && c.date < thisMonday);
  const minutes = sessions.reduce((a, s) => a + s.duration, 0) + climbs.reduce((a, c) => a + (c.durationMin ?? 0), 0);
  if (!sessions.length && !climbs.length) return 'Nothing logged last week. A short DAILY is a good restart.';
  const h = Math.round(minutes / 6) / 10;
  return `Last week: ${sessions.length} session${sessions.length === 1 ? '' : 's'}, ${climbs.length} climb${climbs.length === 1 ? '' : 's'}, ${h} h.`;
}
