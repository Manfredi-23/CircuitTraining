/**
 * health.ts — bridge to the local HealthPlugin (ios/App/App/HealthPlugin.swift).
 *
 * Like the rest of src/native/: behind a dynamic import and a platform check,
 * never throws, and a no-op in the browser, where Health does not exist.
 */

import { isNative } from './native';
import type { BodyMass, DayValue, HealthClimb, HealthConnect, HealthOutdoor, SleepNight } from '@/core/health';

export interface HealthRead {
  sleep: SleepNight[];
  hrv: DayValue[];
  restingHR: DayValue[];
  bodyMass: BodyMass[];
  climbs: HealthClimb[];
  /** Hikes, runs, rides and the like. Empty from a build older than the Swift that reads them. */
  outdoor: HealthOutdoor[];
  /** What HealthKit said when a query failed, one line per data type. */
  errors?: string[];
}

export type WorkoutActivity = 'strength' | 'core' | 'functional';

interface HealthPluginApi {
  isAvailable(): Promise<{ available: boolean; sheet?: string }>;
  requestAuthorization(): Promise<{ completed: boolean; error?: string }>;
  query(options: { days: number }): Promise<{
    sleep: SleepNight[]; hrv: DayValue[]; restingHR: DayValue[];
    bodyMass: { date: string; kg: number }[]; climbs: HealthClimb[]; outdoor?: HealthOutdoor[]; errors?: string[];
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

/** A plugin call Capacitor could not route: the native plugin is not in this build. */
function isMissingPlugin(e: unknown): boolean {
  const err = e as { code?: string; message?: string } | null;
  return err?.code === 'UNIMPLEMENTED' || /not implemented/i.test(err?.message ?? '');
}

/**
 * Raise the Health permission sheet, and say exactly what went wrong if it
 * did not open. HealthKit never reveals whether reading was allowed, so `ok`
 * only means the sheet was answered; a refused type simply reads back empty.
 */
export async function connectHealth(): Promise<HealthConnect> {
  const p = await getPlugin().catch(() => null);
  if (!p) return { ok: false, reason: 'web' };
  try {
    const a = await p.isAvailable();
    if (!a.available) return { ok: false, reason: 'unavailable' };
  } catch (e) {
    return isMissingPlugin(e)
      ? { ok: false, reason: 'missing-plugin' }
      : { ok: false, reason: 'error', detail: (e as Error)?.message ?? String(e) };
  }
  try {
    const r = await p.requestAuthorization();
    return r.completed ? { ok: true } : { ok: false, reason: 'error', detail: r.error || 'The permission sheet did not complete.' };
  } catch (e) {
    return { ok: false, reason: isMissingPlugin(e) ? 'missing-plugin' : 'error', detail: (e as Error)?.message ?? String(e) };
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
      outdoor: r.outdoor ?? [],
      errors: r.errors ?? [],
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
