import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { CapacityProgress, ClimbSession, Progress } from '@/core/types';
import * as Engine from '@/core/engine';
import {
  climbXpCapacities, climbLoadedCapacities, sessionInstant, CLIMB_SESSION_XP,
} from '@/core/climbing';

/**
 * The climb log. Board, gym and outdoor sessions, entered by hand.
 *
 * A session earns XP once, when it is first saved. Editing it later changes the
 * record, not the XP, and deleting it removes the record and leaves the XP
 * alone — the climbing still happened.
 */
export interface ClimbSlice {
  climbLog: ClimbSession[];
  /** Session open in the editor, when one is being edited rather than created. */
  editingClimbId: string | null;

  saveClimbSession: (session: ClimbSession) => void;
  deleteClimbSession: (id: string) => void;
  openClimbLog: (editId?: string | null) => void;
}

function creditSession(progress: Progress, session: ClimbSession): Progress {
  const next: Progress = structuredClone(progress);
  const at = sessionInstant(session.date);
  const touch = (pg: CapacityProgress) => {
    if (!pg.lastTrained || new Date(pg.lastTrained) < at) pg.lastTrained = at.toISOString();
  };
  const ensure = (c: keyof Progress) => {
    if (!next[c]) next[c] = { xp: 0, lastTrained: null, history: [] };
    return next[c] as CapacityProgress;
  };

  const earning = climbXpCapacities(session);
  for (const c of earning) {
    const pg = ensure(c);
    pg.xp += CLIMB_SESSION_XP;
    touch(pg);
  }
  // Bouldering is near-maximal finger loading: it restarts the 48h as well.
  for (const c of climbLoadedCapacities(session)) {
    const pg = ensure(c);
    touch(pg);
    if (!pg.lastHard || new Date(pg.lastHard) < at) pg.lastHard = at.toISOString();
  }

  return Engine.recordHistory(next, earning);
}

export const createClimbSlice: StateCreator<Store, [], [], ClimbSlice> = (set, get) => ({
  climbLog: [],
  editingClimbId: null,

  saveClimbSession: (session) => {
    const { climbLog, progress } = get();
    const exists = climbLog.some(s => s.id === session.id);
    const log = exists
      ? climbLog.map(s => (s.id === session.id ? session : s))
      : [...climbLog, session];
    log.sort((a, b) => a.date.localeCompare(b.date));
    set({
      climbLog: log,
      progress: exists ? progress : creditSession(progress, session),
      editingClimbId: null,
    });
  },

  deleteClimbSession: (id) => set(s => ({
    climbLog: s.climbLog.filter(c => c.id !== id),
    editingClimbId: s.editingClimbId === id ? null : s.editingClimbId,
  })),

  openClimbLog: (editId = null) => set({ editingClimbId: editId, screen: 'climb' }),
});
