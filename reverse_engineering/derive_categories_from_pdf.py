import os
import json
import re
from collections import Counter, defaultdict
from pdfminer.high_level import extract_text


BASE_FLOWS = [
    "login",
    "navigation",
    "data_input",
    "feature_access",
    "logout",
]

SEED_SYNONYMS = {
    "login": ["login", "sign in", "signin", "authenticate", "credential", "username", "email", "password", "otp"],
    "navigation": ["navigate", "menu", "tab", "home", "dashboard", "next", "back", "continue"],
    "data_input": ["form", "field", "input", "enter", "type", "edit", "upload", "save", "submit"],
    "feature_access": ["feature", "settings", "search", "filter", "report", "analytics", "export", "import", "details"],
    "logout": ["logout", "sign out", "signout", "log out", "exit"],
}

def tokenize(text: str):
    text = text.lower()
    # Keep words and phrases split by whitespace, remove punctuation
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    tokens = [t for t in text.split() if t]
    return tokens

def extract_pdf_text(pdf_path: str) -> str:
    return extract_text(pdf_path)

def derive_keywords_from_text(text: str):
    tokens = tokenize(text)
    freq = Counter(tokens)

    # Map frequencies to flows using seed synonyms and high-frequency tokens
    flow_keywords = defaultdict(set)
    for flow, seeds in SEED_SYNONYMS.items():
        for s in seeds:
            s_tokens = s.split()
            if len(s_tokens) == 1:
                if freq[s_tokens[0]] > 0:
                    flow_keywords[flow].add(s)
            else:
                # phrase presence check with naive substring
                if s in text.lower():
                    flow_keywords[flow].add(s)

    # Augment with high-frequency tokens that co-occur with seeds
    top_tokens = [w for w, c in freq.most_common(200)]
    for flow, seeds in SEED_SYNONYMS.items():
        for tok in top_tokens:
            # simple heuristics: attach common UI/action words
            if flow == "login" and tok in {"user", "id", "email", "password", "otp", "auth", "signin", "login"}:
                flow_keywords[flow].add(tok)
            if flow == "navigation" and tok in {"menu", "home", "dashboard", "next", "back", "continue", "profile", "tab", "navbar"}:
                flow_keywords[flow].add(tok)
            if flow == "data_input" and tok in {"form", "field", "input", "enter", "type", "edit", "upload", "save", "submit", "validation"}:
                flow_keywords[flow].add(tok)
            if flow == "feature_access" and tok in {"feature", "settings", "report", "analytics", "search", "filter", "export", "import", "details"}:
                flow_keywords[flow].add(tok)
            if flow == "logout" and tok in {"logout", "signout", "sign", "out", "exit"}:
                flow_keywords[flow].add(tok)

    # Ensure minimum seeds are present
    for flow in BASE_FLOWS:
        if not flow_keywords[flow]:
            flow_keywords[flow].update(SEED_SYNONYMS[flow])

    # Convert to sorted lists
    return {flow: sorted(list(kws)) for flow, kws in flow_keywords.items()}

def main():
    pdf_path = ""
    out_dir = "output"
    out_path = None

    import sys
    if len(sys.argv) >= 2:
        pdf_path = sys.argv[1]
    else:
        candidates = [f for f in os.listdir(".") if f.lower().endswith(".pdf")]
        if not candidates:
            print("Error: No PDF path provided and none found in current directory.")
            sys.exit(1)
        pdf_path = candidates[0]

    if len(sys.argv) >= 3:
        out_dir = sys.argv[2]

    os.makedirs(out_dir, exist_ok=True)
    text = extract_pdf_text(pdf_path)
    pdf_text_out = os.path.join(out_dir, "pdf_text.txt")
    with open(pdf_text_out, "w", encoding="utf-8") as tf:
        tf.write(text)

    categories = derive_keywords_from_text(text)
    out_path = os.path.join(out_dir, "categories.json")
    with open(out_path, "w", encoding="utf-8") as jf:
        json.dump(categories, jf, indent=2)

    print(f"Derived categories written to {out_path}")
    print(f"Extracted PDF text saved to {pdf_text_out}")

if __name__ == "__main__":
    main()