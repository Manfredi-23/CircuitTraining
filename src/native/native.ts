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

// ---- Local notifications ----------------------------------------------------
// The rest timer already survives being backgrounded, because it counts against
// a wall-clock deadline rather than ticking down. What it could not do was tell
// you rest was over while you were in another app: iOS suspends the webview, so
// the beep and the haptic never fire. A local notification is scheduled with the
// OS instead, so it lands even if the app is suspended or killed outright.
//
// Local, not push: the deadline is known on the device, so there is nothing for
// a server to tell us. No APNs, no certificates, no network required.

/** One rest timer exists at a time, so one id is reused and overwritten. */
const REST_NOTIFICATION_ID = 1;

/**
 * The chime the app plays when rest ends in the foreground, as a file iOS can
 * play from a notification. It lives at the root of public/ because the plugin
 * only looks one level deep in the bundled web assets. Without a sound name the
 * plugin sets no sound at all, and the alert arrives silent.
 */
const REST_ALERT_SOUND = 'rest-over.wav';

/** null until asked, then the answer, so the OS dialog is raised at most once. */
let notificationsAllowed: boolean | null = null;

/**
 * Bumped on every schedule and every cancel. Scheduling awaits the permission
 * dialog on first use, and a cancel can land while it waits (rest skipped, or
 * the session quit). Without this, the late schedule would win and a stray
 * "rest over" would fire in the middle of the next set.
 */
let alertGeneration = 0;

async function ensureNotificationPermission(): Promise<boolean> {
  if (!isNative()) return false;
  if (notificationsAllowed !== null) return notificationsAllowed;

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    let status = await LocalNotifications.checkPermissions();
    if (status.display === 'prompt' || status.display === 'prompt-with-rationale') {
      status = await LocalNotifications.requestPermissions();
    }
    notificationsAllowed = status.display === 'granted';
  } catch {
    notificationsAllowed = false;
  }
  return notificationsAllowed;
}

/**
 * Schedule the "rest is over" alert for an exact moment.
 *
 * `body` names what is coming next, so the lock screen is enough to get you off
 * the phone and back on the mat without opening the app.
 *
 * Time Sensitive lets it through Focus modes. That needs the Time Sensitive
 * Notifications capability on the App target; without it iOS quietly delivers
 * the alert at the normal level, so the request is harmless either way.
 */
export async function scheduleRestAlert(at: Date, body: string): Promise<void> {
  if (!isNative()) return;
  const generation = ++alertGeneration;
  if (!(await ensureNotificationPermission())) return;
  if (generation !== alertGeneration) return;

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [{
        id: REST_NOTIFICATION_ID,
        title: 'Rest over',
        body,
        schedule: { at, allowWhileIdle: true },
        sound: REST_ALERT_SOUND,
        interruptionLevel: 'timeSensitive',
      }],
    });
    // A cancel that arrived while the schedule call was in flight ran before
    // there was anything to cancel. Take the alert back out.
    if (generation !== alertGeneration) {
      await LocalNotifications.cancel({ notifications: [{ id: REST_NOTIFICATION_ID }] });
    }
  } catch { /* scheduling unavailable — the in-app beep still covers it */ }
}

/**
 * Drop any pending rest alert.
 *
 * Called when rest is skipped, when the screen unmounts, and — importantly —
 * a couple of seconds before the deadline whenever the app is actually on
 * screen, so you never get a banner for a timer you are already watching.
 */
export async function cancelRestAlert(): Promise<void> {
  if (!isNative()) return;
  alertGeneration++;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: [{ id: REST_NOTIFICATION_ID }] });
  } catch { /* nothing scheduled */ }
}

// ---- Live Activity ----------------------------------------------------------
// A ticking rest countdown on the lock screen and in the Dynamic Island, so the
// time left is visible from any other app without switching back. The alert
// above says when rest is over; this shows how long is left.
//
// ActivityKit has no Capacitor plugin, so this talks to a small one in the app
// itself: ios/App/App/RestActivityPlugin.swift, registered by
// MainViewController. The countdown is drawn by the RestTimerWidget extension,
// which iOS runs on its own. The clock counts down there with no updates from
// the app, which is what lets it keep going while the webview is suspended.
//
// Every failure is swallowed: before the widget extension is added in Xcode, on
// iOS below 16.2, or with Live Activities switched off in Settings, the call
// resolves and the notification still does the job.

interface RestActivityPlugin {
  start(options: { endsAt: number; title: string; next: string }): Promise<{ started: boolean }>;
  end(): Promise<void>;
}

let restActivityPlugin: RestActivityPlugin | null = null;

async function getRestActivity(): Promise<RestActivityPlugin> {
  if (!restActivityPlugin) {
    const { registerPlugin } = await import('@capacitor/core');
    restActivityPlugin = registerPlugin<RestActivityPlugin>('RestActivity');
  }
  return restActivityPlugin;
}

/** Same race as the alert: an end must win over a start still in flight. */
let activityGeneration = 0;

/** Show the rest countdown on the lock screen, ending at `endsAt`. */
export async function startRestActivity(endsAt: Date, next: string): Promise<void> {
  if (!isNative()) return;
  const generation = ++activityGeneration;
  try {
    const plugin = await getRestActivity();
    await plugin.start({ endsAt: endsAt.getTime(), title: 'Rest', next });
    if (generation !== activityGeneration) await plugin.end();
  } catch { /* no extension, old iOS, or Live Activities off */ }
}

/** Remove the countdown. Safe to call when none is showing. */
export async function endRestActivity(): Promise<void> {
  if (!isNative()) return;
  activityGeneration++;
  try {
    await (await getRestActivity()).end();
  } catch { /* nothing to end */ }
}
