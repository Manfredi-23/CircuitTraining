// =============================================================================
// config.ts — Central configuration for 7Bit
//
// v10. Three things changed from v9 and they are the whole point:
//
//  1. Levels raise LOAD, not reps. The old curve pushed reps from +10% to +25%
//     as you got stronger, which converts a strength session into an endurance
//     session exactly when you are best equipped to train strength.
//  2. Rest on maximal work never shrinks. The old curve cut rest by 30s across
//     the levels; max-hang and heavy-pull protocols need 2-5 minutes to allow
//     full phosphocreatine resynthesis, and a rushed set is a lower-quality set.
//  3. Detraining is capacity-specific, with a grace period long enough that a
//     planned deload week is not punished.
// =============================================================================

import type { Config } from './types';

export const CONFIG: Config = {

  modes: ['HOME', 'CAVE', 'HANG', 'MORN'],

  // ---------------------------------------------------------------------------
  // Energy
  //
  // Energy no longer just trims reps. It caps intensity, because the correct
  // response to arriving tired at a maximal finger session is to lower the
  // ceiling, not to do the same session slightly smaller. Rest always goes up.
  // ---------------------------------------------------------------------------
  energy: {
    // Capacity for one extra working set. Rest and intensity stay on protocol.
    FRESH: {
      label: 'FRESH',
      workMult: 1.0,
      setOffset: 1,
      restMult: 1.0,
      intensityCap: null,
      dropBlocks: [],
    },
    // The session exactly as written.
    NORMAL: {
      label: 'NORMAL',
      workMult: 1.0,
      setOffset: 0,
      restMult: 1.0,
      intensityCap: null,
      dropBlocks: [],
    },
    // Maximal work is downgraded rather than attempted at reduced quality, and
    // rest goes up. Accessory volume is the first thing to go.
    TIRED: {
      label: 'TIRED',
      workMult: 0.8,
      setOffset: -1,
      restMult: 1.25,
      intensityCap: 'HARD',
      dropBlocks: ['ACCESSORY'],
    },
  },

  // ---------------------------------------------------------------------------
  // Levels
  //
  // loadStep is the multiplier applied to the level-1 load target. setBonus adds
  // sets to PRIMARY work. restMult is >= 1 throughout: as the loads get heavier
  // the rest requirement goes up, not down.
  // ---------------------------------------------------------------------------
  levels: [
    { level: 1, xpNeeded: 0,  cumul: 0,   loadStep: 1.00, setBonus: 0, restMult: 1.00, accessoryRestMult: 1.15, unlocks: 'Movement quality, submaximal loads' },
    { level: 2, xpNeeded: 8,  cumul: 8,   loadStep: 1.05, setBonus: 0, restMult: 1.00, accessoryRestMult: 1.05, unlocks: 'Load progression starts' },
    { level: 3, xpNeeded: 12, cumul: 20,  loadStep: 1.10, setBonus: 1, restMult: 1.00, accessoryRestMult: 1.00, unlocks: 'Volume step: one extra working set' },
    { level: 4, xpNeeded: 16, cumul: 36,  loadStep: 1.15, setBonus: 1, restMult: 1.05, accessoryRestMult: 0.95, unlocks: 'Harder variations' },
    { level: 5, xpNeeded: 24, cumul: 60,  loadStep: 1.20, setBonus: 1, restMult: 1.05, accessoryRestMult: 0.90, unlocks: 'New exercises enter the session' },
    { level: 6, xpNeeded: 32, cumul: 92,  loadStep: 1.25, setBonus: 2, restMult: 1.10, accessoryRestMult: 0.90, unlocks: 'Advanced variations, unilateral work' },
    { level: 7, xpNeeded: 40, cumul: 132, loadStep: 1.30, setBonus: 2, restMult: 1.10, accessoryRestMult: 0.85, unlocks: 'Peak protocols, minimum edge' },
  ],

  capacities: [
    'crimp', 'openhand', 'forearm',
    'pull', 'contact', 'tension',
    'press', 'shoulder', 'legs', 'mobility',
  ],

  capacityLabels: {
    crimp:    'half-crimp',
    openhand: 'open hand',
    forearm:  'forearm capacity',
    pull:     'pulling',
    contact:  'contact strength',
    tension:  'body tension',
    press:    'pressing',
    shoulder: 'shoulder + elbow',
    legs:     'legs',
    mobility: 'mobility',
  },

  // ---------------------------------------------------------------------------
  // Decay
  //
  // Maximal strength is retained for weeks without training; aerobic capacity
  // and mobility fade within days. Grace periods reflect that, and are long
  // enough that a planned rest week costs nothing.
  // ---------------------------------------------------------------------------
  decay: {
    skipPenalty: 0,
    quitPenalty: 0,
    windowDays: 7,
    rates: {
      crimp:    { graceDays: 21, perWindow: -1 },
      openhand: { graceDays: 21, perWindow: -1 },
      pull:     { graceDays: 21, perWindow: -1 },
      contact:  { graceDays: 14, perWindow: -2 },
      tension:  { graceDays: 14, perWindow: -2 },
      press:    { graceDays: 21, perWindow: -1 },
      shoulder: { graceDays: 14, perWindow: -1 },
      legs:     { graceDays: 21, perWindow: -1 },
      forearm:  { graceDays: 10, perWindow: -3 },
      mobility: { graceDays: 10, perWindow: -3 },
    },
  },

  recovery: {
    // Finger flexor tendons and pulleys need 48-72h between maximal sessions.
    fingerMaxHours: 48,
    hardSessionHours: 24,
    mesocycleWeeks: 3,
    deloadGraceDays: 10,
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
    'Rest is a set. Take it.',
    'Load goes up. Reps stay put.',
    'The pulley remembers everything.',
    'Strong fingers. Modest ego.',
    'Awake is a strong word.',
    'Coffee comes after. That is the deal.',
    'Fifteen minutes. Then you may resume being unconscious.',
    'The floor is already there. Just lie on it.',
    'Consciousness optional. Movement mandatory.',
    'Snooze button: 0. Body tension: 1.',
    'Nobody is a morning person. Some are just already on the mat.',
    'Your alarm won. Get it over with.',
    'Small edge. Small routine. Large opinions.',
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
    'Your {capacity} dropped to L{level}. Time for work?',
    '{capacity} trending down. L{level}. Noted.',
    'L{level} for {capacity} now. Consistency helps.',
    '{capacity} slipped to L{level}. The wall remembers.',
    'Detraining hit {capacity}. L{level}. Train or lose it.',
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
