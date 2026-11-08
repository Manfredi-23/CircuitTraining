// =============================================================================
// alternatives.ts — Swipe for something else, add by group (v45)
//
// A swipe on any exercise in a list (the session page, BUILD, the session map,
// the workout card before its first set, a routine) offers SWAP and OUT.
// SWAP opens SIMILAR (`similarTo`), OTHER KIT and SEARCH ALL. OTHER KIT is
// the busy-rack answer: the same job without any of the kit the exercise
// needs.
//
// + ADD at the bottom of every list adds by group (ABS, CHEST, UPPER BACK...)
// or one exercise at a time. A group tap adds a ready block of two or three:
// the group's own exercises first, done least recently first, one of a kind,
// nothing gated and nothing labelled NOT RECOMMENDED YET. Pure, no React.
// =============================================================================

import { exerciseLibrary, placeOf } from './reserve';
import { fingerHealing } from './recommend';
import { activeDay, type DayPlan } from './today';
import { libraryFor, type LibraryEntry } from './routines';
import { allowedToday, cautionToday, likeness, PACKS, type EditContext, type Pack } from './session-edit';
import { isPickable } from './not-picked';
import { groupsOf, kitOf, sharesKit, type MuscleGroup } from './exercise-tags';
import type { BenchmarkResult, ClimbSession, Exercise, LoadLogEntry, Mode, ScaledExercise, SessionLogEntry } from './types';

/**
 * What may go into this session today: its place, a healing finger, the last
 * finger pain (or the one given before a running session) and NO KIT. The
 * same rules as EDIT, for every list.
 */
export function editContextFor(
  mode: Mode, circuitId: string,
  s: { sessionLog: SessionLogEntry[]; climbLog: ClimbSession[]; dayPlan: DayPlan | null; loadLog?: LoadLogEntry[]; benchmarkResults?: BenchmarkResult[] },
  pain?: number | null,
): EditContext {
  const lastPain = [...s.sessionLog].reverse().find(x => x.pain !== undefined)?.pain ?? null;
  return {
    place: placeOf(mode, circuitId),
    mode,
    healing: fingerHealing(s),
    pain: pain !== undefined && pain !== null ? pain : lastPain,
    noKit: activeDay(s.dayPlan).noKit,
  };
}

const OTHER_KIT_MAX = 8;
const OTHER_KIT_MIN_SCORE = 6;

/** Names already in the list: a twin under another id is the same exercise. */
function namesOf(ids: string[]): Set<string> {
  const lib = exerciseLibrary();
  return new Set(ids.map(id => lib.get(id)?.name).filter((n): n is string => Boolean(n)));
}

/** How alike two exercises are for the swap: the engine's likeness and the groups they share. */
function jobScore(a: Exercise, b: Exercise): number {
  const ga = groupsOf(a);
  const gb = groupsOf(b);
  return likeness(a, b) + (ga[0] && ga[0] === gb[0] ? 3 : 0) + gb.filter(g => ga.includes(g)).length;
}

/**
 * OTHER KIT: the same job without any of the kit this exercise needs, most
 * alike first, what is recommended today before what is not. Empty when the
 * exercise needs no kit.
 */
export function otherKitFor(ex: Exercise, ctx: EditContext, taken: string[] = [], opts: { liveSession?: boolean } = {}): LibraryEntry[] {
  if (!kitOf(ex).length) return [];
  const names = namesOf(taken);
  return libraryFor(ctx.place, '', null, taken)
    .filter(e => e.exercise.id !== ex.id && e.exercise.name !== ex.name && !taken.includes(e.exercise.id) && !names.has(e.exercise.name))
    .filter(e => allowedToday(e.exercise, ctx) && (ex.block === 'WARMUP') === (e.exercise.block === 'WARMUP'))
    .filter(e => !sharesKit(ex, e.exercise) && !(opts.liveSession && e.exercise.gate) && isPickable(e.exercise.id))
    .map(e => ({ e, s: jobScore(ex, e.exercise), c: cautionToday(e.exercise, ctx) ? 1 : 0 }))
    .filter(x => x.s >= OTHER_KIT_MIN_SCORE || ex.block === 'WARMUP')
    .sort((x, y) => x.c - y.c || y.s - x.s || x.e.exercise.name.localeCompare(y.e.exercise.name))
    .slice(0, OTHER_KIT_MAX)
    .map(x => x.e);
}

/** How many a group tap adds: two for the heavy groups and the fingers, three for the rest. */
export function blockSize(group: MuscleGroup): number {
  return group === 'PULL' || group === 'LEGS' || group === 'GLUTES + HAMSTRINGS' || group === 'FINGERS' ? 2 : 3;
}

export interface GroupEntry extends LibraryEntry {
  /** The group is its main one, not one it only touches. */
  main: boolean;
  /** Last day it was done, or null. */
  lastDone: string | null;
  /** Why it is not recommended today, or null. */
  caution: string | null;
}

/**
 * ONE BY ONE: every exercise in the group that may go in today, its own
 * exercises first, then done least recently first; what is not recommended
 * today last. Gated exercises are left out: a group never offers what waits
 * on a test. Warm-ups belong to no group.
 */
