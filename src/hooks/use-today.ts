'use client';

import { useEffect, useMemo } from 'react';
import { useStore } from '@/store/store';
import { getBlockWeek } from '@/core/block';
import { recommend } from '@/core/recommend';
import { alsoFits } from '@/core/also-fits';
import { healthReadiness } from '@/core/health';
import { activeDay } from '@/core/today';
import { localDate } from '@/core/dates';

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

  // Apple Health: sleep and HRV against the athlete's own week suggest an
  // energy. Applied once a day; any tap on the energy tabs overrides it.
  const healthDay = useMemo(() => (connected ? healthReadiness(health) : null), [health, connected]);
  useEffect(() => {
    const today = localDate();
    if (!healthDay || energySuggestedOn === today) return;
    suggestEnergy(healthDay.energy, today);
  }, [healthDay, energySuggestedOn, suggestEnergy]);

  const block = useMemo(() => getBlockWeek(blockStart, sessionLog), [blockStart, sessionLog]);
  const day = activeDay(dayPlan);
  const input = useMemo(
    () => ({ sessionLog, climbLog, activityLog, progress, benchmarkResults, block, tired: healthDay?.energy === 'TIRED', day }),
    // day is derived from dayPlan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionLog, climbLog, activityLog, progress, benchmarkResults, block, healthDay, dayPlan],
  );
  const recommendation = useMemo(() => recommend(input), [input]);
  const alternatives = useMemo(() => alsoFits(input, recommendation), [input, recommendation]);

  return { block, day, healthDay, recommendation, alternatives };
}
