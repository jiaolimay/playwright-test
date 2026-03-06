import { test, expect } from '@playwright/test';

test('homepage has a title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
});

