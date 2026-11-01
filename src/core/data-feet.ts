// =============================================================================
// data-feet.ts — Off-wall work that teaches climbing with the legs (v43)
//
// From the v42 research (docs/7bit-proposal-v42.md, part two), grouped by the
// move on the wall each one serves:
//
//   PRECISE FEET   step-down to a mark, shift-lift-place, edge stand
//   FOOT STRENGTH  towel drag, toe-edge calf raise, toe-pull bridge
//   TOE HOOKS      tibialis wall raise, toe-hook sit-back
//   HEEL HOOKS     heel-hook bridge hold, slider curl with the heel out
//   HIGH STEPS     wall high-step + load, box lift-off, seated leg lift, box pistol
//   DROP KNEES     90/90 lift-off, hip CARs
//   FLAGS, STEMS   lateral foot reach + shift, active frog, hip airplane
//   LEG DRIVE      high-foot drive + stick
//
// Every one keeps the hands free or flat on a wall: all of it is open while a
// finger heals. Skill drills are `fixed` TECHNIQUE work (level picks the
// variation, energy changes nothing) and carry a `focus`: one external cue,
// what the movement does rather than the body part (Wulf). The strength work
// scales like any SECONDARY exercise. Home kit is a chair and a wall; the gym
// adds boxes, plates and the radiator. Pure data.
// =============================================================================

import type { Exercise } from './types';

// ---- Precise feet ---------------------------------------------------------------

export const STEP_DOWN_MARK: Exercise = {
  id: 'feet-step-down-mark',
  name: 'Step-Down to a Mark',
  capacities: ['legs', 'tension'],
  block: 'SECONDARY', intensity: 'TECHNIQUE',
  sets: 3, work: 6, unit: 'reps', restSec: 30,
  fixed: true,
  load: { kind: 'score', text: 'A low step and a tape mark or coin. Score the clean touches.' },
  progression: 'A higher step, then smaller and further marks, then a two-second hover above the mark before the touch.',
  protocolId: 'floor-footwork',
  perSide: true,
  note: 'Per leg. Score it: clean touches out of six on the weaker leg. One touch, silent, no slide.',
  focus: 'The mark takes the toe once. The step stays quiet.',
  variations: [
    { minLevel: 1, name: 'Step-Down to a Mark - Low Step' },
    { minLevel: 3, name: 'Step-Down to a Mark - Higher Step' },
    { minLevel: 5, name: 'Step-Down to a Mark - Far Marks, Hover' },
  ],
  form: {
    setup: 'Stand on one leg on a low step, a stair or a stack of books. Tape two or three small marks on the floor in front, beside and behind.',
    execution: 'Bend the standing leg slowly and lower the other toe onto a mark, eyes on it until the toe has touched. Touch once, take no weight, and stand back up without pushing off the toe. Next mark.',
    cue: "Horst's target practice and Gresham's pause before placing: look, place once, weight. The slow single-leg lowering is the strength half; the touch is the skill half.",
    breathing: 'Slow and even.',
    mistakes: 'Dropping the last few centimetres. Sliding the toe onto the mark. Pushing off the floor foot to stand up.',
  },
};

export const SHIFT_PLACE: Exercise = {
  id: 'feet-shift-place',
  name: 'Shift, Lift, Place',
  capacities: ['legs', 'tension'],
  block: 'SECONDARY', intensity: 'TECHNIQUE',
  sets: 3, work: 60, unit: 'sec', restSec: 30,
  fixed: true,
  load: { kind: 'bodyweight', text: 'Six to eight tape marks on the floor, wider than the hips' },
  progression: 'Marks further apart, then smaller, then a new layout each set, then eyes closed for the last placement.',
  protocolId: 'floor-footwork',
  note: 'A different layout each session: varied practice is what carries over to a new climb.',
  focus: 'Weight off, foot moves, foot on, weight over. The trunk stays still.',
  variations: [
    { minLevel: 1, name: 'Shift, Lift, Place - Wide Marks' },
    { minLevel: 3, name: 'Shift, Lift, Place - Small Marks' },
    { minLevel: 5, name: 'Shift, Lift, Place - New Layout, Last One Eyes Closed' },
  ],
  form: {
    setup: 'Feet on two marks wider than the hips, knees soft, arms out as if on holds. More marks around you at different distances.',
    execution: 'Shift the hips until one foot weighs nothing: it lifts a centimetre and the trunk does not move. Place it on a new mark, then shift the weight over it. Keep moving for the whole set.',
    cue: 'On the wall a limb comes off only after its load has moved to the others (Quaine and Martin). Unweight, move, place, weight is the pattern under every foot move.',
    breathing: 'Slow; exhale as the weight arrives.',
    mistakes: 'Lifting the foot before it is unweighted (the trunk lurches). Looking away before the foot is down. Rushing.',
  },
};

