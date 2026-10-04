import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { Circuit, ScaledExercise, Capacity, LevelUp } from '@/core/types';
import { getModeData } from '@/core/data-index';
import * as Engine from '@/core/engine';
import { benchmarkValueFromEntry, currentBodyweight, getBenchmark, latestResult } from '@/core/benchmarks';
import { getBlockWeek, deloads } from '@/core/block';
import { isPersonalBest } from '@/core/progression';
import { getLoadAxis, formatLoad } from '@/core/load';

/**
 * The session as it will run: level, energy, gates, and the deload week. The
 * home card and the workout build it the same way, so the duration on the card
 * is the session you get.
 */
export function sessionListFor(
  state: Pick<Store, 'energy' | 'progress' | 'benchmarkResults' | 'blockStart' | 'sessionLog'>,
  circuit: Circuit,
  now = new Date(),
): ScaledExercise[] {
  const deload = getBlockWeek(state.blockStart, state.sessionLog, now).deload && deloads(circuit);
  return Engine.buildList(circuit, state.energy, state.progress, state.benchmarkResults, { deload });
}

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
  /** Sets marked DONE per exercise id in this session; written to the session log. */
  doneSets: Record<string, number>;
  /** Best clean attempt so far on a ramp test, as entered on the stepper. */
  rampBest: number | null;
  /** Pain score given before this session, when it was asked. */
  sessionPain: number | null;
  /** Personal bests set in this session, as display lines. */
  sessionPBs: string[];

  /** Start the selected session. `pain` is the pre-session score, for finger sessions. */
  startWorkout: (pain?: number) => void;
  exerciseDone: () => void;
  /** Ramp test: this attempt was clean. Rest, then a harder one. */
  attemptMade: () => void;
  /** Ramp test: this attempt failed. The test ends on the best clean attempt. */
  attemptFailed: () => void;
  /** Ramp test: stop here and keep the best clean attempt. */
  finishRamp: () => void;
  /** Close the current exercise: save its result, award XP, move on. */
  finishExercise: (entry: number | null) => void;
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
  doneSets: {},
  rampBest: null,
  sessionPain: null,
  sessionPBs: [],

  startWorkout: (pain) => {
    const { mode, circuitIndex } = get();
    const circuits = getModeData(mode);
    const circuit = circuits[circuitIndex];
    const exerciseList = Engine.applyPainCheck(sessionListFor(get(), circuit), pain);

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
      doneSets: {},
      rampBest: null,
      sessionPain: pain ?? null,
      sessionPBs: [],
      sessionLevelUps: [],
      screen: 'workout',
    });

    get().primeLoad(exerciseList[0] || null);
  },

  exerciseDone: () => {
    const { setIndex, currentExercise, doneSets } = get();
    if (!currentExercise) return;
    set({ doneSets: { ...doneSets, [currentExercise.id]: (doneSets[currentExercise.id] ?? 0) + 1 } });

    // More sets of this exercise still to do: rest, then repeat.
    if (setIndex < currentExercise.scaledSets) {
      set({ setIndex: setIndex + 1, formGuideOpen: false, screen: 'rest' });
      return;
    }

    get().finishExercise(get().pendingLoad);
  },

  attemptMade: () => {
    const { currentExercise, pendingLoad, rampBest, setIndex, doneSets } = get();
    if (!currentExercise?.ramp) return;
    set({ doneSets: { ...doneSets, [currentExercise.id]: (doneSets[currentExercise.id] ?? 0) + 1 } });
    const lower = getBenchmark(currentExercise.records?.benchmarkId ?? '')?.better === 'lower';
    const best = pendingLoad === null ? rampBest
      : rampBest === null ? pendingLoad
      : lower ? Math.min(rampBest, pendingLoad) : Math.max(rampBest, pendingLoad);
    if (setIndex >= currentExercise.ramp.maxAttempts) {
      set({ rampBest: best });
      get().finishExercise(best);
      return;
    }
    set({ rampBest: best, setIndex: setIndex + 1, formGuideOpen: false, screen: 'rest' });
  },

  attemptFailed: () => {
    const { currentExercise, doneSets } = get();
    if (!currentExercise?.ramp) return;
    set({ doneSets: { ...doneSets, [currentExercise.id]: (doneSets[currentExercise.id] ?? 0) + 1 } });
    get().finishExercise(get().rampBest);
  },

  finishRamp: () => {
    if (!get().currentExercise?.ramp) return;
    get().finishExercise(get().rampBest);
  },

  finishExercise: (entry) => {
    const { exerciseList, stepIndex, currentExercise, progress, benchmarkResults } = get();
    if (!currentExercise) return;

    // Award XP once, and record what was actually on the belt. Both happen once
    // per exercise, at the same moment. A test also saves its result as a
    // benchmark: this is what opens gates. Percent-of-bodyweight results use the
    // bodyweight on record, which this same session may have just updated.
    // A ramp test saves its best clean attempt, not the last thing on the stepper.
    // Personal bests earn XP on top of the set: levels should track getting
    // stronger, not only turning up. Judged before this result is written.
    let bonus = 0;
    const pbs = [...get().sessionPBs];
    if (currentExercise.records && entry !== null) {
      const bench = getBenchmark(currentExercise.records.benchmarkId);
      const before = latestResult(benchmarkResults, currentExercise.records.benchmarkId);
      const value = benchmarkValueFromEntry(currentExercise.records, entry, currentBodyweight(benchmarkResults));
      const better = before && bench
        && (bench.better === 'lower' ? value < before.value : value > before.value)
        && before.date.slice(0, 10) !== new Date().toISOString().slice(0, 10);
      if (better) {
        bonus += Engine.PB_TEST_XP;
        pbs.push(`${bench!.name}: ${value} ${bench!.short ?? ''} (was ${before!.value})`.trim());
      }
    } else if (get().pendingLoad !== null) {
      const today = new Date().toISOString().slice(0, 10);
      if (isPersonalBest(currentExercise, get().pendingLoad!, get().loadLog, today)) {
        bonus += Engine.PB_LOAD_XP;
        pbs.push(`${currentExercise.displayName}: ${formatLoad(get().pendingLoad!, getLoadAxis(currentExercise)!)}`);
      }
    }

    if (currentExercise.records && entry !== null) {
      get().recordBenchmark({
        benchmarkId: currentExercise.records.benchmarkId,
        value: benchmarkValueFromEntry(
          currentExercise.records, entry, currentBodyweight(benchmarkResults),
        ),
        date: new Date().toISOString(),
      });
    }
    if (currentExercise.ramp) {
      if (entry !== null) set({ pendingLoad: entry });
      else set({ pendingLoad: null });
    }
    get().commitLoad(currentExercise);
    const earned = Engine.applyXP(progress, currentExercise, 'done');
    const newProgress = bonus ? Engine.applyBonusXP(earned, currentExercise.capacities, bonus) : earned;

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
      set({ progress: newProgress, sessionLevelUps, sessionPBs: pbs });
      get().completeSession();
      return;
    }

    set({
      progress: newProgress,
      sessionLevelUps,
      sessionPBs: pbs,
      stepIndex: nextStep,
      setIndex: 1,
      currentExercise: exerciseList[nextStep],
      swapActive: false,
      formGuideOpen: false,
      rampBest: null,
      screen: 'rest',
    });

    get().primeLoad(exerciseList[nextStep]);
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
      rampBest: null,
      screen: 'workout',
    });

    get().primeLoad(exerciseList[nextStep]);
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
      pendingLoad: null,
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
    const { circuit, mode, energy, sessionStartTime, progress, exerciseList, doneSets, sessionPain } = get();
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
      sets: doneSets,
      planned: Object.fromEntries(exerciseList.map(ex => [ex.id, ex.scaledSets])),
      ...(sessionPain !== null ? { pain: sessionPain } : {}),
    }];

    set({ progress: newProgress, sessionLog, screen: 'complete' });
  },
});

export type { LevelUp };
