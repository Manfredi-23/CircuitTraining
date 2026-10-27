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
import { daysBetween, dayOf, localDate, mondayOf } from './dates';
import { resultHistory } from './benchmarks';
import { REHAB_BENCHMARKS, RING_RIGHT_BENCHMARK } from './rehab';
import { FOOTWORK_ID, HEAL_GYM_IDS, RING_REHAB_ID, RING_TEST_ID } from './data-heal';
import type { BlockWeek } from './block';
import { PHASE_TRAINING_DAY, type SeasonPhase } from './season';
import { ACTIVITY_SPEC, isLegHeavy, legSoreness, type ActivitySession } from './activity';
import { NO_DAY, loadsArea, needsKit, type ActiveDay, type SoreArea } from './today';
import type { BenchmarkResult, Circuit, ClimbSession, Mode, Progress, SessionLogEntry } from './types';

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

/** A finger is healing: a HEAL session in the last ten days and no climb logged since. */
export function isHealing(sessionLog: SessionLogEntry[], climbLog: ClimbSession[], now = new Date()): boolean {
  const heal = sessionLog.filter(s => s.mode === 'HEAL');
  if (!heal.length) return false;
  const last = dayOf(heal[heal.length - 1].date);
  return daysBetween(last, localDate(now)) <= HEAL_MEMORY_DAYS && !climbLog.some(c => c.date >= last);
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
  // Logging a climb ends it.
  const heal = getModeData('HEAL');
  const healLog = sessionLog.filter(s => s.mode === 'HEAL');
  if (isHealing(sessionLog, climbLog, now)) {
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

  // 3. Climbed today: the after-bouldering session, alternating 02 and 03.
  const stacking = cave.filter(c => c.stacksOnSession);
  if (climbedToday && !doneToday('CAVE') && stacking.length) {
    const pick = leastRecent(spare(stacking), sessionLog);
    return { mode: 'CAVE', circuitId: pick.id, reason: why(stacking, pick, 'You climbed today. This one stacks on it.') };
  }

  const strong = cave.find(c => c.id === STRONG_ID);
  const fingersReady = strong ? getReadiness(strong, progress).level === 'ready' : false;

  // 4. ASSESS due, fresh fingers, not a deload week, no climbing today, and
  // not a TIRED day: a test on a bad night measures the night.
  if (test[0] && !input.tired && !forearms && !shortDay && !climbedToday && !block.deload && fingersReady && !doneToday('TEST')
      && assessDue(benchmarkResults, sessionLog, now)) {
    const never = resultHistory(benchmarkResults, 'fs-2arm-20mm').length === 0;
    return {
      mode: 'TEST', circuitId: test[0].id,
      reason: never ? 'No baseline yet. ASSESS sets your loads.' : `Last ASSESS ${RETEST_WEEKS}+ weeks ago. Retest.`,
    };
  }

  // 5. A training day: from Thursday, in a week with fewer than two climbing
  // days, each missing bouldering day can be a no-climbing CAVE session.
  // STRONG first while the fingers are fresh and it is not done this week,
  // otherwise POWER or FULL BODY, whichever was done least recently. Only once
  // climbs are being logged: with an empty climb log the app cannot tell a
  // skipped bouldering day from one that was never written down.
  const monday = mondayOf(today);
  const weekday = daysBetween(monday, today); // 0 = Monday
  const climbsThisWeek = new Set(climbLog.filter(c => c.date >= monday && c.date <= today).map(c => c.date)).size;
  const training = cave.filter(c => !c.stacksOnSession);
  const trainingThisWeek = new Set(sessionLog
    .filter(s => training.some(c => c.id === s.circuitId) && dayOf(s.date) >= monday)
    .map(s => dayOf(s.date))).size;
  const strongThisWeek = strong ? sessionLog.some(s => s.circuitId === strong.id && dayOf(s.date) >= monday) : true;
  // A peak week adds no training days: the trip is the training.
  if (climbLog.length > 0 && !input.tired && !shortDay && weekday >= 3 && climbsThisWeek + trainingThisWeek < 2
      && !climbedToday && !doneToday('CAVE') && input.season !== 'PEAK') {
    const reason = (title: string) =>
      `${climbsThisWeek} climbing day${climbsThisWeek === 1 ? '' : 's'} this week. ${title} instead.`;
    if (strong && !forearms && fingersReady && !strongThisWeek) {
      return { mode: 'CAVE', circuitId: strong.id, reason: reason(strong.title) };
    }
    const others = training.filter(c => c.id !== strong?.id
      && getReadiness(c, progress).level === 'ready' && !(forearms && asksPainCheck(c)));
    if (others.length) {
      // BASE prefers FULL BODY and POWER prefers POWER, unless done this week.
      const phaseId = input.season ? PHASE_TRAINING_DAY[input.season] : undefined;
      const phasePick = others.find(c => c.id === phaseId
        && !sessionLog.some(s => s.circuitId === c.id && dayOf(s.date) >= monday));
      const pick = phasePick ?? leastRecent(spare(others), sessionLog);
      const text = phasePick ? `${reason(pick.title)} ${input.season!.charAt(0)}${input.season!.slice(1).toLowerCase()} phase.` : reason(pick.title);
      return { mode: 'CAVE', circuitId: pick.id, reason: why(others, pick, text) };
    }
  }

  // 6. The morning DAILY, rotating through the five.
  if (doneToday('DAILY')) return null;
  if (input.tired) {
    const pick = leastRecent(spare(daily), sessionLog);
    return { mode: 'DAILY', circuitId: pick.id, reason: why(daily, pick, 'A TIRED day: something light instead.') };
  }
  const pick = leastRecent(spare(daily), sessionLog);
  if (why(daily, pick, '')) return { mode: 'DAILY', circuitId: pick.id, reason: soreReason };
  const last = lastDone(sessionLog, pick.id);
  const ago = last ? daysBetween(last, today) : null;
  return {
    mode: 'DAILY', circuitId: pick.id,
    reason: ago === null ? 'Next in the DAILY rotation.' : `Next in rotation, last done ${ago === 1 ? 'yesterday' : `${ago} days ago`}.`,
  };
}

