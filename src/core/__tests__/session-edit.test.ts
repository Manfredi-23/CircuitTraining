import { describe, it, expect } from 'vitest';
import {
  activeEdit, addIds, allowedToday, cautionToday, clearTarget, editedCircuit, editFromCircuit, isChanged, moveAt,
  packsFor, removeAt, similarTo, stepAt, stepTarget, swapAt, PACKS, type EditContext,
} from '../session-edit';
import { getModeData } from '../data-index';
import { buildList, loadsFingers } from '../engine';
import { exerciseLibrary, isCurl } from '../reserve';
import { isHomeExercise } from '../routines';
import { areaOf } from '../review';
import { flagsOf } from '../custom';
import { useStore } from '../../store/store';
import { sessionListFor } from '../../store/slices/workout-slice';
import { localDate } from '../dates';

const TODAY = '2026-10-26';
const full = getModeData('CAVE').find(c => c.id === 'cave-08')!;
const daily01 = getModeData('DAILY').find(c => c.id === 'daily-01')!;
const gym: EditContext = { place: 'GYM', mode: 'CAVE', healing: false, pain: null, noKit: false };
const home: EditContext = { place: 'HOME', mode: 'DAILY', healing: false, pain: null, noKit: false };

describe('session edits', () => {
  it('starts as written and holds for its day, or until reset when kept', () => {
    const e = editFromCircuit(full, TODAY);
    expect(isChanged(full, e)).toBe(false);
    expect(editedCircuit(full, e).exercises.map(x => x.id)).toEqual(full.exercises.map(x => x.id));
    const edits = { [full.id]: removeAt(e, 1) };
    expect(activeEdit(edits, full.id, TODAY)).not.toBeNull();
    expect(activeEdit(edits, full.id, '2026-10-27')).toBeNull();
    expect(activeEdit({ [full.id]: { ...edits[full.id], kept: true } }, full.id, '2026-11-30')).not.toBeNull();
  });

  it('keeps the session id, so it logs and recovers as itself', () => {
    const c = editedCircuit(full, removeAt(editFromCircuit(full, TODAY), 1));
    expect(c.id).toBe(full.id);
    expect(c.exercises).toHaveLength(full.exercises.length - 1);
    expect(isChanged(full, removeAt(editFromCircuit(full, TODAY), 1))).toBe(true);
  });

  it('moves, swaps and steps within the bounds, and never touches rest', () => {
    let e = editFromCircuit(full, TODAY);
    const squat = e.items.findIndex(i => i.id === 'full-front-squat');
    e = moveAt(e, squat, -1);
    expect(e.items[squat - 1].id).toBe('full-front-squat');
    for (let k = 0; k < 20; k++) e = stepAt(full, e, squat - 1, 'sets', 1);
    const ex = editedCircuit(full, e).exercises.find(x => x.id === 'full-front-squat')!;
    const written = full.exercises.find(x => x.id === 'full-front-squat')!;
    expect(ex.sets).toBe(8);
    expect(ex.restSec).toBe(written.restSec);
    // Back to as written drops the override.
    for (let k = 0; k < 20; k++) e = stepAt(full, e, squat - 1, 'sets', -1);
    for (let k = 0; k < written.sets - 1; k++) e = stepAt(full, e, squat - 1, 'sets', 1);
    expect(e.items[squat - 1].sets).toBeUndefined();

    e = swapAt(e, 1, 'addon-goblet-squat');
    expect(e.items[1]).toEqual({ id: 'addon-goblet-squat' });
    // Already in: no swap.
    expect(swapAt(e, 2, 'addon-goblet-squat')).toBe(e);
  });

  it('takes warm-ups and fixed protocols as written', () => {
    const e = editFromCircuit(full, TODAY);
    const warm = full.exercises.findIndex(x => x.block === 'WARMUP');
    expect(stepAt(full, e, warm, 'sets', 1)).toBe(e);
  });

  it('opens the stepper on the load planned for today', () => {
    let e = editFromCircuit(full, TODAY);
    const i = e.items.findIndex(x => x.id === 'full-front-squat');
    e = stepTarget(full, e, i, 1, 24);
    e = stepTarget(full, e, i, 1, 24);
    const ex = editedCircuit(full, e).exercises[i];
    expect(ex.targetLoad).toBeGreaterThan(24);
    expect(clearTarget(e, i).items[i].target).toBeUndefined();

    useStore.getState().primeLoad(ex);
    expect(useStore.getState().pendingLoad).toBe(ex.targetLoad);
  });

  it('adds where things belong: heavy first, curls closing a DAILY, nothing twice', () => {
    const e = addIds(daily01, editFromCircuit(daily01, TODAY), ['extra-diamond-pushup', 'daily-reverse-crunch'], 'DAILY');
    const ids = e.items.map(i => i.id);
    const firstCurl = ids.findIndex(isCurl);
    expect(ids.indexOf('extra-diamond-pushup')).toBeLessThan(firstCurl);
    expect(addIds(daily01, e, ['extra-diamond-pushup'], 'DAILY').items).toHaveLength(e.items.length);
    expect(buildList(editedCircuit(daily01, e), 'NORMAL', {}).some(x => x.id === 'extra-diamond-pushup')).toBe(true);
  });

  it('offers similar exercises first: same area, today-safe', () => {
    const squat = full.exercises.find(x => x.id === 'full-front-squat')!;
    const sim = similarTo(squat, gym);
    expect(sim.length).toBeGreaterThan(0);
    expect(sim.every(s => areaOf(s.exercise) === 'LEGS')).toBe(true);

    const warm = full.exercises.find(x => x.block === 'WARMUP')!;
    const warmUps = similarTo(warm, gym);
    expect(warmUps.length).toBeGreaterThan(0);
    expect(warmUps.every(s => s.exercise.block === 'WARMUP')).toBe(true);

    const push = daily01.exercises.find(x => x.capacities[0] === 'press')!;
    const atHome = similarTo(push, home);
    expect(atHome.every(s => isHomeExercise(s.exercise.id))).toBe(true);
  });

  it('labels grips, pulling and finger work while a finger heals or hurts, and removes them only at pain 6+', () => {
    const lib = [...exerciseLibrary().values()];
    const heal: EditContext = { ...gym, healing: true };
    const grippy = lib.filter(x => allowedToday(x, gym) && (flagsOf(x.id).grip || loadsFingers(x) || x.capacities.includes('pull')));
    expect(grippy.length).toBeGreaterThan(0);
    for (const ex of grippy) {
      expect(allowedToday(ex, heal)).toBe(true);
      expect(cautionToday(ex, heal)).toMatch(/Not recommended yet/);
    }
    const plain = lib.find(x => x.id === 'daily-glute-bridge')!;
    expect(cautionToday(plain, heal)).toBeNull();
    const sore: EditContext = { ...gym, pain: 4 };
    const finger = lib.filter(x => allowedToday(x, sore) && loadsFingers(x));
    expect(finger.length).toBeGreaterThan(0);
    expect(cautionToday(finger[0], sore)).toBe('Not recommended: finger pain 4/10.');
    expect(lib.filter(x => allowedToday(x, { ...gym, pain: 6 })).some(loadsFingers)).toBe(false);
    expect(lib.some(x => x.records && allowedToday(x, gym))).toBe(false);
  });
});

