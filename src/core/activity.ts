// =============================================================================
// activity.ts — Everything done outside the app: hikes, ski tours, runs
//
// Weekends in the mountains are a large share of the week's work and were
// invisible to the app. An activity is logged with whatever is remembered —
// often just the type and the height gained — and the rest is estimated, with
// every assumption named so it can be corrected:
//
// - Time from the DIN 33466 walking-time rule (the one Alpine clubs sign
//   paths with): metres up and down per hour plus km on the flat, the larger
//   of vertical and horizontal time plus half the smaller. Each type has its
//   own rates.
// - Distance, when missing, from a typical km per 100 m gained.
// - Effort on the CR10 scale from a base per type, plus a point for a big
//   day of climbing, for a heavy pack and for altitude.
//
// What it changes: training load (effort x minutes, spread over the days, in
// its own lane so a long easy day does not read as a finger-load spike), leg
// XP, and a soreness window after long descents. Eccentric work downhill is
// what leaves the quads sore for two days, so the window reads metres down per
// day, and the recommender keeps leg sessions off the plan while it is open.
// Pure functions, no React.
// =============================================================================

import { addDays } from './dates';
import { sessionInstant } from './climbing';
import type { Capacity, Circuit } from './types';

export type ActivityType =
  | 'HIKE' | 'FERRATA' | 'SKITOUR' | 'TRAILRUN' | 'RUN' | 'BIKE' | 'SWIM' | 'YOGA' | 'OTHER';

export const ACTIVITY_TYPES: ActivityType[] = [
  'HIKE', 'FERRATA', 'SKITOUR', 'TRAILRUN', 'RUN', 'BIKE', 'SWIM', 'YOGA', 'OTHER',
];

export interface ActivitySession {
  id: string;
  /** First day, local YYYY-MM-DD. */
  date: string;
  type: ActivityType;
  /** Days it ran over. 1 when absent. */
  days?: number;
  /** Metres climbed, all days together. */
  upM?: number;
  /** Metres descended, all days together. Assumed equal to the climb when absent. */
  downM?: number;
  distanceKm?: number;
  /** Moving time, all days together. */
  durationMin?: number;
  /** A pack over about 10 kg. */
  heavyPack?: boolean;
  /** Most of it above 2500 m. */
  altitude?: boolean;
  /** Effort 1-10 (CR10) as felt. Estimated when absent. */
  effort?: number;
  /** Free text: the place, the route. */
  place?: string;
}

interface TypeSpec {
  label: string;
  /** Metres climbed per hour, metres descended per hour, km/h on the flat. */
  upPerH: number;
  downPerH: number;
  flatKmh: number;
  /** Distance assumed per 100 m gained, when none is given. */
  kmPer100Up: number;
  /** Minutes per day assumed when nothing at all is given. */
  defaultMin: number;
  baseEffort: number;
  /** Climbing and carrying change the effort for this type. */
  mountain: boolean;
  /** Metres down per day that leave the legs sore for 24h and for 48h. Null: never. */
  sore: [number, number] | null;
  /** Capacities the XP goes to. */
  xp: Capacity[];
}

export const ACTIVITY_SPEC: Record<ActivityType, TypeSpec> = {
  HIKE:     { label: 'HIKE',          upPerH: 300, downPerH: 500,  flatKmh: 4,  kmPer100Up: 1,    defaultMin: 240, baseEffort: 4, mountain: true,  sore: [400, 800],   xp: ['legs'] },
  FERRATA:  { label: 'VIA FERRATA',   upPerH: 250, downPerH: 400,  flatKmh: 3,  kmPer100Up: 0.6,  defaultMin: 300, baseEffort: 5, mountain: true,  sore: [400, 800],   xp: ['legs', 'pull'] },
  SKITOUR:  { label: 'SKI TOUR',      upPerH: 400, downPerH: 2000, flatKmh: 4,  kmPer100Up: 0.8,  defaultMin: 300, baseEffort: 6, mountain: true,  sore: [1200, 2000], xp: ['legs'] },
  TRAILRUN: { label: 'TRAIL RUN',     upPerH: 600, downPerH: 1000, flatKmh: 8,  kmPer100Up: 1.5,  defaultMin: 90,  baseEffort: 7, mountain: true,  sore: [250, 500],   xp: ['legs'] },
  RUN:      { label: 'RUN',           upPerH: 800, downPerH: 1500, flatKmh: 10, kmPer100Up: 5,    defaultMin: 45,  baseEffort: 6, mountain: false, sore: [250, 500],   xp: ['legs'] },
  BIKE:     { label: 'BIKE',          upPerH: 700, downPerH: 2500, flatKmh: 20, kmPer100Up: 4,    defaultMin: 120, baseEffort: 5, mountain: true,  sore: null,         xp: ['legs'] },
  SWIM:     { label: 'SWIM',          upPerH: 1,   downPerH: 1,    flatKmh: 2.5,kmPer100Up: 0,    defaultMin: 45,  baseEffort: 5, mountain: false, sore: null,         xp: ['shoulder'] },
  YOGA:     { label: 'YOGA',          upPerH: 1,   downPerH: 1,    flatKmh: 1,  kmPer100Up: 0,    defaultMin: 60,  baseEffort: 2, mountain: false, sore: null,         xp: ['mobility'] },
  OTHER:    { label: 'OTHER',         upPerH: 300, downPerH: 500,  flatKmh: 4,  kmPer100Up: 0,    defaultMin: 60,  baseEffort: 5, mountain: false, sore: null,         xp: [] },
};

/** Types where height gained and lost mean something. */
export const hasElevation = (t: ActivityType) => ACTIVITY_SPEC[t].kmPer100Up > 0;

