// =============================================================================
// reserve.ts — Extra exercises to add in the middle of a session
//
// Mid-session the athlete may want more: a core session that should also hit
// the arms, a short DAILY with energy to spare. ADD on the workout card opens
// the reserve, grouped by area, and picks go into the running session.
//
// The reserve is mostly the programme's own exercises, ids unchanged, so an
// added set carries the same history and XP as in its home session. The arm
// work comes from data-extras.ts and earns no XP.
//
// The same rules as the sessions still hold:
// - Only what the place has: a DAILY or the ring rehab is home (mat, band,
//   portable edge); everything else is the gym, which has the home kit too.
// - Nothing gripped while a finger heals (HEAL), and no finger work then or
//   after a pain score of 3 or more.
// - No gated, test or warm-up exercise is ever offered.
// - Curling goes last in a DAILY: discs are most swollen in the first hour
//   after waking, so an added crunch closes the session, wherever it was added.
// Pure functions, no React.
// =============================================================================

import { CONFIG } from './config';
import { getModeData } from './data-index';
import { EXTRA_EXERCISES } from './data-extras';
import { PAIN_REDUCE_FROM } from './engine';
import { dayOf } from './dates';
import type { BlockType, Exercise, Mode, ScaledExercise, SessionLogEntry } from './types';

export type ReserveGroup = 'CORE' | 'ARMS' | 'SHOULDERS' | 'LEGS' | 'MOBILITY' | 'FINGERS';
export const RESERVE_GROUPS: ReserveGroup[] = ['CORE', 'ARMS', 'SHOULDERS', 'LEGS', 'MOBILITY', 'FINGERS'];

export type Place = 'HOME' | 'GYM';

interface ReserveEntry {
  id: string;
  group: ReserveGroup;
  /** HOME: mat, band, portable edge. GYM: everything, home kit included. */
  place: Place;
  /** The hands hold something (band, bar, dumbbell). Never offered while a finger heals. */
  grip: boolean;
  /** Loaded flexion: closes a DAILY. */
  curl?: boolean;
}

