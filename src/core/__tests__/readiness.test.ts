import { describe, it, expect } from 'vitest';
import {
  applyFingerCheck, applyReadiness, asksPainCheck, asksReadiness, buildList, loadsFingers,
  readinessBand, scaleExercise,
} from '../engine';
import { suggestLoad } from '../progression';
import { getModeData } from '../data-index';
import type { Exercise, Progress, SessionLogEntry } from '../types';

const cave = getModeData('CAVE');
const strong = cave.find(c => c.id === 'cave-01')!;
const power = cave.find(c => c.id === 'cave-07')!;
const full = cave.find(c => c.id === 'cave-08')!;
const legs = cave.find(c => c.id === 'cave-06')!;
const daily01 = getModeData('DAILY')[0];
const scale = (p: Progress = {}) => (e: Exercise) => scaleExercise(e, 'NORMAL', p);

describe('finger readiness', () => {
  it('has five bands', () => {
    expect([100, 80, 60, 40, 20].map(readinessBand)).toEqual(['full', 'cap', 'submax', 'nogrip', 'handsoff']);
  });

  it('is asked before sessions that load the fingers or hang from the hands', () => {
    expect(asksReadiness(strong)).toBe(true);
    expect(asksReadiness(power)).toBe(true);
    expect(asksReadiness(full)).toBe(true);
    expect(asksReadiness(cave.find(c => c.id === 'cave-05')!)).toBe(true);
    expect(asksPainCheck(cave.find(c => c.id === 'cave-05')!)).toBe(false);
    expect(asksReadiness(legs)).toBe(false);
    expect(asksReadiness(daily01)).toBe(false);
  });

  it('leaves the session alone at 100 and when not asked', () => {
    const list = buildList(strong, 'NORMAL', {});
    expect(applyReadiness(list, 100)).toEqual(list);
    expect(applyReadiness(list, null)).toEqual(list);
  });

  it('caps finger work at HARD and takes a set at 80', () => {
    const list = buildList(strong, 'NORMAL', {});
    const out = applyReadiness(list, 80);
    const hang = out.find(e => e.id === 'cave-max-hang')!;
    const before = list.find(e => e.id === 'cave-max-hang')!;
    expect(hang.appliedIntensity).toBe('HARD');
    expect(hang.scaledSets).toBe(before.scaledSets - 1);
    // Pulling is not finger work: untouched.
    expect(out.find(e => e.id === 'cave-weighted-pullup')).toEqual(list.find(e => e.id === 'cave-weighted-pullup'));
  });

  it('keeps finger work at MODERATE and drops maximal finger tests at 60', () => {
    const hang = applyReadiness(buildList(strong, 'NORMAL', {}), 60).find(e => e.id === 'cave-max-hang')!;
    expect(hang.appliedIntensity).toBe('MODERATE');
    const assess = buildList(getModeData('TEST')[0], 'NORMAL', {});
    const tested = applyReadiness(assess, 60);
    expect(tested.some(e => e.block === 'TEST' && e.intensity === 'MAX' && loadsFingers(e))).toBe(false);
    expect(applyReadiness(assess, 80).length).toBe(assess.length);
  });

  it('swaps finger work for its no-grip version at 40, or takes it out', () => {
    const list = buildList(full, 'NORMAL', {});
    const out = applyFingerCheck(list, { readiness: 40 }, full, scale());
    expect(out.some(e => e.id === 'full-suitcase-carry')).toBe(false);
    const carry = out.find(e => e.id === 'full-plate-carry');
    expect(carry).toBeDefined();
    expect(out.indexOf(carry!)).toBe(list.findIndex(e => e.id === 'full-suitcase-carry'));
    // Pulling stays at 40.
    expect(out.some(e => e.id === 'full-ring-row')).toBe(true);
    // No substitute: the hangs come out.
    const p = applyFingerCheck(buildList(power, 'NORMAL', {}), { readiness: 40 }, power, scale());
    expect(p.some(loadsFingers)).toBe(false);
    expect(p.some(e => e.id === 'power-explosive-pullup')).toBe(true);
  });

  it('rests the hands at 20: nothing hangs or pulls', () => {
    const out = applyFingerCheck(buildList(strong, 'NORMAL', {}), { readiness: 20 }, strong, scale());
    expect(out.some(loadsFingers)).toBe(false);
    expect(out.some(e => e.hangs || e.capacities.includes('pull'))).toBe(false);
    const legsDay = applyFingerCheck(buildList(full, 'NORMAL', {}), { readiness: 20 }, full, scale());
    expect(legsDay.some(e => e.id === 'full-front-squat')).toBe(true);
    expect(legsDay.some(e => e.id === 'full-plate-carry')).toBe(true);
  });

  it('lets the stricter of pain and readiness win', () => {
    const list = buildList(strong, 'NORMAL', {});
    // Pain 6 removes finger work even at full readiness.
    expect(applyFingerCheck(list, { pain: 6, readiness: 100 }).some(loadsFingers)).toBe(false);
    // Readiness 60 caps lower than pain 3 does.
    const hang = applyFingerCheck(list, { pain: 3, readiness: 60 }).find(e => e.id === 'cave-max-hang')!;
    expect(hang.appliedIntensity).toBe('MODERATE');
  });

  it('holds the next finger load after a session at 60% or less', () => {
    const hang = strong.exercises.find(e => e.id === 'cave-max-hang')!;
    const log = [{ exerciseId: hang.id, exerciseName: hang.name, date: '2026-10-06', value: 90, unit: '%' as const }];
    const s = (readiness: number): SessionLogEntry[] => [{
      date: '2026-10-06T17:00:00.000Z', mode: 'CAVE', circuitId: 'cave-01', circuitTitle: 'STRONG',
      energy: 'NORMAL', duration: 70, effort: 7, readiness,
      sets: { [hang.id]: 4 }, planned: { [hang.id]: 4 },
    }];
    expect(suggestLoad(hang, log, s(60))?.kind).toBe('hold');
    expect(suggestLoad(hang, log, s(100))?.kind).not.toBe('hold');
  });
});