export function groupList(group: MuscleGroup, ctx: EditContext, taken: string[], lastDone: Map<string, string>): GroupEntry[] {
  return libraryFor(ctx.place, '', null, taken)
    .filter(e => e.exercise.block !== 'WARMUP' && !e.exercise.gate && groupsOf(e.exercise).includes(group) && isPickable(e.exercise.id))
    .filter(e => allowedToday(e.exercise, ctx))
    .map(e => ({
      ...e,
      main: groupsOf(e.exercise)[0] === group,
      lastDone: lastDone.get(e.exercise.id) ?? null,
      caution: cautionToday(e.exercise, ctx),
    }))
    .sort((a, b) => Number(Boolean(a.caution)) - Number(Boolean(b.caution))
      || Number(b.main) - Number(a.main)
      || (a.lastDone ?? '').localeCompare(b.lastDone ?? '')
      || a.exercise.name.localeCompare(b.exercise.name));
}

/** Two exercises doing the same job: same main group, and the same protocol or the same kit and load. */
function sameJob(a: Exercise, b: Exercise): boolean {
  if (groupsOf(a)[0] !== groupsOf(b)[0]) return false;
  return (Boolean(a.protocolId) && a.protocolId === b.protocolId) || (a.load.kind === b.load.kind && sharesKit(a, b));
}

/** Kit only a gym has: at the gym a block reaches for it before the band and the mat. */
const GYM_KIT = new Set(['BAR', 'HANGBOARD', 'RINGS', 'DUMBBELL', 'KETTLEBELL', 'PLATE', 'BOX', 'BARBELL', 'CABLE', 'RADIATOR', 'WALL']);

/** Working sets before prep, unless the group is the prep (mobility, feet). */
function blockRank(e: Exercise, group: MuscleGroup): number {
  if (group === 'MOBILITY' || group === 'FEET + HOOKS') return 0;
  return e.block === 'SECONDARY' || e.block === 'ACCESSORY' ? 0 : e.block === 'PRIMARY' ? 1 : 2;
}

/**
 * A group tap: the block it adds. Two or three of the group's own exercises
 * (only then ones that touch it), done least recently first, working sets
 * before prep, at the gym its kit before the band; never one already in, never
 * one labelled, never maximal work, and one of a kind where the group allows
 * it (a hollow hold, a reverse crunch and a dead bug rather than three crunches).
 */
export function groupBlock(group: MuscleGroup, ctx: EditContext, taken: string[], lastDone: Map<string, string>): string[] {
  const names = namesOf(taken);
  const gymFirst = (e: Exercise) => (ctx.place === 'GYM' && !ctx.noKit && kitOf(e).some(k => GYM_KIT.has(k)) ? 0 : 1);
  const pool = groupList(group, ctx, taken, lastDone)
    // The physio's ring-finger plan is its own session, never part of a block;
    // and the gym has no cable, so the cable face pull is never picked for one.
    .filter(e => !e.caution && e.exercise.intensity !== 'MAX' && e.exercise.protocolId !== 'ring-rehab')
    .filter(e => !kitOf(e.exercise).includes('CABLE'))
    .filter(e => !taken.includes(e.exercise.id) && !names.has(e.exercise.name))
    .sort((a, b) => Number(b.main) - Number(a.main)
      || (a.lastDone ?? '').localeCompare(b.lastDone ?? '')
      || blockRank(a.exercise, group) - blockRank(b.exercise, group)
      || gymFirst(a.exercise) - gymFirst(b.exercise)
      || a.exercise.name.localeCompare(b.exercise.name));
  const n = blockSize(group);
  const out: Exercise[] = [];
  const take = (entries: GroupEntry[], varied: boolean) => {
    for (const e of entries) {
      if (out.length >= n) return;
      if (out.some(o => o.id === e.exercise.id || o.name === e.exercise.name)) continue;
      if (varied && out.some(o => sameJob(o, e.exercise))) continue;
      out.push(e.exercise);
    }
  };
  // The group's own, one of a kind; then its own, any; only then what touches it.
  const own = pool.filter(e => e.main);
  const touch = pool.filter(e => !e.main);
  take(own, true);
  take(own, false);
  take(touch, true);
  take(touch, false);
  return out.map(e => e.id);
}

/** The ready-made packs under each group. */
export const PACK_GROUPS: Record<string, MuscleGroup[]> = {
  'core-finisher': ['ABS', 'OBLIQUES'],
  back: ['LOWER BACK', 'UPPER BACK'],
  arms: ['BICEPS', 'TRICEPS'],
  'shoulder-care': ['SHOULDERS'],
  'mobility-10': ['MOBILITY'],
  'balance-power': ['FEET + HOOKS', 'LEGS'],
  legs: ['LEGS'],
  feet: ['FEET + HOOKS'],
  hooks: ['FEET + HOOKS'],
  'fingers-light': ['FINGERS'],
};

export function packsInGroup(group: MuscleGroup): Pack[] {
  return PACKS.filter(p => PACK_GROUPS[p.id]?.includes(group));
}

/**
 * Mid-session: swap an exercise for another. One still to come is replaced
 * where it stands; the one in hand only before its first set. What is done
 * never changes.
 */
export function swapInList(list: ScaledExercise[], stepIndex: number, setIndex: number, index: number, next: ScaledExercise): ScaledExercise[] {
  if (index < stepIndex || index >= list.length) return list;
  if (index === stepIndex && setIndex !== 1) return list;
  if (list.some((e, i) => i !== index && e.id === next.id)) return list;
  return list.map((e, i) => (i === index ? next : e));
}

/** Whether an exercise in the live list can be swapped now. */
export const canSwapAt = (stepIndex: number, setIndex: number, index: number, length: number) =>
  index < length && (index > stepIndex || (index === stepIndex && setIndex === 1));
