// =============================================================================
// data-daily.ts — DAILY mode: short home sessions, mat and band only
//
// Equipment: yoga mat, resistance band with no anchor, the portable pull edge
// on a sling. No bar, no hangboard, no weights. Done in the morning before
// breakfast, most days of the week, climbing days included.
//
// Four sessions:
//   01 CORE + OBLIQUES   — mat only. Push-ups, spiderman plank, cross-body
//                          mountain climber, then the reverse crunch and the
//                          Russian twist last.
//   02 OBLIQUES + BACK   — rotation and side-bending for the obliques, and the
//                          graded lower-back progression: bird dog, prone
//                          extension, band good morning. The Russian twist
//                          closes it.
//   03 BAND STRENGTH     — the pulling, pushing and legs that a bar and a
//                          kettlebell used to do, with a band.
//   04 FINGERS + MOBILITY — the tired-morning session. Hips, spine and wrists,
//                          then the density no-hangs on the portable edge.
//
// Constraints, all enforced by `npm run check:daily`:
//
//   recoveryHours: 0   Nothing here costs the next session, so readiness never
//                      blocks it and it stacks on a climbing day.
//   No ACCESSORY       TIRED drops that block entirely, and TIRED is the setting
//                      a before-breakfast session gets most. Working sets are
//                      SECONDARY: TIRED removes a set, FRESH adds one, nothing
//                      is ever dropped, and SECONDARY takes no level set bonus,
//                      so the session has a hard ceiling of 20 minutes.
//   Curling last       Discs are most swollen in the first hour after waking,
//                      which is when this runs. Spinal flexion under load — the
//                      crunches and the Russian twist — always closes a session,
//                      never opens one. Extension and hinging keep the spine
//                      near neutral and may sit anywhere.
//   Fingers last       Pulleys are stiffest on waking. Edge work comes after the
//                      rest of the session has warmed the tissue, and is never
//                      near a max.
//
// DAILY 01 is weighted to the obliques at the athlete's request (October
// 2026): spiderman, cross-body climber and twist are all waist work, and the
// reverse crunch is the only straight-abs exercise left in it. STATS core
// volume counts the week against the trunk-hypertrophy and back-strength
// targets, so a shortfall on the abs shows there.
// =============================================================================

import type { Circuit, Exercise } from './types';

// ---- Shared ------------------------------------------------------------------

