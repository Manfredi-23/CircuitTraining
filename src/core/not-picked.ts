// =============================================================================
// not-picked.ts — Exercises the app never picks by itself (v46)
//
// The athlete's review of four weeks, November 2026: some exercises were
// skipped again and again because they feel wrong, are not understood, or
// need walking round the gym. Others lie face down and arch the back, which an
// old D12 fracture makes feel constricted. They came out of the sessions, and
// nothing chooses them automatically any more: not BUILD, not the reserve,
// not a group block or ONE BY ONE, not SIMILAR or OTHER KIT, not a pack.
//
// They stay in the library under the same ids, so their history stays and
// SEARCH ALL (and the routine editor's search) still finds them when the
// athlete wants one on purpose.
// Pure, no React.
// =============================================================================

import { BACK_UNWIND, PRONE_EXTENSION, REVERSE_CRUNCH } from './data-daily';
import { FLOOR_BACK_EXTENSION, PLATE_CARRY, PLATE_CRUNCH, TRX_PIKE } from './data-cave';
import { PRONE_YTW } from './data-heal';
import type { Exercise } from './types';

/** Why each one is out, for the code reader. */
const NOT_PICKED_WHY: Record<string, string> = {
  'daily-reverse-crunch': 'Never learned, always skipped. The leg raises and the hollow hold do the job.',
  'legs-plate-crunch': 'Always skipped. The leg raises do the job.',
  'daily-back-unwind': 'The cobra arches face down.',
  'extra-plate-good-morning': 'The plate is awkward. The good morning with the hands behind the head and the dumbbell RDL instead.',
  'full-plate-carry': 'Walking round the gym. The band Pallof press instead.',
  'power-trx-pike': 'Feels awkward. The front lever instead.',
  'legs-back-extension': 'Arches face down.',
  'daily-prone-extension': 'Arches face down (the superman at higher levels).',
  'extra-prone-swimmer': 'Arches face down.',
  'extra-prone-cobra': 'Arches face down.',
  'heal-prone-ytw': 'Face down. The bent-over Y-T-W instead.',
};

export const NOT_PICKED: ReadonlySet<string> = new Set(Object.keys(NOT_PICKED_WHY));

/** Whether the app may choose this exercise on its own. SEARCH ALL ignores this. */
export function isPickable(id: string): boolean {
  return !NOT_PICKED.has(id);
}

/**
 * The ones that are in no session any more, kept in the library so their
 * history has a name and SEARCH ALL finds them. (The plate good morning,
 * the swimmer and the cobra hold are extras and already in it.)
 */
export const OUT_OF_SESSIONS: Exercise[] = [
  REVERSE_CRUNCH, PRONE_EXTENSION, BACK_UNWIND,
  FLOOR_BACK_EXTENSION, PLATE_CRUNCH, TRX_PIKE, PLATE_CARRY,
  PRONE_YTW,
];
