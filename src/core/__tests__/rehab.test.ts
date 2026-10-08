import { describe, it, expect } from 'vitest';
import { getRingRecovery, goalKg, percentOf, RING_LEFT_EXERCISE, RING_RIGHT_BENCHMARK } from '../rehab';
import { suggestLoad } from '../progression';
import { getModeData } from '../data-index';
import type { LoadLogEntry, SessionLogEntry } from '../types';

const left = (date: string, value: number): LoadLogEntry =>
  ({ exerciseId: RING_LEFT_EXERCISE, exerciseName: 'Ring Finger Lift - Left', date, value, unit: 'kg' });
const right = (date: string, value: number) => ({ benchmarkId: RING_RIGHT_BENCHMARK, value, date: `${date}T10:00:00.000Z` });

describe('ring finger recovery', () => {
  it('reads the left as a percentage of the right', () => {
    expect(percentOf(3, 6)).toBe(50);
    expect(percentOf(3, null)).toBeNull();
  });

  it('sets the goal at 80%, rounded up to the half kilo', () => {
    expect(goalKg(6)).toBe(5);     // 4.8 -> 5
    expect(goalKg(7.5)).toBe(6);   // 6.0
  });

  it('is empty with nothing logged', () => {
    expect(getRingRecovery([], [])).toMatchObject({ right: null, left: null, pct: null, reached: false, points: [] });
  });

  it('tracks the latest left against the latest right, and calls 80% reached', () => {
    const r = getRingRecovery([left('2026-10-08', 2), left('2026-10-20', 5)], [right('2026-10-07', 6)]);
    expect(r.pct).toBe(83);
    expect(r.goalKg).toBe(5);
    expect(r.reached).toBe(true);
    expect(r.points.map(p => p.pct)).toEqual([33, 83]);
  });

  it('reads each left session against the right as it stood that day', () => {
    const r = getRingRecovery(
      [left('2026-10-08', 3), left('2026-10-30', 4)],
      [right('2026-10-07', 6), right('2026-10-29', 8)],
    );
    expect(r.points.map(p => p.pct)).toEqual([50, 50]);
    expect(r.pct).toBe(50);
  });
});

describe('ring finger load suggestion', () => {
  const ex = getModeData('HEAL').flatMap(c => c.exercises).find(e => e.id === RING_LEFT_EXERCISE)!;
  const done = (pain?: number): SessionLogEntry => ({
    date: '2026-10-08T18:00:00.000Z', mode: 'HEAL', circuitId: 'heal-03', circuitTitle: 'RING REHAB',
    energy: 'NORMAL', duration: 12, sets: { [ex.id]: 3 }, planned: { [ex.id]: 3 }, effort: 4,
    ...(pain !== undefined ? { pain } : {}),
  });

  it('adds half a kilo after a clean, pain-free 3 x 12', () => {
    expect(suggestLoad(ex, [left('2026-10-08', 2)], [done(1)])).toMatchObject({ kind: 'up', value: 2.5 });
  });

  it('holds when the finger hurt going in', () => {
    expect(suggestLoad(ex, [left('2026-10-08', 2)], [done(3)])).toMatchObject({ kind: 'hold', value: 2 });
  });
});
