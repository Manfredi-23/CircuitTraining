// =============================================================================
// engine.js — Core training logic
// buildList, scaleReps, levelFromXP, decay, variation selection
// =============================================================================

'use strict';

const Engine = (() => {

  // -------------------------------------------------------------------------
  // getLevelData: returns level config object for a given XP total
  // -------------------------------------------------------------------------
  function getLevelData(xp) {
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

  // -------------------------------------------------------------------------
  // getLevelNum: returns integer level (1-7) from XP total
  // -------------------------------------------------------------------------
  function getLevelNum(xp) {
    return getLevelData(xp).level;
  }

  // -------------------------------------------------------------------------
  // getXPForLevel: returns cumulative XP needed for a given level
  // -------------------------------------------------------------------------
  function getXPForLevel(level) {
    const entry = CONFIG.levels.find(l => l.level === level);
    return entry ? entry.cumul : 0;
  }

  // -------------------------------------------------------------------------
  // getProgressInLevel: 0.0–1.0 fraction through current level
  // -------------------------------------------------------------------------
  function getProgressInLevel(xp) {
    const levels = CONFIG.levels;
    const current = getLevelData(xp);
    if (current.level === 7) return 1.0;
    const next = levels[current.level]; // next entry (level+1)
    const range = next.cumul - current.cumul;
    const earned = xp - current.cumul;
    return Math.min(1.0, earned / range);
  }

  // -------------------------------------------------------------------------
  // getMuscleLevel: returns level for a specific muscle group
  // -------------------------------------------------------------------------
  function getMuscleLevel(progress, muscle) {
    const xp = (progress && progress[muscle]) ? progress[muscle].xp : 0;
    return getLevelNum(xp);
  }

  // -------------------------------------------------------------------------
  // getBestVariation: returns the highest unlocked variation for an exercise
  // given the minimum muscle group level
  // -------------------------------------------------------------------------
  function getBestVariation(exercise, progress) {
    if (!exercise.variations || exercise.variations.length === 0) return null;

    // Get the minimum level across all target muscles for this exercise
    const minLevel = exercise.muscles.reduce((min, m) => {
      return Math.min(min, getMuscleLevel(progress, m));
    }, 7);

    // Walk variations in reverse to find highest unlocked
    const unlocked = [...exercise.variations].reverse().find(v => v.minLevel <= minLevel);
    return unlocked || exercise.variations[0];
  }

  // -------------------------------------------------------------------------
  // scaleReps: apply energy multiplier and level multiplier
  // -------------------------------------------------------------------------
  function scaleReps(baseReps, energyKey, muscleLevel) {
    const energyCfg = CONFIG.energy[energyKey];
    const levelCfg = getLevelData(getXPForLevel(muscleLevel));

    let reps = baseReps * energyCfg.repMult * levelCfg.repMult;

    // For time-based: round to nearest 5 seconds
    // For reps: round to nearest integer (minimum 1)
    reps = Math.max(1, Math.round(reps));
    return reps;
  }

  // -------------------------------------------------------------------------
  // scaleRest: apply energy offset and lowest-muscle-in-circuit offset
  // -------------------------------------------------------------------------
  function scaleRest(baseRest, energyKey, muscleLevel) {
    const energyCfg = CONFIG.energy[energyKey];
    const levelCfg = getLevelData(getXPForLevel(muscleLevel));
    const rest = baseRest + energyCfg.restOffset + levelCfg.restOffset;
    return Math.max(15, rest); // minimum 15s rest
  }

  // -------------------------------------------------------------------------
  // buildList: returns a fully scaled exercise list for a given circuit
  // params: circuit object, energyKey, progress object
  // -------------------------------------------------------------------------
  function buildList(circuit, energyKey, progress) {
    // Determine lowest muscle level in this circuit (drives rest scaling)
    const circuitMinLevel = circuit.muscles.reduce((min, m) => {
      return Math.min(min, getMuscleLevel(progress, m));
    }, 7);

    // Filter exercises by minLevel and scale each
    const list = circuit.exercises
      .filter(ex => {
        // Only include exercises where at least one muscle meets minLevel
        if (!ex.minLevel) return true;
        return circuit.muscles.some(m => getMuscleLevel(progress, m) >= ex.minLevel);
      })
      .map(ex => {
        const variation = getBestVariation(ex, progress);
        const scaledReps = scaleReps(ex.baseReps, energyKey, circuitMinLevel);
        const scaledRest = scaleRest(ex.baseRest, energyKey, circuitMinLevel);

        // Scale rounds
        const energyCfg = CONFIG.energy[energyKey];
        const rounds = Math.max(1, circuit.rounds + energyCfg.roundOffset);

        return {
          ...ex,
          displayName: variation ? variation.name : ex.name,
          activeVariation: variation,
          scaledReps,
          scaledRest,
          rounds,
          unit: ex.unit || 'reps'
        };
      });

    return list;
  }

  // -------------------------------------------------------------------------
  // applyXP: add XP to muscles for completed exercise
  // -------------------------------------------------------------------------
  function applyXP(progress, exercise, action) {
    const muscles = exercise.muscles || [];
    const penalty = CONFIG.decay;
    const newProgress = JSON.parse(JSON.stringify(progress)); // deep copy

    muscles.forEach(m => {
      if (!newProgress[m]) newProgress[m] = { xp: 0, lastTrained: null, history: [] };

      if (action === 'done') {
        newProgress[m].xp = Math.max(0, newProgress[m].xp + 1);
      } else if (action === 'skip') {
        newProgress[m].xp = Math.max(0, newProgress[m].xp + penalty.skipPenalty);
      }

      newProgress[m].lastTrained = new Date().toISOString();
    });

    return newProgress;
  }

  // -------------------------------------------------------------------------
  // applyQuitPenalty: penalize undone exercises on early exit
  // -------------------------------------------------------------------------
  function applyQuitPenalty(progress, remainingExercises) {
    const newProgress = JSON.parse(JSON.stringify(progress));
    const penalty = CONFIG.decay.quitPenalty;

    remainingExercises.forEach(ex => {
      (ex.muscles || []).forEach(m => {
        if (!newProgress[m]) newProgress[m] = { xp: 0, lastTrained: null, history: [] };
        newProgress[m].xp = Math.max(0, newProgress[m].xp + penalty);
      });
    });

    return newProgress;
  }

  // -------------------------------------------------------------------------
  // checkDecay: check all muscle groups for inactivity and apply penalty
  // returns { progress, decayEvents }
  // -------------------------------------------------------------------------
  function checkDecay(progress) {
    const now = new Date();
    const cfg = CONFIG.decay;
    const newProgress = JSON.parse(JSON.stringify(progress));
    const decayEvents = [];

    CONFIG.muscleGroups.forEach(m => {
      if (!newProgress[m]) newProgress[m] = { xp: 0, lastTrained: null, history: [] };
      const pg = newProgress[m];
      if (!pg.lastTrained) return;

      const lastDate = new Date(pg.lastTrained);
      const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

      if (daysSince >= cfg.inactivityDays) {
        const windows = Math.floor(daysSince / cfg.inactivityWindow);
        const totalPenalty = windows * cfg.inactivityPenalty;
        const prevLevel = getLevelNum(pg.xp);
        pg.xp = Math.max(0, pg.xp + totalPenalty);
        const newLevel = getLevelNum(pg.xp);

        if (newLevel < prevLevel) {
          decayEvents.push({
            muscle: m,
            level: newLevel,
            dropped: true
          });
        }
      }
    });

    return { progress: newProgress, decayEvents };
  }

  // -------------------------------------------------------------------------
  // getOverallLevel: average of all 12 muscle group levels
  // -------------------------------------------------------------------------
  function getOverallLevel(progress) {
    const total = CONFIG.muscleGroups.reduce((sum, m) => {
      return sum + getLevelNum((progress[m] || {}).xp || 0);
    }, 0);
    return Math.round(total / CONFIG.muscleGroups.length);
  }

  // -------------------------------------------------------------------------
  // getTrend: get trend for a muscle group (up/down/stable)
  // Based on recent session XP changes stored in history
  // -------------------------------------------------------------------------
  function getTrend(progress, muscle) {
    const pg = progress[muscle];
    if (!pg || !pg.history || pg.history.length < 2) return 'stable';

    const recent = pg.history.slice(-5); // last 5 sessions
    if (recent.length < 2) return 'stable';

    const first = recent[0].xp;
    const last = recent[recent.length - 1].xp;
    const diff = last - first;

    if (diff > 2) return 'up';
    if (diff < -2) return 'down';
    return 'stable';
  }

  // -------------------------------------------------------------------------
  // recordHistory: push a history entry for each trained muscle
  // -------------------------------------------------------------------------
  function recordHistory(progress, trainedMuscles) {
    const newProgress = JSON.parse(JSON.stringify(progress));
    const now = new Date().toISOString();

    trainedMuscles.forEach(m => {
      if (!newProgress[m]) newProgress[m] = { xp: 0, lastTrained: null, history: [] };
      if (!newProgress[m].history) newProgress[m].history = [];
      newProgress[m].history.push({
        date: now,
        xp: newProgress[m].xp
      });
      // Keep history to last 90 entries per muscle
      if (newProgress[m].history.length > 90) {
        newProgress[m].history = newProgress[m].history.slice(-90);
      }
    });

    return newProgress;
  }

  // -------------------------------------------------------------------------
  // getStatInterpretation: pick a stat line based on trend + conditions
  // -------------------------------------------------------------------------
  function getStatInterpretation(progress, sessionLog) {
    const lines = CONFIG.statLines;
    const overallTrend = _calcOverallTrend(progress);
    const recentSessions = sessionLog ? sessionLog.slice(-7) : [];
    const hasLowEnergySessions = recentSessions.some(s => s.energy === 'TIRED');
    const sessionGap = _daysSinceLastSession(sessionLog);

    let pool;
    if (sessionGap > 14) pool = lines.inconsistent;
    else if (overallTrend === 'up') pool = lines.improving;
    else if (overallTrend === 'down') pool = lines.declining;
    else if (hasLowEnergySessions) pool = lines.fatigue;
    else pool = lines.stable;

    return pool[Math.floor(Math.random() * pool.length)];
  }

  function _calcOverallTrend(progress) {
    let ups = 0, downs = 0;
    CONFIG.muscleGroups.forEach(m => {
      const t = getTrend(progress, m);
      if (t === 'up') ups++;
      if (t === 'down') downs++;
    });
    if (ups > downs + 2) return 'up';
    if (downs > ups + 2) return 'down';
    return 'stable';
  }

  function _daysSinceLastSession(sessionLog) {
    if (!sessionLog || sessionLog.length === 0) return 999;
    const last = new Date(sessionLog[sessionLog.length - 1].date);
    return Math.floor((new Date() - last) / (1000 * 60 * 60 * 24));
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  return {
    getLevelData,
    getLevelNum,
    getXPForLevel,
    getProgressInLevel,
    getMuscleLevel,
    getBestVariation,
    scaleReps,
    scaleRest,
    buildList,
    applyXP,
    applyQuitPenalty,
    checkDecay,
    getOverallLevel,
    getTrend,
    recordHistory,
    getStatInterpretation
  };

})();
