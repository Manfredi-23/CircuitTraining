// =============================================================================
// data-extras.ts — Exercises that only exist in the reserve
//
// The reserve (reserve.ts) mostly offers exercises the sessions already use,
// with their history. These are the gaps: arm work, which the programme leaves
// out on purpose (biceps and triceps are not climbing capacities, and size
// there is weight carried up the wall), two shoulder raises, and more for the
// back. Arms carry no
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
// Offered by the BUILD sheet's goal labels (custom.ts). Chest and pushing
// power carry no capacity: they are the athlete's own extra goals, not
// climbing axes, so they are recorded with their loads and earn no XP. The
// balance, rock-over and hip drills train `legs`, `tension` or `mobility`
// like the footwork, and earn XP. The star reach is also in DAILY 06.

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

export const SL_BALANCE: Exercise = {
  id: 'extra-sl-balance',
  name: 'Single-Leg Balance',
  capacities: ['legs', 'tension'],
  block: 'PREHAB', intensity: 'TECHNIQUE',
  sets: 3, work: 30, unit: 'sec', restSec: 30,
  fixed: true,
  load: { kind: 'bodyweight', text: 'Barefoot, one foot' },
  progression: 'Eyes open, then eyes closed, then eyes closed on a folded mat.',
  protocolId: 'balance',
  perSide: true,
  note: 'Barefoot so the foot does the work.',
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

export const SL_REACH: Exercise = {
  id: 'extra-sl-reach',
  name: 'Single-Leg Star Reach',
  capacities: ['legs', 'tension'],
  block: 'PREHAB', intensity: 'TECHNIQUE',
  sets: 2, work: 6, unit: 'reps', restSec: 30,
  fixed: true,
  load: { kind: 'bodyweight', text: 'One foot planted, the other reaches' },
  progression: 'Three directions, then five, then further out with a slower return.',
  protocolId: 'balance',
  perSide: true,
  note: 'Per leg. The control a high step and a rock-over ask for.',
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

const STEP_DOWN: Exercise = {
  id: 'extra-step-down',
  name: 'Controlled Step-Up + Slow Lower',
  capacities: ['legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 6, unit: 'reps', restSec: 60,
  load: { kind: 'bodyweight', text: 'A stable step, 15-25 cm to start' },
  progression: 'Quieter, smoother reps first, then a step a little higher, then a 3-second lowering with a pause at the top.',
  protocolId: 'rockover-strength',
  perSide: true,
  note: 'Per leg. The rock-over on the floor: hips over the foot, then stand.',
  variations: [
    { minLevel: 1, name: 'Step-Up + Slow Lower - Low Step' },
    { minLevel: 3, name: 'Step-Up + Slow Lower - Chair Height' },
    { minLevel: 5, name: 'Step-Up + Slow Lower - Chair, Pause' },
  ],
  form: {
    setup: 'Whole foot on a secure low step, the other on the floor behind. Hands on the hips.',
    execution: 'Shift the pelvis over the step foot, then stand by straightening that leg, the trailing foot just along for the ride. Lower over three seconds back to the floor.',
    cue: 'No push from the back foot. If you need it, the step is too high today.',
    breathing: 'Exhale up, inhale down.',
    mistakes: 'Bouncing off the trailing leg. Knee diving inward. Dropping on the way down.',
  },
};

const SHIFT_SPLIT_SQUAT: Exercise = {
  id: 'extra-shift-split-squat',
  name: 'Split Squat, Forward Shift',
  capacities: ['legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 8, unit: 'reps', restSec: 60,
  load: { kind: 'bodyweight', text: 'Bodyweight, hands on the hips' },
  progression: 'Deeper only while it stays smooth, then a 3-second lowering.',
  protocolId: 'rockover-strength',
  perSide: true,
  note: 'Per leg. The weight moves onto the front foot, not just down.',
  variations: [
    { minLevel: 1, name: 'Split Squat, Forward Shift' },
    { minLevel: 4, name: 'Split Squat, Forward Shift, 3s Lower' },
  ],
  form: {
    setup: 'A comfortable split stance, the whole front foot on the floor.',
    execution: 'Bend both knees while moving the trunk and hips forward over the front foot, then rise smoothly through the front leg.',
    cue: 'Front foot flat and heavy; the back foot only balances.',
    breathing: 'Inhale down, exhale up.',
    mistakes: 'Driving from the rear foot. Front knee collapsing in. Heel lifting.',
  },
};

const HIGH_KNEE_HOLD: Exercise = {
  id: 'extra-high-knee-hold',
  name: 'Standing High-Knee Hold',
  capacities: ['mobility', 'legs'],
  block: 'MOBILITY', intensity: 'EASY',
  sets: 2, work: 8, unit: 'reps', restSec: 15,
  load: { kind: 'bodyweight', text: 'Three-second hold at the top' },
  progression: 'A little higher each week, only while the trunk stays tall.',
  protocolId: 'mobility',
  perSide: true,
  note: 'Per leg. The active range a high step needs.',
  form: {
    setup: 'Stand tall on one leg, hands on the hips.',
    execution: 'Raise the other knee toward the chest without leaning back, hold three seconds, lower quietly.',
    cue: 'The hip lifts the knee; the back does not help.',
    breathing: 'Exhale as the knee rises.',
    mistakes: 'Leaning back. Tucking the pelvis. Dropping the leg.',
  },
};

const SIDE_ABDUCTION: Exercise = {
  id: 'extra-side-abduction',
  name: 'Side-Lying Hip Abduction',
  capacities: ['legs'],
  block: 'PREHAB', intensity: 'EASY',
  sets: 2, work: 12, unit: 'reps', restSec: 30,
  load: { kind: 'bodyweight', text: 'Top leg straight, a pause at the top' },
  progression: 'A two-second pause at the top, then slower lowering. Never swing.',
  protocolId: 'balance',
  perSide: true,
  note: 'Per leg. The side of the hip that keeps the pelvis level on one foot. Hands free.',
  form: {
    setup: 'Lie on one side, head resting on the lower arm, hips stacked, the bottom knee bent.',
    execution: 'Raise the top leg, heel leading and slightly back, without rolling the pelvis backward. Lower slowly.',
    cue: 'Small and strict beats high and rolled back.',
    breathing: 'Exhale up.',
    mistakes: 'Rolling the pelvis back. Toes turning up. Swinging.',
  },
};

const DEAD_BUG_CHEST: Exercise = {
  id: 'extra-dead-bug',
  name: 'Dead Bug, Hands on Chest',
  capacities: ['tension'],
  block: 'PREHAB', intensity: 'EASY',
  sets: 2, work: 8, unit: 'reps', restSec: 30,
  load: { kind: 'bodyweight', text: 'Legs only, lower back flat' },
  progression: 'The moving leg further toward straight, as long as the lower back stays down.',
  protocolId: 'daily-trunk',
  perSide: true,
  note: 'Per side. Trunk control while the legs move, without loading the hands.',
  form: {
    setup: 'On your back, knees over hips in tabletop, hands resting on the chest.',
    execution: 'Slowly lower one heel toward the floor and return, then the other.',
    cue: 'Ribs down, lower back heavy on the mat.',
    breathing: 'Exhale as the leg lowers.',
    mistakes: 'Back arching off the mat. Rushing. Holding the breath.',
  },
};

// ---- BACK: the lower back and the middle of it -------------------------------------
// BUILD's BACK area and the reserve (v40). The lower back gets the extension
// and hinge ladder of `back-strength`; the middle of the back, between the
// shoulder blades, the prone raises of `upper-back`. Four at home, three at
// the gym; the two good mornings here grip nothing, so a hinge stays on offer
// while a finger heals.

const PRONE_SWIMMER: Exercise = {
  id: 'extra-prone-swimmer',
  name: 'Prone Swimmer',
  capacities: ['tension', 'shoulder'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 2, work: 8, unit: 'reps', restSec: 45,
  load: { kind: 'bodyweight', text: 'Chest and arms off the mat the whole set' },
  progression: 'Eight slow sweeps with the chest up the whole set, then a two-second hold at each end, then ten.',
  protocolId: 'upper-back',
  note: 'The middle and the bottom of the back at once: the chest stays lifted while the arms sweep.',
  variations: [
    { minLevel: 1, name: 'Prone Swimmer' },
    { minLevel: 3, name: 'Prone Swimmer, 2s Holds' },
    { minLevel: 5, name: 'Prone Swimmer, Legs Lifted' },
  ],
  form: {
    setup: 'Face down, legs straight, forehead just off the mat. Arms overhead in a Y, thumbs up. Squeeze the glutes, lift the chest and arms a few centimetres.',
    execution: 'Keeping everything off the mat, sweep the arms wide and down, bending the elbows into a W, until the hands reach the lower back. Sweep back to the Y. One sweep is one rep.',
    cue: 'The shoulder blades slide down and together at the bottom of each sweep: that squeeze is the centre of the back working.',
    breathing: 'Exhale as the hands come down, inhale as they go overhead.',
    mistakes: 'Cranking the head up. Dropping the chest to rest. Shrugging the shoulders to the ears.',
  },
};

const PRONE_COBRA: Exercise = {
  id: 'extra-prone-cobra',
  name: 'Prone Cobra Hold',
  capacities: ['shoulder', 'tension'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 30, unit: 'sec', restSec: 45,
  load: { kind: 'bodyweight', text: 'Hands by the hips, palms out' },
  progression: 'Thirty seconds without the chest sinking, then forty, then the arms out in a T.',
  protocolId: 'upper-back',
  note: 'A hold for the muscles between the shoulder blades, against the rounded posture all the pulling builds.',
  variations: [
    { minLevel: 1, name: 'Prone Cobra Hold' },
    { minLevel: 4, name: 'Prone Cobra Hold, Arms in a T' },
    { minLevel: 6, name: 'Prone Cobra Hold, Arms in a Y' },
  ],
  form: {
    setup: 'Face down, legs straight, arms by the sides with the palms facing the floor.',
    execution: 'Turn the thumbs out so the palms face away from the body, squeeze the shoulder blades back and down, and lift the chest and hands a few centimetres. Hold.',
    cue: 'Collarbones wide, chin tucked, eyes on the floor. The lower back holds, the shoulder blades do the work.',
    breathing: 'Slow, steady breaths through the hold.',
    mistakes: 'Lifting the head instead of the chest. Shrugging. Lifting so high the lower back pinches.',
  },
};

const PLATE_GOOD_MORNING: Exercise = {
  id: 'extra-plate-good-morning',
  name: 'Plate Hug Good Morning',
  capacities: ['tension', 'legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 10, unit: 'reps', restSec: 60,
  load: { kind: 'added-kg', value: 10, text: 'A plate hugged to the chest, nothing gripped' },
  progression: 'Ten reps with a flat back and a one-second squeeze at the top, then a heavier plate, then a three-second lowering.',
  protocolId: 'back-strength',
  note: 'The loaded hip hinge with the hands free of any grip, so it stays while a finger heals.',
  variations: [
    { minLevel: 1, name: 'Plate Hug Good Morning' },
    { minLevel: 4, name: 'Plate Hug Good Morning, 3s Lower' },
    { minLevel: 6, name: 'Plate Hug Good Morning, 2s Pause' },
  ],
  form: {
    setup: 'Feet hip-width, soft knees. A plate hugged flat against the chest, arms crossed over it.',
    execution: 'Push the hips back and let the chest come forward until the torso is nearly parallel to the floor or the hamstrings stop you, back flat. Drive the hips forward to stand tall and squeeze the glutes.',
    cue: 'The back holds its shape while the hips move the weight: the same work as the band good morning, with a load that keeps going up.',
    breathing: 'Inhale on the way down, exhale as you stand.',
    mistakes: 'Rounding the back to get lower. Squatting instead of hinging. Leaning back at the top.',
  },
};

const DB_REVERSE_FLY: Exercise = {
  id: 'extra-db-reverse-fly',
  name: 'Bent-Over Dumbbell Reverse Fly',
  capacities: ['shoulder', 'tension'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 12, unit: 'reps', restSec: 60,
  load: { kind: 'added-kg', value: 4, text: 'Two light dumbbells, kg each' },
  progression: 'Twelve reps with a one-second squeeze at the top, then two kilos more, then a three-second lowering.',
  protocolId: 'upper-back',
  note: 'Rear shoulders and the middle of the back, the hinge held throughout. No bench: standing, bent over.',
  form: {
    setup: 'Feet hip-width, hinge until the torso is about 45 degrees, back flat, knees soft. A light dumbbell in each hand under the shoulders, a soft bend in the elbows.',
    execution: 'Open the arms out to the sides until they are level with the back, squeeze the shoulder blades together for a second, lower slowly.',
    cue: 'Lead with the elbows and think of the shoulder blades meeting. The hinge does not move.',
    breathing: 'Exhale as the arms open, inhale as they lower.',
    mistakes: 'Too heavy, so the body swings up. Shrugging. Standing up out of the hinge as you tire.',
  },
};

const KB_SWING: Exercise = {
  id: 'extra-kb-swing',
  name: 'Kettlebell Swing',
  capacities: ['legs', 'tension'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 12, unit: 'reps', restSec: 60,
  load: { kind: 'added-kg', value: 16, text: 'One kettlebell, both hands' },
  progression: 'Twelve crisp swings to chest height, then four kilos more. Never to a grinding last rep.',
  protocolId: 'back-strength',
  note: 'The hinge made fast: the hips drive, the back stays flat and strong at speed.',
  form: {
    setup: 'Feet a little wider than the hips, the kettlebell a foot in front. Hinge, grip the handle, tilt it toward you.',
    execution: 'Hike the bell back between the legs, then snap the hips forward to stand tall so the bell floats to chest height. Let it fall back into the hinge and go again.',
    cue: 'A jump that never leaves the floor: hips, not arms, lift the bell. Stand tall with the glutes squeezed at the top.',
    breathing: 'A sharp exhale at the top of every swing.',
    mistakes: 'Squatting the swing. Lifting with the arms. Leaning back at the top. Rounding the back as the bell comes down.',
  },
};

const BW_GOOD_MORNING: Exercise = {
  id: 'extra-bw-good-morning',
  name: 'Good Morning, Hands Behind Head',
  capacities: ['tension', 'legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 2, work: 12, unit: 'reps', restSec: 45,
  load: { kind: 'bodyweight', text: 'Hands behind the head: the arms are the load' },
  progression: 'Twelve with a flat back and a one-second squeeze at the top, then a three-second lowering, then on one leg.',
  protocolId: 'back-strength',
  note: 'The hinge at home with nothing in the hands, so it stays while a finger heals.',
  variations: [
    { minLevel: 1, name: 'Good Morning, Hands Behind Head' },
    { minLevel: 3, name: 'Good Morning, Hands Behind Head, 3s Lower' },
    { minLevel: 5, name: 'Single-Leg Good Morning, Hands Behind Head' },
  ],
  form: {
    setup: 'Feet hip-width, soft knees, fingertips resting behind the head, elbows wide. Ribs down, back flat.',
    execution: 'Push the hips back and let the chest come forward until the torso is nearly parallel to the floor or the hamstrings stop you, back flat. Drive the hips forward to stand tall and squeeze the glutes.',
    cue: 'The hands rest on the head, they never pull it. The back holds its shape, the hips move.',
    breathing: 'Inhale on the way down, exhale as you stand.',
    mistakes: 'Pulling the head forward. Rounding to get lower. Squatting instead of hinging.',
  },
};

const WALL_ANGEL: Exercise = {
  id: 'extra-wall-angel',
  name: 'Wall Angel',
  capacities: ['shoulder', 'mobility'],
  block: 'PREHAB', intensity: 'EASY',
  sets: 2, work: 10, unit: 'reps', restSec: 30,
  load: { kind: 'bodyweight', text: 'Back to a wall, no load' },
  progression: 'Ten slow slides with the wrists and elbows on the wall, then a step closer to the wall, then a three-second hold at the top.',
  protocolId: 'upper-back',
  note: 'The middle of the back and the thoracic spine, standing: against the rounded shoulders of a climbing week.',
  form: {
    setup: 'Back against a wall, feet a step out, the lower back and head touching the wall. Arms up in a goalpost, the backs of the hands and the elbows on the wall.',
    execution: 'Slide the arms up the wall as far as they go without anything coming off it, then pull the elbows down toward the ribs, squeezing the shoulder blades down and together.',
    cue: 'Ribs down: if the lower back arches off the wall, the range is coming from the wrong place.',
    breathing: 'Inhale as the arms rise, exhale as the elbows pull down.',
    mistakes: 'The lower back arching. The head jutting forward. Shrugging at the top.',
  },
};

export const BACK_EXERCISES: Exercise[] = [
  PRONE_SWIMMER, PRONE_COBRA, PLATE_GOOD_MORNING, DB_REVERSE_FLY, KB_SWING, BW_GOOD_MORNING, WALL_ANGEL,
];

export const GOAL_EXERCISES: Exercise[] = [
  RING_DIP, PLYO_PUSHUP, DB_FLOOR_PRESS, RING_PUSHUP, RING_FLY, FEET_UP_PUSHUP, SL_BALANCE, SL_REACH,
  STEP_DOWN, SHIFT_SPLIT_SQUAT, HIGH_KNEE_HOLD, SIDE_ABDUCTION, DEAD_BUG_CHEST,
];

export const EXTRA_EXERCISES: Exercise[] = [
  BAND_CURL, BAND_HAMMER, BAND_TRICEPS, DIAMOND_PUSHUP, DB_CURL, CHINUP_NEGATIVE, BAND_LATERAL, FACE_PULL,
  ...GOAL_EXERCISES, ...BACK_EXERCISES,
];

// ---- Balance and power at full stretch, in every session ---------------------------
// One short drill that does both: sink into the deep lunge, drive out of it
// fast, finish standing on the front leg. A minute in a DAILY, two sets in a
// longer session (v34).

export const LUNGE_DRIVE: Exercise = {
  id: 'extra-lunge-drive',
  name: 'Deep Lunge Drive + Stick',
  capacities: ['legs', 'mobility'],
  block: 'MOBILITY', intensity: 'MODERATE',
  sets: 1, work: 5, unit: 'reps', restSec: 15,
  fixed: true,
  load: { kind: 'bodyweight', text: 'Bodyweight, hands free' },
  progression: 'A deeper lunge with a longer stick, then a pause at the bottom, then a small hop into the stick.',
  protocolId: 'end-range-strength',
  alsoTrains: ['balance'],
  perSide: true,
  note: 'Per leg. Three seconds down into the deepest lunge, then drive up fast onto the front leg and freeze for two seconds.',
  variations: [
    { minLevel: 1, name: 'Deep Lunge Drive + Stick' },
    { minLevel: 3, name: 'Deep Lunge Drive + Stick, 2s Pause' },
    { minLevel: 5, name: 'Deep Lunge Drive + Hop Stick' },
  ],
  form: {
    setup: 'Long split stance, front foot flat, back knee just off the floor. Hands free.',
    execution: 'Sink for three seconds until the front hip is low and the back hip flexor stretches. Then drive through the front foot, stand up onto it, lift the back knee to hip height and hold two seconds without a wobble. Step back down into the lunge.',
    cue: 'Power from the stretched position, then stillness on one foot: the high step and the stand-up on it.',
    breathing: 'Inhale sinking in, exhale on the drive.',
    mistakes: 'Pushing off the back foot. Knee caving on the stand. Putting the free foot down to save the stick.',
  },
};
