import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import { localDate } from '@/core/dates';
import { activeDay, setOffDay, type DayPlan } from '@/core/today';

/**
 * The TODAY sheet: time, kit, soreness and rest or sick days (core/today.ts).
 * A change made on a later day starts a fresh plan, carrying over only the
 * soreness still running. Marking REST or SICK also records the date in
 * `offDays`, which decay skips.
 */
export interface DaySlice {
  dayPlan: DayPlan | null;
  offDays: string[];
  updateDay: (patch: Partial<Omit<DayPlan, 'date'>>) => void;
  clearDay: () => void;
}

export const createDaySlice: StateCreator<Store, [], [], DaySlice> = (set, get) => ({
  dayPlan: null,
  offDays: [],

  updateDay: (patch) => {
    const today = localDate();
    const { dayPlan, offDays } = get();
    const base: DayPlan = dayPlan?.date === today
      ? dayPlan
      : { date: today, ...(activeDay(dayPlan).sore.length ? { sore: activeDay(dayPlan).sore } : {}) };
    const next: DayPlan = { ...base, ...patch, date: today };
    for (const k of Object.keys(next) as (keyof DayPlan)[]) {
      if (next[k] === undefined || (Array.isArray(next[k]) && (next[k] as unknown[]).length === 0)) delete next[k];
    }
    set({ dayPlan: next, offDays: 'off' in patch ? setOffDay(offDays, today, Boolean(next.off)) : offDays });
  },

  clearDay: () => {
    const today = localDate();
    set(s => ({ dayPlan: null, offDays: setOffDay(s.offDays, today, false) }));
  },
});
