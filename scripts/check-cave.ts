// =============================================================================
// check-cave.ts — guards the CAVE session budgets, what the training-day
// sessions must hold, and the one-arm gates.
// Run with: npm run check:cave
//
//   1. CAVE 02 PULL + PUSH and CAVE 03 LEGS + BACK stay inside 45 minutes
//      NORMAL at every capacity level: both run after a two-hour boulder
//      session, and volume added there creeps up unnoticed. CAVE 04 POWER and
//      05 FULL BODY, the training days, stay inside 75. FRESH and TIRED are
//      printed for reference.
//   1b. 04 and 05 each carry core, a balance drill and power at full stretch;
//      nothing in them needs a bench or a barbell; 04 keeps its finger work
//      below HARD so it never restarts the 48h; 05 has no hangboard.
//   2. The one-arm pull-up rungs open on a tested weighted pull-up and nothing
//      else: no benchmark shows the lopsided substitute, 131% (2RM) opens
//      assisted one-arms, 141% opens negatives. At max level with no benchmark, none of
//      the gated work may appear — XP must never open it.
//
// Duration comes from estimateDuration, the number printed on the card.
// =============================================================================

import { CONFIG } from '@/core/config';
import { buildList, estimateDuration } from '@/core/engine';
import { getModeData } from '@/core/data-index';
import { OAP_ASSISTED_GATE, OAP_NEGATIVE_GATE } from '@/core/data-oap';
import type { BenchmarkResult, EnergyKey, Progress } from '@/core/types';

const NORMAL_BUDGET_MINUTES: Record<string, number> = { 'cave-05': 45, 'cave-06': 45, 'cave-07': 75, 'cave-08': 75 };
const ENERGIES: EnergyKey[] = ['TIRED', 'NORMAL', 'FRESH'];

function progressAt(level: number): Progress {
  const xp = CONFIG.levels.find(l => l.level === level)?.cumul ?? 0;
  const progress: Progress = {};
  for (const capacity of CONFIG.capacities) {
    progress[capacity] = { xp, lastTrained: new Date().toISOString(), history: [] };
  }
  return progress;
}

const pullup = (value: number): BenchmarkResult[] =>
  [{ benchmarkId: 'weighted-pullup-2rm', value, date: new Date().toISOString() }];

let failures = 0;
const fail = (msg: string) => { failures++; console.log(`  FAIL  ${msg}`); };

// ---- 1. Durations ------------------------------------------------------------

const cave = getModeData('CAVE');

for (const circuit of cave) {
  const budget = NORMAL_BUDGET_MINUTES[circuit.id];
  console.log(`\n=== ${circuit.circuitNum} ${circuit.title}${budget ? ` (NORMAL budget ${budget} min)` : ''} ===`);
  for (const level of CONFIG.levels.map(l => l.level)) {
    const row = ENERGIES.map(energy => {
      const minutes = estimateDuration(buildList(circuit, energy, progressAt(level)));
      if (budget && energy === 'NORMAL' && minutes > budget) {
        fail(`${circuit.circuitNum} L${level} NORMAL is ${minutes} min, budget ${budget}`);
      }
      return `${energy} ${String(minutes).padStart(2)}`;
    });
    console.log(`  L${level}  ${row.join('   ')}`);
  }
}

// ---- 1b. Training days -------------------------------------------------------

