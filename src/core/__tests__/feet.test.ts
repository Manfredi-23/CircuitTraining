import { describe, it, expect } from 'vitest';
import { FEET_EXERCISES } from '../data-feet';
import { getModeData } from '../data-index';
import { getProtocol } from '../protocols';
import { exerciseLibrary, reserveEntry, reserveFor } from '../reserve';
import { areaOf } from '../review';
import { PACKS, packsFor } from '../session-edit';
import { buildCustom, BUILT_IN_PRESETS, GOALS } from '../custom';
import { buildList, estimateDuration, loadsFingers } from '../engine';
import { NO_DAY } from '../today';
import { isHomeExercise } from '../routines';
import { phasesOf } from '../phases';
import { getLoadAxis, formatLoad } from '../load';
import { suggestLoad, isPersonalBest } from '../progression';
import { getBenchmark } from '../benchmarks';
import { WALL_DRILLS } from '../wall';
import type { Exercise } from '../types';

const lib = exerciseLibrary();

describe('the feet catalogue (v43)', () => {
  it('has twenty exercises, each complete, each in the library', () => {
    expect(FEET_EXERCISES).toHaveLength(20);
    for (const e of FEET_EXERCISES) {
      expect(lib.get(e.id), e.id).toBeDefined();
      expect(e.progression.length, e.id).toBeGreaterThan(10);
      expect(e.form, e.id).toBeDefined();
      expect(getProtocol(e.protocolId), e.id).not.toBeNull();
      if (e.variations) expect(e.variations[0].minLevel, e.id).toBe(1);
    }
  });

  it('keeps the hands free or flat: nothing grips, pulls or loads the fingers', () => {
    for (const e of FEET_EXERCISES) {
      expect(loadsFingers(e), e.id).toBe(false);
      expect(e.capacities.includes('pull'), e.id).toBe(false);
      expect(reserveEntry(e.id)?.grip ?? false, e.id).toBe(false);
    }
  });

  it('gives every skill drill an external-focus cue', () => {
    for (const e of FEET_EXERCISES.filter(x => x.intensity === 'TECHNIQUE')) {
      expect(e.fixed, e.id).toBe(true);
      expect(e.focus, e.id).toBeTruthy();
    }
  });

  it('files feet work under FEET, and the strength work under LEGS', () => {
    expect(areaOf(lib.get('feet-wall-high-step')!)).toBe('FEET');
    expect(areaOf(lib.get('feet-tibialis-raise')!)).toBe('FEET');
    expect(areaOf(lib.get('legs-toe-drag')!)).toBe('FEET');
    expect(areaOf(lib.get('feet-box-pistol')!)).toBe('LEGS');
  });

  it('offers FEET in the reserve, home kit at home, and the sit-back only at the gym', () => {
    const base = { mode: 'DAILY' as const, circuitId: 'daily-01', list: [], pain: null, sessionLog: [] };
    const home = reserveFor(base).FEET.map(i => i.exercise.id);
    expect(home).toContain('feet-step-down-mark');
    expect(home).not.toContain('feet-toe-hook-situp');
    const gym = reserveFor({ ...base, mode: 'CAVE', circuitId: 'cave-06' }).FEET.map(i => i.exercise.id);
    expect(gym).toContain('feet-toe-hook-situp');
    expect(isHomeExercise('feet-wall-high-step')).toBe(true);
  });

  it('adds the FEET and HOOKS packs, open while a finger heals', () => {
    expect(PACKS.map(p => p.id)).toEqual(expect.arrayContaining(['feet', 'hooks']));
    const ctx = { place: 'HOME' as const, mode: 'DAILY' as const, healing: true, pain: null, noKit: false };
    const feet = packsFor(ctx, []).find(o => o.pack.id === 'feet')!;
    expect(feet.ids).toHaveLength(4);
    expect(feet.caution).toBeNull();
  });

  it('builds the FOOTWORK preset at home, and HOOKS as a goal', () => {
    expect(GOALS).toContain('HOOKS');
    const preset = BUILT_IN_PRESETS.find(p => p.id === 'footwork')!;
    const s = buildCustom({
      place: preset.place, minutes: preset.minutes, include: preset.include, exclude: [], avoid: [],
      sessionLog: [], healing: true, pain: null, day: NO_DAY, energy: 'NORMAL', progress: {}, benchmarkResults: [], tweaks: {},
    });
    expect(s.list.some(e => e.protocolId === 'hook-strength')).toBe(true);
    expect(s.list.some(e => areaOf(e) === 'FEET')).toBe(true);
    expect(s.duration).toBeLessThanOrEqual(30);
  });
});

