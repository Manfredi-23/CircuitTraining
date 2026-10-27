// =============================================================================
// coach.ts — The last four weeks in one text, for a coach to read
//
// Everything a coach would ask before a weekly review, from the logs: who the
// athlete is and where they are going, the season, what was trained and how
// it felt, loads and tests, the climbs and why they fell, the head, the
// finger. Plain text, short enough to paste into a chat, and the same text the
// in-app review sends with the athlete's own API key.
//
// The review it asks for suggests; it never changes the plan. The athlete
// decides, as everywhere else in the app.
// =============================================================================

import { ATHLETE, currentBodyweight, getBenchmark, latestResult } from './benchmarks';
import { gradeLabel } from './climbing';
import { describeTags } from './climb-tags';
import { addDays, dayOf, daysBetween, localDate } from './dates';
import { boulderGap } from './gap';
import { goalLadder, etaLabel, type Goals } from './goals';
import { getLimiters } from './limiters';
import { getOverview } from './review';
import { plateaus } from './adapt';
import { getRingRecovery } from './rehab';
import { getSeason, seasonLabel } from './season';
import { drillById } from './wall';
import type { ActivitySession } from './activity';
import type { BenchmarkResult, ClimbSession, LoadLogEntry, SessionLogEntry } from './types';

export interface CoachInput {
  sessionLog: SessionLogEntry[];
  climbLog: ClimbSession[];
  activityLog: ActivitySession[];
  loadLog: LoadLogEntry[];
  benchmarkResults: BenchmarkResult[];
  goals: Goals;
  /** A finger heals (recommend.isHealing). */
  healing: boolean;
  now?: Date;
}

/** Days the summary covers in detail. */
export const COACH_DAYS = 28;

/** Tests read into the summary, when recorded. */
const KEY_TESTS = ['weighted-pullup-2rm', 'fs-2arm-20mm', 'max-pullups', 'toes-to-bar', 'hollow-hold', 'hip-footraise', 'bodyweight'];

const pct = (n: number) => `${Math.round(n * 100)}%`;

