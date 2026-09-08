import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sevenbit.circuittraining',
  appName: '7Bit',
  webDir: 'out',

  ios: {
    // The web layer paints its own parchment gradient and handles the notch via
    // env(safe-area-inset-*), so the native view must not inset the content or
    // flash white behind it during load.
    contentInset: 'never',
    backgroundColor: '#E4E2DD',
    // The webview's own scrolling stays enabled: not every screen has an inner
    // overflow container, and a short device would otherwise strand content
    // below the fold. Rubber-banding is already suppressed by
    // `overscroll-behavior: none` on body.
  },

  plugins: {
    SplashScreen: {
      // Belt and braces: the app hides the splash itself as soon as React has
      // mounted, usually well inside this window. The native auto-hide is the
      // backstop, so a JS failure can never leave the launch screen up forever.
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#E4E2DD',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
  },
};

export default config;
