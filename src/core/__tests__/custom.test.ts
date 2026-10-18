import { describe, it, expect } from 'vitest';
import { areaNeeds, buildCustom, closedAreas, suggestAreas, CUSTOM_TIMES, type CustomInput } from '../custom';
import { isCurl, exerciseLibrary } from '../reserve';
import { loadsFingers } from '../engine';
import { NO_DAY } from '../today';
import { useStore } from '../../store/store';
import type { EnergyKey, Progress, SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 15, 7, 0); // Thursday 15 Oct 2026
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86400000).toISOString();
const base: CustomInput = {
  place: 'HOME', minutes: 20, groups: ['CORE'], energy: 'NORMAL', progress: {}, benchmarkResults: [],
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
          const s = buildCustom({ ...base, place, minutes, energy, groups: [...groups] });
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
    const home = buildCustom({ ...base, minutes: 30, groups: ['CORE', 'SHOULDERS'] });
    expect(home.list[0].id).toBe('morn-catcow');
    const firstCurl = home.list.findIndex(e => isCurl(e.id));
    if (firstCurl >= 0) expect(home.list.slice(firstCurl).every(e => isCurl(e.id))).toBe(true);
    const gym = buildCustom({ ...base, place: 'GYM', minutes: 45, groups: ['PULL', 'LEGS'] });
    expect(gym.list[0].id).toBe('cave-warmup-pulse');
    expect(gym.list.some(e => e.capacities.includes('pull'))).toBe(true);
    expect(gym.list.some(e => e.capacities.includes('legs'))).toBe(true);
    expect(gym.circuit.stacksOnSession).toBe(true);
    expect(home.circuit.recoveryHours).toBe(0);
  });

  it('uses only home kit at home and takes turns between areas', () => {
    const s = buildCustom({ ...base, minutes: 30, groups: ['LEGS', 'MOBILITY'] });
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
    const s = buildCustom({ ...base, minutes: 10, groups: ['LEGS'], sessionLog: log });
    expect(s.list.map(e => e.id)).not.toContain('daily-bw-squat');
  });

  it('grips nothing and loads no finger while a finger heals', () => {
    const s = buildCustom({ ...base, place: 'GYM', minutes: 60, groups: ['CORE', 'SHOULDERS', 'FINGERS', 'PULL'], healing: true });
    expect(closedAreas({ ...base, place: 'GYM', healing: true }).FINGERS).toBeTruthy();
    for (const e of s.list) {
      expect(loadsFingers(e)).toBe(false);
      expect(['addon-weighted-pullup', 'cave-lockoff', 'addon-hanging-oblique', 'morn-pullapart']).not.toContain(e.id);
    }
  });

  it('closes what is sore, and the pull at home', () => {
    const c = closedAreas({ ...base, day: { ...NO_DAY, sore: ['LEGS', 'SHOULDERS'] }, pain: 4 });
    expect(Object.keys(c).sort()).toEqual(['FINGERS', 'LEGS', 'PULL', 'SHOULDERS']);
    const s = buildCustom({ ...base, groups: ['LEGS', 'CORE'], day: { ...NO_DAY, sore: ['LEGS'] } });
    expect(s.list.every(e => e.capacities[0] !== 'legs' || e.block === 'MOBILITY')).toBe(true);
  });

  it('keeps to the mat with no kit', () => {
    const s = buildCustom({ ...base, minutes: 30, groups: ['CORE', 'LEGS', 'SHOULDERS'], day: { ...NO_DAY, noKit: true } });
    for (const e of s.list) expect(['bodyweight', 'rpe']).toContain(lib.get(e.id)!.load.kind);
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
    const s = buildCustom({ ...base, place: 'GYM', minutes: 30, groups: ['PULL'] });
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
});
