import { describe, it, expect } from 'vitest';
import { phaseOf, phasesOf, phaseRuns, phaseTag, isSkill } from '../phases';
import { secondsLeft, minutesLeft, finishTime, addCost, costLabel } from '../session-time';
import { doLater, dropAhead, moveAhead, setsAhead } from '../live-edit';
import { exerciseSeconds, estimateDuration, buildList } from '../engine';
import { exerciseLibrary } from '../reserve';
import { getModeData } from '../data-index';
import { withNote, lastTimeNote } from '../notes';
import { transferOf, transferLine, focusOf, packForFalls } from '../transfer';
import type { Exercise, ScaledExercise } from '../types';
import type { Limiters } from '../limiters';

const lib = exerciseLibrary();
const get = (id: string) => lib.get(id)!;
const sc = (id: string, scaledSets = 3, extra: Partial<ScaledExercise> = {}) =>
  ({ ...get(id), displayName: get(id).name, scaledSets, scaledWork: get(id).work, scaledRest: get(id).restSec, activeVariation: null, loadText: '', appliedIntensity: 'MODERATE', gated: false, ...extra }) as ScaledExercise;

describe('phases', () => {
  it('reads a session as PREP, SKILL, STRENGTH, CORE, CARE', () => {
    const list: Exercise[] = [get('cave-warmup-pulse'), get('feet-wall-high-step'), get('addon-goblet-squat'), get('legs-plate-crunch'), get('feet-frogger')];
    expect(phasesOf(list)).toEqual(['PREP', 'SKILL', 'STRENGTH', 'CORE', 'CARE']);
  });

  it('calls opening mobility PREP and closing mobility CARE', () => {
    expect(phasesOf([get('morn-catcow'), get('daily-pushup'), get('morn-catcow')])).toEqual(['PREP', 'STRENGTH', 'CARE']);
  });

  it('counts the lunge drive and balance as skill, power protocols as POWER, tests as TEST', () => {
    expect(isSkill(get('extra-lunge-drive'))).toBe(true);
    expect(phaseOf(get('full-box-jump'))).toBe('POWER');
    expect(phaseOf(getModeData('TEST')[0].exercises.find(e => e.block === 'TEST')!)).toBe('TEST');
  });

  it('groups consecutive phases with their minutes and tags a place in them', () => {
    const list = [sc('feet-wall-high-step'), sc('feet-edge-stand'), sc('addon-goblet-squat')];
    const runs = phaseRuns(list);
    expect(runs.map(r => [r.phase, r.start, r.end])).toEqual([['SKILL', 0, 2], ['STRENGTH', 2, 3]]);
    expect(runs[0].minutes).toBe(estimateDuration(list.slice(0, 2)));
    expect(phaseTag(list, 1)).toBe('SKILL · 2 OF 2');
    expect(phaseTag(list, 2)).toBe('STRENGTH');
  });
});

