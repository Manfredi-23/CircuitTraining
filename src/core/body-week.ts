// =============================================================================
// body-week.ts — BODY THIS WEEK: where am I, before choosing (v43)
//
// One row per area, Monday to today: working sets done against a weekly band,
// and a word for it. DUE (behind the pace for the day of the week), ON TRACK,
// ENOUGH (the band's floor is reached), TOO MUCH (past its ceiling),
// RECOVERING (the fingers inside 48h of a hard session) and HEALING (a finger
// heals: fingers and pulling). Climbing counts for the fingers and the pull,
// a boulder session as a few sets of each.
//
// The same arithmetic tells what a session adds to the week, so the session
// page and TODAY can say "LEGS 9 · FEET 6" and how the week looks after it,
// and TRAIN THIS lists the sessions that serve an area. The bands are first
// guesses from the protocols (CORE from CORE_TARGETS), to be tuned once a
// month of logs is in. Pure, no React.
// =============================================================================

import { exerciseLibrary } from './reserve';
import { areaOf, type WorkArea } from './review';
import { CORE_TARGETS } from './insights';
import { fingersReadyAt } from './engine';
import { isHealing } from './recommend';
import { addDays, dayOf, daysBetween, localDate, mondayOf } from './dates';
import type { ClimbSession, Exercise, Progress, ScaledExercise, SessionLogEntry } from './types';

export type BodyArea = Exclude<WorkArea, 'ARMS'>;
export const BODY_AREAS: BodyArea[] = ['FINGERS', 'PULL', 'PUSH', 'CORE', 'BACK', 'LEGS', 'FEET', 'MOBILITY'];

export const BODY_LABEL: Record<BodyArea, string> = {
  FINGERS: 'FINGERS', PULL: 'PULL', PUSH: 'PUSH', CORE: 'CORE', BACK: 'BACK', LEGS: 'LEGS', FEET: 'FEET', MOBILITY: 'MOBILITY',
};

/** Weekly working sets: the floor that counts as enough, and the ceiling. */
export const BODY_BANDS: Record<BodyArea, [number, number]> = {
  FINGERS: [6, 20],
  PULL: [6, 20],
  PUSH: [4, 16],
  CORE: [CORE_TARGETS.abs + CORE_TARGETS.obliques, 44],
  BACK: [CORE_TARGETS.back, 24],
  LEGS: [8, 26],
  FEET: [8, 30],
  MOBILITY: [6, 40],
};

/** A climbing session, counted as working sets. Roped days count for the fingers only. */
const CLIMB_SETS: Partial<Record<BodyArea, number>> = { FINGERS: 4, PULL: 2 };

export type BodyStatus = 'DUE' | 'ON TRACK' | 'ENOUGH' | 'TOO MUCH' | 'RECOVERING' | 'HEALING';

export interface AreaWeek {
  area: BodyArea;
  sets: number;
  /** Climbing sessions counted in `sets` (fingers and pull). */
  climbs: number;
  min: number;
  max: number;
  status: BodyStatus;
  /** The numbers in words, e.g. "9 of 8 sets" or "ready 14:00". */
  detail: string;
}

/** Working sets an exercise list adds, by area. Warm-ups, tests and arm extras do not count. */
export function setsByArea(list: Array<Pick<ScaledExercise, 'scaledSets'> & Exercise>): Record<BodyArea, number> {
  const out = Object.fromEntries(BODY_AREAS.map(a => [a, 0])) as Record<BodyArea, number>;
  for (const e of list) {
    const a = areaOf(e);
    if (a && a !== 'ARMS') out[a] += e.scaledSets;
  }
  return out;
}

/** Working sets logged this week (Monday to today), by area, and the climbs. */
export function weekSets(sessionLog: SessionLogEntry[], climbLog: ClimbSession[], now = new Date()) {
  const today = localDate(now);
  const monday = mondayOf(today);
  const lib = exerciseLibrary();
  const sets = Object.fromEntries(BODY_AREAS.map(a => [a, 0])) as Record<BodyArea, number>;
  for (const s of sessionLog) {
    const day = dayOf(s.date);
    if (day < monday || day > today) continue;
    for (const [id, n] of Object.entries(s.sets ?? {})) {
      const e = lib.get(id);
      const a = e ? areaOf(e) : null;
      if (a && a !== 'ARMS' && n > 0) sets[a] += n;
    }
  }
  const climbs = climbLog.filter(c => c.date >= monday && c.date <= today);
  const boulder = climbs.filter(c => c.discipline !== 'ROPE').length;
  for (const [a, n] of Object.entries(CLIMB_SETS) as [BodyArea, number][]) {
    sets[a] += (a === 'FINGERS' ? climbs.length : boulder) * n;
  }
  return { sets, climbs: climbs.length, dayIndex: daysBetween(monday, today) };
}

