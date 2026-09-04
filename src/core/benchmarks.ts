// =============================================================================
// benchmarks.ts — Testable standards, and the athlete profile they resolve against
//
// The point of a benchmark is to tell you which capacity is actually holding you
// back, so training targets a limiter instead of a preference. Numbers below are
// published reference data; where a figure is an interpolation or an
// approximation it says so.
// =============================================================================

import type { Benchmark, BenchmarkResult, Capacity } from './types';

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
    'Fingers and wrists are currently symptomatic. No maximal finger loading '
    + 'until they have been quiet for several weeks. Get a diagnosis.',
    'No history of structured hangboarding or strength training. Start at '
    + 'level 1 regardless of climbing grade — climbing grade says nothing about '
    + 'connective tissue tolerance for a loading protocol.',
    'Falls off single hard moves, not from pump, but needs long rests to '
    + 'recover between attempts: recruitment ceiling plus low forearm capacity.',
    'Onsight 6b against a 7a redpoint is a four-step gap. The largest available '
    + 'grade gain is technical and tactical, not physical.',
    'Hip mobility poor. Directly implicated in the stated weakness on slabs and '
    + 'technical climbing.',
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
    name: 'Two-arm max hang, 20mm half-crimp',
    capacity: 'crimp',
    unit: '% bodyweight (total load / bodyweight)',
    protocol:
      'Fully warm. 20mm flat edge, half-crimp, both arms, 7-10s hang. Add weight '
      + 'until 10s is the most you can hold with good form. Score = '
      + '(bodyweight + added) / bodyweight x 100.',
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
    id: 'weighted-pullup',
    name: 'Weighted pull-up 1RM',
    capacity: 'pull',
    unit: '% bodyweight (total load / bodyweight)',
    protocol:
      'One strict pull-up, dead hang to chin over bar, added weight on a harness. '
      + 'Score = (bodyweight + added) / bodyweight x 100. A 5RM x 1.15 estimate is '
      + 'acceptable and safer.',
    standards: [
      { label: 'Developing',       value: 120 },
      { label: 'Solid',            value: 140 },
      { label: 'Lattice standard', value: 165 },
      { label: 'Strong',           value: 180 },
    ],
    source:
      'Lattice Training weighted pull-up dataset (>700 assessments); 165% is their '
      + 'published male standard, below which pulling strength is usually a limiter '
      + 'and above which returns diminish sharply.',
  },
  {
    id: 'max-pullups',
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

/** Whether a recorded result clears a gate threshold. */
export function meetsStandard(
  results: BenchmarkResult[],
  benchmarkId: string,
  minValue: number,
): boolean {
  const result = results.find(r => r.benchmarkId === benchmarkId);
  if (!result) return false;
  return result.value >= minValue;
}
