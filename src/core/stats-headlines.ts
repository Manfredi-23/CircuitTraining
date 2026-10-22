// =============================================================================
// stats-headlines.ts — One sentence on top of each STATS section
//
// Every section opens with the answer in words, so the chart under it is the
// evidence rather than the puzzle. Each sentence names what it is measured
// against. Pure, no React.
// =============================================================================

import { bestGain, fmtDay, WORK_AREA_LABEL, type AreaShare } from './review';
import { CONFIG } from './config';
import { CORE_TARGETS, type CoreGroup, type FreshnessRow, type OapPath, type SkipRow } from './insights';
import { getClimbSummary } from './climbing';
import { lastAssess, RETEST_WEEKS } from './recommend';
import { addDays, daysBetween, localDate } from './dates';
import type { LoadRatio } from './training-load';
import type { BenchmarkResult, ClimbSession, LoadLogEntry } from './types';
import type { ClimbView } from './climbing';

const kg = (n: number) => `${Math.round(n * 10) / 10} kg`;

export function liftHeadline(loadLog: LoadLogEntry[]): string {
  const real = loadLog.filter(l => l.value > 0 && !l.exerciseId.startsWith('test-'));
  if (!real.length) return 'No loads logged yet. They are saved when the last set of an exercise is done.';
  const g = bestGain(loadLog);
  if (!g) return 'Loads held where they started. The stepper suggests a step up after an easy session.';
  return `${g.name} up ${kg(g.to - g.from)}, from ${kg(g.from)} on ${fmtDay(g.since)}.`;
}

export function workSplitHeadline(split: AreaShare[]): string | null {
  const used = split.filter(s => s.sets > 0).sort((a, b) => b.sets - a.sets);
  if (!used.length) return null;
  const top = used[0];
  const main = split.filter(s => s.area !== 'ARMS');
  const low = [...main].sort((a, b) => a.sets - b.sets)[0];
  const lowText = low.sets === 0 ? `nothing went to ${WORK_AREA_LABEL[low.area].toLowerCase()}` : `${WORK_AREA_LABEL[low.area].toLowerCase()} got ${low.share}%`;
  return `Most of the work went to ${WORK_AREA_LABEL[top.area].toLowerCase()} (${top.share}%); ${lowText}.`;
}

export function loadHeadline(ratio: LoadRatio | null): string {
  if (!ratio) return 'Three weeks of sessions and climbs are needed before this week can be compared with your usual one.';
  const pct = Math.round(ratio.ratio * 100);
  const word = ratio.zone === 'spike' ? 'a spike' : ratio.zone === 'high' ? 'well above usual' : ratio.zone === 'low' ? 'below usual' : 'in line';
  return `This week is ${pct}% of your usual weekly load: ${word}.`;
}

export function freshnessHeadline(rows: FreshnessRow[]): string {
  const late = rows.filter(r => r.days !== null && r.days > r.graceDays);
  const never = rows.filter(r => r.days === null);
  if (late.length) {
    const names = late.slice(0, 2).map(r => CONFIG.capacityLabels[r.capacity].toLowerCase()).join(' and ');
    return `${late.length} past ${late.length === 1 ? 'its' : 'their'} grace period and fading: ${names}${late.length > 2 ? ' and more' : ''}.`;
  }
  if (never.length === rows.length) return 'Nothing trained yet.';
  return `Everything trained inside its grace period${never.length ? `; ${never.length} never trained` : ''}.`;
}

export function coreHeadline(volume: Record<CoreGroup, number>): string {
  const groups = Object.keys(CORE_TARGETS) as CoreGroup[];
  const behind = groups.filter(g => volume[g] < CORE_TARGETS[g]).sort((a, b) => volume[a] / CORE_TARGETS[a] - volume[b] / CORE_TARGETS[b]);
  if (!behind.length) return 'All three core targets met this week.';
  const g = behind[0];
  return `${g === 'back' ? 'Lower back' : g === 'abs' ? 'Abs' : 'Obliques'}: ${volume[g]} of ${CORE_TARGETS[g]} hard sets this week, the furthest behind.`;
}

export function skippedHeadline(rows: SkipRow[]): string {
  const worst = rows.find(r => r.short > 0);
  if (!worst) return 'Nothing cut short in 90 days.';
  return `${worst.name} cut short most: ${worst.short} of ${worst.planned} sessions in 90 days.`;
}

export function oneArmHeadline(path: OapPath): string {
  const last = path.points[path.points.length - 1];
  if (!last) return 'No tested weighted pull-up yet. ASSESS records one; the one-arm rungs open on it.';
  const open = path.gates.filter(g => g.reached);
  if (open.length === path.gates.length) return `${last.value}% of bodyweight tested: both one-arm stages open.`;
  const next = path.gates.find(g => !g.reached)!;
  return `${last.value}% of bodyweight tested; ${next.label.toLowerCase()} opens at ${next.value}% (${next.addedKg} kg on the belt).`;
}

export function testsHeadline(results: BenchmarkResult[], now = new Date()): string {
  const last = lastAssess(results);
  if (!last) return 'No ASSESS yet. It sets the loads and opens the gates.';
  const today = localDate(now);
  const due = addDays(last, RETEST_WEEKS * 7);
  const ago = daysBetween(last, today);
  return due <= today
    ? `Last ASSESS ${ago} days ago. A retest is due.`
    : `Last ASSESS on ${fmtDay(last)}; the next one around ${fmtDay(due)}.`;
}

export function climbHeadline(climbLog: ClimbSession[], view: ClimbView | null, now = new Date()): string {
  if (!climbLog.length || !view) return 'No climbs logged yet. Add them from LOG.';
  const since = addDays(localDate(now), -28);
  const recent = climbLog.filter(c => c.date >= since);
  if (!recent.length) return 'No climbs logged in the last four weeks.';
  const s = getClimbSummary(recent, view);
  return `${recent.length} session${recent.length === 1 ? '' : 's'} in four weeks${s.hardestSend ? `; hardest send ${s.hardestSend.charAt(0) + s.hardestSend.slice(1).toLowerCase()}` : ''}.`;
}
