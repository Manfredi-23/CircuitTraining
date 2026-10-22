// =============================================================================
// routines.ts — Sessions the athlete keeps
//
// A routine is a fixed list: these exercises, in this order, with sets and
// reps or seconds the athlete may have changed. It runs through the same
// engine as a programme session (buildList), so level picks the variation,
// energy and the deload week scale it, safety gates substitute, the pain
// check asks, and load history follows the exercise id. Rest is never the
// athlete's to change: it is set by what is being trained.
//
// A routine starts blank, as a copy of a programme session ("make it mine"),
// or frozen from a BUILD session. Pure, no React.
// =============================================================================

import { exerciseLibrary, isCurl, placeOf, type Place } from './reserve';
import { flagsOf } from './custom';
import { getModeData } from './data-index';
import { areaOf, type WorkArea } from './review';
import { CONFIG } from './config';
import { estimateDuration, buildList } from './engine';
import type { Circuit, Exercise, Mode, ScaledExercise } from './types';

export interface RoutineItem {
  id: string;
  /** Sets as written for this routine; absent means the exercise's own. */
  sets?: number;
  /** Reps or seconds per set; absent means the exercise's own. */
  work?: number;
}

export interface Routine {
  id: string;
  name: string;
  place: Place;
  items: RoutineItem[];
  createdAt: string;
  /** What it was made from, e.g. 'cave-05' or 'build'. */
  from?: string;
}

export const ROUTINE_PREFIX = 'routine-';
export const MAX_ITEMS = 16;
export const MAX_SETS = 8;
export const NAME_MAX = 32;

/** Fixed protocols, tests, ramps and warm-ups are taken as written. */
export function isEditable(ex: Exercise): boolean {
  return !ex.fixed && !ex.records && !ex.ramp && ex.block !== 'TEST' && ex.block !== 'WARMUP';
}

