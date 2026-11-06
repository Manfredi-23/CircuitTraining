// =============================================================================
// patata.ts — THE PATATOMETRO (v44)
//
// At the gym, one tap: PATATA or NO PATATA, at FLUELA or OERLIKON. Every tap
// is kept with its time (`patataLog`, persisted, in backups), so over the
// weeks the log says when and where patata is at its highest.
//
// The unit the statistics count is one gym, one day, one time slot: three taps
// in the same slot of the same visit count once, and the slot had patata if
// any of its taps said so. A cell is named as the best only once it holds
// MIN_SAMPLE of those, and cells are ranked by a smoothed chance
// ((yes + 1) / (n + 2)), so one lucky visit never beats four out of five.
// Pure, no React.
// =============================================================================

import { localDate } from './dates';

export type PatataGym = 'FLUELA' | 'OERLIKON';

export const PATATA_GYMS: readonly PatataGym[] = ['FLUELA', 'OERLIKON'];

export interface PatataReading {
  id: string;
  /** When the button was tapped, ISO. */
  at: string;
  gym: PatataGym;
  patata: boolean;
}

/** Time slots of a gym day, by the hour on the clock. `to` is exclusive. */
export const PATATA_SLOTS = [
  { label: 'BEFORE 12', short: '-12', from: 0, to: 12 },
  { label: '12-16', short: '12-16', from: 12, to: 16 },
  { label: '16-18', short: '16-18', from: 16, to: 18 },
  { label: '18-20', short: '18-20', from: 18, to: 20 },
  { label: 'AFTER 20', short: '20-', from: 20, to: 24 },
] as const;

export const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Observations a cell needs before it can be named as the best. */
export const MIN_SAMPLE = 2;

/** The slot an hour falls in. */
export function slotOf(hour: number): number {
  const i = PATATA_SLOTS.findIndex(s => hour >= s.from && hour < s.to);
  return i < 0 ? PATATA_SLOTS.length - 1 : i;
}

