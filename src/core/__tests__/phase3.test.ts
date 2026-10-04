import { describe, it, expect } from 'vitest';
import { loadItems, weeklyLoad, loadRatio, zoneOf } from '../training-load';
import { getBlockWeek, deloads } from '../block';
import { suggestLoad, isPersonalBest } from '../progression';
import { recommend, assessDue } from '../recommend';
import { buildList, getReadiness, applyXP } from '../engine';
import { getModeData } from '../data-index';
import type { ClimbSession, Exercise, SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 8, 9, 0); // Thursday 8 Oct 2026, local
const iso = (y: number, m: number, d: number, h = 8) => new Date(y, m - 1, d, h).toISOString();
const cave = getModeData('CAVE');
const strong = cave.find(c => c.id === 'cave-01')!;
const cave02 = cave.find(c => c.id === 'cave-05')!;

function session(date: string, circuitId: string, mode: SessionLogEntry['mode'], extra: Partial<SessionLogEntry> = {}): SessionLogEntry {
  return { date, mode, circuitId, circuitTitle: circuitId, energy: 'NORMAL', duration: 30, ...extra };
}

describe('training load', () => {
  it('multiplies effort by minutes and estimates unrated sessions', () => {
    const items = loadItems(
      [session(iso(2026, 10, 6), 'daily-01', 'DAILY', { effort: 5, duration: 12 })],
      [{ id: 'c', date: '2026-10-06', venue: 'GYM', discipline: 'BOULDER', climbs: [] }],
    );
    expect(items.map(i => i.load)).toEqual([60, 7 * 120]);
    expect(items[1].estimated).toBe(true);
  });

  it('sums the current week last', () => {
    const items = [{ date: '2026-10-06', source: 'CLIMB' as const, load: 500, estimated: false }];
    const weeks = weeklyLoad(items, 2, NOW);
    expect(weeks[1].monday).toBe('2026-10-05');
    expect(weeks[1].total).toBe(500);
    expect(weeks[0].total).toBe(0);
  });

  it('needs three weeks of history for a ratio', () => {
    expect(loadRatio([{ date: '2026-10-01', source: 'CAVE', load: 100, estimated: false }], NOW)).toBeNull();
    const steady = Array.from({ length: 28 }, (_, i) => ({
      date: new Date(2026, 9, 8 - i).toISOString().slice(0, 10), source: 'CAVE' as const, load: 100, estimated: false,
    }));
    expect(loadRatio(steady, NOW)?.zone).toBe('steady');
  });

  it('zones', () => {
    expect([0.5, 1, 1.4, 1.6].map(zoneOf)).toEqual(['low', 'steady', 'high', 'spike']);
  });
});

describe('block', () => {
  it('counts three build weeks then a deload from the first session', () => {
    const log = [session(iso(2026, 9, 14), 'daily-01', 'DAILY')]; // Monday 14 Sep
    expect(getBlockWeek(null, log, new Date(2026, 8, 16)).week).toBe(1);
    expect(getBlockWeek(null, log, new Date(2026, 9, 6)).deload).toBe(true);
    expect(getBlockWeek(null, log, new Date(2026, 9, 13)).week).toBe(1);
  });

  it('restarts from blockStart', () => {
    const b = getBlockWeek('2026-10-05', [session(iso(2026, 1, 1), 'x', 'DAILY')], NOW);
    expect(b).toMatchObject({ week: 1, deload: false, blockStart: '2026-10-05' });
  });

  it('deloads CAVE but never DAILY or TEST', () => {
    expect(deloads(strong)).toBe(true);
    expect(getModeData('DAILY').some(deloads)).toBe(false);
    expect(deloads(getModeData('TEST')[0])).toBe(false);
  });

  it('takes one working set off on a deload week and leaves the rest', () => {
    const normal = buildList(strong, 'NORMAL', {});
    const light = buildList(strong, 'NORMAL', {}, [], { deload: true });
    for (const e of light) {
      const n = normal.find(x => x.id === e.id)!;
      if (!e.fixed && (e.block === 'PRIMARY' || e.block === 'SECONDARY')) {
        expect(e.scaledSets).toBe(Math.max(e.block === 'PRIMARY' ? 2 : 1, n.scaledSets - 1));
      } else {
        expect(e.scaledSets).toBe(n.scaledSets);
      }
      expect(e.scaledRest).toBe(n.scaledRest);
    }
  });
});

describe('load suggestions', () => {
  const pullup = cave02.exercises.find(e => e.load.kind === 'added-kg')!;
  const log = [{ exerciseId: pullup.id, exerciseName: 'x', date: '2026-10-06', value: 10, unit: 'kg' as const }];
  const day = (sets: number, planned: number, effort?: number) => [session('2026-10-06T17:00:00.000Z', 'cave-05', 'CAVE', {
    sets: { [pullup.id]: sets }, planned: { [pullup.id]: planned }, effort,
  })];

  it('steps up when every set was done', () => {
    expect(suggestLoad(pullup, log, day(3, 3, 7))).toMatchObject({ kind: 'up', value: 11 });
  });
  it('holds on a missed set, a 9/10 session, or a deload week', () => {
    expect(suggestLoad(pullup, log, day(2, 3, 7))?.kind).toBe('hold');
    expect(suggestLoad(pullup, log, day(3, 3, 9))?.kind).toBe('hold');
    expect(suggestLoad(pullup, log, day(3, 3, 7), true)?.kind).toBe('hold');
  });
  it('goes down on assistance', () => {
    const assisted: Exercise = { ...pullup, id: 'a', load: { kind: 'assisted', value: 20, text: '' } };
    const alog = [{ ...log[0], exerciseId: 'a', value: 20 }];
    const s = [session('2026-10-06T17:00:00.000Z', 'cave-05', 'CAVE', { sets: { a: 3 }, planned: { a: 3 } })];
    expect(suggestLoad(assisted, alog, s)?.value).toBe(19);
    expect(isPersonalBest(assisted, 19, alog, '2026-10-08')).toBe(true);
    expect(isPersonalBest(assisted, 21, alog, '2026-10-08')).toBe(false);
  });
  it('a first log is never a personal best', () => {
    expect(isPersonalBest(pullup, 50, [], '2026-10-08')).toBe(false);
  });
});

