import { useEffect, useRef } from 'react';

/**
 * Holds a screen wake lock while `active` is true.
 *
 * A rest timer that puts the phone to sleep at 90 seconds and drops you back
 * on the lock screen is worse than no timer. The Screen Wake Lock API is
 * supported by WKWebView on iOS 16.4+, so this works both in the Capacitor
 * shell and in the browser PWA with no native plugin.
 *
 * iOS releases the lock whenever the page is hidden, so it is re-acquired on
 * the way back to visible.
 */
export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let cancelled = false;

    const acquire = async () => {
      if (!active || document.visibilityState !== 'visible') return;
      if (sentinelRef.current) return;
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await sentinel.release();
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener('release', () => { sentinelRef.current = null; });
      } catch { /* denied, low battery, or unsupported */ }
    };

    const release = () => {
      sentinelRef.current?.release().catch(() => {});
      sentinelRef.current = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquire();
    };

    if (active) {
      acquire();
      document.addEventListener('visibilitychange', onVisibility);
    } else {
      release();
    }

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      release();
    };
  }, [active]);
}