describe('packs', () => {
  it('name only exercises in the app, and the home version runs at home', () => {
    const lib = exerciseLibrary();
    for (const p of PACKS) {
      for (const id of [...p.home, ...(p.gym ?? [])]) expect(lib.has(id), `${p.id}: ${id}`).toBe(true);
      for (const id of p.home) expect(isHomeExercise(id), `${p.id}: ${id}`).toBe(true);
    }
  });

  it('say what goes in today, and why nothing does', () => {
    const offers = packsFor(gym, []);
    expect(offers.every(o => o.ids.length > 0)).toBe(true);
    const fingers = packsFor({ ...home, healing: true }, []).find(o => o.pack.id === 'fingers-light')!;
    expect(fingers.ids.length).toBeGreaterThan(0);
    expect(fingers.caution).toMatch(/heals/);
    expect(packsFor({ ...home, pain: 5 }, []).find(o => o.pack.id === 'fingers-light')!.caution).toMatch(/pain 5/);
    expect(packsFor({ ...home, pain: 6 }, []).find(o => o.pack.id === 'fingers-light')!.closed).toMatch(/pain/);
    expect(packsFor(home, []).every(o => o.caution === null)).toBe(true);
    const core = PACKS.find(p => p.id === 'core-finisher')!;
    expect(packsFor(home, core.home).find(o => o.pack.id === 'core-finisher')!.closed).toMatch(/Already/);
  });

  it('go into a running session where each exercise belongs', () => {
    const idx = getModeData('DAILY').findIndex(c => c.id === 'daily-01');
    useStore.setState({ mode: 'DAILY', circuitIndex: idx, energy: 'NORMAL', screen: 'home', sessionEdits: {} });
    useStore.getState().startWorkout();
    const pack = packsFor(home, useStore.getState().exerciseList.map(e => e.id)).find(o => o.pack.id === 'arms')!;
    useStore.getState().addExtras(pack.ids);
    const st = useStore.getState();
    expect(pack.ids.every(id => st.exerciseList.some(e => e.id === id))).toBe(true);
    expect(st.addedIds).toEqual(expect.arrayContaining(pack.ids));
    useStore.getState().exitWorkout();
  });
});

describe('the edited session runs', () => {
  it('as shown on its page and when started', () => {
    const idx = getModeData('CAVE').findIndex(c => c.id === 'cave-08');
    const edit = removeAt(editFromCircuit(full, localDate()), 1);
    useStore.setState({ mode: 'CAVE', circuitIndex: idx, energy: 'NORMAL', screen: 'home', sessionEdits: { [full.id]: edit } });
    const list = sessionListFor(useStore.getState(), full);
    expect(list.some(e => e.id === full.exercises[1].id)).toBe(false);
    useStore.getState().startWorkout();
    const st = useStore.getState();
    expect(st.exerciseList.some(e => e.id === full.exercises[1].id)).toBe(false);
    expect(st.circuit!.id).toBe('cave-08');
    useStore.getState().exitWorkout();
    useStore.getState().setSessionEdit(full.id, null);
    expect(sessionListFor(useStore.getState(), full).some(e => e.id === full.exercises[1].id)).toBe(true);
  });
});
