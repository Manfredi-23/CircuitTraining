// =============================================================================
// check-morning-budget.ts — guards the MORN promise: every morning circuit
// must finish inside 15 minutes at ANY muscle level and ANY energy setting.
// Run with: npm run check:morning
//
// Work time is estimated pessimistically (3s per rep, plus a fixed setup cost
// for anything needing the band or the pull edge repositioned, plus double
// time for per-side exercises). Rest comes from the real engine.
// =============================================================================

import { CONFIG } from '@/core/config';
import { buildList } from '@/core/engine';
import { getModeData } from '@/core/data-index';
import type { EnergyKey, Progress, MuscleGroup } from '@/core/types';

const SEC_PER_REP = 3;
const SETUP: Record<string, number> = {
  'morn-nohang': 20, 'morn-nohang-easy': 20,
  'morn-pressout': 12, 'morn-chop': 12, 'morn-pullapart': 8,
  'morn-side-plank': 8, 'morn-side-plank-hold': 8,
  'morn-supine-twist': 6, 'morn-band-deadbug': 8, 'morn-leg-lowers': 8,
  'morn-glute-bridge-march': 6, 'morn-hip-9090': 6,
};
const PER_SIDE = new Set(['morn-side-plank', 'morn-pressout', 'morn-chop',
                          'morn-side-plank-hold', 'morn-nohang', 'morn-nohang-easy']);

function progressAt(level: number): Progress {
  const xp = CONFIG.levels.find(l => l.level === level)!.cumul;
  const p: Progress = {};
  for (const m of CONFIG.muscleGroups as MuscleGroup[]) {
    p[m] = { xp, lastTrained: new Date().toISOString(), history: [] };
  }
  return p;
}

let worst = 0, worstLabel = '';
for (const circuit of getModeData('MORN')) {
  console.log(`\n=== ${circuit.circuitNum} ${circuit.title}  (card says ${circuit.duration} min) ===`);
  for (const level of [1, 4, 7]) {
    for (const energy of ['TIRED', 'NORMAL', 'FRESH'] as EnergyKey[]) {
      const list = buildList(circuit, energy, progressAt(level));
      let work = 0, rest = 0;
      for (const ex of list) {
        const sides = PER_SIDE.has(ex.id) ? 2 : 1;
        const unitTime = ex.unit === 'sec' ? ex.scaledReps : ex.scaledReps * SEC_PER_REP;
        work += unitTime * sides + (SETUP[ex.id] ?? 4);
        rest += ex.scaledRest;
      }
      const rounds = list[0]?.rounds ?? 1;
      const total = (work + rest) * rounds;
      const label = `${circuit.circuitNum} L${level} ${energy}`;
      if (total > worst) { worst = total; worstLabel = label; }
      const flag = total > 900 ? '  <-- OVER 15 MIN' : '';
      console.log(`  L${level} ${energy.padEnd(6)} n=${list.length} rest=${list[0]?.scaledRest}s ` +
                  `work=${Math.round(work)}s rest=${Math.round(rest)}s  TOTAL ${(total/60).toFixed(1)} min${flag}`);
    }
  }
}
console.log(`\nWorst case: ${worstLabel} at ${(worst/60).toFixed(1)} min (budget 15.0)`);
console.log(worst <= 900 ? 'PASS' : 'FAIL');
