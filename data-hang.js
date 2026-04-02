// =============================================================================
// data-hang.js — HANG mode exercise data (Finger training / Minimum hangboard)
// Equipment: Hangboard at gym, 20mm half-crimp edge
// 2 circuits: 01 Max Hangs, 02 Density Hangs
// =============================================================================

'use strict';

const DATA_HANG = [

  // ---------------------------------------------------------------------------
  // CIRCUIT 01 — Max Hangs
  // ---------------------------------------------------------------------------
  {
    id: 'hang-01',
    circuitNum: '01',
    title: 'MAX HANGS',
    subtitle: 'fingers - grip',
    muscles: ['fingers','grip','forearms'],
    illustration: 'fingers-maxhangs.png',
    duration: 40,
    rounds: 1,
    note: 'Long rest between sets — quality over quantity',
    exercises: [

      {
        id: 'max-hang-halfcrimp',
        name: 'Max Hang — Half-Crimp',
        muscles: ['fingers','forearms','grip'],
        baseReps: 10,
        baseRest: 180,
        unit: 'sec',
        note: '10s on / 3 min rest x 5 sets',
        variations: [
          { minLevel: 1, name: 'Half-Crimp 20mm BW' },
          { minLevel: 4, name: 'Half-Crimp 18mm BW' },
          { minLevel: 6, name: 'Half-Crimp 15mm BW' }
        ],
        form: {
          setup: 'Half-crimp position: distal and middle joints flexed to roughly 90 degrees, no joint hyperextension, thumb NOT over index finger. The DIP (distal) joint is slightly curved — this is what separates half-crimp from full crimp. Set up on your target edge. Body hanging freely, not touching wall.',
          execution: 'Load the hang gradually over the first 1-2 seconds. Do not shock-load. Hold for 10 seconds at maximum sustainable intensity — not quite failure. Release with control. Rest fully for 3 minutes. Repeat 5 sets. Heart rate should be near resting before each set.',
          cue: 'Imagine trying to "pull" the edge off the wall with your fingers — generating maximum recruitment from the FDP tendons. The intensity should be around 85-90% of the maximum load you could hold for 3 seconds.',
          breathing: 'Normal rhythmic breathing throughout the hang. Holding breath spikes blood pressure and reduces the quality of the hang. Breathe.',
          mistakes: 'Full crimp (all joints at 90+ degrees, thumb over index) — high injury risk, not the goal here. Shock loading — always ease into the hang. Insufficient rest — 3 full minutes, not 90 seconds. Hanging to failure — max hangs are about near-maximum load, not failure.'
        }
      },

      {
        id: 'max-hang-openhand',
        name: 'Max Hang — Open Hand',
        muscles: ['fingers','forearms'],
        baseReps: 10,
        baseRest: 180,
        unit: 'sec',
        note: '10s on / 3 min rest x 4 sets',
        variations: [
          { minLevel: 1, name: 'Open Hand 25mm BW' },
          { minLevel: 4, name: 'Open Hand 20mm BW' }
        ],
        form: {
          setup: 'Open-hand (also called "four-finger drag"): all joints relatively extended, only the first joint (MCP) flexed. All fingers on the edge. This grip position creates the best tendon adaptation with the lowest injury risk.',
          execution: 'Same protocol as half-crimp: 10 seconds at near-maximum intensity, 3 minute rest, 4 sets. Use a larger edge (25mm starting) as open-hand grip is naturally weaker.',
          cue: 'Open-hand trains the most injury-resistant position for climbing. Your tendency will always be to crimp when tired — use max hangs to build the open-hand strength that prevents this.',
          breathing: 'Breathe throughout. If you find yourself holding breath, the intensity is too high — reduce the added weight or increase edge size.',
          mistakes: 'Creeping into half-crimp as the hang gets hard (grip position discipline is the whole exercise). Insufficient edge size for current strength level — do not force a position you cannot hold. Missing the full 3-minute rest.'
        }
      },

      {
        id: 'campus-speed-ladder',
        name: 'Campus Speed Ladders',
        muscles: ['fingers','grip','back','biceps'],
        baseReps: 5,
        baseRest: 120,
        unit: 'reps',
        minLevel: 5,
        note: '3 rungs up, 3 rungs down x 5',
        variations: [
          { minLevel: 5, name: 'Campus Speed Ladders' }
        ],
        form: {
          setup: 'Campus board — rungs 1 through 5 minimum. Stand below board, reach to rung 2 with both hands. Feet off the wall or trailing on footholds (beginner modification).',
          execution: 'Move up rung by rung as fast as possible, alternating hands. Down the same way. Speed is the training stimulus here — explosive contact, immediate release and re-grasp.',
          cue: 'Match every rung before moving — contact with both hands, however brief. This trains explosive contact strength, not swing. Think "touch and go", not "slap and grab".',
          breathing: 'Explosive and natural. The exercise is short — breathe in recovery between sets.',
          mistakes: 'Swinging on the board (loading momentum instead of muscles). Missing rungs for speed — quality contacts beat rung count. Starting too high up (ruins the movement). Not fully recovering between sets.'
        }
      },

      {
        id: 'one-arm-assisted',
        name: 'One-Arm Assisted Hang',
        muscles: ['fingers','grip','back'],
        baseReps: 10,
        baseRest: 180,
        unit: 'sec',
        minLevel: 5,
        note: 'Assist with rubber band or other hand on bar',
        variations: [
          { minLevel: 5, name: 'One-Arm Assisted Hang' }
        ],
        form: {
          setup: 'Hang from edge on one hand. Assist with opposite hand on the bar, rubber band, or TRX strap to reduce the load — you want roughly 50-70% of bodyweight on the working hand.',
          execution: 'Hold for 10 seconds. The assist hand is only for load management — it should not be doing most of the work. The single-hand training stimulus is the entire point.',
          cue: 'Think of the assist as a spotter — barely there. The working hand should feel genuinely challenged. If it feels easy, reduce the assist.',
          breathing: 'Normal throughout. If you cannot breathe normally, the load management is off.',
          mistakes: 'Assisting too much (the dominant hand does everything). Grip position creeping to full crimp under the one-arm load. Not genuinely challenging the single-finger tendons. Insufficient recovery between sets.'
        }
      }

    ]
  },

  // ---------------------------------------------------------------------------
  // CIRCUIT 02 — Density Hangs
  // ---------------------------------------------------------------------------
  {
    id: 'hang-02',
    circuitNum: '02',
    title: 'DENSITY HANGS',
    subtitle: 'fingers - forearms',
    muscles: ['fingers','forearms','grip'],
    illustration: 'fingers-hangboard.png',
    duration: 40,
    rounds: 1,
    note: 'Repeater protocols — volume over intensity',
    exercises: [

      {
        id: 'repeaters-bw',
        name: 'Repeaters — Bodyweight',
        muscles: ['fingers','forearms'],
        baseReps: 6,
        baseRest: 90,
        unit: 'reps',
        note: '7s on / 3s off x 6 = 1 set. 90s rest between sets. 4 sets.',
        variations: [
          { minLevel: 1, name: 'Repeaters BW 20mm half-crimp' },
          { minLevel: 4, name: 'Weighted Repeaters' }
        ],
        form: {
          setup: 'On hangboard at target edge (start: 20mm half-crimp). Chalk up. Set your grip carefully before loading. Full hang position — body hanging, not touching wall.',
          execution: '7 seconds on edge — controlled load, not jerky. 3 seconds off (lower feet to floor or use stool to unweight). Repeat 6 times. That is one set. 90 seconds complete rest between sets. 4 total sets. For weighted variation: add weight via harness or weight belt.',
          cue: 'Repeaters train the oxidative capacity of the forearm muscles — this is what allows you to keep climbing when it gets hard. Focus on consistency between reps, not maximum intensity.',
          breathing: 'Breathe steadily on the 7-second hangs. Use the 3-second off period to breathe deeply and resettle the grip.',
          mistakes: 'Shock loading onto the edge at the start of each rep. Grip position deteriorating as fatigue builds — if it does, increase edge size or reduce sets. Insufficient 90-second rest (density hangs require full rest to be effective). Pumping to failure on early sets and ruining later ones.'
        }
      },

      {
        id: 'dead-hang-3grip',
        name: 'Dead Hang 3-Grip Rotation',
        muscles: ['grip','forearms','fingers'],
        baseReps: 90,
        baseRest: 60,
        unit: 'sec',
        note: 'Every 30s: switch grip. Overhand → neutral → underhand',
        variations: [
          { minLevel: 1, name: 'Dead Hang' },
          { minLevel: 4, name: 'Dead Hang 3-Grip Rotation' }
        ],
        form: {
          setup: 'Pull-up bar or hangboard. Start in overhand grip. Set timer for 90 seconds total.',
          execution: 'First 30s: overhand grip. Without coming off the bar, shift to neutral (palms facing each other — if on a bar with neutral holds) at 30s. Shift to underhand at 60s. Each position trains slightly different forearm muscle recruitment.',
          cue: 'The transition between grips without releasing is the skill here. It trains the forearm to adapt grip position dynamically — exactly what route climbing demands.',
          breathing: 'Slow, steady breathing throughout. This is a duration exercise — manage your mental state and breath to extend time.',
          mistakes: 'Coming off the bar between grips. Hanging passively (no shoulder engagement). Not achieving full 90 seconds before releasing. Forgetting which position you are in.'
        }
      },

      {
        id: 'finger-rollups',
        name: 'Finger Roll-Ups',
        muscles: ['fingers','forearms'],
        baseReps: 10,
        baseRest: 60,
        unit: 'reps',
        note: 'Slow, controlled crimping motion on edge',
        variations: [
          { minLevel: 1, name: 'Finger Roll-Ups' }
        ],
        form: {
          setup: 'Stand in front of hangboard with hands on a large pocket or jug. This is not a hanging exercise — use your legs to control load. Start with open-hand position.',
          execution: 'Slowly curl the fingers from open-hand to half-crimp and back. This is a slow, controlled joint mobilization under load. The movement should take 3-4 seconds each way. Do not full crimp.',
          cue: 'Think of this as physical therapy for your finger tendons — not a strength exercise. Move through the full flexor range slowly. This is prehab/rehab quality work.',
          breathing: 'Calm, controlled breathing. Match breath to movement — exhale on the curl, inhale on the extension.',
          mistakes: 'Moving too fast (defeats the tendon loading purpose). Going to full crimp. Using too much body weight through the hands. Doing this when fingers are already pumped — this is a warm-up or cool-down tool.'
        }
      }

    ]
  }

];
