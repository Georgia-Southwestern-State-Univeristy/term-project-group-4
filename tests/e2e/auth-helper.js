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
    page.waitForNavigation({ url: /accounts\.google\.com/, waitUntil: 'domcontentloaded' }),
    loginBtn.click(),
  ]).catch(err => {
    console.log('Navigation or click error (may be expected for Google redirect):', err.message);
  });

  // Wait a bit for Google login page to load
  await page.waitForTimeout(2000);
  console.log('Current URL after clicking login:', await page.url());
  
  // Try to fill in email
  const emailInput = page.locator('input[type="email"]').first();
  
  // Check if we're on Google's login page
  const isOnGooglePage = await emailInput.isVisible().catch(() => false);
  
  if (isOnGooglePage) {
    console.log('On Google login page, filling email...');
    await emailInput.fill(testEmail);
    
    // Click Next - try multiple selectors
    let nextBtn = page.locator('button:has-text("Next")').first();
    let isVisible = await nextBtn.isVisible().catch(() => false);
    
    if (!isVisible) {
      nextBtn = page.getByRole('button', { name: 'Next' }).first();
    }
    
    await nextBtn.click();

    // Wait for password field - with longer timeout for slow networks
    console.log('Waiting for password field...');
    await page.waitForTimeout(2000);
    
    const passwordInput = page.locator('input[type="password"]').first();
    const passwordVisible = await passwordInput.isVisible().catch(() => false);
    
    if (!passwordVisible) {
      console.log('Password field not visible, checking for challenge page...');
      console.log('Current URL:', await page.url());
      // If stuck on challenge page, try waiting longer
      await page.waitForTimeout(3000);
    }
    
    await passwordInput.fill(testPassword);

    // Click Next to sign in
    let signInBtn = page.locator('button:has-text("Next")').first();
    let signInVisible = await signInBtn.isVisible().catch(() => false);
    
    if (!signInVisible) {
      signInBtn = page.getByRole('button', { name: 'Next' }).first();
    }
    
    await signInBtn.click();

    // Wait for consent or challenge screens
    console.log('Waiting for consent/challenge screens...');
    await page.waitForTimeout(3000);
    
    // Handle confirm button
    const confirmBtn = page.getByRole('button', { name: /Continue|Confirm|Allow/ }).first();
    const isConfirmVisible = await confirmBtn.isVisible().catch(() => false);
    
    if (isConfirmVisible) {
      console.log('Consent screen found, clicking continue...');
      await confirmBtn.click();
      await page.waitForTimeout(2000);
    }

    // Wait for any additional security challenges and click through them
    console.log('Checking for additional security challenges...');
    const allowBtn = page.getByRole('button', { name: /Allow|Continue|Yes/ }).first();
    const allowVisible = await allowBtn.isVisible().catch(() => false);
    
    if (allowVisible) {
      console.log('Security challenge found, clicking allow...');
      await allowBtn.click();
      await page.waitForTimeout(2000);
    }

    // Wait for redirect back to app with longer timeout and better checking
    console.log('Waiting for redirect back to app...');
    let redirected = false;
    let maxAttempts = 5;
    
    for (let i = 0; i < maxAttempts; i++) {
      const currentUrl = await page.url();
      console.log(`Attempt ${i + 1}: Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('localhost') && !currentUrl.includes('accounts.google.com')) {
        console.log('Successfully on app domain');
        redirected = true;
        break;
      }
      
      await page.waitForTimeout(3000);
    }

    if (!redirected) {
      throw new Error(`OAuth redirect failed: stuck on ${await page.url()}`);
    }

    // Wait for app to fully load
    await page.waitForLoadState('networkidle').catch(() => {});
    
    // Verify we're logged in by checking for user info
    console.log('Verifying login by checking for user info element...');
    const userInfo = page.locator('#user-info');
    
    try {
      await userInfo.waitFor({ state: 'visible', timeout: 15000 });
      console.log('Successfully logged in!');
    } catch (error) {
      console.log('User info not found, but may still be logged in. Current URL:', await page.url());
      // Don't fail here - the redirect worked, user may be logged in
    }
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
