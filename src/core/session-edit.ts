// =============================================================================
// session-edit.ts — Changing a session before starting it
//
// The session page has EDIT: each exercise can be swapped, removed, moved,
// given more or fewer sets and reps or seconds, and a target load; exercises
// and packs can be added. An edit holds for today; KEEP FOR NEXT TIME keeps
// it on that session until RESET.
//
// The edited session keeps its circuit id, so it is still logged as CAVE 05
// and the recommender and readiness see it as such. It runs through
// buildList like any session: level picks the variation, energy and the
// deload week scale sets, gates substitute, the pain check asks. Rest is
// never the athlete's to change.
//
// Packs are short add-on blocks (core finisher, arms, shoulder care...),
// added in one tap before a session or in the middle of one. Pure, no React.
// =============================================================================

import { exerciseLibrary, insertIndex, type Place } from './reserve';
import { flagsOf } from './custom';
import { isEditable, isHomeExercise, libraryFor, MAX_SETS, routineWarnings, workBounds, type LibraryEntry } from './routines';
import { areaOf } from './review';
import { getLoadAxis, clampToAxis } from './load';
import { loadsFingers, PAIN_REDUCE_FROM } from './engine';
import { needsKit } from './today';
import type { Circuit, Exercise, Mode } from './types';

export interface EditItem {
  id: string;
  /** Sets as written; absent means the exercise's own. */
  sets?: number;
  /** Reps or seconds per set; absent means the exercise's own. */
  work?: number;
  /** The load planned for today, in the stepper's unit: the stepper opens on it. */
  target?: number;
}

export interface SessionEdit {
  items: EditItem[];
  /** The day it was made (YYYY-MM-DD): it holds for that day only. */
  day: string;
  /** KEEP FOR NEXT TIME: holds every day until RESET. */
  kept?: boolean;
}

/** Edits by circuit id. Persisted. */
export type SessionEdits = Record<string, SessionEdit>;

export const MAX_EDIT_ITEMS = 20;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The edit that applies to a session today, if any. */
export function activeEdit(edits: SessionEdits | undefined, circuitId: string, today: string): SessionEdit | null {
  const e = edits?.[circuitId];
  if (!e) return null;
  return e.kept || e.day === today ? e : null;
}

/** The session as written, as a list of items to edit. */
export function editFromCircuit(circuit: Circuit, today: string): SessionEdit {
  return { items: circuit.exercises.map(e => ({ id: e.id })), day: today };
}

/** An exercise by id: the session's own copy first, then the library. */
function baseOf(circuit: Circuit, id: string): Exercise | undefined {
  return [...circuit.exercises, ...(circuit.substitutes ?? [])].find(e => e.id === id) ?? exerciseLibrary().get(id);
}

/** The exercise as the edit writes it: sets and work within bounds, the target load on it. */
export function editExercise(circuit: Circuit, item: EditItem): Exercise | undefined {
  const base = baseOf(circuit, item.id);
  if (!base) return undefined;
  const out: Exercise = { ...base };
  if (isEditable(base)) {
    const wb = workBounds(base);
    if (item.sets !== undefined) out.sets = clamp(Math.round(item.sets), 1, MAX_SETS);
    if (item.work !== undefined) out.work = clamp(item.work, wb.min, wb.max);
  }
  const axis = getLoadAxis(base);
  if (item.target !== undefined && axis && !base.ramp) out.targetLoad = clampToAxis(item.target, axis);
  return out;
}

/** The session with the edit applied. Same id, so it logs and recovers as itself. */
export function editedCircuit(circuit: Circuit, edit: SessionEdit | null): Circuit {
  if (!edit) return circuit;
  const exercises = edit.items.map(i => editExercise(circuit, i)).filter((e): e is Exercise => Boolean(e));
  const lib = exerciseLibrary();
  const subs = [...(circuit.substitutes ?? [])];
  for (const e of exercises) {
    for (const sid of [e.gate?.substituteId, e.noGripId]) {
      const s = sid ? baseOf(circuit, sid) ?? lib.get(sid) : undefined;
      if (s && !subs.some(x => x.id === s.id)) subs.push(s);
    }
  }
  const working = exercises.filter(e => e.block !== 'WARMUP');
  return {
    ...circuit,
    exercises,
    capacities: Array.from(new Set([...circuit.capacities, ...working.flatMap(e => e.capacities)])),
    ...(subs.length ? { substitutes: subs } : {}),
  };
}

/** Whether the edit differs from the session as written. */
export function isChanged(circuit: Circuit, edit: SessionEdit | null): boolean {
  if (!edit) return false;
  if (edit.items.length !== circuit.exercises.length) return true;
  return edit.items.some((it, i) =>
    it.id !== circuit.exercises[i].id || it.sets !== undefined || it.work !== undefined || it.target !== undefined);
}

const replaceAt = (edit: SessionEdit, index: number, item: EditItem): SessionEdit =>
  ({ ...edit, items: edit.items.map((it, i) => (i === index ? item : it)) });

