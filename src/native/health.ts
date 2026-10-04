/**
 * health.ts — bridge to the local HealthPlugin (ios/App/App/HealthPlugin.swift).
 *
 * Like the rest of src/native/: behind a dynamic import and a platform check,
 * never throws, and a no-op in the browser, where Health does not exist.
 */

import { isNative } from './native';
import type { BodyMass, DayValue, HealthClimb, SleepNight } from '@/core/health';

export interface HealthRead {
  sleep: SleepNight[];
  hrv: DayValue[];
  restingHR: DayValue[];
  bodyMass: BodyMass[];
  climbs: HealthClimb[];
}

export type WorkoutActivity = 'strength' | 'core' | 'functional';

interface HealthPluginApi {
  isAvailable(): Promise<{ available: boolean }>;
  requestAuthorization(): Promise<{ completed: boolean }>;
  query(options: { days: number }): Promise<{
    sleep: SleepNight[]; hrv: DayValue[]; restingHR: DayValue[];
    bodyMass: { date: string; kg: number }[]; climbs: HealthClimb[];
  }>;
  saveWorkout(options: { start: number; end: number; activity: WorkoutActivity; title: string }): Promise<{ saved: boolean }>;
}

let plugin: HealthPluginApi | null = null;

async function getPlugin(): Promise<HealthPluginApi | null> {
  if (!isNative()) return null;
  if (!plugin) {
    const { registerPlugin } = await import('@capacitor/core');
    plugin = registerPlugin<HealthPluginApi>('Health');
  }
  return plugin;
}

export async function healthAvailable(): Promise<boolean> {
  try {
    const p = await getPlugin();
    return p ? (await p.isAvailable()).available : false;
  } catch {
    return false;
  }
}

/**
 * Raise the Health permission sheet. HealthKit never reveals whether reading
 * was allowed, so `true` only means the sheet was answered; a refused type
 * simply reads back empty.
 */
export async function connectHealth(): Promise<boolean> {
  try {
    const p = await getPlugin();
    return p ? (await p.requestAuthorization()).completed : false;
  } catch {
    return false;
  }
}

export async function readHealth(days: number): Promise<HealthRead | null> {
  try {
    const p = await getPlugin();
    if (!p) return null;
    const r = await p.query({ days });
    return {
      sleep: r.sleep ?? [],
      hrv: (r.hrv ?? []).map(d => ({ date: d.date, value: Math.round(d.value * 10) / 10 })),
      restingHR: (r.restingHR ?? []).map(d => ({ date: d.date, value: Math.round(d.value) })),
      bodyMass: (r.bodyMass ?? []).map(d => ({ date: d.date, kg: Math.round(d.kg * 10) / 10 })),
      climbs: r.climbs ?? [],
    };
  } catch {
    return null;
  }
}

export async function saveWorkout(start: Date, end: Date, activity: WorkoutActivity, title: string): Promise<boolean> {
  try {
    const p = await getPlugin();
    return p ? (await p.saveWorkout({ start: start.getTime(), end: end.getTime(), activity, title })).saved : false;
  } catch {
    return false;
  }
}
