import { describe, it, expect } from 'vitest';
import { getModeData } from '../data-index';
import { CORE_EXERCISES } from '../insights';

const daily = getModeData('DAILY');
const legsCore = daily.find(c => c.id === 'daily-05')!;

describe('DAILY 05 LEGS + CORE', () => {
  it('exists and needs only the mat: no band, no weight, no edge', () => {
    expect(legsCore).toBeDefined();
    for (const ex of legsCore.exercises) {
      expect(['bodyweight'], ex.id).toContain(ex.load.kind);
    }
  });

  it('never curls the spine: no crunch or twist, and nothing in ACCESSORY', () => {
    const flexion = new Set(['daily-reverse-crunch', 'daily-crunch', 'morn-bw-russian-twist']);
    for (const ex of legsCore.exercises) {
      expect(flexion.has(ex.id), ex.id).toBe(false);
      expect(ex.block, ex.id).not.toBe('ACCESSORY');
    }
  });

  it('opens and closes with mobility for the back', () => {
    const blocks = legsCore.exercises.map(e => e.block);
    expect(blocks[0]).toBe('MOBILITY');
    expect(blocks[blocks.length - 1]).toBe('MOBILITY');
  });

  it('shares the push-up and cat-cow with the other sessions, so their history carries over', () => {
    const others = daily.filter(c => c.id !== 'daily-05').flatMap(c => c.exercises);
    for (const id of ['daily-pushup', 'morn-catcow']) {
      const here = legsCore.exercises.find(e => e.id === id);
      expect(here, id).toBeDefined();
      expect(others.find(e => e.id === id)).toBe(here);
    }
  });

  it('counts its working trunk and hip sets in STATS core volume', () => {
    expect(CORE_EXERCISES.abs).toContain('daily-plank-climber');
    expect(CORE_EXERCISES.back).toContain('daily-glute-bridge');
  });
});
