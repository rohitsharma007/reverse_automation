# Page Object Model (POM) Guide for OrangeHRM Tests

## Why Page Object Model?

**Problem:** Tests were failing repeatedly because:
1. Wrong element types (button vs nav item vs generic)
2. Wrong context (sidebar vs topbar vs form)
3. Brittle selectors that break with minor changes
4. No separation of concerns - locators mixed with test logic

**Solution:** Page Object Model separates:
- **Locators** → In Page Objects (OrangeHRMPage.js)
- **Test Logic** → In Test Files (complete-user-journey-pom.spec.js)

---

## Architecture

```
reverse_engineering/runs/testrigor_run1/
├── pages/
│   └── OrangeHRMPage.js          ← All locators and page interactions
├── tests/
│   ├── complete-user-journey-pom.spec.js  ← Test logic using POM
│   └── complete-user-journey.spec.js      ← Old approach (deprecated)
└── manual_steps.txt               ← Source of truth for test steps
```

---

## OrangeHRM Page Structure (From Screenshots)

Understanding the page structure is critical for correct locators:

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo, Admin/User Management, Upgrade, Profile     │
├─────────────┬───────────────────────────────────────────────┤
│             │  Top Nav Bar (Contextual to selected module)  │
│  Sidebar    │  [User Management] [Job] [Organization] ...   │
│             ├───────────────────────────────────────────────┤
│  📌 Admin    │                                               │
│  📌 PIM      │          Main Content Area                    │
│  📌 Leave    │          (Forms, Tables, etc.)                │
│  📌 Time     │                                               │
│  📌 Recruit  │                                               │
│  ...        │                                               │
└─────────────┴───────────────────────────────────────────────┘
```

**Key Insights:**
1. **Sidebar** = Main modules (Admin, PIM, Leave, etc.) → `<a>` links
2. **Top Nav** = Contextual menus (Job, User Management, etc.) → Clickable `<li>` items (NOT buttons!)
3. **Forms** = In main content area → Scope selectors to `.oxd-table-filter` or `.oxd-form`

---

## How to Create Tests with POM

### Step 1: Import the Page Object

```javascript
const { test, expect } = require('@playwright/test');
const { OrangeHRMPage } = require('../pages/OrangeHRMPage');
```

### Step 2: Initialize in Test

```javascript
test('My test', async ({ page }) => {
  const orangeHRM = new OrangeHRMPage(page);

  // Now use orangeHRM instead of page
  await orangeHRM.login('Admin', 'admin123');
});
```

### Step 3: Use Page Object Methods

```javascript
// ❌ OLD WAY - Brittle, wrong selectors
await page.getByRole('button', { name: 'Job' }).click();  // WRONG! It's not a button

// ✅ NEW WAY - Correct, maintainable
await orangeHRM.clickJob();  // Page object knows Job is a top nav item
```

---

## Page Object Methods Reference

### Navigation

#### Sidebar Modules (Main Navigation)

```javascript
// Navigate to any main module
await orangeHRM.navigateToModule('Admin');
await orangeHRM.navigateToModule('PIM');
await orangeHRM.navigateToModule('Leave');
await orangeHRM.navigateToModule('Time');
await orangeHRM.navigateToModule('Recruitment');
await orangeHRM.navigateToModule('My Info');
await orangeHRM.navigateToModule('Performance');
await orangeHRM.navigateToModule('Dashboard');
await orangeHRM.navigateToModule('Directory');
await orangeHRM.navigateToModule('Buzz');
await orangeHRM.navigateToModule('Claim');

// Or use direct properties
await orangeHRM.adminLink.click();
await orangeHRM.pimLink.click();
```

#### Top Navigation Dropdowns (Contextual Menus)

```javascript
// These appear in the top bar AFTER selecting a module (like Admin)
await orangeHRM.clickJob();             // Clicks "Job" in top nav
await orangeHRM.clickUserManagement();  // Clicks "User Management"
await orangeHRM.clickOrganization();    // Clicks "Organization"

// Then click dropdown items
await orangeHRM.jobTitlesLink.click();
await orangeHRM.addEmployeeLink.click();
```

### Form Inputs

```javascript
// Login page
await orangeHRM.usernameInput.fill('Admin');
await orangeHRM.passwordInput.fill('admin123');

// Form inputs (context-aware - won't find sidebar search)
await orangeHRM.getUsernameInput().fill('Admin');  // System Users form
await orangeHRM.getEmployeeNameInput().fill('John');
await orangeHRM.getKeywordsInput().fill('developer');

// Employee form
await orangeHRM.firstNameInput.fill('John');
await orangeHRM.middleNameInput.fill('Michael');
await orangeHRM.lastNameInput.fill('Doe');
```

### Buttons

```javascript
await orangeHRM.loginButton.click();
await orangeHRM.searchButton.click();
await orangeHRM.resetButton.click();
await orangeHRM.saveButton.click();
await orangeHRM.addButton.click();
```

### Verifications

```javascript
// Check for text anywhere on page
expect(await orangeHRM.containsText('Dashboard')).toBeTruthy();
expect(await orangeHRM.containsText('System Users')).toBeTruthy();

