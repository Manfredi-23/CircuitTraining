// =============================================================================
// data-index.ts — Mode data lookup helper
// =============================================================================

import type { Mode, Circuit } from './types';
import { DATA_DAILY } from './data-daily';
import { DATA_CAVE } from './data-cave';
import { DATA_ASSESS } from './data-assess';
import { DATA_HEAL } from './data-heal';

const MODE_DATA: Record<Mode, Circuit[]> = {
  DAILY: DATA_DAILY,
  CAVE: DATA_CAVE,
  TEST: DATA_ASSESS,
  HEAL: DATA_HEAL,
};

export function getModeData(mode: Mode): Circuit[] {
  return MODE_DATA[mode];
}

/**
 * The subtitle as shown: without the minutes some sessions write at its end
 * (cards show today's own), without a leading "daily" the tab or crumb
 * already says, and with the middle dot the rest of the app separates with.
 */
export function displaySubtitle(c: Circuit): string {
  return c.subtitle
    .replace(/\s*-\s*\d+\s*min$/, '')
    .replace(/^daily\s*-\s*/, '')
    .replace(/\s+-\s+/g, ' · ');
}
