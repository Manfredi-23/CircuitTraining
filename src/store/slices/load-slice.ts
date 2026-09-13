import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { Exercise, LoadLogEntry } from '@/core/types';
import { getLoadAxis, getOpeningLoad, clampToAxis } from '@/core/load';

/**
 * Load logging.
 *
 * `pendingLoad` is the number showing on the workout card for the exercise in
 * hand. It is primed from the last session whenever the exercise changes, and
 * committed to `loadLog` when the exercise is finished — once per exercise, the
 * same moment XP is awarded. Skipping commits nothing, because nothing was
 * lifted.
 */
export interface LoadSlice {
  loadLog: LoadLogEntry[];
  /** Staged value for the current exercise; null when it has no load axis. */
  pendingLoad: number | null;

  primeLoad: (exercise: Exercise | null) => void;
  adjustLoad: (steps: number) => void;
  commitLoad: (exercise: Exercise) => void;
  clearLoadLog: () => void;
}

export const createLoadSlice: StateCreator<Store, [], [], LoadSlice> = (set, get) => ({
  loadLog: [],
  pendingLoad: null,

  primeLoad: (exercise) => {
    if (!exercise || !getLoadAxis(exercise)) {
      set({ pendingLoad: null });
      return;
    }
    set({ pendingLoad: getOpeningLoad(exercise, get().loadLog) });
  },

  /** Moves the stepper by `steps` increments of the exercise's own axis. */
  adjustLoad: (steps) => {
    const { pendingLoad, currentExercise } = get();
    if (pendingLoad === null || !currentExercise) return;
    const axis = getLoadAxis(currentExercise);
    if (!axis) return;
    set({ pendingLoad: clampToAxis(pendingLoad + steps * axis.step, axis) });
  },

  commitLoad: (exercise) => {
    const { pendingLoad, loadLog } = get();
    const axis = getLoadAxis(exercise);
    if (pendingLoad === null || !axis) return;

    const date = new Date().toISOString().slice(0, 10);
    const entry: LoadLogEntry = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      date,
      value: pendingLoad,
      unit: axis.unit,
    };

    // One entry per exercise per day. Repeating a session the same day (the
    // density block is designed for exactly that) overwrites rather than
    // stacking, so the history reads as one point per training day.
    const withoutToday = loadLog.filter(
      e => !(e.exerciseId === entry.exerciseId && e.date === date),
    );
    set({ loadLog: [...withoutToday, entry] });
  },

  clearLoadLog: () => set({ loadLog: [], pendingLoad: null }),
});
