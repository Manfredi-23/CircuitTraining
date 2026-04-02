// =============================================================================
// data-home.js — HOME mode exercise data
// Equipment: mat, pull-up bar, medium band (no anchor)
// 3 circuits: 01 Push+Core, 02 Pull+Biceps, 03 Legs+Body
// =============================================================================

'use strict';

const DATA_HOME = [

  // ---------------------------------------------------------------------------
  // CIRCUIT 01 — Push + Core
  // ---------------------------------------------------------------------------
  {
    id: 'home-01',
    circuitNum: '01',
    title: 'PUSH + CORE',
    subtitle: 'chest - shoulders - core',
    muscles: ['chest','shoulders','core'],
    illustration: 'assets/home-pushups.png',
    duration: 35,
    rounds: 3,
    exercises: [

      {
        id: 'wide-pushup',
        name: 'Wide Push-Ups',
        muscles: ['chest','shoulders'],
        baseReps: 12,
        baseRest: 60,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Wide Push-Ups' },
          { minLevel: 4, name: 'Archer Push-Ups' },
          { minLevel: 6, name: 'Ring Archer Push-Ups' }
        ],
        form: {
          setup: 'Place hands wider than shoulder-width, fingers pointing slightly outward. Feet together or hip-width. Body forms a straight plank from heels to crown — no hips sagging, no butt in the air.',
          execution: 'Lower your chest toward the floor by bending the elbows out at roughly 45 degrees. Touch the floor or come within a fist-width. Press back to lockout by driving the floor away.',
          cue: 'Squeeze the floor inward without moving your hands — this activates your chest fully and keeps shoulders packed.',
          breathing: 'Inhale on the way down. Exhale forcefully on the push-up phase.',
          mistakes: 'Flared elbows at 90 degrees (shoulder killer). Hips sagging (lazy core). Partial range — chest must reach depth to count. Head dropped forward.'
        }
      },

      {
        id: 'diamond-pushup',
        name: 'Diamond Push-Ups',
        muscles: ['chest','triceps'],
        baseReps: 10,
        baseRest: 60,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Diamond Push-Ups' },
          { minLevel: 4, name: 'Close-Grip Ring Push-Ups' }
        ],
        form: {
          setup: 'Form a diamond shape with thumbs and index fingers touching, hands centered under your sternum. Full plank position — rigid body.',
          execution: 'Lower your chest directly to your hands while keeping elbows close to your ribs. Press up to full extension. Do not let elbows wing out.',
          cue: 'Try to "break the diamond" apart — this activates the triceps maximally throughout the movement.',
          breathing: 'Inhale on descent, exhale on the push. Keep core braced throughout.',
          mistakes: 'Hands placed too far forward (loses tricep emphasis). Elbows flaring outward. Short range of motion — touch the diamond with your chest.'
        }
      },

      {
        id: 'decline-pushup',
        name: 'Decline Push-Ups',
        muscles: ['chest','shoulders'],
        baseReps: 10,
        baseRest: 60,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Decline Push-Ups' },
          { minLevel: 4, name: 'Deficit Decline Push-Ups' }
        ],
        form: {
          setup: 'Place feet on a chair, couch, or wall — hips at roughly 30-45 degrees elevation. Hands at shoulder-width or slightly wider. Full body plank, not a pike.',
          execution: 'Lower your forehead toward the floor by bending at the elbow. Press back up through the upper chest. The decline angle shifts emphasis to upper pecs and front deltoids.',
          cue: 'Pull your shoulder blades together at the top of each rep — this protects the shoulder and finishes the contraction properly.',
          breathing: 'Slow controlled inhale going down. Sharp exhale driving up.',
          mistakes: 'Hips sagging due to too-tall elevation. Head dropping first before the chest. Rushing through the eccentric — the descent earns the adaptation.'
        }
      },

      {
        id: 'pike-pushup',
        name: 'Pike Push-Ups',
        muscles: ['shoulders','core'],
        baseReps: 10,
        baseRest: 60,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Pike Push-Ups' },
          { minLevel: 4, name: 'Deficit Pike Push-Ups' }
        ],
        form: {
          setup: 'Start in downward dog position — hips high, arms and legs straight, body forming an inverted V. Hands shoulder-width, fingers spread.',
          execution: 'Bend your elbows to lower the crown of your head toward the floor between your hands. Press back up to the inverted V. This mimics an overhead press pattern.',
          cue: 'Drive your hips up and back as you press — resist the temptation to let the hips drop as fatigue sets in.',
          breathing: 'Inhale on descent. Exhale on the press. Keep your neck neutral — look at your feet.',
          mistakes: 'Hips dropping as fatigue hits — turns the exercise into a regular push-up. Head not reaching depth. Arms too wide, which reduces the overhead stimulus.'
        }
      },

      {
        id: 'hollow-body',
        name: 'Hollow Body Hold',
        muscles: ['core'],
        baseReps: 30,
        baseRest: 45,
        unit: 'sec',
        variations: [
          { minLevel: 1, name: 'Hollow Body Hold' },
          { minLevel: 4, name: 'Hollow Body Rocks' },
          { minLevel: 6, name: 'V-Ups' }
        ],
        form: {
          setup: 'Lie on your back. Press your lower back into the floor — this is non-negotiable. Arms extend overhead, legs extend long. Lift both off the floor slightly — only as far as you can keep the lower back flat.',
          execution: 'Maintain the position. If lower back lifts, raise legs higher or bend knees. Every second of proper position counts. Rocks: gently rock forward and back while maintaining the shape.',
          cue: 'Exhale all your air and crush the belly button toward your spine. This is your "hollow" position. Now hold it.',
          breathing: 'Short, controlled breaths — the exhale helps maintain hollow. Do not gasp or let ribs flare.',
          mistakes: 'Lower back arching off the floor — completely eliminates core engagement. Arms held too low. Holding breath until red-faced.'
        }
      },

      {
        id: 'plank-k2e',
        name: 'Plank Knee-to-Elbow',
        muscles: ['core','obliques'],
        baseReps: 16,
        baseRest: 45,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Plank Knee-to-Elbow' },
          { minLevel: 4, name: 'Plank Knee-to-Elbow 3s Tempo' }
        ],
        form: {
          setup: 'High plank — arms straight, hands below shoulders. Body is a rigid plank. Feet hip-width. Engage core before any movement.',
          execution: 'Drive one knee toward the same-side elbow, rotating at the oblique. Return to plank. Alternate sides. Each touch = one rep. Do not let the hip drop or the opposite hip hike.',
          cue: 'Think of trying to bring your hip to your armpit — this fires the oblique rather than just the hip flexor.',
          breathing: 'Exhale as you drive the knee in. Inhale as you return.',
          mistakes: 'Hips rising into a pike as the knee comes in. Letting the planted foot drag — stay on the ball of that foot. Moving too fast — tempo is where the challenge lives.'
        }
      },

      {
        id: 'dead-bug',
        name: 'Dead Bug',
        muscles: ['core'],
        baseReps: 16,
        baseRest: 45,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Dead Bug' },
          { minLevel: 4, name: 'Dead Bug with Band Resistance' }
        ],
        form: {
          setup: 'Lie on back. Arms vertical toward ceiling. Hips and knees both at 90 degrees (table-top legs). Press your lower back firmly into the floor and do not let it leave.',
          execution: 'Simultaneously lower the opposite arm overhead and the opposite leg toward the floor — slow and controlled. Stop before the lower back lifts. Return. Alternate sides. 1 rep = one left+right cycle.',
          cue: 'Imagine someone is pulling a string attached to your navel toward the floor. That resistance is your entire job.',
          breathing: 'Exhale fully as you extend. Inhale to return. This is also a breathing exercise — use it.',
          mistakes: 'Lower back lifting — the single most common error. Stop the range of motion before it happens. Moving both limbs on the same side (that is not a dead bug). Rushing.'
        }
      }

    ]
  },

  // ---------------------------------------------------------------------------
  // CIRCUIT 02 — Pull + Biceps
  // ---------------------------------------------------------------------------
  {
    id: 'home-02',
    circuitNum: '02',
    title: 'PULL + BICEPS',
    subtitle: 'back - biceps - grip',
    muscles: ['back','biceps','grip'],
    illustration: 'assets/home-pullups.png',
    duration: 35,
    rounds: 3,
    exercises: [

      {
        id: 'pullup',
        name: 'Pull-Ups',
        muscles: ['back','biceps','grip'],
        baseReps: 5,
        baseRest: 90,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Pull-Ups' },
          { minLevel: 4, name: 'Pull-Ups 4s Negative' },
          { minLevel: 6, name: 'Typewriter Pull-Ups' }
        ],
        form: {
          setup: 'Hang from the bar with a pronated grip (palms away), hands just outside shoulder-width. Full dead hang — shoulders packed, arms completely straight. No swinging.',
          execution: 'Pull your elbows down and back, driving your chest toward the bar. Clear the bar with your chin. Lower under full control to a complete dead hang. Do not kip unless prescribed.',
          cue: 'Think "elbows to your back pockets" — this cue engages lats and prevents the bicep-dominant cheat pull.',
          breathing: 'Exhale on the pull up. Inhale on the controlled descent. Never hold breath — this is a high-demand exercise.',
          mistakes: 'Partial range — must start from full dead hang. Kipping when strength is the goal. Shrugging the shoulders up at the top. Chin barely clearing. Rushing the descent.'
        }
      },

      {
        id: 'widegrip-pullup',
        name: 'Wide-Grip Pull-Ups',
        muscles: ['back','grip'],
        baseReps: 4,
        baseRest: 90,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Wide-Grip Pull-Ups' },
          { minLevel: 4, name: 'Wide-Grip 3s Pause at Top' }
        ],
        form: {
          setup: 'Hands 1.5-2x shoulder-width in pronated grip. Initiate with a shoulder pack — pull shoulder blades together and down before moving.',
          execution: 'Drive elbows down and wide. Your chest leads toward the bar, not your chin. Hold the top position briefly. Lower slowly.',
          cue: 'At the top, try to bend the bar — this flares lats and locks in maximum contraction before the descent.',
          breathing: 'Sharp exhale at initiation. Slow inhale on descent. Focus on the breath rhythm to control tempo.',
          mistakes: 'Arms too wide — loses lat engagement and stresses shoulder. Chin-leading instead of chest-leading. No shoulder pack at the start — the most injurious mistake here.'
        }
      },

      {
        id: 'chinup',
        name: 'Chin-Ups',
        muscles: ['biceps','back'],
        baseReps: 6,
        baseRest: 75,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Chin-Ups' },
          { minLevel: 4, name: 'Chin-Ups 4s Negative' },
          { minLevel: 6, name: 'Weighted Chin-Ups' }
        ],
        form: {
          setup: 'Supinated grip (palms facing you), hands shoulder-width or slightly narrower. Full dead hang start.',
          execution: 'Pull until chin clears bar. The supinated grip naturally involves biceps more than pull-ups. Lower with deliberate control — fight gravity on the way down.',
          cue: 'At the bottom of each rep, flex your biceps consciously before pulling again. This pre-tensions the muscle and reduces the chance of passive tendon loading.',
          breathing: 'Exhale pulling up, inhale going down. Keep core engaged throughout — this is not a "hang and jerk" movement.',
          mistakes: 'Head jutting forward to clear the bar. Not reaching full hang. Swinging hips for momentum. Neglecting the eccentric — the descent is where bicep strength is built.'
        }
      },

      {
        id: 'iso-chin-hold',
        name: 'Isometric Chin Hold',
        muscles: ['biceps','back','grip'],
        baseReps: 3,
        baseRest: 60,
        unit: 'reps',
        tempo: '8s hold',
        variations: [
          { minLevel: 1, name: 'Isometric Chin Hold 5s' },
          { minLevel: 4, name: 'Isometric Chin Hold 8s + Super-Slow Negative' }
        ],
        form: {
          setup: 'Chin-up grip. Pull up to the top position with chin over bar. Pause here.',
          execution: 'Hold the top position for the prescribed time. Then lower yourself with a super-slow controlled negative (8s down). Keep everything engaged — no passive hanging.',
          cue: 'Actively squeeze the bar, flex lats, and press the upper arms toward your torso simultaneously. This isometric intensity far exceeds any dynamic rep for neural adaptation.',
          breathing: 'Breathe carefully and rhythmically while holding. Exhale gradually during the super-slow descent.',
          mistakes: 'Hanging passively at the top — you must be actively contracting. Letting the descent become uncontrolled past 3-4 seconds. Holding breath the entire time.'
        }
      },

      {
        id: 'band-row',
        name: 'Band Row',
        muscles: ['back','biceps'],
        baseReps: 15,
        baseRest: 60,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Band Row' }
        ],
        form: {
          setup: 'Hold band in both hands, anchored under feet or held taut in front. Hinge forward at the hips to about 45 degrees. Slight knee bend. Core braced, back flat.',
          execution: 'Pull the band toward your lower ribcage, driving elbows back and squeezing shoulder blades together at the end of the row. Lower with control.',
          cue: 'Lead the pull with your elbow, not your hand. The hands are just hooks — the elbow is the engine.',
          breathing: 'Exhale on the pull, inhale on the return. Maintain the hinge position throughout — do not stand up as fatigue sets in.',
          mistakes: 'Rounding the lower back. Standing up during the set. Pulling with the arms without engaging the lats. Not squeezing the shoulder blades at the end range.'
        }
      },

      {
        id: 'dead-hang',
        name: 'Dead Hang',
        muscles: ['grip','forearms','fingers'],
        baseReps: 45,
        baseRest: 60,
        unit: 'sec',
        variations: [
          { minLevel: 1, name: 'Dead Hang' },
          { minLevel: 4, name: 'Dead Hang 3-Grip Rotation' }
        ],
        form: {
          setup: 'Grab bar with a comfortable overhand grip. Relax your shoulders to full hang — let them shrug up passively. Then pack them down. Find the active hang position.',
          execution: 'Simply hang. Focus on grip. For the rotation variation: alternate between overhand, neutral, and underhand every 15 seconds without coming off the bar.',
          cue: 'Think about trying to "bend" the bar apart — this activates the lats passively and makes the hang a full upper-back exercise, not just a grip drill.',
          breathing: 'Normal rhythmic breathing. This is a duration exercise — manage your breath to stay relaxed.',
          mistakes: 'Passive hang with no shoulder engagement (shrug-hanging stresses the AC joint over time). Letting go before the timer. Clenching jaw and neck — keep the upper body relaxed except the hands.'
        }
      }

    ]
  },

  // ---------------------------------------------------------------------------
  // CIRCUIT 03 — Legs + Body
  // ---------------------------------------------------------------------------
  {
    id: 'home-03',
    circuitNum: '03',
    title: 'LEGS + BODY',
    subtitle: 'legs - glutes - core',
    muscles: ['legs','glutes','core'],
    illustration: 'assets/home-squats.png',
    duration: 35,
    rounds: 3,
    exercises: [

      {
        id: 'bulgarian-split',
        name: 'Bulgarian Split Squat',
        muscles: ['legs','glutes'],
        baseReps: 10,
        baseRest: 75,
        unit: 'reps',
        note: 'Per leg',
        variations: [
          { minLevel: 1, name: 'Bulgarian Split Squat' },
          { minLevel: 4, name: 'KB Bulgarian Split Squat' },
          { minLevel: 6, name: 'TRX Pistol Squat' }
        ],
        form: {
          setup: 'Rear foot elevated on a chair or couch, roughly knee height. Front foot far enough forward that when you lunge down, your shin stays roughly vertical. Torso upright.',
          execution: 'Lower the rear knee toward the floor by bending the front knee and hip. Keep the torso upright — do not lean forward excessively. Press through the front heel to return.',
          cue: 'On the way up, think "drive the floor down through my heel" — this recruits glutes over quads and develops climbing-specific hip extension.',
          breathing: 'Inhale on descent, exhale on the drive up. Count the reps — asymmetric exercises need to be balanced exactly between legs.',
          mistakes: 'Front shin going far past the toes (often means front foot too close). Torso collapsing forward. Rear knee banging the floor. Using arms to push off the chair between reps.'
        }
      },

      {
        id: 'squat-pulse',
        name: 'Squat Pulse',
        muscles: ['legs','glutes'],
        baseReps: 20,
        baseRest: 60,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Squat Pulse' },
          { minLevel: 4, name: 'Jump Squats' }
        ],
        form: {
          setup: 'Stand with feet shoulder-width, toes pointing slightly out (15-30 degrees). Hands can be clasped in front. Brace core before every rep.',
          execution: 'Lower to parallel or below. At the bottom, perform small pulses (5-10cm) for the prescribed count. Pulses keep tension constant on quads and glutes without the full rep recovery.',
          cue: 'Keep chest up and knees tracking over toes throughout. The burn is the point — do not stand up to rest.',
          breathing: 'Breathe rhythmically in the pulse position. Short controlled breaths — do not hold breath in a compressed position.',
          mistakes: 'Heels lifting (needs ankle mobility work or heel elevation). Knees caving inward. Sitting up between pulses — no rest at top. Too shallow — pulses below parallel are far more effective.'
        }
      },

      {
        id: 'band-good-morning',
        name: 'Band Good Mornings',
        muscles: ['legs','glutes','back'],
        baseReps: 15,
        baseRest: 60,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Band Good Mornings' }
        ],
        form: {
          setup: 'Stand on the center of the band, both feet hip-width. Loop the other end around your neck and shoulders (or hold at shoulders with hands). Slight knee bend, back flat.',
          execution: 'Hinge at the hips — push your hips back while keeping the back straight and chest tall. Lower until you feel a strong hamstring stretch. Drive the hips forward to return.',
          cue: 'Hinge, don\'t bend. The difference: in a hinge, the chest stays proud and back flat. In a bend, the spine rounds. Protect the spine by thinking "chest to wall ahead of you."',
          breathing: 'Inhale on the hinge back, exhale as you drive hips forward.',
          mistakes: 'Rounding the lower back at the bottom. Bending the knees too much (turns into a squat). Not going deep enough to feel the hamstrings.'
        }
      },

      {
        id: 'russian-twist',
        name: 'Russian Twists',
        muscles: ['core','obliques'],
        baseReps: 20,
        baseRest: 45,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Russian Twists' },
          { minLevel: 4, name: 'Weighted Russian Twists' }
        ],
        form: {
          setup: 'Sit on floor. Lean torso back 45 degrees. Feet on floor (easier) or elevated 30cm (harder). Arms extended forward, hands together or holding a weight.',
          execution: 'Rotate torso side to side, touching the floor (or weight) beside each hip. One left + one right = one rep. Keep the lean constant — do not sit upright between reps.',
          cue: 'Rotate from the ribs, not the arms. If you are mostly moving your hands, you are missing the oblique contraction. Feel the side of your torso twisting.',
          breathing: 'Exhale on each twist. Short punchy breaths help create intra-abdominal pressure and protect the spine.',
          mistakes: 'Torso coming upright between reps (lost the oblique emphasis). Moving only the arms without trunk rotation. Feet on the floor making it too easy — elevate them.'
        }
      },

      {
        id: 'glute-bridge',
        name: 'Glute Bridge Hold',
        muscles: ['glutes','core'],
        baseReps: 12,
        baseRest: 45,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Glute Bridge Hold' },
          { minLevel: 4, name: 'Single-Leg Glute Bridge' }
        ],
        form: {
          setup: 'Lie on back. Feet hip-width, flat on floor, heels about 30cm from glutes. Arms at sides. Press lower back slightly into the floor to start.',
          execution: 'Drive through heels to lift hips until body forms a straight line from knees to shoulders. Squeeze glutes hard at the top and hold for 2 counts. Lower with control.',
          cue: 'Dig your heels into the floor and try to drag them toward your glutes — this fires the hamstrings as a synergist and creates a more complete posterior chain contraction.',
          breathing: 'Exhale on the lift, inhale on the descent. Squeeze and hold for 2 seconds at top before lowering.',
          mistakes: 'Hips not reaching full extension. Knees falling outward at the top. Dropping hips too quickly — the eccentric matters. Lower back overextending instead of glutes doing the work.'
        }
      }

    ]
  }

];
