import { test, expect } from '@playwright/test';
import { loginWithGoogle, logout, isLoggedIn } from './auth-helper.js';

/**
 * PRIMARY END-TO-END WORKFLOW TESTS
 * These tests verify the core user journey:
 * 1. User authenticates via Google OAuth
 * 2. User creates a trip
 * 3. Checklist is generated
 * 4. Trip is saved
 */

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

  test('user can create a beach trip with appropriate items', async ({ page }) => {
    // Create unique trip name with timestamp to avoid conflicts
    const timestamp = Date.now();
    const tripName = `Beach Vacation 2026 - ${timestamp}`;
    console.log(`Starting test with trip name: ${tripName}`);
    
    // Fill out the trip form
    await page.fill('#trip-name', tripName);
    await page.selectOption('#destination-type', 'beach');
    await page.fill('#duration', '5');
    
    // Generate checklist by submitting the form
    await page.click('button:has-text("Generate Checklist")');
    
    // Wait for checklist to be generated and displayed
    await page.waitForSelector('#checklist-container', { timeout: 5000 });
    
    // Verify checklist contains beach-specific items
    const checklistItems = await page.locator('#checklist-container label').allTextContents();
    expect(checklistItems.join(' ')).toMatch(/Swimsuit|Sunscreen/);
    
    // Enable and click save button
    const saveBtn = page.locator('#save-trip-btn');
    await page.waitForFunction(() => {
      const btn = document.querySelector('#save-trip-btn');
      return !btn.disabled;
    });
    
    await saveBtn.click();
    
    // Verify success message or trip appears in saved trips
    await page.waitForTimeout(2000);
    const savedTripsList = page.locator('#saved-trips-list');
    const tripsWithName = savedTripsList.locator(`span:has-text("${tripName}")`);
    
    // Count how many trips with this exact name exist
    const tripCount = await tripsWithName.count();
    console.log(`Found ${tripCount} trips named "${tripName}"`);
    
    // Verify exactly one trip with this unique name exists
    expect(tripCount).toBe(1);
    
    // Check that the trip is visible
    const createdTrip = tripsWithName.first();
    await expect(createdTrip).toBeVisible();
  });

  test('user can create an outdoor trip with appropriate items', async ({ page }) => {
    // Fill form for outdoor trip
    await page.fill('#trip-name', 'Camping Adventure');
    await page.selectOption('#destination-type', 'outdoors');
    await page.fill('#duration', '3');
    
    // Generate checklist
    await page.click('button:has-text("Generate Checklist")');
    await page.waitForSelector('#checklist-container', { timeout: 5000 });
    
    // Verify outdoor-specific items are present
    const checklistItems = await page.locator('#checklist-container label').allTextContents();
    const itemsText = checklistItems.join(' ');
    expect(itemsText).toMatch(/Hiking boots|Rain jacket/);
  });

});
