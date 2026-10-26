import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { Routine } from '@/core/routines';
import { MAX_PER_DAY, type PlanItem, type WeekPlan } from '@/core/plan';
import type { SessionEdit, SessionEdits } from '@/core/session-edit';

/**
 * The athlete's own routines (core/routines.ts), weekly plan (core/plan.ts)
 * and session edits (core/session-edit.ts). All persisted and backed up.
 */
export interface RoutineSlice {
  routines: Routine[];
  weekPlan: WeekPlan;
  saveRoutine: (routine: Routine) => void;
  /** Removes it from the plan too. */
  deleteRoutine: (id: string) => void;
  setPlanDay: (weekday: number, items: PlanItem[]) => void;
  /** Sessions changed on their page before starting (core/session-edit.ts), by circuit id. */
  sessionEdits: SessionEdits;
  /** Store an edit; null puts the session back as written. */
  setSessionEdit: (circuitId: string, edit: SessionEdit | null) => void;
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
  sessionEdits: {},
  setSessionEdit: (circuitId, edit) => set(s => {
    const next = { ...s.sessionEdits };
    if (edit) next[circuitId] = edit; else delete next[circuitId];
    return { sessionEdits: next };
  }),
  setPlanDay: (weekday, items) => set(s => ({ weekPlan: { ...s.weekPlan, [weekday]: items.slice(0, MAX_PER_DAY) } })),
});
