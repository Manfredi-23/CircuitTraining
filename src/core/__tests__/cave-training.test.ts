import { describe, it, expect } from 'vitest';
import { buildList, estimateDuration, isHardWork } from '../engine';
import { recommend } from '../recommend';
import { NO_DAY } from '../today';
import { getBlockWeek } from '../block';
import { getModeData } from '../data-index';
import { PROTOCOLS } from '../protocols';
import { exerciseLibrary } from '../reserve';
import type { ClimbSession, SessionLogEntry } from '../types';

const cave = getModeData('CAVE');
const NOW = new Date(2026, 9, 8, 9, 0); // Thursday 8 Oct 2026, local
const iso = (y: number, m: number, d: number, h = 8) => new Date(y, m - 1, d, h).toISOString();
const session = (date: string, circuitId: string): SessionLogEntry =>
  ({ date, mode: 'CAVE', circuitId, circuitTitle: circuitId, energy: 'NORMAL', duration: 70 });

describe('CAVE training days', () => {
  it('has three no-climbing sessions and two after bouldering', () => {
    // v47 added 06-08, the CAVE days, and 09 STRAIGHT BACK after climbing.
    expect(cave.filter(c => !c.stacksOnSession).map(c => c.circuitNum)).toEqual(['01', '04', '05', '06', '07', '08']);
    expect(cave.filter(c => c.stacksOnSession).map(c => c.circuitNum)).toEqual(['02', '03', '09']);
  });

  it('links every exercise in 04 and 05 to a protocol that exists', () => {
    for (const c of cave.filter(x => x.id === 'cave-07' || x.id === 'cave-08')) {
      for (const e of [...c.exercises, ...(c.substitutes ?? [])]) {
        expect(e.protocolId && PROTOCOLS[e.protocolId], `${c.id} ${e.id}`).toBeTruthy();
      }
    }
  });

  it('keeps 04 and 05 between 60 and 75 minutes NORMAL', () => {
    for (const id of ['cave-07', 'cave-08']) {
      const minutes = estimateDuration(buildList(cave.find(c => c.id === id)!, 'NORMAL', {}));
      expect(minutes, id).toBeGreaterThanOrEqual(60);
      expect(minutes, id).toBeLessThanOrEqual(75);
    }
  });

  it('never makes POWER a hard finger day', () => {
    const power = cave.find(c => c.id === 'cave-07')!;
    const hangs = power.exercises.filter(e => e.capacities.includes('crimp') && e.block !== 'WARMUP');
    expect(hangs.length).toBeGreaterThan(0);
    expect(hangs.some(isHardWork)).toBe(false);
  });
});

describe('recommend on a training day', () => {
  const block = getBlockWeek(null, [], NOW);
  const base = { progress: {}, benchmarkResults: [{ benchmarkId: 'fs-2arm-20mm', value: 120, date: iso(2026, 9, 20) }], block, now: NOW };
  const lastWeek: ClimbSession = { id: 'c', date: '2026-09-29', venue: 'GYM', discipline: 'BOULDER', climbs: [] };

  // v47: CAVE today picks the CAVE day done longest ago, legs within two days of a climb.
  const evening = { ...base, now: new Date(2026, 9, 8, 18), day: { ...NO_DAY, kind: 'CAVE' as const } };

  it('rotates the CAVE days, the one done longest ago first', () => {
    const log = [session(iso(2026, 9, 28), 'cave-10'), session(iso(2026, 10, 1), 'cave-09'), session(iso(2026, 10, 5), 'cave-11')];
    const r = recommend({ ...evening, sessionLog: log, climbLog: [lastWeek] });
    expect(r?.circuitId).toBe('cave-10');
    expect(r!.reason.length).toBeLessThanOrEqual(45);
    const next = [...log.slice(1), session(iso(2026, 10, 7), 'cave-10')];
    expect(recommend({ ...evening, sessionLog: next, climbLog: [lastWeek] })?.circuitId).toBe('cave-09');
  });

  it('picks the legs the day after a climb', () => {
    const log = [session(iso(2026, 9, 28), 'cave-09'), session(iso(2026, 10, 1), 'cave-10')];
    const yesterday: ClimbSession = { ...lastWeek, id: 'y', date: '2026-10-07' };
    const r = recommend({ ...evening, sessionLog: log, climbLog: [yesterday] });
    expect(r?.circuitId).toBe('cave-10');
    expect(r?.reason).toMatch(/yesterday/);
  });

  it('gives nothing more once a CAVE day is done today', () => {
    const log = [session(iso(2026, 10, 8, 17), 'cave-09')];
    expect(recommend({ ...evening, sessionLog: log, climbLog: [] })).toBeNull();
  });

  it('runs STRAIGHT BACK on a CLIMB day', () => {
    const r = recommend({ ...evening, day: { ...NO_DAY, kind: 'CLIMB' as const }, sessionLog: [], climbLog: [] });
    expect(r?.circuitId).toBe('cave-12');
  });
});

describe('the kit the gym has', () => {
  it('asks for no back extension station, roman chair or stool: the back extension is on the mat, heels under the radiator', () => {
    const station = /45-degree|roman chair|\bGHD\b|hip pad|rollers|over (a|the) stool/i;
    for (const e of exerciseLibrary().values()) {
      const text = [e.name, e.note, e.load.text, ...(e.variations ?? []).map(v => v.name), ...Object.values(e.form ?? {})].join(' ');
      expect(station.test(text), e.id).toBe(false);
    }
    const ext = exerciseLibrary().get('legs-back-extension')!;
    expect(ext.form?.setup).toMatch(/radiator/);
    expect(ext.load.kind).toBe('added-kg');
  });
});

