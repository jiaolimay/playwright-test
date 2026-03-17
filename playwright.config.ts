import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const AUTH_FILENAME = path.join('.auth', 'chatgpt-state.json');

function findAuthFile(): string | null {
  if (process.env.CHATGPT_AUTH_STATE && fs.existsSync(process.env.CHATGPT_AUTH_STATE)) {
    return process.env.CHATGPT_AUTH_STATE;
  }
  function searchUp(fromDir: string): string | null {
    let dir = path.resolve(fromDir);
    const root = path.parse(dir).root;
    while (dir !== root) {
      const candidate = path.join(dir, AUTH_FILENAME);
      if (fs.existsSync(candidate)) return candidate;
      dir = path.dirname(dir);
    }
    return null;
  }
  return searchUp(__dirname) || searchUp(process.cwd()) || null;
}

const AUTH_FILE = findAuthFile();
const useStorageState = AUTH_FILE ? { storageState: AUTH_FILE } : {};
if (AUTH_FILE) {
  console.log('[Playwright] Using auth state:', AUTH_FILE);
} else {
  console.log('[Playwright] No .auth/chatgpt-state.json found. Run "npm run auth" from project root first.');
}

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/auth-setup.spec.ts'],
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  retries: 0,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    ...useStorageState,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] }
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] }
    // }
  ]
});

