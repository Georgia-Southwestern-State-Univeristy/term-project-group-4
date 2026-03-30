import { test, expect } from '@playwright/test';
import { loginAsTestUser, isLoggedIn } from './auth-helper.js';

test.describe('Failure Paths: Input Validation', () => {
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

  test('cannot save trip with only spaces in trip name', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tripNameInput = page.locator('#trip-name');
    await tripNameInput.fill('     ');

    await page.selectOption('#destination-type', 'beach');
    await page.fill('#duration', '5');

    await page.click('button:has-text("Generate Checklist")');
    await page.waitForSelector('#checklist-container', { timeout: 5000 });

    const checklistItems = await page.locator('#checklist-container label').allTextContents();
    expect(checklistItems.length).toBeGreaterThan(0);

    const saveBtn = page.locator('#save-trip-btn');
    await page.waitForFunction(() => {
      const btn = document.querySelector('#save-trip-btn');
      return btn && !btn.disabled;
    });

    await saveBtn.click();

    const errorToast = page.locator('#toast-container .toast--error');
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    const toastText = await errorToast.textContent();
    expect(toastText).toContain('Failed to save trip');
  });
});