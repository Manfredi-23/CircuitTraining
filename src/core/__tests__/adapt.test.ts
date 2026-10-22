import { describe, it, expect } from 'vitest';
import { deloadAdvice, deloadNowStart, plateaus, weekSummary, PLATEAU_SESSIONS } from '../adapt';
import { getBlockWeek } from '../block';
import type { LoadLogEntry, SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 22, 9); // Thursday 22 Oct 2026
const at = (m: number, d: number, h = 18) => new Date(2026, m - 1, d, h).toISOString();
const s = (date: string, extra: Partial<SessionLogEntry> = {}): SessionLogEntry =>
  ({ date, mode: 'CAVE', circuitId: 'cave-05', circuitTitle: 'PULL + PUSH', energy: 'NORMAL', duration: 40, ...extra });

describe('deload advice', () => {
  it('says deload now when sessions grind at 8.5 or more', () => {
    const block = getBlockWeek('2026-10-12', [], NOW); // week 2
    expect(block.week).toBe(2);
    const log = [at(10, 13), at(10, 15), at(10, 18), at(10, 20), at(10, 21)].map(d => s(d, { effort: 9 }));
    expect(deloadAdvice({ block, sessionLog: log, climbLog: [], now: NOW })?.kind).toBe('early');
  });

  it('says deload now after finger pain twice in a week', () => {
    const block = getBlockWeek('2026-10-12', [], NOW);
    const log = [s(at(10, 19), { pain: 4 }), s(at(10, 21), { pain: 3 })];
    expect(deloadAdvice({ block, sessionLog: log, climbLog: [], now: NOW })?.reason).toMatch(/Finger pain/);
  });

  it('stays quiet in week one and on a normal block', () => {
    const w1 = getBlockWeek('2026-10-19', [], NOW);
    expect(deloadAdvice({ block: w1, sessionLog: [s(at(10, 20), { effort: 10 })], climbLog: [], now: NOW })).toBeNull();
    const w2 = getBlockWeek('2026-10-12', [], NOW);
    expect(deloadAdvice({ block: w2, sessionLog: [s(at(10, 20), { effort: 6 })], climbLog: [], now: NOW })).toBeNull();
  });

  it('offers to skip a deload after build weeks that barely happened', () => {
    const block = getBlockWeek('2026-09-28', [], NOW); // deload week
    expect(block.deload).toBe(true);
    expect(deloadAdvice({ block, sessionLog: [s(at(10, 6))], climbLog: [], now: NOW })?.kind).toBe('skip');
    const busy = [at(9, 29), at(10, 1), at(10, 6), at(10, 8), at(10, 13)].map(d => s(d));
    expect(deloadAdvice({ block, sessionLog: busy, climbLog: [], now: NOW })).toBeNull();
  });

  it('a deload now makes this week the deload', () => {
    expect(getBlockWeek(deloadNowStart(NOW), [], NOW).deload).toBe(true);
  });
});

describe('plateaus', () => {
  const l = (date: string, value: number): LoadLogEntry => ({ exerciseId: 'p', exerciseName: 'Weighted Pull-Ups', date, value, unit: 'kg' });
  it(`finds a lift at one load ${PLATEAU_SESSIONS} sessions running`, () => {
    const log = [l('2026-09-20', 10), l('2026-09-27', 12), l('2026-10-04', 12), l('2026-10-11', 12), l('2026-10-18', 12)];
    expect(plateaus(log, NOW)).toEqual([{ exerciseId: 'p', name: 'Weighted Pull-Ups', value: 12, unit: 'kg', sessions: 4 }]);
  });
  it('ignores a rising lift and an old stall', () => {
    expect(plateaus([l('2026-10-01', 10), l('2026-10-08', 11), l('2026-10-15', 12), l('2026-10-20', 13)], NOW)).toEqual([]);
    expect(plateaus([l('2026-07-01', 10), l('2026-07-08', 10), l('2026-07-15', 10), l('2026-07-22', 10)], NOW)).toEqual([]);
  });
});

describe('week summary', () => {
  it('counts last Monday to Sunday', () => {
    const log = [s(at(10, 13)), s(at(10, 15)), s(at(10, 20))];
    const climbs = [{ id: 'c', date: '2026-10-13', venue: 'GYM' as const, discipline: 'BOULDER' as const, climbs: [], durationMin: 80 }];
    expect(weekSummary(log, climbs, NOW)).toBe('Last week: 2 sessions, 1 climb, 2.7 h.');
    expect(weekSummary([], [], NOW)).toMatch(/Nothing logged/);
  });
});

describe('how a lift felt', () => {
  it('leads the load suggestion: easy steps on even after a hard session, hard holds', async () => {
    const { suggestLoad } = await import('../progression');
    const { exerciseLibrary } = await import('../reserve');
    const ex = exerciseLibrary().get('cave-weighted-pullup')!;
    const loads: LoadLogEntry[] = [{ exerciseId: ex.id, exerciseName: ex.name, date: '2026-10-20', value: 12, unit: 'kg' }];
    const base = { sets: { [ex.id]: 3 }, planned: { [ex.id]: 3 }, effort: 9 };
    const easy = suggestLoad(ex, loads, [s(at(10, 20), { ...base, feel: { [ex.id]: 'EASY' } })]);
    expect(easy?.kind).toBe('up');
    const hard = suggestLoad(ex, loads, [s(at(10, 20), { ...base, effort: 5, feel: { [ex.id]: 'HARD' } })]);
    expect(hard).toMatchObject({ kind: 'hold', value: 12 });
    const none = suggestLoad(ex, loads, [s(at(10, 20), base)]);
    expect(none?.kind).toBe('hold');
  });
});
