import { describe, it, expect, vi, afterEach } from 'vitest';
import { CONFIG } from '../config';
import { scaleRest, buildList, checkDecay } from '../engine';
import { getLoadAxis } from '../load';
import { getModeData } from '../data-index';
import type { BlockType, EnergyKey, Exercise, Progress } from '../types';

const ENERGIES: EnergyKey[] = ['FRESH', 'NORMAL', 'TIRED'];
const ALL_EXERCISES: Exercise[] = CONFIG.modes.flatMap(m =>
  getModeData(m).flatMap(c => [...c.exercises, ...(c.substitutes ?? [])]),
);

function progressAt(level: number): Progress {
  const xp = CONFIG.levels.find(l => l.level === level)?.cumul ?? 0;
  const p: Progress = {};
  for (const c of CONFIG.capacities) p[c] = { xp, lastTrained: new Date().toISOString(), history: [] };
  return p;
}

afterEach(() => vi.useRealTimers());

describe('scaleRest', () => {
  it('never returns less than the protocol value on PRIMARY, SECONDARY or TEST work', () => {
    const protectedBlocks: BlockType[] = ['PRIMARY', 'SECONDARY', 'TEST'];
    for (const ex of ALL_EXERCISES.filter(e => protectedBlocks.includes(e.block))) {
      for (const level of CONFIG.levels.map(l => l.level)) {
        for (const energy of ENERGIES) {
          expect(scaleRest(ex, energy, level), `${ex.id} L${level} ${energy}`).toBeGreaterThanOrEqual(ex.restSec);
        }
      }
    }
  });
});

describe('gates', () => {
  const cave02 = getModeData('CAVE').find(c => c.id === 'cave-05')!;
  const gated = cave02.exercises.filter(e => e.gate);

  it('CAVE 02 carries at least one gated exercise', () => {
    expect(gated.length).toBeGreaterThan(0);
  });

  it('resolve to their substitute while closed, even at max level', () => {
    const list = buildList(cave02, 'NORMAL', progressAt(7), []);
    for (const ex of gated) {
      expect(list.some(e => e.id === ex.id)).toBe(false);
      if (ex.gate?.substituteId) expect(list.some(e => e.id === ex.gate!.substituteId && e.gated)).toBe(true);
    }
  });

  it('open on a tested result above the threshold', () => {
    const results = [{ benchmarkId: 'weighted-pullup-2rm', value: 200, date: new Date().toISOString() }];
    const list = buildList(cave02, 'NORMAL', progressAt(1), results);
    for (const ex of gated.filter(e => e.gate!.benchmarkId === 'weighted-pullup-2rm')) {
      expect(list.some(e => e.id === ex.id)).toBe(true);
    }
  });
});

describe('checkDecay', () => {
  it('leaves every capacity alone inside its grace period', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-04T08:00:00Z'));
    for (const c of CONFIG.capacities) {
      const grace = CONFIG.decay.rates[c].graceDays;
      const last = new Date(Date.now() - (grace - 1) * 86400000).toISOString();
      const { progress } = checkDecay({ [c]: { xp: 50, lastTrained: last, history: [] } });
      expect(progress[c]!.xp, c).toBe(50);
    }
  });

  it('takes XP once the grace period is over', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-04T08:00:00Z'));
    for (const c of CONFIG.capacities) {
      const grace = CONFIG.decay.rates[c].graceDays;
      const last = new Date(Date.now() - grace * 86400000).toISOString();
      const { progress } = checkDecay({ [c]: { xp: 50, lastTrained: last, history: [] } });
      expect(progress[c]!.xp, c).toBeLessThan(50);
    }
  });
});

describe('getLoadAxis', () => {
  it('stays null for WARMUP, PREHAB and MOBILITY work', () => {
    for (const ex of ALL_EXERCISES.filter(e => ['WARMUP', 'PREHAB', 'MOBILITY'].includes(e.block) && !e.records)) {
      expect(getLoadAxis(ex), ex.id).toBeNull();
    }
  });
});
