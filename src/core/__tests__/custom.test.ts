import { describe, it, expect } from 'vitest';
import {
  areaNeeds, buildCustom, buildWarnings, closedAreas, cycleTarget, flagsOf, makePreset, presetName, suggestAreas, touches,
  BUILT_IN_PRESETS, CUSTOM_TIMES, type CustomInput,
} from '../custom';
import { isCurl, exerciseLibrary } from '../reserve';
import { loadsFingers } from '../engine';
import { NO_DAY } from '../today';
import { useStore } from '../../store/store';
import { PERSISTED_KEYS } from '../backup';
import type { EnergyKey, Progress, SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 15, 7, 0); // Thursday 15 Oct 2026
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86400000).toISOString();
const base: CustomInput = {
  place: 'HOME', minutes: 20, include: ['CORE'], energy: 'NORMAL', progress: {}, benchmarkResults: [],
  tweaks: {}, sessionLog: [], healing: false, pain: null, day: NO_DAY,
};
const ENERGIES: EnergyKey[] = ['FRESH', 'NORMAL', 'TIRED'];
const lib = exerciseLibrary();

describe('a custom session', () => {
  it('fits the time at every energy, never shortening a rest', () => {
    for (const place of ['HOME', 'GYM'] as const) {
      for (const minutes of CUSTOM_TIMES) {
        for (const energy of ENERGIES) {
          const groups = place === 'HOME' ? ['CORE', 'LEGS'] as const : ['PULL', 'LEGS', 'CORE'] as const;
          const s = buildCustom({ ...base, place, minutes, energy, include: [...groups] });
          const working = s.list.filter(e => e.block !== 'WARMUP' && e.id !== 'morn-catcow');
          expect(working.length).toBeGreaterThan(0);
          // A cap below the shortest real session still gives one exercise.
          if (working.length > 1) expect(s.duration).toBeLessThanOrEqual(minutes);
          for (const e of s.list) expect(e.scaledRest).toBeGreaterThanOrEqual(Math.round(e.restSec * 0.5));
        }
      }
    }
  });

  it('opens with cat-cow at home, the pulse raiser at the gym, and closes on the curls', () => {
    const home = buildCustom({ ...base, minutes: 30, include: ['CORE', 'SHOULDERS'] });
    expect(home.list[0].id).toBe('morn-catcow');
    const firstCurl = home.list.findIndex(e => isCurl(e.id));
    if (firstCurl >= 0) expect(home.list.slice(firstCurl).every(e => isCurl(e.id))).toBe(true);
    const gym = buildCustom({ ...base, place: 'GYM', minutes: 45, include: ['PULL', 'LEGS'] });
    expect(gym.list[0].id).toBe('cave-warmup-pulse');
    expect(gym.list.some(e => e.capacities.includes('pull'))).toBe(true);
    expect(gym.list.some(e => e.capacities.includes('legs'))).toBe(true);
    expect(gym.circuit.stacksOnSession).toBe(true);
    expect(home.circuit.recoveryHours).toBe(0);
  });

  it('uses only home kit at home and takes turns between areas', () => {
    const s = buildCustom({ ...base, minutes: 30, include: ['LEGS', 'MOBILITY'] });
    const ids = s.list.map(e => e.id);
    for (const gymOnly of ['heal-step-up', 'addon-goblet-squat', 'heal-nordic-curl', 'legs-toe-drag']) expect(ids).not.toContain(gymOnly);
    expect(s.list.some(e => e.block === 'MOBILITY' && e.id !== 'morn-catcow')).toBe(true);
    expect(s.list.some(e => e.capacities[0] === 'legs')).toBe(true);
  });

  it('picks the least recently done first', () => {
    const log: SessionLogEntry[] = [{
      date: daysAgo(1), mode: 'DAILY', circuitId: 'daily-05', circuitTitle: 'x', energy: 'NORMAL', duration: 10,
      sets: { 'daily-bw-squat': 3 },
    }];
    const s = buildCustom({ ...base, minutes: 10, include: ['LEGS'], sessionLog: log });
    expect(s.list.map(e => e.id)).not.toContain('daily-bw-squat');
  });

  it('grips nothing and loads no finger while a finger heals', () => {
    const s = buildCustom({ ...base, place: 'GYM', minutes: 60, include: ['CORE', 'SHOULDERS', 'FINGERS', 'PULL'], healing: true });
    expect(closedAreas({ ...base, place: 'GYM', healing: true }).FINGERS).toBeTruthy();
    for (const e of s.list) {
      expect(loadsFingers(e)).toBe(false);
      expect(['addon-weighted-pullup', 'cave-lockoff', 'addon-hanging-oblique', 'morn-pullapart']).not.toContain(e.id);
    }
  });

  it('closes what is sore, and the pull at home', () => {
    const c = closedAreas({ ...base, day: { ...NO_DAY, sore: ['LEGS', 'SHOULDERS'] }, pain: 4 });
    expect(Object.keys(c).sort()).toEqual(['CHEST', 'FINGERS', 'LEGS', 'PULL', 'PULL POWER', 'PUSH POWER', 'ROCKOVER', 'SHOULDERS']);
    const s = buildCustom({ ...base, include: ['LEGS', 'CORE'], day: { ...NO_DAY, sore: ['LEGS'] } });
    expect(s.list.every(e => e.capacities[0] !== 'legs' || e.block === 'MOBILITY')).toBe(true);
  });

  it('keeps to the mat with no kit', () => {
    const s = buildCustom({ ...base, minutes: 30, include: ['CORE', 'LEGS', 'SHOULDERS'], day: { ...NO_DAY, noKit: true } });
    for (const e of s.list) expect(['bodyweight', 'rpe']).toContain(lib.get(e.id)!.load.kind);
  });
});