export const EDGE_STAND: Exercise = {
  id: 'feet-edge-stand',
  name: 'Edge Stand + Rock-Over',
  capacities: ['legs', 'tension'],
  block: 'SECONDARY', intensity: 'TECHNIQUE',
  sets: 3, work: 20, unit: 'sec', restSec: 20,
  fixed: true,
  load: { kind: 'bodyweight', text: 'The portable edge on the floor, or the edge of a stair' },
  progression: 'A thinner edge, then eyes closed, then a slow one-leg rock-over on the edge.',
  protocolId: 'floor-footwork',
  perSide: true,
  note: 'Per foot. Set 1 inside edge, set 2 outside edge (the backstep), set 3 front point. A fingertip on the wall is allowed.',
  focus: 'The edge holds the toe. The heel stays still and low.',
  variations: [
    { minLevel: 1, name: 'Edge Stand - Stair Edge' },
    { minLevel: 3, name: 'Edge Stand - Thin Edge' },
    { minLevel: 5, name: 'Edge Stand - Thin Edge, Rock-Over' },
  ],
  form: {
    setup: 'Shoes on or barefoot. The edge on the floor by a wall, one foot on it at the angle of the set: inside edge, outside edge or the toe tip.',
    execution: 'Weight the foot on the edge and stand still on it, the other foot lightly on the floor. In the last five seconds drive the knee slowly forward over the toe, a small rock-over, and back.',
    cue: 'Edging is ankle stiffness and toe strength: the heel moving is what peels a foot off a small hold. Gresham: the toe is a precision instrument, not a battering ram.',
    breathing: 'Normal.',
    mistakes: 'The heel bouncing. Leaning on the wall. Rolling off the edge to the arch.',
  },
};

// ---- Foot strength --------------------------------------------------------------

