import { describe, it, expect } from 'vitest';
import { adjust, describeTweak, setBounds } from '../adjust';
import { buildList, scaleExercise } from '../engine';
import { exerciseLibrary, insertIndex, placeOf, reserveFor, RESERVE_GROUPS, closedGroups } from '../reserve';
import { EXTRA_EXERCISES } from '../data-extras';
import { getModeData } from '../data-index';
import { CONFIG } from '../config';
import type { Exercise, Progress, ScaledExercise } from '../types';

const lib = exerciseLibrary();
const ex = (id: string) => lib.get(id)!;
const daily = (id: string) => getModeData('DAILY').find(c => c.id === id)!;
const L1: Progress = {};

describe('HARDER and EASIER', () => {
  it('climbs one rung of the ladder and no further above the earned one', () => {
    const e = ex('daily-prone-extension');
    const first = adjust(e, L1, 'NORMAL', undefined, 1);
    expect(first.ok && first.tweak).toEqual({ variation: 1 });
    expect(first.text).toContain('Hands Behind Head');
    // At level 1 the next rung is the ceiling: further taps add reps instead.
    const second = adjust(e, L1, 'NORMAL', { variation: 1 }, 1);
    expect(second.ok && second.tweak).toEqual({ variation: 1, work: 2 });
    expect(scaleExercise(e, 'NORMAL', L1, { tweaks: { [e.id]: { variation: 1, work: 2 } } }).scaledWork).toBe(12);
  });

  it('undoes the last tap first', () => {
    const e = ex('daily-prone-extension');
    const back = adjust(e, L1, 'NORMAL', { variation: 1, work: 2 }, -1);
    expect(back.ok && back.tweak).toEqual({ variation: 1 });
    const down = adjust(e, L1, 'NORMAL', { variation: 1 }, -1);
    expect(down.ok && down.tweak).toEqual({});
  });

  it('lets an extra climb its whole ladder: there is no level to earn', () => {
    const e = ex('extra-diamond-pushup');
    let t = {};
    for (let i = 0; i < 3; i++) { const r = adjust(e, L1, 'NORMAL', t, 1); if (r.ok) t = r.tweak; }
    expect(scaleExercise(e, 'NORMAL', L1, { tweaks: { [e.id]: t } }).displayName).toBe('Diamond Push-Up, 3s Lower');
  });

  it('keeps the work between half and double what is written', () => {
    const e = ex('daily-side-plank-dip'); // 12 reps
    let t = {};
    for (let i = 0; i < 20; i++) { const r = adjust(e, L1, 'NORMAL', t, -1); if (r.ok) t = r.tweak; }
    expect(scaleExercise(e, 'NORMAL', L1, { tweaks: { [e.id]: t } }).scaledWork).toBe(6);
    for (let i = 0; i < 40; i++) { const r = adjust(e, L1, 'NORMAL', t, 1); if (r.ok) t = r.tweak; }
    expect(scaleExercise(e, 'NORMAL', L1, { tweaks: { [e.id]: t } }).scaledWork).toBe(24);
  });

  it('never touches fixed protocols, tests or PRIMARY work', () => {
    expect(adjust(ex('daily-edge-density'), L1, 'NORMAL', undefined, 1).ok).toBe(false);
    expect(adjust(ex('test-max-hang'), L1, 'NORMAL', undefined, 1).ok).toBe(false);
    const heavy: Exercise = {
      id: 'x-heavy', name: 'Heavy Pull', capacities: ['pull'], block: 'PRIMARY', intensity: 'HARD',
      sets: 4, work: 4, unit: 'reps', restSec: 180, load: { kind: 'added-kg', text: '' }, progression: '',
    };
    const pull = adjust(heavy, L1, 'NORMAL', undefined, 1);
    expect(pull.ok).toBe(false);
    expect(pull.text).toContain('stepper');
  });

  it('is applied wherever the exercise appears, and never to rest', () => {
    const tweaks = { 'daily-prone-extension': { variation: 1, work: 2 } };
    const plain = buildList(daily('daily-02'), 'NORMAL', L1);
    const tweaked = buildList(daily('daily-02'), 'NORMAL', L1, [], { tweaks });
    const a = plain.find(e => e.id === 'daily-prone-extension')!;
    const b = tweaked.find(e => e.id === 'daily-prone-extension')!;
    expect(b.displayName).toBe('Prone Back Extension - Hands Behind Head');
    expect(b.scaledWork).toBe(a.scaledWork + 2);
    expect(b.scaledRest).toBe(a.scaledRest);
    expect(b.scaledSets).toBe(a.scaledSets);
    expect(describeTweak(b, tweaks['daily-prone-extension'])).toBe('YOUR CHANGE: harder variation, +2 reps');
  });

  it('lets sets move today between the sets done and eight', () => {
    expect(setBounds(ex('daily-side-plank-dip'), 2)).toEqual([2, 8]);
    expect(setBounds(ex('daily-edge-density'), 1)).toBeNull();
  });
});

