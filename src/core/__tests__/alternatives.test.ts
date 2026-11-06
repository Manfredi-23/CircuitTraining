import { describe, it, expect } from 'vitest';
import {
  otherKitFor, groupList, groupBlock, blockSize, packsInGroup, PACK_GROUPS, swapInList, canSwapAt,
} from '../alternatives';
import { groupsOf, kitOf, sharesKit, MUSCLE_GROUPS } from '../exercise-tags';
import { exerciseLibrary } from '../reserve';
import { isHomeExercise } from '../routines';
import { PACKS, cautionToday, editFromCircuit, itemIndexOf, type EditContext } from '../session-edit';
import { getModeData } from '../data-index';
import { buildList } from '../engine';
import { editContextFor } from '../alternatives';

const lib = exerciseLibrary();
const ex = (id: string) => lib.get(id)!;
const GYM: EditContext = { place: 'GYM', mode: 'CAVE', healing: false, pain: null, noKit: false };
const HOME: EditContext = { place: 'HOME', mode: 'DAILY', healing: false, pain: null, noKit: false };
const never = new Map<string, string>();

describe('OTHER KIT', () => {
  it('offers the same job without the kit that is taken', () => {
    const alts = otherKitFor(ex('full-ring-row'), GYM);
    expect(alts.length).toBeGreaterThan(0);
    expect(alts.every(a => !sharesKit(ex('full-ring-row'), a.exercise))).toBe(true);
    expect(alts.slice(0, 3).some(a => groupsOf(a.exercise)[0] === 'PULL')).toBe(true);
  });

  it('keeps the bar out of a weighted pull-up swap, and the band out of a band row at home', () => {
    expect(otherKitFor(ex('cave-weighted-pullup'), GYM).every(a => !kitOf(a.exercise).includes('BAR'))).toBe(true);
    const home = otherKitFor(ex('morn-band-row'), HOME);
    expect(home.every(a => isHomeExercise(a.exercise.id) && !kitOf(a.exercise).includes('BAND'))).toBe(true);
  });

  it('has nothing to offer for an exercise that needs no kit', () => {
    expect(otherKitFor(ex('daily-pushup'), GYM)).toEqual([]);
  });

  it('leaves out what is already in, and gated work in a live session', () => {
    const taken = ['power-db-row'];
    expect(otherKitFor(ex('full-ring-row'), GYM, taken).some(a => a.exercise.id === 'power-db-row')).toBe(false);
    const live = otherKitFor(ex('extra-db-curl'), GYM, [], { liveSession: true });
    expect(live.some(a => a.exercise.gate)).toBe(false);
  });
});

describe('adding by group', () => {
  it('lists a group with its own exercises first, no warm-ups and nothing gated', () => {
    const list = groupList('ABS', GYM, [], never);
    expect(list.length).toBeGreaterThan(4);
    expect(list.every(e => e.exercise.block !== 'WARMUP' && !e.exercise.gate)).toBe(true);
    const firstTouch = list.findIndex(e => !e.main);
    expect(firstTouch === -1 || list.slice(firstTouch).every(e => !e.main || e.caution)).toBe(true);
  });

  it('adds a block of three, one of a kind, at home only home kit', () => {
    const block = groupBlock('ABS', HOME, [], never);
    expect(block).toHaveLength(3);
    expect(new Set(block.map(id => ex(id).protocolId)).size).toBeGreaterThan(1);
    expect(block.every(id => isHomeExercise(id))).toBe(true);
    expect(block.every(id => groupsOf(ex(id)).includes('ABS'))).toBe(true);
  });

  it('adds two for the heavy groups, never two weighted pull-ups', () => {
    expect(blockSize('PULL')).toBe(2);
    const block = groupBlock('PULL', GYM, [], never);
    expect(block).toHaveLength(2);
    expect(block.filter(id => ex(id).name.startsWith('Weighted Pull-Ups'))).toHaveLength(block.some(id => ex(id).name.startsWith('Weighted Pull-Ups')) ? 1 : 0);
  });

  it('skips what is in the session, under any twin id', () => {
    const block = groupBlock('PULL', GYM, ['addon-weighted-pullup'], never);
    expect(block.map(id => ex(id).name)).not.toContain('Weighted Pull-Ups');
  });

  it('picks what was done least recently', () => {
    const first = groupBlock('ABS', HOME, [], never);
    const recent = new Map(first.map(id => [id, '2026-11-05']));
    const next = groupBlock('ABS', HOME, [], recent);
    expect(next.filter(id => first.includes(id)).length).toBeLessThan(first.length);
  });

  it('never adds what is not recommended today, while a finger heals', () => {
    const healing = { ...GYM, healing: true };
    const block = groupBlock('PULL', healing, [], never);
    expect(block.every(id => !cautionToday(ex(id), healing))).toBe(true);
    // The list still offers it, labelled and last.
    const list = groupList('PULL', healing, [], never);
    const labelled = list.findIndex(e => e.caution);
    expect(labelled).toBeGreaterThanOrEqual(0);
    expect(list.slice(labelled).every(e => e.caution)).toBe(true);
  });

  it('never picks cable work for a block: the gym has no cable', () => {
    for (const g of MUSCLE_GROUPS) expect(groupBlock(g, GYM, [], never).some(id => kitOf(ex(id)).includes('CABLE')), g).toBe(false);
  });

  it('keeps maximal work and the ring-finger rehab out of a block', () => {
    for (const place of [GYM, HOME]) {
      const block = groupBlock('FINGERS', place, [], never);
      expect(block.some(id => ex(id).intensity === 'MAX' || ex(id).protocolId === 'ring-rehab')).toBe(false);
    }
  });

  it('has a block for every group, at the gym', () => {
    for (const g of MUSCLE_GROUPS) expect(groupBlock(g, GYM, [], never).length, g).toBeGreaterThan(0);
  });

  it('files every pack under a group', () => {
    expect(PACKS.every(p => PACK_GROUPS[p.id]?.length)).toBe(true);
    expect(packsInGroup('ABS').map(p => p.id)).toContain('core-finisher');
  });
});

