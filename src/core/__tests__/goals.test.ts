import { describe, it, expect } from 'vitest';
import {
  DEFAULT_GOALS, colourFont, goalLadder, loggedGrade, observedMonthsPerStep, withGoalDefaults, workingGrade,
} from '../goals';
import { boulderGap } from '../gap';
import type { BenchmarkResult, ClimbSession } from '../types';

const boulder = (date: string, venue: 'GYM' | 'BOARD' | 'OUTDOOR', grades: [string, boolean][]): ClimbSession => ({
  id: `${date}-${venue}`, date, venue, discipline: 'BOULDER',
  climbs: grades.map(([grade, sent]) => ({ grade, attempts: 2, sent })),
});
const rope = (date: string, grades: [string, boolean][]): ClimbSession => ({
  id: `${date}-rope`, date, venue: 'GYM', discipline: 'ROPE',
  climbs: grades.map(([grade, sent]) => ({ grade, attempts: 2, sent })),
});
const TODAY = '2026-10-27';

describe('the working grade', () => {
  it('reads a gym colour as the bottom of its band', () => {
    expect(colourFont('RED')).toBe('7A+');
    expect(colourFont('BLUE')).toBe('6C');
    expect(colourFont('YELLOW')).toBe('4+');
    expect(colourFont('NOPE')).toBeNull();
  });

  it('needs two boulder sends in four months, and harder sends count for easier grades', () => {
    expect(loggedGrade([boulder('2026-10-01', 'OUTDOOR', [['7B', true]])], 'BOULDER', TODAY)).toBeNull();
    const log = [boulder('2026-10-01', 'OUTDOOR', [['7B', true]]), boulder('2026-10-10', 'BOARD', [['7A+', true], ['7C', false]])];
    expect(loggedGrade(log, 'BOULDER', TODAY)).toBe('7A+');
    // Old sends fall out of the window.
    expect(loggedGrade(log, 'BOULDER', '2027-06-01')).toBeNull();
  });

  it('never drops below the profile: 7A boulder, 7a sport', () => {
    expect(workingGrade([], 'BOULDER', TODAY)).toBe('7A');
    expect(workingGrade([boulder('2026-10-01', 'GYM', [['BLUE', true], ['BLUE', true]])], 'BOULDER', TODAY)).toBe('7A');
    expect(workingGrade([boulder('2026-10-01', 'GYM', [['RED', true], ['RED', true]])], 'BOULDER', TODAY)).toBe('7A+');
    expect(workingGrade([rope('2026-09-01', [['7b', true]])], 'SPORT', TODAY)).toBe('7b');
  });

  it('keeps boulders and routes apart', () => {
    expect(loggedGrade([rope('2026-10-01', [['7c', true], ['7c', true]])], 'BOULDER', TODAY)).toBeNull();
  });
});

describe('the ladder', () => {
  it('runs a grade at a time from the working grade to the final goal, slower above 7B+', () => {
    const l = goalLadder(DEFAULT_GOALS, [], 'BOULDER', TODAY);
    expect(l.working).toBe('7A');
    expect(l.from).toBe('profile');
    expect(l.rate).toBe('typical');
    expect(l.milestones.map(m => m.grade)).toEqual(['7A+', '7B', '7B+', '7C', '7C+', '8A']);
    expect(l.milestones.find(m => m.isNext)?.grade).toBe('7C');
    expect(l.milestones.at(-1)?.isFinal).toBe(true);
    const gaps = l.milestones.map((m, i) => m.months - (l.milestones[i - 1]?.months ?? 0));
    expect(gaps[0]).toBe(4);
    expect(gaps[4]).toBeGreaterThan(gaps[2]);
    expect(l.milestones[0].eta).toMatch(/^\d{4}-\d{2}-01$/);
  });

  it('takes the athlete\'s own rate once grades are gained', () => {
    const log = [
      boulder('2026-01-10', 'OUTDOOR', [['6C', true], ['6C', true]]),
      boulder('2026-10-01', 'OUTDOOR', [['7A+', true], ['7A+', true]]),
    ];
    // 6C to 7A+ is three grades in about nine months.
    const rate = observedMonthsPerStep(log, 'BOULDER', TODAY);
    expect(rate).toBeGreaterThanOrEqual(2);
    expect(rate).toBeLessThan(5);
    expect(goalLadder(DEFAULT_GOALS, log, 'BOULDER', TODAY).rate).toBe('yours');
    expect(observedMonthsPerStep([], 'BOULDER', TODAY)).toBeNull();
  });

  it('says when the next goal is reached', () => {
    const goals = withGoalDefaults({ boulder: { next: '7A', final: '7B' } });
    expect(goalLadder(goals, [], 'BOULDER', TODAY).nextReached).toBe(true);
  });

  it('repairs stored goals', () => {
    expect(withGoalDefaults(undefined)).toEqual(DEFAULT_GOALS);
    expect(withGoalDefaults({ boulder: { next: 'XX', final: '8A' } }).boulder.next).toBe('7C');
    expect(withGoalDefaults({ event: { date: '2027-04-01', label: '' } }).event).toEqual({ date: '2027-04-01', label: 'Trip' });
    expect(withGoalDefaults({ event: { date: 'soon', label: 'x' } }).event).toBeUndefined();
  });
});

describe('the gap', () => {
  const r = (benchmarkId: string, value: number): BenchmarkResult => ({ benchmarkId, value, date: '2026-09-17T10:00:00.000Z' });

  it('reads tests against the working grade, the next goal and the final one', () => {
    const gap = boulderGap(DEFAULT_GOALS, '7A', [r('bodyweight', 62), r('weighted-pullup-2rm', 141), r('fs-2arm-20mm', 160)]);
    const pull = gap.rows.find(x => x.benchmarkId === 'weighted-pullup-2rm')!;
    expect(pull).toMatchObject({ now: 132, next: 150, final: 165, status: 'short' });
    // 9 points of 62 kg is about 5.5 kg on the belt.
    expect(pull.addKg).toBe(5.5);
    const fingers = gap.rows.find(x => x.benchmarkId === 'fs-2arm-20mm')!;
    expect(fingers).toMatchObject({ now: 140, next: 158, final: 170, status: 'next', approximate: false });
    expect(gap.strengthReady).toBe(false);
    expect(gap.headline).toMatch(/One gap to 7C/);
  });

  it('says when strength is not what stands in the way', () => {
    const gap = boulderGap(DEFAULT_GOALS, '7A', [r('weighted-pullup-2rm', 152), r('fs-2arm-20mm', 160)]);
    expect(gap.strengthReady).toBe(true);
    expect(gap.headline).toMatch(/on the wall/);
  });

  it('shows untested tests, and the front lever only once recorded', () => {
    const gap = boulderGap(DEFAULT_GOALS, '7A', []);
    expect(gap.rows.map(x => x.status)).toEqual(['untested', 'untested']);
    expect(gap.headline).toMatch(/Nothing tested yet/);
    expect(boulderGap(DEFAULT_GOALS, '7A', [r('front-lever', 2)]).rows).toHaveLength(3);
  });
});

describe('the headline', () => {
  it('says when each next goal is due', async () => {
    const { goalHeadline } = await import('../goals');
    const h = goalHeadline(goalLadder(DEFAULT_GOALS, [], 'BOULDER', TODAY), goalLadder(DEFAULT_GOALS, [], 'SPORT', TODAY));
    expect(h).toMatch(/^7C boulder around \w{3} \d{4}; 7c sport around \w{3} \d{4}\.$/);
  });
});
