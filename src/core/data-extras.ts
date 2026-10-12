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

export const EXTRA_EXERCISES: Exercise[] = [
  BAND_CURL, BAND_HAMMER, BAND_TRICEPS, DIAMOND_PUSHUP, DB_CURL, CHINUP_NEGATIVE, BAND_LATERAL, FACE_PULL,
];
