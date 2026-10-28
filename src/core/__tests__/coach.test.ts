import { describe, it, expect } from 'vitest';
import { COACH_SYSTEM, coachSummary, daysSince } from '../coach';
import { DEFAULT_GOALS } from '../goals';
import type { ClimbSession, SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 27, 10);
const session: SessionLogEntry = {
  date: new Date(2026, 9, 20, 18).toISOString(), mode: 'CAVE', circuitId: 'cave-05', circuitTitle: 'PULL + PUSH',
  energy: 'NORMAL', duration: 45, effort: 7, pain: 2,
  sets: { 'addon-weighted-pullup': 3, 'addon-russian-twist': 1, 'addon-hanging-oblique': 0, 'extra-band-lateral': 2 },
  planned: { 'addon-weighted-pullup': 3, 'addon-russian-twist': 2, 'addon-hanging-oblique': 2, 'extra-band-lateral': 2 },
  added: ['extra-band-lateral'], feel: { 'addon-weighted-pullup': 'RIGHT' },
};
// ASSESS: a ramp test has no plan, so its attempts never count as sets over the plan.
const assess: SessionLogEntry = {
  date: new Date(2026, 9, 4, 11).toISOString(), mode: 'TEST', circuitId: 'test-01', circuitTitle: 'ASSESS',
  energy: 'NORMAL', duration: 42, effort: 6, pain: 5, sets: { 'test-weighted-pullup': 5, 'test-hollow-hold': 1 }, planned: { 'test-hollow-hold': 1 },
};
const ring: SessionLogEntry = {
  date: new Date(2026, 9, 22, 8).toISOString(), mode: 'HEAL', circuitId: 'heal-03', circuitTitle: 'RING REHAB',
  energy: 'NORMAL', duration: 8, effort: 4, pain: 2, sets: { 'heal-ring-left': 3 }, planned: { 'heal-ring-left': 3 },
};
const climb: ClimbSession = {
  id: 'c', date: '2026-10-20', venue: 'GYM', discipline: 'BOULDER', durationMin: 90, effort: 7, tryHard: true,
  focusDone: ['silent-feet'],
  climbs: [{ grade: 'RED', attempts: 4, sent: false, tags: ['overhang', 'pinch'], why: ['backed-off'] }],
};

describe('the coach summary', () => {
  const text = coachSummary({
    sessionLog: [assess, session, ring], climbLog: [climb], activityLog: [{ id: 'h', date: '2026-10-24', type: 'HIKE', upM: 1100 }],
    loadLog: [
      { exerciseId: 'addon-weighted-pullup', exerciseName: 'Weighted Pull-Ups', date: '2026-10-06', value: 10, unit: 'kg' },
      { exerciseId: 'addon-weighted-pullup', exerciseName: 'Weighted Pull-Ups', date: '2026-10-20', value: 12.5, unit: 'kg' },
      { exerciseId: 'test-weighted-pullup', exerciseName: 'TEST — Weighted Pull-Up 2RM Ramp', date: '2026-10-04', value: 30, unit: 'kg' },
      { exerciseId: 'heal-ring-left', exerciseName: 'Ring Finger Lift - Left', date: '2026-10-22', value: 2.5, unit: 'kg' },
    ],
    benchmarkResults: [
      { benchmarkId: 'weighted-pullup-2rm', value: 141, date: '2026-09-17T10:00:00.000Z' },
      { benchmarkId: 'weighted-pullup-2rm', value: 149, date: '2026-10-04T10:00:00.000Z' },
      { benchmarkId: 'ring-finger-right', value: 9, date: '2026-10-16T10:00:00.000Z' },
    ],
    goals: DEFAULT_GOALS, healing: true, now: NOW,
    offDays: ['2026-10-10', '2026-08-01'], weekPlan: { 0: [{ kind: 'CLIMB' }], 2: [{ kind: 'SESSION', mode: 'CAVE', circuitId: 'cave-05' }] },
    note: 'Slept badly,\n  a trip in March.',
  });

  it('carries the goals, the season and the athlete\'s own read', () => {
    expect(text).toMatch(/Goals: boulder 7C then 8A, sport 7c then 8a/);
    expect(text).toMatch(/SEASON: \w+ phase/);
    expect(text).toMatch(/technique and feet first/);
    expect(text).toMatch(/INJURY: left ring finger healing/);
  });

  it('breaks every session down by exercise: sets, load, feel, skipped, cut short, added', () => {
    expect(text).toMatch(/- 2026-10-20 17:15-18:00, CAVE PULL \+ PUSH, NORMAL, deload week, 45 min, effort 7, pain 2, 6\/9 sets, cut short/);
    expect(text).toMatch(/Weighted Pull-Ups: 3\/3 @ 12.5 kg \(right\)/);
    expect(text).toMatch(/Russian Twist: 1\/2, cut short/);
    expect(text).toMatch(/Hanging Oblique \S.*: 0\/2, skipped/);
    expect(text).toMatch(/: 2\/2, added/);
  });

  it('counts ramp attempts apart, and keeps tests out of the loads', () => {
    expect(text).toMatch(/TEST ASSESS, NORMAL, 42 min, effort 6, pain 5, 1\/1 sets\n/);
    expect(text).toMatch(/5 attempts, best 30 kg/);
    expect(text).not.toMatch(/LOADS[\s\S]*TEST —[\s\S]*TESTS \(/);
  });

  it('lists loads, every test with the one before, the whole gap, and climbs with their tags', () => {
    expect(text).toMatch(/Weighted Pull-Ups: 10 to 12.5 kg, 2 sessions, best 12.5/);
    expect(text).toMatch(/Weighted pull-up 2RM: 149 % BW \(2026-10-04\); before 141 \(2026-09-17\)/);
    expect(text).toMatch(/GAP TO 7C:/);
    expect(text).toMatch(/- Two-arm max hang, 20mm half-crimp: untested; standard now/);
    expect(text).toMatch(/Red \(7A\+ to 7B\+\)\/4\/proj \[OVERHANG, PINCHES · fell: BACKED OFF\]/);
    expect(text).toMatch(/a 110% go, focus done: Silent feet/);
    expect(text).toMatch(/HEAD: a 110% go in 1 of 1/);
    expect(text).toMatch(/OUTSIDE: 2026-10-24 hike 1100 m up/);
  });

  it('follows the ring finger as a series, with the pain before each session', () => {
    expect(text).toMatch(/RING FINGER \(left: 3 x 12 working load/);
    expect(text).toMatch(/Right tested: 9 kg \(2026-10-16\)/);
    expect(text).toMatch(/- 2026-10-22 left 2.5 kg, 28%, pain before 2/);
  });

  it('carries the block, the season under a healing finger, rest days, the plan and the note', () => {
    expect(text).toMatch(/BLOCK: (build week \d of 3|deload week)/);
    expect(text).toMatch(/ATHLETE'S NOTE: Slept badly, a trip in March\./);
    expect(text).toMatch(/REST OR SICK DAYS: 2026-10-10\./);
    expect(text).toMatch(/WEEKLY PLAN: MON BOULDERING; WED CAVE 02 PULL \+ PUSH\./);
  });

  it('stays short enough to paste', () => {
    expect(text.length).toBeLessThan(12000);
    expect(COACH_SYSTEM).toMatch(/Suggest; the athlete decides/);
  });

  it('counts days since the last review', () => {
    expect(daysSince(null, NOW)).toBeNull();
    expect(daysSince(new Date(2026, 9, 20, 9).toISOString(), NOW)).toBe(7);
  });
});