describe('the sessions that carry it', () => {
  const daily = getModeData('DAILY');
  const cave = getModeData('CAVE');

  it('DAILY 07 HOOKS + HIGH FEET: home kit, nothing curls, the high step early', () => {
    const d7 = daily.find(c => c.id === 'daily-07')!;
    expect(d7.title).toBe('HOOKS + HIGH FEET');
    expect(d7.recoveryHours).toBe(0);
    for (const e of d7.exercises) expect(isHomeExercise(e.id), e.id).toBe(true);
    expect(d7.exercises.some(e => e.id === 'feet-toe-hook-situp')).toBe(false);
    expect(phasesOf(d7.exercises).indexOf('SKILL')).toBeLessThan(phasesOf(d7.exercises).indexOf('STRENGTH'));
    expect(estimateDuration(buildList(d7, 'FRESH', {}))).toBeLessThanOrEqual(20);
  });

  it('puts the skill work straight after the warm-up in CAVE and HEAL', () => {
    for (const c of [...cave, ...getModeData('HEAL').filter(h => ['heal-01', 'heal-02'].includes(h.id))]) {
      const phases = phasesOf(c.exercises);
      const firstSkill = phases.indexOf('SKILL');
      if (firstSkill < 0) continue;
      // Power may lead (fast and fresh); strength and core come after the skill.
      const firstWork = phases.findIndex(p => p === 'STRENGTH' || p === 'CORE');
      expect(firstSkill, c.id).toBeLessThan(firstWork);
    }
  });

  it('opens CAVE 03 with the high step and the edge', () => {
    const c3 = cave.find(c => c.id === 'cave-06')!;
    expect(c3.exercises.slice(0, 2).map(e => e.id)).toEqual(['feet-wall-high-step', 'feet-edge-stand']);
  });
});

describe('scored skill drills', () => {
  const taps = lib.get('daily-toe-taps')!;

  it('log clean reps out of the set', () => {
    const axis = getLoadAxis(taps)!;
    expect(axis.unit).toBe('clean');
    expect(axis.max).toBe(taps.work);
    expect(formatLoad(6, axis)).toBe('6 CLEAN');
  });

  it('never suggest a load, but a better score is a best', () => {
    const log = [{ exerciseId: taps.id, exerciseName: taps.name, value: 5, unit: 'clean' as const, date: '2026-10-01' }];
    const sessions = [{ date: '2026-10-01T07:00:00Z', mode: 'DAILY' as const, circuitId: 'daily-06', circuitTitle: 'x', energy: 'NORMAL' as const, duration: 15, sets: { [taps.id]: 3 }, planned: { [taps.id]: 3 }, effort: 4 }];
    expect(suggestLoad(taps, log, sessions)).toBeNull();
    expect(isPersonalBest(taps, 7, log, '2026-10-08')).toBe(true);
  });
});

describe('ASSESS: the FEET section', () => {
  const assess = getModeData('TEST')[0];
  const feet = assess.exercises.filter((e: Exercise) => e.section === 'FEET');

  it('scores the foot raise, foot loading, hips, ankle, balance and precision', () => {
    expect(feet.map(e => e.records?.benchmarkId)).toEqual([
      'hip-footraise', 'foot-loading', 'hips-from-wall', 'knee-to-wall', 'sl-balance-closed', 'toe-tap-precision',
    ]);
    for (const e of feet) expect(getBenchmark(e.records!.benchmarkId), e.id).not.toBeNull();
    expect(getBenchmark('hips-from-wall')!.better).toBe('lower');
  });

  it('comes before anything heavy', () => {
    const first = assess.exercises.findIndex(e => e.section === 'MAX STRENGTH');
    const last = assess.exercises.map(e => e.section).lastIndexOf('FEET');
    expect(last).toBeLessThan(first);
  });
});

describe('ON THE WALL', () => {
  it('has the drills from the research', () => {
    const ids = WALL_DRILLS.map(d => d.id);
    for (const id of ['target-practice', 'tracking', 'pause-place', 'foot-swaps', 'flag-check', 'toe-pull']) expect(ids).toContain(id);
  });
});
