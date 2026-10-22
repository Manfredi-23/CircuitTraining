import { describe, it, expect } from 'vitest';
import {
  addItem, blankRoutine, isHomeExercise, itemExercise, libraryFor, moveItem, removeItem, renameRoutine,
  routineCircuit, routineFromCircuit, routineFromList, routineMode, routineWarnings, stepItem, swapItem,
  MAX_ITEMS, MAX_SETS, NAME_MAX, ROUTINE_PREFIX,
} from '../routines';
import { applyPlan, blockedBecause, plannedOn, resolveItem, weekdayOf, type WeekPlan } from '../plan';
import { getModeData } from '../data-index';
import { buildList } from '../engine';
import { getBlockWeek } from '../block';
import { recommend } from '../recommend';
import { exerciseLibrary } from '../reserve';
import { NO_DAY } from '../today';
import type { SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 8, 9, 0); // Thursday 8 Oct 2026
const cave02 = getModeData('CAVE').find(c => c.id === 'cave-05')!;
const daily01 = getModeData('DAILY').find(c => c.id === 'daily-01')!;
const strong = getModeData('CAVE').find(c => c.id === 'cave-01')!;

describe('routines', () => {
  it('copies a programme session as written and runs it through the engine', () => {
    const r = routineFromCircuit(cave02, 'CAVE', NOW.getTime());
    expect(r.place).toBe('GYM');
    expect(routineMode(r)).toBe('CAVE');
    expect(r.items.map(i => i.id)).toEqual(cave02.exercises.map(e => e.id));
    const c = routineCircuit(r);
    expect(c.id.startsWith(ROUTINE_PREFIX)).toBe(true);
    expect(c.stacksOnSession).toBe(true);
    const fromRoutine = buildList(c, 'NORMAL', {}).map(e => e.id);
    const fromProgramme = buildList(cave02, 'NORMAL', {}).map(e => e.id);
    expect(fromRoutine).toEqual(fromProgramme);
  });

  it('keeps the one-arm gates: a gated rung is substituted until tested', () => {
    const r = routineFromCircuit(strong, 'CAVE');
    const gated = strong.exercises.filter(e => e.gate);
    expect(gated.length).toBeGreaterThan(0);
    const ids = buildList(routineCircuit(r), 'NORMAL', {}, []).map(e => e.id);
    for (const g of gated) expect(ids).not.toContain(g.id);
  });

  it('home routines are DAILY and repeatable', () => {
    const r = routineFromCircuit(daily01, 'DAILY');
    expect(r.place).toBe('HOME');
    expect(routineCircuit(r).recoveryHours).toBe(0);
    expect(routineMode(r)).toBe('DAILY');
  });

  it('adds, removes, moves and swaps without duplicates', () => {
    let r = blankRoutine('X', 'GYM');
    r = addItem(r, 'cave-weighted-pullup');
    r = addItem(r, 'cave-weighted-pullup');
    expect(r.items).toHaveLength(1);
    r = addItem(r, 'cave-lockoff');
    r = moveItem(r, 1, -1);
    expect(r.items.map(i => i.id)).toEqual(['cave-lockoff', 'cave-weighted-pullup']);
    expect(moveItem(r, 0, -1)).toBe(r);
    r = swapItem(r, 0, 'cave-weighted-pullup');
    expect(r.items[0].id).toBe('cave-lockoff');
    r = removeItem(r, 0);
    expect(r.items.map(i => i.id)).toEqual(['cave-weighted-pullup']);
  });

  it('caps the list length', () => {
    let r = blankRoutine('X', 'GYM');
    for (const id of Array.from(exerciseLibrary().keys()).slice(0, MAX_ITEMS + 4)) r = addItem(r, id);
    expect(r.items).toHaveLength(MAX_ITEMS);
  });

  it('changes sets and work inside bounds, and never a fixed protocol', () => {
    let r = blankRoutine('X', 'GYM');
    r = addItem(r, 'cave-weighted-pullup');
    for (let i = 0; i < 20; i++) r = stepItem(r, 0, 'sets', 1);
    expect(itemExercise(r.items[0])!.sets).toBe(MAX_SETS);
    for (let i = 0; i < 40; i++) r = stepItem(r, 0, 'work', -1);
    const base = exerciseLibrary().get('cave-weighted-pullup')!;
    expect(itemExercise(r.items[0])!.work).toBe(Math.max(1, Math.ceil(base.work / 2)));
    const fixed = Array.from(exerciseLibrary().values()).find(e => e.fixed && e.block !== 'WARMUP')!;
    let f = addItem(blankRoutine('F', 'GYM'), fixed.id);
    f = stepItem(f, 0, 'sets', 1);
    expect(f.items[0]).toEqual({ id: fixed.id });
  });

  it('back to the written value drops the override', () => {
    let r = addItem(blankRoutine('X', 'GYM'), 'cave-weighted-pullup');
    r = stepItem(stepItem(r, 0, 'sets', 1), 0, 'sets', -1);
    expect(r.items[0]).toEqual({ id: 'cave-weighted-pullup' });
  });

  it('never changes rest', () => {
    let r = addItem(blankRoutine('X', 'GYM'), 'cave-weighted-pullup');
    r = stepItem(r, 0, 'sets', 1);
    expect(itemExercise(r.items[0])!.restSec).toBe(exerciseLibrary().get('cave-weighted-pullup')!.restSec);
  });

  it('freezes a built list as it stands', () => {
    const list = buildList(cave02, 'NORMAL', {});
    const r = routineFromList(list, 'FROZEN', 'GYM');
    expect(r.items.map(i => i.id)).toEqual(list.map(e => e.id));
    expect(r.from).toBe('build');
  });

  it('renames within the limit and ignores an empty name', () => {
    const r = blankRoutine('A', 'HOME');
    expect(renameRoutine(r, '  ').name).toBe('A');
    expect(renameRoutine(r, 'x'.repeat(50)).name).toHaveLength(NAME_MAX);
  });

  it('warns on gym kit at home, late heavy work and two hard finger exercises', () => {
    let home = addItem(blankRoutine('H', 'HOME'), 'cave-weighted-pullup');
    expect(routineWarnings(home).join(' ')).toMatch(/gym kit/);
    const s = routineFromCircuit(strong, 'CAVE');
    const flipped = { ...s, items: [...s.items].reverse() };
    expect(routineWarnings(flipped).join(' ')).toMatch(/Heavy first/);
    home = routineFromCircuit(daily01, 'DAILY');
    expect(routineWarnings(home).join(' ')).not.toMatch(/gym kit/);
  });

  it('the library at home holds only home exercises and never tests', () => {
    const lib = libraryFor('HOME');
    expect(lib.length).toBeGreaterThan(10);
    for (const e of lib) {
      expect(isHomeExercise(e.exercise.id)).toBe(true);
      expect(e.exercise.block).not.toBe('TEST');
    }
    expect(libraryFor('GYM', 'pull-up').every(e => e.exercise.name.toLowerCase().includes('pull-up'))).toBe(true);
  });
});

