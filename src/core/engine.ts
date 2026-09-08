// =============================================================================
// engine.ts — Core training logic (pure functions, no React)
//
// v10. The three behavioural changes that matter:
//
//   scaleWork  — maximal isometrics and low-rep strength work are NEVER
//                rep-inflated by level or energy. Levels move load; the work
//                prescription stays where the protocol put it.
//   scaleRest  — rest on PRIMARY/SECONDARY work never falls below the written
//                value. Only ACCESSORY and PREHAB blocks get denser with level.
//   readiness  — the app now knows when the fingers have not had 48 hours and
//                says so, instead of handing out XP for training them again.
// =============================================================================

import { CONFIG } from './config';
import { meetsStandard } from './benchmarks';
import type {
  EnergyKey, Capacity, Progress, CapacityProgress, Exercise,
  Circuit, ScaledExercise, Variation, LevelConfig, Intensity, BlockType,
  DecayResult, DecayEvent, ExerciseAction, SessionLogEntry, Trend,
  BenchmarkResult, Readiness,
} from './types';

const INTENSITY_ORDER: Intensity[] = ['TECHNIQUE', 'EASY', 'MODERATE', 'HARD', 'MAX'];

/** Blocks whose rest is protected: quality work is never rushed. */
const PROTECTED_BLOCKS: BlockType[] = ['PRIMARY', 'SECONDARY', 'TEST'];

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
  if (current.level === levels.length) return 1.0;
  const next = levels[current.level];
  const range = next.cumul - current.cumul;
  const earned = xp - current.cumul;
  return Math.min(1.0, Math.max(0, earned / range));
}

export function getCapacityLevel(progress: Progress, capacity: Capacity): number {
  const xp = progress[capacity]?.xp ?? 0;
  return getLevelNum(xp);
}

/** @deprecated Use getCapacityLevel. */
export const getMuscleLevel = getCapacityLevel;

/** The level of the weakest capacity an exercise trains — the one that limits it. */
export function getExerciseLevel(exercise: Exercise, progress: Progress): number {
  if (exercise.capacities.length === 0) return 1;
  return exercise.capacities.reduce(
    (min, c) => Math.min(min, getCapacityLevel(progress, c)),
    CONFIG.levels.length,
  );
}

// ---------------------------------------------------------------------------
// Variation selection
// ---------------------------------------------------------------------------

export function getBestVariation(exercise: Exercise, progress: Progress): Variation | null {
  if (!exercise.variations || exercise.variations.length === 0) return null;
  const level = getExerciseLevel(exercise, progress);
  const unlocked = [...exercise.variations].reverse().find(v => v.minLevel <= level);
  return unlocked || exercise.variations[0];
}

// ---------------------------------------------------------------------------
// Scaling
// ---------------------------------------------------------------------------

/**
 * Work per set.
 *
 * Rep-based ACCESSORY and PREHAB volume scales with energy. Everything else —
 * maximal isometrics, low-rep strength work, timed protocols — is left exactly
 * as the protocol prescribes. A 10s max hang is 10s at every level; what changes
 * is the weight on the belt.
 */
export function scaleWork(exercise: Exercise, energyKey: EnergyKey): number {
  const isProtocolFixed =
    exercise.fixed
    || exercise.unit === 'sec'
    || exercise.intensity === 'MAX'
    || PROTECTED_BLOCKS.includes(exercise.block);

  if (isProtocolFixed) return exercise.work;

  const energyCfg = CONFIG.energy[energyKey];
  return Math.max(1, Math.round(exercise.work * energyCfg.workMult));
}

/**
 * Sets.
 *
 * Level adds sets to PRIMARY work only. Energy adds one when fresh and removes
 * one when tired, but extra sets are only offered on the blocks worth doing
 * more of — nobody needs a bonus set of band rotations.
 *
 * Both are capped. Volume on maximal work has a sharp point of diminishing
 * return, and an eight-set max-hang session is how a good protocol turns into
 * an injury.
 */
const MAX_SETS: Partial<Record<BlockType, number>> = { PRIMARY: 6, SECONDARY: 5 };

