// =============================================================================
// data-extras.ts — Exercises that only exist in the reserve
//
// The reserve (reserve.ts) mostly offers exercises the sessions already use,
// with their history. These are the gaps: arm work, which the programme leaves
// out on purpose (biceps and triceps are not climbing capacities, and size
// there is weight carried up the wall), and two shoulder raises. Arms carry no
// capacity, so they earn no XP: the athlete's own extra, recorded but not
// counted. The shoulder ones train `shoulder` like the rest of the prehab.
// =============================================================================

import type { Exercise } from './types';

const BAND_CURL: Exercise = {
  id: 'extra-band-curl',
  name: 'Band Biceps Curl',
  capacities: [],
  block: 'ACCESSORY', intensity: 'MODERATE',
  sets: 2, work: 12, unit: 'reps', restSec: 45,
  load: { kind: 'band', text: 'Band under both feet; the last two reps slow' },
  progression: 'Twelve slow reps, then a heavier band or a wider stance. HARDER moves on to the slow lowering, then one arm.',
  protocolId: 'hypertrophy',
  note: 'An extra: no XP. Elbows pinned to the sides.',
  variations: [
    { minLevel: 1, name: 'Band Biceps Curl' },
    { minLevel: 3, name: 'Band Biceps Curl, 3s Lower' },
    { minLevel: 5, name: 'Single-Arm Band Curl, 3s Lower' },
  ],
  form: {
    setup: 'Stand on the middle of the band, feet hip-width, a handle or the band end in each hand, palms forward, elbows at the sides.',
    execution: 'Curl the hands to the shoulders without the elbows drifting forward, squeeze, lower under control all the way to straight arms.',
    cue: 'The band is lightest at the bottom and heaviest at the top: the squeeze is the rep.',
    breathing: 'Exhale on the way up, inhale on the way down.',
    mistakes: 'Swinging the hips. Elbows travelling forward. Half reps at the bottom.',
  },
};

const BAND_HAMMER: Exercise = {
  id: 'extra-band-hammer',
  name: 'Band Hammer Curl',
  capacities: [],
  block: 'ACCESSORY', intensity: 'MODERATE',
  sets: 2, work: 12, unit: 'reps', restSec: 45,
  load: { kind: 'band', text: 'Band under both feet, thumbs up' },
  progression: 'Twelve slow reps, then a heavier band, then a three-second lowering.',
  protocolId: 'hypertrophy',
  note: 'An extra: no XP. The thumbs-up grip works the brachioradialis, the forearm muscle that bends the elbow in a lock-off.',
  form: {
    setup: 'Stand on the band, the ends in the hands with the thumbs pointing up, elbows at the sides.',
    execution: 'Curl with the thumbs up the whole way, squeeze at the shoulder, lower slowly.',
    cue: 'Neutral grip, like holding a hammer. Easier on the wrists than palms-up curls.',
    breathing: 'Exhale up, inhale down.',
    mistakes: 'Rotating the palms. Shrugging. Rushing the lowering.',
  },
};

const BAND_TRICEPS: Exercise = {
  id: 'extra-band-triceps',
  name: 'Overhead Band Triceps Extension',
  capacities: [],
  block: 'ACCESSORY', intensity: 'MODERATE',
  sets: 2, work: 12, unit: 'reps', restSec: 45,
  load: { kind: 'band', text: 'Band under the back foot, hands behind the head' },
  progression: 'Twelve slow reps, then a heavier band or a shorter grip, then a pause at full stretch.',
  protocolId: 'hypertrophy',
  note: 'An extra: no XP. The overhead position stretches the long head of the triceps.',
  form: {
    setup: 'Split stance, the band under the back foot, both hands holding it behind the head with the elbows pointing up.',
    execution: 'Straighten the arms overhead without the elbows flaring, then bend them back down behind the head under control.',
    cue: 'Only the forearms move. The upper arms stay by the ears.',
    breathing: 'Exhale as you press up, inhale as you lower.',
    mistakes: 'Elbows flaring wide. Arching the lower back. Bouncing out of the bottom.',
  },
};

