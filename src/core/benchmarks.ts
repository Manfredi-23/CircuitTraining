// =============================================================================
// benchmarks.ts — Testable standards, and the athlete profile they resolve against
//
// The point of a benchmark is to tell you which capacity is actually holding you
// back, so training targets a limiter instead of a preference. Numbers below are
// published reference data; where a figure is an interpolation or an
// approximation it says so.
// =============================================================================

import type { Benchmark, BenchmarkRecord, BenchmarkResult, Capacity } from './types';

/**
 * The athlete this programme is written for. Bodyweight drives every load
 * target in the app, so it lives in one place.
 */
export interface AthleteProfile {
  bodyweightKg: number;
  heightCm: number;
  age: number;
  /** Grade redpointed reliably in 5-15 tries, French sport. */
  redpoint: string;
  /** Hardest sport grade ever done. */
  redpointBest: string;
  /** Onsight / flash level, sport. */
  onsight: string;
  /** Grade sent reliably in 5-15 tries, Font. */
  boulder: string;
  /** Hardest boulder ever done, Font. */
  boulderBest: string;
  /** Flash level, Font. */
  boulderFlash: string;
  years: number;
  /**
   * Climbing sessions per week. These are NOT spare slots: all three are
   * already committed to climbing, so structured work has to ride along with
   * them rather than being added on top.
   */
  climbingSessionsPerWeek: number;
  /** Prior experience with structured hangboarding or gym strength work. */
  structuredTraining: 'none' | 'some' | 'experienced';
  /**
   * Standing constraints that override the generic prescription. Anything
   * listed here is a reason to hold intensity down, not a detail.
   */
  flags: string[];
}

export const ATHLETE: AthleteProfile = {
  bodyweightKg: 62,
  heightCm: 172,
  age: 35,
  redpoint: '7a',
  redpointBest: '7b',
  onsight: '6b',
  boulder: '7a',
  boulderBest: '7b',
  boulderFlash: '6b+',
  years: 4,
  climbingSessionsPerWeek: 3,
  structuredTraining: 'none',
  flags: [
    'Fingers are a STRENGTH, not a limiter. Reported one-arm 10mm block pull of '
    + '60-61kg at 62kg bodyweight, consistent with a crimp-and-steep specialist '
    + 'bouldering Font 7b. Do not spend the programme chasing max finger strength.',
    'Fingers and wrists are currently symptomatic. Combined with the above, this '
    + 'reads as chronic overload rather than insufficient capacity: strong hands '
    + 'absorbing load that a weak trunk is not carrying.',
    'Pulling is comparatively weak. 8 strict pull-ups, never weighted, against '
    + 'genuinely strong fingers. Estimated 125-130% bodyweight versus a 165% '
    + 'standard. Large newbie gains available in tissue that is not complaining.',
    'Body tension untrained. No front lever experience at all. This is the most '
    + 'likely reason strong fingers still open on a single hard move: the hand is '
    + 'the symptom, the collapsing position is the cause.',
    'Slow pump recovery against high peak force: the classic strong-but-no-engine '
    + 'boulderer profile. Forearm capacity, not max strength, is the finger '
    + 'quality worth training.',
    'Onsight 6b against a 7a redpoint is a four-step gap. The largest available '
    + 'grade gain is technical and tactical, not physical.',
    'Hip mobility poor. Directly implicated in the stated weakness on slabs and '
    + 'technical climbing.',
    'No history of structured hangboarding or strength training. Start every '
    + 'protocol at level 1 regardless of climbing grade: climbing grade says '
    + 'nothing about tolerance for a loading protocol.',
  ],
};

/**
 * Sport grade to boulder grade cross-reference used to read the V-scale
 * benchmark tables. This is an approximation for a route-focused climber and is
 * deliberately conservative — Lattice publish their finger strength data against
 * boulder grades, so route grades have to be mapped in.
 */
