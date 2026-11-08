// =============================================================================
// exercise-tags.ts — Muscle groups and kit for every exercise (v45)
//
// Two tags each exercise carries, by hand, so the athlete can add by what
// they want to train and swap around what is taken at the gym:
//
// - **Groups**: what it trains, finer than the nine work areas (which stay for
//   STATS and BODY THIS WEEK). The first group is the main one; a group block
//   picks exercises whose main group it is before the ones that only touch it.
// - **Kit**: the equipment it needs that can be busy or missing: bar, rings,
//   hangboard, dumbbells... A mat, a floor, the house wall, a chair or a towel
//   are never listed. OTHER KIT offers the same job without any of it.
//
// Every exercise that can be picked is in the table; `exercise-tags.test.ts`
// fails on one that is not, so a new exercise is tagged when it is added.
// Pure, no React.
// =============================================================================

import type { Exercise } from './types';

export type MuscleGroup =
  | 'ABS' | 'OBLIQUES' | 'LOWER BACK' | 'UPPER BACK' | 'CHEST' | 'SHOULDERS' | 'BICEPS' | 'TRICEPS'
  | 'PULL' | 'LEGS' | 'GLUTES + HAMSTRINGS' | 'FEET + HOOKS' | 'MOBILITY' | 'FINGERS';

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'ABS', 'OBLIQUES', 'LOWER BACK', 'UPPER BACK', 'CHEST', 'SHOULDERS', 'BICEPS', 'TRICEPS',
  'PULL', 'LEGS', 'GLUTES + HAMSTRINGS', 'FEET + HOOKS', 'MOBILITY', 'FINGERS',
];

export type Kit =
  | 'BAR' | 'HANGBOARD' | 'RINGS' | 'DUMBBELL' | 'KETTLEBELL' | 'PLATE' | 'BOX' | 'BARBELL'
  | 'BAND' | 'EDGE' | 'RADIATOR' | 'WALL' | 'CABLE';

export const KIT_LABEL: Record<Kit, string> = {
  BAR: 'pull-up bar', HANGBOARD: 'hangboard', RINGS: 'rings / TRX', DUMBBELL: 'dumbbells', KETTLEBELL: 'kettlebells',
  PLATE: 'plates', BOX: 'box', BARBELL: 'barbell', BAND: 'band', EDGE: 'portable edge', RADIATOR: 'radiator',
  WALL: 'climbing wall', CABLE: 'cable',
};

interface Tags { groups: MuscleGroup[]; kit: Kit[] }

const t = (groups: MuscleGroup[], kit: Kit[] = []): Tags => ({ groups, kit });

// Shorthands, to keep the table one line an exercise.
const ABS: MuscleGroup = 'ABS', OBL: MuscleGroup = 'OBLIQUES', LOW: MuscleGroup = 'LOWER BACK', UPB: MuscleGroup = 'UPPER BACK';
const CHE: MuscleGroup = 'CHEST', SHO: MuscleGroup = 'SHOULDERS', BIC: MuscleGroup = 'BICEPS', TRI: MuscleGroup = 'TRICEPS';
const PUL: MuscleGroup = 'PULL', LEG: MuscleGroup = 'LEGS', GLU: MuscleGroup = 'GLUTES + HAMSTRINGS';
const FEE: MuscleGroup = 'FEET + HOOKS', MOB: MuscleGroup = 'MOBILITY', FIN: MuscleGroup = 'FINGERS';

/** Warm-ups train nothing on their own here: they are swapped for other warm-ups, never added by group. */
const WARM = t([]);

