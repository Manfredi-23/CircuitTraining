// =============================================================================
// today.ts — What the athlete says about today
//
// The TODAY sheet on the home screen takes four things the logs cannot know:
//
// - ONLY N MINUTES. The session is cut to fit by dropping whole exercises,
//   lightest block first and from the end, never by shortening a rest: rest
//   on quality work is physiology (the same rule DAILY's 20 minutes follows).
//   Warm-ups stay, tests are never cut.
// - NO KIT. A mat and nothing else: DAILY loses band, edge and loaded work and
//   the recommendation is a DAILY.
// - SORE. Legs, back, shoulders or forearms, for today and tomorrow. Sessions
//   that load the area step aside on the recommendation while another fits;
//   sore forearms also keep finger sessions off it.
// - REST DAY or SICK. Nothing is recommended and the day does not count
//   towards capacity decay: planned rest and illness are never punished.
//
// Time, kit and off apply to the day they were set; soreness to that day and
// the next. Pure functions, no React.
// =============================================================================

import { addDays, daysBetween, localDate } from './dates';
import { asksPainCheck, estimateDuration } from './engine';
import type { BlockType, Circuit, Exercise, LoadKind, ScaledExercise } from './types';

export type SoreArea = 'LEGS' | 'BACK' | 'SHOULDERS' | 'FOREARMS';
export const SORE_AREAS: SoreArea[] = ['LEGS', 'BACK', 'SHOULDERS', 'FOREARMS'];
export type OffKind = 'REST' | 'SICK';

export const TIME_CAPS = [10, 15, 20, 30, 45];

export interface DayPlan {
  /** The local day it was set. */
  date: string;
  minutes?: number;
  noKit?: boolean;
  sore?: SoreArea[];
  off?: OffKind;
}

/** What still holds now. */
export interface ActiveDay {
  minutes: number | null;
  noKit: boolean;
  sore: SoreArea[];
  off: OffKind | null;
}

export const NO_DAY: ActiveDay = { minutes: null, noKit: false, sore: [], off: null };

/** Days soreness lasts, the day it was set included. */
export const SORE_DAYS = 2;

export function activeDay(plan: DayPlan | null | undefined, now = new Date()): ActiveDay {
  if (!plan) return NO_DAY;
  const today = localDate(now);
  const age = daysBetween(plan.date, today);
  if (age < 0) return NO_DAY;
  const sameDay = age === 0;
  return {
    minutes: sameDay ? plan.minutes ?? null : null,
    noKit: sameDay && Boolean(plan.noKit),
    sore: age < SORE_DAYS ? plan.sore ?? [] : [],
    off: sameDay ? plan.off ?? null : null,
  };
}

export const isEmptyDay = (d: ActiveDay) => d.minutes === null && !d.noKit && d.sore.length === 0 && d.off === null;

/** One line for the home screen, e.g. "15 MIN · NO KIT · SORE LEGS". */
export function describeDay(d: ActiveDay): string {
  const parts: string[] = [];
  if (d.off) parts.push(d.off === 'SICK' ? 'SICK DAY' : 'REST DAY');
  if (d.minutes !== null) parts.push(`${d.minutes} MIN`);
  if (d.noKit) parts.push('NO KIT');
  if (d.sore.length) parts.push(`SORE ${d.sore.join(' + ')}`);
  return parts.join(' · ');
}

// ---- No kit ----------------------------------------------------------------------

const KIT: LoadKind[] = ['band', 'edge-mm', 'percent-max', 'added-kg', 'finger-kg', 'assisted'];

/** Needs more than a mat. */
export const needsKit = (e: Exercise) => KIT.includes(e.load.kind);

// ---- Time cap --------------------------------------------------------------------

/** Dropped first to last when time is short. Warm-ups and tests are never dropped. */
const DROP_ORDER: BlockType[] = ['ACCESSORY', 'MOBILITY', 'PREHAB', 'SECONDARY', 'PRIMARY'];

/**
 * The session cut to fit `minutes`: whole exercises go, lightest block first
 * and from the end of the session. At least one working exercise stays, so a
 * cap below what is possible gives the shortest real session, not nothing.
 */
export function fitToMinutes(list: ScaledExercise[], minutes: number): ScaledExercise[] {
  if (list.some(e => e.block === 'TEST')) return list;
  let out = [...list];
  for (const block of DROP_ORDER) {
    for (let i = out.length - 1; i >= 0 && estimateDuration(out) > minutes; i--) {
      if (out[i].block !== block) continue;
      if (out.filter(e => e.block !== 'WARMUP').length <= 1) return out;
      out = out.filter((_, j) => j !== i);
    }
    if (estimateDuration(out) <= minutes) break;
  }
  return out;
}

/** Apply today's time and kit to a session list. */
export function applyDay(list: ScaledExercise[], circuit: Circuit, day: ActiveDay, mode: string): ScaledExercise[] {
  let out = list;
  if (day.noKit && mode === 'DAILY') out = out.filter(e => !needsKit(e));
  // A BUILD session is made for the time picked on it; today's cap only sets
  // where that picker opens, so it does not cut the session again.
  if (day.minutes !== null && !circuit.id.startsWith('custom-')) out = fitToMinutes(out, day.minutes);
  return out;
}

// ---- Soreness --------------------------------------------------------------------

const WORKING = new Set<BlockType>(['PRIMARY', 'SECONDARY', 'ACCESSORY']);

function hitsArea(e: Exercise, area: SoreArea): boolean {
  switch (area) {
    case 'LEGS': return e.capacities[0] === 'legs';
    case 'BACK': return e.protocolId === 'back-strength';
    case 'SHOULDERS': return ['press', 'shoulder', 'pull'].includes(e.capacities[0] ?? '');
    case 'FOREARMS': return e.capacities.some(c => c === 'crimp' || c === 'openhand' || c === 'forearm');
  }
}

/**
 * A session that loads a sore area: two or more working exercises on it (fixed
 * drills are technique, not load). Sore forearms rule out every session that
 * loads the fingers at all.
 */
export function loadsArea(circuit: Circuit, area: SoreArea): boolean {
  if (area === 'FOREARMS' && asksPainCheck(circuit)) return true;
  return circuit.exercises.filter(e => WORKING.has(e.block) && !e.fixed && hitsArea(e, area)).length >= 2;
}

// ---- Off days and decay ----------------------------------------------------------

/** Off days strictly after `from` (a local date) and up to `today`. */
export function offDaysSince(offDays: string[], from: string, today: string): number {
  return offDays.filter(d => d > from && d <= today).length;
}

/** The list of off days with `date` added or removed. Kept to the last 120 days. */
export function setOffDay(offDays: string[], date: string, on: boolean): string[] {
  const since = addDays(date, -120);
  const rest = offDays.filter(d => d !== date && d >= since);
  return (on ? [...rest, date] : rest).sort();
}
