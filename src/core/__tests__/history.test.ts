import { describe, it, expect } from 'vitest';
import { filterDays, historyDays, patchSession, removeSession, setsLine } from '../history';
import type { ClimbSession, SessionLogEntry } from '../types';
import type { ActivitySession } from '../activity';

const session = (date: string, extra: Partial<SessionLogEntry> = {}): SessionLogEntry =>
  ({ date, mode: 'DAILY', circuitId: 'daily-01', circuitTitle: 'CORE + OBLIQUES', energy: 'NORMAL', duration: 14, ...extra });

describe('history', () => {
  it('merges the three logs newest first, grouped by day', () => {
    const climb: ClimbSession = { id: 'c1', date: '2026-10-20', venue: 'GYM', discipline: 'BOULDER', climbs: [
      { grade: 'GREEN', attempts: 1, sent: true }, { grade: 'BLUE', attempts: 3, sent: true }, { grade: 'RED', attempts: 5, sent: false },
    ] };
    const hike = { id: 'h1', date: '2026-10-18', type: 'HIKE', upM: 900 } as ActivitySession;
    const days = historyDays(
      [session(new Date(2026, 9, 20, 7).toISOString()), session(new Date(2026, 9, 21, 7).toISOString())],
      [climb],
      [hike],
    );
    expect(days.map(d => d.day)).toEqual(['2026-10-21', '2026-10-20', '2026-10-18']);
    expect(days[1].items.map(i => i.kind).sort()).toEqual(['CLIMB', 'SESSION']);
    const c = days[1].items.find(i => i.kind === 'CLIMB')!;
    expect(c.detail).toContain('3 climbs');
    expect(c.detail).toContain('best send Blue');
    expect(days[2].items[0].title).toBe('HIKE');
  });

  it('refers to a session by its place in the log', () => {
    const days = historyDays([session(new Date(2026, 9, 20, 7).toISOString())], [], []);
    expect(days[0].items[0].ref).toBe('0');
  });

  it('tells all sets from cut short', () => {
    expect(setsLine(session('x', { planned: { a: 3, b: 2 }, sets: { a: 3, b: 2 } }))).toBe('all sets');
    expect(setsLine(session('x', { planned: { a: 3, b: 2 }, sets: { a: 3, b: 0 } }))).toBe('3 of 5 sets');
    expect(setsLine(session('x'))).toBeNull();
  });
});

describe('removeSession', () => {
  it('takes the loads of that day with it, unless another session that day shares the exercise', () => {
    const d = new Date(2026, 9, 20, 7).toISOString();
    const log = [session(d, { sets: { a: 3, b: 2 } }), session(new Date(2026, 9, 20, 19).toISOString(), { sets: { b: 2 } })];
    const loads = [
      { exerciseId: 'a', exerciseName: 'A', date: '2026-10-20', value: 10, unit: 'kg' as const },
      { exerciseId: 'b', exerciseName: 'B', date: '2026-10-20', value: 12, unit: 'kg' as const },
      { exerciseId: 'a', exerciseName: 'A', date: '2026-10-13', value: 8, unit: 'kg' as const },
    ];
    const out = removeSession(log, loads, 0);
    expect(out.sessionLog).toHaveLength(1);
    expect(out.loadLog.map(l => `${l.exerciseId}${l.date}`)).toEqual(['b2026-10-20', 'a2026-10-13']);
  });

  it('patches only the named fields', () => {
    const log = [session('2026-10-20T07:00:00.000Z', { effort: 5 })];
    expect(patchSession(log, 0, { effort: 8 })[0]).toMatchObject({ effort: 8, duration: 14 });
  });
});

describe('filterDays', () => {
  const item = (kind: 'SESSION' | 'CLIMB' | 'ACTIVITY', ref: string) => ({ kind, day: '2026-10-20', at: '', ref, title: '', detail: '' });
  const days = [
    { day: '2026-10-21', items: [item('SESSION', '1')] },
    { day: '2026-10-20', items: [item('SESSION', '0'), item('CLIMB', 'c1')] },
  ];

  it('keeps everything with no filter', () => {
    expect(filterDays(days, null)).toBe(days);
  });

  it('keeps one kind and drops the days left empty', () => {
    const climbs = filterDays(days, 'CLIMB');
    expect(climbs).toHaveLength(1);
    expect(climbs[0].items.map(i => i.ref)).toEqual(['c1']);
    expect(filterDays(days, 'ACTIVITY')).toEqual([]);
  });
});