describe('time left', () => {
  const list = [sc('daily-pushup', 3), sc('daily-bw-squat', 2), sc('morn-catcow', 1)];

  it('counts the sets not done yet, then everything after, without the last rest', () => {
    const full = list.reduce((s, e) => s + exerciseSeconds(e), 0) - list[2].scaledRest;
    expect(secondsLeft(list, 0, 1)).toBe(full);
    expect(secondsLeft(list, 0, 3)).toBe(full - 2 * exerciseSeconds(list[0], 1));
    expect(minutesLeft(list, 1, 1)).toBe(Math.round((exerciseSeconds(list[1]) + exerciseSeconds(list[2]) - list[2].scaledRest) / 60));
    expect(secondsLeft(list, 3, 1)).toBe(0);
  });

  it('gives a finish time on the clock', () => {
    const now = new Date(2026, 10, 1, 18, 0);
    const end = new Date(now.getTime() + secondsLeft(list, 0, 1) * 1000);
    expect(finishTime(list, 0, 1, now)).toBe(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
  });

  it('says what an addition costs', () => {
    const cost = addCost([sc('daily-glute-bridge', 2)], list, 0, 1);
    expect(cost.minutes).toBeGreaterThan(0);
    expect(cost.total).toBe(minutesLeft(list, 0, 1) + cost.minutes);
    expect(costLabel({ minutes: 6, total: 34 })).toBe('+6 MIN, 34 LEFT IN ALL');
  });
});

describe('the session map', () => {
  const list = [sc('daily-pushup'), sc('daily-bw-squat'), sc('daily-glute-bridge'), sc('feet-wall-high-step')];

  it('moves an exercise still to come to the end, never the one in hand or done ones', () => {
    expect(doLater(list, 0, 1).map(e => e.id)).toEqual(['daily-pushup', 'daily-glute-bridge', 'feet-wall-high-step', 'daily-bw-squat']);
    expect(doLater(list, 1, 1)).toBe(list);
    expect(doLater(list, 1, 0)).toBe(list);
  });

  it('drops and reorders only among what is to come', () => {
    expect(dropAhead(list, 0, 2).map(e => e.id)).toEqual(['daily-pushup', 'daily-bw-squat', 'feet-wall-high-step']);
    expect(dropAhead(list, 2, 1)).toBe(list);
    expect(moveAhead(list, 0, 2, -1).map(e => e.id)[1]).toBe('daily-glute-bridge');
    expect(moveAhead(list, 1, 2, -1)).toBe(list);
  });

  it('changes sets between 1 and 8, never on fixed protocols, never the rest', () => {
    const more = setsAhead(list, 0, 1, 1);
    expect(more[1].scaledSets).toBe(4);
    expect(more[1].scaledRest).toBe(list[1].scaledRest);
    expect(setsAhead(list, 0, 3, 1)).toBe(list);
    let l = list;
    for (let i = 0; i < 10; i++) l = setsAhead(l, 0, 1, -1);
    expect(l[1].scaledSets).toBe(1);
  });
});

describe('technique notes', () => {
  it('keeps one short line per exercise, shown from the next day', () => {
    let n = withNote({}, 'daily-toe-taps', '  right knee   caves  ', '2026-11-01');
    expect(n['daily-toe-taps']).toEqual({ text: 'right knee caves', day: '2026-11-01' });
    expect(lastTimeNote(n, 'daily-toe-taps', '2026-11-01')).toBeNull();
    expect(lastTimeNote(n, 'daily-toe-taps', '2026-11-03')?.text).toBe('right knee caves');
    n = withNote(n, 'daily-toe-taps', '', '2026-11-03');
    expect(n['daily-toe-taps']).toBeUndefined();
    expect(withNote({}, 'x', 'a'.repeat(300), '2026-11-01').x.text).toHaveLength(140);
  });
});

describe('what an exercise is for', () => {
  it('names the moves an exercise serves, and a cue for skill work', () => {
    expect(transferOf(get('feet-heel-hook-bridge'))).toEqual(['HEEL HOOK']);
    expect(transferLine(get('feet-wall-high-step'))).toMatch(/^For standing up on a high foot/);
    expect(transferLine(get('daily-pushup'))).toBeNull();
    expect(focusOf(get('daily-toe-taps'))).toMatch(/One touch/);
    expect(focusOf(get('feet-edge-stand'))).toBe(get('feet-edge-stand').focus);
  });

  it('points a fall pattern at the pack that trains it', () => {
    const base: Limiters = {
      climbs: 20, tagged: 12, average: 0.5, weakest: [], strongest: [], reasons: [], headFalls: 0, falls: 10,
      tryHardSessions: 1, sessions: 4, enough: true,
    };
    expect(packForFalls(base)).toBeNull();
    const slip = { ...base, reasons: [{ reason: 'feet', label: 'FOOT SLIPPED', kind: 'technique' as const, count: 4 }] };
    expect(packForFalls(slip)).toEqual({ packId: 'feet', reason: 'Foot slipped in 4 of 10 falls.' });
    const cut = { ...base, reasons: [{ reason: 'tension', label: 'FEET CUT', kind: 'physical' as const, count: 3 }] };
    expect(packForFalls(cut)?.packId).toBe('hooks');
    const slab = { ...base, weakest: [{ tag: 'slab', label: 'SLAB', climbs: 6, sent: 1, rate: 0.17, vsAverage: -33 }] };
    expect(packForFalls(slab)).toEqual({ packId: 'feet', reason: 'SLAB goes 33 points under your send rate.' });
  });
});

describe('the engine still agrees', () => {
  it('estimateDuration is exerciseSeconds summed', () => {
    const list = buildList(getModeData('DAILY')[0], 'NORMAL', {});
    const s = list.reduce((t, e) => t + exerciseSeconds(e), 0) - list[list.length - 1].scaledRest;
    expect(estimateDuration(list)).toBe(Math.max(1, Math.round(s / 60)));
  });
});