const DIAMOND_PUSHUP: Exercise = {
  id: 'extra-diamond-pushup',
  name: 'Close-Hand Push-Up',
  capacities: [],
  block: 'ACCESSORY', intensity: 'MODERATE',
  sets: 2, work: 8, unit: 'reps', restSec: 60,
  load: { kind: 'bodyweight', text: 'Hands under the chest, flat palms' },
  progression: 'Eight clean reps, then twelve, then the diamond (index fingers and thumbs touching), then a three-second lowering.',
  protocolId: 'hypertrophy',
  note: 'An extra: no XP. Flat palms, nothing gripped, so it is fine while a finger heals.',
  variations: [
    { minLevel: 1, name: 'Close-Hand Push-Up' },
    { minLevel: 4, name: 'Diamond Push-Up' },
    { minLevel: 6, name: 'Diamond Push-Up, 3s Lower' },
  ],
  form: {
    setup: 'Plank on flat palms, hands a little narrower than the shoulders under the chest, body in one line.',
    execution: 'Lower with the elbows brushing the ribs until the chest is a fist above the hands, press back up to straight arms.',
    cue: 'Elbows back, not out: that is what moves the work onto the triceps.',
    breathing: 'Inhale down, exhale up.',
    mistakes: 'Hips sagging. Elbows flaring. Stopping short of straight arms.',
  },
};

const DB_CURL: Exercise = {
  id: 'extra-db-curl',
  name: 'Dumbbell Curl',
  capacities: [],
  block: 'ACCESSORY', intensity: 'MODERATE',
  sets: 2, work: 10, unit: 'reps', restSec: 60,
  load: { kind: 'added-kg', text: 'Kilos per dumbbell: a weight you can curl 10 times with 2 reps left' },
  progression: 'Ten clean reps, then the next dumbbell up and back to eight.',
  protocolId: 'hypertrophy',
  note: 'An extra: no XP. Gym only.',
  variations: [
    { minLevel: 1, name: 'Dumbbell Curl' },
    { minLevel: 4, name: 'Incline Dumbbell Curl' },
  ],
  form: {
    setup: 'Stand tall, a dumbbell in each hand, palms forward, elbows at the sides.',
    execution: 'Curl both or alternate, squeeze at the top, lower slowly to straight arms.',
    cue: 'Leave two reps in the tank: this is an extra after climbing, not a max.',
    breathing: 'Exhale up, inhale down.',
    mistakes: 'Swinging. Elbows forward. Dropping the weight on the way down.',
  },
};

const CHINUP_NEGATIVE: Exercise = {
  id: 'extra-chinup-negative',
  name: 'Chin-Up Negative',
  capacities: [],
  block: 'ACCESSORY', intensity: 'HARD',
  sets: 2, work: 4, unit: 'reps', restSec: 90,
  load: { kind: 'bodyweight', text: 'Jump to the top, 5 seconds down' },
  progression: 'Four 5-second lowerings, then 8 seconds, then a pause at the halfway point.',
  protocolId: 'hypertrophy',
  note: 'An extra: no XP. Palms facing you puts the biceps to work. On a bar, so it loads the fingers: not on a sore-finger day.',
  form: {
    setup: 'Under a bar with a box or jump to reach it, hands shoulder-width, palms facing you.',
    execution: 'Start with the chin over the bar and lower for five seconds to straight arms, step or jump back up, repeat.',
    cue: 'Slow and even all the way down. The last third is where the biceps work hardest.',
    breathing: 'Breathe out slowly through the lowering.',
    mistakes: 'Dropping the last third. Kipping up. Shrugging into the ears at the bottom.',
  },
};

const BAND_LATERAL: Exercise = {
  id: 'extra-band-lateral',
  name: 'Band Lateral Raise',
  capacities: ['shoulder'],
  block: 'ACCESSORY', intensity: 'MODERATE',
  sets: 2, work: 15, unit: 'reps', restSec: 45,
  load: { kind: 'band', text: 'Band under the feet, to shoulder height' },
  progression: 'Fifteen slow reps, then a heavier band, then a pause at the top.',
  protocolId: 'hypertrophy',
  note: 'The side of the shoulder: size where it shows, for little weight.',
  form: {
    setup: 'Stand on the band, the ends in the hands at the sides, a slight bend in the elbows.',
    execution: 'Raise the arms out to the sides to shoulder height, leading with the elbows, lower slowly.',
    cue: 'Pour water out of a jug at the top: the little finger a touch higher than the thumb is fine, a shrug is not.',
    breathing: 'Exhale up, inhale down.',
    mistakes: 'Shrugging. Swinging. Going above shoulder height.',
  },
};