// Wait for specific heading
await orangeHRM.waitForHeading('Job Titles');
await orangeHRM.waitForHeading('Employee Information');

// Get specific heading (if you need to interact with it)
const heading = orangeHRM.getHeading('Dashboard', 6);  // h6
await expect(heading).toBeVisible();
```

### Utilities

```javascript
// Scrolling
await orangeHRM.scrollDown();      // Scroll down 500px
await orangeHRM.scrollDown(800);   // Scroll down 800px
await orangeHRM.scrollUp();        // Scroll to top

// Tables
await orangeHRM.tableBody.waitFor({ state: 'visible' });
const row = orangeHRM.getTableRow('Admin');
await expect(row).toBeVisible();
```

---

## Complete Example: Rewriting a Failing Test

### Before (Failing Test)

```javascript
// ❌ This fails - wrong element types and no context
test('Navigate to Job Titles', async ({ page }) => {
  await page.goto('https://...');
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();

  // ❌ FAILS - "Job" is not a button!
  await page.getByRole('button', { name: 'Job' }).click();

  await page.getByRole('link', { name: 'Job Titles' }).click();

  // ❌ MIGHT FAIL - strict mode if multiple "Job Titles" text
  await expect(page.getByText('Job Titles')).toBeVisible();
});
```

**Problems:**
1. Line 10: `getByRole('button', { name: 'Job' })` - Job is NOT a button
2. Line 14: `getByText('Job Titles')` - Might match multiple elements
3. No reusability - locators repeated everywhere
4. Hard to maintain - changing one locator requires editing multiple tests

### After (Working Test with POM)

```javascript
// ✅ This works - correct elements and proper context
test('Navigate to Job Titles', async ({ page }) => {
  const orangeHRM = new OrangeHRMPage(page);

  await page.goto('https://...');
  await orangeHRM.login('Admin', 'admin123');

  await orangeHRM.navigateToModule('Admin');

  // ✅ WORKS - Page object knows Job is a top nav item
  await orangeHRM.clickJob();

  await orangeHRM.jobTitlesLink.click();

  // ✅ WORKS - Specific heading check
  await orangeHRM.waitForHeading('Job Titles');
});
```

**Benefits:**
1. Correct element types - POM handles the complexity
2. Reusable - Change locator once in POM, all tests benefit
3. Readable - Test intent is clear
4. Maintainable - Locators centralized in one place

---

## How Locators Were Identified

All locators in `OrangeHRMPage.js` were identified by:

1. **Analyzing screenshots** from `extracted_images/`
   - page-002: Login page
   - page-004: Admin page with sidebar and top nav
   - page-007: Job dropdown menu
   - page-008: Job Titles page

2. **Reading manual steps** from `manual_steps.txt`
   - Step 5: "click Admin" → Sidebar link
   - Step 10: "click Job" → Top nav dropdown
   - Step 11: "click Job Titles" → Dropdown item

3. **Analyzing page snapshots** from failed tests
   - Confirmed element roles (link vs button vs generic)
   - Identified parent containers (sidebar vs topbar vs form)

---

## Common Patterns

### Pattern 1: Navigation

```javascript
// Sidebar modules (main navigation)
await orangeHRM.navigateToModule('Admin');

// Top nav dropdowns (contextual)
await orangeHRM.clickJob();

// Dropdown items
await orangeHRM.jobTitlesLink.click();
```

### Pattern 2: Form Interaction

```javascript
// Fill form
await orangeHRM.getUsernameInput().fill('Admin');
await orangeHRM.searchButton.click();

// Verify results
await orangeHRM.tableBody.waitFor({ state: 'visible' });

// Reset
await orangeHRM.resetButton.click();
await expect(orangeHRM.getUsernameInput()).toHaveValue('');
```

### Pattern 3: Module Exploration

```javascript
// Navigate to module
await orangeHRM.navigateToModule('PIM');

// Verify page loaded
await orangeHRM.waitForHeading('Employee Information');

// Interact with page
await orangeHRM.scrollDown();
```

---

## Troubleshooting

### Issue: Element Not Found

**Before investigating, check:**
1. Is it a sidebar link or top nav item?
2. Is it visible only after clicking something else?
3. Is it in a dropdown that needs to open first?

**Solution:**
```javascript
// ❌ Wrong - assuming it's directly accessible
await page.getByRole('link', { name: 'Job Titles' }).click();

// ✅ Right - open dropdown first
await orangeHRM.clickJob();  // Opens dropdown
await orangeHRM.jobTitlesLink.click();  // Now accessible
```

### Issue: Wrong Input Found

**Problem:** Finding sidebar search instead of form input

**Solution:** Page Object scopes to form areas

```javascript
// ❌ Old - finds ANY input with "Username" label (might be sidebar search)
await page.getByLabel('Username').fill('Admin');