export const GRADE_MAP: Record<string, string> = {
  '6b':  'V3',
  '6c':  'V4',
  '7a':  'V4',
  '7a+': 'V5',
  '7b':  'V5',
  '7b+': 'V6',
  '7c':  'V6',
  '7c+': 'V7',
  '8a':  'V8',
};

/**
 * Font to V-scale, for reading the benchmark tables off a boulder grade.
 *
 * This matters: European boulder grades are Font, and Font 7a is V6, not V6-ish
 * or V4. Reading a Font grade as if it were a French sport grade understates
 * the finger-strength target by two full grades.
 */
export const FONT_GRADE_MAP: Record<string, string> = {
  '6a':  'V3',
  '6a+': 'V3',
  '6b':  'V4',
  '6b+': 'V4',
  '6c':  'V5',
  '6c+': 'V5',
  '7a':  'V6',
  '7a+': 'V7',
  '7b':  'V8',
  '7b+': 'V8',
  '7c':  'V9',
  '7c+': 'V10',
};

/**
 * Edge size is not a free parameter. Every published benchmark in this file is
 * on a 20mm flat edge, and scores on other edges do not convert cleanly — a
 * 10mm score reads far lower than a 20mm one for the same fingers, and the
 * ratio varies between people. A number measured on any other edge is a number
 * about that edge, and cannot be compared to the tables below.
 *
 * 10mm and smaller also concentrates load over a much shorter contact area,
 * which is exactly the loading pattern implicated in pulley and finger joint
 * complaints. It is not a testing edge for someone whose fingers are talking.
 */
export const REFERENCE_EDGE_MM = 20;

