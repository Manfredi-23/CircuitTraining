// =============================================================================
// data-index.ts — Mode data lookup helper
// =============================================================================

import type { Mode, Circuit } from './types';
import { DATA_HOME } from './data-home';
import { DATA_CAVE } from './data-cave';
import { DATA_HANG } from './data-hang';
import { DATA_MORNING } from './data-morning';
import { DATA_ASSESS } from './data-assess';

const MODE_DATA: Record<Mode, Circuit[]> = {
  HOME: DATA_HOME,
  CAVE: DATA_CAVE,
  HANG: DATA_HANG,
  MORN: DATA_MORNING,
  TEST: DATA_ASSESS,
};

export function getModeData(mode: Mode): Circuit[] {
  return MODE_DATA[mode];
}