export function scaleSets(exercise: Exercise, energyKey: EnergyKey, level: number): number {
  if (exercise.fixed || exercise.block === 'WARMUP' || exercise.block === 'TEST') {
    return exercise.sets;
  }

  const levelCfg = CONFIG.levels[level - 1] ?? CONFIG.levels[0];
  const energyCfg = CONFIG.energy[energyKey];
  const isWorkingBlock = exercise.block === 'PRIMARY' || exercise.block === 'SECONDARY';

  const levelBonus = exercise.block === 'PRIMARY' ? levelCfg.setBonus : 0;
  // Bonus sets go to working blocks only; reductions apply everywhere.
  const energyOffset = isWorkingBlock ? energyCfg.setOffset : Math.min(0, energyCfg.setOffset);

  const sets = exercise.sets + levelBonus + energyOffset;
  const ceiling = MAX_SETS[exercise.block] ?? exercise.sets + 1;

  return Math.min(ceiling, Math.max(exercise.block === 'PRIMARY' ? 2 : 1, sets));
}

/**
 * Rest.
 *
 * Rest between maximal sets is set by physiology, not by how experienced the
 * athlete is: a max hang needs three minutes at level 1 and at level 7 alike.
 * So level never touches rest on PRIMARY, SECONDARY or TEST work — only energy
 * does, and only upward. Density genuinely is a training variable on ACCESSORY
 * and PREHAB work, so those blocks are allowed to compress as level rises.
 */
export function scaleRest(exercise: Exercise, energyKey: EnergyKey, level: number): number {
  if (exercise.fixed) return exercise.restSec;

  const levelCfg = CONFIG.levels[level - 1] ?? CONFIG.levels[0];
  const energyCfg = CONFIG.energy[energyKey];

  if (PROTECTED_BLOCKS.includes(exercise.block)) {
    return Math.max(exercise.restSec, Math.round(exercise.restSec * energyCfg.restMult));
  }

  const rest = Math.round(exercise.restSec * levelCfg.accessoryRestMult * energyCfg.restMult);
  return Math.max(15, rest);
}

/** Energy caps intensity so a tired athlete downgrades rather than grinds. */
export function applyIntensityCap(exercise: Exercise, energyKey: EnergyKey): Intensity {
  const cap = CONFIG.energy[energyKey].intensityCap;
  if (exercise.fixed) return exercise.intensity;
  if (!cap) return exercise.intensity;
  const capIdx = INTENSITY_ORDER.indexOf(cap);
  const exIdx = INTENSITY_ORDER.indexOf(exercise.intensity);
  return exIdx > capIdx ? cap : exercise.intensity;
}

/**
 * The load prescription shown on the card. Levels move load, so the load line
 * is where progression actually appears.
 */
export function resolveLoadText(
  exercise: Exercise,
  variation: Variation | null,
  level: number,
): string {
  if (variation?.load) return variation.load;

  const levelCfg = CONFIG.levels[level - 1] ?? CONFIG.levels[0];
  const base = exercise.load.text;

  // Only percent-of-max prescriptions carry a meaningful numeric level step.
  if (exercise.load.kind === 'percent-max' && exercise.load.value && level > 1) {
    const target = Math.min(95, Math.round(exercise.load.value * levelCfg.loadStep));
    return `${base} — target ${target}%`;
  }
  return base;
}

// ---------------------------------------------------------------------------
// Session building
// ---------------------------------------------------------------------------

export function buildList(
  circuit: Circuit,
  energyKey: EnergyKey,
  progress: Progress,
  benchmarkResults: BenchmarkResult[] = [],
): ScaledExercise[] {
  const energyCfg = CONFIG.energy[energyKey];
  const byId = new Map(
    [...circuit.exercises, ...(circuit.substitutes ?? [])].map(ex => [ex.id, ex]),
  );
  const emitted = new Set<string>();
  const out: ScaledExercise[] = [];

  for (const ex of circuit.exercises) {
    // Blocks dropped at this energy level (warm-ups are never dropped).
    if (ex.block !== 'WARMUP' && energyCfg.dropBlocks.includes(ex.block)) continue;

    // Level gate: exercises that enter the session at a given capacity level.
    if (ex.minLevel && getExerciseLevel(ex, progress) < ex.minLevel) continue;

    // Safety gate: substitute rather than drop, so the quality still gets trained.
    let resolved = ex;
    let gated = false;
    if (ex.gate && !meetsStandard(benchmarkResults, ex.gate.benchmarkId, ex.gate.minValue)) {
      const substitute = ex.gate.substituteId ? byId.get(ex.gate.substituteId) : undefined;
      if (!substitute) continue;
      resolved = substitute;
      gated = true;
    }

    if (emitted.has(resolved.id)) continue;
    emitted.add(resolved.id);

    const level = getExerciseLevel(resolved, progress);
    const variation = getBestVariation(resolved, progress);

    out.push({
      ...resolved,
      displayName: variation ? variation.name : resolved.name,
      activeVariation: variation,
      scaledWork: scaleWork(resolved, energyKey),
      scaledSets: scaleSets(resolved, energyKey, level),
      scaledRest: scaleRest(resolved, energyKey, level),
      loadText: resolveLoadText(resolved, variation, level),
      appliedIntensity: applyIntensityCap(resolved, energyKey),
      gated,
      note: gated ? ex.gate?.reason ?? resolved.note : resolved.note,
    });
  }

  return out;
}

