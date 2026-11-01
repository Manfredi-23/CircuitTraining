// =============================================================================
// transfer.ts — What each exercise is for, on the wall (v43)
//
// Every exercise can name the climbing moves it serves: HIGH STEP, HEEL HOOK,
// EDGE... The workout card reads it as one line ("FOR: standing up on a high
// foot"), the session page as chips. New exercises carry nothing extra in
// their data: the map below covers them and the programme's own by id.
//
// It also links the climb log to the training: a fall reason or a weak style
// in WHERE YOU FALL points at the pack that trains it (`packForFalls`). A
// suggestion with its reason, never a change. Pure, no React.
// =============================================================================

import type { Exercise } from './types';
import type { Limiters } from './limiters';

export type Transfer =
  | 'PRECISE FEET' | 'HIGH STEP' | 'ROCK-OVER' | 'HEEL HOOK' | 'TOE HOOK' | 'TOE PULL'
  | 'EDGE' | 'SMEAR' | 'FLAG' | 'DROP KNEE' | 'STEM' | 'BALANCE' | 'FEET ON'
  | 'LOCK-OFF' | 'CRIMP' | 'DEADPOINT' | 'LEG DRIVE';

/** The move, in words, for the card's FOR line. */
export const TRANSFER_TEXT: Record<Transfer, string> = {
  'PRECISE FEET': 'a foot placed once, without a sound',
  'HIGH STEP': 'standing up on a high foot',
  'ROCK-OVER': 'moving the hips over a foot',
  'HEEL HOOK': 'pulling in with a heel',
  'TOE HOOK': 'holding a toe hook',
  'TOE PULL': 'pulling on a toe on steep ground',
  EDGE: 'standing on a small edge',
  SMEAR: 'trusting a smear',
  FLAG: 'a flag that balances',
  'DROP KNEE': 'turning the hip into a drop knee',
  STEM: 'wide feet and stems',
  BALANCE: 'staying still on one foot',
  'FEET ON': 'keeping the feet on when it is steep',
  'LOCK-OFF': 'locking off to reach',
  CRIMP: 'holding small edges',
  DEADPOINT: 'catching the next hold',
  'LEG DRIVE': 'driving the move from the legs',
};

const T: Record<string, Transfer[]> = {
  // New in v43.
  'feet-step-down-mark': ['PRECISE FEET', 'ROCK-OVER'],
  'feet-shift-place': ['PRECISE FEET', 'BALANCE'],
  'feet-edge-stand': ['EDGE', 'ROCK-OVER'],
  'feet-towel-drag': ['TOE PULL', 'EDGE'],
  'feet-toe-edge-calf': ['EDGE', 'SMEAR'],
  'feet-toe-pull-bridge': ['TOE PULL', 'FEET ON'],
  'feet-tibialis-raise': ['TOE HOOK'],
  'feet-toe-hook-situp': ['TOE HOOK', 'FEET ON'],
  'feet-heel-hook-bridge': ['HEEL HOOK'],
  'feet-slider-curl': ['HEEL HOOK'],
  'feet-wall-high-step': ['HIGH STEP', 'ROCK-OVER'],
  'feet-box-lift-off': ['HIGH STEP'],
  'feet-seated-leg-lift': ['HIGH STEP', 'FEET ON'],
  'feet-box-pistol': ['HIGH STEP', 'ROCK-OVER'],
  'feet-9090-lift': ['DROP KNEE'],
  'feet-hip-cars': ['DROP KNEE', 'HIGH STEP'],
  'feet-lateral-reach': ['STEM', 'FLAG'],
  'feet-active-frog': ['STEM', 'SMEAR'],
  'feet-hip-airplane': ['FLAG', 'BALANCE'],
  'feet-high-foot-drive': ['LEG DRIVE', 'HIGH STEP'],
  // The programme's own.
  'daily-toe-taps': ['PRECISE FEET'],
  'daily-rockover-transfer': ['ROCK-OVER'],
  'daily-flag-hold': ['FLAG', 'BALANCE'],
  'daily-short-foot': ['EDGE'],
  'daily-ankle-wall': ['ROCK-OVER', 'TOE HOOK'],
  'extra-sl-reach': ['BALANCE', 'PRECISE FEET'],
  'extra-sl-balance': ['BALANCE'],
  'extra-step-down': ['ROCK-OVER', 'HIGH STEP'],
  'extra-shift-split-squat': ['ROCK-OVER'],
  'extra-high-knee-hold': ['HIGH STEP'],
  'extra-side-abduction': ['FLAG', 'STEM'],
  'extra-lunge-drive': ['HIGH STEP', 'LEG DRIVE'],
  'legs-toe-drag': ['TOE PULL', 'EDGE'],
  'legs-sl-rdl': ['BALANCE', 'HEEL HOOK'],
  'heal-nordic-curl': ['HEEL HOOK'],
  'heal-calf-raise': ['EDGE', 'SMEAR'],
  'heal-step-up': ['HIGH STEP'],
  'heal-split-squat': ['ROCK-OVER'],
  'heal-silent-feet': ['PRECISE FEET'],
  'heal-sticky-feet': ['PRECISE FEET'],
  'heal-edge-smear': ['EDGE', 'SMEAR'],
  'heal-no-hands-slab': ['SMEAR', 'BALANCE'],
  'heal-stork': ['BALANCE'],
  'heal-box-jump': ['LEG DRIVE'],
  'full-box-jump': ['LEG DRIVE'],
  'full-hop-stick': ['BALANCE', 'LEG DRIVE'],
  'full-rockover-drive': ['ROCK-OVER', 'LEG DRIVE'],
  'full-cossack': ['STEM', 'DROP KNEE'],
  'daily-cossack-shift': ['STEM'],
  'home-copenhagen': ['STEM', 'FLAG'],
  'feet-frogger': ['STEM', 'SMEAR'],
  'morn-hip-9090': ['DROP KNEE'],
  'cave-max-hang': ['CRIMP'],
  'power-light-hang': ['CRIMP'],
  'cave-weighted-pullup': ['LOCK-OFF'],
  'addon-weighted-pullup': ['LOCK-OFF'],
  'cave-lockoff': ['LOCK-OFF'],
  'power-explosive-pullup': ['DEADPOINT'],
  'cave-front-lever': ['FEET ON'],
  'home-leg-raise': ['FEET ON', 'TOE HOOK'],
  'power-trx-pike': ['FEET ON'],
  'addon-hanging-oblique': ['FEET ON'],
};

