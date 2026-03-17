/**
 * Run once to save login state: open ChatGPT, log in manually in the browser,
 * then cookies and localStorage are saved to .auth/chatgpt-state.json.
 * Next time you run the real tests, that file is loaded and you are logged in.
 *
 * Run: npm run auth
 * (or: npx playwright test tests/auth-setup.spec.ts --headed)
 */
import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_DIR = path.join(process.cwd(), '.auth');
const AUTH_FILE = path.join(AUTH_DIR, 'chatgpt-state.json');

test.describe.configure({ mode: 'serial' });

test('save ChatGPT login state after manual login', async ({ page }) => {
  test.setTimeout(600000);

  const profileButton = () => page.getByTestId('accounts-profile-button').first();

  console.log('[Auth Setup] Opening ChatGPT.');
  await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });

  console.log('[Auth Setup] Complete login. Script will save when the profile button (data-testid + aria-label) is visible. Waiting up to 10 min...');

  const deadline = Date.now() + 600000;
  let lastCloudflareLog = 0;
  while (Date.now() < deadline) {
    const url = page.url();
    const onCloudflareOrAuthError =
      url.includes('api/auth') ||
      (await page.getByText('Verify you are human').isVisible().catch(() => false));
    if (onCloudflareOrAuthError && Date.now() - lastCloudflareLog > 25000) {
      console.log('[Auth Setup] Cloudflare or auth page detected. Please complete "Verify you are human", then continue. Waiting...');
      lastCloudflareLog = Date.now();
    }

    const onChatPage = url.includes('chatgpt.com') && !url.includes('/auth/');
    if (onChatPage) {
      const visible = await profileButton().isVisible().catch(() => false);
      const ariaLabel = await profileButton().getAttribute('aria-label').catch(() => '');
      const hasAriaLabel = typeof ariaLabel === 'string' && ariaLabel.trim() !== '';
      if (visible && hasAriaLabel) {
        console.log('[Auth Setup] Profile button visible with aria-label. Saving...');
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  await new Promise((r) => setTimeout(r, 2000));
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
  console.log('[Auth Setup] Saved to', AUTH_FILE);
});