export const BENCHMARKS: Benchmark[] = [
  {
    id: 'fs-2arm-20mm',
    short: '% BW',
    name: 'Two-arm max hang, 20mm half-crimp',
    capacity: 'crimp',
    unit: '% bodyweight (total load / bodyweight)',
    protocol:
      'Fully warm, after a rest day. 20mm flat edge, half-crimp, both arms. A ramp '
      + 'of 7s hangs, each heavier than the last, 2 minutes apart, reaching the max '
      + 'within 4-8 hangs. Score = heaviest clean 7s: (bodyweight + added) / '
      + 'bodyweight x 100.',
    standards: [
      { label: 'V4',  value: 128 },
      { label: 'V5',  value: 134 },
      { label: 'V6',  value: 140 },
      { label: 'V7',  value: 146 },
      { label: 'V8',  value: 152 },
      { label: 'V9',  value: 158 },
      { label: 'V10', value: 164 },
      { label: 'V11', value: 170 },
    ],
    source: 'Lattice Training two-arm finger strength dataset (roughly +6% per V-grade).',
    note:
      'The reference edge is 20mm flat. Scores on a different edge are not '
      + 'comparable — a 15mm score will read far lower and a 25mm far higher.',
  },
  {
    id: 'fs-1arm-20mm',
    short: '% BW',
    name: 'One-arm pull, 20mm',
    capacity: 'crimp',
    unit: '% bodyweight pulled through one arm',
    protocol:
      'On a force gauge or a weight-assisted one-arm hang, 7-10s, half-crimp, '
      + '20mm edge. Score = peak force / bodyweight x 100.',
    standards: [
      { label: 'V4',  value: 49 },
      { label: 'V5',  value: 55 },
      { label: 'V6',  value: 61 },
      { label: 'V7',  value: 67 },
      { label: 'V8',  value: 73 },
      { label: 'V9',  value: 79 },
      { label: 'V10', value: 85 },
      { label: 'V11', value: 91 },
    ],
    source: 'Lattice Training one-arm finger strength dataset.',
  },
  {
    id: 'fs-1arm-10mm',
    short: '% BW',
    name: 'One-arm block pull, 10mm',
    capacity: 'crimp',
    unit: '% bodyweight pulled through one arm',
    protocol:
      'Fully warm. 10mm block or edge, half-crimp, one arm, 7-10s pull on a force '
      + 'gauge or against a fixed anchor. Score = peak force / bodyweight x 100.',
    standards: [
      { label: 'Reference: current', value: 97 },
    ],
    source:
      'Self-reported, September 2026: 60-61kg at 62kg bodyweight. No published '
      + 'dataset exists for this edge and protocol combination.',
    note:
      'This is tracked as its own benchmark rather than converted. Edge size is '
      + 'not a scaling factor: 10mm and 20mm recruit differently and the ratio '
      + 'varies between people, so a 10mm score cannot be read against the 20mm '
      + 'tables in either direction. Retest on the same edge, same setup, to '
      + 'measure change; use the 20mm test to compare against published standards.',
  },
  {
    id: 'weighted-pullup',
    short: '% BW',
    name: 'Weighted pull-up, est. 1RM (old method)',
    capacity: 'pull',
    unit: '% bodyweight (total load / bodyweight)',
    protocol:
      'One strict pull-up, dead hang to chin over bar, added weight on a harness. '
      + 'Score = (bodyweight + added) / bodyweight x 100. A 5RM x 1.15 estimate is '
      + 'acceptable and safer.',
    standards: [],
    note:
      'Retired method: a 5RM converted to an estimated 1RM. Kept for history and read by the '
      + 'one-arm gates (divided by 1.067) until a 2RM is recorded. Not comparable to the 2RM '
      + 'standards.',
    source:
      'Lattice Training weighted pull-up dataset (>700 assessments); 165% is their '
      + 'published male standard, below which pulling strength is usually a limiter '
      + 'and above which returns diminish sharply.',
  },
  {
    id: 'max-pullups',
    short: 'reps',
    name: 'Strict pull-ups to failure',
    capacity: 'pull',
    unit: 'reps',
    protocol: 'Dead hang start, chin over bar, no kipping, no leg drive.',
    standards: [
      { label: 'Developing', value: 8 },
      { label: 'Solid',      value: 15 },
      { label: 'Strong',     value: 20 },
    ],
    source: 'General climbing assessment batteries.',
  },
  {
    id: 'lockoff-90',
    short: 's',
    name: '90-degree lock-off hold',
    capacity: 'pull',
    unit: 'seconds, one arm',
    protocol:
      'Hang from a bar, pull to 90 degrees of elbow flexion on one arm with the '
      + 'other hand lightly on the wrist, hold. Time each side.',
    standards: [
      { label: 'Developing', value: 5 },
      { label: 'Solid',      value: 10 },
      { label: 'Strong',     value: 15 },
    ],
    source: 'Climbing-specific strength assessment literature.',
  },
  {
    id: 'critical-force',
    short: '%',
    name: 'Forearm critical force',
    capacity: 'forearm',
    unit: '% of max hang load sustainable',
    protocol:
      '24 maximal pulls in a 7s on / 3s off rhythm (4 minutes total) on a force '
      + 'gauge. Critical force is the mean force of the last 6 pulls, expressed '
      + 'against peak force.',
    standards: [
      { label: 'Developing', value: 55 },
      { label: 'Solid',      value: 63 },
      { label: 'Strong',     value: 70 },
    ],
    source:
      'Lattice 4-minute all-out finger flexor test; Giles et al. validation study '
      + 'in sport climbers (2024). Requires a force gauge such as a Tindeq.',
    note: 'Without a gauge, substitute time-to-failure on repeaters at a fixed load.',
  },
  {
    id: 'front-lever',
    short: 'LVL',
    name: 'Front lever progression',
    capacity: 'tension',
    unit: 'seconds held at current progression',
    protocol:
      'Hold the hardest progression with a flat lower back and straight arms: '
      + 'tuck, advanced tuck, one-leg, straddle, full.',
    standards: [
      { label: 'Tuck 10s',          value: 1 },
      { label: 'Advanced tuck 10s', value: 2 },
      { label: 'One-leg 10s',       value: 3 },
      { label: 'Straddle 10s',      value: 4 },
      { label: 'Full 10s',          value: 5 },
    ],
    source: 'Standard gymnastic progression, used widely in climbing assessment.',
  },
  {
    id: 'hip-footraise',
    short: 'cm',
    name: 'Standing foot raise height',
    capacity: 'mobility',
    unit: 'cm from floor to heel',
    protocol:
      'Standing, raise one foot as high as possible with hip flexed, abducted and '
      + 'externally rotated, knee bent. Measure floor to heel. Both sides.',
    standards: [
      { label: 'Developing', value: 65 },
      { label: 'Average',    value: 74 },
      { label: 'Strong',     value: 85 },
    ],
    source:
      'Adapted Grant foot raise test; climbing mobility assessment literature '
      + '(mean around 74cm).',
  },
  {
    id: 'bodyweight',
    name: 'Bodyweight',
    capacity: 'legs',
    short: 'kg',
    unit: 'kg',
    protocol: 'On a scale before warming up, same clothes and time of day each test.',
    standards: [],
    source: 'Not a performance standard. Recorded so every % bodyweight result is computed against the weight on the day.',
  },
  {
    id: 'max-pushups',
    name: 'Push-ups to failure',
    capacity: 'press',
    short: 'reps',
    unit: 'reps',
    protocol: 'Chest to a fist from the floor, full lockout, body straight. Stop at the first rep that breaks form.',
    standards: [
      { label: 'Fair',      value: 17 },
      { label: 'Good',      value: 22 },
      { label: 'Very good', value: 30 },
    ],
    source: 'Approximate general-population norms for men aged 30-39 (ACSM-style push-up tables). A balance check against pulling, not a climbing standard.',
  },
  {
    id: 'leg-raise-reps',
    name: 'Strict hanging leg raises',
    capacity: 'tension',
    short: 'reps',
    unit: 'reps',
    protocol: 'Dead hang, straight legs raised to at least horizontal, no swing, controlled lowering. Straps allowed if the fingers complain.',
    standards: [],
    source: 'No published climbing standard. Tracked against your own previous results.',
  },
  {
    id: 'hollow-hold',
    name: 'Hollow body hold',
    capacity: 'tension',
    short: 's',
    unit: 'seconds',
    protocol: 'Arms overhead, legs straight and low, lower back pressed flat. Time ends when the lower back lifts.',
    standards: [
      { label: 'Developing', value: 30 },
      { label: 'Solid',      value: 60 },
      { label: 'Strong',     value: 90 },
    ],
    source: 'Approximate gymnastics conditioning benchmarks; no climbing dataset exists.',
  },
  {
    id: 'side-plank',
    name: 'Side plank hold, weaker side',
    capacity: 'tension',
    short: 's',
    unit: 'seconds',
    protocol: 'Forearm side plank, feet stacked, straight line head to heel. Time ends when the hips drop. Both sides; enter the weaker.',
    standards: [
      { label: 'Developing', value: 60 },
      { label: 'Average',    value: 95 },
      { label: 'Strong',     value: 120 },
    ],
    source: 'McGill trunk endurance norms for healthy young men (side bridge roughly 95s); approximate.',
    note: 'A left/right difference of more than about 5% is worth training out.',
  },
  {
    id: 'back-extension-hold',
    name: 'Back extension hold (Biering-Sorensen)',
    capacity: 'tension',
    short: 's',
    unit: 'seconds',
    protocol: 'Hips on the edge of a bench or the 45-degree back extension, ankles fixed, arms crossed, torso held horizontal. Time ends when it drops below horizontal.',
    standards: [
      { label: 'Developing', value: 90 },
      { label: 'Average',    value: 146 },
      { label: 'Strong',     value: 180 },
    ],
    source: 'Biering-Sorensen extensor endurance test; McGill norms for healthy young men (roughly 146s). Approximate.',
    note: 'Lower extensor endurance is associated with later back trouble. This tracks the weak point directly.',
  },
  {
    id: 'repeaters-20mm',
    name: '7:3 repeaters to failure, 20mm',
    capacity: 'forearm',
    short: 'reps',
    unit: 'hangs completed',
    protocol: '20mm edge, half-crimp, bodyweight. Hang 7s, rest 3s, repeat until a hang fails. Score = completed hangs.',
    standards: [],
    source: 'Gauge-free stand-in for the critical force test. Tracked against your own previous results.',
  },
  {
    id: 'straddle',
    name: 'Seated straddle width',
    capacity: 'mobility',
    short: 'cm',
    unit: 'cm heel to heel',
    protocol: 'Sit against a wall, legs straight and as wide as possible, knees up. Measure heel to heel.',
    standards: [],
    source: 'No published climbing standard. Tracked against your own previous results.',
  },
  {
    id: 'sit-reach',
    name: 'Sit and reach',
    capacity: 'mobility',
    short: 'cm',
    unit: 'cm past the toes (negative = short of them)',
    protocol: 'Seated, legs straight together, reach forward slowly and hold two seconds. Measure fingertips relative to the toes.',
    standards: [
      { label: 'Below average', value: -5 },
      { label: 'Average',       value: 0 },
      { label: 'Good',          value: 10 },
    ],
    source: 'Approximate sit-and-reach norms, measured from the toes.',
  },
  {
    id: 'shoulder-reach',
    name: 'Overhead reach gap',
    capacity: 'shoulder',
    short: 'cm',
    better: 'lower',
    unit: 'cm from thumbs to wall',
    protocol: 'On your back, knees bent, lower back flat. Raise straight arms overhead toward the floor. Measure the gap from thumbs to floor; 0 is touching.',
    standards: [],
    source: 'Shoulder flexion screen. No published standard; 0 cm is full range.',
  },  {
    id: 'weighted-pullup-2rm',
    name: 'Weighted pull-up 2RM',
    capacity: 'pull',
    short: '% BW',
    unit: '% bodyweight (total load / bodyweight)',
    protocol:
      'A ramp of 2-rep sets, each heavier than the last, 3 minutes apart: dead hang '
      + 'to chin over bar, no kip. Score = heaviest clean 2 reps: (bodyweight + '
      + 'added) / bodyweight x 100.',
    standards: [
      { label: 'Developing',       value: 120 },
      { label: 'Solid',            value: 140 },
      { label: 'Lattice standard', value: 165 },
    ],
    source:
      'Lattice Training: 733 weighted pull-up 2-rep-max tests; ~165% for men is the '
      + 'point below which pulling strength usually limits climbing and above which '
      + 'returns diminish. Developing and Solid are approximate interpolations.',
  },
  {
    id: 'toes-to-bar',
    name: 'Max strict toes-to-bar',
    capacity: 'tension',
    short: 'reps',
    unit: 'strict reps',
    protocol: 'Dead hang, toes to the bar and back to a still hang, no swing. One set; the set ends at the first rep that misses or kips.',
    standards: [],
    source: 'No published climbing standard. Tracked against your own previous results.',
    note: 'Replaced the front lever ramp in ASSESS: scored alone without judging a body line.',
  },
  {
    id: 'hollow-hold',
    name: 'Hollow body hold',
    capacity: 'tension',
    short: 's',
    unit: 'seconds',
    protocol: 'On the back, arms overhead, shoulders and feet off the floor, lower back pressed into the mat. Time ends when the lower back lifts or a limb touches down.',
    standards: [],
    source: 'Gymnastics conditioning hold; no published norm. Tracked against your own previous results.',
    note: 'Replaced the McGill flexor hold in ASSESS, which needs a wedge or a partner.',
  },
  {
    id: 'prone-extension-hold',
    name: 'Prone extension hold (Ito)',
    capacity: 'tension',
    short: 's',
    unit: 'seconds',
    protocol: 'Face down, cushion under the lower belly, arms by the sides. Lift the breastbone just off the floor and hold. Time ends when the chest touches down.',
    standards: [],
    source: 'Ito et al. (1996), a floor-only alternative to the Biering-Sorensen extensor test. Tracked against your own previous results.',
    note: 'Replaced the back extension hold in ASSESS, which needs a bench and fixed ankles.',
  },
  {
    id: 'trunk-flexor-hold',
    name: 'Trunk flexor hold (McGill)',
    capacity: 'tension',
    short: 's',
    unit: 'seconds',
    protocol:
      'Seated, back resting on a support at 60 degrees, knees and hips bent 90, feet '
      + 'anchored, arms crossed. The support is pulled 10cm back; hold the angle. '
      + 'Time ends when the back drops to the support.',
    standards: [
      { label: 'Developing', value: 90 },
      { label: 'Average',    value: 144 },
      { label: 'Strong',     value: 180 },
    ],
    source: 'McGill torso endurance battery; mean around 144s in healthy young men. Approximate.',
    note: 'Read against the back extension hold: flexor / extensor should stay below 1.0.',
  },
  {
    id: 'side-plank-left',
    name: 'Side plank hold, left',
    capacity: 'tension',
    short: 's',
    unit: 'seconds',
    protocol: 'Full side bridge on the left forearm, legs straight, top foot in front of the bottom one. Time ends when the hips drop.',
    standards: [
      { label: 'Developing', value: 60 },
      { label: 'Average',    value: 95 },
      { label: 'Strong',     value: 120 },
    ],
    source: 'McGill torso endurance battery (side bridge roughly 95-99s in healthy young men). Approximate.',
  },
  {
    id: 'side-plank-right',
    name: 'Side plank hold, right',
    capacity: 'tension',
    short: 's',
    unit: 'seconds',
    protocol: 'Full side bridge on the right forearm, legs straight, top foot in front of the bottom one. Time ends when the hips drop.',
    standards: [
      { label: 'Developing', value: 60 },
      { label: 'Average',    value: 95 },
      { label: 'Strong',     value: 120 },
    ],
    source: 'McGill torso endurance battery (side bridge roughly 95-99s in healthy young men). Approximate.',
  },
];

