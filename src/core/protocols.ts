// =============================================================================
// protocols.ts — Named, sourced training protocols
//
// Every prescription in the exercise data references one of these by id, so the
// numbers on the workout card and the evidence behind them cannot drift apart.
// Where the literature gives a range, the range is stated and the app picks a
// defensible point inside it.
// =============================================================================

import type { Protocol } from './types';

export const PROTOCOLS: Record<string, Protocol> = {

  // ---------------------------------------------------------------------------
  // Fingers
  // ---------------------------------------------------------------------------

  'max-hang': {
    id: 'max-hang',
    name: 'Max Hangs',
    quality: 'Maximal finger flexor strength',
    work: '10s hang on a 20mm edge',
    rest: '180s between sets (range 120-300s)',
    sets: '4-6 per grip',
    intensity: '85-90% of tested 10s max load',
    frequency: '2x per week, never on consecutive days',
    rationale:
      'Isometric finger strength on a small edge is the single strongest physical '
      + 'predictor of climbing performance in the literature. Sets are short and '
      + 'rest is long because the goal is peak force per set, not accumulated '
      + 'fatigue; three minutes allows near-complete phosphocreatine resynthesis.',
    source:
      'Lattice Training hangboarding guides; Baláš et al., physical performance '
      + 'testing in climbing (Front Sports Act Living 2023); Winkler/Levernier '
      + 'finger strength vs. grade datasets.',
  },

  'density-hang': {
    id: 'density-hang',
    name: 'Density Hangs (Abrahangs)',
    quality: 'Finger strength via low-intensity, high-frequency loading',
    work: '10 x 10s hang, 50s rest — 10 minutes total',
    rest: '50s between hangs',
    sets: '1 block, repeatable twice daily at least 6h apart',
    intensity: 'About 40% of max — feet on the ground, light strain only',
    frequency: 'Daily, up to 2x per day',
    rationale:
      'Retrospective analysis of logged training found low-intensity, frequent '
      + 'finger loading produced strength gains comparable to max hangs, and gains '
      + 'were additive when both were run together. Consistent with tendon loading '
      + 'work showing collagen synthesis is maximised by short bouts spaced about '
      + '6h apart rather than by long single sessions. Low enough load that it does '
      + 'not interfere with climbing or maximal training.',
    source:
      'Effects of Different Loading Programs on Finger Strength in Rock Climbers, '
      + 'Sports Medicine - Open (2024) — retrospective Crimpd app cohort, not an '
      + 'RCT; Baar, tendon loading and collagen synthesis.',
  },

  'repeaters': {
    id: 'repeaters',
    name: 'Repeaters 7:3',
    quality: 'Finger strength-endurance / anaerobic capacity',
    work: '7s hang, 3s off, x6 = one 60s set',
    rest: '150s between sets (range 120-180s)',
    sets: '5-6',
    intensity: '55-65% of tested max hang load',
    frequency: '1x per week',
    rationale:
      'Intermittent dead-hang protocols produce greater grip-endurance gains than '
      + 'maximal holds. The 7:3 rhythm mirrors the contract-release pattern of route '
      + 'climbing and is the same work:rest ratio used in the standard forearm '
      + 'critical-force test.',
    source:
      'Lopez-Rivera & Gonzalez-Badillo, intermittent vs. maximal dead hangs; '
      + 'Medernach et al., 8-week intermittent hangboard RCT.',
  },

  'critical-force': {
    id: 'critical-force',
    name: 'Critical Force Intervals',
    quality: 'Forearm aerobic capacity — the ability to recover on the wall',
    work: '7s on / 3s off continuously for 4 minutes (24 pulls)',
    rest: '300s between blocks',
    sets: '2-3',
    intensity: 'At or just above measured critical force, roughly 60-70% of max',
    frequency: '1x per week',
    rationale:
      'Critical force is the highest intermittent force a forearm can sustain '
      + 'without accumulating fatigue, and is the metric Lattice uses for forearm '
      + 'endurance. For a route climber whose limit is 7a+, sustained capacity at '
      + 'moderate force is usually a larger limiter than peak force. Training at '
      + 'critical force is the most time-efficient way to raise it.',
    source:
      'Lattice 4-minute all-out finger-flexor critical force test; Giles et al., '
      + 'validation of the 4-min all-out test in sport climbers (2024).',
  },

  'recruitment-pull': {
    id: 'recruitment-pull',
    name: 'Recruitment Pulls',
    quality: 'Rate of force development in the fingers',
    work: '5s maximal pull against an immovable edge or block',
    rest: '120-180s',
    sets: '4-5',
    intensity: 'Maximal voluntary effort',
    frequency: '1x per week, only when fresh',
    rationale:
      'Contact strength is rate of force development, not peak force. Short '
      + 'maximal-intent efforts train the neural side without the tissue cost of '
      + 'dynamic campus work. A safer first choice than the campus board.',
    source:
      'Levernier & Laffaye, force and RFD differences across climbing ability; '
      + 'campus board frequency RCT (Front Physiol 2021).',
  },

  // ---------------------------------------------------------------------------
  // Power / contact
  // ---------------------------------------------------------------------------

  'limit-boulder': {
    id: 'limit-boulder',
    name: 'Limit Bouldering',
    quality: 'Maximal recruitment, contact strength, movement under load',
    work: '4-6 move problems at your limit, 2-4 attempts each',
    rest: '180s between attempts',
    sets: '6-8 attempts total',
    intensity: 'Maximal — problems you can do in 1-4 tries on a good day',
    frequency: '1-2x per week, fresh',
    rationale:
      'The most transferable power stimulus available, because it loads fingers, '
      + 'body tension and movement simultaneously in the pattern the sport uses. '
      + 'Long rests keep every attempt maximal; once quality drops the session is '
      + 'over regardless of how many attempts remain.',
    source:
      'Standard practice across Lattice, Power Company and Hoerst methodologies; '
      + 'supported by finger strength / bouldering performance correlations.',
  },

  'campus': {
    id: 'campus',
    name: 'Campus Ladders',
    quality: 'Explosive contact strength',
    work: '1-3-5 or 1-4-7 ladder, one ladder per set',
    rest: '180s',
    sets: '4-5',
    intensity: 'Maximal, stopping well before fatigue',
    frequency: 'Max 2x per week, in a dedicated block only',
    rationale:
      'Two weekly campus sessions improved bouldering performance in advanced '
      + 'climbers, and four sessions improved rate of force development further. '
      + 'It is also the highest-risk tool in the gym: fingers, elbows and shoulders '
      + 'are the three commonest climbing injury sites and campusing loads all '
      + 'three explosively. Gated on a tested finger-strength standard in this app '
      + 'rather than on accumulated XP.',
    source:
      'Effects of Two vs. Four Weekly Campus Board Training Sessions, Front Physiol '
      + '(2021); climbing injury epidemiology reviews.',
  },

  // ---------------------------------------------------------------------------
  // Pulling
  // ---------------------------------------------------------------------------

  'max-strength': {
    id: 'max-strength',
    name: 'Maximal Strength',
    quality: 'Maximal force production, minimal hypertrophy',
    work: '3-5 reps',
    rest: '180s',
    sets: '4-5',
    intensity: 'RPE 8-9, a load you could do 1-2 more reps with',
    frequency: '2x per week per pattern',
    rationale:
      'Low reps at high load build force with the least added mass, which is what '
      + 'a strength-to-weight sport needs. Two to three hard sets per pattern, '
      + 'twice weekly, is enough to drive strength in a climber who is also '
      + 'climbing; more volume mostly buys fatigue and mass.',
    source:
      'Lattice minimum effective dose guidance; systematic review on resistance '
      + 'training, climbing performance and injury prevention (Sports Med Open 2024).',
  },

  'lock-off': {
    id: 'lock-off',
    name: 'Lock-Off Isometrics',
    quality: 'Position-specific pulling strength',
    work: '5-10s hold at 60, 90 and 120 degrees of elbow flexion',
    rest: '120s',
    sets: '3 per arm',
    intensity: 'Hard — the last second should be a fight',
    frequency: '1x per week',
    rationale:
      'Climbing pulling is largely isometric and position-specific. Lock-off '
      + 'capacity at 90 degrees is part of the standard climbing assessment battery '
      + 'and transfers directly to holding a position while the other hand moves.',
    source:
      'Climbing-specific strength assessment literature; Lattice assessment battery.',
  },

  'strength-endurance': {
    id: 'strength-endurance',
    name: 'Strength Endurance',
    quality: 'Repeated sub-maximal force with incomplete recovery',
    work: '8-12 reps',
    rest: '90-120s',
    sets: '3-4',
    intensity: 'RPE 7-8',
    frequency: '1x per week',
    rationale:
      'Bridges maximal strength and route capacity. Kept to one session per week '
      + 'so it does not crowd out the maximal work that actually raises the ceiling.',
    source: 'General resistance training literature applied to climbing.',
  },

  // ---------------------------------------------------------------------------
  // Tension, prehab, mobility
  // ---------------------------------------------------------------------------

  'tension-iso': {
    id: 'tension-iso',
    name: 'Body Tension Isometrics',
    quality: 'Anti-extension and anti-rotation trunk strength',
    work: '8-15s holds',
    rest: '90s',
    sets: '4-5',
    intensity: 'The hardest progression you can hold with a flat lower back',
    frequency: '2x per week',
    rationale:
      'Ten weeks of twice-weekly core training improved climbing-specific body-lift '
      + 'and lock-off tests by roughly 10-30% in advanced climbers. Isometric and '
      + 'dynamic work performed similarly, so this programme uses both: isometric '
      + 'for the front-lever line, dynamic for hip flexion.',
    source:
      'Saeterbakken et al., ten weeks dynamic or isometric core training in highly '
      + 'trained climbers, PLOS ONE (2018).',
  },

  'prehab': {
    id: 'prehab',
    name: 'Antagonist and Prehab',
    quality: 'Shoulder, elbow and wrist resilience',
    work: '12-20 reps, controlled tempo',
    rest: '45-60s',
    sets: '2-3',
    intensity: 'Light — never to failure',
    frequency: '2-3x per week',
    rationale:
      'Upper-extremity injuries account for the large majority of climbing injuries. '
      + 'Climbing loads the finger and wrist flexors and internal rotators almost '
      + 'exclusively; wrist extensor, supinator/pronator and external rotator work '
      + 'is the standard prevention for medial elbow tendinopathy and shoulder '
      + 'impingement in climbers. This is maintenance, not training — it must never '
      + 'compete with the session that matters.',
    source:
      'Climbing injury epidemiology and prevention reviews; medial epicondylalgia '
      + 'rehab protocols for climbers.',
  },

  'warmup': {
    id: 'warmup',
    name: 'Progressive Warm-Up',
    quality: 'Tissue preparation and neural readiness',
    work: 'Pulse raiser, then progressive finger loading jug > 30mm > 20mm',
    rest: '60s between warm-up hangs',
    sets: '3-4 progressive hangs',
    intensity: '40-60% — enough to prepare, not enough to fatigue',
    frequency: 'Every session that loads fingers',
    rationale:
      'Progressive loading of the flexor tendons and pulleys before maximal work is '
      + 'the most consistently recommended injury-reduction step in climbing, and '
      + 'it doubles as a readiness check: how the fingers feel on the third warm-up '
      + 'hang decides whether the session goes ahead as written.',
    source: 'RAMP warm-up model; climbing warm-up and injury prevention guidance.',
  },

  'mobility': {
    id: 'mobility',
    name: 'Hip and Shoulder Mobility',
    quality: 'Usable range of motion in climbing positions',
    work: '45-60s per position, loaded end-range where possible',
    rest: '15s',
    sets: '2 rounds',
    intensity: 'Comfortable end range',
    frequency: '3x per week',
    rationale:
      'Combined hip abduction and external rotation is what makes high steps, drop '
      + 'knees and bridging available, and it is measured in climbing assessment '
      + 'batteries via foot-raise height and straddle depth. Cheap to train and it '
      + 'costs no recovery.',
    source:
      'Draper et al., flexibility as a determinant of climbing performance; climbing '
      + 'mobility assessment protocols.',
  },

  'assessment': {
    id: 'assessment',
    name: 'Assessment Battery',
    quality: 'Finding the limiter',
    work: 'Standardised tests, full recovery between each',
    rest: 'As long as needed — this is a test, not a workout',
    sets: '1 per test',
    intensity: 'Maximal on strength tests',
    frequency: 'Every 6-8 weeks',
    rationale:
      'The assess-identify-train-reassess loop is the core of the Lattice method. '
      + 'Without numbers, training targets whatever feels productive rather than '
      + 'whatever is actually limiting. Run it on a rest day, fully warm, and record '
      + 'everything.',
    source: 'Lattice Training assessment methodology.',
  },
};

export function getProtocol(id: string | undefined): Protocol | null {
  if (!id) return null;
  return PROTOCOLS[id] ?? null;
}