describe('goals, exclusions and avoid', () => {
  const ids = (input: Partial<CustomInput>) => buildCustom({ ...base, ...input }).list.map(e => e.id);

  it('puts the key lift first: the weighted pull-up opens PULL POWER, gated rungs substituted', () => {
    const s = buildCustom({ ...base, place: 'GYM', minutes: 60, include: ['PULL POWER'] });
    expect(s.list[1].id).toBe('cave-weighted-pullup');
    // No tested pull-up: the assisted rung shows the lopsided ladder, the negatives stay hidden.
    expect(s.list.map(e => e.id)).toContain('cave01-oap-path');
    expect(s.list.map(e => e.id)).not.toContain('cave01-oap-assisted');
    expect(s.list.map(e => e.id)).not.toContain('cave01-oap-negative');
  });

  it('never puts both weighted pull-ups in one session', () => {
    const list = ids({ place: 'GYM', minutes: 90, include: ['PULL POWER', 'PULL'] });
    expect(list.filter(id => id.includes('weighted-pullup')).length).toBe(1);
  });

  it('builds chest and push power at the gym and at home', () => {
    const gym = ids({ place: 'GYM', minutes: 45, include: ['PUSH POWER', 'CHEST'] });
    expect(gym).toContain('extra-db-floor-press');
    expect(gym).toContain('extra-plyo-pushup');
    const home = ids({ minutes: 30, include: ['CHEST'] });
    expect(home).toContain('extra-feet-up-pushup');
    expect(home).not.toContain('extra-db-floor-press');
  });

  it('takes out everything that touches an excluded target, wherever it came from', () => {
    const list = buildCustom({ ...base, minutes: 45, include: ['SHOULDERS', 'LEGS', 'MOBILITY'], exclude: ['CORE'] }).list;
    for (const e of list) expect(touches('CORE', e)).toBe(false);
    const noLegs = buildCustom({ ...base, place: 'GYM', minutes: 45, include: ['BALANCE', 'SHOULDERS'], exclude: ['LEGS'] }).list;
    for (const e of noLegs) expect(e.capacities[0]).not.toBe('legs');
  });

  it('honours NO JUMPING, NO GRIP and NO FLOOR', () => {
    expect(ids({ place: 'GYM', minutes: 45, include: ['PUSH POWER'], avoid: ['JUMPING'] })).not.toContain('extra-plyo-pushup');
    const noGrip = buildCustom({ ...base, place: 'GYM', minutes: 45, include: ['CHEST', 'SHOULDERS'], avoid: ['GRIP'] });
    for (const e of noGrip.list) expect(flagsOf(e.id).grip ?? false).toBe(false);
    expect(noGrip.list[0].id).toBe('heal-warmup');
    const noFloor = buildCustom({ ...base, minutes: 30, include: ['CORE', 'LEGS', 'SHOULDERS'], avoid: ['FLOOR'] });
    for (const e of noFloor.list) expect(flagsOf(e.id).floor ?? false).toBe(false);
    expect(noFloor.list[0]?.id).not.toBe('morn-catcow');
  });

  it('fills 90 minutes without shortening anything', () => {
    const s = buildCustom({ ...base, place: 'GYM', minutes: 90, include: ['PULL POWER', 'CHEST', 'LEGS'] });
    expect(s.duration).toBeLessThanOrEqual(90);
    expect(s.duration).toBeGreaterThan(60);
  });

  it('cycles a target in, out and off', () => {
    let c = { include: [] as CustomInput['include'], exclude: [] as CustomInput['include'] };
    c = cycleTarget(c, 'CORE');
    expect(c).toEqual({ include: ['CORE'], exclude: [] });
    c = cycleTarget(c, 'CORE');
    expect(c).toEqual({ include: [], exclude: ['CORE'] });
    c = cycleTarget(c, 'CORE');
    expect(c).toEqual({ include: [], exclude: [] });
  });

  it('ships the six presets, each building a session, and saves new ones', () => {
    expect(BUILT_IN_PRESETS.map(p => p.name)).toEqual(['PULL DAY', 'PUSH + CHEST', 'LEGS + BALANCE', 'QUICK HOME', 'ROCKOVER ENGINE', 'HIPS + CONTROL']);
    for (const p of BUILT_IN_PRESETS) {
      const s = buildCustom({ ...base, ...p });
      expect(s.list.filter(e => e.block !== 'WARMUP' && e.id !== 'morn-catcow').length).toBeGreaterThan(1);
      expect(s.duration).toBeLessThanOrEqual(p.minutes);
    }
    const quick = buildCustom({ ...base, ...BUILT_IN_PRESETS[3] });
    for (const e of quick.list) expect(touches('CORE', e)).toBe(false);
    const mine = makePreset({ place: 'GYM', minutes: 60, include: ['PULL POWER'], exclude: ['CORE'], avoid: [] }, '');
    expect(mine.name).toBe('PULL POWER 60');
    expect(presetName({ place: 'GYM', minutes: 90, include: ['PULL POWER', 'SHOULDERS', 'CHEST'], exclude: [], avoid: [] })).toMatch(/ 90$/);
  });

  it('builds ROCKOVER ENGINE at home with the step-up first, hands free', () => {
    const s = buildCustom({ ...base, ...BUILT_IN_PRESETS[4] });
    expect(s.list[1].id).toBe('extra-step-down');
    expect(s.list.map(e => e.id)).toEqual(expect.arrayContaining(['extra-shift-split-squat', 'heal-calf-raise', 'daily-glute-bridge']));
    expect(closedAreas({ ...base, day: { ...NO_DAY, sore: ['LEGS'] } }).ROCKOVER).toBeTruthy();
    const hips = buildCustom({ ...base, ...BUILT_IN_PRESETS[5] });
    expect(hips.list.map(e => e.id)).toEqual(expect.arrayContaining(['morn-hip-9090', 'daily-ankle-wall', 'extra-dead-bug']));
  });

  it('warns about a due area left out and about power after a climb', () => {
    const needs = [{ group: 'CORE' as const, score: 1.2, reason: 'abs 0 of 12 sets this week' }];
    const w = buildWarnings({ place: 'GYM', minutes: 90, include: ['PULL POWER'], exclude: ['CORE'], avoid: [] }, needs, true);
    expect(w.length).toBe(2);
    expect(buildWarnings({ place: 'GYM', minutes: 30, include: ['PULL POWER'], exclude: [], avoid: [] }, needs, true)).toEqual([]);
  });

  it('closes PULL POWER and gripping goals while a finger heals', () => {
    expect(closedAreas({ ...base, place: 'GYM', healing: true })['PULL POWER']).toBeTruthy();
    const chest = buildCustom({ ...base, place: 'GYM', minutes: 45, include: ['CHEST'], healing: true });
    for (const e of chest.list) expect(flagsOf(e.id).grip ?? false).toBe(false);
  });
});