/**
 * Session time estimate in minutes.
 *
 * Reps are costed at 3s each. Per-side work doubles the time under load but not
 * the rest, because sides alternate inside one rest window. The rest after the
 * very last set is not counted — the session ends there.
 */
const SECONDS_PER_REP = 3;

export function estimateDuration(list: ScaledExercise[]): number {
  const seconds = list.reduce((total, ex) => {
    const workSeconds = ex.unit === 'sec' ? ex.scaledWork : ex.scaledWork * SECONDS_PER_REP;
    const sides = ex.perSide ? 2 : 1;
    return total + ex.scaledSets * (workSeconds * sides + ex.scaledRest);
  }, 0);

  const last = list[list.length - 1];
  const trailingRest = last ? last.scaledRest : 0;

  return Math.max(1, Math.round((seconds - trailingRest) / 60));
}

// ---------------------------------------------------------------------------
// Readiness
//
// Tendons and pulleys need 48-72h between maximal finger sessions. The old app
// had no concept of this and rewarded training them again the next day.
// ---------------------------------------------------------------------------

const FINGER_CAPACITIES: Capacity[] = ['crimp', 'openhand'];

export function getReadiness(circuit: Circuit, progress: Progress): Readiness {
  // Sessions designed to be repeatable daily never report a recovery debt.
  if (circuit.recoveryHours === 0) {
    return { level: 'ready', hoursSinceLoad: null, message: 'Low load by design. Repeat as often as you like.' };
  }

  const loadsFingersHard =
    circuit.recoveryHours >= CONFIG.recovery.fingerMaxHours
    && circuit.capacities.some(c => FINGER_CAPACITIES.includes(c));

  const relevant = loadsFingersHard ? FINGER_CAPACITIES : circuit.capacities;

  const lastTimes = relevant
    .map(c => progress[c]?.lastTrained)
    .filter((d): d is string => Boolean(d))
    .map(d => new Date(d).getTime());

  if (lastTimes.length === 0) {
    return { level: 'ready', hoursSinceLoad: null, message: 'No history yet. Start conservative.' };
  }

  const mostRecent = Math.max(...lastTimes);
  const hours = (Date.now() - mostRecent) / (1000 * 60 * 60);
  const required = loadsFingersHard
    ? CONFIG.recovery.fingerMaxHours
    : CONFIG.recovery.hardSessionHours;

  if (hours >= required) {
    return { level: 'ready', hoursSinceLoad: Math.floor(hours), message: 'Recovered. Go.' };
  }
  if (hours >= required * 0.6) {
    return {
      level: 'caution',
      hoursSinceLoad: Math.floor(hours),
      message: `Only ${Math.floor(hours)}h since the last hard session. Drop the intensity or pick a different one.`,
    };
  }
  return {
    level: 'rest',
    hoursSinceLoad: Math.floor(hours),
    message: `${Math.floor(hours)}h since the last hard session. This needs ${required}h. Do DENSITY or ARMOUR instead.`,
  };
}

// ---------------------------------------------------------------------------
// XP mutations (return new progress — immutable)
// ---------------------------------------------------------------------------

/**
 * XP is earned by completing work. Skipping earns nothing, and — unlike v9 —
 * costs nothing. Penalising a skip in an app that prescribes maximal finger
 * loading pushes an athlete to train through a warning sign, which is the one
 * behaviour a climbing app must never incentivise.
 */
