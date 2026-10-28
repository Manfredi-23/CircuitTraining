// =============================================================================
// coach.ts — The last four weeks in one text, for a coach to read
//
// Everything a coach would ask before a weekly review, from the logs: who the
// athlete is and where they are going, the season and the block week, every
// session exercise by exercise (sets done of planned, load, how it felt,
// skipped, added), every test and the whole gap, the ring finger as a series,
// the climbs and why they fell, the head, rest days and the weekly plan, and
// the athlete's own note. Plain text to paste into a chat, and the same text
// the in-app review sends with the athlete's own API key.
//
// The review it asks for suggests; it never changes the plan. The athlete
// decides, as everywhere else in the app.
// =============================================================================

import { ATHLETE, currentBodyweight, getBenchmark, latestResult, resultHistory } from './benchmarks';
import { getBlockWeek } from './block';
import { gradeLabel, GYM_COLOURS } from './climbing';
import { describeTags } from './climb-tags';
import { addDays, dayOf, daysBetween, localDate } from './dates';
import { boulderGap } from './gap';
import { goalLadder, etaLabel, type Goals } from './goals';
import { getLimiters } from './limiters';
import { getOverview } from './review';
import { plateaus } from './adapt';
import { getRingRecovery, RING_LEFT_EXERCISE, RING_RIGHT_BENCHMARK, RING_GOAL_PCT } from './rehab';
import { exerciseLibrary } from './reserve';
import { retiredName } from './insights';
import { itemLabel, WEEKDAYS, type WeekPlan } from './plan';
import { activeDay, describeDay, isEmptyDay, type DayPlan } from './today';
import type { Routine } from './routines';
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
  blockStart?: string | null;
  /** Rest and sick days (ADJUST TODAY). */
  offDays?: string[];
  /** Today's ADJUST TODAY, if set. */
  dayPlan?: DayPlan | null;
  weekPlan?: WeekPlan;
  routines?: Routine[];
  /** The athlete's own words for the coach, typed before copying. */
  note?: string;
  now?: Date;
}

/** Days the summary covers in detail. */
export const COACH_DAYS = 28;

/** Tests read into the summary, when recorded. */
const KEY_TESTS = ['weighted-pullup-2rm', 'fs-2arm-20mm', 'max-pullups', 'toes-to-bar', 'hollow-hold', 'hip-footraise', 'bodyweight'];

/** A gym colour with its Font band, so the coach reads grades, not colours. */
const GYM_FONT = new Map<string, string>(GYM_COLOURS.map(c => [c.id, c.font]));
const pct = (n: number) => `${Math.round(n * 100)}%`;
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const isTest = (id: string, name = '') => id.startsWith('test-') || name.startsWith('TEST');

