// =============================================================================
// data-week.ts — The week of v47
//
// Asked for by the athlete in November 2026, after the four-week review:
//
// - Weekday mornings, at home, before or with the first coffee: a short WAKE
//   UP (15 min at most) with balance and foot precision, nothing that bends
//   the stomach (DAILY 08 and 09, alternating).
// - Two or three CAVE days a week, never under an hour, leaving sore: a core
//   block of about 25 minutes every time (the abs and the obliques are a goal
//   of their own, an eight-pack with visible obliques), then 40 minutes that
//   rotate: CAVE 06 CORE + PULL, 07 CORE + LEGS, 08 CORE + PUSH.
// - Two climbing days, and weekends on the rock when the weather lets. After
//   climbing, the opposite side: CAVE 09 STRAIGHT BACK (25-35 min), the upper
//   back, the cuff, a push and the chest opened, so years of pulling do not
//   round the shoulders.
//
// TODAY asks CAVE, CLIMB or REST and picks from these (`recommend.ts`). The
// older sessions stay in TRAIN with their history; TODAY no longer suggests
// them. Exercises are the programme's own objects, so ids, loads and XP carry.
// Pure, no React.
// =============================================================================

import type { Circuit, Exercise } from './types';
import { DATA_DAILY } from './data-daily';
import { COPENHAGEN, DATA_CAVE, FRONT_LEVER, RUSSIAN_TWIST, WARMUP_PULSE } from './data-cave';
import { DATA_HEAL } from './data-heal';
import {
  BAND_PALLOF, BENT_YTW, BW_GOOD_MORNING, DOORWAY_PEC_STRETCH, EXTRA_EXERCISES, LUNGE_DRIVE,
  LYING_LEG_RAISE, SL_BALANCE, SL_REACH, WEIGHTED_KNEE_RAISE,
} from './data-extras';
import { FEET_EXERCISES } from './data-feet';

const POOL = new Map<string, Exercise>();
for (const c of [...DATA_DAILY, ...DATA_CAVE, ...DATA_HEAL]) {
  for (const e of [...c.exercises, ...(c.substitutes ?? [])]) if (!POOL.has(e.id)) POOL.set(e.id, e);
}
for (const e of [...EXTRA_EXERCISES, ...FEET_EXERCISES]) if (!POOL.has(e.id)) POOL.set(e.id, e);

/** A programme exercise by id: same object, same history. */
function ex(id: string): Exercise {
  const e = POOL.get(id);
  if (!e) throw new Error(`data-week: no exercise ${id}`);
  return e;
}

// ---- Ids -------------------------------------------------------------------------

export const WAKE_UP_IDS = ['daily-08', 'daily-09'];
export const CAVE_DAY_IDS = ['cave-09', 'cave-10', 'cave-11'];
export const CORE_PULL_ID = 'cave-09';
export const CORE_LEGS_ID = 'cave-10';
export const CORE_PUSH_ID = 'cave-11';
export const STRAIGHT_BACK_ID = 'cave-12';
/** Every session TODAY suggests since v47. */
export const WEEK_IDS = [...WAKE_UP_IDS, ...CAVE_DAY_IDS, STRAIGHT_BACK_ID];

// ---- WAKE UP -------------------------------------------------------------------------

const WAKE_NOTE =
  'Before or with the first coffee. Standing, slow and quiet: nothing jumps, nothing '
  + 'bends the stomach, nothing on the floor. The feet wake up first, then the hips.';

export const WEEK_DAILY: Circuit[] = [
  {
    id: 'daily-08', circuitNum: '08',
    title: 'WAKE UP FEET', subtitle: 'daily - home - balance - precision',
    focus: 'Wake up on one leg: place the foot where you look, and stay there.',
    capacities: ['legs', 'tension', 'mobility'],
    illustration: 'morning.svg',
    duration: 14,
    recoveryHours: 0,
    note: WAKE_NOTE,
    exercises: [
      { ...ex('daily-ankle-wall'), sets: 1 },
      ex('feet-step-down-mark'),
      { ...ex('feet-shift-place'), sets: 2 },
      SL_REACH,
      { ...SL_BALANCE, sets: 2 },
      LUNGE_DRIVE,
    ],
  },
  {
    id: 'daily-09', circuitNum: '09',
    title: 'WAKE UP FLAGS', subtitle: 'daily - home - balance - hips',
    focus: 'Wake up the hips: reach out with the foot, flag, lift the knee high.',
    capacities: ['legs', 'tension', 'mobility'],
    illustration: 'morning.svg',
    duration: 14,
    recoveryHours: 0,
    note: WAKE_NOTE,
    exercises: [
      ex('morn-hip-9090'),
      { ...ex('feet-lateral-reach'), sets: 2 },
      { ...ex('daily-flag-hold'), sets: 2 },
      ex('extra-high-knee-hold'),
      ex('feet-hip-airplane'),
      SL_REACH,
      LUNGE_DRIVE,
    ],
  },
];

