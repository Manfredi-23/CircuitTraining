import { describe, it, expect } from 'vitest';
import { getFreshness, getOneArmPath, getFingerWeeks, getSkipped } from '../insights';
import type { SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 8, 9, 0);

describe('freshness', () => {
  it('puts the stalest capacity, relative to its grace, first', () => {
    const rows = getFreshness({
      forearm: { xp: 0, lastTrained: new Date(2026, 9, 1).toISOString(), history: [] }, // 7 of 10
      pull: { xp: 0, lastTrained: new Date(2026, 9, 7).toISOString(), history: [] },    // 1 of 21
    }, NOW);
    expect(rows.slice(0, 2).map(r => r.capacity)).toEqual(['forearm', 'pull']);
    expect(rows[rows.length - 1].days).toBeNull();
  });
});

describe('one-arm path', () => {
  const r = (date: string, id: string, value: number) => ({ benchmarkId: id, value, date: `${date}T10:00:00.000Z` });

  it('converts old-method results and reports the kilos needed', () => {
    const p = getOneArmPath([r('2026-08-01', 'weighted-pullup', 128), r('2026-08-01', 'bodyweight', 60)]);
    expect(p.points[0].value).toBe(120);
    expect(p.gates[0]).toMatchObject({ value: 131, reached: false, addedKg: 19 });
  });

  it('projects a date from a rising trend over three weeks', () => {
    const p = getOneArmPath([r('2026-08-01', 'weighted-pullup-2rm', 115), r('2026-09-01', 'weighted-pullup-2rm', 120)]);
    expect(p.gates[0].projected).not.toBeNull();
    expect(p.gates[0].projected! > '2026-09-01').toBe(true);
  });

  it('draws no projection from a falling trend or too short a history', () => {
    expect(getOneArmPath([r('2026-08-01', 'weighted-pullup-2rm', 125), r('2026-09-01', 'weighted-pullup-2rm', 120)]).gates[0].projected).toBeNull();
    expect(getOneArmPath([r('2026-09-01', 'weighted-pullup-2rm', 115), r('2026-09-05', 'weighted-pullup-2rm', 120)]).gates[0].projected).toBeNull();
  });
});

const s = (date: Date, circuitId: string, extra: Partial<SessionLogEntry> = {}): SessionLogEntry => ({
  date: date.toISOString(), mode: 'CAVE', circuitId, circuitTitle: circuitId, energy: 'NORMAL', duration: 60, ...extra,
});

describe('finger weeks', () => {
  it('counts boulder days and finger sessions, and the highest pain', () => {
    const weeks = getFingerWeeks(
      [s(new Date(2026, 9, 6), 'cave-01', { pain: 2, effort: 8 }), s(new Date(2026, 9, 7), 'cave-06', { effort: 5 }), s(new Date(2026, 9, 8), 'cave-01', { pain: 4 })],
      [{ id: 'c', date: '2026-10-05', venue: 'BOARD', discipline: 'BOULDER', climbs: [], durationMin: 90, effort: 8 }],
      2, NOW,
    );
    // cave-06 (legs) does not load the fingers.
    expect(weeks[1]).toMatchObject({ monday: '2026-10-05', load: 8 * 60 + 7 * 60 + 8 * 90, maxPain: 4 });
  });
});

describe('cut short', () => {
  it('ranks by share of sessions cut short', () => {
    const rows = getSkipped([
      s(new Date(2026, 9, 1), 'cave-05', { planned: { a: 3, b: 3 }, sets: { a: 3, b: 1 } }),
      s(new Date(2026, 9, 5), 'cave-05', { planned: { a: 3, b: 3 }, sets: { a: 2 } }),
    ], 90, NOW);
    expect(rows.map(r => [r.exerciseId, r.short, r.skipped])).toEqual([['b', 2, 1], ['a', 1, 0]]);
  });
});
