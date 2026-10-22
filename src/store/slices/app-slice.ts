import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { Mode, EnergyKey, ScreenName, TabName } from '@/core/types';
import { CONFIG } from '@/core/config';
import { getModeData } from '@/core/data-index';

export interface AppSlice {
  mode: Mode;
  circuitIndex: number;
  energy: EnergyKey;
  screen: ScreenName;
  /** Which tab the 'home' screen shows; transient. */
  tab: TabName;
  humorLine: string;
  /** Day the energy was set from Apple Health; transient. */
  energySuggestedOn: string | null;

  setMode: (mode: Mode) => void;
  setCircuitIndex: (index: number) => void;
  setEnergy: (energy: EnergyKey) => void;
  setScreen: (screen: ScreenName) => void;
  /** Go to a tab of the home screen. */
  setTab: (tab: TabName) => void;
  /** Point the workout at one programme session, wherever it was picked. */
  selectCircuit: (mode: Mode, circuitId: string) => void;
  pickHumorLine: () => void;
  /** Apply the Health energy suggestion, once per day. */
  suggestEnergy: (energy: EnergyKey, day: string) => void;
}

export const createAppSlice: StateCreator<Store, [], [], AppSlice> = (set, get) => ({
  mode: 'DAILY',
  circuitIndex: 0,
  energy: 'NORMAL',
  screen: 'home',
  tab: 'today',
  humorLine: CONFIG.humorLines[Math.floor(Math.random() * CONFIG.humorLines.length)],
  energySuggestedOn: null,

  setMode: (mode) => set({ mode, circuitIndex: 0 }),

  setCircuitIndex: (index) => set({ circuitIndex: index }),

  setEnergy: (energy) => set({ energy }),

  // The old STATS screen is now a tab.
  setScreen: (screen) => set(screen === 'stats' ? { screen: 'home', tab: 'stats' } : { screen }),

  setTab: (tab) => set({ screen: 'home', tab }),

  selectCircuit: (mode, circuitId) => {
    const index = getModeData(mode).findIndex(c => c.id === circuitId);
    if (index >= 0) set({ mode, circuitIndex: index });
  },

  pickHumorLine: () => {
    const line = CONFIG.humorLines[Math.floor(Math.random() * CONFIG.humorLines.length)];
    set({ humorLine: line });
  },

  suggestEnergy: (energy, day) => set({ energy, energySuggestedOn: day }),
});
