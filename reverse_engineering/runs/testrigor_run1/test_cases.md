## Manual Journey (Provided)

Objective: Validate end-to-end flow using the provided manual steps.

Preconditions: User has valid credentials and access to the environment.

Steps:
- [1] Enter "Admin" into "Username"
- [2] Enter "*****" into "Password"
- [3] Click "Login"
- [4] Click "Admin"
- [5] Enter "Admin" into "Username"
- [6] Click "Search"
- [7] Click "Reset"
- [8] Click "Job"
- [9] Click "Job Titles"
- [10] Click "PIM"
- [11] Scroll down
- [12] Click "Leave"
- [13] Click "Time"
- [14] Click "Recruitment"
- [15] Enter "developer" into "Keywords"
- [16] Click "My Info"
- [17] Wait 2 seconds
- [18] Click "Performance"
- [19] Click "Directory"
- [20] Click "Buzz"
- [21] Click "What's on your mind?"
- [22] Enter "This is a test post for exploratory testing" into "What's on your mind?"
- [23] Click "Claim"
- [24] Click "Search"
- [25] Scroll up
- [26] Click "Search"

Validation:
- Page contains "Dashboard"
- Page contains "System Users"
- Page contains "Job Titles"
- Page contains "Employee Information"
- Page contains "Leave List"
- Page contains "Timesheets Pending Action"
- Page contains "Candidates"
- Page contains "Personal Details"
- Page contains "Employee Reviews"
- Page contains "Directory"
- Page contains "Buzz Newsfeed"
- Page contains "Employee Claims"

# Reverse-Engineered Manual Test Cases

Source images: `runs/testrigor_run1/extracted_images`


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

- Test Case ID: `LOGIN_SEARCH_P004`
  - Screenshot: `page-004-img-01.png`
  - Step: Search items
  - Actions:
    - Type query into Search
    - Click Search
  - Expected: Matching results appear in the list.

Screenshots in this category:
- `page-002-img-01.png` — matched keywords: {'login': 4, 'data_input': 1}
- `page-004-img-01.png` — matched keywords: {'login': 2, 'data_input': 1, 'feature_access': 1}

## Navigation Flow

Objective: Validate navigation steps derived from screenshots.

Preconditions: User has access to the app and relevant environment configured.

- Test Case ID: `NAV_ADMIN_P003`
  - Screenshot: `page-003-img-01.png`
  - Step: Open Admin module/page
  - Actions:
    - Click "admin"
  - Expected: Page contains "dashboard" and Admin module opens or navigates to Admin dashboard

- Test Case ID: `NAV_RESET_P005`
  - Screenshot: `page-005-img-01.png`
  - Step: Reset form fields
  - Actions:
    - Click Reset/Clear
  - Expected: Form fields clear to default/empty values.

- Test Case ID: `NAV_JOB_P006`
  - Screenshot: `page-006-img-01.png`
  - Step: Open Job module/page
  - Actions:
    - Click "job"
  - Expected: Job section opens and job-related pages are accessible.

- Test Case ID: `NAV_JOB_TITLES_P007`
  - Screenshot: `page-007-img-01.png`
  - Step: Open Job Titles module/page
  - Actions:
    - Click "job titles"
  - Expected: Job Titles page loads and lists available titles.

- Test Case ID: `NAV_PIM_P008`
  - Screenshot: `page-008-img-01.png`
  - Step: Open Pim module/page
  - Actions:
    - Click "pim"
  - Expected: Page contains "job titles" and PIM dashboard loads with employee modules visible

- Test Case ID: `NAV_SCROLL_DOWN_P009`
  - Screenshot: `page-009-img-01.png`
  - Step: Scroll down
  - Actions:
    - Scroll down
  - Expected: Lower page content becomes visible.

- Test Case ID: `NAV_LEAVE_P010`
  - Screenshot: `page-010-img-01.png`
  - Step: Open Leave module/page
  - Actions:
    - Click "leave"
  - Expected: Leave module opens showing leave-related pages.

- Test Case ID: `NAV_TIME_P011`
  - Screenshot: `page-011-img-01.png`
  - Step: Open Time module/page
  - Actions:
    - Click "time"
  - Expected: Page contains "leave list" and Time module opens (timesheets/attendance visible)

- Test Case ID: `NAV_RECRUITMENT_P012`
  - Screenshot: `page-012-img-01.png`
  - Step: Open Recruitment module/page
  - Actions:
    - Click "recruitment"
  - Expected: Page contains "timesheets pending action" and Recruitment module opens (Candidates/Jobs visible)

