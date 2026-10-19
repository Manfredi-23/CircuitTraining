import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { BuildPreset } from '@/core/custom';

/**
 * The athlete's own BUILD presets (core/custom.ts). The four built-in ones
 * live in code; these are persisted and backed up.
 */
export interface BuildSlice {
  buildPresets: BuildPreset[];
  savePreset: (preset: BuildPreset) => void;
  deletePreset: (id: string) => void;
}

export const createBuildSlice: StateCreator<Store, [], [], BuildSlice> = (set) => ({
  buildPresets: [],
  savePreset: (preset) => set(s => ({ buildPresets: [...s.buildPresets.filter(p => p.id !== preset.id), preset] })),
  deletePreset: (id) => set(s => ({ buildPresets: s.buildPresets.filter(p => p.id !== id) })),
});
