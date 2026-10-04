import { useEffect } from 'react';
import { useStore } from '@/store/store';
import { readHealth } from '@/native/health';

/** Days read on each sync: enough for the 7-day baselines and the STATS chart. */
const SYNC_DAYS = 30;

/**
 * Reads Apple Health on open and whenever the app returns to the foreground,
 * once Health has been connected in Settings. A no-op in the browser.
 */
export function useHealthSync(hydrated: boolean): void {
  const connected = useStore(s => s.settings.health.connected);

  useEffect(() => {
    if (!hydrated || !connected) return;
    let running = false;
    const sync = async () => {
      if (running) return;
      running = true;
      const read = await readHealth(SYNC_DAYS);
      if (read) useStore.getState().applyHealthRead(read);
      running = false;
    };
    void sync();
    const onVisible = () => { if (document.visibilityState === 'visible') void sync(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [hydrated, connected]);
}
