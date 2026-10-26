import { describe, it, expect } from 'vitest';
import { buildList, estimateDuration, isHardWork } from '../engine';
import { recommend } from '../recommend';
import { getBlockWeek } from '../block';
import { getModeData } from '../data-index';
import { PROTOCOLS } from '../protocols';
import type { ClimbSession, SessionLogEntry } from '../types';

const cave = getModeData('CAVE');
const NOW = new Date(2026, 9, 8, 9, 0); // Thursday 8 Oct 2026, local
const iso = (y: number, m: number, d: number, h = 8) => new Date(y, m - 1, d, h).toISOString();
const session = (date: string, circuitId: string): SessionLogEntry =>
  ({ date, mode: 'CAVE', circuitId, circuitTitle: circuitId, energy: 'NORMAL', duration: 70 });

describe('CAVE training days', () => {
  it('has three no-climbing sessions and two after bouldering', () => {
    expect(cave.filter(c => !c.stacksOnSession).map(c => c.circuitNum)).toEqual(['01', '04', '05']);
    expect(cave.filter(c => c.stacksOnSession).map(c => c.circuitNum)).toEqual(['02', '03']);
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

  it('offers POWER or FULL BODY once STRONG is done this week', () => {
    const r = recommend({ ...base, sessionLog: [session(iso(2026, 10, 5), 'cave-01')], climbLog: [lastWeek] });
    expect(r?.mode).toBe('CAVE');
    expect(['cave-07', 'cave-08']).toContain(r?.circuitId);
    expect(r!.reason.length).toBeLessThanOrEqual(45);
  });

  it('alternates POWER and FULL BODY', () => {
    const log = [session(iso(2026, 9, 28), 'cave-07'), session(iso(2026, 10, 5), 'cave-01')];
    expect(recommend({ ...base, sessionLog: log, climbLog: [lastWeek] })?.circuitId).toBe('cave-08');
  });

  it('stops once two climbing or training days are in the week', () => {
    const log = [session(iso(2026, 10, 5), 'cave-01'), session(iso(2026, 10, 6), 'cave-08')];
    expect(recommend({ ...base, sessionLog: log, climbLog: [lastWeek] })?.mode).toBe('DAILY');
  });
});
