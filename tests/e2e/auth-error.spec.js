import { test, expect } from '@playwright/test';

test.describe('Auth Error Handling', () => {

  test('Issue 98 - auth failure page displays error message and cleans up URL', async ({ browser }) => {
    // Create a new context WITHOUT the test auth header
    const context = await browser.newContext({
      baseURL: 'http://localhost:5173',
      viewport: { width: 1920, height: 1080 },
      extraHTTPHeaders: {}, // Explicitly empty - no x-test-user-id
    });

    const page = await context.newPage();

    // Simulate auth error by navigating with authError query parameter
    await page.goto('/?authError=google_login_failed');
    await page.waitForLoadState('networkidle');

    // Error toast should be visible
    const errorToast = page.locator('#toast-container .toast--error');
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    const toastText = await errorToast.textContent();
    expect(toastText).toContain('Google login failed');

    // Verify URL is cleaned up after error display (authError parameter removed)
    const url = new URL(page.url());
    expect(url.searchParams.has('authError')).toBe(false);

    await context.close();
  });

  test('Issue 121 - user cannot access trip form after auth error', async ({ browser }) => {
    // Create a new context WITHOUT the test auth header
    const context = await browser.newContext({
      baseURL: 'http://localhost:5173',
      viewport: { width: 1920, height: 1080 },
      extraHTTPHeaders: {}, // Explicitly empty - no x-test-user-id
    });

    const page = await context.newPage();

    // Navigate directly with auth error parameter (no prior login)
    await page.goto('/?authError=google_login_failed');
    await page.waitForLoadState('networkidle');

    // Error toast should be visible
    const errorToast = page.locator('#toast-container .toast--error');
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    const toastText = await errorToast.textContent();
    expect(toastText).toContain('Google login failed');

    // Key regression test: Form should be HIDDEN (user not authenticated)
    const tripForm = page.locator('#trip-form');
    await expect(tripForm).toBeHidden({ timeout: 5000 });

    // Login section must be VISIBLE so user can retry
    const loginSection = page.locator('#login-section');
    await expect(loginSection).not.toHaveAttribute('hidden');

    // Verify URL is cleaned up after error display
    const url = new URL(page.url());
    expect(url.searchParams.has('authError')).toBe(false);

    await context.close();
  });
});
