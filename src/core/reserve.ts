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
import { fingerCaution, PAIN_REMOVE_FROM } from './engine';
import { dayOf } from './dates';
import { needsKit } from './today';
import type { BlockType, Exercise, Mode, ScaledExercise, SessionLogEntry } from './types';

export type ReserveGroup = 'CORE' | 'BACK' | 'PULL' | 'ARMS' | 'SHOULDERS' | 'LEGS' | 'MOBILITY' | 'FINGERS';
export const RESERVE_GROUPS: ReserveGroup[] = ['CORE', 'BACK', 'PULL', 'ARMS', 'SHOULDERS', 'LEGS', 'MOBILITY', 'FINGERS'];

export type Place = 'HOME' | 'GYM';

export interface ReserveEntry {
  id: string;
  group: ReserveGroup;
  /** HOME: mat, band, portable edge. GYM: everything, home kit included. */
  place: Place;
  /** The hands hold something (band, bar, dumbbell). Never offered while a finger heals. */
  grip: boolean;
  /** Loaded flexion: closes a DAILY. */
  curl?: boolean;
  /** Lying, kneeling or in a plank on the floor (BUILD's NO FLOOR). */
  floor?: boolean;
  /** Leaves the ground (BUILD's NO JUMPING). */
  jump?: boolean;
}

/** Where an exercise sits and what it asks of the body, for the filters in custom.ts. */
export type EntryFlags = Pick<ReserveEntry, 'place' | 'grip' | 'curl' | 'floor' | 'jump'>;