const FACE_PULL: Exercise = {
  id: 'extra-face-pull',
  name: 'Cable Face Pull',
  capacities: ['shoulder'],
  block: 'ACCESSORY', intensity: 'MODERATE',
  sets: 2, work: 15, unit: 'reps', restSec: 45,
  load: { kind: 'bodyweight', text: 'Rope at face height, light: the rear shoulder, not the back' },
  progression: 'Fifteen reps with a pause at the face, then one plate more.',
  protocolId: 'prehab',
  note: 'Rear shoulder and rotator cuff, against all the pulling. Gym only.',
  form: {
    setup: 'Cable at face height with a rope, step back until the arms are straight, thumbs pointing back.',
    execution: 'Pull the rope to the face, hands finishing beside the ears and the elbows high, pause, return slowly.',
    cue: 'Finish like a double-biceps pose: elbows high, hands back.',
    breathing: 'Exhale as you pull, inhale as you return.',
    mistakes: 'Too heavy, so the lower back leans. Elbows dropping. Shrugging.',
  },
};

// ---- BUILD goals: push power, chest, balance -------------------------------------
// Offered only by the BUILD sheet's goal labels (custom.ts). None carries a
// capacity: chest and pushing power are the athlete's own extra goals, not
// climbing axes, so they are recorded with their loads and earn no XP.

const RING_DIP: Exercise = {
  id: 'extra-ring-dip',
  name: 'Ring Dip',
  capacities: [],
  block: 'SECONDARY', intensity: 'HARD',
  sets: 4, work: 5, unit: 'reps', restSec: 150,
  load: { kind: 'added-kg', text: 'Bodyweight first; a belt once four sets of six are clean' },
  progression: 'Feet-assisted dips until five clean reps, then full ring dips, then 2kg on a belt at a time.',
  protocolId: 'upper-power',
  note: 'An extra: no XP. Rings keep the wrists neutral. Stop above the depth where the shoulder stays packed.',
  variations: [
    { minLevel: 1, name: 'Ring Dip - Feet Assisted', load: 'Feet on a box behind you, as little help as you need' },
    { minLevel: 3, name: 'Ring Dip' },
    { minLevel: 5, name: 'Weighted Ring Dip', load: 'Belt or pack, RPE 8' },
  ],
  form: {
    setup: 'Rings at hip height. Jump to a support with straight arms, rings turned slightly out, shoulders pressed down, ribs in.',
    execution: 'Lower with the elbows going straight back until the shoulders sit just below the elbows, then press hard back to locked arms.',
    cue: 'Drive the press fast; lower under control. Stop the set the moment a rep slows.',
    breathing: 'Inhale down, exhale on the press.',
    mistakes: 'Rings drifting wide. Shrugging at the top. Sinking deeper than the shoulder can hold packed.',
  },
};

const PLYO_PUSHUP: Exercise = {
  id: 'extra-plyo-pushup',
  name: 'Explosive Push-Up',
  capacities: [],
  block: 'PRIMARY', intensity: 'HARD',
  sets: 4, work: 5, unit: 'reps', restSec: 120,
  load: { kind: 'bodyweight', text: 'Every rep as fast as you can push it' },
  progression: 'Hands on a box first, then the floor with the hands leaving it, then a clap.',
  protocolId: 'upper-power',
  note: 'An extra: no XP. Flat palms, soft landing. Skip it on a sore-wrist day.',
  variations: [
    { minLevel: 1, name: 'Explosive Incline Push-Up', load: 'Hands on a box or bench edge' },
    { minLevel: 3, name: 'Explosive Push-Up', load: 'Hands leave the floor' },
    { minLevel: 5, name: 'Clap Push-Up' },
  ],
  form: {
    setup: 'Push-up plank on flat palms, hands under the shoulders, body in one line.',
    execution: 'Lower under control, then push so hard the hands leave the floor. Land with soft elbows straight into the next rep.',
    cue: 'Height is the score. When the push stops getting the hands up, the set is over.',
    breathing: 'Sharp exhale on the push.',
    mistakes: 'Landing on locked elbows. Hips leading the push. Grinding reps once the speed is gone.',
  },
};

