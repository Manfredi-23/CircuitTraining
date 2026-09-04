import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { Circuit, ScaledExercise, Capacity, LevelUp } from '@/core/types';
import { getModeData } from '@/core/data-index';
import * as Engine from '@/core/engine';

/**
 * Sessions run as sets within an exercise, not rounds of a circuit.
 *
 * The old flow did one rep of everything and then looped three times, which is
 * a conditioning format. Strength work needs consecutive sets of the same
 * movement with full rest between them, so the athlete stays in one position
 * and one load while the quality is there.
 */
export interface WorkoutSlice {
  circuit: Circuit | null;
  exerciseList: ScaledExercise[];
  stepIndex: number;
  /** 1-based set counter within the current exercise. */
  setIndex: number;
  currentExercise: ScaledExercise | null;
  sessionStartTime: number | null;
  swapActive: boolean;
  formGuideOpen: boolean;
  exerciseTimerActive: boolean;

  startWorkout: () => void;
  exerciseDone: () => void;
  exerciseSkip: () => void;
  exitWorkout: () => void;
  toggleSwap: () => void;
  toggleFormGuide: () => void;
  setExerciseTimerActive: (active: boolean) => void;
  completeSession: () => void;
}

export const createWorkoutSlice: StateCreator<Store, [], [], WorkoutSlice> = (set, get) => ({
  circuit: null,
  exerciseList: [],
  stepIndex: 0,
  setIndex: 1,
  currentExercise: null,
  sessionStartTime: null,
  swapActive: false,
  formGuideOpen: false,
  exerciseTimerActive: false,

  startWorkout: () => {
    const { mode, circuitIndex, energy, progress, benchmarkResults } = get();
    const circuits = getModeData(mode);
    const circuit = circuits[circuitIndex];
    const exerciseList = Engine.buildList(circuit, energy, progress, benchmarkResults);

    set({
      circuit,
      exerciseList,
      stepIndex: 0,
      setIndex: 1,
      currentExercise: exerciseList[0] || null,
      sessionStartTime: Date.now(),
      swapActive: false,
      formGuideOpen: false,
      exerciseTimerActive: false,
      screen: 'workout',
    });
  },

  exerciseDone: () => {
    const { exerciseList, stepIndex, setIndex, currentExercise, progress } = get();
    if (!currentExercise) return;

    // More sets of this exercise still to do: rest, then repeat.
    if (setIndex < currentExercise.scaledSets) {
      set({ setIndex: setIndex + 1, formGuideOpen: false, screen: 'rest' });
      return;
    }

    // Last set of the exercise — award XP once, for the whole exercise.
    const newProgress = Engine.applyXP(progress, currentExercise, 'done');

    const sessionLevelUps = [...get().sessionLevelUps];
    for (const c of currentExercise.capacities) {
      const prevLevel = Engine.getCapacityLevel(progress, c);
      const newLevel = Engine.getCapacityLevel(newProgress, c);
      if (newLevel > prevLevel) {
        const levelData = Engine.getLevelData(Engine.getXPForLevel(newLevel));
        sessionLevelUps.push({ capacity: c, level: newLevel, unlocks: levelData.unlocks });
      }
    }

    const nextStep = stepIndex + 1;

    if (nextStep >= exerciseList.length) {
      set({ progress: newProgress, sessionLevelUps });
      get().completeSession();
      return;
    }

    set({
      progress: newProgress,
      sessionLevelUps,
      stepIndex: nextStep,
      setIndex: 1,
      currentExercise: exerciseList[nextStep],
      swapActive: false,
      formGuideOpen: false,
      screen: 'rest',
    });
  },

  /**
   * Skipping moves on without earning XP and without any penalty. The whole
   * exercise is skipped, remaining sets included — a half-done max-hang set is
   * worse than none.
   */
  exerciseSkip: () => {
    const { exerciseList, stepIndex, currentExercise, progress } = get();
    if (!currentExercise) return;

    const newProgress = Engine.applyXP(progress, currentExercise, 'skip');
    const nextStep = stepIndex + 1;

    if (nextStep >= exerciseList.length) {
      set({ progress: newProgress });
      get().completeSession();
      return;
    }

    set({
      progress: newProgress,
      stepIndex: nextStep,
      setIndex: 1,
      currentExercise: exerciseList[nextStep],
      swapActive: false,
      formGuideOpen: false,
      screen: 'workout',
    });
  },

  exitWorkout: () => {
    const { exerciseList, stepIndex, progress } = get();
    const newProgress = Engine.applyQuitPenalty(progress, exerciseList.slice(stepIndex));

    set({
      progress: newProgress,
      circuit: null,
      exerciseList: [],
      stepIndex: 0,
      setIndex: 1,
      currentExercise: null,
      sessionStartTime: null,
      screen: 'home',
    });
  },

  toggleSwap: () => {
    const { swapActive, currentExercise, progress } = get();
    if (!currentExercise?.variations || currentExercise.variations.length < 2) return;

    if (swapActive) {
      const best = Engine.getBestVariation(currentExercise, progress);
      set({
        swapActive: false,
        currentExercise: {
          ...currentExercise,
          displayName: best?.name || currentExercise.name,
          activeVariation: best,
          loadText: best?.load || currentExercise.load.text,
        },
      });
    } else {
      const base = currentExercise.variations[0];
      set({
        swapActive: true,
        currentExercise: {
          ...currentExercise,
          displayName: base.name,
          activeVariation: base,
          loadText: base.load || currentExercise.load.text,
        },
      });
    }
  },

  toggleFormGuide: () => set(s => ({ formGuideOpen: !s.formGuideOpen })),

  setExerciseTimerActive: (active) => set({ exerciseTimerActive: active }),

  completeSession: () => {
    const { circuit, mode, energy, sessionStartTime, progress, exerciseList } = get();
    if (!circuit) return;

    const duration = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 60000) : 0;

    const trained = new Set<Capacity>();
    exerciseList.forEach(ex => ex.capacities.forEach(c => trained.add(c)));

    const newProgress = Engine.recordHistory(progress, Array.from(trained));

    const sessionLog = [...get().sessionLog, {
      date: new Date().toISOString(),
      mode,
      circuitId: circuit.id,
      circuitTitle: circuit.title,
      energy,
      duration,
    }];

    set({ progress: newProgress, sessionLog, screen: 'complete' });
  },
});

export type { LevelUp };