const RESERVE: ReserveEntry[] = [
  // CORE: abs and obliques.
  { id: 'daily-spiderman', group: 'CORE', place: 'HOME', grip: false, floor: true },
  { id: 'daily-mountain-climber', group: 'CORE', place: 'HOME', grip: false, floor: true },
  { id: 'daily-side-plank-dip', group: 'CORE', place: 'HOME', grip: false, floor: true },
  { id: 'morn-hollow', group: 'CORE', place: 'HOME', grip: false, floor: true },
  { id: 'daily-reverse-crunch', group: 'CORE', place: 'HOME', grip: false, curl: true, floor: true },
  { id: 'morn-bw-russian-twist', group: 'CORE', place: 'HOME', grip: false, curl: true, floor: true },
  { id: 'morn-leg-lowers', group: 'CORE', place: 'HOME', grip: false, curl: true, floor: true },
  { id: 'home-copenhagen', group: 'CORE', place: 'GYM', grip: false, floor: true },
  { id: 'legs-plate-crunch', group: 'CORE', place: 'GYM', grip: false, curl: true, floor: true },
  { id: 'addon-russian-twist', group: 'CORE', place: 'GYM', grip: false, curl: true, floor: true },
  { id: 'addon-hanging-oblique', group: 'CORE', place: 'GYM', grip: true },
  { id: 'home-leg-raise', group: 'CORE', place: 'GYM', grip: true },
  { id: 'daily-plank-climber', group: 'CORE', place: 'HOME', grip: false, floor: true },
  { id: 'power-trx-pike', group: 'CORE', place: 'GYM', grip: false, floor: true },
  { id: 'full-plate-carry', group: 'CORE', place: 'GYM', grip: false },

  // BACK: the lower back (extension, the hinge) and the middle of it, between
  // the shoulder blades (prone raises, rows). A group of its own since v40, so
  // it can be trained apart from the abs.
  { id: 'morn-birddog', group: 'BACK', place: 'HOME', grip: false, floor: true },
  { id: 'daily-prone-extension', group: 'BACK', place: 'HOME', grip: false, floor: true },
  { id: 'extra-prone-swimmer', group: 'BACK', place: 'HOME', grip: false, floor: true },
  { id: 'extra-prone-cobra', group: 'BACK', place: 'HOME', grip: false, floor: true },
  { id: 'extra-bw-good-morning', group: 'BACK', place: 'HOME', grip: false },
  { id: 'extra-wall-angel', group: 'BACK', place: 'HOME', grip: false },
  { id: 'daily-band-good-morning', group: 'BACK', place: 'HOME', grip: true },
  { id: 'morn-band-row', group: 'BACK', place: 'HOME', grip: true },
  { id: 'legs-back-extension', group: 'BACK', place: 'GYM', grip: false },
  { id: 'extra-plate-good-morning', group: 'BACK', place: 'GYM', grip: false },
  { id: 'full-db-rdl', group: 'BACK', place: 'GYM', grip: true },
  { id: 'extra-kb-swing', group: 'BACK', place: 'GYM', grip: true },
  { id: 'extra-db-reverse-fly', group: 'BACK', place: 'GYM', grip: true },
  { id: 'power-db-row', group: 'BACK', place: 'GYM', grip: true },

  // PULL: the lats, on the bar. Gym only: there is no bar at home.
  { id: 'addon-weighted-pullup', group: 'PULL', place: 'GYM', grip: true },
  { id: 'cave-lockoff', group: 'PULL', place: 'GYM', grip: true },

  // ARMS: extras, no XP.
  { id: 'extra-diamond-pushup', group: 'ARMS', place: 'HOME', grip: false, floor: true },
  { id: 'extra-band-curl', group: 'ARMS', place: 'HOME', grip: true },
  { id: 'extra-band-hammer', group: 'ARMS', place: 'HOME', grip: true },
  { id: 'extra-band-triceps', group: 'ARMS', place: 'HOME', grip: true },
  { id: 'extra-db-curl', group: 'ARMS', place: 'GYM', grip: true },
  { id: 'extra-chinup-negative', group: 'ARMS', place: 'GYM', grip: true },

  // SHOULDERS: pressing, the side and back of the shoulder, the cuff.
  { id: 'daily-pushup', group: 'SHOULDERS', place: 'HOME', grip: false, floor: true },
  { id: 'heal-pike-pushup', group: 'SHOULDERS', place: 'HOME', grip: false, floor: true },
  { id: 'heal-prone-ytw', group: 'SHOULDERS', place: 'HOME', grip: false, floor: true },
  { id: 'heal-band-er', group: 'SHOULDERS', place: 'HOME', grip: false },
  { id: 'extra-band-lateral', group: 'SHOULDERS', place: 'HOME', grip: true },
  { id: 'morn-pullapart', group: 'SHOULDERS', place: 'HOME', grip: true },
  { id: 'cave-band-er', group: 'SHOULDERS', place: 'HOME', grip: true },
  { id: 'extra-face-pull', group: 'SHOULDERS', place: 'GYM', grip: true },

  // LEGS.
  { id: 'daily-bw-squat', group: 'LEGS', place: 'HOME', grip: false },
  { id: 'daily-glute-bridge', group: 'LEGS', place: 'HOME', grip: false, floor: true },
  { id: 'morn-band-split-squat', group: 'LEGS', place: 'HOME', grip: true },
  { id: 'home-sl-rdl', group: 'LEGS', place: 'HOME', grip: true },
  { id: 'heal-step-up', group: 'LEGS', place: 'GYM', grip: false },
  { id: 'heal-calf-raise', group: 'LEGS', place: 'GYM', grip: false },
  { id: 'heal-nordic-curl', group: 'LEGS', place: 'GYM', grip: false, floor: true },
  { id: 'legs-toe-drag', group: 'LEGS', place: 'GYM', grip: false, floor: true },
  { id: 'addon-goblet-squat', group: 'LEGS', place: 'GYM', grip: true },
  { id: 'extra-step-down', group: 'LEGS', place: 'HOME', grip: false },
  { id: 'extra-shift-split-squat', group: 'LEGS', place: 'HOME', grip: false },
  { id: 'extra-side-abduction', group: 'LEGS', place: 'HOME', grip: false, floor: true },

  // MOBILITY.
  { id: 'morn-catcow', group: 'MOBILITY', place: 'HOME', grip: false, floor: true },
  { id: 'morn-hip-9090', group: 'MOBILITY', place: 'HOME', grip: false, floor: true },
  { id: 'home-hip-flow', group: 'MOBILITY', place: 'HOME', grip: false, floor: true },
  { id: 'daily-spiderman-lunge', group: 'MOBILITY', place: 'HOME', grip: false, floor: true },
  { id: 'daily-cossack-shift', group: 'MOBILITY', place: 'HOME', grip: false, floor: true },
  { id: 'daily-back-unwind', group: 'MOBILITY', place: 'HOME', grip: false, floor: true },
  { id: 'feet-frogger', group: 'MOBILITY', place: 'HOME', grip: false, floor: true },
  { id: 'daily-ankle-wall', group: 'MOBILITY', place: 'HOME', grip: false },
  { id: 'extra-high-knee-hold', group: 'MOBILITY', place: 'HOME', grip: false },

  // FINGERS: light only. The density no-hangs do not restart the 48h.
  { id: 'daily-edge-density', group: 'FINGERS', place: 'HOME', grip: true },
  { id: 'wrists-loaded-extension', group: 'FINGERS', place: 'HOME', grip: false, floor: true },
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
  /** The least kit it needs: HOME runs anywhere, GYM only at the gym. */
  place: Place;
  /** Offered, but not recommended today (a healing finger, finger pain 3-5), and why. */
  caution: string | null;
}

