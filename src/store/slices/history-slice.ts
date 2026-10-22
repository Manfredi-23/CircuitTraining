import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import { patchSession, removeSession, type SessionPatch } from '@/core/history';

/**
 * Corrections to past sessions from the LOG tab. Like the climb log, edits and
 * deletes change the record and leave XP alone.
 */
export interface HistorySlice {
  updateSession: (index: number, patch: SessionPatch) => void;
  deleteSession: (index: number) => void;
}

export const createHistorySlice: StateCreator<Store, [], [], HistorySlice> = (set, get) => ({
  updateSession: (index, patch) => set({ sessionLog: patchSession(get().sessionLog, index, patch) }),
  deleteSession: (index) => set(removeSession(get().sessionLog, get().loadLog, index)),
});
