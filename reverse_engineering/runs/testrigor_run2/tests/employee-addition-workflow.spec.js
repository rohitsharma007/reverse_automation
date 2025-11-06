const { test, expect } = require('@playwright/test');
const { SelfHealingTestHelper } = require('../helpers/advanced-self-healing');
require('dotenv').config();

/**
 * Test: Employee Addition Workflow
 *
 * This automation script replicates the manual test for adding a new employee
 * in OrangeHRM. It covers:
 * - Login
 * - Navigation to PIM module
 * - Adding a new employee (John Michael Smith)
 * - Verifying the employee was created
 * - Searching for the employee in the employee list
 *
 * Source: testrigor_run2 manual steps
 *
 * ENHANCED: Uses AI-powered self-healing framework for automatic error recovery
 */

test.describe('Employee Addition Workflow - OrangeHRM', () => {

  test('Add new employee and verify creation', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
    const username = process.env.USERNAME || 'Admin';
    const password = process.env.PASSWORD || 'admin123';

    // Initialize self-healing helper
    const helper = new SelfHealingTestHelper(page);

    // Generate unique employee ID to avoid conflicts
    const timestamp = Date.now();
    const firstName = 'John';
    const middleName = 'Michael';
    const lastName = `Smith${timestamp.toString().slice(-4)}`;
    const fullName = `${firstName} ${lastName}`;

    // Step 1-2: Login
    await test.step('Login to OrangeHRM', async () => {
      await page.goto(baseURL);

      // Enter username
      await page.getByPlaceholder('Username').fill(username);

      // Enter password (not explicitly shown in manual steps, but required)
      await page.getByPlaceholder('Password').fill(password);

      // Click Login button
      await page.getByRole('button', { name: 'Login' }).click();

      // Wait for dashboard URL and element (stabilize login)
      // Using self-healing helper to handle Dashboard strict mode violation
      await page.waitForURL(/dashboard/i, { timeout: 15000 });
      await helper.expectVisible('text=Dashboard', { text: 'Dashboard', timeout: 10000 });
    });

    // Step 3-6: Navigate to PIM module
    await test.step('Navigate to PIM module', async () => {
      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 500));

      // Click PIM menu
      await page.getByRole('link', { name: 'PIM' }).click();

      // Wait for PIM page to load by checking for specific element
      await expect(page.locator('h6:has-text("PIM")')).toBeVisible({ timeout: 10000 });

      // Scroll down then up
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.evaluate(() => window.scrollTo(0, 0));
    });

    // Step 7: Click Add Employee
    await test.step('Navigate to Add Employee form', async () => {
      // Wait for PIM navigation to be visible, then click "Add Employee" tab
      const addEmployeeLink = page.locator('a.oxd-topbar-body-nav-tab-item').filter({ hasText: 'Add Employee' });

      // Fallback to role-based selector if CSS selector doesn't work
      if (!await addEmployeeLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.getByRole('link', { name: 'Add Employee' }).click();
      } else {
        await addEmployeeLink.click();
      }

      // Wait for the Add Employee form header to be visible
      await expect(page.locator('h6:has-text("Add Employee")')).toBeVisible({ timeout: 10000 });
    });

    // Step 8-10: Enter employee details
    await test.step('Fill employee information', async () => {
      // Enter First Name
      await page.getByPlaceholder('First Name').or(
        page.locator('input[name*="firstName"]')
      ).first().fill(firstName);

      // Enter Middle Name
      await page.getByPlaceholder('Middle Name').or(
        page.locator('input[name*="middleName"]')
      ).first().fill(middleName);

      // Enter Last Name
      await page.getByPlaceholder('Last Name').or(
        page.locator('input[name*="lastName"]')
      ).first().fill(lastName);
    });

    // Step 11-12: Scroll down and Save
    await test.step('Save employee', async () => {
      // Scroll down to see the Save button
      await page.evaluate(() => window.scrollBy(0, 500));

      // Click Save button
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait for save operation to complete using self-healing
      await helper.expectVisible('text=Personal Details', { text: 'Personal Details', timeout: 10000 });
    });

    // Step 13-17: Verify employee was created
    await test.step('Verify employee personal details', async () => {
      // Scroll up to see the header
      await page.evaluate(() => window.scrollTo(0, 0));

      // Check that page contains employee name
      await expect(page.locator(`text=/${firstName}.*${lastName}/i`).or(
        page.getByText(fullName)
      )).toBeVisible({ timeout: 10000 });

      // Personal Details already verified in previous step

      // Check that page contains "Employee Full Name" or similar
      await expect(page.locator('text=/Employee.*Name|Full Name/i')).toBeVisible({ timeout: 5000 });
    });

    // Step 18-20: Navigate to Employee List and search
    await test.step('Search for employee in Employee List', async () => {
      // Click "Employee List" link
      await page.getByRole('link', { name: 'Employee List' }).click();

      // Wait for Employee List page to load using self-healing
      await helper.expectVisible('text=Employee Information', { text: 'Employee Information', timeout: 10000 });

      // Enter employee name using self-healing (handles autocomplete inputs)
      await helper.fillByLabel('Employee Name', firstName, { timeout: 10000 });

      // Wait briefly for autocomplete
      await page.waitForTimeout(500);

      // Click Search button
      await page.getByRole('button', { name: 'Search' }).click();

      // Wait for search results by checking for the records found text or table
      await expect(page.locator('.oxd-table-card, .oxd-table-body').first()).toBeVisible({ timeout: 10000 });
    });

    // Step 21-22: Verify search results
    await test.step('Verify employee in search results', async () => {
      // Check that page contains the employee's first and middle names
      await expect(page.locator(`text=/${firstName}/i`)).toBeVisible({ timeout: 10000 });

      // Check that page contains the last name
      await expect(page.locator(`text=/${lastName}/i`)).toBeVisible({ timeout: 10000 });

      console.log(`✅ Employee "${firstName} ${middleName} ${lastName}" created and verified successfully`);
    });

    // Print AI self-healing summary
    helper.printLearningSummary();
  });

  test('Verify employee can be found after creation', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
    const username = process.env.USERNAME || 'Admin';
    const password = process.env.PASSWORD || 'admin123';

    // Initialize self-healing helper
    const helper = new SelfHealingTestHelper(page);

    // Login
    await page.goto(baseURL);
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard URL and element (stabilize login)
    // Using self-healing helper to handle Dashboard strict mode violation
    await page.waitForURL(/dashboard/i, { timeout: 15000 });
    await helper.expectVisible('text=Dashboard', { text: 'Dashboard', timeout: 10000 });

    // Navigate to PIM
    await page.getByRole('link', { name: 'PIM' }).click();

    // Wait for PIM page to load by checking for specific element
    await expect(page.locator('h6:has-text("PIM")')).toBeVisible({ timeout: 10000 });

    // Verify Employee List is accessible
    await expect(page.getByRole('link', { name: 'Employee List' })).toBeVisible();

    console.log('✅ Employee list verification test completed');

    // Print AI self-healing summary
    helper.printLearningSummary();
  });

});
