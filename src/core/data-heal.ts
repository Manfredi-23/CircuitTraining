// =============================================================================
// data-heal.ts — HEAL mode: gym sessions while a finger heals
//
// The athlete hurt a finger in October 2026: no climbing and no pulling for a
// few weeks. HEAL keeps everything else strong in the meantime, and builds the
// qualities climbing never trains, in the bouldering gym's training area.
//
// Equipment: one barbell and plates, a box, the 45-degree back extension
// bench, bands, a mat. No machines, no adjustable bench, no TRX foot cradles.
// The barbell is for the squat only (the athlete's call).
//
// The rule every exercise obeys: the hands only rest on things or press flat.
// No dumbbell, kettlebell, ring, bar hang or band handle is gripped; plates are
// hugged to the chest with the forearms, the barbell sits on the back. Nothing
// pulls.
//
// Two sessions, 50-75 minutes NORMAL, alternated, two or three a week:
//   01 LEGS + TRUNK  — box jumps, the back squat, step-up, split squat,
//                      back extension, then the hollow body and the abs.
//   02 PUSH + HINGE  — Nordic curl, weighted push-up, pike push-up, the
//                      shoulder blades, then rotation and leg raises.
// Both close with pain-free tendon glides for the injured finger.
//
// Order is by neurological cost, as everywhere: power, then the heavy lift,
// then the supporting strength, the trunk, and mobility last.
// =============================================================================

import type { Exercise, Circuit } from './types';
import { DATA_CAVE } from './data-cave';
import { DATA_DAILY, SIDE_PLANK_DIP } from './data-daily';

/**
 * An exercise already in another tab, taken as the same object so its id,
 * levels and load history carry over.
 */
function shared(circuits: Circuit[], id: string): Exercise {
  const ex = circuits.flatMap(c => c.exercises).find(e => e.id === id);
  if (!ex) throw new Error(`data-heal: no shared exercise ${id}`);
  return ex;
}

const BACK_EXTENSION = shared(DATA_CAVE, 'legs-back-extension');
const COPENHAGEN = shared(DATA_CAVE, 'home-copenhagen');
const PLATE_CRUNCH = shared(DATA_CAVE, 'legs-plate-crunch');
const TOE_DRAG = shared(DATA_CAVE, 'legs-toe-drag');
const FROGGER = shared(DATA_CAVE, 'feet-frogger');
const BACK_UNWIND = shared(DATA_DAILY, 'daily-back-unwind');
/** Same id and history as CAVE 02's twist; the plate is hugged, never held by the fingers. */
const RUSSIAN_TWIST: Exercise = {
  ...shared(DATA_CAVE, 'addon-russian-twist'),
  load: { kind: 'added-kg', text: 'A plate hugged to the chest with the forearms, or none to start' },
  note: 'Left plus right is 2 reps. Plate hugged, fingers open against it. The obliques do the turning, not the arms.',
};

const HANDS_NOTE = 'Hands: they only rest on the bar or press flat. If closing them on anything hurts the finger, open them.';

export const HEAL_WARMUP: Exercise = {
  id: 'heal-warmup',
  name: 'Pulse Raiser + Hips and Shoulders',
  capacities: ['mobility'],
  block: 'WARMUP', intensity: 'EASY',
  sets: 1, work: 420, unit: 'sec', restSec: 30,
  load: { kind: 'bodyweight', text: 'No load. Nothing held.' },
  fixed: true,
  progression: 'Never progressed. Preparation, not training.',
  protocolId: 'warmup',
  note: 'No rower and no ski erg: both are a grip. Bike with the hands resting open, step-ups or a jog.',
  form: {
    setup: 'A bike, a box or a free stretch of floor. The injured hand stays open the whole time.',
    execution: 'Three minutes on the bike or stepping up and down a box, hands off the handles. Then 10 leg swings each way per leg, 5 world\'s greatest stretches a side, 10 slow bodyweight squats, 10 scapular push-ups on flat palms against a wall or the floor, and 10 arm circles each way.',
    cue: 'Warm and switched on, not tired. The empty bar comes next as the first ramp set of the squat or the good morning.',
    breathing: 'Nasal, unhurried.',
    mistakes: 'Gripping a handle out of habit. Skipping it because the fingers are not being loaded: the hips and the back are.',
  },
};

