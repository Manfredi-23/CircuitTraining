// =============================================================================
// limiters.ts — Which styles the athlete falls on, and why
//
// Reads the tagged climbs of the last twelve weeks. A style's send rate is set
// against the athlete's own average over the same climbs, so a hard week does
// not make every style look weak: what stands out is a style sent less often
// than the rest. At least four tagged climbs of a style before it is named,
// and at least eight tagged climbs in all before anything is.
//
// The fall reasons are counted as given. The head is read twice: how often a
// climb fell to BACKED OFF or SCARED, and how many climbing sessions had a go
// at 110%.
// =============================================================================

import { FALL_REASONS, reasonById, tagById, type FallReason } from './climb-tags';
import { daysBetween, localDate } from './dates';
import type { ClimbSession } from './types';

export const LIMITER_WINDOW_DAYS = 84;
export const MIN_PER_STYLE = 4;
export const MIN_TAGGED = 8;

export interface StyleStat {
  tag: string;
  label: string;
  climbs: number;
  sent: number;
  /** Sends over climbs, 0-1. */
  rate: number;
  /** Percentage points below (negative) or above the athlete's average. */
  vsAverage: number;
}

export interface ReasonStat {
  reason: string;
  label: string;
  kind: FallReason['kind'];
  count: number;
}

export interface Limiters {
  /** Climbs in the window, and how many of them carry a style. */
  climbs: number;
  tagged: number;
  /** Send rate over the tagged climbs, 0-1. */
  average: number;
  /** Styles sent less often than average, weakest first; at most three. */
  weakest: StyleStat[];
  /** Styles sent more often than average, best first; at most three. */
  strongest: StyleStat[];
  reasons: ReasonStat[];
  /** Falls put down to the head (BACKED OFF, SCARED), of all falls with a reason. */
  headFalls: number;
  falls: number;
  /** Climbing sessions in the window with a go at 110%, of all of them. */
  tryHardSessions: number;
  sessions: number;
  /** Enough tagged climbs to name styles. */
  enough: boolean;
}

export function getLimiters(log: ClimbSession[], now = localDate()): Limiters {
  const recent = log.filter(s => !s.draft && daysBetween(s.date, now) >= 0 && daysBetween(s.date, now) <= LIMITER_WINDOW_DAYS);
  const climbs = recent.flatMap(s => s.climbs);
  const tagged = climbs.filter(c => c.tags?.length);
  const average = tagged.length ? tagged.filter(c => c.sent).length / tagged.length : 0;

  const byTag = new Map<string, { climbs: number; sent: number }>();
  for (const c of tagged) {
    for (const t of new Set(c.tags)) {
      if (!tagById(t)) continue;
      const row = byTag.get(t) ?? { climbs: 0, sent: 0 };
      row.climbs++;
      if (c.sent) row.sent++;
      byTag.set(t, row);
    }
  }
  const stats: StyleStat[] = [...byTag.entries()]
    .filter(([, r]) => r.climbs >= MIN_PER_STYLE)
    .map(([tag, r]) => {
      const rate = r.sent / r.climbs;
      return { tag, label: tagById(tag)!.label, climbs: r.climbs, sent: r.sent, rate, vsAverage: Math.round((rate - average) * 100) };
    });
  // Weight by how many climbs carry it: a style failed on twelve times is a
  // surer finding than one failed on four.
  const weight = (s: StyleStat) => (s.rate - average) * Math.sqrt(s.climbs);
  const enough = tagged.length >= MIN_TAGGED;
  const weakest = enough ? stats.filter(s => s.vsAverage <= -10).sort((a, b) => weight(a) - weight(b)).slice(0, 3) : [];
  const strongest = enough ? stats.filter(s => s.vsAverage >= 10).sort((a, b) => weight(b) - weight(a)).slice(0, 3) : [];

  const counts = new Map<string, number>();
  let falls = 0;
  for (const c of climbs) {
    const why = (c.why ?? []).filter(r => reasonById(r));
    if (why.length) falls++;
    for (const r of new Set(why)) counts.set(r, (counts.get(r) ?? 0) + 1);
  }
  const reasons: ReasonStat[] = FALL_REASONS
    .filter(r => counts.has(r.id))
    .map(r => ({ reason: r.id, label: r.label, kind: r.kind, count: counts.get(r.id)! }))
    .sort((a, b) => b.count - a.count);
  const headFalls = climbs.filter(c => (c.why ?? []).some(r => reasonById(r)?.kind === 'head')).length;

  return {
    climbs: climbs.length,
    tagged: tagged.length,
    average,
    weakest,
    strongest,
    reasons,
    headFalls,
    falls,
    tryHardSessions: recent.filter(s => s.tryHard).length,
    sessions: recent.length,
    enough,
  };
}

/** The one sentence on top of WHERE YOU FALL. */
export function limiterHeadline(l: Limiters): string {
  if (!l.climbs) return 'Log climbs to see where you fall.';
  if (!l.enough) {
    const left = MIN_TAGGED - l.tagged;
    return `Tag ${left} more climb${left === 1 ? '' : 's'} with their style to see where you fall.`;
  }
  const top = l.weakest[0];
  const reason = l.reasons[0];
  if (!top) return reason ? `No style stands out. You fall most to ${reason.label.toLowerCase()}.` : 'No style stands out: you send them all about as often.';
  return `${cap(top.label)} is where you fall: ${Math.round(top.rate * 100)}% sent against ${Math.round(l.average * 100)}% overall.`
    + (reason ? ` Most falls: ${reason.label.toLowerCase()}.` : '');
}

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
