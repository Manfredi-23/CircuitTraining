import { describe, it, expect } from 'vitest';
import { COACH_SYSTEM, coachSummary, daysSince } from '../coach';
import { DEFAULT_GOALS } from '../goals';
import type { ClimbSession, SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 27, 10);
const session: SessionLogEntry = {
  date: new Date(2026, 9, 20, 18).toISOString(), mode: 'CAVE', circuitId: 'cave-05', circuitTitle: 'PULL + PUSH',
  energy: 'NORMAL', duration: 45, effort: 7, pain: 2, sets: { a: 3, b: 2 }, planned: { a: 3, b: 3 },
};
const climb: ClimbSession = {
  id: 'c', date: '2026-10-20', venue: 'GYM', discipline: 'BOULDER', durationMin: 90, effort: 7, tryHard: true,
  focusDone: ['silent-feet'],
  climbs: [{ grade: 'RED', attempts: 4, sent: false, tags: ['overhang', 'pinch'], why: ['backed-off'] }],
};

describe('the coach summary', () => {
  const text = coachSummary({
    sessionLog: [session], climbLog: [climb], activityLog: [{ id: 'h', date: '2026-10-24', type: 'HIKE', upM: 1100 }],
    loadLog: [
      { exerciseId: 'addon-weighted-pullup', exerciseName: 'Weighted Pull-Ups', date: '2026-10-06', value: 10, unit: 'kg' },
      { exerciseId: 'addon-weighted-pullup', exerciseName: 'Weighted Pull-Ups', date: '2026-10-20', value: 12.5, unit: 'kg' },
    ],
    benchmarkResults: [{ benchmarkId: 'weighted-pullup-2rm', value: 141, date: '2026-09-17T10:00:00.000Z' }],
    goals: DEFAULT_GOALS, healing: true, now: NOW,
  });

  it('carries the goals, the season and the athlete\'s own read', () => {
    expect(text).toMatch(/Goals: boulder 7C then 8A, sport 7c then 8a/);
    expect(text).toMatch(/SEASON: \w+ phase/);
    expect(text).toMatch(/technique and feet first/);
    expect(text).toMatch(/INJURY: left ring finger healing/);
  });

  it('lists sessions, loads, tests and climbs with their tags', () => {
    expect(text).toMatch(/2026-10-20 CAVE PULL \+ PUSH, 45 min, effort 7, pain 2, 5\/6 sets/);
    expect(text).toMatch(/Weighted Pull-Ups: 10 to 12.5 kg/);
    expect(text).toMatch(/Weighted pull-up 2RM 141 % BW/);
    expect(text).toMatch(/GAP TO 7C:/);
    expect(text).toMatch(/Red\/4\/proj \[OVERHANG, PINCHES · fell: BACKED OFF\]/);
    expect(text).toMatch(/a 110% go, focus done: Silent feet/);
    expect(text).toMatch(/HEAD: a 110% go in 1 of 1/);
    expect(text).toMatch(/OUTSIDE: 2026-10-24 hike 1100 m up/);
  });

  it('stays short enough to paste', () => {
    expect(text.length).toBeLessThan(6000);
    expect(COACH_SYSTEM).toMatch(/Suggest; the athlete decides/);
  });

  it('counts days since the last review', () => {
    expect(daysSince(null, NOW)).toBeNull();
    expect(daysSince(new Date(2026, 9, 20, 9).toISOString(), NOW)).toBe(7);
  });
});
