import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import { EMPTY_HEALTH, mergeHealth, newBodyMass, climbsToImport, type HealthData } from '@/core/health';
import { latestResult } from '@/core/benchmarks';
import type { ClimbSession } from '@/core/types';
import type { HealthRead } from '@/native/health';

/**
 * What the app keeps from Apple Health, and what a fresh read changes:
 * the stored series, the bodyweight on record, and the climb log.
 */
export interface HealthSlice {
  health: HealthData;
  applyHealthRead: (read: HealthRead) => void;
}

/** Minimum change before a Health weight replaces the one on record, in kg. */
const BODYWEIGHT_STEP = 0.3;

export const createHealthSlice: StateCreator<Store, [], [], HealthSlice> = (set, get) => ({
  health: EMPTY_HEALTH,

  applyHealthRead: (read) => {
    const state = get();
    const health = mergeHealth(state.health ?? EMPTY_HEALTH, read);

    // Bodyweight: every % bodyweight conversion reads the latest result, so a
    // newer Health weight is recorded as one when it has actually moved.
    const current = latestResult(state.benchmarkResults, 'bodyweight');
    const mass = newBodyMass(health, current?.date ?? null);
    if (mass && (!current || Math.abs(current.value - mass.kg) >= BODYWEIGHT_STEP)) {
      state.recordBenchmark({ benchmarkId: 'bodyweight', value: mass.kg, date: `${mass.date}T12:00:00.000Z` });
    }

    // Watch climbing workouts become draft climb sessions: they count for
    // recovery and load at once, and the grades can be added later.
    const logged = new Set(state.climbLog.map(c => c.date));
    const fresh = climbsToImport(read.climbs, health.importedClimbs, logged);
    for (const c of fresh) {
      const session: ClimbSession = {
        id: `hk-${c.id}`, date: c.date, venue: 'GYM', discipline: 'BOULDER', climbs: [],
        durationMin: c.minutes, draft: true, healthId: c.id,
      };
      get().saveClimbSession(session);
    }
    // A logged day with no duration takes the watch's.
    const durations = new Map(read.climbs.map(c => [c.date, c.minutes]));
    const climbLog = get().climbLog.map(c =>
      c.durationMin === undefined && durations.has(c.date) ? { ...c, durationMin: durations.get(c.date) } : c);

    set({
      climbLog,
      health: { ...health, importedClimbs: [...health.importedClimbs, ...read.climbs.map(c => c.id)].filter((v, i, a) => a.indexOf(v) === i) },
    });
  },
});
