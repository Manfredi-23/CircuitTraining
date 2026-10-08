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

  'one-arm-pull': {
    id: 'one-arm-pull',
    name: 'One-Arm Pull-Up Progression',
    quality: 'Unilateral maximal pulling strength',
    work: '2-5 reps per arm on the hardest rung you can do cleanly',
    rest: '150-180s. The working arm rests while the other works, and still needs it.',
    sets: '3-4 per arm',
    intensity: 'Hard, never grinding: stop with one clean rep left',
    frequency: 'Two or three one-arm exercises per week in total, on strength days',
    rationale:
      'A one-arm pull-up is roughly the strength of a two-arm pull-up with half to two '
      + 'thirds of bodyweight added, so weighted pull-ups carry most of the early '
      + 'progress. The one-arm-specific rungs teach what weighted pulls cannot: engaging '
      + 'one shoulder alone and stopping the body rotating away from the bar. Load shifts '
      + 'gradually from two hands to one — uneven grip, archer, typewriter, then assisted '
      + 'one-arms and negatives — because eccentric and fully one-armed work is hard on '
      + 'the elbow, which is why those rungs are gated on a tested weighted pull-up here. '
      + 'Realistic timeline from 8 strict pull-ups: one to two years.',
    source:
      'Lattice Training one-arm pull-up exercise menu and 4 x 3 at 3 min prescription, as '
      + 'reported by Gripped Magazine; Hörst, Training for Climbing: one-arm pull-up '
      + 'progression and uneven-grip pull-ups. The weighted-equivalence figure is a '
      + 'coaching rule of thumb, not a study.',
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

  'dynamic-core': {
    id: 'dynamic-core',
    name: 'Dynamic Trunk',
    quality: 'Hip flexion and rotation under tension: pulling the feet in and keeping them on',
    work: '6-16 controlled reps',
    rest: '60-90s',
    sets: '2-3',
    intensity: 'Moderate to hard, every rep slow enough to stop at any point',
    frequency: '2x per week',
    rationale:
      'The isometric work elsewhere teaches the trunk to resist. Steep climbing also asks '
      + 'it to move: draw a knee up to a high foot, rotate into a drop-knee, and re-place '
      + 'a cut foot while the arms hold. Dynamic and isometric core training produced '
      + 'similar gains in climbing-specific tests, so both belong. Hanging versions add '
      + 'the shoulder engagement of the real position; plank versions spare the grip '
      + 'after a boulder session.',
    source:
      'Saeterbakken et al., ten weeks dynamic or isometric core training in highly trained '
      + 'climbers, PLOS ONE (2018); Hörst, windshield wipers as a climbing core exercise '
      + '(2-3 sets of 6-12).',
  },

  'footwork-drill': {
    id: 'footwork-drill',
    name: 'Footwork and Balance Drills',
    quality: 'Precise foot placement, trust in small feet, weight over the feet',
    work: '60s of climbing per set on terrain well below your limit',
    rest: '60s',
    sets: '3',
    intensity: 'Technique. Easy enough that every placement is deliberate.',
    frequency: 'Every climbing session if you like: it costs no recovery',
    rationale:
      'Slab and technical weakness is a movement-skill gap more than a strength gap, and '
      + 'skill is trained by constraint: forbid readjusting a foot and placement gets '
      + 'precise, take the hands away and the body learns to find balance over the feet. '
      + 'Done on easy ground, right after the session while still coordinated. Honest '
      + 'caveat: these are established coaching drills, not trial-tested protocols.',
    source:
      'Hörst on no-hands climbing and kinesthetic awareness (Climbing Magazine, "Steady '
      + 'Yourself"); silent-feet and hover drills as taught across climbing coaching '
      + 'resources; board-climbing feet-on drills (UKB, Unlevel Edge).',
  },

  'balance': {
    id: 'balance',
    name: 'Single-Leg Balance',
    quality: 'Standing still on one small foothold',
    work: '20-40s per side',
    rest: '30s',
    sets: '2-3',
    intensity: 'Hard enough to wobble, never to fall',
    frequency: '3x per week, about 10 minutes, works',
    rationale:
      'Balance draws on vision, the inner ear and the receptors of the foot and ankle, and '
      + 'glute medius and lower-leg strength decide how well a loaded foot holds its '
      + 'position. Short, frequent balance sessions improve it in healthy adults. On a '
      + 'foothold in climbing shoes, it trains the exact position a slab asks for.',
    source:
      'The Climbing Doctor, balance and stability for climbers; Lesinski et al., '
      + 'dose-response of balance training in healthy young adults, Sports Med (2015).',
  },

  'foot-strength': {
    id: 'foot-strength',
    name: 'Calf and Toe Strength',
    quality: 'Pressing hard through the tip of the foot',
    work: '6-10 slow reps per side, three seconds down',
    rest: '90s',
    sets: '2-3',
    intensity: 'Moderate, full range, controlled',
    frequency: '2x per week',
    rationale:
      'Standing on a small edge is a single-leg calf raise held at the top on a few '
      + 'millimetres of rubber. Calf, Achilles and big-toe strength decide how long that '
      + 'position holds and how hard the toe can press. Doing it in climbing shoes on a '
      + 'real foothold keeps it specific. Honest caveat: no trial has measured this in '
      + 'climbers; the support is anatomical and clinical.',
    source:
      'The Climbing Doctor, lower-body strength for high stepping and edging; Climbing '
      + 'Magazine, a feet-first approach to training.',
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

  // ---------------------------------------------------------------------------
  // Daily minimum dose
  // ---------------------------------------------------------------------------

  'daily-trunk': {
    id: 'daily-trunk',
    name: 'Daily Minimum-Dose Trunk',
    quality: 'Trunk stiffness, anti-rotation and anti-extension endurance',
    work: '10-25s holds, or 10-16 controlled reps',
    rest: '15-25s. Short on purpose: no set here goes near failure, so there is '
      + 'nothing to recover from between them.',
    sets: '1-2',
    intensity: 'Easy to moderate. Nothing in this protocol is a working max.',
    frequency: 'Daily, climbing days included',
    rationale:
      'This is the frequency counterpart to the twice-weekly tension work, not a '
      + 'replacement for it. Trunk endurance responds to short, submaximal, '
      + 'frequently repeated bouts, and because no set approaches failure the '
      + 'session carries no recovery cost and needs no long rests. The side bridge '
      + 'and bird dog here are two thirds of the standard core-endurance battery, '
      + 'chosen because they load the trunk without loading the spine in flexion. '
      + 'Hard progressions belong in the twice-weekly session; what this one buys '
      + 'is the habit and the accumulated hours.',
    source:
      'McGill, core endurance training and the side bridge / bird dog standards; '
      + 'Saeterbakken et al. (2018) for the twice-weekly loading this supplements.',
  },

  'submax-practice': {
    id: 'submax-practice',
    name: 'Submaximal Strength Practice',
    quality: 'Strength in the exact position, without fatigue',
    work: 'A load you could move for twice the reps written',
    rest: '45s. No set is near failure.',
    sets: '2, one more when fresh, one fewer when tired',
    intensity: 'RPE 6-7. Stop every set with at least three good reps left.',
    frequency: '3 mornings per week',
    rationale:
      'Frequent, submaximal practice of one pattern builds strength with almost no '
      + 'recovery cost, because the stimulus is mostly neural rather than fatiguing. '
      + 'At equal weekly volume, training a pattern more often builds more strength '
      + 'than training it once. Holding at the end of each rep turns a row into a '
      + 'lock-off: the isometric, position-specific strength climbing pulls on most.',
    source:
      'Schoenfeld et al., training frequency and strength, Sports Med (2016); '
      + 'climbing-specific lock-off assessment literature.',
  },

  'kb-swing': {
    id: 'kb-swing',
    name: 'Kettlebell Swing',
    quality: 'Hip extension power',
    work: '10 swings, about 20s',
    rest: '45s',
    sets: '2, one more when fresh, one fewer when tired',
    intensity: 'Every rep crisp. Stop the set when the snap slows, not when you are tired.',
    frequency: '2-3x per week',
    rationale:
      'Six weeks of 12-minute kettlebell swing sessions with a 16kg bell raised '
      + 'vertical jump and half-squat 1RM as much as jump squat training did, with no '
      + 'landing at all, which makes it the quiet way to train leg power at home. '
      + 'Swings are explosive, so they are programmed for quality: short sets, full '
      + 'recovery of the snap between them.',
    source:
      'Lake and Lauder, kettlebell swing training improves maximal and explosive '
      + 'strength, J Strength Cond Res (2012).',
  },

  'hypertrophy': {
    id: 'hypertrophy',
    name: 'Muscle Size',
    quality: 'Muscle cross-section on chest and shoulders',
    work: '8-12 reps close to failure',
    rest: '20-45s on small muscles, 45-90s on presses',
    sets: '2 per session, as part of 10 or more hard sets per week',
    intensity: 'RPE 7-8: the last rep slow, one or two left in reserve',
    frequency: '2-3x per week per muscle',
    rationale:
      'Muscle growth scales with the number of hard sets per week, roughly '
      + 'linearly up to around ten and beyond. A morning session supplies part of '
      + 'that, not all of it. The pressing and the side of the shoulder are chosen '
      + 'because they add size where it shows for little bodyweight, which matters '
      + 'for a climber carrying it up the wall. Visible definition is set by body '
      + 'fat, not by this protocol.',
    source:
      'Schoenfeld, Ogborn and Krieger, dose-response of weekly training volume and '
      + 'hypertrophy, J Sports Sci (2017); Larsen et al., dumbbell versus cable '
      + 'lateral raises for side delt hypertrophy (2024); Kikuchi and Nakazato, '
      + 'push-up versus bench press hypertrophy (2017); Calatayud et al., band '
      + 'push-up versus bench press strength (2015).',
  },

  // ---------------------------------------------------------------------------
  // Trunk size and the lower back
  // ---------------------------------------------------------------------------

  'trunk-hypertrophy': {
    id: 'trunk-hypertrophy',
    name: 'Abs and Obliques for Size',
    quality: 'Rectus abdominis and oblique muscle size, not just endurance',
    work: '10-16 reps, or 20-30s holds, taken close to failure',
    rest: '30-60s',
    sets: '2-3 per exercise, about 10-14 hard sets per week for the abs and 8-12 for the obliques',
    intensity: 'RPE 7-8: the last reps slow, one or two left in reserve',
    frequency: '3-4x per week, split between the daily sessions and the gym',
    rationale:
      'The trunk muscles grow like any other skeletal muscle: from hard sets near '
      + 'failure, accumulated over the week. Holds keep the trunk stiff but load it '
      + 'mostly isometrically; size needs movement against resistance. The rectus is '
      + 'one muscle, but where the movement starts shifts the emphasis: curling the '
      + 'pelvis up (reverse crunch, leg raise with a tuck) biases the lower portion, '
      + 'curling the ribs down biases the upper. Obliques are loaded by rotation and '
      + 'side-bending against resistance, which is why hip dips, chops and twists are '
      + 'here rather than more planks. Visible definition is set by body fat: abdominal '
      + 'training alone did not reduce abdominal fat.',
    source:
      'Schoenfeld, Ogborn and Krieger, dose-response of weekly training volume and '
      + 'hypertrophy, J Sports Sci (2017); Vispute et al., abdominal exercise and '
      + 'abdominal fat, J Strength Cond Res (2011); regional rectus abdominis EMG '
      + 'studies of pelvic-tilt versus trunk-curl movements.',
  },

  'back-strength': {
    id: 'back-strength',
    name: 'Lower-Back Strength',
    quality: 'Back extensor and hip extensor strength and endurance',
    work: '10-15 controlled reps, a one-second hold at the top',
    rest: '45-90s',
    sets: '2-3',
    intensity: 'Moderate, building to RPE 8. Never to a grinding failure.',
    frequency: '3x per week',
    rationale:
      'Back extensor endurance is consistently lower in people who later develop back '
      + 'trouble, and the extensors respond to direct training like any other muscle. '
      + 'The order is graded: hold a neutral spine while the limbs move (bird dog), then '
      + 'extend against bodyweight lying face down, then hinge at the hip with a band or '
      + 'a weight. Extension and hinging keep the spine near neutral, so they suit a '
      + 'morning session where loaded flexion does not. For a back that is weak rather '
      + 'than painful, load is the goal, introduced in steps.',
    source:
      'McGill, Low Back Disorders, and the Biering-Sorensen extensor endurance '
      + 'literature; Steele et al., isolated lumbar extension resistance training '
      + 'reviews.',
  },

  // ---------------------------------------------------------------------------
  // HEAL: training around an injured finger
  // ---------------------------------------------------------------------------

  'train-around': {
    id: 'train-around',
    name: 'Training Around a Finger Injury',
    quality: 'Keeping everything else strong while one finger heals',
    work: 'Gym strength for the legs, the hinge, pressing and the trunk. Nothing that closes the hand under load.',
    rest: 'As each exercise prescribes',
    sets: 'As each exercise prescribes',
    intensity: 'Up to RPE 8 on everything that does not touch the hand. Zero pain in the finger, ever.',
    frequency: 'Two to three gym sessions a week until the finger is cleared to climb',
    rationale:
      'Most finger pulley and tendon strains in climbers heal with a short period of '
      + 'relative rest followed by graded loading, and the finger decides the timeline, '
      + 'not the calendar. The rest of the body does not need to wait: whole-body '
      + 'strength is kept or built in exactly the qualities climbing never trains, and '
      + 'strength training is the best-supported injury-prevention intervention in '
      + 'sport. The one rule is that the hand only ever rests on things, or presses '
      + 'flat: a barbell on the back, a plate hugged to the chest, a flat palm on the '
      + 'floor. Pain-free tendon glides keep the finger moving, which every pulley '
      + 'protocol asks for from the first days. A finger that hurts more after a '
      + 'session than before it is a reason to stop and see a hand therapist.',
    source:
      'Schoffl et al., pulley injuries in rock climbers: diagnosis and conservative '
      + 'treatment, Wilderness Environ Med (2003) and the 2021 update; Lauersen, '
      + 'Bertelsen and Andersen, exercise interventions to prevent sports injuries, '
      + 'Br J Sports Med (2014); Wehbe and Hunter, tendon gliding exercises, J Hand '
      + 'Surg (1985).',
  },

  'ring-rehab': {
    id: 'ring-rehab',
    name: 'Graded Loading of an Injured Finger',
    quality: 'Tendon and muscle capacity in one injured finger, built back step by step',
    work: '12 slow reps: the finger alone lifts a portable edge with a few kilos on it',
    rest: '60-90s between sets',
    sets: '3 sets, every second day',
    intensity: 'Starts at 1.5-2kg. Up half a kilo once all 36 reps are clean and pain is 2/10 or less, during and the next morning.',
    frequency: 'Every second day, until the left lifts 80% of what the right lifts for 12',
    rationale:
      'The athlete\'s physiotherapist could not tell a flexor tendon strain from a '
      + 'lumbrical (hand muscle) strain, and prescribed the same thing for both: '
      + 'isolated, graded loading of the injured finger. Healing tissue remodels along '
      + 'the load it is given, so slow, light, repeated loading rebuilds it better than '
      + 'rest alone, and the healthy finger on the other hand is the yardstick for '
      + 'when it is ready. The other fingers stay closed in a fist so the ring finger '
      + 'does the work alone. A day between sessions lets the tissue answer the load. '
      + 'Pain is the guide: up to 2/10 during the set and the next morning is fine, '
      + 'more means hold the load or drop half a kilo, and a sharp pain or a pop '
      + 'means stop and call the physio.',
    source:
      'The athlete\'s physiotherapist (October 2026). Background: Schoffl et al., '
      + 'pulley injuries in rock climbers, Wilderness Environ Med (2003, updated 2021); '
      + 'Schweizer, lumbrical tears in rock climbers, J Hand Surg Br (2003); '
      + 'Silbernagel et al., pain-monitoring model for tendon loading, Am J Sports Med (2007).',
  },

  'heal-strength': {
    id: 'heal-strength',
    name: 'Barbell Strength for the Legs and Hinge',
    quality: 'Maximal and sub-maximal leg and posterior-chain strength',
    work: '4-6 reps on the main lift, 8-10 on the supporting lifts',
    rest: '150-180s on the main lift, 90-120s on the supporting lifts',
    sets: '3-4 working sets',
    intensity: 'RPE 7-8: two reps left in reserve. The last rep fast, never a grind.',
    frequency: '1-2x per week per pattern',
    rationale:
      'A climber off the wall has spare recovery for the first time in years, and the '
      + 'legs and hips are where it buys the most: high steps, rockovers, heel hooks '
      + 'and dynos are leg strength and leg power, and they add little mass for the '
      + 'force they give. Low-rep sets at two reps in reserve build strength with '
      + 'little soreness, so the next session is not lost, and hard sets near failure '
      + 'grow muscle across a wide range of loads, so size comes from the 8-10 rep '
      + 'work without grinding the heavy sets. Rest is set long because a short rest '
      + 'lowers the load lifted and the strength gained.',
    source:
      'ACSM position stand, progression models in resistance training (2009); '
      + 'Schoenfeld et al., loading recommendations for strength and hypertrophy '
      + '(2017, 2021); Grgic et al., inter-set rest and strength (2018); Barbalho et '
      + 'al., back squat versus hip thrust (2020).',
  },
};

export function getProtocol(id: string | undefined): Protocol | null {
  if (!id) return null;
  return PROTOCOLS[id] ?? null;
}