const RESERVE: ReserveEntry[] = [
  // CORE: abs, obliques, lower back.
  { id: 'daily-spiderman', group: 'CORE', place: 'HOME', grip: false },
  { id: 'daily-mountain-climber', group: 'CORE', place: 'HOME', grip: false },
  { id: 'daily-side-plank-dip', group: 'CORE', place: 'HOME', grip: false },
  { id: 'daily-prone-extension', group: 'CORE', place: 'HOME', grip: false },
  { id: 'morn-hollow', group: 'CORE', place: 'HOME', grip: false },
  { id: 'daily-reverse-crunch', group: 'CORE', place: 'HOME', grip: false, curl: true },
  { id: 'morn-bw-russian-twist', group: 'CORE', place: 'HOME', grip: false, curl: true },
  { id: 'morn-leg-lowers', group: 'CORE', place: 'HOME', grip: false, curl: true },
  { id: 'daily-band-good-morning', group: 'CORE', place: 'HOME', grip: true },
  { id: 'home-copenhagen', group: 'CORE', place: 'GYM', grip: false },
  { id: 'legs-back-extension', group: 'CORE', place: 'GYM', grip: false },
  { id: 'legs-plate-crunch', group: 'CORE', place: 'GYM', grip: false, curl: true },
  { id: 'addon-russian-twist', group: 'CORE', place: 'GYM', grip: false, curl: true },
  { id: 'addon-hanging-oblique', group: 'CORE', place: 'GYM', grip: true },
  { id: 'home-leg-raise', group: 'CORE', place: 'GYM', grip: true },

  // ARMS: extras, no XP.
  { id: 'extra-diamond-pushup', group: 'ARMS', place: 'HOME', grip: false },
  { id: 'extra-band-curl', group: 'ARMS', place: 'HOME', grip: true },
  { id: 'extra-band-hammer', group: 'ARMS', place: 'HOME', grip: true },
  { id: 'extra-band-triceps', group: 'ARMS', place: 'HOME', grip: true },
  { id: 'extra-db-curl', group: 'ARMS', place: 'GYM', grip: true },
  { id: 'extra-chinup-negative', group: 'ARMS', place: 'GYM', grip: true },

  // SHOULDERS: pressing, the side and back of the shoulder, the cuff.
  { id: 'daily-pushup', group: 'SHOULDERS', place: 'HOME', grip: false },
  { id: 'heal-pike-pushup', group: 'SHOULDERS', place: 'HOME', grip: false },
  { id: 'heal-prone-ytw', group: 'SHOULDERS', place: 'HOME', grip: false },
  { id: 'heal-band-er', group: 'SHOULDERS', place: 'HOME', grip: false },
  { id: 'extra-band-lateral', group: 'SHOULDERS', place: 'HOME', grip: true },
  { id: 'morn-pullapart', group: 'SHOULDERS', place: 'HOME', grip: true },
  { id: 'cave-band-er', group: 'SHOULDERS', place: 'HOME', grip: true },
  { id: 'extra-face-pull', group: 'SHOULDERS', place: 'GYM', grip: true },

  // LEGS.
  { id: 'daily-bw-squat', group: 'LEGS', place: 'HOME', grip: false },
  { id: 'daily-glute-bridge', group: 'LEGS', place: 'HOME', grip: false },
  { id: 'morn-band-split-squat', group: 'LEGS', place: 'HOME', grip: true },
  { id: 'home-sl-rdl', group: 'LEGS', place: 'HOME', grip: true },
  { id: 'heal-step-up', group: 'LEGS', place: 'GYM', grip: false },
  { id: 'heal-calf-raise', group: 'LEGS', place: 'GYM', grip: false },
  { id: 'heal-nordic-curl', group: 'LEGS', place: 'GYM', grip: false },
  { id: 'legs-toe-drag', group: 'LEGS', place: 'GYM', grip: false },
  { id: 'addon-goblet-squat', group: 'LEGS', place: 'GYM', grip: true },

  // MOBILITY.
  { id: 'morn-catcow', group: 'MOBILITY', place: 'HOME', grip: false },
  { id: 'morn-hip-9090', group: 'MOBILITY', place: 'HOME', grip: false },
  { id: 'home-hip-flow', group: 'MOBILITY', place: 'HOME', grip: false },
  { id: 'daily-spiderman-lunge', group: 'MOBILITY', place: 'HOME', grip: false },
  { id: 'daily-cossack-shift', group: 'MOBILITY', place: 'HOME', grip: false },
  { id: 'daily-back-unwind', group: 'MOBILITY', place: 'HOME', grip: false },
  { id: 'feet-frogger', group: 'MOBILITY', place: 'HOME', grip: false },

  // FINGERS: light only. The density no-hangs do not restart the 48h.
  { id: 'daily-edge-density', group: 'FINGERS', place: 'HOME', grip: true },
  { id: 'wrists-loaded-extension', group: 'FINGERS', place: 'HOME', grip: false },
];

const HOME_CIRCUITS = new Set(['heal-03', 'heal-04']);

/** Where a session happens, and so what kit the reserve may assume. */
export function placeOf(mode: Mode, circuitId: string): Place {
  return mode === 'DAILY' || HOME_CIRCUITS.has(circuitId) ? 'HOME' : 'GYM';
}

let library: Map<string, Exercise> | null = null;

/** Every exercise in the programme and the extras, by id. */
export function exerciseLibrary(): Map<string, Exercise> {
  if (library) return library;
  library = new Map();
  for (const mode of CONFIG.modes) {
    for (const c of getModeData(mode)) {
      for (const e of [...c.exercises, ...(c.substitutes ?? [])]) if (!library.has(e.id)) library.set(e.id, e);
    }
  }
  for (const e of EXTRA_EXERCISES) library.set(e.id, e);
  return library;
}

