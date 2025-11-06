# Testrigor Run 2 - Employee Addition Workflow Automation

This directory contains Playwright automation scripts that replicate the employee addition workflow test extracted from the PDF automation run.

## Test Overview

**Test Name:** Employee Addition and Verification Workflow

**Purpose:** Validate the complete flow of adding a new employee and verifying the creation

**Features Tested:**
- Login & Authentication
- PIM Module Navigation
- Add Employee Form
- Employee Information Entry
- Save Employee Data
- Employee Verification
- Employee List Search
- Search Results Validation

## Prerequisites

1. **Node.js** (v14 or higher)
   ```bash
   node --version
   ```

2. **npm** or **yarn** package manager

## Installation

1. Navigate to this directory:
   ```bash
   cd reverse_engineering/runs/testrigor_run2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npm run install:browsers
   ```

## Configuration

The automation is configured to use the **OrangeHRM demo instance** by default.

### Environment Variables

Edit the `.env` file to configure:

```env
BASE_URL=https://opensource-demo.orangehrmlive.com
USERNAME=Admin
PASSWORD=admin123
```

**Note:** The demo instance credentials are:
- Username: `Admin`
- Password: `admin123`

For a different OrangeHRM instance, update these values accordingly.

## Running the Tests

### Run all tests (headless mode)
```bash
npm test
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run tests with UI mode (interactive)
```bash
npm run test:ui
```

## Test Structure

```
testrigor_run2/
├── tests/
│   └── employee-addition-workflow.spec.js    # Main test file
├── playwright.config.js                       # Playwright configuration
├── package.json                               # Dependencies
├── .env                                       # Environment configuration
└── AUTOMATION_README.md                       # This file
```

## Test Steps

The automation replicates these manual steps:

1. **Login** - Authenticate with Admin credentials
2. **Navigate to PIM** - Access Personnel Information Management
3. **Add Employee** - Click "Add Employee" button
4. **Enter Details:**
   - First Name: John
   - Middle Name: Michael
   - Last Name: Smith (with timestamp to avoid duplicates)
5. **Save Employee** - Submit the form
6. **Verify Personal Details** - Check employee was created
7. **Navigate to Employee List** - Access employee listing
8. **Search Employee** - Search for the newly created employee
9. **Verify Search Results** - Confirm employee appears in results

## Expected Results

All test steps should pass with:
- ✅ Successful login
- ✅ PIM module accessible
- ✅ Employee form submission successful
- ✅ Employee details saved correctly
- ✅ Employee searchable in employee list
- ✅ All validations passing

## Unique Employee Generation

To avoid conflicts with existing employees, the automation appends a timestamp to the last name:
- First Name: `John`
- Middle Name: `Michael`
- Last Name: `Smith` + last 4 digits of timestamp (e.g., `Smith1234`)

This ensures each test run creates a unique employee.

## Viewing Test Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Test Validations

The test validates:

1. **Login Success**
   - Dashboard page is visible

2. **Employee Creation**
   - Personal Details page loads
   - Employee name appears on the page
   - "Employee Full Name" section visible

3. **Employee Search**
   - Search functionality works
   - Employee appears in search results
   - First name, middle name, and last name all visible

## Troubleshooting

### Tests failing due to timeouts
- Increase timeout in `playwright.config.js`
- The "Save" operation may take longer on slower networks
- Wait times can be adjusted in the test file

### Element not found errors
- The OrangeHRM demo instance UI may have changed
- Check if selectors need updating
- Run in debug mode to inspect elements

### Duplicate employee errors
- The timestamp-based naming should prevent this
- Manually check the employee list in OrangeHRM
- Delete duplicate employees if necessary

### Authentication failures
- Verify credentials in `.env` file
- Check if OrangeHRM instance is accessible

## Source

This automation was generated from the manual test cases extracted from:
- **PDF:** Test_the_full_workflow_of_submitting_a_form_or_request...
- **Manual Steps:** `manual_steps.txt`
- **Test Cases:** `test_cases.md`
- **Extracted Images:** `extracted_images/` directory (13 pages)

## Additional Tests

The automation includes two test cases:

1. **Add new employee and verify creation** - Full workflow test
2. **Verify employee can be found after creation** - Quick verification test

Both tests can be run together or individually using Playwright's filtering:

```bash
# Run specific test
npx playwright test --grep "Add new employee"
```

## Related Files

- Original PDF test run
- Extracted images (13 pages)
- Manual test cases documentation
- Category and grouping JSON files

## Contact

For issues or questions about this automation, refer to the main project README.