export function removeAt(edit: SessionEdit, index: number): SessionEdit {
  return { ...edit, items: edit.items.filter((_, i) => i !== index) };
}

export function moveAt(edit: SessionEdit, index: number, dir: -1 | 1): SessionEdit {
  const j = index + dir;
  if (j < 0 || j >= edit.items.length) return edit;
  const items = [...edit.items];
  [items[index], items[j]] = [items[j], items[index]];
  return { ...edit, items };
}

/** Swap an exercise for another in the same place. Its own sets, work and load come with it. */
export function swapAt(edit: SessionEdit, index: number, id: string): SessionEdit {
  if (edit.items.some((it, i) => it.id === id && i !== index)) return edit;
  return replaceAt(edit, index, { id });
}

/** Change sets or work by a step, inside the bounds. Fixed protocols, tests and warm-ups do not move. */
export function stepAt(circuit: Circuit, edit: SessionEdit, index: number, field: 'sets' | 'work', dir: -1 | 1): SessionEdit {
  const item = edit.items[index];
  const base = item && baseOf(circuit, item.id);
  if (!item || !base || !isEditable(base)) return edit;
  const next: EditItem = { ...item };
  if (field === 'sets') {
    const v = clamp((item.sets ?? base.sets) + dir, 1, MAX_SETS);
    if (v === base.sets) delete next.sets; else next.sets = v;
  } else {
    const wb = workBounds(base);
    const v = clamp((item.work ?? base.work) + dir * wb.step, wb.min, wb.max);
    if (v === base.work) delete next.work; else next.work = v;
  }
  return replaceAt(edit, index, next);
}

/** Move the planned load by a step of the exercise's own axis, from `from` (what the stepper would open on). */
export function stepTarget(circuit: Circuit, edit: SessionEdit, index: number, dir: -1 | 1, from: number): SessionEdit {
  const item = edit.items[index];
  const base = item && baseOf(circuit, item.id);
  const axis = base ? getLoadAxis(base) : null;
  if (!item || !base || !axis || base.ramp) return edit;
  return replaceAt(edit, index, { ...item, target: clampToAxis((item.target ?? from) + dir * axis.step, axis) });
}

export function clearTarget(edit: SessionEdit, index: number): SessionEdit {
  const item = edit.items[index];
  if (!item || item.target === undefined) return edit;
  const next = { ...item };
  delete next.target;
  return replaceAt(edit, index, next);
}

/**
 * Add exercises where they belong: after the last exercise of the same or a
 * heavier block, so heavy work stays first and a closing mobility stays last;
 * in a DAILY before the curls, and a curl closes it. Already in: left out.
 */
export function addIds(circuit: Circuit, edit: SessionEdit, ids: string[], mode: Mode): SessionEdit {
  const items = [...edit.items];
  for (const id of ids) {
    if (items.length >= MAX_EDIT_ITEMS || items.some(i => i.id === id)) continue;
    const ex = baseOf(circuit, id);
    if (!ex) continue;
    const list = items.map(i => baseOf(circuit, i.id)).filter((e): e is Exercise => Boolean(e));
    items.splice(insertIndex(list, -1, ex, mode), 0, { id });
  }
  return { ...edit, items };
}

/** What a coach would point out about the edited list. Warnings, never blocks. */
export function editWarnings(circuit: Circuit, edit: SessionEdit, place: Place): string[] {
  return routineWarnings({ id: circuit.id, name: circuit.title, place, items: edit.items.map(i => ({ id: i.id })), createdAt: '' });
}

// --- What may go in ---------------------------------------------------------

export interface EditContext {
  place: Place;
  mode: Mode;
  /** A finger heals (HEAL, or `isHealing`): nothing gripped, no pulling, no finger work. */
  healing: boolean;
  /** Last finger pain score, or today's when the session has started. */
  pain: number | null;
  /** NO KIT on the TODAY sheet. */
  noKit: boolean;
}

/** Whether an exercise may be added or swapped in today. Gates still substitute when it runs. */
export function allowedToday(ex: Exercise, ctx: EditContext): boolean {
  if (ex.block === 'TEST' || ex.records || ex.ramp) return false;
  if ((ctx.place === 'HOME' || ctx.noKit) && !isHomeExercise(ex.id)) return false;
  if (ctx.noKit && (needsKit(ex) || flagsOf(ex.id).grip)) return false;
  const healing = ctx.healing || ctx.mode === 'HEAL';
  if (healing && (flagsOf(ex.id).grip || loadsFingers(ex) || ex.capacities.includes('pull') || ex.hangs)) return false;
  if (ctx.pain !== null && ctx.pain >= PAIN_REDUCE_FROM && loadsFingers(ex)) return false;
  return true;
}

/** How alike two exercises are: same area, same capacities, same protocol, same block and load. */
function likeness(a: Exercise, b: Exercise): number {
  let s = 0;
  const area = areaOf(a);
  if (area && area === areaOf(b)) s += 4;
  if (a.capacities[0] && a.capacities[0] === b.capacities[0]) s += 3;
  s += a.capacities.filter(c => b.capacities.includes(c)).length;
  if (a.protocolId && a.protocolId === b.protocolId) s += 2;
  if (a.block === b.block) s += 1;
  if (a.load.kind === b.load.kind) s += 1;
  if (a.gate?.substituteId === b.id || a.noGripId === b.id || b.gate?.substituteId === a.id || b.noGripId === a.id) s += 6;
  return s;
}

