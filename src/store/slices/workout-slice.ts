import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { Circuit, ScaledExercise, MuscleGroup, LevelUp } from '@/core/types';
import { getModeData } from '@/core/data-index';
import * as Engine from '@/core/engine';

export interface WorkoutSlice {
  circuit: Circuit | null;
  exerciseList: ScaledExercise[];
  stepIndex: number;
  round: number;
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
  round: 1,
  currentExercise: null,
  sessionStartTime: null,
  swapActive: false,
  formGuideOpen: false,
  exerciseTimerActive: false,

  startWorkout: () => {
    const { mode, circuitIndex, energy, progress } = get();
    const circuits = getModeData(mode);
    const circuit = circuits[circuitIndex];
    const exerciseList = Engine.buildList(circuit, energy, progress);
    const currentExercise = exerciseList[0] || null;

    set({
      circuit,
      exerciseList,
      stepIndex: 0,
      round: 1,
      currentExercise,
      sessionStartTime: Date.now(),
      swapActive: false,
      formGuideOpen: false,
      exerciseTimerActive: false,
      screen: 'workout',
    });
  },

  exerciseDone: () => {
    const { exerciseList, stepIndex, round, currentExercise, progress } = get();
    if (!currentExercise) return;

    // Apply XP
    const newProgress = Engine.applyXP(progress, currentExercise, 'done');

    // Check for level ups
    const sessionLevelUps = [...get().sessionLevelUps];
    for (const m of currentExercise.muscles) {
      const prevLevel = Engine.getMuscleLevel(progress, m);
      const newLevel = Engine.getMuscleLevel(newProgress, m);
      if (newLevel > prevLevel) {
        const levelData = Engine.getLevelData(Engine.getXPForLevel(newLevel));
        sessionLevelUps.push({ muscle: m, level: newLevel, unlocks: levelData.unlocks });
      }
    }

    const nextStep = stepIndex + 1;
    const rounds = currentExercise.rounds;

    if (nextStep >= exerciseList.length) {
      // End of round
      if (round < rounds) {
        // Next round
        set({
          progress: newProgress,
          sessionLevelUps,
          stepIndex: 0,
          round: round + 1,
          currentExercise: exerciseList[0],
          swapActive: false,
          formGuideOpen: false,
          screen: 'rest',
        });
      } else {
        // Session complete
        set({ progress: newProgress, sessionLevelUps, screen: 'rest' });
        // After rest, go to complete
        set({ _nextAction: 'complete' as const });
      }
    } else {
      set({
        progress: newProgress,
        sessionLevelUps,
        stepIndex: nextStep,
        currentExercise: exerciseList[nextStep],
        swapActive: false,
        formGuideOpen: false,
        screen: 'rest',
      });
    }
  },

  exerciseSkip: () => {
    const { exerciseList, stepIndex, round, currentExercise, progress } = get();
    if (!currentExercise) return;

    const newProgress = Engine.applyXP(progress, currentExercise, 'skip');
    const nextStep = stepIndex + 1;
    const rounds = currentExercise.rounds;

    if (nextStep >= exerciseList.length) {
      if (round < rounds) {
        set({
          progress: newProgress,
          stepIndex: 0,
          round: round + 1,
          currentExercise: exerciseList[0],
          swapActive: false,
          formGuideOpen: false,
          screen: 'workout',
        });
      } else {
        get().completeSession();
        set({ progress: newProgress });
      }
    } else {
      set({
        progress: newProgress,
        stepIndex: nextStep,
        currentExercise: exerciseList[nextStep],
        swapActive: false,
        formGuideOpen: false,
        screen: 'workout',
      });
    }
  },

  exitWorkout: () => {
    const { exerciseList, stepIndex, progress } = get();
    const remaining = exerciseList.slice(stepIndex);
    const newProgress = Engine.applyQuitPenalty(progress, remaining);

    set({
      progress: newProgress,
      circuit: null,
      exerciseList: [],
      stepIndex: 0,
      round: 1,
      currentExercise: null,
      sessionStartTime: null,
      screen: 'home',
    });
  },

  toggleSwap: () => {
    const { swapActive, currentExercise, progress } = get();
    if (!currentExercise?.variations || currentExercise.variations.length < 2) return;

    if (swapActive) {
      // Revert to best variation
      const best = Engine.getBestVariation(currentExercise, progress);
      set({
        swapActive: false,
        currentExercise: { ...currentExercise, displayName: best?.name || currentExercise.name, activeVariation: best },
      });
    } else {
      // Swap to base variation
      const base = currentExercise.variations[0];
      set({
        swapActive: true,
        currentExercise: { ...currentExercise, displayName: base.name, activeVariation: base },
      });
    }
  },

  toggleFormGuide: () => set(s => ({ formGuideOpen: !s.formGuideOpen })),

  setExerciseTimerActive: (active) => set({ exerciseTimerActive: active }),

  completeSession: () => {
    const { circuit, mode, energy, sessionStartTime, progress, exerciseList } = get();
    if (!circuit) return;

    const duration = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 60000) : 0;

    // Collect all trained muscles
    const trainedMuscles = new Set<MuscleGroup>();
    exerciseList.forEach(ex => ex.muscles.forEach(m => trainedMuscles.add(m)));
    const trainedArr = Array.from(trainedMuscles);

    // Record history
    const newProgress = Engine.recordHistory(progress, trainedArr);

    // Add to session log
    const sessionLog = [...get().sessionLog, {
      date: new Date().toISOString(),
      mode,
      circuitId: circuit.id,
      circuitTitle: circuit.title,
      energy,
      duration,
    }];

    set({
      progress: newProgress,
      sessionLog,
      screen: 'complete',
    });
  },
});