export function getBenchmark(id: string): Benchmark | null {
  return BENCHMARKS.find(b => b.id === id) ?? null;
}

export function benchmarksForCapacity(capacity: Capacity): Benchmark[] {
  return BENCHMARKS.filter(b => b.capacity === capacity);
}

/** Absolute load in kg corresponding to a % bodyweight standard. */
export function standardToKg(percentBodyweight: number, bodyweightKg = ATHLETE.bodyweightKg): number {
  return Math.round((percentBodyweight / 100) * bodyweightKg * 10) / 10;
}

/** Added weight in kg needed to reach a % bodyweight standard. */
export function standardToAddedKg(percentBodyweight: number, bodyweightKg = ATHLETE.bodyweightKg): number {
  return Math.round((standardToKg(percentBodyweight, bodyweightKg) - bodyweightKg) * 10) / 10;
}

function standardsAtVGrade(
  benchmarkId: string,
  vGrade: string | undefined,
): { current: number | null; next: number | null } {
  const bench = getBenchmark(benchmarkId);
  if (!bench || !vGrade) return { current: null, next: null };

  const idx = bench.standards.findIndex(s => s.label === vGrade);
  if (idx === -1) return { current: null, next: null };

  return {
    current: bench.standards[idx].value,
    next: bench.standards[idx + 1]?.value ?? null,
  };
}

