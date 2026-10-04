// =============================================================================
// widget.ts — What the home and lock screen widget shows
//
// The widget cannot run the app's logic, so the app hands it a small snapshot
// whenever something changes: today's session and why, the block week, and
// when the fingers are next ready. The widget counts down to that moment on
// its own. Pure functions, no React.
// =============================================================================

import { blockLabel, type BlockWeek } from './block';
import { getModeData } from './data-index';
import { fingersReadyAt } from './engine';
import type { Recommendation } from './recommend';
import type { Progress } from './types';

export interface WidgetSnapshot {
  /** e.g. "CAVE 02 PULL + PUSH", or "DONE FOR TODAY". */
  session: string;
  reason: string;
  block: string;
  /** Epoch ms when maximal finger work is next allowed; null if it is now. */
  fingersReadyAt: number | null;
  updatedAt: number;
}

export function widgetSnapshot(
  recommendation: Recommendation | null,
  block: BlockWeek,
  progress: Progress,
  now = new Date(),
): WidgetSnapshot {
  const circuit = recommendation
    ? getModeData(recommendation.mode).find(c => c.id === recommendation.circuitId)
    : undefined;
  const ready = fingersReadyAt(progress);
  return {
    session: circuit && recommendation ? `${recommendation.mode} ${circuit.circuitNum} ${circuit.title}` : 'DONE FOR TODAY',
    reason: recommendation?.reason ?? 'Nothing else is due. Recover.',
    block: blockLabel(block),
    fingersReadyAt: ready && ready.getTime() > now.getTime() ? ready.getTime() : null,
    updatedAt: now.getTime(),
  };
}
