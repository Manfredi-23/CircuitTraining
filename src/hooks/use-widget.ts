import { useEffect } from 'react';
import { useStore } from '@/store/store';
import { recommend } from '@/core/recommend';
import { getBlockWeek } from '@/core/block';
import { healthReadiness } from '@/core/health';
import { widgetSnapshot } from '@/core/widget';
import { updateTodayWidget } from '@/native/widget';

/**
 * Keeps the TodayWidget's snapshot current: rebuilt when the logs change and
 * when the app returns to the foreground. A no-op in the browser.
 */
export function useTodayWidget(hydrated: boolean): void {
  const progress = useStore(s => s.progress);
  const sessionLog = useStore(s => s.sessionLog);
  const climbLog = useStore(s => s.climbLog);
  const benchmarkResults = useStore(s => s.benchmarkResults);
  const blockStart = useStore(s => s.blockStart);
  const health = useStore(s => s.health);

  useEffect(() => {
    if (!hydrated) return;
    const push = () => {
      const s = useStore.getState();
      const block = getBlockWeek(s.blockStart, s.sessionLog);
      const tired = s.settings.health.connected && healthReadiness(s.health)?.energy === 'TIRED';
      const rec = recommend({
        sessionLog: s.sessionLog, climbLog: s.climbLog, progress: s.progress,
        benchmarkResults: s.benchmarkResults, block, tired,
      });
      void updateTodayWidget(widgetSnapshot(rec, block, s.progress));
    };
    push();
    const onVisible = () => { if (document.visibilityState === 'visible') push(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [hydrated, progress, sessionLog, climbLog, benchmarkResults, blockStart, health]);
}
