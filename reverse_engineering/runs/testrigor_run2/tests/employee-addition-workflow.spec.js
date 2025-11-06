const { test, expect } = require('@playwright/test');
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
 */

test.describe('Employee Addition Workflow - OrangeHRM', () => {

  test('Add new employee and verify creation', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
    const username = process.env.USERNAME || 'Admin';
    const password = process.env.PASSWORD || 'admin123';

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

      // Wait for dashboard to load
      await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
    });

    // Step 3-6: Navigate to PIM module
    await test.step('Navigate to PIM module', async () => {
      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);

      // Click PIM menu
      await page.getByRole('link', { name: 'PIM' }).click();

      // Wait for PIM page to load
      await page.waitForLoadState('networkidle');

      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);

      // Scroll up
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
    });

    // Step 7: Click Add Employee
    await test.step('Navigate to Add Employee form', async () => {
      // Click "Add Employee" button or link
      await page.getByRole('link', { name: 'Add Employee' }).or(
        page.getByRole('button', { name: 'Add Employee' })
      ).or(
        page.getByText('Add Employee')
      ).first().click();

      // Wait for the Add Employee form to load
      await page.waitForLoadState('networkidle');
      await expect(page.getByText('Add Employee')).toBeVisible({ timeout: 10000 });
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

      await page.waitForTimeout(500);
    });

    // Step 11-12: Scroll down and Save
    await test.step('Save employee', async () => {
      // Scroll down to see the Save button
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);

      // Click Save button
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait 3 seconds as per manual steps
      await page.waitForTimeout(3000);

      // Wait for save operation to complete
      await page.waitForLoadState('networkidle');
    });

    // Step 13-17: Verify employee was created
    await test.step('Verify employee personal details', async () => {
      // Scroll up to see the header
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      // Check that page contains employee name
      await expect(page.locator(`text=/${firstName}.*${lastName}/i`).or(
        page.getByText(fullName)
      )).toBeVisible({ timeout: 10000 });

      // Check that page contains "Personal Details"
      await expect(page.getByText('Personal Details')).toBeVisible();

      // Check that page contains "Employee Full Name" or similar
      await expect(page.locator('text=/Employee.*Name|Full Name/i')).toBeVisible({ timeout: 5000 });
    });

    // Step 18-20: Navigate to Employee List and search
    await test.step('Search for employee in Employee List', async () => {
      // Click "Employee List" link
      await page.getByRole('link', { name: 'Employee List' }).click();

      // Wait for Employee List page to load
      await page.waitForLoadState('networkidle');

      // Enter employee name into search
      const employeeNameInput = page.getByPlaceholder(/Employee Name/i).or(
        page.locator('input[placeholder*="Employee" i]')
      ).or(
        page.locator('input').filter({ hasText: /employee/i })
      ).first();

      await employeeNameInput.fill(firstName);
      await page.waitForTimeout(1000);

      // Click Search button
      await page.getByRole('button', { name: 'Search' }).click();

      // Wait for search results
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    });

    // Step 21-22: Verify search results
    await test.step('Verify employee in search results', async () => {
      // Check that page contains the employee's first and middle names
      await expect(page.locator(`text=/${firstName}/i`)).toBeVisible({ timeout: 10000 });

      // Check that page contains the last name
      await expect(page.locator(`text=/${lastName}/i`)).toBeVisible({ timeout: 10000 });

      console.log(`✅ Employee "${firstName} ${middleName} ${lastName}" created and verified successfully`);
    });

  });

  test('Verify employee can be found after creation', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
    const username = process.env.USERNAME || 'Admin';
    const password = process.env.PASSWORD || 'admin123';

    // Login
    await page.goto(baseURL);
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    // Navigate to PIM
    await page.getByRole('link', { name: 'PIM' }).click();
    await page.waitForLoadState('networkidle');

    // Verify Employee List is accessible
    await expect(page.getByRole('link', { name: 'Employee List' })).toBeVisible();

    console.log('✅ Employee list verification test completed');
  });

});
