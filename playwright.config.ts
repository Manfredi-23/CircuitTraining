import { defineConfig } from '@playwright/test';

// Smoke tests for the screens, against the static build: run `npm run build`
// first. In the cloud session Chromium is preinstalled; on the Mac,
// `npx playwright install chromium` once.
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4174',
    viewport: { width: 390, height: 844 },
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  webServer: {
    command: 'node e2e/serve.mjs',
    url: 'http://localhost:4174',
    reuseExistingServer: true,
  },
});
