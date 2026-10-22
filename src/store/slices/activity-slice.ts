import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { CapacityProgress, Progress } from '@/core/types';
import * as Engine from '@/core/engine';
import { sessionInstant } from '@/core/climbing';
import {
  ACTIVITY_SPEC, ACTIVITY_XP_MAX_DAYS, ACTIVITY_XP_PER_DAY, lastDay, type ActivitySession,
} from '@/core/activity';

/**
 * The activity log: hikes, ski tours, runs, everything outside the app.
 *
 * Like the climb log, an activity earns XP once, when it is first saved, and
 * editing or deleting it leaves the XP alone.
 */
export interface ActivitySlice {
  activityLog: ActivitySession[];
  /** Activity open in the editor, when one is being edited rather than created. */
  editingActivityId: string | null;

  saveActivity: (activity: ActivitySession) => void;
  deleteActivity: (id: string) => void;
  openActivityLog: (editId?: string | null) => void;
}

export function creditActivity(progress: Progress, a: ActivitySession, now = new Date()): Progress {
  const earning = ACTIVITY_SPEC[a.type].xp;
  if (!earning.length) return progress;
  const next: Progress = structuredClone(progress);
  const at = sessionInstant(lastDay(a), now);
  const xp = ACTIVITY_XP_PER_DAY * Math.min(Math.max(1, a.days ?? 1), ACTIVITY_XP_MAX_DAYS);
  for (const c of earning) {
    if (!next[c]) next[c] = { xp: 0, lastTrained: null, history: [] };
    const pg = next[c] as CapacityProgress;
    pg.xp += xp;
    if (!pg.lastTrained || new Date(pg.lastTrained) < at) pg.lastTrained = at.toISOString();
  }
  return Engine.recordHistory(next, earning);
}

export const createActivitySlice: StateCreator<Store, [], [], ActivitySlice> = (set, get) => ({
  activityLog: [],
  editingActivityId: null,

  saveActivity: (activity) => {
    const { activityLog, progress } = get();
    const exists = activityLog.some(a => a.id === activity.id);
    const log = exists
      ? activityLog.map(a => (a.id === activity.id ? activity : a))
      : [...activityLog, activity];
    log.sort((a, b) => a.date.localeCompare(b.date));
    set({
      activityLog: log,
      progress: exists ? progress : creditActivity(progress, activity),
      editingActivityId: null,
    });
  },

  deleteActivity: (id) => {
    const { activityLog } = get();
    set(s => ({
      activityLog: s.activityLog.filter(a => a.id !== id),
      editingActivityId: s.editingActivityId === id ? null : s.editingActivityId,
    }));
    get().offerUndo('Activity deleted.', { activityLog });
  },

  openActivityLog: (editId = null) => set({ editingActivityId: editId, screen: 'activity' }),
});
