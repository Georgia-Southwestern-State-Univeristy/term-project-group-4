/**
 * Helper function to log in with Google OAuth
 * Requires TEST_EMAIL and TEST_PASSWORD environment variables to be set
 * 
 * Usage:
 * await loginWithGoogle(page);
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function loginWithGoogle(page) {
  const testEmail = process.env.TEST_EMAIL || 'group4termproject@gmail.com';
  const testPassword = process.env.TEST_PASSWORD;

  if (!testPassword) {
    throw new Error(
      'TEST_PASSWORD environment variable not set. ' +
      'Please set it to enable Google login tests. ' +
      'You can set it in .env file or via: export TEST_PASSWORD="your-password"'
    );
  }

  console.log('Starting Google OAuth login for:', testEmail);
  
  // Ensure we're on the home page
  console.log('Navigating to home page...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Wait for login button to be visible - use ID selector for reliability
  const loginBtn = page.locator('#login-btn');
  await loginBtn.waitFor({ state: 'visible', timeout: 5000 });
  
  console.log('Login button found, clicking...');
  
  // Click it and wait for navigation to Google
  await Promise.all([
    page.waitForNavigation({ url: /accounts\.google\.com/, waitUntil: 'networkidle' }),
    loginBtn.click(),
  ]).catch(err => {
    console.log('Navigation or click error (may be expected for Google redirect):', err.message);
  });

  // Wait a bit for Google login page to load
  await page.waitForTimeout(2000);
  
  // Try to fill in email
  const emailInput = page.locator('input[type="email"]').first();
  
  // Check if we're on Google's login page
  const isOnGooglePage = await emailInput.isVisible().catch(() => false);
  
  if (isOnGooglePage) {
    console.log('On Google login page, filling email...');
    await emailInput.fill(testEmail);
    
    // Click Next
    const nextBtn = page.locator('button:has-text("Next")').first();
    await nextBtn.click();

    // Wait for password field
    await page.waitForTimeout(1500);
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(testPassword);

    // Click Next to sign in
    const signInBtn = page.locator('button:has-text("Next")').first();
    await signInBtn.click();

    // Wait for confirmation screen and click continue button
    await page.waitForTimeout(2000);
    const confirmBtn = page.getByRole('button', { name: 'Continue' }).first();
    const isConfirmVisible = await confirmBtn.isVisible().catch(() => false);
    if (isConfirmVisible) {
      console.log('Confirmation screen found, clicking continue...');
      await confirmBtn.click();
    }

    // Wait for redirect back to app
    await page.waitForURL('/', { waitUntil: 'networkidle' });
    
    // Verify we're logged in by checking for user info
    const userInfo = page.locator('#user-info');
    await userInfo.waitFor({ state: 'visible', timeout: 10000 });
    
    console.log('Successfully logged in!');
  } else {
    console.log('Not on Google page, may already be logged in or need manual intervention');
  }
}

/**
 * Check if user is currently logged in
 */
export async function isLoggedIn(page) {
  try {
    // Make sure page is loaded
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

/**
 * Logout the current user
 */
export async function logout(page) {
  const logoutBtn = page.locator('#logout-btn');
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    
    // Wait for logout to complete
    const loginBtn = page.locator('a:has-text("Login with Google")');
    await loginBtn.waitFor({ state: 'visible', timeout: 5000 });
  }
}