export interface ReserveContext {
  mode: Mode;
  circuitId: string;
  /** The running session: what is already in it is not offered again. */
  list: ScaledExercise[];
  /** Pain score given before this session, if one was asked. */
  pain: number | null;
  sessionLog: SessionLogEntry[];
  /** NO KIT on the TODAY sheet: a mat and nothing else. */
  noKit?: boolean;
  /** Where, when it is not the session's own place (a custom session). */
  place?: Place;
  /** A finger is healing: grips and finger work are labelled, not removed. HEAL sessions always are. */
  healing?: boolean;
}

/** Why a whole group is missing, for the picker to say so. */
export function closedGroups(ctx: ReserveContext): Partial<Record<ReserveGroup, string>> {
  const out: Partial<Record<ReserveGroup, string>> = {};
  if (ctx.pain !== null && ctx.pain >= PAIN_REMOVE_FROM) out.FINGERS = `Finger pain ${ctx.pain}/10 today.`;
  return out;
}

/** The reserve for this session, by group, least recently done first. */
export function reserveFor(ctx: ReserveContext): Record<ReserveGroup, ReserveItem[]> {
  const place = ctx.noKit ? 'HOME' : ctx.place ?? placeOf(ctx.mode, ctx.circuitId);
  const healing = ctx.mode === 'HEAL' || Boolean(ctx.healing);
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
    if (inSession.has(entry.id)) continue;
    const exercise = lib.get(entry.id);
    if (!exercise || (ctx.noKit && (entry.grip || needsKit(exercise))) || exercise.gate || exercise.records || exercise.block === 'WARMUP' || exercise.block === 'TEST') continue;
    const caution = fingerCaution(exercise, { healing, pain: ctx.pain }, Boolean(entry.grip));
    out[entry.group].push({ exercise, group: entry.group, curl: Boolean(entry.curl), lastDone: lastDone.get(entry.id) ?? null, place: entry.place, caution });
  }
  // Recommended first, then least recently done.
  for (const g of RESERVE_GROUPS) {
    out[g].sort((a, b) => Number(Boolean(a.caution)) - Number(Boolean(b.caution)) || (a.lastDone ?? '').localeCompare(b.lastDone ?? ''));
  }
  return out;
}

/** The reserve entry for an exercise, if it is in the reserve. */
export function reserveEntry(id: string): ReserveEntry | undefined {
  return RESERVE.find(e => e.id === id);
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
export function insertIndex(list: Array<Pick<Exercise, 'id' | 'block'>>, from: number, exercise: Exercise, mode: Mode): number {
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
