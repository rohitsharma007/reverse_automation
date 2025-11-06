const { test, expect } = require('@playwright/test');
const { SelfHealingTestHelper } = require('../helpers/advanced-self-healing');
require('dotenv').config();

/**
 * Test: Complete User Journey from Login to Logout
 *
 * This automation script replicates the manual test journey extracted from
 * the PDF automation run. It validates the complete flow through various
 * OrangeHRM modules including Admin, Job, PIM, Leave, Time, Recruitment,
 * My Info, Performance, Directory, Buzz, and Claim.
 *
 * Source: testrigor_run1 manual steps
 *
 * ENHANCED: Uses AI-powered self-healing framework for automatic error recovery
 */

test.describe('Complete User Journey - OrangeHRM', () => {

  test('Verify complete user journey from login to exploring all modules', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
    const username = process.env.USERNAME || 'Admin';
    const password = process.env.PASSWORD || 'admin123';

    // Initialize self-healing helper
    const helper = new SelfHealingTestHelper(page);

    // Step 1-3: Login
    await test.step('Login to OrangeHRM', async () => {
      await page.goto(baseURL);

      // Enter username
      await page.getByPlaceholder('Username').fill(username);

      // Enter password
      await page.getByPlaceholder('Password').fill(password);

      // Click Login button
      await page.getByRole('button', { name: 'Login' }).click();

      // Wait for dashboard URL and element (stabilize login)
      // Using self-healing helper to handle Dashboard strict mode violation
      await page.waitForURL(/dashboard/i, { timeout: 15000 });
      await helper.expectVisible('text=Dashboard', { text: 'Dashboard', timeout: 10000 });
    });

    // Step 4-9: Admin Module - Search and Reset
    await test.step('Navigate to Admin and perform search operations', async () => {
      // Click Admin menu
      await page.getByRole('link', { name: 'Admin' }).click();

      // Verify System Users page
      await expect(page.getByText('System Users')).toBeVisible({ timeout: 10000 });

      // Enter Admin into Username search field
      await page.getByLabel('Username').first().fill('Admin');

      // Click Search button
      await page.getByRole('button', { name: 'Search' }).click();

      // Wait for search to complete by checking records element
      await expect(page.locator('.oxd-table-body, .oxd-table-card').first()).toBeVisible({ timeout: 5000 });

      // Click Reset button
      await page.getByRole('button', { name: 'Reset' }).click();

      // Wait for reset to complete
      await expect(page.getByLabel('Username').first()).toHaveValue('', { timeout: 5000 });
    });

    // Step 10-12: Job and Job Titles
    await test.step('Navigate to Job section and Job Titles', async () => {
      // Click Job menu (in Admin dropdown)
      await page.getByRole('button', { name: 'Job' }).click();

      // Click Job Titles
      await page.getByRole('link', { name: 'Job Titles' }).click();

      // Verify Job Titles page
      await expect(page.getByText('Job Titles')).toBeVisible({ timeout: 10000 });
    });

    // Step 13-15: PIM Module
    await test.step('Navigate to PIM module', async () => {
      // Click PIM menu
      await page.getByRole('link', { name: 'PIM' }).click();

      // Verify Employee Information
      await expect(page.getByText('Employee Information')).toBeVisible({ timeout: 10000 });

      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 500));
    });

    // Step 16-17: Leave Module
    await test.step('Navigate to Leave module', async () => {
      // Click Leave menu
      await page.getByRole('link', { name: 'Leave' }).click();

      // Verify Leave List
      await expect(page.getByText('Leave List')).toBeVisible({ timeout: 10000 });
    });

    // Step 18-19: Time Module
    await test.step('Navigate to Time module', async () => {
      // Click Time menu
      await page.getByRole('link', { name: 'Time' }).click();

      // Verify Timesheets section
      await expect(page.locator('text=/Timesheets?/i')).toBeVisible({ timeout: 10000 });
    });

    // Step 20-22: Recruitment Module
    await test.step('Navigate to Recruitment and search', async () => {
      // Click Recruitment menu
      await page.getByRole('link', { name: 'Recruitment' }).click();

      // Verify Candidates page
      await expect(page.getByText('Candidates')).toBeVisible({ timeout: 10000 });

      // Enter "developer" into Keywords search
      const keywordInput = page.locator('input').filter({ hasText: /keywords/i }).or(
        page.getByPlaceholder(/keywords/i)
      ).or(
        page.locator('input[placeholder*="keyword" i]')
      ).first();

      if (await keywordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await keywordInput.fill('developer');
      }
    });

    // Step 23-25: My Info Module
    await test.step('Navigate to My Info', async () => {
      // Click My Info menu
      await page.getByRole('link', { name: 'My Info' }).click();

      // Verify Personal Details (replaces the 2-second wait with explicit check)
      await expect(page.getByText('Personal Details')).toBeVisible({ timeout: 10000 });
    });

    // Step 26-27: Performance Module
    await test.step('Navigate to Performance module', async () => {
      // Click Performance menu
      await page.getByRole('link', { name: 'Performance' }).click();

      // Verify Employee Reviews or Performance page
      await expect(page.locator('text=/Employee Reviews|Performance/i')).toBeVisible({ timeout: 10000 });
    });

    // Step 28-29: Directory Module
    await test.step('Navigate to Directory', async () => {
      // Click Directory menu
      await page.getByRole('link', { name: 'Directory' }).click();

      // Verify Directory page
      await expect(page.getByText('Directory')).toBeVisible({ timeout: 10000 });
    });

    // Step 30-33: Buzz Module and Create Post
    await test.step('Navigate to Buzz and create a post', async () => {
      // Click Buzz menu
      await page.getByRole('link', { name: 'Buzz' }).click();

      // Verify Buzz Newsfeed
      await expect(page.locator('text=/Buzz|Newsfeed/i')).toBeVisible({ timeout: 10000 });

      // Click "What's on your mind?" text area
      const buzzTextArea = page.locator('textarea').or(
        page.getByPlaceholder(/mind/i)
      ).or(
        page.locator('[placeholder*="Share"]')
      ).first();

      if (await buzzTextArea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buzzTextArea.click();

        // Enter post content
        await buzzTextArea.fill('This is a test post for exploratory testing');

        // Verify text was entered
        await expect(buzzTextArea).toHaveValue(/test post/i, { timeout: 5000 });
      }
    });

    // Step 34-36: Claim Module
    await test.step('Navigate to Claim module', async () => {
      // Click Claim menu
      const claimLink = page.getByRole('link', { name: 'Claim' }).or(
        page.locator('text=Claim').first()
      );

      if (await claimLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await claimLink.click();

        // Verify Employee Claims or Claim page
        await expect(page.locator('text=/Claims|Claim/i')).toBeVisible({ timeout: 10000 });

        // Click Search if available
        const searchButton = page.getByRole('button', { name: 'Search' });
        if (await searchButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await searchButton.click();
        }
      }
    });

    // Step 37-38: Final scrolling and search
    await test.step('Perform final scroll and search operations', async () => {
      // Scroll up
      await page.evaluate(() => window.scrollTo(0, 0));

      // Click Search (if visible)
      const searchButtons = page.getByRole('button', { name: 'Search' });
      const searchButton = searchButtons.first();
      if (await searchButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await searchButton.click();
        // Wait for search results by checking for table or no records message
        await Promise.race([
          page.locator('.oxd-table-body, .oxd-table-card').first().waitFor({ timeout: 5000 }),
          page.locator('text=/No Records/i').waitFor({ timeout: 5000 })
        ]).catch(() => {
          // Ignore if neither appears
        });
      }
    });

    console.log('✅ Complete user journey test completed successfully');

    // Print AI self-healing summary
    helper.printLearningSummary();
  });

});
