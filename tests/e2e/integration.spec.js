import { test, expect } from '@playwright/test';
import { loginAsTestUser, isLoggedIn } from './auth-helper.js';

test.describe('Integration Workflow: Save and Reload Trip', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loggedIn = await isLoggedIn(page);
    console.log('Auth check result:', loggedIn);

    if (!loggedIn) {
      await loginAsTestUser(page);
    }
  });

  test('user can load a previously saved trip and continue editing', async ({ page }) => {
    const timestamp = Date.now();
    const tripName = `Summer Vacation - ${timestamp}`;

    await page.fill('#trip-name', tripName);
    await page.selectOption('#destination-type', 'beach');
    await page.fill('#duration', '7');
    await page.click('button:has-text("Generate Checklist")');

    await page.waitForSelector('#checklist-container', { timeout: 5000 });

    const saveBtn = page.locator('#save-trip-btn');
    await page.waitForFunction(() => {
      const btn = document.querySelector('#save-trip-btn');
      return btn && !btn.disabled;
    });

    await saveBtn.click();

    const tripContainer = page.locator('#saved-trips-list li').filter({ hasText: tripName });
    await expect(tripContainer).toHaveCount(1, { timeout: 10000 });

    const loadBtn = tripContainer.first().locator('button:has-text("Load")');
    await loadBtn.click();

    await expect(page.locator('#trip-name')).toHaveValue(tripName);
    await expect(page.locator('#destination-type')).toHaveValue('beach');
    await expect(page.locator('#duration')).toHaveValue('7');
  });
});