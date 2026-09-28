// =============================================================================
// data-morning.ts — MORN mode: the wake-up routine
//
// Equipment: yoga mat, medium resistance band with no anchor, small pull edge
// on a sling. Done straight out of bed, before anything else competes for it.
//
// Three sessions:
//   01 ABS + OBLIQUES — trunk under load. Anti-extension, anti-rotation, hip
//                       flexion, finishing with the deep abdominal wall.
//   02 SLOW START     — the bad-morning version. Mobility first, trunk second.
//   03 FEET ON        — staying on the wall. One-arm pull practice, hanging
//                       compression, turned-out hips and ankle bend. Also
//                       needs the pull-up bar and a towel. 16 minutes as
//                       written, and the only MORN session where FRESH and
//                       TIRED visibly change the length (see below).
//
// 01 and 02 fit in 15 minutes and repeat daily. 03 has a 20-minute ceiling
// and is meant for three mornings a week.
//
// Design constraints that make this work at 6am rather than on paper:
//
//   recoveryHours: 0   Nothing here loads a tendon hard enough to cost the next
//                      session, so readiness never blocks it and it can sit on
//                      top of a climbing day.
//   No ACCESSORY       TIRED drops that block entirely, and TIRED is exactly
//                      the setting a non-morning person will reach for. PREHAB
//                      and MOBILITY are never dropped, and neither takes extra
//                      sets when FRESH, so the session has a hard time ceiling.
//   Fingers last       Pulleys are stiffest on waking. The edge work is
//                      submaximal, placed after the trunk work has raised
//                      tissue temperature, and never near a max.
//   SECONDARY in 03    The lock-off, hanging raise and Cossack squat are
//                      SECONDARY, not ACCESSORY, so TIRED removes a set rather
//                      than the exercise and FRESH adds one. SECONDARY never
//                      takes level set bonuses, so the 20-minute ceiling holds:
//                      TIRED 10-11, NORMAL 15-16, FRESH 19-20. The scapular
//                      pull and push-up are PREHAB so FRESH does not push the
//                      session past 20. Nothing is above MODERATE: this is
//                      practice, not a max, which is what keeps recoveryHours
//                      at 0.
// =============================================================================

import type { Circuit } from './types';