export interface ReserveItem {
  exercise: Exercise;
  group: ReserveGroup;
  curl: boolean;
  /** Last day it was done, from the session log; null if never. */
  lastDone: string | null;
}

export interface ReserveContext {
  mode: Mode;
  circuitId: string;
  /** The running session: what is already in it is not offered again. */
  list: ScaledExercise[];
  /** Pain score given before this session, if one was asked. */
  pain: number | null;
  sessionLog: SessionLogEntry[];
}

/** Why a whole group is missing, for the picker to say so. */
export function closedGroups(ctx: ReserveContext): Partial<Record<ReserveGroup, string>> {
  const out: Partial<Record<ReserveGroup, string>> = {};
  if (ctx.mode === 'HEAL') out.FINGERS = 'Not while a finger heals.';
  else if (ctx.pain !== null && ctx.pain >= PAIN_REDUCE_FROM) out.FINGERS = `Finger pain ${ctx.pain}/10 today.`;
  return out;
}

/** The reserve for this session, by group, least recently done first. */
export function reserveFor(ctx: ReserveContext): Record<ReserveGroup, ReserveItem[]> {
  const place = placeOf(ctx.mode, ctx.circuitId);
  const healing = ctx.mode === 'HEAL';
  const closed = closedGroups(ctx);
  const inSession = new Set(ctx.list.map(e => e.id));
  const lib = exerciseLibrary();

  const lastDone = new Map<string, string>();
  for (const s of ctx.sessionLog) {
    for (const id of Object.keys(s.sets ?? {})) {
      if ((s.sets![id] ?? 0) > 0) lastDone.set(id, dayOf(s.date));
    }
  }

  const out = Object.fromEntries(RESERVE_GROUPS.map(g => [g, [] as ReserveItem[]])) as Record<ReserveGroup, ReserveItem[]>;
  for (const entry of RESERVE) {
    if (closed[entry.group]) continue;
    if (place === 'HOME' && entry.place === 'GYM') continue;
    if (healing && entry.grip) continue;
    if (inSession.has(entry.id)) continue;
    const exercise = lib.get(entry.id);
    if (!exercise || exercise.gate || exercise.records || exercise.block === 'WARMUP' || exercise.block === 'TEST') continue;
    out[entry.group].push({ exercise, group: entry.group, curl: Boolean(entry.curl), lastDone: lastDone.get(entry.id) ?? null });
  }
  for (const g of RESERVE_GROUPS) {
    out[g].sort((a, b) => (a.lastDone ?? '').localeCompare(b.lastDone ?? ''));
  }
  return out;
}

/** Whether an exercise curls the spine under load (closes a DAILY). */
export function isCurl(id: string): boolean {
  return RESERVE.some(e => e.id === id && e.curl);
}

const BLOCK_RANK: Record<BlockType, number> = {
  WARMUP: 0, PRIMARY: 1, TEST: 1, SECONDARY: 2, ACCESSORY: 3, PREHAB: 4, MOBILITY: 5,
};

/**
 * Where an added exercise goes in the running session: after the exercise in
 * hand (`from`) and after the last exercise left of the same or a heavier
 * block, so heavy work stays before light and a closing mobility stays last,
 * while an opening mobility block does not pull the extra to the front. In a
 * DAILY it goes before the curls, and a curl closes the session.
 */
export function insertIndex(list: ScaledExercise[], from: number, exercise: Exercise, mode: Mode): number {
  const start = Math.min(list.length, from + 1);
  if (mode === 'DAILY' && isCurl(exercise.id)) return list.length;
  const rank = BLOCK_RANK[exercise.block];
  let at = start;
  for (let j = start; j < list.length; j++) {
    if (mode === 'DAILY' && isCurl(list[j].id)) return Math.max(start, Math.min(at, j));
    if (BLOCK_RANK[list[j].block] <= rank) at = j + 1;
  }
  return at;
}
