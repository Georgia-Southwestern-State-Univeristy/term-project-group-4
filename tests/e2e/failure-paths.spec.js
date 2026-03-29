import { test, expect } from '@playwright/test';
import { loginWithGoogle, logout, isLoggedIn } from './auth-helper.js';

/**
 * FAILURE-PATH & REGRESSION TESTS
 * These tests verify error handling, edge cases, and prevent regressions:
 */

test.describe('Failure Paths: Input Validation', () => {
    test.beforeEach(async ({ page }) => {
        // Set viewport size to ensure all elements are visible
        await page.setViewportSize({ width: 1920, height: 1080 });

        // ALWAYS navigate to home first
        await page.goto('/');

        // Wait for page to fully load
        await page.waitForLoadState('networkidle');

        // Check if already logged in
        const loggedIn = await isLoggedIn(page);
        console.log('Auth check result:', loggedIn);

        // If not logged in, log in with Google
        if (!loggedIn) {
            console.log('Not logged in, attempting Google login...');
            try {
                await loginWithGoogle(page);
                // Verify login succeeded
                const afterLogin = await isLoggedIn(page);
                if (!afterLogin) {
                    throw new Error('Login appeared to succeed but user is not authenticated');
                }
                console.log('Successfully logged in!');
            } catch (error) {
                // If TEST_PASSWORD is not set, skip these tests
                if (error.message.includes('TEST_PASSWORD')) {
                    test.skip();
                }
                console.error('Login failed:', error.message);
                throw error;
            }
        } else {
            console.log('Already logged in, skipping Google login');
        }
    });

    // Test case: Attempt to save a trip with only spaces in the name
    test('cannot save trip with only spaces in trip name', async ({ page }) => {
        await page.goto('/');

        // Try to create a trip with only spaces in the name
        const tripNameInput = page.locator('#trip-name');
        await tripNameInput.fill('     '); // 5 spaces
        
        await page.selectOption('#destination-type', 'beach');
        await page.fill('#duration', '5');
        
        // Click Generate Checklist
        await page.click('button:has-text("Generate Checklist")');
        
        // Wait for checklist to be generated
        await page.waitForSelector('#checklist-container', { timeout: 5000 });
        
        // Verify checklist was generated
        const checklistItems = await page.locator('#checklist-container label').allTextContents();
        expect(checklistItems.length).toBeGreaterThan(0);
        
        // Now try to save the trip
        const saveBtn = page.locator('#save-trip-btn');
        await page.waitForFunction(() => {
          const btn = document.querySelector('#save-trip-btn');
          return !btn.disabled;
        });
        
        console.log('Attempting to save trip with spaces-only name...');
        await saveBtn.click();
        
        // Wait for the error toast to appear
        const errorToast = page.locator('#toast-container .toast--error');
        await expect(errorToast).toBeVisible({ timeout: 5000 });
        
        // Verify the error message contains "Failed to save trip"
        const toastText = await errorToast.textContent();
        console.log(`Toast message: ${toastText}`);
        expect(toastText).toContain('Failed to save trip');
        
        console.log('✓ Save failed as expected with error toast: ' + toastText);
    });

});
