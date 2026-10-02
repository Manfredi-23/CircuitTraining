// =============================================================================
// climbing.ts — The climb log: grade scales and the numbers drawn from them
//
// Logged by hand, after the session. Boards and outdoor boulders use Font,
// roped climbing uses French sport grades, and the gym uses its colour circuit.
// Each scale is ordered, so a grade's index is its difficulty rank and charts
// can compare sessions within one scale. Scales are never mixed on one chart:
// a gym colour is a band, not a grade, and pretending otherwise would draw
// progress that did not happen.
//
// A logged boulder session counts as finger loading for readiness. Its XP goes
// to contact strength and body tension, never to crimp or open hand: those
// levels set hangboard loads, and climbing volume is not evidence that a
// heavier hang is safe.
// =============================================================================

import type { Capacity, ClimbDiscipline, ClimbSession, ClimbVenue } from './types';

export const FONT_GRADES = [
  '3', '4', '4+', '5', '5+',
  '6A', '6A+', '6B', '6B+', '6C', '6C+',
  '7A', '7A+', '7B', '7B+', '7C', '7C+',
  '8A', '8A+', '8B', '8B+', '8C', '8C+',
] as const;

export const FRENCH_GRADES = [
  '4a', '4b', '4c', '5a', '5b', '5c',
  '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a',
] as const;

/**
 * Minimum Zurich colour circuit, easiest first. Colours are difficulty bands,
 * not grades: `font` is the band as the gym publishes it.
 */
export const GYM_COLOURS = [
  { id: 'YELLOW', label: 'Yellow', hex: '#F2CF2E', font: 'up to 4+' },
  { id: 'GREEN',  label: 'Green',  hex: '#3FA63A', font: '5 to 6A' },
  { id: 'ORANGE', label: 'Orange', hex: '#E8902B', font: '6A+ to 6B+' },
  { id: 'BLUE',   label: 'Blue',   hex: '#2C5FD0', font: '6C to 7A' },
  { id: 'RED',    label: 'Red',    hex: '#D23A2C', font: '7A+ to 7B+' },
  { id: 'WHITE',  label: 'White',  hex: '#FFFFFF', font: '7C to 8A' },
  { id: 'BLACK',  label: 'Black',  hex: '#181610', font: '8A+ and up' },
] as const;

export const BOARD_ANGLES = { min: 0, max: 70, step: 5, default: 40 };

/** The four views the log is read in. Each one is a single grade scale. */
export type ClimbView = 'BOARD' | 'GYM' | 'ROCK' | 'ROPE';

export type GradeScale = 'FONT' | 'FRENCH' | 'COLOUR';

export function scaleFor(venue: ClimbVenue, discipline: ClimbDiscipline): GradeScale {
  if (discipline === 'ROPE') return 'FRENCH';
  return venue === 'GYM' ? 'COLOUR' : 'FONT';
}

export function viewFor(session: ClimbSession): ClimbView {
  if (session.discipline === 'ROPE') return 'ROPE';
  if (session.venue === 'BOARD') return 'BOARD';
  return session.venue === 'GYM' ? 'GYM' : 'ROCK';
}

export function viewScale(view: ClimbView): GradeScale {
  return view === 'ROPE' ? 'FRENCH' : view === 'GYM' ? 'COLOUR' : 'FONT';
}

export function gradesOf(scale: GradeScale): readonly string[] {
  if (scale === 'FRENCH') return FRENCH_GRADES;
  if (scale === 'COLOUR') return GYM_COLOURS.map(c => c.id);
  return FONT_GRADES;
}

/** Difficulty rank within the scale, or -1 for a grade the scale does not know. */
export function gradeIndex(scale: GradeScale, grade: string): number {
  return gradesOf(scale).indexOf(grade);
}

export function gradeLabel(grade: string): string {
  return GYM_COLOURS.find(c => c.id === grade)?.label ?? grade;
}

// ---- Training link -----------------------------------------------------------

/** Capacities a session earns XP in. */
export function climbXpCapacities(session: ClimbSession): Capacity[] {
  return session.discipline === 'ROPE' ? ['forearm'] : ['contact', 'tension'];
}

/**
 * Capacities whose `lastTrained` the session moves without earning XP. Hard
 * bouldering is near-maximal finger loading, so it has to count against the
 * 48h between maximal finger sessions or readiness would wave a max-hang day
 * through the morning after a board session.
 */