/** XP per day, to every capacity of the type. The same as a climbing session. */
export const ACTIVITY_XP_PER_DAY = 2;
/** A long trip earns at most this many days of XP. */
export const ACTIVITY_XP_MAX_DAYS = 3;

/** Climbing per day above which a mountain day counts one point harder, and again above the second. */
const BIG_DAY_UP = [600, 1200];

export interface ActivityEstimate {
  days: number;
  upM: number;
  downM: number;
  distanceKm: number;
  durationMin: number;
  effort: number;
  /** effort x minutes, all days. */
  load: number;
  /** Fields that were assumed rather than entered. */
  assumed: Array<'down' | 'distance' | 'duration' | 'effort'>;
  /** Hours the legs stay sore after the last day. 0: no window. */
  soreHours: number;
}

const round = (n: number, step: number) => Math.round(n / step) * step;

/** DIN 33466: the larger of vertical and horizontal time, plus half the smaller. Hours. */
export function walkingHours(spec: TypeSpec, upM: number, downM: number, km: number): number {
  const vertical = upM / spec.upPerH + downM / spec.downPerH;
  const horizontal = km / spec.flatKmh;
  return Math.max(vertical, horizontal) + Math.min(vertical, horizontal) / 2;
}

export function estimateActivity(a: ActivitySession): ActivityEstimate {
  const spec = ACTIVITY_SPEC[a.type];
  const days = Math.max(1, a.days ?? 1);
  const assumed: ActivityEstimate['assumed'] = [];
  const elevation = hasElevation(a.type);

  const upM = elevation ? Math.max(0, a.upM ?? 0) : 0;
  let downM = elevation ? Math.max(0, a.downM ?? 0) : 0;
  if (elevation && a.downM === undefined && upM > 0) { downM = upM; assumed.push('down'); }

  let distanceKm = a.distanceKm ?? 0;
  if (a.distanceKm === undefined && upM > 0) {
    distanceKm = round((upM / 100) * spec.kmPer100Up, 0.5);
    assumed.push('distance');
  }

  let durationMin = a.durationMin ?? 0;
  if (a.durationMin === undefined) {
    const hours = walkingHours(spec, upM, downM, distanceKm);
    durationMin = hours > 0 ? round(hours * 60, 15) : spec.defaultMin * days;
    assumed.push('duration');
  }

  let effort = a.effort ?? 0;
  if (a.effort === undefined) {
    effort = spec.baseEffort;
    if (spec.mountain) {
      const upPerDay = upM / days;
      if (upPerDay > BIG_DAY_UP[0]) effort++;
      if (upPerDay > BIG_DAY_UP[1]) effort++;
      if (a.heavyPack) effort++;
      if (a.altitude) effort++;
    }
    effort = Math.min(10, effort);
    assumed.push('effort');
  }

  const downPerDay = downM / days;
  const soreHours = spec.sore
    ? (downPerDay >= spec.sore[1] ? 48 : downPerDay >= spec.sore[0] ? 24 : 0)
    : 0;

  return { days, upM, downM, distanceKm, durationMin, effort, load: effort * durationMin, assumed, soreHours };
}

export interface ActivityLoadItem { date: string; load: number; estimated: boolean }

/** One load item per day the activity ran, the total split evenly. */
export function activityLoadItems(log: ActivitySession[]): ActivityLoadItem[] {
  const out: ActivityLoadItem[] = [];
  for (const a of log) {
    const e = estimateActivity(a);
    const estimated = e.assumed.includes('effort') || e.assumed.includes('duration');
    for (let d = 0; d < e.days; d++) out.push({ date: addDays(a.date, d), load: e.load / e.days, estimated });
  }
  return out;
}

/** The last day of an activity. */
export const lastDay = (a: ActivitySession) => addDays(a.date, Math.max(1, a.days ?? 1) - 1);

export interface LegSoreness {
  /** When the window closes. */
  until: Date;
  /** The activity that opened it, the one that closes last. */
  activity: ActivitySession;
}

/**
 * Whether the legs are still sore from a long descent, and until when. The
 * window runs from 18:00 on the last day (or now, if that is today), like a
 * climb logged after the fact.
 */
export function legSoreness(log: ActivitySession[], now = new Date()): LegSoreness | null {
  let out: LegSoreness | null = null;
  for (const a of log) {
    const hours = estimateActivity(a).soreHours;
    if (!hours) continue;
    const until = new Date(sessionInstant(lastDay(a), now).getTime() + hours * 3600_000);
    if (until > now && (!out || until > out.until)) out = { until, activity: a };
  }
  return out;
}

const WORKING = new Set(['PRIMARY', 'SECONDARY', 'ACCESSORY']);

/**
 * A session that loads the legs: two or more working exercises that train the
 * legs first. Fixed drills (FOOTWORK) are technique, not load, and do not count,
 * unless the circuit says otherwise (`legHeavy`, DAILY 06 on the floor).
 */
export function isLegHeavy(circuit: Circuit): boolean {
  if (circuit.legHeavy) return true;
  return circuit.exercises.filter(e => WORKING.has(e.block) && !e.fixed && e.capacities[0] === 'legs').length >= 2;
}

/** One line for the log and the summary, e.g. "+1300 / -1300 m, 13 km, 8h30". */
export function describeEstimate(e: ActivityEstimate, type: ActivityType): string {
  const parts: string[] = [];
  if (hasElevation(type) && (e.upM || e.downM)) parts.push(`+${e.upM} / -${e.downM} m`);
  if (e.distanceKm) parts.push(`${e.distanceKm} km`);
  parts.push(formatMinutes(e.durationMin));
  if (e.days > 1) parts.push(`${e.days} days`);
  return parts.join(', ');
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (!h) return `${m} min`;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}
