import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { Routine } from '@/core/routines';
import { MAX_PER_DAY, type PlanItem, type WeekPlan } from '@/core/plan';

/**
 * The athlete's own routines (core/routines.ts) and weekly plan
 * (core/plan.ts). Both persisted and backed up.
 */
export interface RoutineSlice {
  routines: Routine[];
  weekPlan: WeekPlan;
  saveRoutine: (routine: Routine) => void;
  /** Removes it from the plan too. */
  deleteRoutine: (id: string) => void;
  setPlanDay: (weekday: number, items: PlanItem[]) => void;
}

export const createRoutineSlice: StateCreator<Store, [], [], RoutineSlice> = (set, get) => ({
  routines: [],
  weekPlan: {},
  saveRoutine: (routine) => set(s => {
    const exists = s.routines.some(r => r.id === routine.id);
    return { routines: exists ? s.routines.map(r => (r.id === routine.id ? routine : r)) : [...s.routines, routine] };
  }),
  deleteRoutine: (id) => {
    const { routines, weekPlan } = get();
    set({
      routines: routines.filter(r => r.id !== id),
      weekPlan: Object.fromEntries(
        Object.entries(weekPlan).map(([d, items]) => [d, (items ?? []).filter(i => !(i.kind === 'ROUTINE' && i.routineId === id))]),
      ),
    });
    get().offerUndo(`${routines.find(r => r.id === id)?.name ?? 'Routine'} deleted.`, { routines, weekPlan });
  },
  setPlanDay: (weekday, items) => set(s => ({ weekPlan: { ...s.weekPlan, [weekday]: items.slice(0, MAX_PER_DAY) } })),
});
