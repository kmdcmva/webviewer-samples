// Playwright configuration for E2E tests
// See https://playwright.dev/docs/test-configuration

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '__tests__',
  fullyParallel: true,
  reporter: 'html',
  timeout: 60000,
  retries: 0,
  use: {
    headless: true,
    baseURL: 'http://localhost:4040', // Adjust if your dev server uses a different port
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});