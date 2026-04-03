import { useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import { CONFIG } from '@/core/config';

interface UseSwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function useSwipe({ onSwipeLeft, onSwipeRight }: UseSwipeOptions) {
  const swipeInProgressRef = useRef(false);

  const bind = useDrag(
    ({ movement: [mx, my], direction: [dx], distance: [dist], last }) => {
      // Only respond to horizontal drags
      if (Math.abs(my) > Math.abs(mx) * 0.7) return;
      if (!last) return;
      if (dist < CONFIG.ui.swipeThreshold) return;

      swipeInProgressRef.current = true;
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();

      setTimeout(() => { swipeInProgressRef.current = false; }, 50);
    },
    { axis: 'x', filterTaps: true }
  );

  return { bind, swipeInProgress: swipeInProgressRef };
}
