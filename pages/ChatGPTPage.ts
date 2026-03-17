import { type Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class ChatGPTPage {
  readonly page: Page;
  readonly url = 'https://chatgpt.com/';

  /** Log in entry: button or link (ChatGPT uses both depending on layout). */
  readonly loginButton = () =>
    this.page
      .getByRole('button', { name: /Log in/i })
      .or(this.page.getByRole('link', { name: /Log in/i }))
      .first();

  readonly stopButton = () => this.page.getByTestId('stop-button');

  /** Input: textarea by name or role "Ask anything" from snapshot. */
  readonly chatInput = () =>
    this.page
      .locator('textarea[name="prompt-textarea"]')
      .or(this.page.getByRole('textbox', { name: /Ask anything/i }))
      .or(this.page.getByRole('textbox').or(this.page.locator('textarea')).first());

  readonly sendButton = () =>
    this.page
      .locator('form button[type="submit"]')
      .or(this.page.getByRole('button', { name: /Send|Submit/i }))
      .first();

  /** Sidebar/header button or text that shows logged-in user (email or name). */
  private userDisplayLocator = () =>
    this.page
      .locator('button, [role="button"], a')
      .filter({ hasText: /@.+\./ })
      .first();

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    console.log('[ChatGPTPage] Navigating to', this.url);
    await this.page.goto(this.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    console.log('[ChatGPTPage] Page loaded.');
  }

  /** Short settle delay; avoids flaky load/networkidle on ChatGPT. */
  async waitForIdle(ms = 2000) {
    console.log(`[ChatGPTPage] Waiting ${ms}ms for page to settle...`);
    await new Promise((r) => setTimeout(r, ms));
    console.log('[ChatGPTPage] Done.');
  }

  async isLoginRequired(): Promise<boolean> {
    const required = await this.loginButton().isVisible().catch(() => false);
    console.log('[ChatGPTPage] isLoginRequired:', required);
    return required;
  }

  /**
   * Returns true if the session is logged in (no login button, chat UI is shown).
   * Call after waitForIdle() for stable result.
   */
  async isLoggedIn(): Promise<boolean> {
    const loggedIn = !(await this.isLoginRequired());
    console.log('[ChatGPTPage] isLoggedIn:', loggedIn);
    return loggedIn;
  }

  /**
   * Asserts that the session is logged in. Use after goto() + waitForIdle().
   * Throws with a clear message if still on login page (session token invalid or missing).
   */
  async expectLoggedIn(): Promise<void> {
    console.log('[ChatGPTPage] Checking login state...');
    await this.waitForIdle();
    const loggedIn = await this.isLoggedIn();
    if (!loggedIn) {
      console.log('[ChatGPTPage] Login check failed.');
      throw new Error(
        'Login check failed: still on login page. Run "npm run auth" to log in once and save state to .auth/chatgpt-state.json, then run tests again. If you already did, the state may be expired—run "npm run auth" again.'
      );
    }
    console.log('[ChatGPTPage] Login check passed.');
    const username = await this.getLoggedInUsername();
    console.log('[ChatGPTPage] Logged in as:', username ?? '(username not shown on page)');
  }

  /**
   * Returns the displayed username/email of the logged-in user, or null if not found.
   * Does not wait; only reads if the element is already visible (avoids flaky 5s wait).
   */
  async getLoggedInUsername(): Promise<string | null> {
    try {
      const el = this.userDisplayLocator();
      if (!(await el.isVisible().catch(() => false))) return null;
      const text = await el.innerText();
      return text?.trim() || null;
    } catch {
      return null;
    }
  }

  async waitForChatInput(timeout = 10000) {
    console.log(`[ChatGPTPage] Waiting for chat input (timeout ${timeout}ms)...`);
    await this.chatInput().waitFor({ state: 'attached', timeout });
    console.log('[ChatGPTPage] Chat input ready.');
  }

  /** Focus the chat input (works when textarea is hidden). */
  private async focusChatInput() {
    await this.chatInput().evaluate((el: HTMLElement) => el.focus());
  }

  /**
   * Type in two steps with keyboard: prefix, wait, then suffix (simulates real typing).
   */
  async typeMessageWithPause(prefix: string, pauseMs: number, suffix: string, delayPerKeyMs = 40) {
    console.log(`[ChatGPTPage] Keyboard: typing prefix, pause ${pauseMs}ms, then suffix.`);
    await this.focusChatInput();
    await this.page.keyboard.type(prefix, { delay: delayPerKeyMs });
    await new Promise((r) => setTimeout(r, pauseMs));
    await this.page.keyboard.type(suffix, { delay: delayPerKeyMs });
    console.log('[ChatGPTPage] Message typed with pause.');
  }

  async clickSend() {
    console.log('[ChatGPTPage] Clicking send.');
    await this.sendButton().click();
    console.log('[ChatGPTPage] Send clicked.');
  }

  /**
   * Wait until the AI has finished (stop button disappears, send button available again) then screenshot-ready.
   */
  async waitForResponseComplete(timeoutMs = 60000) {
    console.log(`[ChatGPTPage] Waiting for AI to finish (stop button gone, max ${timeoutMs}ms)...`);
    await expect(this.stopButton()).not.toBeAttached({ timeout: timeoutMs });
    await new Promise((r) => setTimeout(r, 500));
    console.log('[ChatGPTPage] Response complete.');
  }

  /**
   * Take a full-page screenshot and save to the given path (or default under test-results).
   */
  async takeScreenshot(filePath?: string): Promise<string> {
    const path = filePath ?? `test-results/chatgpt-${Date.now()}.png`;
    console.log('[ChatGPTPage] Taking screenshot:', path);
    await this.page.screenshot({ path, fullPage: true });
    console.log('[ChatGPTPage] Screenshot saved.');
    return path;
  }
}