describe('finger readiness', () => {
  it('light density hangs do not restart the 48h', () => {
    const edge = getModeData('DAILY').flatMap(c => c.exercises).find(e => e.id === 'daily-edge-density')!;
    const p = applyXP({}, edge, 'done');
    expect(getReadiness(strong, p).level).not.toBe('rest');
    expect(p.crimp?.lastHard).toBeNull();
  });
});

describe('recommend', () => {
  const block = getBlockWeek(null, [], NOW);
  const base = { progress: {}, benchmarkResults: [{ benchmarkId: 'fs-2arm-20mm', value: 120, date: iso(2026, 9, 20) }], block, now: NOW };

  it('picks the after-bouldering session on a climbing day, alternating', () => {
    const climb: ClimbSession = { id: 'c', date: '2026-10-08', venue: 'GYM', discipline: 'BOULDER', climbs: [] };
    const r = recommend({ ...base, sessionLog: [session(iso(2026, 10, 6, 19), 'cave-05', 'CAVE')], climbLog: [climb] });
    expect(r).toMatchObject({ mode: 'CAVE', circuitId: 'cave-06' });
  });

  it('keeps finger work off after a pain score of 6+', () => {
    const r = recommend({ ...base, sessionLog: [session(iso(2026, 10, 7), 'cave-01', 'CAVE', { pain: 7 })], climbLog: [] });
    expect(r?.mode).toBe('DAILY');
    expect(r?.circuitId).not.toBe('daily-04');
  });

  it('suggests STRONG late in a week with under two climbing days', () => {
    const r = recommend({ ...base, sessionLog: [session(iso(2026, 10, 5), 'daily-01', 'DAILY')], climbLog: [] });
    expect(r).toMatchObject({ mode: 'CAVE', circuitId: 'cave-01' });
  });

  it('rotates DAILY once nothing else is due', () => {
    const climbs: ClimbSession[] = ['2026-10-05', '2026-10-07'].map((date, i) => ({ id: String(i), date, venue: 'GYM', discipline: 'BOULDER', climbs: [] }));
    const log = ['daily-01', 'daily-02', 'daily-03'].map((id, i) => session(iso(2026, 10, 5 + i), id, 'DAILY'));
    expect(recommend({ ...base, sessionLog: log, climbLog: climbs })?.circuitId).toBe('daily-04');
  });

  it('ASSESS is due after seven weeks', () => {
    expect(assessDue([{ benchmarkId: 'fs-2arm-20mm', value: 1, date: iso(2026, 8, 1) }], [], NOW)).toBe(true);
    expect(assessDue(base.benchmarkResults, [], NOW)).toBe(false);
  });
});

describe('recommendation copy', () => {
  it('fits one line under the logo', () => {
    const block = getBlockWeek(null, [], NOW);
    const climb: ClimbSession = { id: 'c', date: '2026-10-08', venue: 'GYM', discipline: 'BOULDER', climbs: [] };
    const cases = [
      recommend({ progress: {}, benchmarkResults: [], block, now: NOW, sessionLog: [session(iso(2026, 10, 7), 'cave-01', 'CAVE', { pain: 10 })], climbLog: [] }),
      recommend({ progress: {}, benchmarkResults: [], block, now: NOW, sessionLog: [], climbLog: [climb] }),
      recommend({ progress: {}, benchmarkResults: [], block, now: NOW, sessionLog: [session(iso(2026, 8, 1), 'daily-01', 'DAILY')], climbLog: [] }),
      recommend({ progress: {}, benchmarkResults: [{ benchmarkId: 'fs-2arm-20mm', value: 1, date: iso(2026, 10, 1) }], block, now: NOW, sessionLog: [session(iso(2026, 10, 7), 'daily-01', 'DAILY')], climbLog: [] }),
      recommend({ progress: {}, benchmarkResults: [{ benchmarkId: 'fs-2arm-20mm', value: 1, date: iso(2026, 10, 1) }], block, now: NOW, sessionLog: [session(iso(2026, 9, 25), 'daily-02', 'DAILY')], climbLog: [] }),
    ];
    for (const r of cases) expect(r?.reason.length ?? 0, r?.reason).toBeLessThanOrEqual(45);
  });
});

describe('recommend on a TIRED day', () => {
  it('never picks STRONG or ASSESS', () => {
    const block = getBlockWeek(null, [], NOW);
    const r = recommend({ progress: {}, benchmarkResults: [], block, tired: true, now: NOW, sessionLog: [session(iso(2026, 8, 1), 'daily-01', 'DAILY')], climbLog: [] });
    expect(r?.mode).toBe('DAILY');
    expect(r!.reason.length).toBeLessThanOrEqual(45);
  });
});