/** The standard for a sport redpoint grade, and the next one up. */
export function targetsForGrade(
  benchmarkId: string,
  redpoint = ATHLETE.redpoint,
): { current: number | null; next: number | null } {
  return standardsAtVGrade(benchmarkId, GRADE_MAP[redpoint]);
}

/**
 * The standard for a Font boulder grade.
 *
 * For finger strength this is the reading that matters. Lattice's dataset is
 * built on boulder grades, and a climber who boulders Font 7a is being asked
 * for V6 finger strength whatever their route grade says.
 */
export function targetsForBoulderGrade(
  benchmarkId: string,
  boulder = ATHLETE.boulder,
): { current: number | null; next: number | null } {
  return standardsAtVGrade(benchmarkId, FONT_GRADE_MAP[boulder]);
}

/**
 * A 5RM predicts a 1RM at about 1.15 times the load, applied to the whole
 * system mass — bodyweight plus belt — because that is what the lats move.
 */
const FIVE_RM_TO_ONE_RM = 1.15;

/**
 * Convert what the athlete entered on a test into the benchmark's own unit.
 * Rounded to whole numbers: the standards are whole numbers, and a decimal
 * point on a self-timed test is precision the measurement does not have.
 */
export function benchmarkValueFromEntry(
  record: BenchmarkRecord,
  entered: number,
  bodyweightKg = ATHLETE.bodyweightKg,
): number {
  switch (record.convert) {
    case 'added-kg-to-pct-bw':
      return Math.round(((bodyweightKg + entered) / bodyweightKg) * 100);
    case 'five-rm-to-pct-bw':
      return Math.round((((bodyweightKg + entered) * FIVE_RM_TO_ONE_RM) / bodyweightKg) * 100);
    case 'kg-to-pct-bw':
      return Math.round((entered / bodyweightKg) * 100);
    case 'identity':
    default:
      return Math.round(entered);
  }
}