/** One logged session, then one line per exercise: sets done of planned, load, feel, skipped or added. */
function sessionBlock(e: SessionLogEntry, input: CoachInput): string[] {
  const lib = exerciseLibrary();
  const end = new Date(e.date);
  const start = new Date(end.getTime() - e.duration * 60000);
  const day = dayOf(e.date);
  const loads = input.loadLog.filter(l => l.date === day);
  const loadOf = (id: string) => loads.find(l => l.exerciseId === id);
  const nameOf = (id: string) => lib.get(id)?.name ?? loadOf(id)?.exerciseName.replace(/^TEST — /, '') ?? retiredName(id);
  const planned = e.planned ?? {};
  const sets = e.sets ?? {};
  // Ramps have no plan (they end on a failed attempt), so they are counted apart.
  const plannedTotal = Object.values(planned).reduce((a, n) => a + n, 0);
  const doneTotal = Object.keys(planned).reduce((a, id) => a + Math.min(sets[id] ?? 0, planned[id]), 0);
  const block = getBlockWeek(input.blockStart ?? null, input.sessionLog, end);
  const head = [
    `${day} ${e.duration > 0 ? `${hhmm(start)}-${hhmm(end)}` : `${hhmm(end)}, under a minute`}`,
    `${e.mode} ${e.circuitTitle}`,
    e.energy,
    block.deload && e.mode !== 'DAILY' ? 'deload week' : null,
    e.duration > 0 ? `${e.duration} min` : null,
    e.effort !== undefined ? `effort ${e.effort}` : 'effort not rated',
    e.pain !== undefined ? `pain ${e.pain}` : null,
    e.readiness !== undefined ? `finger readiness ${e.readiness}%` : null,
    plannedTotal ? `${doneTotal}/${plannedTotal} sets${doneTotal < plannedTotal ? ', cut short' : ''}` : null,
  ].filter(Boolean).join(', ');
  const lines = [`- ${head}`];
  const added = new Set(e.added ?? []);
  const loadText = (id: string) => {
    const l = loadOf(id);
    return l && l.value > 0 ? ` @ ${l.value} ${l.unit}` : '';
  };
  for (const [id, n] of Object.entries(planned)) {
    const done = sets[id] ?? 0;
    const feel = e.feel?.[id] ? ` (${e.feel[id].toLowerCase()})` : '';
    const mark = done === 0 ? ', skipped' : done < n ? ', cut short' : '';
    lines.push(`    ${nameOf(id)}: ${done}/${n}${done ? loadText(id) : ''}${feel}${added.has(id) ? ', added' : ''}${mark}`);
  }
  for (const [id, n] of Object.entries(sets)) {
    if (id in planned) continue;
    const ramp = lib.get(id)?.ramp || isTest(id);
    lines.push(`    ${nameOf(id)}: ${n} ${ramp ? `attempt${n === 1 ? '' : 's'}${loadText(id) ? `, best${loadText(id).replace(' @', '')}` : ''}` : `set${n === 1 ? '' : 's'}${loadText(id)}`}${added.has(id) ? ', added' : ''}`);
  }
  return lines;
}

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
  const block = getBlockWeek(input.blockStart ?? null, input.sessionLog, now);
  out(`SEASON: ${seasonLabel(season)}. ${season.job}${input.healing && (season.phase === 'STRENGTH' || season.phase === 'POWER') ? ' While the finger heals, the app labels max finger work and limit moves not recommended, so this phase runs without them.' : ''}`);
  out(`BLOCK: ${block.deload ? 'deload week' : `build week ${block.week} of ${block.buildWeeks}`} (three build weeks, then a deload: one working set fewer on CAVE and HEAL gym work).`);
  out(`OWN READ OF LIMITERS: technique and feet first, then the head ("scared, rarely gives 110%"), then stamina; ropes up rarely.`);
  if (input.healing) {
    const ring = getRingRecovery(input.loadLog, input.benchmarkResults);
    out(`INJURY: left ring finger healing (usable, bad when isolated)${ring.pct !== null ? `; left at ${ring.pct}% of the right, cleared at ${RING_GOAL_PCT}%` : ''}.`);
  }
  if (input.note?.trim()) out(`ATHLETE'S NOTE: ${input.note.trim().replace(/\s+/g, ' ')}`);
  out();

  // The last four weeks.
  const ov = getOverview(input.sessionLog, input.climbLog, input.activityLog, now).current;
  out(`LAST ${COACH_DAYS} DAYS: ${ov.trainingDays} training days, ${Math.round(ov.minutes / 6) / 10} h, ${ov.sessions} app sessions, ${ov.climbs} climbing sessions${ov.completion !== null ? `, ${ov.completion}% of planned sets done` : ''}${ov.effort !== null ? `, mean effort ${ov.effort}/10` : ''}.`);
  out();

  out('SESSIONS (date, start-end, session, energy, minutes, effort 1-10, finger pain 0-10 before, finger readiness, working sets done/planned; then each exercise: sets done/planned @ load, how it felt, skipped / cut short / added; tests as attempts):');
  for (const e of input.sessionLog.filter(x => dayOf(x.date) >= since)) for (const l of sessionBlock(e, input)) out(l);
  out();

  // Loads: each lift's first and latest value in the window, and stalls.
  const lifts = new Map<string, LoadLogEntry[]>();
  for (const l of input.loadLog.filter(x => x.date >= since && x.value > 0 && !isTest(x.exerciseId, x.exerciseName))) {
    lifts.set(l.exerciseName, [...(lifts.get(l.exerciseName) ?? []), l]);
  }
  if (lifts.size) {
    out('LOADS (first to latest in the period, sessions, best):');
    for (const [name, entries] of lifts) {
      const sorted = entries.sort((a, z) => a.date.localeCompare(z.date));
      const best = Math.max(...sorted.map(x => x.value));
      out(`- ${name}: ${sorted[0].value} to ${sorted[sorted.length - 1].value} ${sorted[0].unit}, ${sorted.length} session${sorted.length === 1 ? '' : 's'}, best ${best}`);
    }
    const stalls = plateaus(input.loadLog, now);
    if (stalls.length) out(`STALLED: ${stalls.map(p => `${p.name} at ${p.value} ${p.unit} for ${p.sessions} sessions`).join('; ')}.`);
    out();
  }

  // Tests and the gap to the next grade.
  // Every test with a result: the latest, and the one before it to compare.
  const testIds = Array.from(new Set([...KEY_TESTS, ...input.benchmarkResults.map(r => r.benchmarkId)]))
    .filter(id => id !== RING_RIGHT_BENCHMARK && latestResult(input.benchmarkResults, id));
  if (testIds.length) {
    out('TESTS (latest, previous):');
    for (const id of testIds) {
      const bench = getBenchmark(id);
      const hist = resultHistory(input.benchmarkResults, id);
      const last = hist[hist.length - 1];
      const prev = hist.length > 1 ? hist[hist.length - 2] : null;
      const unit = bench?.short ?? bench?.unit ?? '';
      out(`- ${bench?.name ?? retiredName(id)}: ${last.value} ${unit} (${dayOf(last.date)})${prev ? `; before ${prev.value} (${dayOf(prev.date)})` : ''}`);
    }
  }
  const gap = boulderGap(input.goals, b.working, input.benchmarkResults);
  out(`GAP TO ${b.next}: ${gap.headline}`);
  for (const r of gap.rows) {
    const std = (v: number | null) => (v === null ? '?' : `${v}`);
    out(`- ${r.name}: ${r.value === null ? 'untested' : `${r.value} ${r.short}`}; standard now ${std(r.now)}, ${gap.next} ${std(r.next)}, ${gap.final} ${std(r.final)}${r.addKg ? `; ${r.addKg} kg more on the belt for ${gap.next}` : ''}${r.approximate ? ' (approximate table)' : ''}`);
  }
  out();

  // The ring finger as a series: what the left lifted, with the pain before it.
  if (input.healing || input.loadLog.some(l => l.exerciseId === RING_LEFT_EXERCISE && l.date >= since)) {
    const ring = getRingRecovery(input.loadLog, input.benchmarkResults);
    const rights = resultHistory(input.benchmarkResults, RING_RIGHT_BENCHMARK);
    const painOn = (day: string) => input.sessionLog.filter(e => dayOf(e.date) === day && e.circuitId.startsWith('heal') && e.pain !== undefined).map(e => e.pain);
    out(`RING FINGER (left: 3 x 12 working load on the edge; right: a 12-rep max ramp; cleared when the left's working load reaches ${RING_GOAL_PCT}% of the right's max):`);
    if (rights.length) out(`- Right tested: ${rights.map(r => `${r.value} kg (${dayOf(r.date)})`).join(', ')}`);
    for (const p of ring.points.filter(x => x.date >= since)) {
      const pain = painOn(p.date);
      out(`- ${p.date} left ${p.left} kg${p.pct !== null ? `, ${p.pct}%` : ''}${pain.length ? `, pain before ${pain.join(' / ')}` : ''}`);
    }
    out();
  }

  // Climbs.
  const climbs = input.climbLog.filter(c => c.date >= since && !c.draft);
  if (climbs.length) {
    out('CLIMBING SESSIONS (date, where, climbs logged, minutes, effort; then each climb as grade/goes/sent, style and why it fell; gym colours with their Font band):');
    for (const c of climbs) {
      const list = c.climbs.map(x => `${gradeLabel(x.grade)}${GYM_FONT.get(x.grade) ? ` (${GYM_FONT.get(x.grade)})` : ''}/${x.attempts}/${x.sent ? 'sent' : 'proj'}${x.tags?.length || x.why?.length ? ` [${describeTags(x.tags, x.why)}]` : ''}`).join(', ');
      const focus = (c.focusDone ?? []).map(id => drillById(id)?.name).filter(Boolean).join(', ');
      const where = c.venue === 'BOARD' ? `BOARD${c.board ? ` ${c.board}` : ''}${c.angle !== undefined ? ` ${c.angle}°` : ''}` : c.venue === 'OUTDOOR' && c.place ? `OUTDOOR ${c.place}` : c.venue;
      out(`- ${c.date} ${where} ${c.discipline}, ${c.climbs.length} climb${c.climbs.length === 1 ? '' : 's'} logged${c.durationMin ? `, ${c.durationMin} min` : ''}${c.effort ? `, effort ${c.effort}` : ''}${c.tryHard ? ', a 110% go' : ''}${focus ? `, focus done: ${focus}` : ''}: ${list}`);
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
  if (outside.length) out(`OUTSIDE: ${outside.map(a => `${a.date} ${a.type.toLowerCase()}${a.upM ? ` ${a.upM} m up` : ''}${a.durationMin ? `, ${a.durationMin} min` : ''}`).join('; ')}.`);

  const off = (input.offDays ?? []).filter(d => d >= since && d <= today);
  if (off.length) out(`REST OR SICK DAYS: ${off.join(', ')}.`);
  const todayPlan = activeDay(input.dayPlan, now);
  if (!isEmptyDay(todayPlan)) out(`TODAY: ${describeDay(todayPlan).toLowerCase()}.`);
  const plan = input.weekPlan ?? {};
  const planned = WEEKDAYS.map((d, i) => ({ d, items: plan[i] ?? [] })).filter(x => x.items.length);
  if (planned.length) out(`WEEKLY PLAN: ${planned.map(x => `${x.d} ${x.items.map(it => itemLabel(it, input.routines ?? [])).join(' + ')}`).join('; ')}.`);

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
