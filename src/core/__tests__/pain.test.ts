import { describe, it, expect } from 'vitest';
import { applyPainCheck, asksPainCheck, buildList, loadsFingers, painBand } from '../engine';
import { getModeData } from '../data-index';

const cave01 = getModeData('CAVE').find(c => c.circuitNum === '01')!;
const cave03 = getModeData('CAVE').find(c => c.id === 'cave-06')!;
const assess = getModeData('TEST')[0];

describe('pain check', () => {
  it('is asked before finger sessions and not before legs', () => {
    expect(asksPainCheck(cave01)).toBe(true);
    expect(asksPainCheck(cave03)).toBe(false);
  });

  it('bands at 3 and 6', () => {
    expect([0, 2, 3, 5, 6, 10].map(painBand)).toEqual(['clear', 'clear', 'reduce', 'reduce', 'remove', 'remove']);
  });

  it('leaves the session alone at 0-2', () => {
    const list = buildList(cave01, 'NORMAL', {});
    expect(applyPainCheck(list, 2)).toEqual(list);
  });

  it('caps finger work at HARD and one set shorter at 3-5', () => {
    const list = buildList(cave01, 'NORMAL', {});
    const reduced = applyPainCheck(list, 4);
    for (const e of reduced.filter(x => loadsFingers(x) && !x.fixed && x.block !== 'WARMUP')) {
      const before = list.find(x => x.id === e.id)!;
      expect(e.appliedIntensity).not.toBe('MAX');
      expect(e.scaledSets).toBe(Math.max(1, before.scaledSets - 1));
    }
  });

  it('drops maximal finger tests at 3-5', () => {
    const list = buildList(assess, 'NORMAL', {});
    const reduced = applyPainCheck(list, 3);
    expect(reduced.some(e => e.block === 'TEST' && e.intensity === 'MAX' && loadsFingers(e))).toBe(false);
  });

  it('removes all finger work at 6+', () => {
    const list = buildList(cave01, 'NORMAL', {});
    expect(applyPainCheck(list, 6).some(loadsFingers)).toBe(false);
  });
});