describe('the reserve', () => {
  it('only names exercises that exist, none gated, tested or warm-up', () => {
    const all = reserveFor({ mode: 'CAVE', circuitId: 'cave-05', list: [], pain: null, sessionLog: [] });
    const ids = RESERVE_GROUPS.flatMap(g => all[g].map(i => i.exercise.id));
    expect(ids.length).toBeGreaterThan(40);
    for (const g of RESERVE_GROUPS) expect(all[g].length).toBeGreaterThan(0);
    for (const id of ids) {
      const e = ex(id);
      expect(e.gate).toBeUndefined();
      expect(e.records).toBeUndefined();
      expect(['WARMUP', 'TEST']).not.toContain(e.block);
    }
  });

  it('gives the arm extras no capacity, so no XP, and every extra a full prescription', () => {
    for (const e of EXTRA_EXERCISES) {
      expect(e.progression.length).toBeGreaterThan(10);
      expect(e.protocolId).toBeTruthy();
      expect(e.form).toBeTruthy();
      if (e.id.includes('curl') || e.id.includes('triceps') || e.id.includes('hammer') || e.id.includes('pushup') || e.id.includes('chinup')) {
        expect(e.capacities).toEqual([]);
      } else {
        expect(e.capacities.every(c => CONFIG.capacities.includes(c))).toBe(true);
      }
    }
  });

  it('offers only home kit at home', () => {
    expect(placeOf('DAILY', 'daily-01')).toBe('HOME');
    expect(placeOf('HEAL', 'heal-03')).toBe('HOME');
    expect(placeOf('HEAL', 'heal-01')).toBe('GYM');
    const home = reserveFor({ mode: 'DAILY', circuitId: 'daily-01', list: [], pain: null, sessionLog: [] });
    const ids = RESERVE_GROUPS.flatMap(g => home[g].map(i => i.exercise.id));
    expect(ids).toContain('extra-band-curl');
    expect(ids).not.toContain('extra-db-curl');
    expect(ids).not.toContain('legs-plate-crunch');
  });

  it('grips nothing and loads no finger while a finger heals', () => {
    const ctx = { mode: 'HEAL' as const, circuitId: 'heal-02', list: [], pain: null, sessionLog: [] };
    const heal = reserveFor(ctx);
    expect(heal.FINGERS).toEqual([]);
    expect(closedGroups(ctx).FINGERS).toBeTruthy();
    const ids = RESERVE_GROUPS.flatMap(g => heal[g].map(i => i.exercise.id));
    expect(ids).toContain('extra-diamond-pushup');
    expect(ids).not.toContain('extra-band-curl');
    expect(ids).not.toContain('morn-pullapart');
    for (const id of ids) expect(ex(id).capacities.some(c => c === 'crimp' || c === 'openhand' || c === 'forearm')).toBe(false);
  });

  it('closes finger work after a pain score of 3', () => {
    const r = reserveFor({ mode: 'DAILY', circuitId: 'daily-04', list: [], pain: 3, sessionLog: [] });
    expect(r.FINGERS).toEqual([]);
  });

  it('leaves out what the session already has, and puts the least recent first', () => {
    const list = buildList(daily('daily-01'), 'NORMAL', L1);
    const log = [{
      date: new Date(2026, 9, 10, 8).toISOString(), mode: 'DAILY' as const, circuitId: 'daily-02', circuitTitle: '',
      energy: 'NORMAL' as const, duration: 12, sets: { 'daily-side-plank-dip': 2 },
    }];
    const r = reserveFor({ mode: 'DAILY', circuitId: 'daily-01', list, pain: null, sessionLog: log });
    const core = r.CORE.map(i => i.exercise.id);
    expect(core).not.toContain('daily-reverse-crunch');
    expect(core[core.length - 1]).toBe('daily-side-plank-dip');
  });
});

describe('where an added exercise goes', () => {
  const scaled = (id: string): ScaledExercise => scaleExercise(ex(id) as Exercise, 'NORMAL', L1);

  it('slots into block order after the exercise in hand', () => {
    const list = buildList(daily('daily-05'), 'NORMAL', L1);
    const at = insertIndex(list, 0, ex('extra-band-curl'), 'DAILY');
    // An ACCESSORY extra goes after the remaining SECONDARY work, before the closing mobility.
    expect(list[at - 1].block).toBe('SECONDARY');
    expect(list[at].block).toBe('MOBILITY');
  });

  it('closes a DAILY with a curl, and keeps other work in front of the curls', () => {
    const list = buildList(daily('daily-01'), 'NORMAL', L1);
    expect(insertIndex(list, 1, ex('legs-plate-crunch'), 'DAILY')).toBe(list.length);
    const at = insertIndex(list, 1, ex('daily-side-plank-dip'), 'DAILY');
    expect(list[at].id).toBe('daily-reverse-crunch');
    expect(scaled('daily-side-plank-dip').scaledSets).toBeGreaterThan(0);
  });

  it('never goes before the exercise in hand', () => {
    const list = buildList(daily('daily-01'), 'NORMAL', L1);
    expect(insertIndex(list, list.length - 1, ex('morn-catcow'), 'DAILY')).toBe(list.length);
  });
});
