import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { Progress, SessionLogEntry, DecayEvent, LevelUp, BenchmarkResult } from '@/core/types';
import * as Engine from '@/core/engine';

export interface ProgressSlice {
  progress: Progress;
  sessionLog: SessionLogEntry[];
  pendingDecayEvents: DecayEvent[];
  sessionLevelUps: LevelUp[];
  /** Recorded test results. These set training loads and open safety gates. */
  benchmarkResults: BenchmarkResult[];

  runDecayCheck: () => void;
  dismissDecay: () => void;
  recordBenchmark: (result: BenchmarkResult) => void;
  resetAllData: () => void;
}

export const createProgressSlice: StateCreator<Store, [], [], ProgressSlice> = (set, get) => ({
  progress: {},
  sessionLog: [],
  pendingDecayEvents: [],
  sessionLevelUps: [],
  benchmarkResults: [],

  runDecayCheck: () => {
    const { progress } = get();
    const { progress: newProgress, decayEvents } = Engine.checkDecay(progress);
    if (decayEvents.length > 0) {
      set({ progress: newProgress, pendingDecayEvents: decayEvents });
    }
  },

  dismissDecay: () => set({ pendingDecayEvents: [] }),

  recordBenchmark: (result) => set(state => ({
    benchmarkResults: [
      ...state.benchmarkResults.filter(r => r.benchmarkId !== result.benchmarkId),
      result,
    ],
  })),

  resetAllData: () => set({
    progress: {},
    sessionLog: [],
    pendingDecayEvents: [],
    sessionLevelUps: [],
    benchmarkResults: [],
    loadLog: [],
    pendingLoad: null,
  }),
});