export const TENDON_GLIDES: Exercise = {
  id: 'heal-tendon-glides',
  name: 'Tendon Glides',
  capacities: ['mobility'],
  block: 'PREHAB', intensity: 'TECHNIQUE',
  sets: 1, work: 90, unit: 'sec', restSec: 15,
  load: { kind: 'bodyweight', text: 'No load. Pain free, every position.' },
  fixed: true,
  progression:
    'Never progressed here. Loading the finger back up is a separate decision, '
    + 'made with a hand therapist or when it is fully pain free.',
  protocolId: 'train-around',
  note: 'Both hands, ten slow rounds. Any position that hurts is left out, not pushed.',
  form: {
    setup: 'Sitting or standing, forearm vertical, wrist straight and relaxed. Warm hands: after the session, not before it.',
    execution: 'Move slowly through five positions and hold each three seconds: straight hand, hook fist (knuckles straight, fingertips to the top of the palm), full fist, tabletop (knuckles bent, fingers straight), straight fist (fingertips to the base of the palm). Back to straight. That is one round.',
    cue: 'Each position slides the two flexor tendons a different distance through the pulleys, which keeps them gliding while the finger cannot be loaded. Movement, not stretch.',
    breathing: 'Relaxed and normal.',
    mistakes: 'Forcing a fist the finger does not want to make. Pressing on the finger with the other hand. Doing it fast.',
  },
};

const HEAL_BAND_ER: Exercise = {
  id: 'heal-band-er',
  name: 'Band External Rotation - Band on the Wrist',
  capacities: ['shoulder'],
  block: 'PREHAB', intensity: 'EASY',
  sets: 2, work: 15, unit: 'reps', restSec: 45,
  load: { kind: 'band', text: 'Light band looped round the wrist, hand open' },
  progression: 'Reps to 20, then a slightly heavier band. Never heavy.',
  protocolId: 'prehab',
  perSide: true,
  note: 'Per side. The band sits round the wrist, so the hand stays open.',
  form: {
    setup: 'Band anchored at elbow height and looped round the wrist, not held. Elbow tucked to the ribs at 90 degrees.',
    execution: 'Rotate the forearm outward keeping the elbow pinned, slow return.',
    cue: 'Climbing will load the internal rotators again in a few weeks. This is the balance payment, made while the shoulders have time.',
    breathing: 'Exhale rotating out.',
    mistakes: 'Elbow drifting from the ribs. Gripping the band out of habit.',
  },
};

