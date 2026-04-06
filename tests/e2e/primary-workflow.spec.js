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

  test('form fields clear after saving a new trip', async ({ page }) => {
    const timestamp = Date.now();
    const tripName = `Reset Test Trip - ${timestamp}`;

    await page.fill('#trip-name', tripName);
    await page.selectOption('#destination-type', 'beach');
    await page.fill('#duration', '4');

    await page.click('button:has-text("Generate Checklist")');
    await page.waitForSelector('#checklist-container', { timeout: 5000 });

    const saveBtn = page.locator('#save-trip-btn');
    await page.waitForFunction(() => {
      const btn = document.querySelector('#save-trip-btn');
      return btn && !btn.disabled;
    });
    await saveBtn.click();

    // New-trip save should reset the form for the next entry.
    await expect(page.locator('#trip-name')).toHaveValue('');
    await expect(page.locator('#destination-type')).toHaveValue('');
    await expect(page.locator('#duration')).toHaveValue('');
    await expect(page.locator('#checklist-section')).toHaveAttribute('hidden', '');
    await expect(saveBtn).toBeDisabled();
    await expect(saveBtn).toHaveText('Save Trip');

    // Trip remains persisted and loadable from saved list.
    const tripRow = page.locator('#saved-trips-list li').filter({ hasText: tripName });
    await expect(tripRow).toHaveCount(1, { timeout: 10000 });
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

  test('user can toggle checklist items packed/unpacked (packing workflow)', async ({ page }) => {
    const timestamp = Date.now();
    const tripName = `Packing Test - ${timestamp}`;

    await page.fill('#trip-name', tripName);
    await page.selectOption('#destination-type', 'beach');
    await page.fill('#duration', '5');

    await page.click('button:has-text("Generate Checklist")');
    await page.waitForSelector('#checklist-container', { timeout: 5000 });

    // Verify checklist rendered with at least 2 items before proceeding
    const checkboxes = page.locator('#checklist-container input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThanOrEqual(2);

    // Get first 2 checklist checkboxes individually
    const checkbox0 = checkboxes.nth(0);
    const checkbox1 = checkboxes.nth(1);
    
    // Mark first item packed
    await checkbox0.check();
    await expect(checkbox0).toBeChecked();
    
    // Mark second item packed
    await checkbox1.check();
    await expect(checkbox1).toBeChecked();
    
    // Uncheck first item (user changed mind)
    await checkbox0.uncheck();
    await expect(checkbox0).not.toBeChecked();
    await expect(checkbox1).toBeChecked();

    // Save the trip
    const saveBtn = page.locator('#save-trip-btn');
    await page.waitForFunction(() => {
      const btn = document.querySelector('#save-trip-btn');
      return btn && !btn.disabled;
    });
    await saveBtn.click();

    // Verify trip saved to list
    const tripRow = page.locator('#saved-trips-list li').filter({ hasText: tripName });
    await expect(tripRow).toHaveCount(1, { timeout: 10000 });

    // Load the trip to verify packing state persisted
    const loadBtn = tripRow.first().locator('button:has-text("Load")');
    await loadBtn.click();

    // Verify checklist is rendered again with at least 2 items
    const reloadedCheckboxes = page.locator('#checklist-container input[type="checkbox"]');
    const reloadedCheckboxCount = await reloadedCheckboxes.count();
    expect(reloadedCheckboxCount).toBeGreaterThanOrEqual(2);

    // Verify packed/unpacked states persisted
    const reloadedCheckbox0 = reloadedCheckboxes.nth(0);
    const reloadedCheckbox1 = reloadedCheckboxes.nth(1);
    await expect(reloadedCheckbox0).not.toBeChecked(); // was unchecked
    await expect(reloadedCheckbox1).toBeChecked(); // was checked
  });

  test('user can delete a trip from the saved trips list', async ({ page }) => {
    const timestamp = Date.now();
    const tripName = `Delete Test Trip - ${timestamp}`;

    // Create trip
    await page.fill('#trip-name', tripName);
    await page.selectOption('#destination-type', 'city');
    await page.fill('#duration', '2');

    await page.click('button:has-text("Generate Checklist")');
    await page.waitForSelector('#checklist-container', { timeout: 5000 });

    // Save the trip
    const saveBtn = page.locator('#save-trip-btn');
    await page.waitForFunction(() => {
      const btn = document.querySelector('#save-trip-btn');
      return btn && !btn.disabled;
    });
    await saveBtn.click();

    // Verify trip appears in saved list
    const tripRow = page.locator('#saved-trips-list li').filter({ hasText: tripName });
    await expect(tripRow).toHaveCount(1, { timeout: 10000 });
    await expect(tripRow.first()).toBeVisible();

    // Set up dialog handler before clicking delete
    page.once('dialog', dialog => {
      console.log('Dialog message:', dialog.message());
      dialog.accept();
    });

    // Delete the trip
    const deleteBtn = tripRow.first().locator('button:has-text("Delete")');
    await deleteBtn.click();

    // Verify trip is removed from the list (waits for actual removal)
    await expect(page.locator('#saved-trips-list li').filter({ hasText: tripName })).toHaveCount(0, { timeout: 5000 });
  });
});