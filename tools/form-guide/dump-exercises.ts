// =============================================================================
// dump-exercises.ts - export the whole programme as JSON for the form guide.
//
// build.py runs this through tsx so the printed guide is generated from the
// same data the app renders from. Nothing about the programme is retyped into
// the PDF, which is what stops the two drifting apart.
//
//   npx tsx tools/form-guide/dump-exercises.ts > exercises.json
// =============================================================================

import { getModeData } from '@/core/data-index';
import { PROTOCOLS } from '@/core/protocols';
import { BENCHMARKS } from '@/core/benchmarks';
import { CONFIG } from '@/core/config';
import type { Mode, Circuit } from '@/core/types';

const MODES: Mode[] = ['HOME', 'CAVE', 'HANG', 'MORN'];

const out = {
  capacityLabels: CONFIG.capacityLabels,
  protocols: PROTOCOLS,
  benchmarks: BENCHMARKS,
  modes: MODES.map(mode => ({
    mode,
    circuits: getModeData(mode).map((c: Circuit) => ({
      id: c.id,
      circuitNum: c.circuitNum,
      title: c.title,
      subtitle: c.subtitle,
      focus: c.focus,
      capacities: c.capacities,
      duration: c.duration,
      recoveryHours: c.recoveryHours,
      note: c.note,
      exercises: c.exercises,
      substitutes: c.substitutes ?? [],
    })),
  })),
};

console.log(JSON.stringify(out, null, 2));
