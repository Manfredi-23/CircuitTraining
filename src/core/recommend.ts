// =============================================================================
// recommend.ts — Which session today
//
// The week the programme is written for: DAILY most mornings, CAVE 02 or 03
// straight after bouldering, a training day (CAVE 01 STRONG first, then 04
// POWER or 05 FULL BODY) in a week a bouldering day was skipped, ASSESS every six to eight weeks. While a finger heals, a gym day
// every other day (ring rehab, FOOTWORK, then a HEAL strength session), the
// ring rehab every second day, and finger-free DAILY between. The rules below read that week
// back out of the logs, in order of what matters most. It recommends; the
// home screen opens on the recommendation and every other card is a swipe
// away.
// =============================================================================

import { getModeData } from './data-index';
import { getReadiness, asksPainCheck } from './engine';
import { addDays, daysBetween, dayOf, localDate, mondayOf } from './dates';
import { CAVE_DAY_IDS, CORE_LEGS_ID, STRAIGHT_BACK_ID, WAKE_UP_IDS } from './data-week';
import { resultHistory } from './benchmarks';
import { getRingRecovery, REHAB_BENCHMARKS, RING_RIGHT_BENCHMARK } from './rehab';
import { FOOTWORK_ID, HEAL_GYM_IDS, RING_REHAB_ID, RING_TEST_ID } from './data-heal';
import type { BlockWeek } from './block';
import type { SeasonPhase } from './season';
import { ACTIVITY_SPEC, isLegHeavy, legSoreness, type ActivitySession } from './activity';
import { NO_DAY, loadsArea, needsKit, type ActiveDay, type SoreArea } from './today';
import type { BenchmarkResult, Circuit, ClimbSession, LoadLogEntry, Mode, Progress, SessionLogEntry } from './types';

export interface Recommendation {
  mode: Mode;
  circuitId: string;
  reason: string;
}

export interface RecommendInput {
  sessionLog: SessionLogEntry[];
  climbLog: ClimbSession[];
  /** Hikes and the like: a long descent keeps leg sessions off the plan. */
  activityLog?: ActivitySession[];
  progress: Progress;
  benchmarkResults: BenchmarkResult[];
  block: BlockWeek;
  /** Apple Health suggested TIRED today: no maximal sessions. */
  tired?: boolean;
  /** What the athlete said about today on the TODAY sheet. */
  day?: ActiveDay;
  /** The season's phase: it picks the training day, and PEAK adds none. */
  season?: SeasonPhase;
  now?: Date;
}

/** CAVE 01 STRONG: the training day that loads the fingers maximally. */
export const STRONG_ID = 'cave-01';

/** Weeks between ASSESS sessions. Retesting sooner mostly measures the familiarisation effect. */
export const RETEST_WEEKS = 7;

// Reasons are shown on one line under the logo: keep each under 45 characters.

/** Days a pain score of 6+ keeps finger sessions off the recommendation. */
export const PAIN_MEMORY_DAYS = 2;

/** Days after the last HEAL session that the athlete still counts as injured. */
export const HEAL_MEMORY_DAYS = 10;

/**
 * The HEAL block: a HEAL session in the last ten days and no climb logged
 * since. It decides whether TODAY runs the HEAL routine (rule 2). Climbing
 * again ends the block, not the healing (`isHealing`).
 */
export function inHealBlock(sessionLog: SessionLogEntry[], climbLog: ClimbSession[], now = new Date()): boolean {
  const heal = sessionLog.filter(s => s.mode === 'HEAL');
  if (!heal.length) return false;
  const last = dayOf(heal[heal.length - 1].date);
  return daysBetween(last, localDate(now)) <= HEAL_MEMORY_DAYS && !climbLog.some(c => c.date >= last);
}

/** How far the injured finger is, when the caller has it (`rehab.getRingRecovery`). */
export interface RingStatus {
  /** A rehab load is on record. */
  left: unknown;
  /** The left lifts 80% of the right: cleared. */
  reached: boolean;
}

/**
 * A finger is healing: grips, pulls and finger work are labelled NOT
 * RECOMMENDED YET, and the coach is told. It needs a HEAL session in the last
 * ten days (the ring rehab counts). Then, since v46, the physio's 80% decides
 * and climbing again does not end it:
 * - with the ring finger's numbers: healing until the left reaches 80% of the right;
 * - without them: healing while the ring rehab ran in the last ten days, else
 *   until a climb is logged (the old rule).
 */
