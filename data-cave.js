// =============================================================================
// data-cave.js — CAVE mode exercise data (the Paincave / Minimum gym)
// Equipment: KB 12kg, DB, rings, TRX, campus board, hangboard, bands+anchors
// 3 circuits: 01 Push+Core, 02 Pull+Biceps, 03 Legs+Body
// =============================================================================

'use strict';

const DATA_CAVE = [

  // ---------------------------------------------------------------------------
  // CIRCUIT 01 — Push + Core
  // ---------------------------------------------------------------------------
  {
    id: 'cave-01',
    circuitNum: '01',
    title: 'PUSH + CORE',
    subtitle: 'chest - shoulders - triceps',
    muscles: ['chest','shoulders','triceps','core'],
    illustration: 'assets/cave-kettlebell.png',
    duration: 45,
    rounds: 3,
    exercises: [

      {
        id: 'ring-pushup',
        name: 'Ring Push-Ups',
        muscles: ['chest','triceps','core'],
        baseReps: 12,
        baseRest: 60,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Ring Push-Ups' },
          { minLevel: 4, name: 'Ring Push-Ups Feet Elevated' },
          { minLevel: 6, name: 'Ring Archer Push-Ups' }
        ],
        form: {
          setup: 'Rings set just above floor height. Hands in rings shoulder-width. Full plank position — body straight from heels to head. This is unstable: brace everything.',
          execution: 'Lower chest to rings, allowing rings to rotate naturally — hands will turn slightly inward at the bottom. Press up, turning hands outward at top (the "turn out"). Lockout with rings turned out is the signature ring push-up finish.',
          cue: 'At the top, try to turn your rings out until your palms face forward. This engages the pec minor and serratus and protects the shoulder.',
          breathing: 'Exhale on the push. Inhale going down. The ring instability demands constant core tension — maintain it through every breath.',
          mistakes: 'Rings too high (becomes easy, loses chest contact). Not turning out at the top. Hips sagging — the instability punishes this severely. Wrists bent instead of neutral.'
        }
      },

      {
        id: 'kb-floor-press',
        name: 'KB Floor Press',
        muscles: ['chest','triceps','shoulders'],
        baseReps: 12,
        baseRest: 60,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'KB Floor Press' },
          { minLevel: 4, name: 'KB Floor Press 4s Negative' }
        ],
        form: {
          setup: 'Lie on back. One KB in each hand (or one held in both for bilateral). Elbows at about 45 degrees from torso, upper arms resting on the floor. Wrists straight.',
          execution: 'Press the KB(s) straight up to lockout. Lower under control until upper arms contact the floor again. Pause briefly. The floor contact is a natural range limiter — use it as a reset, not a bounce.',
          cue: 'Screw your elbows toward your feet as you press — this creates shoulder rotation that protects the joint and increases pressing power.',
          breathing: 'Exhale at the press top. Inhale at the bottom. Controlled at all phases.',
          mistakes: 'Bouncing off the floor instead of pausing. Wrists bending back under the load. Elbows flaring to 90 degrees. Not reaching full lockout at the top.'
        }
      },

      {
        id: 'arnold-press',
        name: 'Arnold Press',
        muscles: ['shoulders','triceps'],
        baseReps: 12,
        baseRest: 60,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Arnold Press' },
          { minLevel: 4, name: 'KB Single-Arm Press' }
        ],
        form: {
          setup: 'Seated or standing. Start with DBs at shoulder height, palms facing you (as if the top of a curl). Elbows in front of body.',
          execution: 'As you press up, rotate the palms outward so that at the top, palms face away. Lower in the same rotation pattern — rotates inward as you descend. This hits all three delt heads through the full range.',
          cue: 'Think of the rotation as the secret ingredient — most people rush through it. The rotation itself is as important as the press.',
          breathing: 'Exhale on the press. Inhale on the controlled descent. Keep core tight if standing.',
          mistakes: 'No rotation — just a standard shoulder press. Going too heavy (sacrifices the rotation). Arching the lower back when pressing overhead.'
        }
      },

      {
        id: 'band-pallof',
        name: 'Band Pallof Press',
        muscles: ['core','obliques'],
        baseReps: 12,
        baseRest: 45,
        unit: 'reps',
        note: 'Per side',
        minLevel: 5,
        variations: [
          { minLevel: 5, name: 'Band Pallof Press' }
        ],
        form: {
          setup: 'Band anchored at chest height to the side. Stand perpendicular to the anchor, feet shoulder-width. Hold the band with both hands at your chest. There will be rotational pull from the anchor — resist it.',
          execution: 'Press your hands straight out in front of your chest to full arm extension. Hold 1-2 seconds. Return hands to chest. The challenge is NOT rotating toward the anchor.',
          cue: 'The Pallof Press is an anti-rotation exercise. You are training your core to resist movement, not produce it. Breathe normally and squeeze hard to stay square.',
          breathing: 'Exhale as you press out. Inhale as you return. Keep breathing — tension should be in the core, not the breath.',
          mistakes: 'Rotating toward the anchor (missing the entire point). Feet too close (reduces the rotational challenge). Using band too light (should feel the pull clearly).'
        }
      },

      {
        id: 'trx-pike',
        name: 'TRX Pike',
        muscles: ['core','shoulders'],
        baseReps: 10,
        baseRest: 60,
        unit: 'reps',
        minLevel: 5,
        variations: [
          { minLevel: 5, name: 'TRX Pike' }
        ],
        form: {
          setup: 'Feet in TRX straps, body in plank position. Arms straight, hands below shoulders on floor. Full plank — do not sag.',
          execution: 'Drive hips straight up to the ceiling, pulling feet toward hands, forming an inverted V (like a downward dog). Lower back to plank.',
          cue: 'The hips lead this movement. Think: squeeze your abs, then let the hips float up. The hip flexors and core do all the work — arms are stable anchors.',
          breathing: 'Exhale on the pike up. Inhale on the plank return. Control the descent — the eccentric is where this exercise builds core strength.',
          mistakes: 'Bending knees (loses the core demand). Hips only going halfway up. Losing plank position on the return. Moving too fast — slow controlled pikes are far more effective.'
        }
      },

      {
        id: 'hollow-body-cave',
        name: 'Hollow Body Rocks',
        muscles: ['core'],
        baseReps: 15,
        baseRest: 45,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Hollow Body Hold' },
          { minLevel: 4, name: 'Hollow Body Rocks' },
          { minLevel: 6, name: 'V-Ups' }
        ],
        form: {
          setup: 'Lie on back. Lower back pressed to floor. Arms overhead, legs extended and slightly elevated. Lift into the hollow body position.',
          execution: 'Maintain the banana shape and rock forward and backward using momentum — but keep the shape. Do not lose the lower back contact during the forward rock.',
          cue: 'The shape is the exercise. If the shape breaks, the rock is useless. Think of yourself as a rigid wooden rocker — no flex in the middle.',
          breathing: 'Rhythmic breathing — exhale on the forward rock. Keep lower back connected to the floor on the forward portion.',
          mistakes: 'Back arching off the floor. Rocking only from the hips rather than the whole body. Letting legs drop too low. Losing tension between reps.'
        }
      }

    ]
  },

  // ---------------------------------------------------------------------------
  // CIRCUIT 02 — Pull + Biceps
  // ---------------------------------------------------------------------------
  {
    id: 'cave-02',
    circuitNum: '02',
    title: 'PULL + BICEPS',
    subtitle: 'back - biceps - grip',
    muscles: ['back','biceps','grip'],
    illustration: 'assets/cave-dumbbell.png',
    duration: 45,
    rounds: 3,
    exercises: [

      {
        id: 'ring-pullup',
        name: 'Ring Pull-Ups',
        muscles: ['back','biceps','grip'],
        baseReps: 5,
        baseRest: 90,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'Ring Pull-Ups' },
          { minLevel: 4, name: 'Ring Pull-Ups False Grip' }
        ],
        form: {
          setup: 'Rings set at height for full dead hang. Grip rings with palms facing each other (neutral grip). Full dead hang. Rings will be unstable — brace core.',
          execution: 'Pull chest to rings. At the top, turn rings out and attempt to get chest between hands. Lower with control. The neutral grip hits biceps and brachialis heavily.',
          cue: 'The ring instability forces your rotator cuff and smaller shoulder stabilizers to work throughout. Do not rush the descent — this is where the real strength adaptation happens.',
          breathing: 'Exhale on the pull, controlled inhale on descent.',
          mistakes: 'Letting rings swing wildly (poor control). Partial range. Not completing the turn-out at top. Coming off the rings too quickly at the bottom.'
        }
      },

      {
        id: 'kb-gorilla-row',
        name: 'KB Gorilla Row',
        muscles: ['back','biceps'],
        baseReps: 10,
        baseRest: 75,
        unit: 'reps',
        note: 'Per arm',
        variations: [
          { minLevel: 1, name: 'KB Gorilla Row' },
          { minLevel: 4, name: 'KB Single-Arm Row with Pause' }
        ],
        form: {
          setup: 'Two KBs on floor. Hinge forward, grabbing both handles, with hips high and back flat. This gorilla position is the start. Feet outside the KBs, knees slightly bent.',
          execution: 'Row one KB toward your hip while the other stays on the floor as an anchor. Elbow drives back past the torso. Lower with control. Alternate, or complete reps on one side first.',
          cue: 'At the top of each row, try to put your elbow through the wall behind you. This achieves full lat shortening and maximizes the rowing stimulus.',
          breathing: 'Exhale on the row, inhale on the return. Hold the hinge position — do not stand up between reps.',
          mistakes: 'Rotating the torso to row higher (cheating the range). Letting the planted KB tip over. Pulling with the arm without engaging the lat. Lower back rounding.'
        }
      },

      {
        id: 'kb-hammer-curl',
        name: 'KB Hammer Curl',
        muscles: ['biceps','forearms'],
        baseReps: 12,
        baseRest: 60,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'KB Hammer Curl' },
          { minLevel: 4, name: 'Ring Curls' }
        ],
        form: {
          setup: 'Stand tall, KB in each hand with neutral grip (thumbs forward). Upper arms pinned to torso — they do not move.',
          execution: 'Curl the KBs by flexing at the elbow only. Forearms travel from fully extended to fully flexed. The neutral grip targets the brachialis and brachioradialis — important climbing muscles.',
          cue: 'Keep upper arms like fence posts — stationary. Everything happens below the elbow. Think of the forearm as a lever being pulled up by the muscle.',
          breathing: 'Exhale curling up, inhale on the eccentric. The eccentric is as important as the concentric for tendon adaptation.',
          mistakes: 'Swinging the torso to assist (elbow cheating). Partial range at top or bottom. Upper arms swinging forward. Moving too fast — slow controlled curls outperform rushed ones for hypertrophy.'
        }
      },

      {
        id: 'kb-crush-curl',
        name: 'KB Crush Curl',
        muscles: ['biceps','forearms','grip'],
        baseReps: 10,
        baseRest: 60,
        unit: 'reps',
        minLevel: 5,
        variations: [
          { minLevel: 5, name: 'KB Crush Curl' }
        ],
        form: {
          setup: 'Hold one KB horizontally by pressing both palms against the sides of the bell (not the handle). This demands constant isometric grip tension to keep the KB from falling.',
          execution: 'Curl the KB while maintaining the lateral press (do not let the bell slip). Squeeze hard through the entire range. The grip component here is unique and transfers directly to rock climbing.',
          cue: 'Crush the KB like you are trying to dent it. The lateral pressing force activates intrinsic forearm muscles that no normal curl variation reaches.',
          breathing: 'Exhale on the curl. Breathe through the effort — the grip demand makes breath-holding tempting but counterproductive.',
          mistakes: 'Not squeezing laterally (KB slides, defeats the purpose). Going too heavy. Rushing the eccentric — the forearm demand is in the lowering phase.'
        }
      },

      {
        id: 'band-lat-pulldown',
        name: 'Band Lat Pulldown',
        muscles: ['back','biceps'],
        baseReps: 15,
        baseRest: 60,
        unit: 'reps',
        minLevel: 5,
        variations: [
          { minLevel: 5, name: 'Band Lat Pulldown' }
        ],
        form: {
          setup: 'Anchor band high above (door frame, rack, rings). Grab band with both hands wider than shoulder-width. Can be kneeling or seated for better lat isolation.',
          execution: 'Pull elbows down and back, driving your chest forward slightly as you pull. End with elbows at ribs and hands near shoulders. Squeeze lats. Control the return.',
          cue: 'Think of pulling your shoulder blades into your back pockets — this is the lat contraction you want, not just "pulling your elbows down."',
          breathing: 'Exhale on the pull. Inhale on the controlled return. Slight chest-forward lean at the bottom helps achieve full lat contraction.',
          mistakes: 'Using momentum/swinging. Not achieving full contraction (elbows not reaching ribs). Shrugging shoulders on the way up. Too light a band.'
        }
      },

      {
        id: 'kb-bottom-up',
        name: 'KB Bottom-Up Hold',
        muscles: ['grip','forearms','shoulders'],
        baseReps: 30,
        baseRest: 60,
        unit: 'sec',
        note: 'Per arm',
        variations: [
          { minLevel: 1, name: 'KB Bottom-Up Hold' },
          { minLevel: 4, name: 'KB Bottom-Up Press' }
        ],
        form: {
          setup: 'Clean the KB to a rack position. Then flip it so the bell faces up (bottom-up). The handle is vertical in your hand. This requires intense grip and wrist strength to keep upright.',
          execution: 'Hold the bottom-up position at shoulder height for the prescribed time. For press variation: press overhead while maintaining the upright position, then lower.',
          cue: 'The whole point is the instability — squeeze the handle as hard as you physically can. If the KB tips, it will tell you exactly which wrist and forearm positions are weak.',
          breathing: 'Controlled breathing throughout. The effort to keep the KB upright is constant — never relax the grip.',
          mistakes: 'Starting too heavy (12kg KB is very hard for this). Letting the wrist deviate. Locking the elbow out completely on the hold (leaves no engagement room).'
        }
      }

    ]
  },

  // ---------------------------------------------------------------------------
  // CIRCUIT 03 — Legs + Body
  // ---------------------------------------------------------------------------
  {
    id: 'cave-03',
    circuitNum: '03',
    title: 'LEGS + BODY',
    subtitle: 'legs - glutes - posterior chain',
    muscles: ['legs','glutes','back'],
    illustration: 'assets/cave-barbell.png',
    duration: 45,
    rounds: 3,
    exercises: [

      {
        id: 'kb-goblet-squat',
        name: 'KB Goblet Squat',
        muscles: ['legs','glutes','core'],
        baseReps: 12,
        baseRest: 75,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'KB Goblet Squat' },
          { minLevel: 4, name: 'KB Goblet Squat Tempo (3s down)' }
        ],
        form: {
          setup: 'Hold KB vertically at chest height, both hands cupping the sides of the bell. Feet shoulder-width, toes pointed slightly out. Chest tall, core braced.',
          execution: 'Squat down pushing knees out in the direction of toes. Aim to keep torso as upright as possible — the goblet position helps. Descend to parallel or below. Drive through heels to stand.',
          cue: 'Use the KB as a counterbalance — let it help you sit deeper. The weight in front actually makes it easier to stay upright, so go deeper than you think you can.',
          breathing: 'Inhale on the descent. Exhale forcefully on the drive up.',
          mistakes: 'Knees caving in (most common). Heel rising off floor. Forward lean turning it into a good morning. Depth too shallow — below parallel is the goal.'
        }
      },

      {
        id: 'kb-romanian-dl',
        name: 'KB Romanian Deadlift',
        muscles: ['legs','glutes','back'],
        baseReps: 12,
        baseRest: 75,
        unit: 'reps',
        variations: [
          { minLevel: 1, name: 'KB Romanian Deadlift' },
          { minLevel: 4, name: 'KB Single-Leg Romanian Deadlift' }
        ],
        form: {
          setup: 'Stand with KBs hanging in front of thighs, shoulder-width grip. Slight bend in knees (soft, not squatting). Shoulder blades packed. Back flat.',
          execution: 'Hinge at the hips — push them backward, lowering the KBs along the legs until you feel a strong hamstring stretch. The KBs pass your knees and reach roughly mid-shin. Drive hips forward to return.',
          cue: 'Imagine a wall behind you that you are trying to touch with your hips. This keeps the hinge pattern correct and prevents it drifting into a squat.',
          breathing: 'Inhale on the hinge back, exhale on the drive up. Brace core firmly on the reversal.',
          mistakes: 'Rounding the lower back at the bottom (the most injury-prone mistake). Letting the KBs swing away from the body. Bending the knees too much. Not hinging deep enough to feel the hamstrings.'
        }
      },

      {
        id: 'kb-swing',
        name: 'KB Swing',
        muscles: ['glutes','legs','back','core'],
        baseReps: 20,
        baseRest: 60,
        unit: 'reps',
        minLevel: 5,
        variations: [
          { minLevel: 5, name: 'KB Swing' }
        ],
        form: {
          setup: 'KB on floor about 30cm in front of feet. Feet slightly wider than shoulder-width, toes slightly out. Hinge to grab the handle with both hands. Back flat, lats engaged.',
          execution: 'Hike the KB back between your legs — like a center snap — then drive the hips explosively forward, letting the KB float to shoulder height. Do not pull with the arms. The hip extension is the engine. Let it fall back through the hike again.',
          cue: 'You are a hip hinge machine. The arms are just ropes attached to the bell. The GLUTES snap the hips forward and the KB floats. If your arms are sore, you are pressing instead of swinging.',
          breathing: 'Exhale sharply on the hip snap. Inhale on the backswing. The breath rhythm with the swing creates a meditative quality — find it.',
          mistakes: 'Squatting instead of hinging (feet too wide, KB goes to floor like a deadlift). Arms pulling the bell up (deltoid-dominant). Round back on the hike. Bell floating too high — above shoulder is a kettlebell clean, not a swing.'
        }
      },

      {
        id: 'kb-clean-press',
        name: 'KB Clean and Press',
        muscles: ['shoulders','legs','glutes','core'],
        baseReps: 8,
        baseRest: 90,
        unit: 'reps',
        note: 'Per side',
        minLevel: 6,
        variations: [
          { minLevel: 6, name: 'KB Clean and Press' }
        ],
        form: {
          setup: 'KB on floor. Hinge to grab with one hand. Lat engaged, shoulder packed. Opposite arm free for balance.',
          execution: 'Clean: swing the KB back and explosively drive hips forward, guiding the bell into the rack position (fist at shoulder, elbow tucked to ribs, bell resting on forearm). Pause. Press: drive the bell overhead to lockout. Return to rack. Lower to hike. That is one rep.',
          cue: 'The clean is a catch, not a curl. The bell should land gently in the rack without banging your forearm — guide it in a tight arc close to the body.',
          breathing: 'Exhale on the clean initiation. Hold at rack. Exhale on the press. Inhale on the return. Complex movement — find a rhythm.',
          mistakes: 'Bell banging the forearm on the clean (arm too far from body). Press without a pause in rack (form breakdown). Pressing with a chicken-wing elbow. Not locking out overhead.'
        }
      },

      {
        id: 'kb-farmers-walk',
        name: 'KB Farmer\'s Walk',
        muscles: ['grip','forearms','legs','core'],
        baseReps: 30,
        baseRest: 60,
        unit: 'sec',
        minLevel: 5,
        variations: [
          { minLevel: 5, name: 'KB Farmer\'s Walk' }
        ],
        form: {
          setup: 'One KB in each hand, hanging at sides. Stand tall — do not list to one side. Pack your shoulders. Core braced.',
          execution: 'Walk for the prescribed time or distance. Take controlled, normal-length steps. Do not let the KBs swing. Maintain posture — tall spine, packed shoulders.',
          cue: 'Walk like you own the room. The challenge is to carry the weight without it showing in your posture. An observer should not be able to tell you are carrying anything — that is the standard.',
          breathing: 'Normal breathing. Do not hold breath.',
          mistakes: 'Listing to one side (using the spine as a crane). Letting shoulders shrug up. Short, shuffle steps to avoid KB clashing. Dropping before time is up.'
        }
      },

      {
        id: 'band-hip-abduction',
        name: 'Band Hip Abduction',
        muscles: ['glutes','legs'],
        baseReps: 20,
        baseRest: 45,
        unit: 'reps',
        note: 'Per side',
        minLevel: 5,
        variations: [
          { minLevel: 5, name: 'Band Hip Abduction' }
        ],
        form: {
          setup: 'Band anchored at ankle height to the side. Stand perpendicular to anchor, non-working leg slightly bent. Band around the working ankle. Hold something for balance if needed.',
          execution: 'Kick the working leg directly to the side against band resistance, keeping the foot flexed and pelvis level. Return under control.',
          cue: 'Keep the pelvis absolutely level — no hip hiking to get more range. The range that matters is the one you can do without compensating.',
          breathing: 'Exhale on the abduction. Inhale on the return. Keep the standing leg soft — do not lock it.',
          mistakes: 'Hip hiking to get more range (lateral spine compensating for limited glute med strength). Swinging the leg instead of controlled abduction. Standing leg locked into extension.'
        }
      }

    ]
  }

];
