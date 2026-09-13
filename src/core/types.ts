// =============================================================================
// types.ts — All TypeScript types for the 7Bit app
//
// v10 training model. The old model tracked 12 bodybuilding muscle groups and
// progressed by adding reps and cutting rest. That trains local muscular
// endurance, which is not what limits a climber. This model tracks the ten
// physical capacities that actually determine climbing performance and
// progresses by LOAD, holding or extending rest on maximal work.
// =============================================================================

export type Mode = 'HOME' | 'CAVE' | 'HANG' | 'MORN';
export type EnergyKey = 'FRESH' | 'NORMAL' | 'TIRED';
export type ScreenName = 'home' | 'workout' | 'rest' | 'complete' | 'stats';
export type SortMode = 'strongest' | 'weakest' | 'recent';
export type TimeFilter = '7days' | '30days' | '90days' | 'total';
export type Trend = 'up' | 'down' | 'stable';
export type ExerciseUnit = 'reps' | 'sec';
export type ExerciseAction = 'done' | 'skip';

// ---- Capacities --------------------------------------------------------------
// The trainable axes that predict climbing performance. Finger strength is split
// by grip type because the two grips adapt semi-independently and are trained
// with different loads. "Muscle groups" like chest and biceps are deliberately
// absent: they are trained as antagonists for joint health, not as performance
// drivers, and hypertrophy there is dead weight for a strength-to-weight sport.

export type Capacity =
  | 'crimp'      // half-crimp finger strength (20mm reference edge)
  | 'openhand'   // open-hand / three-finger-drag finger strength
  | 'forearm'    // finger endurance: critical force, recovery on the wall
  | 'pull'       // vertical pulling chain: lat, scapula, elbow flexors
  | 'contact'    // contact strength / rate of force development / power
  | 'tension'    // body tension: anti-extension, anti-rotation, hip flexion
  | 'press'      // antagonist pressing: chest, triceps, overhead
  | 'shoulder'   // rotator cuff, scapular control, elbow armour
  | 'legs'       // lower-body strength and hip drive
  | 'mobility';  // hip, shoulder and ankle range of motion

/** @deprecated Retained so persisted data and older call sites keep resolving. */
export type MuscleGroup = Capacity;

// ---- Session structure -------------------------------------------------------

/**
 * Blocks order a session by neurological cost. Highest-quality work goes first,
 * when the fingers and CNS are fresh; conditioning goes last, where fatigue
 * costs nothing.
 */
export type BlockType =
  | 'WARMUP'
  | 'PRIMARY'    // maximal-quality work: max hangs, limit boulders, heavy pulls
  | 'SECONDARY'  // supporting strength, still heavy
  | 'ACCESSORY'  // volume work, circuit-friendly
  | 'PREHAB'     // cuff, elbow, wrist — never taken to failure
  | 'MOBILITY'
  | 'TEST';      // assessment protocol, run every 6-8 weeks

export type Intensity = 'TECHNIQUE' | 'EASY' | 'MODERATE' | 'HARD' | 'MAX';

export type LoadKind =
  | 'bodyweight'
  | 'added-kg'
  | 'assisted'
  | 'percent-max'
  | 'edge-mm'
  | 'band'
  | 'rpe';

/** How the exercise is loaded, and the human-readable prescription shown in-app. */
export interface LoadSpec {
  kind: LoadKind;
  /** Numeric anchor where one exists: kg added, mm edge, % of tested max. */
  value?: number;
  /** What the athlete reads on the card, e.g. "BW +18kg" or "20mm, 85% of max". */
  text: string;
}

/**
 * A hard safety gate. Unlike a level requirement, this cannot be earned by
 * accumulating XP — it has to be met on a tested standard. Used for the
 * genuinely dangerous tools (campus board, one-arm work, minimum edge).
 */
export interface Gate {
  benchmarkId: string;
  /** Threshold on that benchmark, in the benchmark's own unit. */
  minValue: number;
  /** Shown when the gate is not met, alongside the substituted exercise. */
  reason: string;
  /** Exercise id used instead while the gate is closed. */
  substituteId?: string;
}

// ---- Config ------------------------------------------------------------------