// ---- CAVE: the core block, then a rotating 40 minutes --------------------------------

const CAVE_NOTE =
  'An hour or more. Skill first while fresh, then the main block, then about 25 minutes '
  + 'of core to finish: the abs and obliques are trained to grow, hard sets close to '
  + 'failure. The weighted hanging knee raise leads it: curl the pelvis at the top.';

export const WEEK_CAVE: Circuit[] = [
  {
    id: CORE_PULL_ID, circuitNum: '06',
    title: 'CORE + PULL', subtitle: 'no climbing - pull - front lever - abs',
    focus: 'Heavy pulling and the front lever, then the abs to the end of the session.',
    capacities: ['pull', 'tension', 'shoulder'],
    illustration: 'pullups.svg',
    duration: 70,
    recoveryHours: 24,
    note: CAVE_NOTE + ' While a finger heals the pulls are labelled; hang from ab straps for the core.',
    exercises: [
      WARMUP_PULSE,
      SL_BALANCE,
      ex('addon-weighted-pullup'),
      ex('cave-lockoff'),
      FRONT_LEVER,
      ex('power-db-row'),
      ex('power-floor-pullover'),
      ex('cave-band-er'),
      // The core block.
      WEIGHTED_KNEE_RAISE,
      ex('morn-hollow'),
      { ...RUSSIAN_TWIST, sets: 3 },
      ex('daily-side-plank-dip'),
    ],
  },
  {
    id: CORE_LEGS_ID, circuitNum: '07',
    title: 'CORE + LEGS', subtitle: 'no climbing - legs - hinge - balance - abs',
    focus: 'Legs and the hinge with the back held flat, balance, then the abs and obliques.',
    capacities: ['legs', 'tension', 'mobility'],
    illustration: 'squats.svg',
    duration: 72,
    recoveryHours: 24,
    legHeavy: true,
    note: CAVE_NOTE + ' Nothing here loads the fingers but the knee raise; the day after a climb is a good day for it.',
    exercises: [
      WARMUP_PULSE,
      LUNGE_DRIVE,
      SL_REACH,
      ex('full-db-rdl'),
      ex('heal-nordic-curl'),
      ex('extra-shift-split-squat'),
      ex('heal-step-up'),
      ex('heal-calf-raise'),
      { ...BW_GOOD_MORNING, sets: 2 },
      // The core block.
      WEIGHTED_KNEE_RAISE,
      BAND_PALLOF,
      COPENHAGEN,
      LYING_LEG_RAISE,
    ],
  },
  {
    id: CORE_PUSH_ID, circuitNum: '08',
    title: 'CORE + PUSH', subtitle: 'no climbing - push - upper back - power - abs',
    focus: 'Jump, push and pull the shoulder blades back, then the obliques to finish.',
    capacities: ['press', 'shoulder', 'legs', 'tension'],
    illustration: 'pushups.svg',
    duration: 70,
    recoveryHours: 24,
    note: CAVE_NOTE + ' Every push is paired with the upper back: the chest open, the shoulders back.',
    exercises: [
      WARMUP_PULSE,
      LUNGE_DRIVE,
      ex('full-box-jump'),
      ex('extra-ring-pushup'),
      ex('heal-pike-pushup'),
      ex('power-db-press'),
      ex('extra-db-reverse-fly'),
      BENT_YTW,
      ex('cave-band-er'),
      // The core block.
      WEIGHTED_KNEE_RAISE,
      ex('addon-hanging-oblique'),
      { ...RUSSIAN_TWIST, sets: 3 },
      ex('daily-side-plank-dip'),
      ex('morn-hollow'),
    ],
  },
  {
    id: STRAIGHT_BACK_ID, circuitNum: '09',
    title: 'STRAIGHT BACK', subtitle: 'after climbing - upper back - cuff - chest',
    focus: 'After the wall: the shoulder blades back, the cuff, a push, the chest opened.',
    capacities: ['shoulder', 'press', 'mobility'],
    illustration: 'dumbbell.svg',
    duration: 30,
    recoveryHours: 0,
    stacksOnSession: true,
    note:
      'Straight after climbing, 25 to 35 minutes. Climbing pulls the shoulders forward; '
      + 'this pulls them back. Light and controlled: the upper back and the cuff, one push, '
      + 'then the chest stretched. Nothing grips hard.',
    exercises: [
      // Skill first (v43): the lunge drive is the session's balance and stretch.
      LUNGE_DRIVE,
      ex('power-band-face-pull'),
      ex('morn-pullapart'),
      BENT_YTW,
      ex('extra-db-reverse-fly'),
      ex('cave-band-er'),
      ex('addon-pushup'),
      ex('extra-wall-angel'),
      DOORWAY_PEC_STRETCH,
    ],
  },
];
