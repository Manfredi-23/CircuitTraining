import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { Mode, EnergyKey, ScreenName } from '@/core/types';
import { CONFIG } from '@/core/config';
import { getModeData } from '@/core/data-index';

export interface AppSlice {
  mode: Mode;
  circuitIndex: number;
  energy: EnergyKey;
  screen: ScreenName;
  humorLine: string;

  setMode: (mode: Mode) => void;
  setCircuitIndex: (index: number) => void;
  changeCircuit: (dir: number) => void;
  setEnergy: (energy: EnergyKey) => void;
  setScreen: (screen: ScreenName) => void;
  pickHumorLine: () => void;
}

export const createAppSlice: StateCreator<Store, [], [], AppSlice> = (set, get) => ({
  mode: 'HOME',
  circuitIndex: 0,
  energy: 'NORMAL',
  screen: 'home',
  humorLine: CONFIG.humorLines[Math.floor(Math.random() * CONFIG.humorLines.length)],

  setMode: (mode) => set({ mode, circuitIndex: 0 }),

  setCircuitIndex: (index) => set({ circuitIndex: index }),

  changeCircuit: (dir) => {
    const { mode, circuitIndex } = get();
    const circuits = getModeData(mode);
    const total = circuits.length;
    const next = (circuitIndex + dir + total) % total;
    set({ circuitIndex: next });
  },

  setEnergy: (energy) => set({ energy }),

  setScreen: (screen) => set({ screen }),

  pickHumorLine: () => {
    const line = CONFIG.humorLines[Math.floor(Math.random() * CONFIG.humorLines.length)];
    set({ humorLine: line });
  },
});
