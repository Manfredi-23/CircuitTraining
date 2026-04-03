import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAppSlice, type AppSlice } from './slices/app-slice';
import { createWorkoutSlice, type WorkoutSlice } from './slices/workout-slice';
import { createProgressSlice, type ProgressSlice } from './slices/progress-slice';
import { createStatsSlice, type StatsSlice } from './slices/stats-slice';

export type Store = AppSlice & WorkoutSlice & ProgressSlice & StatsSlice & {
  _nextAction?: 'complete';
};

export const useStore = create<Store>()(
  persist(
    (...a) => ({
      ...createAppSlice(...a),
      ...createWorkoutSlice(...a),
      ...createProgressSlice(...a),
      ...createStatsSlice(...a),
    }),
    {
      name: '7bit_store',
      partialize: (state) => ({
        progress: state.progress,
        sessionLog: state.sessionLog,
      }),
    }
  )
);