export function isHealing(sessionLog: SessionLogEntry[], climbLog: ClimbSession[], now = new Date(), ring?: RingStatus | null): boolean {
  const heal = sessionLog.filter(s => s.mode === 'HEAL');
  if (!heal.length) return false;
  const today = localDate(now);
  if (daysBetween(dayOf(heal[heal.length - 1].date), today) > HEAL_MEMORY_DAYS) return false;
  if (ring?.left) return !ring.reached;
  if (heal.some(s => s.circuitId === RING_REHAB_ID && daysBetween(dayOf(s.date), today) <= HEAL_MEMORY_DAYS)) return true;
  return inHealBlock(sessionLog, climbLog, now);
}

/** Before this hour a weekday opens with WAKE UP (v47). */
export const MORNING_ENDS = 12;

/** Training days in a row after which rest is suggested (v47). */
export const REST_AFTER_DAYS = 3;

/**
 * A rest day is due (v47): the last three days each had a climb or a training
 * session (WAKE UP and the other short DAILYs do not count), and nothing is
 * done yet today.
 */
export function restDue(sessionLog: SessionLogEntry[], climbLog: ClimbSession[], now = new Date()): boolean {
  const today = localDate(now);
  const trained = new Set<string>([
    ...climbLog.map(c => c.date),
    ...sessionLog.filter(s => s.mode !== 'DAILY' && s.circuitId !== RING_REHAB_ID).map(s => dayOf(s.date)),
  ]);
  if (trained.has(today)) return false;
  for (let i = 1; i <= REST_AFTER_DAYS; i++) {
    if (!trained.has(addDays(today, -i))) return false;
  }
  return true;
}

/** `isHealing` from the store's logs, the ring finger's numbers included when they are there. */
export function fingerHealing(
  s: { sessionLog: SessionLogEntry[]; climbLog: ClimbSession[]; loadLog?: LoadLogEntry[]; benchmarkResults?: BenchmarkResult[] },
  now = new Date(),
): boolean {
  const ring = s.loadLog && s.benchmarkResults ? getRingRecovery(s.loadLog, s.benchmarkResults) : null;
  return isHealing(s.sessionLog, s.climbLog, now, ring && ring.right ? ring : null);
}

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

/** Days between ring finger rehab sessions: the physio's every second day. */
export const RING_REHAB_EVERY_DAYS = 2;

