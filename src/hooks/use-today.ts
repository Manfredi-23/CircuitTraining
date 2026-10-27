'use client';

import { useEffect, useMemo } from 'react';
import { useStore } from '@/store/store';
import { getBlockWeek } from '@/core/block';
import { recommend } from '@/core/recommend';
import { alsoFits } from '@/core/also-fits';
import { applyPlan, type TodayPick } from '@/core/plan';
import { deloadAdvice } from '@/core/adapt';
import { healthReadiness } from '@/core/health';
import { activeDay } from '@/core/today';
import { daysBetween, localDate } from '@/core/dates';
import { getSeason } from '@/core/season';
import { wallFocus } from '@/core/wall';
import { isHealing } from '@/core/recommend';
import { getRingRecovery } from '@/core/rehab';

/**
 * What today calls for: the training-block week, the TODAY settings, the
 * Apple Health energy, the recommended session and the ones that would also
 * fit. TODAY reads it to lead with the recommendation; TRAIN to mark it.
 */
export function useToday() {
  const sessionLog = useStore(s => s.sessionLog);
  const climbLog = useStore(s => s.climbLog);
  const activityLog = useStore(s => s.activityLog);
  const progress = useStore(s => s.progress);
  const benchmarkResults = useStore(s => s.benchmarkResults);
  const blockStart = useStore(s => s.blockStart);
  const dayPlan = useStore(s => s.dayPlan);
  const health = useStore(s => s.health);
  const connected = useStore(s => s.settings.health.connected);
  const energySuggestedOn = useStore(s => s.energySuggestedOn);
  const suggestEnergy = useStore(s => s.suggestEnergy);
  const weekPlan = useStore(s => s.weekPlan);
  const routines = useStore(s => s.routines);
  const goals = useStore(s => s.settings.goals);
  const loadLog = useStore(s => s.loadLog);

  // Apple Health: sleep and HRV against the athlete's own week suggest an
  // energy. Applied once a day; any tap on the energy tabs overrides it.
  const healthDay = useMemo(() => (connected ? healthReadiness(health) : null), [health, connected]);
  useEffect(() => {
    const today = localDate();
    if (!healthDay || energySuggestedOn === today) return;
    suggestEnergy(healthDay.energy, today);
  }, [healthDay, energySuggestedOn, suggestEnergy]);

  const block = useMemo(() => getBlockWeek(blockStart, sessionLog), [blockStart, sessionLog]);
  const season = useMemo(() => getSeason(goals, sessionLog), [goals, sessionLog]);
  const day = activeDay(dayPlan);
  const input = useMemo(
    () => ({ sessionLog, climbLog, activityLog, progress, benchmarkResults, block, tired: healthDay?.energy === 'TIRED', day, season: season.phase }),
    // day is derived from dayPlan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionLog, climbLog, activityLog, progress, benchmarkResults, block, healthDay, dayPlan, season.phase],
  );
  const recommended = useMemo(() => recommend(input), [input]);
  // The athlete's weekly plan leads unless a safety rule stops it.
  const outcome = useMemo(() => applyPlan(weekPlan, routines, input, recommended), [weekPlan, routines, input, recommended]);
  const recommendation: TodayPick | null = outcome.pick;
  const alternatives: TodayPick[] = useMemo(() => {
    const fits = alsoFits(input, recommendation);
    const all = outcome.also ? [outcome.also, ...fits] : fits;
    return all.filter((a, i) => a.circuitId !== recommendation?.circuitId && all.findIndex(b => b.circuitId === a.circuitId) === i).slice(0, 2);
  }, [input, recommendation, outcome]);

  const deload = useMemo(
    () => deloadAdvice({ block, sessionLog, climbLog, activityLog }),
    [block, sessionLog, climbLog, activityLog],
  );

  // The next time on the wall: technique, head, stamina, and the finger while it heals.
  const wall = useMemo(() => {
    const today = localDate();
    const roped = climbLog.some(c => c.discipline === 'ROPE' && daysBetween(c.date, today) <= 60);
    return wallFocus({
      climbLog, phase: season.phase, rope: roped, healing: isHealing(sessionLog, climbLog),
      ringPct: getRingRecovery(loadLog, benchmarkResults).pct,
    });
  }, [climbLog, season.phase, sessionLog, loadLog, benchmarkResults]);

  return { block, season, day, healthDay, recommendation, alternatives, planNote: outcome.note, deload, wall };
}
