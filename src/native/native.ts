/**
 * native.ts — thin wrapper over the Capacitor native plugins.
 *
 * Every plugin is behind a dynamic import and a platform check, for two
 * reasons. The app still ships as a PWA in the browser, where these plugins do
 * not exist; and `next build` prerenders the page in Node, where touching the
 * Capacitor globals at import time would break the static export.
 *
 * Nothing here throws. On the web every call is a no-op.
 */

/**
 * Synchronous platform check. Reads the global Capacitor injects into the
 * webview rather than importing @capacitor/core, so it is safe to call during
 * render and during prerender.
 */
export function isNative(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return cap?.isNativePlatform?.() === true;
}

/** Parchment, matching --bg's top stop and the native launch screen. */
const SHELL_BACKGROUND = '#E4E2DD';

/**
 * Style the status bar and dismiss the launch screen. Called once, after React
 * has mounted, so the splash hands over to a painted screen rather than to a
 * white flash.
 */
export async function initNativeShell(): Promise<void> {
  if (!isNative()) return;

  // Each call is guarded on its own: a plugin call that rejects must not skip
  // the ones after it. Style.Light means dark glyphs on a light background,
  // which is the only combination this app has — there is no dark theme.
  // Info.plist keeps UIViewControllerBasedStatusBarAppearance true, without
  // which setStyle is silently ignored on iOS.
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light });
  } catch { /* no status bar on this platform */ }

  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    await StatusBar.setBackgroundColor({ color: SHELL_BACKGROUND });
  } catch { /* iOS ignores this while the bar overlays the webview */ }

  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    // The web layer owns the safe area via env(safe-area-inset-*).
    await StatusBar.setOverlaysWebView({ overlay: true });
  } catch { /* already overlaying */ }

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 200 });
  } catch { /* splash already gone */ }
}

// ---- Haptics ----------------------------------------------------------------
// Paired with the existing Web Audio beeps. A gym is loud and a phone is often
// in a pocket or on a mat across the room; the buzz is the part you actually
// notice. Fire-and-forget: a failed haptic must never interrupt a timer.

/** Countdown warning — three seconds out. */
export async function hapticWarning(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch { /* no haptic engine */ }
}

/** Rest is over. */
export async function hapticDone(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch { /* no haptic engine */ }
}

/** Button-level confirmation: set logged, exercise done. */
export async function hapticTap(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch { /* no haptic engine */ }
}
