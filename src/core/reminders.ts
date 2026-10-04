// =============================================================================
// reminders.ts — Which local notifications to schedule, and when
//
// Everything a reminder needs is already on the device, so these are local
// notifications planned here and handed to the OS, the same way the rest alert
// is. The plan is rebuilt whenever the app opens, comes back to the
// foreground, or finishes a session, so it always reflects the latest logs:
// each rebuild replaces every pending reminder. Pure functions, no React.
//
// Quiet hours: nothing is planned between 21:30 and 07:00. A reminder that
// would land there moves to 08:00.
// =============================================================================

import { CONFIG } from './config';
import { getModeData } from './data-index';
import { addDays, dayOf, localDate, mondayOf } from './dates';
import { getCoreVolume, CORE_TARGETS, type CoreGroup } from './insights';
import { assessDue, lastAssess, RETEST_WEEKS } from './recommend';
import type { BenchmarkResult, ClimbSession, Progress, SessionLogEntry } from './types';

export type ReminderKind = 'fingers' | 'fading' | 'core' | 'daily' | 'assess' | 'climb';

export const REMINDER_LABELS: Record<ReminderKind, { title: string; hint: string }> = {
  daily:   { title: 'DAILY morning', hint: 'At the time below, unless a DAILY is already done.' },
  fingers: { title: 'Fingers recovered', hint: '48 hours after the last hard finger session or boulder day.' },
  fading:  { title: 'Capacity fading', hint: 'Two days before a capacity starts to lose XP.' },
  core:    { title: 'Core behind', hint: 'Thursday evening, when under half the week\'s hard core sets are done.' },
  assess:  { title: 'ASSESS due', hint: `Saturday morning, ${RETEST_WEEKS} weeks after the last test.` },
  climb:   { title: 'Log your climbs', hint: 'Evening after a CAVE 02 or 03 with no climb logged.' },
};

export interface ReminderSettings {
  enabled: Record<ReminderKind, boolean>;
  /** Local time for the DAILY reminder, HH:MM. */
  dailyTime: string;
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: { daily: true, fingers: true, fading: true, core: true, assess: true, climb: true },
  dailyTime: '07:30',
};

export interface Reminder {
  kind: ReminderKind;
  /** Stable OS notification id; see REMINDER_ID_BASE. */
  id: number;
  at: Date;
  title: string;
  body: string;
}

/**
 * Notification ids. The rest alert uses 1; reminders use 1000 and up, one
 * block of ten per kind, so a rebuild can cancel exactly what it scheduled.
 */
export const REMINDER_ID_BASE = 1000;
const KIND_ORDER: ReminderKind[] = ['daily', 'fingers', 'fading', 'core', 'assess', 'climb'];
export const ALL_REMINDER_IDS: number[] = KIND_ORDER.flatMap((_, k) =>
  Array.from({ length: 10 }, (__, i) => REMINDER_ID_BASE + k * 10 + i));
const idFor = (kind: ReminderKind, n = 0) => REMINDER_ID_BASE + KIND_ORDER.indexOf(kind) * 10 + n;

const QUIET_FROM = 21 * 60 + 30;
const QUIET_UNTIL = 7 * 60;
const MORNING = 8 * 60;

function at(date: string, minutes: number): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, Math.floor(minutes / 60), minutes % 60, 0);
}

/** Move a moment out of quiet hours to 08:00. */
export function outOfQuietHours(when: Date): Date {
  const mins = when.getHours() * 60 + when.getMinutes();
  if (mins >= QUIET_UNTIL && mins < QUIET_FROM) return when;
  const day = localDate(when);
  return at(mins >= QUIET_FROM ? addDays(day, 1) : day, MORNING);
}

function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (Number.isFinite(h) ? h : 7) * 60 + (Number.isFinite(m) ? m : 30);
}

export interface ReminderInput {
  progress: Progress;
  sessionLog: SessionLogEntry[];
  climbLog: ClimbSession[];
  benchmarkResults: BenchmarkResult[];
  settings: ReminderSettings;
  now?: Date;
}

const CORE_NAMES: Record<CoreGroup, string> = { abs: 'abs', obliques: 'oblique', back: 'lower back' };