/** Every result for a benchmark, oldest first. */
export function resultHistory(results: BenchmarkResult[], benchmarkId: string): BenchmarkResult[] {
  return results
    .filter(r => r.benchmarkId === benchmarkId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** The result that counts: the most recent one. */
export function latestResult(results: BenchmarkResult[], benchmarkId: string): BenchmarkResult | null {
  const history = resultHistory(results, benchmarkId);
  return history.length ? history[history.length - 1] : null;
}

/** Bodyweight on the latest test, or the profile's figure until one is recorded. */
export function currentBodyweight(results: BenchmarkResult[]): number {
  return latestResult(results, 'bodyweight')?.value ?? ATHLETE.bodyweightKg;
}

/**
 * Add a result to the history. A second result for the same test on the same
 * day replaces the first, so a re-run corrects rather than duplicates.
 */
export function addResult(results: BenchmarkResult[], result: BenchmarkResult): BenchmarkResult[] {
  const day = result.date.slice(0, 10);
  return [
    ...results.filter(r => !(r.benchmarkId === result.benchmarkId && r.date.slice(0, 10) === day)),
    result,
  ];
}

/**
 * Results from a retired method that still count for a newer benchmark,
 * converted onto its scale. The weighted pull-up moved from an estimated 1RM
 * (5RM x 1.15) to a tested 2RM; 1RM = 2RM x 1.067 (Epley), so an old result is
 * divided by that to read on the 2RM scale.
 */
const EQUIVALENTS: Record<string, { from: string; factor: number }> = {
  'weighted-pullup-2rm': { from: 'weighted-pullup', factor: 1 / 1.067 },
};

/** The result a gate reads: the latest on this benchmark, else a converted older method. */
export function gateResult(results: BenchmarkResult[], benchmarkId: string): BenchmarkResult | null {
  const direct = latestResult(results, benchmarkId);
  if (direct) return direct;
  const eq = EQUIVALENTS[benchmarkId];
  const old = eq ? latestResult(results, eq.from) : null;
  return old ? { ...old, benchmarkId, value: Math.round(old.value * eq.factor) } : null;
}

/** Whether a recorded result clears a gate threshold. The latest result decides. */
export function meetsStandard(
  results: BenchmarkResult[],
  benchmarkId: string,
  minValue: number,
): boolean {
  const result = gateResult(results, benchmarkId);
  if (!result) return false;
  return result.value >= minValue;
}
