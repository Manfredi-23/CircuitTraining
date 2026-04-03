import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { Progress, SessionLogEntry, DecayEvent, LevelUp } from '@/core/types';
import * as Engine from '@/core/engine';

export interface ProgressSlice {
  progress: Progress;
  sessionLog: SessionLogEntry[];
  pendingDecayEvents: DecayEvent[];
  sessionLevelUps: LevelUp[];

  runDecayCheck: () => void;
  dismissDecay: () => void;
  resetAllData: () => void;
}

export const createProgressSlice: StateCreator<Store, [], [], ProgressSlice> = (set, get) => ({
  progress: {},
  sessionLog: [],
  pendingDecayEvents: [],
  sessionLevelUps: [],

  runDecayCheck: () => {
    const { progress } = get();
    const { progress: newProgress, decayEvents } = Engine.checkDecay(progress);
    if (decayEvents.length > 0) {
      set({ progress: newProgress, pendingDecayEvents: decayEvents });
    }
  },

  dismissDecay: () => set({ pendingDecayEvents: [] }),

  resetAllData: () => set({
    progress: {},
    sessionLog: [],
    pendingDecayEvents: [],
    sessionLevelUps: [],
  }),
});