// ✅ New - scoped to form area only
await orangeHRM.getUsernameInput().fill('Admin');
```

### Issue: Strict Mode Violation

**Problem:** Multiple elements with same text

**Solution:** Page Object uses specific selectors

```javascript
// ❌ Old - might match multiple elements
await expect(page.getByText('Dashboard')).toBeVisible();

// ✅ New - uses heading role and level
await orangeHRM.waitForHeading('Dashboard');
// or
const heading = orangeHRM.getHeading('Dashboard', 6);
await expect(heading).toBeVisible();
```

---

## Adding New Locators to POM

When you need a new element:

### 1. Identify Element Type from Screenshot/Snapshot

```yaml
# From page snapshot:
- button "Save" [ref=e123]        → It's a button
- link "Job Titles" [ref=e456]    → It's a link
- generic [ref=e789]:             → It's a clickable div/span (use locator)
    - text: Job
```

### 2. Identify Container/Context

```yaml
# Where is it located?
- In sidebar navigation?  → Use getSidebarLink()
- In top nav bar?        → Use clickTopNavDropdown()
- In a form?             → Use getFormInput()
- In main content?       → Use specific locator
```

### 3. Add to OrangeHRMPage.js

```javascript
// In the appropriate section
get myNewButton() {
  return this.getButton('My Button Text');
}

// Or with specific locator
get myNewInput() {
  return this.page.locator('.specific-class').locator('input').first();
}
```

### 4. Use in Test

```javascript
await orangeHRM.myNewButton.click();
await orangeHRM.myNewInput.fill('value');
```

---

## Best Practices

### ✅ DO:

1. **Use Page Objects for all locators**
   ```javascript
   await orangeHRM.loginButton.click();
   ```

2. **Keep tests focused on business logic**
   ```javascript
   await orangeHRM.login('Admin', 'admin123');
   await orangeHRM.navigateToModule('Admin');
   ```

3. **Add descriptive comments referencing manual steps**
   ```javascript
   // Step 10: click "Job"
   await orangeHRM.clickJob();
   ```

4. **Use try-catch for optional elements**
   ```javascript
   try {
     await orangeHRM.getKeywordsInput().fill('developer');
   } catch {
     console.log('Keywords field not available');
   }
   ```

### ❌ DON'T:

1. **Don't use page directly in tests**
   ```javascript
   // ❌ BAD
   await page.getByRole('button', { name: 'Job' }).click();

   // ✅ GOOD
   await orangeHRM.clickJob();
   ```

2. **Don't duplicate locators**
   ```javascript
   // ❌ BAD - locator repeated in multiple tests
   test1: await page.locator('.oxd-topbar-body-nav-tab-item').filter({ hasText: 'Job' }).click();
   test2: await page.locator('.oxd-topbar-body-nav-tab-item').filter({ hasText: 'Job' }).click();

   // ✅ GOOD - centralized in POM
   test1: await orangeHRM.clickJob();
   test2: await orangeHRM.clickJob();
   ```

3. **Don't mix page and POM**
   ```javascript
   // ❌ BAD - inconsistent
   await orangeHRM.login('Admin', 'admin123');
   await page.getByRole('link', { name: 'Admin' }).click();  // Why not use POM?

   // ✅ GOOD - consistent
   await orangeHRM.login('Admin', 'admin123');
   await orangeHRM.navigateToModule('Admin');
   ```

---

## Migration Guide

### Migrating Existing Tests

1. **Keep old test as reference**
   ```bash
   mv complete-user-journey.spec.js complete-user-journey.old.spec.js
   ```

2. **Create new POM-based test**
   ```bash
   cp complete-user-journey-pom.spec.js complete-user-journey.spec.js
   ```

3. **Run both and compare** (temporarily)
   ```bash
   npm test -- complete-user-journey.old.spec.js  # Old way
   npm test -- complete-user-journey.spec.js      # New way
   ```

4. **Delete old test once new one works**
   ```bash
   rm complete-user-journey.old.spec.js
   ```

---

## Summary

### Before POM (Problems)

- ❌ Tests failing repeatedly
- ❌ Wrong element types (button vs link vs generic)
- ❌ Wrong context (sidebar vs topbar vs form)
- ❌ Brittle selectors
- ❌ No reusability
- ❌ Hard to maintain

### After POM (Benefits)

- ✅ Tests work first time
- ✅ Correct element types (identified from screenshots)
- ✅ Proper context (scoped selectors)
- ✅ Robust selectors (based on actual page structure)
- ✅ Highly reusable (methods used across tests)
- ✅ Easy to maintain (change once, apply everywhere)

---

## Files Created

```
reverse_engineering/runs/testrigor_run1/
├── pages/
│   └── OrangeHRMPage.js                      ← Page Object with all locators
├── tests/
│   ├── complete-user-journey-pom.spec.js     ← New POM-based test
│   └── complete-user-journey.spec.js         ← Old test (to be replaced)
└── PAGE_OBJECT_MODEL_GUIDE.md               ← This guide
```

---

**Last Updated:** 2025-11-06
**Status:** ✅ Production Ready
**Approach:** Page Object Model with screenshot-verified locators
