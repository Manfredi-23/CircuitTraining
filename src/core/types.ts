// =============================================================================
// types.ts — All TypeScript types for the 7Bit app
// =============================================================================

export type Mode = 'HOME' | 'CAVE' | 'HANG';
export type EnergyKey = 'FRESH' | 'NORMAL' | 'TIRED';
export type ScreenName = 'home' | 'workout' | 'rest' | 'complete' | 'stats';
export type SortMode = 'strongest' | 'weakest' | 'recent';
export type TimeFilter = '7days' | '30days' | '90days' | 'total';
export type Trend = 'up' | 'down' | 'stable';
export type ExerciseUnit = 'reps' | 'sec';
export type ExerciseAction = 'done' | 'skip';

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'triceps' | 'biceps'
  | 'core' | 'obliques' | 'legs' | 'glutes'
  | 'forearms' | 'grip' | 'fingers';

// ---- Config ----

export interface EnergyConfig {
  label: EnergyKey;
  repMult: number;
  restOffset: number;
  roundOffset: number;
}

export interface LevelConfig {
  level: number;
  xpNeeded: number;
  cumul: number;
  repMult: number;
  restOffset: number;
  unlocks: string;
}

export interface DecayConfig {
  quitPenalty: number;
  skipPenalty: number;
  inactivityDays: number;
  inactivityPenalty: number;
  inactivityWindow: number;
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

export interface Config {
  modes: Mode[];
  energy: Record<EnergyKey, EnergyConfig>;
  levels: LevelConfig[];
  muscleGroups: MuscleGroup[];
  decay: DecayConfig;
  humorLines: string[];
  statLines: StatLines;
  derankMessages: string[];
  ui: UIConfig;
  storage: StorageKeys;
}

// ---- Exercise Data ----

export interface Variation {
  minLevel: number;
  name: string;
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
  muscles: MuscleGroup[];
  baseReps: number;
  baseRest: number;
  unit: ExerciseUnit;
  note?: string;
  tempo?: string;
  minLevel?: number;
  variations?: Variation[];
  form?: FormGuide;
}

export interface ScaledExercise extends Exercise {
  displayName: string;
  activeVariation: Variation | null;
  scaledReps: number;
  scaledRest: number;
  rounds: number;
}

export interface Circuit {
  id: string;
  circuitNum: string;
  title: string;
  subtitle: string;
  muscles: MuscleGroup[];
  illustration: string;
  duration: number;
  rounds: number;
  note?: string;
  exercises: Exercise[];
}

// ---- Progress / Persistence ----

export interface HistoryEntry {
  date: string;
  xp: number;
}

export interface MuscleProgress {
  xp: number;
  lastTrained: string | null;
  history: HistoryEntry[];
}

export type Progress = Partial<Record<MuscleGroup, MuscleProgress>>;

export interface SessionLogEntry {
  date: string;
  mode: Mode;
  circuitId: string;
  circuitTitle: string;
  energy: EnergyKey;
  duration: number;
}

// ---- Decay ----

export interface DecayEvent {
  muscle: MuscleGroup;
  level: number;
  dropped: boolean;
}

export interface DecayResult {
  progress: Progress;
  decayEvents: DecayEvent[];
}

// ---- Level Up ----

export interface LevelUp {
  muscle: MuscleGroup;
  level: number;
  unlocks: string;
}

// ---- Stats ----

export interface TrendDataPoint {
  date: string;
  score: number;
}

export interface MuscleListItem {
  muscle: MuscleGroup;
  level: number;
  trend: Trend;
  lastTrained: Date;
}