describe('what is not trained enough', () => {
  const at = (days: number) => ({ xp: 50, lastTrained: daysAgo(days), history: [] });
  const progress: Progress = {
    tension: at(1), pull: at(2), press: at(2), shoulder: at(2), legs: at(19), mobility: at(1), forearm: at(1),
  };
  const core = Object.fromEntries(['daily-reverse-crunch', 'daily-side-plank-dip', 'daily-prone-extension'].map(id => [id, 8]));
  const log: SessionLogEntry[] = [{ date: daysAgo(1), mode: 'DAILY', circuitId: 'daily-01', circuitTitle: 'x', energy: 'NORMAL', duration: 15, sets: core }];

  it('puts the stalest area first, with the reason', () => {
    const needs = areaNeeds(progress, log, {}, NOW);
    expect(needs[0].group).toBe('LEGS');
    expect(needs[0].reason).toContain('19 days');
    expect(suggestAreas(needs)).toEqual(['LEGS']);
    expect(needs.some(n => n.group === 'ARMS')).toBe(false);
  });

  it('counts the core behind on its weekly sets', () => {
    const needs = areaNeeds(progress, [], {}, NOW);
    const coreNeed = needs.find(n => n.group === 'CORE')!;
    expect(coreNeed.score).toBeGreaterThanOrEqual(1);
    expect(coreNeed.reason).toContain('sets this week');
  });

  it('leaves out closed areas', () => {
    expect(areaNeeds(progress, log, { LEGS: 'sore' }, NOW).some(n => n.group === 'LEGS')).toBe(false);
  });
});

