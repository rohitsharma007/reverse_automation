# Testrigor Run 1 - Complete User Journey Automation

This directory contains Playwright automation scripts that replicate the complete user journey test extracted from the PDF automation run.

## Test Overview

**Test Name:** Complete User Journey from Login to Logout

**Purpose:** Validate the complete flow through various OrangeHRM modules

**Modules Tested:**
- Login & Authentication
- Admin Module (System Users, Search, Reset)
- Job & Job Titles
- PIM (Personnel Information Management)
- Leave Management
- Time & Timesheets
- Recruitment
- My Info
- Performance
- Directory
- Buzz (Social Feed)
- Claim Management

## Prerequisites

1. **Node.js** (v14 or higher)
   ```bash
   node --version
   ```

2. **npm** or **yarn** package manager

## Installation

1. Navigate to this directory:
   ```bash
   cd reverse_engineering/runs/testrigor_run1
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
testrigor_run1/
├── tests/
│   └── complete-user-journey.spec.js    # Main test file
├── playwright.config.js                  # Playwright configuration
├── package.json                          # Dependencies
├── .env                                  # Environment configuration
└── AUTOMATION_README.md                  # This file
```

## Test Steps

The automation replicates these manual steps:

1. **Login** - Enter credentials and authenticate
2. **Admin Module** - Navigate and perform search operations
3. **Job Section** - Access Job and Job Titles
4. **PIM** - View Employee Information
5. **Leave** - Check Leave List
6. **Time** - View Timesheets
7. **Recruitment** - Search for candidates with keywords
8. **My Info** - View personal details
9. **Performance** - Check employee reviews
10. **Directory** - Access directory page
11. **Buzz** - Create a test post
12. **Claim** - View employee claims
13. **Final Operations** - Search and scroll operations

## Expected Results

All test steps should pass with:
- ✅ Successful login
- ✅ All modules accessible
- ✅ Search and navigation operations working
- ✅ Page validations passing
- ✅ No errors or crashes

## Viewing Test Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Troubleshooting

### Tests failing due to timeouts
- Increase timeout in `playwright.config.js`
- Check network connectivity
- Verify OrangeHRM instance is accessible

### Element not found errors
- The OrangeHRM demo instance may have changed
- Check if selectors need updating
- Run in debug mode to inspect elements

### Authentication failures
- Verify credentials in `.env` file
- Check if OrangeHRM instance requires different credentials

## Source

This automation was generated from the manual test cases extracted from:
- **PDF:** Verify_the_complete_user_journey_from_application_login_to_successful_logout...
- **Manual Steps:** `manual_steps.txt`
- **Test Cases:** `test_cases.md`
- **Extracted Images:** `extracted_images/` directory

## Related Files

- Original PDF test run
- Extracted images (21 pages)
- Manual test cases documentation
- Category and grouping JSON files

## Contact

For issues or questions about this automation, refer to the main project README.
