# Project Prompt: Reverse‑Engineering Manual Test Case Generator (Dynamic)

This prompt ensures any AI can reproduce the project accurately without confusion. It uses explicit variables, a deterministic run plan, clear decision rules, and an output contract.

## Inputs (replace placeholders)
- `RUN_NAME`: e.g., `testrigor_run3`
- `PDF_PATH`: absolute path to the workflow PDF
- `LOGO_PATH` (optional): path to a logo/header image to filter
- `MANUAL_STEPS_PATH` (optional): path to user‑provided journey steps; if omitted, auto‑derive from `image_context.json`

## Run Plan (deterministic)
1. Create run folder: `runs/<RUN_NAME>` and `runs/<RUN_NAME>/extracted_images`.
2. Extract images and page text from `PDF_PATH` → `runs/<RUN_NAME>/image_context.json`.
3. Derive categories → `runs/<RUN_NAME>/categories.json` from the PDF text.
4. Filter non‑test images (headers/logos) via size threshold and optional logo reference.
5. Generate test cases using page context:
   - Per‑screenshot cases with specific navigation titles/actions/expected.
   - Manual Journey section using `MANUAL_STEPS_PATH` or auto‑derived steps.
6. Emit grouped JSON and consolidated markdown for quick review.

## Commands (parameterized)
- One‑shot pipeline:
  - `python3 run_pipeline.py --run <RUN_NAME> --pdf "<PDF_PATH>"`
- Optional logo filtering:
  - `python3 filter_images.py runs/<RUN_NAME>/extracted_images runs/<RUN_NAME>/image_context.json --ref <LOGO_PATH>`
- Generate test cases with Manual Journey:
  - `python3 generate_test_cases.py runs/<RUN_NAME>/extracted_images runs/<RUN_NAME>/test_cases.md runs/<RUN_NAME>/categories.json runs/<RUN_NAME>/image_context.json --consolidated --journey_steps <MANUAL_STEPS_PATH>`

## Output Contract (must produce)
- `runs/<RUN_NAME>/extracted_images/` — final image set.
- `runs/<RUN_NAME>/image_context.json` — `{file → {page, page_text}}`.
- `runs/<RUN_NAME>/categories.json` — derived flow keywords.
- `runs/<RUN_NAME>/grouped.json` — grouped items with meta.
- `runs/<RUN_NAME>/test_cases.md` — detailed manual cases.
- `runs/<RUN_NAME>/test_cases_consolidated.md` — condensed overview.
- `runs/<RUN_NAME>/manual_steps.txt` — journey steps used.

## Decision Rules (titles, actions, expected)
- Navigation (prefer specific over generic):
  - If text contains `click "TARGET"`:
    - Title: `Open <Target> module/page`.
    - Actions: `Click "TARGET"`.
    - Expected (tailored if known):
      - `admin` → `Admin module opens or navigates to Admin dashboard.`
      - `pim` → `PIM dashboard loads with employee modules visible.`
      - `directory` → `Directory page loads with search/options visible.`
      - `buzz` → `Buzz newsfeed appears without errors.`
      - `what's on your mind?` → `Buzz post editor is focused and ready for input.`
  - If text contains `check that page contains "PHRASE"`:
    - Title: `Verify <phrase> page`.
    - Actions: `Verify page content`.
    - Expected: `Page contains "PHRASE"`.
  - If text contains `scroll up` or `scroll down`:
    - Title: `Scroll up` or `Scroll down`.
    - Expected: `Page header/top section becomes visible.` or `Lower page content becomes visible.`
- Data Input:
  - Actions: `Enter or modify data as shown`, `Save or submit if applicable`.
- Login:
  - Actions: `Open login screen`, `Perform the step shown (fill/tap)`.
  - Expected: `User authenticated and reaches home/dashboard.`
- Feature Access:
  - Actions: `Open the indicated feature`, `Use its core function (search/filter/export)`.
- Logout:
  - Actions: `Open the account/user menu`, `Confirm logout if prompted`.
  - Expected: `User session ends and redirects to login.`

## Case IDs (stable and descriptive)
- Prefix by category: `LOGIN`, `NAV`, `DATA`, `FEATURE`, `LOGOUT`.
- Navigation action token:
  - `click "TARGET"` → `<TARGET>` in upper case; spaces→`_`; quotes removed.
  - `scroll up/down` → `SCROLL_UP` / `SCROLL_DOWN`.
  - `what's on your mind?` → `BUZZ_POST`.
- Append page number from filename: `_P###`.
- Examples: `NAV_PIM_P004`, `NAV_SCROLL_UP_P006`, `DATA_SAVE_P009`.

## Manual Journey Parsing (robust and casing‑preserving)
- Recognized patterns (case‑insensitive; preserves original casing and spacing):
  - `enter "…" into "…"` (allows optional whitespace around `into`).
  - `click "…"`.
  - `check that page contains "…"`.
  - `wait <N> sec`.
  - `scroll up` / `scroll down`.
- Produces `Steps` and `Validation` lists.
- Journey section rendered before per‑screenshot cases.

## False‑Positive Guardrails
- Word‑boundaries on `add/create/new` to avoid substring matches (e.g., `Newcastle` ≠ `New`).

## Auto‑Deriving Manual Steps (when none provided)
- Build `runs/<RUN_NAME>/manual_steps.txt` from `runs/<RUN_NAME>/image_context.json`:
  - Collect lines starting with recognized patterns.
  - Maintain page order.

## Quality Checklist (acceptance criteria)
- Navigation cases use concrete targets when present (no generic `NAV_NAVIGATE` if `click "…"` exists).
- Manual Journey preserves original casing and spacing for field names and values.
- Expected outcomes match target semantics (e.g., `PIM` → dashboard visible).
- Case IDs follow `CATEGORY_ACTION_P###` consistently.

## Quickstart Example
- Create a run:
  - `python3 run_pipeline.py --run testrigor_run2 --pdf "<PDF_PATH>"`
- Auto‑derive journey steps from context:
  - Write to `runs/testrigor_run2/manual_steps.txt`.
- Generate cases with journey:
  - `python3 generate_test_cases.py runs/testrigor_run2/extracted_images runs/testrigor_run2/test_cases.md runs/testrigor_run2/categories.json runs/testrigor_run2/image_context.json --consolidated --journey_steps runs/testrigor_run2/manual_steps.txt`

## Optional Enhancements
- Enable OCR (`pytesseract`) for richer extraction.
- Add `overrides.json` for per‑image title/action/expected tuning.
- Extend expected outcomes for domain‑specific modules.

## Error Handling (be explicit)
- If `PDF_PATH` is missing → abort with usage guidance.
- If images are empty after filtering → warn; continue generation from remaining context.
- If `MANUAL_STEPS_PATH` invalid → auto‑derive steps and log fallback.