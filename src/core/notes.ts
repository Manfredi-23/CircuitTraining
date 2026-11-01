// =============================================================================
// notes.ts — A technique note, kept for next time (v43)
//
// One line per exercise, written on the workout card ("right knee caves on
// the step-down") and shown the next time that exercise comes up, as LAST
// TIME. The newest note replaces the last; an empty one clears it. Persisted
// (`exerciseNotes`, in backups). Pure, no React.
// =============================================================================

export interface ExerciseNote {
  text: string;
  /** Local day it was written, YYYY-MM-DD. */
  day: string;
}

/** Notes by exercise id. */
export type ExerciseNotes = Record<string, ExerciseNote>;

export const NOTE_MAX = 140;

/** The notes with this one written, trimmed to one short line; empty clears it. */
export function withNote(notes: ExerciseNotes, id: string, text: string, day: string): ExerciseNotes {
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, NOTE_MAX);
  const out = { ...notes };
  if (clean) out[id] = { text: clean, day };
  else delete out[id];
  return out;
}

/** The note to show on the card: one written before today. Today's is the one being written. */
export function lastTimeNote(notes: ExerciseNotes | undefined, id: string, today: string): ExerciseNote | null {
  const n = notes?.[id];
  return n && n.day < today ? n : null;
}