/** The moves an exercise serves; empty when it serves no move directly. */
export function transferOf(e: Pick<Exercise, 'id'>): Transfer[] {
  return T[e.id] ?? [];
}

/** The card's line: "FOR: standing up on a high foot", or null. */
export function transferLine(e: Pick<Exercise, 'id'>): string | null {
  const t = transferOf(e);
  return t.length ? `For ${t.map(x => TRANSFER_TEXT[x]).join(', ')}.` : null;
}

/** The external-focus cue for skill work: on the exercise, or the programme's own drills. */
const FOCUS: Record<string, string> = {
  'daily-toe-taps': 'One touch on the mark. You should hear nothing.',
  'daily-rockover-transfer': 'Hips over the foot first. Then stand.',
  'daily-flag-hold': 'The free leg finds where the trunk goes quiet.',
  'extra-sl-reach': 'Reach the toe far. The standing foot stays glued.',
  'extra-sl-balance': 'The floor stays still under the foot.',
  'extra-lunge-drive': 'Sink, then drive the floor away. Stick it.',
  'heal-silent-feet': 'Every foot goes on without a sound.',
  'heal-sticky-feet': 'The foot lands once and stays.',
  'heal-edge-smear': 'Press the rubber into the wall.',
  'heal-no-hands-slab': 'Hips over the feet. Hands stay off.',
  'heal-stork': 'Still as the hold under you.',
  'full-hop-stick': 'Land silent. Stay there two seconds.',
  'full-rockover-drive': 'Hips over the box foot, then drive.',
};

export function focusOf(e: Pick<Exercise, 'id' | 'focus'>): string | null {
  return e.focus ?? FOCUS[e.id] ?? null;
}

// ---- From the climb log to the training ------------------------------------------

export interface FallPack {
  packId: 'feet' | 'hooks' | 'mobility-10' | 'balance-power';
  /** Why, in the athlete's own numbers. */
  reason: string;
}

/** Minimum falls with a reason before one is used to point at a pack. */
const MIN_FALLS = 4;

/**
 * The pack that answers what the climb log says, or null. FOOT SLIPPED points
 * at precise feet and edging, FEET CUT at toe pull and tension, a weak slab or
 * smear style at the feet too, heel and toe hooks at HOOKS, reach at the hips.
 */
export function packForFalls(l: Limiters): FallPack | null {
  const reasons = new Map(l.reasons.map(r => [r.reason, r.count]));
  const share = (id: string) => (l.falls >= MIN_FALLS ? (reasons.get(id) ?? 0) / l.falls : 0);
  const n = (id: string) => reasons.get(id) ?? 0;
  if (share('feet') >= 0.2) return { packId: 'feet', reason: `Foot slipped in ${n('feet')} of ${l.falls} falls.` };
  if (share('tension') >= 0.2) return { packId: 'hooks', reason: `Feet cut in ${n('tension')} of ${l.falls} falls.` };
  const weak = l.weakest[0];
  if (weak) {
    if (['slab', 'smear', 'rockover'].includes(weak.tag)) return { packId: 'feet', reason: `${weak.label} goes ${Math.abs(weak.vsAverage)} points under your send rate.` };
    if (['heel', 'toe'].includes(weak.tag)) return { packId: 'hooks', reason: `${weak.label} goes ${Math.abs(weak.vsAverage)} points under your send rate.` };
  }
  if (share('reach') >= 0.2) return { packId: 'mobility-10', reason: `Reach in ${n('reach')} of ${l.falls} falls: range helps the feet go higher.` };
  return null;
}
