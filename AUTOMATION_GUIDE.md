# Reverse Automation - Playwright Automation Guide

## Overview

This project now includes **Playwright automation scripts** that were generated from the reverse-engineered manual test cases. The automation completes the full circle:

```
PDF with Screenshots → Extract Images → Generate Test Cases → Create Automation Scripts
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVERSE AUTOMATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. PDF Input (Automation Run Recording)
         ↓
2. Image Extraction (extract_images_from_pdf.py)
         ↓
3. Category Derivation (derive_categories_from_pdf.py)
         ↓
4. Image Filtering (filter_images.py)
         ↓
5. Test Case Generation (generate_test_cases.py)
         ↓
6. Manual Test Cases (Markdown)
         ↓
7. ✨ NEW: Playwright Automation Scripts ✨
```

## Available Automation Scripts

### 1. Testrigor Run 1 - Complete User Journey

**Location:** `reverse_engineering/runs/testrigor_run1/`

**Test Scope:**
- Complete user journey from login to logout
- Tests 11+ OrangeHRM modules
- 38 automated steps
- Validates navigation, search, data entry, and social features

**Quick Start:**
```bash
cd reverse_engineering/runs/testrigor_run1
npm install
npm run install:browsers
npm run test:headed
```

### 2. Testrigor Run 2 - Employee Addition Workflow

**Location:** `reverse_engineering/runs/testrigor_run2/`

**Test Scope:**
- Employee creation workflow
- PIM module testing
- Form submission and validation
- Search functionality
- 23 automated steps

**Quick Start:**
```bash
cd reverse_engineering/runs/testrigor_run2
npm install
npm run install:browsers
npm run test:headed
```

## Project Structure

```
reverse_automation/
├── reverse_engineering/
│   ├── run_pipeline.py                          # PDF → Test Cases pipeline
│   ├── extract_images_from_pdf.py
│   ├── derive_categories_from_pdf.py
│   ├── filter_images.py
│   ├── generate_test_cases.py
│   └── runs/
│       ├── testrigor_run1/
│       │   ├── extracted_images/                # PDF screenshots (21 pages)
│       │   ├── test_cases.md                    # Generated manual test cases
│       │   ├── manual_steps.txt                 # Original manual steps
│       │   ├── ✨ tests/                        # Playwright automation
│       │   ├── ✨ playwright.config.js
│       │   ├── ✨ package.json
│       │   └── ✨ AUTOMATION_README.md
│       └── testrigor_run2/
│           ├── extracted_images/                # PDF screenshots (13 pages)
│           ├── test_cases.md                    # Generated manual test cases
│           ├── manual_steps.txt                 # Original manual steps
│           ├── ✨ tests/                        # Playwright automation
│           ├── ✨ playwright.config.js
│           ├── ✨ package.json
│           └── ✨ AUTOMATION_README.md
└── AUTOMATION_GUIDE.md                          # This file
```

## Complete Workflow

### Phase 1: Extract Test Cases from PDF (Already Done)

```bash
cd reverse_engineering
python3 run_pipeline.py --run testrigor_run1 --pdf "path/to/pdf"
```

**Outputs:**
- Extracted images
- Manual test cases (Markdown)
- Category classifications
- Test case documentation

### Phase 2: Run Automation Scripts (NEW)

```bash
cd runs/testrigor_run1
npm install
npm test
```

**Outputs:**
- Test execution results
- Screenshots (on failure)
- Videos (on failure)
- HTML test report

## Installation

### Prerequisites

1. **For PDF Extraction:**
   - Python 3.x
   - Dependencies: `pip install -r requirements.txt`

2. **For Automation:**
   - Node.js (v14+)
   - npm or yarn

### Setup Steps

#### 1. Set up Python environment (PDF extraction)
```bash
cd reverse_engineering
pip install -r requirements.txt
```

#### 2. Set up Playwright (Test Run 1)
```bash
cd runs/testrigor_run1
npm install
npm run install:browsers
```

#### 3. Set up Playwright (Test Run 2)
```bash
cd runs/testrigor_run2
npm install
npm run install:browsers
```

## Running the Automation

### Test Run 1 - Complete User Journey

```bash
cd reverse_engineering/runs/testrigor_run1

# Run in headless mode
npm test

# Run with visible browser
npm run test:headed

# Debug mode
npm run test:debug

# Interactive UI mode
npm run test:ui
```

### Test Run 2 - Employee Addition