export const TOWEL_DRAG: Exercise = {
  id: 'feet-towel-drag',
  name: 'Towel Toe Drag',
  capacities: ['legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 2, work: 8, unit: 'reps', restSec: 45,
  load: { kind: 'bodyweight', text: 'A towel on a smooth floor, a book on the far end' },
  progression: 'A heavier book, then the slow version: three seconds per drag.',
  protocolId: 'foot-strength',
  perSide: true,
  note: 'Per foot. The plate drag at home: the toes pulling, as on a toe or a steep edge.',
  variations: [
    { minLevel: 1, name: 'Towel Toe Drag' },
    { minLevel: 4, name: 'Towel Toe Drag, Slow' },
  ],
  form: {
    setup: 'Seated on a chair, barefoot, a towel flat under the foot with a book on the far end.',
    execution: 'Heel planted, curl the toes into the towel and draw it toward you a little at a time until the book arrives. Spread it out again, then the other foot.',
    cue: 'The big-toe flexor is what stands on and pulls on a small edge, and almost nothing else trains it.',
    breathing: 'Normal and relaxed.',
    mistakes: 'Lifting the heel. Clawing so hard the foot cramps.',
  },
};

export const TOE_EDGE_CALF: Exercise = {
  id: 'feet-toe-edge-calf',
  name: 'Toe-Edge Calf Raise',
  capacities: ['legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 10, unit: 'reps', restSec: 60,
  load: { kind: 'added-kg', value: 0, text: 'Bodyweight, then a backpack' },
  progression: 'Both feet, then one, then a backpack in 2kg steps. Always the full stretch at the bottom.',
  protocolId: 'foot-strength',
  perSide: true,
  note: 'Per leg. Only the toes on the edge: ankle strength through the whole range gets you out of a deep rock-over or a slab smear.',
  focus: 'Push the edge away. Three seconds down to the stretch.',
  variations: [
    { minLevel: 1, name: 'Toe-Edge Calf Raise - Two Feet' },
    { minLevel: 3, name: 'Toe-Edge Calf Raise - One Foot' },
    { minLevel: 5, name: 'Toe-Edge Calf Raise - One Foot, Backpack' },
  ],
  form: {
    setup: 'The balls of the feet on a step, a box edge or the portable edge, heels hanging. A hand flat on the wall for balance, nothing held.',
    execution: 'Rise as high as possible on the toes, pause, then lower for three seconds until the heel is below the edge and the calf is long. One second up.',
    cue: 'The lowering is the part that builds the tendon and the range. A climber who reaches a deep rock-over still has to stand up out of it.',
    breathing: 'Exhale on the way up.',
    mistakes: 'Bouncing at the bottom. Rolling onto the little toes. Cutting the range short.',
  },
};

export const TOE_PULL_BRIDGE: Exercise = {
  id: 'feet-toe-pull-bridge',
  name: 'Toe-Pull Bridge',
  capacities: ['legs', 'tension'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 8, unit: 'reps', restSec: 45,
  load: { kind: 'bodyweight', text: 'The toes on a chair edge or a box' },
  progression: 'Two legs, then one, then a two-second hold at the top with the toes pulling.',
  protocolId: 'hook-strength',
  perSide: true,
  note: "Per leg. The toes, not the heel, on the edge, pulling down and back into it: a toe pull on steep ground (Hooper's).",
  focus: 'Pull the edge toward you with the toes. The hips come up off it.',
  variations: [
    { minLevel: 1, name: 'Toe-Pull Bridge - Two Legs' },
    { minLevel: 3, name: 'Toe-Pull Bridge - One Leg' },
    { minLevel: 5, name: 'Toe-Pull Bridge - One Leg, 2s Hold' },
  ],
  form: {
    setup: 'Lie on your back, knees bent, the balls of the feet and the toes on the edge of a chair seat or a low box, heels off it.',
    execution: 'Press the toes down and pull them back toward you into the edge, then lift the hips until knee, hip and shoulder line up. Lower slowly.',
    cue: 'The big-toe flexor, the calf, the hamstring and the glute in one line: the chain that keeps a foot on when the wall is steep.',
    breathing: 'Exhale on the way up.',
    mistakes: 'Pushing through the heels. Arching the lower back at the top. The edge sliding away.',
  },
};

// ---- Toe hooks -------------------------------------------------------------------

export const TIBIALIS_RAISE: Exercise = {
  id: 'feet-tibialis-raise',
  name: 'Tibialis Wall Raise',
  capacities: ['legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 15, unit: 'reps', restSec: 30,
  load: { kind: 'bodyweight', text: 'Back against a wall, heels out in front' },
  progression: 'Heels further from the wall, then one leg, then a band over the forefoot.',
  protocolId: 'hook-strength',
  note: 'The muscle that holds a toe hook. Two seconds at the top.',
  focus: 'Toes to the ceiling. Hold them there.',
  variations: [
    { minLevel: 1, name: 'Tibialis Wall Raise - Two Legs' },
    { minLevel: 3, name: 'Tibialis Wall Raise - Heels Further Out' },
    { minLevel: 5, name: 'Tibialis Wall Raise - One Leg' },
  ],
  form: {
    setup: 'Lean your back on a wall, heels about 30cm out, legs straight.',
    execution: 'Lift the toes and the front of the feet as high as they go, hold two seconds, lower slowly. Only the ankles move.',
    cue: 'In a toe hook the shin muscle pulls against part of your bodyweight instead of just lifting the foot; it rarely gets trained.',
    breathing: 'Normal.',
    mistakes: 'Sliding down the wall. Bending the knees. Rushing the lowering.',
  },
};

export const TOE_HOOK_SITUP: Exercise = {
  id: 'feet-toe-hook-situp',
  name: 'Toe-Hook Sit-Back',
  capacities: ['tension', 'legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 6, unit: 'reps', restSec: 45,
  load: { kind: 'bodyweight', text: 'The tops of the feet hooked under the radiator or a sofa' },
  progression: 'Lower further back, then a five-second hold at 45 degrees, then arms crossed high on the chest.',
  protocolId: 'hook-strength',
  note: 'It curls: in a morning session it closes it.',
  focus: 'Pull the toes up into the bar. The trunk lowers on that hook.',
  variations: [
    { minLevel: 1, name: 'Toe-Hook Sit-Back - Short Range' },
    { minLevel: 3, name: 'Toe-Hook Sit-Back - 45 Degrees, 5s Hold' },
    { minLevel: 5, name: 'Toe-Hook Sit-Back - Arms High' },
  ],
  form: {
    setup: 'Sit on the mat, knees bent, the tops of the feet hooked under the radiator or the front of a sofa.',
    execution: 'Pull the toes up hard into the hook, then lower the trunk slowly toward 45 degrees, hold, and come back up on the same pull.',
    cue: "The three a toe hook uses together: shin, hip flexors and abs (Hooper's). The hook is what holds you, not the sit-up.",
    breathing: 'Exhale on the way up.',
    mistakes: 'Letting the feet go slack. Dropping back fast. Yanking up with the neck.',
  },
};

// ---- Heel hooks ------------------------------------------------------------------

export const HEEL_HOOK_BRIDGE: Exercise = {
  id: 'feet-heel-hook-bridge',
  name: 'Heel-Hook Bridge Hold',
  capacities: ['legs', 'tension'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 5, unit: 'reps', restSec: 45,
  load: { kind: 'bodyweight', text: 'One heel on a chair edge or a box, five-second holds' },
  progression: 'A straighter knee first. Only weeks later a deeper hip and knee bend, the high heel-hook position.',
  protocolId: 'hook-strength',
  perSide: true,
  note: 'Per leg: five holds of five seconds. Build the angle slowly; the high heel hook is where hamstrings tear.',
  focus: 'Drag the heel down and toward you. The hips rise on it.',
  variations: [
    { minLevel: 1, name: 'Heel-Hook Bridge Hold - Knee at 90' },
    { minLevel: 3, name: 'Heel-Hook Bridge Hold - Straighter Knee' },
    { minLevel: 5, name: 'Heel-Hook Bridge Hold - Deep Hip, Bent Knee' },
  ],
  form: {
    setup: 'Lie on your back, one heel on the edge of a chair seat or a box, the knee at 90 degrees. Turn the hip out so the outer heel bites.',
    execution: 'Pull the heel down into the edge and toward the hips, lift the hips, hold five seconds, lower. Five holds, then the other leg.',
    cue: 'A heel hook asks more of the hamstring and calf than of the heel: the heel steers, the leg pulls (Horst). Isometrics of 2-5 sets of 5s are the physio progression.',
    breathing: 'Breathe through the hold.',
    mistakes: 'Going straight to the deep position. Jerking into the pull. The free knee falling out.',
  },
};

export const SLIDER_CURL: Exercise = {
  id: 'feet-slider-curl',
  name: 'Slider Hamstring Curl',
  capacities: ['legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 6, unit: 'reps', restSec: 60,
  load: { kind: 'bodyweight', text: 'Heels on a towel on a smooth floor' },
  progression: 'Two legs lowering only, then the full curl, then one leg with the heel turned out.',
  protocolId: 'hook-strength',
  note: 'The ball-curl progression for heel hooks, on a towel at home.',
  focus: 'Hips high. The heels pull the floor toward you.',
  variations: [
    { minLevel: 1, name: 'Slider Curl - Two Legs, Lower Only' },
    { minLevel: 3, name: 'Slider Curl - Two Legs' },
    { minLevel: 5, name: 'Slider Curl - One Leg, Heel Turned Out' },
  ],
  form: {
    setup: 'Lie on your back, heels on a folded towel on a smooth floor, knees bent, arms flat by your sides.',
    execution: 'Lift the hips into a bridge, then slide the heels away slowly until the legs are nearly straight, and curl them back in without dropping the hips. Lower only: drop the hips at the end and walk the heels back.',
    cue: 'The last stage turns the hip and knee out so only the outer heel slides: the heel-hook shape under load (Climbing.com, Horst).',
    breathing: 'Exhale as the heels come in.',
    mistakes: 'The hips sagging. Cramping and pushing on through it. Arching the lower back.',
  },
};

// ---- High steps -------------------------------------------------------------------

export const WALL_HIGH_STEP: Exercise = {
  id: 'feet-wall-high-step',
  name: 'Wall High-Step + Load',
  capacities: ['legs', 'mobility'],
  block: 'SECONDARY', intensity: 'TECHNIQUE',
  sets: 3, work: 4, unit: 'reps', restSec: 30,
  fixed: true,
  load: { kind: 'bodyweight', text: 'A chair or box against a wall, hands flat on the wall' },
  progression: 'A higher step, then the step closer to the wall, then a two-second pause halfway up.',
  protocolId: 'foot-loading',
  perSide: true,
  note: 'Per leg. The test that tracks grade best, done as practice: a high foot, then the weight onto it.',
  focus: 'Hips over the foot first. Stand without the floor foot.',
  variations: [
    { minLevel: 1, name: 'Wall High-Step - Low Step' },
    { minLevel: 3, name: 'Wall High-Step - Chair' },
    { minLevel: 5, name: 'Wall High-Step - Chair, Halfway Pause' },
    { minLevel: 7, name: 'Wall High-Step - Chair Tight to the Wall' },
  ],
  form: {
    setup: 'A chair or box with its front against a wall. Face the wall, hands flat on it at shoulder height. Nothing gripped.',
    execution: 'Lift one foot onto the seat as high and close as you can. Move the hips in and over that foot, then stand up on it without pushing off the floor foot, the floor foot trailing light. Lower slowly.',
    cue: 'Among lower-body flexibility tests the foot-loading test, a high foot plus the weight onto it, separates climbing grades best (Draper, r = 0.65); the sit-and-reach does not.',
    breathing: 'Exhale as you stand.',
    mistakes: 'A hop off the floor foot. Standing before the hips arrive. Pulling on the wall instead of resting the hands on it.',
  },
};

export const BOX_LIFT_OFF: Exercise = {
  id: 'feet-box-lift-off',
  name: 'Box Lift-Off',
  capacities: ['mobility', 'legs'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 5, unit: 'reps', restSec: 45,
  load: { kind: 'bodyweight', text: 'A box or chair, a hand flat on the wall' },
  progression: 'Longer holds, then a higher box, then the standing knee straight and tall.',
  protocolId: 'active-range',
  perSide: true,
  note: 'Per leg, three-second holds. Hip-flexor strength at the top of the range.',
  focus: 'Knee to the ceiling. The foot floats off the box.',
  variations: [
    { minLevel: 1, name: 'Box Lift-Off - Low Box' },
    { minLevel: 3, name: 'Box Lift-Off - Chair Height' },
    { minLevel: 5, name: 'Box Lift-Off - High Box, 5s Hold' },
  ],
  form: {
    setup: 'Stand facing a box or chair, a hand flat on a wall beside you. One foot on the box.',
    execution: 'Drive the knee up so the foot lifts off the box, hold it there three seconds, then lower it back onto the box. Tall trunk throughout.',
    cue: 'High steps need the hip flexors strong while they are short. Lifting with no hands is the gap between passive and usable range.',
    breathing: 'Breathe through the hold.',
    mistakes: 'Leaning back to make room. Rounding the back. Hiking the hip.',
  },
};

export const SEATED_LEG_LIFT: Exercise = {
  id: 'feet-seated-leg-lift',
  name: 'Seated Leg Lift',
  capacities: ['tension', 'mobility'],
  block: 'SECONDARY', intensity: 'MODERATE',
  sets: 3, work: 5, unit: 'reps', restSec: 30,
  load: { kind: 'bodyweight', text: 'Seated tall, hands flat beside the knees' },
  progression: 'One leg, then both, then a five-second hold with the hands lifted.',
  protocolId: 'active-range',
  note: 'Three-to-five-second holds. Compression: the hip flexors working deep in flexion.',
  focus: 'Lift the heels off the floor. Sit taller as they rise.',
  variations: [
    { minLevel: 1, name: 'Seated Leg Lift - One Leg' },
    { minLevel: 4, name: 'Seated Leg Lift - Both Legs' },
    { minLevel: 6, name: 'Seated Leg Lift - Both Legs, Hands Up' },
  ],
  form: {
    setup: 'Sit tall on the mat with straight legs, hands flat on the floor beside the knees.',
    execution: 'Lift one straight leg, or both, two to five centimetres off the mat and hold three to five seconds. Lower slowly.',
    cue: 'The iliopsoas works hardest in deep hip flexion when the legs lift, which is where a high foot and compression live.',
    breathing: 'Short breaths, never held.',
    mistakes: 'Leaning back to lift higher. Bending the knees. Pushing hard through the hands.',
  },
};

export const BOX_PISTOL: Exercise = {
  id: 'feet-box-pistol',
  name: 'Box Pistol',
  capacities: ['legs'],
  block: 'SECONDARY', intensity: 'HARD',
  sets: 3, work: 5, unit: 'reps', restSec: 120,
  load: { kind: 'added-kg', value: 0, text: 'Bodyweight; a light weight at the chest at the top rung' },
  progression: 'A lower box every few weeks, then a full pistol, then a goblet pistol.',
  protocolId: 'rockover-strength',
  perSide: true,
  note: 'Per leg. Sit down to the box on one leg and stand up without rocking.',
  focus: 'Sit back to the box. Stand up through the whole foot.',
  variations: [
    { minLevel: 1, name: 'Box Pistol - Chair Height' },
    { minLevel: 3, name: 'Box Pistol - Low Box' },
    { minLevel: 5, name: 'Pistol Squat' },
    { minLevel: 7, name: 'Goblet Pistol Squat', load: 'A light kettlebell or plate at the chest' },
  ],
  form: {
    setup: 'Stand on one leg in front of a chair or box, the other leg out in front, arms forward.',
    execution: 'Lower slowly until you touch the box, pause without relaxing, and stand back up on the same leg. No rocking, no push from the free leg.',
    cue: 'Of all the squats it is the one closest to the high step (Horst): standing up through one leg from deep flexion.',
    breathing: 'Breathe in on the way down, out on the way up.',
    mistakes: 'Dropping onto the box. The knee caving in. Rocking back to get up.',
  },
};

// ---- Drop knees ---------------------------------------------------------------

export const IR_LIFT_OFF: Exercise = {
  id: 'feet-9090-lift',
  name: '90/90 Lift-Off',
  capacities: ['mobility'],
  block: 'MOBILITY', intensity: 'MODERATE',
  sets: 2, work: 6, unit: 'reps', restSec: 20,
  load: { kind: 'bodyweight', text: 'Seated in 90/90, hands flat on the floor' },
  progression: 'Longer holds, then the hands off the floor.',
  protocolId: 'active-range',
  perSide: true,
  note: 'Per side, three-second lifts. Internal-rotation strength for drop knees.',
  focus: 'Lift the back foot. The knee stays down.',
  form: {
    setup: 'Sit in 90/90: front leg turned out, back leg turned in, both knees at 90 degrees, hands flat behind or beside you.',
    execution: 'Lift the back foot and shin off the floor, turning the hip in, and hold three seconds. Lower. Switch sides after the set.',
    cue: 'Without internal rotation a drop knee goes through the knee or the lower back. Strong internal rotators let the hip take it.',
    breathing: 'Normal, exhale on the lift.',
    mistakes: 'Leaning away to cheat height. Lifting the knee instead of the foot.',
  },
};

export const HIP_CARS: Exercise = {
  id: 'feet-hip-cars',
  name: 'Hip CARs, Knee Turned Down',
  capacities: ['mobility'],
  block: 'MOBILITY', intensity: 'EASY',
  sets: 2, work: 3, unit: 'reps', restSec: 15,
  load: { kind: 'bodyweight', text: 'Standing, a hand flat on the wall' },
  progression: 'Slower and bigger circles, then without the wall.',
  protocolId: 'active-range',
  perSide: true,
  note: 'Per leg, three circles each way.',
  form: {
    setup: 'Stand tall on one leg, a hand flat on a wall.',
    execution: 'Lift the knee high, take it out to the side, turn it so the knee points down and the foot goes up behind you, then back to the start. The biggest, slowest circle the hip makes. Reverse.',
    cue: 'Turn the knee down at the bottom as if into a drop knee. Active range: the hip moves itself.',
    breathing: 'Slow and steady.',
    mistakes: 'Twisting the trunk to make the circle bigger. Rushing.',
  },
};

// ---- Flags, stems, wide feet ---------------------------------------------------

export const LATERAL_REACH: Exercise = {
  id: 'feet-lateral-reach',
  name: 'Lateral Foot Reach + Shift',
  capacities: ['legs', 'mobility'],
  block: 'SECONDARY', intensity: 'TECHNIQUE',
  sets: 3, work: 4, unit: 'reps', restSec: 30,
  fixed: true,
  load: { kind: 'bodyweight', text: 'A chair or box to the side, hands flat on a wall' },
  progression: 'Further out, then higher, then a pause halfway across.',
  protocolId: 'foot-loading',
  perSide: true,
  note: 'Per side. Stemming and wide feet: a foot out to the side, then the weight across over it.',
  focus: 'Move the hips across. The far foot does the work.',
  variations: [
    { minLevel: 1, name: 'Lateral Foot Reach - Low and Close' },
    { minLevel: 3, name: 'Lateral Foot Reach - Chair, Wide' },
    { minLevel: 5, name: 'Lateral Foot Reach - Wide, Halfway Pause' },
  ],
  form: {
    setup: 'Face a wall, hands flat on it. A chair or box to one side.',
    execution: 'Step that foot out to the side onto the seat, as high and wide as you can. Move the weight across until the hips sit over it, then stand on it and bring the other foot across. Back the same way.',
    cue: "Draper's lateral foot reach, the climbing measure of the hip opening out, with the load moved over the foot as on the wall.",
    breathing: 'Exhale as the weight moves across.',
    mistakes: 'Pulling on the wall. Moving the weight before the foot is set.',
  },
};

export const ACTIVE_FROG: Exercise = {
  id: 'feet-active-frog',
  name: 'Active Frog + Foot Lifts',
  capacities: ['mobility'],
  block: 'MOBILITY', intensity: 'EASY',
  sets: 2, work: 8, unit: 'reps', restSec: 20,
  load: { kind: 'bodyweight', text: 'On the forearms, knees wide' },
  progression: 'Knees wider, then the hips lower, then longer foot lifts.',
  protocolId: 'active-range',
  note: 'Eight slow rocks, then three lifts of each foot.',
  form: {
    setup: 'On the forearms, knees wide, shins parallel, feet in line with the knees.',
    execution: 'Rock the hips gently back and forward. Then, sitting back a little, lift one foot a few centimetres off the floor and hold two seconds, then the other.',
    cue: 'Turnout is what lets the hips come in to the wall on frog positions and slabs. The foot lifts are the active half.',
    breathing: 'Long exhales into the stretch.',
    mistakes: 'Arching the lower back. Forcing the range. Knees caving in.',
  },
};

export const HIP_AIRPLANE: Exercise = {
  id: 'feet-hip-airplane',
  name: 'Hip Airplane',
  capacities: ['legs', 'tension'],
  block: 'SECONDARY', intensity: 'TECHNIQUE',
  sets: 2, work: 6, unit: 'reps', restSec: 30,
  fixed: true,
  load: { kind: 'bodyweight', text: 'One leg, a fingertip on the wall allowed' },
  progression: 'Bigger turns, then no wall, then a pause at each end.',
  protocolId: 'balance',
  perSide: true,
  note: 'Per leg. Turning the pelvis open and closed over one foot, as in a flag or a backstep.',
  focus: 'Turn the hips like a door on the standing foot.',
  variations: [
    { minLevel: 1, name: 'Hip Airplane - Wall Touch' },
    { minLevel: 3, name: 'Hip Airplane' },
    { minLevel: 5, name: 'Hip Airplane - Pause Each End' },
  ],
  form: {
    setup: 'Stand on one leg, knee soft. Hinge forward until the trunk and the free leg are near level, arms out.',
    execution: 'Turn the pelvis open toward the ceiling, then closed toward the floor, the trunk turning with it over the standing foot. Six turns, then the other leg.',
    cue: 'Single-leg rotation control: the hip turns, not the lower back. A physio drill, picked for the pattern rather than proof on the wall.',
    breathing: 'Slow and steady.',
    mistakes: 'Twisting from the spine. Locking the standing knee. The free leg dropping.',
  },
};

// ---- Leg drive -------------------------------------------------------------------

export const HIGH_FOOT_DRIVE: Exercise = {
  id: 'feet-high-foot-drive',
  name: 'High-Foot Drive + Stick',
  capacities: ['legs', 'contact'],
  block: 'SECONDARY', intensity: 'HARD',
  sets: 3, work: 3, unit: 'reps', restSec: 90,
  load: { kind: 'bodyweight', text: 'A knee-to-hip-height box' },
  progression: 'A higher box, then a two-second stick, then a hop onto a second box.',
  protocolId: 'lower-power',
  perSide: true,
  note: 'Per leg. Only fresh, never on sore legs.',
  focus: 'Explode off the high foot. Land silent and still.',
  variations: [
    { minLevel: 1, name: 'High-Foot Drive - Knee Height' },
    { minLevel: 3, name: 'High-Foot Drive - Hip Height' },
    { minLevel: 5, name: 'High-Foot Drive - Hip Height, Hop + Stick' },
  ],
  form: {
    setup: 'One foot high on a box, the other on the floor, arms back.',
    execution: 'Drive hard through the box foot to stand up tall and hop a little off it, then land on the same foot on the box and stick it for two seconds. Step down, reset.',
    cue: 'Lower-body power predicted men\'s bouldering as much as upper-body power (Augsburg, 2023): dynamic moves start from a high foot.',
    breathing: 'Sharp exhale on the drive.',
    mistakes: 'Pushing off the floor foot. Landing loud. Going on when the reps slow down.',
  },
};

/** Every exercise above, for the library. */
export const FEET_EXERCISES: Exercise[] = [
  STEP_DOWN_MARK, SHIFT_PLACE, EDGE_STAND,
  TOWEL_DRAG, TOE_EDGE_CALF, TOE_PULL_BRIDGE,
  TIBIALIS_RAISE, TOE_HOOK_SITUP,
  HEEL_HOOK_BRIDGE, SLIDER_CURL,
  WALL_HIGH_STEP, BOX_LIFT_OFF, SEATED_LEG_LIFT, BOX_PISTOL,
  IR_LIFT_OFF, HIP_CARS,
  LATERAL_REACH, ACTIVE_FROG, HIP_AIRPLANE,
  HIGH_FOOT_DRIVE,
];
