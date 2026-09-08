import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import type { SortMode, TimeFilter, Capacity } from '@/core/types';

export interface StatsSlice {
  statsSort: SortMode;
  statsTimeFilter: TimeFilter;
  activeChartMuscles: (Capacity | 'overall')[];
  highlightMuscle: Capacity | null;

  setStatsSort: (sort: SortMode) => void;
  setStatsTimeFilter: (filter: TimeFilter) => void;
  toggleChartMuscle: (muscle: Capacity | 'overall') => void;
  setHighlightMuscle: (muscle: Capacity | null) => void;
}

export const createStatsSlice: StateCreator<Store, [], [], StatsSlice> = (set) => ({
  statsSort: 'recent',
  statsTimeFilter: '30days',
  activeChartMuscles: ['overall'],
  highlightMuscle: null,

  setStatsSort: (sort) => set({ statsSort: sort }),

  setStatsTimeFilter: (filter) => set({ statsTimeFilter: filter }),

  toggleChartMuscle: (muscle) => set(s => {
    const current = s.activeChartMuscles;
    if (current.includes(muscle)) {
      // Don't remove 'overall'
      if (muscle === 'overall') return {};
      return { activeChartMuscles: current.filter(m => m !== muscle) };
    }
    return { activeChartMuscles: [...current, muscle] };
  }),

  setHighlightMuscle: (muscle) => set({ highlightMuscle: muscle }),
});
