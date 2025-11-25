# Manual Test Case Generation From PDF Images (No Playwright)

This guide documents the manual-only pipeline to convert workflow PDFs into clear, human‑readable test cases. It intentionally excludes browser automation and focuses on image extraction, context, categorization, and case generation.

## Prerequisites
- Python 3 available as `python3`.
- Install dependencies: `python3 -m pip install -r reverse_engineering/requirements.txt`
- Optional: Tesseract OCR (`brew install tesseract` on macOS) for improved text extraction.

## One‑Shot Pipeline
Run the entire manual pipeline with a single command:

```
cd reverse_engineering
python3 run_pipeline.py --run <RUN_NAME> --pdf "/absolute/path/to/workflow.pdf"
```

Outputs under `reverse_engineering/runs/<RUN_NAME>/`:
- `extracted_images/` — screenshots pulled from the PDF in sequence
- `image_context.json` — image → {page, page_text}
- `categories.json` — flow keywords inferred from the PDF text
- `test_cases.md` — manual test cases per screenshot, grouped by flow
- `grouped.json` — JSON grouping for traceability
- `test_cases_consolidated.md` — consolidated, reviewer‑friendly summary

## Step‑By‑Step (Manual Pipeline)
If you prefer to run each step separately:

1) Extract images + page context
```
cd reverse_engineering
python3 extract_images_from_pdf.py \
  "/absolute/path/to/workflow.pdf" \
  runs/<RUN_NAME>/extracted_images \
  runs/<RUN_NAME>/image_context.json
```

2) Derive categories from PDF text
```
python3 derive_categories_from_pdf.py \
  "/absolute/path/to/workflow.pdf" \
  runs/<RUN_NAME>
```
This writes `runs/<RUN_NAME>/categories.json` and `pdf_text.txt`.

3) Filter headers/logos (keep meaningful steps only)
```
python3 filter_images.py \
  runs/<RUN_NAME>/extracted_images \
  runs/<RUN_NAME>/image_context.json
```
Optional reference image (e.g., a logo to ignore):
```
python3 filter_images.py runs/<RUN_NAME>/extracted_images runs/<RUN_NAME>/image_context.json --ref /path/to/logo.png
```

4) Generate manual test cases
```
python3 generate_test_cases.py \
  runs/<RUN_NAME>/extracted_images \
  runs/<RUN_NAME>/test_cases.md \
  runs/<RUN_NAME>/categories.json \
  runs/<RUN_NAME>/image_context.json \
  --consolidated
```
Key outputs:
- `runs/<RUN_NAME>/test_cases.md` — per‑screenshot manual cases with actions/expected
- `runs/<RUN_NAME>/test_cases_consolidated.md` — compact summary for reviews
- `runs/<RUN_NAME>/grouped.json` — category grouping metadata

## Alternative Input: Images Directory
If your screenshots are already in a folder (not a PDF):
```
python3 run_pipeline.py --run <RUN_NAME> --images "/absolute/path/to/images" [--context "/path/to/image_context.json"]
```
When `--context` is not provided, a minimal placeholder is created.

## Review Workflow
- Compare `test_cases.md` against `extracted_images/` for step alignment.
- Use `categories.json` to confirm flows and transitions.
- Share `test_cases_consolidated.md` for stakeholder review.

## Scope Clarification
This document does not cover Playwright, UI mode, video recording, inspector, or trace viewer. The repository is now manual‑only for test case generation.
