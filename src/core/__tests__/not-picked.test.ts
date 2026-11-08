import { describe, it, expect } from 'vitest';
import { isPickable, NOT_PICKED, OUT_OF_SESSIONS } from '../not-picked';
import { exerciseLibrary, reserveFor, RESERVE_GROUPS } from '../reserve';
import { libraryFor, isHomeExercise } from '../routines';
import { groupBlock, groupList, otherKitFor } from '../alternatives';
import { packsFor, similarTo, PACKS, type EditContext } from '../session-edit';
import { MUSCLE_GROUPS } from '../exercise-tags';
import { getModeData } from '../data-index';
import { CONFIG } from '../config';
import { fingerHealing, inHealBlock, isHealing } from '../recommend';
import type { ClimbSession, LoadLogEntry, BenchmarkResult, SessionLogEntry } from '../types';

const lib = exerciseLibrary();
const GYM: EditContext = { place: 'GYM', mode: 'CAVE', healing: false, pain: null, noKit: false };
const HOME: EditContext = { place: 'HOME', mode: 'DAILY', healing: false, pain: null, noKit: false };
const never = new Map<string, string>();

describe('what the app never picks (v46)', () => {
  it('keeps every one in the library, so SEARCH ALL finds it and its history has a name', () => {
    for (const id of NOT_PICKED) {
      const e = lib.get(id);
      expect(e, id).toBeDefined();
      expect(libraryFor('GYM', e!.name).some(x => x.exercise.id === id || x.exercise.name === e!.name), id).toBe(true);
    }
    for (const e of OUT_OF_SESSIONS) expect(NOT_PICKED.has(e.id), e.id).toBe(true);
  });

  it('keeps the home ones at home', () => {
    for (const id of ['daily-reverse-crunch', 'daily-prone-extension', 'daily-back-unwind', 'heal-prone-ytw']) {
      expect(isHomeExercise(id), id).toBe(true);
    }
  });

  it('is in no session', () => {
    for (const mode of CONFIG.modes) {
      for (const c of getModeData(mode)) {
        for (const e of [...c.exercises, ...(c.substitutes ?? [])]) expect(isPickable(e.id), `${c.id} ${e.id}`).toBe(true);
        for (const e of c.exercises) for (const o of e.options ?? []) expect(isPickable(o), `${c.id} ${o}`).toBe(true);
      }
    }
  });

  it('is never offered by the reserve, a group, a pack, SIMILAR or OTHER KIT', () => {
    for (const ctx of [GYM, HOME, { ...GYM, healing: true }]) {
      const reserve = reserveFor({ mode: ctx.mode, circuitId: ctx.place === 'GYM' ? 'cave-05' : 'daily-01', list: [], pain: null, sessionLog: [], healing: ctx.healing });
      for (const g of RESERVE_GROUPS) for (const i of reserve[g]) expect(isPickable(i.exercise.id), i.exercise.id).toBe(true);
      for (const g of MUSCLE_GROUPS) {
        for (const e of groupList(g, ctx, [], never)) expect(isPickable(e.exercise.id), e.exercise.id).toBe(true);
        for (const id of groupBlock(g, ctx, [], never)) expect(isPickable(id), id).toBe(true);
      }
      for (const p of packsFor(ctx, [])) for (const id of p.ids) expect(isPickable(id), id).toBe(true);
      for (const id of ['extra-bw-good-morning', 'morn-hollow', 'heal-band-er', 'daily-side-plank-dip']) {
        const e = lib.get(id)!;
        for (const s of similarTo(e, ctx)) expect(isPickable(s.exercise.id), `${id} -> ${s.exercise.id}`).toBe(true);
        for (const s of otherKitFor(e, ctx)) expect(isPickable(s.exercise.id), `${id} -> ${s.exercise.id}`).toBe(true);
      }
    }
    for (const p of PACKS) for (const id of [...p.home, ...(p.gym ?? [])]) expect(isPickable(id), `${p.id} ${id}`).toBe(true);
  });

  it('puts the back held flat in their place', () => {
    const ids = (cid: string) => [...getModeData('DAILY'), ...getModeData('CAVE'), ...getModeData('HEAL')]
      .find(c => c.id === cid)!.exercises.map(e => e.id);
    expect(ids('daily-01')).toContain('morn-leg-lowers');
    expect(ids('daily-02')).toContain('extra-bent-ytw');
    expect(ids('daily-05')).toContain('morn-hip-9090');
    expect(ids('cave-06')).toEqual(expect.arrayContaining(['extra-bw-good-morning', 'morn-leg-lowers']));
    expect(ids('cave-07')).toContain('cave-front-lever');
    expect(ids('heal-01')).toEqual(expect.arrayContaining(['extra-bw-good-morning', 'morn-leg-lowers']));
    expect(ids('heal-02')).toEqual(expect.arrayContaining(['extra-bent-ytw', 'morn-hip-9090']));
    const full = getModeData('CAVE').find(c => c.id === 'cave-08')!;
    expect(full.exercises.find(e => e.id === 'full-suitcase-carry')!.noGripId).toBe('extra-band-pallof');
  });
});

describe('a healing finger (v46)', () => {
  const NOW = new Date('2026-11-08T14:00:00');
  const session = (date: string, circuitId: string): SessionLogEntry => ({
    date: `${date}T18:00:00`, mode: 'HEAL', circuitId, circuitTitle: '', energy: 'NORMAL', duration: 5,
  });
  const climb = (date: string) => ({ date, venue: 'GYM', discipline: 'BOULDER', climbs: [] }) as unknown as ClimbSession;
  const right: BenchmarkResult[] = [{ benchmarkId: 'ring-finger-right', value: 9, date: '2026-10-16' } as BenchmarkResult];
  const left = (kg: number): LoadLogEntry[] => [{ exerciseId: 'heal-ring-left', exerciseName: 'Ring Finger Lift - Left', date: '2026-11-05', value: kg, unit: 'kg' } as LoadLogEntry];

  it('does not end when a climb is logged while the left is under 80% of the right', () => {
    const log = [session('2026-11-05', 'heal-03')];
    const climbs = [climb('2026-11-08')];
    expect(inHealBlock(log, climbs, NOW)).toBe(false);
    expect(isHealing(log, climbs, NOW, { left: 3, reached: false })).toBe(true);
    expect(fingerHealing({ sessionLog: log, climbLog: climbs, loadLog: left(3), benchmarkResults: right }, NOW)).toBe(true);
  });

  it('ends at 80%, climbs or not', () => {
    const log = [session('2026-11-05', 'heal-03')];
    expect(fingerHealing({ sessionLog: log, climbLog: [], loadLog: left(7.5), benchmarkResults: right }, NOW)).toBe(false);
  });

  it('without the numbers: the ring rehab in the last ten days keeps it, a gym HEAL session alone does not', () => {
    const climbs = [climb('2026-11-08')];
    expect(isHealing([session('2026-11-05', 'heal-03')], climbs, NOW)).toBe(true);
    expect(isHealing([session('2026-11-05', 'heal-01')], climbs, NOW)).toBe(false);
    expect(isHealing([session('2026-10-20', 'heal-03')], [], NOW)).toBe(false);
  });
});