export function climbLoadedCapacities(session: ClimbSession): Capacity[] {
  return session.discipline === 'BOULDER' ? ['crimp', 'openhand'] : [];
}

export const CLIMB_SESSION_XP = 2;

/**
 * When the session happened, as an instant. Today's session is now; a session
 * logged after the fact sits at 18:00 on its day, so recovery is counted from
 * roughly when the fingers were loaded.
 */
export function sessionInstant(date: string, now = new Date()): Date {
  if (date === localDate(now)) return now;
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, 18, 0, 0);
}

export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---- Numbers -----------------------------------------------------------------

export interface PyramidRow {
  grade: string;
  flash: number;
  send: number;
  project: number;
  /** Mean attempts across sends at this grade, flashes included. Null without sends. */
  attemptsPerSend: number | null;
}

/** Every grade that has an entry in the view, hardest first. */
export function getPyramid(sessions: ClimbSession[], view: ClimbView): PyramidRow[] {
  const scale = viewScale(view);
  const rows = new Map<string, PyramidRow & { attempts: number }>();
  for (const s of sessions) {
    if (viewFor(s) !== view) continue;
    for (const c of s.climbs) {
      if (gradeIndex(scale, c.grade) < 0) continue;
      const row = rows.get(c.grade)
        ?? { grade: c.grade, flash: 0, send: 0, project: 0, attempts: 0, attemptsPerSend: null };
      if (!c.sent) row.project++;
      else {
        if (c.attempts <= 1) row.flash++; else row.send++;
        row.attempts += c.attempts;
      }
      rows.set(c.grade, row);
    }
  }
  return [...rows.values()]
    .map(({ attempts, ...r }) => {
      const sends = r.flash + r.send;
      return { ...r, attemptsPerSend: sends ? attempts / sends : null };
    })
    .sort((a, b) => gradeIndex(scale, b.grade) - gradeIndex(scale, a.grade));
}

export interface WeekPoint {
  /** Monday of the week, YYYY-MM-DD. */
  week: string;
  /** Hardest send that week, as a grade index; null when nothing was sent. */
  bestSend: number | null;
  bestFlash: number | null;
}

function mondayOf(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const day = new Date(y, m - 1, d);
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  return localDate(day);
}

/** Hardest send and hardest flash per week, oldest first, for weeks with climbing. */
export function getBestPerWeek(sessions: ClimbSession[], view: ClimbView): WeekPoint[] {
  const scale = viewScale(view);
  const weeks = new Map<string, WeekPoint>();
  for (const s of sessions) {
    if (viewFor(s) !== view) continue;
    const week = mondayOf(s.date);
    const pt = weeks.get(week) ?? { week, bestSend: null, bestFlash: null };
    for (const c of s.climbs) {
      if (!c.sent) continue;
      const i = gradeIndex(scale, c.grade);
      if (i < 0) continue;
      pt.bestSend = Math.max(pt.bestSend ?? -1, i);
      if (c.attempts <= 1) pt.bestFlash = Math.max(pt.bestFlash ?? -1, i);
    }
    weeks.set(week, pt);
  }
  return [...weeks.values()].sort((a, b) => a.week.localeCompare(b.week));
}

export interface ClimbSummary {
  sessions: number;
  climbs: number;
  sends: number;
  flashes: number;
  hardestSend: string | null;
  hardestFlash: string | null;
}

export function getClimbSummary(sessions: ClimbSession[], view: ClimbView): ClimbSummary {
  const scale = viewScale(view);
  const out: ClimbSummary = { sessions: 0, climbs: 0, sends: 0, flashes: 0, hardestSend: null, hardestFlash: null };
  let bestSend = -1, bestFlash = -1;
  for (const s of sessions) {
    if (viewFor(s) !== view) continue;
    out.sessions++;
    for (const c of s.climbs) {
      out.climbs++;
      if (!c.sent) continue;
      out.sends++;
      const i = gradeIndex(scale, c.grade);
      if (i > bestSend) { bestSend = i; out.hardestSend = c.grade; }
      if (c.attempts <= 1) {
        out.flashes++;
        if (i > bestFlash) { bestFlash = i; out.hardestFlash = c.grade; }
      }
    }
  }
  return out;
}
