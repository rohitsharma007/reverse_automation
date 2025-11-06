# Test Files

## Active Tests

### `complete-user-journey.spec.js` (PRIMARY TEST - POM-based)
**Status**: ✅ **ACTIVE - USE THIS TEST**

This is the **Page Object Model (POM)** based test that uses `OrangeHRMPage.js` for all locators.

**Benefits:**
- All element types pre-identified from screenshots
- Maintainable: change locators in one place (OrangeHRMPage.js)
- No more reactive fixing cycle
- Proactive approach with proper element types

**Run this test:**
```bash
npm test -- tests/complete-user-journey.spec.js
```

**How it works:**
```javascript
const orangeHRM = new OrangeHRMPage(page);
await orangeHRM.login('Admin', 'admin123');
await orangeHRM.clickJob();                    // Knows it's a nav item
await orangeHRM.jobTitlesLink.click();         // Knows it's a menuitem
```

---

## Deprecated Tests

### `complete-user-journey.DEPRECATED.spec.js` (OLD - Reactive Fixes)
**Status**: ❌ **DEPRECATED - DO NOT USE**

This was the old test file that used direct inline selectors. It suffered from:
- Repeated "error → fix → next error" cycle
- Element types not verified upfront
- Required manual error reporting for each failure
- Not maintainable

**This file is kept for reference only.**

---

## Page Object Model

All page objects are in `../pages/`:
- `OrangeHRMPage.js` - Complete Page Object with all OrangeHRM locators

**Element Type Reference:**
| Location | Element Type | Example |
|----------|-------------|---------|
| Sidebar navigation | `link` | Admin, PIM, Leave |
| Top nav dropdowns | `menuitem` | Job Titles, Pay Grades |
| Top nav tabs | Generic clickable | Job, User Management |
| Forms | Various (handled by POM) | Username input, Search button |

---

## Documentation

See `../../PAGE_OBJECT_MODEL_GUIDE.md` for:
- Complete POM usage guide
- Method reference
- Best practices
- Troubleshooting

---

## Why the Switch?

**Before (Deprecated Test):**
- ❌ Element types guessed, not verified
- ❌ Failed on Job Titles (wrong element type)
- ❌ Required 16+ Claude credits for fixes
- ❌ Reactive: fix one → next fails

**After (POM Test):**
- ✅ Element types verified from screenshots
- ✅ All locators in one maintainable place
- ✅ Proactive: identified upfront
- ✅ Change once, benefit everywhere

---

**Last Updated**: 2025-11-06
**Switched to POM**: Based on user feedback about reactive fixing cycle
