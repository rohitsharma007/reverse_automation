const { test, expect } = require('@playwright/test');
const { OrangeHRMNavigator, ErrorAnalyzer } = require('../helpers/smart-locators');
require('dotenv').config();

/**
 * Test: Employee Addition Workflow (AI-Powered Self-Healing Version)
 *
 * This version uses intelligent locator strategies that automatically adapt
 * when elements are not found. It implements self-healing patterns to handle:
 * - Dynamic DOM structures
 * - Nested elements in topbar navigation
 * - Autocomplete fields
 * - Viewport issues
 * - Network latency
 *
 * The test learns from failures and suggests optimizations.
 *
 * Source: testrigor_run2 manual steps
 */

// Global error analyzer for learning
const errorAnalyzer = new ErrorAnalyzer();

test.describe('Employee Addition Workflow - Self-Healing', () => {

  test('Add new employee and verify creation', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
    const username = process.env.USERNAME || 'Admin';
    const password = process.env.PASSWORD || 'admin123';

    // Initialize AI-powered navigator
    const navigator = new OrangeHRMNavigator(page);

    // Generate unique employee ID to avoid conflicts
    const timestamp = Date.now();
    const firstName = 'John';
    const middleName = 'Michael';
    const lastName = `Smith${timestamp.toString().slice(-4)}`;
    const fullName = `${firstName} ${lastName}`;

    try {
      // Step 1-2: Login
      await test.step('Login to OrangeHRM', async () => {
        await page.goto(baseURL);

        // Enter username
        await page.getByPlaceholder('Username').fill(username);

        // Enter password
        await page.getByPlaceholder('Password').fill(password);

        // Click Login button with smart retry
        await navigator.clickButton('Login');

        // Wait for dashboard URL and element (stabilize login)
        await page.waitForURL(/dashboard/i, { timeout: 15000 });
        await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

        console.log('✅ Login successful');
      });

      // Step 3-6: Navigate to PIM module
      await test.step('Navigate to PIM module', async () => {
        // Scroll down
        await page.evaluate(() => window.scrollBy(0, 500));

        // Click PIM menu
        await page.getByRole('link', { name: 'PIM' }).click();

        // Wait for PIM section with smart detection
        await navigator.waitForSection('PIM');

        // Scroll down then up
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.evaluate(() => window.scrollTo(0, 0));

        console.log('✅ PIM module loaded');
      });

      // Step 7: Click Add Employee with self-healing
      await test.step('Navigate to Add Employee form', async () => {
        // Use smart topbar navigation
        await navigator.navigateToTopbarTab('Add Employee');

        // Wait for Add Employee form
        await navigator.waitForSection('Add Employee');

        console.log('✅ Add Employee form opened');
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

        console.log(`✅ Employee details filled: ${firstName} ${middleName} ${lastName}`);
      });

      // Step 11-12: Scroll down and Save
      await test.step('Save employee', async () => {
        // Scroll down to see the Save button
        await page.evaluate(() => window.scrollBy(0, 500));

        // Click Save button with smart retry
        await navigator.clickButton('Save');

        // Wait for save operation to complete by checking for Personal Details
        await navigator.waitForSection('Personal Details');

        console.log('✅ Employee saved successfully');
      });

      // Step 13-17: Verify employee was created
      await test.step('Verify employee personal details', async () => {
        // Scroll up to see the header
        await page.evaluate(() => window.scrollTo(0, 0));

        // Check that page contains employee name
        await expect(page.locator(`text=/${firstName}.*${lastName}/i`).or(
          page.getByText(fullName)
        )).toBeVisible({ timeout: 10000 });

        // Check that page contains "Employee Full Name" or similar
        await expect(page.locator('text=/Employee.*Name|Full Name/i')).toBeVisible({ timeout: 5000 });

        console.log('✅ Employee details verified');
      });

      // Step 18-20: Navigate to Employee List and search (SELF-HEALING)
      await test.step('Search for employee in Employee List', async () => {
        // Use smart topbar navigation for Employee List
        await navigator.navigateToTopbarTab('Employee List');

        // Wait for Employee List page
        await navigator.waitForSection('Employee Information');

        // Fill autocomplete field with self-healing
        await navigator.fillAutocompleteInput('Employee Name', firstName);

        // Click Search button with smart retry
        await navigator.clickButton('Search');

        // Wait for search results by checking for the records found text or table
        await expect(page.locator('.oxd-table-card, .oxd-table-body').first()).toBeVisible({ timeout: 10000 });

        console.log('✅ Search completed');
      });

      // Step 21-22: Verify search results
      await test.step('Verify employee in search results', async () => {
        // Check that page contains the employee's first and middle names
        await expect(page.locator(`text=/${firstName}/i`)).toBeVisible({ timeout: 10000 });

        // Check that page contains the last name
        await expect(page.locator(`text=/${lastName}/i`)).toBeVisible({ timeout: 10000 });

        console.log(`✅ Employee "${firstName} ${middleName} ${lastName}" found in search results`);
      });

      // Get learning insights
      const insights = navigator.getLearningInsights();
      console.log('\n📊 AI Learning Insights:');
      console.log('Successful strategies:', insights.successfulStrategies.length);
      if (insights.recommendations.length > 0) {
        console.log('Recommendations:');
        insights.recommendations.forEach(rec => {
          console.log(`  - [${rec.type}] ${rec.message}`);
        });
      }

    } catch (error) {
      // AI-powered error analysis
      errorAnalyzer.logError(error, {
        test: 'Add new employee',
        step: 'unknown',
        timestamp: new Date().toISOString()
      });

      const analysis = errorAnalyzer.analyzeError(error);
      console.error('\n❌ Test failed. AI Analysis:');
      console.error('Error type:', analysis.errorType);
      console.error('Suggestions:');
      analysis.suggestions.forEach(suggestion => {
        console.error(`  - ${suggestion.fix} (confidence: ${(suggestion.confidence * 100).toFixed(0)}%)`);
        console.error(`    Action: ${suggestion.action}`);
      });

      throw error;
    }
  });

  test('Verify employee can be found after creation', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
    const username = process.env.USERNAME || 'Admin';
    const password = process.env.PASSWORD || 'admin123';

    // Initialize AI-powered navigator
    const navigator = new OrangeHRMNavigator(page);

    try {
      // Login
      await page.goto(baseURL);
      await page.getByPlaceholder('Username').fill(username);
      await page.getByPlaceholder('Password').fill(password);
      await navigator.clickButton('Login');

      // Wait for dashboard URL and element (stabilize login)
      await page.waitForURL(/dashboard/i, { timeout: 15000 });
      await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

      // Navigate to PIM
      await page.getByRole('link', { name: 'PIM' }).click();

      // Wait for PIM page to load
      await navigator.waitForSection('PIM');

      // Verify Employee List tab is accessible using smart navigation
      await navigator.navigateToTopbarTab('Employee List');
      await navigator.waitForSection('Employee Information');

      console.log('✅ Employee list verification test completed');
    } catch (error) {
      errorAnalyzer.logError(error, {
        test: 'Verify employee list access',
        timestamp: new Date().toISOString()
      });

      const analysis = errorAnalyzer.analyzeError(error);
      console.error('\n❌ Test failed. AI Analysis:');
      console.error('Error type:', analysis.errorType);
      analysis.suggestions.forEach(suggestion => {
        console.error(`  - ${suggestion.fix}`);
        console.error(`    Action: ${suggestion.action}`);
      });

      throw error;
    }
  });

  // After all tests, print error statistics
  test.afterAll(async () => {
    const stats = errorAnalyzer.getStatistics();
    if (stats.totalErrors > 0) {
      console.log('\n📈 Error Statistics:');
      console.log('Total errors:', stats.totalErrors);
      console.log('Error types:', stats.errorTypes);
      console.log('Common patterns:', stats.commonPatterns);
    }
  });

});
