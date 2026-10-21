import { describe, it, expect } from 'vitest';
import { getInsights, getOverview, getWorkSplit, periodStats, zeroDrops, areaOf } from '../review';
import { exerciseLibrary } from '../reserve';
import type { ClimbSession, LoadLogEntry, SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 21, 10); // Wednesday 21 Oct 2026
const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 18).toISOString();
const session = (date: string, circuitId: string, sets: Record<string, number>, extra: Partial<SessionLogEntry> = {}): SessionLogEntry => ({
  date, mode: circuitId.startsWith('heal') ? 'HEAL' : circuitId.startsWith('daily') ? 'DAILY' : 'CAVE',
  circuitId, circuitTitle: circuitId, energy: 'NORMAL', duration: 30, sets, ...extra,
});
const load = (exerciseId: string, date: string, value: number): LoadLogEntry =>
  ({ exerciseId, exerciseName: exerciseId === 'addon-weighted-pullup' ? 'Weighted Pull-Ups' : 'Russian Twist', date, value, unit: 'kg' });

describe('the overview', () => {
  it('counts training days, minutes, completion and effort, and ignores empty taps', () => {
    const log = [
      session(at(2026, 10, 20), 'cave-05', { 'addon-weighted-pullup': 3 }, { planned: { 'addon-weighted-pullup': 3, 'addon-cuff': 2 }, effort: 6 }),
      session(at(2026, 10, 18), 'daily-01', { 'daily-pushup': 2 }, { planned: { 'daily-pushup': 2 }, effort: 4, duration: 15 }),
      session(at(2026, 10, 16), 'heal-04', {}, { duration: 0 }),
      session(at(2026, 9, 10), 'cave-05', { 'addon-weighted-pullup': 3 }),
    ];
    const climbs: ClimbSession[] = [{ id: 'c', date: '2026-10-18', venue: 'GYM', discipline: 'BOULDER', climbs: [], durationMin: 90 }];
    const ov = getOverview(log, climbs, [], NOW);
    expect(ov.current).toMatchObject({ trainingDays: 2, sessions: 2, climbs: 1, minutes: 135, setsDone: 5, effort: 5 });
    expect(ov.current.completion).toBe(71); // 5 of 7 planned sets
    expect(ov.previous.trainingDays).toBe(1);
    expect(periodStats([], [], [], '2026-10-01', '2026-10-21').completion).toBeNull();
  });
});

describe('where the work went', () => {
  it('splits working sets by area and leaves warm-ups and tests out', () => {
    const lib = exerciseLibrary();
    expect(areaOf(lib.get('cave-warmup-pulse')!)).toBeNull();
    expect(areaOf(lib.get('extra-band-curl')!)).toBe('ARMS');
    const split = getWorkSplit([
      session(at(2026, 10, 20), 'cave-05', { 'cave-warmup-pulse': 1, 'addon-weighted-pullup': 3, 'addon-pushup': 3, 'retired-id': 4 }),
      session(at(2026, 9, 15), 'cave-06', { 'addon-goblet-squat': 2 }),
    ], NOW);
    const by = Object.fromEntries(split.map(a => [a.area, a]));
    expect(by.PULL).toMatchObject({ sets: 3, share: 50 });
    expect(by.PUSH.sets).toBe(3);
    expect(by.LEGS).toMatchObject({ sets: 0, previousSets: 2 });
  });
});

describe('what stands out', () => {
  const pullups = [load('addon-weighted-pullup', '2026-09-12', 0), load('addon-weighted-pullup', '2026-09-23', 10), load('addon-weighted-pullup', '2026-10-20', 20)];

  it('names the biggest gain from the first real load, skipping zeros', () => {
    const ins = getInsights({ sessionLog: [], climbLog: [], activityLog: [], loadLog: pullups, benchmarkResults: [], now: NOW });
    expect(ins.some(i => i.tone === 'good' && i.text === 'Weighted Pull-Ups: 10 kg to 20 kg since 23 Sep.')).toBe(true);
  });

  it('says when the tested pull-up already opens the one-arm gates', () => {
    const ins = getInsights({ sessionLog: [], climbLog: [], activityLog: [], loadLog: [],
      benchmarkResults: [{ benchmarkId: 'weighted-pullup-2rm', value: 149, date: '2026-10-04T13:00:00Z' }], now: NOW });
    expect(ins.some(i => i.text.includes('opens both one-arm stages'))).toBe(true);
    expect(ins.some(i => i.text.startsWith('Next ASSESS around 22 Nov'))).toBe(true);
  });

  it('warns about pulling while a finger heals, and does not count healing days as unlogged climbs', () => {
    const log = [
      session(at(2026, 9, 29), 'cave-05', { 'addon-weighted-pullup': 3 }),
      session(at(2026, 10, 1), 'cave-06', { 'addon-goblet-squat': 2 }),
      session(at(2026, 10, 12), 'heal-02', { 'heal-nordic-curl': 4 }),
      session(at(2026, 10, 17), 'cave-05', { 'addon-weighted-pullup': 3 }),
      session(at(2026, 10, 20), 'cave-05', { 'addon-weighted-pullup': 3 }),
    ];
    const climbs: ClimbSession[] = [{ id: 'c', date: '2026-10-06', venue: 'GYM', discipline: 'BOULDER', climbs: [] }];
    const ins = getInsights({ sessionLog: log, climbLog: climbs, activityLog: [], loadLog: [], benchmarkResults: [], now: NOW });
    expect(ins[0]).toEqual({ tone: 'warn', text: 'Finger healing since 12 Oct, but pulling logged on 2 days. HEAL means no pulling until the physio clears it.' });
    expect(ins.find(i => i.text.includes('no climb logged'))?.text).toMatch(/^2 after-bouldering sessions/);
  });

  it('flags a load logged as 0 after a real value', () => {
    const twist = [load('addon-russian-twist', '2026-10-12', 12), load('addon-russian-twist', '2026-10-20', 0)];
    expect(zeroDrops(twist)).toEqual([{ name: 'Russian Twist', before: 12 }]);
    expect(zeroDrops(pullups)).toEqual([]);
  });
});
