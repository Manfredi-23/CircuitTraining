// =============================================================================
// data-heal.ts — HEAL mode: gym sessions while a finger heals
//
// The athlete hurt a finger in October 2026: no climbing and no pulling for a
// few weeks. HEAL keeps everything else strong in the meantime, and builds the
// qualities climbing never trains, in the bouldering gym's training area.
//
// Equipment: one barbell and plates, a bench, a box, the 45-degree back
// extension bench, TRX, bands, a mat. No machines.
//
// The rule every exercise obeys: the hands only rest on things or press flat.
// No dumbbell, kettlebell, ring, bar hang or band handle is gripped; plates are
// hugged to the chest with the forearms, the barbell sits on the back or the
// hips, the landmine end lies in an open palm. Nothing pulls.
//
// Two sessions, 55-75 minutes NORMAL, alternated, two or three a week:
//   01 LEGS + TRUNK  — box jumps, the back squat, hip thrust, split squat,
//                      back extension, then anti-extension and the abs.
//   02 PUSH + HINGE  — good morning, weighted push-up, landmine press, the
//                      shoulder blades, then rotation for the obliques.
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
const REVERSE_CRUNCH = shared(DATA_DAILY, 'daily-reverse-crunch');
const BACK_UNWIND = shared(DATA_DAILY, 'daily-back-unwind');

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
      + 'sits on the back and the hips, plates are hugged to the chest. Power first, then '
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
          { minLevel: 3, name: 'Box Jump - Seated Start', load: 'From sitting on a bench: no countermovement' },
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
        id: 'heal-hip-thrust',
        name: 'Barbell Hip Thrust',
        capacities: ['legs', 'tension'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 8, unit: 'reps', restSec: 120,
        load: { kind: 'added-kg', value: 40, text: 'Total on the bar, with a pad. RPE 8.' },
        progression: 'Three sets of ten with a one-second squeeze at the top, then 5kg more and back to eight.',
        protocolId: 'heal-strength',
        note: 'Hands rest flat on the bar to steady it. They do not hold it.',
        variations: [
          { minLevel: 1, name: 'Barbell Hip Thrust' },
          { minLevel: 4, name: 'Barbell Hip Thrust - 2s Hold' },
        ],
        form: {
          setup: 'Upper back against the long side of a bench, just below the shoulder blades. Bar padded across the hip crease, rolled into place. Feet flat, shins vertical at the top.',
          execution: 'Tuck the chin and the ribs, drive through the heels and lift the hips until the body is a straight line from shoulders to knees. Squeeze one second. Lower under control until the plates nearly touch.',
          cue: 'Glute strength at full hip extension: the hip pushing into the wall on a steep foothold and on every rockover. The squat cannot load the top of that range; this can.',
          breathing: 'Exhale at the top.',
          mistakes: 'Arching the lower back to finish the rep. Feet too far out, which turns it into a hamstring exercise. Gripping the bar.',
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
          setup: 'Back foot laces-down on a bench, front foot far enough forward that the front shin stays near vertical at the bottom. Plate held flat against the chest, forearms crossed over it.',
          execution: 'Lower straight down until the back knee is just off the floor, then drive up through the front heel. All reps on one leg, then the other.',
          cue: 'One leg at a time is how climbing uses the legs, and it stretches the hip flexor of the back leg at the same time: a high step with a long reach.',
          breathing: 'Inhale down, exhale up.',
          mistakes: 'Front foot too close, which drives the knee far over the toes. Bouncing off the bottom. Doing more reps on the strong leg.',
        },
      },
      BACK_EXTENSION,
      COPENHAGEN,
      {
        id: 'heal-body-saw',
        name: 'TRX Body Saw',
        capacities: ['tension'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 10, unit: 'reps', restSec: 60,
        load: { kind: 'bodyweight', text: 'Feet in the TRX cradles, forearms on the floor' },
        progression:
          'Ten slow saws with a flat back, then a longer reach behind the elbows, then a '
          + 'two-second hold at the far point.',
        protocolId: 'tension-iso',
        note: 'On the forearms, fists loose or palms flat. Nothing held.',
        variations: [
          { minLevel: 1, name: 'Forearm Plank Body Saw', load: 'Feet on a towel or sliders on a smooth floor' },
          { minLevel: 3, name: 'TRX Body Saw' },
          { minLevel: 5, name: 'TRX Body Saw - 2s Hold Out' },
        ],
        form: {
          setup: 'Toes in the TRX foot cradles at mid-shin height, forearm plank underneath with the elbows under the shoulders. Ribs down, glutes on.',
          execution: 'Push the body backward from the shoulders so the elbows end up in front of the face, then pull back to the start. The hips stay in line; the shoulders do the travelling.',
          cue: 'The front lever without the bar: the trunk holding a long body straight against gravity, with the arms reaching overhead. It is the body tension that keeps the feet on in a roof.',
          breathing: 'Exhale on the way out, short breaths at the far point.',
          mistakes: 'Hips sagging as the reach gets longer. Piking the hips up to shorten the lever. Rushing.',
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
    title: 'PUSH + HINGE', subtitle: 'injured finger - press - back - obliques',
    focus: 'The hinge, the pushing climbing never trains, the shoulder blades and the obliques, with no grip.',
    capacities: ['press', 'shoulder'],
    illustration: 'pushups.svg',
    duration: 65,
    recoveryHours: 24,
    note:
      'For the weeks a finger is healing, alternated with 01. The bar sits on the back '
      + 'or lies in an open palm, push-ups go on flat hands, and nothing pulls. Hinge '
      + 'and press first while fresh, then the shoulder blades, then the obliques. Any '
      + 'pain in the finger and that exercise is gone today.',
    exercises: [
      HEAL_WARMUP,
      {
        id: 'heal-good-morning',
        name: 'Barbell Good Morning',
        capacities: ['legs', 'tension'],
        block: 'PRIMARY', intensity: 'HARD',
        sets: 4, work: 6, unit: 'reps', restSec: 150,
        load: { kind: 'added-kg', value: 30, text: 'Total on the bar, RPE 7-8. Light: this is a long lever.' },
        progression:
          'Four sets of six with a flat back and the full hamstring stretch, then 2.5kg '
          + 'more. It stays well under half the squat: range and position before load.',
        protocolId: 'heal-strength',
        note: HANDS_NOTE,
        variations: [
          { minLevel: 1, name: 'Barbell Good Morning', load: 'Empty bar or close to it, RPE 7' },
          { minLevel: 3, name: 'Barbell Good Morning', load: 'RPE 8, total on the bar' },
          { minLevel: 5, name: 'Barbell Good Morning - 3s Lower' },
        ],
        form: {
          setup: 'Bar on the upper back as for the squat, out of a rack. Hands wide, the injured hand open flat against the bar. Feet hip-width, knees soft.',
          execution: 'Push the hips back and let the chest come forward with a flat back until the hamstrings stop you, around 45 degrees or a little lower. Drive the hips forward to stand tall.',
          cue: 'The deadlift without a grip: the hamstrings, glutes and lower back working through a big range while the spine stays still. Your weak back gets loaded here without the hands having a say.',
          breathing: 'Brace at the top, inhale down, exhale through the top half.',
          mistakes: 'Rounding the lower back to get lower. Bending the knees until it becomes a squat. Load before range. Letting the bar slide up the neck.',
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
        id: 'heal-landmine-press',
        name: 'Half-Kneeling Landmine Press',
        capacities: ['press', 'shoulder'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 8, unit: 'reps', restSec: 90,
        load: { kind: 'added-kg', value: 5, text: 'Plates on the bar end. RPE 8.' },
        progression: 'Three sets of ten a side, then the next plate and back to eight.',
        protocolId: 'hypertrophy',
        perSide: true,
        note: 'Per arm. The bar end lies in the open palm, fingers relaxed: nothing to grip.',
        variations: [
          { minLevel: 1, name: 'Half-Kneeling Landmine Press' },
          { minLevel: 5, name: 'Standing Landmine Press' },
        ],
        form: {
          setup: 'Barbell end in a landmine or wedged into a corner on a towel. Kneel on the knee of the pressing side, other foot forward. Bar end in front of the shoulder, resting in the open palm.',
          execution: 'Press the bar up and forward to a straight arm, letting the shoulder blade reach round the ribs at the top. Lower to the shoulder under control.',
          cue: 'Overhead pressing on an arc the shoulder likes: the serratus and the lower traps that keep the shoulder blade on the ribs, the thing a pulling-only athlete is missing.',
          breathing: 'Exhale on the press.',
          mistakes: 'Leaning back to finish the rep. Shrugging. Closing the hand round the sleeve.',
        },
      },
      {
        id: 'heal-prone-ytw',
        name: 'Incline Prone Y-T-W',
        capacities: ['shoulder'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 3, work: 8, unit: 'reps', restSec: 60,
        load: { kind: 'bodyweight', text: 'No weight. Open hands, thumbs up.' },
        progression: 'A two-second hold at every top, then five seconds. Holds before load: the hands cannot hold a plate yet.',
        protocolId: 'prehab',
        note: 'Eight of each letter is one set. Open hands, nothing held.',
        variations: [
          { minLevel: 1, name: 'Incline Prone Y-T-W' },
          { minLevel: 3, name: 'Incline Prone Y-T-W - 2s Hold' },
          { minLevel: 5, name: 'Incline Prone Y-T-W - 5s Hold' },
        ],
        form: {
          setup: 'Chest down on a bench set to about 30 degrees, feet on the floor, arms hanging straight down.',
          execution: 'Y: raise the straight arms forward and out to ear height, thumbs up. T: raise them out to the sides. W: elbows bent, pull them back and squeeze the shoulder blades down. Slow up, slow down.',
          cue: 'The lower and middle traps that set the shoulder blade before every pull. Not pulling for a few weeks is the time to make them strong, not to lose them.',
          breathing: 'Exhale on each lift.',
          mistakes: 'Shrugging up into the ears. Swinging. Arching off the bench to get the arms higher.',
        },
      },
      HEAL_BAND_ER,
      {
        id: 'heal-landmine-rotation',
        name: 'Landmine Rotation',
        capacities: ['tension'],
        block: 'SECONDARY', intensity: 'HARD',
        sets: 3, work: 10, unit: 'reps', restSec: 60,
        load: { kind: 'added-kg', value: 0, text: 'The bar alone, then plates on the end' },
        progression: 'Ten slow reps with still hips, then 2.5kg on the end, then a one-second pause at each side.',
        protocolId: 'trunk-hypertrophy',
        note: 'Left plus right is 2 reps. Palms pressed flat either side of the bar end, fingers straight.',
        variations: [
          { minLevel: 1, name: 'Landmine Rotation' },
          { minLevel: 4, name: 'Landmine Rotation - Plates' },
          { minLevel: 6, name: 'Landmine Rotation - 1s Pause' },
        ],
        form: {
          setup: 'Bar end in a landmine or corner. Stand facing it, feet wide, arms straight with the bar end held overhead between two flat palms.',
          execution: 'Lower the bar end in an arc to one hip, turning the ribs with it while the hips stay mostly square, then bring it back over the top and down to the other hip.',
          cue: 'The obliques turning the trunk against a load, with straight arms: the move of turning the hip into the wall and reaching through.',
          breathing: 'Exhale as the bar comes back up.',
          mistakes: 'Bending the elbows so the arms do the work. Spinning the hips. Letting the bar drop fast to the side.',
        },
      },
      SIDE_PLANK_DIP,
      REVERSE_CRUNCH,
      BACK_UNWIND,
      TENDON_GLIDES,
    ],
  },
];