export const EXERCISE_TAGS: Record<string, Tags> = {
  // --- DAILY, home: mat, band, portable edge ---
  'morn-breathing': WARM,
  'morn-band-wake': t([], ['BAND']),
  'morn-deadbug': t([ABS]),
  'daily-pushup': t([CHE, TRI]),
  'extra-lunge-drive': t([LEG, MOB]),
  'daily-spiderman': t([OBL, ABS]),
  'daily-mountain-climber': t([OBL, ABS]),
  'daily-reverse-crunch': t([ABS]),
  'morn-bw-russian-twist': t([OBL]),
  'morn-birddog': t([LOW, ABS]),
  'daily-prone-extension': t([LOW]),
  'daily-side-plank-dip': t([OBL]),
  'daily-band-good-morning': t([LOW, GLU], ['BAND']),
  'morn-band-row': t([PUL, UPB], ['BAND']),
  'morn-band-pushup': t([CHE, TRI], ['BAND']),
  'morn-band-split-squat': t([LEG], ['BAND']),
  'home-sl-rdl': t([GLU, LOW], ['BAND']),
  'morn-pullapart': t([UPB, SHO], ['BAND']),
  'morn-catcow': t([MOB]),
  'morn-hip-9090': t([MOB]),
  'home-hip-flow': t([MOB]),
  'wrists-daily-block': t([FIN]),
  'wrists-loaded-extension': t([FIN]),
  'daily-edge-density': t([FIN], ['EDGE']),
  'daily-spiderman-lunge': t([MOB]),
  'daily-cossack-shift': t([MOB, LEG]),
  'daily-bw-squat': t([LEG]),
  'daily-glute-bridge': t([GLU]),
  'daily-plank-climber': t([ABS]),
  'daily-back-unwind': t([MOB]),
  'daily-ankle-wall': t([MOB, FEE]),
  'daily-short-foot': t([FEE]),
  'daily-toe-taps': t([FEE]),
  'extra-sl-reach': t([FEE, LEG]),
  'daily-rockover-transfer': t([FEE, LEG]),
  'daily-flag-hold': t([FEE]),
  'morn-hollow': t([ABS]),
  'morn-leg-lowers': t([ABS]),

  // --- CAVE, the gym ---
  'cave-warmup-pulse': t([], ['BAR']),
  'cave-warmup-fingers': t([], ['HANGBOARD']),
  'cave-max-hang': t([FIN], ['HANGBOARD']),
  'cave-weighted-pullup': t([PUL, BIC], ['BAR']),
  'cave01-oap-shrug': t([PUL, UPB], ['BAR']),
  'cave01-oap-assisted': t([PUL], ['BAR', 'BAND']),
  'cave01-oap-negative': t([PUL], ['BAR']),
  'cave01-oap-path': t([PUL], ['BAR']),
  'cave-lockoff': t([PUL, BIC], ['BAR']),
  'cave-front-lever': t([ABS, PUL], ['BAR']),
  'home-leg-raise': t([ABS], ['BAR']),
  'cave-band-er': t([SHO], ['BAND']),
  'addon-weighted-pullup': t([PUL, BIC], ['BAR']),
  'addon-oap-shrug': t([PUL, UPB], ['BAR']),
  'addon-oap-assisted': t([PUL], ['BAR', 'BAND']),
  'addon-oap-path': t([PUL], ['BAR']),
  'addon-pushup': t([CHE, TRI]),
  'addon-mountain-climber': t([OBL, ABS]),
  'addon-hanging-oblique': t([OBL], ['BAR']),
  'addon-russian-twist': t([OBL], ['PLATE']),
  'addon-cuff': t([SHO], ['BAND']),
  'addon-goblet-squat': t([LEG], ['KETTLEBELL']),
  'legs-back-extension': t([LOW], ['RADIATOR', 'PLATE']),
  'legs-sl-rdl': t([GLU, LOW], ['DUMBBELL']),
  'full-cossack': t([LEG, MOB], ['KETTLEBELL']),
  'legs-toe-drag': t([FEE], ['PLATE']),
  'home-copenhagen': t([LEG, OBL], ['BOX']),
  'legs-plate-crunch': t([ABS], ['PLATE']),
  'feet-frogger': t([MOB]),
  'power-light-hang': t([FIN], ['HANGBOARD']),
  'power-explosive-pullup': t([PUL], ['BAR']),
  'power-explosive-pushup': t([CHE, TRI]),
  'power-weighted-pullup': t([PUL, BIC], ['BAR']),
  'power-db-row': t([PUL, UPB], ['DUMBBELL', 'BOX']),
  'power-db-press': t([SHO, TRI], ['DUMBBELL']),
  'power-floor-pullover': t([PUL, SHO], ['DUMBBELL']),
  'power-trx-pike': t([ABS], ['RINGS']),
  'power-band-face-pull': t([UPB, SHO], ['BAND']),
  'full-box-jump': t([LEG], ['BOX']),
  'full-hop-stick': t([FEE, LEG]),
  'full-front-squat': t([LEG], ['KETTLEBELL']),
  'full-db-rdl': t([GLU, LOW], ['DUMBBELL']),
  'full-rockover-drive': t([LEG], ['BOX']),
  'full-ring-row': t([PUL, UPB], ['RINGS']),
  'full-suitcase-carry': t([OBL, FIN], ['KETTLEBELL']),
  'full-plate-carry': t([ABS], ['PLATE']),

  // --- TEST warm-ups ---
  'assess-warmup-general': WARM,
  'assess-warmup-pull': t([], ['BAR']),

  // --- HEAL ---
  'heal-warmup': WARM,
  'heal-hand-warmup': WARM,
  'heal-foot-warmup': WARM,
  'heal-box-jump': t([LEG], ['BOX']),
  'heal-back-squat': t([LEG], ['BARBELL']),
  'heal-step-up': t([LEG], ['BOX', 'PLATE']),
  'heal-split-squat': t([LEG], ['BOX', 'PLATE']),
  'heal-tendon-glides': t([FIN]),
  'heal-nordic-curl': t([GLU], ['RADIATOR']),
  'heal-weighted-pushup': t([CHE, TRI], ['PLATE']),
  'heal-pike-pushup': t([SHO, TRI]),
  'heal-calf-raise': t([LEG], ['BOX']),
  'heal-prone-ytw': t([UPB, SHO]),
  'heal-band-er': t([SHO], ['BAND']),
  'heal-ring-left': t([FIN], ['EDGE']),
  'heal-silent-feet': t([FEE], ['WALL']),
  'heal-sticky-feet': t([FEE], ['WALL']),
  'heal-edge-smear': t([FEE], ['WALL']),
  'heal-no-hands-slab': t([FEE], ['WALL']),
  'heal-stork': t([FEE], ['WALL']),

  // --- Extras: arms, chest, shoulders, back, rock-over and hips ---
  'extra-band-curl': t([BIC], ['BAND']),
  'extra-band-hammer': t([BIC], ['BAND']),
  'extra-band-triceps': t([TRI], ['BAND']),
  'extra-diamond-pushup': t([TRI, CHE]),
  'extra-db-curl': t([BIC], ['DUMBBELL']),
  'extra-chinup-negative': t([BIC, PUL], ['BAR']),
  'extra-band-lateral': t([SHO], ['BAND']),
  'extra-face-pull': t([UPB, SHO], ['CABLE']),
  'extra-ring-dip': t([CHE, TRI], ['RINGS']),
  'extra-plyo-pushup': t([CHE, TRI]),
  'extra-db-floor-press': t([CHE, TRI], ['DUMBBELL']),
  'extra-ring-pushup': t([CHE, TRI], ['RINGS']),
  'extra-ring-fly': t([CHE], ['RINGS']),
  'extra-feet-up-pushup': t([CHE, SHO]),
  'extra-step-down': t([LEG]),
  'extra-shift-split-squat': t([LEG]),
  'extra-high-knee-hold': t([MOB]),
  'extra-side-abduction': t([GLU]),
  'extra-dead-bug': t([ABS]),
  'extra-prone-swimmer': t([UPB]),
  'extra-prone-cobra': t([UPB]),
  'extra-plate-good-morning': t([LOW, GLU], ['PLATE']),
  'extra-db-reverse-fly': t([UPB, SHO], ['DUMBBELL']),
  'extra-kb-swing': t([GLU, LOW], ['KETTLEBELL']),
  'extra-bw-good-morning': t([LOW]),
  'extra-wall-angel': t([UPB, SHO]),
  'extra-bent-ytw': t([UPB, SHO]),
  'extra-band-pallof': t([OBL, ABS], ['BAND']),
  'extra-weighted-knee-raise': t([ABS, OBL], ['BAR', 'DUMBBELL']),
  'extra-doorway-pec': t([MOB, CHE]),

  // --- Feet, hooks and high steps (v43) ---
  'feet-wall-high-step': t([FEE, LEG]),
  'feet-seated-leg-lift': t([ABS, MOB]),
  'feet-tibialis-raise': t([FEE]),
  'feet-heel-hook-bridge': t([FEE, GLU]),
  'feet-toe-pull-bridge': t([FEE, GLU]),
  'feet-edge-stand': t([FEE], ['EDGE']),
  'extra-sl-balance': t([FEE]),
  'feet-step-down-mark': t([FEE]),
  'feet-shift-place': t([FEE]),
  'feet-towel-drag': t([FEE]),
  'feet-toe-edge-calf': t([FEE, LEG]),
  'feet-toe-hook-situp': t([FEE, ABS], ['RADIATOR']),
  'feet-slider-curl': t([FEE, GLU]),
  'feet-box-lift-off': t([MOB, FEE], ['BOX']),
  'feet-box-pistol': t([LEG], ['BOX']),
  'feet-9090-lift': t([MOB]),
  'feet-hip-cars': t([MOB]),
  'feet-lateral-reach': t([FEE, MOB]),
  'feet-active-frog': t([MOB]),
  'feet-hip-airplane': t([FEE, GLU]),
  'feet-high-foot-drive': t([LEG, FEE], ['BOX']),
};

/** What an exercise trains, the main group first; [] for a warm-up or an exercise not in the table. */
export function groupsOf(ex: Pick<Exercise, 'id'>): MuscleGroup[] {
  return EXERCISE_TAGS[ex.id]?.groups ?? [];
}

/** The kit it needs that can be busy or missing; [] when it needs none. */
export function kitOf(ex: Pick<Exercise, 'id'>): Kit[] {
  return EXERCISE_TAGS[ex.id]?.kit ?? [];
}

/** Whether two exercises need any of the same kit. */
export function sharesKit(a: Pick<Exercise, 'id'>, b: Pick<Exercise, 'id'>): boolean {
  const ka = kitOf(a);
  return kitOf(b).some(k => ka.includes(k));
}

/** "rings / TRX" or "pull-up bar, band": the kit in words. */
export function kitText(ex: Pick<Exercise, 'id'>): string {
  return kitOf(ex).map(k => KIT_LABEL[k]).join(', ');
}
