// =============================================================================
// engine.ts — Core training logic (pure functions, no React)
// =============================================================================

import { CONFIG } from './config';
import type {
  EnergyKey, MuscleGroup, Progress, MuscleProgress, Exercise,
  Circuit, ScaledExercise, Variation, LevelConfig,
  DecayResult, DecayEvent, ExerciseAction, SessionLogEntry, Trend,
} from './types';

// ---------------------------------------------------------------------------
// Level system
// ---------------------------------------------------------------------------

export function getLevelData(xp: number): LevelConfig {
  const levels = CONFIG.levels;
  let current = levels[0];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].cumul) {
      current = levels[i];
      break;
    }
  }
  return current;
}

export function getLevelNum(xp: number): number {
  return getLevelData(xp).level;
}

export function getXPForLevel(level: number): number {
  const entry = CONFIG.levels.find(l => l.level === level);
  return entry ? entry.cumul : 0;
}

export function getProgressInLevel(xp: number): number {
  const levels = CONFIG.levels;
  const current = getLevelData(xp);
  if (current.level === 7) return 1.0;
  const next = levels[current.level]; // next entry (level index = level, since array is 0-indexed with level starting at 1)
  const range = next.cumul - current.cumul;
  const earned = xp - current.cumul;
  return Math.min(1.0, earned / range);
}

export function getMuscleLevel(progress: Progress, muscle: MuscleGroup): number {
  const xp = progress[muscle]?.xp ?? 0;
  return getLevelNum(xp);
}

// ---------------------------------------------------------------------------
// Variation selection
// ---------------------------------------------------------------------------

export function getBestVariation(exercise: Exercise, progress: Progress): Variation | null {
  if (!exercise.variations || exercise.variations.length === 0) return null;

  const minLevel = exercise.muscles.reduce((min, m) => {
    return Math.min(min, getMuscleLevel(progress, m));
  }, 7);

  const unlocked = [...exercise.variations].reverse().find(v => v.minLevel <= minLevel);
  return unlocked || exercise.variations[0];
}

// ---------------------------------------------------------------------------
// Scaling
// ---------------------------------------------------------------------------

export function scaleReps(baseReps: number, energyKey: EnergyKey, muscleLevel: number): number {
  const energyCfg = CONFIG.energy[energyKey];
  const levelCfg = getLevelData(getXPForLevel(muscleLevel));
  const reps = baseReps * energyCfg.repMult * levelCfg.repMult;
  return Math.max(1, Math.round(reps));
}

export function scaleRest(baseRest: number, energyKey: EnergyKey, muscleLevel: number): number {
  const energyCfg = CONFIG.energy[energyKey];
  const levelCfg = getLevelData(getXPForLevel(muscleLevel));
  const rest = baseRest + energyCfg.restOffset + levelCfg.restOffset;
  return Math.max(15, rest);
}

// ---------------------------------------------------------------------------
// Exercise list building
// ---------------------------------------------------------------------------

export function buildList(circuit: Circuit, energyKey: EnergyKey, progress: Progress): ScaledExercise[] {
  const circuitMinLevel = circuit.muscles.reduce((min, m) => {
    return Math.min(min, getMuscleLevel(progress, m));
  }, 7);

  const energyCfg = CONFIG.energy[energyKey];

  return circuit.exercises
    .filter(ex => {
      if (!ex.minLevel) return true;
      return circuit.muscles.some(m => getMuscleLevel(progress, m) >= ex.minLevel!);
    })
    .map(ex => {
      const variation = getBestVariation(ex, progress);
      const scaledReps = scaleReps(ex.baseReps, energyKey, circuitMinLevel);
      const scaledRest = scaleRest(ex.baseRest, energyKey, circuitMinLevel);
      const rounds = Math.max(1, circuit.rounds + energyCfg.roundOffset);

      return {
        ...ex,
        displayName: variation ? variation.name : ex.name,
        activeVariation: variation,
        scaledReps,
        scaledRest,
        rounds,
        unit: ex.unit || 'reps',
      } as ScaledExercise;
    });
}

// ---------------------------------------------------------------------------
// XP mutations (return new progress — immutable)
// ---------------------------------------------------------------------------

export function applyXP(progress: Progress, exercise: Exercise, action: ExerciseAction): Progress {
  const newProgress: Progress = structuredClone(progress);

  for (const m of exercise.muscles) {
    if (!newProgress[m]) newProgress[m] = { xp: 0, lastTrained: null, history: [] };
    const pg = newProgress[m] as MuscleProgress;

    if (action === 'done') {
      pg.xp = Math.max(0, pg.xp + 1);
    } else if (action === 'skip') {
      pg.xp = Math.max(0, pg.xp + CONFIG.decay.skipPenalty);
    }

    pg.lastTrained = new Date().toISOString();
  }

  return newProgress;
}

