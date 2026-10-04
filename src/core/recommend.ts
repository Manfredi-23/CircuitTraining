// =============================================================================
// recommend.ts — Which session today
//
// The week the programme is written for: DAILY most mornings, CAVE 02 or 03
// straight after bouldering, CAVE 01 only in a week a bouldering day was
// skipped, ASSESS every six to eight weeks. The rules below read that week
// back out of the logs, in order of what matters most. It recommends; the
// home screen opens on the recommendation and every other card is a swipe
// away.
// =============================================================================

import { getModeData } from './data-index';
import { getReadiness, asksPainCheck } from './engine';
import { daysBetween, dayOf, localDate, mondayOf } from './dates';
import { resultHistory } from './benchmarks';
import type { BlockWeek } from './block';
import type { BenchmarkResult, Circuit, ClimbSession, Mode, Progress, SessionLogEntry } from './types';

export interface Recommendation {
  mode: Mode;
  circuitId: string;
  reason: string;
}

export interface RecommendInput {
  sessionLog: SessionLogEntry[];
  climbLog: ClimbSession[];
  progress: Progress;
  benchmarkResults: BenchmarkResult[];
  block: BlockWeek;
  /** Apple Health suggested TIRED today: no maximal sessions. */
  tired?: boolean;
  now?: Date;
}

/** Weeks between ASSESS sessions. Retesting sooner mostly measures the familiarisation effect. */
export const RETEST_WEEKS = 7;

// Reasons are shown on one line under the logo: keep each under 45 characters.

/** Days a pain score of 6+ keeps finger sessions off the recommendation. */
const PAIN_MEMORY_DAYS = 2;

/** Last day a circuit was done, or null. */
export function lastDone(sessionLog: SessionLogEntry[], circuitId: string): string | null {
  for (let i = sessionLog.length - 1; i >= 0; i--) {
    if (sessionLog[i].circuitId === circuitId) return dayOf(sessionLog[i].date);
  }
  return null;
}

/** The circuit done least recently; never-done circuits first, in list order. */
function leastRecent(circuits: Circuit[], sessionLog: SessionLogEntry[]): Circuit {
  return [...circuits].sort((a, b) => {
    const la = lastDone(sessionLog, a.id) ?? '';
    const lb = lastDone(sessionLog, b.id) ?? '';
    return la.localeCompare(lb);
  })[0];
}

/** Date of the last ASSESS, read from the test results it saves. */
export function lastAssess(results: BenchmarkResult[]): string | null {
  const dates = results.filter(r => r.benchmarkId !== 'bodyweight').map(r => dayOf(r.date)).sort();
  return dates.length ? dates[dates.length - 1] : null;
}

export function assessDue(results: BenchmarkResult[], sessionLog: SessionLogEntry[], now = new Date()): boolean {
  const last = lastAssess(results);
  const today = localDate(now);
  if (last) return daysBetween(last, today) >= RETEST_WEEKS * 7;
  // Never tested: the baseline is due once there are two weeks of training to anchor it.
  return sessionLog.length > 0 && daysBetween(dayOf(sessionLog[0].date), today) >= 14;
}

export function recommend(input: RecommendInput): Recommendation | null {
  const { sessionLog, climbLog, progress, benchmarkResults, block } = input;
  const now = input.now ?? new Date();
  const today = localDate(now);
  const daily = getModeData('DAILY');
  const cave = getModeData('CAVE');
  const test = getModeData('TEST');

  const doneToday = (mode: Mode) => sessionLog.some(s => s.mode === mode && dayOf(s.date) === today);
  const climbedToday = climbLog.some(c => c.date === today);

  // 1. Recent pain of 6 or more: nothing that loads the fingers.
  const painful = [...sessionLog].reverse().find(
    s => s.pain !== undefined && daysBetween(dayOf(s.date), today) <= PAIN_MEMORY_DAYS,
  );
  if (painful && painful.pain! >= 6) {
    if (doneToday('DAILY')) return null;
    const safe = daily.filter(c => !asksPainCheck(c));
    const pick = leastRecent(safe.length ? safe : daily, sessionLog);
    return { mode: 'DAILY', circuitId: pick.id, reason: `Finger pain ${painful.pain}/10 lately. No finger work.` };
  }

  // 2. Climbed today: the after-bouldering session, alternating 02 and 03.
  const stacking = cave.filter(c => c.stacksOnSession);
  if (climbedToday && !doneToday('CAVE') && stacking.length) {
    const pick = leastRecent(stacking, sessionLog);
    return { mode: 'CAVE', circuitId: pick.id, reason: 'You climbed today. This one stacks on it.' };
  }

  const strong = cave.find(c => !c.stacksOnSession);
  const fingersReady = strong ? getReadiness(strong, progress).level === 'ready' : false;

  // 3. ASSESS due, fresh fingers, not a deload week, no climbing today, and
  // not a TIRED day: a test on a bad night measures the night.
  if (test[0] && !input.tired && !climbedToday && !block.deload && fingersReady && !doneToday('TEST')
      && assessDue(benchmarkResults, sessionLog, now)) {
    const never = resultHistory(benchmarkResults, 'fs-2arm-20mm').length === 0;
    return {
      mode: 'TEST', circuitId: test[0].id,
      reason: never ? 'No baseline yet. ASSESS sets your loads.' : `Last ASSESS ${RETEST_WEEKS}+ weeks ago. Retest.`,
    };
  }

  // 4. CAVE 01: from Thursday, in a week with fewer than two climbing days.
  const monday = mondayOf(today);
  const weekday = daysBetween(monday, today); // 0 = Monday
  const climbsThisWeek = new Set(climbLog.filter(c => c.date >= monday && c.date <= today).map(c => c.date)).size;
  const strongThisWeek = strong ? sessionLog.some(s => s.circuitId === strong.id && dayOf(s.date) >= monday) : true;
  if (strong && !input.tired && weekday >= 3 && climbsThisWeek < 2 && !climbedToday && fingersReady && !strongThisWeek && !doneToday('CAVE')) {
    return {
      mode: 'CAVE', circuitId: strong.id,
      reason: `${climbsThisWeek} climbing day${climbsThisWeek === 1 ? '' : 's'} this week. STRONG instead.`,
    };
  }

  // 5. The morning DAILY, rotating through the four.
  if (doneToday('DAILY')) return null;
  if (input.tired) {
    const pick = leastRecent(daily, sessionLog);
    return { mode: 'DAILY', circuitId: pick.id, reason: 'A TIRED day: something light instead.' };
  }
  const pick = leastRecent(daily, sessionLog);
  const last = lastDone(sessionLog, pick.id);
  const ago = last ? daysBetween(last, today) : null;
  return {
    mode: 'DAILY', circuitId: pick.id,
    reason: ago === null ? 'Next in the DAILY rotation.' : `Next in rotation, last done ${ago === 1 ? 'yesterday' : `${ago} days ago`}.`,
  };
}

