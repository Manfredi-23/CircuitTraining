import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CONFIG } from '@/core/config';
import type { SessionLogEntry } from '@/core/types';
import { PERSISTED_KEYS } from '@/core/backup';
import { createAppSlice, type AppSlice } from './slices/app-slice';
import { createWorkoutSlice, type WorkoutSlice } from './slices/workout-slice';
import { createProgressSlice, type ProgressSlice } from './slices/progress-slice';
import { createStatsSlice, type StatsSlice } from './slices/stats-slice';
import { createLoadSlice, type LoadSlice } from './slices/load-slice';
import { createClimbSlice, type ClimbSlice } from './slices/climb-slice';
import { createSettingsSlice, withDefaults, type SettingsSlice, type AppSettings } from './slices/settings-slice';

export type Store = AppSlice & WorkoutSlice & ProgressSlice & StatsSlice & LoadSlice & ClimbSlice & SettingsSlice;

/** Bumped when the persisted shape changes. 2 = the v10 capacity model. */
const PERSIST_VERSION = 2;

interface PersistedShape {
  progress?: Record<string, unknown>;
  sessionLog?: SessionLogEntry[];
  benchmarkResults?: unknown[];
  loadLog?: unknown[];
  climbLog?: unknown[];
  settings?: Partial<AppSettings>;
}

/**
 * Is this blob keyed by v9 muscle groups rather than v10 capacities?
 *
 * Detected from the content rather than from the version number, because the
 * version number is the thing that was missing: persist ran without `version`
 * until now, so every existing install — v9 data and v10 data alike — reports
 * version 0. Trusting that number would wipe progress earned since the v10
 * merge. The keys themselves are unambiguous: `chest` and `biceps` cannot
 * appear in a v10 blob, and no v9 blob knows about `crimp` or `tension`.
 */
function isPreCapacityData(progress: Record<string, unknown> | undefined): boolean {
  if (!progress) return false;
  const capacities = new Set<string>(CONFIG.capacities);
  return Object.keys(progress).some(key => !capacities.has(key));
}

/**
 * Strip a pre-capacity blob back to what is still meaningful.
 *
 * Applied from `merge`, not from `migrate`. persist only calls `migrate` when
 * the stored blob carries a numeric `version`, and no existing install does —
 * `version` was never configured until now, so v9 and early-v10 data alike
 * deserialise with `version: undefined` and skip migration entirely. `merge`
 * runs on every hydration, which is the only hook legacy data actually reaches.
 * It is idempotent: once the foreign keys are gone this is a no-op.
 */
function dropPreCapacityProgress(incoming: PersistedShape): PersistedShape {
  return {
    // The session log is a plain record of what was done and when — date,
    // mode, circuit, energy, duration. The capacity rewrite touched none of
    // those fields, so the training history survives intact.
    sessionLog: incoming.sessionLog ?? [],

    // Progress does not survive, and should not. v9 XP counted exercises
    // completed against twelve bodybuilding muscle groups; v10 levels move
    // load targets and open safety gates. Carrying those numbers across would
    // prescribe edges, variations and weights that were never earned under
    // this model — the wrong direction to be wrong in on finger work.
    //
    // Only `legs` even shares a name across the two models, so the honest
    // alternative was one capacity at its old level and nine at L1. Levels
    // move fast at the bottom; a clean start is worth more than that.
    progress: {},

    // None of these existed before v10, so there is nothing to carry.
    benchmarkResults: [],
    loadLog: [],
    climbLog: [],
  };
}

/** Reserved for future versioned migrations, which will carry a real version. */
function migrate(persisted: unknown, version: number): PersistedShape {
  const old = (persisted ?? {}) as PersistedShape;
  if (version >= PERSIST_VERSION) return old;
  return isPreCapacityData(old.progress) ? dropPreCapacityProgress(old) : old;
}

export const useStore = create<Store>()(
  persist(
    (...a) => ({
      ...createAppSlice(...a),
      ...createWorkoutSlice(...a),
      ...createProgressSlice(...a),
      ...createStatsSlice(...a),
      ...createLoadSlice(...a),
      ...createClimbSlice(...a),
      ...createSettingsSlice(...a),
    }),
    {
      name: '7bit_store',
      version: PERSIST_VERSION,
      migrate,
      merge: (persisted, current) => {
        const incoming = (persisted ?? {}) as PersistedShape;
        const resolved = isPreCapacityData(incoming.progress)
          ? dropPreCapacityProgress(incoming)
          : incoming;
        // Settings gain keys over time; an older blob gets the new defaults.
        return { ...(current as Store), ...resolved, settings: withDefaults(resolved.settings) } as Store;
      },
      // Every persisted key is listed once, in backup.ts, so a backup can never
      // leave one out.
      partialize: (state) => Object.fromEntries(
        PERSISTED_KEYS.map(k => [k, (state as unknown as Record<string, unknown>)[k]]),
      ) as Partial<Store>,
    }
  )
);