const DB_FLOOR_PRESS: Exercise = {
  id: 'extra-db-floor-press',
  name: 'Dumbbell Floor Press',
  capacities: [],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 10, unit: 'reps', restSec: 90,
  load: { kind: 'added-kg', text: 'Kilos per dumbbell: ten reps with two left' },
  progression: 'Ten clean reps on all sets, then the next dumbbell up and back to eight.',
  protocolId: 'hypertrophy',
  note: 'An extra: no XP. No bench needed: the floor stops the elbows at a shoulder-friendly depth.',
  variations: [
    { minLevel: 1, name: 'Dumbbell Floor Press' },
    { minLevel: 4, name: 'Dumbbell Floor Press, 3s Lower' },
    { minLevel: 6, name: 'Single-Arm Dumbbell Floor Press' },
  ],
  form: {
    setup: 'Lie on the mat, knees bent, a dumbbell in each hand over the chest, palms facing the feet or each other.',
    execution: 'Lower until the upper arms touch the floor, pause, press back up over the chest.',
    cue: 'Elbows at about 45 degrees from the body. Squeeze the chest at the top without clanking the bells.',
    breathing: 'Inhale down, exhale up.',
    mistakes: 'Bouncing the elbows off the floor. Flaring to 90 degrees. Arching the back off the mat.',
  },
};

const RING_PUSHUP: Exercise = {
  id: 'extra-ring-pushup',
  name: 'Ring Push-Up',
  capacities: [],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 10, unit: 'reps', restSec: 90,
  load: { kind: 'bodyweight', text: 'Lower rings make it harder' },
  progression: 'Rings high, then low, then the feet raised, then turning the rings out at the top.',
  protocolId: 'hypertrophy',
  note: 'An extra: no XP. The rings let the wrists find their own angle.',
  variations: [
    { minLevel: 1, name: 'Ring Push-Up - High Rings' },
    { minLevel: 3, name: 'Ring Push-Up' },
    { minLevel: 5, name: 'Ring Push-Up - Feet Raised' },
    { minLevel: 7, name: 'Ring Push-Up - Turned Out' },
  ],
  form: {
    setup: 'Rings or TRX handles a hand above the floor, body in a plank, arms straight under the shoulders.',
    execution: 'Lower until the hands are beside the chest, keeping the rings close to the body, then press back up.',
    cue: 'Keep the rings from drifting apart: that squeeze is the chest work.',
    breathing: 'Inhale down, exhale up.',
    mistakes: 'Rings sliding wide. Hips sagging. Shrugging.',
  },
};

const RING_FLY: Exercise = {
  id: 'extra-ring-fly',
  name: 'Ring Fly',
  capacities: [],
  block: 'ACCESSORY', intensity: 'MODERATE',
  sets: 2, work: 10, unit: 'reps', restSec: 60,
  load: { kind: 'bodyweight', text: 'The more upright, the easier' },
  progression: 'Stand more upright to start; walk the feet back as ten slow reps get easy.',
  protocolId: 'hypertrophy',
  note: 'An extra: no XP. A stretch across the chest under load, kept short of the shoulder complaining.',
  variations: [
    { minLevel: 1, name: 'Ring Fly - Upright' },
    { minLevel: 4, name: 'Ring Fly' },
    { minLevel: 6, name: 'Ring Fly - Low Rings' },
  ],
  form: {
    setup: 'Rings or TRX at chest height. Lean into them with straight arms in front, a slight bend in the elbows.',
    execution: 'Open the arms out to the sides as the body leans forward, to a comfortable stretch, then hug the rings back together.',
    cue: 'Arms like hugging a tree. The elbows stay soft and fixed.',
    breathing: 'Inhale open, exhale close.',
    mistakes: 'Bending the elbows into a press. Going deeper than the shoulder likes. Sagging hips.',
  },
};

