## Manual Journey (Provided)

Objective: Validate end-to-end flow using the provided manual steps.

Preconditions: User has valid credentials and access to the environment.

Steps:
- [1] Enter "Admin" into "Username"
- [2] Click "Login"
- [3] Scroll down
- [4] Click "PIM"
- [5] Scroll down
- [6] Scroll up
- [7] Click "Add Employee"
- [8] Enter "John" into "First Name"
- [9] Enter "Michael" into "Middle Name"
- [10] Enter "Smith" into "Last Name"
- [11] Scroll down
- [12] Click "Save"
- [13] Wait 3 seconds
- [14] Scroll up
- [15] Click "Employee List"
- [16] Enter "John" into "Employee Name"
- [17] Click "Search"

Validation:
- Page contains "John Smith"
- Page contains "Personal Details"
- Page contains "Employee Full Name"
- Page contains "John Michael"
- Page contains "Smith"

# Reverse-Engineered Manual Test Cases

Source images: `runs/testrigor_run2/extracted_images`


## Login Flow

Objective: Validate login steps derived from screenshots.

Preconditions: User has access to the app and relevant environment configured.

- Test Case ID: `LOGIN_LOGIN_P002`
  - Screenshot: `page-002-img-01.png`
  - Step: Enter credentials and Log In
  - Actions:
    - Enter username/email
    - Enter password/OTP
    - Click Log In
  - Expected: User authenticated and reaches home/dashboard.

Screenshots in this category:
- `page-002-img-01.png` — matched keywords: {'login': 3, 'data_input': 1}

## Navigation Flow

Objective: Validate navigation steps derived from screenshots.

Preconditions: User has access to the app and relevant environment configured.

- Test Case ID: `NAV_SCROLL_DOWN_P003`
  - Screenshot: `page-003-img-01.png`
  - Step: Scroll down
  - Actions:
    - Scroll down
  - Expected: Lower page content becomes visible.

- Test Case ID: `NAV_PIM_P004`
  - Screenshot: `page-004-img-01.png`
  - Step: Open Pim module/page
  - Actions:
    - Click "pim"
  - Expected: PIM dashboard loads with employee modules visible.

- Test Case ID: `NAV_SCROLL_DOWN_P005`
  - Screenshot: `page-005-img-01.png`
  - Step: Scroll down
  - Actions:
    - Scroll down
  - Expected: Lower page content becomes visible.

- Test Case ID: `NAV_SCROLL_UP_P006`
  - Screenshot: `page-006-img-01.png`
  - Step: Scroll up
  - Actions:
    - Scroll up
  - Expected: Page header/top section becomes visible.

- Test Case ID: `NAV_ADD_EMPLOYEE_P007`
  - Screenshot: `page-007-img-01.png`
  - Step: Open Add Employee module/page
  - Actions:
    - Click Add/New
  - Expected: New item flow starts.

- Test Case ID: `NAV_SCROLL_UP_P010`
  - Screenshot: `page-010-img-01.png`
  - Step: Scroll up
  - Actions:
    - Scroll up
  - Expected: Page header/top section becomes visible.

- Test Case ID: `NAV_NAVIGATE_P013`
  - Screenshot: `page-013-img-01.png`
  - Step: Verify john michael page
  - Actions:
    - Verify page content
  - Expected: Page contains "john michael"

Screenshots in this category:
- `page-003-img-01.png` — no keywords matched, defaulting to navigation
- `page-004-img-01.png` — no keywords matched, defaulting to navigation
- `page-005-img-01.png` — no keywords matched, defaulting to navigation
- `page-006-img-01.png` — no keywords matched, defaulting to navigation
- `page-007-img-01.png` — no keywords matched, defaulting to navigation
- `page-010-img-01.png` — no keywords matched, defaulting to navigation
- `page-013-img-01.png` — no keywords matched, defaulting to navigation

## Data_Input Flow

Objective: Validate data input steps derived from screenshots.

Preconditions: User has access to the app and relevant environment configured.

- Test Case ID: `DATA_STEP_P008`
  - Screenshot: `page-008-img-01.png`
  - Step: Enter or modify data
  - Actions:
    - Enter or modify data as shown
    - Save or submit if applicable
  - Expected: Data is accepted and stored/processed accordingly.

- Test Case ID: `DATA_SAVE_P009`
  - Screenshot: `page-009-img-01.png`
  - Step: Submit/Save data
  - Actions:
    - Click Submit/Save
  - Expected: Data submitted/saved successfully.

- Test Case ID: `DATA_SEARCH_P012`
  - Screenshot: `page-012-img-01.png`
  - Step: Search items
  - Actions:
    - Type query into Search
    - Click Search
  - Expected: Matching results appear in the list.

Screenshots in this category:
- `page-008-img-01.png` — matched keywords: {'data_input': 1}
- `page-009-img-01.png` — matched keywords: {'data_input': 1}
- `page-012-img-01.png` — matched keywords: {'data_input': 1, 'feature_access': 1}

## Feature_Access Flow

Objective: Validate feature access steps derived from screenshots.

Preconditions: User has access to the app and relevant environment configured.

- Test Case ID: `FEATURE_STEP_P011`
  - Screenshot: `page-011-img-01.png`
  - Step: Open indicated feature
  - Actions:
    - Open the indicated feature
    - Use its core function (search/filter/export)
  - Expected: Feature opens and key functions operate as expected.

Screenshots in this category:
- `page-011-img-01.png` — matched keywords: {'feature_access': 1}
