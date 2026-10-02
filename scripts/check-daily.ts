// =============================================================================
// check-daily.ts — guards the promises DAILY makes.
// Run with: npm run check:daily
//
//   1. Every DAILY session finishes inside 20 minutes at every capacity level
//      and every energy setting. It runs before breakfast; a session that
//      creeps to 30 minutes stops getting done.
//   2. No exercise disappears when the athlete picks TIRED. The energy model
//      drops whole ACCESSORY blocks, so DAILY has none: working sets are
//      SECONDARY, which loses a set when tired and is never dropped.
//   3. recoveryHours is 0, so readiness never blocks a DAILY session and it can
//      sit on top of a climbing day.
//   4. Curling comes last. DAILY runs in the first hour after waking, when the
//      discs are most swollen, so loaded spinal flexion — crunches and twists —
//      may only appear after every other exercise in its session.
//
// Duration comes from the engine's own estimateDuration, which is the same
// function that prints the minutes on the circuit card, so this verifies the
// number the athlete actually reads.
// =============================================================================

import { CONFIG } from '@/core/config';
import { buildList, estimateDuration } from '@/core/engine';
import { getModeData } from '@/core/data-index';
import type { EnergyKey, Progress } from '@/core/types';

const BUDGET_MINUTES = 20;
const ENERGIES: EnergyKey[] = ['TIRED', 'NORMAL', 'FRESH'];

/** Exercises that load the spine in flexion. Each must close its session. */
const FLEXION_IDS = new Set(['daily-reverse-crunch', 'daily-crunch', 'morn-bw-russian-twist']);

function progressAt(level: number): Progress {
  const xp = CONFIG.levels.find(l => l.level === level)?.cumul ?? 0;
  const progress: Progress = {};
  for (const capacity of CONFIG.capacities) {
    progress[capacity] = { xp, lastTrained: new Date().toISOString(), history: [] };
  }
  return progress;
}

let failures = 0;
let worstMinutes = 0;
let worstLabel = '';
const fail = (msg: string) => { failures++; console.log(`  FAIL: ${msg}`); };

for (const circuit of getModeData('DAILY')) {
  console.log(`\n=== ${circuit.circuitNum} ${circuit.title} (budget ${BUDGET_MINUTES} min) ===`);

  if (circuit.recoveryHours !== 0) fail(`recoveryHours is ${circuit.recoveryHours}, must be 0`);

  const ids = circuit.exercises.map(e => e.id);
  const firstFlexion = ids.findIndex(id => FLEXION_IDS.has(id));
  if (firstFlexion >= 0 && ids.slice(firstFlexion).some(id => !FLEXION_IDS.has(id))) {
    fail(`flexion work is not last: ${ids.slice(firstFlexion).join(', ')}`);
  }

  const exerciseCounts = new Map<EnergyKey, number>();

  for (const level of CONFIG.levels.map(l => l.level)) {
    const row: string[] = [];
    for (const energy of ENERGIES) {
      const list = buildList(circuit, energy, progressAt(level));
      const minutes = estimateDuration(list);

      if (level === 1) exerciseCounts.set(energy, list.length);

      if (minutes > worstMinutes) {
        worstMinutes = minutes;
        worstLabel = `${circuit.circuitNum} L${level} ${energy}`;
      }
      if (minutes > BUDGET_MINUTES) {
        failures++;
        row.push(`${energy} ${minutes}min OVER`);
      } else {
        row.push(`${energy} ${minutes}min`);
      }
    }
    console.log(`  L${level}  ${row.join('   ')}`);
  }

  const full = exerciseCounts.get('NORMAL') ?? 0;
  const tired = exerciseCounts.get('TIRED') ?? 0;
  if (tired < full) fail(`TIRED drops ${full - tired} exercise(s). Check for ACCESSORY blocks.`);
  else console.log(`  TIRED keeps all ${full} exercises.`);
}

console.log(`\nLongest session: ${worstLabel} at ${worstMinutes} min.`);
console.log(failures === 0 ? 'PASS' : `FAIL (${failures} problem(s))`);
process.exit(failures === 0 ? 0 : 1);