const SIMILAR_MAX = 8;
const SIMILAR_MIN_SCORE = 6;

/**
 * Alternatives to an exercise for SWAP, most alike first: the stand-in it
 * already has, then the same area and capacity. Only what may go in today.
 */
export function similarTo(ex: Exercise, ctx: EditContext, taken: string[] = []): LibraryEntry[] {
  return libraryFor(ctx.place)
    .filter(e => e.exercise.id !== ex.id && e.exercise.name !== ex.name && !taken.includes(e.exercise.id))
    .filter(e => allowedToday(e.exercise, ctx) && (ex.block === 'WARMUP') === (e.exercise.block === 'WARMUP'))
    .map(e => ({ e, s: likeness(ex, e.exercise) }))
    .filter(x => x.s >= SIMILAR_MIN_SCORE)
    .sort((x, y) => y.s - x.s || x.e.exercise.name.localeCompare(y.e.exercise.name))
    .slice(0, SIMILAR_MAX)
    .map(x => x.e);
}

// --- Packs ------------------------------------------------------------------

export interface Pack {
  id: string;
  name: string;
  /** One line on what it is for. */
  note: string;
  /** The home version: mat, band, portable edge. */
  home: string[];
  /** The gym version, when it differs. */
  gym?: string[];
  /** Finger and wrist work: closed while a finger heals or after finger pain of 3+. */
  fingers?: boolean;
}

export const PACKS: Pack[] = [
  {
    id: 'core-finisher', name: 'CORE FINISHER', note: 'Obliques and lower abs to close a session.',
    home: ['daily-side-plank-dip', 'daily-reverse-crunch', 'morn-bw-russian-twist'],
    gym: ['daily-side-plank-dip', 'legs-plate-crunch', 'addon-russian-twist'],
  },
  {
    id: 'arms', name: 'ARMS', note: 'Biceps and triceps. Recorded, no XP.',
    home: ['extra-diamond-pushup', 'extra-band-curl', 'extra-band-triceps'],
    gym: ['extra-diamond-pushup', 'extra-db-curl', 'extra-band-triceps'],
  },
  {
    id: 'shoulder-care', name: 'SHOULDER CARE', note: 'The cuff and the back of the shoulder.',
    home: ['heal-band-er', 'heal-prone-ytw', 'morn-pullapart'],
    gym: ['heal-band-er', 'heal-prone-ytw', 'extra-face-pull'],
  },
  {
    id: 'mobility-10', name: 'MOBILITY 10', note: 'Hips, spine and ankles, about ten minutes.',
    home: ['morn-hip-9090', 'daily-spiderman-lunge', 'daily-cossack-shift', 'daily-back-unwind'],
  },
  {
    id: 'balance-power', name: 'BALANCE + POWER', note: 'Drive from the deep stretch, then stand still on one leg.',
    home: ['extra-lunge-drive', 'extra-sl-balance', 'extra-sl-reach'],
  },
  {
    id: 'legs', name: 'LEGS', note: 'A short leg block.',
    home: ['daily-bw-squat', 'extra-step-down', 'daily-glute-bridge'],
    gym: ['addon-goblet-squat', 'heal-step-up', 'heal-calf-raise'],
  },
  {
    id: 'fingers-light', name: 'FINGERS LIGHT', note: 'Density no-hangs and the wrist: keeps the fingers trained without restarting the 48h.',
    home: ['daily-edge-density', 'wrists-loaded-extension'],
    fingers: true,
  },
];

export interface PackOffer {
  pack: Pack;
  /** What would go in today: allowed and not already in the session. */
  ids: string[];
  /** Why nothing would, when nothing would. */
  closed: string | null;
}

/** Every pack for this place and today, with what of it would go in. */
export function packsFor(ctx: EditContext, inSession: string[]): PackOffer[] {
  const lib = exerciseLibrary();
  return PACKS.map(pack => {
    const all = ctx.place === 'GYM' && !ctx.noKit && pack.gym ? pack.gym : pack.home;
    const healing = ctx.healing || ctx.mode === 'HEAL';
    const hurts = ctx.pain !== null && ctx.pain >= PAIN_REDUCE_FROM;
    if (pack.fingers && healing) return { pack, ids: [], closed: 'Not while a finger heals.' };
    if (pack.fingers && hurts) return { pack, ids: [], closed: `Finger pain ${ctx.pain}/10.` };
    const ids = all.filter(id => {
      const ex = lib.get(id);
      return ex && !inSession.includes(id) && allowedToday(ex, ctx);
    });
    const closed = ids.length ? null
      : all.every(id => inSession.includes(id)) ? 'Already in the session.'
      : healing ? 'Nothing here without a grip.'
      : 'Not with today\'s kit.';
    return { pack, ids, closed };
  });
}
