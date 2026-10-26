import { describe, it, expect } from 'vitest';
import { CONFIG } from '../config';
import { buildList } from '../engine';
import { getModeData } from '../data-index';
import { LUNGE_DRIVE, SL_BALANCE } from '../data-extras';
import { QUALITY_EXEMPT, missingQualities, trains } from '../qualities';

const all = CONFIG.modes.flatMap(m => getModeData(m));

describe('balance and power at full stretch', () => {
  it('reads protocols and alsoTrains', () => {
    expect(trains(LUNGE_DRIVE, 'stretch')).toBe(true);
    expect(trains(LUNGE_DRIVE, 'balance')).toBe(true);
    expect(trains(SL_BALANCE, 'balance')).toBe(true);
    expect(trains(SL_BALANCE, 'stretch')).toBe(false);
  });

  it('is in every training session', () => {
    for (const c of all.filter(x => !QUALITY_EXEMPT.includes(x.id))) {
      expect(missingQualities(c), c.id).toEqual([]);
    }
  });

  it('survives a TIRED day', () => {
    for (const c of all.filter(x => !QUALITY_EXEMPT.includes(x.id))) {
      const list = buildList(c, 'TIRED', {});
      expect(list.some(e => trains(e, 'balance')), c.id).toBe(true);
      expect(list.some(e => trains(e, 'stretch')), c.id).toBe(true);
    }
  });

  it('leaves the tests and the ring rehab alone', () => {
    for (const id of QUALITY_EXEMPT) {
      const c = all.find(x => x.id === id)!;
      expect(c.exercises.some(e => e.id === LUNGE_DRIVE.id), id).toBe(false);
    }
  });
});
