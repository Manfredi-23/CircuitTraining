import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import { patchSession, removeSession, type SessionPatch } from '@/core/history';

/** What a delete (or FINISH NOW) took away, put back by UNDO. */
export interface UndoOffer {
  text: string;
  restore: Partial<Pick<Store, 'sessionLog' | 'loadLog' | 'climbLog' | 'activityLog' | 'routines' | 'weekPlan' | 'progress' | 'screen'>>;
  /** For keying the toast, so a second delete restarts its timer. */
  at: number;
}

/**
 * Corrections to past sessions from the LOG tab, and UNDO for every delete.
 * Like the climb log, edits and deletes change the record and leave XP alone.
 */
export interface HistorySlice {
  undo: UndoOffer | null;
  updateSession: (index: number, patch: SessionPatch) => void;
  deleteSession: (index: number) => void;
  offerUndo: (text: string, restore: UndoOffer['restore']) => void;
  applyUndo: () => void;
  clearUndo: () => void;
}

export const createHistorySlice: StateCreator<Store, [], [], HistorySlice> = (set, get) => ({
  undo: null,
  updateSession: (index, patch) => set({ sessionLog: patchSession(get().sessionLog, index, patch) }),
  deleteSession: (index) => {
    const { sessionLog, loadLog } = get();
    const title = sessionLog[index]?.circuitTitle ?? 'Session';
    set(removeSession(sessionLog, loadLog, index));
    get().offerUndo(`${title} deleted.`, { sessionLog, loadLog });
  },
  offerUndo: (text, restore) => set({ undo: { text, restore, at: Date.now() } }),
  applyUndo: () => {
    const u = get().undo;
    if (u) set({ ...u.restore, undo: null });
  },
  clearUndo: () => set({ undo: null }),
});
