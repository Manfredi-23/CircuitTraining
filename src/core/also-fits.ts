// =============================================================================
// also-fits.ts — The sessions that would also do today
//
// The recommender names one session. TODAY shows it large and, under it, up
// to two others that pass the same safety rules (finger pain, a healing
// finger, sore areas, no kit, a short day, recovery), each with one line on
// why it is the second choice. Pure, no React.
// =============================================================================

import { getModeData } from './data-index';
import { asksPainCheck, getReadiness } from './engine';
import { dayOf, daysBetween, localDate, mondayOf } from './dates';
import { assessDue, inHealBlock, isHealing, lastDone, PAIN_MEMORY_DAYS, type Recommendation, type RecommendInput } from './recommend';
import { CAVE_DAY_IDS, STRAIGHT_BACK_ID, WAKE_UP_IDS } from './data-week';
import { HEAL_GYM_IDS } from './data-heal';
import { isLegHeavy, legSoreness } from './activity';
import { NO_DAY, loadsArea, needsKit } from './today';
import type { Circuit, Mode } from './types';

interface Candidate {
  mode: Mode;
  circuit: Circuit;
  reason: string;
}

const agoText = (ago: number | null) =>
  ago === null ? 'Not done yet.' : ago === 0 ? 'Done earlier today.' : ago === 1 ? 'Last done yesterday.' : `Last done ${ago} days ago.`;

/** Up to `limit` more sessions that fit today, never the recommendation itself. */
export function alsoFits(input: RecommendInput, primary: Recommendation | null, limit = 2): Recommendation[] {
  const now = input.now ?? new Date();
  const today = localDate(now);
  const day = input.day ?? NO_DAY;
  if (day.off) return [];
  const { sessionLog, climbLog, progress } = input;

  const healing = isHealing(sessionLog, climbLog, now);
  const pain = [...sessionLog].reverse().find(
    s => s.pain !== undefined && daysBetween(dayOf(s.date), today) <= PAIN_MEMORY_DAYS,
  )?.pain ?? 0;
  const noFingers = healing || pain >= 6 || day.sore.includes('FOREARMS');
  const legsSore = legSoreness(input.activityLog ?? [], now) !== null;
  const shortDay = day.minutes !== null && day.minutes <= 30;
  const climbedToday = climbLog.some(c => c.date === today);

  const pool: Candidate[] = [];
  const add = (mode: Mode, circuit: Circuit, reason: string) => pool.push({ mode, circuit, reason });

  // v47: only the week's sessions (`data-week.ts`); the rest stay in TRAIN.
  if (inHealBlock(sessionLog, climbLog, now)) {
    for (const c of getModeData('HEAL').filter(c => HEAL_GYM_IDS.includes(c.id))) add('HEAL', c, 'The other gym session for the healing finger.');
  }
  const ago = (id: string) => { const d = lastDone(sessionLog, id); return agoText(d === null ? null : daysBetween(d, today)); };
  if (!day.noKit) {
    const cave = getModeData('CAVE');
    const straight = cave.find(c => c.id === STRAIGHT_BACK_ID);
    if (straight && (climbedToday || day.kind === 'CLIMB')) add('CAVE', straight, 'After climbing: the opposite side.');
    if (day.kind !== 'CLIMB' && !climbedToday && !cave.some(c => CAVE_DAY_IDS.includes(c.id) && lastDone(sessionLog, c.id) === today)) {
      for (const c of cave.filter(c => CAVE_DAY_IDS.includes(c.id))) add('CAVE', c, ago(c.id));
    }
    const test = getModeData('TEST')[0];
    if (test && !input.tired && !shortDay && !healing && assessDue(input.benchmarkResults, sessionLog, now)) add('TEST', test, 'ASSESS is due.');
  }
  const daily = getModeData('DAILY');
  if (!WAKE_UP_IDS.some(id => lastDone(sessionLog, id) === today)) {
    for (const c of daily.filter(c => WAKE_UP_IDS.includes(c.id))) add('DAILY', c, ago(c.id));
  }

  const fits = pool.filter(({ circuit }) => {
    if (primary && circuit.id === primary.circuitId) return false;
    if (lastDone(sessionLog, circuit.id) === today) return false;
    if (noFingers && asksPainCheck(circuit)) return false;
    if (legsSore && isLegHeavy(circuit)) return false;
    if (day.sore.some(a => loadsArea(circuit, a))) return false;
    if (day.noKit && circuit.exercises.filter(e => e.block !== 'WARMUP' && !needsKit(e)).length < 3) return false;
    return circuit.stacksOnSession || getReadiness(circuit, progress).level !== 'rest';
  });

  const seen = new Set<string>();
  return fits
    .filter(c => (seen.has(c.circuit.id) ? false : (seen.add(c.circuit.id), true)))
    // The pool is in order of relevance (healing, after-climbing, strength,
    // test, then DAILY); DAILY sessions among themselves least recently done first.
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      if (a.c.mode === 'DAILY' && b.c.mode === 'DAILY') {
        return (lastDone(sessionLog, a.c.circuit.id) ?? '').localeCompare(lastDone(sessionLog, b.c.circuit.id) ?? '');
      }
      return a.i - b.i;
    })
    .map(x => x.c)
    .slice(0, limit)
    .map(c => ({ mode: c.mode, circuitId: c.circuit.id, reason: c.reason }));
}
