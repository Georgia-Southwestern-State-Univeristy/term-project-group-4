import { test, expect } from '@playwright/test';
import { loginAsTestUser, isLoggedIn } from './auth-helper.js';

test.describe('Primary Workflow: Create and Save Trip', () => {
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

  test('user can create a beach trip with appropriate items', async ({ page }) => {
    const timestamp = Date.now();
    const tripName = `Beach Vacation 2026 - ${timestamp}`;

    await page.fill('#trip-name', tripName);
    await page.selectOption('#destination-type', 'beach');
    await page.fill('#duration', '5');

    await page.click('button:has-text("Generate Checklist")');
    await page.waitForSelector('#checklist-container', { timeout: 5000 });

    const checklistItems = await page.locator('#checklist-container label').allTextContents();
    expect(checklistItems.join(' ')).toMatch(/Swimsuit|Sunscreen/);

    const saveBtn = page.locator('#save-trip-btn');
    await page.waitForFunction(() => {
      const btn = document.querySelector('#save-trip-btn');
      return btn && !btn.disabled;
    });

    await saveBtn.click();

    const tripRow = page.locator('#saved-trips-list li').filter({ hasText: tripName });
    await expect(tripRow).toHaveCount(1, { timeout: 10000 });
    await expect(tripRow.first()).toBeVisible();
  });

  test('user can create an outdoor trip with appropriate items', async ({ page }) => {
    const timestamp = Date.now();
    const tripName = `Camping Adventure - ${timestamp}`;

    await page.fill('#trip-name', tripName);
    await page.selectOption('#destination-type', 'outdoors');
    await page.fill('#duration', '3');

    await page.click('button:has-text("Generate Checklist")');
    await page.waitForSelector('#checklist-container', { timeout: 5000 });

    const checklistItems = await page.locator('#checklist-container label').allTextContents();
    const itemsText = checklistItems.join(' ');
    expect(itemsText).toMatch(/Hiking boots|Rain jacket/);
  });
});