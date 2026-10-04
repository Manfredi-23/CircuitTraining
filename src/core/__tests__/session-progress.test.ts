import { describe, it, expect } from 'vitest';
import { sessionProgress } from '../session-progress';
import type { ScaledExercise } from '../types';

const ex = (scaledSets: number, ramp?: ScaledExercise['ramp']) =>
  ({ scaledSets, ramp }) as ScaledExercise;

describe('sessionProgress', () => {
  const list = [ex(2), ex(3), ex(1)];

  it('draws one cell per set, grouped by exercise', () => {
    const p = sessionProgress(list, 0, 1);
    expect(p.groups.map(g => g.length)).toEqual([2, 3, 1]);
    expect(p.setsTotal).toBe(6);
    expect(p.setsDone).toBe(0);
    expect(p.groups[0]).toEqual(['current', 'todo']);
  });

  it('counts earlier exercises and earlier sets as done', () => {
    const p = sessionProgress(list, 1, 3);
    expect(p.groups).toEqual([
      ['done', 'done'],
      ['done', 'done', 'current'],
      ['todo'],
    ]);
    expect(p.setsDone).toBe(4);
  });

  it('grows a ramp past its expected attempts, up to the hard stop', () => {
    const ramps = [ex(3, { maxAttempts: 5, startBelow: 0 })];
    expect(sessionProgress(ramps, 0, 2).groups[0]).toHaveLength(3);
    expect(sessionProgress(ramps, 0, 4).groups[0]).toEqual(['done', 'done', 'done', 'current']);
    expect(sessionProgress(ramps, 0, 9).groups[0]).toHaveLength(5);
  });

  it('never draws an exercise with no cells', () => {
    expect(sessionProgress([ex(0)], 0, 1).groups[0]).toEqual(['current']);
  });
});