export function applyQuitPenalty(progress: Progress, remainingExercises: Exercise[]): Progress {
  const newProgress: Progress = structuredClone(progress);
  const penalty = CONFIG.decay.quitPenalty;

  for (const ex of remainingExercises) {
    for (const m of ex.muscles) {
      if (!newProgress[m]) newProgress[m] = { xp: 0, lastTrained: null, history: [] };
      const pg = newProgress[m] as MuscleProgress;
      pg.xp = Math.max(0, pg.xp + penalty);
    }
  }

  return newProgress;
}

// ---------------------------------------------------------------------------
// Decay check
// ---------------------------------------------------------------------------

export function checkDecay(progress: Progress): DecayResult {
  const now = new Date();
  const cfg = CONFIG.decay;
  const newProgress: Progress = structuredClone(progress);
  const decayEvents: DecayEvent[] = [];

  for (const m of CONFIG.muscleGroups) {
    if (!newProgress[m]) newProgress[m] = { xp: 0, lastTrained: null, history: [] };
    const pg = newProgress[m] as MuscleProgress;
    if (!pg.lastTrained) continue;

    const lastDate = new Date(pg.lastTrained);
    const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince >= cfg.inactivityDays) {
      const windows = Math.floor(daysSince / cfg.inactivityWindow);
      const totalPenalty = windows * cfg.inactivityPenalty;
      const prevLevel = getLevelNum(pg.xp);
      pg.xp = Math.max(0, pg.xp + totalPenalty);
      const newLevel = getLevelNum(pg.xp);

      if (newLevel < prevLevel) {
        decayEvents.push({ muscle: m, level: newLevel, dropped: true });
      }
    }
  }

  return { progress: newProgress, decayEvents };
}

// ---------------------------------------------------------------------------
// History & trends
// ---------------------------------------------------------------------------

export function recordHistory(progress: Progress, trainedMuscles: MuscleGroup[]): Progress {
  const newProgress: Progress = structuredClone(progress);
  const now = new Date().toISOString();

  for (const m of trainedMuscles) {
    if (!newProgress[m]) newProgress[m] = { xp: 0, lastTrained: null, history: [] };
    const pg = newProgress[m] as MuscleProgress;
    if (!pg.history) pg.history = [];
    pg.history.push({ date: now, xp: pg.xp });
    if (pg.history.length > 90) {
      pg.history = pg.history.slice(-90);
    }
  }

  return newProgress;
}

export function getTrend(progress: Progress, muscle: MuscleGroup): Trend {
  const pg = progress[muscle];
  if (!pg?.history || pg.history.length < 2) return 'stable';

  const recent = pg.history.slice(-5);
  if (recent.length < 2) return 'stable';

  const first = recent[0].xp;
  const last = recent[recent.length - 1].xp;
  const diff = last - first;

  if (diff > 2) return 'up';
  if (diff < -2) return 'down';
  return 'stable';
}

// ---------------------------------------------------------------------------
// Overall stats
// ---------------------------------------------------------------------------

export function getOverallLevel(progress: Progress): number {
  const total = CONFIG.muscleGroups.reduce((sum, m) => {
    return sum + getLevelNum(progress[m]?.xp ?? 0);
  }, 0);
  return Math.round(total / CONFIG.muscleGroups.length);
}

export function getStatInterpretation(progress: Progress, sessionLog: SessionLogEntry[]): string {
  const lines = CONFIG.statLines;
  const overallTrend = calcOverallTrend(progress);
  const recentSessions = sessionLog ? sessionLog.slice(-7) : [];
  const hasLowEnergySessions = recentSessions.some(s => s.energy === 'TIRED');
  const sessionGap = daysSinceLastSession(sessionLog);

  let pool: string[];
  if (sessionGap > 14) pool = lines.inconsistent;
  else if (overallTrend === 'up') pool = lines.improving;
  else if (overallTrend === 'down') pool = lines.declining;
  else if (hasLowEnergySessions) pool = lines.fatigue;
  else pool = lines.stable;

  return pool[Math.floor(Math.random() * pool.length)];
}

function calcOverallTrend(progress: Progress): Trend {
  let ups = 0;
  let downs = 0;
  for (const m of CONFIG.muscleGroups) {
    const t = getTrend(progress, m);
    if (t === 'up') ups++;
    if (t === 'down') downs++;
  }
  if (ups > downs + 2) return 'up';
  if (downs > ups + 2) return 'down';
  return 'stable';
}

function daysSinceLastSession(sessionLog: SessionLogEntry[]): number {
  if (!sessionLog || sessionLog.length === 0) return 999;
  const last = new Date(sessionLog[sessionLog.length - 1].date);
  return Math.floor((new Date().getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}
