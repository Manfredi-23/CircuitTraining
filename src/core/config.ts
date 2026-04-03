// =============================================================================
// config.ts — Central configuration for 7Bit Circuit Training PWA
// =============================================================================

import type { Config } from './types';

export const CONFIG: Config = {

  modes: ['HOME', 'CAVE', 'HANG'],

  energy: {
    FRESH:  { label: 'FRESH',  repMult: 1.2,  restOffset: 0,  roundOffset: 0  },
    NORMAL: { label: 'NORMAL', repMult: 1.0,  restOffset: 10, roundOffset: 0  },
    TIRED:  { label: 'TIRED',  repMult: 0.75, restOffset: 20, roundOffset: -1 },
  },

  levels: [
    { level: 1, xpNeeded: 0,  cumul: 0,   repMult: 1.00, restOffset:  15, unlocks: 'Starting exercises'  },
    { level: 2, xpNeeded: 6,  cumul: 6,   repMult: 1.10, restOffset:  10, unlocks: 'Rep increases'       },
    { level: 3, xpNeeded: 10, cumul: 16,  repMult: 1.15, restOffset:   5, unlocks: 'Tempo prescriptions' },
    { level: 4, xpNeeded: 14, cumul: 30,  repMult: 1.15, restOffset:  -5, unlocks: 'Variation swaps'     },
    { level: 5, xpNeeded: 20, cumul: 50,  repMult: 1.20, restOffset: -10, unlocks: 'New exercises added' },
    { level: 6, xpNeeded: 30, cumul: 80,  repMult: 1.20, restOffset: -15, unlocks: 'Advanced variations' },
    { level: 7, xpNeeded: 40, cumul: 120, repMult: 1.25, restOffset: -15, unlocks: 'Peak programming'    },
  ],

  muscleGroups: [
    'chest', 'back', 'shoulders', 'triceps', 'biceps',
    'core', 'obliques', 'legs', 'glutes',
    'forearms', 'grip', 'fingers',
  ],

  decay: {
    quitPenalty: -1,
    skipPenalty: -1,
    inactivityDays: 10,
    inactivityPenalty: -2,
    inactivityWindow: 7,
  },

  humorLines: [
    'Suffer smarter, not harder.',
    'Your fingers called. They hate you.',
    "Because the wall won't climb itself.",
    'Gainz for granite enthusiasts.',
    'Training app. Excuse eliminator.',
    'Powered by chalk and poor decisions.',
    'The app your physio warned you about.',
    'Vertical ambition. Horizontal recovery.',
    'Floor is lava. You are push-up.',
    'Your mat misses you. Allegedly.',
    'Resistance band goes brrr.',
    'No gym. No excuses. No mercy.',
    'Bodyweight: the original kettlebell.',
    'Sweat deposit for the living room.',
    'Minimum effort. Maximum suffering.',
    "The kettlebell doesn't judge. Much.",
    'Rings: because instability is a feature.',
    'Campus board: fingers go brrr.',
    'TRX: suspended disbelief in your fitness.',
    '12kg of existential growth.',
    'Hang in there. Literally.',
    '20mm of pure personality.',
    "Tendons: the world's slowest gains.",
    'Half-crimp, full commitment.',
    'Your forearms will write a memoir.',
    'Edge lord training protocol.',
  ],

  statLines: {
    stable:       ['Holding together.', 'Acceptable.', 'Still operational.', 'Not collapsing.', 'Functional.', 'Surviving.', 'It works.', 'Maintained.', 'No surprises.', 'As expected.'],
    improving:    ['Slightly better.', 'Progress detected.', 'Not pointless.', 'Something is working.', 'Marginal gains.', 'Moving up.', 'Less embarrassing.', 'Improving, quietly.', 'Unexpected progress.', 'Acceptable improvement.'],
    declining:    ['Slipping.', "That's fading.", 'Less convincing.', 'Needs attention.', 'Dropping off.', 'Not ideal.', 'Decline detected.', 'Slowly falling apart.', 'Could be better.', 'Losing ground.'],
    inconsistent: ['Inconsistent.', 'Unconvincing.', 'That was optional.', 'Effort unclear.', 'Not committed.', 'Half done.', 'Could try harder.', 'Mostly theoretical.', 'Intermittent.', 'Questionable.'],
    fatigue:      ['Running on fumes.', 'Tired work.', 'Not fresh.', 'Energy questionable.', 'Slower than usual.', 'Low output.', 'Underpowered.', 'Slightly worn.', 'Not peak.', 'Limited effort.'],
    fallback:     ['It continues.', 'Still here.', 'Nothing dramatic.', 'Carry on.', 'This exists.'],
  },

  derankMessages: [
    'Your {muscle} dropped to L{level}. Time for work?',
    '{muscle} trending down. L{level}. Noted.',
    'L{level} for {muscle} now. Consistency helps.',
    '{muscle} slipped to L{level}. The wall remembers.',
    'Decay hit {muscle}. L{level}. Train or lose it.',
  ],

  ui: {
    swipeThreshold:    50,
    restFlashDuration: 300,
    restBeepCount:     3,
    restWarningAt:     5,
    cardAnimDuration:  250,
  },

  storage: {
    state:      '7bit_state',
    progress:   '7bit_progress',
    sessionLog: '7bit_sessions',
    settings:   '7bit_settings',
  },
};
