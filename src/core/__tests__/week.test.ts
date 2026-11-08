import { describe, it, expect } from 'vitest';
import { getModeData } from '../data-index';
import { CAVE_DAY_IDS, STRAIGHT_BACK_ID, WAKE_UP_IDS, WEEK_IDS } from '../data-week';
import { flagsOf } from '../custom';
import { buildList, estimateDuration } from '../engine';
import { NOT_PICKED } from '../not-picked';

const all = [...getModeData('DAILY'), ...getModeData('CAVE')];
const byId = (id: string) => all.find(c => c.id === id)!;

describe('the week of v47', () => {
  it('sits in the DAILY and CAVE tabs', () => {
    for (const id of WEEK_IDS) expect(byId(id), id).toBeDefined();
  });

  it('wakes up standing: nothing on the floor, nothing that curls, nothing jumps', () => {
    for (const id of WAKE_UP_IDS) {
      for (const e of byId(id).exercises) {
        const f = flagsOf(e.id);
        expect(f.curl ?? false, `${id} ${e.id}`).toBe(false);
        expect(f.jump ?? false, `${id} ${e.id}`).toBe(false);
      }
      for (const energy of ['TIRED', 'NORMAL', 'FRESH'] as const) {
        expect(estimateDuration(buildList(byId(id), energy, {})), `${id} ${energy}`).toBeLessThanOrEqual(15);
      }
    }
  });

  it('ends every CAVE day with a core block led by the weighted hanging knee raise', () => {
    for (const id of CAVE_DAY_IDS) {
      const ids = byId(id).exercises.map(e => e.id);
      const at = ids.indexOf('extra-weighted-knee-raise');
      expect(at, id).toBeGreaterThan(0);
      const core = byId(id).exercises.slice(at);
      expect(core.length, id).toBeGreaterThanOrEqual(4);
      for (const e of core) expect(e.capacities, `${id} ${e.id}`).toContain('tension');
    }
  });

  it('keeps STRAIGHT BACK after the wall: stacking, no pulling, no finger work', () => {
    const c = byId(STRAIGHT_BACK_ID);
    expect(c.stacksOnSession).toBe(true);
    for (const e of c.exercises) {
      expect(e.capacities.some(x => ['pull', 'crimp', 'openhand', 'forearm'].includes(x)), e.id).toBe(false);
      expect(e.hangs ?? false, e.id).toBe(false);
    }
    expect(c.exercises.map(e => e.id)).toEqual(expect.arrayContaining(['power-band-face-pull', 'extra-bent-ytw', 'extra-doorway-pec']));
  });

  it('uses nothing the athlete dropped', () => {
    for (const id of WEEK_IDS) for (const e of byId(id).exercises) expect(NOT_PICKED.has(e.id), `${id} ${e.id}`).toBe(false);
  });
});