describe('starting a custom session', () => {
  it('runs the built list and logs it under its mode', () => {
    const s = buildCustom({ ...base, place: 'GYM', minutes: 30, include: ['PULL'] });
    useStore.setState({ mode: 'DAILY', circuitIndex: 3, screen: 'home', sessionLog: [] });
    useStore.getState().startCustom(s.circuit, s.list, 'CAVE');
    const st = useStore.getState();
    expect(st.mode).toBe('CAVE');
    expect(st.circuitIndex).toBe(0);
    expect(st.exerciseList.map(e => e.id)).toEqual(s.list.map(e => e.id));
    st.finishNow();
    const entry = useStore.getState().sessionLog.at(-1)!;
    expect(entry.circuitId).toBe('custom-cave');
    expect(entry.mode).toBe('CAVE');
  });

  it('saves and deletes presets of its own, and backs them up', () => {
    const p = makePreset({ place: 'HOME', minutes: 30, include: ['CHEST', 'LEGS'], exclude: ['CORE'], avoid: ['JUMPING'] }, 'morning push');
    useStore.getState().savePreset(p);
    expect(useStore.getState().buildPresets.at(-1)!.name).toBe('MORNING PUSH');
    expect(PERSISTED_KEYS).toContain('buildPresets');
    useStore.getState().deletePreset(p.id);
    expect(useStore.getState().buildPresets.some(x => x.id === p.id)).toBe(false);
  });
});