export function applyXP(progress: Progress, exercise: Exercise, action: ExerciseAction): Progress {
  const newProgress: Progress = structuredClone(progress);

  for (const c of exercise.capacities) {
    if (!newProgress[c]) newProgress[c] = { xp: 0, lastTrained: null, history: [] };
    const pg = newProgress[c] as CapacityProgress;

    if (action === 'done') {
      // Warm-ups and prehab keep the capacity marked as trained but do not
      // count as progression — they are maintenance, not stimulus.
      const earns = exercise.block !== 'WARMUP' && exercise.block !== 'PREHAB';
      if (earns) pg.xp = Math.max(0, pg.xp + 1);
      pg.lastTrained = new Date().toISOString();
    } else {
      pg.xp = Math.max(0, pg.xp + CONFIG.decay.skipPenalty);
    }
  }

  return newProgress;
}

/** Quitting early forfeits the XP that was not earned. It costs nothing more. */
export function applyQuitPenalty(progress: Progress, _remaining: Exercise[]): Progress {
  return structuredClone(progress);
}

// ---------------------------------------------------------------------------
// Decay check
//
// Capacity-specific, with grace periods long enough that a planned deload week
// is never punished.
// ---------------------------------------------------------------------------

export function checkDecay(progress: Progress): DecayResult {
  const now = Date.now();
  const cfg = CONFIG.decay;
  const newProgress: Progress = structuredClone(progress);
  const decayEvents: DecayEvent[] = [];

  for (const c of CONFIG.capacities) {
    if (!newProgress[c]) newProgress[c] = { xp: 0, lastTrained: null, history: [] };
    const pg = newProgress[c] as CapacityProgress;
    if (!pg.lastTrained) continue;

    const rate = cfg.rates[c];
    const daysSince = Math.floor((now - new Date(pg.lastTrained).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < rate.graceDays) continue;

    const windows = Math.floor((daysSince - rate.graceDays) / cfg.windowDays) + 1;
    const prevLevel = getLevelNum(pg.xp);
    pg.xp = Math.max(0, pg.xp + windows * rate.perWindow);
    const newLevel = getLevelNum(pg.xp);

    if (newLevel < prevLevel) {
      decayEvents.push({ capacity: c, level: newLevel, dropped: true });
    }
  }

  return { progress: newProgress, decayEvents };
}

// ---------------------------------------------------------------------------
// History & trends
// ---------------------------------------------------------------------------

export function recordHistory(progress: Progress, trained: Capacity[]): Progress {
  const newProgress: Progress = structuredClone(progress);
  const now = new Date().toISOString();

  for (const c of trained) {
    if (!newProgress[c]) newProgress[c] = { xp: 0, lastTrained: null, history: [] };
    const pg = newProgress[c] as CapacityProgress;
    if (!pg.history) pg.history = [];
    pg.history.push({ date: now, xp: pg.xp });
    if (pg.history.length > 90) pg.history = pg.history.slice(-90);
  }

  return newProgress;
}

export function getTrend(progress: Progress, capacity: Capacity): Trend {
  const pg = progress[capacity];
  if (!pg?.history || pg.history.length < 2) return 'stable';

  const recent = pg.history.slice(-5);
  if (recent.length < 2) return 'stable';

  const diff = recent[recent.length - 1].xp - recent[0].xp;
  if (diff > 2) return 'up';
  if (diff < -2) return 'down';
  return 'stable';
}

// ---------------------------------------------------------------------------
// Overall stats
// ---------------------------------------------------------------------------

export function getOverallLevel(progress: Progress): number {
  const total = CONFIG.capacities.reduce(
    (sum, c) => sum + getLevelNum(progress[c]?.xp ?? 0),
    0,
  );
  return Math.round(total / CONFIG.capacities.length);
}

/** The capacity furthest behind — where training time is worth most. */
export function getLimiter(progress: Progress): Capacity {
  return CONFIG.capacities.reduce((weakest, c) => {
    const a = progress[c]?.xp ?? 0;
    const b = progress[weakest]?.xp ?? 0;
    return a < b ? c : weakest;
  }, CONFIG.capacities[0]);
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
  for (const c of CONFIG.capacities) {
    const t = getTrend(progress, c);
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
  return Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
}
