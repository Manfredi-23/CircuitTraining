// =============================================================================
// season.ts — Which phase of the season this week belongs to
//
// The block (`block.ts`) is three build weeks and a deload. The season strings
// blocks into phases, each with a job:
//
//   BASE      volume and stamina: technique mileage on the wall, ARC, the
//             FULL BODY training day
//   STRENGTH  the strongest finger and pull work: STRONG first
//   POWER     turning strength into speed: the POWER training day, limit
//             moves and commitment on the wall, a 4x4 a week
//   PEAK      the last week before a trip: no extra training days, short
//             performance goes, rest
//
// With a trip or season date set in the goals, the phases are planned back
// from it: PEAK the last week, POWER the four before, STRENGTH the six before
// those, BASE before that. Without one, the season rolls a block at a time,
// BASE, STRENGTH, POWER, counted from the first logged session, so it moves
// whether or not the athlete restarts a block.
// =============================================================================

import { daysBetween, localDate, mondayOf } from './dates';
import type { Goals } from './goals';
import type { SessionLogEntry } from './types';

export type SeasonPhase = 'BASE' | 'STRENGTH' | 'POWER' | 'PEAK';

export const ROLLING: SeasonPhase[] = ['BASE', 'STRENGTH', 'POWER'];
export const BLOCK_WEEKS = 4;

/** Weeks before the event each phase starts: PEAK the last, POWER the four before, STRENGTH the six before. */
export const PEAK_WEEKS = 1;
export const POWER_WEEKS = 4;
export const STRENGTH_WEEKS = 6;

export interface Season {
  phase: SeasonPhase;
  /** Planned back from an event, or rolling. */
  toward: { date: string; label: string; weeks: number } | null;
  /** Weeks left in this phase, this one included. */
  weeksLeft: number;
  /** What the phase is for, in one line. */
  job: string;
}

export const PHASE_JOB: Record<SeasonPhase, string> = {
  BASE: 'Volume and stamina: mileage on the wall, technique, the full-body day.',
  STRENGTH: 'Strongest finger and pull work: STRONG first on a training day.',
  POWER: 'Strength into speed: the POWER day, limit moves, full commitment.',
  PEAK: 'Peak week: no extra training, short sharp goes, sleep.',
};

export function getSeason(goals: Goals, sessionLog: SessionLogEntry[], now = new Date()): Season {
  const today = localDate(now);
  const event = goals.event;
  if (event && event.date >= today) {
    const weeks = Math.floor(daysBetween(today, event.date) / 7);
    const toward = { ...event, weeks };
    if (weeks < PEAK_WEEKS) return { phase: 'PEAK', toward, weeksLeft: 1, job: PHASE_JOB.PEAK };
    if (weeks < PEAK_WEEKS + POWER_WEEKS) return { phase: 'POWER', toward, weeksLeft: weeks - PEAK_WEEKS + 1, job: PHASE_JOB.POWER };
    if (weeks < PEAK_WEEKS + POWER_WEEKS + STRENGTH_WEEKS) {
      return { phase: 'STRENGTH', toward, weeksLeft: weeks - PEAK_WEEKS - POWER_WEEKS + 1, job: PHASE_JOB.STRENGTH };
    }
    return { phase: 'BASE', toward, weeksLeft: weeks - PEAK_WEEKS - POWER_WEEKS - STRENGTH_WEEKS + 1, job: PHASE_JOB.BASE };
  }
  const first = sessionLog.length ? mondayOf(localDate(new Date(sessionLog[0].date))) : mondayOf(today);
  const weeksIn = Math.max(0, Math.floor(daysBetween(first, mondayOf(today)) / 7));
  const block = Math.floor(weeksIn / BLOCK_WEEKS);
  const phase = ROLLING[block % ROLLING.length];
  return { phase, toward: null, weeksLeft: BLOCK_WEEKS - (weeksIn % BLOCK_WEEKS), job: PHASE_JOB[phase] };
}

/** "STRENGTH phase, 2 weeks left" or "POWER phase, 5 weeks to Fontainebleau". */
export function seasonLabel(s: Season): string {
  const name = `${s.phase.toLowerCase()} phase`;
  if (s.toward) return `${name}, ${s.toward.weeks} week${s.toward.weeks === 1 ? '' : 's'} to ${s.toward.label}`;
  return `${name}, ${s.weeksLeft} week${s.weeksLeft === 1 ? '' : 's'} left`;
}

/** The no-climbing CAVE day each phase prefers after STRONG. */
export const PHASE_TRAINING_DAY: Partial<Record<SeasonPhase, string>> = {
  BASE: 'cave-08',
  POWER: 'cave-07',
};
