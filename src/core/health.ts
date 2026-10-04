// =============================================================================
// health.ts — What Apple Health data means for today's session
//
// Sleep and overnight HRV are the two signals a phone can read that track
// recovery. Neither is reliable alone: one short night or one low reading is
// noise, so HRV is judged against a rolling 7-day baseline of the athlete's
// own readings, never against a population number, and a flag needs a real
// deviation. The result is a suggested energy (FRESH / NORMAL / TIRED) with
// its reasons; the athlete can always pick another. Pure functions, no React.
// =============================================================================

import { addDays, localDate } from './dates';
import type { EnergyKey } from './types';

export interface DayValue { date: string; value: number }
export interface SleepNight { date: string; asleepMin: number; deepMin?: number; remMin?: number }
export interface BodyMass { date: string; kg: number }
export interface HealthClimb { id: string; date: string; minutes: number }

/** What the app keeps from Health. Persisted, capped to HEALTH_KEEP_DAYS. */
export interface HealthData {
  syncedAt: string | null;
  sleep: SleepNight[];
  hrv: DayValue[];
  restingHR: DayValue[];
  bodyMass: BodyMass[];
  /** Health workout ids already turned into climb log entries. */
  importedClimbs: string[];
}

export const EMPTY_HEALTH: HealthData = {
  syncedAt: null, sleep: [], hrv: [], restingHR: [], bodyMass: [], importedClimbs: [],
};

export const HEALTH_KEEP_DAYS = 120;

/** Merge a fresh read into what is stored: newer values win per date. */
export function mergeHealth(
  stored: HealthData,
  fresh: Partial<Pick<HealthData, 'sleep' | 'hrv' | 'restingHR' | 'bodyMass'>>,
  now = new Date(),
): HealthData {
  const since = addDays(localDate(now), -HEALTH_KEEP_DAYS);
  const merge = <T extends { date: string }>(a: T[], b: T[] | undefined): T[] => {
    const map = new Map(a.map(x => [x.date, x]));
    for (const x of b ?? []) map.set(x.date, x);
    return [...map.values()].filter(x => x.date >= since).sort((x, y) => x.date.localeCompare(y.date));
  };
  return {
    syncedAt: now.toISOString(),
    sleep: merge(stored.sleep, fresh.sleep),
    hrv: merge(stored.hrv, fresh.hrv),
    restingHR: merge(stored.restingHR, fresh.restingHR),
    bodyMass: merge(stored.bodyMass, fresh.bodyMass),
    importedClimbs: stored.importedClimbs,
  };
}

// ---- Readiness -------------------------------------------------------------------

/** Below this, last night counts as short. */
export const SHORT_SLEEP_MIN = 6 * 60;
/** Below this, last night alone makes it a TIRED day. */
export const VERY_SHORT_SLEEP_MIN = 5 * 60;
export const GOOD_SLEEP_MIN = 7 * 60;
/** HRV this far below the 7-day mean is a real drop, not day-to-day noise. */
export const HRV_DROP = 0.12;
/** Resting heart rate this far above the 7-day mean, in bpm. */
export const RHR_RISE = 5;
/** Baseline readings needed before HRV or resting HR is judged at all. */
export const MIN_BASELINE_DAYS = 4;

export interface HealthReadiness {
  energy: EnergyKey;
  reasons: string[];
  sleepMin: number | null;
  /** Today's HRV relative to baseline, e.g. -0.18 for 18% below. */
  hrvChange: number | null;
  rhrChange: number | null;
}

const fmtSleep = (min: number) => `${Math.floor(min / 60)}h${String(Math.round(min % 60)).padStart(2, '0')}`;

function baselineChange(series: DayValue[], today: string): { change: number; today: number } | null {
  const now = series.find(d => d.date === today);
  if (!now) return null;
  const from = addDays(today, -7);
  const base = series.filter(d => d.date >= from && d.date < today);
  if (base.length < MIN_BASELINE_DAYS) return null;
  const mean = base.reduce((a, d) => a + d.value, 0) / base.length;
  return mean ? { change: now.value / mean - 1, today: now.value } : null;
}

export function healthReadiness(data: HealthData, now = new Date()): HealthReadiness | null {
  const today = localDate(now);
  const night = data.sleep.find(s => s.date === today);
  const hrv = baselineChange(data.hrv, today);
  const rhrNow = data.restingHR.find(d => d.date === today);
  const rhrBase = (() => {
    const from = addDays(today, -7);
    const base = data.restingHR.filter(d => d.date >= from && d.date < today);
    return base.length >= MIN_BASELINE_DAYS ? base.reduce((a, d) => a + d.value, 0) / base.length : null;
  })();
  const rhrChange = rhrNow && rhrBase !== null ? rhrNow.value - rhrBase : null;

  if (!night && !hrv && rhrChange === null) return null;

  const reasons: string[] = [];
  let flags = 0;
  const sleepMin = night?.asleepMin ?? null;
  if (sleepMin !== null && sleepMin < VERY_SHORT_SLEEP_MIN) {
    flags += 2;
    reasons.push(`${fmtSleep(sleepMin)} asleep`);
  } else if (sleepMin !== null && sleepMin < SHORT_SLEEP_MIN) {
    flags += 1;
    reasons.push(`${fmtSleep(sleepMin)} asleep`);
  }
  if (hrv && hrv.change <= -HRV_DROP) {
    flags += 1;
    reasons.push(`HRV ${Math.round(-hrv.change * 100)}% below your week`);
  }
  if (rhrChange !== null && rhrChange >= RHR_RISE) {
    flags += 1;
    reasons.push(`resting HR +${Math.round(rhrChange)}`);
  }

  let energy: EnergyKey = 'NORMAL';
  if (flags >= 2) energy = 'TIRED';
  else if (flags === 0 && sleepMin !== null && sleepMin >= GOOD_SLEEP_MIN && (!hrv || hrv.change >= 0)) {
    energy = 'FRESH';
    reasons.push(`${fmtSleep(sleepMin)} asleep${hrv ? ', HRV at or above your week' : ''}`);
  } else if (flags === 0) {
    reasons.push(sleepMin !== null ? `${fmtSleep(sleepMin)} asleep` : 'HRV in your normal range');
  }

  return { energy, reasons, sleepMin, hrvChange: hrv?.change ?? null, rhrChange };
}

/** The latest body mass reading newer than `since`, if any. */
export function newBodyMass(data: HealthData, since: string | null): BodyMass | null {
  const latest = data.bodyMass[data.bodyMass.length - 1];
  if (!latest) return null;
  return !since || latest.date > since.slice(0, 10) ? latest : null;
}

/**
 * Health climbing workouts not yet in the climb log. A day that already has a
 * logged climb is left alone (its duration filled in if it had none).
 */
export function climbsToImport(
  climbs: HealthClimb[],
  imported: string[],
  loggedDates: Set<string>,
): HealthClimb[] {
  const seen = new Set(imported);
  return climbs.filter(c => !seen.has(c.id) && !loggedDates.has(c.date) && c.minutes >= 15);
}
