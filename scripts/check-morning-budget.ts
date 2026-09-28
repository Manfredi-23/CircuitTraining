// =============================================================================
// check-morning-budget.ts — guards the two promises MORN makes.
// Run with: npm run check:morning
//
//   1. Every morning circuit finishes inside its budget, at every capacity
//      level and every energy setting: 15 minutes for the daily sessions, 20
//      for 03 FEET ON, which runs three mornings a week.
//   2. No exercise disappears when the athlete picks TIRED. That is the
//      setting a non-morning person reaches for most, and the energy model
//      drops whole blocks — ACCESSORY in particular. MORN is built from
//      WARMUP, PREHAB and MOBILITY for exactly this reason, and this check
//      is what stops that quietly regressing.
//
// Duration comes from the engine's own estimateDuration, which is the same
// function that prints the minutes on the circuit card, so this verifies the
// number the athlete actually reads.
// =============================================================================

import { CONFIG } from '@/core/config';
import { buildList, estimateDuration } from '@/core/engine';
import { getModeData } from '@/core/data-index';
import type { EnergyKey, Progress } from '@/core/types';

const DEFAULT_BUDGET_MINUTES = 15;
const BUDGET_MINUTES: Record<string, number> = { 'morn-03': 20 };
const ENERGIES: EnergyKey[] = ['TIRED', 'NORMAL', 'FRESH'];

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

for (const circuit of getModeData('MORN')) {
  const budget = BUDGET_MINUTES[circuit.id] ?? DEFAULT_BUDGET_MINUTES;
  console.log(`\n=== ${circuit.circuitNum} ${circuit.title} (budget ${budget} min) ===`);

  const exerciseCounts = new Map<EnergyKey, number>();

  for (const level of CONFIG.levels.map(l => l.level)) {
    const row: string[] = [];
    for (const energy of ENERGIES) {
      const list = buildList(circuit, energy, progressAt(level));
      const minutes = estimateDuration(list);

      if (level === 1) exerciseCounts.set(energy, list.length);

      if (minutes > worstMinutes) {
        worstMinutes = minutes;
        worstLabel = `${circuit.circuitNum} L${level} ${energy} (budget ${budget})`;
      }
      if (minutes > budget) {
        failures++;
        row.push(`${energy} ${minutes}min OVER`);
      } else {
        row.push(`${energy} ${minutes}min (${list.length} ex)`);
      }
    }
    console.log(`  L${level}  ${row.join('   ')}`);
  }

  // Promise 2: TIRED must not empty the session out.
  const full = exerciseCounts.get('NORMAL') ?? 0;
  const tired = exerciseCounts.get('TIRED') ?? 0;
  if (tired < full) {
    failures++;
    console.log(`  FAIL: TIRED drops ${full - tired} exercise(s). Check for ACCESSORY blocks.`);
  } else {
    console.log(`  TIRED keeps all ${full} exercises.`);
  }
}

console.log(`\nLongest session: ${worstLabel} at ${worstMinutes} min.`);
console.log(failures === 0 ? 'PASS' : `FAIL (${failures} problem(s))`);
process.exit(failures === 0 ? 0 : 1);