/** Side plank hip dips. Also closes the trunk work in CAVE 03 LEGS + BACK. */
export const SIDE_PLANK_DIP: Exercise = {
  id: 'daily-side-plank-dip',
  name: 'Side Plank Hip Dip',
  capacities: ['tension'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 2, work: 12, unit: 'reps', restSec: 30,
  load: { kind: 'bodyweight', text: 'Forearm down, hips high between every dip' },
  progression:
    'Knees down until twelve clean dips a side, then straight legs, then the top leg '
    + 'lifted, then a one-second hold at the top of every rep.',
  protocolId: 'trunk-hypertrophy',
  perSide: true,
  note: 'Per side. On the forearm, so it spares the wrists.',
  variations: [
    { minLevel: 1, name: 'Side Plank Hip Dip - Knees Down' },
    { minLevel: 3, name: 'Side Plank Hip Dip' },
    { minLevel: 5, name: 'Side Plank Hip Dip - Top Leg Raised' },
    { minLevel: 7, name: 'Side Plank Hip Dip - Top Leg Raised, 1s Hold' },
  ],
  form: {
    setup: 'On your side, elbow directly under the shoulder, forearm flat and pointing forward. Knees bent and stacked for the easier version, legs straight and feet stacked for the full one. Lift into a straight line from head to feet.',
    execution: 'Lower the bottom hip until it nearly touches the mat, then drive it up past the start line, squeezing the bottom side of the waist. Every rep travels the full range. All reps one side, then switch.',
    cue: 'The lift is a side-bend against your own bodyweight, which is the movement the obliques grow from. A plain side plank holds the position; the dip makes the waist move it.',
    breathing: 'Exhale on the way up.',
    mistakes: 'Rolling the hips forward or back instead of straight up. Shortening the range as you tire. Elbow drifting ahead of the shoulder. Doing more reps on the strong side.',
  },
};

// ---- New in DAILY --------------------------------------------------------------

const PRONE_EXTENSION: Exercise = {
  id: 'daily-prone-extension',
  name: 'Prone Back Extension',
  capacities: ['tension'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 2, work: 10, unit: 'reps', restSec: 45,
  load: { kind: 'bodyweight', text: 'The arm position is the load: further from the hips, heavier' },
  progression:
    'Ten clean reps with a one-second hold, then move the hands further from the hips: '
    + 'by the sides, behind the head, overhead. Then a three-second hold at the top.',
  protocolId: 'back-strength',
  note: 'The direct lower-back work. Lift to neutral and a little past, never cranked.',
  variations: [
    { minLevel: 1, name: 'Prone Back Extension - Hands by Hips' },
    { minLevel: 3, name: 'Prone Back Extension - Hands Behind Head' },
    { minLevel: 5, name: 'Superman - Arms Overhead' },
    { minLevel: 7, name: 'Superman - Arms Overhead, 3s Hold' },
  ],
  form: {
    setup: 'Face down on the mat, legs straight and hip-width, forehead resting on the mat. Arms by the sides to start. Squeeze the glutes before you lift.',
    execution: 'Lift the chest a few centimetres off the mat by extending through the whole back, keeping the neck long and the eyes on the floor. Hold one second at the top, lower slowly. Superman: arms overhead and the legs lift at the same time.',
    cue: 'Your weak lower back gets stronger the same way anything else does: load it, then load it a little more. This is the bodyweight step before the 45-degree bench at the gym.',
    breathing: 'Exhale on the way up, inhale on the way down.',
    mistakes: 'Cranking the head back. Jerking up with momentum. Lifting so high the lower back pinches. Letting the glutes switch off, which hands the whole lift to the lumbar spine.',
  },
};

const BAND_GOOD_MORNING: Exercise = {
  id: 'daily-band-good-morning',
  name: 'Band Good Morning',
  capacities: ['tension', 'legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 2, work: 12, unit: 'reps', restSec: 45,
  load: { kind: 'band', text: 'Band under both feet, loop behind the upper back' },
  progression:
    'Twelve reps with a flat back and a one-second squeeze at the top, then a '
    + 'heavier band or a shorter loop, then a three-second lowering.',
  protocolId: 'back-strength',
  note: 'A hip hinge: the back stays flat and the hips do the moving.',
  variations: [
    { minLevel: 1, name: 'Band Good Morning' },
    { minLevel: 4, name: 'Band Good Morning, 3s Lower' },
    { minLevel: 6, name: 'Single-Leg Band Good Morning' },
  ],
  form: {
    setup: 'Stand on the middle of the band, feet hip-width. Loop the other end over the head so it sits across the upper back below the neck, hands holding it at the shoulders. Soft knees, ribs down, back flat.',
    execution: 'Push the hips back and let the chest come forward until the torso is nearly parallel to the floor or the hamstrings stop you, back flat throughout. Drive the hips forward to stand tall and squeeze the glutes. The band is heaviest at the top, where the back extensors and glutes finish the rep.',
    cue: 'The lower back works here by holding its shape while the hips move a load. That isometric hold under a growing load is what makes a weak back strong without bending it.',
    breathing: 'Inhale on the way down, exhale as you stand.',
    mistakes: 'Rounding the back to get lower. Bending the knees into a squat. Leaning back at the top. Band sliding onto the neck.',
  },
};

const REVERSE_CRUNCH: Exercise = {
  id: 'daily-reverse-crunch',
  name: 'Reverse Crunch',
  capacities: ['tension'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 2, work: 12, unit: 'reps', restSec: 30,
  load: { kind: 'bodyweight', text: 'Bodyweight. The pelvis curls, the legs just come along.' },
  progression:
    'Twelve slow reps with no swing, then a two-second lowering, then straighten the '
    + 'legs toward the ceiling and lift the hips straight up.',
  protocolId: 'trunk-hypertrophy',
  note: 'Lower abs. Second to last on purpose: this is the first curl of the morning.',
  variations: [
    { minLevel: 1, name: 'Reverse Crunch' },
    { minLevel: 3, name: 'Reverse Crunch, 2s Lower' },
    { minLevel: 5, name: 'Hip Lift - Legs Vertical' },
    { minLevel: 7, name: 'Hip Lift - Legs Vertical, 3s Lower' },
  ],
  form: {
    setup: 'On your back, hands flat by the hips or holding something heavy behind the head. Knees bent at 90 degrees above the hips.',
    execution: 'Curl the pelvis off the mat, bringing the knees toward the chest by rolling the lower back up one segment at a time. Lower slowly until the tailbone touches down. Hip lift: legs straight up, lift the hips straight toward the ceiling.',
    cue: 'The lower portion of the abs works hardest when the pelvis curls toward the ribs, not the other way round. If the knees swing in and the pelvis stays down, the hip flexors did the rep.',
    breathing: 'Exhale as the pelvis curls up.',
    mistakes: 'Swinging the legs for momentum. Dropping back down fast. Pushing hard through the hands. Doing these at the start of the session.',
  },
};

/** Closes DAILY 01 and DAILY 02: it is curling work, so it is always last. */
const RUSSIAN_TWIST: Exercise = {
  id: 'morn-bw-russian-twist',
  name: 'Russian Twist',
  capacities: ['tension'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 2, work: 16, unit: 'reps', restSec: 30,
  load: { kind: 'bodyweight', text: 'Hands together, arms long - the further out, the heavier' },
  progression: 'Feet down before feet up. Then arms straight out in front, then a one-second pause each side.',
  protocolId: 'trunk-hypertrophy',
  note: 'Last on purpose, and tall and slow. Left plus right is 2 reps.',
  variations: [
    { minLevel: 1, name: 'Russian Twist - Feet Down' },
    { minLevel: 4, name: 'Russian Twist - Feet Up' },
    { minLevel: 6, name: 'Russian Twist - Feet Up, Long Arms, 1s Pause' },
  ],
  form: {
    setup: 'Sit with knees bent and heels on the floor. Lean back to about 45 degrees with the chest up and the lower back straight, not rounded into a C. Hands together in front of the chest; the long-arm version straightens them out in front.',
    execution: 'Turn the ribcage and the hands together to one side, then to the other. Move slowly. The rotation comes from the ribs and the middle of the back, while the pelvis stays still.',
    cue: 'No weight, so the load is the lever: the further the hands are from the chest, the harder the obliques work. A straight back and a slow turn. The injury risk in a twist is a rounded back turning fast, which is why it closes the session instead of opening it.',
    breathing: 'Exhale as you turn to each side.',
    mistakes: 'Rounding the lower back. Moving only the arms while the chest faces forward. Going fast. Doing this first thing after waking.',
  },
};

const EDGE_DENSITY: Exercise = {
  id: 'daily-edge-density',
  name: 'Edge Density No-Hangs',
  capacities: ['crimp', 'openhand'],
  block: 'PREHAB', intensity: 'EASY',
  sets: 6, work: 10, unit: 'sec', restSec: 30,
  load: { kind: 'percent-max', value: 40, text: 'About 40% of max, set through the foot in the sling' },
  fixed: true,
  progression:
    'Do not chase load. Progress by doing it more often: one block daily, then a second '
    + 'block later in the day at least six hours apart.',
  protocolId: 'density-hang',
  perSide: true,
  note:
    'Per hand: left ten seconds, right ten seconds, then rest. Alternate the grip '
    + 'each round: half-crimp, open hand, three-finger drag.',
  variations: [
    { minLevel: 1, name: 'Edge Density No-Hangs' },
  ],
  form: {
    setup: 'Sling around one foot, that leg out in front, portable edge in one hand. Elbow slightly bent, shoulder packed down. Half-crimp means the thumb stays OFF the index finger.',
    execution: 'Press down through the foot to build tension over two seconds, hold ten seconds at a light, steady 40 percent, release over a second, switch hands. After both hands, rest and change grip.',
    cue: 'The foot sets the load, so you decide exactly how hard this is, which is what makes it safe on a cold morning. It is the frequency that builds the tendon, not the weight. A luggage scale clipped into the sling turns the 40 percent into a number.',
    breathing: 'Relaxed and normal. If you are holding your breath, back off.',
    mistakes: 'Pulling near maximal on cold fingers. Snatching the load on. Thumb wrapped over the index finger. Continuing through any click, pinch or sharp point. Doing it before the mobility work.',
  },
};

// ---- Sessions ------------------------------------------------------------------

export const DATA_DAILY: Circuit[] = [
  {
    id: 'daily-01', circuitNum: '01',
    title: 'CORE + OBLIQUES', subtitle: 'daily - mat only - abs - obliques - 13 min',
    focus: 'The waist first: knees to elbows, knees across, a slow twist. Push-ups to wake the top half.',
    capacities: ['tension', 'press'],
    illustration: 'squats.svg',
    duration: 13,
    recoveryHours: 0,
    note:
      'Mat only. Breathing and the dead bug wake the trunk, push-ups wake the top half, '
      + 'then the two plank drills for the obliques: knee to the same elbow, knee across '
      + 'the body. The curling work closes it: reverse crunch, then the Russian twist. '
      + 'Wrists sore: fists or push-up handles for every plank.',
    exercises: [
      {
        id: 'morn-breathing',
        name: '90/90 Breathing Reset',
        capacities: ['tension'],
        block: 'WARMUP', intensity: 'TECHNIQUE',
        sets: 1, work: 40, unit: 'sec', restSec: 15,
        load: { kind: 'bodyweight', text: 'No load' },
        fixed: true,
        progression: 'Never progressed. Add the heel press once the ribs drop without effort.',
        protocolId: 'daily-trunk',
        note: 'The only rule: get on the mat',
        variations: [
          { minLevel: 1, name: '90/90 Breathing Reset' },
          { minLevel: 4, name: '90/90 Breathing + Heel Press' },
        ],
        form: {
          setup: 'On your back on the mat. Feet flat on a wall, a chair, or the floor with hips and knees both at 90 degrees. Arms at your sides, palms up. Press the lower back flat into the mat and keep it there.',
          execution: 'Inhale through the nose for 4 counts into the sides and back of the ribcage, not the belly. Exhale through pursed lips for 6-8 counts until the ribs pull down and the abs switch on by themselves. Roughly four breath cycles. For the heel press, push the heels into the wall at about 20 percent throughout.',
          cue: 'This is not a stretch and not a rest. The long exhale drops the ribcage and turns on the deep abdominal wall, which is the position every other exercise here is built on. If the lower ribs flare toward the ceiling, the exhale was too short.',
          breathing: 'This exercise is the breathing. Four seconds in through the nose, six to eight out through the mouth.',
          mistakes: 'Belly breathing instead of rib breathing. Lower back arching off the mat. Rushing the exhale. Skipping it because it feels too easy, which loses the switch that makes the rest of the session work.',
        },
      },
      {
        id: 'morn-deadbug',
        name: 'Dead Bug',
        capacities: ['tension'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 1, work: 16, unit: 'reps', restSec: 20,
        load: { kind: 'bodyweight', text: 'The reach is the load: longer arm and leg, harder' },
        progression: 'Hold a flat back for all 16 first. Then a 3s hold at full reach, then both arms overhead while one leg moves.',
        protocolId: 'daily-trunk',
        note: 'Alternating - left plus right is 2 reps',
        variations: [
          { minLevel: 1, name: 'Dead Bug' },
          { minLevel: 4, name: 'Dead Bug, 3s Hold' },
          { minLevel: 6, name: 'Dead Bug - Arms Overhead, Legs Alternate' },
        ],
        form: {
          setup: 'On your back, arms straight up over the chest, hips and knees at 90 degrees. Lower back pressed flat.',
          execution: 'Extend one leg long and low while the opposite arm reaches back overhead. Go only as far as the lower back stays down. Return under control and alternate.',
          cue: 'Imagine a strip of paper under your lower back that someone is trying to pull out. Your job for the whole set is to trap it. The moment it slips free, you went too far.',
          breathing: 'Exhale slowly as the limbs extend, inhale as they return. If you have to hold your breath, shorten the range.',
          mistakes: 'Lower back arching as the leg lowers. Arm and leg on the same side. Racing the reps.',
        },
      },
      {
        id: 'daily-pushup',
        name: 'Push-Up',
        capacities: ['press', 'shoulder'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 10, unit: 'reps', restSec: 45,
        load: { kind: 'bodyweight', text: 'On fists or push-up handles, so the wrist stays straight' },
        progression:
          'Two sets of twelve with a clean line, then a three-second lowering, then a '
          + 'pause with the chest a fist off the mat, then archer push-ups.',
        protocolId: 'hypertrophy',
        note: 'One or two reps left in the tank: this wakes the top half, it is not a test.',
        variations: [
          { minLevel: 1, name: 'Push-Up' },
          { minLevel: 3, name: 'Push-Up, 3s Lower' },
          { minLevel: 5, name: 'Push-Up, 3s Lower + Bottom Pause' },
          { minLevel: 7, name: 'Archer Push-Up' },
        ],
        form: {
          setup: 'Fists or handles under the shoulders, knuckles flat, wrists straight. Body one line from heels to crown, glutes and abs on. Knees down if the line breaks before rep eight.',
          execution: 'Lower with the elbows about 45 degrees from the ribs until the chest is a fist from the mat, then press to full lockout and push the floor away at the top.',
          cue: 'Climbing is all pulling. A little pressing most mornings keeps the shoulder balanced, and a straight plank on the way down is core work too.',
          breathing: 'Inhale down, exhale on the press.',
          mistakes: 'Hips sagging. Elbows flaring to 90 degrees. Half reps. Bent wrists grinding through pain when a fist would do.',
        },
      },
      {
        id: 'daily-spiderman',
        name: 'Spiderman Plank',
        capacities: ['tension'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 6, unit: 'reps', restSec: 30,
        load: { kind: 'bodyweight', text: 'Slow, hips at plank height, knee to the same elbow' },
        progression:
          'Six slow reps a side with level hips, then a two-second hold at the elbow, '
          + 'then from a push-up: one push-up, one spiderman each side.',
        protocolId: 'trunk-hypertrophy',
        perSide: true,
        note: 'Per side, alternating. Wrists sore: fists, handles, or a forearm plank.',
        variations: [
          { minLevel: 1, name: 'Spiderman Plank' },
          { minLevel: 3, name: 'Spiderman Plank, 2s Hold' },
          { minLevel: 6, name: 'Spiderman Push-Up' },
        ],
        form: {
          setup: 'High plank on fists or handles, hands under the shoulders, body straight heels to head, glutes on.',
          execution: 'Lift the right foot and draw the right knee up the outside of the body toward the right elbow, the side of the waist crunching to meet it. Return the foot to the plank, then the left. Hips stay level and at plank height.',
          cue: 'Knee to the same-side elbow is a side-bend while the arms hold you up: the obliques on the working side do the pulling. It is the high-step-with-hip-open move from the wall.',
          breathing: 'Exhale as the knee comes up.',
          mistakes: 'Hips piking up to make room for the knee. Rotating the hips toward the floor. Rushing. Shoulders drifting behind the hands.',
        },
      },
      {
        id: 'daily-mountain-climber',
        name: 'Cross-Body Mountain Climber',
        capacities: ['tension'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 12, unit: 'reps', restSec: 30,
        load: { kind: 'bodyweight', text: 'Slow and controlled, knee under the body to the opposite elbow' },
        progression:
          'Twelve slow reps with level hips, then a one-second hold at the elbow, then '
          + 'sliding the feet on a towel so the knee drags in against friction.',
        protocolId: 'trunk-hypertrophy',
        note: 'Left plus right is 2 reps. This is trunk work, not cardio: slow enough to stop at any point.',
        variations: [
          { minLevel: 1, name: 'Cross-Body Mountain Climber' },
          { minLevel: 3, name: 'Cross-Body Mountain Climber, 1s Hold' },
          { minLevel: 6, name: 'Cross-Body Mountain Climber - Towel Slide' },
        ],
        form: {
          setup: 'High plank on fists or handles, hands under the shoulders, body straight, glutes on. For the towel version, a towel under the toes on a smooth floor.',
          execution: 'Draw the right knee under the body toward the left elbow, rotating the hips a little to get there, then back to the plank. Then the left knee to the right elbow. The shoulders stay square over the hands.',
          cue: 'Across the body is rotation: the oblique on the far side pulls the knee over while the trunk keeps the shoulders still. It is the drop-knee move, done on the floor.',
          breathing: 'Exhale as each knee comes across.',
          mistakes: 'Going fast and bouncing. Hips piking. Twisting the shoulders instead of the hips. Feet hopping instead of the knee being pulled in.',
        },
      },
      REVERSE_CRUNCH,
      RUSSIAN_TWIST,
    ],
  },
  {
    id: 'daily-02', circuitNum: '02',
    title: 'OBLIQUES + BACK', subtitle: 'daily - waist - lower back - 14 min',
    focus: 'Turn and side-bend against resistance, and build the lower back in steps.',
    capacities: ['tension', 'legs'],
    illustration: 'kettlebell.svg',
    duration: 14,
    recoveryHours: 0,
    note:
      'The lower back goes from holding still (bird dog) to extending against bodyweight '
      + 'to hinging under a band. The obliques get side-bending and rotation. '
      + 'The Russian twist closes the session, tall and slow.',
    exercises: [
      {
        id: 'morn-breathing',
        name: '90/90 Breathing Reset',
        capacities: ['tension'],
        block: 'WARMUP', intensity: 'TECHNIQUE',
        sets: 1, work: 40, unit: 'sec', restSec: 15,
        load: { kind: 'bodyweight', text: 'No load' },
        fixed: true,
        progression: 'Never progressed. Add the heel press once the ribs drop without effort.',
        protocolId: 'daily-trunk',
        note: 'The only rule: get on the mat',
        variations: [
          { minLevel: 1, name: '90/90 Breathing Reset' },
          { minLevel: 4, name: '90/90 Breathing + Heel Press' },
          { minLevel: 6, name: '90/90 Breathing + Band Pull-Apart' },
        ],
        form: {
          setup: 'On your back on the mat. Feet flat on a wall, a chair, or the floor with hips and knees both at 90 degrees. Arms at your sides, palms up. Press the lower back flat into the mat and keep it there.',
          execution: 'Inhale through the nose for 4 counts into the sides and back of the ribcage, not the belly. Exhale through pursed lips for 6-8 counts until the ribs pull down and the abs switch on by themselves. Roughly four breath cycles. For the heel press, push the heels into the wall at about 20 percent throughout; for the band version, hold it overhead under light tension and pull apart on each exhale.',
          cue: 'This is not a stretch and not a rest. The long exhale drops the ribcage and turns on the deep abdominal wall, which is the position every other exercise here is built on. If the lower ribs flare toward the ceiling, the exhale was too short.',
          breathing: 'This exercise is the breathing. Four seconds in through the nose, six to eight out through the mouth.',
          mistakes: 'Belly breathing instead of rib breathing. Lower back arching off the mat. Rushing the exhale. Skipping it because it feels too easy, which loses the switch that makes the rest of the session work.',
        },
      },
      {
        id: 'morn-birddog',
        name: 'Bird Dog',
        capacities: ['tension'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 1, work: 12, unit: 'reps', restSec: 20,
        load: { kind: 'bodyweight', text: 'Hips level for every rep' },
        progression: 'Add a 3s hold at full extension, then draw elbow to knee underneath before extending again.',
        protocolId: 'daily-trunk',
        note: 'Alternating - slow',
        variations: [
          { minLevel: 1, name: 'Bird Dog' },
          { minLevel: 4, name: 'Bird Dog, 3s Hold' },
          { minLevel: 6, name: 'Bird Dog + Elbow-to-Knee' },
        ],
        form: {
          setup: 'Hands and knees, spine neutral. Imagine balancing a glass of water on your lower back that must not spill for the whole set.',
          execution: 'Extend one arm forward and the opposite leg back until both are level with the torso. Hold briefly, return without touching down, switch sides.',
          cue: 'The moving limbs are a distraction. The exercise is the trunk refusing to rotate or tip while they move, which is the same demand as the press-out, on the floor, while you are still half asleep.',
          breathing: 'Exhale as you extend, inhale as you return.',
          mistakes: 'Hips rotating open as the leg lifts. Kicking the leg above hip height and arching the back. Reaching too fast. Head lifting out of line with the spine.',
        },
      },
      PRONE_EXTENSION,
      SIDE_PLANK_DIP,
      {
        id: 'morn-chop',
        name: 'Standing Band Chop',
        capacities: ['tension'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 1, work: 12, unit: 'reps', restSec: 20,
        load: { kind: 'band', text: 'Standing on one end, tension on from the first rep' },
        progression: 'Add a 2s hold at the top, then move to a split stance so the trunk does more of the work.',
        protocolId: 'daily-trunk',
        perSide: true,
        variations: [
          { minLevel: 1, name: 'Standing Band Chop' },
          { minLevel: 4, name: 'Standing Band Chop, 2s Hold' },
          { minLevel: 6, name: 'Split-Stance Band Chop' },
        ],
        form: {
          setup: 'Stand on one end of the band with the left foot, feet shoulder-width, other end in both hands with arms fairly straight down by the left hip and the band already under tension. Soft knees, tall chest. This is the first standing exercise, by design: you are getting up.',
          execution: 'Pull the band diagonally up and across, finishing with the hands high outside the right shoulder and the ribcage rotating to follow. Control it back to the left hip. All reps on one diagonal, then stand on the other end and reverse.',
          cue: 'Drive the rotation from the ribs and the front-side obliques, not from the arms and never from the lower back. Your arms are a rope, your trunk is the winch.',
          breathing: 'Exhale sharply on the way up and across, inhale on the controlled return.',
          mistakes: 'Chopping with the arms while the torso stays still. Leaning back to get the hands higher. Letting the band snap you down. Uneven counts left versus right, which is how obliques get built asymmetrically.',
        },
      },
      BAND_GOOD_MORNING,
      RUSSIAN_TWIST,
    ],
  },
  {
    id: 'daily-03', circuitNum: '03',
    title: 'BAND STRENGTH', subtitle: 'home - pull - push - legs - 14 min',
    focus: 'The pulling, pushing and legs that need a bar or a bell, done with a band.',
    capacities: ['pull', 'press', 'legs', 'shoulder'],
    illustration: 'dumbbell.svg',
    duration: 14,
    recoveryHours: 0,
    note:
      'Submaximal on purpose: every set stops with a couple of good reps left, so it '
      + 'never costs the next climbing day. The heavy pulling is in CAVE.',
    exercises: [
      {
        id: 'morn-band-wake',
        name: 'Band Pass-Through + Hip Wake-Up',
        capacities: ['mobility', 'shoulder'],
        block: 'WARMUP', intensity: 'EASY',
        sets: 1, work: 90, unit: 'sec', restSec: 15,
        load: { kind: 'band', text: 'Wide grip, light tension' },
        fixed: true,
        progression: 'Never progressed.',
        protocolId: 'warmup',
        note: 'Five cat-cows, five world\'s greatest stretches a side, ten band pass-throughs.',
        form: {
          setup: 'Mat down, band to hand. Start on all fours.',
          execution: 'Five slow cat-cows. Step into a long lunge, elbow to the inside of the front foot, then rotate that arm to the ceiling: five a side. Stand, hold the band very wide in both hands and take it slowly from the front of the hips, over the head, to behind you and back, ten times.',
          cue: 'Ninety seconds to get the hips and shoulders moving. Pass-throughs open the front of the shoulder that climbing and sleep both close up.',
          breathing: 'Nasal and unhurried.',
          mistakes: 'Rushing it because it is short. Grip too narrow, which makes you arch the back to get the band over.',
        },
      },
      {
        id: 'morn-band-row',
        name: 'Band Row + Lock-Off',
        capacities: ['pull'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 3, work: 8, unit: 'reps', restSec: 45,
        load: { kind: 'band', text: 'Stand on the band, cross it into an X for more tension' },
        progression: 'Lengthen the hold at the top, then cross the band, then shorten your grip on it.',
        protocolId: 'submax-practice',
        note: 'Both arms together. Hold every rep at the top.',
        variations: [
          { minLevel: 1, name: 'Band Row, 2s Hold' },
          { minLevel: 4, name: 'Band Row, 3s Lock-Off' },
          { minLevel: 6, name: 'Band Row, 5s Lock-Off + 3s Lower' },
        ],
        form: {
          setup: 'Stand on the middle of the band, feet hip-width. Hinge at the hips until the torso is about 45 degrees, back flat, knees soft. One end in each hand, arms long.',
          execution: 'Pull both elbows back toward the hips until the hands reach the lower ribs. Hold there, shoulder blades back and down. Lower slowly to long arms. For more tension, cross the band into an X in front of the shins.',
          cue: 'Without a bar this is the pulling. The hold at the top is a lock-off - elbows pinned while everything else stays still - and the band is hardest exactly there, so the hold is the hardest part of the rep.',
          breathing: 'Exhale on the pull, breathe through the hold.',
          mistakes: 'Standing up out of the hinge as you pull. Shrugging. Letting the band yank the arms down. Rounding the back.',
        },
      },
      {
        id: 'morn-band-pushup',
        name: 'Band Push-Up',
        capacities: ['press'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 10, unit: 'reps', restSec: 45,
        load: { kind: 'band', text: 'Band across the upper back, ends pinned under the hands' },
        progression: 'Bodyweight until 10 are easy, then the band across the back, then a 3s lowering.',
        protocolId: 'hypertrophy',
        note: 'Stop with two good reps left.',
        variations: [
          { minLevel: 1, name: 'Push-Up' },
          { minLevel: 3, name: 'Band Push-Up' },
          { minLevel: 5, name: 'Band Push-Up, 3s Lower' },
          { minLevel: 7, name: 'Band Archer Push-Up' },
        ],
        form: {
          setup: 'Band across the upper back just below the shoulder blades, one end under each hand. Hands just outside the shoulders, body straight from heels to head, glutes on.',
          execution: 'Lower the chest to a fist from the floor with the elbows at about 45 degrees. Press back up to lockout and push the floor away at the top. The band adds the most resistance at the top, where a push-up is otherwise easiest.',
          cue: 'The chest work. In controlled trials, push-ups grew the chest and triceps as much as the bench press at the same load, and band-resisted push-ups built the same strength as a 6RM bench. The plank position means the trunk works for free.',
          breathing: 'Inhale down, exhale up.',
          mistakes: 'Elbows flared to 90 degrees. Hips sagging. Half reps. Band sliding up to the neck.',
        },
      },
      {
        id: 'morn-band-split-squat',
        name: 'Band Split Squat',
        capacities: ['legs'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 6, unit: 'reps', restSec: 45,
        load: { kind: 'band', text: 'Band under the front foot, ends held at the shoulders' },
        progression: 'Three-second lowering, then a one-second pause with the back knee just off the floor.',
        protocolId: 'submax-practice',
        perSide: true,
        note: 'Per leg. Back knee lowers to the mat without touching - no thump.',
        variations: [
          { minLevel: 1, name: 'Band Split Squat' },
          { minLevel: 4, name: 'Band Split Squat, 3s Lower' },
          { minLevel: 6, name: 'Band Split Squat, 3s Lower + Pause' },
        ],
        form: {
          setup: 'Long split stance on the mat. Band under the middle of the front foot, one end in each hand, hands at the shoulders, so the band pulls straight down through you.',
          execution: 'Lower straight down until the back knee is a centimetre off the mat and the front thigh is about level. Drive up through the whole front foot to standing. All reps one leg, then swap the band to the other foot.',
          cue: 'The leg drive. Standing up out of a deep, loaded single-leg position is a rock-over: putting weight onto a high foot and pushing, instead of pulling with the arms. A band is heaviest at the top and lightest at the bottom, so the hard part is finishing the stand.',
          breathing: 'Inhale down, exhale up.',
          mistakes: 'Front heel lifting. Knee caving inward. Leaning the torso far forward. Dropping onto the back knee.',
        },
      },
      {
        id: 'home-sl-rdl',
        name: 'Single-Leg Romanian Deadlift',
        capacities: ['legs'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 8, unit: 'reps', restSec: 45,
        load: { kind: 'band', text: 'Bodyweight, then the band under the standing foot' },
        progression: 'Bodyweight until eight steady reps, then the band under the standing foot, then a 3-second lowering.',
        protocolId: 'back-strength',
        perSide: true,
        note: 'Posterior chain and single-leg balance. Cheap insurance for the knees and back.',
        form: {
          setup: 'Stand on one leg, slight knee bend, back flat.',
          execution: 'Hinge at the hip, sending the free leg back as the torso comes forward, until you feel a strong hamstring stretch. Return by driving the hips forward.',
          cue: 'Hinge, do not bend. Hips square to the floor throughout.',
          breathing: 'Inhale on the hinge, exhale on the return.',
          mistakes: 'Rounding the lower back. Letting the hip of the free leg rotate open.',
        },
      },
      {
        id: 'morn-pullapart',
        name: 'Band Pull-Apart + Overhead Pass',
        capacities: ['shoulder'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 1, work: 15, unit: 'reps', restSec: 45,
        load: { kind: 'band', text: 'Light band, wide grip — never to failure' },
        progression: 'Narrow the grip before you use a heavier band. Full dislocates only when the overhead pass is painless.',
        protocolId: 'prehab',
        variations: [
          { minLevel: 1, name: 'Band Pull-Apart' },
          { minLevel: 4, name: 'Band Pull-Apart + Overhead Pass' },
          { minLevel: 6, name: 'Band Pull-Apart + Full Dislocate' },
        ],
        form: {
          setup: 'Standing tall, band in both hands in front at shoulder height, arms straight, hands wide enough for light tension already. Ribs down, glutes lightly on.',
          execution: 'Pull the band apart until the hands are wide and it touches the chest, squeezing the shoulder blades together. Return under control. On the overhead pass, continue the hands up and back over the head as far as the shoulders allow, then reverse the path. Widen the grip if anything pinches.',
          cue: 'Climbing and sitting pull you into the same rounded, internally rotated shoulder. This is the direct antidote and it costs 40 seconds. The shoulder blades do the work, not the hands.',
          breathing: 'Exhale on the pull-apart, inhale on the return.',
          mistakes: 'Arching the lower back to fake overhead range. Shrugging toward the ears. Grip too narrow for your current mobility. Bending the elbows to cheat the pull.',
        },
      },
    ],
  },
  {
    id: 'daily-04', circuitNum: '04',
    title: 'FINGERS + MOBILITY', subtitle: 'daily - the tired morning - 15 min',
    focus: 'Hips, spine and wrists, then light, frequent finger loading on the edge.',
    capacities: ['mobility', 'shoulder', 'crimp', 'openhand'],
    illustration: 'squats.svg',
    duration: 15,
    recoveryHours: 0,
    note:
      'The session for a heavy morning, or the day after climbing. Nothing here is hard. '
      + 'Mobility first so the fingers are warm by the time they load.',
    exercises: [
      {
        id: 'morn-catcow',
        name: 'Cat-Cow + Thread the Needle',
        capacities: ['mobility', 'shoulder'],
        block: 'MOBILITY', intensity: 'TECHNIQUE',
        sets: 1, work: 12, unit: 'reps', restSec: 15,
        load: { kind: 'bodyweight', text: 'No load' },
        progression: 'Add the overhead reach on the unwind once the thread reaches the mat without forcing.',
        protocolId: 'mobility',
        note: 'Eight cat-cow, then four threads alternating',
        variations: [
          { minLevel: 1, name: 'Cat-Cow + Thread the Needle' },
          { minLevel: 4, name: 'Cat-Cow + Thread the Needle with Reach' },
        ],
        form: {
          setup: 'On hands and knees. Hands under shoulders, knees under hips, spine long and neutral.',
          execution: 'Cat: press the floor away, round the whole spine, tuck the tailbone. Cow: let the belly drop, lift chest and tailbone. Move one vertebra at a time. After eight, thread one arm under the body and across until the shoulder and the side of the head rest on the mat, then unwind and reach that arm to the ceiling. Alternate.',
          cue: 'This is the segment that gets your spine out of the shape it held all night and out of the shape climbing put it in. Move slowly enough to feel each vertebra arrive.',
          breathing: 'Inhale into cow, exhale into cat. Exhale as you thread through.',
          mistakes: 'Moving the spine as one rigid block. Cranking the neck. Hands drifting ahead of the shoulders. Speeding up — this is the wake-up, not the workout.',
        },
      },
      {
        id: 'morn-hip-9090',
        name: '90/90 Hip Switch',
        capacities: ['mobility', 'legs'],
        block: 'MOBILITY', intensity: 'TECHNIQUE',
        sets: 1, work: 12, unit: 'reps', restSec: 15,
        load: { kind: 'bodyweight', text: 'No load, no hands' },
        progression: 'Lose the hands first, then pause with the knees off the floor mid-rotation.',
        protocolId: 'mobility',
        note: 'Left plus right is 2 reps',
        variations: [
          { minLevel: 1, name: '90/90 Hip Switch' },
          { minLevel: 4, name: '90/90 Hip Switch + Lift' },
        ],
        form: {
          setup: 'Sit with both knees bent at 90 degrees, one leg in front and one out to the side, both shins on the floor. Sit tall, hands light for balance.',
          execution: 'Without pushing off the hands, lift both knees and rotate them through the middle to the mirror-image position on the other side. Slow and controlled. The lift variation pauses with the knees off the floor mid-rotation.',
          cue: 'Climbers lose internal hip rotation faster than almost any other range, and losing it is what stops you getting your hip into the wall. Three minutes a day beats an hour of stretching once a month.',
          breathing: 'Exhale through the rotation, inhale in the settled position.',
          mistakes: 'Pushing off the hands. Rounding the lower back to compensate for tight hips — sit on a folded edge of the mat instead. Rushing the middle rather than controlling it.',
        },
      },
      {
        id: 'home-hip-flow',
        name: 'Hip Mobility Flow',
        capacities: ['mobility'],
        block: 'MOBILITY', intensity: 'EASY',
        sets: 1, work: 150, unit: 'sec', restSec: 15,
        load: { kind: 'bodyweight', text: 'End range, loaded where possible' },
        progression: 'Push end range, then add gentle isometric contractions at end range to make the range usable.',
        protocolId: 'mobility',
        note: '90/90 both sides, frog, deep squat hold, couch stretch. Roughly 40s each.',
        form: {
          setup: 'Mat, floor space, something to hold onto for balance.',
          execution: '90/90 rotations both sides, frog stretch rocking, a deep squat hold, then a couch stretch per side. Two rounds.',
          cue: 'Combined abduction and external rotation is what makes high steps, drop knees and bridging available. Contract gently into end range so the range becomes usable rather than just passive.',
          breathing: 'Long exhales into each position.',
          mistakes: 'Bouncing. Holding your breath. Treating it as optional because nothing feels tight while warm.',
        },
      },
      {
        id: 'wrists-daily-block',
        name: 'Wrist Conditioning',
        capacities: ['shoulder'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 2, work: 12, unit: 'reps', restSec: 30,
        load: { kind: 'added-kg', text: 'Very light: 1-2kg, a full bottle, or a band' },
        fixed: true,
        progression:
          'Frequency first, load a distant second. Daily for four weeks before you '
          + 'even think about adding weight, then add the smallest increment you have.',
        protocolId: 'prehab',
        perSide: true,
        note:
          'Four movements, 12 reps each: wrist extension palm-down, wrist flexion '
          + 'palm-up, radial and ulnar deviation, then slow pronation and supination '
          + 'holding the weight by one end. Three seconds on every lowering phase.',
        form: {
          setup: 'Forearm supported on a thigh or table, wrist just past the edge, light weight or band in hand.',
          execution: 'Twelve controlled reps of each movement, three seconds on the lowering phase, then swap sides. Stop any movement that produces sharp or pinching pain rather than muscular effort.',
          cue: 'Climbing loads the wrist heavily in one narrow band of positions and trains nothing else, and hard crimping on steep ground is the worst offender. This covers every direction the wrist can go, at a load it can actually adapt to.',
          breathing: 'Relaxed. This should never feel like a lift.',
          mistakes: 'Going heavy because it feels too easy. Working into pain in the belief that it is strengthening something. Stopping the day the symptoms quieten, which is the day it started working.',
        },
      },
      {
        id: 'wrists-loaded-extension',
        name: 'Quadruped Wrist Rocks',
        capacities: ['shoulder'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 2, work: 10, unit: 'reps', restSec: 40,
        load: { kind: 'bodyweight', text: 'Partial bodyweight through the hands' },
        fixed: true,
        progression:
          'Start on the floor on all fours with almost no weight forward. Progress by '
          + 'shifting weight further over the hands, never by adding reps.',
        protocolId: 'prehab',
        note: 'Palms down, then palms reversed with fingers pointing back. Rock gently forward and back.',
        form: {
          setup: 'On all fours, hands under shoulders, palms flat. Second set with fingers rotated to point back toward the knees.',
          execution: 'Rock the shoulders slowly forward over the hands and back again, loading the wrist through extension. Stay well inside comfortable range.',
          cue: 'This is the position that hurts on mantles and hard crimping. Training it lightly and often is how it stops hurting.',
          breathing: 'Slow and even.',
          mistakes: 'Rocking too far too soon. Bouncing. Doing it once a week instead of daily.',
        },
      },
      EDGE_DENSITY,
    ],
  },
];
