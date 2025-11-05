# Reverse Engineering: Bottom‑Up Manual Test Case Generator

This project converts executed automation screenshots embedded in a PDF into clean manual test cases, bottom‑up (end → beginning):
- Extract images and page text from the PDF.
- Derive categories/keywords from the PDF content.
- Clean out logos/headers from extracted assets.
- Categorize each remaining screenshot into flows and generate manual test cases.

**Flows**: `login`, `navigation`, `data_input`, `feature_access`, `logout`.

## Setup
- Install Python 3 (`python3`).
- Install dependencies:
  - `python3 -m pip install -r requirements.txt`
- Optional OCR (improves categorization):
  - macOS: `brew install tesseract`

## Quick Start (Bottom‑Up)
1) Extract images + page text context from the PDF:
```
python3 extract_images_from_pdf.py "<your-pdf-file>.pdf" output/extracted_images
```
Outputs:
- `output/extracted_images/` — screenshots pulled in sequence from the PDF
- `output/image_context.json` — mapping of image → {page, page_text}

2) Derive categories/keywords directly from your PDF text:
```
python3 derive_categories_from_pdf.py "<your-pdf-file>.pdf"
```
Outputs:
- `output/categories.json` — flow keywords inferred from the PDF
- `output/pdf_text.txt` — extracted raw PDF text (for review)

3) Remove logos/headers from the journey (keeps meaningful steps only):
```
python3 filter_images.py output/extracted_images output/image_context.json
```
Optional reference matching (if you have a logo file to ignore):
```
python3 filter_images.py output/extracted_images output/image_context.json --ref /path/to/logo.png
```

4) Generate manual test cases (bottom‑up, per screenshot):
```
python3 generate_test_cases.py output/extracted_images output/test_cases.md output/categories.json output/image_context.json
```
Outputs:
- `output/test_cases.md` — manual test cases grouped by flow, one per screenshot
- `output/grouped.json` — JSON grouping for traceability

## What’s Inside
- `extract_images_from_pdf.py` — pulls images and page text using PyMuPDF.
- `derive_categories_from_pdf.py` — builds flow keywords from PDF text (pdfminer.six + heuristics).
- `filter_images.py` — removes small header/logo images and updates context.
- `generate_test_cases.py` — categorizes images and produces Markdown test cases.

## Customization
- Edit `output/categories.json` to add/remove flow keywords based on your domain (e.g., add `search`, `payments`, `reports`).
- Adjust logo removal thresholds in `filter_images.py` if headers differ (default removes images ≤ 220×60).
- Enable OCR by installing Tesseract; filenames + page text are used when OCR is unavailable.

## Example Output (snippet)
```
## Login Flow
Objective: Validate login steps derived from screenshots.
Preconditions: User has access to the app.
- Test Case ID: `LOGIN-1`
  - Screenshot: `page-005-img-01.png`
  - Step: Enter username/email
  - Actions:
    - Open the app and navigate to login screen
    - Perform the step indicated (e.g., fill field, tap button)
  - Expected: Login step behaves correctly and user authenticates.
```

## Troubleshooting
- `python: command not found` → Use `python3`.
- OCR not working → Install Tesseract, then `python3 -m pip install -r requirements.txt`.
- No images extracted → Ensure the PDF contains embedded images; some PDFs render pages without embedded raster images.
- Misclassification → Edit `output/categories.json` and regenerate.

## Next: Consolidated Journeys (optional)
If you prefer a single test case per flow with numbered steps, I can add an option to consolidate sequential screenshots into one “Login Flow” / “Navigation Flow” case for easier review.