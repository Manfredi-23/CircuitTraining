// =============================================================================
// block.ts — The mesocycle: three build weeks, then one deload week
//
// Adaptation happens in the recovery after a block of overload, and connective
// tissue (pulleys, tendons) recovers more slowly than muscle, so it is the one
// that pays for a block that never stops. A planned lighter week every fourth
// week is the standard answer. On a deload week the hard sessions keep their
// loads and lose one working set, and suggested loads hold rather than climb.
// DAILY is low load by design and is not deloaded.
// =============================================================================

import { CONFIG } from './config';
import { daysBetween, localDate, mondayOf } from './dates';
import type { Circuit, SessionLogEntry } from './types';

export interface BlockWeek {
  /** 1-based week within the block; the deload is week mesocycleWeeks + 1. */
  week: number;
  buildWeeks: number;
  deload: boolean;
  /** Monday the current block started. */
  blockStart: string;
}

/**
 * Where this week sits in the block. The block counts from `blockStart` when
 * one was set, otherwise from the Monday of the first logged session, so an
 * existing history falls into step without any setup.
 */
export function getBlockWeek(
  blockStart: string | null,
  sessionLog: SessionLogEntry[],
  now = new Date(),
): BlockWeek {
  const build = CONFIG.recovery.mesocycleWeeks;
  const cycle = build + 1;
  const thisMonday = mondayOf(localDate(now));
  const firstSession = sessionLog.length ? mondayOf(localDate(new Date(sessionLog[0].date))) : thisMonday;
  const anchor = blockStart ? mondayOf(blockStart) : firstSession;
  const weeksIn = Math.max(0, Math.floor(daysBetween(anchor, thisMonday) / 7));
  const index = weeksIn % cycle;
  const currentStart = localDate(new Date(
    Number(anchor.slice(0, 4)), Number(anchor.slice(5, 7)) - 1,
    Number(anchor.slice(8, 10)) + (weeksIn - index) * 7,
  ));
  return { week: index + 1, buildWeeks: build, deload: index === build, blockStart: currentStart };
}

/** Whether a session is lightened on a deload week. DAILY and TEST are not. */
export function deloads(circuit: Circuit): boolean {
  return circuit.recoveryHours !== 0 && !circuit.exercises.some(e => e.block === 'TEST');
}

export function blockLabel(b: BlockWeek): string {
  return b.deload ? 'DELOAD WEEK' : `BUILD WEEK ${b.week} OF ${b.buildWeeks}`;
}
