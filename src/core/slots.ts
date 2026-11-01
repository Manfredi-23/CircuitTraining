// =============================================================================
// slots.ts — Choice slots: one job, a few exercises that do it (v43)
//
// An exercise in a session can name `options`: others that do the same job
// equally well. The session runs the one done least recently, which builds
// variety in (varied practice is what transfers to new climbs). The athlete
// changes it with SWAP on the session page, where the options come first; a
// swap is an ordinary session edit, so it holds for today or is kept.
//
// History follows the exercise id as always: the slot only names the job.
// Pure, no React.
// =============================================================================

import { exerciseLibrary } from './reserve';
import { dayOf } from './dates';
import type { Circuit, Exercise, SessionLogEntry } from './types';

/** Last day each exercise was done, from the session log. */
export function lastDoneMap(sessionLog: SessionLogEntry[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const s of sessionLog) {
    const day = dayOf(s.date);
    for (const [id, n] of Object.entries(s.sets ?? {})) {
      if (n > 0 && (out.get(id) ?? '') < day) out.set(id, day);
    }
  }
  return out;
}

/** Every exercise a slot can run: the written one first, then its options. */
export function slotChoices(e: Exercise): string[] {
  return e.options?.length ? [e.id, ...e.options.filter(o => o !== e.id)] : [e.id];
}

/**
 * The option a slot runs: the one done least recently, never-done first, the
 * written exercise winning a tie. Unknown ids are skipped.
 */
export function pickOption(e: Exercise, lastDone: Map<string, string>): string {
  const lib = exerciseLibrary();
  let best = e.id;
  let bestDay = lastDone.get(e.id) ?? '';
  for (const id of slotChoices(e).slice(1)) {
    if (!lib.has(id)) continue;
    const d = lastDone.get(id) ?? '';
    if (d < bestDay) { best = id; bestDay = d; }
  }
  return best;
}

/**
 * The session with each slot resolved. The exercise that runs carries the
 * slot's job (`slot`) and the other choices (`options`), so the session page
 * can name it and SWAP can list them first.
 */
export function resolveSlots(circuit: Circuit, sessionLog: SessionLogEntry[]): Circuit {
  if (!circuit.exercises.some(e => e.options?.length)) return circuit;
  const lib = exerciseLibrary();
  const last = lastDoneMap(sessionLog);
  const taken = new Set(circuit.exercises.map(e => e.id));
  const exercises = circuit.exercises.map(e => {
    if (!e.options?.length) return e;
    const id = pickOption(e, last);
    const choices = slotChoices(e);
    if (id === e.id) return e;
    if (taken.has(id)) return e;
    const chosen = lib.get(id)!;
    return { ...chosen, slot: e.slot, options: choices.filter(c => c !== id) };
  });
  return { ...circuit, exercises };
}

/**
 * The session once for every choice a slot can run, one slot at a time: the
 * time budgets in check:daily and check:cave hold whichever option runs.
 */
export function slotVariants(circuit: Circuit): Circuit[] {
  const lib = exerciseLibrary();
  const out: Circuit[] = [circuit];
  circuit.exercises.forEach((e, i) => {
    for (const id of e.options ?? []) {
      const chosen = lib.get(id);
      if (!chosen) continue;
      out.push({ ...circuit, exercises: circuit.exercises.map((x, j) => (j === i ? chosen : x)) });
    }
  });
  return out;
}