export interface EnergyConfig {
  label: EnergyKey;
  /** Scales rep-based volume only. Never applied to maximal isometrics. */
  workMult: number;
  /** Added to (or removed from) set count on PRIMARY/SECONDARY blocks. */
  setOffset: number;
  /** Multiplies rest. Always >= 1: tired athletes need more rest, not less. */
  restMult: number;
  /** Ceiling on intensity. Chasing a PR while fatigued is how pulleys go. */
  intensityCap: Intensity | null;
  /** Blocks dropped entirely at this energy level. */
  dropBlocks: BlockType[];
}

export interface LevelConfig {
  level: number;
  xpNeeded: number;
  cumul: number;
  /** Suggested load increase over the level-1 target, as a multiplier. */
  loadStep: number;
  /** Extra sets on PRIMARY blocks. Volume grows slowly and caps out. */
  setBonus: number;
  /** Rest multiplier on PRIMARY/SECONDARY. >= 1 — maximal work never gets rushed. */
  restMult: number;
  /** Rest multiplier on ACCESSORY/PREHAB, where density is a legitimate goal. */
  accessoryRestMult: number;
  unlocks: string;
}

/**
 * Detraining is capacity-specific. Maximal strength holds for weeks; aerobic
 * capacity and mobility fade in days. A single flat penalty across every axis
 * was neither physiological nor useful.
 */
export interface CapacityDecay {
  /** Days of no training before any penalty applies. */
  graceDays: number;
  /** XP removed per window once past the grace period. */
  perWindow: number;
}

export interface DecayConfig {
  /**
   * Skipping and quitting cost no XP. Punishing a skip in an app that
   * prescribes maximal finger loading pushes the athlete to grind through
   * a warning sign. Missed work simply earns nothing.
   */
  skipPenalty: number;
  quitPenalty: number;
  windowDays: number;
  rates: Record<Capacity, CapacityDecay>;
}

export interface UIConfig {
  swipeThreshold: number;
  restFlashDuration: number;
  restBeepCount: number;
  restWarningAt: number;
  cardAnimDuration: number;
}

export interface StorageKeys {
  state: string;
  progress: string;
  sessionLog: string;
  settings: string;
}

export interface StatLines {
  stable: string[];
  improving: string[];
  declining: string[];
  inconsistent: string[];
  fatigue: string[];
  fallback: string[];
}

export interface RecoveryConfig {
  /** Minimum hours between two maximal finger sessions. */
  fingerMaxHours: number;
  /** Minimum hours between two high-intensity sessions of any kind. */
  hardSessionHours: number;
  /** Weeks of loading before a planned deload. */
  mesocycleWeeks: number;
  /** Grace applied during a deload so planned rest is never punished. */
  deloadGraceDays: number;
}

export interface Config {
  modes: Mode[];
  energy: Record<EnergyKey, EnergyConfig>;
  levels: LevelConfig[];
  capacities: Capacity[];
  capacityLabels: Record<Capacity, string>;
  decay: DecayConfig;
  recovery: RecoveryConfig;
  humorLines: string[];
  statLines: StatLines;
  derankMessages: string[];
  ui: UIConfig;
  storage: StorageKeys;
}

// ---- Protocols ---------------------------------------------------------------

/**
 * A named, sourced training protocol. Exercises reference one so the
 * prescription in the app and the evidence behind it never drift apart.
 */
export interface Protocol {
  id: string;
  name: string;
  /** The physiological quality this develops. */
  quality: string;
  work: string;
  rest: string;
  sets: string;
  intensity: string;
  frequency: string;
  /** Why this protocol is prescribed this way. */
  rationale: string;
  source: string;
}

// ---- Benchmarks --------------------------------------------------------------

export interface BenchmarkStandard {
  /** Grade or ability label this standard corresponds to. */
  label: string;
  value: number;
}

export interface Benchmark {
  id: string;
  name: string;
  capacity: Capacity;
  unit: string;
  protocol: string;
  standards: BenchmarkStandard[];
  source: string;
  note?: string;
}

/** A recorded test result, used to open gates and set training loads. */
export interface BenchmarkResult {
  benchmarkId: string;
  value: number;
  date: string;
}

// ---- Exercise Data -----------------------------------------------------------

export interface Variation {
  minLevel: number;
  name: string;
  /** Load prescription override for this variation. */
  load?: string;
}

export interface FormGuide {
  setup: string;
  execution: string;
  cue: string;
  breathing: string;
  mistakes: string;
}