const FEET_UP_PUSHUP: Exercise = {
  id: 'extra-feet-up-pushup',
  name: 'Feet-Up Push-Up',
  capacities: [],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 10, unit: 'reps', restSec: 90,
  load: { kind: 'bodyweight', text: 'Flat palms, feet raised' },
  progression: 'Feet on a low step, then a chair, then a three-second lowering.',
  protocolId: 'hypertrophy',
  note: 'An extra: no XP. Home chest work: raising the feet shifts it to the upper chest and adds load.',
  variations: [
    { minLevel: 1, name: 'Feet-Up Push-Up - Low Step' },
    { minLevel: 3, name: 'Feet-Up Push-Up - Chair' },
    { minLevel: 5, name: 'Feet-Up Push-Up - Chair, 3s Lower' },
  ],
  form: {
    setup: 'Hands a little wider than the shoulders on flat palms, feet on a step or chair behind you, body in one line.',
    execution: 'Lower the chest to just above the floor, press back to straight arms.',
    cue: 'Ribs down, glutes tight: the hips must not pike or sag.',
    breathing: 'Inhale down, exhale up.',
    mistakes: 'Head reaching for the floor. Elbows flaring. Half reps.',
  },
};

const SL_BALANCE: Exercise = {
  id: 'extra-sl-balance',
  name: 'Single-Leg Balance',
  capacities: [],
  block: 'PREHAB', intensity: 'TECHNIQUE',
  sets: 3, work: 30, unit: 'sec', restSec: 30,
  fixed: true,
  load: { kind: 'bodyweight', text: 'Barefoot, one foot' },
  progression: 'Eyes open, then eyes closed, then eyes closed on a folded mat.',
  protocolId: 'balance',
  perSide: true,
  note: 'An extra: no XP. Barefoot so the foot does the work.',
  variations: [
    { minLevel: 1, name: 'Single-Leg Balance' },
    { minLevel: 3, name: 'Single-Leg Balance - Eyes Closed' },
    { minLevel: 5, name: 'Single-Leg Balance - Eyes Closed, Soft Surface' },
  ],
  form: {
    setup: 'Barefoot, near a wall for safety. Stand on one foot, knee soft, hands on the hips.',
    execution: 'Hold the time with as little movement as you can, then switch feet.',
    cue: 'Grip the floor lightly with the toes; correct at the ankle, not the arms.',
    breathing: 'Slow and steady.',
    mistakes: 'Locking the knee. Hip dropping on the free side. Grabbing the wall at the first wobble.',
  },
};

const SL_REACH: Exercise = {
  id: 'extra-sl-reach',
  name: 'Single-Leg Star Reach',
  capacities: [],
  block: 'PREHAB', intensity: 'TECHNIQUE',
  sets: 2, work: 6, unit: 'reps', restSec: 30,
  fixed: true,
  load: { kind: 'bodyweight', text: 'One foot planted, the other reaches' },
  progression: 'Three directions, then five, then further out with a slower return.',
  protocolId: 'balance',
  perSide: true,
  note: 'An extra: no XP. The control a high step and a rockover ask for.',
  variations: [
    { minLevel: 1, name: 'Single-Leg Reach - Three Directions' },
    { minLevel: 3, name: 'Single-Leg Star Reach' },
    { minLevel: 5, name: 'Single-Leg Star Reach - Long, Slow' },
  ],
  form: {
    setup: 'Stand on one foot, knee soft. Picture a star on the floor around it.',
    execution: 'Reach the free toes as far as you can forward, sideways and back, touching lightly each time, back to standing between reaches. One round of directions is one rep.',
    cue: 'Sit into the standing hip; the knee tracks over the middle toes.',
    breathing: 'Exhale on each reach.',
    mistakes: 'Putting weight on the reaching foot. Knee collapsing inward. Rushing back.',
  },
};

export const GOAL_EXERCISES: Exercise[] = [
  RING_DIP, PLYO_PUSHUP, DB_FLOOR_PRESS, RING_PUSHUP, RING_FLY, FEET_UP_PUSHUP, SL_BALANCE, SL_REACH,
];

export const EXTRA_EXERCISES: Exercise[] = [
  BAND_CURL, BAND_HAMMER, BAND_TRICEPS, DIAMOND_PUSHUP, DB_CURL, CHINUP_NEGATIVE, BAND_LATERAL, FACE_PULL,
  ...GOAL_EXERCISES,
];
