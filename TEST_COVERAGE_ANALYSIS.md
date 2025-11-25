# Manual Test Coverage Analysis Report

## Executive Summary

This report evaluates coverage of the generated manual test cases derived from workflow PDFs. It measures how well the manual cases represent the observed journeys, features, and validations across the captured screenshots.

---

## Methodology

- Source: `extracted_images/`, `image_context.json`, `categories.json`
- Output: `test_cases.md`, `test_cases_consolidated.md`, `grouped.json`
- Approach: Bottom‑up mapping of each screenshot to a flow and concrete human‑executable steps and expectations.

---

## Manual Coverage Summary

### Testrigor Run 1 — Complete User Journey

- Total screenshots considered: 21
- Total manual steps generated: 38
- Covered flows: Login, Admin, Job Titles, PIM, Leave, Time, Recruitment, My Info, Performance, Directory, Buzz, Claims, Global search/navigation
- Coverage status: ✅ Representative of the full journey with validations

Key validations included:
- Page presence checks (e.g., Dashboard, System Users)
- Data entry instructions (usernames, searches)
- Navigation steps and expected destinations
- Interaction hints (scrolls, waits when context requires)

### Testrigor Run 2 — Employee Addition Workflow

- Total screenshots considered: 13
- Total manual steps generated: 23
- Covered flows: Login, PIM, Add Employee, Save & Details, Employee List, Search & Verify
- Coverage status: ✅ Representative of employee creation and verification

Key validations included:
- Presence of Personal Details and full name after save
- Employee List access and search result verification
- Navigation continuity across PIM sub‑flows

---

## Gaps & Enhancements

- Add explicit preconditions per flow (e.g., credentials, seed data) for reproducibility
- Replace generic waits with context‑driven reviewer notes (what to expect visually)
- Consolidate sequences into higher‑level cases for stakeholder readability (use `test_cases_consolidated.md`)
- Cross‑link `grouped.json` IDs to screenshots for rapid traceability during reviews

---

## How To Review Coverage

- Open `test_cases.md` beside `extracted_images/` to verify each step corresponds to the screenshot context.
- Use `categories.json` to confirm flows are correctly inferred.
- For stakeholder‑friendly review, use `test_cases_consolidated.md` to walk flows end‑to‑end.

---

## Conclusion

The manual test cases provide comprehensive coverage of the observed workflows captured in the PDFs. They are ready for human execution, review, and iterative refinement without reliance on browser automation.