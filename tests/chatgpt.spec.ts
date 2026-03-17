import { test, expect } from '@playwright/test';
import { ChatGPTPage } from '../pages/ChatGPTPage';

test.describe('ChatGPT chat window', () => {
  test.beforeEach(async ({ page }) => {
    console.log('[Spec] beforeEach: goto.');
    const chatPage = new ChatGPTPage(page);
    await chatPage.goto();
    console.log('[Spec] beforeEach: done.');
  });

  test('opens ChatGPT page and shows main UI', async ({ page }) => {
    console.log('[Spec] Test: opens ChatGPT page and shows main UI');
    await expect(page).toHaveTitle(/chatgpt|OpenAI/i);
    console.log('[Spec] Test passed: title OK.');
  });

  test('logged in and chat ready', async ({ page }) => {
    console.log('[Spec] Test: logged in and chat ready');
    test.setTimeout(60000);
    const chatPage = new ChatGPTPage(page);
    await chatPage.expectLoggedIn();
    console.log('[Spec] Test passed: logged in.');
  });

  test('ask Dev-AU for Sydney hotels and screenshot result', async ({ page }, testInfo) => {
    console.log('[Spec] Test: ask @Dev-AU hotels in Sydney, wait for result, screenshot');
    test.setTimeout(120000);

    const chatPage = new ChatGPTPage(page);
    await chatPage.expectLoggedIn();

    await chatPage.waitForChatInput();
    await chatPage.typeMessageWithPause('@Prod-AU ', 2000, 'show me hotels in Sydney, next week');
    await chatPage.clickSend();

    await chatPage.waitForResponseComplete(60000);
    const screenshotPath = await chatPage.takeScreenshot(testInfo.outputPath('sydney-hotels-result.png'));
    await testInfo.attach('AI response', { path: screenshotPath });
    console.log('[Spec] Test passed: screenshot saved at', screenshotPath);
  });
});
