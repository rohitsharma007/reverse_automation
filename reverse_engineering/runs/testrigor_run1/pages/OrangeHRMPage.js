/**
 * OrangeHRM Page Object Model
 *
 * This class encapsulates all locators and interactions for the OrangeHRM application.
 * Created by analyzing actual page screenshots and manual test steps.
 *
 * Page Structure:
 * - Left Sidebar: Main navigation (Admin, PIM, Leave, Time, etc.) - link elements
 * - Top Navigation: Contextual menus (User Management, Job, Organization, etc.) - clickable dropdown items
 * - Main Content: Forms, tables, and content areas
 */

class OrangeHRMPage {
  constructor(page) {
    this.page = page;
  }

  // ========================================
  // LOGIN PAGE LOCATORS
  // ========================================

  get usernameInput() {
    return this.page.getByPlaceholder('Username');
  }

  get passwordInput() {
    return this.page.getByPlaceholder('Password');
  }

  get loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
  }

  // ========================================
  // SIDEBAR NAVIGATION (Main Modules)
  // ========================================
  // These are links in the left sidebar

  getSidebarLink(name) {
    // Sidebar links are in the navigation panel
    return this.page.locator(`aside, nav[role="navigation"]`).getByRole('link', { name, exact: false });
  }

  get adminLink() {
    return this.getSidebarLink('Admin');
  }

  get pimLink() {
    return this.getSidebarLink('PIM');
  }

  get leaveLink() {
    return this.getSidebarLink('Leave');
  }

  get timeLink() {
    return this.getSidebarLink('Time');
  }

  get recruitmentLink() {
    return this.getSidebarLink('Recruitment');
  }

  get myInfoLink() {
    return this.getSidebarLink('My Info');
  }

  get performanceLink() {
    return this.getSidebarLink('Performance');
  }

  get dashboardLink() {
    return this.getSidebarLink('Dashboard');
  }

  get directoryLink() {
    return this.getSidebarLink('Directory');
  }

  get maintenanceLink() {
    return this.getSidebarLink('Maintenance');
  }

  get claimLink() {
    return this.getSidebarLink('Claim');
  }

  get buzzLink() {
    return this.getSidebarLink('Buzz');
  }

  // ========================================
  // TOP NAVIGATION BAR (Contextual Menus)
  // ========================================
  // These are dropdown menus in the top bar (NOT buttons, NOT links)

  getTopNavItem(name) {
    // Top navigation items are in nav with class oxd-topbar-body-nav
    // They are NOT buttons or links, they are clickable list items
    return this.page.locator('.oxd-topbar-body-nav-tab, .oxd-topbar-body-nav-tab-item').filter({ hasText: name }).first();
  }

  clickTopNavDropdown(name) {
    // For dropdown menus like "Job", "User Management", etc.
    return this.page.locator('.oxd-topbar-body-nav').locator('li').filter({ hasText: name }).first().click();
  }

  // Specific top nav items
  async clickUserManagement() {
    await this.clickTopNavDropdown('User Management');
  }

  async clickJob() {
    await this.clickTopNavDropdown('Job');
  }

  async clickOrganization() {
    await this.clickTopNavDropdown('Organization');
  }

  async clickQualifications() {
    await this.clickTopNavDropdown('Qualifications');
  }

  // ========================================
  // DROPDOWN MENU ITEMS
  // ========================================
  // Items that appear when clicking top nav dropdowns

  getDropdownItem(name) {
    // Dropdown items are links that appear after clicking a top nav item
    return this.page.getByRole('link', { name, exact: false });
  }

  get jobTitlesLink() {
    return this.getDropdownItem('Job Titles');
  }

  get employeeListLink() {
    return this.getDropdownItem('Employee List');
  }

  get addEmployeeLink() {
    return this.getDropdownItem('Add Employee');
  }

  // ========================================
  // FORM INPUTS (Context-aware)
  // ========================================

  /**
   * Find input by label text in the main content area (excludes sidebar)
   * This prevents finding the wrong input (like sidebar search)
   */
  getFormInput(labelText) {
    // Search only in main content areas, not sidebar
    return this.page.locator('.oxd-table-filter, .oxd-form, .oxd-input-group')
      .filter({ hasText: labelText })
      .locator('input')
      .first();
  }

  getUsernameInput() {
    // For System Users search form
    return this.page.locator('.oxd-table-filter').locator('.oxd-input-group').filter({ hasText: 'Username' }).locator('input');
  }

  getEmployeeNameInput() {
    // Autocomplete input for employee name
    return this.page.locator('.oxd-autocomplete-text-input input').first();
  }

  getKeywordsInput() {
    // For Recruitment search
    return this.getFormInput('Keywords');
  }

  // ========================================
  // BUTTONS
  // ========================================

  getButton(name) {
    return this.page.getByRole('button', { name });
  }

  get searchButton() {
    return this.getButton('Search');
  }

  get resetButton() {
    return this.getButton('Reset');
  }

  get saveButton() {
    return this.getButton('Save');
  }

  get addButton() {
    return this.getButton('Add');
  }

  // ========================================
  // TEXT VERIFICATIONS (Headings)
  // ========================================

  /**
   * Find heading by text - more specific than getByText
   */
  getHeading(text, level = null) {
    if (level) {
      return this.page.getByRole('heading', { name: text, level });
    }
    return this.page.getByRole('heading', { name: text });
  }

  /**
   * Check if page contains text (flexible - checks anywhere)
   */
  async containsText(text) {
    return await this.page.getByText(text, { exact: false }).first().isVisible({ timeout: 10000 });
  }

  /**
   * Wait for page heading to be visible
   */
  async waitForHeading(text, timeout = 10000) {
    await this.page.getByRole('heading', { name: text }).first().waitFor({ state: 'visible', timeout });
  }

  // ========================================
  // SPECIFIC FORM FIELDS
  // ========================================

  get firstNameInput() {
    return this.page.getByPlaceholder('First Name');
  }

  get middleNameInput() {
    return this.page.getByPlaceholder('Middle Name');
  }

  get lastNameInput() {
    return this.page.getByPlaceholder('Last Name');
  }

  // ========================================
  // TABLES
  // ========================================

  get tableBody() {
    return this.page.locator('.oxd-table-body, .oxd-table-card').first();
  }

  getTableRow(text) {
    return this.page.locator('.oxd-table-card, .oxd-table-body').filter({ hasText: text });
  }

  // ========================================
  // TEXTAREA
  // ========================================

  get buzzTextArea() {
    return this.page.locator('textarea').first();
  }

  // ========================================
  // PAGE ACTIONS
  // ========================================

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForURL(/dashboard/i, { timeout: 15000 });
  }

  async navigateToModule(moduleName) {
    const moduleMap = {
      'Admin': this.adminLink,
      'PIM': this.pimLink,
      'Leave': this.leaveLink,
      'Time': this.timeLink,
      'Recruitment': this.recruitmentLink,
      'My Info': this.myInfoLink,
      'Performance': this.performanceLink,
      'Dashboard': this.dashboardLink,
      'Directory': this.directoryLink,
      'Maintenance': this.maintenanceLink,
      'Claim': this.claimLink,
      'Buzz': this.buzzLink
    };

    const link = moduleMap[moduleName];
    if (link) {
      await link.click();
    } else {
      throw new Error(`Module "${moduleName}" not found in navigation`);
    }
  }

  async searchUserByUsername(username) {
    await this.getUsernameInput().fill(username);
    await this.searchButton.click();
    await this.tableBody.waitFor({ state: 'visible', timeout: 5000 });
  }

  async resetSearch() {
    await this.resetButton.click();
    await this.page.waitForTimeout(500); // Brief wait for form reset
  }

  /**
   * Scroll helper
   */
  async scrollDown(pixels = 500) {
    await this.page.evaluate((px) => window.scrollBy(0, px), pixels);
  }

  async scrollUp() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }
}

module.exports = { OrangeHRMPage };