export interface Exercise {
  id: string;
  name: string;
  capacities: Capacity[];
  block: BlockType;
  intensity: Intensity;
  /** Sets of this exercise, completed back to back before moving on. */
  sets: number;
  /** Work per set: reps, or seconds for isometrics. */
  work: number;
  unit: ExerciseUnit;
  /** Rest after each set, in seconds. Set by the quality being trained. */
  restSec: number;
  load: LoadSpec;
  /**
   * The protocol defines this exercise exactly: sets, work and rest are taken
   * as written and never scaled by level or energy. Warm-ups and fixed-dose
   * protocols such as density hangs and repeaters are marked this way.
   */
  fixed?: boolean;
  /** Explicit instruction for making this harder next time. */
  progression: string;
  protocolId?: string;
  note?: string;
  perSide?: boolean;
  /** Capacity level at which this exercise enters the session. */
  minLevel?: number;
  gate?: Gate;
  variations?: Variation[];
  form?: FormGuide;
}

export interface ScaledExercise extends Exercise {
  displayName: string;
  activeVariation: Variation | null;
  scaledWork: number;
  scaledSets: number;
  scaledRest: number;
  /** Final load prescription after level scaling. */
  loadText: string;
  appliedIntensity: Intensity;
  /** True when a safety gate is closed and a substitute is being shown. */
  gated: boolean;
}

export interface Circuit {
  id: string;
  circuitNum: string;
  title: string;
  subtitle: string;
  /** One line on what this session is for. */
  focus: string;
  capacities: Capacity[];
  illustration: string;
  duration: number;
  /** Hours of recovery this session demands before the next hard one. */
  recoveryHours: number;
  note?: string;
  exercises: Exercise[];
  /**
   * Exercises used only as fallbacks when a safety gate is closed. They never
   * appear in a session on their own.
   */
  substitutes?: Exercise[];
}

// ---- Progress / Persistence --------------------------------------------------

export interface HistoryEntry {
  date: string;
  xp: number;
}

export interface CapacityProgress {
  xp: number;
  lastTrained: string | null;
  history: HistoryEntry[];
}

/** @deprecated Alias kept for existing call sites. */
export type MuscleProgress = CapacityProgress;

export type Progress = Partial<Record<Capacity, CapacityProgress>>;

export interface SessionLogEntry {
  date: string;
  mode: Mode;
  circuitId: string;
  circuitTitle: string;
  energy: EnergyKey;
  duration: number;
}

// ---- Decay -------------------------------------------------------------------

export interface DecayEvent {
  capacity: Capacity;
  level: number;
  dropped: boolean;
}

export interface DecayResult {
  progress: Progress;
  decayEvents: DecayEvent[];
}

// ---- Level Up ----------------------------------------------------------------

export interface LevelUp {
  capacity: Capacity;
  level: number;
  unlocks: string;
}

// ---- Readiness ---------------------------------------------------------------

export type ReadinessLevel = 'ready' | 'caution' | 'rest';

export interface Readiness {
  level: ReadinessLevel;
  /** Hours since the last session that loaded this circuit's key capacities. */
  hoursSinceLoad: number | null;
  message: string;
}

// ---- Stats -------------------------------------------------------------------

export interface TrendDataPoint {
  date: string;
  score: number;
}

export interface CapacityListItem {
  capacity: Capacity;
  level: number;
  trend: Trend;
  lastTrained: Date;
}

/** @deprecated Alias kept for existing call sites. */
export type MuscleListItem = CapacityListItem;

// ---- Load log ----------------------------------------------------------------
//
// The model has always had a place for load; until now the interface had no way
// to put a number in it. Progression on this programme *is* load — kilos on the
// belt, millimetres of edge, percent of tested max — so what was actually
// lifted has to be recorded, not just what was prescribed.

/**
 * The numeric axis an exercise is logged on, derived from its LoadSpec. Null
 * for exercises where load is not the progression axis (pure bodyweight work,
 * where the variation ladder does the progressing).
 */
export interface LoadAxis {
  unit: 'kg' | 'mm' | '%' | 'RPE';
  /** One tap of the stepper. Matched to how the equipment actually increments. */
  step: number;
  min: number;
  max: number;
  /** Shown before the number, e.g. '+' for added weight, '-' for assistance. */
  prefix: string;
  /** Short header for the control, e.g. 'ADDED' or 'EDGE'. */
  label: string;
}

/** One recorded load: what was on the belt, on the date it was on the belt. */
export interface LoadLogEntry {
  exerciseId: string;
  exerciseName: string;
  /** ISO date, day resolution — one entry per exercise per session. */
  date: string;
  value: number;
  unit: LoadAxis['unit'];
}