```bash
cd reverse_engineering/runs/testrigor_run2

# Run in headless mode
npm test

# Run with visible browser
npm run test:headed

# Debug mode
npm run test:debug

# Interactive UI mode
npm run test:ui
```

## Configuration

Each test run has its own `.env` file for configuration:

### Example `.env` file:
```env
BASE_URL=https://opensource-demo.orangehrmlive.com
USERNAME=Admin
PASSWORD=admin123
```

### Using a Different OrangeHRM Instance

Edit the `.env` file in the respective test directory:

```env
BASE_URL=https://your-orangehrm-instance.com
USERNAME=your_username
PASSWORD=your_password
```

## Test Reports

After running tests, view detailed HTML reports:

```bash
npx playwright show-report
```

The report includes:
- Test execution timeline
- Pass/fail status for each test
- Screenshots and videos (for failures)
- Detailed step-by-step execution logs

## Key Features

### 1. Robust Selectors
- Uses multiple selector strategies (getByRole, getByPlaceholder, getByText)
- Fallback selectors for reliability
- Handles dynamic content

### 2. Smart Waits
- Automatic waiting for elements
- Network idle detection
- Configurable timeouts

### 3. Visual Evidence
- Screenshots on failure
- Video recording on failure
- Trace files for debugging

### 4. Flexible Configuration
- Environment-based configuration
- Multiple execution modes (headed, headless, debug, UI)
- Customizable timeouts and retry logic

## Troubleshooting

### Common Issues

#### 1. Tests fail with timeout errors
**Solution:**
- Increase timeout in `playwright.config.js`
- Check network connectivity
- Verify OrangeHRM instance is accessible

```javascript
// In playwright.config.js
timeout: 180000, // Increase to 3 minutes
```

#### 2. Element not found errors
**Solution:**
- Run in debug mode: `npm run test:debug`
- Inspect the page to verify element selectors
- Update selectors if OrangeHRM UI has changed

#### 3. Authentication failures
**Solution:**
- Verify credentials in `.env` file
- Test login manually in a browser
- Check if OrangeHRM instance requires additional setup

#### 4. Browser installation issues
**Solution:**
```bash
# Reinstall browsers
npx playwright install --force chromium
```

## Advanced Usage

### Run Specific Tests

```bash
# Run only login tests
npx playwright test --grep "Login"

# Run tests in a specific file
npx playwright test employee-addition-workflow.spec.js

# Run tests in headed mode for a specific browser
npx playwright test --project=chromium --headed
```

### Generate Code

Playwright can generate test code by recording your actions:

```bash
npx playwright codegen https://opensource-demo.orangehrmlive.com
```

### Update Snapshots

If you add visual regression testing:

```bash
npx playwright test --update-snapshots
```

## Test Coverage

### Testrigor Run 1 Coverage
- ✅ Login & Authentication
- ✅ Admin Module (Search, Reset)
- ✅ Job & Job Titles
- ✅ PIM Module
- ✅ Leave Management
- ✅ Time & Timesheets
- ✅ Recruitment (with keyword search)
- ✅ My Info
- ✅ Performance
- ✅ Directory
- ✅ Buzz (Social Feed with posting)
- ✅ Claim Management
- ✅ Scrolling operations
- ✅ Multiple search operations

### Testrigor Run 2 Coverage
- ✅ Login & Authentication
- ✅ PIM Navigation
- ✅ Add Employee Form
- ✅ Employee Data Entry
- ✅ Form Submission
- ✅ Employee Verification
- ✅ Employee List Access
- ✅ Employee Search
- ✅ Search Results Validation

## Continuous Integration

To run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          cd reverse_engineering/runs/testrigor_run1
          npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium
      - name: Run Playwright tests
        run: npm test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Future Enhancements

Potential improvements:
- [ ] Add visual regression testing
- [ ] Implement API testing for data setup
- [ ] Add performance metrics collection
- [ ] Create reusable page object models
- [ ] Add accessibility testing (a11y)
- [ ] Implement parallel execution across multiple browsers
- [ ] Add screenshot comparison for UI validation
- [ ] Create custom reporters for better insights

## Support

For issues or questions:
1. Check the individual `AUTOMATION_README.md` files in each test run directory
2. Review Playwright documentation: https://playwright.dev
3. Check the main project README
4. Open an issue in the repository

## License

Same as the main project license.

---

**Note:** This automation was automatically generated from the reverse-engineered manual test cases extracted from PDF automation runs. The scripts replicate the exact steps from the manual test documentation.