export const DATA_MORNING: Circuit[] = [
  {
    id: 'morn-01', circuitNum: '01',
    title: 'ABS + OBLIQUES', subtitle: 'daily - 12 min',
    focus: 'Trunk under load at the one hour of the day when nothing else is competing for it.',
    capacities: ['tension', 'mobility'],
    illustration: 'core.svg',
    duration: 12,
    recoveryHours: 0,
    note:
      'Floor to standing: the first exercise asks you to lie down, the last leaves '
      + 'you upright. Low load by design, so it runs on climbing days too. Alternate '
      + 'with 02 rather than doing this one seven days a week.',
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
          mistakes: 'Belly breathing instead of rib breathing. Lower back arching off the mat. Rushing the exhale. Skipping it because it feels too easy, which loses the switch that makes the next eight work.',
        },
      },
      {
        id: 'morn-deadbug',
        name: 'Band Dead Bug',
        capacities: ['tension'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 1, work: 16, unit: 'reps', restSec: 20,
        load: { kind: 'band', text: 'Light band arch to hand, or none until the back stays flat' },
        progression: 'Hold a flat back for all 16 first. Then add band tension, not reps.',
        protocolId: 'daily-trunk',
        note: 'Alternating - left plus right is 2 reps',
        variations: [
          { minLevel: 1, name: 'Dead Bug' },
          { minLevel: 4, name: 'Band Dead Bug' },
          { minLevel: 6, name: 'Band Dead Bug, 3s Hold' },
        ],
        form: {
          setup: 'On your back, arms straight up over the chest, hips and knees at 90 degrees. For the band version, loop the band around both arches and hold one end in each hand, arms vertical, band under light tension. Lower back pressed flat.',
          execution: 'Extend one leg long and low while the opposite arm reaches back overhead. Go only as far as the lower back stays down. Return under control and alternate. The band loads both directions, so the return is working too.',
          cue: 'Imagine a strip of paper under your lower back that someone is trying to pull out. Your job for the whole set is to trap it. The moment it slips free, you went too far.',
          breathing: 'Exhale slowly as the limbs extend, inhale as they return. If you have to hold your breath, shorten the range.',
          mistakes: 'Lower back arching as the leg lowers. Arm and leg on the same side. Racing the reps. Letting the band snap the limbs back instead of resisting it.',
        },
      },
      {
        id: 'morn-hollow',
        name: 'Hollow Body Hold',
        capacities: ['tension'],
        block: 'PREHAB', intensity: 'MODERATE',
        sets: 2, work: 25, unit: 'sec', restSec: 25,
        load: { kind: 'bodyweight', text: 'Longest lever you can hold with the lower back glued down' },
        progression: 'Two clean 25s holds, then lengthen the lever: knees out, then arms overhead, then rocks.',
        protocolId: 'daily-trunk',
        variations: [
          { minLevel: 1, name: 'Hollow Body Hold - Tucked' },
          { minLevel: 4, name: 'Hollow Body Hold' },
          { minLevel: 6, name: 'Hollow Body Rocks' },
        ],
        form: {
          setup: 'On your back. Lower back pressed into the mat, ribs squeezed down. Tucked: knees to the chest, hands past the knees, shoulder blades just off the mat. Full: arms overhead by the ears, legs straight and low.',
          execution: 'Hold the shape. The longer the arms and legs, the harder the lever, so lengthen only as far as the lower back stays glued down. For rocks, keep the identical rigid shape and rock from shoulders to hips using the curve of the back, never bending in the middle.',
          cue: 'The shape is the exercise. This loads the whole abdominal sheet from ribcage to pubic bone at once, which is the part a sit-up misses entirely.',
          breathing: 'Short controlled breaths through the mouth. If the lower back lifts on the inhale, bend the knees more.',
          mistakes: 'Lower back arching, which loses the whole exercise. Chin jammed to the chest. Arms drifting down to compensate. Holding to failure on day one and dreading it tomorrow.',
        },
      },
      {
        id: 'morn-leg-lowers',
        name: 'Band Leg Lowers',
        capacities: ['tension'],
        block: 'PREHAB', intensity: 'MODERATE',
        sets: 1, work: 12, unit: 'reps', restSec: 25,
        load: { kind: 'band', text: 'Band over both arches, ends held at the chest' },
        progression: 'Straighten the legs before you slow the tempo. Then take five seconds on the lowering.',
        protocolId: 'daily-trunk',
        variations: [
          { minLevel: 1, name: 'Bent-Knee Leg Lowers' },
          { minLevel: 4, name: 'Band Leg Lowers' },
          { minLevel: 6, name: 'Band Leg Lowers, 5s Lowering' },
        ],
        form: {
          setup: 'On your back, legs up toward the ceiling. Hands flat under the glutes at first, arms at the sides later. Band over both arches with the ends held at the chest so it resists the legs coming down. Lower back flat.',
          execution: 'Lower both legs slowly, stopping the instant the lower back starts to arch. Pause a beat, then return to vertical. Bent knees shorten the lever if the straight-leg version breaks the position.',
          cue: 'This is the lower abdominal exercise. The bottom segments respond to holding a posterior pelvic tilt under load, which is exactly what you are defending here.',
          breathing: 'Inhale as the legs lower, exhale hard as they return. The exhale keeps the ribs down.',
          mistakes: 'Arching the lower back to gain range you cannot control. Yanking the legs back with the hip flexors. Bouncing at the bottom. Straining the neck instead of leaving the head down.',
        },
      },
      {
        id: 'morn-side-plank',
        name: 'Side Plank Reach-Through',
        capacities: ['tension'],
        block: 'PREHAB', intensity: 'MODERATE',
        sets: 1, work: 12, unit: 'reps', restSec: 25,
        load: { kind: 'bodyweight', text: 'Hips high for every rep' },
        progression: 'Knees down until 12 clean reps, then straight legs, then hold the band in the top hand.',
        protocolId: 'daily-trunk',
        perSide: true,
        variations: [
          { minLevel: 1, name: 'Side Plank Reach-Through - Knees Down' },
          { minLevel: 4, name: 'Side Plank Reach-Through' },
          { minLevel: 6, name: 'Band Side Plank Reach-Through' },
        ],
        form: {
          setup: 'On your side, elbow directly under the shoulder, forearm flat and pointing forward. Knees bent and stacked for the easier version, legs straight and feet stacked or staggered for the full one. Lift the hips into one straight line, top arm to the ceiling.',
          execution: 'Rotate the torso and thread the top arm down and through the gap under your body, reaching as far behind as you can. Rotate back and reach to the ceiling. That is one rep. All reps one side, then switch.',
          cue: 'The rotation is the point. Obliques run diagonally and only load fully when the ribcage turns against a fixed pelvis. Keep the hips high throughout, or this becomes a shoulder exercise.',
          breathing: 'Exhale as you thread through, inhale as you reach up.',
          mistakes: 'Hips sagging between reps. Elbow ahead of the shoulder instead of under it. Threading with the arm alone rather than turning the ribcage. Uneven reps left versus right.',
        },
      },
      {
        id: 'morn-pressout',
        name: 'Half-Kneeling Band Press-Out',
        capacities: ['tension', 'shoulder'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 1, work: 10, unit: 'reps', restSec: 25,
        load: { kind: 'band', text: 'Band trapped under the down knee — enough tension to feel the pull' },
        progression: 'Add a 3s hold at full extension, then move to tall kneeling, then press overhead.',
        protocolId: 'daily-trunk',
        perSide: true,
        variations: [
          { minLevel: 1, name: 'Half-Kneeling Band Press-Out' },
          { minLevel: 4, name: 'Half-Kneeling Band Press-Out, 3s Hold' },
          { minLevel: 6, name: 'Tall-Kneeling Band Press-Out + Overhead' },
        ],
        form: {
          setup: 'Half-kneeling: one knee down, other foot forward and flat. Trap one end of the band under the down knee or the front foot on that same side, other end in both hands at the sternum. The band pulls diagonally down and across and will try to twist and bend you toward it. Squeeze the down-side glute and stand tall through the spine.',
          execution: 'Press both hands straight out from the chest to full extension, hold a beat, return to the sternum. The band gets harder as the hands travel. Do not let the ribcage turn or the torso tip toward the anchor. All reps, then swap knees and band side.',
          cue: 'Anti-rotation. You are not trying to twist, you are refusing to. This is what an oblique actually does on the wall when you are fighting a barn-door, and it builds the deep waist tension flexion work never will.',
          breathing: 'Exhale as you press out, inhale as you return. The tension lives in the trunk, not in a held breath.',
          mistakes: 'Rotating or side-bending toward the band, which loses the entire point. Band too light to feel. Front foot too close to the knee, killing the base. Hips shifting instead of staying square.',
        },
      },
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
      {
        id: 'morn-nohang',
        name: 'Pull Edge No-Hang',
        capacities: ['openhand', 'crimp'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 1, work: 10, unit: 'sec', restSec: 25,
        load: { kind: 'percent-max', value: 40, text: 'About 40-50% of max — you set the load through the leg' },
        progression:
          'Frequency before load. Daily for a month, then a second block later in the '
          + 'day at least 6h apart, before you ever pull harder than half.',
        protocolId: 'density-hang',
        perSide: true,
        note: 'Per hand - one primer set, not a density block. The full 10x10s protocol is HANG 03.',
        variations: [
          { minLevel: 1, name: 'Pull Edge No-Hang - Open Hand' },
          { minLevel: 4, name: 'Pull Edge No-Hang - Half-Crimp' },
          { minLevel: 6, name: 'Pull Edge No-Hang - Half-Crimp, Heavier' },
        ],
        form: {
          setup: 'Loop the sling around one foot and sit or stand with that leg out in front. Edge in one hand. Open hand means joints mostly extended, only the knuckle joint flexed. Half-crimp means middle joints near 90 degrees with the fingertip joints still slightly curved and the thumb OFF the index finger. Elbow slightly bent, shoulder packed down.',
          execution: 'Build tension gradually over the first two seconds by pressing down through the foot. Never snatch at it. Hold ten seconds at roughly 40-50 percent of what you could pull, release over a second, swap hands. Because the leg sets the load rather than bodyweight, you decide exactly how hard this is, which is what makes it safe first thing.',
          cue: 'This is the one exercise here where more is not better. Finger tendons are cold, stiff and least hydrated on waking. A light daily pull keeps the tissue stimulated and the grip position sharp. A hard one is how climbers collect pulley injuries. Max hangs belong in HANG mode, later in the day.',
          breathing: 'Relaxed and normal for the full ten seconds. If you are holding your breath, back the load off.',
          mistakes: 'Going near maximal on cold tendons. Snatching the load on. Thumb wrapped over the index finger, which makes it a full crimp. Continuing through any click, pinch or sharp point - stop and skip it for the day. Doing it first, before anything is warm.',
        },
      },
      {
        id: 'morn-vacuum',
        name: 'Stomach Vacuum',
        capacities: ['tension'],
        block: 'PREHAB', intensity: 'TECHNIQUE',
        sets: 2, work: 15, unit: 'sec', restSec: 15,
        load: { kind: 'bodyweight', text: 'No load — empty lungs are the whole difficulty' },
        progression: 'Supine until 15s is comfortable, then on all fours, then standing. Gravity helps less each time.',
        protocolId: 'daily-trunk',
        note: 'Best done before breakfast',
        variations: [
          { minLevel: 1, name: 'Stomach Vacuum - Supine' },
          { minLevel: 4, name: 'Stomach Vacuum - Quadruped' },
          { minLevel: 6, name: 'Stomach Vacuum - Standing' },
        ],
        form: {
          setup: 'Supine: on your back, knees bent, feet flat. Quadruped: hands and knees, flat back. Standing: feet shoulder-width, hands on the thighs. Each position removes a little help from gravity, which is why they unlock in that order.',
          execution: 'Exhale every last bit of air. With the lungs empty and without breathing in, pull the navel up and back toward the spine as hard as you can and hold for 15 seconds. Release and breathe normally before the second set.',
          cue: 'This trains the transverse abdominis, the deep corset layer under the visible abs. It does nothing for the segments themselves, but it is what draws the whole midsection in and makes the obliques read as a defined line rather than a soft edge. Fasted, on waking, is genuinely the easiest time to get a full contraction.',
          breathing: 'The hold happens on empty lungs. Full exhale, then hold with no air. Come out of it the moment you need to breathe.',
          mistakes: 'Sucking in without exhaling first, which cannot work around a full ribcage. Holding until lightheaded. Doing it on a full stomach. Confusing it with a crunch: nothing shortens, everything draws inward.',
        },
      },
    ],
  },

  {
    id: 'morn-02', circuitNum: '02',
    title: 'SLOW START', subtitle: 'daily - 10 min',
    focus: 'For the mornings you have nothing. Undoes the night and the wall, and still counts.',
    capacities: ['mobility', 'tension'],
    illustration: 'morning.svg',
    duration: 10,
    recoveryHours: 0,
    note:
      'The low day. Run this after a hard climbing session, on a bad night of sleep, '
      + 'or any morning 01 feels like too much. Mobility first, trunk second, fingers '
      + 'lightest of all.',
    exercises: [
      {
        id: 'morn-supine-twist',
        name: 'Supine Spinal Twist',
        capacities: ['mobility'],
        block: 'WARMUP', intensity: 'TECHNIQUE',
        sets: 1, work: 20, unit: 'sec', restSec: 15,
        load: { kind: 'bodyweight', text: 'No load' },
        fixed: true,
        progression: 'Never progressed. Add the active opposite-arm reach once the shoulder stays down on its own.',
        protocolId: 'mobility',
        perSide: true,
        variations: [
          { minLevel: 1, name: 'Supine Spinal Twist' },
          { minLevel: 4, name: 'Supine Twist + Reach' },
        ],
        form: {
          setup: 'On your back, arms out wide in a T. Draw both knees toward the chest, then let them fall together to one side while keeping both shoulder blades on the floor.',
          execution: 'Rest and breathe for 20 seconds, letting the knees sink lower on each exhale. Switch sides. The reach variation actively presses the opposite arm along the floor away from the knees, which pulls the stretch further up the obliques and lats.',
          cue: 'The point is not slamming the knees to the floor. It is keeping the far shoulder pinned while the pelvis rotates away from it. That is where the rotation actually happens.',
          breathing: 'Slow nasal inhales, long exhales. Four or five breaths per side.',
          mistakes: 'Letting the top shoulder peel off the mat, which turns it into a shrug. Forcing the knees down. Skipping the second side because the first got comfortable.',
        },
      },
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
      {
        id: 'morn-bridge-march',
        name: 'Glute Bridge March',
        capacities: ['legs', 'tension'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 1, work: 16, unit: 'reps', restSec: 20,
        load: { kind: 'bodyweight', text: 'Bodyweight, or a band above the knees' },
        progression: 'Hips dead level for all 16 first, then add the band above the knees.',
        protocolId: 'daily-trunk',
        note: 'Left plus right is 2 reps',
        variations: [
          { minLevel: 1, name: 'Glute Bridge Hold' },
          { minLevel: 4, name: 'Glute Bridge March' },
          { minLevel: 6, name: 'Band Glute Bridge March' },
        ],
        form: {
          setup: 'On your back, feet hip-width and flat, heels about 30cm from the glutes, arms at the sides. Band above the knees for the loaded version.',
          execution: 'Drive through the heels and lift the hips to a straight line from knees to shoulders. From there lift one foot a few centimetres without letting the hips drop or tilt, replace it, then the other. Hips stay high for the whole set.',
          cue: 'A night of sleep and a day of sitting both switch the glutes off. Marching means the pelvis has to stay level on one leg, which is the same demand as a high step on the wall.',
          breathing: 'Steady at the top, exhale on each foot lift.',
          mistakes: 'Hips dropping the moment a foot lifts. Rushing. Pushing through the toes instead of the heels. Hyperextending the lower back at the top instead of finishing with the glutes.',
        },
      },
      {
        id: 'morn-side-plank-hold',
        name: 'Side Plank Hold',
        capacities: ['tension'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 1, work: 25, unit: 'sec', restSec: 20,
        load: { kind: 'bodyweight', text: 'Bottom shoulder packed, hips high' },
        progression: 'Knees down until 25s is easy, then straight legs, then lift and hold the top leg.',
        protocolId: 'daily-trunk',
        perSide: true,
        variations: [
          { minLevel: 1, name: 'Side Plank Hold - Knees Down' },
          { minLevel: 4, name: 'Side Plank Hold' },
          { minLevel: 6, name: 'Side Plank Hold + Top Leg Raise' },
        ],
        form: {
          setup: 'On your side, elbow under the shoulder, forearm forward. Knees bent and stacked for the easier version, legs straight and feet stacked or staggered for the full one. Hips lifted into a straight line, top hand on the hip or reaching up.',
          execution: 'Hold. Full time one side, then the other. The advanced version lifts and holds the top leg, adding hip abduction on top of the trunk hold.',
          cue: 'Push the floor away with the forearm and lift the bottom ribs toward the ceiling. If the bottom shoulder sinks you are hanging on the joint rather than holding with the trunk.',
          breathing: 'Slow and even. If you cannot breathe evenly, drop to knees down.',
          mistakes: 'Hips sagging. Rolling forward or back off the true side position. Bottom shoulder collapsing. Forty seconds on the strong side and fifteen on the weak one.',
        },
      },
      {
        id: 'morn-nohang-easy',
        name: 'Pull Edge No-Hang - Open Hand',
        capacities: ['openhand'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 1, work: 10, unit: 'sec', restSec: 20,
        load: { kind: 'percent-max', value: 30, text: 'About 30-40% of max — circulation, not strength' },
        progression: 'This one never gets heavier. If you want more finger work, run circuit 01 or HANG 03 instead.',
        protocolId: 'density-hang',
        perSide: true,
        note: 'Per hand - one light primer set. Skip it entirely if the fingers ache.',
        variations: [
          { minLevel: 1, name: 'Pull Edge No-Hang - Open Hand' },
          { minLevel: 4, name: 'Pull Edge No-Hang - Open Hand + Roll' },
        ],
        form: {
          setup: 'Sling around one foot, leg extended in front. Edge in one hand in a relaxed open-hand position, joints mostly extended, no crimping at all. Elbow soft, shoulder packed.',
          execution: 'Ease into a light pull over two seconds, hold ten at maybe 30-40 percent, release. Swap hands. The roll variation slowly curls the fingers from open hand toward half-crimp and back once during the hold, moving through the range under gentle load.',
          cue: 'On a recovery morning the fingers want blood flow and a reminder of the position, not a stimulus. If yesterday was a hard climbing day, this is the version to do — and if they feel stiff or achy, skip it. Skipping costs nothing in this app.',
          breathing: 'Completely relaxed. If you are bracing, it is too heavy.',
          mistakes: 'Treating this as a strength set. Any crimping. Pulling through stiffness that has not eased. Doing it before the mobility work rather than after.',
        },
      },
      {
        id: 'morn-deadbug-slow',
        name: 'Slow Dead Bug',
        capacities: ['tension'],
        block: 'PREHAB', intensity: 'EASY',
        sets: 1, work: 14, unit: 'reps', restSec: 15,
        load: { kind: 'bodyweight', text: 'No load. The tempo is the load' },
        progression: 'Slow the tempo before you add the band. Four seconds per rep, then six.',
        protocolId: 'daily-trunk',
        note: 'Alternating - 4s per rep',
        variations: [
          { minLevel: 1, name: 'Slow Dead Bug' },
          { minLevel: 4, name: 'Slow Dead Bug, 4s Tempo' },
          { minLevel: 6, name: 'Band Slow Dead Bug' },
        ],
        form: {
          setup: 'On your back, arms up over the chest, hips and knees at 90 degrees, lower back pressed flat. Same shape as the banded version in circuit 01, no band needed.',
          execution: 'Extend one leg and the opposite arm slowly, about two seconds out and two back, going only as far as the flat lower back allows. Alternate. This is last on purpose: it finishes you braced rather than stretched, so you stand up switched on.',
          cue: 'Slower is harder here, not easier. The tempo is the load.',
          breathing: 'Long exhale on the extension, inhale on the return. Match the breath to the tempo and the set paces itself.',
          mistakes: 'Speeding up as it gets uncomfortable. Lower back lifting. Same-side arm and leg. Slumping the second the set ends instead of standing up tall.',
        },
      },
    ],
  },

  {
    id: 'morn-03', circuitNum: '03',
    title: 'FEET ON', subtitle: '3x week - 16 min',
    focus: 'Stay on the wall: pull with the feet, reach the high step, own the lock-off.',
    capacities: ['pull', 'tension', 'legs', 'mobility'],
    illustration: 'pullups.svg',
    duration: 16,
    recoveryHours: 0,
    note:
      'Needs the pull-up bar and a towel as well as the mat. Three mornings a week, on '
      + 'days you are not climbing or doing HOME 02 - the one-arm work here is '
      + 'practice, and the heavy version is there. Every set stops well short of '
      + 'failure. If a set turns into a grind, it was the wrong variation.',
    exercises: [
      {
        id: 'morn-hip-wake',
        name: 'Hip + Shoulder Wake-Up',
        capacities: ['mobility', 'shoulder'],
        block: 'WARMUP', intensity: 'EASY',
        sets: 1, work: 90, unit: 'sec', restSec: 15,
        load: { kind: 'bodyweight', text: 'No load' },
        fixed: true,
        progression: 'Never progressed.',
        protocolId: 'warmup',
        note: 'Five cat-cows, five world\'s greatest stretches a side, 10 arm circles, 15s dead hang.',
        form: {
          setup: 'Mat under the bar. Towel over your shoulder for later.',
          execution: 'Five slow cat-cows on all fours. Step into a long lunge, elbow to the inside of the front foot, then rotate that arm to the ceiling: five a side. Ten big arm circles each way. Finish with a relaxed 15-second dead hang to let the shoulders open.',
          cue: 'You are about to hang on one arm. Ninety seconds of this is what makes that reasonable at 7am.',
          breathing: 'Nasal and unhurried.',
          mistakes: 'Skipping it because the session is short. Hanging stiff-shouldered instead of letting the bar stretch you.',
        },
      },
      {
        id: 'morn-frog-rock',
        name: 'Frog Rock',
        capacities: ['mobility'],
        block: 'MOBILITY', intensity: 'TECHNIQUE',
        sets: 1, work: 10, unit: 'reps', restSec: 15,
        load: { kind: 'bodyweight', text: 'Bodyweight into the hips, no forcing' },
        progression: 'Widen the knees a centimetre at a time. Then add the knee lift-offs at end range.',
        protocolId: 'active-flexibility',
        note: 'Slow rocks, 2s at the back of each one',
        variations: [
          { minLevel: 1, name: 'Frog Rock' },
          { minLevel: 4, name: 'Frog Rock + Knee Lift-Offs' },
        ],
        form: {
          setup: 'On forearms and knees. Knees wide, shins parallel, ankles in line with the knees and feet turned out. Spine long, not sagging.',
          execution: 'Rock the hips back toward the heels until the inner thighs stretch, pause two seconds, rock forward. Ten reps. For the lift-off version, at the back of the last three rocks lift one knee a centimetre off the mat for two seconds, then the other.',
          cue: 'This is the drop-knee and the frog position on a steep wall. Turned-out hips are what put your belly against the wall, and a belly on the wall is weight on your feet instead of your fingers.',
          breathing: 'Exhale as you rock back into the stretch.',
          mistakes: 'Feet drifting in behind the knees. Rounding the lower back to fake depth. Bouncing. Forcing past a pinch in the front of the hip.',
        },
      },
      {
        id: 'morn-ankle-rock',
        name: 'Knee-to-Wall Ankle Rock',
        capacities: ['mobility'],
        block: 'MOBILITY', intensity: 'TECHNIQUE',
        sets: 1, work: 10, unit: 'reps', restSec: 15,
        load: { kind: 'bodyweight', text: 'Bodyweight, heel stays down' },
        progression: 'Move the toes back from the wall one centimetre whenever all 10 touch. Then do it in a deep squat.',
        protocolId: 'mobility',
        perSide: true,
        variations: [
          { minLevel: 1, name: 'Knee-to-Wall Ankle Rock' },
          { minLevel: 4, name: 'Deep Squat Ankle Rock' },
        ],
        form: {
          setup: 'Half-kneeling facing a wall, front foot a hand-width from it. Note where the toes are: that distance is your score, and it should grow over the weeks.',
          execution: 'Drive the front knee forward over the little toes to touch the wall, heel pinned to the floor, then back. Ten, then the other side. In the deep squat version, sit in a heels-down squat and shift the weight over one foot at a time, knee travelling past the toes.',
          cue: 'Ankle bend is what lets you stand on a slab smear and weight a foothold below you without the heel popping. Stiff ankles turn every foot into a toe-tip.',
          breathing: 'Normal.',
          mistakes: 'Heel lifting, which ends the rep. Knee caving inward instead of tracking the little toes. Going fast.',
        },
      },
      {
        id: 'morn-oa-scap',
        name: 'One-Arm Scapular Pull',
        capacities: ['pull', 'shoulder'],
        block: 'PREHAB', intensity: 'MODERATE',
        sets: 2, work: 4, unit: 'reps', restSec: 45,
        load: { kind: 'bodyweight', text: 'Straight arm. Toes on a chair take whatever the shoulder cannot' },
        progression: 'Less weight through the toes until there is none, then a 2s hold at the top of each rep.',
        protocolId: 'submax-practice',
        perSide: true,
        note: 'Per arm. Straight elbow - the shoulder blade does the whole movement.',
        variations: [
          { minLevel: 1, name: 'One-Arm Scapular Pull - Feet Assisted' },
          { minLevel: 4, name: 'One-Arm Scapular Pull' },
          { minLevel: 6, name: 'One-Arm Scapular Pull, 2s Hold' },
        ],
        form: {
          setup: 'Hang from the bar with one hand, arm straight, the other hand free or lightly on the thigh. For the assisted version, a chair in front with the toes resting on it. Let the shoulder rise toward the ear first.',
          execution: 'Without bending the elbow, pull the shoulder blade down and back so the body rises a few centimetres. Hold a beat, lower over two to three seconds to the long, open hang. Four, swap arms.',
          cue: 'Lattice lists this as the first exercise on the road to a one-arm pull-up, and the one that makes the rest safe. Every one-arm pull starts here: shoulder packed before the elbow moves. It is also exactly what holds a wide lock-off together.',
          breathing: 'Exhale as the shoulder pulls down.',
          mistakes: 'Bending the elbow to cheat height. Twisting the body round to face the arm. Dropping into the bottom instead of lowering. Hanging from a shrugged shoulder between reps.',
        },
      },
      {
        id: 'morn-oa-lockoff',
        name: 'Towel-Assisted One-Arm Lock-Off',
        capacities: ['pull'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 8, unit: 'sec', restSec: 45,
        load: { kind: 'bodyweight', text: 'The lower your hand on the towel, the less it helps' },
        progression: 'Move the towel hand lower, then to two fingers, then hold three angles: top, 90 degrees, 120 degrees.',
        protocolId: 'submax-practice',
        perSide: true,
        note: 'Per arm. Towel over the bar, other hand on it. Hold where it feels about 7/10.',
        variations: [
          { minLevel: 1, name: 'Towel-Assisted Lock-Off, 90 Degrees' },
          { minLevel: 3, name: 'Towel-Assisted Lock-Off, Low Hand' },
          { minLevel: 5, name: 'Finger-Assisted Lock-Off, 3 Angles' },
          { minLevel: 7, name: 'One-Arm Lock-Off, 90 Degrees' },
        ],
        form: {
          setup: 'Drape the towel over the bar next to your working hand. Working hand on the bar, palm away or neutral. Other hand grips the towel: at chin height gives the most help, at chest height or lower much less.',
          execution: 'Pull up with both, then hold with the elbow at 90 degrees, driving the working elbow down to the ribs. The towel hand takes only what you need to hold for eight seconds at about seven out of ten. Lower under control. Swap arms. At the three-angle level, hold three seconds at the top, at 90 and at 120 degrees on the way down.',
          cue: 'Climbing pulls are mostly isometric and position-specific: one arm locked while the other hand goes to the next hold. That is this. It is also the static half of a one-arm pull-up, and the half most people fail.',
          breathing: 'Short breaths through the hold. Never a held breath.',
          mistakes: 'Pulling so hard on the towel that the working arm does nothing. Letting the shoulder shrug up. Rotating the body open. Holding until the elbow aches - stop at 7/10, and stop entirely for any sharp elbow pain.',
        },
      },
      {
        id: 'morn-hanging-oblique',
        name: 'Hanging Oblique Knee Raise',
        capacities: ['tension'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 8, unit: 'reps', restSec: 45,
        load: { kind: 'bodyweight', text: 'Bodyweight. No swing' },
        progression: 'Slow the lowering to three seconds, then straighten the legs into windshield wipers.',
        protocolId: 'submax-practice',
        note: 'Alternating - knees to the left elbow, then the right, is 2 reps',
        variations: [
          { minLevel: 1, name: 'Hanging Oblique Knee Raise' },
          { minLevel: 4, name: 'Hanging Oblique Knee Raise, 3s Lower' },
          { minLevel: 6, name: 'Hanging Windshield Wiper - Bent Knee' },
        ],
        form: {
          setup: 'Dead hang, shoulders packed down, legs together. Brace the ribs down before the first rep so the swing never starts.',
          execution: 'Curl the pelvis up and bring both knees toward one elbow, tilting the pelvis as you go. Lower under control to a still hang, then the other side. The windshield wiper holds the knees at chest height and sweeps them side to side.',
          cue: 'Feet cutting loose is a compression failure: the hips and lower abs cannot keep pulling the toes into the wall. Hanging from your hands and pulling your knees up is the nearest thing at home. The twist brings in the obliques, which are what hold a heel or toe hook on at an angle.',
          breathing: 'Exhale hard as the knees rise, inhale as they lower.',
          mistakes: 'Swinging to get the legs up. Lifting the knees with the hip flexors alone while the pelvis stays flat. Dropping the legs. Letting the shoulders shrug to the ears.',
        },
      },
      {
        id: 'morn-cossack',
        name: 'Cossack Squat',
        capacities: ['legs', 'mobility'],
        block: 'SECONDARY', intensity: 'MODERATE',
        sets: 2, work: 5, unit: 'reps', restSec: 45,
        load: { kind: 'bodyweight', text: 'Bodyweight. Hand on a chair or the wall if the depth is not there yet' },
        progression: 'Go deeper before you let go of support. Then pause three seconds at the bottom.',
        protocolId: 'submax-practice',
        perSide: true,
        variations: [
          { minLevel: 1, name: 'Cossack Squat - Hand Supported' },
          { minLevel: 4, name: 'Cossack Squat' },
          { minLevel: 6, name: 'Cossack Squat, 3s Pause' },
        ],
        form: {
          setup: 'Feet very wide, toes slightly out. Hand on a chair beside you for the supported version.',
          execution: 'Sit down over one leg, heel flat, knee tracking the toes, while the other leg straightens with the toes pointing up. Go as deep as you control, then drive back up through the whole bent foot. Five on one side, then five on the other.',
          cue: 'This is a rock-over and a wide bridge in one movement: pushing up out of a deep, turned-out hip with the heel down. Most climbers pull with the arms because the legs cannot push from that position. Here they learn to.',
          breathing: 'Inhale down, exhale up.',
          mistakes: 'Heel lifting at the bottom. Knee collapsing inward. Folding the chest onto the thigh. Bouncing out of the bottom instead of pushing.',
        },
      },
      {
        id: 'morn-pushup',
        name: 'Push-Up',
        capacities: ['press'],
        block: 'PREHAB', intensity: 'MODERATE',
        sets: 2, work: 8, unit: 'reps', restSec: 45,
        load: { kind: 'bodyweight', text: 'Bodyweight. Stop with three good reps left' },
        progression: 'Slow the lowering first, then archer push-ups, then lean forward into pseudo-planche.',
        protocolId: 'submax-practice',
        note: 'Chest, shoulders and serratus - and the antagonist that keeps the one-arm work balanced.',
        variations: [
          { minLevel: 1, name: 'Push-Up' },
          { minLevel: 3, name: 'Push-Up, 3s Lower' },
          { minLevel: 5, name: 'Archer Push-Up' },
          { minLevel: 7, name: 'Pseudo-Planche Push-Up' },
        ],
        form: {
          setup: 'Hands just outside the shoulders, body straight from heels to crown, glutes and abs lightly on. Archer: hands very wide, one arm stays straight. Pseudo-planche: hands turned out by the hips, shoulders leaning well past the hands.',
          execution: 'Lower the chest to a fist from the floor with the elbows at about 45 degrees, press back to lockout and push the floor away at the top. Archer push-ups lower toward one hand while the other arm stays long, alternating.',
          cue: 'Hours of pulling round the shoulders forward. Pressing keeps them centred, which matters more with one-arm work in the week. The archer and pseudo-planche versions load the front of the shoulder hard for very little extra bodyweight, which is the good kind of size for a climber.',
          breathing: 'Inhale down, exhale up.',
          mistakes: 'Elbows flared to 90 degrees. Hips sagging. Half reps. Grinding to failure, which is not what this session is for.',
        },
      },
      {
        id: 'morn-highstep',
        name: 'High-Step Lift-Off',
        capacities: ['mobility', 'legs'],
        block: 'MOBILITY', intensity: 'EASY',
        sets: 1, work: 5, unit: 'reps', restSec: 15,
        load: { kind: 'bodyweight', text: 'No load. Only the hip lifts the foot' },
        progression: 'Raise the target mark, then add the rock-over onto a chair.',
        protocolId: 'active-flexibility',
        perSide: true,
        note: 'Per leg. 3s hold at the top of each rep.',
        variations: [
          { minLevel: 1, name: 'High-Step Lift-Off' },
          { minLevel: 4, name: 'High-Step Lift-Off, Above Hip' },
          { minLevel: 6, name: 'High-Step Lift-Off + Rock-Over' },
        ],
        form: {
          setup: 'Face a wall, hands flat on it at shoulder height, feet a forearm away. Pick a mark on the wall around knee height, higher as you improve.',
          execution: 'Turn the knee out and lift the foot up and out to the side, as if placing it on a high foothold, until the toe touches the mark. Hold three seconds with no hands pulling it there, lower slowly. Five per leg. The rock-over version steps that foot onto a chair and shifts the hips over it until you stand up on it.',
          cue: 'Passive flexibility is how high a foot goes when you pull it. Active flexibility is how high it goes on the wall, where nothing pulls it. That gap is why feet land short of holds. Finishing standing on one leg is also the last thing the session asks of you: you are up.',
          breathing: 'Exhale as the foot lifts, breathe through the hold.',
          mistakes: 'Leaning the torso away to cheat height. Letting the knee turn in. Swinging the leg up. Dropping the foot instead of lowering it.',
        },
      },
    ],
  },
];