export function workBounds(ex: Exercise): { min: number; max: number; step: number } {
  const step = ex.unit === 'sec' ? 5 : 1;
  return { min: Math.max(step, Math.ceil(ex.work / 2)), max: ex.work * 2, step };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The exercise as this routine writes it: its own, with sets and work changed within bounds. */
export function itemExercise(item: RoutineItem): Exercise | undefined {
  const base = exerciseLibrary().get(item.id);
  if (!base) return undefined;
  if (!isEditable(base)) return base;
  const wb = workBounds(base);
  return {
    ...base,
    sets: item.sets === undefined ? base.sets : clamp(Math.round(item.sets), 1, MAX_SETS),
    work: item.work === undefined ? base.work : clamp(item.work, wb.min, wb.max),
  };
}

/** HOME routines log as DAILY, CAVE routines as CAVE, as BUILD sessions do. */
export const routineMode = (r: Routine): Mode => (r.place === 'HOME' ? 'DAILY' : 'CAVE');

let homeIds: Set<string> | null = null;
/** Exercises the home kit (mat, band, portable edge) can do. */
export function isHomeExercise(id: string): boolean {
  if (!homeIds) {
    homeIds = new Set();
    for (const mode of CONFIG.modes as Mode[]) {
      for (const c of getModeData(mode)) {
        if (placeOf(mode, c.id) === 'HOME') for (const e of [...c.exercises, ...(c.substitutes ?? [])]) homeIds.add(e.id);
      }
    }
  }
  return homeIds.has(id) || flagsOf(id).place === 'HOME';
}

const ILLUSTRATION: Record<WorkArea, string> = {
  FINGERS: 'hangboard.svg', PULL: 'pullups.svg', PUSH: 'pushups.svg', CORE: 'core.svg',
  LEGS: 'squats.svg', MOBILITY: 'morning.svg', ARMS: 'dumbbell.svg',
};

/** The routine as a circuit the engine can run. */
export function routineCircuit(r: Routine): Circuit {
  const lib = exerciseLibrary();
  const exercises = r.items.map(itemExercise).filter((e): e is Exercise => Boolean(e));
  const substitutes = exercises
    .map(e => (e.gate?.substituteId ? lib.get(e.gate.substituteId) : undefined))
    .filter((e): e is Exercise => Boolean(e));
  const working = exercises.filter(e => e.block !== 'WARMUP');
  const areas = Array.from(new Set(working.map(areaOf).filter((a): a is WorkArea => Boolean(a))));
  return {
    id: `${ROUTINE_PREFIX}${r.id}`,
    circuitNum: 'R',
    title: r.name,
    subtitle: [r.place === 'HOME' ? 'home' : 'cave', ...areas.map(a => a.toLowerCase())].join(' - '),
    focus: 'Your routine: these exercises, in this order.',
    capacities: Array.from(new Set(working.flatMap(e => e.capacities))),
    illustration: ILLUSTRATION[areas[0] ?? 'CORE'],
    duration: 0,
    // Home is a DAILY: repeatable, no deload. The gym one follows the block
    // and may stack on a bouldering session, like a BUILD session.
    recoveryHours: r.place === 'HOME' ? 0 : 24,
    stacksOnSession: r.place === 'GYM' ? true : undefined,
    exercises,
    ...(substitutes.length ? { substitutes } : {}),
  };
}

let seq = 0;
const newId = (now: number) => `${now.toString(36)}${(seq++).toString(36)}`;

export function blankRoutine(name: string, place: Place, now = Date.now()): Routine {
  return { id: newId(now), name: name.slice(0, NAME_MAX), place, items: [], createdAt: new Date(now).toISOString() };
}

/** A copy of a programme session, as written (substitutes stay in the gate). */
export function routineFromCircuit(circuit: Circuit, mode: Mode, now = Date.now()): Routine {
  return {
    ...blankRoutine(`MY ${circuit.title}`, placeOf(mode, circuit.id), now),
    items: circuit.exercises.map(e => ({ id: e.id })),
    from: circuit.id,
  };
}

/** A built session frozen as it stands: the exercises the builder picked, nothing re-picked next time. */
export function routineFromList(list: ScaledExercise[], name: string, place: Place, now = Date.now()): Routine {
  return {
    ...blankRoutine(name, place, now),
    items: list.map(e => ({ id: e.id })),
    from: 'build',
  };
}

export function renameRoutine(r: Routine, name: string): Routine {
  const n = name.trim().slice(0, NAME_MAX);
  return n ? { ...r, name: n } : r;
}

export function addItem(r: Routine, id: string): Routine {
  if (r.items.length >= MAX_ITEMS || r.items.some(i => i.id === id)) return r;
  return { ...r, items: [...r.items, { id }] };
}

export function removeItem(r: Routine, index: number): Routine {
  return { ...r, items: r.items.filter((_, i) => i !== index) };
}

export function moveItem(r: Routine, index: number, dir: -1 | 1): Routine {
  const j = index + dir;
  if (j < 0 || j >= r.items.length) return r;
  const items = [...r.items];
  [items[index], items[j]] = [items[j], items[index]];
  return { ...r, items };
}

/** Swap an exercise for another, keeping its place in the list. */
export function swapItem(r: Routine, index: number, id: string): Routine {
  if (r.items.some((it, i) => it.id === id && i !== index)) return r;
  return { ...r, items: r.items.map((it, i) => (i === index ? { id } : it)) };
}

/** Change sets or work by a step, inside the bounds. Fixed protocols do not move. */
export function stepItem(r: Routine, index: number, field: 'sets' | 'work', dir: -1 | 1): Routine {
  const item = r.items[index];
  const base = item && exerciseLibrary().get(item.id);
  if (!item || !base || !isEditable(base)) return r;
  let next: RoutineItem;
  if (field === 'sets') {
    const v = clamp((item.sets ?? base.sets) + dir, 1, MAX_SETS);
    next = { ...item, sets: v === base.sets ? undefined : v };
  } else {
    const wb = workBounds(base);
    const v = clamp((item.work ?? base.work) + dir * wb.step, wb.min, wb.max);
    next = { ...item, work: v === base.work ? undefined : v };
  }
  if (next.sets === undefined) delete next.sets;
  if (next.work === undefined) delete next.work;
  return { ...r, items: r.items.map((it, i) => (i === index ? next : it)) };
}

const HEAVY = new Set(['PRIMARY', 'SECONDARY']);
const LIGHT = new Set(['ACCESSORY', 'PREHAB', 'MOBILITY']);
const loadsFingersHard = (e: Exercise) =>
  (e.intensity === 'MAX' || e.intensity === 'HARD') && e.capacities.some(c => c === 'crimp' || c === 'openhand');

/**
 * What a coach would point out. Warnings, never blocks: the athlete decides.
 */
export function routineWarnings(r: Routine): string[] {
  const out: string[] = [];
  const exs = r.items.map(itemExercise).filter((e): e is Exercise => Boolean(e));
  if (!exs.length) return out;

  if (r.place === 'HOME') {
    const away = exs.filter(e => !isHomeExercise(e.id));
    if (away.length) out.push(`Needs gym kit: ${away.map(e => e.name).join(', ')}.`);
    const firstCurl = exs.findIndex(e => isCurl(e.id));
    if (firstCurl >= 0 && exs.slice(firstCurl).some(e => !isCurl(e.id) && e.block !== 'MOBILITY')) {
      out.push('Curling work is best last on a morning session: discs are fullest after waking.');
    }
  }
  const lightIdx = exs.findIndex(e => LIGHT.has(e.block));
  const lateHeavy = lightIdx >= 0 ? exs.slice(lightIdx).find(e => HEAVY.has(e.block) && e.block === 'PRIMARY') : undefined;
  if (lateHeavy) out.push(`${lateHeavy.name} is maximal work after lighter work. Heavy first, while fresh.`);
  if (exs.filter(loadsFingersHard).length > 1) out.push('Two hard finger exercises in one session. One is plenty.');
  if (exs.some(e => e.block !== 'WARMUP') && !exs.some(e => e.block === 'WARMUP') && exs.some(e => HEAVY.has(e.block) && e.intensity !== 'EASY')) {
    out.push('No warm-up. Add one before the hard work.');
  }
  return out;
}

/** Minutes at a given energy, as the session would run. */
export function routineMinutes(r: Routine, progress: Parameters<typeof buildList>[2], energy: Parameters<typeof buildList>[1] = 'NORMAL'): number {
  return estimateDuration(buildList(routineCircuit(r), energy, progress));
}

export interface LibraryEntry {
  exercise: Exercise;
  area: WorkArea | null;
  home: boolean;
}

/**
 * Everything that can go into a routine at this place, by area, matching the
 * query. Tests are left out. Where two sessions carry their own copy of the
 * same exercise, one name is shown once: the copy in `prefer` (already in the
 * routine), else the first.
 */
export function libraryFor(place: Place, query = '', area: WorkArea | 'WARM-UP' | null = null, prefer: string[] = []): LibraryEntry[] {
  const q = query.trim().toLowerCase();
  const out: LibraryEntry[] = [];
  for (const e of exerciseLibrary().values()) {
    if (e.block === 'TEST' || e.records || e.ramp) continue;
    const home = isHomeExercise(e.id);
    if (place === 'HOME' && !home) continue;
    const a = areaOf(e);
    if (area === 'WARM-UP' ? e.block !== 'WARMUP' : area !== null && a !== area) continue;
    if (q && !e.name.toLowerCase().includes(q)) continue;
    const twin = out.findIndex(o => o.exercise.name === e.name);
    if (twin >= 0) {
      if (prefer.includes(e.id)) out[twin] = { exercise: e, area: a, home };
      continue;
    }
    out.push({ exercise: e, area: a, home });
  }
  return out.sort((x, y) => x.exercise.name.localeCompare(y.exercise.name));
}
