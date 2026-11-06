import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import { addReading, clockOf, removeReading, type PatataGym, type PatataReading } from '@/core/patata';

/**
 * THE PATATOMETRO: every tap kept with its time (`patataLog`, persisted).
 * A tap and a delete both offer UNDO.
 */
export interface PatataSlice {
  patataLog: PatataReading[];
  logPatata: (gym: PatataGym, patata: boolean) => void;
  deletePatata: (id: string) => void;
}

export const createPatataSlice: StateCreator<Store, [], [], PatataSlice> = (set, get) => ({
  patataLog: [],
  logPatata: (gym, patata) => {
    const { patataLog } = get();
    const now = new Date();
    set({ patataLog: addReading(patataLog, gym, patata, now) });
    get().offerUndo(`${patata ? 'PATATA' : 'NO PATATA'} at ${gym}, ${clockOf(now.toISOString())}.`, { patataLog });
  },
  deletePatata: (id) => {
    const { patataLog } = get();
    set({ patataLog: removeReading(patataLog, id) });
    get().offerUndo('Tap deleted.', { patataLog });
  },
});