export const DATA_HEAL: Circuit[] = [
  {
    id: 'heal-01', circuitNum: '01',
    title: 'LEGS + TRUNK', subtitle: 'injured finger - barbell - legs - abs',
    focus: 'Leg strength and power, the hips and lower back, and the abs, with the hands left alone.',
    capacities: ['legs', 'tension'],
    illustration: 'squats.svg',
    duration: 65,
    recoveryHours: 24,
    note:
      'For the weeks a finger is healing. Nothing here is gripped or pulled: the bar '
      + 'sits on the back, plates are hugged to the chest. Power first, then '
      + 'the squat while you are fresh, then single-leg and the back, then the trunk. '
      + 'Alternate with 02. Any pain in the finger and that exercise is gone today.',
    exercises: [
      HEAL_WARMUP,
      {
        id: 'heal-box-jump',
        name: 'Box Jump',
        capacities: ['legs'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 4, work: 3, unit: 'reps', restSec: 90,
        load: { kind: 'bodyweight', text: 'A box you land on softly in a quarter squat' },
        progression:
          'A higher box only when every landing is quiet and no deeper than the take-off. '
          + 'Then single-leg take-offs onto a low box.',
        protocolId: 'heal-strength',
        note: 'Step down, never jump down. Arms swing free, hands open.',
        variations: [
          { minLevel: 1, name: 'Box Jump' },
          { minLevel: 3, name: 'Box Jump - Seated Start', load: 'From sitting on a second box: no countermovement' },
          { minLevel: 5, name: 'Single-Leg Box Jump', load: 'Low box, three a leg' },
        ],
        form: {
          setup: 'Box at about knee height, a step in front of it. Feet hip-width.',
          execution: 'Swing the arms back, dip, and jump up onto the box, landing on the whole foot in a quarter squat. Stand tall, step down, reset. Every rep from a dead stop.',
          cue: 'Dynos and big moves off poor feet are the legs firing fast. Three fresh reps train that; a tired tenth trains landing badly.',
          breathing: 'Breath in on the dip, out on the jump.',
          mistakes: 'A box so high you land in a deep squat. Knees caving on the landing. Jumping down. Turning it into conditioning.',
        },
      },
      {
        id: 'heal-back-squat',
        name: 'Barbell Back Squat',
        capacities: ['legs'],
        block: 'PRIMARY', intensity: 'HARD',
        sets: 4, work: 5, unit: 'reps', restSec: 180,
        load: { kind: 'added-kg', value: 40, text: 'Total on the bar, RPE 7-8: two reps in reserve' },
        progression:
          'All four sets of five clean at the same weight, then 2.5kg more next session. '
          + 'Ramp to it: empty bar x8, then two or three lighter sets of three.',
        protocolId: 'heal-strength',
        note: HANDS_NOTE,
        variations: [
          { minLevel: 1, name: 'Barbell Back Squat', load: 'RPE 7: learn the groove before the load' },
          { minLevel: 3, name: 'Barbell Back Squat', load: 'RPE 8, total on the bar' },
          { minLevel: 5, name: 'Barbell Back Squat - 2s Pause', load: 'A two-second pause in the hole, RPE 8' },
        ],
        form: {
          setup: 'Bar on the upper back, across the meat of the traps, set in a rack at mid-chest height. Hands wide on the bar, the injured hand open with the palm flat against it: the back carries the bar, the hands only stop it rolling. Safeties set just below the bottom position.',
          execution: 'Brace, sit down between the hips until the hip crease passes the knee, then drive up through the whole foot. The bar travels straight over the middle of the foot. Rack it after the fifth rep, not after a failed sixth.',
          cue: 'A climber off the wall finally has recovery to spare, and the legs are where it buys the most. Strong legs are high steps and rockovers, at little extra weight.',
          breathing: 'Big breath in at the top and hold it down, exhale past the hardest point on the way up.',
          mistakes: 'Squatting without safeties. Cutting depth to move weight. Heels lifting. Knees collapsing inward. Wrapping the injured hand round the bar because it feels normal.',
        },
      },
      {
        id: 'heal-step-up',
        name: 'Box Step-Up',
        capacities: ['legs'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 8, unit: 'reps', restSec: 90,
        load: { kind: 'added-kg', value: 0, text: 'Bodyweight, then a plate hugged to the chest' },
        progression:
          'Eight a leg on a knee-height box with no push from the back foot, then a plate '
          + 'hugged to the chest in 5kg steps, then a higher box.',
        protocolId: 'heal-strength',
        perSide: true,
        note: 'Per leg. The plate is hugged with the forearms, fingers open against it.',
        variations: [
          { minLevel: 1, name: 'Box Step-Up' },
          { minLevel: 3, name: 'Box Step-Up - Plate Hug' },
          { minLevel: 5, name: 'Box Step-Up - High Box, 3s Lower' },
        ],
        form: {
          setup: 'Box at knee height or a little higher. Whole working foot on the box, plate held flat against the chest, forearms crossed over it.',
          execution: 'Lean the chest over the front foot and stand up onto the box through that heel, the back foot only trailing along. Lower back down slowly under control. All reps on one leg, then the other.',
          cue: 'This is the high step and the rockover, loaded: one leg pressing the body up over a foot that is already high. Push off the back toes and it stops counting.',
          breathing: 'Exhale standing up.',
          mistakes: 'Bouncing off the back foot. Knee caving in on the way up. Dropping down instead of lowering.',
        },
      },
      {
        id: 'heal-split-squat',
        name: 'Rear-Foot-Elevated Split Squat',
        capacities: ['legs', 'mobility'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 8, unit: 'reps', restSec: 90,
        load: { kind: 'added-kg', value: 0, text: 'Bodyweight, then a plate hugged to the chest' },
        progression:
          'Eight a leg at full depth, then a plate hugged to the chest in 5kg steps, then '
          + 'a three-second lowering.',
        protocolId: 'heal-strength',
        perSide: true,
        note: 'Per leg. The plate is hugged with the forearms, fingers open against it.',
        variations: [
          { minLevel: 1, name: 'Rear-Foot-Elevated Split Squat' },
          { minLevel: 3, name: 'Rear-Foot-Elevated Split Squat - Plate Hug' },
          { minLevel: 5, name: 'Rear-Foot-Elevated Split Squat - 3s Lower' },
        ],
        form: {
          setup: 'Back foot laces-down on the box, front foot far enough forward that the front shin stays near vertical at the bottom. Plate held flat against the chest, forearms crossed over it.',
          execution: 'Lower straight down until the back knee is just off the floor, then drive up through the front heel. All reps on one leg, then the other. A box too high for the back foot: use the floor, a plate stack, or a split squat with both feet down.',
          cue: 'One leg at a time is how climbing uses the legs, and it stretches the hip flexor of the back leg at the same time: a high step with a long reach.',
          breathing: 'Inhale down, exhale up.',
          mistakes: 'Front foot too close, which drives the knee far over the toes. Bouncing off the bottom. Doing more reps on the strong leg.',
        },
      },
      BACK_EXTENSION,
      COPENHAGEN,
      {
        id: 'morn-hollow',
        name: 'Hollow Body Hold',
        capacities: ['tension'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 30, unit: 'sec', restSec: 60,
        load: { kind: 'bodyweight', text: 'Mat only. Lower back pressed down the whole time.' },
        progression:
          'Thirty seconds with the lower back flat, then arms overhead, then legs lower, '
          + 'then hollow rocks.',
        protocolId: 'tension-iso',
        note: 'Hands open, arms reaching. Nothing held.',
        variations: [
          { minLevel: 1, name: 'Hollow Body Hold - Tucked', load: 'Knees bent over the hips, arms by the sides' },
          { minLevel: 3, name: 'Hollow Body Hold' },
          { minLevel: 5, name: 'Hollow Body Hold - Arms Overhead' },
          { minLevel: 7, name: 'Hollow Rock', load: '30s of slow rocks in the hollow shape' },
        ],
        form: {
          setup: 'On your back on the mat. Press the lower back into the floor and keep it there; that is the whole exercise.',
          execution: 'Lift the shoulders and the legs off the floor into a shallow banana, arms long. Hold. When the lower back starts to lift, bend the knees or bring the arms down rather than lose it.',
          cue: 'The shape the body takes on a steep wall to keep the feet on: ribs down, pelvis tucked, a long body held stiff. The front lever without the bar.',
          breathing: 'Short breaths, never held.',
          mistakes: 'Lower back arching off the floor. Legs so high it gets easy. Neck cranked forward.',
        },
      },
      PLATE_CRUNCH,
      TOE_DRAG,
      FROGGER,
      TENDON_GLIDES,
    ],
  },
  {
    id: 'heal-02', circuitNum: '02',
    title: 'PUSH + HINGE', subtitle: 'injured finger - press - hamstrings - abs',
    focus: 'The hamstrings, the pushing climbing never trains, the shoulder blades and the abs, with no grip.',
    capacities: ['press', 'shoulder'],
    illustration: 'pushups.svg',
    duration: 65,
    recoveryHours: 24,
    note:
      'For the weeks a finger is healing, alternated with 01. No barbell here: the '
      + 'hamstrings work against bodyweight, push-ups go on flat hands, and nothing pulls. Hinge '
      + 'and press first while fresh, then the shoulder blades, then the obliques. Any '
      + 'pain in the finger and that exercise is gone today.',
    exercises: [
      HEAL_WARMUP,
      {
        id: 'heal-nordic-curl',
        name: 'Nordic Hamstring Curl',
        capacities: ['legs'],
        block: 'PRIMARY', intensity: 'HARD',
        sets: 3, work: 5, unit: 'reps', restSec: 120,
        load: { kind: 'bodyweight', text: 'Bodyweight, as slow a lowering as you can hold' },
        progression:
          'Lower slower and further before the hands catch you. Once the full lowering '
          + 'takes five seconds on every rep, add a pull back up from the bottom.',
        protocolId: 'heal-strength',
        note: 'Heels under the rollers of the back extension bench, or a partner on the ankles. Catch yourself on flat palms.',
        variations: [
          { minLevel: 1, name: 'Nordic Curl - Partial', load: 'Lower as far as you control, then catch on flat palms' },
          { minLevel: 3, name: 'Nordic Curl', load: 'All the way down, 3-5s' },
          { minLevel: 6, name: 'Nordic Curl - Pull Back Up' },
        ],
        form: {
          setup: 'Kneel on a folded mat, heels locked under the rollers of the back extension bench (stand it so the pads hold the ankles) or held by a partner. Body straight from knees to head, hips extended.',
          execution: 'Lean forward from the knees as slowly as possible, hips staying straight, until you can no longer hold it. Catch yourself on flat palms in a push-up, push lightly back up and reset.',
          cue: 'The hamstrings working while they lengthen, which is exactly what a heel hook asks of them, and the best-supported hamstring injury prevention there is. Expect sore legs the first two sessions.',
          breathing: 'Breathe out slowly on the way down.',
          mistakes: 'Bending at the hips to make it easier. Dropping fast past the point you control. Landing on the injured hand with the fingers curled.',
        },
      },
      {
        id: 'heal-weighted-pushup',
        name: 'Weighted Push-Up',
        capacities: ['press', 'shoulder'],
        block: 'PRIMARY', intensity: 'HARD',
        sets: 4, work: 6, unit: 'reps', restSec: 150,
        load: { kind: 'added-kg', value: 0, text: 'Plates in a backpack. RPE 8: six hard reps.' },
        progression:
          'Bodyweight until four sets of twelve are easy, then deficit on plates, then '
          + 'plates in a pack in 2.5kg steps with the reps back to six.',
        protocolId: 'max-strength',
        note: 'Flat palms, fingers spread. If the injured finger complains flat, let it hang off the edge of a plate.',
        variations: [
          { minLevel: 1, name: 'Push-Up', load: 'Bodyweight, 10-12 hard reps' },
          { minLevel: 3, name: 'Deficit Push-Up', load: 'Hands on two plates, chest below the hands' },
          { minLevel: 4, name: 'Weighted Push-Up', load: 'Plates in a backpack, RPE 8' },
          { minLevel: 6, name: 'Weighted Deficit Push-Up', load: 'Pack and plates, RPE 8' },
        ],
        form: {
          setup: 'Hands flat, a little wider than the shoulders, fingers spread and the weight through the heel of the palm. Body one line heels to head, glutes on. Backpack strapped tight high on the back.',
          execution: 'Lower with the elbows at about 45 degrees from the ribs until the chest touches the floor or passes the hands, then press to full lockout and push the shoulder blades apart at the top.',
          cue: 'The bench press with no bar to grip. A loaded push-up builds as much chest and triceps as a bench press at the same effort, and the free shoulder blades keep the shoulder healthy.',
          breathing: 'Inhale down, exhale on the press.',
          mistakes: 'Hips sagging. Elbows flaring to 90 degrees. Half reps to make the load work. Gripping the floor with the fingers.',
        },
      },
      {
        id: 'heal-pike-pushup',
        name: 'Pike Push-Up',
        capacities: ['press', 'shoulder'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 8, unit: 'reps', restSec: 90,
        load: { kind: 'bodyweight', text: 'Bodyweight. Feet on the box makes it heavier.' },
        progression: 'Three sets of ten on the floor, then feet on the box, then a three-second lowering.',
        protocolId: 'hypertrophy',
        note: 'Flat palms, fingers spread. If the injured finger complains flat, let it hang off the edge of a plate.',
        variations: [
          { minLevel: 1, name: 'Pike Push-Up' },
          { minLevel: 4, name: 'Pike Push-Up - Feet on Box' },
          { minLevel: 6, name: 'Pike Push-Up - Feet on Box, 3s Lower' },
        ],
        form: {
          setup: 'Hands flat on the floor shoulder-width apart, hips high so the body makes an upside-down V. Feet on the floor, or on the box for the harder version.',
          execution: 'Bend the elbows and lower the top of the head toward a point just in front of the hands, then press back up until the arms are straight and the shoulders push toward the ears.',
          cue: 'Overhead pressing with no bar to hold: the shoulders and triceps the other way round from every pull. It also trains the shoulder blade to rotate up, which a pulling-only athlete is missing.',
          breathing: 'Inhale down, exhale on the press.',
          mistakes: 'Elbows flaring straight out. Hips dropping so it turns into a push-up. Head hitting the floor at the bottom.',
        },
      },
      {
        id: 'heal-calf-raise',
        name: 'Single-Leg Calf Raise',
        capacities: ['legs'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 12, unit: 'reps', restSec: 60,
        load: { kind: 'added-kg', value: 0, text: 'Bodyweight on the box edge, then a plate in a backpack' },
        progression: 'Twelve a leg through the full range with a pause at the top, then plates in a backpack in 2.5kg steps.',
        protocolId: 'heal-strength',
        perSide: true,
        note: 'Per leg. One flat palm on the wall for balance, nothing held.',
        variations: [
          { minLevel: 1, name: 'Single-Leg Calf Raise' },
          { minLevel: 4, name: 'Single-Leg Calf Raise - Backpack' },
        ],
        form: {
          setup: 'Ball of one foot on the edge of the box, heel hanging off, other foot hooked behind. A flat palm on the wall for balance.',
          execution: 'Lower the heel slowly below the box edge, then rise as high onto the toes as you can and pause one second. All reps on one leg, then the other.',
          cue: 'Standing on a small foothold is the calf holding the heel up, often for a long time. Full range, slow, and the ankle gets stronger at both ends.',
          breathing: 'Exhale rising.',
          mistakes: 'Bouncing at the bottom. Half reps. Leaning on the wall instead of balancing.',
        },
      },
      {
        id: 'heal-prone-ytw',
        name: 'Prone Y-T-W',
        capacities: ['shoulder'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 3, work: 8, unit: 'reps', restSec: 60,
        load: { kind: 'bodyweight', text: 'No weight. Open hands, thumbs up.' },
        progression: 'A two-second hold at every top, then five seconds. Holds before load: the hands cannot hold a plate yet.',
        protocolId: 'prehab',
        note: 'Eight of each letter is one set. Open hands, nothing held.',
        variations: [
          { minLevel: 1, name: 'Prone Y-T-W' },
          { minLevel: 3, name: 'Prone Y-T-W - 2s Hold' },
          { minLevel: 5, name: 'Prone Y-T-W - 5s Hold' },
        ],
        form: {
          setup: 'Face down on the mat, forehead on a folded towel, legs relaxed. Arms on the floor in the letter you are about to make.',
          execution: 'Y: arms straight overhead and out, thumbs up, lift them a few centimetres off the floor. T: arms straight out to the sides, lift. W: elbows bent at the sides, lift and squeeze the shoulder blades down and together. Slow up, slow down.',
          cue: 'The lower and middle traps that set the shoulder blade before every pull. Not pulling for a few weeks is the time to make them strong, not to lose them.',
          breathing: 'Exhale on each lift.',
          mistakes: 'Shrugging up into the ears. Lifting the chest off the floor to get the arms higher. Rushing.',
        },
      },
      HEAL_BAND_ER,
      RUSSIAN_TWIST,
      SIDE_PLANK_DIP,
      {
        id: 'morn-leg-lowers',
        name: 'Lying Leg Raise',
        capacities: ['tension'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 10, unit: 'reps', restSec: 60,
        load: { kind: 'bodyweight', text: 'Mat only. Hands flat under the hips.' },
        progression:
          'Ten slow reps with the lower back flat, then straight legs, then a three-second '
          + 'lowering, then lift the hips off the mat at the top.',
        protocolId: 'trunk-hypertrophy',
        note: 'Hands flat on the mat under the hips, fingers straight.',
        variations: [
          { minLevel: 1, name: 'Lying Leg Raise - Bent Knees' },
          { minLevel: 3, name: 'Lying Leg Raise' },
          { minLevel: 5, name: 'Lying Leg Raise - 3s Lower' },
          { minLevel: 7, name: 'Lying Leg Raise + Hip Lift' },
        ],
        form: {
          setup: 'On your back, legs straight, hands flat under the hips with the fingers straight. Press the lower back into the mat.',
          execution: 'Lift the legs together to vertical, then lower them slowly, stopping just before the lower back peels off the floor. Bend the knees if it does.',
          cue: 'Lifting the legs against a still trunk: the hanging leg raise from CAVE, done on the floor while the hands cannot hang. Feet back on the wall in a roof.',
          breathing: 'Exhale as the legs come up.',
          mistakes: 'Lower back arching as the legs go down. Dropping the legs fast. Pushing hard through the hands.',
        },
      },
      BACK_UNWIND,
      TENDON_GLIDES,
    ],
  },
];