export function coachSummary(input: CoachInput): string {
  const now = input.now ?? new Date();
  const today = localDate(now);
  const since = addDays(today, -COACH_DAYS);
  const lines: string[] = [];
  const out = (s = '') => lines.push(s);

  // Who and where to.
  const b = goalLadder(input.goals, input.climbLog, 'BOULDER', today);
  const s = goalLadder(input.goals, input.climbLog, 'SPORT', today);
  const season = getSeason(input.goals, input.sessionLog, now);
  out(`ATHLETE: ${ATHLETE.age}, ${currentBodyweight(input.benchmarkResults)} kg, climbing ${ATHLETE.years} years. Boulders twice a week at a gym; home kit is a mat, a band and a portable edge.`);
  out(`GRADES: boulder ${b.working} (${b.from === 'log' ? 'from sends' : 'profile'}), sport ${s.working}. Goals: boulder ${b.next} then ${b.final}, sport ${s.next} then ${s.final}.`);
  const nb = b.milestones.find(m => m.isNext);
  if (nb) out(`ESTIMATE: ${b.next} boulder around ${etaLabel(nb.eta)} at ${b.rate === 'yours' ? 'their own' : 'a typical'} ${b.monthsPerStep} months a grade.`);
  out(`SEASON: ${seasonLabel(season)}. ${season.job}`);
  out(`OWN READ OF LIMITERS: technique and feet first, then the head ("scared, rarely gives 110%"), then stamina; ropes up rarely.`);
  if (input.healing) {
    const ring = getRingRecovery(input.loadLog, input.benchmarkResults);
    out(`INJURY: left ring finger healing (usable, bad when isolated)${ring.pct !== null ? `; left at ${ring.pct}% of the right, cleared at 80%` : ''}.`);
  }
  out();

  // The last four weeks.
  const ov = getOverview(input.sessionLog, input.climbLog, input.activityLog, now).current;
  out(`LAST ${COACH_DAYS} DAYS: ${ov.trainingDays} training days, ${Math.round(ov.minutes / 6) / 10} h, ${ov.sessions} app sessions, ${ov.climbs} climbing sessions${ov.completion !== null ? `, ${ov.completion}% of planned sets done` : ''}${ov.effort !== null ? `, mean effort ${ov.effort}/10` : ''}.`);
  out();

  out('SESSIONS (date, session, minutes, effort, pain, finger readiness, sets done/planned):');
  for (const e of input.sessionLog.filter(x => dayOf(x.date) >= since)) {
    const done = Object.values(e.sets ?? {}).reduce((a, n) => a + n, 0);
    const planned = e.planned ? Object.values(e.planned).reduce((a, n) => a + n, 0) : null;
    out(`- ${dayOf(e.date)} ${e.mode} ${e.circuitTitle}, ${e.duration} min`
      + `${e.effort !== undefined ? `, effort ${e.effort}` : ''}${e.pain !== undefined ? `, pain ${e.pain}` : ''}`
      + `${e.readiness !== undefined ? `, readiness ${e.readiness}%` : ''}${planned ? `, ${done}/${planned} sets` : ''}`);
  }
  out();

  // Loads: each lift's first and latest value in the window, and stalls.
  const lifts = new Map<string, LoadLogEntry[]>();
  for (const l of input.loadLog.filter(x => x.date >= since && x.value > 0)) {
    lifts.set(l.exerciseName, [...(lifts.get(l.exerciseName) ?? []), l]);
  }
  if (lifts.size) {
    out('LOADS (first to latest in the period):');
    for (const [name, entries] of lifts) {
      const sorted = entries.sort((a, z) => a.date.localeCompare(z.date));
      out(`- ${name}: ${sorted[0].value} to ${sorted[sorted.length - 1].value} ${sorted[0].unit}`);
    }
    const stalls = plateaus(input.loadLog, now);
    if (stalls.length) out(`STALLED: ${stalls.map(p => `${p.name} at ${p.value} ${p.unit} for ${p.sessions} sessions`).join('; ')}.`);
    out();
  }

  // Tests and the gap to the next grade.
  const tests = KEY_TESTS.map(id => ({ id, r: latestResult(input.benchmarkResults, id) })).filter(t => t.r);
  if (tests.length) {
    out(`TESTS (latest): ${tests.map(t => `${getBenchmark(t.id)?.name} ${t.r!.value} ${getBenchmark(t.id)?.short ?? ''} (${dayOf(t.r!.date)})`).join('; ')}.`);
  }
  out(`GAP TO ${b.next}: ${boulderGap(input.goals, b.working, input.benchmarkResults).headline}`);
  out();

  // Climbs.
  const climbs = input.climbLog.filter(c => c.date >= since && !c.draft);
  if (climbs.length) {
    out('CLIMBING SESSIONS (date, where, climbs as grade/goes/sent, style and falls):');
    for (const c of climbs) {
      const list = c.climbs.map(x => `${gradeLabel(x.grade)}/${x.attempts}/${x.sent ? 'sent' : 'proj'}${x.tags?.length || x.why?.length ? ` [${describeTags(x.tags, x.why)}]` : ''}`).join(', ');
      const focus = (c.focusDone ?? []).map(id => drillById(id)?.name).filter(Boolean).join(', ');
      out(`- ${c.date} ${c.venue} ${c.discipline}${c.durationMin ? `, ${c.durationMin} min` : ''}${c.effort ? `, effort ${c.effort}` : ''}${c.tryHard ? ', a 110% go' : ''}${focus ? `, focus done: ${focus}` : ''}: ${list}`);
    }
    out();
  }
  const l = getLimiters(input.climbLog, today);
  if (l.enough) {
    out(`STYLES (12 weeks, ${pct(l.average)} sent overall): weakest ${l.weakest.map(w => `${w.label.toLowerCase()} ${pct(w.rate)} of ${w.climbs}`).join(', ') || 'none stand out'}; strongest ${l.strongest.map(w => `${w.label.toLowerCase()} ${pct(w.rate)}`).join(', ') || 'none stand out'}.`);
  }
  if (l.falls) out(`FALLS: ${l.reasons.map(r => `${r.label.toLowerCase()} ${r.count}`).join(', ')}.`);
  if (l.sessions) out(`HEAD: a 110% go in ${l.tryHardSessions} of ${l.sessions} climbing sessions.`);

  const outside = input.activityLog.filter(a => a.date >= since);
  if (outside.length) out(`OUTSIDE: ${outside.map(a => `${a.date} ${a.type.toLowerCase()}${a.upM ? ` ${a.upM} m up` : ''}`).join('; ')}.`);

  return lines.join('\n').trim();
}

/** What is asked of the coach: the athlete's own words on how they like to be helped. */
export const COACH_SYSTEM = [
  'You are an experienced climbing coach reviewing one athlete\'s last four weeks from their training app.',
  'The athlete wants to climb 7c and then 8a, boulder and sport. Their own read: technique and feet hold them back most, then fear and not trying 110%, then stamina.',
  'Write a short review in plain text, no emoji, no tables:',
  '1. WHAT WENT WELL: two or three specific points from the data.',
  '2. WHAT HOLDS YOU BACK: the one or two biggest limiters the data shows, with the evidence.',
  '3. NEXT WEEK: three to five concrete changes, each one line, that fit a week of two bouldering sessions, short home mornings and one or two gym days.',
  '4. ON THE WALL: one technique focus and one head focus for the next bouldering sessions.',
  'Be specific: name sessions, loads, grades and dates from the data. Do not invent numbers that are not there.',
  'Respect the safety rules: a healing finger and pain scores mean less finger load, never more. Suggest; the athlete decides.',
  'Keep it under 350 words.',
].join('\n');

/** Days since the last review, or null without one. */
export function daysSince(iso: string | null, now = new Date()): number | null {
  return iso ? daysBetween(dayOf(iso), localDate(now)) : null;
}
