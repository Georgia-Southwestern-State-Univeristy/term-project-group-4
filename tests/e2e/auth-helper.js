/**
 * Playwright auth helper for project test-mode auth.
 * Browser requests include x-test-user-id via Playwright extraHTTPHeaders.
 */

export const TEST_USER_ID = process.env.TEST_USER_ID || 'demo-user-123';

export async function loginAsTestUser(page) {
  console.log(`Using test-mode auth with x-test-user-id=${TEST_USER_ID}`);

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const userInfo = page.locator('#user-info');
  await userInfo.waitFor({ state: 'visible', timeout: 10000 });

  console.log('Test-mode user is authenticated in UI.');
}

export async function isLoggedIn(page) {
  try {
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    const userInfo = page.locator('#user-info');
    const isVisible = await userInfo.isVisible().catch(() => false);
    console.log('User info visible:', isVisible);
    return isVisible;
  } catch (error) {
    console.log('Error checking login status:', error.message);
    return false;
  }
}

export async function logout(page) {
  const logoutBtn = page.locator('#logout-btn');
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();

    const loginBtn = page.locator('#login-btn');
    await loginBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  }
}