/** Monday 0 to Sunday 6. */
export function weekdayOf(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** HH:MM, local. */
export function clockOf(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function valid(r: PatataReading | null | undefined): r is PatataReading {
  return !!r && PATATA_GYMS.includes(r.gym) && typeof r.patata === 'boolean' && !Number.isNaN(new Date(r.at).getTime());
}

/** The log with one more tap, oldest first. */
export function addReading(log: PatataReading[], gym: PatataGym, patata: boolean, now = new Date()): PatataReading[] {
  const id = `patata-${now.getTime()}-${log.length}`;
  return [...log, { id, at: now.toISOString(), gym, patata }].sort((a, b) => a.at.localeCompare(b.at));
}

export function removeReading(log: PatataReading[], id: string): PatataReading[] {
  return log.filter(r => r.id !== id);
}

/** Today's taps, oldest first. */
export function readingsOn(log: PatataReading[], day: string): PatataReading[] {
  return log.filter(r => valid(r) && localDate(new Date(r.at)) === day);
}

/** The gym the toggle opens on: the one tapped last, FLUELA before the first tap. */
export function lastGym(log: PatataReading[]): PatataGym {
  const last = [...log].filter(valid).sort((a, b) => b.at.localeCompare(a.at))[0];
  return last?.gym ?? 'FLUELA';
}

/** One gym, one day, one slot. */
export interface Observation {
  gym: PatataGym;
  day: string;
  weekday: number;
  slot: number;
  patata: boolean;
}

/** The taps folded to observations: one per gym, day and slot; patata if any tap said so. */
export function observations(log: PatataReading[]): Observation[] {
  const byKey = new Map<string, Observation>();
  for (const r of log) {
    if (!valid(r)) continue;
    const d = new Date(r.at);
    const day = localDate(d);
    const slot = slotOf(d.getHours());
    const key = `${r.gym}|${day}|${slot}`;
    const o = byKey.get(key);
    if (o) o.patata = o.patata || r.patata;
    else byKey.set(key, { gym: r.gym, day, weekday: weekdayOf(d), slot, patata: r.patata });
  }
  return [...byKey.values()];
}

/** Times with patata out of times looked. */
export interface Tally {
  yes: number;
  n: number;
}

const tally = (patata: boolean[]): Tally => ({ yes: patata.filter(Boolean).length, n: patata.length });

/** Smoothed chance, for ranking: an empty tally reads 0.5, one lucky visit 0.67, 4 of 5 0.71. */
export function chance(t: Tally): number {
  return (t.yes + 1) / (t.n + 2);
}

/** Visits (gym-days), each with patata if any slot had it. */
function visits(obs: Observation[]): Observation[] {
  const byDay = new Map<string, Observation>();
  for (const o of obs) {
    const key = `${o.gym}|${o.day}`;
    const v = byDay.get(key);
    if (v) v.patata = v.patata || o.patata;
    else byDay.set(key, { ...o });
  }
  return [...byDay.values()];
}

/**
 * The grid for one gym: weekday x slot, with a total per weekday (visits that
 * day of the week), per slot, and for the gym (visits).
 */
export interface PatataGrid {
  gym: PatataGym;
  cells: Tally[][];
  byWeekday: Tally[];
  bySlot: Tally[];
  total: Tally;
}

export function gridFor(log: PatataReading[], gym: PatataGym): PatataGrid {
  const obs = observations(log).filter(o => o.gym === gym);
  const days = visits(obs);
  return {
    gym,
    cells: WEEKDAYS.map((_, w) => PATATA_SLOTS.map((_, s) => tally(obs.filter(o => o.weekday === w && o.slot === s).map(o => o.patata)))),
    byWeekday: WEEKDAYS.map((_, w) => tally(days.filter(o => o.weekday === w).map(o => o.patata))),
    bySlot: PATATA_SLOTS.map((_, s) => tally(obs.filter(o => o.slot === s).map(o => o.patata))),
    total: tally(days.map(o => o.patata)),
  };
}

export interface PatataPeak extends Tally {
  gym: PatataGym;
  weekday: number;
  slot: number;
}

/** The cell with the most patata, at one gym or both; null until a cell has MIN_SAMPLE with patata in it. */
export function peak(log: PatataReading[], gym?: PatataGym, only?: { weekday?: number; fromSlot?: number }): PatataPeak | null {
  let best: PatataPeak | null = null;
  for (const g of gym ? [gym] : PATATA_GYMS) {
    const { cells } = gridFor(log, g);
    for (let weekday = 0; weekday < cells.length; weekday++) {
      if (only?.weekday !== undefined && weekday !== only.weekday) continue;
      for (let slot = 0; slot < cells[weekday].length; slot++) {
        if (only?.fromSlot !== undefined && slot < only.fromSlot) continue;
        const t = cells[weekday][slot];
        if (t.n < MIN_SAMPLE || t.yes === 0) continue;
        const c: PatataPeak = { gym: g, weekday, slot, ...t };
        if (!best || chance(c) > chance(best) || (chance(c) === chance(best) && c.n > best.n)) best = c;
      }
    }
  }
  return best;
}

export const peakLabel = (p: PatataPeak) => `${p.gym}, ${WEEKDAYS[p.weekday]} ${PATATA_SLOTS[p.slot].label}`;
const ofText = (t: Tally) => `${t.yes} of ${t.n}`;

/** The answer in one sentence, on top of the stats. */
export function patataHeadline(log: PatataReading[]): string {
  const obs = observations(log);
  if (!obs.length) return 'One tap at the gym: PATATA or NO PATATA. Every tap keeps its time.';
  const p = peak(log);
  if (!p) {
    return `${obs.length} ${obs.length === 1 ? 'reading' : 'readings'} so far. The best time shows once a slot has been seen ${MIN_SAMPLE === 2 ? 'twice' : `${MIN_SAMPLE} times`}, with patata at least once.`;
  }
  return `Most patata: ${peakLabel(p)}, ${ofText(p)}.`;
}

/** Right now and the rest of today, at each gym. */
export interface PatataForecast {
  gym: PatataGym;
  now: Tally;
  /** The best slot from now to closing, today's weekday. */
  later: PatataPeak | null;
}

export function forecast(log: PatataReading[], now = new Date()): { weekday: number; slot: number; gyms: PatataForecast[] } {
  const weekday = weekdayOf(now);
  const slot = slotOf(now.getHours());
  return {
    weekday,
    slot,
    gyms: PATATA_GYMS.map(gym => ({
      gym,
      now: gridFor(log, gym).cells[weekday][slot],
      later: peak(log, gym, { weekday, fromSlot: slot }),
    })),
  };
}

/** The line under the forecast heading: "Thursday, now 18-20: OERLIKON 4 of 5, FLUELA no readings." */
export function forecastLine(log: PatataReading[], now = new Date()): string {
  const f = forecast(log, now);
  const parts = f.gyms.map(g => `${g.gym} ${g.now.n ? ofText(g.now) : 'no readings'}`);
  return `${WEEKDAY_NAMES[f.weekday]}, now ${PATATA_SLOTS[f.slot].label}: ${parts.join(', ')}.`;
}

/** The best slot left today at either gym, the one in progress included; null when the log has none. */
export function laterLine(log: PatataReading[], now = new Date()): string | null {
  const best = forecast(log, now).gyms
    .map(g => g.later)
    .filter((p): p is PatataPeak => !!p)
    .sort((a, b) => chance(b) - chance(a) || b.n - a.n)[0];
  return best ? `Best of the rest of today: ${best.gym} ${PATATA_SLOTS[best.slot].label}, ${ofText(best)}.` : null;
}

/** Visits with patata at one gym: "patata on 7 of 12 visits". */
export function visitsLine(log: PatataReading[], gym: PatataGym): string {
  const t = gridFor(log, gym).total;
  return t.n ? `patata on ${ofText(t)} ${t.n === 1 ? 'visit' : 'visits'}` : 'no visits logged';
}

/** The folded line on TODAY: today's last tap, else the peak, else the ask. */
export function patataSummary(log: PatataReading[], now = new Date()): { text: string; on: boolean } {
  const today = readingsOn(log, localDate(now));
  const last = today[today.length - 1];
  if (last) return { text: `Today: ${last.patata ? 'PATATA' : 'NO PATATA'} at ${last.gym}, ${clockOf(last.at)}`, on: last.patata };
  const p = peak(log);
  if (p) return { text: `Most patata: ${peakLabel(p)}`, on: false };
  return { text: 'Was there patata today? One tap.', on: false };
}
