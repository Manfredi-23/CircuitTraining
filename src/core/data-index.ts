// =============================================================================
// data-index.ts — Mode data lookup helper
// =============================================================================

import type { Mode, Circuit } from './types';
import { DATA_DAILY } from './data-daily';
import { DATA_CAVE } from './data-cave';
import { DATA_ASSESS } from './data-assess';

const MODE_DATA: Record<Mode, Circuit[]> = {
  DAILY: DATA_DAILY,
  CAVE: DATA_CAVE,
  TEST: DATA_ASSESS,
};

export function getModeData(mode: Mode): Circuit[] {
  return MODE_DATA[mode];
}
