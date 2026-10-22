import { describe, it, expect } from 'vitest';
import { railLine, weekRail } from '../week-rail';
import type { SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 22, 9); // Thursday 22 Oct 2026
const s = (d: number): SessionLogEntry => ({ date: new Date(2026, 9, d, 7).toISOString(), mode: 'DAILY', circuitId: 'daily-01', circuitTitle: 'x', energy: 'NORMAL', duration: 12 });

describe('week rail', () => {
  it('runs Monday to Sunday with today marked and the plan ahead', () => {
    const days = weekRail(
      [s(19), s(19), s(21)],
      [{ id: 'c', date: '2026-10-20', venue: 'GYM', discipline: 'BOULDER', climbs: [] }],
      [],
      { 4: [{ kind: 'SESSION', mode: 'DAILY', circuitId: 'daily-02' }], 6: [{ kind: 'REST' }] },
      NOW,
    );
    expect(days.map(d => d.letter).join('')).toBe('MTWTFSS');
    expect(days[0]).toMatchObject({ date: '2026-10-19', sessions: 2 });
    expect(days[1].climbs).toBe(1);
    expect(days[3].today).toBe(true);
    expect(days[4]).toMatchObject({ future: true, planned: 1 });
    expect(days[6].restPlanned).toBe(true);
    expect(railLine(days)).toBe('3 sessions, 1 climb so far this week.');
  });

  it('says so when the week is empty', () => {
    expect(railLine(weekRail([], [], [], {}, NOW))).toMatch(/Nothing logged/);
  });
});
