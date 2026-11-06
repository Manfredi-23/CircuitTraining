import { describe, it, expect } from 'vitest';
import { EXERCISE_TAGS, MUSCLE_GROUPS, groupsOf, kitOf, kitText, sharesKit } from '../exercise-tags';
import { exerciseLibrary } from '../reserve';
import { libraryFor } from '../routines';

const pickable = [...exerciseLibrary().values()].filter(e => e.block !== 'TEST' && !e.records && !e.ramp);

describe('exercise tags', () => {
  it('tags every exercise that can be picked, and nothing that is not in the app', () => {
    const missing = pickable.filter(e => !EXERCISE_TAGS[e.id]).map(e => e.id);
    expect(missing).toEqual([]);
    const lib = exerciseLibrary();
    expect(Object.keys(EXERCISE_TAGS).filter(id => !lib.has(id))).toEqual([]);
  });

  it('gives every working exercise a group and leaves warm-ups out of the groups', () => {
    expect(pickable.filter(e => e.block !== 'WARMUP' && groupsOf(e).length === 0).map(e => e.id)).toEqual([]);
    expect(pickable.filter(e => e.block === 'WARMUP' && groupsOf(e).length > 0).map(e => e.id)).toEqual([]);
  });

  it('names the kit the exercise names', () => {
    const rules: Array<[RegExp, string]> = [
      [/\bring\b|trx/i, 'RINGS'], [/dumbbell/i, 'DUMBBELL'], [/kettlebell|goblet/i, 'KETTLEBELL'],
      [/barbell/i, 'BARBELL'], [/pull-up|chin-up|hanging|lock-off|front lever/i, 'BAR'], [/\bhang/i, 'HANGBOARD'],
      [/\bband\b/i, 'BAND'], [/\bbox\b/i, 'BOX'],
    ];
    const wrong: string[] = [];
    for (const e of pickable) {
      for (const [re, kit] of rules) {
        if (re.test(e.name) && !kitOf(e).includes(kit as never)) wrong.push(`${e.id} (${kit})`);
      }
    }
    // Words that are not kit: hanging core is on the bar, the band lock-off on a
    // band, no-hangs on the portable edge, the ring finger is a finger, and
    // the ring dips in "Push-Ups / Ring Dips" are optional.
    const notKit = [
      'home-leg-raise (HANGBOARD)', 'addon-hanging-oblique (HANGBOARD)', 'morn-band-row (BAR)',
      'daily-edge-density (HANGBOARD)', 'heal-ring-left (RINGS)', 'addon-pushup (RINGS)',
    ];
    expect(wrong.filter(w => !notKit.includes(w))).toEqual([]);
  });

  it('leaves no group without something to add, at the gym and at home', () => {
    for (const g of MUSCLE_GROUPS) {
      const gym = libraryFor('GYM').filter(x => groupsOf(x.exercise).includes(g));
      const home = libraryFor('HOME').filter(x => groupsOf(x.exercise).includes(g));
      expect(gym.length, `${g} at the gym`).toBeGreaterThanOrEqual(2);
      expect(home.length, `${g} at home`).toBeGreaterThanOrEqual(1);
    }
  });

  it('tells shared kit apart, and says it in words', () => {
    const lib = exerciseLibrary();
    expect(sharesKit(lib.get('full-ring-row')!, lib.get('extra-ring-dip')!)).toBe(true);
    expect(sharesKit(lib.get('full-ring-row')!, lib.get('power-db-row')!)).toBe(false);
    expect(sharesKit(lib.get('daily-pushup')!, lib.get('daily-pushup')!)).toBe(false);
    expect(kitText(lib.get('cave01-oap-assisted')!)).toBe('pull-up bar, band');
  });
});