export function planReminders(input: ReminderInput): Reminder[] {
  const { progress, sessionLog, climbLog, benchmarkResults, settings } = input;
  const now = input.now ?? new Date();
  const today = localDate(now);
  const on = settings.enabled;
  const out: Reminder[] = [];
  const push = (r: Reminder) => { if (r.at.getTime() > now.getTime()) out.push(r); };

  // DAILY: today (unless done) and the next two mornings, so a few days
  // without opening the app still get a nudge.
  if (on.daily) {
    const time = parseTime(settings.dailyTime);
    const doneToday = sessionLog.some(s => s.mode === 'DAILY' && dayOf(s.date) === today);
    for (let n = doneToday ? 1 : 0, i = 0; n <= 2; n++, i++) {
      push({ kind: 'daily', id: idFor('daily', i), at: at(addDays(today, n), time), title: 'DAILY', body: 'Mat, band, fifteen minutes. Then coffee.' });
    }
  }

  // Fingers: 48h after the last hard loading, if that is still ahead.
  if (on.fingers) {
    const lastHard = (['crimp', 'openhand'] as const)
      .map(c => progress[c]?.lastHard ?? null)
      .filter((d): d is string => Boolean(d))
      .map(d => new Date(d).getTime());
    if (lastHard.length) {
      const ready = new Date(Math.max(...lastHard) + CONFIG.recovery.fingerMaxHours * 3600000);
      push({ kind: 'fingers', id: idFor('fingers'), at: outOfQuietHours(ready), title: 'Fingers recovered', body: '48 hours since the last hard finger session. STRONG or a board session is on.' });
    }
  }

  // Fading: the soonest capacity to start losing XP, two days ahead of it.
  if (on.fading) {
    let soonest: { label: string; at: Date } | null = null;
    for (const c of CONFIG.capacities) {
      const last = progress[c]?.lastTrained;
      if (!last) continue;
      const fade = new Date(new Date(last).getTime() + CONFIG.decay.rates[c].graceDays * 86400000);
      const warn = at(localDate(new Date(fade.getTime() - 2 * 86400000)), MORNING + 30);
      if (warn.getTime() > now.getTime() && (!soonest || warn < soonest.at)) {
        soonest = { label: CONFIG.capacityLabels[c], at: warn };
      }
    }
    if (soonest) {
      push({ kind: 'fading', id: idFor('fading'), at: soonest.at, title: 'Capacity fading', body: `${soonest.label[0].toUpperCase()}${soonest.label.slice(1)} starts to fade in two days. One session holds it.` });
    }
  }

  // Core: Thursday 19:00 this week, judged on the sets done so far.
  if (on.core) {
    const thursday = addDays(mondayOf(today), 3);
    const vol = getCoreVolume(sessionLog, now);
    const behind = (Object.keys(CORE_TARGETS) as CoreGroup[])
      .filter(g => vol[g] < CORE_TARGETS[g] / 2)
      .map(g => `${vol[g]} of ${CORE_TARGETS[g]} ${CORE_NAMES[g]}`);
    if (behind.length) {
      push({ kind: 'core', id: idFor('core'), at: at(thursday, 19 * 60), title: 'Core behind', body: `So far this week: ${behind.join(', ')} sets.` });
    }
  }

  // ASSESS: the Saturday on or after the due date, 09:00.
  if (on.assess) {
    const last = lastAssess(benchmarkResults);
    const due = last ? addDays(last, RETEST_WEEKS * 7) : (assessDue(benchmarkResults, sessionLog, now) ? today : null);
    if (due) {
      const from = due < today ? today : due;
      const sat = addDays(mondayOf(from), 5);
      const day = sat < from ? addDays(sat, 7) : sat;
      const when = at(day, 9 * 60);
      push({ kind: 'assess', id: idFor('assess'), at: when.getTime() > now.getTime() ? when : at(addDays(day, 7), 9 * 60), title: 'ASSESS due', body: last ? `${RETEST_WEEKS} weeks since the last test. Retest when the fingers are fresh.` : 'No baseline yet. ASSESS sets the loads everything else uses.' });
    }
  }

  // Climbs: an after-bouldering session today and no climb logged.
  if (on.climb) {
    const stacking = new Set(getModeData('CAVE').filter(c => c.stacksOnSession).map(c => c.id));
    const stackedToday = sessionLog.some(s => stacking.has(s.circuitId) && dayOf(s.date) === today);
    const loggedToday = climbLog.some(c => c.date === today);
    if (stackedToday && !loggedToday) {
      push({ kind: 'climb', id: idFor('climb'), at: at(today, 21 * 60), title: 'Log your climbs', body: 'Grades, goes and how hard it felt. Thirty seconds.' });
    }
  }

  return out;
}
