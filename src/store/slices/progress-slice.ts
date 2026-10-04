import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { Progress, SessionLogEntry, DecayEvent, LevelUp, BenchmarkResult } from '@/core/types';
import * as Engine from '@/core/engine';
import { addResult } from '@/core/benchmarks';
import type { PersistedKey } from '@/core/backup';
import { localDate, mondayOf } from '@/core/dates';
import { withDefaults } from './settings-slice';

export interface ProgressSlice {
  progress: Progress;
  sessionLog: SessionLogEntry[];
  pendingDecayEvents: DecayEvent[];
  sessionLevelUps: LevelUp[];
  /** Recorded test results. These set training loads and open safety gates. */
  benchmarkResults: BenchmarkResult[];
  /** Monday the current training block was started from Settings; null counts from the first session. */
  blockStart: string | null;

  runDecayCheck: () => void;
  dismissDecay: () => void;
  recordBenchmark: (result: BenchmarkResult) => void;
  resetAllData: () => void;
  /** Session effort for the session just finished. */
  rateLastSession: (effort: number) => void;
  /** Start a new build block this week. */
  restartBlock: () => void;
  /** Replace everything persisted with a backup's contents. */
  importBackup: (data: Partial<Record<PersistedKey, unknown>>) => void;
}

export const createProgressSlice: StateCreator<Store, [], [], ProgressSlice> = (set, get) => ({
  progress: {},
  sessionLog: [],
  pendingDecayEvents: [],
  sessionLevelUps: [],
  benchmarkResults: [],
  blockStart: null,

  runDecayCheck: () => {
    const { progress } = get();
    const { progress: newProgress, decayEvents } = Engine.checkDecay(progress);
    if (decayEvents.length > 0) {
      set({ progress: newProgress, pendingDecayEvents: decayEvents });
    }
  },

  dismissDecay: () => set({ pendingDecayEvents: [] }),

  recordBenchmark: (result) => set(state => ({
    benchmarkResults: addResult(state.benchmarkResults, result),
  })),

  rateLastSession: (effort) => set(state => {
    if (state.sessionLog.length === 0) return {};
    const log = [...state.sessionLog];
    log[log.length - 1] = { ...log[log.length - 1], effort };
    return { sessionLog: log };
  }),

  restartBlock: () => set({ blockStart: mondayOf(localDate()) }),

  resetAllData: () => set({
    blockStart: null,
    settings: withDefaults(undefined),
    progress: {},
    sessionLog: [],
    pendingDecayEvents: [],
    sessionLevelUps: [],
    benchmarkResults: [],
    loadLog: [],
    pendingLoad: null,
    climbLog: [],
    editingClimbId: null,
  }),

  // A backup replaces, never merges: two histories of the same days would
  // double every count on STATS. Keys the backup does not carry start empty.
  importBackup: (data) => {
    get().resetAllData();
    const { settings, ...rest } = data as Partial<Store>;
    set({ ...rest, settings: withDefaults(settings) });
  },
});