- Test Case ID: `NAV_DIRECTORY_P015`
  - Screenshot: `page-015-img-01.png`
  - Step: Open Directory module/page
  - Actions:
    - Click "directory"
  - Expected: Page contains "employee reviews" and Directory page loads with search/options visible

- Test Case ID: `NAV_BUZZ_P016`
  - Screenshot: `page-016-img-01.png`
  - Step: Open Buzz module/page
  - Actions:
    - Click "buzz"
  - Expected: Page contains "directory" and Buzz newsfeed appears without errors

- Test Case ID: `NAV_BUZZ_POST_P017`
  - Screenshot: `page-017-img-01.png`
  - Step: Start Buzz post
  - Actions:
    - Click "what's on your mind?"
  - Expected: Page contains "buzz newsfeed" and Buzz post editor is focused and ready for input

- Test Case ID: `NAV_SCROLL_UP_P020`
  - Screenshot: `page-020-img-01.png`
  - Step: Scroll up
  - Actions:
    - Scroll up
  - Expected: Page header/top section becomes visible.

Screenshots in this category:
- `page-003-img-01.png` — matched keywords: {'navigation': 1}
- `page-005-img-01.png` — no keywords matched, defaulting to navigation
- `page-006-img-01.png` — no keywords matched, defaulting to navigation
- `page-007-img-01.png` — no keywords matched, defaulting to navigation
- `page-008-img-01.png` — no keywords matched, defaulting to navigation
- `page-009-img-01.png` — no keywords matched, defaulting to navigation
- `page-010-img-01.png` — no keywords matched, defaulting to navigation
- `page-011-img-01.png` — no keywords matched, defaulting to navigation
- `page-012-img-01.png` — no keywords matched, defaulting to navigation
- `page-015-img-01.png` — no keywords matched, defaulting to navigation
- `page-016-img-01.png` — no keywords matched, defaulting to navigation
- `page-017-img-01.png` — no keywords matched, defaulting to navigation
- `page-020-img-01.png` — no keywords matched, defaulting to navigation

## Data_Input Flow

Objective: Validate data input steps derived from screenshots.

Preconditions: User has access to the app and relevant environment configured.

- Test Case ID: `DATA_STEP_P013`
  - Screenshot: `page-013-img-01.png`
  - Step: Enter or modify data
  - Actions:
    - Enter or modify data as shown
    - Save or submit if applicable
  - Expected: Data is accepted and stored/processed accordingly.

- Test Case ID: `DATA_STEP_P018`
  - Screenshot: `page-018-img-01.png`
  - Step: Enter or modify data
  - Actions:
    - Enter or modify data as shown
    - Save or submit if applicable
  - Expected: Data is accepted and stored/processed accordingly.

Screenshots in this category:
- `page-013-img-01.png` — matched keywords: {'data_input': 1}
- `page-018-img-01.png` — matched keywords: {'data_input': 1}

## Feature_Access Flow

Objective: Validate feature access steps derived from screenshots.

Preconditions: User has access to the app and relevant environment configured.

- Test Case ID: `FEATURE_STEP_P014`
  - Screenshot: `page-014-img-01.png`
  - Step: Open indicated feature
  - Actions:
    - Open the indicated feature
    - Use its core function (search/filter/export)
  - Expected: Feature opens and key functions operate as expected.

- Test Case ID: `FEATURE_SEARCH_P019`
  - Screenshot: `page-019-img-01.png`
  - Step: Search items
  - Actions:
    - Type query into Search
    - Click Search
  - Expected: Matching results appear in the list.

- Test Case ID: `FEATURE_SEARCH_P021`
  - Screenshot: `page-021-img-01.png`
  - Step: Search items
  - Actions:
    - Type query into Search
    - Click Search
  - Expected: Matching results appear in the list.

- Test Case ID: `FEATURE_SEARCH_P021`
  - Screenshot: `page-021-img-02.png`
  - Step: Search items
  - Actions:
    - Type query into Search
    - Click Search
  - Expected: Matching results appear in the list.

Screenshots in this category:
- `page-014-img-01.png` — matched keywords: {'feature_access': 1}
- `page-019-img-01.png` — matched keywords: {'feature_access': 1}
- `page-021-img-01.png` — matched keywords: {'feature_access': 1}
- `page-021-img-02.png` — matched keywords: {'feature_access': 1}