/** Date of the last ASSESS, read from the test results it saves. Rehab tests are not an ASSESS. */
export function lastAssess(results: BenchmarkResult[]): string | null {
  const dates = results
    .filter(r => r.benchmarkId !== 'bodyweight' && !REHAB_BENCHMARKS.includes(r.benchmarkId))
    .map(r => dayOf(r.date)).sort();
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

  const day = input.day ?? NO_DAY;
  // A rest or sick day: nothing is due.
  if (day.off) return null;

  // Sore: from a long descent (legs) or as said on the TODAY sheet. Sessions
  // that load a sore area step aside while another fits.
  const sore = legSoreness(input.activityLog ?? [], now);
  const areas: SoreArea[] = day.sore;
  const AREA_TEXT: Record<SoreArea, string> = {
    LEGS: 'Legs sore. Something else today.',
    BACK: 'Back sore. Something else today.',
    SHOULDERS: 'Shoulders sore. Something else today.',
    FOREARMS: 'Forearms sore. No finger work today.',
  };
  const soreReason = areas.length ? AREA_TEXT[areas[0]]
    : sore ? `Legs sore from the ${ACTIVITY_SPEC[sore.activity.type].label.toLowerCase()}. Upper body.` : '';
  const spare = (circuits: Circuit[]) => {
    if (!sore && !areas.length) return circuits;
    const light = circuits.filter(c => !(sore && isLegHeavy(c)) && !areas.some(a => loadsArea(c, a)));
    return light.length ? light : circuits;
  };
  /** The reason, or the soreness reason when soreness changed the pick. */
  const why = (circuits: Circuit[], pick: Circuit, reason: string) =>
    (soreReason && leastRecent(circuits, sessionLog).id !== pick.id ? soreReason : reason);
  const forearms = areas.includes('FOREARMS');
  /** Big sessions do not fit a short day. */
  const shortDay = day.minutes !== null && day.minutes <= 30;

  const doneToday = (mode: Mode) => sessionLog.some(s => s.mode === mode && dayOf(s.date) === today);
  const climbedToday = climbLog.some(c => c.date === today);

  // 1. Recent pain of 6 or more: nothing that loads the fingers.
  const painful = [...sessionLog].reverse().find(
    s => s.pain !== undefined && daysBetween(dayOf(s.date), today) <= PAIN_MEMORY_DAYS,
  );
  if (painful && painful.pain! >= 6) {
    if (doneToday('DAILY')) return null;
    const safe = daily.filter(c => !asksPainCheck(c));
    const pick = leastRecent(spare(safe.length ? safe : daily), sessionLog);
    return { mode: 'DAILY', circuitId: pick.id, reason: `Finger pain ${painful.pain}/10 lately. No finger work.` };
  }

  // 1b. No kit: a DAILY that still has its working sets on a bare mat.
  if (day.noKit) {
    if (doneToday('DAILY')) return null;
    const bare = daily.filter(c => c.exercises.filter(e => e.block !== 'WARMUP' && !needsKit(e)).length >= 3);
    const healing = sessionLog.some(s => s.mode === 'HEAL' && daysBetween(dayOf(s.date), today) <= HEAL_MEMORY_DAYS);
    const safe = healing || forearms ? bare.filter(c => !asksPainCheck(c)) : bare;
    const pool = safe.length ? safe : daily;
    const pick = leastRecent(spare(pool), sessionLog);
    return { mode: 'DAILY', circuitId: pick.id, reason: why(pool, pick, 'No kit today: a mat-only DAILY.') };
  }

  // 2. Healing a finger: a HEAL session lately and no climbing logged since.
  // A gym day every other day runs the ring rehab first if it is due (the
  // right-hand test once, before the first), then FOOTWORK, then 01 or 02.
  // Between gym days: the rehab when due, otherwise a finger-free DAILY.
  // Logging a climb ends the block (the finger may still be healing: the
  // labels follow `isHealing`, the routine follows the block).
  const heal = getModeData('HEAL');
  const healLog = sessionLog.filter(s => s.mode === 'HEAL');
  if (inHealBlock(sessionLog, climbLog, now)) {
    const byId = (id: string) => heal.find(c => c.id === id);
    const gym = HEAL_GYM_IDS.map(byId).filter((c): c is Circuit => Boolean(c));
    const gymLog = healLog.filter(s => HEAL_GYM_IDS.includes(s.circuitId));
    const lastGym = gymLog.length ? dayOf(gymLog[gymLog.length - 1].date) : null;
    const gymDay = gym.length > 0 && (!lastGym || daysBetween(lastGym, today) >= 2);

    const rehab = byId(RING_REHAB_ID);
    const ringTest = byId(RING_TEST_ID);
    const lastRehab = rehab ? lastDone(sessionLog, rehab.id) : null;
    if (rehab && (!lastRehab || daysBetween(lastRehab, today) >= RING_REHAB_EVERY_DAYS)) {
      const untested = resultHistory(benchmarkResults, RING_RIGHT_BENCHMARK).length === 0;
      if (ringTest && untested && lastDone(sessionLog, ringTest.id) !== today) {
        return { mode: 'HEAL', circuitId: ringTest.id, reason: 'Test the right ring finger first.' };
      }
      return { mode: 'HEAL', circuitId: rehab.id, reason: 'Ring finger rehab: every second day.' };
    }
    if (gymDay) {
      const footwork = byId(FOOTWORK_ID);
      if (footwork && lastDone(sessionLog, footwork.id) !== today) {
        return { mode: 'HEAL', circuitId: footwork.id, reason: 'Gym day: footwork while fresh.' };
      }
      const pick = leastRecent(spare(gym), sessionLog);
      return { mode: 'HEAL', circuitId: pick.id, reason: why(gym, pick, 'Finger healing. Next HEAL session.') };
    }
    if (doneToday('DAILY')) return null;
    const fingerFree = daily.filter(c => !asksPainCheck(c));
    const pick = leastRecent(spare(fingerFree), sessionLog);
    return { mode: 'DAILY', circuitId: pick.id, reason: why(fingerFree, pick, 'Finger healing: no finger work today.') };
  }

  // ---- The week of v47 (`data-week.ts`) ----------------------------------------
  // TODAY suggests WAKE UP, the three CAVE days and STRAIGHT BACK. The older
  // sessions stay in TRAIN; the rules above (pain, no kit, the HEAL block)
  // still come first.
  const byIdIn = (list: Circuit[]) => (id: string) => list.find(c => c.id === id);
  const wakeUps = WAKE_UP_IDS.map(byIdIn(daily)).filter((c): c is Circuit => Boolean(c));
  const caveDays = CAVE_DAY_IDS.map(byIdIn(cave)).filter((c): c is Circuit => Boolean(c));
  const straightBack = cave.find(c => c.id === STRAIGHT_BACK_ID);
  const doneId = (id: string) => lastDone(sessionLog, id) === today;
  const caveDayDone = caveDays.some(c => doneId(c.id));

  // 3. Climbed today: STRAIGHT BACK, the opposite side of the wall.
  if (climbedToday && straightBack && !doneId(straightBack.id)) {
    return { mode: 'CAVE', circuitId: straightBack.id, reason: 'You climbed today. Now the opposite side.' };
  }

  // 4. A weekday morning: WAKE UP first, whatever the day holds later.
  const weekday = daysBetween(mondayOf(today), today); // 0 = Monday
  const morning = now.getHours() < MORNING_ENDS;
  if (weekday < 5 && morning && wakeUps.length && !wakeUps.some(c => doneId(c.id))) {
    const pick = leastRecent(wakeUps, sessionLog);
    const later = day.kind === 'CAVE' ? ' CAVE later.' : day.kind === 'CLIMB' ? ' Climbing later.' : '';
    return { mode: 'DAILY', circuitId: pick.id, reason: `Morning: wake up the feet.${later}` };
  }

  // 5. CLIMB today: STRAIGHT BACK after the wall.
  if (day.kind === 'CLIMB') {
    if (!straightBack || doneId(straightBack.id)) return null;
    return { mode: 'CAVE', circuitId: straightBack.id, reason: 'Climbing today. This one goes after it.' };
  }

  const climbs = [...new Set(climbLog.map(c => c.date))].filter(d => d <= today);
  const lastClimb = climbs.length ? climbs.sort()[climbs.length - 1] : null;
  /** The next CAVE day: legs within two days of a climb, otherwise the one done longest ago. */
  const nextCaveDay = (): { pick: Circuit; reason: string } | null => {
    const pool = spare(caveDays);
    if (!pool.length) return null;
    const legs = pool.find(c => c.id === CORE_LEGS_ID);
    const sinceClimb = lastClimb ? daysBetween(lastClimb, today) : null;
    if (legs && sinceClimb !== null && sinceClimb >= 1 && sinceClimb <= 2) {
      const legsLast = lastDone(sessionLog, legs.id);
      if (!legsLast || daysBetween(legsLast, today) > 2) {
        return { pick: legs, reason: `Climbed ${sinceClimb === 1 ? 'yesterday' : 'two days ago'}: legs while the arms recover.` };
      }
    }
    const pick = leastRecent(pool, sessionLog);
    return { pick, reason: why(caveDays, pick, `Next CAVE day: ${pick.title}.`) };
  };

  // 6. CAVE today: the CAVE day done longest ago.
  if (day.kind === 'CAVE') {
    if (caveDayDone) return null;
    const next = nextCaveDay();
    return next && { mode: 'CAVE', circuitId: next.pick.id, reason: next.reason };
  }

  // 7. Three training days in a row: rest is due (`restDue`).
  if (restDue(sessionLog, climbLog, now)) return null;

  // 8. ASSESS due, fresh fingers, not a deload week, no climbing today, and
  // not a TIRED day: a test on a bad night measures the night.
  const strong = cave.find(c => c.id === STRONG_ID);
  const fingersReady = strong ? getReadiness(strong, progress).level === 'ready' : false;
  if (test[0] && !input.tired && !forearms && !shortDay && !climbedToday && !block.deload && fingersReady && !doneToday('TEST')
      && assessDue(benchmarkResults, sessionLog, now)) {
    const never = resultHistory(benchmarkResults, 'fs-2arm-20mm').length === 0;
    return {
      mode: 'TEST', circuitId: test[0].id,
      reason: never ? 'No baseline yet. ASSESS sets your loads.' : `Last ASSESS ${RETEST_WEEKS}+ weeks ago. Retest.`,
    };
  }

  // 9. Nothing said yet: the next CAVE day, and the switch above says the rest.
  if (caveDayDone || doneToday('CAVE')) return null;
  const next = nextCaveDay();
  if (!next) return null;
  if (input.tired) return { mode: 'CAVE', circuitId: next.pick.id, reason: 'A TIRED day: CAVE at TIRED, or rest.' };
  return { mode: 'CAVE', circuitId: next.pick.id, reason: `CAVE or CLIMB today? ${next.reason}` };
}

