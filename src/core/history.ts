// =============================================================================
// history.ts — Everything that was done, newest first
//
// The LOG tab lists app sessions, climbs and outside activities as one
// stream, grouped by day. Each item carries the one line that tells it apart
// at a glance. Pure, no React.
// =============================================================================

import { dayOf } from './dates';
import { gradeIndex, gradeLabel, viewFor, viewScale } from './climbing';
import { ACTIVITY_SPEC, describeEstimate, estimateActivity, type ActivitySession } from './activity';
import type { ClimbSession, LoadLogEntry, SessionLogEntry } from './types';

export type HistoryKind = 'SESSION' | 'CLIMB' | 'ACTIVITY';

export interface HistoryItem {
  kind: HistoryKind;
  /** Local day, YYYY-MM-DD. */
  day: string;
  /** For sorting within a day. */
  at: string;
  /** Session: index into the session log. Climb and activity: their id. */
  ref: string;
  title: string;
  detail: string;
}

export interface HistoryDay {
  day: string;
  items: HistoryItem[];
}

/** Only the days, and the entries within them, of one kind; null keeps everything. */
export function filterDays(days: HistoryDay[], kind: HistoryKind | null): HistoryDay[] {
  if (!kind) return days;
  return days
    .map(d => ({ ...d, items: d.items.filter(it => it.kind === kind) }))
    .filter(d => d.items.length > 0);
}

/** Sets done against sets planned, for "all sets" or "cut short". */
export function setsLine(s: SessionLogEntry): string | null {
  if (!s.planned) return null;
  const planned = Object.values(s.planned).reduce((a, b) => a + b, 0);
  if (!planned) return null;
  const done = Object.keys(s.planned).reduce((a, id) => a + Math.min(s.sets?.[id] ?? 0, s.planned![id]), 0);
  return done >= planned ? 'all sets' : `${done} of ${planned} sets`;
}

function sessionItem(s: SessionLogEntry, index: number): HistoryItem {
  const parts = [`${s.duration} min`];
  const sets = setsLine(s);
  if (sets) parts.push(sets);
  if (s.effort !== undefined) parts.push(`effort ${s.effort}`);
  if (s.pain !== undefined && s.pain >= 3) parts.push(`pain ${s.pain}`);
  return { kind: 'SESSION', day: dayOf(s.date), at: s.date, ref: String(index), title: `${s.mode} · ${s.circuitTitle}`, detail: parts.join(' · ') };
}

function climbItem(c: ClimbSession): HistoryItem {
  const scale = viewScale(viewFor(c));
  const sends = c.climbs.filter(x => x.sent);
  const best = sends.reduce<string | null>((b, x) => (b === null || gradeIndex(scale, x.grade) > gradeIndex(scale, b) ? x.grade : b), null);
  const where = c.venue === 'BOARD' ? `${c.board ?? 'BOARD'}${c.angle !== undefined ? ` ${c.angle}°` : ''}` : c.venue === 'OUTDOOR' ? (c.place || 'OUTDOOR') : 'GYM';
  const parts = [`${c.climbs.length} climb${c.climbs.length === 1 ? '' : 's'}`];
  if (best) parts.push(`best send ${gradeLabel(best)}`);
  if (c.durationMin) parts.push(`${c.durationMin} min`);
  return { kind: 'CLIMB', day: c.date, at: `${c.date}T12:00`, ref: c.id, title: `CLIMB · ${where} ${c.discipline === 'ROPE' ? 'ROPE' : 'BOULDER'}`, detail: parts.join(' · ') };
}

function activityItem(a: ActivitySession): HistoryItem {
  return {
    kind: 'ACTIVITY', day: a.date, at: `${a.date}T10:00`, ref: a.id,
    title: ACTIVITY_SPEC[a.type].label, detail: describeEstimate(estimateActivity(a), a.type),
  };
}

/** Every logged thing, newest day first, newest first within a day. */
export function historyDays(sessionLog: SessionLogEntry[], climbLog: ClimbSession[], activityLog: ActivitySession[]): HistoryDay[] {
  const items = [
    ...sessionLog.map(sessionItem),
    ...climbLog.map(climbItem),
    ...activityLog.map(activityItem),
  ].sort((a, b) => b.day.localeCompare(a.day) || b.at.localeCompare(a.at));
  const days: HistoryDay[] = [];
  for (const it of items) {
    const last = days[days.length - 1];
    if (last && last.day === it.day) last.items.push(it);
    else days.push({ day: it.day, items: [it] });
  }
  return days;
}

/**
 * A session taken out of the log, with the loads logged for its exercises on
 * its day: a session entered by mistake took its numbers with it. XP stays,
 * as it does when a climb is deleted.
 */
export function removeSession(
  sessionLog: SessionLogEntry[], loadLog: LoadLogEntry[], index: number,
): { sessionLog: SessionLogEntry[]; loadLog: LoadLogEntry[] } {
  const s = sessionLog[index];
  if (!s) return { sessionLog, loadLog };
  const day = dayOf(s.date);
  const ids = new Set(Object.keys(s.sets ?? {}));
  // Another session the same day may share an exercise: its load stays.
  for (const [i, other] of sessionLog.entries()) {
    if (i !== index && dayOf(other.date) === day) for (const id of Object.keys(other.sets ?? {})) ids.delete(id);
  }
  return {
    sessionLog: sessionLog.filter((_, i) => i !== index),
    loadLog: loadLog.filter(l => !(dayOf(l.date) === day && ids.has(l.exerciseId))),
  };
}

/** Fields the athlete may correct on a past session. */
export type SessionPatch = Partial<Pick<SessionLogEntry, 'effort' | 'duration' | 'pain'>>;

export function patchSession(sessionLog: SessionLogEntry[], index: number, patch: SessionPatch): SessionLogEntry[] {
  return sessionLog.map((s, i) => (i === index ? { ...s, ...patch } : s));
}