console.log('\n=== training days ===');
for (const id of ['cave-07', 'cave-08']) {
  const circuit = cave.find(c => c.id === id);
  if (!circuit) { fail(`no circuit ${id}`); continue; }
  const all = [...circuit.exercises, ...(circuit.substitutes ?? [])];
  const working = circuit.exercises.filter(e => e.block !== 'WARMUP');
  if (!working.some(e => e.capacities.includes('tension') && (e.block === 'SECONDARY' || e.block === 'PRIMARY'))) fail(`${id}: no core`);
  if (!working.some(e => e.protocolId === 'balance')) fail(`${id}: no balance drill`);
  if (!working.some(e => e.protocolId === 'end-range-strength')) fail(`${id}: no power at full stretch`);
  for (const e of all) {
    const text = [e.form?.setup, e.form?.execution, e.load.text].join(' ').toLowerCase();
    if (/\bbench\b|barbell/.test(text)) fail(`${id}: ${e.id} needs a bench or a barbell`);
  }
  const finger = working.filter(e => e.capacities.includes('crimp') || e.capacities.includes('openhand'));
  if (id === 'cave-08' && finger.length) fail(`${id}: hangboard work in FULL BODY`);
  for (const level of CONFIG.levels.map(l => l.level)) {
    for (const energy of ENERGIES) {
      for (const e of buildList(circuit, energy, progressAt(level))) {
        const fingers = e.capacities.includes('crimp') || e.capacities.includes('openhand');
        if (fingers && e.block !== 'WARMUP' && (e.appliedIntensity === 'HARD' || e.appliedIntensity === 'MAX')) {
          fail(`${id}: ${e.id} is a hard finger set at L${level} ${energy}`);
        }
      }
    }
  }
  console.log(`  ${circuit.circuitNum} ${circuit.title}  core, balance, stretch; no bench or barbell`);
}

// ---- 2. One-arm gates --------------------------------------------------------

console.log('\n=== one-arm gates ===');

const idsAt = (circuitId: string, results: BenchmarkResult[]) => {
  const circuit = getModeData('CAVE').find(c => c.id === circuitId);
  if (!circuit) throw new Error(`no circuit ${circuitId}`);
  return buildList(circuit, 'NORMAL', progressAt(CONFIG.levels.length), results).map(e => e.id);
};

const cases: { circuit: string; prefix: string; negative: boolean }[] = [
  { circuit: 'cave-01', prefix: 'cave01', negative: true },
  { circuit: 'cave-05', prefix: 'addon', negative: false },
];

for (const { circuit, prefix, negative } of cases) {
  const none = idsAt(circuit, []);
  const assisted = idsAt(circuit, pullup(OAP_ASSISTED_GATE));
  const full = idsAt(circuit, pullup(OAP_NEGATIVE_GATE));

  if (!none.includes(`${prefix}-oap-path`)) fail(`${circuit}: no benchmark should show the path`);
  if (none.includes(`${prefix}-oap-assisted`)) fail(`${circuit}: assisted open without a benchmark`);
  if (none.includes(`${prefix}-oap-negative`)) fail(`${circuit}: negative open without a benchmark`);
  if (!assisted.includes(`${prefix}-oap-assisted`)) fail(`${circuit}: ${OAP_ASSISTED_GATE}% should open assisted`);
  if (assisted.includes(`${prefix}-oap-negative`)) fail(`${circuit}: ${OAP_ASSISTED_GATE}% should not open negatives`);
  if (negative && !full.includes(`${prefix}-oap-negative`)) fail(`${circuit}: ${OAP_NEGATIVE_GATE}% should open negatives`);

  console.log(`  ${circuit}  none: path   ${OAP_ASSISTED_GATE}%: assisted   ${negative ? `${OAP_NEGATIVE_GATE}%: + negatives` : ''}`);
}

// An estimated 1RM recorded with the retired 5RM method still counts, divided
// by 1.067 onto the 2RM scale: 142% reads as 133%, past the assisted gate and
// short of negatives.
const oldMethod: BenchmarkResult[] =
  [{ benchmarkId: 'weighted-pullup', value: 142, date: new Date().toISOString() }];
const legacy = idsAt('cave-01', oldMethod);
if (!legacy.includes('cave01-oap-assisted')) fail('old-method 142% should open assisted');
if (legacy.includes('cave01-oap-negative')) fail('old-method 142% should not open negatives');
console.log('  old 5RM-method 142% -> assisted open, negatives closed');

console.log(failures === 0 ? '\nOK\n' : `\n${failures} failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
