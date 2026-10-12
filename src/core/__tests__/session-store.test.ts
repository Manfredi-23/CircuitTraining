import { describe, it, expect } from 'vitest';
import { useStore } from '../../store/store';
import { getModeData } from '../data-index';

describe('the running session', () => {
  it('rebuilds what is left when energy changes mid-session, keeping extras and the sets done', () => {
    const s = useStore.getState();
    const idx = getModeData('DAILY').findIndex(c => c.id === 'daily-01');
    useStore.setState({ mode: 'DAILY', circuitIndex: idx, energy: 'NORMAL' });
    s.startWorkout();
    // Move to the push-ups (third exercise) and add an extra.
    useStore.getState().exerciseSkip();
    useStore.getState().exerciseSkip();
    useStore.getState().addExtra('extra-band-curl');
    const before = useStore.getState().exerciseList;
    const pushBefore = before.find(e => e.id === 'daily-spiderman')!.scaledSets;

    useStore.getState().switchEnergy('FRESH');
    const st = useStore.getState();
    expect(st.energy).toBe('FRESH');
    expect(st.exerciseList.slice(0, 3).map(e => e.id)).toEqual(before.slice(0, 3).map(e => e.id));
    expect(st.exerciseList.find(e => e.id === 'daily-spiderman')!.scaledSets).toBe(pushBefore + 1);
    expect(st.exerciseList.some(e => e.id === 'extra-band-curl')).toBe(true);
    expect(st.currentExercise!.scaledSets).toBeGreaterThanOrEqual(st.setIndex);

    useStore.getState().switchEnergy('TIRED');
    expect(useStore.getState().exerciseList.find(e => e.id === 'daily-spiderman')!.scaledSets).toBe(pushBefore - 1);
  });

  it('cuts the session to the time set on the TODAY sheet', () => {
    const idx = getModeData('DAILY').findIndex(c => c.id === 'daily-01');
    useStore.setState({ mode: 'DAILY', circuitIndex: idx, energy: 'NORMAL', screen: 'home' });
    useStore.getState().updateDay({ minutes: 10 });
    useStore.getState().startWorkout();
    const list = useStore.getState().exerciseList;
    const full = getModeData('DAILY')[idx].exercises.length;
    expect(list.length).toBeLessThan(full);
    useStore.getState().clearDay();
  });
});