describe('weekly plan', () => {
  const block = getBlockWeek(null, [], NOW);
  const base = { progress: {}, benchmarkResults: [], block, now: NOW, climbLog: [], sessionLog: [] as SessionLogEntry[] };

  it('reads the plan for the weekday, Monday first', () => {
    expect(weekdayOf(NOW)).toBe(3);
    const plan: WeekPlan = { 3: [{ kind: 'CLIMB' }] };
    expect(plannedOn(plan, NOW)).toEqual([{ kind: 'CLIMB' }]);
  });

  it('a planned session leads, and the recommendation becomes the alternative', () => {
    const plan: WeekPlan = { 3: [{ kind: 'SESSION', mode: 'DAILY', circuitId: 'daily-03' }] };
    const rec = recommend(base);
    const out = applyPlan(plan, [], base, rec);
    expect(out.pick).toMatchObject({ circuitId: 'daily-03', reason: 'Planned for today.' });
    if (rec && rec.circuitId !== 'daily-03') expect(out.also?.circuitId).toBe(rec.circuitId);
  });

  it('a planned routine resolves to its circuit', () => {
    const r = routineFromCircuit(daily01, 'DAILY');
    const plan: WeekPlan = { 3: [{ kind: 'ROUTINE', routineId: r.id }] };
    const out = applyPlan(plan, [r], base, recommend(base));
    expect(out.pick?.routineId).toBe(r.id);
    expect(resolveItem({ kind: 'ROUTINE', routineId: 'gone' }, [])).toBeNull();
  });

  it('a finger session planned after pain 6+ steps aside and says why', () => {
    const input = { ...base, sessionLog: [{ date: new Date(2026, 9, 7, 8).toISOString(), mode: 'DAILY' as const, circuitId: 'daily-01', circuitTitle: 'x', energy: 'NORMAL' as const, duration: 10, pain: 7 }] };
    const plan: WeekPlan = { 3: [{ kind: 'SESSION', mode: 'CAVE', circuitId: 'cave-01' }] };
    const out = applyPlan(plan, [], input, recommend(input));
    expect(out.pick?.circuitId).not.toBe('cave-01');
    expect(out.pick?.reason).toMatch(/was planned, but finger pain 7\/10/);
  });

  it('skips a planned session already done today', () => {
    const input = { ...base, sessionLog: [{ date: new Date(2026, 9, 8, 7).toISOString(), mode: 'DAILY' as const, circuitId: 'daily-03', circuitTitle: 'x', energy: 'NORMAL' as const, duration: 10 }] };
    const plan: WeekPlan = { 3: [{ kind: 'SESSION', mode: 'DAILY', circuitId: 'daily-03' }, { kind: 'SESSION', mode: 'DAILY', circuitId: 'daily-05' }] };
    expect(applyPlan(plan, [], input, null).pick?.circuitId).toBe('daily-05');
  });

  it('no kit stops a gym session', () => {
    const r = { mode: 'CAVE' as const, circuit: cave02 };
    expect(blockedBecause(r, { ...base, day: { ...NO_DAY, noKit: true } })).toBe('no kit today');
  });

  it('a planned rest day leaves no pick and offers the recommendation', () => {
    const rec = recommend(base);
    const out = applyPlan({ 3: [{ kind: 'REST' }] }, [], base, rec);
    expect(out.pick).toBeNull();
    expect(out.note).toMatch(/Rest/);
    expect(out.also).toEqual(rec);
  });
});

describe('library', () => {
  it('shows each exercise name once, the copy already in the routine first', () => {
    const lib = libraryFor('GYM');
    const names = lib.map(e => e.exercise.name);
    expect(new Set(names).size).toBe(names.length);
    const twins = Array.from(exerciseLibrary().values()).filter((e, _, all) => all.some(o => o.name === e.name && o.id !== e.id));
    if (twins.length) {
      const pick = twins[twins.length - 1];
      expect(libraryFor('GYM', '', null, [pick.id]).some(e => e.exercise.id === pick.id)).toBe(true);
    }
  });
});
