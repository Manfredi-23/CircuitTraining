import { describe, it, expect } from 'vitest';
import {
  climbHeadline, coreHeadline, freshnessHeadline, liftHeadline, loadHeadline, oneArmHeadline, skippedHeadline,
  testsHeadline, workSplitHeadline,
} from '../stats-headlines';
import type { LoadLogEntry } from '../types';

const NOW = new Date(2026, 9, 22, 9);
const load = (id: string, date: string, value: number): LoadLogEntry => ({ exerciseId: id, exerciseName: 'Weighted Pull-Ups', date, value, unit: 'kg' });

describe('STATS headlines', () => {
  it('lifts: the biggest gain, with where it started', () => {
    expect(liftHeadline([])).toMatch(/No loads/);
    expect(liftHeadline([load('a', '2026-09-23', 10), load('a', '2026-10-20', 20)])).toBe('Weighted Pull-Ups up 10 kg, from 10 kg on 23 Sep.');
    expect(liftHeadline([load('a', '2026-09-23', 10), load('a', '2026-10-20', 10)])).toMatch(/held/);
  });

  it('work split: the most and the least', () => {
    const split = [
      { area: 'CORE' as const, sets: 39, share: 39, previousSets: 0 },
      { area: 'PULL' as const, sets: 9, share: 9, previousSets: 0 },
      { area: 'FINGERS' as const, sets: 0, share: 0, previousSets: 0 },
      { area: 'ARMS' as const, sets: 0, share: 0, previousSets: 0 },
    ];
    expect(workSplitHeadline(split)).toBe('Most of the work went to core (39%); nothing went to fingers.');
    expect(workSplitHeadline([])).toBeNull();
  });

  it('load: a ratio in words, or why there is none', () => {
    expect(loadHeadline(null)).toMatch(/Three weeks/);
    expect(loadHeadline({ acute: 1300, chronic: 1500, ratio: 0.87, zone: 'steady' })).toBe('This week is 87% of your usual weekly load: in line.');
  });

  it('freshness: what is fading', () => {
    expect(freshnessHeadline([{ capacity: 'contact', days: 30, graceDays: 10 }, { capacity: 'legs', days: 2, graceDays: 7 }])).toMatch(/^1 past its grace period/);
    expect(freshnessHeadline([{ capacity: 'legs', days: 2, graceDays: 7 }])).toMatch(/Everything trained/);
  });

  it('core: the group furthest behind', () => {
    expect(coreHeadline({ abs: 0, obliques: 10, back: 9 })).toBe('Abs: 0 of 12 hard sets this week, the furthest behind.');
    expect(coreHeadline({ abs: 12, obliques: 10, back: 9 })).toMatch(/All three/);
  });

  it('cut short: the worst one', () => {
    expect(skippedHeadline([])).toMatch(/Nothing/);
    expect(skippedHeadline([{ exerciseId: 'x', name: 'Band ER', planned: 6, short: 3, skipped: 1 }])).toBe('Band ER cut short most: 3 of 6 sessions in 90 days.');
  });

  it('one-arm path: open or how far', () => {
    expect(oneArmHeadline({ points: [], gates: [] })).toMatch(/No tested/);
    const gates = [
      { label: 'Assisted one-arms', value: 131, addedKg: 21, reached: true, projected: null },
      { label: 'One-arm negatives', value: 141, addedKg: 28, reached: false, projected: null },
    ];
    expect(oneArmHeadline({ points: [{ date: '2026-09-01', value: 135 }], gates })).toBe('135% of bodyweight tested; one-arm negatives opens at 141% (28 kg on the belt).');
  });

  it('tests: when the next ASSESS is due', () => {
    expect(testsHeadline([], NOW)).toMatch(/No ASSESS/);
    expect(testsHeadline([{ benchmarkId: 'max-pullups', value: 12, date: new Date(2026, 9, 1).toISOString() }], NOW)).toMatch(/next one around 19 Nov/);
    expect(testsHeadline([{ benchmarkId: 'max-pullups', value: 12, date: new Date(2026, 7, 1).toISOString() }], NOW)).toMatch(/retest is due/);
  });

  it('climbs: four weeks of sessions and the hardest send', () => {
    const c = { id: 'c', date: '2026-10-20', venue: 'GYM' as const, discipline: 'BOULDER' as const, climbs: [{ grade: 'BLUE', attempts: 2, sent: true }] };
    expect(climbHeadline([c], 'GYM', NOW)).toBe('1 session in four weeks; hardest send Blue.');
    expect(climbHeadline([], null, NOW)).toMatch(/No climbs/);
  });
});
