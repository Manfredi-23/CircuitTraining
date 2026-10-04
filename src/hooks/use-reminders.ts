import { useEffect } from 'react';
import { useStore } from '@/store/store';
import { planReminders, ALL_REMINDER_IDS } from '@/core/reminders';
import { scheduleReminders } from '@/native/native';

/**
 * Keeps the OS reminder schedule in step with the logs. Rebuilt whenever the
 * data it reads changes (a session finished, a climb logged, a setting
 * flipped) and whenever the app returns to the foreground, since time alone
 * changes what is due. A no-op in the browser.
 */
export function useReminders(hydrated: boolean): void {
  const progress = useStore(s => s.progress);
  const sessionLog = useStore(s => s.sessionLog);
  const climbLog = useStore(s => s.climbLog);
  const benchmarkResults = useStore(s => s.benchmarkResults);
  const settings = useStore(s => s.settings);

  useEffect(() => {
    if (!hydrated) return;
    const plan = () => {
      const s = useStore.getState();
      void scheduleReminders(planReminders({
        progress: s.progress, sessionLog: s.sessionLog, climbLog: s.climbLog,
        benchmarkResults: s.benchmarkResults, settings: s.settings.reminders,
      }), ALL_REMINDER_IDS);
    };
    plan();
    const onVisible = () => { if (document.visibilityState === 'visible') plan(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [hydrated, progress, sessionLog, climbLog, benchmarkResults, settings]);
}