describe('swapping in a running session', () => {
  const c = getModeData('CAVE').find(x => x.id === 'cave-08')!;
  const list = buildList(c, 'NORMAL', {});
  const other = { ...list[list.length - 1], id: 'swap-in-test' };

  it('replaces one still to come, and the one in hand only before its first set', () => {
    expect(swapInList(list, 2, 1, 4, other)[4].id).toBe('swap-in-test');
    expect(swapInList(list, 2, 1, 2, other)[2].id).toBe('swap-in-test');
    expect(swapInList(list, 2, 2, 2, other)).toBe(list);
    expect(swapInList(list, 2, 1, 1, other)).toBe(list);
    expect(canSwapAt(2, 2, 2, list.length)).toBe(false);
    expect(canSwapAt(2, 2, 3, list.length)).toBe(true);
  });

  it('never puts the same exercise in twice', () => {
    expect(swapInList(list, 0, 1, 3, list[5])).toBe(list);
  });
});

describe('a swipe on the session page', () => {
  const all = (['DAILY', 'CAVE', 'HEAL'] as const).flatMap(m => getModeData(m));

  it('finds the item a running exercise stands for: its own, a slot pick, a gate stand-in', () => {
    const slotted = all.find(c => c.exercises.some(e => e.options?.length))!;
    const slotIdx = slotted.exercises.findIndex(e => e.options?.length);
    const edit = editFromCircuit(slotted, '2026-11-06');
    expect(itemIndexOf(slotted, edit, slotted.exercises[slotIdx].id)).toBe(slotIdx);
    expect(itemIndexOf(slotted, edit, slotted.exercises[slotIdx].options![0])).toBe(slotIdx);
    const gated = all.find(c => c.exercises.some(e => e.gate?.substituteId))!;
    const gIdx = gated.exercises.findIndex(e => e.gate?.substituteId);
    expect(itemIndexOf(gated, editFromCircuit(gated, '2026-11-06'), gated.exercises[gIdx].gate!.substituteId!)).toBe(gIdx);
    expect(itemIndexOf(gated, editFromCircuit(gated, '2026-11-06'), 'not-in-it')).toBe(-1);
  });

  it('reads today from the logs: place, healing, pain, no kit', () => {
    const empty = { sessionLog: [], climbLog: [], dayPlan: null };
    expect(editContextFor('DAILY', 'daily-01', empty)).toEqual({ place: 'HOME', mode: 'DAILY', healing: false, pain: null, noKit: false });
    expect(editContextFor('CAVE', 'cave-08', empty, 4).pain).toBe(4);
    expect(editContextFor('CAVE', 'cave-08', empty).place).toBe('GYM');
  });
});
