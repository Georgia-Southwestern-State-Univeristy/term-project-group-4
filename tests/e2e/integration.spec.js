import { test, expect } from '@playwright/test';
import { loginWithGoogle, logout, isLoggedIn } from './auth-helper.js';

test.describe('Primary Workflow: Create and Save Trip', () => {
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
// Test Case: Make sure user can able to load the previously saved trip
test('user can load a previously saved trip and continue editing', async ({ page }) => {
    // Create unique trip name with timestamp to avoid conflicts
    const timestamp = Date.now();
    const tripName = `Summer Vacation - ${timestamp}`;
    console.log(`Creating trip: ${tripName}`);
    
    // First, create and save a trip
    await page.fill('#trip-name', tripName);
    await page.selectOption('#destination-type', 'beach');
    await page.fill('#duration', '7');
    await page.click('button:has-text("Generate Checklist")');
    
    await page.waitForSelector('#checklist-container', { timeout: 5000 });
    
    const saveBtn = page.locator('#save-trip-btn');
    await page.waitForFunction(() => {
      const btn = document.querySelector('#save-trip-btn');
      return !btn.disabled;
    });
    await saveBtn.click();
    
    // Wait for trip to appear in saved trips
    await page.waitForTimeout(2000);
    
    // Find and click Load button for the trip with our unique name
    const tripSpan = page.locator(`span:has-text("${tripName}")`);
    const tripContainer = tripSpan.locator('xpath=ancestor::li');
    const loadBtn = tripContainer.locator('button:has-text("Load")');
    
    console.log(`Loading trip: ${tripName}`);
    await loadBtn.click();
    
    // Verify the form is repopulated with trip data
    const tripNameValue = await page.inputValue('#trip-name');
    expect(tripNameValue).toBe(tripName);
    
    const destinationValue = await page.inputValue('#destination-type');
    expect(destinationValue).toBe('beach');
    
    const durationValue = await page.inputValue('#duration');
    expect(durationValue).toBe('7');
  });
});
