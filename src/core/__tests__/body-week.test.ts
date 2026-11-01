import { describe, it, expect } from 'vitest';
import { bodyWeek, statusFor, setsByArea, addsLine, afterLine, mainArea, servesArea, weekSets, BODY_AREAS, flagged } from '../body-week';
import { resolveSlots, pickOption, slotVariants, lastDoneMap } from '../slots';
import { exerciseLibrary } from '../reserve';
import { getModeData } from '../data-index';
import { buildList } from '../engine';
import type { ClimbSession, SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 29, 9, 0); // Thursday 29 Oct 2026
const at = (y: number, m: number, d: number, h = 8) => new Date(y, m, d, h).toISOString();
const entry = (date: string, sets: Record<string, number>, mode: SessionLogEntry['mode'] = 'DAILY'): SessionLogEntry =>
  ({ date, mode, circuitId: 'x', circuitTitle: 'x', energy: 'NORMAL', duration: 15, sets });

describe('BODY THIS WEEK', () => {
  it('reads status from the sets, the band and the day of the week', () => {
    expect(statusFor(0, [8, 20], 0)).toBe('ON TRACK');
    expect(statusFor(0, [8, 20], 3)).toBe('DUE');
    expect(statusFor(3, [8, 20], 3)).toBe('ON TRACK');
    expect(statusFor(8, [8, 20], 3)).toBe('ENOUGH');
    expect(statusFor(21, [8, 20], 3)).toBe('TOO MUCH');
  });

  it('counts this week only, by area, climbs for the fingers and the pull', () => {
    const log = [
      entry(at(2026, 9, 26), { 'daily-toe-taps': 3, 'daily-pushup': 4 }), // Monday
      entry(at(2026, 9, 25), { 'daily-toe-taps': 9 }), // Sunday before: not this week
    ];
    const climbs = [{ date: '2026-10-27', venue: 'GYM', discipline: 'BOULDER', climbs: [] } as unknown as ClimbSession];
    const { sets, climbs: n, dayIndex } = weekSets(log, climbs, NOW);
    expect(sets.FEET).toBe(3);
    expect(sets.PUSH).toBe(4);
    expect(sets.FINGERS).toBe(4);
    expect(sets.PULL).toBe(2);
    expect(n).toBe(1);
    expect(dayIndex).toBe(3);
  });

  it('shows every area, says HEALING while a finger heals, and flags what is due', () => {
    const log = [entry(at(2026, 9, 27), { 'heal-back-squat': 3 }, 'HEAL')];
    const week = bodyWeek({ sessionLog: log, climbLog: [], progress: {}, now: NOW });
    expect(week.map(w => w.area)).toEqual(BODY_AREAS);
    expect(week.find(w => w.area === 'FINGERS')!.status).toBe('HEALING');
    expect(week.find(w => w.area === 'PULL')!.status).toBe('HEALING');
    expect(flagged(week).map(w => w.area)).toContain('FEET');
  });

  it('says RECOVERING inside 48h of a hard finger session', () => {
    const progress = { crimp: { xp: 10, lastTrained: at(2026, 9, 28, 18), lastHard: at(2026, 9, 28, 18), history: [] } };
    const fingers = bodyWeek({ sessionLog: [], climbLog: [], progress, now: NOW }).find(w => w.area === 'FINGERS')!;
    expect(fingers.status).toBe('RECOVERING');
    expect(fingers.detail).toMatch(/^ready/);
  });

  it('says what a session adds, and the week after it', () => {
    const d7 = buildList(getModeData('DAILY').find(c => c.id === 'daily-07')!, 'NORMAL', {});
    const adds = setsByArea(d7);
    expect(adds.FEET).toBeGreaterThan(0);
    expect(mainArea(adds)).toBe('FEET');
    expect(addsLine(adds)).toMatch(/^FEET \d+/);
    const week = bodyWeek({ sessionLog: [], climbLog: [], progress: {}, now: NOW });
    expect(afterLine(week, adds)).toMatch(/^FEET \d+ of 8/);
  });

  it('lists what serves an area, most first', () => {
    const cands = getModeData('DAILY').map(c => ({ item: c.id, list: buildList(c, 'NORMAL', {}) }));
    const feet = servesArea('FEET', cands).map(s => s.item);
    expect(feet.slice(0, 2).sort()).toEqual(['daily-06', 'daily-07']);
  });
});

describe('choice slots', () => {
  const lib = exerciseLibrary();
  const taps = lib.get('daily-toe-taps')!;

  it('runs the option done least recently, never-done first, the written one on a tie', () => {
    expect(pickOption(taps, new Map())).toBe('daily-toe-taps');
    const last = lastDoneMap([entry(at(2026, 9, 20), { 'daily-toe-taps': 3 })]);
    expect(pickOption(taps, last)).toBe('feet-step-down-mark');
  });

  it('resolves a session, naming the job and the other choices', () => {
    const d6 = getModeData('DAILY').find(c => c.id === 'daily-06')!;
    const log = [entry(at(2026, 9, 20), { 'daily-toe-taps': 3 }), entry(at(2026, 9, 22), { 'feet-step-down-mark': 3 })];
    const r = resolveSlots(d6, log);
    const slot = r.exercises.find(e => e.slot === 'FOOT PLACEMENT')!;
    expect(slot.id).toBe('feet-shift-place');
    expect(slot.options).toEqual(['daily-toe-taps', 'feet-step-down-mark']);
    expect(resolveSlots(d6, []).exercises.find(e => e.slot)?.id).toBe('daily-toe-taps');
  });

  it('gives a variant per option for the time budgets', () => {
    const d6 = getModeData('DAILY').find(c => c.id === 'daily-06')!;
    expect(slotVariants(d6)).toHaveLength(3);
  });
});
