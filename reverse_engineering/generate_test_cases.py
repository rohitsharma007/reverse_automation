import os
import sys
import json
from collections import defaultdict

try:
    from PIL import Image
    import pytesseract
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False

DEFAULT_CATEGORIES = {
    "login": ["login", "sign in", "signin", "username", "email", "password", "otp", "forgot"],
    "navigation": ["home", "dashboard", "menu", "next", "back", "profile", "tab", "navbar", "continue"],
    "data_input": ["enter", "type", "form", "field", "input", "add", "edit", "upload", "save", "submit", "reset", "clear"],
    "feature_access": ["settings", "reports", "analytics", "search", "filter", "export", "import", "details"],
    "logout": ["logout", "sign out", "signout", "log out", "exit"],
}

def load_categories(categories_path: str = None):
    path = categories_path or os.path.join("output", "categories.json")
    if path and os.path.isfile(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                # ensure keys exist and values are lists of strings
                cleaned = {}
                for k in DEFAULT_CATEGORIES.keys():
                    v = data.get(k, [])
                    if not isinstance(v, list):
                        v = []
                    cleaned[k] = [str(x).lower() for x in v]
                return cleaned
        except Exception:
            pass
    return DEFAULT_CATEGORIES

def ocr_text(img_path: str) -> str:
    """Extract text from image using Tesseract if available; else return empty."""
    if not OCR_AVAILABLE:
        return ""
    try:
        img = Image.open(img_path)
        text = pytesseract.image_to_string(img)
        return text.lower()
    except Exception:
        return ""

def categorize(text: str, filename: str, categories: dict):
    """Categorize an image using simple keyword scoring across OCR text and filename."""
    scores = {cat: 0 for cat in categories}
    t = (text or "").lower()
    name = (filename or "").lower()

    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in t:
                scores[cat] += 1
            if kw in name:
                scores[cat] += 1

    best = max(scores, key=lambda c: scores[c])
    if all(v == 0 for v in scores.values()):
        return "navigation", {"reason": "no keywords matched, defaulting to navigation"}

    matched = {cat: v for cat, v in scores.items() if v > 0}
    return best, {"reason": f"matched keywords: {matched}"}

def load_image_context(context_path: str = None):
    path = context_path or os.path.join("output", "image_context.json")
    if os.path.isfile(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def group_images(images_dir: str, categories: dict, context_map: dict = None):
    files = [f for f in os.listdir(images_dir) if f.lower().endswith((".png", ".jpg", ".jpeg"))]
    files.sort()  # assume filename order approximates step order
    grouped = defaultdict(list)
    for f in files:
        path = os.path.join(images_dir, f)
        text = ocr_text(path)
        if not text and context_map:
            ctx = context_map.get(f)
            if ctx and isinstance(ctx, dict):
                text = (ctx.get("page_text") or "").lower()
        cat, meta = categorize(text, f, categories)
        grouped[cat].append({"file": f, "path": path, "text": text, "meta": meta})
    return grouped

# Step-title helpers keep it simple but a bit contextual.
def step_title_login(text: str, idx: int) -> str:
    t = text or ""
    if "username" in t or "email" in t:
        return "Enter username/email"
    if "password" in t:
        return "Enter password"
    if "otp" in t:
        return "Enter OTP"
    if "login" in t or "sign in" in t or "signin" in t:
        return "Tap Login/Sign In"
    return f"Login step {idx + 1}"

def step_title_navigation(text: str, idx: int) -> str:
    t = text or ""
    if "menu" in t or "navbar" in t or "tab" in t:
        return "Use navigation menu/tab"
    if "next" in t or "continue" in t:
        return "Navigate to next screen"
    if "back" in t:
        return "Navigate back"
    if "home" in t or "dashboard" in t:
        return "Open Home/Dashboard"
    return f"Navigation step {idx + 1}"

def step_title_data_input(text: str, idx: int) -> str:
    t = text or ""
    if "form" in t or "field" in t or "input" in t:
        return "Fill in form fields"
    if "reset" in t or "clear" in t:
        return "Reset form fields"
    if "upload" in t:
        return "Upload file/data"
    if "save" in t or "submit" in t:
        return "Submit/Save the data"
    return f"Data input step {idx + 1}"

def step_title_feature_access(text: str, idx: int) -> str:
    t = text or ""
    if "settings" in t:
        return "Open Settings"
    if "reports" in t or "analytics" in t:
        return "Access Reports/Analytics"
    if "search" in t or "filter" in t:
        return "Search/Filter within feature"
    return f"Feature access step {idx + 1}"

def step_title_logout(text: str, idx: int) -> str:
    t = text or ""
    if "logout" in t or "sign out" in t or "log out" in t or "signout" in t:
        return "Tap Logout/Sign Out"
    return f"Logout step {idx + 1}"

STEP_TITLE_MAP = {
    "login": step_title_login,
    "navigation": step_title_navigation,
    "data_input": step_title_data_input,
    "feature_access": step_title_feature_access,
    "logout": step_title_logout,
}

def infer_actions_expected(text: str, category: str):
    """Infer concrete actions and expected outcome from page-level text and category.
    Falls back to category-specific generic actions when no keywords found.
    """
    t = (text or "").lower()
    actions = []
    expected = None

    def contains_any(words):
        return any(w in t for w in words)

    if contains_any(["reset", "clear"]):
        actions.append("Click Reset/Clear")
        expected = "Form fields clear to default/empty values."
    elif contains_any(["submit", "save", "save changes"]):
        actions.append("Click Submit/Save")
        expected = "Data submitted/saved successfully."
    elif "search" in t:
        actions.append("Type query into Search")
        actions.append("Click Search")
        expected = "Matching results appear in the list."
    elif "filter" in t:
        actions.append("Set filter criteria")
        actions.append("Apply filter")
        expected = "List updates according to filter criteria."
    elif contains_any(["login", "sign in", "signin"]):
        actions.append("Enter username/email")
        actions.append("Enter password/OTP")
        actions.append("Click Log In")
        expected = "User authenticated and reaches home/dashboard."
    elif contains_any(["logout", "sign out", "log out", "signout"]):
        actions.append("Click Logout/Sign Out")
        expected = "Session ends; redirected to login."
    elif contains_any(["next", "continue"]):
        actions.append("Click Next/Continue")
        expected = "Navigates to the next screen."
    elif "back" in t:
        actions.append("Click Back")
        expected = "Returns to the previous screen."
    elif __import__("re").search(r"\b(add|create|new)\b", t):
        actions.append("Click Add/New")
        expected = "New item flow starts."
    elif contains_any(["edit", "update"]):
        actions.append("Click Edit/Update")
        expected = "Edit form opens."
    elif contains_any(["delete", "remove"]):
        actions.append("Click Delete/Remove and confirm")
        expected = "Item is deleted."
    elif "upload" in t:
        actions.append("Choose file to upload")
        actions.append("Click Upload")
        expected = "File uploads successfully."
    else:
        # Fallbacks by category
        if category == "login":
            actions = ["Open login screen", "Perform the step shown (fill/tap)"]
            expected = "Login step behaves correctly; user can authenticate."
        elif category == "navigation":
            import re
            # Infer target from click/check lines to create specific navigation steps
            click_m = re.search(r"click\s+\"([^\"]+)\"", text or "", flags=re.IGNORECASE)
            check_m = re.search(r"check\s+that\s+page\s+contains\s+\"([^\"]+)\"", text or "", flags=re.IGNORECASE)

            target = click_m.group(1) if click_m else None
            check_phrase = check_m.group(1) if check_m else None

            def expected_for_target(trg: str):
                trg_l = (trg or "").lower()
                if not trg:
                    return "Intended page loads; header and key elements are visible; no errors."
                if trg_l == "admin":
                    return "Admin module opens or navigates to Admin dashboard."
                if trg_l == "job":
                    return "Job section opens and job-related pages are accessible."
                if trg_l in ("job titles", "job title"):
                    return "Job Titles page loads and lists available titles."
                if trg_l == "pim":
                    return "PIM dashboard loads with employee modules visible."
                if trg_l == "leave":
                    return "Leave module opens showing leave-related pages."
                if trg_l == "time":
                    return "Time module opens (timesheets/attendance visible)."
                if trg_l == "recruitment":
                    return "Recruitment module opens (Candidates/Jobs visible)."
                if trg_l == "directory":
                    return "Directory page loads with search/options visible."
                if trg_l == "buzz":
                    return "Buzz newsfeed appears without errors."
                if trg_l in ("what's on your mind?", "whats on your mind?"):
                    return "Buzz post editor is focused and ready for input."
                return "Target page opens and primary elements are visible."

            # Scroll-specific navigation
            if re.search(r"scroll\s+up", text or "", flags=re.IGNORECASE):
                actions = ["Scroll up"]
                expected = "Page header/top section becomes visible."
            elif re.search(r"scroll\s+down", text or "", flags=re.IGNORECASE):
                actions = ["Scroll down"]
                expected = "Lower page content becomes visible."
            elif target:
                actions = [f"Click \"{target}\""]
                expected = expected_for_target(target)
                if check_phrase:
                    expected = f"Page contains \"{check_phrase}\" and {expected.rstrip('.')}"
            elif check_phrase:
                actions = ["Verify page content"]
                expected = f"Page contains \"{check_phrase}\""
            else:
                actions = [
                    "Open navigation menu/toolbar",
                    "Select target page or click Next/Continue",
                ]
                expected = "Intended page loads; header and key elements are visible; no errors."
        elif category == "data_input":
            actions = ["Enter or modify data as shown", "Save or submit if applicable"]
            expected = "Data is accepted and stored/processed accordingly."
        elif category == "feature_access":
            actions = ["Open the indicated feature", "Use its core function (search/filter/export)"]
            expected = "Feature opens and key functions operate as expected."
        elif category == "logout":
            actions = ["Open the account/user menu if needed", "Confirm logout if prompted"]
            expected = "User session ends and redirects to login."
        else:
            actions = ["Follow the UI cues in the screenshot"]
            expected = "UI responds and proceeds to the next step."

    return actions, expected

def friendly_step_title(text: str, category: str, idx: int) -> str:
    """Derive a human-friendly step title primarily from inferred action keywords.
    Falls back to category-specific step title if no clear action is detected.
    """
    t = (text or "").lower()

    if "reset" in t or "clear" in t:
        return "Reset form fields"
    if "submit" in t or "save" in t or "save changes" in t:
        return "Submit/Save data"
    if "search" in t:
        return "Search items"
    if "filter" in t:
        return "Apply filter"
    if "next" in t or "continue" in t:
        return "Navigate to next screen"
    if "back" in t:
        return "Navigate back"
    if "upload" in t:
        return "Upload file/data"
    if "edit" in t or "update" in t:
        return "Edit item"
    if "delete" in t or "remove" in t:
        return "Delete item"
    if "settings" in t:
        return "Open Settings"
    if "reports" in t or "analytics" in t:
        return "Open Reports/Analytics"
    if "logout" in t or "sign out" in t or "log out" in t or "signout" in t:
        return "Logout/Sign Out"
    if "login" in t or "sign in" in t or "signin" in t:
        return "Enter credentials and Log In"

    # Fallbacks by category for clearer manual naming
    if category == "navigation":
        import re
        click_m = re.search(r"click\s+\"([^\"]+)\"", text or "", flags=re.IGNORECASE)
        check_m = re.search(r"check\s+that\s+page\s+contains\s+\"([^\"]+)\"", text or "", flags=re.IGNORECASE)
        if re.search(r"scroll\s+up", text or "", flags=re.IGNORECASE):
            return "Scroll up"
        if re.search(r"scroll\s+down", text or "", flags=re.IGNORECASE):
            return "Scroll down"
        if click_m:
            target = click_m.group(1).strip()
            norm = target.title()
            if norm.lower() in ["what's on your mind?", "whats on your mind?"]:
                return "Start Buzz post"
            return f"Open {norm} module/page"
        if check_m:
            phrase = check_m.group(1).strip()
            return f"Verify {phrase} page"
        return "Navigate to target page"
    if category == "data_input":
        return "Enter or modify data"
    if category == "feature_access":
        return "Open indicated feature"
    if category == "logout":
        return "Logout/Sign Out"
    if category == "login":
        return "Enter credentials and Log In"

    # Default generic fallback
    step_title_fn = STEP_TITLE_MAP.get(category, lambda _t, i: f"Step {i + 1}")
    return step_title_fn(t, idx)

def build_case_id(category: str, filename: str, text: str, idx: int) -> str:
    """Create a technical, descriptive case ID using category + inferred action + page index.
    Ensures uniqueness by including the page number when available.
    """
    t = (text or "").lower()
    base = {
        "login": "LOGIN",
        "navigation": "NAV",
        "data_input": "DATA",
        "feature_access": "FEATURE",
        "logout": "LOGOUT",
    }.get(category, category.upper())

    action = "STEP"
    if "reset" in t or "clear" in t:
        action = "RESET"
    elif "submit" in t:
        action = "SUBMIT"
    elif "save" in t:
        action = "SAVE"
    elif "search" in t:
        action = "SEARCH"
    elif "filter" in t:
        action = "FILTER"
    elif "next" in t or "continue" in t:
        action = "NEXT"
    elif "back" in t:
        action = "BACK"
    elif "upload" in t:
        action = "UPLOAD"
    elif "edit" in t or "update" in t:
        action = "EDIT"
    elif "delete" in t or "remove" in t:
        action = "DELETE"
    elif "settings" in t:
        action = "SETTINGS"
    elif "reports" in t or "analytics" in t:
        action = "REPORTS"
    elif "logout" in t or "sign out" in t or "log out" in t or "signout" in t:
        action = "LOGOUT"
    elif "login" in t or "sign in" in t or "signin" in t:
        action = "LOGIN"
    else:
        # Category-aware fallback action for better technical naming
        if category == "navigation":
            import re
            click_m = re.search(r"click\s+\"([^\"]+)\"", text or "", flags=re.IGNORECASE)
            if click_m:
                target = click_m.group(1).strip()
                action = target.upper().replace(" ", "_").replace("'", "")
                if action in ["WHAT'S_ON_YOUR_MIND?", "WHATS_ON_YOUR_MIND?"]:
                    action = "BUZZ_POST"
            elif re.search(r"scroll\s+up", text or "", flags=re.IGNORECASE):
                action = "SCROLL_UP"
            elif re.search(r"scroll\s+down", text or "", flags=re.IGNORECASE):
                action = "SCROLL_DOWN"
            else:
                action = "NAVIGATE"

    # Extract page number from filename like 'page-005-img-01.png'
    page_part = ""
    try:
        name = (filename or "").lower()
        if "page-" in name:
            start = name.index("page-") + len("page-")
            page_part = name[start:start+3]
    except Exception:
        page_part = ""

    if page_part and page_part.isdigit():
        return f"{base}_{action}_P{page_part}"
    else:
        return f"{base}_{action}_{idx + 1}"

def render_markdown(grouped, images_dir: str) -> str:
    lines = []
    lines.append(f"# Reverse-Engineered Manual Test Cases\n")
    lines.append(f"Source images: `{images_dir}`\n")

    for category in ["login", "navigation", "data_input", "feature_access", "logout"]:
        items = grouped.get(category, [])
        if not items:
            continue

        lines.append(f"\n## {category.title()} Flow\n")
        lines.append(f"Objective: Validate {category.replace('_', ' ')} steps derived from screenshots.\n")
        lines.append("Preconditions: User has access to the app and relevant environment configured.\n")

        # Generate a test case per image step with action-inferred titles and IDs
        for idx, item in enumerate(items):
            title = friendly_step_title(item.get("text", ""), category, idx)
            case_id = build_case_id(category, item.get("file", ""), item.get("text", ""), idx)

            lines.append(f"- Test Case ID: `{case_id}`")
            lines.append(f"  - Screenshot: `{item['file']}`")
            lines.append(f"  - Step: {title}")
            lines.append("  - Actions:")
            actions, expected = infer_actions_expected(item.get("text", ""), category)
            for a in actions:
                lines.append(f"    - {a}")
            lines.append(f"  - Expected: {expected}\n")

        # Quick summary of items
        lines.append("Screenshots in this category:")
        for item in items:
            reason = item["meta"]["reason"]
            lines.append(f"- `{item['file']}` — {reason}")

    return "\n".join(lines) + "\n"

def render_consolidated_markdown(grouped, images_dir: str) -> str:
    lines = []
    lines.append(f"# Consolidated Journeys\n")
    lines.append(f"Source images: `{images_dir}`\n")

    for category in ["login", "navigation", "data_input", "feature_access", "logout"]:
        items = grouped.get(category, [])
        if not items:
            continue

        lines.append(f"\n## {category.title()} Journey\n")
        lines.append(f"Objective: Validate {category.replace('_', ' ')} flow using extracted screenshots.\n")
        lines.append("Preconditions: User has access to the app and required environment.\n")
        lines.append("Steps:")

        for idx, item in enumerate(items):
            step_title_fn = STEP_TITLE_MAP.get(category, lambda _t, i: f"Step {i + 1}")
            title = step_title_fn(item.get("text", ""), idx)
            lines.append(f"- [{idx + 1}] {title} (`{item['file']}`)")

        lines.append("\nValidation:")
        if category == "login":
            lines.append("- User can authenticate successfully and reaches a logged-in state.")
        elif category == "navigation":
            lines.append("- Navigation leads to intended screens without errors.")
        elif category == "data_input":
            lines.append("- Data entry is accepted and persisted/processed correctly.")
        elif category == "feature_access":
            lines.append("- Feature opens and core operations function as expected.")
        elif category == "logout":
            lines.append("- Session ends and user is redirected to non-authenticated state.")
        else:
            lines.append("- UI responds appropriately and proceeds to the next step.")

    return "\n".join(lines) + "\n"

def parse_manual_steps(raw_lines):
    """Parse user-provided manual steps into actions and validations.
    Recognizes common patterns like enter/click/check/wait/scroll.
    """
    import re
    actions = []
    validations = []

    for line in raw_lines:
        if not line:
            continue
        s = line.strip()
        if not s:
            continue
        l = s.lower()

        # check validations
        m = re.match(r"^check that page contains\s+\"(.+?)\"", s, flags=re.IGNORECASE)
        if m:
            validations.append(f"Page contains \"{m.group(1)}\"")
            continue

        # enter into field
        m2 = re.match(r"^enter\s+\"(.+?)\"\s+into\s*\"(.+?)\"", s, flags=re.IGNORECASE)
        if m2:
            actions.append(f"Enter \"{m2.group(1)}\" into \"{m2.group(2)}\"")
            continue

        # click target
        m3 = re.match(r"^click\s+\"(.+?)\"", s, flags=re.IGNORECASE)
        if m3:
            actions.append(f"Click \"{m3.group(1)}\"")
            continue

        # wait seconds
        m4 = re.match(r"^wait\s+(\d+)\s*sec", s, flags=re.IGNORECASE)
        if m4:
            actions.append(f"Wait {m4.group(1)} seconds")
            continue

        # scroll
        if re.match(r"^scroll\s+down", s, flags=re.IGNORECASE):
            actions.append("Scroll down")
            continue
        if re.match(r"^scroll\s+up", s, flags=re.IGNORECASE):
            actions.append("Scroll up")
            continue

        # fallback: keep as an action
        actions.append(s)

    return actions, validations

def render_manual_journey_section(steps_path: str) -> str:
    """Render a Manual Journey section from a provided steps file."""
    if not steps_path or not os.path.isfile(steps_path):
        return ""
    with open(steps_path, "r", encoding="utf-8") as sf:
        raw = [ln.rstrip("\n") for ln in sf.readlines()]
    actions, validations = parse_manual_steps(raw)

    lines = []
    lines.append("## Manual Journey (Provided)\n")
    lines.append("Objective: Validate end-to-end flow using the provided manual steps.\n")
    lines.append("Preconditions: User has valid credentials and access to the environment.\n")
    lines.append("Steps:")
    for i, a in enumerate(actions, start=1):
        lines.append(f"- [{i}] {a}")
    if validations:
        lines.append("\nValidation:")
        for v in validations:
            lines.append(f"- {v}")
    return "\n".join(lines) + "\n"

def main():
    images_dir = "images"
    out_path = os.path.join("output", "test_cases.md")
    categories_path = None
    image_context_path = None
    consolidated = False
    journey_steps_path = None

    # Allow optional CLI args: images_dir and out_path
    if len(sys.argv) >= 2:
        images_dir = sys.argv[1]
    if len(sys.argv) >= 3:
        out_path = sys.argv[2]
    if len(sys.argv) >= 4:
        categories_path = sys.argv[3]
    if len(sys.argv) >= 5:
        image_context_path = sys.argv[4]
    # simple flag parsing for consolidated output
    if any(arg == "--consolidated" for arg in sys.argv[1:]):
        consolidated = True
    # parse manual journey steps flag
    for i, arg in enumerate(sys.argv[1:], start=1):
        if arg == "--journey_steps" and len(sys.argv) > i+1:
            journey_steps_path = sys.argv[i+1]

    if not os.path.isdir(images_dir):
        print(f"Error: images directory not found: {images_dir}")
        sys.exit(1)

    categories = load_categories(categories_path)
    context_map = load_image_context(image_context_path)
    grouped = group_images(images_dir, categories, context_map)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    # Assemble final markdown: manual journey (if any) + per-screenshot cases
    manual_section = render_manual_journey_section(journey_steps_path)
    md_cases = render_markdown(grouped, images_dir)
    md = (manual_section + "\n" + md_cases) if manual_section else md_cases
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(md)

    if consolidated:
        base, ext = os.path.splitext(out_path)
        out_path_consolidated = base + "_consolidated" + (ext or ".md")
        md2 = render_consolidated_markdown(grouped, images_dir)
        with open(out_path_consolidated, "w", encoding="utf-8") as f2:
            f2.write(md2)

    # Also save a JSON for potential programmatic use
    json_path = os.path.join(os.path.dirname(out_path), "grouped.json")
    with open(json_path, "w", encoding="utf-8") as jf:
        json.dump(grouped, jf, indent=2)

    print(f"Generated: {out_path}")
    print(f"Grouped data: {json_path}")
    if not OCR_AVAILABLE:
        print("Note: OCR not available. Install Tesseract + pytesseract for better categorization.")

if __name__ == "__main__":
    main()