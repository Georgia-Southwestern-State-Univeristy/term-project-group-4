/**
 * Playwright auth helper for project test-mode auth.
 * Browser requests include x-test-user-id via Playwright extraHTTPHeaders.
 */

import { expect } from '@playwright/test';

export const TEST_USER_ID = process.env.TEST_USER_ID || 'demo-user-123';

export async function loginAsTestUser(page) {
  console.log(`Using test-mode auth with x-test-user-id=${TEST_USER_ID}`);

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('#user-info')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#login-section')).toBeHidden();

  console.log('Test-mode user is authenticated in UI.');
}

export async function isLoggedIn(page) {
  try {
    const response = await page.request.get('/auth/user', {
      headers: { 'x-test-user-id': TEST_USER_ID },
    });

    if (!response.ok()) {
      console.log('Auth status endpoint returned:', response.status());
      return false;
    }

    const user = await response.json();
    console.log('Authenticated as:', user.id);
    return Boolean(user?.id);
  } catch (error) {
    console.log('Error checking login status:', error.message);
    return false;
  }
}

export async function logout(page) {
  const logoutBtn = page.locator('#logout-btn');
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();
    await expect(page.locator('#login-section')).toBeVisible({ timeout: 5000 });
  }
}