export interface BodyWeekInput {
  sessionLog: SessionLogEntry[];
  climbLog: ClimbSession[];
  progress: Progress;
  now?: Date;
}

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** Status of one area from its sets, the band and the day of the week. */
export function statusFor(sets: number, [min, max]: [number, number], dayIndex: number): BodyStatus {
  if (sets > max) return 'TOO MUCH';
  if (sets >= min) return 'ENOUGH';
  // The pace: the share of the floor the days before today should have brought.
  const expected = (min * dayIndex) / 7;
  return sets >= expected * 0.6 ? 'ON TRACK' : 'DUE';
}

/** Every area this week, in a fixed order. */
export function bodyWeek(input: BodyWeekInput): AreaWeek[] {
  const now = input.now ?? new Date();
  const { sets, climbs, dayIndex } = weekSets(input.sessionLog, input.climbLog, now);
  const healing = isHealing(input.sessionLog, input.climbLog, now);
  const ready = fingersReadyAt(input.progress);
  return BODY_AREAS.map(area => {
    const [min, max] = BODY_BANDS[area];
    const n = sets[area];
    let status = statusFor(n, [min, max], dayIndex);
    let detail = `${n} of ${min} sets`;
    const climbNote = CLIMB_SETS[area] && climbs ? `, ${climbs} climb${climbs === 1 ? '' : 's'}` : '';
    detail += climbNote;
    if (healing && (area === 'FINGERS' || area === 'PULL')) {
      status = 'HEALING';
    } else if (area === 'FINGERS' && ready && ready > now && status !== 'TOO MUCH') {
      status = 'RECOVERING';
      detail = `ready ${daysBetween(localDate(now), localDate(ready)) > 0 ? 'tomorrow ' : ''}${hhmm(ready)}${climbNote}`;
    }
    return { area, sets: n, climbs: CLIMB_SETS[area] ? climbs : 0, min, max, status, detail };
  });
}

/** The area a session serves most, or null for one with no working sets. */
export function mainArea(adds: Record<BodyArea, number>): BodyArea | null {
  let best: BodyArea | null = null;
  for (const a of BODY_AREAS) if (adds[a] > 0 && (!best || adds[a] > adds[best])) best = a;
  return best;
}

/** "LEGS 9 · FEET 6 · CORE 6": what a session adds, biggest first. */
export function addsLine(adds: Record<BodyArea, number>, max = 4): string {
  return BODY_AREAS.filter(a => adds[a] > 0)
    .sort((a, b) => adds[b] - adds[a])
    .slice(0, max)
    .map(a => `${a} ${adds[a]}`)
    .join(' · ');
}

/** "LEGS 15 of 8 (ENOUGH) · FEET 10 of 8": the week after the session. */
export function afterLine(week: AreaWeek[], adds: Record<BodyArea, number>, max = 4): string {
  return week
    .filter(w => adds[w.area] > 0)
    .sort((a, b) => adds[b.area] - adds[a.area])
    .slice(0, max)
    .map(w => {
      const total = w.sets + adds[w.area];
      const s = statusFor(total, [w.min, w.max], 7);
      return `${w.area} ${total} of ${w.min}${s === 'TOO MUCH' || s === 'ENOUGH' ? ` (${s})` : ''}`;
    })
    .join(' · ');
}

export interface Serves<T> {
  item: T;
  sets: number;
}

/** The candidates that put at least two working sets into an area, most first. */
export function servesArea<T>(area: BodyArea, candidates: Array<{ item: T; list: ScaledExercise[] }>): Serves<T>[] {
  return candidates
    .map(c => ({ item: c.item, sets: setsByArea(c.list)[area] }))
    .filter(x => x.sets >= 2)
    .sort((a, b) => b.sets - a.sets);
}

/** The areas worth a word on TODAY: anything DUE or TOO MUCH. */
export const flagged = (week: AreaWeek[]) => week.filter(w => w.status === 'DUE' || w.status === 'TOO MUCH');

export { addDays };
